import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { getFlashcardDashboardSummary } from '@/lib/flashcards-dashboard-summary'

/** GET /api/flashcards/dashboard-summary — minimal payload for the student dashboard strip. */
export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const courseSlug = searchParams.get('courseSlug')?.trim() || undefined
    const summary = await getFlashcardDashboardSummary(user.id, { courseSlug })
    return NextResponse.json(summary)
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[GET /api/flashcards/dashboard-summary]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
