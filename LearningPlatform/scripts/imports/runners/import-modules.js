const path = require('path')
const { loadEnv, scanDataJsFiles, parseRunnerArgs, printRunnerHelp, getImportDataDirs } = require('../helpers/utils')
const { createPrismaClient } = require('../helpers/prisma-client')
const { initPayloadClient } = require('../helpers/payload-client')
const { importModulePayload } = require('../helpers/module-import')

const APP_ROOT = path.join(__dirname, '../../..')
const DATA_DIRS = getImportDataDirs(APP_ROOT, 'modules')

async function run() {
  loadEnv(APP_ROOT)
  const opts = parseRunnerArgs()
  if (opts.help) {
    printRunnerHelp('import-modules.js — add module(s) to an existing course (by courseSlug)')
    return 0
  }

  const { prisma, disconnect } = createPrismaClient()
  const files = scanDataJsFiles(DATA_DIRS)
  if (files.length === 0) {
    console.log(`[INFO] No module patch files found in: ${DATA_DIRS.join(', ')}`)
    await disconnect()
    return 0
  }

  let payload
  try {
    payload = await initPayloadClient(process.env.PAYLOAD_SECRET)
  } catch (err) {
    console.error('[ERROR] Payload init failed:', err.message || err)
    await disconnect()
    return 1
  }

  let hadError = false

  try {
    for (const filePath of files) {
      console.log(`\n[INFO] Module file: ${path.relative(APP_ROOT, filePath)}`)
      let exported
      try {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        exported = require(filePath)
      } catch (err) {
        console.error(`[ERROR] Failed to load ${filePath}: ${err.message}`)
        hadError = true
        continue
      }

      const data = exported?.default ?? exported

      try {
        await importModulePayload({
          payload,
          prisma,
          data,
          dryRun: opts.dryRun,
          strict: opts.strict,
        })
      } catch (err) {
        console.error(`[ERROR] Module import failed: ${err.message || err}`)
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
