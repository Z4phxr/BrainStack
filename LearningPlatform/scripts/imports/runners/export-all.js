const path = require('path')
const { loadEnv } = require('../helpers/utils')
const { parseExportArgs, printExportHelp, resolveExportDir, ensureDir } = require('../helpers/export-utils')

const APP_ROOT = path.join(__dirname, '../../..')

async function run(argv) {
  loadEnv(APP_ROOT)
  const opts = parseExportArgs(argv)
  if (opts.help) {
    printExportHelp('export-all.js — tags → courses → flashcards (import-compatible)')
    return 0
  }

  const outRoot = resolveExportDir(APP_ROOT, opts.outDir)
  if (!opts.dryRun) {
    ensureDir(outRoot)
  }
  console.log(`[INFO] export-all: ${outRoot}`)

  const sharedOut = ['--out', outRoot]
  if (opts.dryRun) sharedOut.push('--dry-run')
  if (opts.usedTagsOnly) sharedOut.push('--used-tags-only')

  const tags = require('./export-tags')
  const courses = require('./export-courses')
  const flashcards = require('./export-flashcards')

  const steps = [
    { name: 'tags', run: () => tags.run(sharedOut) },
    { name: 'courses', run: () => courses.run(sharedOut) },
    { name: 'flashcards', run: () => flashcards.run(sharedOut) },
  ]

  for (const step of steps) {
    console.log(`\n========== [INFO] Export step: ${step.name} ==========`)
    // eslint-disable-next-line no-await-in-loop
    const code = await step.run()
    if (code !== 0) {
      console.error(`[ERROR] export-all: failed at "${step.name}"`)
      return code
    }
  }

  console.log('\n[INFO] export-all complete')
  console.log('[HINT] Re-import: copy files into scripts/imports/data-private/{tags,courses,flashcards}/ then:')
  console.log('       npm run content:import:all')
  return 0
}

if (require.main === module) {
  run()
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error('[ERROR] export-all:', err.message || err)
      process.exit(1)
    })
}

module.exports = { run }
