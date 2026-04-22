import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { getOwnedCreativeSpace, logCreativeActivity } from '@/lib/creative-space'

const updateFlashcardSchema = z.object({
  front: z.string().trim().min(1).max(500).optional(),
  back: z.string().trim().min(1).max(1500).optional(),
  hint: z.string().trim().max(500).optional().nullable(),
  tag: z.string().trim().max(64).optional().nullable(),
})

type Context = { params: Promise<{ id: string; deckId: string; flashcardId: string }> }

export async function PATCH(req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id, deckId, flashcardId } = await ctx.params
    const space = await getOwnedCreativeSpace(user.id, id)
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const flashcard = await prisma.creativeFlashcard.findFirst({
      where: { id: flashcardId, deckId, spaceId: id, userId: user.id },
      select: { id: true },
    })
    if (!flashcard) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const parsed = updateFlashcardSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const updated = await prisma.creativeFlashcard.update({
      where: { id: flashcardId },
      data: parsed.data,
    })
    await prisma.creativeSpace.update({
      where: { id },
      data: { lastEditedAt: new Date() },
    })
    await logCreativeActivity({
      userId: user.id,
      spaceId: id,
      eventType: 'FLASHCARD_UPDATED',
      metadata: { deckId, flashcardId },
    })

    return NextResponse.json({ flashcard: updated })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[PATCH /api/creative-spaces/[id]/decks/[deckId]/flashcards/[flashcardId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id, deckId, flashcardId } = await ctx.params
    const space = await getOwnedCreativeSpace(user.id, id)
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const flashcard = await prisma.creativeFlashcard.findFirst({
      where: { id: flashcardId, deckId, spaceId: id, userId: user.id },
      select: { id: true },
    })
    if (!flashcard) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.creativeFlashcard.delete({ where: { id: flashcardId } })
    await prisma.creativeSpace.update({
      where: { id },
      data: { lastEditedAt: new Date() },
    })
    await logCreativeActivity({
      userId: user.id,
      spaceId: id,
      eventType: 'FLASHCARD_DELETED',
      metadata: { deckId, flashcardId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[DELETE /api/creative-spaces/[id]/decks/[deckId]/flashcards/[flashcardId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
