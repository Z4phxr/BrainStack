import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { subjectNamesByIds } from '@/lib/payload-subject-names'

const deckBrowseInclude = {
  tags: { select: { id: true, name: true, slug: true } },
  childDecks: {
    select: {
      _count: { select: { flashcards: true } },
    },
  },
  _count: { select: { flashcards: true } },
} as const

/** GET /api/flashcards/standalone-decks — browse catalog: standalone + published course main decks. */
export async function GET() {
  try {
    const user = await requireAuth()

    const [standaloneMains, courseMains] = await Promise.all([
      prisma.flashcardDeck.findMany({
        where: { courseId: null, parentDeckId: null },
        orderBy: { name: 'asc' },
        include: deckBrowseInclude,
      }),
      prisma.flashcardDeck.findMany({
        where: { courseId: { not: null }, parentDeckId: null },
        orderBy: { name: 'asc' },
        include: deckBrowseInclude,
      }),
    ])

    const courseIds = [...new Set(courseMains.map((d) => d.courseId).filter((x): x is string => Boolean(x)))]
    let publishedCourseById = new Map<string, { title: string; slug: string; subjectId: string | null }>()
    if (courseIds.length > 0) {
      type CourseRow = { id: string; title: string; slug: string; subjectId: string | null }
      let rows: CourseRow[] = []
      try {
        rows = await prisma.$queryRaw<CourseRow[]>`
          SELECT
            c.id::text AS id,
            c.title::text AS title,
            c.slug::text AS slug,
            NULLIF(trim(c.subject_id::text), '') AS "subjectId"
          FROM payload.courses c
          WHERE c.id::text = ANY(${courseIds})
            AND COALESCE(c.is_published, false) = true
        `
      } catch {
        rows = await prisma.$queryRaw<CourseRow[]>`
          SELECT
            c.id::text AS id,
            c.title::text AS title,
            c.slug::text AS slug,
            NULLIF(trim(c.subject::text), '') AS "subjectId"
          FROM payload.courses c
          WHERE c.id::text = ANY(${courseIds})
            AND COALESCE(c.is_published, false) = true
        `
      }
      publishedCourseById = new Map(
        rows.map((r) => [r.id, { title: r.title ?? '', slug: r.slug ?? '', subjectId: r.subjectId }]),
      )
    }

    const visibleCourseMains = courseMains.filter((d) => d.courseId && publishedCourseById.has(d.courseId))

    let enrolledStandalone = new Set<string>()
    try {
      const enrolledRows = await prisma.userStandaloneFlashcardDeck.findMany({
        where: { userId: user.id },
        select: { deckId: true },
      })
      enrolledStandalone = new Set(enrolledRows.map((e) => e.deckId))
    } catch (err) {
      console.warn('[GET /api/flashcards/standalone-decks] enrollments unavailable', err)
    }

    let enrolledCourseIds = new Set<string>()
    try {
      const prog = await prisma.courseProgress.findMany({
        where: { userId: user.id },
        select: { courseId: true },
      })
      enrolledCourseIds = new Set(prog.map((p) => p.courseId))
    } catch (err) {
      console.warn('[GET /api/flashcards/standalone-decks] course progress unavailable', err)
    }

    const allDecks = [...standaloneMains, ...visibleCourseMains]
    const deckSubjectIds = allDecks.map((d) => d.subjectId).filter((x): x is string => Boolean(x))
    const courseSubjectIds = [...publishedCourseById.values()]
      .map((m) => m.subjectId)
      .filter((x): x is string => Boolean(x))
    const subjectIds = [...new Set([...deckSubjectIds, ...courseSubjectIds])]
    const subjectNameById = subjectIds.length > 0 ? await subjectNamesByIds(subjectIds) : new Map<string, string>()

    const decks = allDecks.map((d) => {
      const subCards = d.childDecks.reduce((sum, c) => sum + c._count.flashcards, 0)
      const count = d._count.flashcards + subCards
      const sid = d.subjectId
      const subjectFromDeck =
        sid && (subjectNameById.get(sid) ?? '')
          ? { id: sid, name: subjectNameById.get(sid)! }
          : sid
            ? { id: sid, name: 'Subject' }
            : null

      const isStandalone = d.courseId == null || String(d.courseId).trim() === ''
      if (isStandalone) {
        return {
          id: d.id,
          slug: d.slug,
          name: d.name,
          description: d.description,
          kind: 'standalone' as const,
          subject: subjectFromDeck,
          tags: d.tags,
          cardCount: count,
          enrolled: enrolledStandalone.has(d.id),
          course: null as { id: string; title: string; slug: string } | null,
        }
      }

      const meta = publishedCourseById.get(d.courseId!)!
      const cid = d.courseId!
      const csid = meta.subjectId
      const subjectFromCourse =
        csid && (subjectNameById.get(csid) ?? '')
          ? { id: csid, name: subjectNameById.get(csid)! }
          : csid
            ? { id: csid, name: 'Subject' }
            : null
      const subject = subjectFromCourse ?? subjectFromDeck
      return {
        id: d.id,
        slug: d.slug,
        name: d.name,
        description: d.description,
        kind: 'course' as const,
        subject,
        tags: d.tags,
        cardCount: count,
        enrolled: enrolledCourseIds.has(cid),
        course: { id: cid, title: meta.title, slug: meta.slug },
      }
    })

    decks.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ decks })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[GET /api/flashcards/standalone-decks]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
