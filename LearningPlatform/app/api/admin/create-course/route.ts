import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createCourse } from '@/app/(admin)/admin/actions'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'
import { requireAdmin } from '@/lib/auth-helpers'

export async function POST(_req: NextRequest) {
  try {
    // Explicit auth guard — do not rely on middleware alone
    await requireAdmin()

    const payload = await getPayload({ config: payloadConfig })

    // Ensure there's at least one Subject to attach to a newly created course.
    // Prefer an existing subject; otherwise create a default "General" subject.
    const { docs: existingSubjects } = await payload.find({ collection: 'subjects', limit: 1 })
    let subjectId: string | undefined = undefined

    if (existingSubjects && existingSubjects.length > 0) {
      subjectId = String(existingSubjects[0].id)
    } else {
      const created = await payload.create({ collection: 'subjects', data: { name: 'General' } })
      subjectId = String(created.id)
    }

    const timestamp = Date.now()
    const slug = `untitled-${timestamp}`

    const payloadData = {
      title: `Untitled Course ${new Date(timestamp).toLocaleString()}`,
      slug,
      // Keep subject as string ID (payload uses varchar/uuid ids)
      subject: subjectId,
      level: 'BEGINNER',
    }

    try {
      const course = await createCourse(payloadData as any)
      const id = course?.id || (course && (course as any).course && (course as any).course.id)
      if (!id) {
        console.error('[api/create-course] createCourse returned no id', course)
        return NextResponse.json(
          { ok: false, error: 'Failed to create course' },
          { status: 500 }
        )
      }
      return NextResponse.json({ ok: true, id: String(id) })
    } catch (err) {
      console.error('[api/create-course] error creating course', err)
      return NextResponse.json(
        { ok: false, error: 'Failed to create course' },
        { status: 500 }
      )
    }
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[api/create-course]', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
