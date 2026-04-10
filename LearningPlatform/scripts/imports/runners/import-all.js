const path = require('path')
const { loadEnv, parseRunnerArgs, printRunnerHelp } = require('../helpers/utils')

const APP_ROOT = path.join(__dirname, '../../..')

async function run() {
  loadEnv(APP_ROOT)
  const opts = parseRunnerArgs()
  if (opts.help) {
    printRunnerHelp('import-all.js — tags → courses → modules → flashcards')
    return 0
  }

  const tags = require('./import-tags')
  const courses = require('./import-courses')
  const modules = require('./import-modules')
  const flashcards = require('./import-flashcards')

  const steps = [
    { name: 'tags', run: tags.run },
    { name: 'courses', run: courses.run },
    { name: 'modules', run: modules.run },
    { name: 'flashcards', run: flashcards.run },
  ]

  console.log('[INFO] import-all: pipeline start', { dryRun: opts.dryRun, strict: opts.strict })
  if (opts.dryRun) {
    console.log('[INFO] Dry-run: no database writes (remove --dry-run to import for real).')
  }

  for (const step of steps) {
    console.log(`\n========== [INFO] Step: ${step.name} ==========`)
    // eslint-disable-next-line no-await-in-loop
    const code = await step.run()
    if (code !== 0) {
      console.error(`[ERROR] import-all: stopping after failed step "${step.name}" (code ${code})`)
      return code
    }
  }

  console.log('\n[INFO] import-all: pipeline complete')
  return 0
}

if (require.main === module) {
  run()
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error('[ERROR] import-all:', err.message || err)
      process.exit(1)
    })
}

module.exports = { run }
