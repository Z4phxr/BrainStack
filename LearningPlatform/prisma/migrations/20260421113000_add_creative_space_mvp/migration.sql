-- CreateEnum
CREATE TYPE "CreativeItemType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'LINK', 'COURSE', 'FLASHCARD', 'DECK');

-- CreateEnum
CREATE TYPE "CreativeEventType" AS ENUM (
  'ITEM_CREATED',
  'ITEM_UPDATED',
  'ITEM_DELETED',
  'DRAWING_UPDATED',
  'DECK_CREATED',
  'DECK_UPDATED',
  'DECK_DELETED',
  'FLASHCARD_CREATED',
  'FLASHCARD_UPDATED',
  'FLASHCARD_DELETED'
);

-- CreateTable
CREATE TABLE "creative_spaces" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "courseId" TEXT,
  "moduleId" TEXT,
  "lessonId" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastEditedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "creative_spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creative_items" (
  "id" TEXT NOT NULL,
  "spaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "CreativeItemType" NOT NULL,
  "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "width" DOUBLE PRECISION NOT NULL DEFAULT 280,
  "height" DOUBLE PRECISION NOT NULL DEFAULT 180,
  "zIndex" INTEGER NOT NULL DEFAULT 0,
  "tag" TEXT,
  "payload" JSONB,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "creative_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creative_drawings" (
  "id" TEXT NOT NULL,
  "spaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "strokes" JSONB NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "creative_drawings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creative_activity_events" (
  "id" TEXT NOT NULL,
  "spaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "eventType" "CreativeEventType" NOT NULL,
  "itemId" TEXT,
  "metadata" JSONB,
  "eventAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "creative_activity_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creative_flashcard_decks" (
  "id" TEXT NOT NULL,
  "spaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "creative_flashcard_decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creative_flashcards" (
  "id" TEXT NOT NULL,
  "deckId" TEXT NOT NULL,
  "spaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "front" TEXT NOT NULL,
  "back" TEXT NOT NULL,
  "hint" TEXT,
  "tag" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "creative_flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "creative_spaces_userId_idx" ON "creative_spaces"("userId");

-- CreateIndex
CREATE INDEX "creative_spaces_userId_updatedAt_idx" ON "creative_spaces"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "creative_items_spaceId_zIndex_idx" ON "creative_items"("spaceId", "zIndex");

-- CreateIndex
CREATE INDEX "creative_items_userId_createdAt_idx" ON "creative_items"("userId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "creative_drawings_spaceId_key" ON "creative_drawings"("spaceId");

-- CreateIndex
CREATE INDEX "creative_drawings_userId_idx" ON "creative_drawings"("userId");

-- CreateIndex
CREATE INDEX "creative_activity_events_spaceId_eventAt_idx" ON "creative_activity_events"("spaceId", "eventAt" DESC);

-- CreateIndex
CREATE INDEX "creative_activity_events_userId_eventAt_idx" ON "creative_activity_events"("userId", "eventAt" DESC);

-- CreateIndex
CREATE INDEX "creative_flashcard_decks_spaceId_createdAt_idx" ON "creative_flashcard_decks"("spaceId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "creative_flashcard_decks_userId_createdAt_idx" ON "creative_flashcard_decks"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "creative_flashcards_deckId_createdAt_idx" ON "creative_flashcards"("deckId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "creative_flashcards_spaceId_createdAt_idx" ON "creative_flashcards"("spaceId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "creative_flashcards_userId_createdAt_idx" ON "creative_flashcards"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "creative_spaces"
ADD CONSTRAINT "creative_spaces_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_items"
ADD CONSTRAINT "creative_items_spaceId_fkey"
FOREIGN KEY ("spaceId") REFERENCES "creative_spaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_items"
ADD CONSTRAINT "creative_items_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_drawings"
ADD CONSTRAINT "creative_drawings_spaceId_fkey"
FOREIGN KEY ("spaceId") REFERENCES "creative_spaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_drawings"
ADD CONSTRAINT "creative_drawings_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_activity_events"
ADD CONSTRAINT "creative_activity_events_spaceId_fkey"
FOREIGN KEY ("spaceId") REFERENCES "creative_spaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_activity_events"
ADD CONSTRAINT "creative_activity_events_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_flashcard_decks"
ADD CONSTRAINT "creative_flashcard_decks_spaceId_fkey"
FOREIGN KEY ("spaceId") REFERENCES "creative_spaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_flashcard_decks"
ADD CONSTRAINT "creative_flashcard_decks_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_flashcards"
ADD CONSTRAINT "creative_flashcards_deckId_fkey"
FOREIGN KEY ("deckId") REFERENCES "creative_flashcard_decks"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_flashcards"
ADD CONSTRAINT "creative_flashcards_spaceId_fkey"
FOREIGN KEY ("spaceId") REFERENCES "creative_spaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_flashcards"
ADD CONSTRAINT "creative_flashcards_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
