import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { getOwnedCreativeSpace, logCreativeActivity } from '@/lib/creative-space'

const createDeckSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().nullable(),
})

type Context = { params: Promise<{ id: string }> }

export async function GET(_req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id } = await ctx.params
    const space = await getOwnedCreativeSpace(user.id, id)
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const decks = await prisma.creativeFlashcardDeck.findMany({
      where: { spaceId: id, userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { flashcards: true } } },
    })
    return NextResponse.json({ decks })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[GET /api/creative-spaces/[id]/decks]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id } = await ctx.params
    const space = await getOwnedCreativeSpace(user.id, id)
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const parsed = createDeckSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const deck = await prisma.creativeFlashcardDeck.create({
      data: {
        spaceId: id,
        userId: user.id,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
      },
    })
    await prisma.creativeSpace.update({
      where: { id },
      data: { lastEditedAt: new Date() },
    })
    await logCreativeActivity({
      userId: user.id,
      spaceId: id,
      eventType: 'DECK_CREATED',
      metadata: { deckId: deck.id, name: deck.name },
    })

    return NextResponse.json({ deck }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[POST /api/creative-spaces/[id]/decks]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
