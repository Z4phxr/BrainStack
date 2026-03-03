-- ─── Migration: add_revoked_tokens_rate_limits ───────────────────────────────
--
-- Creates two tables required by lib/token-blocklist.ts and lib/rate-limit.ts:
--
-- 1. revoked_tokens  — JWT revocation blocklist (maps to RevokedToken model).
--    Entries are written on sign-out and purged when expiresAt passes.
--
-- 2. rate_limits     — Persistent rate-limit counters (maps to RateLimit model).
--    Replaces the previous in-memory Map; survives restarts and works across
--    multiple application instances behind a load-balancer.
--
-- Both statements use IF NOT EXISTS so this migration is idempotent for
-- environments where the standalone migrations/20260302_add_token_blocklist_rate_limit.sql
-- was run manually beforehand.
-- ─────────────────────────────────────────────────────────────────────────────

-- JWT token revocation blocklist
CREATE TABLE IF NOT EXISTS "revoked_tokens" (
  "jti"       TEXT         NOT NULL,
  "expiresAt" TIMESTAMPTZ  NOT NULL,
  "revokedAt" TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT "revoked_tokens_pkey" PRIMARY KEY ("jti")
);

CREATE INDEX IF NOT EXISTS "revoked_tokens_expiresAt_idx"
  ON "revoked_tokens" ("expiresAt");

-- Persistent rate-limit counters
CREATE TABLE IF NOT EXISTS "rate_limits" (
  "id"      TEXT         NOT NULL,
  "count"   INTEGER      NOT NULL DEFAULT 1,
  "resetAt" TIMESTAMPTZ  NOT NULL,
  CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "rate_limits_resetAt_idx"
  ON "rate_limits" ("resetAt");
