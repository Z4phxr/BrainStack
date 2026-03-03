import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { z } from 'zod'
import { calculateNextReview, parseSettings, DEFAULT_SETTINGS, type FlashcardState } from '@/lib/srs'

// ─── Validation ───────────────────────────────────────────────────────────────

const reviewSchema = z.object({
  answer: z.enum(['AGAIN', 'HARD', 'GOOD', 'EASY']),
})

type RouteContext = { params: Promise<{ id: string }> }

/**
 * POST /api/flashcards/[id]/review
 *
 * Submits a review answer for a flashcard and updates the *per-user* SRS state
 * stored in UserFlashcardProgress.  The global SRS fields on the Flashcard row
 * itself are NO LONGER modified (those are deprecated; kept for backward compat).
 *
 * Body: { answer: "AGAIN" | "HARD" | "GOOD" | "EASY" }
 *
 * Returns the updated per-user progress record plus the flashcard content.
 */
export async function POST(req: Request, ctx: RouteContext) {
  try {
    const user       = await requireAuth()
    const { id }     = await ctx.params

    const body   = await req.json()
    const parsed = reviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { answer } = parsed.data

    // ── Verify the card exists ────────────────────────────────────────────────
    const card = await prisma.flashcard.findUnique({
      where: { id },
      select: {
        id:       true,
        question: true,
        answer:   true,
        tags:     { select: { id: true, name: true, slug: true } },
      },
    })

    if (!card) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 })
    }

    // ── Get or create the per-user SRS progress row ───────────────────────────
    // Bootstrap new records from canonical algorithm defaults (DEFAULT_SETTINGS).
    let userProgress = await prisma.userFlashcardProgress.findUnique({
      where: { userId_flashcardId: { userId: user.id, flashcardId: id } },
    })

    if (!userProgress) {
      userProgress = await prisma.userFlashcardProgress.create({
        data: {
          userId:         user.id,
          flashcardId:    id,
          state:          'NEW' as FlashcardState,
          interval:       0,
          easeFactor:     DEFAULT_SETTINGS.startingEase,
          repetition:     0,
          stepIndex:      0,
          nextReviewAt:   null,
          lastReviewedAt: null,
          lastResult:     null,
        },
      })
    }

    // ── Fetch user SRS settings (upsert = create with defaults if absent) ─────
    const dbSettings = await prisma.flashcardSettings.upsert({
      where:  { userId: user.id },
      create: { userId: user.id },
      update: {},
    })
    const settings = parseSettings(dbSettings)

    // ── Run the SRS algorithm on the per-user state ───────────────────────────
    const update = calculateNextReview(
      {
        state:          userProgress.state      as FlashcardState,
        interval:       userProgress.interval,
        easeFactor:     userProgress.easeFactor,
        repetition:     userProgress.repetition,
        stepIndex:      userProgress.stepIndex,
        nextReviewAt:   userProgress.nextReviewAt,
        lastReviewedAt: userProgress.lastReviewedAt,
        lastResult:     userProgress.lastResult,
      },
      answer,
      settings,
    )

    // ── Persist the updated SRS state to the per-user progress row ────────────
    const updatedProgress = await prisma.userFlashcardProgress.update({
      where: { id: userProgress.id },
      data: {
        state:          update.state,
        interval:       update.interval,
        easeFactor:     update.easeFactor,
        repetition:     update.repetition,
        stepIndex:      update.stepIndex,
        nextReviewAt:   update.nextReviewAt,
        lastReviewedAt: update.lastReviewedAt,
        lastResult:     update.lastResult,
      },
    })

    // Return combined flashcard content + updated per-user SRS state
    return NextResponse.json({
      flashcard: {
        id:              card.id,
        question:        card.question,
        answer:          card.answer,
        tags:            card.tags,
        // SRS state (per-user)
        state:           updatedProgress.state,
        interval:        updatedProgress.interval,
        easeFactor:      updatedProgress.easeFactor,
        repetition:      updatedProgress.repetition,
        stepIndex:       updatedProgress.stepIndex,
        nextReviewAt:    updatedProgress.nextReviewAt,
        lastReviewedAt:  updatedProgress.lastReviewedAt,
        lastResult:      updatedProgress.lastResult,
      },
    })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[POST /api/flashcards/[id]/review]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
