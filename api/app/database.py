from collections.abc import Generator

from sqlalchemy import inspect, text
from sqlmodel import Session, SQLModel, create_engine

from app.config import get_settings

settings = get_settings()


def normalize_database_url(url: str) -> str:
    """Point bare Postgres URLs (as provided by Railway) at the psycopg driver."""
    for prefix in ("postgres://", "postgresql://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix) :]
    return url


database_url = normalize_database_url(settings.database_url)
connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
engine = create_engine(database_url, connect_args=connect_args)

# Columns introduced by the phone + PIN authentication flow. Tables created
# before it exist in production, and the project has no migration tool, so the
# missing pieces are added in place on boot.
USER_COLUMNS = {
    "hashed_pin": "VARCHAR",
    "phone_verified_at": "TIMESTAMP",
    "failed_pin_attempts": "INTEGER DEFAULT 0",
    "locked_until": "TIMESTAMP",
}
RELAXED_USER_COLUMNS = ("email", "hashed_password")


def upgrade_user_table() -> None:
    inspector = inspect(engine)
    if "user" not in inspector.get_table_names():
        return

    columns = {column["name"]: column for column in inspector.get_columns("user")}
    statements = [
        f'ALTER TABLE "user" ADD COLUMN {name} {ddl}'
        for name, ddl in USER_COLUMNS.items()
        if name not in columns
    ]

    if engine.dialect.name != "sqlite":
        # Accounts are now identified by phone, so the legacy email/password
        # columns must tolerate NULL.
        statements += [
            f'ALTER TABLE "user" ALTER COLUMN {name} DROP NOT NULL'
            for name in RELAXED_USER_COLUMNS
            if name in columns and not columns[name]["nullable"]
        ]
        statements.append(
            'CREATE UNIQUE INDEX IF NOT EXISTS ix_user_phone_unique ON "user" (phone)'
        )

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    upgrade_user_table()


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
