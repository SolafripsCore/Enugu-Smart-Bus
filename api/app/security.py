import secrets
from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

from app.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ACCESS_SCOPE = "access"
VERIFICATION_SCOPE = "phone_verified"


def hash_secret(value: str) -> str:
    return pwd_context.hash(value)


def verify_secret(value: str, hashed_value: str) -> bool:
    if not hashed_value:
        return False
    return pwd_context.verify(value, hashed_value)


def generate_otp() -> str:
    upper = 10**settings.otp_length
    return str(secrets.randbelow(upper)).zfill(settings.otp_length)


def _encode(payload: dict[str, object], expires_in: int) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {**payload, "iat": now, "exp": now + timedelta(seconds=expires_in)},
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def _decode(token: str, scope: str) -> dict[str, object] | None:
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
    except jwt.PyJWTError:
        return None
    return payload if payload.get("scope") == scope else None


def create_access_token(subject: str) -> tuple[str, int]:
    expires_in = settings.access_token_minutes * 60
    return _encode({"sub": subject, "scope": ACCESS_SCOPE}, expires_in), expires_in


def decode_access_token(token: str) -> str | None:
    payload = _decode(token, ACCESS_SCOPE)
    if payload is None:
        return None
    subject = payload.get("sub")
    return str(subject) if subject is not None else None


def create_verification_token(phone: str, purpose: str) -> tuple[str, int]:
    """Short-lived proof that this phone number just passed OTP verification."""
    expires_in = settings.verification_token_minutes * 60
    payload = {"sub": phone, "purpose": purpose, "scope": VERIFICATION_SCOPE}
    return _encode(payload, expires_in), expires_in


def decode_verification_token(token: str) -> tuple[str, str] | None:
    payload = _decode(token, VERIFICATION_SCOPE)
    if payload is None:
        return None
    subject = payload.get("sub")
    purpose = payload.get("purpose")
    if subject is None or purpose is None:
        return None
    return str(subject), str(purpose)
