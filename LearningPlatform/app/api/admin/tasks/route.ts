import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAdmin } from '@/lib/auth-helpers'

const TASK_TYPES = ['MULTIPLE_CHOICE', 'OPEN_ENDED', 'TRUE_FALSE'] as const
type TaskTypeFilter = (typeof TASK_TYPES)[number]

function isTaskTypeFilter(v: string | null): v is TaskTypeFilter {
  return v !== null && (TASK_TYPES as readonly string[]).includes(v)
}

// ─── GET /api/admin/tasks ─────────────────────────────────────────────────────
// Returns tasks with lesson populated (depth 1). Optional: tagSlugs (AND), type.

export async function GET(req: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    // Support both single `tagSlug` and multi `tagSlugs=slug1,slug2` (AND semantics)
    const tagSlug = searchParams.get('tagSlug')
    const tagSlugsParam = searchParams.get('tagSlugs')
    const tagSlugs = tagSlugsParam ? tagSlugsParam.split(',').map((s) => s.trim()).filter(Boolean) : (tagSlug ? [tagSlug] : [])

    const typeParam = searchParams.get('type')

    const payload = await getPayload({ config })

    const query: Parameters<typeof payload.find>[0] = {
      collection: 'tasks',
      limit: 2000,
      sort: '-createdAt',
      depth: 1, // populate lesson so we can show lesson title
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: any[] = []

    // Tag filtering: tasks store tags as an array field `tags` with sub-field `slug`.
    if (tagSlugs.length === 1) {
      parts.push({ 'tags.slug': { equals: tagSlugs[0] } })
    } else if (tagSlugs.length > 1) {
      parts.push({ and: tagSlugs.map((s) => ({ 'tags.slug': { equals: s } })) })
    }

    if (isTaskTypeFilter(typeParam)) {
      parts.push({ type: { equals: typeParam } })
    }

    if (parts.length === 1) {
      query.where = parts[0]
    } else if (parts.length > 1) {
      query.where = { and: parts }
    }

    const { docs } = await payload.find(query)

    return NextResponse.json({ tasks: docs }, {
      headers: { 'Cache-Control': 'private, no-store' },
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
    console.error('[GET /api/admin/tasks]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
