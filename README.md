# Enugu Smart Bus

Monorepo for the Enugu Smart Bus website and API.

| Path  | Stack                                   | Deployment                                     |
| ----- | --------------------------------------- | ---------------------------------------------- |
| `web` | Next.js 15, React 19, Tailwind CSS      | https://enugu-smart-bus-psi.vercel.app         |
| `api` | FastAPI, SQLModel, JWT auth, Resend     | https://esb-api-production.up.railway.app      |

## Frontend

```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

Environment: `NEXT_PUBLIC_API_URL` points the browser client at the API
(defaults to `http://localhost:8000`).

## API

```bash
cd api
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt pytest ruff
.venv/bin/uvicorn app.main:app --reload   # http://localhost:8000
.venv/bin/pytest -q
.venv/bin/ruff check . && .venv/bin/ruff format --check .
```

Settings are read from environment variables (see `api/app/config.py`):
`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, `SITE_URL`, `RESEND_API_KEY`,
`MAIL_FROM`, `CONTACT_EMAIL`. SQLite is used locally; Railway Postgres URLs are
normalised to the psycopg driver automatically.

Accounts are phone-first: sign up with a phone number, verify it with an SMS
code, then set a 4-digit PIN used for login. OTP delivery goes through Termii
(`TERMII_API_KEY`, `TERMII_SENDER_ID`) or Twilio (`TWILIO_ACCOUNT_SID`,
`TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`). With no provider configured the API
returns the code in the response so the flow stays usable before launch — set
`EXPOSE_OTP=false` once SMS is live.

Endpoints: `/healthz`, `/auth/otp/request`, `/auth/otp/verify`, `/auth/pin`,
`/auth/login`, `/auth/me` (GET/PATCH), `/auth/pin/change`, `/account/wallet`,
`/account/trips`, `/contact`, `/newsletter`.

## Brand assets

Logos live in `web/public/images/brand` (`logo-mark`, `logo-full`,
`logo-full-light`, plus `og-image.png` for social previews).
