import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

const createSpaceSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  courseId: z.string().trim().min(1).optional().nullable(),
  moduleId: z.string().trim().min(1).optional().nullable(),
  lessonId: z.string().trim().min(1).optional().nullable(),
})

export async function GET() {
  try {
    const user = await requireAuth()
    const spaces = await prisma.creativeSpace.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { items: true, decks: true, flashcards: true, activities: true },
        },
      },
    })
    return NextResponse.json({ spaces })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[GET /api/creative-spaces]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = createSpaceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const space = await prisma.creativeSpace.create({
      data: {
        userId: user.id,
        title: parsed.data.title || 'My Creative Space',
        courseId: parsed.data.courseId ?? null,
        moduleId: parsed.data.moduleId ?? null,
        lessonId: parsed.data.lessonId ?? null,
      },
    })

    return NextResponse.json({ space }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[POST /api/creative-spaces]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
