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
 * Find a flashcard with the same question and tag set (order-insensitive).
 */
async function findFlashcardByQuestionAndTags(prisma, question, desiredTagIds) {
  const candidates = await prisma.flashcard.findMany({
    where: { question },
    include: { tags: true },
  })

  const matches = candidates.filter((row) => sameIdList(row.tags.map((t) => t.id), desiredTagIds))

  if (matches.length > 1) {
    console.warn(
      `[WARN] Multiple flashcards share the same question and tag set (${matches.length} rows). Using ${matches[0].id}.`,
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
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {Array<{ question: string, answer: string, tagSlugs?: string[] }>} cards
 */
async function importFlashcardsFromList(prisma, cards, { dryRun }) {
  const stats = { created: 0, updated: 0, skipped: 0, errors: [] }

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
      const dedupeKey = flashcardDedupeKey(card.question, tagSlugs)
      const desiredTagIds = await getTagIdsBySlug(prisma, tagSlugs)

      const uniqueSlugCount = new Set(tagSlugs.map((s) => String(s).trim()).filter(Boolean)).size
      if (uniqueSlugCount !== desiredTagIds.length) {
        console.warn(
          `[WARN] Flashcard ${i + 1}: tagSlugs could not all be resolved (unique=${uniqueSlugCount}, resolved=${desiredTagIds.length}). Import tags first. dedupe=${dedupeKey.slice(0, 10)}…`,
        )
      }

      const existing = await findFlashcardByQuestionAndTags(prisma, card.question, desiredTagIds)

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
  findFlashcardByQuestionAndTags,
}
