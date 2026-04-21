-- AlterTable
ALTER TABLE "flashcard_decks"
ADD COLUMN "courseId" TEXT,
ADD COLUMN "moduleId" TEXT,
ADD COLUMN "parentDeckId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "flashcard_decks_moduleId_key" ON "flashcard_decks"("moduleId");

-- CreateIndex
CREATE INDEX "flashcard_decks_courseId_parentDeckId_idx" ON "flashcard_decks"("courseId", "parentDeckId");

-- CreateIndex
CREATE INDEX "flashcard_decks_moduleId_idx" ON "flashcard_decks"("moduleId");

-- AddForeignKey
ALTER TABLE "flashcard_decks"
ADD CONSTRAINT "flashcard_decks_parentDeckId_fkey"
FOREIGN KEY ("parentDeckId") REFERENCES "flashcard_decks"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
