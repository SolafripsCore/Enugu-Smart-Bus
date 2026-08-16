"""Thin Paystack client used for wallet top-ups.

Only the two calls the wallet needs are wrapped: initialising a transaction and
verifying one. Money is only ever credited from data returned by these calls or
from a signature-checked webhook, never from what the browser reports.
"""

import hashlib
import hmac
import logging
from decimal import Decimal
from typing import Any

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

BASE_URL = "https://api.paystack.co"
KOBO = Decimal("100")


class PaystackError(RuntimeError):
    """Paystack refused the request or is unreachable."""


def paystack_enabled() -> bool:
    return bool(settings.paystack_secret_key)


def is_live_mode() -> bool:
    return settings.paystack_secret_key.startswith("sk_live")


def to_kobo(amount: Decimal) -> int:
    return int((amount * KOBO).to_integral_value())


def from_kobo(amount: int) -> Decimal:
    return (Decimal(amount) / KOBO).quantize(Decimal("0.01"))


def _request(method: str, path: str, **kwargs: Any) -> dict[str, Any]:
    if not paystack_enabled():
        raise PaystackError("Payments are not configured.")
    try:
        response = httpx.request(
            method,
            f"{BASE_URL}{path}",
            headers={
                "Authorization": f"Bearer {settings.paystack_secret_key}",
                "Content-Type": "application/json",
            },
            timeout=20.0,
            **kwargs,
        )
        payload = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        logger.exception("Paystack request failed: %s %s", method, path)
        raise PaystackError("Could not reach Paystack. Please try again.") from exc

    if not response.is_success or not payload.get("status"):
        message = payload.get("message") or "Paystack rejected the request."
        logger.error("Paystack error on %s %s: %s", method, path, message)
        raise PaystackError(message)

    return payload.get("data") or {}


def initialize_transaction(
    *, email: str, amount: Decimal, reference: str, callback_url: str
) -> dict[str, Any]:
    return _request(
        "POST",
        "/transaction/initialize",
        json={
            "email": email,
            "amount": to_kobo(amount),
            "reference": reference,
            "callback_url": callback_url,
            "currency": "NGN",
        },
    )


def verify_transaction(reference: str) -> dict[str, Any]:
    return _request("GET", f"/transaction/verify/{reference}")


def signature_matches(raw_body: bytes, signature: str | None) -> bool:
    if not signature or not paystack_enabled():
        return False
    expected = hmac.new(
        settings.paystack_secret_key.encode(), raw_body, hashlib.sha512
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
