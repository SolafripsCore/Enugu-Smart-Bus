"""Bootstrapping of administrator accounts from configuration."""

from sqlmodel import Session, col, select

from app.config import get_settings
from app.models import User
from app.phone import normalize_phone

settings = get_settings()


def admin_phones() -> set[str]:
    """Phone numbers configured as administrators, in normalized form."""
    numbers = set()
    for raw in settings.admin_phones.split(","):
        candidate = raw.strip()
        if not candidate:
            continue
        try:
            numbers.add(normalize_phone(candidate))
        except ValueError:
            continue
    return numbers


def sync_admin_flag(session: Session, user: User) -> User:
    """Grant admin rights to a configured phone number the first time it signs in."""
    if user.is_admin or user.phone not in admin_phones():
        return user
    user.is_admin = True
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def promote_configured_admins(session: Session) -> None:
    numbers = admin_phones()
    if not numbers:
        return
    users = session.exec(
        select(User).where(col(User.phone).in_(numbers), col(User.is_admin).is_(False))
    ).all()
    for user in users:
        user.is_admin = True
        session.add(user)
    if users:
        session.commit()
