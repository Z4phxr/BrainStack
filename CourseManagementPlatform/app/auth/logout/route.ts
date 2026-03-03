import { NextResponse } from 'next/server'
import { auth, signOut } from '@/auth'
import { logActivity, ActivityAction } from '@/lib/activity-log'

export async function POST() {
  try {
    const session = await auth()
    const userId  = session?.user?.id   ?? null
    const email   = session?.user?.email ?? null

    const result = await signOut({ redirect: false })
    if (result instanceof Response) {
      return result
    }

    logActivity({
      action:       ActivityAction.USER_LOGOUT,
      actorUserId:  userId,
      actorEmail:   email,
      resourceType: 'user',
      resourceId:   userId,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Unable to log out' }, { status: 500 })
  }
}
