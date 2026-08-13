from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum

from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    full_name: str
    email: str = Field(index=True, unique=True)
    phone: str | None = None
    hashed_password: str
    wallet_balance: Decimal = Field(
        default=Decimal("0"), max_digits=12, decimal_places=2
    )
    is_active: bool = True
    created_at: datetime = Field(default_factory=utcnow)


class PasswordResetToken(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    token: str = Field(index=True, unique=True)
    expires_at: datetime
    used_at: datetime | None = None
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


class Trip(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    route: str
    origin: str
    destination: str
    fare: Decimal = Field(max_digits=12, decimal_places=2)
    travelled_at: datetime = Field(default_factory=utcnow)
