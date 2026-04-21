import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { z } from 'zod'
import { toSlug } from '@/lib/utils'
import { subjectExistsById } from '@/lib/payload-subject-names'

const createDeckSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional().default([]),
  type: z.enum(['MAIN', 'SUBDECK']).default('MAIN'),
  courseId: z.string().min(1).optional(),
  moduleId: z.string().min(1).optional(),
  parentDeckId: z.string().min(1).optional(),
  /** Payload `subjects` id — only for standalone main decks. */
  subjectId: z.string().optional(),
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

    const { name, description, tagIds, type, courseId, moduleId, parentDeckId, subjectId: rawSubjectId } =
      parsed.data
    const fallbackName = name?.trim() ?? ''
    let derivedName = fallbackName
    let subdeckKind: 'none' | 'course' | 'standalone' = 'none'

    if (type === 'MAIN') {
      if (moduleId || parentDeckId) {
        return NextResponse.json(
          { error: 'Validation failed', issues: { type: ['Main deck cannot include module/parent fields'] } },
          { status: 400 },
        )
      }
      if (courseId) {
        const [courseRow] = await prisma.$queryRaw<Array<{ id: string; title: string }>>`
          SELECT c.id::text AS id, c.title::text AS title
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
        if (courseRow.title?.trim()) {
          derivedName = courseRow.title.trim()
        }
        const existingMainForCourse = await prisma.flashcardDeck.findFirst({
          where: {
            courseId,
            parentDeckId: null,
          },
          select: { id: true },
        })
        if (existingMainForCourse) {
          return NextResponse.json(
            {
              error: 'Conflict',
              issues: { courseId: ['This course already has a main deck'] },
            },
            { status: 409 },
          )
        }
      } else {
        if (!fallbackName) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              issues: { name: ['Name is required for a standalone main deck'] } },
            { status: 400 },
          )
        }
        derivedName = fallbackName
      }
    } else if (type === 'SUBDECK') {
      const coursePath = Boolean(courseId && moduleId && parentDeckId)
      const standalonePath = Boolean(parentDeckId && !courseId && !moduleId)

      if (coursePath) {
        subdeckKind = 'course'
        const [courseRow] = await prisma.$queryRaw<Array<{ id: string; title: string }>>`
          SELECT c.id::text AS id, c.title::text AS title
          FROM payload.courses c
          WHERE c.id::text = ${courseId!}
          LIMIT 1
        `
        if (!courseRow) {
          return NextResponse.json(
            { error: 'Validation failed', issues: { courseId: ['Selected course does not exist'] } },
            { status: 400 },
          )
        }

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

        const [moduleRow] = await prisma.$queryRaw<Array<{ id: string; title: string }>>`
          SELECT m.id::text AS id, m.title::text AS title
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
        if (moduleRow.title?.trim()) {
          derivedName = moduleRow.title.trim()
        }

        const existingForModule = await prisma.flashcardDeck.findFirst({
          where: { moduleId: moduleId! },
          select: { id: true },
        })
        if (existingForModule) {
          return NextResponse.json(
            {
              error: 'Conflict',
              issues: { moduleId: ['This module already has a linked subdeck'] },
            },
            { status: 409 },
          )
        }
      } else if (standalonePath) {
        subdeckKind = 'standalone'
        if (!fallbackName) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              issues: { name: ['Name is required for a standalone subdeck'] } },
            { status: 400 },
          )
        }
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
        if (parent.courseId != null && String(parent.courseId).trim() !== '') {
          return NextResponse.json(
            {
              error: 'Validation failed',
              issues: {
                parentDeckId: [
                  'Use courseId, moduleId, and parentDeckId together for a course subdeck',
                ],
              },
            },
            { status: 400 },
          )
        }
        derivedName = fallbackName
      } else {
        return NextResponse.json(
          {
            error: 'Validation failed',
            issues: {
              deck: [
                'Subdeck: send courseId, moduleId, and parentDeckId for a course subdeck, or parentDeckId and name for a standalone subdeck under a standalone main deck',
              ],
            },
          },
          { status: 400 },
        )
      }
    }

    if (!derivedName) {
      return NextResponse.json(
        { error: 'Validation failed', issues: { name: ['Could not resolve deck name'] } },
        { status: 400 },
      )
    }

    const slug = parsed.data.slug?.trim() ? toSlug(parsed.data.slug.trim()) : toSlug(derivedName)

    let resolvedSubjectId: string | null = null
    const trimmedSubject = rawSubjectId?.trim()
    if (trimmedSubject) {
      if (type !== 'MAIN' || courseId) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            issues: { subjectId: ['Subject is only allowed on standalone main decks'] },
          },
          { status: 400 },
        )
      }
      const exists = await subjectExistsById(trimmedSubject)
      if (!exists) {
        return NextResponse.json(
          { error: 'Validation failed', issues: { subjectId: ['Unknown subject'] } },
          { status: 400 },
        )
      }
      resolvedSubjectId = trimmedSubject
    }

    const deck = await prisma.flashcardDeck.create({
      data: {
        slug,
        name: derivedName,
        description: description ?? null,
        subjectId: resolvedSubjectId,
        courseId: type === 'MAIN' ? (courseId ?? null) : subdeckKind === 'course' ? (courseId ?? null) : null,
        moduleId: subdeckKind === 'course' ? (moduleId ?? null) : null,
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
