#!/bin/sh
set -e

# ---------------------------------------------------------------------------
# Validate required environment variables before starting.
# ---------------------------------------------------------------------------
MISSING_VARS=""

check_required() {
  eval val=\$$1
  if [ -z "$val" ]; then
    MISSING_VARS="$MISSING_VARS $1"
  fi
}

check_required DATABASE_URL
check_required AUTH_SECRET
check_required PAYLOAD_SECRET

if [ -n "$MISSING_VARS" ]; then
  printf "[ERROR] Missing required environment variables:%s\n" "$MISSING_VARS"
  exit 1
fi

printf "[INFO] Environment OK. Preparing Next.js server...\n"
printf "[INFO] NODE_ENV=%s PORT=%s\n" "${NODE_ENV:-unset}" "${PORT:-unset}"

# ---------------------------------------------------------------------------
# Run database migrations SYNCHRONOUSLY before starting the server.
#
# The Next.js server starts only after all Prisma migrations succeed.
# Railway does not route traffic until /api/ping responds (healthcheckTimeout
# is 300s in railway.toml), which gives migrations enough time to complete.
#
# If Prisma migrate fails the container exits with code 1 so Railway
# restarts it automatically (restartPolicyType = ON_FAILURE in railway.toml).
#
# Wait for Postgres using Node (pg is already a dependency — no extra packages).
# ---------------------------------------------------------------------------
printf "[INFO] Waiting for database to accept connections...\n"
npx tsx --tsconfig tsconfig.scripts.json ./scripts/wait-for-db.ts

printf "[MIGRATE] Running prisma migrate deploy...\n"
npm run db:migrate:deploy && printf "[MIGRATE] Prisma migrations done.\n" || {
  printf "[MIGRATE][ERROR] Prisma migrate failed — container will exit so Railway can restart it.\n"
  exit 1
}

printf "[MIGRATE] Running Payload CMS migrations (creates block tables etc.)...\n"
npm run payload:migrate && printf "[MIGRATE] Payload migrations done.\n" || \
  printf "[MIGRATE][WARNING] Payload migrate failed — tables may already exist or will be created on first request.\n"

printf "[MIGRATE] Running custom SQL migrations from migrations/...\n"
if ls /app/migrations/*.sql >/dev/null 2>&1; then
  for sql_file in /app/migrations/*.sql; do
    if [ ! -f "$sql_file" ]; then
      continue
    fi
    printf "[MIGRATE] Applying %s...\n" "$sql_file"
    npx tsx --tsconfig tsconfig.scripts.json ./scripts/run-sql-file.ts "$sql_file" && \
      printf "[MIGRATE] OK: %s\n" "$sql_file" || \
      printf "[MIGRATE][WARNING] Failed (may already be applied): %s\n" "$sql_file"
  done
else
  printf "[MIGRATE] No .sql files in migrations/ — skipping.\n"
fi
printf "[MIGRATE] Custom SQL migrations done.\n"

if [ "${SKIP_CMS_SEED:-}" = "1" ] || [ "${SKIP_CMS_SEED:-}" = "true" ]; then
  printf "[MIGRATE] SKIP_CMS_SEED is set — skipping cms:seed.\n"
else
  printf "[MIGRATE] Running CMS seed (creates admin user in both payload_users and public.User)...\n"
  npm run cms:seed && printf "[MIGRATE] CMS seed done.\n" || \
    printf "[MIGRATE][WARNING] CMS seed failed (admin user may already exist or Payload tables not ready).\n"
fi

if [ "${CONTENT_IMPORT:-}" = "1" ] || [ "${CONTENT_IMPORT:-}" = "true" ]; then
  printf "[IMPORT] CONTENT_IMPORT is set — running npm run content:import:all...\n"
  npm run content:import:all && printf "[IMPORT] Content import finished.\n" || \
    printf "[IMPORT][WARNING] Content import failed or was partial — check logs above.\n"
fi

# ---------------------------------------------------------------------------
# Start the server.
# ---------------------------------------------------------------------------
printf "[INFO] Starting Next.js server...\n"
if [ "${NODE_ENV:-production}" = "production" ]; then
  exec npm run start
else
  exec npm run dev
fi
