import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { CREATIVE_ITEM_TYPES, getOwnedCreativeSpace, logCreativeActivity } from '@/lib/creative-space'

const createItemSchema = z.object({
  type: z.enum(CREATIVE_ITEM_TYPES),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  zIndex: z.number().int().optional(),
  tag: z.string().max(64).optional().nullable(),
  payload: z.unknown().optional(),
})

type Context = { params: Promise<{ id: string }> }

export async function GET(_req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id } = await ctx.params
    const space = await getOwnedCreativeSpace(user.id, id)
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const items = await prisma.creativeItem.findMany({
      where: { spaceId: id, userId: user.id },
      orderBy: [{ zIndex: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json({ items })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[GET /api/creative-spaces/[id]/items]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id } = await ctx.params
    const space = await getOwnedCreativeSpace(user.id, id)
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const parsed = createItemSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const maxZ = await prisma.creativeItem.aggregate({
      where: { spaceId: id },
      _max: { zIndex: true },
    })

    const item = await prisma.creativeItem.create({
      data: {
        spaceId: id,
        userId: user.id,
        type: parsed.data.type,
        x: parsed.data.x ?? 80,
        y: parsed.data.y ?? 80,
        width: parsed.data.width ?? 280,
        height: parsed.data.height ?? 180,
        zIndex: parsed.data.zIndex ?? (maxZ._max.zIndex ?? 0) + 1,
        tag: parsed.data.tag ?? null,
        payload: (parsed.data.payload ?? null) as any,
      },
    })

    await prisma.creativeSpace.update({
      where: { id },
      data: { lastEditedAt: new Date() },
    })
    await logCreativeActivity({
      userId: user.id,
      spaceId: id,
      itemId: item.id,
      eventType: 'ITEM_CREATED',
      metadata: { type: item.type },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[POST /api/creative-spaces/[id]/items]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
