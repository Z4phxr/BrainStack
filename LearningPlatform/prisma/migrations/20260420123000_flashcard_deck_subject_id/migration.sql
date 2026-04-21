ALTER TABLE "flashcard_decks" ADD COLUMN IF NOT EXISTS "subjectId" TEXT;

CREATE INDEX IF NOT EXISTS "flashcard_decks_subjectId_idx" ON "flashcard_decks"("subjectId");
