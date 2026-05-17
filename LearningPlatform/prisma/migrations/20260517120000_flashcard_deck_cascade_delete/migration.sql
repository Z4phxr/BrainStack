-- Delete flashcards when their deck is removed (matches Prisma onDelete: Cascade).
ALTER TABLE "flashcards" DROP CONSTRAINT "flashcards_deckId_fkey";

ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deckId_fkey"
  FOREIGN KEY ("deckId") REFERENCES "flashcard_decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
