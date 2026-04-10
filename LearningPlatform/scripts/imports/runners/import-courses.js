const path = require('path')
const { loadEnv, scanDataJsFiles, parseRunnerArgs, printRunnerHelp, validateCourseFileExport } = require('../helpers/utils')
const { createPrismaClient } = require('../helpers/prisma-client')
const { initPayloadClient } = require('../helpers/payload-client')
const { importCourseStructure } = require('../helpers/course-import')

const APP_ROOT = path.join(__dirname, '../../..')
const DATA_DIR = path.join(__dirname, '../data/courses')

async function run() {
  loadEnv(APP_ROOT)
  const opts = parseRunnerArgs()
  if (opts.help) {
    printRunnerHelp('import-courses.js — full course tree via Payload + Prisma task tags')
    return 0
  }

  const { prisma, disconnect } = createPrismaClient()
  const files = scanDataJsFiles(DATA_DIR)
  if (files.length === 0) {
    console.log(`[INFO] No course data files found in ${DATA_DIR}`)
    console.log(
      '[HINT] In Docker, data ships inside the image — rebuild (`docker compose build app`) or mount ./scripts/imports (see DOCKER.md).',
    )
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
      console.log(`\n[INFO] Course file: ${path.relative(APP_ROOT, filePath)}`)
      let exported
      try {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        exported = require(filePath)
      } catch (err) {
        console.error(`[ERROR] Failed to load ${filePath}: ${err.message}`)
        hadError = true
        continue
      }

      const structure = exported?.default ?? exported

      try {
        validateCourseFileExport(structure, { strict: opts.strict })
      } catch (err) {
        console.error(`[ERROR] Validation failed: ${err.message}`)
        hadError = true
        continue
      }

      try {
        await importCourseStructure({
          payload,
          prisma,
          structure,
          dryRun: opts.dryRun,
        })
      } catch (err) {
        console.error(`[ERROR] Course import failed: ${err.message || err}`)
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
