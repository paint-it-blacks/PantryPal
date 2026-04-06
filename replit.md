# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the **PantryPal** app — a mobile-first household pantry tracker.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion

## Artifacts

### PantryPal (`artifacts/pantry-pal`)
- **Type**: react-vite web app
- **Preview path**: `/`
- Mobile-first pantry tracker. Displays household items as cards with large +1/-1 tap buttons. Items persist in PostgreSQL. Sorted by most recently updated.
- **Features**: Add items, adjust quantities, edit inline, delete items, empty state, loading/error states

### API Server (`artifacts/api-server`)
- **Type**: Express 5 API
- **Preview path**: `/api`
- REST API serving pantry items with full CRUD endpoints.
- Routes: `GET /api/items`, `POST /api/items`, `PATCH /api/items/:id`, `DELETE /api/items/:id`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

### `items` table
- `id` — serial PK
- `name` — text (required)
- `quantity` — integer (default 1, min 0)
- `unit` — text (default "pcs")
- `created_at` — timestamp
- `updated_at` — timestamp

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
