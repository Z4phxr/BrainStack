import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { unstable_cache } from 'next/cache'
import { z } from 'zod'
import { logActivity, ActivityAction } from '@/lib/activity-log'

// Cache flashcard list per tagSlugs key (null key = unfiltered)
const getCachedFlashcards = (tagSlugsKey: string | null, whereClause: any) =>
  unstable_cache(
    async () =>
      prisma.flashcard.findMany({
        where: whereClause ?? undefined,
        orderBy: { createdAt: 'desc' },
        include: { tags: { select: { id: true, name: true, slug: true } } },
      }),
    [`api-flashcards-${tagSlugsKey ?? 'all'}`],
    { revalidate: 30 },
  )()

// ─── Validation schema ────────────────────────────────────────────────────────

const createFlashcardSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  questionImageId: z.string().nullable().optional(),
  answerImageId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional().default([]),
})

// ─── GET /api/flashcards ──────────────────────────────────────────────────────
// Returns all flashcards (optionally filtered by ?tagSlug=) with their tags.

export async function GET(req: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    // Support both single `tagSlug` and multi `tagSlugs=slug1,slug2` (AND semantics)
    const tagSlug = searchParams.get('tagSlug')
    const tagSlugsParam = searchParams.get('tagSlugs')
    const tagSlugs = tagSlugsParam ? tagSlugsParam.split(',').map((s) => s.trim()).filter(Boolean) : (tagSlug ? [tagSlug] : [])

    let whereClause = undefined
    if (tagSlugs.length === 1) {
      whereClause = { tags: { some: { slug: tagSlugs[0] } } }
    } else if (tagSlugs.length > 1) {
      // AND semantics: flashcard must have ALL specified tags
      whereClause = { AND: tagSlugs.map((s) => ({ tags: { some: { slug: s } } })) }
    }

    const cacheKey = tagSlugs.length ? tagSlugs.join(',') : null
    const flashcards = await getCachedFlashcards(cacheKey, whereClause)
    return NextResponse.json({ flashcards })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('[GET /api/flashcards]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── POST /api/flashcards ─────────────────────────────────────────────────────
// Creates a new flashcard.  Body: { question, answer, questionImageId?, answerImageId?, tagIds? }

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()

    const body = await req.json()
    const parsed = createFlashcardSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { question, answer, questionImageId, answerImageId, tagIds } = parsed.data

    const flashcard = await prisma.flashcard.create({
      data: {
        question,
        answer,
        questionImageId: questionImageId ?? null,
        answerImageId: answerImageId ?? null,
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
      include: {
        tags: { select: { id: true, name: true, slug: true } },
      },
    })

    logActivity({
      action:       ActivityAction.FLASHCARD_CREATED,
      actorUserId:  admin.id,
      actorEmail:   admin.email,
      resourceType: 'flashcard',
      resourceId:   flashcard.id,
    })

    return NextResponse.json({ flashcard }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[POST /api/flashcards]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
