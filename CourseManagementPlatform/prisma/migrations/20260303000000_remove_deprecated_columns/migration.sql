-- ─── Migration: remove_deprecated_columns ────────────────────────────────────
--
-- 1. Drop the 8 deprecated SRS columns that were superseded by the
--    per-user UserFlashcardProgress table (added in
--    20260301010000_add_per_user_srs_and_task_progress_tags).
--
-- 2. Drop the two stale indexes that existed only to serve those columns.
--
-- 3. Drop the deprecated `taskTags` denormalized array that was superseded by
--    the normalised TaskProgressTag join table.
--
-- 4. Add a composite index on lesson_progress(userId, status) to accelerate
--    the common "all in-progress lessons for a user" lookup pattern.
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop stale indexes before dropping columns (some engines require this order)
DROP INDEX IF EXISTS "flashcards_nextReviewAt_idx";
DROP INDEX IF EXISTS "flashcards_state_idx";

-- Remove deprecated global SRS columns from flashcards
ALTER TABLE "flashcards"
  DROP COLUMN IF EXISTS "state",
  DROP COLUMN IF EXISTS "interval",
  DROP COLUMN IF EXISTS "easeFactor",
  DROP COLUMN IF EXISTS "repetition",
  DROP COLUMN IF EXISTS "stepIndex",
  DROP COLUMN IF EXISTS "nextReviewAt",
  DROP COLUMN IF EXISTS "lastReviewedAt",
  DROP COLUMN IF EXISTS "lastResult";

-- Remove deprecated denormalized tag cache from task_progress
ALTER TABLE "task_progress"
  DROP COLUMN IF EXISTS "taskTags";

-- Add composite performance index to lesson_progress
CREATE INDEX IF NOT EXISTS "lesson_progress_userId_status_idx"
  ON "lesson_progress"("userId", "status");
