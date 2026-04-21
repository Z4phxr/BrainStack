import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { toSlug } from '@/lib/utils'
import { requireAdmin } from '@/lib/auth-helpers'
import { logActivity, ActivityAction } from '@/lib/activity-log'

const OA = { overrideAccess: true as const }

// ─── GET /api/subjects ────────────────────────────────────────────────────────

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'subjects',
      sort: 'name',
      limit: 500,
      ...OA,
    })
    const subjects = docs.map((doc) => ({
      id: String(doc.id),
      name: String(doc.name ?? ''),
      slug: (doc.slug as string) ?? toSlug(String(doc.name ?? '')),
      tagSlugs: [] as string[],
    }))
    return NextResponse.json({ subjects })
  } catch (err) {
    console.error('[GET /api/subjects] error', err)
    return NextResponse.json({ subjects: [] }, { status: 500 })
  }
}

// ─── POST /api/subjects ───────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Subject name is required' }, { status: 400 })
    }

    const name = body.name.trim()
    const slug = body.slug ? toSlug(String(body.slug)) : toSlug(name)

    const payload = await getPayload({ config })
    const doc = await payload.create({
      collection: 'subjects',
      data: { name, slug },
      ...OA,
    })

    logActivity({
      action: ActivityAction.SUBJECT_CREATED,
      actorUserId: admin.id,
      actorEmail: admin.email,
      resourceType: 'subject',
      resourceId: String(doc.id),
      metadata: { name, slug },
    })

    return NextResponse.json(
      { subject: { id: String(doc.id), name: String(doc.name), slug: String(doc.slug) } },
      { status: 201 },
    )
  } catch (error) {
    console.error('[POST /api/subjects]', error)
    const msg = error instanceof Error ? error.message : 'Failed to create subject'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ─── PUT /api/subjects ────────────────────────────────────────────────────────

export async function PUT(req: Request) {
  try {
    const admin = await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const body = await req.json()

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Subject name is required' }, { status: 400 })
    }

    const name = body.name.trim()
    const slug = body.slug ? toSlug(String(body.slug)) : toSlug(name)

    const payload = await getPayload({ config })
    try {
      await payload.update({
        collection: 'subjects',
        id,
        data: { name, slug },
        ...OA,
      })
    } catch {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    logActivity({
      action: ActivityAction.SUBJECT_UPDATED,
      actorUserId: admin.id,
      actorEmail: admin.email,
      resourceType: 'subject',
      resourceId: id,
      metadata: { name, slug },
    })

    return NextResponse.json({ subject: { id, name, slug } })
  } catch (error) {
    console.error('[PUT /api/subjects]', error)
    const msg = error instanceof Error ? error.message : 'Failed to update subject'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ─── DELETE /api/subjects ─────────────────────────────────────────────────────

export async function DELETE(req: Request) {
  try {
    const admin = await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    try {
      await payload.delete({
        collection: 'subjects',
        id,
        ...OA,
      })
    } catch {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    logActivity({
      action: ActivityAction.SUBJECT_DELETED,
      actorUserId: admin.id,
      actorEmail: admin.email,
      resourceType: 'subject',
      resourceId: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/subjects]', error)
    const msg = error instanceof Error ? error.message : 'Failed to delete subject'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
