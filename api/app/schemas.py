from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field

from app.models import TransactionKind


class SignupRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=32)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str | None
    wallet_balance: Decimal
    created_at: datetime


class AuthResponse(BaseModel):
    user: UserResponse
    token: TokenResponse


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: str | None = None


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=128)


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
