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
export PGHOST="${PGHOST:-localhost}"
export PGPORT="${PGPORT:-5432}"
export PGUSER="${PGUSER:-grainydays}"
export PGPASSWORD="${PGPASSWORD:-grainydays_dev}"

if ! command -v psql >/dev/null 2>&1; then
	if docker compose ps postgres --status running -q 2>/dev/null | grep -q .; then
		psql() { docker compose exec -T -e PGPASSWORD=grainydays_dev postgres psql "$@"; }
		export -f psql
	elif docker compose up -d postgres; then
		sleep 5
		psql() { docker compose exec -T -e PGPASSWORD=grainydays_dev postgres psql "$@"; }
		export -f psql
	else
		echo "Postgres not available. Run: docker compose up -d postgres" >&2
		echo "Or: npm run ci:docker" >&2
		exit 1
	fi
fi

exec bash "$ROOT/scripts/ci-github-test.sh" "$@"
