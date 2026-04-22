import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { logActivity, ActivityAction } from '@/lib/activity-log'
import { validateFlashcardDeckAndTags } from '@/lib/validate-flashcard-refs'

// ─── Validation schema ────────────────────────────────────────────────────────

const updateFlashcardSchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  deckId: z.string().min(1).optional(),
  questionImageId: z.string().nullable().optional(),
  answerImageId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

// ─── GET /api/flashcards/[id] ─────────────────────────────────────────────────

export async function GET(_req: Request, ctx: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await ctx.params

    const flashcard = await prisma.flashcard.findUnique({
      where: { id },
      include: {
        tags: { select: { id: true, name: true, slug: true } },
        deck: { select: { id: true, name: true, slug: true } },
      },
    })

    if (!flashcard) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ flashcard })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[GET /api/flashcards/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── PUT /api/flashcards/[id] ─────────────────────────────────────────────────

export async function PUT(req: Request, ctx: RouteContext) {
  try {
    const admin = await requireAdmin()
    const { id } = await ctx.params

    const body = await req.json()
    const parsed = updateFlashcardSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { tagIds, ...rest } = parsed.data

    const deckIdForCheck = rest.deckId
    if (deckIdForCheck !== undefined || tagIds !== undefined) {
      const current = await prisma.flashcard.findUnique({
        where: { id },
        select: { deckId: true, tags: { select: { id: true } } },
      })
      if (!current) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      const effectiveDeckId = deckIdForCheck ?? current.deckId
      const effectiveTagIds = tagIds ?? current.tags.map((t) => t.id)
      const refCheck = await validateFlashcardDeckAndTags(prisma, effectiveDeckId, effectiveTagIds)
      if (!refCheck.ok) {
        return NextResponse.json(
          { error: 'Validation failed', issues: refCheck.issues },
          { status: 400 },
        )
      }
    }

    const flashcard = await prisma.flashcard.update({
      where: { id },
      data: {
        ...rest,
        ...(tagIds !== undefined && {
          tags: { set: tagIds.map((tid) => ({ id: tid })) },
        }),
      },
      include: {
        tags: { select: { id: true, name: true, slug: true } },
        deck: { select: { id: true, name: true, slug: true } },
      },
    })

    logActivity({
      action:       ActivityAction.FLASHCARD_UPDATED,
      actorUserId:  admin.id,
      actorEmail:   admin.email,
      resourceType: 'flashcard',
      resourceId:   id,
    })

    try { revalidateTag('api-flashcards', 'max') } catch { /* best-effort */ }

    return NextResponse.json({ flashcard })
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
    console.error('[PUT /api/flashcards/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── DELETE /api/flashcards/[id] ──────────────────────────────────────────────

export async function DELETE(_req: Request, ctx: RouteContext) {
  try {
    const admin = await requireAdmin()
    const { id } = await ctx.params

    await prisma.flashcard.delete({ where: { id } })

    logActivity({
      action:       ActivityAction.FLASHCARD_DELETED,
      actorUserId:  admin.id,
      actorEmail:   admin.email,
      resourceType: 'flashcard',
      resourceId:   id,
    })

    try { revalidateTag('api-flashcards', 'max') } catch { /* best-effort */ }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[DELETE /api/flashcards/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
