import type { FlashcardState } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type FlashcardDashboardStats = {
  total: number
  newCards: number
  due: number
}

export type FlashcardDashboardSubdeckRow = {
  deck: { id: string; name: string; slug: string; moduleId: string | null; moduleTitle: string | null }
  stats: FlashcardDashboardStats
}

export type FlashcardDashboardMainDeckRow = {
  course: { id: string; slug: string; title: string }
  deck: { id: string; name: string; slug: string }
  stats: FlashcardDashboardStats
  subdecks: FlashcardDashboardSubdeckRow[]
}

export type FlashcardDashboardSummary = {
  all: FlashcardDashboardStats
  decks: FlashcardDashboardMainDeckRow[]
}

function bumpCard(
  agg: FlashcardDashboardStats,
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

type SummaryOptions = {
  courseSlug?: string
}

export async function getFlashcardDashboardSummary(
  userId: string,
  options: SummaryOptions = {},
): Promise<FlashcardDashboardSummary> {
  const startedRows = await prisma.courseProgress.findMany({
    where: { userId },
    select: { courseId: true },
  })
  const startedCourseIds = [...new Set(startedRows.map((x) => x.courseId))]
  if (startedCourseIds.length === 0) {
    return { all: { total: 0, newCards: 0, due: 0 }, decks: [] }
  }

  const courseRows = await prisma.$queryRaw<Array<{ id: string; slug: string; title: string }>>`
    SELECT c.id::text AS id, c.slug, c.title
    FROM payload.courses c
    WHERE c.id::text = ANY(${startedCourseIds})
      AND c.is_published = TRUE
  `
  const publishedById = new Map(courseRows.map((x) => [x.id, x]))
  const publishedStartedIds = startedCourseIds.filter((id) => publishedById.has(id))
  if (publishedStartedIds.length === 0) {
    return { all: { total: 0, newCards: 0, due: 0 }, decks: [] }
  }

  let filteredCourseIds = publishedStartedIds
  if (options.courseSlug) {
    const match = courseRows.find((x) => x.slug === options.courseSlug)
    filteredCourseIds = match ? [match.id] : []
  }
  if (filteredCourseIds.length === 0) {
    return { all: { total: 0, newCards: 0, due: 0 }, decks: [] }
  }

  const allDecks = await prisma.flashcardDeck.findMany({
    where: { courseId: { in: filteredCourseIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      courseId: true,
      moduleId: true,
      parentDeckId: true,
    },
  })

  const rows = await prisma.flashcard.findMany({
    where: { deck: { courseId: { in: filteredCourseIds } } },
    select: {
      deck: {
        select: { id: true, name: true, slug: true, courseId: true, moduleId: true, parentDeckId: true },
      },
      userProgress: {
        where: { userId },
        select: { state: true, nextReviewAt: true },
      },
    },
  })

  const now = new Date()
  const all: FlashcardDashboardStats = { total: 0, newCards: 0, due: 0 }
  const byDeckId = new Map<string, FlashcardDashboardStats>()

  for (const r of rows) {
    const prog = r.userProgress[0]
    const state = (prog?.state ?? 'NEW') as FlashcardState
    const next = prog?.nextReviewAt ?? null

    bumpCard(all, state, next, now)

    const d = r.deck
    let agg = byDeckId.get(d.id)
    if (!agg) {
      agg = { total: 0, newCards: 0, due: 0 }
      byDeckId.set(d.id, agg)
    }
    bumpCard(agg, state, next, now)
  }

  const moduleIds = allDecks.map((d) => d.moduleId).filter((x): x is string => Boolean(x))
  let moduleTitleById = new Map<string, string>()
  if (moduleIds.length > 0) {
    const moduleRows = await prisma.$queryRaw<Array<{ id: string; title: string }>>`
      SELECT m.id::text AS id, m.title
      FROM payload.modules m
      WHERE m.id::text = ANY(${moduleIds})
    `
    moduleTitleById = new Map(moduleRows.map((x) => [x.id, x.title]))
  }

  const childByParentId = new Map<string, FlashcardDashboardSubdeckRow[]>()
  for (const deck of allDecks) {
    if (!deck.parentDeckId) continue
    const stats = byDeckId.get(deck.id) ?? { total: 0, newCards: 0, due: 0 }
    const list = childByParentId.get(deck.parentDeckId) ?? []
    list.push({
      deck: {
        id: deck.id,
        name: deck.name,
        slug: deck.slug,
        moduleId: deck.moduleId,
        moduleTitle: deck.moduleId ? (moduleTitleById.get(deck.moduleId) ?? null) : null,
      },
      stats,
    })
    childByParentId.set(deck.parentDeckId, list)
  }

  const mainDecks = allDecks.filter((deck) => !deck.parentDeckId)
  const decks: FlashcardDashboardMainDeckRow[] = mainDecks
    .map((mainDeck) => {
      const courseId = mainDeck.courseId ?? ''
      const course = publishedById.get(courseId)
      if (!course) return null

      const ownStats = byDeckId.get(mainDeck.id) ?? { total: 0, newCards: 0, due: 0 }
      const subdecks = (childByParentId.get(mainDeck.id) ?? []).sort((a, b) =>
        (a.deck.moduleTitle ?? a.deck.name).localeCompare(b.deck.moduleTitle ?? b.deck.name),
      )
      const stats = { ...ownStats }
      for (const subdeck of subdecks) {
        stats.total += subdeck.stats.total
        stats.newCards += subdeck.stats.newCards
        stats.due += subdeck.stats.due
      }
      return {
        course: { id: course.id, slug: course.slug, title: course.title },
        deck: { id: mainDeck.id, name: mainDeck.name, slug: mainDeck.slug },
        stats,
        subdecks,
      }
    })
    .filter((x): x is FlashcardDashboardMainDeckRow => Boolean(x))
    .sort((a, b) => a.course.title.localeCompare(b.course.title))

  return { all, decks }
}
