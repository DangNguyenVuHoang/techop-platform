# `@techop/marketing-web` — TECHOP Public Marketing Website

Public marketing website foundation built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS v4**.

## Local Development

```bash
cp apps/marketing-web/.env.example apps/marketing-web/.env.local
npm run dev:marketing
```

Runs on `http://localhost:3002` (avoids colliding with legacy port `3000` and `crm-admin` port `3001`).

## Environment Variables

| Variable                | Default                 | Description                                                              |
| :---------------------- | :---------------------- | :----------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`  | `http://localhost:3002` | Base URL for `metadataBase`, canonicals, `robots.txt`, and `sitemap.xml` |
| `NEXT_PUBLIC_SITE_NAME` | `TECHOP`                | Brand name used in metadata title template                               |

## Scope Status (Phase C.5 Foundation)

- Implemented: App Router foundation, responsive Header & Footer, minimalist Homepage placeholder (`/`), and SEO foundation (`metadataBase`, canonicals, `robots.ts`, `sitemap.ts`).
- Deferred: Public CMS/Blog pages, service landing pages, contact form proxy (`/api/contact`), and analytics.
