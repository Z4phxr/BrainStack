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

function normalizeFlashcardExport(exported, filePath) {
  const baseSlug = slugifyDeckBasename(path.basename(filePath, '.js'))

  if (Array.isArray(exported)) {
    return {
      deckSpec: { slug: baseSlug, name: deckTitleFromSlug(baseSlug) },
      cards: exported,
    }
  }

  if (exported && typeof exported === 'object' && Array.isArray(exported.cards)) {
    const deck = exported.deck && typeof exported.deck === 'object' ? exported.deck : {}
    const slug =
      typeof deck.slug === 'string' && deck.slug.trim() ? deck.slug.trim() : baseSlug
    const name =
      typeof deck.name === 'string' && deck.name.trim() ? deck.name.trim() : deckTitleFromSlug(slug)
    return {
      deckSpec: {
        slug,
        name,
        description: deck.description,
        tagSlugs: deck.tagSlugs,
      },
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
          `[ERROR] ${path.basename(filePath)} must export an array of cards or { deck?, cards: [...] }`,
        )
        hadError = true
        continue
      }

      const { deckSpec, cards } = normalized

      try {
        const { id: deckId } = await upsertFlashcardDeck(prisma, deckSpec, { dryRun: opts.dryRun })
        const result = await importFlashcardsFromList(prisma, cards, { dryRun: opts.dryRun, deckId })
        if (result.errors.length > 0) {
          hadError = true
        }
        console.log('[INFO] Flashcards batch summary:', {
          created: result.created,
          updated: result.updated,
          skipped: result.skipped,
          errors: result.errors.length,
        })
      } catch (err) {
        console.error(`[ERROR] ${path.basename(filePath)}: ${err.message || err}`)
        hadError = true
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
