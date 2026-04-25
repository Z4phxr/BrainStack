const path = require('path')
const { pathToFileURL } = require('url')

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
  const configJsPath = path.join(__dirname, '../../../src/payload/payload.config.js')
  try {
    const mod = await import(pathToFileURL(configJsPath).href)
    return await unwrapConfig(mod)
  } catch (err) {
    const errDetails = err?.stack || err?.message || String(err)
    throw new Error(
      'Could not load Payload config via src/payload/payload.config.js import path. ' +
        `Last error: ${errDetails}`,
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

  // Payload's CJS loadEnv helper expects `require('@next/env').default`.
  // Newer @next/env exports only named symbols, so we add a compatible default alias.
  try {
    // eslint-disable-next-line global-require
    const nextEnv = require('@next/env')
    if (nextEnv && nextEnv.default == null) {
      // eslint-disable-next-line no-param-reassign
      nextEnv.default = nextEnv
    }
  } catch {
    // no-op: importer will fail later with a clearer message if @next/env is missing
  }

  // eslint-disable-next-line global-require
  const { getPayload } = require('payload')
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
