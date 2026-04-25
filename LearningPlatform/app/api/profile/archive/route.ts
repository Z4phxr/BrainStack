import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'

const archiveBodySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('course'),
    courseSlug: z.string().min(1, 'courseSlug is required'),
    archiveLinkedDeck: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('deck'),
    deckId: z.string().min(1, 'deckId is required'),
    archiveLinkedCourse: z.boolean().optional(),
  }),
])

/** POST /api/profile/archive — archive a course or main deck for the current user. */
export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const payload = await req.json().catch(() => null)
    const parsed = archiveBodySchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const now = new Date()
    if (parsed.data.type === 'course') {
      const courseSlug = parsed.data.courseSlug.trim()
      const courseRows = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT c.id::text AS id
        FROM payload.courses c
        WHERE c.slug = ${courseSlug}
          AND c.is_published = TRUE
        LIMIT 1
      `
      if (courseRows.length === 0) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }
      const courseId = courseRows[0].id

      await prisma.courseProgress.upsert({
        where: { userId_courseId: { userId: user.id, courseId } },
        create: { userId: user.id, courseId, archivedAt: now },
        update: { archivedAt: now, lastActivityAt: now },
      })

      if (parsed.data.archiveLinkedDeck) {
        const deck = await prisma.flashcardDeck.findFirst({
          where: { courseId, parentDeckId: null },
          select: { id: true },
        })
        if (deck) {
          await prisma.userStandaloneFlashcardDeck.upsert({
            where: { userId_deckId: { userId: user.id, deckId: deck.id } },
            create: { userId: user.id, deckId: deck.id, archivedAt: now },
            update: { archivedAt: now },
          })
        }
      }
      return NextResponse.json({ ok: true })
    }

    const deck = await prisma.flashcardDeck.findUnique({
      where: { id: parsed.data.deckId },
      select: { id: true, courseId: true, parentDeckId: true },
    })
    if (!deck || deck.parentDeckId) {
      return NextResponse.json({ error: 'Main deck not found' }, { status: 404 })
    }

    await prisma.userStandaloneFlashcardDeck.upsert({
      where: { userId_deckId: { userId: user.id, deckId: deck.id } },
      create: { userId: user.id, deckId: deck.id, archivedAt: now },
      update: { archivedAt: now },
    })

    if (parsed.data.archiveLinkedCourse && deck.courseId) {
      await prisma.courseProgress.upsert({
        where: { userId_courseId: { userId: user.id, courseId: deck.courseId } },
        create: { userId: user.id, courseId: deck.courseId, archivedAt: now },
        update: { archivedAt: now, lastActivityAt: now },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[POST /api/profile/archive]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
