-- Add main column to tags table
ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "main" BOOLEAN NOT NULL DEFAULT false;
