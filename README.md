# Grainydays Drinking Game Generator

A web app that generates custom drinking games from [Grainydays](https://www.youtube.com/@grainydaysss) film photography videos. Pick a video, tune the rules, sign in with Discord to save games, and share a link with friends.

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Auth | Auth.js with Discord OAuth |
| API | Next.js Route Handlers |
| Database | PostgreSQL + Drizzle ORM |
| Tests | Vitest (Jest-compatible API) |

## Quick start (Docker)

Copy environment variables first (Auth.js requires `AUTH_SECRET`; Discord sign-in needs OAuth credentials):

```bash
cp .env.example .env.local
# Set AUTH_SECRET (e.g. openssl rand -base64 32) and Discord OAuth values in .env.local
```

```bash
docker-compose up -d
# App: http://localhost:3000
# Postgres: localhost:5432 (grainydays / grainydays_dev)
```

The app container runs `next dev` with your repo bind-mounted for hot reload. OAuth and auth secrets (`AUTH_SECRET`, `DISCORD_*`, `ADMIN_DISCORD_IDS`) are read from `.env` or `.env.local` in the project root—do not set them to empty values in `docker-compose.yml`, or they override the mounted env files. If changes do not appear, recreate the app service (`docker compose up -d --build app`). On some hosts (often Docker Desktop on Windows), bind mounts do not emit file events into Linux containers; compose sets `WATCHPACK_POLLING=true` for the webpack dev watcher (this project uses webpack for `next dev`, not Turbopack). If hot reload already works without polling on your machine, remove or comment out that variable in `docker-compose.yml`, or override it in a local `docker-compose.override.yml`.

Run migrations after Postgres is up:

```bash
npm run db:migrate
```

## Local development

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Install and run:

```bash
npm install
npm run db:migrate
npm run dev
```

3. Discord OAuth: create an application at [Discord Developer Portal](https://discord.com/developers/applications) and set redirect URI to `{AUTH_URL}/api/auth/callback/discord`.

### Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `DATABASE_URL_TEST` | Optional DB for integration tests |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Discord OAuth |
| `ADMIN_DISCORD_IDS` | Comma-separated Discord user IDs (snowflakes) allowed to access `/admin`. Empty disables admin access. Find your ID via Discord Developer Mode or the `account.providerAccountId` row after signing in once. |
| `GAME_TTL_DAYS` | Default days until new games expire (default `90`) |
| `VIDEO_SYNC_CACHE_MINUTES` | Minutes before `/api/videos` refreshes YouTube RSS (default `60`) |

Health check: `GET /api/health`

Admin UI: `/admin` (Rules, Games, Videos, Votes, System) — requires signed-in admin.

Admin session check: `GET /api/admin/me` (requires signed-in admin)

Admin APIs (all require admin session): `GET/POST /api/admin/rule-templates`, `GET/PATCH/DELETE /api/admin/rule-templates/:id`, `GET /api/admin/games`, `GET/PATCH/DELETE /api/admin/games/:id`, `GET/POST /api/admin/videos`, `POST /api/admin/videos/sync`, `GET/PATCH/DELETE /api/admin/videos/:id`, `GET/DELETE /api/admin/rule-votes`, `GET/DELETE /api/admin/rule-templates/:id/votes`, `GET /api/admin/dashboard`, `GET /api/admin/audit-log`, `GET /api/admin/system/checks`

Rules catalog API: `GET /api/rules?page=1&pageSize=25`

## Testing

```bash
# Unit tests (no database)
npm test

# Integration tests (requires DATABASE_URL_TEST and migrated schema)
RUN_INTEGRATION_TESTS=1 npm run test:integration
```

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm start` — production
- `npm run db:generate` / `db:migrate` / `db:push` / `db:studio` — Drizzle

## Project layout

```
app/           # Pages and API routes
components/    # React UI
lib/           # DB, auth, rules engine, YouTube RSS, Google Sheets
tests/         # Integration tests and helpers
drizzle/       # SQL migrations
```
