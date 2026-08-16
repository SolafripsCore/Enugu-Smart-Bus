---
name: testing-phone-auth
description: How to end-to-end test the Enugu Smart Bus phone-first auth (signup OTP + 4-digit PIN, login, forgot-PIN, account profile/PIN cards) and the role-gated /admin super-admin dashboard against the live Vercel/Railway deployment or a local dev stack.
---

# Testing Enugu Smart Bus phone-first auth

## Environments
- Frontend (Vercel): https://enugusmartbus.com (also https://enugu-smart-bus-psi.vercel.app)
- API (Railway): https://esb-api-production.up.railway.app
  - There is no `/health` route; a 404 JSON body still proves the service is up.
- Local: `(cd api && .venv/bin/uvicorn app.main:app --reload)` and `(cd web && npm run dev)` with `NEXT_PUBLIC_API_URL` set.

## No SMS provider — getting the OTP
No SMS provider is wired up, so the API returns the code directly. The verify step renders a blue
info box: "SMS delivery isn't connected yet — your code is NNNNNN". Read the code from that box in
the UI (preferred, it's visible in recordings). You can also confirm the API side with:

```
curl -s -X POST $API/auth/otp/request -H 'Content-Type: application/json' \
  -d '{"phone":"+2348039911223","purpose":"signup"}'
```

which returns `debug_code`. If this box/field ever disappears, an SMS provider has probably been
configured — in that case you will need a real test number and this flow becomes untestable
end-to-end without user help.

## Test accounts
Accounts are keyed by phone number and there is no self-serve delete, so **always generate a fresh
random number** rather than reusing one: `echo "803$(shuf -i 1000000-9999999 -n 1)"`. Type only the
local part; the field is prefixed with a fixed `+234`.

## UI paths
- `/signup` — 3 steps: name + phone → 6-digit code → PIN + confirm → auto-redirect to `/account`
- `/login` — phone + 4-digit PIN; "Forgot your PIN?" link → `/forgot-pin`
- `/forgot-pin` — phone → OTP → new PIN → logged in
- `/account` — "Log out" button near the header; scroll down for the "Profile" card
  (name/email, phone read-only) and "Security PIN" card (current PIN → new PIN)
- Expected fresh-account state: wallet ₦1,100, a "Welcome credit" entry, and 3 seeded trips.

## Known papercut (verified on prod)
On `/login`, `CodeInput.onComplete` auto-submits when the 4th PIN digit is typed, and a false
"Enter your 4-digit PIN." validation error flashes because the submit reads stale state. Clicking
"Log in" afterwards succeeds. Expect this; don't report it as a login failure. It may also apply to
the OTP `onComplete` auto-submit.

## Mobile (390px) testing gotcha
Chrome enforces a ~500px minimum OS window width, so `wmctrl -e` cannot reach 390px. Use DevTools
device mode: F12 → toggle device toolbar → set width to 390. Note that **closing DevTools also exits
device mode**, so leave it docked. Under device mode, touch emulation makes fast synthetic typing
(`xdotool type`) drop characters — type one digit at a time with small pauses, and always verify the
field contents in the DOM/screenshot before submitting. Digit loss there is a harness artifact, not
an app bug; the same strings type fine at desktop width.

Check overflow numerically rather than by eye:
`document.documentElement.scrollWidth === window.innerWidth`.

## Admin / super-admin dashboard (`/admin`)
- Gated by `is_admin` on the user. Bootstrap is the `ADMIN_PHONES` env var on Railway
  (`api/app/admins.py: sync_admin_flag` promotes a matching phone on next login), so to make a test
  account admin you must ask the user to add its phone to `ADMIN_PHONES` and redeploy.
- `/account` renders an **"Admin dashboard"** button next to "Log out" only when `is_admin`.
- Gating is **client-side** in `AdminDashboard.tsx`: non-admin → `/account`, no token → `/login`.
  A raw `GET /admin` therefore returns HTTP 200 for the shell; you must check the redirect **in the
  browser after hydration**, not with curl. The API itself is properly gated (401 without a token).
- Tabs: Riders / Transactions / Trips / Messages / Newsletter. Nine stat cards: Riders, Verified,
  New (7 days), Wallet balances, Top-ups, Fares, Trips, Messages, Subscribers.
- Search box posts `?search=` to `/admin/riders`; it filters server-side and an unmatched string
  yields `Riders (0)` with no error banner.
- **Destructive controls — do not click on production**: Block/Unblock and Make admin/Revoke admin
  (`PATCH /admin/riders/{id}`) and wallet adjustment (`POST /admin/riders/{id}/wallet`) write to the
  live DB. Read-only navigation, tab switching and search are safe. The admin's own row has these
  buttons disabled, so self-demotion is not possible.
- Legacy accounts created before the phone migration show an email (or `—`) in the Phone column —
  that is expected, not a bug.
- Good "is this real data?" proof without mutating anything: sign up a fresh rider as part of the
  test, then reload `/admin` and show the counters moved (e.g. Riders 9→10, Trips 27→30). Capture
  API ground truth **before** creating that rider so your expected values stay correct.
- The riders table is `min-w-[720px]` inside an `overflow-x-auto` panel, so at 390px it scrolls
  sideways within its card while the page does not. Verify with the container, not the document:
  `const t=document.querySelector('table').parentElement; t.scrollWidth > t.clientWidth`.

## Devin Secrets Needed
None for read/write testing of auth on the live site. (`VERCEL_TOKEN` / `RAILWAY_TOKEN` /
`RAILWAY_ACCOUNT_TOKEN` are only needed for redeploying, `RESEND_API_KEY` for email flows.)
