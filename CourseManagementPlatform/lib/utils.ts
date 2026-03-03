import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert an arbitrary string to a URL-safe slug.
 * Lowercases, strips diacritics, collapses non-alphanumeric runs to hyphens,
 * and trims leading/trailing hyphens.
 */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

type PerfResult<T> = { result: T; ms: number }

/**
 * Run an async function and return both its result and the wall-clock duration.
 * Logs timing to the console in non-production environments.
 */
export async function timeAsync<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<PerfResult<T>> {
  const start = performance.now()
  const result = await fn()
  const ms = performance.now() - start
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[perf] ${label}: ${ms.toFixed(1)}ms`)
  }
  return { result, ms }
}
