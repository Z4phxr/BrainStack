import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { z } from 'zod'
import { toSlug } from '@/lib/utils'

const createDeckSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional().default([]),
  type: z.enum(['MAIN', 'SUBDECK']).default('MAIN'),
  courseId: z.string().min(1).optional(),
  moduleId: z.string().min(1).optional(),
  parentDeckId: z.string().min(1).optional(),
})

/** GET /api/flashcard-decks — list decks (admin). */
export async function GET() {
  try {
    await requireAdmin()

    const decks = await prisma.flashcardDeck.findMany({
      orderBy: { name: 'asc' },
      include: {
        parentDeck: { select: { id: true, name: true, slug: true } },
        childDecks: { select: { id: true } },
        tags: { select: { id: true, name: true, slug: true } },
        _count: { select: { flashcards: true } },
      },
    })

    return NextResponse.json({ decks })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('[GET /api/flashcard-decks]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/flashcard-decks — create deck (admin). */
export async function POST(req: Request) {
  try {
    await requireAdmin()

    const body = await req.json()
    const parsed = createDeckSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { name, description, tagIds, type, courseId, moduleId, parentDeckId } = parsed.data
    const slug = parsed.data.slug?.trim() ? toSlug(parsed.data.slug.trim()) : toSlug(name)

    if (type === 'MAIN') {
      if (!courseId) {
        return NextResponse.json(
          { error: 'Validation failed', issues: { courseId: ['Course is required for main deck'] } },
          { status: 400 },
        )
      }
      if (moduleId || parentDeckId) {
        return NextResponse.json(
          { error: 'Validation failed', issues: { type: ['Main deck cannot include module/parent fields'] } },
          { status: 400 },
        )
      }
    }

    if (type === 'SUBDECK') {
      if (!courseId || !moduleId || !parentDeckId) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            issues: {
              courseId: !courseId ? ['Course is required for subdeck'] : undefined,
              moduleId: !moduleId ? ['Module is required for subdeck'] : undefined,
              parentDeckId: !parentDeckId ? ['Parent deck is required for subdeck'] : undefined,
            },
          },
          { status: 400 },
        )
      }
    }

    if (courseId) {
      const [courseRow] = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT c.id::text AS id
        FROM payload.courses c
        WHERE c.id::text = ${courseId}
        LIMIT 1
      `
      if (!courseRow) {
        return NextResponse.json(
          { error: 'Validation failed', issues: { courseId: ['Selected course does not exist'] } },
          { status: 400 },
        )
      }
    }

    if (type === 'SUBDECK') {
      const parent = await prisma.flashcardDeck.findUnique({
        where: { id: parentDeckId! },
        select: { id: true, courseId: true, parentDeckId: true },
      })
      if (!parent || parent.parentDeckId !== null) {
        return NextResponse.json(
          { error: 'Validation failed', issues: { parentDeckId: ['Parent must be an existing main deck'] } },
          { status: 400 },
        )
      }
      if (parent.courseId !== courseId) {
        return NextResponse.json(
          { error: 'Validation failed', issues: { parentDeckId: ['Parent deck must belong to selected course'] } },
          { status: 400 },
        )
      }

      const [moduleRow] = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT m.id::text AS id
        FROM payload.modules m
        WHERE m.id::text = ${moduleId!}
          AND m.course_id::text = ${courseId!}
        LIMIT 1
      `
      if (!moduleRow) {
        return NextResponse.json(
          { error: 'Validation failed', issues: { moduleId: ['Module must belong to selected course'] } },
          { status: 400 },
        )
      }
    }

    const deck = await prisma.flashcardDeck.create({
      data: {
        slug,
        name: name.trim(),
        description: description ?? null,
        courseId: courseId ?? null,
        moduleId: type === 'SUBDECK' ? (moduleId ?? null) : null,
        parentDeckId: type === 'SUBDECK' ? (parentDeckId ?? null) : null,
        tags: { connect: tagIds.map((id) => ({ id })) },
      },
      include: {
        parentDeck: { select: { id: true, name: true, slug: true } },
        childDecks: { select: { id: true } },
        tags: { select: { id: true, name: true, slug: true } },
        _count: { select: { flashcards: true } },
      },
    })

    return NextResponse.json({ deck }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        if (Array.isArray(error.meta?.target) && error.meta.target.includes('moduleId')) {
          return NextResponse.json(
            {
              error: 'Conflict',
              issues: { moduleId: ['This module already has a linked subdeck'] },
            },
            { status: 409 },
          )
        }
        return NextResponse.json(
          {
            error: 'Conflict',
            issues: { slug: ['A deck with this slug already exists'] },
          },
          { status: 409 },
        )
      }
      if (error.code === 'P2003') {
        return NextResponse.json(
          {
            error: 'Validation failed',
            issues: { tagIds: ['One or more tags do not exist'] },
          },
          { status: 400 },
        )
      }
    }
    console.error('[POST /api/flashcard-decks]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
