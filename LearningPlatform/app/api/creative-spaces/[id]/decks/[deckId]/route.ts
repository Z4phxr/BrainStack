import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { getOwnedCreativeSpace, logCreativeActivity } from '@/lib/creative-space'

const updateDeckSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional().nullable(),
})

type Context = { params: Promise<{ id: string; deckId: string }> }

export async function PATCH(req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id, deckId } = await ctx.params
    const space = await getOwnedCreativeSpace(user.id, id)
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const existing = await prisma.creativeFlashcardDeck.findFirst({
      where: { id: deckId, spaceId: id, userId: user.id },
      select: { id: true },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const parsed = updateDeckSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const deck = await prisma.creativeFlashcardDeck.update({
      where: { id: deckId },
      data: parsed.data,
    })
    await prisma.creativeSpace.update({
      where: { id },
      data: { lastEditedAt: new Date() },
    })
    await logCreativeActivity({
      userId: user.id,
      spaceId: id,
      eventType: 'DECK_UPDATED',
      metadata: { deckId: deck.id, name: deck.name },
    })

    return NextResponse.json({ deck })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[PATCH /api/creative-spaces/[id]/decks/[deckId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id, deckId } = await ctx.params
    const space = await getOwnedCreativeSpace(user.id, id)
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const existing = await prisma.creativeFlashcardDeck.findFirst({
      where: { id: deckId, spaceId: id, userId: user.id },
      select: { id: true },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.creativeFlashcardDeck.delete({ where: { id: deckId } })
    await prisma.creativeSpace.update({
      where: { id },
      data: { lastEditedAt: new Date() },
    })
    await logCreativeActivity({
      userId: user.id,
      spaceId: id,
      eventType: 'DECK_DELETED',
      metadata: { deckId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[DELETE /api/creative-spaces/[id]/decks/[deckId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
