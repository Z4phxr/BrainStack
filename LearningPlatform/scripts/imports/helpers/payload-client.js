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
    const mod = await import('@payload-config')
    return await unwrapConfig(mod)
  } catch (err) {
    throw new Error(
      'Could not load Payload config. Run via tsx with tsconfig.scripts.json (see scripts/imports/README.md). ' +
        `Last error: ${err?.message || err}`,
    )
  }
}

async function initPayloadClient(payloadSecret) {
  if (!payloadSecret) {
    throw new Error('PAYLOAD_SECRET is not set for Payload import scripts.')
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
