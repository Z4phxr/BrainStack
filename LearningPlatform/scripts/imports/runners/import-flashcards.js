const path = require('path')
const { loadEnv, scanDataJsFiles, parseRunnerArgs, printRunnerHelp } = require('../helpers/utils')
const { createPrismaClient } = require('../helpers/prisma-client')
const { importFlashcardsFromList } = require('../helpers/flashcard-import')

const APP_ROOT = path.join(__dirname, '../../..')
const DATA_DIR = path.join(__dirname, '../data/flashcards')

async function run() {
  loadEnv(APP_ROOT)
  const opts = parseRunnerArgs()
  if (opts.help) {
    printRunnerHelp('import-flashcards.js — Prisma flashcards (after tags)')
    return 0
  }

  const { prisma, disconnect } = createPrismaClient()
  const files = scanDataJsFiles(DATA_DIR)
  if (files.length === 0) {
    console.log(`[INFO] No flashcard data files found in ${DATA_DIR}`)
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

      const cards = exported?.default ?? exported
      if (!Array.isArray(cards)) {
        console.error(`[ERROR] ${path.basename(filePath)} must export an array`)
        hadError = true
        continue
      }

      const result = await importFlashcardsFromList(prisma, cards, { dryRun: opts.dryRun })
      if (result.errors.length > 0) {
        hadError = true
      }
      console.log('[INFO] Flashcards batch summary:', {
        created: result.created,
        updated: result.updated,
        skipped: result.skipped,
        errors: result.errors.length,
      })
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
