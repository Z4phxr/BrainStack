import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

const CREATIVE_DECK_TAG_SLUG = 'creative-user-generated'

type SystemDeck = {
  id: string
  slug: string
  name: string
  description: string | null
  courseId: string | null
  parentDeckId: string | null
  _count: { flashcards: number; childDecks: number }
  tags: { slug: string }[]
}

export async function GET() {
  try {
    const user = await requireAuth()

    const [enrolledStandaloneRows, startedCourseRows] = await Promise.all([
      prisma.userStandaloneFlashcardDeck.findMany({
        where: { userId: user.id },
        select: { deckId: true },
      }),
      prisma.courseProgress.findMany({
        where: { userId: user.id },
        select: { courseId: true },
      }),
    ])

    const enrolledStandaloneIds = [...new Set(enrolledStandaloneRows.map((row) => row.deckId))]
    const startedCourseIds = [...new Set(startedCourseRows.map((row) => row.courseId))]

    let systemMainDecks: SystemDeck[] = []
    if (enrolledStandaloneIds.length > 0 || startedCourseIds.length > 0) {
      systemMainDecks = await prisma.flashcardDeck.findMany({
        where: {
          parentDeckId: null,
          OR: [
            { id: { in: enrolledStandaloneIds }, courseId: null },
            { courseId: { in: startedCourseIds } },
          ],
        },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          courseId: true,
          parentDeckId: true,
          tags: { select: { slug: true } },
          _count: { select: { flashcards: true, childDecks: true } },
        },
      })
    }

    const courseIds = [...new Set(systemMainDecks.map((deck) => deck.courseId).filter((id): id is string => Boolean(id)))]
    let courseMetaById = new Map<string, { title: string; slug: string }>()
    if (courseIds.length > 0) {
      const courseRows = await prisma.$queryRaw<Array<{ id: string; title: string; slug: string }>>`
        SELECT c.id::text AS id, c.title::text AS title, c.slug::text AS slug
        FROM payload.courses c
        WHERE c.id::text = ANY(${courseIds})
          AND COALESCE(c.is_published, false) = true
      `
      courseMetaById = new Map(courseRows.map((row) => [row.id, { title: row.title, slug: row.slug }]))
    }

    const split = systemMainDecks
      .filter((deck) => (deck.courseId ? courseMetaById.has(deck.courseId) : true))
      .map((deck) => {
        const isCreativeTagged = deck.tags.some((tag) => tag.slug === CREATIVE_DECK_TAG_SLUG)
        return {
          id: deck.id,
          slug: deck.slug,
          name: deck.name,
          description: deck.description,
          isCreativeTagged,
          kind: deck.courseId ? ('course' as const) : ('standalone' as const),
          cardCount: deck._count.flashcards,
          childDeckCount: deck._count.childDecks,
          course: deck.courseId ? courseMetaById.get(deck.courseId)! : null,
        }
      })

    const creativeDecks = split
      .filter((deck) => deck.kind === 'standalone' && deck.isCreativeTagged)
      .map((deck) => ({
        id: deck.id,
        slug: deck.slug,
        name: deck.name,
        description: deck.description,
        cardCount: deck.cardCount,
      }))

    const systemDecks = split
      .filter((deck) => !(deck.kind === 'standalone' && deck.isCreativeTagged))
      .map((deck) => ({
        id: deck.id,
        slug: deck.slug,
        name: deck.name,
        description: deck.description,
        kind: deck.kind,
        cardCount: deck.cardCount,
        childDeckCount: deck.childDeckCount,
        course: deck.course,
      }))

    return NextResponse.json({
      creativeDecks,
      systemDecks,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[GET /api/creative-decks/select-options]', error)
    return NextResponse.json({ error: 'Failed to load deck options' }, { status: 500 })
  }
}
