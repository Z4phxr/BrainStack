import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') ?? '').trim()

    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })

    // Payload where type is broad and varies by generated typings; keep it flexible.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = q
      ? { and: [{ isPublished: { equals: true } }, { title: { contains: q } }] }
      : { isPublished: { equals: true } }

    const { docs } = await payload.find({
      collection: 'courses',
      where,
      sort: 'title',
      limit: 20,
      depth: 1,
      overrideAccess: true,
    })

    const courseIds = docs.map((course) => String(course.id))
    const progressRows = courseIds.length
      ? await prisma.courseProgress.findMany({
          where: {
            userId: user.id,
            courseId: { in: courseIds },
          },
          select: {
            courseId: true,
            progressPercentage: true,
            completedLessons: true,
            totalLessons: true,
          },
        })
      : []
    const progressByCourseId = new Map(progressRows.map((row) => [row.courseId, row]))

    const courses = docs.map((course) => {
      const progress = progressByCourseId.get(String(course.id))
      return {
        id: String(course.id),
        title: String(course.title ?? ''),
        slug: String(course.slug ?? ''),
        description:
          typeof course.description === 'string'
            ? course.description
            : 'Explore the curriculum and learning goals',
        subject:
          typeof course.subject === 'string'
            ? course.subject
            : (course.subject as { name?: string } | null)?.name ?? '',
        coverImage:
          course.coverImage && typeof course.coverImage === 'object' && 'filename' in course.coverImage
            ? {
                filename: String((course.coverImage as { filename?: string }).filename ?? ''),
                alt: String((course.coverImage as { alt?: string }).alt ?? ''),
              }
            : null,
        progressPercentage: progress?.progressPercentage ?? 0,
        completedLessons: progress?.completedLessons ?? 0,
        totalLessons: progress?.totalLessons ?? 0,
      }
    })

    return NextResponse.json({ courses })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[GET /api/creative-courses/search]', error)
    return NextResponse.json({ error: 'Failed to load courses' }, { status: 500 })
  }
}
