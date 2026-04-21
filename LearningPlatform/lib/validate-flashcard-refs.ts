import type { PrismaClient } from '@prisma/client'

/** Ensures `deckId` and every `tagIds` row exist before connect/create. */
export async function validateFlashcardDeckAndTags(
  prisma: PrismaClient,
  deckId: string,
  tagIds: string[],
): Promise<{ ok: true } | { ok: false; issues: Record<string, string[]> }> {
  const deck = await prisma.flashcardDeck.findUnique({
    where: { id: deckId },
    select: { id: true, parentDeckId: true, courseId: true },
  })
  if (!deck) {
    return { ok: false, issues: { deckId: ['Deck not found'] } }
  }
  if (!deck.parentDeckId) {
    const tiedToCourse = deck.courseId != null && String(deck.courseId).trim() !== ''
    if (tiedToCourse) {
      return {
        ok: false,
        issues: { deckId: ['Course decks: add cards to a subdeck, not the course main deck'] },
      }
    }
    // Standalone main deck (no course): direct cards allowed
  }
  if (tagIds.length === 0) return { ok: true }
  const found = await prisma.tag.findMany({ where: { id: { in: tagIds } }, select: { id: true } })
  if (found.length !== tagIds.length) {
    return { ok: false, issues: { tagIds: ['One or more tags do not exist'] } }
  }
  return { ok: true }
}
