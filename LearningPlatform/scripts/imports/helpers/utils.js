const path = require('path')
const crypto = require('crypto')
const fs = require('fs')

/**
 * Load .env from the NestJS/Next app root (directory containing package.json).
 * Call from runners with the app root, e.g. loadEnv(path.join(__dirname, '../../..'))
 */
function loadEnv(appRoot) {
  const root = appRoot || process.cwd()
  // eslint-disable-next-line global-require
  require('dotenv').config({ path: path.join(root, '.env') })
}

function parseRunnerArgs(argv) {
  const args = argv || process.argv.slice(2)
  return {
    dryRun: args.includes('--dry-run') || process.env.IMPORT_DRY_RUN === '1',
    strict: args.includes('--strict'),
    help: args.includes('--help') || args.includes('-h'),
  }
}

function printRunnerHelp(title) {
  console.log(`${title}
Options:
  --dry-run   Log actions only (no writes to Payload/Prisma)
  --strict    Fail fast on validation errors
  --help      Show this message
`)
}

/**
 * Sorted .js files directly under a data folder (no subfolders), excluding dotfiles.
 */
function scanDataJsFiles(dataDir) {
  if (!fs.existsSync(dataDir)) {
    return []
  }

  const names = fs.readdirSync(dataDir)
  return names
    .filter((n) => n.endsWith('.js') && !n.startsWith('.'))
    .sort((a, b) => a.localeCompare(b))
    .map((n) => path.join(dataDir, n))
}

function isLexicalRichText(value) {
  return (
    !!value &&
    typeof value === 'object' &&
    !!value.root &&
    typeof value.root === 'object' &&
    Array.isArray(value.root.children)
  )
}

function textToLexical(value) {
  if (isLexicalRichText(value)) {
    return value
  }

  const text = typeof value === 'string' ? value : value == null ? '' : String(value)

  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text,
            },
          ],
        },
      ],
    },
  }
}

function normalizeWhitespace(s) {
  return String(s || '').trim().replace(/\s+/g, ' ')
}

/**
 * Stable idempotency key for flashcards (no DB column required).
 * Uses question + canonical tag slug list.
 */
function flashcardDedupeKey(question, tagSlugs) {
  const q = normalizeWhitespace(question)
  const tags = [...new Set((tagSlugs || []).map((t) => String(t).trim()).filter(Boolean))].sort()
  const payload = `${q}\u0000${tags.join('\u0000')}`
  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex')
}

function assertNonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string`)
  }
}

function assertPlainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a plain object`)
  }
}

function validateCourseFileExport(data, { strict }) {
  assertPlainObject(data, 'Course file export')
  assertPlainObject(data.subject, 'subject')
  assertNonEmptyString(data.subject.slug, 'subject.slug')
  assertNonEmptyString(data.subject.name, 'subject.name')
  assertPlainObject(data.course, 'course')
  assertNonEmptyString(data.course.slug, 'course.slug')
  assertNonEmptyString(data.course.title, 'course.title')
  if (data.course.level != null) {
    const allowed = new Set(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
    if (!allowed.has(data.course.level)) {
      throw new Error(`course.level must be one of: ${[...allowed].join(', ')}`)
    }
  }
  if (!Array.isArray(data.modules)) {
    throw new Error('modules must be an array')
  }
  if (data.modules.length === 0 && strict) {
    throw new Error('strict mode: modules must be non-empty')
  }
  for (const mod of data.modules) {
    assertPlainObject(mod, 'module')
    if (typeof mod.order !== 'number' || !Number.isFinite(mod.order)) {
      throw new Error('module.order must be a finite number')
    }
    assertNonEmptyString(mod.title, 'module.title')
    if (!Array.isArray(mod.lessons)) {
      throw new Error(`module "${mod.title}" lessons must be an array`)
    }
    for (const lesson of mod.lessons) {
      assertPlainObject(lesson, 'lesson')
      if (typeof lesson.order !== 'number' || !Number.isFinite(lesson.order)) {
        throw new Error('lesson.order must be a finite number')
      }
      assertNonEmptyString(lesson.title, 'lesson.title')
      if (lesson.theoryBlocks != null && !Array.isArray(lesson.theoryBlocks)) {
        throw new Error('lesson.theoryBlocks must be an array when set')
      }
      if (!Array.isArray(lesson.tasks)) {
        throw new Error('lesson.tasks must be an array')
      }
    }
  }
}

function validateModuleFileExport(data, { strict }) {
  assertPlainObject(data, 'Module file export')
  assertNonEmptyString(data.courseSlug, 'courseSlug')
  if (data.module) {
    assertPlainObject(data.module, 'module')
  }
  if (!data.module && !Array.isArray(data.modules)) {
    throw new Error('Provide `module` or non-empty `modules` array')
  }
  if (Array.isArray(data.modules) && data.modules.length === 0 && strict) {
    throw new Error('strict mode: modules array must be non-empty')
  }
  const modules = []
  if (data.module) {
    modules.push(data.module)
  }
  if (Array.isArray(data.modules)) {
    modules.push(...data.modules)
  }
  for (const mod of modules) {
    assertPlainObject(mod, 'module')
    if (typeof mod.order !== 'number' || !Number.isFinite(mod.order)) {
      throw new Error('module.order must be a finite number')
    }
    assertNonEmptyString(mod.title, 'module.title')
    if (!Array.isArray(mod.lessons)) {
      throw new Error(`module "${mod.title}" lessons must be an array`)
    }
    for (const lesson of mod.lessons) {
      assertPlainObject(lesson, 'lesson')
      if (typeof lesson.order !== 'number' || !Number.isFinite(lesson.order)) {
        throw new Error('lesson.order must be a finite number')
      }
      assertNonEmptyString(lesson.title, 'lesson.title')
      if (lesson.theoryBlocks != null && !Array.isArray(lesson.theoryBlocks)) {
        throw new Error('lesson.theoryBlocks must be an array when set')
      }
      if (!Array.isArray(lesson.tasks)) {
        throw new Error('lesson.tasks must be an array')
      }
    }
  }
}

module.exports = {
  loadEnv,
  parseRunnerArgs,
  printRunnerHelp,
  scanDataJsFiles,
  isLexicalRichText,
  textToLexical,
  normalizeWhitespace,
  flashcardDedupeKey,
  assertNonEmptyString,
  assertPlainObject,
  validateCourseFileExport,
  validateModuleFileExport,
}
