$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$ExtraArgs = @()
foreach ($arg in $args) {
	$ExtraArgs += $arg
}

$ComposeArgs = @("-f", "docker-compose.ci.yml", "run", "--rm", "ci", "bash", "scripts/ci-github-test.sh") + $ExtraArgs

Write-Host "Running GitHub Actions test job in Linux (node:20 + postgres:15)..."
docker compose @ComposeArgs
if ($LASTEXITCODE -ne 0) {
	exit $LASTEXITCODE
}
