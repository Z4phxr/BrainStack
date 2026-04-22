import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { toSlug } from '@/lib/utils'

const CREATIVE_DECK_TAG_SLUG = 'creative-user-generated'
const CREATIVE_DECK_TAG_NAME = 'Creative User Generated'

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().nullable(),
})

async function getOrCreateCreativeDeckTag() {
  const bySlug = await prisma.tag.findUnique({
    where: { slug: CREATIVE_DECK_TAG_SLUG },
    select: { id: true, slug: true, name: true },
  })
  if (bySlug) return bySlug

  try {
    return await prisma.tag.create({
      data: {
        name: CREATIVE_DECK_TAG_NAME,
        slug: CREATIVE_DECK_TAG_SLUG,
        main: false,
      },
      select: { id: true, slug: true, name: true },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const retry = await prisma.tag.findUnique({
        where: { slug: CREATIVE_DECK_TAG_SLUG },
        select: { id: true, slug: true, name: true },
      })
      if (retry) return retry
    }
    throw error
  }
}

async function buildUniqueDeckSlug(name: string): Promise<string> {
  const base = toSlug(name) || 'creative-deck'
  let candidate = base
  let index = 1
  while (await prisma.flashcardDeck.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${index}`
    index += 1
  }
  return candidate
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const markerTag = await getOrCreateCreativeDeckTag()
    const slug = await buildUniqueDeckSlug(parsed.data.name)

    const deck = await prisma.flashcardDeck.create({
      data: {
        slug,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        courseId: null,
        parentDeckId: null,
        moduleId: null,
        tags: {
          connect: [{ id: markerTag.id }],
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        _count: { select: { flashcards: true, childDecks: true } },
      },
    })

    await prisma.userStandaloneFlashcardDeck.upsert({
      where: {
        userId_deckId: {
          userId: user.id,
          deckId: deck.id,
        },
      },
      create: {
        userId: user.id,
        deckId: deck.id,
      },
      update: {},
    })

    return NextResponse.json({
      deck: {
        id: deck.id,
        slug: deck.slug,
        name: deck.name,
        description: deck.description,
        cardCount: deck._count.flashcards,
        childDeckCount: deck._count.childDecks,
        kind: 'standalone' as const,
        source: 'creative' as const,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('[POST /api/creative-decks/create-standalone]', error)
    return NextResponse.json({ error: 'Failed to create standalone deck' }, { status: 500 })
  }
}
