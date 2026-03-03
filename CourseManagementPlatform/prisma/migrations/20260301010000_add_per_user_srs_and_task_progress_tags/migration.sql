-- ============================================================================
-- Migration: add_per_user_srs_and_task_progress_tags
-- 
-- Changes:
--   1. Create `user_flashcard_progress` — per-user SRS state for flashcards.
--      Fixes: Flashcard SRS state was global (shared across all users).
--
--   2. Create `task_progress_tags` — normalised join between TaskProgress and Tag.
--      Fixes: taskTags was a String[] snapshot, not referencing canonical Tags.
--
--   3. Add safe NOT NULL constraint on `payload.tasks_tags.tag_id` (only if no
--      orphan rows exist).  Fixes: tag_id could be NULL, leaving orphaned rows.
--
--   4. Add index on `payload.tasks_tags.tag_id` for cross-schema join performance.
-- ============================================================================

-- CreateTable: per-user SRS progress (replaces global state on Flashcard)
CREATE TABLE "user_flashcard_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "state" "FlashcardState" NOT NULL DEFAULT 'NEW',
    "stepIndex" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "repetition" INTEGER NOT NULL DEFAULT 0,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "lastResult" "LastResult",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_flashcard_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable: normalised task-progress tags (replaces String[] taskTags)
CREATE TABLE "task_progress_tags" (
    "id" TEXT NOT NULL,
    "taskProgressId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "task_progress_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: user_flashcard_progress
CREATE INDEX "user_flashcard_progress_userId_idx" ON "user_flashcard_progress"("userId");
CREATE INDEX "user_flashcard_progress_flashcardId_idx" ON "user_flashcard_progress"("flashcardId");
CREATE INDEX "user_flashcard_progress_nextReviewAt_idx" ON "user_flashcard_progress"("nextReviewAt");
CREATE INDEX "user_flashcard_progress_userId_state_idx" ON "user_flashcard_progress"("userId", "state");
CREATE UNIQUE INDEX "user_flashcard_progress_userId_flashcardId_key" ON "user_flashcard_progress"("userId", "flashcardId");

-- CreateIndex: task_progress_tags
CREATE INDEX "task_progress_tags_taskProgressId_idx" ON "task_progress_tags"("taskProgressId");
CREATE INDEX "task_progress_tags_tagId_idx" ON "task_progress_tags"("tagId");
CREATE UNIQUE INDEX "task_progress_tags_taskProgressId_tagId_key" ON "task_progress_tags"("taskProgressId", "tagId");

-- AddForeignKey: user_flashcard_progress → User
ALTER TABLE "user_flashcard_progress" ADD CONSTRAINT "user_flashcard_progress_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: user_flashcard_progress → flashcards
ALTER TABLE "user_flashcard_progress" ADD CONSTRAINT "user_flashcard_progress_flashcardId_fkey"
    FOREIGN KEY ("flashcardId") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: task_progress_tags → task_progress
ALTER TABLE "task_progress_tags" ADD CONSTRAINT "task_progress_tags_taskProgressId_fkey"
    FOREIGN KEY ("taskProgressId") REFERENCES "task_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: task_progress_tags → tags
ALTER TABLE "task_progress_tags" ADD CONSTRAINT "task_progress_tags_tagId_fkey"
    FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- Payload schema improvements (best-effort — runs safely even if already done)
-- ============================================================================

-- Add index on payload.tasks_tags.tag_id and optionally set NOT NULL.
-- Wrapped in a single DO block so this never fails on a fresh database where
-- the payload schema does not yet exist (e.g. CI runners, new installations).
DO $$
DECLARE
    orphan_count BIGINT;
BEGIN
    -- Skip entirely if the payload schema does not exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.schemata WHERE schema_name = 'payload'
    ) THEN
        RAISE NOTICE 'payload schema does not exist — skipping payload.tasks_tags improvements.';
        RETURN;
    END IF;

    -- Add index on payload.tasks_tags.tag_id for cross-schema join performance
    -- (tag_id references public.tags.id but without a DB-level FK across schemas)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'payload'
          AND tablename  = 'tasks_tags'
          AND indexname  = 'tasks_tags_tag_id_idx'
    ) THEN
        CREATE INDEX "tasks_tags_tag_id_idx" ON payload.tasks_tags("tag_id");
    END IF;

    -- Set NOT NULL on payload.tasks_tags.tag_id only when there are no orphan rows.
    -- If orphans exist, prints a NOTICE and skips so the admin can fix manually.
    SELECT COUNT(*) INTO orphan_count
    FROM payload.tasks_tags
    WHERE tag_id IS NULL;

    IF orphan_count = 0 THEN
        ALTER TABLE payload.tasks_tags ALTER COLUMN tag_id SET NOT NULL;
        RAISE NOTICE 'payload.tasks_tags.tag_id set to NOT NULL successfully.';
    ELSE
        RAISE NOTICE
            'Skipped NOT NULL on payload.tasks_tags.tag_id: % orphan row(s) found. '
            'Run: DELETE FROM payload.tasks_tags WHERE tag_id IS NULL; then re-run.',
            orphan_count;
    END IF;
END $$;
