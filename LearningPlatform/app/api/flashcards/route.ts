import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { unstable_cache, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { logActivity, ActivityAction } from '@/lib/activity-log'
import { validateFlashcardDeckAndTags } from '@/lib/validate-flashcard-refs'

// Cache flashcard list per composite key (tags + optional deck)
const getCachedFlashcards = (cacheKey: string, whereClause: any) =>
  unstable_cache(
    async () =>
      prisma.flashcard.findMany({
        where: whereClause ?? undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          tags: { select: { id: true, name: true, slug: true } },
          deck: { select: { id: true, name: true, slug: true } },
        },
      }),
    [`api-flashcards-${cacheKey}`],
    { revalidate: 30, tags: ['api-flashcards'] },
  )()

// ─── Validation schema ────────────────────────────────────────────────────────

const createFlashcardSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  deckId: z.string().min(1, 'Deck is required'),
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
    const rawSlugs = tagSlugsParam ? tagSlugsParam.split(',').map((s) => s.trim()).filter(Boolean) : (tagSlug ? [tagSlug] : [])
    // Dedupe + sort so cache key matches AND-filter semantics (order-insensitive)
    const tagSlugs = [...new Set(rawSlugs)].sort((a, b) => a.localeCompare(b))
    const deckSlugRaw = searchParams.get('deckSlug')?.trim() || undefined
    const deckIdRaw = searchParams.get('deckId')?.trim() || undefined
    const mainDeckIdRaw = searchParams.get('mainDeckId')?.trim() || undefined
    // Prefer exact deck id (subdeck scoping); ignore slug when id is present.
    const deckSlug = deckIdRaw ? undefined : deckSlugRaw
    const mainDeckId =
      deckIdRaw || deckSlug ? undefined : mainDeckIdRaw

    let whereClause = undefined
    if (tagSlugs.length === 1) {
      whereClause = { tags: { some: { slug: tagSlugs[0] } } }
    } else if (tagSlugs.length > 1) {
      // AND semantics: flashcard must have ALL specified tags
      whereClause = { AND: tagSlugs.map((s) => ({ tags: { some: { slug: s } } })) }
    }
    if (deckIdRaw) {
      const deckFilter = { deckId: deckIdRaw }
      whereClause = whereClause ? { AND: [whereClause, deckFilter] } : deckFilter
    } else if (deckSlug) {
      const deckFilter = { deck: { slug: deckSlug } }
      whereClause = whereClause ? { AND: [whereClause, deckFilter] } : deckFilter
    } else if (mainDeckId) {
      const deckFilter = {
        OR: [{ deckId: mainDeckId }, { deck: { parentDeckId: mainDeckId } }],
      }
      whereClause = whereClause ? { AND: [whereClause, deckFilter] } : deckFilter
    }

    const deckKey = deckIdRaw
      ? `id:${deckIdRaw}`
      : deckSlug
        ? `slug:${deckSlug}`
        : mainDeckId
          ? `main:${mainDeckId}`
          : 'all'
    const cacheKey = `${tagSlugs.join('|') || 'all'}__deck:${deckKey}`
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

    const { question, answer, deckId, questionImageId, answerImageId, tagIds } = parsed.data

    const refCheck = await validateFlashcardDeckAndTags(prisma, deckId, tagIds)
    if (!refCheck.ok) {
      return NextResponse.json(
        { error: 'Validation failed', issues: refCheck.issues },
        { status: 400 },
      )
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        question,
        answer,
        deckId,
        questionImageId: questionImageId ?? null,
        answerImageId: answerImageId ?? null,
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
      include: {
        tags: { select: { id: true, name: true, slug: true } },
        deck: { select: { id: true, name: true, slug: true } },
      },
    })

    logActivity({
      action:       ActivityAction.FLASHCARD_CREATED,
      actorUserId:  admin.id,
      actorEmail:   admin.email,
      resourceType: 'flashcard',
      resourceId:   flashcard.id,
    })

    try { revalidateTag('api-flashcards', 'max') } catch (_) { /* best-effort */ }

    return NextResponse.json({ flashcard }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: { deckId: ['Invalid deck or tag reference'] },
        },
        { status: 400 },
      )
    }
    console.error('[POST /api/flashcards]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
