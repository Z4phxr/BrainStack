import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'

const unarchiveBodySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('course'),
    courseId: z.string().min(1, 'courseId is required'),
  }),
  z.object({
    type: z.literal('deck'),
    deckId: z.string().min(1, 'deckId is required'),
  }),
])

/** POST /api/profile/unarchive — unarchive a course or deck for the current user. */
export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const payload = await req.json().catch(() => null)
    const parsed = unarchiveBodySchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    if (parsed.data.type === 'course') {
      await prisma.courseProgress.updateMany({
        where: { userId: user.id, courseId: parsed.data.courseId },
        data: { archivedAt: null },
      })
      return NextResponse.json({ ok: true })
    }

    await prisma.userStandaloneFlashcardDeck.updateMany({
      where: { userId: user.id, deckId: parsed.data.deckId },
      data: { archivedAt: null },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[POST /api/profile/unarchive]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
