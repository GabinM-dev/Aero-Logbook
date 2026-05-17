# SkyLog — Aviation Flight Logger

A personal flight logbook for aviation enthusiasts. Log every flight you've taken, track statistics, visualize carbon emissions, and explore your aviation history.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/flight-logger run dev` — run the frontend (port 18738)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/flights.ts` — Flights table schema
- `lib/db/src/schema/profiles.ts` — User profile schema
- `artifacts/api-server/src/routes/flights.ts` — Flight CRUD routes
- `artifacts/api-server/src/routes/profile.ts` — Profile routes
- `artifacts/api-server/src/routes/stats.ts` — Stats + carbon endpoints
- `artifacts/flight-logger/src/` — React frontend

## Architecture decisions

- Single-user logbook app — no authentication needed, profile is auto-created on first access
- Carbon emissions calculated server-side using ICAO-based formula: base rate × class multiplier (economy 1x, premium 1.5x, business 2.5x, first 3x)
- Stats are computed at query time from raw flight data (no materialized views)
- Profile is lazy-initialized: GET /profile creates a default if none exists

## Product

- Dashboard: key stats overview, recent flights, carbon summary
- Logbook: sortable full flight list with add/edit/delete
- Statistics: yearly breakdown, top destinations, top airlines, carbon by class
- Profile: editable name, home airport, bio

## Gotchas

- Always run `pnpm run typecheck:libs` after adding new DB schema exports before running `api-server typecheck`
- `departureDate` is stored as `text` (YYYY-MM-DD) in DB — Orval coerces it to `Date` object in the schema, so routes convert it back to string with `toDateString()`
- After each OpenAPI spec change, re-run codegen before using the updated types

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
