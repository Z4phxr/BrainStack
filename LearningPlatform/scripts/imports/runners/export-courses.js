const path = require('path')
const { loadEnv } = require('../helpers/utils')
const { parseExportArgs, printExportHelp, resolveExportDir, writeJsExport, safeBasename, loadMediaById } = require('../helpers/export-utils')
const { initPayloadClient } = require('../helpers/payload-client')
const { exportAllCourses, exportCourseStructure } = require('../helpers/course-export')

const APP_ROOT = path.join(__dirname, '../../..')

async function run(argv) {
  loadEnv(APP_ROOT)
  const opts = parseExportArgs(argv)
  if (opts.help) {
    printExportHelp('export-courses.js — Payload courses → import-compatible .js files')
    return 0
  }

  const outRoot = resolveExportDir(APP_ROOT, opts.outDir)
  const coursesDir = path.join(outRoot, 'courses')
  console.log(`[INFO] Export directory: ${outRoot}`)

  let payload
  try {
    payload = await initPayloadClient(process.env.PAYLOAD_SECRET)
  } catch (err) {
    console.error('[ERROR] Payload init failed:', err.message || err)
    return 1
  }

  const mediaById = await loadMediaById(payload)
  const courses = await exportAllCourses(payload)

  if (courses.length === 0) {
    console.log('[INFO] No courses to export')
    return 0
  }

  for (const courseDoc of courses) {
    const structure = await exportCourseStructure(payload, courseDoc, mediaById)
    const file = path.join(coursesDir, `${safeBasename(structure.course.slug)}.js`)
    writeJsExport(file, structure, { dryRun: opts.dryRun })
  }

  console.log(`[INFO] Exported ${courses.length} course(s)`)
  return 0
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
