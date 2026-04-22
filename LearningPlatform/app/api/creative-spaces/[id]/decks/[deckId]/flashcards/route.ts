import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { getOwnedCreativeSpace, logCreativeActivity } from '@/lib/creative-space'

const createFlashcardSchema = z.object({
  front: z.string().trim().min(1).max(500),
  back: z.string().trim().min(1).max(1500),
  hint: z.string().trim().max(500).optional().nullable(),
  tag: z.string().trim().max(64).optional().nullable(),
})

type Context = { params: Promise<{ id: string; deckId: string }> }

export async function GET(_req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id, deckId } = await ctx.params
    const space = await getOwnedCreativeSpace(user.id, id)
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const deck = await prisma.creativeFlashcardDeck.findFirst({
      where: { id: deckId, spaceId: id, userId: user.id },
      select: { id: true },
    })
    if (!deck) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const flashcards = await prisma.creativeFlashcard.findMany({
      where: { deckId, spaceId: id, userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ flashcards })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[GET /api/creative-spaces/[id]/decks/[deckId]/flashcards]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id, deckId } = await ctx.params
    const space = await getOwnedCreativeSpace(user.id, id)
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const deck = await prisma.creativeFlashcardDeck.findFirst({
      where: { id: deckId, spaceId: id, userId: user.id },
      select: { id: true },
    })
    if (!deck) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const parsed = createFlashcardSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const flashcard = await prisma.creativeFlashcard.create({
      data: {
        deckId,
        spaceId: id,
        userId: user.id,
        front: parsed.data.front,
        back: parsed.data.back,
        hint: parsed.data.hint ?? null,
        tag: parsed.data.tag ?? null,
      },
    })
    await prisma.creativeSpace.update({
      where: { id },
      data: { lastEditedAt: new Date() },
    })
    await logCreativeActivity({
      userId: user.id,
      spaceId: id,
      eventType: 'FLASHCARD_CREATED',
      metadata: { deckId, flashcardId: flashcard.id },
    })

    return NextResponse.json({ flashcard }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[POST /api/creative-spaces/[id]/decks/[deckId]/flashcards]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
