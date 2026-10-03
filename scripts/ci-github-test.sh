#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export AUTH_SECRET="${AUTH_SECRET:-ci-placeholder-auth-secret-min-32-chars!!}"
export AUTH_URL="${AUTH_URL:-http://localhost:3000}"
export DATABASE_URL="${DATABASE_URL:-postgres://grainydays:grainydays_dev@localhost:5432/grainydays}"
export DATABASE_URL_TEST="${DATABASE_URL_TEST:-postgres://grainydays:grainydays_dev@localhost:5432/grainydays_test}"
export CI_DISCORD_CLIENT_ID="${CI_DISCORD_CLIENT_ID:-123456789012345678}"
export CI_DISCORD_CLIENT_SECRET="${CI_DISCORD_CLIENT_SECRET:-ci-placeholder-discord-secret}"

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-grainydays}"
PGPASSWORD="${PGPASSWORD:-grainydays_dev}"
export PGPASSWORD

RUN_DOCKER_IMAGE=false
for arg in "$@"; do
	if [[ "$arg" == "--docker" ]]; then
		RUN_DOCKER_IMAGE=true
	fi
done

if ! command -v psql >/dev/null 2>&1; then
	if command -v apt-get >/dev/null 2>&1; then
		apt-get update -qq
		DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql-client
	else
		echo "psql is required. Install PostgreSQL client tools or run: npm run ci:docker" >&2
		exit 1
	fi
fi

echo "Waiting for Postgres at ${PGHOST}:${PGPORT}..."
postgres_ready() {
	psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d grainydays -c 'SELECT 1' >/dev/null 2>&1
}
for _ in $(seq 1 60); do
	if postgres_ready; then
		break
	fi
	sleep 1
done
if ! postgres_ready; then
	echo "Postgres is not ready at ${PGHOST}:${PGPORT}" >&2
	exit 1
fi

psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d grainydays -tc "SELECT 1 FROM pg_database WHERE datname = 'grainydays_test'" | grep -q 1 || \
	psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d grainydays -c "CREATE DATABASE grainydays_test"

echo "==> npm ci"
npm ci

echo "==> migrate main database"
npm run db:migrate

echo "==> migrate test database"
DATABASE_URL="$DATABASE_URL_TEST" npm run db:migrate

echo "==> unit tests"
npm test

echo "==> integration tests"
DATABASE_URL="$DATABASE_URL_TEST" RUN_INTEGRATION_TESTS=1 npm run test:integration

echo "==> lint"
npm run lint

echo "==> production build"
DISCORD_CLIENT_ID="$CI_DISCORD_CLIENT_ID" DISCORD_CLIENT_SECRET="$CI_DISCORD_CLIENT_SECRET" npm run build

if [[ "$RUN_DOCKER_IMAGE" == true ]]; then
	IMAGE="${CI_LOCAL_IMAGE:-ghcr.io/YOUR_GITHUB_OWNER/blurry-days:local}"
	echo "==> docker build $IMAGE"
	docker build -f Dockerfile -t "$IMAGE" \
		--build-arg "AUTH_SECRET=$AUTH_SECRET" \
		--build-arg "AUTH_URL=$AUTH_URL" \
		--build-arg "DISCORD_CLIENT_ID=$CI_DISCORD_CLIENT_ID" \
		--build-arg "DISCORD_CLIENT_SECRET=$CI_DISCORD_CLIENT_SECRET" \
		--build-arg "DATABASE_URL=$DATABASE_URL" \
		.
	echo "Built $IMAGE"
fi

echo "CI test job finished successfully."
