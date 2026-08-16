"""Paystack-backed wallet top-ups.

The wallet is only credited from a Paystack payload we fetched ourselves
(verify) or one whose webhook signature checked out, and crediting is
idempotent on the payment reference so a webhook and a browser return cannot
both add the money.
"""

import logging
from datetime import datetime, timezone
from decimal import Decimal
from secrets import token_hex

from fastapi import APIRouter, HTTPException, Request, status
from sqlmodel import Session, select

from app import paystack
from app.config import get_settings
from app.deps import CurrentUser, SessionDep
from app.models import Payment, PaymentStatus, Transaction, TransactionKind, User
from app.schemas import (
    PaymentInitRequest,
    PaymentInitResponse,
    PaymentsConfigResponse,
    PaymentStatusResponse,
)

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/payments", tags=["payments"])

TWO_PLACES = Decimal("0.01")


def _fallback_email(user: User) -> str:
    """Paystack requires an email; riders sign up with a phone number only."""
    return user.email or f"{user.phone.lstrip('+')}@riders.enugusmartbus.com"


def _payment_status(raw: str) -> PaymentStatus:
    try:
        return PaymentStatus(raw)
    except ValueError:
        return PaymentStatus.failed


def _credit_wallet(session: Session, payment: Payment, data: dict) -> bool:
    """Apply a verified Paystack payment once. Returns True when it credited."""
    status_value = _payment_status(str(data.get("status", "")))
    payment.channel = data.get("channel")
    payment.provider_reference = str(data.get("id")) if data.get("id") else None

    if payment.status == PaymentStatus.success:
        return False

    if status_value != PaymentStatus.success:
        payment.status = status_value
        session.add(payment)
        session.commit()
        return False

    # Trust Paystack's amount, not the one the browser asked for.
    paid = paystack.from_kobo(int(data.get("amount") or 0))
    if paid <= 0:
        paid = payment.amount

    user = session.get(User, payment.user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Account not found")

    transaction = Transaction(
        user_id=user.id,
        kind=TransactionKind.top_up,
        amount=paid,
        description=f"Wallet top-up · {payment.reference}",
    )
    session.add(transaction)
    session.flush()

    user.wallet_balance += paid
    payment.amount = paid
    payment.status = PaymentStatus.success
    payment.completed_at = datetime.now(timezone.utc)
    payment.transaction_id = transaction.id
    session.add(user)
    session.add(payment)
    session.commit()
    return True


@router.get("/config", response_model=PaymentsConfigResponse)
def config() -> PaymentsConfigResponse:
    return PaymentsConfigResponse(
        enabled=paystack.paystack_enabled(),
        live_mode=paystack.is_live_mode(),
        min_amount=settings.min_top_up,
        max_amount=settings.max_top_up,
    )


@router.post("/initialize", response_model=PaymentInitResponse)
def initialize(
    payload: PaymentInitRequest, user: CurrentUser, session: SessionDep
) -> PaymentInitResponse:
    if not paystack.paystack_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Card payments are not available yet.",
        )

    amount = Decimal(payload.amount).quantize(TWO_PLACES)
    if amount < settings.min_top_up or amount > settings.max_top_up:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Enter an amount between ₦{settings.min_top_up:,} "
                f"and ₦{settings.max_top_up:,}."
            ),
        )

    reference = f"esb_{token_hex(12)}"
    payment = Payment(user_id=user.id, reference=reference, amount=amount)
    session.add(payment)
    session.commit()
    session.refresh(payment)

    try:
        data = paystack.initialize_transaction(
            email=payload.email or _fallback_email(user),
            amount=amount,
            reference=reference,
            callback_url=f"{settings.site_url}{settings.paystack_callback_path}",
        )
    except paystack.PaystackError as exc:
        payment.status = PaymentStatus.failed
        session.add(payment)
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)
        ) from exc

    return PaymentInitResponse(
        reference=reference,
        authorization_url=str(data.get("authorization_url", "")),
        amount=amount,
        live_mode=paystack.is_live_mode(),
    )


@router.get("/verify/{reference}", response_model=PaymentStatusResponse)
def verify(
    reference: str, user: CurrentUser, session: SessionDep
) -> PaymentStatusResponse:
    payment = session.exec(
        select(Payment).where(Payment.reference == reference)
    ).first()
    if payment is None or payment.user_id != user.id:
        raise HTTPException(status_code=404, detail="Payment not found")

    credited = False
    if payment.status != PaymentStatus.success:
        try:
            data = paystack.verify_transaction(reference)
        except paystack.PaystackError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)
            ) from exc
        credited = _credit_wallet(session, payment, data)

    session.refresh(payment)
    session.refresh(user)
    messages = {
        PaymentStatus.success: "Payment confirmed — your wallet has been credited.",
        PaymentStatus.pending: (
            "Payment is still pending. We'll credit you once it clears."
        ),
        PaymentStatus.abandoned: "Payment was not completed.",
        PaymentStatus.failed: "Payment failed. No money was taken.",
    }
    return PaymentStatusResponse(
        reference=payment.reference,
        status=payment.status,
        amount=payment.amount,
        credited=credited,
        balance=user.wallet_balance,
        message=messages[payment.status],
    )


@router.post("/webhook", include_in_schema=False)
async def webhook(request: Request, session: SessionDep) -> dict[str, str]:
    raw = await request.body()
    if not paystack.signature_matches(raw, request.headers.get("x-paystack-signature")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature"
        )

    event = await request.json()
    data = event.get("data") or {}
    reference = data.get("reference")
    if event.get("event") != "charge.success" or not reference:
        return {"status": "ignored"}

    payment = session.exec(
        select(Payment).where(Payment.reference == reference)
    ).first()
    if payment is None:
        logger.warning("Webhook for unknown payment reference %s", reference)
        return {"status": "unknown"}

    _credit_wallet(session, payment, data)
    return {"status": "ok"}
