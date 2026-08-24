# RomKillerV4 Discord Bot

Premium Discord server control center and modular bot foundation for the RomKillerV4 Minecraft community.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/romkillerv4-dashboard/src/` — responsive owner control center UI and page modules
- `artifacts/api-server/src/routes/romkiller.ts` — dashboard/settings/status API surface
- `lib/api-spec/openapi.yaml` — source of truth for generated API contracts
- `lib/db/src/schema/romkiller.ts` — PostgreSQL tables for guild settings, moderation, tickets, and activity

## Architecture decisions

- The bot is organized as separate feature modules so moderation, tickets, Minecraft, economy, AI, and analytics can be enabled independently.
- The dashboard consumes generated API hooks; the API contract is kept in OpenAPI and regenerated after changes.
- Discord and Minecraft credentials are stored as Replit Secrets; no credentials are embedded in source.
- Relative activity timestamps are supported at the presentation boundary so live and demo event feeds use the same contract.

## Product

The first slice provides a polished owner cockpit with live-refreshing bot, guild, Minecraft, economy, activity, ticket, moderation, giveaway, analytics, AI, security, and settings surfaces. The backend persists core guild configuration and exposes a safe foundation for the Discord gateway and Minecraft bridge modules.

## User preferences

- Keep the feature set modular rather than building one oversized command handler.
- Support both slash commands and configurable `?`/`!` prefix commands.

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after every OpenAPI change.
- Use `pnpm run typecheck` for workspace validation; restart the managed API and dashboard workflows after runtime changes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
