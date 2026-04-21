import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

type RouteContext = { params: Promise<{ id: string }> }

/** DELETE /api/flashcard-decks/[id] — remove deck; main decks cascade to subdecks and flashcards. */
export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await params
    if (!id?.trim()) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const deck = await prisma.flashcardDeck.findUnique({
      where: { id },
      select: { id: true, parentDeckId: true },
    })
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    if (deck.parentDeckId === null) {
      const children = await prisma.flashcardDeck.findMany({
        where: { parentDeckId: id },
        select: { id: true },
      })
      const childIds = children.map((c) => c.id)
      const allDeckIds = [id, ...childIds]

      await prisma.$transaction(async (tx) => {
        await tx.flashcard.deleteMany({ where: { deckId: { in: allDeckIds } } })
        if (childIds.length) {
          await tx.flashcardDeck.deleteMany({ where: { id: { in: childIds } } })
        }
        await tx.flashcardDeck.delete({ where: { id } })
      })
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.flashcard.deleteMany({ where: { deckId: id } })
        await tx.flashcardDeck.delete({ where: { id } })
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[DELETE /api/flashcard-decks/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
