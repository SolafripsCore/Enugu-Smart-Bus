from decimal import Decimal

from fastapi import APIRouter
from sqlmodel import desc, select

from app.deps import CurrentUser, SessionDep
from app.models import Transaction, TransactionKind, Trip
from app.schemas import (
    TopUpRequest,
    TransactionResponse,
    TripResponse,
    WalletResponse,
)

router = APIRouter(prefix="/account", tags=["account"])


def _transactions(session: SessionDep, user_id: int) -> list[Transaction]:
    return list(
        session.exec(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(desc(Transaction.created_at))
            .limit(20)
        ).all()
    )


@router.get("/wallet", response_model=WalletResponse)
def wallet(user: CurrentUser, session: SessionDep) -> WalletResponse:
    return WalletResponse(
        balance=user.wallet_balance,
        transactions=[
            TransactionResponse.model_validate(item, from_attributes=True)
            for item in _transactions(session, user.id)
        ],
    )


@router.post("/wallet/top-up", response_model=WalletResponse)
def top_up(
    payload: TopUpRequest, user: CurrentUser, session: SessionDep
) -> WalletResponse:
    amount = Decimal(payload.amount).quantize(Decimal("0.01"))
    user.wallet_balance += amount
    session.add(user)
    session.add(
        Transaction(
            user_id=user.id,
            kind=TransactionKind.top_up,
            amount=amount,
            description=payload.description,
        )
    )
    session.commit()
    session.refresh(user)

    return WalletResponse(
        balance=user.wallet_balance,
        transactions=[
            TransactionResponse.model_validate(item, from_attributes=True)
            for item in _transactions(session, user.id)
        ],
    )


@router.get("/trips", response_model=list[TripResponse])
def trips(user: CurrentUser, session: SessionDep) -> list[Trip]:
    return list(
        session.exec(
            select(Trip)
            .where(Trip.user_id == user.id)
            .order_by(desc(Trip.travelled_at))
            .limit(20)
        ).all()
    )
