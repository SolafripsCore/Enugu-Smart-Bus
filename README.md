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
`MAIL_FROM`, `CONTACT_EMAIL`, `EXPOSE_RESET_TOKEN`. SQLite is used locally;
Railway Postgres URLs are normalised to the psycopg driver automatically.

Endpoints: `/healthz`, `/auth/signup`, `/auth/login`, `/auth/me`,
`/auth/forgot-password`, `/auth/reset-password`, `/account/wallet`,
`/account/trips`, `/contact`, `/newsletter`.

## Brand assets

Logos live in `web/public/images/brand` (`logo-mark`, `logo-full`,
`logo-full-light`, plus `og-image.png` for social previews).
