-- CreateEnum
CREATE TYPE "FlashcardState" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'RELEARNING', 'MASTERED');

-- AlterTable
ALTER TABLE "flashcards" ADD COLUMN     "state" "FlashcardState" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "stepIndex" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "flashcard_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "newCardsPerDay" INTEGER NOT NULL DEFAULT 20,
    "maxReviews" INTEGER NOT NULL DEFAULT 200,
    "learningSteps" TEXT NOT NULL DEFAULT '1 10',
    "relearningSteps" TEXT NOT NULL DEFAULT '10',
    "graduatingInterval" INTEGER NOT NULL DEFAULT 1,
    "easyInterval" INTEGER NOT NULL DEFAULT 4,
    "startingEase" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "masteredThreshold" INTEGER NOT NULL DEFAULT 21,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcard_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flashcard_settings_userId_key" ON "flashcard_settings"("userId");

-- CreateIndex
CREATE INDEX "flashcards_state_idx" ON "flashcards"("state");

-- AddForeignKey
ALTER TABLE "flashcard_settings" ADD CONSTRAINT "flashcard_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
