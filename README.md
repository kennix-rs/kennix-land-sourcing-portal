# Kennix Land Sourcing Portal

Standalone React/TypeScript mock for the Land Sourcing team.

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
- Local persistence in `localStorage`

## Run locally

```bash
npm install
npm run dev
```

## Validate

```bash
npm run lint
npm run typecheck
npm test -- --run
npm run build
```
