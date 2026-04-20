const path = require('path')
const { loadEnv, scanDataJsFiles, parseRunnerArgs, printRunnerHelp, getImportDataDirs } = require('../helpers/utils')
const { createPrismaClient } = require('../helpers/prisma-client')
const { importTagsFromList } = require('../helpers/tags')

const APP_ROOT = path.join(__dirname, '../../..')
const DATA_DIRS = getImportDataDirs(APP_ROOT, 'tags')

async function run() {
  loadEnv(APP_ROOT)
  const opts = parseRunnerArgs()
  if (opts.help) {
    printRunnerHelp('import-tags.js — import Prisma tags (run FIRST)')
    return 0
  }

  const { prisma, disconnect } = createPrismaClient()
  const files = scanDataJsFiles(DATA_DIRS)
  if (files.length === 0) {
    console.log(`[INFO] No tag data files found in: ${DATA_DIRS.join(', ')}`)
    await disconnect()
    return 0
  }

  const totals = { created: 0, updated: 0, skipped: 0, errors: 0 }

  try {
    for (const filePath of files) {
      console.log(`\n[INFO] Tags file: ${path.relative(APP_ROOT, filePath)}`)
      let exported
      try {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        exported = require(filePath)
      } catch (err) {
        console.error(`[ERROR] Failed to load ${filePath}: ${err.message}`)
        totals.errors += 1
        continue
      }

      const tags = exported?.default ?? exported
      if (!Array.isArray(tags)) {
        console.error(`[ERROR] ${path.basename(filePath)} must export an array of tags`)
        totals.errors += 1
        continue
      }

      const result = await importTagsFromList(prisma, tags, { dryRun: opts.dryRun })
      totals.created += result.created
      totals.updated += result.updated
      totals.skipped += result.skipped
      totals.errors += result.errors.length
      if (result.errors.length > 0) {
        for (const e of result.errors) {
          console.error(`[ERROR] ${e.slug}: ${e.error}`)
        }
      }
    }

    console.log('\n[INFO] Tags import summary:', totals)
    await disconnect()
    return totals.errors > 0 ? 1 : 0
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
