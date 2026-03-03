import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET() {
  try {
    await requireAdmin()
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })

    const { docs: media } = await payload.find({
      collection: 'media',
      sort: '-createdAt',
      limit: 100,
      depth: 0,
    })

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}
