from collections.abc import Generator
from datetime import datetime, timezone
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from app.database import get_session
from app.main import app
from app.models import User
from app.phone import InvalidPhoneNumber, normalize_phone
from app.schemas import AdminRider, AdminTrip


@pytest.fixture(name="engine")
def engine_fixture() -> Engine:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture(name="client")
def client_fixture(engine: Engine) -> Generator[TestClient, None, None]:
    def session_override() -> Generator[Session, None, None]:
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = session_override
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


PHONE = "0803 000 0000"
E164 = "+2348030000000"
PIN = "1357"


def request_code(
    client: TestClient, phone: str = PHONE, purpose: str = "signup"
) -> str:
    response = client.post(
        "/auth/otp/request", json={"phone": phone, "purpose": purpose}
    )
    assert response.status_code == 200, response.text
    code = response.json()["debug_code"]
    assert code
    return code


def verify_code(
    client: TestClient, code: str, phone: str = PHONE, purpose: str = "signup"
) -> str:
    response = client.post(
        "/auth/otp/verify", json={"phone": phone, "code": code, "purpose": purpose}
    )
    assert response.status_code == 200, response.text
    return response.json()["verification_token"]


def register(client: TestClient, full_name: str = "Ada Okonkwo") -> str:
    token = verify_code(client, request_code(client))
    created = client.post(
        "/auth/pin",
        json={"verification_token": token, "pin": PIN, "full_name": full_name},
    )
    assert created.status_code == 201, created.text
    return created.json()["token"]["access_token"]


def test_normalize_phone() -> None:
    for raw in ("08030000000", "8030000000", "2348030000000", "+234 803 000 0000"):
        assert normalize_phone(raw) == E164
    for raw in ("", "0123", "0603000000000"):
        with pytest.raises(InvalidPhoneNumber):
            normalize_phone(raw)


def test_signup_login_and_wallet(client: TestClient) -> None:
    access_token = register(client)
    headers = {"Authorization": f"Bearer {access_token}"}

    me = client.get("/auth/me", headers=headers)
    assert me.json()["phone"] == E164
    assert me.json()["full_name"] == "Ada Okonkwo"

    taken = client.post("/auth/otp/request", json={"phone": PHONE})
    assert taken.status_code == 409

    bad_login = client.post("/auth/login", json={"phone": PHONE, "pin": "9999"})
    assert bad_login.status_code == 401

    login = client.post("/auth/login", json={"phone": "08030000000", "pin": PIN})
    assert login.status_code == 200

    wallet = client.get("/account/wallet", headers=headers)
    assert float(wallet.json()["balance"]) == pytest.approx(1100.0)
    assert len(wallet.json()["transactions"]) == 4

    topped_up = client.post(
        "/account/wallet/top-up", json={"amount": "900.00"}, headers=headers
    )
    assert float(topped_up.json()["balance"]) == pytest.approx(2000.0)

    assert len(client.get("/account/trips", headers=headers).json()) == 3


def test_otp_rejects_wrong_code(client: TestClient) -> None:
    code = request_code(client)
    wrong = "0" * len(code) if code != "0" * len(code) else "1" * len(code)
    rejected = client.post(
        "/auth/otp/verify", json={"phone": PHONE, "code": wrong, "purpose": "signup"}
    )
    assert rejected.status_code == 400

    assert verify_code(client, code)

    replayed = client.post(
        "/auth/otp/verify", json={"phone": PHONE, "code": code, "purpose": "signup"}
    )
    assert replayed.status_code == 400


def test_pin_requires_valid_verification(client: TestClient) -> None:
    rejected = client.post(
        "/auth/pin",
        json={"verification_token": "nonsense", "pin": PIN, "full_name": "Ada O"},
    )
    assert rejected.status_code == 400

    short_pin = client.post(
        "/auth/pin",
        json={"verification_token": "nonsense", "pin": "12", "full_name": "Ada O"},
    )
    assert short_pin.status_code == 422


def test_reset_pin_flow(client: TestClient) -> None:
    register(client)

    unknown = client.post(
        "/auth/otp/request", json={"phone": "08039999999", "purpose": "reset_pin"}
    )
    assert unknown.status_code == 404

    token = verify_code(
        client, request_code(client, purpose="reset_pin"), purpose="reset_pin"
    )
    updated = client.post(
        "/auth/pin", json={"verification_token": token, "pin": "2468"}
    )
    assert updated.status_code == 201

    assert (
        client.post("/auth/login", json={"phone": PHONE, "pin": PIN}).status_code == 401
    )
    assert (
        client.post("/auth/login", json={"phone": PHONE, "pin": "2468"}).status_code
        == 200
    )


def test_profile_update_and_pin_change(client: TestClient) -> None:
    headers = {"Authorization": f"Bearer {register(client)}"}

    updated = client.patch(
        "/auth/me",
        json={"full_name": "Ada N. Okonkwo", "email": "ada@example.com"},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["email"] == "ada@example.com"

    changed = client.post(
        "/auth/pin/change",
        json={"current_pin": PIN, "new_pin": "8642"},
        headers=headers,
    )
    assert changed.status_code == 200
    assert (
        client.post("/auth/login", json={"phone": PHONE, "pin": "8642"}).status_code
        == 200
    )


def test_wallet_requires_authentication(client: TestClient) -> None:
    assert client.get("/account/wallet").status_code == 401
    assert (
        client.get("/account/wallet", headers={"Authorization": "Bearer nope"})
    ).status_code == 401


def test_contact_and_newsletter(client: TestClient) -> None:
    contact = client.post(
        "/contact",
        json={
            "name": "Chidi Nwosu",
            "email": "chidi@example.com",
            "phone": "+2348000000001",
            "subject": "Route enquiry",
            "message": "Please add a stop at Independence Layout.",
        },
    )
    assert contact.status_code == 200
    assert contact.json()["message"]

    invalid = client.post(
        "/contact",
        json={
            "name": "Chidi Nwosu",
            "email": "chidi@example.com",
            "subject": "Hi",
            "message": "too short",
        },
    )
    assert invalid.status_code == 422

    subscribed = client.post("/newsletter", json={"email": "chidi@example.com"})
    assert subscribed.status_code == 200

    again = client.post("/newsletter", json={"email": "CHIDI@example.com"})
    assert again.status_code == 200


def make_admin(engine: Engine, phone: str = E164) -> None:
    with Session(engine) as session:
        user = session.exec(select(User).where(User.phone == phone)).one()
        user.is_admin = True
        session.add(user)
        session.commit()


def test_admin_endpoints_require_authorisation(
    client: TestClient, engine: Engine
) -> None:
    assert client.get("/admin/overview").status_code == 401

    rider_token = register(client)
    rider_headers = {"Authorization": f"Bearer {rider_token}"}
    assert client.get("/admin/overview", headers=rider_headers).status_code == 403
    assert client.get("/admin/riders", headers=rider_headers).status_code == 403

    me = client.get("/auth/me", headers=rider_headers)
    assert me.json()["is_admin"] is False

    make_admin(engine)
    assert client.get("/admin/overview", headers=rider_headers).status_code == 200
    assert client.get("/auth/me", headers=rider_headers).json()["is_admin"] is True


def test_admin_dashboard_data(client: TestClient, engine: Engine) -> None:
    token = register(client)
    headers = {"Authorization": f"Bearer {token}"}
    client.post("/account/wallet/top-up", json={"amount": "1500.00"}, headers=headers)
    client.post(
        "/contact",
        json={
            "name": "Chidi Nwosu",
            "email": "chidi@example.com",
            "subject": "Route enquiry",
            "message": "Please add a stop at Independence Layout.",
        },
    )
    client.post("/newsletter", json={"email": "chidi@example.com"})
    make_admin(engine)

    overview = client.get("/admin/overview", headers=headers).json()
    assert overview["riders"] == 1
    assert overview["verified_riders"] == 1
    assert overview["contact_messages"] == 1
    assert overview["newsletter_subscribers"] == 1
    assert Decimal(overview["wallet_balance_total"]) > Decimal("0")

    riders = client.get("/admin/riders", headers=headers).json()
    assert riders[0]["phone"] == E164
    assert client.get(f"/admin/riders?search={E164}", headers=headers).json()
    assert client.get("/admin/riders?search=nobody", headers=headers).json() == []

    rider_id = riders[0]["id"]
    detail = client.get(f"/admin/riders/{rider_id}", headers=headers).json()
    assert detail["transactions"] and detail["trips"]
    assert client.get("/admin/riders/9999", headers=headers).status_code == 404

    transactions = client.get("/admin/transactions", headers=headers).json()
    assert transactions[0]["user_phone"] == E164
    trips = client.get("/admin/trips", headers=headers).json()
    assert trips[0]["user_name"]
    assert client.get("/admin/messages", headers=headers).json()[0]["subject"]
    assert client.get("/admin/newsletter", headers=headers).json()[0]["email"]


def test_admin_can_adjust_wallet_and_block_rider(
    client: TestClient, engine: Engine
) -> None:
    token = register(client)
    headers = {"Authorization": f"Bearer {token}"}
    make_admin(engine)
    rider_id = client.get("/admin/riders", headers=headers).json()[0]["id"]

    credited = client.post(
        f"/admin/riders/{rider_id}/wallet",
        json={"amount": "2500.00", "description": "Goodwill credit"},
        headers=headers,
    )
    assert credited.status_code == 200
    balance = Decimal(credited.json()["wallet_balance"])

    debited = client.post(
        f"/admin/riders/{rider_id}/wallet",
        json={"amount": "-500.00", "description": "Correction"},
        headers=headers,
    )
    assert Decimal(debited.json()["wallet_balance"]) == balance - Decimal("500.00")

    overdraft = client.post(
        f"/admin/riders/{rider_id}/wallet",
        json={"amount": "-9999999.00", "description": "Too much"},
        headers=headers,
    )
    assert overdraft.status_code == 422

    demote_self = client.patch(
        f"/admin/riders/{rider_id}",
        json={"is_admin": False},
        headers=headers,
    )
    assert demote_self.status_code == 400


def test_admin_can_update_another_rider(client: TestClient, engine: Engine) -> None:
    admin_token = register(client)
    make_admin(engine)
    headers = {"Authorization": f"Bearer {admin_token}"}

    other_phone = "0803 000 0001"
    other_token = verify_code(client, request_code(client, other_phone), other_phone)
    client.post(
        "/auth/pin",
        json={"verification_token": other_token, "pin": PIN, "full_name": "Ngozi Eze"},
    )
    riders = client.get("/admin/riders?search=Ngozi", headers=headers).json()
    rider_id = riders[0]["id"]

    updated = client.patch(
        f"/admin/riders/{rider_id}",
        json={"is_active": False, "is_admin": True},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["is_active"] is False
    assert updated.json()["is_admin"] is True


def test_admin_schemas_tolerate_legacy_accounts_without_phone() -> None:
    """Accounts created before phone sign-up have no phone number."""
    rider = AdminRider(
        id=1,
        full_name="Legacy Rider",
        phone=None,
        email="legacy@example.com",
        wallet_balance=Decimal("0.00"),
        is_active=True,
        is_admin=False,
        created_at=datetime.now(timezone.utc),
    )
    assert rider.phone is None

    trip = AdminTrip(
        id=1,
        route="Route 2",
        origin="Ogui",
        destination="Abakpa",
        fare=Decimal("300.00"),
        travelled_at=datetime.now(timezone.utc),
        user_id=1,
        user_name="Legacy Rider",
        user_phone=None,
    )
    assert trip.user_phone is None
