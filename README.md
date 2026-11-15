# Kennix Land Sourcing Portal

React/TypeScript portal for the Land Sourcing team. It runs on its own preview data (the default), or against the KENNIX backend ([kennix-rs/kennix-backend](https://github.com/kennix-rs/kennix-backend)) in API mode.

## Preview login

- `neha.sharma@kennix.in` — Land Sourcing Executive
- `vikram.bedi@kennix.in` — Land Sourcing Team Lead
- `meera.kapoor@kennix.in` — Land Sourcing Manager
- Password: `Preview@123`

## Included workflow

- Requirements received from the Telesales portal with customer name, mobile number, preferred locations/pincodes, and property type
- Role-scoped assignment dashboard and searchable requirement list
- Agent recommendations based on location, city, pincode, and deal type
- Real Estate Agent Pool with company, agent, mobile, email, location, city, pincode, state, and Deals In
- Agent Pool maintenance restricted to Team Lead and Manager roles
- Agent outreach history and sourcing outcomes
- Multiple land options with area, asking price, ownership, location, source agent, and verification notes
- Selected land option → Land Identified → Sales handoff flow
- The status only moves forward, and agents, outreach and options lock once land is identified (the backend's rules)
- Local persistence in `localStorage`, or the backend in API mode

## Run locally

```bash
npm install
npm run dev
```

## API mode

1. Start the backend and load its demo data (see the backend's README): `uv run python manage.py seed_demo && uv run python manage.py runserver`.
2. Create `.env.local` here with `VITE_DATA_MODE=api` (see `.env.example`), then `npm run dev -- --port 5174`. The backend allows requests from `http://localhost:5174`.
3. Sign in with a Land Sourcing preview account. Accounts from other teams are refused.

| Variable | Default | Meaning |
|---|---|---|
| `VITE_DATA_MODE` | `local` | `api` switches every screen to the backend |
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Backend base URL |
| `VITE_PREVIEW_LOGINS` | shown | `false` hides the preview accounts on the sign-in page |

Screens talk only to `src/services/landSourcingService.ts`; `LocalLandSourcingService` and `ApiLandSourcingService` (`src/services/apiLandSourcingService.ts`) have the same methods. In API mode the backend decides what each person sees, the session uses JWTs (`kennix.land-sourcing.tokens.v1`) refreshed once on expiry, and a refused action shows the backend's reason.

## Validate

```bash
npm run lint
npm run typecheck
npm test -- --run
npm run build
```
