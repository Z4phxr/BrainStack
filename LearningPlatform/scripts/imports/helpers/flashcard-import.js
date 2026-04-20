const { getTagIdsBySlug } = require('./tags')
const { flashcardDedupeKey } = require('./utils')

function sameIdList(a, b) {
  const x = [...a].sort()
  const y = [...b].sort()
  if (x.length !== y.length) {
    return false
  }
  return x.every((id, i) => id === y[i])
}

/**
 * Find a flashcard with the same question, deck, and tag set (order-insensitive).
 */
async function findFlashcardByQuestionTagsAndDeck(prisma, question, desiredTagIds, deckId) {
  const candidates = await prisma.flashcard.findMany({
    where: { question, deckId },
    include: { tags: true },
  })

  const matches = candidates.filter((row) => sameIdList(row.tags.map((t) => t.id), desiredTagIds))

  if (matches.length > 1) {
    console.warn(
      `[WARN] Multiple flashcards share the same question, deck, and tag set (${matches.length} rows). Using ${matches[0].id}.`,
    )
  }

  return matches[0] || null
}

function needsFlashcardUpdate(existing, answer, desiredTagIds) {
  if (existing.answer !== answer) {
    return true
  }
  const currentTagIds = existing.tags.map((t) => t.id)
  return !sameIdList(currentTagIds, desiredTagIds)
}

/**
 * Create or update deck metadata by slug (idempotent).
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {{ slug: string, name?: string, description?: string | null, tagSlugs?: string[] }} spec
 */
async function upsertFlashcardDeck(prisma, spec, { dryRun }) {
  const slug = typeof spec.slug === 'string' && spec.slug.trim() ? spec.slug.trim() : null
  if (!slug) {
    throw new Error('Deck slug is required')
  }
  const name = typeof spec.name === 'string' && spec.name.trim() ? spec.name.trim() : slug
  const description =
    spec.description == null || spec.description === '' ? null : String(spec.description)
  const tagSlugs = Array.isArray(spec.tagSlugs) ? spec.tagSlugs : []
  const desiredTagIds = await getTagIdsBySlug(prisma, tagSlugs)
  const courseId = typeof spec.courseId === 'string' && spec.courseId.trim() ? spec.courseId.trim() : null
  const moduleId = typeof spec.moduleId === 'string' && spec.moduleId.trim() ? spec.moduleId.trim() : null
  const parentDeckSlug =
    typeof spec.parentDeckSlug === 'string' && spec.parentDeckSlug.trim() ? spec.parentDeckSlug.trim() : null
  let parentDeckId = null

  if (parentDeckSlug) {
    const parent = await prisma.flashcardDeck.findUnique({
      where: { slug: parentDeckSlug },
      select: { id: true },
    })
    if (!parent) {
      throw new Error(`Parent deck slug not found: ${parentDeckSlug}`)
    }
    parentDeckId = parent.id
  }

  const existing = await prisma.flashcardDeck.findUnique({
    where: { slug },
    include: { tags: true },
  })

  if (dryRun) {
    // Per-slug placeholder so parallel dry-run decks do not share one id (dedupe keys stay distinct)
    const placeholderId = existing?.id ?? `dry-run-deck:${slug}`
    return { id: placeholderId, slug, created: !existing }
  }

  if (!existing) {
    const row = await prisma.flashcardDeck.create({
      data: {
        slug,
        name,
        description,
        courseId,
        moduleId,
        parentDeckId,
        tags: { connect: desiredTagIds.map((id) => ({ id })) },
      },
    })
    console.log(`[CREATE] Flashcard deck: ${slug} (${name})`)
    return { id: row.id, slug, created: true }
  }

  await prisma.flashcardDeck.update({
    where: { slug },
    data: {
      name,
      description,
      courseId,
      moduleId,
      parentDeckId,
      tags: { set: desiredTagIds.map((id) => ({ id })) },
    },
  })
  console.log(`[UPDATE] Flashcard deck: ${slug}`)
  return { id: existing.id, slug, created: false }
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {Array<{ question: string, answer: string, tagSlugs?: string[] }>} cards
 * @param {{ dryRun: boolean, deckId: string }} opts
 */
async function importFlashcardsFromList(prisma, cards, { dryRun, deckId }) {
  const stats = { created: 0, updated: 0, skipped: 0, errors: [] }

  if (!deckId) {
    throw new Error('deckId is required')
  }

  if (!Array.isArray(cards)) {
    throw new Error('Flashcard export must be an array')
  }

  for (let i = 0; i < cards.length; i += 1) {
    const card = cards[i]
    try {
      if (!card || typeof card.question !== 'string' || typeof card.answer !== 'string') {
        throw new Error('Each flashcard must include string question and answer')
      }

      const tagSlugs = Array.isArray(card.tagSlugs) ? card.tagSlugs : []
      const dedupeKey = flashcardDedupeKey(card.question, tagSlugs, deckId)
      const desiredTagIds = await getTagIdsBySlug(prisma, tagSlugs)

      const uniqueSlugCount = new Set(tagSlugs.map((s) => String(s).trim()).filter(Boolean)).size
      if (uniqueSlugCount !== desiredTagIds.length) {
        console.warn(
          `[WARN] Flashcard ${i + 1}: tagSlugs could not all be resolved (unique=${uniqueSlugCount}, resolved=${desiredTagIds.length}). Import tags first. dedupe=${dedupeKey.slice(0, 10)}…`,
        )
      }

      const existing = await findFlashcardByQuestionTagsAndDeck(prisma, card.question, desiredTagIds, deckId)

      if (!existing) {
        if (dryRun) {
          console.log(`[DRY-RUN] [CREATE] Flashcard: "${card.question.slice(0, 60)}…"`)
          stats.created += 1
          continue
        }

        await prisma.flashcard.create({
          data: {
            question: card.question,
            answer: card.answer,
            deckId,
            tags: { connect: desiredTagIds.map((id) => ({ id })) },
          },
        })
        console.log(`[CREATE] Flashcard: "${card.question.slice(0, 80)}${card.question.length > 80 ? '…' : ''}"`)
        stats.created += 1
        continue
      }

      if (!needsFlashcardUpdate(existing, card.answer, desiredTagIds)) {
        console.log(
          `[SKIP] Flashcard exists: "${card.question.slice(0, 80)}${card.question.length > 80 ? '…' : ''}"`,
        )
        stats.skipped += 1
        continue
      }

      if (dryRun) {
        console.log(`[DRY-RUN] [UPDATE] Flashcard id=${existing.id}`)
        stats.updated += 1
        continue
      }

      await prisma.flashcard.update({
        where: { id: existing.id },
        data: {
          answer: card.answer,
          tags: { set: desiredTagIds.map((id) => ({ id })) },
        },
      })
      console.log(`[UPDATE] Flashcard id=${existing.id}`)
      stats.updated += 1
    } catch (err) {
      stats.errors.push({ index: i + 1, error: err.message || String(err) })
      console.error(`[ERROR] Flashcard row ${i + 1}: ${err.message || err}`)
    }
  }

  return stats
}

module.exports = {
  importFlashcardsFromList,
  upsertFlashcardDeck,
  findFlashcardByQuestionTagsAndDeck,
}
