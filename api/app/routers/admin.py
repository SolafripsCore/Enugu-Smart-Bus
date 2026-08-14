"""Administrator endpoints backing the /admin dashboard."""

from datetime import timedelta
from decimal import Decimal

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func
from sqlmodel import col, desc, select

from app.deps import CurrentAdmin, SessionDep
from app.models import (
    ContactMessage,
    NewsletterSubscriber,
    Transaction,
    TransactionKind,
    Trip,
    User,
    utcnow,
)
from app.schemas import (
    AdminContactMessage,
    AdminOverview,
    AdminRider,
    AdminRiderDetail,
    AdminRiderUpdate,
    AdminSubscriber,
    AdminTransaction,
    AdminTrip,
    AdminWalletAdjustment,
    TransactionResponse,
    TripResponse,
)

router = APIRouter(prefix="/admin", tags=["admin"])

ZERO = Decimal("0")


def _count(session: SessionDep, statement) -> int:
    return session.exec(statement).one() or 0


def _amount(value: Decimal | None) -> Decimal:
    return (value or ZERO).quantize(Decimal("0.01"))


@router.get("/overview", response_model=AdminOverview)
def overview(admin: CurrentAdmin, session: SessionDep) -> AdminOverview:
    since = utcnow() - timedelta(days=7)

    top_up_total = session.exec(
        select(func.sum(Transaction.amount)).where(
            Transaction.kind == TransactionKind.top_up
        )
    ).one()
    fare_total = session.exec(select(func.sum(Trip.fare))).one()
    wallet_total = session.exec(select(func.sum(User.wallet_balance))).one()

    return AdminOverview(
        riders=_count(session, select(func.count()).select_from(User)),
        verified_riders=_count(
            session,
            select(func.count())
            .select_from(User)
            .where(col(User.phone_verified_at).is_not(None)),
        ),
        active_riders=_count(
            session,
            select(func.count()).select_from(User).where(col(User.is_active).is_(True)),
        ),
        new_riders_7d=_count(
            session,
            select(func.count()).select_from(User).where(User.created_at >= since),
        ),
        wallet_balance_total=_amount(wallet_total),
        top_up_total=_amount(top_up_total),
        transactions=_count(session, select(func.count()).select_from(Transaction)),
        trips=_count(session, select(func.count()).select_from(Trip)),
        fare_total=_amount(fare_total),
        contact_messages=_count(
            session, select(func.count()).select_from(ContactMessage)
        ),
        newsletter_subscribers=_count(
            session, select(func.count()).select_from(NewsletterSubscriber)
        ),
    )


@router.get("/riders", response_model=list[AdminRider])
def riders(
    admin: CurrentAdmin,
    session: SessionDep,
    search: str = Query(default="", max_length=120),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[User]:
    statement = select(User)
    term = search.strip()
    if term:
        pattern = f"%{term}%"
        statement = statement.where(
            col(User.full_name).ilike(pattern)
            | col(User.phone).ilike(pattern)
            | col(User.email).ilike(pattern)
        )
    statement = statement.order_by(desc(User.created_at)).offset(offset).limit(limit)
    return list(session.exec(statement).all())


def _rider_or_404(session: SessionDep, rider_id: int) -> User:
    rider = session.get(User, rider_id)
    if rider is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Rider not found"
        )
    return rider


@router.get("/riders/{rider_id}", response_model=AdminRiderDetail)
def rider_detail(
    rider_id: int, admin: CurrentAdmin, session: SessionDep
) -> AdminRiderDetail:
    rider = _rider_or_404(session, rider_id)
    transactions = session.exec(
        select(Transaction)
        .where(Transaction.user_id == rider_id)
        .order_by(desc(Transaction.created_at))
        .limit(20)
    ).all()
    trips = session.exec(
        select(Trip)
        .where(Trip.user_id == rider_id)
        .order_by(desc(Trip.travelled_at))
        .limit(20)
    ).all()

    return AdminRiderDetail(
        **AdminRider.model_validate(rider, from_attributes=True).model_dump(),
        transactions=[
            TransactionResponse.model_validate(item, from_attributes=True)
            for item in transactions
        ],
        trips=[
            TripResponse.model_validate(item, from_attributes=True) for item in trips
        ],
    )


@router.patch("/riders/{rider_id}", response_model=AdminRider)
def update_rider(
    rider_id: int,
    payload: AdminRiderUpdate,
    admin: CurrentAdmin,
    session: SessionDep,
) -> User:
    rider = _rider_or_404(session, rider_id)
    if rider.id == admin.id and (
        payload.is_admin is False or payload.is_active is False
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove your own access",
        )

    if payload.is_active is not None:
        rider.is_active = payload.is_active
    if payload.is_admin is not None:
        rider.is_admin = payload.is_admin

    session.add(rider)
    session.commit()
    session.refresh(rider)
    return rider


@router.post("/riders/{rider_id}/wallet", response_model=AdminRider)
def adjust_wallet(
    rider_id: int,
    payload: AdminWalletAdjustment,
    admin: CurrentAdmin,
    session: SessionDep,
) -> User:
    rider = _rider_or_404(session, rider_id)
    amount = payload.amount.quantize(Decimal("0.01"))
    if amount == ZERO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Enter an amount"
        )
    if rider.wallet_balance + amount < ZERO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Balance cannot go below zero",
        )

    rider.wallet_balance += amount
    session.add(rider)
    session.add(
        Transaction(
            user_id=rider_id,
            kind=TransactionKind.top_up if amount > ZERO else TransactionKind.fare,
            amount=abs(amount),
            description=payload.description.strip(),
        )
    )
    session.commit()
    session.refresh(rider)
    return rider


@router.get("/transactions", response_model=list[AdminTransaction])
def transactions(
    admin: CurrentAdmin,
    session: SessionDep,
    limit: int = Query(default=50, ge=1, le=200),
) -> list[AdminTransaction]:
    rows = session.exec(
        select(Transaction, User)
        .join(User, col(Transaction.user_id) == col(User.id))
        .order_by(desc(Transaction.created_at))
        .limit(limit)
    ).all()
    return [
        AdminTransaction(
            **TransactionResponse.model_validate(
                transaction, from_attributes=True
            ).model_dump(),
            user_id=user.id,
            user_name=user.full_name,
            user_phone=user.phone,
        )
        for transaction, user in rows
    ]


@router.get("/trips", response_model=list[AdminTrip])
def trips(
    admin: CurrentAdmin,
    session: SessionDep,
    limit: int = Query(default=50, ge=1, le=200),
) -> list[AdminTrip]:
    rows = session.exec(
        select(Trip, User)
        .join(User, col(Trip.user_id) == col(User.id))
        .order_by(desc(Trip.travelled_at))
        .limit(limit)
    ).all()
    return [
        AdminTrip(
            **TripResponse.model_validate(trip, from_attributes=True).model_dump(),
            user_id=user.id,
            user_name=user.full_name,
            user_phone=user.phone,
        )
        for trip, user in rows
    ]


@router.get("/messages", response_model=list[AdminContactMessage])
def messages(
    admin: CurrentAdmin,
    session: SessionDep,
    limit: int = Query(default=50, ge=1, le=200),
) -> list[ContactMessage]:
    return list(
        session.exec(
            select(ContactMessage)
            .order_by(desc(ContactMessage.created_at))
            .limit(limit)
        ).all()
    )


@router.get("/newsletter", response_model=list[AdminSubscriber])
def newsletter(
    admin: CurrentAdmin,
    session: SessionDep,
    limit: int = Query(default=100, ge=1, le=500),
) -> list[NewsletterSubscriber]:
    return list(
        session.exec(
            select(NewsletterSubscriber)
            .order_by(desc(NewsletterSubscriber.created_at))
            .limit(limit)
        ).all()
    )
