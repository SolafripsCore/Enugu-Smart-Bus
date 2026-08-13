"""Starter wallet and trip activity so a brand new account has something to show."""

from datetime import timedelta
from decimal import Decimal

from sqlmodel import Session

from app.models import Transaction, TransactionKind, Trip, User, utcnow

WELCOME_CREDIT = Decimal("2000.00")

DEMO_TRIPS = [
    ("Route 3", "Ogbete Main Market", "Independence Layout", Decimal("300.00"), 1),
    ("Route 7", "New Haven", "Enugu State University", Decimal("250.00"), 3),
    ("Route 1", "Holy Ghost Terminal", "Abakpa Nike", Decimal("350.00"), 6),
]


def seed_demo_activity(session: Session, user: User) -> None:
    now = utcnow()

    user.wallet_balance = WELCOME_CREDIT
    session.add(user)
    session.add(
        Transaction(
            user_id=user.id,
            kind=TransactionKind.top_up,
            amount=WELCOME_CREDIT,
            description="Welcome credit",
            created_at=now,
        )
    )

    for route, origin, destination, fare, days_ago in DEMO_TRIPS:
        travelled_at = now - timedelta(days=days_ago)
        session.add(
            Trip(
                user_id=user.id,
                route=route,
                origin=origin,
                destination=destination,
                fare=fare,
                travelled_at=travelled_at,
            )
        )
        session.add(
            Transaction(
                user_id=user.id,
                kind=TransactionKind.fare,
                amount=fare,
                description=f"{route}: {origin} → {destination}",
                created_at=travelled_at,
            )
        )
        user.wallet_balance -= fare

    session.add(user)
    session.commit()
