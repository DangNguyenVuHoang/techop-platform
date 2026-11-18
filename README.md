# TECHOP Centralized CRM & CMS Platform (`techop-platform`)

Monorepo Modular Monolith architecture powering TECHOP's centralized customer relationship management, multi-channel lead attribution, and headless content management.

## Architecture Overview

- `apps/core-api` — Central Modular Monolith backend (Express 5 + PostgreSQL 17, `api.gettechop.com`) _[Phase C.2 + C.3 Foundation]_
- `apps/crm-admin` — Internal CRM & CMS Admin Portal (Next.js 16, `crm.gettechop.com`) _[Phase C.4]_
- `apps/marketing-web` — Public Marketing Website A (Next.js 16, `techop.vn`) _[Phase C.5]_
- `packages/shared` — `@techop/shared` domain enums, normalizers, API envelope types, and Zod validation schemas
- `infra/` — Docker Compose (PostgreSQL 17 on port `5434`), Versioned SQL Migrations & CLI _[Phase C.3 Foundation]_

## Prerequisites

- Node.js `>= 22.12.0` (`.nvmrc` pinned to `22`)
- npm `>= 10` (npm workspaces)
- Docker & Docker Compose (for local PostgreSQL 17)

## Installation & Root Scripts

```bash
npm install
npm run build
npm run typecheck
npm run lint
npm run format:check
npm test
npm run db:migrate
npm run db:migrate:status
```

## Database & Migration Foundation (`infra/`)

1. Start isolated PostgreSQL 17 development container on `127.0.0.1:5434`:

```bash
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.yml --env-file infra/.env up -d
```

2. Configure Core API environment and run migrations explicitly via CLI:

```bash
cp apps/core-api/.env.example apps/core-api/.env
npm run db:migrate
npm run db:migrate:status
```

See [infra/README.md](infra/README.md) for migration architecture, `schema_migrations` tracking, scope classification, and troubleshooting.

## Core API (`apps/core-api`)

### Structure & Module Boundaries

- `src/app.ts` — Express 5 application setup (Helmet, explicit CORS allowlist, JSON limit, Request ID, structured request logger, `/api/v1` router, 404 handler, centralized error handler).
- `src/server.ts` — HTTP server bootstrap, startup error handling, and graceful `SIGTERM`/`SIGINT` shutdown (closes HTTP server and PostgreSQL pool).
- `src/config/env.ts` — Zod fail-fast environment validator (`DATABASE_URL`, pool settings, CORS, API prefix).
- `src/lib/db.ts` — Centralized `pg.Pool` connection management, readiness check (`SELECT 1`), and clean shutdown.
- `src/lib/logger.ts` — Structured JSON logger with automatic sensitive-key and connection-string redaction.
- `src/modules/` — Modular Monolith boundaries: `auth`, `users`, `crm`, `leads`, `attribution`, `integrations`, `cms`, `media`, `analytics`, `system`.

### Liveness vs Readiness Endpoints

- **Liveness:** `GET http://localhost:4001/api/v1/system/health` — checks Core API process health only (`200 OK`, independent of PostgreSQL).
- **Readiness:** `GET http://localhost:4001/api/v1/system/ready` — verifies PostgreSQL connectivity (`200 OK` when ready, `503 SERVICE_UNAVAILABLE` when DB is unreachable, never exposing credentials or raw SQL errors).

### Local Development Workflow

```bash
npm run build
npm run dev:api
```

### Environment Variables (`apps/core-api`)

| Variable                | Default           | Description                                                  |
| :---------------------- | :---------------- | :----------------------------------------------------------- |
| `NODE_ENV`              | `development`     | `development \| test \| production`                          |
| `PORT`                  | `4001`            | Local HTTP port (`4001` avoids colliding with legacy `4000`) |
| `API_PREFIX`            | `/api/v1`         | Versioned API mount prefix                                   |
| `LOG_LEVEL`             | `info`            | `debug \| info \| warn \| error \| silent`                   |
| `SERVICE_NAME`          | `techop-core-api` | Service identifier in logs and healthcheck                   |
| `DATABASE_URL`          | _(required)_      | PostgreSQL connection URL (`postgres://` or `postgresql://`) |
| `DB_POOL_MAX`           | `10`              | Max connections in `pg.Pool`                                 |
| `DB_CONNECT_TIMEOUT_MS` | `5000`            | Connection timeout in ms                                     |
| `DB_IDLE_TIMEOUT_MS`    | `30000`           | Idle client timeout in ms                                    |
| `CORS_ALLOWED_ORIGINS`  | `""`              | Comma-separated explicit origins (wildcard `*` rejected)     |
| `JSON_BODY_LIMIT`       | `1mb`             | Maximum JSON request payload size                            |

### Not Yet Implemented (Planned in Upcoming Phases)

- Auth (JWT + Refresh Token Rotation + RBAC) & Users (`Phase 1`)
- CRM, Leads, Deduplication, Attribution & Integrations (`Phase 2`)
- CMS & Cloudflare R2 Media (`Phase 3`)
- Analytics & Notifications (`Phase 4`)
