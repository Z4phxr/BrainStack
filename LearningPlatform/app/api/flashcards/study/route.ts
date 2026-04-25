import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { toSlug } from '@/lib/utils'
import { requireAuth } from '@/lib/auth-helpers'
import { isCardDue, parseSettings, getCardUrgency } from '@/lib/srs'
import { getUserWeakTags } from '@/lib/analytics'
import { getSortedFreeStudyCardsForUser } from '@/lib/flashcards-study-free'
import { assertUserCanStudyDeckScope } from '@/lib/flashcards-study-access'
import { attachResolvedMediaUrls } from '@/lib/flashcard-media-urls'

/**
 * GET /api/flashcards/study
 *
 * Returns the set of flashcards to study in the current session, using the
 * *per-user* SRS state from UserFlashcardProgress (not global Flashcard fields).
 *
 * Query parameters:
 *   mode     = "srs" | "free"   (default: "srs")
 *   tagSlug   = <slug>          (optional  filters to a single tag)
 *   deckSlug   = <slug>         (optional, legacy alias)
 *   subdeckSlug = <slug>        (optional, limits to one module subdeck)
 *   mainDeckSlug = <slug>       (optional, includes main deck + all children)
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
    const subdeckSlugQ = searchParams.get('subdeckSlug')?.trim() || undefined
    const mainDeckSlugQ = searchParams.get('mainDeckSlug')?.trim() || undefined
    const deckFilterSlug = subdeckSlugQ ?? deckSlugQ

    if (deckFilterSlug && mainDeckSlugQ) {
      return NextResponse.json(
        { error: 'Validation failed', issues: { deck: ['Use either subdeckSlug/deckSlug or mainDeckSlug, not both'] } },
        { status: 400 },
      )
    }

    if (mode === 'free' && !tagSlug && !subject && !deckFilterSlug && !mainDeckSlugQ) {
      const sorted = await getSortedFreeStudyCardsForUser(user.id)
      const cards = await attachResolvedMediaUrls(sorted)
      return NextResponse.json({ cards, mode, total: cards.length })
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

    if (deckFilterSlug) {
      const deckPart = { deck: { slug: deckFilterSlug } }
      whereFilter = whereFilter ? { AND: [whereFilter, deckPart] } : deckPart
    } else if (mainDeckSlugQ) {
      const mainDeckPart = { OR: [{ deck: { slug: mainDeckSlugQ } }, { deck: { parentDeck: { slug: mainDeckSlugQ } } }] }
      whereFilter = whereFilter ? { AND: [whereFilter, mainDeckPart] } : mainDeckPart
    }

    let validatedMainDeckId: string | null = null
    if (mainDeckSlugQ && !deckFilterSlug) {
      // Ensure main deck exists and is not itself a subdeck, otherwise we might silently return unrelated data.
      const mainDeck = await prisma.flashcardDeck.findUnique({
        where: { slug: mainDeckSlugQ },
        select: { id: true, parentDeckId: true },
      })
      if (!mainDeck || mainDeck.parentDeckId) {
        return NextResponse.json(
          { error: 'Validation failed', issues: { mainDeckSlug: ['Main deck not found'] } },
          { status: 400 },
        )
      }
      validatedMainDeckId = mainDeck.id
    }

    if (deckFilterSlug || mainDeckSlugQ) {
      const access = await assertUserCanStudyDeckScope(user.id, {
        mainDeckSlug: mainDeckSlugQ ?? undefined,
        subdeckSlug: deckFilterSlug,
      })
      if (!access.ok) {
        return NextResponse.json(
          { error: 'Forbidden', issues: { deck: [access.message] } },
          { status: 403 },
        )
      }

      // Auto-unarchive when the user starts studying this deck scope again.
      let rootDeck: { id: string; courseId: string | null } | null = null
      if (validatedMainDeckId) {
        rootDeck = await prisma.flashcardDeck.findUnique({
          where: { id: validatedMainDeckId },
          select: { id: true, courseId: true },
        })
      } else if (deckFilterSlug) {
        const deck = await prisma.flashcardDeck.findUnique({
          where: { slug: deckFilterSlug },
          select: { id: true, parentDeckId: true, courseId: true },
        })
        if (deck) {
          if (deck.parentDeckId) {
            rootDeck = await prisma.flashcardDeck.findUnique({
              where: { id: deck.parentDeckId },
              select: { id: true, courseId: true },
            })
          } else {
            rootDeck = { id: deck.id, courseId: deck.courseId }
          }
        }
      }

      if (rootDeck) {
        if (typeof prisma.userStandaloneFlashcardDeck?.updateMany === 'function') {
          await prisma.userStandaloneFlashcardDeck.updateMany({
            where: {
              userId: user.id,
              deckId: rootDeck.id,
              archivedAt: { not: null },
            },
            data: { archivedAt: null },
          })
        }
        if (rootDeck.courseId) {
          if (typeof prisma.courseProgress?.updateMany === 'function') {
            await prisma.courseProgress.updateMany({
              where: {
                userId: user.id,
                courseId: rootDeck.courseId,
                archivedAt: { not: null },
              },
              data: { archivedAt: null },
            })
          }
        }
      }
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
      const cards = await attachResolvedMediaUrls(sorted)
      return NextResponse.json({ cards, mode, total: cards.length })
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
    if (deckFilterSlug) {
      flashcardScope.deck = { slug: deckFilterSlug }
    } else if (mainDeckSlugQ) {
      flashcardScope.OR = [{ deck: { slug: mainDeckSlugQ } }, { deck: { parentDeck: { slug: mainDeckSlugQ } } }]
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
    const cards = await attachResolvedMediaUrls(combined)

    return NextResponse.json({
      cards,
      mode,
      total: cards.length,
      newCount: cappedNew.length,
      reviewCount: cappedActive.length,
    })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[GET /api/flashcards/study]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}