const fs = require('fs')
const path = require('path')
const { pathToFileURL } = require('url')

function ensureScriptsTsconfigEnv() {
  const scriptsTsconfig = path.resolve(__dirname, '../../../tsconfig.scripts.json')
  if (!process.env.TSX_TSCONFIG_PATH) {
    process.env.TSX_TSCONFIG_PATH = scriptsTsconfig
  }
}

/**
 * Plain `node` does not execute TypeScript on `import()`. Use tsx's scoped require so
 * `payload.config.ts` and `@payload-config` resolve like `tsx --tsconfig tsconfig.scripts.json`.
 */
function tryLoadPayloadConfigWithTsxRequire() {
  ensureScriptsTsconfigEnv()
  const { require: tsxRequire } = require('tsx/cjs/api')
  const base = path.join(__dirname, '../../../src/payload/payload.config')
  const tsPath = `${base}.ts`
  if (fs.existsSync(tsPath)) {
    return tsxRequire(tsPath, __filename)
  }
  return tsxRequire('@payload-config', __filename)
}

async function unwrapConfig(candidate) {
  let value = candidate

  for (let i = 0; i < 6; i += 1) {
    if (!value) break

    if (typeof value?.then === 'function') {
      value = await value
      continue
    }

    if (typeof value === 'object' && 'default' in value) {
      value = value.default
      continue
    }

    break
  }

  return value
}

async function loadPayloadConfig() {
  const base = path.join(__dirname, '../../../src/payload/payload.config')
  const candidates = [`${base}.ts`, `${base}.js`].map((p) => pathToFileURL(p).href)

  for (const href of candidates) {
    try {
      const mod = await import(href)
      return await unwrapConfig(mod)
    } catch {
      // try next
    }
  }

  try {
    const mod = tryLoadPayloadConfigWithTsxRequire()
    return await unwrapConfig(mod)
  } catch (err) {
    throw new Error(
      'Could not load Payload config. Install devDependency `tsx` and use tsconfig.scripts.json (see scripts/imports/README.md). ' +
        `Last error: ${err?.message || err}`,
    )
  }
}

async function initPayloadClient(payloadSecret) {
  if (!payloadSecret) {
    throw new Error('PAYLOAD_SECRET is not set for Payload import scripts.')
  }

  // In dev, Payload’s Postgres adapter runs Drizzle “push” on connect unless this is set.
  // Push issues `ALTER ... payload_locked_documents.id ... uuid`, which fails on DBs that
  // still have SERIAL lock-table ids (see migration 2026-04-10_convert_locked_documents_to_uuid).
  // Imports should not mutate schema; run `npm run payload:migrate` to align the database.
  if (process.env.PAYLOAD_MIGRATING !== 'false') {
    process.env.PAYLOAD_MIGRATING = 'true'
  }

  const { getPayload } = await import('payload')
  const config = await loadPayloadConfig()
  const effectiveConfig = config?.secret ? config : { ...config, secret: payloadSecret }

  if (!Array.isArray(effectiveConfig?.collections)) {
    throw new Error('Payload config is invalid (missing collections array after unwrap).')
  }

  return getPayload({
    config: effectiveConfig,
    secret: payloadSecret,
  })
}

module.exports = {
  initPayloadClient,
  loadPayloadConfig,
}
