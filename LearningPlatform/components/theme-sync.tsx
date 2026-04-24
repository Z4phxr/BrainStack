'use client'

import { useLayoutEffect } from 'react'
import {
  THEME_COOKIE_NAME,
  readThemeFromCookie,
  writeThemeCookie,
  type ThemePreference,
} from '@/lib/theme-cookie'

function themeFromDocumentCookie(): ThemePreference | null {
  if (typeof document === 'undefined') return null
  const prefix = `${THEME_COOKIE_NAME}=`
  const part = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith(prefix))
  if (!part) return null
  const raw = part.slice(prefix.length)
  if (raw === 'light' || raw === 'dark') return raw
  return null
}

/**
 * Aligns `<html class="dark">` and the `theme` cookie with `localStorage.theme` before paint,
 * without using a `<script>` tag (React warns on script children during client render).
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    try {
      const ls = localStorage.getItem('theme')
      const resolved: ThemePreference =
        ls === 'light'
          ? 'light'
          : ls === 'dark'
            ? 'dark'
            : themeFromDocumentCookie() ?? readThemeFromCookie(undefined)
      const root = document.documentElement
      root.classList.toggle('dark', resolved === 'dark')
      writeThemeCookie(resolved)
    } catch {
      try {
        document.documentElement.classList.add('dark')
        writeThemeCookie('dark')
      } catch {
        /* noop */
      }
    }
  }, [])
  return null
}
