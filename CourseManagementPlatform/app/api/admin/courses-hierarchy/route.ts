import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/courses-hierarchy
 *
 * Returns the full Course → Module → Lesson tree in one request.
 * Uses a single SQL JOIN instead of 3 separate Payload find() calls.
 * Shape: { courses: CourseWithModules[] }
 */
export async function GET() {
  try {
    await requireAdmin()

    // Single query — one round-trip to the DB
    const rows = await prisma.$queryRaw<
      Array<{
        course_id: string
        course_title: string
        module_id: string | null
        module_title: string | null
        module_order: number | null
        lesson_id: string | null
        lesson_title: string | null
        lesson_order: number | null
      }>
    >`
      SELECT
        c.id          AS course_id,
        c.title       AS course_title,
        m.id          AS module_id,
        m.title       AS module_title,
        m."order"     AS module_order,
        l.id          AS lesson_id,
        l.title       AS lesson_title,
        l."order"     AS lesson_order
      FROM payload.courses c
      LEFT JOIN payload.modules m
        ON m.course_id = c.id
       AND m.is_published = TRUE
      LEFT JOIN payload.lessons l
        ON l.module_id = m.id
       AND l.is_published = TRUE
      WHERE c.is_published = TRUE
      ORDER BY c.title, m."order" NULLS LAST, l."order" NULLS LAST
    `

    // Build tree from flat rows
    const courseMap = new Map<string, { id: string; title: string; modules: Map<string, { id: string; title: string; order: number; lessons: { id: string; title: string; order: number }[] }> }>()

    for (const row of rows) {
      if (!courseMap.has(row.course_id)) {
        courseMap.set(row.course_id, { id: row.course_id, title: row.course_title, modules: new Map() })
      }
      const course = courseMap.get(row.course_id)!

      if (row.module_id) {
        if (!course.modules.has(row.module_id)) {
          course.modules.set(row.module_id, {
            id: row.module_id,
            title: row.module_title ?? '',
            order: row.module_order ?? 0,
            lessons: [],
          })
        }
        const mod = course.modules.get(row.module_id)!

        if (row.lesson_id) {
          mod.lessons.push({
            id: row.lesson_id,
            title: row.lesson_title ?? '',
            order: row.lesson_order ?? 0,
          })
        }
      }
    }

    const tree = Array.from(courseMap.values()).map((c) => ({
      id: c.id,
      title: c.title,
      modules: Array.from(c.modules.values()).map((m) => ({
        id: m.id,
        title: m.title,
        lessons: m.lessons,
      })),
    }))

    return NextResponse.json(
      { courses: tree },
      { headers: { 'Cache-Control': 'private, max-age=120, stale-while-revalidate=30' } },
    )
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      if (error.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('[GET /api/admin/courses-hierarchy]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
