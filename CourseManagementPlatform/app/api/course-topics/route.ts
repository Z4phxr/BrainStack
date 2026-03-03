import { NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/auth-helpers'

export async function GET() {
  try {
    await requireAdmin()
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })

    const { docs } = await payload.find({
      collection: 'courses',
      limit: 1000,
      depth: 0,
    })

    const topicsSet = new Set<string>()

    docs.forEach((course) => {
      const courseItem = course as Record<string, unknown>
      const topics = courseItem.topics
      if (Array.isArray(topics)) {
        topics.forEach((topic) => {
          if (typeof topic === 'string') {
            const trimmed = topic.trim()
            if (trimmed) topicsSet.add(trimmed)
          }
        })
      }
    })

    return NextResponse.json({ topics: Array.from(topicsSet).sort() })
  } catch (error) {
    console.error('Error fetching course topics:', error)
    return NextResponse.json(
      { topics: [] },
      { status: 500 }
    )
  }
}
