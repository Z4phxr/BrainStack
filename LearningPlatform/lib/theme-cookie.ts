/** Cookie mirrored from `localStorage.theme` so the root layout can SSR the correct `<html class>`. */
export const THEME_COOKIE_NAME = 'theme' as const

export type ThemePreference = 'light' | 'dark'

const MAX_AGE_SEC = 60 * 60 * 24 * 365

/** Client: persist theme for the next full page load / SSR. */
export function writeThemeCookie(value: ThemePreference) {
  if (typeof document === 'undefined') return
  document.cookie = `${THEME_COOKIE_NAME}=${value}; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`
}

/** Server: read theme from request cookies. Default matches previous inline script (`dark`). */
export function readThemeFromCookie(cookieValue: string | undefined): ThemePreference {
  if (cookieValue === 'light') return 'light'
  return 'dark'
}
