import type { FlashcardState } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { subjectNamesByIds } from '@/lib/payload-subject-names'

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
  source: 'course' | 'standalone'
  course: { id: string; slug: string; title: string } | null
  deck: {
    id: string
    name: string
    slug: string
    description?: string | null
    /** CMS subject (Payload `subjects`); preferred for standalone decks. */
    subject?: { id: string; name: string } | null
    /** Legacy deck tags when no `subject` is set. */
    tags?: { name: string }[]
  }
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

/** All deck ids under the given root main ids (includes roots). */
async function collectDescendantDeckIds(rootIds: string[]): Promise<Set<string>> {
  const out = new Set(rootIds)
  let layer = [...rootIds]
  for (let depth = 0; depth < 24 && layer.length > 0; depth++) {
    const kids = await prisma.flashcardDeck.findMany({
      where: { parentDeckId: { in: layer } },
      select: { id: true },
    })
    const next: string[] = []
    for (const k of kids) {
      if (!out.has(k.id)) {
        out.add(k.id)
        next.push(k.id)
      }
    }
    layer = next
  }
  return out
}

type SummaryOptions = {
  courseSlug?: string
  standaloneDeckSlug?: string
}

export async function getFlashcardDashboardSummary(
  userId: string,
  options: SummaryOptions = {},
): Promise<FlashcardDashboardSummary> {
  const now = new Date()
  const all: FlashcardDashboardStats = { total: 0, newCards: 0, due: 0 }
  const byDeckId = new Map<string, FlashcardDashboardStats>()

  const startedRows = await prisma.courseProgress.findMany({
    where: { userId, archivedAt: null },
    select: { courseId: true },
  })
  /** Table may be missing until migrations are applied — keep course summaries working. */
  let enrollRows: { deckId: string }[] = []
  let deckArchiveRows: Array<{ deckId: string; archivedAt: Date | null }> = []
  try {
    deckArchiveRows = await prisma.userStandaloneFlashcardDeck.findMany({
      where: { userId },
      select: { deckId: true, archivedAt: true },
    })
    enrollRows = await prisma.userStandaloneFlashcardDeck.findMany({
      where: { userId, archivedAt: null },
      select: { deckId: true },
    })
  } catch (err) {
    console.warn('[getFlashcardDashboardSummary] standalone enrollments skipped', err)
  }

  const startedCourseIds = [...new Set(startedRows.map((x) => x.courseId))]
  const enrolledMainDeckIds = [...new Set(enrollRows.map((e) => e.deckId))]
  const archivedDeckIdSet = new Set(deckArchiveRows.filter((r) => r.archivedAt != null).map((r) => r.deckId))

  const courseRows =
    startedCourseIds.length > 0
      ? await prisma.$queryRaw<Array<{ id: string; slug: string; title: string }>>`
          SELECT c.id::text AS id, c.slug, c.title
          FROM payload.courses c
          WHERE c.id::text = ANY(${startedCourseIds})
            AND c.is_published = TRUE
        `
      : []
  const publishedById = new Map(courseRows.map((x) => [x.id, x]))
  const publishedStartedIds = startedCourseIds.filter((id) => publishedById.has(id))

  let filteredCourseIds = publishedStartedIds
  if (options.courseSlug) {
    const match = courseRows.find((x) => x.slug === options.courseSlug)
    filteredCourseIds = match ? [match.id] : []
  }

  let enrolledMains: Array<{
    id: string
    name: string
    slug: string
    description: string | null
    subjectId: string | null
    tags: { name: string }[]
  }> = []
  if (enrolledMainDeckIds.length > 0) {
    try {
      enrolledMains = await prisma.flashcardDeck.findMany({
        where: {
          id: { in: enrolledMainDeckIds },
          courseId: null,
          parentDeckId: null,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          subjectId: true,
          tags: { select: { name: true } },
        },
      })
    } catch (err) {
      console.warn('[getFlashcardDashboardSummary] enrolled standalone mains query failed', err)
      enrolledMains = []
    }
  }

  const standaloneSubjectIds = enrolledMains.map((m) => m.subjectId).filter((x): x is string => Boolean(x))
  const standaloneSubjectNameById =
    standaloneSubjectIds.length > 0 ? await subjectNamesByIds(standaloneSubjectIds) : new Map<string, string>()

  let standaloneRootIds = enrolledMains.map((d) => d.id)
  if (options.standaloneDeckSlug) {
    const m = enrolledMains.find((d) => d.slug === options.standaloneDeckSlug)
    standaloneRootIds = m ? [m.id] : []
  }

  const standaloneSubtreeIds =
    standaloneRootIds.length > 0 ? await collectDescendantDeckIds(standaloneRootIds) : new Set<string>()

  const hasCourseScope = filteredCourseIds.length > 0
  const hasStandaloneScope = standaloneSubtreeIds.size > 0

  if (!hasCourseScope && !hasStandaloneScope) {
    return { all, decks: [] }
  }

  const orParts: Array<Record<string, unknown>> = []
  if (hasCourseScope) {
    orParts.push({ deck: { courseId: { in: filteredCourseIds } } })
  }
  if (hasStandaloneScope) {
    orParts.push({ deckId: { in: [...standaloneSubtreeIds] } })
  }

  const rows = await prisma.flashcard.findMany({
    where: { OR: orParts },
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

  const decks: FlashcardDashboardMainDeckRow[] = []

  // ── Course-linked main decks ─────────────────────────────────────────────
  if (hasCourseScope) {
    const allCourseDecks = await prisma.flashcardDeck.findMany({
      where: { courseId: { in: filteredCourseIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        courseId: true,
        moduleId: true,
        parentDeckId: true,
      },
    })

    const moduleIds = allCourseDecks.map((d) => d.moduleId).filter((x): x is string => Boolean(x))
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
    for (const deck of allCourseDecks) {
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

    const mainCourseDecks = allCourseDecks.filter((deck) => !deck.parentDeckId && !archivedDeckIdSet.has(deck.id))
    for (const mainDeck of mainCourseDecks) {
      const courseId = mainDeck.courseId ?? ''
      const course = publishedById.get(courseId)
      if (!course) continue

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
      decks.push({
        source: 'course',
        course: { id: course.id, slug: course.slug, title: course.title },
        deck: {
          id: mainDeck.id,
          name: mainDeck.name,
          slug: mainDeck.slug,
          description: mainDeck.description ?? null,
        },
        stats,
        subdecks,
      })
    }
  }

  // ── Standalone enrolled main decks ───────────────────────────────────────
  if (hasStandaloneScope && standaloneRootIds.length > 0) {
    const standaloneDeckRows = await prisma.flashcardDeck.findMany({
      where: { id: { in: [...standaloneSubtreeIds] } },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        courseId: true,
        moduleId: true,
        parentDeckId: true,
      },
    })

    const childByParentId = new Map<string, FlashcardDashboardSubdeckRow[]>()
    for (const deck of standaloneDeckRows) {
      if (!deck.parentDeckId) continue
      const stats = byDeckId.get(deck.id) ?? { total: 0, newCards: 0, due: 0 }
      const list = childByParentId.get(deck.parentDeckId) ?? []
      list.push({
        deck: {
          id: deck.id,
          name: deck.name,
          slug: deck.slug,
          moduleId: deck.moduleId,
          moduleTitle: null,
        },
        stats,
      })
      childByParentId.set(deck.parentDeckId, list)
    }

    const mainMetaById = new Map(enrolledMains.map((m) => [m.id, m]))
    for (const rootId of standaloneRootIds) {
      const meta = mainMetaById.get(rootId)
      if (!meta) continue

      const ownStats = byDeckId.get(rootId) ?? { total: 0, newCards: 0, due: 0 }
      const subdecks = (childByParentId.get(rootId) ?? []).sort((a, b) =>
        a.deck.name.localeCompare(b.deck.name),
      )
      const stats = { ...ownStats }
      for (const subdeck of subdecks) {
        stats.total += subdeck.stats.total
        stats.newCards += subdeck.stats.newCards
        stats.due += subdeck.stats.due
      }
      const subjId = meta.subjectId
      const subjectName = subjId ? (standaloneSubjectNameById.get(subjId) ?? '') : ''
      const subject =
        subjId && subjectName ? { id: subjId, name: subjectName } : subjId ? { id: subjId, name: 'Subject' } : null
      decks.push({
        source: 'standalone',
        course: null,
        deck: {
          id: meta.id,
          name: meta.name,
          slug: meta.slug,
          description: meta.description ?? null,
          subject,
          tags: !subjId && meta.tags?.length ? meta.tags : undefined,
        },
        stats,
        subdecks,
      })
    }
  }

  decks.sort((a, b) => {
    const ta = a.source === 'course' ? a.course!.title : a.deck.name
    const tb = b.source === 'course' ? b.course!.title : b.deck.name
    return ta.localeCompare(tb)
  })

  return { all, decks }
}
