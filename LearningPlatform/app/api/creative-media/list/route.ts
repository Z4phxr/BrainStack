import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET() {
  try {
    await requireAuth()
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })

    const { docs: media } = await payload.find({
      collection: 'media',
      sort: '-createdAt',
      limit: 200,
      depth: 0,
      overrideAccess: true,
    })

    return NextResponse.json({ media })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[GET /api/creative-media/list]', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}
