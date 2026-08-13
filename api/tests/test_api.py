from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.database import get_session
from app.main import app
from app.phone import InvalidPhoneNumber, normalize_phone


@pytest.fixture(name="client")
def client_fixture() -> Generator[TestClient, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

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
