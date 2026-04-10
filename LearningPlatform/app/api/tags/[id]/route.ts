import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { logActivity, ActivityAction } from '@/lib/activity-log'

const OA = { overrideAccess: true as const }

type TaskTagRow = { tagId?: string; name?: string; slug?: string }

function readTaskTags(task: unknown): TaskTagRow[] {
  const raw = (task as { tags?: unknown }).tags
  return Array.isArray(raw) ? (raw as TaskTagRow[]) : []
}

function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function syncTagOnTasks(tagId: string, name: string, slug: string) {
  const payload = await getPayload({ config })
  const limit = 80
  // Read all matching task IDs first (page++ safe — no mutations). Updates keep tagId in the
  // filter, so a single "page 1 until empty" loop would never drain.
  const taskIds: string[] = []
  let readPage = 1
  for (;;) {
    const { docs, hasNextPage } = await payload.find({
      collection: 'tasks',
      where: { 'tags.tagId': { equals: tagId } },
      limit,
      page: readPage,
      depth: 0,
      ...OA,
    })
    for (const t of docs) taskIds.push(String(t.id))
    if (!hasNextPage) break
    readPage += 1
  }
  for (const id of taskIds) {
    const task = await payload.findByID({
      collection: 'tasks',
      id,
      depth: 0,
      ...OA,
    })
    const tags = [...readTaskTags(task)]
    const next = tags.map((t) =>
      t?.tagId === tagId ? { ...t, name, slug } : t,
    )
    await payload.update({
      collection: 'tasks',
      id,
      data: { tags: next },
      ...OA,
    })
  }
}

async function removeTagFromTasks(tagId: string): Promise<number> {
  const payload = await getPayload({ config })
  let removed = 0
  const limit = 80
  for (;;) {
    const { docs } = await payload.find({
      collection: 'tasks',
      where: { 'tags.tagId': { equals: tagId } },
      limit,
      page: 1,
      depth: 0,
      ...OA,
    })
    if (docs.length === 0) break
    for (const task of docs) {
      const tags = readTaskTags(task)
      const next = tags.filter((t) => t?.tagId !== tagId)
      removed += tags.length - next.length
      await payload.update({
        collection: 'tasks',
        id: String(task.id),
        data: { tags: next },
        ...OA,
      })
    }
  }
  return removed
}

const updateTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').optional(),
  slug: z.string().optional(),
  main: z.boolean().optional(),
})

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const existing = await prisma.tag.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    const body = await req.json()
    const parsed = updateTagSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const { name, main } = parsed.data
    const newName = name ?? existing.name
    const newSlug = parsed.data.slug?.trim() || (name ? slugify(name) : existing.slug)
    if (newName !== existing.name || newSlug !== existing.slug) {
      const conflict = await prisma.tag.findFirst({
        where: { AND: [{ id: { not: id } }, { OR: [{ name: newName }, { slug: newSlug }] }] },
      })
      if (conflict) return NextResponse.json({ error: 'A tag with this name or slug already exists' }, { status: 409 })
    }
    const tag = await prisma.tag.update({
      where: { id },
      data: { name: newName, slug: newSlug, ...(main !== undefined ? { main } : {}) },
    })
    if (newName !== existing.name || newSlug !== existing.slug) {
      try {
        await syncTagOnTasks(id, newName, newSlug)
      } catch (syncErr) {
        console.warn('[PUT /api/tags/[id]] Failed to sync tag on tasks:', syncErr)
      }
    }
    try { revalidateTag('api-tags-list') } catch (_) { /* best-effort */ }
    logActivity({
      action: ActivityAction.TAG_UPDATED,
      actorUserId: admin.id,
      actorEmail: admin.email,
      resourceType: 'tag',
      resourceId: id,
      metadata: { name: tag.name, slug: tag.slug },
    })
    return NextResponse.json({ tag })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden'))
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    console.error('[PUT /api/tags/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const tag = await prisma.tag.findUnique({ where: { id } })
    if (!tag) return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    let deletedJoinRows = 0
    try {
      deletedJoinRows = await removeTagFromTasks(tag.id)
    } catch (err) {
      console.warn('Failed to remove tag from tasks for tag', tag.id, err)
    }
    await prisma.tag.delete({ where: { id } })
    logActivity({
      action: ActivityAction.TAG_DELETED,
      actorUserId: admin.id,
      actorEmail: admin.email,
      resourceType: 'tag',
      resourceId: id,
    })
    try { revalidateTag('api-tags-list') } catch (_) { /* best-effort */ }
    return NextResponse.json({ success: true, deletedJoinRows })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden'))
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    console.error('[DELETE /api/tags/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    if (typeof body?.main !== 'boolean') return NextResponse.json({ error: 'main field must be boolean' }, { status: 400 })
    const tag = await prisma.tag.findUnique({ where: { id } })
    if (!tag) return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    const updated = await prisma.tag.update({ where: { id }, data: { main: body.main } })
    try { revalidateTag('api-tags-list') } catch { /* best-effort */ }
    return NextResponse.json({ tag: updated })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden'))
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    console.error('[PATCH /api/tags/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
