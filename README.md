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

```bash
docker-compose up -d
# App: http://localhost:3000
# Postgres: localhost:5432 (grainydays / grainydays_dev)
```

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
| `GOOGLE_SHEETS_*` | Optional; sync rule questions from Sheets |

Health check: `GET /api/health`

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
