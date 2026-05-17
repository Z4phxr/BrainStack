const fs = require('fs')
const path = require('path')

const PLACEHOLDER_MEDIA_FILENAME = 'lesson-theory-placeholder.svg'
const IMPORT_PLACEHOLDER_IMAGE_TOKEN = '__IMPORT_PLACEHOLDER_IMAGE__'

function lexicalToPlainText(content) {
  if (!content) return ''
  if (typeof content === 'string') return content

  const texts = []

  function walk(node) {
    if (!node) return
    if (node?.text) texts.push(String(node.text))
    if (Array.isArray(node?.children)) node.children.forEach(walk)
    if (node?.root) walk(node.root)
  }

  walk(content)
  return texts.join(' ').trim()
}

function parseExportArgs(argv) {
  const args = argv || process.argv.slice(2)
  const dryRun = args.includes('--dry-run') || process.env.IMPORT_DRY_RUN === '1'
  const help = args.includes('--help') || args.includes('-h')
  const usedTagsOnly = args.includes('--used-tags-only')

  let outDir = null
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--out' && args[i + 1]) {
      outDir = args[i + 1]
      i += 1
    }
  }

  return { dryRun, help, usedTagsOnly, outDir }
}

function printExportHelp(title) {
  console.log(`${title}
Options:
  --out <dir>         Output directory (default: scripts/imports/data-private/export-<timestamp>)
  --used-tags-only    Export only tags referenced by tasks/flashcards (default: all tags)
  --dry-run           Log only, do not write files
  --help              Show this message

Re-import order (same as import):
  npm run content:import:tags
  npm run content:import:course   (copy exported courses/*.js into data/courses/ or data-private/courses/)
  npm run content:import:flashcards
  Or: npm run content:import:all
`)
}

function defaultExportDir(appRoot) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return path.join(appRoot, 'scripts/imports/data-private', `export-${stamp}`)
}

function resolveExportDir(appRoot, outDir) {
  const dir = outDir ? path.resolve(appRoot, outDir) : defaultExportDir(appRoot)
  return dir
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function safeBasename(slug) {
  return String(slug)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'export'
}

/** Write `module.exports = …` file (import-compatible). */
function writeJsExport(filePath, data, { dryRun }) {
  const body = `/**\n * Auto-exported — safe to re-import with content:import:* runners.\n */\nmodule.exports = ${JSON.stringify(data, null, 2)}\n`
  if (dryRun) {
    console.log(`[DRY-RUN] Would write ${filePath}`)
    return
  }
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, body, 'utf8')
  console.log(`[WRITE] ${filePath}`)
}

function omitUndefined(obj) {
  if (obj == null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj
  }
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue
    out[k] = omitUndefined(v)
  }
  return out
}

/**
 * Map Payload media id → import token or assets basename.
 * @param {Map<string, { filename?: string }>} mediaById
 */
function mediaRefForImport(mediaId, mediaById) {
  if (mediaId == null || mediaId === '') return undefined
  const key = String(mediaId)
  const row = mediaById.get(key)
  const filename = row?.filename ? String(row.filename) : ''
  if (!filename) return IMPORT_PLACEHOLDER_IMAGE_TOKEN
  if (filename === PLACEHOLDER_MEDIA_FILENAME) {
    return IMPORT_PLACEHOLDER_IMAGE_TOKEN
  }
  const assetPath = path.join(__dirname, '../assets', path.basename(filename))
  if (fs.existsSync(assetPath)) {
    return path.basename(filename)
  }
  return IMPORT_PLACEHOLDER_IMAGE_TOKEN
}

async function loadMediaById(payload) {
  const map = new Map()
  let page = 1
  for (;;) {
    const res = await payload.find({
      collection: 'media',
      limit: 200,
      page,
      depth: 0,
      overrideAccess: true,
    })
    for (const doc of res.docs) {
      map.set(String(doc.id), { filename: doc.filename })
    }
    if (!res.hasNextPage) break
    page += 1
  }
  return map
}

module.exports = {
  PLACEHOLDER_MEDIA_FILENAME,
  IMPORT_PLACEHOLDER_IMAGE_TOKEN,
  lexicalToPlainText,
  parseExportArgs,
  printExportHelp,
  defaultExportDir,
  resolveExportDir,
  ensureDir,
  safeBasename,
  writeJsExport,
  omitUndefined,
  mediaRefForImport,
  loadMediaById,
}
