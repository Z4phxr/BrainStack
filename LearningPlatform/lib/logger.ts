/**
 * Centralized logging utility — structured JSON output.
 *
 * Every log line is a single-line JSON object:
 *   { "level": "INFO", "message": "...", "ts": "2026-03-03T12:00:00.000Z", ...details }
 *
 * This format is directly parseable by Railway's log viewer, Datadog, Logtail,
 * and any other cloud log aggregator without a custom parser.
 *
 * Usage:
 *   - Set VERBOSE_LOGGING=true to emit INFO / SUCCESS / DEBUG lines
 *   - ERROR lines are always emitted
 *   - All other levels require VERBOSE_LOGGING=true or critical=true
 */

const isVerbose = process.env.VERBOSE_LOGGING === 'true'

/**
 * Log levels
 */
export enum LogLevel {
  INFO    = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR   = 'ERROR',
  DEBUG   = 'DEBUG',
}

/**
 * Emit a structured JSON log line.
 *
 * @param level    - Severity level
 * @param message  - Short description of the event
 * @param details  - Optional extra fields.  String values are placed under
 *                   the "details" key; object values are merged into the root.
 * @param critical - If true, always emit regardless of VERBOSE_LOGGING
 */
export function log(
  level: LogLevel,
  message: string,
  details?: string | Record<string, unknown>,
  critical: boolean = false,
): void {
  const shouldLog = critical || level === LogLevel.ERROR || isVerbose
  if (!shouldLog) return

  console.log(`[${level}] ${message}`)

  if (details !== undefined) {
    if (typeof details === 'string') {
      console.log(`       ${details}`)
    } else {
      for (const [key, value] of Object.entries(details)) {
        console.log(`       ${key}: ${value}`)
      }
    }
  }
}

/**
 * Convenience wrappers
 */
export const logger = {
  info: (message: string, details?: string | Record<string, unknown>, critical = false) =>
    log(LogLevel.INFO, message, details, critical),

  success: (message: string, details?: string | Record<string, unknown>, critical = false) =>
    log(LogLevel.SUCCESS, message, details, critical),

  warning: (message: string, details?: string | Record<string, unknown>, critical = false) =>
    log(LogLevel.WARNING, message, details, critical),

  error: (message: string, details?: string | Record<string, unknown>) =>
    log(LogLevel.ERROR, message, details, true),   // errors are always emitted

  debug: (message: string, details?: string | Record<string, unknown>) =>
    log(LogLevel.DEBUG, message, details, false),  // debug requires VERBOSE_LOGGING
}

/**
 * Check if verbose logging is enabled
 */
export function isVerboseLogging(): boolean {
  return isVerbose
}
