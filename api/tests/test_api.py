from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.database import get_session
from app.main import app


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


SIGNUP = {
    "full_name": "Ada Okonkwo",
    "email": "ada@example.com",
    "phone": "+2348000000000",
    "password": "SuperSecret1",
}


def test_signup_login_and_wallet(client: TestClient) -> None:
    created = client.post("/auth/signup", json=SIGNUP)
    assert created.status_code == 201
    token = created.json()["token"]["access_token"]

    duplicate = client.post("/auth/signup", json=SIGNUP)
    assert duplicate.status_code == 409

    bad_login = client.post(
        "/auth/login", json={"email": SIGNUP["email"], "password": "wrong-password"}
    )
    assert bad_login.status_code == 401

    login = client.post(
        "/auth/login", json={"email": SIGNUP["email"], "password": SIGNUP["password"]}
    )
    assert login.status_code == 200

    headers = {"Authorization": f"Bearer {token}"}
    me = client.get("/auth/me", headers=headers)
    assert me.json()["email"] == SIGNUP["email"]

    wallet = client.get("/account/wallet", headers=headers)
    assert wallet.status_code == 200
    assert float(wallet.json()["balance"]) == pytest.approx(1100.0)
    assert len(wallet.json()["transactions"]) == 4

    topped_up = client.post(
        "/account/wallet/top-up", json={"amount": "900.00"}, headers=headers
    )
    assert float(topped_up.json()["balance"]) == pytest.approx(2000.0)

    trips = client.get("/account/trips", headers=headers)
    assert len(trips.json()) == 3


def test_wallet_requires_authentication(client: TestClient) -> None:
    assert client.get("/account/wallet").status_code == 401
    assert (
        client.get("/account/wallet", headers={"Authorization": "Bearer nope"})
    ).status_code == 401


def test_password_reset_flow(client: TestClient) -> None:
    client.post("/auth/signup", json=SIGNUP)

    unknown = client.post("/auth/forgot-password", json={"email": "nobody@example.com"})
    assert unknown.status_code == 200
    assert unknown.json()["reset_token"] is None

    requested = client.post("/auth/forgot-password", json={"email": SIGNUP["email"]})
    reset_token = requested.json()["reset_token"]
    assert reset_token

    reset = client.post(
        "/auth/reset-password", json={"token": reset_token, "password": "BrandNewPass9"}
    )
    assert reset.status_code == 200

    replayed = client.post(
        "/auth/reset-password", json={"token": reset_token, "password": "AnotherPass9"}
    )
    assert replayed.status_code == 400

    login = client.post(
        "/auth/login", json={"email": SIGNUP["email"], "password": "BrandNewPass9"}
    )
    assert login.status_code == 200


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
