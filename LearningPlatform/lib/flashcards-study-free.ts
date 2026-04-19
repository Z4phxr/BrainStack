import { prisma } from '@/lib/prisma'
import { getUserWeakTags } from '@/lib/analytics'
import { getCardUrgency } from '@/lib/srs'
import type { FlashcardState } from '@/lib/srs'

/** Score bonus awarded when a due card matches at least one of the user's weak tags. */
const WEAK_TAG_BONUS = 0.5

export type MergedStudyCard = {
  id: string
  question: string
  answer: string
  questionImageId: string | null
  answerImageId: string | null
  tags: Array<{ id: string; name: string; slug: string }>
  deck: { id: string; name: string; slug: string } | null
  state: FlashcardState
  interval: number
  easeFactor: number
  repetition: number
  stepIndex: number
  nextReviewAt: Date | null
  lastReviewedAt: Date | null
  lastResult: string | null
}

type CardShape = import('@/lib/srs').SRSCardData & {
  tags?: Array<{ slug?: string | null; name?: string | null }>
}

function sortWithWeakBonus<T extends CardShape>(cards: T[], weakTagSet: Set<string>, now: Date): T[] {
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

/**
 * All flashcards merged with per-user SRS progress, sorted like GET /api/flashcards/study?mode=free.
 * Used by the API route and the student dashboard server render (no client waterfall).
 */
export async function getSortedFreeStudyCardsForUser(userId: string): Promise<MergedStudyCard[]> {
  const weakTagsPromise = getUserWeakTags(userId).catch(() => [])

  await prisma.flashcardSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  })

  const weakTags = await weakTagsPromise
  const weakTagSet = new Set(weakTags.map((t) => t.tag.toLowerCase().trim()))

  const flashcards = await prisma.flashcard.findMany({
    include: {
      tags: { select: { id: true, name: true, slug: true } },
      deck: { select: { id: true, name: true, slug: true } },
    },
  })

  const flashcardIds = flashcards.map((c) => c.id)
  const userProgressRows = await prisma.userFlashcardProgress.findMany({
    where: { userId, flashcardId: { in: flashcardIds } },
  })
  const progressMap = new Map(userProgressRows.map((p) => [p.flashcardId, p]))

  const mergedCards: MergedStudyCard[] = flashcards.map((card) => {
    const progress = progressMap.get(card.id)
    return {
      id: card.id,
      question: card.question,
      answer: card.answer,
      questionImageId: card.questionImageId,
      answerImageId: card.answerImageId,
      tags: card.tags,
      deck: card.deck,
      state: (progress?.state ?? 'NEW') as FlashcardState,
      interval: progress?.interval ?? 0,
      easeFactor: progress?.easeFactor ?? 2.5,
      repetition: progress?.repetition ?? 0,
      stepIndex: progress?.stepIndex ?? 0,
      nextReviewAt: progress?.nextReviewAt ?? null,
      lastReviewedAt: progress?.lastReviewedAt ?? null,
      lastResult: progress?.lastResult ?? null,
    }
  })

  const now = new Date()
  return sortWithWeakBonus(mergedCards, weakTagSet, now)
}

/** JSON-safe card row for server components and client props (ISO date strings). */
export type FlashcardDashboardCardJson = Omit<MergedStudyCard, 'nextReviewAt' | 'lastReviewedAt'> & {
  nextReviewAt: string | null
  lastReviewedAt: string | null
}

export function serializeMergedCardsForDashboard(cards: MergedStudyCard[]): FlashcardDashboardCardJson[] {
  return cards.map((c) => ({
    ...c,
    nextReviewAt: c.nextReviewAt?.toISOString() ?? null,
    lastReviewedAt: c.lastReviewedAt?.toISOString() ?? null,
  }))
}
