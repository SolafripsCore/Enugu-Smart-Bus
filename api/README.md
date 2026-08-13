# Enugu Smart Bus — API

FastAPI service powering accounts, authentication and wallet/trip data for the
Enugu Smart Bus web app.

## Getting started

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload   # http://localhost:8000/docs
```

## Configuration

Environment variables (all optional in development, see `app/config.py`):

| Variable              | Default                 | Description                                   |
| --------------------- | ----------------------- | --------------------------------------------- |
| `DATABASE_URL`        | `sqlite:///./esb.db`    | SQLModel/SQLAlchemy connection string          |
| `JWT_SECRET`          | `change-me-in-production` | Signing key for access tokens                |
| `ACCESS_TOKEN_MINUTES`| `10080`                 | Access token lifetime                          |
| `CORS_ORIGINS`        | `*`                     | Comma-separated list of allowed origins        |
| `EXPOSE_RESET_TOKEN`  | `true`                  | Return the reset token in the API response     |

`EXPOSE_RESET_TOKEN` exists because no transactional email provider is connected
yet — the web app shows the token so the reset flow can be completed. Set it to
`false` once reset emails are sent for real.

## Endpoints

```
POST /auth/signup            Create an account (returns user + access token)
POST /auth/login             Email + password login
GET  /auth/me                Current user (Bearer token)
POST /auth/forgot-password   Issue a password reset token
POST /auth/reset-password    Consume a reset token and set a new password
GET  /account/wallet         Wallet balance + recent transactions
POST /account/wallet/top-up  Add funds to the wallet
GET  /account/trips          Recent trips
GET  /healthz                Health check
```

New accounts are seeded with a welcome credit and a few sample trips so the
dashboard is populated on first login.

## Tests

```bash
pip install pytest httpx ruff
pytest
ruff check .
```
