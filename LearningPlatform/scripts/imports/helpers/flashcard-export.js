const { omitUndefined } = require('./export-utils')

function deckSpecFromRow(deck, parentSlugById) {
  return omitUndefined({
    slug: deck.slug,
    name: deck.name,
    description: deck.description ?? undefined,
    tagSlugs: deck.tags.map((t) => t.slug),
    courseId: deck.courseId ?? undefined,
    moduleId: deck.moduleId ?? undefined,
    parentDeckSlug: deck.parentDeckId ? parentSlugById.get(deck.parentDeckId) : undefined,
    subjectId: deck.subjectId ?? undefined,
  })
}

function cardFromRow(card) {
  return omitUndefined({
    question: card.question,
    answer: card.answer,
    tagSlugs: card.tags.map((t) => t.slug),
  })
}

/**
 * Build import-shaped flashcard file payloads grouped by main deck.
 * @returns {Array<{ basename: string, data: unknown }>}
 */
async function buildFlashcardExportFiles(prisma) {
  const decks = await prisma.flashcardDeck.findMany({
    include: { tags: true, parentDeck: { select: { slug: true } } },
    orderBy: [{ parentDeckId: 'asc' }, { slug: 'asc' }],
  })

  const cards = await prisma.flashcard.findMany({
    include: { tags: true },
    orderBy: { createdAt: 'asc' },
  })

  const cardsByDeck = new Map()
  for (const card of cards) {
    if (!cardsByDeck.has(card.deckId)) cardsByDeck.set(card.deckId, [])
    cardsByDeck.get(card.deckId).push(card)
  }

  const parentSlugById = new Map(decks.map((d) => [d.id, d.slug]))
  const mains = decks.filter((d) => !d.parentDeckId)
  const childrenByParent = new Map()
  for (const d of decks) {
    if (!d.parentDeckId) continue
    if (!childrenByParent.has(d.parentDeckId)) childrenByParent.set(d.parentDeckId, [])
    childrenByParent.get(d.parentDeckId).push(d)
  }

  const files = []

  for (const main of mains) {
    const children = childrenByParent.get(main.id) || []
    const mainCards = (cardsByDeck.get(main.id) || []).map(cardFromRow)
    const base = main.slug

    if (main.courseId && children.length > 0) {
      files.push({
        basename: `${base}-main-deck`,
        data: {
          deck: deckSpecFromRow(main, parentSlugById),
          cards: [],
        },
      })
      const chunk = children.map((sub) => ({
        deck: deckSpecFromRow(sub, parentSlugById),
        cards: (cardsByDeck.get(sub.id) || []).map(cardFromRow),
      }))
      files.push({
        basename: `${base}-subdecks`,
        data: chunk,
      })
    } else if (children.length > 0) {
      files.push({
        basename: `${base}-main-deck`,
        data: {
          deck: deckSpecFromRow(main, parentSlugById),
          cards: mainCards,
        },
      })
      const chunk = children.map((sub) => ({
        deck: deckSpecFromRow(sub, parentSlugById),
        cards: (cardsByDeck.get(sub.id) || []).map(cardFromRow),
      }))
      files.push({
        basename: `${base}-subdecks`,
        data: chunk,
      })
    } else {
      files.push({
        basename: base,
        data: {
          deck: deckSpecFromRow(main, parentSlugById),
          cards: mainCards,
        },
      })
    }
  }

  return files
}

/** Collect tag slugs used on decks/cards (for --used-tags-only). */
async function collectUsedTagSlugs(prisma) {
  const slugs = new Set()
  const deckTags = await prisma.flashcardDeck.findMany({
    include: { tags: { select: { slug: true } } },
  })
  const cardTags = await prisma.flashcard.findMany({
    include: { tags: { select: { slug: true } } },
  })
  for (const d of deckTags) {
    for (const t of d.tags) slugs.add(t.slug)
  }
  for (const c of cardTags) {
    for (const t of c.tags) slugs.add(t.slug)
  }
  return slugs
}

module.exports = {
  buildFlashcardExportFiles,
  collectUsedTagSlugs,
}
