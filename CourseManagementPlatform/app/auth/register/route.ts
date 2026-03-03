import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { logActivity, ActivityAction } from '@/lib/activity-log'

const registerSchema = z.object({
  email: z.string().email(),
  // bcrypt silently truncates at 72 bytes; enforce an explicit max to prevent
  // silent truncation and denial-of-service via large bcrypt inputs.
  password: z.string().min(8).max(128),
  name: z.string().max(100).optional(),
})

function isStrongPassword(password: string): boolean {
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  return hasUpper && hasLower && hasNumber && hasSpecial
}

export async function POST(request: Request) {
  const rate = await checkRateLimit({ request, key: 'register', limit: 10 })
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid registration data' }, { status: 400 })
  }

  const { email, password, name } = parsed.data
  if (!isStrongPassword(password)) {
    return NextResponse.json({ error: 'Password does not meet complexity rules' }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase()

  try {
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: 'Unable to create account' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name?.trim() || null,
        role: 'STUDENT',
      },
    })

    logActivity({
      action:      ActivityAction.USER_REGISTERED,
      actorUserId: user.id,
      actorEmail:  user.email,
      resourceType: 'user',
      resourceId:  user.id,
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Unable to create account' }, { status: 500 })
  }
}
