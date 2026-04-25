-- Archive support for user course/deck visibility.
ALTER TABLE "course_progress"
  ADD COLUMN "archivedAt" TIMESTAMP(3);

ALTER TABLE "user_standalone_flashcard_decks"
  ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "course_progress_userId_archivedAt_idx"
  ON "course_progress"("userId", "archivedAt");

CREATE INDEX "user_standalone_flashcard_decks_userId_archivedAt_idx"
  ON "user_standalone_flashcard_decks"("userId", "archivedAt");
