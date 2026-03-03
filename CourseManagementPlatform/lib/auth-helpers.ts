import { auth } from '@/auth'
import type { Role } from '@prisma/client'

export type SessionUser = {
  id: string
  email: string
  name?: string | null
  role: Role
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await auth()
  if (!session?.user?.id || !session.user.email || !session.user.role) {
    throw new Error('Unauthorized')
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  }
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden')
  }
  return user
}
