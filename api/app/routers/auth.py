import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.config import get_settings
from app.deps import CurrentUser, SessionDep
from app.email import send_password_reset
from app.models import PasswordResetToken, User
from app.schemas import (
    AuthResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    MessageResponse,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
    UserResponse,
)
from app.security import create_access_token, hash_password, verify_password
from app.seed import seed_demo_activity

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _auth_response(user: User) -> AuthResponse:
    token, expires_in = create_access_token(str(user.id))
    return AuthResponse(
        user=UserResponse.model_validate(user, from_attributes=True),
        token=TokenResponse(access_token=token, expires_in=expires_in),
    )


@router.post(
    "/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED
)
def signup(payload: SignupRequest, session: SessionDep) -> AuthResponse:
    email = payload.email.lower()
    existing = session.exec(select(User).where(User.email == email)).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        full_name=payload.full_name.strip(),
        email=email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    seed_demo_activity(session, user)
    session.refresh(user)

    return _auth_response(user)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, session: SessionDep) -> AuthResponse:
    user = session.exec(select(User).where(User.email == payload.email.lower())).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )
    return _auth_response(user)


@router.get("/me", response_model=UserResponse)
def me(user: CurrentUser) -> User:
    return user


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(
    payload: ForgotPasswordRequest, session: SessionDep
) -> ForgotPasswordResponse:
    message = "If an account exists for that email, a reset link is on its way."
    user = session.exec(select(User).where(User.email == payload.email.lower())).first()
    if user is None:
        return ForgotPasswordResponse(message=message)

    reset = PasswordResetToken(
        user_id=user.id,
        token=secrets.token_urlsafe(32),
        expires_at=datetime.now(timezone.utc)
        + timedelta(minutes=settings.reset_token_minutes),
    )
    session.add(reset)
    session.commit()

    emailed = send_password_reset(user.email, user.full_name, reset.token)
    fallback_token = reset.token if settings.expose_reset_token else None

    return ForgotPasswordResponse(
        message=message,
        reset_token=None if emailed else fallback_token,
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(
    payload: ResetPasswordRequest, session: SessionDep
) -> MessageResponse:
    reset = session.exec(
        select(PasswordResetToken).where(PasswordResetToken.token == payload.token)
    ).first()
    expires_at = reset.expires_at.replace(tzinfo=timezone.utc) if reset else None
    if (
        reset is None
        or reset.used_at is not None
        or expires_at is None
        or expires_at < datetime.now(timezone.utc)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link is invalid or has expired.",
        )

    user = session.get(User, reset.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This reset link is invalid or has expired.",
        )

    user.hashed_password = hash_password(payload.password)
    reset.used_at = datetime.now(timezone.utc)
    session.add(user)
    session.add(reset)
    session.commit()

    return MessageResponse(
        message="Your password has been updated. You can log in now."
    )
