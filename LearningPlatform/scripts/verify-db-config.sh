#!/usr/bin/env bash
# Staging / deploy: ensure DB-related env is present before migrations.
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[ERROR] DATABASE_URL is not set (normalized from PAYLOAD_DATABASE_URL in start-staging.sh if needed)"
  exit 1
fi

if [ -z "${PAYLOAD_SECRET:-}" ]; then
  echo "[WARN] PAYLOAD_SECRET is not set — Payload and cms:seed will fail if invoked"
fi

exit 0
