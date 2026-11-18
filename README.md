# TECHOP Centralized CRM & CMS Platform (`techop-platform`)

Monorepo Modular Monolith architecture powering TECHOP's centralized customer relationship management, multi-channel lead attribution, and headless content management.

## Architecture Overview

- `apps/core-api` — Central Modular Monolith backend (Express 5 + TypeScript, `api.gettechop.com`) _[Phase C.2 Foundation]_
- `apps/crm-admin` — Internal CRM & CMS Admin Portal (Next.js 16, `crm.gettechop.com`) _[Phase C.4]_
- `apps/marketing-web` — Public Marketing Website A (Next.js 16, `techop.vn`) _[Phase C.5]_
- `packages/shared` — `@techop/shared` domain enums, normalizers, API envelope types, and Zod validation schemas
- `infra/` — Docker Compose, Caddyfile, and Versioned SQL Migrations _[Phase C.3]_

## Prerequisites

- Node.js `>= 22.12.0` (`.nvmrc` pinned to `22`)
- npm `>= 10` (npm workspaces)

## Installation & Root Scripts

```bash
npm install
npm run build
npm run typecheck
npm run lint
npm run format:check
npm test
```

## Core API (`apps/core-api`)

### Structure & Module Boundaries

- `src/app.ts` — Express 5 application setup (Helmet, explicit CORS allowlist, JSON limit, Request ID, structured request logger, `/api/v1` router, 404 handler, centralized error handler).
- `src/server.ts` — HTTP server bootstrap, startup error handling, and graceful `SIGTERM`/`SIGINT` shutdown.
- `src/config/env.ts` — Zod fail-fast environment validator.
- `src/middleware/` — `request-id.ts`, `request-logger.ts`, `not-found.ts`, `error-handler.ts`.
- `src/lib/logger.ts` — Structured JSON logger with automatic sensitive-key redaction.
- `src/modules/` — Modular Monolith boundaries: `auth`, `users`, `crm`, `leads`, `attribution`, `integrations`, `cms`, `media`, `analytics`, `system`.
  - Modules must not bypass boundaries with cross-module SQL or ad-hoc internal imports; future interactions will use module service interfaces or domain events.

### Local Development

```bash
cp apps/core-api/.env.example apps/core-api/.env
npm run build
npm run dev:api
```

Default local healthcheck:

```text
GET http://localhost:4001/api/v1/system/health
```

### Environment Variables (`apps/core-api`)

| Variable               | Default           | Description                                                       |
| :--------------------- | :---------------- | :---------------------------------------------------------------- |
| `NODE_ENV`             | `development`     | `development \| test \| production`                               |
| `PORT`                 | `4001`            | Local HTTP port (`4001` avoids colliding with legacy port `4000`) |
| `API_PREFIX`           | `/api/v1`         | Versioned API mount prefix                                        |
| `LOG_LEVEL`            | `info`            | `debug \| info \| warn \| error \| silent`                        |
| `SERVICE_NAME`         | `techop-core-api` | Service identifier in logs and healthcheck                        |
| `CORS_ALLOWED_ORIGINS` | `""`              | Comma-separated explicit origins (wildcard `*` rejected)          |
| `JSON_BODY_LIMIT`      | `1mb`             | Maximum JSON request payload size                                 |

### Not Yet Implemented (Planned in Upcoming Checkpoints)

- PostgreSQL 17 connection & SQL migrations (`Phase C.3`)
- Auth (JWT + Refresh Token Rotation + RBAC) & Users (`Phase 1`)
- CRM, Leads, Deduplication, Attribution & Integrations (`Phase 2`)
- CMS & Cloudflare R2 Media (`Phase 3`)
- Analytics & Notifications (`Phase 4`)
