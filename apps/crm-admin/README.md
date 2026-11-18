# `@techop/crm-admin` — TECHOP CRM & CMS Admin Portal

Internal CRM & CMS Admin frontend built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and `@techop/shared`.

## Local Development

```bash
cp apps/crm-admin/.env.example apps/crm-admin/.env.local
npm run dev:crm
```

Runs on `http://localhost:3001`.

## Environment Variables

| Variable                   | Default                        | Description                   |
| :------------------------- | :----------------------------- | :---------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4001/api/v1` | Core API base URL (`/api/v1`) |
| `NEXT_PUBLIC_APP_NAME`     | `TECHOP CRM Admin`             | Application display name      |

## Scope Status (Phase C.4 Foundation)

- Implemented: App Router shell, responsive Sidebar/Header layout, placeholder routes (`/`, `/dashboard`, `/leads`, `/activities`, `/attribution`, `/content`, `/media`, `/users`, `/settings`), typed API client foundation, `@techop/shared` integration, and `noindex` SEO protection.
- Deferred to subsequent phases: Authentication/RBAC (Phase 1), CRM/Leads/Attribution (Phase 2), CMS/Media (Phase 3), Analytics (Phase 4).
