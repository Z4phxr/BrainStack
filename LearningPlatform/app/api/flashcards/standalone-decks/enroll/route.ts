import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'

const bodySchema = z.object({
  deckSlug: z.string().min(1, 'deckSlug is required'),
})

/** POST /api/flashcards/standalone-decks/enroll — add a standalone main deck to the student library. */
export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const json = await req.json().catch(() => null)
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const slug = parsed.data.deckSlug.trim()
    const main = await prisma.flashcardDeck.findFirst({
      where: { slug, courseId: null, parentDeckId: null },
      select: { id: true },
    })
    if (!main) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    try {
      await prisma.userStandaloneFlashcardDeck.upsert({
        where: { userId_deckId: { userId: user.id, deckId: main.id } },
        create: { userId: user.id, deckId: main.id },
        update: {},
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && (e.code === 'P2021' || e.code === 'P2010')) {
        return NextResponse.json(
          { error: 'Database migrations may be pending (standalone enrollments table).' },
          { status: 503 },
        )
      }
      throw e
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[POST /api/flashcards/standalone-decks/enroll]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
