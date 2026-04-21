-- Student enrollments for standalone (non-course) main flashcard decks.
CREATE TABLE "user_standalone_flashcard_decks" (
    "userId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_standalone_flashcard_decks_pkey" PRIMARY KEY ("userId", "deckId"),
    CONSTRAINT "user_standalone_flashcard_decks_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_standalone_flashcard_decks_deckId_fkey"
      FOREIGN KEY ("deckId") REFERENCES "flashcard_decks"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "user_standalone_flashcard_decks_userId_idx"
  ON "user_standalone_flashcard_decks"("userId");
