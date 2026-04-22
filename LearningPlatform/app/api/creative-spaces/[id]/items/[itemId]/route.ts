import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { CREATIVE_ITEM_TYPES, getOwnedCreativeSpace, logCreativeActivity } from '@/lib/creative-space'

const updateItemSchema = z.object({
  type: z.enum(CREATIVE_ITEM_TYPES).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  zIndex: z.number().int().optional(),
  tag: z.string().max(64).optional().nullable(),
  payload: z.unknown().optional(),
})

type Context = { params: Promise<{ id: string; itemId: string }> }

export async function PATCH(req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id, itemId } = await ctx.params
    const space = await getOwnedCreativeSpace(user.id, id)
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const existingItem = await prisma.creativeItem.findFirst({
      where: { id: itemId, spaceId: id, userId: user.id },
      select: { id: true },
    })
    if (!existingItem) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const parsed = updateItemSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const item = await prisma.creativeItem.update({
      where: { id: itemId },
      data: {
        ...parsed.data,
        payload: parsed.data.payload === undefined ? undefined : (parsed.data.payload as any),
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
      eventType: 'ITEM_UPDATED',
      metadata: { type: item.type },
    })

    return NextResponse.json({ item })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[PATCH /api/creative-spaces/[id]/items/[itemId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id, itemId } = await ctx.params
    const space = await getOwnedCreativeSpace(user.id, id)
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const existingItem = await prisma.creativeItem.findFirst({
      where: { id: itemId, spaceId: id, userId: user.id },
      select: { id: true },
    })
    if (!existingItem) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.creativeItem.delete({ where: { id: itemId } })
    await prisma.creativeSpace.update({
      where: { id },
      data: { lastEditedAt: new Date() },
    })
    await logCreativeActivity({
      userId: user.id,
      spaceId: id,
      itemId,
      eventType: 'ITEM_DELETED',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[DELETE /api/creative-spaces/[id]/items/[itemId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
