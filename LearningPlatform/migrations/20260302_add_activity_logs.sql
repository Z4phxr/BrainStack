-- Migration: add activity_logs table
-- Created: 2026-03-02

CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id"           TEXT         NOT NULL,
  "timestamp"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "action"       TEXT         NOT NULL,
  "actorUserId"  TEXT,
  "actorEmail"   TEXT,
  "resourceType" TEXT,
  "resourceId"   TEXT,
  "metadata"     JSONB,
  "createdAt"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "activity_logs_timestamp_idx"    ON "activity_logs" ("timestamp" DESC);
CREATE INDEX IF NOT EXISTS "activity_logs_actorUserId_idx"  ON "activity_logs" ("actorUserId");
CREATE INDEX IF NOT EXISTS "activity_logs_action_idx"       ON "activity_logs" ("action");
CREATE INDEX IF NOT EXISTS "activity_logs_resourceType_idx" ON "activity_logs" ("resourceType");
