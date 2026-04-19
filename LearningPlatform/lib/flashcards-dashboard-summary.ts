import type { FlashcardState } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type FlashcardDashboardAllStats = {
  total: number
  newCards: number
  due: number
}

export type FlashcardDashboardDeckRow = FlashcardDashboardAllStats & {
  deck: { id: string; name: string; slug: string }
}

export type FlashcardDashboardSummary = {
  all: FlashcardDashboardAllStats
  decks: FlashcardDashboardDeckRow[]
}

function bumpCard(
  agg: FlashcardDashboardAllStats,
  state: FlashcardState,
  nextReviewAt: Date | null,
  now: Date,
) {
  agg.total += 1
  if (state === 'NEW') {
    agg.newCards += 1
    return
  }
  if (nextReviewAt && nextReviewAt <= now) {
    agg.due += 1
  }
}

/**
 * Deck-level and global counts for the student dashboard strip only (no card bodies).
 * Matches the dashboard `computeStats` rules: NEW counts as new; due only when not NEW and nextReviewAt <= now.
 */
export async function getFlashcardDashboardSummary(userId: string): Promise<FlashcardDashboardSummary> {
  const rows = await prisma.flashcard.findMany({
    select: {
      deck: { select: { id: true, name: true, slug: true } },
      userProgress: {
        where: { userId },
        select: { state: true, nextReviewAt: true },
      },
    },
  })

  const now = new Date()
  const all: FlashcardDashboardAllStats = { total: 0, newCards: 0, due: 0 }
  const bySlug = new Map<string, FlashcardDashboardDeckRow>()

  for (const r of rows) {
    const prog = r.userProgress[0]
    const state = (prog?.state ?? 'NEW') as FlashcardState
    const next = prog?.nextReviewAt ?? null

    bumpCard(all, state, next, now)

    const d = r.deck
    let row = bySlug.get(d.slug)
    if (!row) {
      row = { deck: { id: d.id, name: d.name, slug: d.slug }, total: 0, newCards: 0, due: 0 }
      bySlug.set(d.slug, row)
    }
    bumpCard(row, state, next, now)
  }

  const decks = Array.from(bySlug.values())
    .filter((x) => x.total > 0)
    .sort((a, b) => a.deck.name.localeCompare(b.deck.name))

  return { all, decks }
}
