import { describe, expect, it } from 'vitest'
import {
  parseThemeFromCookieHeader,
  resolveThemePreference,
} from '@/lib/resolve-theme-preference'

describe('parseThemeFromCookieHeader', () => {
  it('returns null for empty input', () => {
    expect(parseThemeFromCookieHeader(null)).toBeNull()
    expect(parseThemeFromCookieHeader(undefined)).toBeNull()
    expect(parseThemeFromCookieHeader('')).toBeNull()
  })

  it('parses theme cookie among other cookies', () => {
    expect(parseThemeFromCookieHeader('a=1; theme=light; b=2')).toBe('light')
    expect(parseThemeFromCookieHeader('theme=dark')).toBe('dark')
  })

  it('ignores invalid theme value', () => {
    expect(parseThemeFromCookieHeader('theme=banana')).toBeNull()
  })
})

describe('resolveThemePreference', () => {
  it('prefers explicit localStorage over cookie', () => {
    expect(resolveThemePreference('dark', 'theme=light')).toBe('dark')
    expect(resolveThemePreference('light', 'theme=dark')).toBe('light')
  })

  it('falls back to cookie when localStorage is unset or unknown', () => {
    expect(resolveThemePreference(null, 'theme=light')).toBe('light')
    expect(resolveThemePreference('', 'theme=dark')).toBe('dark')
    expect(resolveThemePreference('system', 'theme=light')).toBe('light')
  })

  it('defaults to dark when neither source specifies', () => {
    expect(resolveThemePreference(null, null)).toBe('dark')
    expect(resolveThemePreference(undefined, '')).toBe('dark')
  })
})
