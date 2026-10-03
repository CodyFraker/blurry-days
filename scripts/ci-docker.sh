#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
echo "Running GitHub Actions test job in Linux (node:20 + postgres:15)..."
docker compose -f docker-compose.ci.yml run --rm ci bash scripts/ci-github-test.sh "$@"
