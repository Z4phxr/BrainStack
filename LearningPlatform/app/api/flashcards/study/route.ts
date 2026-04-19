import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toSlug } from '@/lib/utils'
import { requireAuth } from '@/lib/auth-helpers'
import { isCardDue, parseSettings, getCardUrgency } from '@/lib/srs'
import { getUserWeakTags } from '@/lib/analytics'
import { getSortedFreeStudyCardsForUser } from '@/lib/flashcards-study-free'

/**
 * GET /api/flashcards/study
 *
 * Returns the set of flashcards to study in the current session, using the
 * *per-user* SRS state from UserFlashcardProgress (not global Flashcard fields).
 *
 * Query parameters:
 *   mode     = "srs" | "free"   (default: "srs")
 *   tagSlug   = <slug>          (optional  filters to a single tag)
 *   deckSlug  = <slug>          (optional  limits to one flashcard deck)
 *
 * SRS mode:
 *   - Returns cards that are due NOW (new, overdue, or due today).
 *   - Respects the user's newCardsPerDay and maxReviews limits.
 *   - Returned list is sorted by (urgency + weak-tag bonus); overdue weak-tag
 *     cards therefore surface before overdue neutral cards.
 *
 * Free mode:
 *   - Returns ALL cards in the set regardless of due date.
 *   - Still sorted by (urgency + weak-tag bonus).
 *   - Does NOT enforce daily limits.
 *
 * Weak-tag weighting:
 *   SRS scheduling remains the *primary filter*  it determines which cards are
 *   eligible.  Within that eligible set, cards that share a tag with one of the
 *   user's weakest tags receive a +0.5 urgency bonus so they be presented first.
 */

/** Score bonus awarded when a due card matches at least one of the user's weak tags. */
const WEAK_TAG_BONUS = 0.5

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const mode      = searchParams.get('mode') === 'free' ? 'free' : 'srs'
    const tagSlug   = searchParams.get('tagSlug') ?? undefined
    const subject   = searchParams.get('subject') ?? undefined
    const deckSlugQ = searchParams.get('deckSlug')?.trim() || undefined

    if (mode === 'free' && !tagSlug && !subject && !deckSlugQ) {
      const sorted = await getSortedFreeStudyCardsForUser(user.id)
      return NextResponse.json({ cards: sorted, mode, total: sorted.length })
    }

    // Kick off weak-tag fetch in parallel with settings  failure is graceful.
    const weakTagsPromise = getUserWeakTags(user.id).catch(() => [])

    // -- Fetch user settings (create with defaults if absent) ------------------
    const dbSettings = await prisma.flashcardSettings.upsert({
      where:  { userId: user.id },
      create: { userId: user.id },
      update: {},
    })
    const settings = parseSettings(dbSettings)

    // -- Resolve weak tags -----------------------------------------------------
    const weakTags   = await weakTagsPromise
    const weakTagSet = new Set(weakTags.map((t) => t.tag.toLowerCase().trim()))

    // -- Resolve subject -> tag slugs (if requested) --------------------------
    let subjectTagSlugs: string[] | undefined = undefined
    if (subject) {
      try {
        const fs = await import('fs')
        const path = await import('path')
        const candidates = [
          path.join(process.cwd(), 'data', 'tag-taxonomy.json'),
          path.join(process.cwd(), 'tags'),
        ]
        let raw: string | null = null
        for (const p of candidates) {
          if (fs.existsSync(p)) { raw = await fs.promises.readFile(p, 'utf-8'); break }
        }
        if (raw) {
          const parsed = JSON.parse(raw)
          for (const name of Object.keys(parsed)) {
            const slug = toSlug(name)
            if (slug === subject) {
              const entry = parsed[name]
              if (Array.isArray(entry)) subjectTagSlugs = entry.map((t: string) => toSlug(String(t)))
              else if (entry && Array.isArray((entry as any).tagi)) subjectTagSlugs = (entry as any).tagi.map((t: string) => toSlug(String(t)))
              else if (entry && Array.isArray((entry as any).tags)) subjectTagSlugs = (entry as any).tags.map((t: string) => toSlug(String(t)))
              break
            }
          }
        }
      } catch {
        // ignore and fall back to tagSlug only
      }
    }

    // -- Fetch candidate flashcards --------------------------------------------
    let whereFilter: any =
      tagSlug
        ? { tags: { some: { slug: tagSlug } } }
        : subjectTagSlugs && subjectTagSlugs.length > 0
        ? { tags: { some: { slug: { in: subjectTagSlugs } } } }
        : undefined

    if (deckSlugQ) {
      const deckPart = { deck: { slug: deckSlugQ } }
      whereFilter = whereFilter ? { AND: [whereFilter, deckPart] } : deckPart
    }

    const flashcards = await prisma.flashcard.findMany({
      where: whereFilter,
      include: {
        tags: { select: { id: true, name: true, slug: true } },
        deck: { select: { id: true, name: true, slug: true } },
      },
    })

    const flashcardIds = flashcards.map((c) => c.id)
    const userProgressRows = await prisma.userFlashcardProgress.findMany({
      where: { userId: user.id, flashcardId: { in: flashcardIds } },
    })
    const progressMap = new Map(userProgressRows.map((p) => [p.flashcardId, p]))

    const mergedCards = flashcards.map((card) => {
      const progress = progressMap.get(card.id)
      return {
        id: card.id, question: card.question, answer: card.answer,
        questionImageId: card.questionImageId, answerImageId: card.answerImageId,
        tags: card.tags,
        deck: card.deck,
        state:          (progress?.state          ?? 'NEW') as import('@/lib/srs').FlashcardState,
        interval:        progress?.interval        ?? 0,
        easeFactor:      progress?.easeFactor      ?? 2.5,
        repetition:      progress?.repetition      ?? 0,
        stepIndex:       progress?.stepIndex       ?? 0,
        nextReviewAt:    progress?.nextReviewAt    ?? null,
        lastReviewedAt:  progress?.lastReviewedAt  ?? null,
        lastResult:      progress?.lastResult      ?? null,
      }
    })

    const now = new Date()

    /**
     * Sort cards by (SRS urgency + weak-tag bonus) descending.
     * SRS identifies WHICH cards are due; this only re-orders within that set.
     */
    type CardShape = import('@/lib/srs').SRSCardData & {
      tags?: Array<{ slug?: string | null; name?: string | null }>
    }
    function sortWithWeakBonus<T extends CardShape>(cards: T[]): T[] {
      const hasWeak = (c: T) =>
        (c.tags ?? []).some(
          (tag) =>
            weakTagSet.has((tag.slug ?? '').toLowerCase().trim()) ||
            weakTagSet.has((tag.name ?? '').toLowerCase().trim()),
        )
      return [...cards].sort((a, b) => {
        const scoreA = getCardUrgency(a, now) + (hasWeak(a) ? WEAK_TAG_BONUS : 0)
        const scoreB = getCardUrgency(b, now) + (hasWeak(b) ? WEAK_TAG_BONUS : 0)
        return scoreB - scoreA
      })
    }

    if (mode === 'free') {
      // Filtered free learn (tag / subject / deck): same ordering as unfiltered free mode.
      const sorted = sortWithWeakBonus(mergedCards)
      return NextResponse.json({ cards: sorted, mode, total: sorted.length })
    }

    // -- SRS mode filtering ----------------------------------------------------

    const dueCards = mergedCards.filter((c) => isCardDue(c, now))

    const newCards    = dueCards.filter((c) => c.state === 'NEW')
    const activeCards = dueCards.filter((c) => c.state !== 'NEW')

    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    const flashcardScope: Record<string, unknown> = {}
    if (tagSlug) {
      flashcardScope.tags = { some: { slug: tagSlug } }
    } else if (subjectTagSlugs && subjectTagSlugs.length > 0) {
      flashcardScope.tags = { some: { slug: { in: subjectTagSlugs } } }
    }
    if (deckSlugQ) {
      flashcardScope.deck = { slug: deckSlugQ }
    }

    const newReviewedToday = await prisma.userFlashcardProgress.count({
      where: {
        userId: user.id,
        state: { not: 'NEW' },
        lastReviewedAt: { gte: startOfToday },
        ...(Object.keys(flashcardScope).length > 0 ? { flashcard: flashcardScope } : {}),
      },
    })

    const newBudget    = Math.max(0, settings.newCardsPerDay - newReviewedToday)
    const reviewBudget = settings.maxReviews
    const cappedNew    = newCards.slice(0, newBudget)
    const cappedActive = activeCards.slice(0, reviewBudget)

    // Sort the final eligible set by urgency + weak-tag bonus
    const combined = sortWithWeakBonus([...cappedActive, ...cappedNew])

    return NextResponse.json({
      cards: combined, mode, total: combined.length,
      newCount: cappedNew.length, reviewCount: cappedActive.length,
    })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[GET /api/flashcards/study]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}