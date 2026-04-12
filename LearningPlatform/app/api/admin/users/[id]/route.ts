import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { logActivity, ActivityAction } from '@/lib/activity-log'

const patchSchema = z.object({
  isPro: z.boolean(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    const { id } = await params

    let json: unknown
    try {
      json = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = patchSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } })
    if (!exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.user.update({
      where: { id },
      data: { isPro: parsed.data.isPro },
    })

    logActivity({
      action: ActivityAction.ADMIN_USER_PRO_UPDATED,
      actorUserId: admin.id,
      actorEmail: admin.email,
      resourceType: 'user',
      resourceId: id,
      metadata: { targetUserId: id, isPro: parsed.data.isPro },
    })

    return NextResponse.json({ ok: true, isPro: parsed.data.isPro })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
    console.error('[PATCH /api/admin/users/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
