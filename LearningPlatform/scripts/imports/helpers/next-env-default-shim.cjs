// Shim for environments where transpiled code expects `@next/env` default export.
try {
  // eslint-disable-next-line global-require
  const nextEnv = require('@next/env')
  if (nextEnv && nextEnv.default == null) {
    nextEnv.default = nextEnv
  }
} catch {
  // noop
}
