/**
 * Logger utility tests — lib/logger.ts
 *
 * Tests cover:
 * - ERROR level always logs regardless of verbose mode
 * - critical=true always logs regardless of verbose mode
 * - Non-critical INFO/WARNING/DEBUG logs are suppressed in non-verbose mode
 * - Verbose mode (VERBOSE_LOGGING=true) shows all messages
 * - String and object details formatting
 * - logger convenience methods
 * - isVerboseLogging() helper
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Use console.log spy — logger writes everything through console.log
let consoleSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.resetModules()
})

// ─── Helpers to dynamically re-import with different env state ────────────────

async function importLogger(verbose: boolean) {
  vi.stubEnv('VERBOSE_LOGGING', verbose ? 'true' : 'false')
  const mod = await import('@/lib/logger')
  return mod
}

// ─── ERROR level ──────────────────────────────────────────────────────────────

describe('ERROR level — always logged', () => {
  it('logs an error message even when VERBOSE_LOGGING is false', async () => {
    const { log, LogLevel } = await importLogger(false)
    log(LogLevel.ERROR, 'Something broke')
    expect(consoleSpy).toHaveBeenCalledWith('[ERROR] Something broke')
  })

  it('logger.error() always logs', async () => {
    const { logger } = await importLogger(false)
    logger.error('Fatal error')
    expect(consoleSpy).toHaveBeenCalled()
    expect(consoleSpy.mock.calls[0]?.[0]).toContain('Fatal error')
  })
})

// ─── critical=true ────────────────────────────────────────────────────────────

describe('critical=true — always logged regardless of verbose mode', () => {
  it('INFO with critical=true logs in non-verbose mode', async () => {
    const { log, LogLevel } = await importLogger(false)
    log(LogLevel.INFO, 'Important startup message', undefined, true)
    expect(consoleSpy).toHaveBeenCalledWith('[INFO] Important startup message')
  })

  it('WARNING with critical=true logs in non-verbose mode', async () => {
    const { log, LogLevel } = await importLogger(false)
    log(LogLevel.WARNING, 'Config warning', undefined, true)
    expect(consoleSpy).toHaveBeenCalledWith('[WARNING] Config warning')
  })

  it('SUCCESS with critical=true logs in non-verbose mode', async () => {
    const { log, LogLevel } = await importLogger(false)
    log(LogLevel.SUCCESS, 'Migration complete', undefined, true)
    expect(consoleSpy).toHaveBeenCalledWith('[SUCCESS] Migration complete')
  })
})

// ─── Verbose mode log suppression ────────────────────────────────────────────

describe('non-critical INFO/DEBUG — suppressed in non-verbose mode', () => {
  it('does NOT log INFO with critical=false when VERBOSE_LOGGING is false', async () => {
    const { log, LogLevel } = await importLogger(false)
    log(LogLevel.INFO, 'Routine message', undefined, false)
    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('does NOT log DEBUG when VERBOSE_LOGGING is false', async () => {
    const { logger } = await importLogger(false)
    logger.debug('debug detail')
    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('DOES log INFO when VERBOSE_LOGGING is true', async () => {
    const { log, LogLevel } = await importLogger(true)
    log(LogLevel.INFO, 'Verbose info', undefined, false)
    expect(consoleSpy).toHaveBeenCalledWith('[INFO] Verbose info')
  })

  it('DOES log DEBUG when VERBOSE_LOGGING is true', async () => {
    const { logger } = await importLogger(true)
    logger.debug('verbose debug')
    expect(consoleSpy).toHaveBeenCalled()
  })
})

// ─── Output formatting ────────────────────────────────────────────────────────

describe('output formatting', () => {
  it('formats a string detail on a second line with indent', async () => {
    const { log, LogLevel } = await importLogger(true)
    log(LogLevel.INFO, 'Starting service', 'extra detail here')
    expect(consoleSpy).toHaveBeenNthCalledWith(1, '[INFO] Starting service')
    expect(consoleSpy).toHaveBeenNthCalledWith(2, '       extra detail here')
  })

  it('formats each key of an object detail on its own line', async () => {
    const { log, LogLevel } = await importLogger(true)
    log(LogLevel.INFO, 'System info', { db: 'postgres', port: 5432 })
    expect(consoleSpy).toHaveBeenCalledWith('[INFO] System info')
    expect(consoleSpy).toHaveBeenCalledWith('       db: postgres')
    expect(consoleSpy).toHaveBeenCalledWith('       port: 5432')
  })

  it('outputs only the prefix + message when no details are provided', async () => {
    const { log, LogLevel } = await importLogger(true)
    log(LogLevel.SUCCESS, 'Done')
    expect(consoleSpy).toHaveBeenCalledTimes(1)
    expect(consoleSpy).toHaveBeenCalledWith('[SUCCESS] Done')
  })
})

// ─── logger convenience methods ───────────────────────────────────────────────

describe('logger convenience methods', () => {
  it('logger.info() uses [INFO] prefix', async () => {
    const { logger } = await importLogger(true)
    logger.info('info message')
    expect(consoleSpy.mock.calls[0]?.[0]).toContain('[INFO]')
  })

  it('logger.success() uses [SUCCESS] prefix', async () => {
    const { logger } = await importLogger(true)
    logger.success('success')
    expect(consoleSpy.mock.calls[0]?.[0]).toContain('[SUCCESS]')
  })

  it('logger.warning() uses [WARNING] prefix', async () => {
    const { logger } = await importLogger(true)
    logger.warning('warn')
    expect(consoleSpy.mock.calls[0]?.[0]).toContain('[WARNING]')
  })

  it('logger.error() uses [ERROR] prefix', async () => {
    const { logger } = await importLogger(false)
    logger.error('error')
    expect(consoleSpy.mock.calls[0]?.[0]).toContain('[ERROR]')
  })
})

// ─── isVerboseLogging() ───────────────────────────────────────────────────────

describe('isVerboseLogging()', () => {
  it('returns false when VERBOSE_LOGGING is not set to "true"', async () => {
    const { isVerboseLogging } = await importLogger(false)
    expect(isVerboseLogging()).toBe(false)
  })

  it('returns true when VERBOSE_LOGGING is "true"', async () => {
    const { isVerboseLogging } = await importLogger(true)
    expect(isVerboseLogging()).toBe(true)
  })
})
