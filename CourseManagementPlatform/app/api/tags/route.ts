import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { unstable_cache, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { logActivity, ActivityAction } from '@/lib/activity-log'

const getCachedTags = unstable_cache(
  async () => {
    // Fetch prisma tag rows (includes flashcard counts) and also compute
    // how many tasks reference each tag via the Payload join table
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        main: true,
        _count: { select: { flashcards: true } },
      },
    })

    // Query payload.tasks_tags to count usages per tagId.
    // Since we now store tagId in the join table, we can directly count
    // how many tasks reference each canonical Prisma Tag.
    const taskCounts: Array<{ tag_id: string; cnt: string }> = await prisma.$queryRaw`
      SELECT tag_id, COUNT(*)::text as cnt 
      FROM payload.tasks_tags 
      WHERE tag_id IS NOT NULL
      GROUP BY tag_id
    ` as any

    const countsMap = new Map<string, number>()
    for (const r of taskCounts) {
      if (r.tag_id) countsMap.set(String(r.tag_id), Number(r.cnt))
    }

    // Merge task counts into each tag object under _count.tasks
    return tags.map((t) => ({
      ...t,
      _count: { ...(t._count || {}), tasks: countsMap.get(t.id) || 0 },
    }))
  },
  ['api-tags-list'],
  { revalidate: 30 },
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')   // remove non-word chars except hyphens
    .replace(/\s+/g, '-')       // spaces → hyphens
    .replace(/-+/g, '-')        // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '')    // trim leading/trailing hyphens
}

// ─── Validation schemas ───────────────────────────────────────────────────────

const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  slug: z.string().optional(),
})

// ─── GET /api/tags ────────────────────────────────────────────────────────────
// Returns all tags.

export async function GET() {
  try {
    await requireAdmin()
    const tags = await getCachedTags()
    return NextResponse.json({ tags })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[GET /api/tags]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── POST /api/tags ───────────────────────────────────────────────────────────
// Creates a new tag.  Body: { name, slug? }

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()

    const body = await req.json()
    const parsed = createTagSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { name } = parsed.data
    const slug = parsed.data.slug?.trim() || slugify(name)

    const existing = await prisma.tag.findFirst({
      where: { OR: [{ name }, { slug }] },
    })

    if (existing) {
      return NextResponse.json({ error: 'A tag with this name or slug already exists' }, { status: 409 })
    }

    const tag = await prisma.tag.create({
      data: { name, slug },
    })

    logActivity({
      action:       ActivityAction.TAG_CREATED,
      actorUserId:  admin.id,
      actorEmail:   admin.email,
      resourceType: 'tag',
      resourceId:   tag.id,
      metadata:     { name: tag.name, slug: tag.slug },
    })

    return NextResponse.json({ tag }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[POST /api/tags]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
