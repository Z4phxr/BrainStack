import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAdmin } from '@/lib/auth-helpers'

// ─── GET /api/admin/tasks ─────────────────────────────────────────────────────
// Returns all tasks with their lesson populated (depth 1).

export async function GET(req: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    // Support both single `tagSlug` and multi `tagSlugs=slug1,slug2` (AND semantics)
    const tagSlug = searchParams.get('tagSlug')
    const tagSlugsParam = searchParams.get('tagSlugs')
    const tagSlugs = tagSlugsParam ? tagSlugsParam.split(',').map((s) => s.trim()).filter(Boolean) : (tagSlug ? [tagSlug] : [])

    const payload = await getPayload({ config })

    const query: Parameters<typeof payload.find>[0] = {
      collection: 'tasks',
      limit: 500,
      sort: '-createdAt',
      depth: 1, // populate lesson so we can show lesson title
    }

    // Tag filtering: tasks store tags as an array field `tags` with sub-field `slug`.
    // If multiple slugs provided, use AND semantics: task must have all specified tags.
    if (tagSlugs.length === 1) {
      query.where = { 'tags.slug': { equals: tagSlugs[0] } }
    } else if (tagSlugs.length > 1) {
      query.where = { and: tagSlugs.map((s) => ({ 'tags.slug': { equals: s } })) }
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
