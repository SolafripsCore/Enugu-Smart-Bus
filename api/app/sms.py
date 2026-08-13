"""Outbound SMS with a pluggable provider.

Termii is used when configured (best deliverability in Nigeria), then Twilio.
With neither configured the message is logged only and the caller decides how
to degrade — the OTP endpoints return the code in that case.
"""

import logging

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

TERMII_ENDPOINT = "https://api.ng.termii.com/api/sms/send"
TWILIO_ENDPOINT = "https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"


def sms_enabled() -> bool:
    return bool(settings.termii_api_key) or bool(
        settings.twilio_account_sid
        and settings.twilio_auth_token
        and settings.twilio_from_number
    )


def _send_termii(to: str, message: str) -> bool:
    response = httpx.post(
        TERMII_ENDPOINT,
        json={
            "to": to.lstrip("+"),
            "from": settings.termii_sender_id,
            "sms": message,
            "type": "plain",
            "channel": "generic",
            "api_key": settings.termii_api_key,
        },
        timeout=15.0,
    )
    response.raise_for_status()
    return True


def _send_twilio(to: str, message: str) -> bool:
    response = httpx.post(
        TWILIO_ENDPOINT.format(sid=settings.twilio_account_sid),
        data={"To": to, "From": settings.twilio_from_number, "Body": message},
        auth=(settings.twilio_account_sid, settings.twilio_auth_token),
        timeout=15.0,
    )
    response.raise_for_status()
    return True


def send_sms(to: str, message: str) -> bool:
    """Deliver an SMS, returning False instead of raising when it fails."""
    if not sms_enabled():
        logger.info("SMS not configured; would send to %s: %s", to, message)
        return False

    try:
        if settings.termii_api_key:
            return _send_termii(to, message)
        return _send_twilio(to, message)
    except httpx.HTTPError:
        logger.exception("Failed to send SMS to %s", to)
        return False


def send_otp(to: str, code: str) -> bool:
    message = (
        f"{code} is your Enugu Smart Bus verification code. "
        f"It expires in {settings.otp_minutes} minutes. Never share it."
    )
    return send_sms(to, message)
