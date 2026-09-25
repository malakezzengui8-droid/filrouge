# Your Blood is Gold — Frontend

A React frontend for the Blood Is Gold blood-donation platform, built against the
backend API described in the handoff doc (`/api` prefix, JWT auth, Mongo-backed
users/requests).

## Stack

- React 19 + Vite
- React Router for pages/navigation
- Plain CSS (no UI framework) — one stylesheet per page/component
- `lucide-react` for icons
- No state library: auth lives in a small React Context, everything else is
  local `useState`/`useEffect`

## Getting started

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your backend if not localhost:8000
npm run dev
```

The backend must be running separately (see the handoff doc) at the URL in
`VITE_API_URL` (defaults to `http://localhost:8000/api`).

## Project structure

```
src/
  api/            fetch wrappers, one file per resource (auth, donors, requests, admin)
  context/        AuthContext — token, current user, login/register/logout
  components/     shared UI: Layout (sidebar), Modal, badges, avatar
  pages/          one file (+ matching .css) per screen
  utils/          blood type labels, city list, date/eligibility helpers
```

## Pages

- `/login`, `/register` — auth
- `/dashboard` — donation status, eligibility, nearby urgent requests
- `/donors` — search donors by city/blood type/name
- `/urgent`, `/urgent/new`, `/urgent/:id` — browse, publish and manage blood requests
- `/checklist` — donation preparation checklist (client-side only, no backend)
- `/profile` — view/edit profile, delete account
- `/admin` — admin-only statistics and management tables

## Notes on the API contract

A few things shown in the design mockups aren't available from the documented
API, so the frontend was adapted rather than faking data:

- `GET /api/donors` doesn't return `lastDonationDate`, so donor cards don't show
  an eligibility badge — only name, city, blood type and phone (on request).
- There's no endpoint for total donation count or "lives helped", so the
  dashboard's stat cards show blood type, city and nearby urgent request count
  instead.
- The admin statistics endpoint doesn't return "eligible donors" or "total
  donors" fields, so the admin dashboard uses the real fields: total users,
  active/fulfilled/cancelled requests.
- There's no delete endpoint for requests (only status updates), so the admin
  table's trash icon on requests cancels the request instead of deleting it.
- "Create request" doesn't collect a contact phone — the requester's own
  profile phone is what donors see, per the API's populated `createdBy`.
