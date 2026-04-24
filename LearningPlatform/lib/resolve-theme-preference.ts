import {
  THEME_COOKIE_NAME,
  readThemeFromCookie,
  type ThemePreference,
} from '@/lib/theme-cookie'

/** Parse `theme=light|dark` from a raw `Cookie` header (browser or test). */
export function parseThemeFromCookieHeader(cookieHeader: string | null | undefined): ThemePreference | null {
  if (!cookieHeader) return null
  const prefix = `${THEME_COOKIE_NAME}=`
  const part = cookieHeader.split(';').map((c) => c.trim()).find((c) => c.startsWith(prefix))
  if (!part) return null
  const raw = part.slice(prefix.length)
  if (raw === 'light' || raw === 'dark') return raw
  return null
}

/**
 * Single source of truth for resolving theme on the client.
 * Order matches root layout SSR and `ThemePreferenceProvider`: explicit localStorage wins, then cookie, then app default.
 */
export function resolveThemePreference(
  localStorageTheme: string | null | undefined,
  documentCookieHeader: string | null | undefined,
): ThemePreference {
  if (localStorageTheme === 'light') return 'light'
  if (localStorageTheme === 'dark') return 'dark'
  return parseThemeFromCookieHeader(documentCookieHeader) ?? readThemeFromCookie(undefined)
}
