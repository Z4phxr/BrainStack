import { NextResponse } from 'next/server'
import { z } from 'zod'
import { signIn } from '@/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import { logActivity, ActivityAction } from '@/lib/activity-log'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const { email, password } = parsed.data
  const normalizedEmail = email.toLowerCase()

  const rate = await checkRateLimit({
    request,
    key: 'login',
    limit: 5,
    identityFallback: normalizedEmail,
  })
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  try {
    const result = await signIn('credentials', {
      email: normalizedEmail,
      password,
      redirect: false,
    })

    if (result instanceof Response) {
      return result
    }

    prisma.user
      .findUnique({ where: { email: normalizedEmail }, select: { id: true } })
      .then((u) =>
        logActivity({
          action:       ActivityAction.USER_LOGIN,
          actorUserId:  u?.id ?? null,
          actorEmail:   normalizedEmail,
          resourceType: 'user',
          resourceId:   u?.id ?? null,
        })
      )
      .catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
}
