import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { getOwnedCreativeSpace, logCreativeActivity } from '@/lib/creative-space'

const updateDrawingSchema = z.object({
  strokes: z.unknown(),
  version: z.number().int().min(1).optional(),
})

type Context = { params: Promise<{ id: string }> }

export async function GET(_req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id } = await ctx.params
    const space = await getOwnedCreativeSpace(user.id, id)
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const drawing = await prisma.creativeDrawing.findFirst({
      where: { spaceId: id, userId: user.id },
    })
    return NextResponse.json({ drawing: drawing ?? null })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[GET /api/creative-spaces/[id]/drawings]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id } = await ctx.params
    const space = await getOwnedCreativeSpace(user.id, id)
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const parsed = updateDrawingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const drawing = await prisma.creativeDrawing.upsert({
      where: { spaceId: id },
      create: {
        spaceId: id,
        userId: user.id,
        strokes: parsed.data.strokes as any,
        version: parsed.data.version ?? 1,
      },
      update: {
        strokes: parsed.data.strokes as any,
        version: parsed.data.version ?? undefined,
      },
    })

    await prisma.creativeSpace.update({
      where: { id },
      data: { lastEditedAt: new Date() },
    })
    await logCreativeActivity({
      userId: user.id,
      spaceId: id,
      eventType: 'DRAWING_UPDATED',
      metadata: { version: drawing.version },
    })

    return NextResponse.json({ drawing })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[PATCH /api/creative-spaces/[id]/drawings]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
