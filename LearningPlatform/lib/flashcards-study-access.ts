import { prisma } from '@/lib/prisma'

type AccessResult = { ok: true } | { ok: false; message: string }

/**
 * Course-linked decks remain open to any signed-in student (existing behaviour).
 * Standalone roots require an enrollment row so deck slugs are not enumerable for others.
 */
export async function assertUserCanStudyDeckScope(
  userId: string,
  opts: { mainDeckSlug?: string; subdeckSlug?: string },
): Promise<AccessResult> {
  if (opts.subdeckSlug) {
    const deck = await prisma.flashcardDeck.findUnique({
      where: { slug: opts.subdeckSlug },
      select: { id: true, courseId: true, parentDeckId: true },
    })
    if (!deck) return { ok: false, message: 'Deck not found' }

    let cur: { id: string; courseId: string | null; parentDeckId: string | null } | null = deck
    const seen = new Set<string>()
    while (cur?.parentDeckId) {
      if (seen.has(cur.id)) return { ok: false, message: 'Invalid deck hierarchy' }
      seen.add(cur.id)
      cur = await prisma.flashcardDeck.findUnique({
        where: { id: cur.parentDeckId },
        select: { id: true, courseId: true, parentDeckId: true },
      })
    }
    if (!cur) return { ok: false, message: 'Invalid deck hierarchy' }

    if (cur.courseId == null || String(cur.courseId).trim() === '') {
      let en: { userId: string; deckId: string } | null = null
      try {
        en = await prisma.userStandaloneFlashcardDeck.findUnique({
          where: { userId_deckId: { userId, deckId: cur.id } },
        })
      } catch {
        return { ok: false, message: 'Standalone library is unavailable (run database migrations).' }
      }
      if (!en) return { ok: false, message: 'This deck is not in your library' }
    }
    return { ok: true }
  }

  if (opts.mainDeckSlug) {
    const main = await prisma.flashcardDeck.findUnique({
      where: { slug: opts.mainDeckSlug },
      select: { id: true, courseId: true, parentDeckId: true },
    })
    if (!main || main.parentDeckId) {
      return { ok: false, message: 'Main deck not found' }
    }
    if (main.courseId == null || String(main.courseId).trim() === '') {
      let en: { userId: string; deckId: string } | null = null
      try {
        en = await prisma.userStandaloneFlashcardDeck.findUnique({
          where: { userId_deckId: { userId, deckId: main.id } },
        })
      } catch {
        return { ok: false, message: 'Standalone library is unavailable (run database migrations).' }
      }
      if (!en) return { ok: false, message: 'This deck is not in your library' }
    }
    return { ok: true }
  }

  return { ok: true }
}
