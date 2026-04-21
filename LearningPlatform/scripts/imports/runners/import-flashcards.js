const path = require('path')
const {
  loadEnv,
  scanDataJsFiles,
  parseRunnerArgs,
  printRunnerHelp,
  slugifyDeckBasename,
  deckTitleFromSlug,
  getImportDataDirs,
} = require('../helpers/utils')
const { createPrismaClient } = require('../helpers/prisma-client')
const { importFlashcardsFromList, upsertFlashcardDeck } = require('../helpers/flashcard-import')

const APP_ROOT = path.join(__dirname, '../../..')
const DATA_DIRS = getImportDataDirs(APP_ROOT, 'flashcards')

/**
 * @param {Record<string, unknown>} deck
 * @param {string} fallbackSlug when `deck.slug` is missing
 */
function deckSpecFromDeckObject(deck, fallbackSlug) {
  const slug =
    typeof deck.slug === 'string' && deck.slug.trim() ? deck.slug.trim() : fallbackSlug
  const name =
    typeof deck.name === 'string' && deck.name.trim() ? deck.name.trim() : deckTitleFromSlug(slug)
  const courseId =
    typeof deck.courseId === 'string' && deck.courseId.trim() ? deck.courseId.trim() : null
  const moduleId =
    typeof deck.moduleId === 'string' && deck.moduleId.trim() ? deck.moduleId.trim() : null
  const parentDeckSlug =
    typeof deck.parentDeckSlug === 'string' && deck.parentDeckSlug.trim()
      ? deck.parentDeckSlug.trim()
      : null
  const subjectId =
    typeof deck.subjectId === 'string' && deck.subjectId.trim() ? deck.subjectId.trim() : null
  return {
    slug,
    name,
    description: deck.description,
    tagSlugs: deck.tagSlugs,
    courseId,
    moduleId,
    parentDeckSlug,
    subjectId,
  }
}

/**
 * @returns {{ kind: 'single', deckSpec: object, cards: unknown[] } | { kind: 'multi', entries: { deckSpec: object, cards: unknown[] }[] } | null}
 */
function normalizeFlashcardExport(exported, filePath) {
  const baseSlug = slugifyDeckBasename(path.basename(filePath, '.js'))

  if (Array.isArray(exported)) {
    const first = exported[0]
    const isMultiDeckChunk =
      exported.length > 0 &&
      first &&
      typeof first === 'object' &&
      first.deck &&
      typeof first.deck === 'object' &&
      Array.isArray(first.cards)

    if (isMultiDeckChunk) {
      const entries = exported.map((entry, idx) => {
        if (!entry || typeof entry !== 'object' || !Array.isArray(entry.cards)) {
          throw new Error(`Entry ${idx + 1}: expected { deck, cards } with cards array`)
        }
        const deck = entry.deck && typeof entry.deck === 'object' ? entry.deck : {}
        const fallbackSlug = `${baseSlug}-m${idx + 1}`
        return {
          deckSpec: deckSpecFromDeckObject(deck, fallbackSlug),
          cards: entry.cards,
        }
      })
      return { kind: 'multi', entries }
    }

    return {
      kind: 'single',
      deckSpec: { slug: baseSlug, name: deckTitleFromSlug(baseSlug) },
      cards: exported,
    }
  }

  if (exported && typeof exported === 'object' && Array.isArray(exported.cards)) {
    const deck = exported.deck && typeof exported.deck === 'object' ? exported.deck : {}
    return {
      kind: 'single',
      deckSpec: deckSpecFromDeckObject(deck, baseSlug),
      cards: exported.cards,
    }
  }

  return null
}

async function run() {
  loadEnv(APP_ROOT)
  const opts = parseRunnerArgs()
  if (opts.help) {
    printRunnerHelp('import-flashcards.js — Prisma flashcard decks + cards (after tags)')
    return 0
  }

  const { prisma, disconnect } = createPrismaClient()
  const files = scanDataJsFiles(DATA_DIRS)
  if (files.length === 0) {
    console.log(`[INFO] No flashcard data files found in: ${DATA_DIRS.join(', ')}`)
    await disconnect()
    return 0
  }

  let hadError = false

  try {
    for (const filePath of files) {
      console.log(`\n[INFO] Flashcards file: ${path.relative(APP_ROOT, filePath)}`)
      let exported
      try {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        exported = require(filePath)
      } catch (err) {
        console.error(`[ERROR] Failed to load ${filePath}: ${err.message}`)
        hadError = true
        continue
      }

      const raw = exported?.default ?? exported
      const normalized = normalizeFlashcardExport(raw, filePath)

      if (!normalized) {
        console.error(
          `[ERROR] ${path.basename(filePath)} must export an array of cards, { deck?, cards: [...] }, or an array of { deck, cards } (chunked subdecks)`,
        )
        hadError = true
        continue
      }

      const batches =
        normalized.kind === 'multi'
          ? normalized.entries.map((e, i) => ({ label: `#${i + 1}`, ...e }))
          : [{ label: '', deckSpec: normalized.deckSpec, cards: normalized.cards }]

      for (const batch of batches) {
        const { deckSpec, cards, label } = batch
        try {
          const prefix = label ? `[${label}] ` : ''
          const { id: deckId } = await upsertFlashcardDeck(prisma, deckSpec, { dryRun: opts.dryRun })
          const result = await importFlashcardsFromList(prisma, cards, { dryRun: opts.dryRun, deckId })
          if (result.errors.length > 0) {
            hadError = true
          }
          console.log(`${prefix}[INFO] Flashcards batch summary:`, {
            deck: deckSpec.slug,
            created: result.created,
            updated: result.updated,
            skipped: result.skipped,
            errors: result.errors.length,
          })
        } catch (err) {
          console.error(`[ERROR] ${path.basename(filePath)}${label ? ` ${label}` : ''}: ${err.message || err}`)
          hadError = true
        }
      }
    }

    await disconnect()
    return hadError ? 1 : 0
  } catch (err) {
    console.error('[ERROR]', err)
    await disconnect()
    return 1
  }
}

if (require.main === module) {
  run()
    .then((code) => process.exit(code))
    .catch(() => process.exit(1))
}

module.exports = { run }
