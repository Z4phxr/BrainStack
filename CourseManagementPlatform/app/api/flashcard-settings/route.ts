import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { z } from 'zod'

// â”€â”€â”€ Validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const updateSettingsSchema = z.object({
  newCardsPerDay:     z.number().int().min(1).max(9999).optional(),
  maxReviews:         z.number().int().min(1).max(9999).optional(),
  /** Space-separated minutes, e.g. "1 10" */
  learningSteps:      z.string().regex(/^(\d+(\s+\d+)*)$/, 'Must be space-separated numbers').optional(),
  relearningSteps:    z.string().regex(/^(\d+(\s+\d+)*)$/, 'Must be space-separated numbers').optional(),
  graduatingInterval: z.number().int().min(1).max(365).optional(),
  easyInterval:       z.number().int().min(1).max(365).optional(),
  startingEase:       z.number().min(1.3).max(9.99).optional(),
  masteredThreshold:  z.number().int().min(7).max(3650).optional(),
})

// â”€â”€â”€ Helper: get-or-create settings for a user â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function getOrCreateSettings(userId: string) {
  return prisma.flashcardSettings.upsert({
    where:  { userId },
    create: { userId },   // all other fields use @default values from schema
    update: {},           // no-op if it already exists
  })
}

// â”€â”€â”€ GET /api/flashcard-settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function GET() {
  try {
    const user     = await requireAuth()
    const settings = await getOrCreateSettings(user.id)
    return NextResponse.json({ settings })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[GET /api/flashcard-settings]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// â”€â”€â”€ PUT /api/flashcard-settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function PUT(req: Request) {
  try {
    const user = await requireAuth()

    const body   = await req.json()
    const parsed = updateSettingsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const settings = await prisma.flashcardSettings.upsert({
      where:  { userId: user.id },
      create: { userId: user.id, ...parsed.data },
      update: parsed.data,
    })

    return NextResponse.json({ settings })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[PUT /api/flashcard-settings]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

