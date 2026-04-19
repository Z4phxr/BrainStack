-- Singleton row for admin-controlled platform flags (see lib/platform-flags.ts).
CREATE TABLE IF NOT EXISTS "platform_flags" (
  "id" TEXT NOT NULL,
  "activityLoggingEnabled" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT "platform_flags_pkey" PRIMARY KEY ("id")
);
