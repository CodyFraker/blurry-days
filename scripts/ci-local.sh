#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export AUTH_SECRET="${AUTH_SECRET:-ci-placeholder-auth-secret-min-32-chars!!}"
export AUTH_URL="${AUTH_URL:-http://localhost:3000}"
export DISCORD_CLIENT_ID="${DISCORD_CLIENT_ID:-123456789012345678}"
export DISCORD_CLIENT_SECRET="${DISCORD_CLIENT_SECRET:-ci-placeholder-discord-secret}"
export DATABASE_URL="${DATABASE_URL:-postgres://grainydays:grainydays_dev@localhost:5432/grainydays}"
export DATABASE_URL_TEST="${DATABASE_URL_TEST:-postgres://grainydays:grainydays_dev@localhost:5432/grainydays_test}"

RUN_DOCKER=false
for arg in "$@"; do
	if [[ "$arg" == "--docker" ]]; then
		RUN_DOCKER=true
	fi
done

if ! command -v node >/dev/null 2>&1; then
	echo "Node.js is required (CI uses Node 20)." >&2
	exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
	echo "psql not found. Start Postgres (e.g. docker compose up -d postgres) and install the PostgreSQL client." >&2
	exit 1
fi

if ! PGPASSWORD=grainydays_dev psql -h localhost -U grainydays -d grainydays -c 'SELECT 1' >/dev/null 2>&1; then
	echo "Postgres is not reachable at localhost:5432. Run: docker compose up -d postgres" >&2
	exit 1
fi

PGPASSWORD=grainydays_dev psql -h localhost -U grainydays -d grainydays -tc "SELECT 1 FROM pg_database WHERE datname = 'grainydays_test'" | grep -q 1 || \
	PGPASSWORD=grainydays_dev psql -h localhost -U grainydays -d grainydays -c "CREATE DATABASE grainydays_test"

npm ci
npm run db:migrate
DATABASE_URL="$DATABASE_URL_TEST" npm run db:migrate
npm test
DATABASE_URL="$DATABASE_URL_TEST" RUN_INTEGRATION_TESTS=1 npm run test:integration
npm run lint
npm run build

if [[ "$RUN_DOCKER" == true ]]; then
	IMAGE="${CI_LOCAL_IMAGE:-ghcr.io/YOUR_GITHUB_OWNER/blurry-days:local}"
	docker build -f Dockerfile -t "$IMAGE" .
	echo "Built $IMAGE"
fi
