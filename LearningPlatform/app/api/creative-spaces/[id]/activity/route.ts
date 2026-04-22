import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-helpers'
import { getOwnedCreativeSpace } from '@/lib/creative-space'
import { prisma } from '@/lib/prisma'

type Context = { params: Promise<{ id: string }> }

const querySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
})

export async function GET(req: Request, ctx: Context) {
  try {
    const user = await requireAuth()
    const { id } = await ctx.params
    const space = await getOwnedCreativeSpace(user.id, id)
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const parsed = querySchema.safeParse({
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    })
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const fromDate = parsed.data.from ? new Date(parsed.data.from) : undefined
    const toDate = parsed.data.to ? new Date(parsed.data.to) : undefined
    const limit = parsed.data.limit ?? 200

    if ((fromDate && Number.isNaN(fromDate.getTime())) || (toDate && Number.isNaN(toDate.getTime()))) {
      return NextResponse.json(
        { error: 'Validation failed', issues: { date: ['Invalid from/to date values'] } },
        { status: 400 },
      )
    }

    const events = await prisma.creativeActivityEvent.findMany({
      where: {
        userId: user.id,
        spaceId: id,
        ...(fromDate || toDate
          ? {
              eventAt: {
                ...(fromDate ? { gte: fromDate } : {}),
                ...(toDate ? { lte: toDate } : {}),
              },
            }
          : {}),
      },
      orderBy: { eventAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ events })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[GET /api/creative-spaces/[id]/activity]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
