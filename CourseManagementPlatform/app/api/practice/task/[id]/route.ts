import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAuth } from '@/lib/auth-helpers'

/**
 * GET /api/practice/task/[id]
 *
 * Returns full task data for a single published task, suitable for
 * rendering in the practice session UI.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth()

    const { id } = await params
    const payload = await getPayload({ config })

    const task = await payload.findByID({
      collection: 'tasks',
      id,
      depth: 2,
    })

    if (!task || !task.isPublished) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Normalise tag list to strings
    const tags = Array.isArray(task.tags)
      ? (task.tags as any[]).map((t: any) => t?.name ?? t?.slug ?? t?.tag ?? '').filter(Boolean)
      : []

    return NextResponse.json({
      id:               String(task.id),
      type:             task.type,
      prompt:           task.prompt,
      questionMedia:    task.questionMedia ?? null,
      choices:          task.choices ?? [],
      correctAnswer:    task.correctAnswer ?? null,
      solution:         task.solution ?? null,
      solutionMedia:    task.solutionMedia ?? null,
      solutionVideoUrl: task.solutionVideoUrl ?? null,
      points:           task.points ?? 0,
      order:            task.order ?? 0,
      tags,
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
    console.error('[GET /api/practice/task/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
