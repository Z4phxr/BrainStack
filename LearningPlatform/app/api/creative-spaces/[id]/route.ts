import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { getOwnedCreativeSpace } from '@/lib/creative-space'

const updateSpaceSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  courseId: z.string().trim().min(1).optional().nullable(),
  moduleId: z.string().trim().min(1).optional().nullable(),
  lessonId: z.string().trim().min(1).optional().nullable(),
})

type Context = { params: Promise<{ id: string }> }

export async function GET(_req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id } = await ctx.params
    const space = await prisma.creativeSpace.findFirst({
      where: { id, userId: user.id },
      include: {
        _count: {
          select: { items: true, decks: true, flashcards: true, activities: true },
        },
      },
    })

    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ space })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[GET /api/creative-spaces/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id } = await ctx.params
    const existing = await getOwnedCreativeSpace(user.id, id)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const parsed = updateSpaceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const space = await prisma.creativeSpace.update({
      where: { id },
      data: {
        ...parsed.data,
        lastEditedAt: new Date(),
      },
    })
    return NextResponse.json({ space })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[PATCH /api/creative-spaces/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id } = await ctx.params
    const existing = await getOwnedCreativeSpace(user.id, id)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.creativeSpace.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[DELETE /api/creative-spaces/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
