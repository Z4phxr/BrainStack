import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || !session.user.email || !session.user.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = session.user.role === 'ADMIN' ? 'ADMIN' : 'USER'

  return NextResponse.json({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
    role,
  })
}
