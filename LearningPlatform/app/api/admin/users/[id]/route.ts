import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { logActivity, ActivityAction } from '@/lib/activity-log'

const patchSchema = z
  .object({
    isPro: z.boolean().optional(),
    role: z.nativeEnum(Role).optional(),
  })
  .refine((d) => d.isPro !== undefined || d.role !== undefined, {
    message: 'Provide isPro and/or role',
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

    if (parsed.data.role === Role.STUDENT && id === admin.id) {
      return NextResponse.json({ error: 'You cannot remove your own admin role' }, { status: 403 })
    }

    const data: { isPro?: boolean; role?: Role } = {}
    if (parsed.data.isPro !== undefined) data.isPro = parsed.data.isPro
    if (parsed.data.role !== undefined) data.role = parsed.data.role

    await prisma.user.update({
      where: { id },
      data,
    })

    if (parsed.data.isPro !== undefined) {
      logActivity({
        action: ActivityAction.ADMIN_USER_PRO_UPDATED,
        actorUserId: admin.id,
        actorEmail: admin.email,
        resourceType: 'user',
        resourceId: id,
        metadata: { targetUserId: id, isPro: parsed.data.isPro },
      })
    }
    if (parsed.data.role !== undefined) {
      logActivity({
        action: ActivityAction.ADMIN_USER_ROLE_UPDATED,
        actorUserId: admin.id,
        actorEmail: admin.email,
        resourceType: 'user',
        resourceId: id,
        metadata: { targetUserId: id, role: parsed.data.role },
      })
    }

    return NextResponse.json({
      ok: true,
      ...(parsed.data.isPro !== undefined ? { isPro: parsed.data.isPro } : {}),
      ...(parsed.data.role !== undefined ? { role: parsed.data.role } : {}),
    })
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
