from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum

from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    full_name: str
    phone: str = Field(index=True, unique=True)
    email: str | None = Field(default=None, index=True)
    hashed_pin: str
    phone_verified_at: datetime | None = None
    failed_pin_attempts: int = 0
    locked_until: datetime | None = None
    wallet_balance: Decimal = Field(
        default=Decimal("0"), max_digits=12, decimal_places=2
    )
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime = Field(default_factory=utcnow)


class VerificationPurpose(str, Enum):
    signup = "signup"
    reset_pin = "reset_pin"


class PhoneVerification(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    phone: str = Field(index=True)
    purpose: VerificationPurpose
    hashed_code: str
    expires_at: datetime
    attempts: int = 0
    consumed_at: datetime | None = None
    created_at: datetime = Field(default_factory=utcnow)


class ContactMessage(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str = Field(index=True)
    phone: str | None = None
    subject: str
    message: str
    created_at: datetime = Field(default_factory=utcnow)


class NewsletterSubscriber(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    created_at: datetime = Field(default_factory=utcnow)


class TransactionKind(str, Enum):
    top_up = "top_up"
    fare = "fare"


class Transaction(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    kind: TransactionKind
    amount: Decimal = Field(max_digits=12, decimal_places=2)
    description: str
    created_at: datetime = Field(default_factory=utcnow)


class PaymentStatus(str, Enum):
    pending = "pending"
    success = "success"
    failed = "failed"
    abandoned = "abandoned"


class Payment(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    reference: str = Field(index=True, unique=True)
    amount: Decimal = Field(max_digits=12, decimal_places=2)
    status: PaymentStatus = Field(default=PaymentStatus.pending, index=True)
    provider: str = "paystack"
    channel: str | None = None
    provider_reference: str | None = None
    transaction_id: int | None = Field(default=None, foreign_key="transaction.id")
    created_at: datetime = Field(default_factory=utcnow)
    completed_at: datetime | None = None


class Trip(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    route: str
    origin: str
    destination: str
    fare: Decimal = Field(max_digits=12, decimal_places=2)
    travelled_at: datetime = Field(default_factory=utcnow)
