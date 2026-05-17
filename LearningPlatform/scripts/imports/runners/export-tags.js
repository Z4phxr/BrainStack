const path = require('path')
const { loadEnv } = require('../helpers/utils')
const { parseExportArgs, printExportHelp, resolveExportDir, writeJsExport } = require('../helpers/export-utils')
const { createPrismaClient } = require('../helpers/prisma-client')
const { initPayloadClient } = require('../helpers/payload-client')
const { collectUsedTagSlugs } = require('../helpers/flashcard-export')

const APP_ROOT = path.join(__dirname, '../../..')

async function collectPayloadTaskTagSlugs(payload) {
  const slugs = new Set()
  let page = 1
  for (;;) {
    const res = await payload.find({
      collection: 'tasks',
      limit: 200,
      page,
      depth: 0,
      overrideAccess: true,
    })
    for (const task of res.docs) {
      for (const t of task.tags || []) {
        if (t?.slug) slugs.add(String(t.slug))
      }
    }
    if (!res.hasNextPage) break
    page += 1
  }
  return slugs
}

async function runExportTags({ outRoot, opts, payload }) {
  const { prisma, disconnect } = createPrismaClient()
  try {
    const tagsDir = path.join(outRoot, 'tags')
    let tags

    if (opts.usedTagsOnly) {
      const used = new Set([...(await collectUsedTagSlugs(prisma))])
      if (payload) {
        for (const s of await collectPayloadTaskTagSlugs(payload)) used.add(s)
      }
      tags = await prisma.tag.findMany({
        where: { slug: { in: [...used] } },
        orderBy: { slug: 'asc' },
      })
    } else {
      tags = await prisma.tag.findMany({ orderBy: { slug: 'asc' } })
    }

    const payload = tags.map((t) => ({
      name: t.name,
      slug: t.slug,
      ...(t.main ? { main: true } : {}),
    }))

    writeJsExport(path.join(tagsDir, 'exported-tags.js'), payload, { dryRun: opts.dryRun })
    console.log(`[INFO] Exported ${payload.length} tag(s)`)
    await disconnect()
    return 0
  } catch (err) {
    await disconnect()
    throw err
  }
}

async function run(argv) {
  loadEnv(APP_ROOT)
  const opts = parseExportArgs(argv)
  if (opts.help) {
    printExportHelp('export-tags.js — Prisma tags → import-compatible .js')
    return 0
  }
  const outRoot = resolveExportDir(APP_ROOT, opts.outDir)
  console.log(`[INFO] Export directory: ${outRoot}`)

  let payload = null
  if (opts.usedTagsOnly) {
    try {
      payload = await initPayloadClient(process.env.PAYLOAD_SECRET)
    } catch (err) {
      console.error('[ERROR] Payload init failed (needed for --used-tags-only):', err.message || err)
      return 1
    }
  }

  return runExportTags({ outRoot, opts, payload })
}

if (require.main === module) {
  run()
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error('[ERROR]', err.message || err)
      process.exit(1)
    })
}

module.exports = { run, runExportTags }
