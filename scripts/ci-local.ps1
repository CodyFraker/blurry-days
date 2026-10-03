$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not $env:AUTH_SECRET) { $env:AUTH_SECRET = "ci-placeholder-auth-secret-min-32-chars!!" }
if (-not $env:AUTH_URL) { $env:AUTH_URL = "http://localhost:3000" }
if (-not $env:DISCORD_CLIENT_ID) { $env:DISCORD_CLIENT_ID = "123456789012345678" }
if (-not $env:DISCORD_CLIENT_SECRET) { $env:DISCORD_CLIENT_SECRET = "ci-placeholder-discord-secret" }
if (-not $env:DATABASE_URL) { $env:DATABASE_URL = "postgres://grainydays:grainydays_dev@localhost:5432/grainydays" }
if (-not $env:DATABASE_URL_TEST) { $env:DATABASE_URL_TEST = "postgres://grainydays:grainydays_dev@localhost:5432/grainydays_test" }

$RunDocker = $args -contains "--docker"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
	Write-Error "Node.js is required (CI uses Node 20)."
}

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
	Write-Error "psql not found. Start Postgres (docker compose up -d postgres) and install the PostgreSQL client."
}

$env:PGPASSWORD = "grainydays_dev"
try {
	psql -h localhost -U grainydays -d grainydays -c "SELECT 1" 2>$null | Out-Null
} catch {
	Write-Error "Postgres is not reachable at localhost:5432. Run: docker compose up -d postgres"
}

$exists = psql -h localhost -U grainydays -d grainydays -tAc "SELECT 1 FROM pg_database WHERE datname = 'grainydays_test'"
if ($exists -ne "1") {
	psql -h localhost -U grainydays -d grainydays -c "CREATE DATABASE grainydays_test"
}

npm ci
npm run db:migrate
$env:DATABASE_URL = $env:DATABASE_URL_TEST
npm run db:migrate
$env:DATABASE_URL = "postgres://grainydays:grainydays_dev@localhost:5432/grainydays"

npm test
$env:RUN_INTEGRATION_TESTS = "1"
$env:DATABASE_URL = $env:DATABASE_URL_TEST
npm run test:integration
Remove-Item Env:RUN_INTEGRATION_TESTS -ErrorAction SilentlyContinue
$env:DATABASE_URL = "postgres://grainydays:grainydays_dev@localhost:5432/grainydays"

npm run lint
npm run build

if ($RunDocker) {
	$Image = if ($env:CI_LOCAL_IMAGE) { $env:CI_LOCAL_IMAGE } else { "ghcr.io/YOUR_GITHUB_OWNER/blurry-days:local" }
	docker build -f Dockerfile -t $Image .
	Write-Host "Built $Image"
}
