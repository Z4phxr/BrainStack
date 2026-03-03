-- ---------------------------------------------------------------------------
-- JWT token revocation blocklist
-- Entries are added on sign-out; expired entries are pruned periodically.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "revoked_tokens" (
  "jti"       TEXT         NOT NULL,
  "expiresAt" TIMESTAMPTZ  NOT NULL,
  "revokedAt" TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT "revoked_tokens_pkey" PRIMARY KEY ("jti")
);

CREATE INDEX IF NOT EXISTS "revoked_tokens_expiresAt_idx"
  ON "revoked_tokens" ("expiresAt");

-- ---------------------------------------------------------------------------
-- Persistent rate-limit counters
-- Replaces the in-memory Map; survives restarts and works across instances.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "rate_limits" (
  "id"      TEXT         NOT NULL,
  "count"   INTEGER      NOT NULL DEFAULT 1,
  "resetAt" TIMESTAMPTZ  NOT NULL,
  CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "rate_limits_resetAt_idx"
  ON "rate_limits" ("resetAt");
