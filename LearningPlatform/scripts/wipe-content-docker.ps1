# Wipe courses, modules, lessons, tasks, and flashcards in the running Docker Postgres.
# Usage (from LearningPlatform/):
#   .\scripts\wipe-content-docker.ps1

$ErrorActionPreference = 'Stop'
$container = 'learningplatform-postgres-1'
$sqlFile = Join-Path $PSScriptRoot 'wipe-content.sql'

if (-not (docker inspect $container 2>$null)) {
  Write-Error "Container '$container' is not running. Start with: docker compose up -d"
}

Write-Host '[INFO] This will DELETE all courses, modules, lessons, tasks, and flashcards.'
$confirm = Read-Host 'Type YES to continue'
if ($confirm -ne 'YES') {
  Write-Host '[ABORTED]'
  exit 1
}

Get-Content $sqlFile -Raw | docker exec -i $container psql -U postgres -d exam_prep_db -v ON_ERROR_STOP=1
Write-Host '[DONE] Content wiped. Refresh http://localhost:3000/admin'
