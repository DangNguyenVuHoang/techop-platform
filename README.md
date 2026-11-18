# TECHOP Centralized CRM & CMS Platform (`techop-platform`)

Monorepo Modular Monolith architecture powering TECHOP's centralized customer relationship management, multi-channel lead attribution, and headless content management.

## Architecture Overview

- `apps/core-api` — Central Modular Monolith backend (Express 5 + PostgreSQL 17, `api.gettechop.com`) _[Phase C.2]_
- `apps/crm-admin` — Internal CRM & CMS Admin Portal (Next.js 16, `crm.gettechop.com`) _[Phase C.4]_
- `apps/marketing-web` — Public Marketing Website A (Next.js 16, `techop.vn`) _[Phase C.5]_
- `packages/shared` — `@techop/shared` domain enums, normalizers, API envelope types, and Zod validation schemas
- `infra/` — Docker Compose, Caddyfile, and Versioned SQL Migrations _[Phase C.3]_

## Prerequisites

- Node.js `>= 22.12.0` (`.nvmrc` pinned to `22`)
- npm `>= 10` (npm workspaces)
- Docker & Docker Compose (for PostgreSQL 17 development)

## Common Root Scripts

```bash
npm install
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```
