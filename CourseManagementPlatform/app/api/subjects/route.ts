import { NextResponse } from 'next/server'
import { toSlug } from '@/lib/utils'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { logActivity, ActivityAction } from '@/lib/activity-log'

// ─── Types ───────────────────────────────────────────────────────────────────

type SubjectRow = {
  id: string
  name: string
  slug: string
}

// ─── GET /api/subjects ────────────────────────────────────────────────────────

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<SubjectRow[]>`
      SELECT id, name, slug
      FROM "payload"."subjects"
      ORDER BY name ASC
    `
    const subjects = rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug ?? toSlug(r.name ?? ''),
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
    const id = crypto.randomUUID()

    await prisma.$executeRaw`
      INSERT INTO "payload"."subjects" (id, name, slug, updated_at, created_at)
      VALUES (${id}, ${name}, ${slug}, NOW(), NOW())
    `

    logActivity({
      action:       ActivityAction.SUBJECT_CREATED,
      actorUserId:  admin.id,
      actorEmail:   admin.email,
      resourceType: 'subject',
      resourceId:   id,
      metadata:     { name, slug },
    })

    return NextResponse.json({ subject: { id, name, slug } }, { status: 201 })
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

    const result = await prisma.$executeRaw`
      UPDATE "payload"."subjects"
      SET name = ${name}, slug = ${slug}, updated_at = NOW()
      WHERE id = ${id}
    `

    if (result === 0) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    logActivity({
      action:       ActivityAction.SUBJECT_UPDATED,
      actorUserId:  admin.id,
      actorEmail:   admin.email,
      resourceType: 'subject',
      resourceId:   id,
      metadata:     { name, slug },
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

    const result = await prisma.$executeRaw`
      DELETE FROM "payload"."subjects" WHERE id = ${id}
    `

    if (result === 0) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    logActivity({
      action:       ActivityAction.SUBJECT_DELETED,
      actorUserId:  admin.id,
      actorEmail:   admin.email,
      resourceType: 'subject',
      resourceId:   id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/subjects]', error)
    const msg = error instanceof Error ? error.message : 'Failed to delete subject'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
