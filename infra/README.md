# TECHOP Platform — Infrastructure & Database Foundation (`infra/`)

## 1. PostgreSQL 17 Development Setup (Port `5434`)

Development PostgreSQL 17 runs in an isolated container (`techop-platform-postgres`) with persistent volume `techop_platform_pgdata`, bound strictly to `127.0.0.1:5434` so it does not conflict with port `5432`.

```bash
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.yml --env-file infra/.env up -d
docker compose -f infra/docker-compose.yml --env-file infra/.env ps
```

> **Safety Rule:** Never run `docker compose down -v` or touch unrelated containers/volumes. Production PostgreSQL will not expose external ports.

## 2. Versioned SQL Migrations

- **Directory:** `infra/migrations/` (files named `NNNN_description.sql`)
- **History Table:** `schema_migrations (version VARCHAR(100) PRIMARY KEY, checksum VARCHAR(64) NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`
- **Execution Guarantees:**
  - Runs under PostgreSQL advisory lock (`pg_advisory_lock`).
  - Each migration runs inside a `BEGIN ... COMMIT` transaction; failures execute `ROLLBACK` without recording `schema_migrations`.
  - SHA-256 checksums prevent silent edits to already-applied migrations.
  - Migrations are **never** executed automatically when `core-api` boots.

### Scope Classification

| Scope                    | Files / Tables                                                                                              | Phase                   |
| :----------------------- | :---------------------------------------------------------------------------------------------------------- | :---------------------- |
| Migration Framework      | `schema_migrations`                                                                                         | Phase C.3 (Implemented) |
| Database Foundation      | `0001_init_foundation.sql` (`pgcrypto`, `set_updated_at()`)                                                 | Phase C.3 (Implemented) |
| Auth & RBAC Schema       | `roles`, `permissions`, `role_permissions`, `users`, `refresh_tokens`, `audit_logs`                         | Phase 1 (Deferred)      |
| CRM & Attribution Schema | `services`, `lead_sources`, `campaigns`, `leads`, `lead_assignments`, `lead_touchpoints`, `lead_activities` | Phase 2 (Deferred)      |
| CMS & Media Schema       | `categories`, `tags`, `posts`, `post_tags`, `media`                                                         | Phase 3 (Deferred)      |
| Integrations & Outbox    | `integration_configs`, `webhook_events`, `notification_logs`                                                | Phase 2–4 (Deferred)    |

### CLI Usage

```bash
npm run db:migrate
npm run db:migrate:status
```

## 3. Troubleshooting

- **Port 5434 already in use:** Update `POSTGRES_PORT` in `infra/.env` and matching port in `apps/core-api/.env` (`DATABASE_URL`).
- **`/api/v1/system/ready` returns `503`:** Check container health (`docker compose -f infra/docker-compose.yml ps`) and verify `DATABASE_URL` in `apps/core-api/.env`.
- **Checksum mismatch:** Never edit an already-applied migration; create a new sequential migration file (`0002_*.sql`).
