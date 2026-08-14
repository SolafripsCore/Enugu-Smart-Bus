from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status
from sqlmodel import col, desc, select

from app.admins import sync_admin_flag
from app.config import get_settings
from app.deps import CurrentUser, SessionDep
from app.models import PhoneVerification, User, VerificationPurpose
from app.phone import InvalidPhoneNumber, mask_phone, normalize_phone
from app.schemas import (
    AuthResponse,
    ChangePinRequest,
    LoginRequest,
    MessageResponse,
    OtpRequest,
    OtpResponse,
    OtpVerifyRequest,
    OtpVerifyResponse,
    ProfileUpdateRequest,
    SetPinRequest,
    TokenResponse,
    UserResponse,
)
from app.security import (
    create_access_token,
    create_verification_token,
    decode_verification_token,
    generate_otp,
    hash_secret,
    verify_secret,
)
from app.seed import seed_demo_activity
from app.sms import send_otp
from app.sms import sms_enabled as sms_configured

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

INVALID_CODE = "That code is incorrect or has expired. Request a new one."


def _as_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def _parse_phone(raw: str) -> str:
    try:
        return normalize_phone(raw)
    except InvalidPhoneNumber as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)
        ) from error


def _find_user(session: SessionDep, phone: str) -> User | None:
    return session.exec(select(User).where(User.phone == phone)).first()


def _auth_response(user: User) -> AuthResponse:
    token, expires_in = create_access_token(str(user.id))
    return AuthResponse(
        user=UserResponse.model_validate(user, from_attributes=True),
        token=TokenResponse(access_token=token, expires_in=expires_in),
    )


def _latest_verification(
    session: SessionDep, phone: str, purpose: VerificationPurpose
) -> PhoneVerification | None:
    return session.exec(
        select(PhoneVerification)
        .where(PhoneVerification.phone == phone)
        .where(PhoneVerification.purpose == purpose)
        .order_by(desc(col(PhoneVerification.created_at)))
    ).first()


@router.post("/otp/request", response_model=OtpResponse)
def request_otp(payload: OtpRequest, session: SessionDep) -> OtpResponse:
    phone = _parse_phone(payload.phone)
    user = _find_user(session, phone)

    if payload.purpose == VerificationPurpose.signup and user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This number already has an account. Log in with your PIN.",
        )
    if payload.purpose == VerificationPurpose.reset_pin and user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account is registered with this number.",
        )

    now = datetime.now(timezone.utc)
    previous = _latest_verification(session, phone, payload.purpose)
    if previous is not None and previous.consumed_at is None:
        created_at = _as_utc(previous.created_at) or now
        elapsed = (now - created_at).total_seconds()
        if elapsed < settings.otp_resend_seconds:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    "Please wait "
                    f"{int(settings.otp_resend_seconds - elapsed)}s "
                    "before requesting another code."
                ),
            )
        previous.consumed_at = now
        session.add(previous)

    code = generate_otp()
    session.add(
        PhoneVerification(
            phone=phone,
            purpose=payload.purpose,
            hashed_code=hash_secret(code),
            expires_at=now + timedelta(minutes=settings.otp_minutes),
        )
    )
    session.commit()

    delivered = send_otp(phone, code)

    return OtpResponse(
        message=(
            f"We sent a {settings.otp_length}-digit code to {mask_phone(phone)}."
            if delivered
            else "SMS delivery isn't connected yet — use the code shown below."
        ),
        phone=phone,
        masked_phone=mask_phone(phone),
        expires_in=settings.otp_minutes * 60,
        resend_in=settings.otp_resend_seconds,
        delivered=delivered,
        debug_code=(
            None if delivered or not settings.expose_otp or sms_configured() else code
        ),
    )


@router.post("/otp/verify", response_model=OtpVerifyResponse)
def verify_otp(payload: OtpVerifyRequest, session: SessionDep) -> OtpVerifyResponse:
    phone = _parse_phone(payload.phone)
    verification = _latest_verification(session, phone, payload.purpose)
    expires_at = _as_utc(verification.expires_at) if verification else None
    now = datetime.now(timezone.utc)

    if (
        verification is None
        or verification.consumed_at is not None
        or expires_at is None
        or expires_at < now
        or verification.attempts >= settings.otp_max_attempts
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=INVALID_CODE
        )

    if not verify_secret(payload.code, verification.hashed_code):
        verification.attempts += 1
        session.add(verification)
        session.commit()
        remaining = settings.otp_max_attempts - verification.attempts
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Incorrect code. {remaining} attempt(s) left."
                if remaining > 0
                else INVALID_CODE
            ),
        )

    verification.consumed_at = now
    session.add(verification)
    session.commit()

    token, expires_in = create_verification_token(phone, payload.purpose.value)
    return OtpVerifyResponse(
        verification_token=token, expires_in=expires_in, purpose=payload.purpose
    )


@router.post("/pin", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def set_pin(payload: SetPinRequest, session: SessionDep) -> AuthResponse:
    """Complete signup, or set a new PIN after a reset, for a verified number."""
    decoded = decode_verification_token(payload.verification_token)
    if decoded is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your verification expired. Please verify your number again.",
        )

    phone, purpose = decoded
    user = _find_user(session, phone)
    now = datetime.now(timezone.utc)

    if purpose == VerificationPurpose.signup.value:
        if user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This number already has an account. Log in with your PIN.",
            )
        full_name = (payload.full_name or "").strip()
        if len(full_name) < 2:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Enter your full name.",
            )
        user = User(
            full_name=full_name,
            phone=phone,
            hashed_pin=hash_secret(payload.pin),
            phone_verified_at=now,
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        seed_demo_activity(session, user)
        session.refresh(user)
        return _auth_response(sync_admin_flag(session, user))

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account is registered with this number.",
        )

    user.hashed_pin = hash_secret(payload.pin)
    user.phone_verified_at = user.phone_verified_at or now
    user.failed_pin_attempts = 0
    user.locked_until = None
    session.add(user)
    session.commit()
    session.refresh(user)
    return _auth_response(sync_admin_flag(session, user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, session: SessionDep) -> AuthResponse:
    phone = _parse_phone(payload.phone)
    user = _find_user(session, phone)
    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect phone number or PIN.",
    )
    if user is None:
        raise invalid

    now = datetime.now(timezone.utc)
    locked_until = _as_utc(user.locked_until)
    if locked_until is not None and locked_until > now:
        minutes = max(1, int((locked_until - now).total_seconds() // 60) + 1)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Too many incorrect PINs. Try again in {minutes} minute(s) "
                "or reset your PIN."
            ),
        )

    if not verify_secret(payload.pin, user.hashed_pin):
        user.failed_pin_attempts += 1
        if user.failed_pin_attempts >= settings.pin_max_attempts:
            user.failed_pin_attempts = 0
            user.locked_until = now + timedelta(minutes=settings.pin_lockout_minutes)
        session.add(user)
        session.commit()
        raise invalid

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    user.failed_pin_attempts = 0
    user.locked_until = None
    session.add(user)
    session.commit()
    session.refresh(user)
    return _auth_response(sync_admin_flag(session, user))


@router.get("/me", response_model=UserResponse)
def me(user: CurrentUser) -> User:
    return user


@router.patch("/me", response_model=UserResponse)
def update_profile(
    payload: ProfileUpdateRequest, user: CurrentUser, session: SessionDep
) -> User:
    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.email is not None:
        email = payload.email.lower()
        taken = session.exec(
            select(User).where(User.email == email).where(User.id != user.id)
        ).first()
        if taken is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="That email is already linked to another account.",
            )
        user.email = email
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/pin/change", response_model=MessageResponse)
def change_pin(
    payload: ChangePinRequest, user: CurrentUser, session: SessionDep
) -> MessageResponse:
    if not verify_secret(payload.current_pin, user.hashed_pin):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Your current PIN is wrong."
        )
    user.hashed_pin = hash_secret(payload.new_pin)
    user.failed_pin_attempts = 0
    user.locked_until = None
    session.add(user)
    session.commit()
    return MessageResponse(message="Your PIN has been updated.")
