from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field

from app.config import get_settings
from app.models import TransactionKind, VerificationPurpose

settings = get_settings()

PIN_PATTERN = rf"^\d{{{settings.pin_length}}}$"
OTP_PATTERN = rf"^\d{{{settings.otp_length}}}$"


class OtpRequest(BaseModel):
    phone: str = Field(min_length=6, max_length=24)
    purpose: VerificationPurpose = VerificationPurpose.signup


class OtpResponse(BaseModel):
    message: str
    phone: str
    masked_phone: str
    expires_in: int
    resend_in: int
    delivered: bool
    # Only populated when no SMS provider is configured.
    debug_code: str | None = None


class OtpVerifyRequest(BaseModel):
    phone: str = Field(min_length=6, max_length=24)
    code: str = Field(pattern=OTP_PATTERN)
    purpose: VerificationPurpose = VerificationPurpose.signup


class OtpVerifyResponse(BaseModel):
    verification_token: str
    expires_in: int
    purpose: VerificationPurpose


class SetPinRequest(BaseModel):
    verification_token: str
    pin: str = Field(pattern=PIN_PATTERN)
    full_name: str | None = Field(default=None, min_length=2, max_length=120)


class LoginRequest(BaseModel):
    phone: str = Field(min_length=6, max_length=24)
    pin: str = Field(pattern=PIN_PATTERN)


class ChangePinRequest(BaseModel):
    current_pin: str = Field(pattern=PIN_PATTERN)
    new_pin: str = Field(pattern=PIN_PATTERN)


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    email: EmailStr | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: int
    full_name: str
    phone: str
    email: EmailStr | None = None
    phone_verified_at: datetime | None = None
    wallet_balance: Decimal
    created_at: datetime


class AuthResponse(BaseModel):
    user: UserResponse
    token: TokenResponse


class MessageResponse(BaseModel):
    message: str


class ContactRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=32)
    subject: str = Field(min_length=2, max_length=160)
    message: str = Field(min_length=10, max_length=4000)


class NewsletterRequest(BaseModel):
    email: EmailStr


class TopUpRequest(BaseModel):
    amount: Decimal = Field(gt=0, le=Decimal("500000"))
    description: str = Field(default="Wallet top-up", max_length=120)


class TransactionResponse(BaseModel):
    id: int
    kind: TransactionKind
    amount: Decimal
    description: str
    created_at: datetime


class TripResponse(BaseModel):
    id: int
    route: str
    origin: str
    destination: str
    fare: Decimal
    travelled_at: datetime


class WalletResponse(BaseModel):
    balance: Decimal
    transactions: list[TransactionResponse]
