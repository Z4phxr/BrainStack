import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

const createFlashcardSchema = z.object({
  frontText: z.string().trim().min(1).max(500),
  backText: z.string().trim().min(1).max(2000),
})
const moveFlashcardSchema = z.object({
  flashcardId: z.string().trim().min(1),
  targetDeckId: z.string().trim().min(1),
})

type Context = { params: Promise<{ deckId: string }> }

async function canUserAccessDeck(userId: string, deckId: string) {
  const deck = await prisma.flashcardDeck.findUnique({
    where: { id: deckId },
    select: { id: true, courseId: true },
  })
  if (!deck) return { ok: false as const, status: 404, error: 'Deck not found', deck: null }

  if (deck.courseId) {
    const started = await prisma.courseProgress.findFirst({
      where: { userId, courseId: deck.courseId },
      select: { courseId: true },
    })
    if (!started) {
      return {
        ok: false as const,
        status: 403,
        error: 'Deck not in your started courses',
        deck,
      }
    }
    return { ok: true as const, deck }
  }

  const enrollment = await prisma.userStandaloneFlashcardDeck.findUnique({
    where: {
      userId_deckId: {
        userId,
        deckId,
      },
    },
    select: { deckId: true },
  })
  if (!enrollment) {
    return {
      ok: false as const,
      status: 403,
      error: 'Deck not in your standalone library',
      deck,
    }
  }
  return { ok: true as const, deck }
}

export async function GET(_req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { deckId } = await ctx.params
    const access = await canUserAccessDeck(user.id, deckId)
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const flashcards = await prisma.flashcard.findMany({
      where: { deckId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, question: true, answer: true },
    })
    return NextResponse.json({
      flashcards: flashcards.map((card) => ({
        id: card.id,
        frontText: card.question,
        backText: card.answer,
      })),
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[GET /api/creative-decks/[deckId]/flashcards]', error)
    return NextResponse.json({ error: 'Failed to load flashcards' }, { status: 500 })
  }
}

export async function POST(req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { deckId } = await ctx.params

    const access = await canUserAccessDeck(user.id, deckId)
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    // Creative-space user additions are only allowed on standalone decks.
    if (access.deck.courseId) {
      return NextResponse.json(
        { error: 'Cannot add cards to course-linked decks from Creative Space' },
        { status: 403 },
      )
    }

    const body = await req.json()
    const parsed = createFlashcardSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        deckId,
        question: parsed.data.frontText,
        answer: parsed.data.backText,
      },
      select: {
        id: true,
        question: true,
        answer: true,
        deckId: true,
      },
    })

    return NextResponse.json({ flashcard }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[POST /api/creative-decks/[deckId]/flashcards]', error)
    return NextResponse.json({ error: 'Failed to create flashcard' }, { status: 500 })
  }
}

export async function PATCH(req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { deckId } = await ctx.params
    const body = await req.json()
    const parsed = moveFlashcardSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const sourceAccess = await canUserAccessDeck(user.id, deckId)
    if (!sourceAccess.ok) {
      return NextResponse.json({ error: sourceAccess.error }, { status: sourceAccess.status })
    }
    const targetAccess = await canUserAccessDeck(user.id, parsed.data.targetDeckId)
    if (!targetAccess.ok) {
      return NextResponse.json({ error: targetAccess.error }, { status: targetAccess.status })
    }

    // Keep course decks immutable from Creative Space interactions.
    if (sourceAccess.deck.courseId || targetAccess.deck.courseId) {
      return NextResponse.json(
        { error: 'Moving cards between course-linked decks is not allowed here' },
        { status: 403 },
      )
    }
    if (deckId === parsed.data.targetDeckId) {
      return NextResponse.json({ error: 'Source and target deck are the same' }, { status: 400 })
    }

    const existing = await prisma.flashcard.findFirst({
      where: { id: parsed.data.flashcardId, deckId },
      select: { id: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Flashcard not found in source deck' }, { status: 404 })
    }

    await prisma.flashcard.update({
      where: { id: parsed.data.flashcardId },
      data: { deckId: parsed.data.targetDeckId },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[PATCH /api/creative-decks/[deckId]/flashcards]', error)
    return NextResponse.json({ error: 'Failed to move flashcard' }, { status: 500 })
  }
}
