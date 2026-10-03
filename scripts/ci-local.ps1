$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
	Write-Error "Node.js is required (CI uses Node 20)."
}

$env:AUTH_SECRET = "ci-placeholder-auth-secret-min-32-chars!!"
$env:AUTH_URL = "http://localhost:3000"
$env:DATABASE_URL = "postgres://grainydays:grainydays_dev@localhost:5432/grainydays"
$env:DATABASE_URL_TEST = "postgres://grainydays:grainydays_dev@localhost:5432/grainydays_test"
$env:CI_DISCORD_CLIENT_ID = "123456789012345678"
$env:CI_DISCORD_CLIENT_SECRET = "ci-placeholder-discord-secret"
$env:PGHOST = "localhost"
$env:PGPORT = "5432"
$env:PGUSER = "grainydays"
$env:PGPASSWORD = "grainydays_dev"

function Invoke-Psql {
	param([string[]]$PsqlArgs)
	if (Get-Command psql -ErrorAction SilentlyContinue) {
		& psql @PsqlArgs
		return
	}
	$running = docker compose ps postgres --status running -q 2>$null
	if (-not $running) {
		Write-Host "Starting postgres via docker compose..."
		docker compose up -d postgres
		Start-Sleep -Seconds 5
	}
	docker compose exec -T -e PGPASSWORD=grainydays_dev postgres psql @PsqlArgs
}

try {
	Invoke-Psql @("-h", "localhost", "-U", "grainydays", "-d", "grainydays", "-c", "SELECT 1") | Out-Null
} catch {
	Write-Error "Postgres is not reachable on localhost:5432. Run: docker compose up -d postgres`nOr use: npm run ci:docker"
}

$Bash = Get-Command bash -ErrorAction SilentlyContinue
if ($Bash) {
	& bash scripts/ci-github-test.sh @args
	exit $LASTEXITCODE
}

Write-Error "Git Bash or WSL bash is required for ci-local.ps1, or run: npm run ci:docker"
