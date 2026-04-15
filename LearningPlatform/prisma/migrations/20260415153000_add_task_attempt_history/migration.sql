-- Migration: add_task_attempt_history
-- Purpose:
--   1) Add append-only task attempt event log for longitudinal analytics.
--   2) Add normalized task_attempt_tags join.
--   3) Backfill one legacy attempt per existing task_progress row.

-- CreateTable
CREATE TABLE "task_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "lessonProgressId" TEXT NOT NULL,
    "taskProgressId" TEXT,
    "submittedAnswer" TEXT,
    "earnedPoints" INTEGER NOT NULL DEFAULT 0,
    "maxPoints" INTEGER NOT NULL,
    "isCorrect" BOOLEAN,
    "difficultyRating" INTEGER,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_attempt_tags" (
    "id" TEXT NOT NULL,
    "taskAttemptId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "task_attempt_tags_pkey" PRIMARY KEY ("id")
);

-- Backfill one legacy attempt per current TaskProgress snapshot.
INSERT INTO "task_attempts" (
  "id",
  "userId",
  "taskId",
  "lessonProgressId",
  "taskProgressId",
  "submittedAnswer",
  "earnedPoints",
  "maxPoints",
  "isCorrect",
  "difficultyRating",
  "attemptedAt",
  "createdAt"
)
SELECT
  'legacy-' || tp."id"                           AS "id",
  tp."userId"                                    AS "userId",
  tp."taskId"                                    AS "taskId",
  tp."lessonProgressId"                          AS "lessonProgressId",
  tp."id"                                        AS "taskProgressId",
  tp."submittedAnswer"                           AS "submittedAnswer",
  tp."earnedPoints"                              AS "earnedPoints",
  tp."maxPoints"                                 AS "maxPoints",
  tp."isCorrect"                                 AS "isCorrect",
  tp."difficultyRating"                          AS "difficultyRating",
  COALESCE(tp."attemptedAt", CURRENT_TIMESTAMP)  AS "attemptedAt",
  CURRENT_TIMESTAMP                              AS "createdAt"
FROM "task_progress" tp;

-- Backfill TaskAttemptTag rows from TaskProgressTag.
INSERT INTO "task_attempt_tags" ("id", "taskAttemptId", "tagId")
SELECT
  'legacy-' || tpt."id"                AS "id",
  'legacy-' || tpt."taskProgressId"    AS "taskAttemptId",
  tpt."tagId"                          AS "tagId"
FROM "task_progress_tags" tpt
WHERE EXISTS (
  SELECT 1 FROM "task_attempts" ta WHERE ta."id" = 'legacy-' || tpt."taskProgressId"
);

-- CreateIndex
CREATE INDEX "task_attempts_userId_idx" ON "task_attempts"("userId");
CREATE INDEX "task_attempts_taskId_idx" ON "task_attempts"("taskId");
CREATE INDEX "task_attempts_attemptedAt_idx" ON "task_attempts"("attemptedAt");
CREATE INDEX "task_attempts_userId_taskId_idx" ON "task_attempts"("userId", "taskId");
CREATE INDEX "task_attempts_userId_attemptedAt_idx" ON "task_attempts"("userId", "attemptedAt");
CREATE INDEX "task_attempts_taskProgressId_idx" ON "task_attempts"("taskProgressId");

CREATE INDEX "task_attempt_tags_taskAttemptId_idx" ON "task_attempt_tags"("taskAttemptId");
CREATE INDEX "task_attempt_tags_tagId_idx" ON "task_attempt_tags"("tagId");
CREATE UNIQUE INDEX "task_attempt_tags_taskAttemptId_tagId_key" ON "task_attempt_tags"("taskAttemptId", "tagId");

-- AddForeignKey
ALTER TABLE "task_attempts" ADD CONSTRAINT "task_attempts_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_attempts" ADD CONSTRAINT "task_attempts_lessonProgressId_fkey"
  FOREIGN KEY ("lessonProgressId") REFERENCES "lesson_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_attempts" ADD CONSTRAINT "task_attempts_taskProgressId_fkey"
  FOREIGN KEY ("taskProgressId") REFERENCES "task_progress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "task_attempt_tags" ADD CONSTRAINT "task_attempt_tags_taskAttemptId_fkey"
  FOREIGN KEY ("taskAttemptId") REFERENCES "task_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_attempt_tags" ADD CONSTRAINT "task_attempt_tags_tagId_fkey"
  FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
