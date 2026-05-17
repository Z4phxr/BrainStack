const path = require('path')
const { loadEnv } = require('../helpers/utils')
const { parseExportArgs, printExportHelp, resolveExportDir, writeJsExport, safeBasename } = require('../helpers/export-utils')
const { createPrismaClient } = require('../helpers/prisma-client')
const { buildFlashcardExportFiles } = require('../helpers/flashcard-export')

const APP_ROOT = path.join(__dirname, '../../..')

async function run(argv) {
  loadEnv(APP_ROOT)
  const opts = parseExportArgs(argv)
  if (opts.help) {
    printExportHelp('export-flashcards.js — Prisma flashcard decks → import-compatible .js files')
    return 0
  }

  const outRoot = resolveExportDir(APP_ROOT, opts.outDir)
  const flashcardsDir = path.join(outRoot, 'flashcards')
  console.log(`[INFO] Export directory: ${outRoot}`)

  const { prisma, disconnect } = createPrismaClient()

  try {
    const files = await buildFlashcardExportFiles(prisma)
    if (files.length === 0) {
      console.log('[INFO] No flashcard decks to export')
      await disconnect()
      return 0
    }

    for (const { basename, data } of files) {
      const file = path.join(flashcardsDir, `${safeBasename(basename)}.js`)
      writeJsExport(file, data, { dryRun: opts.dryRun })
    }

    console.log(`[INFO] Exported ${files.length} flashcard file(s)`)
    await disconnect()
    return 0
  } catch (err) {
    await disconnect()
    throw err
  }
}

if (require.main === module) {
  run()
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error('[ERROR]', err.message || err)
      process.exit(1)
    })
}

module.exports = { run }
