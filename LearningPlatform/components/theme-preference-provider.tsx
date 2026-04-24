'use client'

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { ThemePreference } from '@/lib/theme-cookie'
import { writeThemeCookie } from '@/lib/theme-cookie'
import { resolveThemePreference } from '@/lib/resolve-theme-preference'

const ThemeIsDarkContext = createContext<boolean | undefined>(undefined)

function applyDomTheme(pref: ThemePreference) {
  document.documentElement.classList.toggle('dark', pref === 'dark')
  writeThemeCookie(pref)
}

export function ThemePreferenceProvider({
  initialPreference,
  children,
}: {
  initialPreference: ThemePreference
  children: ReactNode
}) {
  const [preference, setPreference] = useState<ThemePreference>(initialPreference)
  const isDark = preference === 'dark'

  /** Apply cookie + class immediately; defer setState so we do not sync-setState inside an effect (react-hooks/set-state-in-effect). */
  useLayoutEffect(() => {
    try {
      const ls = localStorage.getItem('theme')
      const resolved = resolveThemePreference(ls, document.cookie)
      applyDomTheme(resolved)
      if (resolved !== initialPreference) {
        queueMicrotask(() => setPreference(resolved))
      }
    } catch {
      try {
        document.documentElement.classList.add('dark')
        writeThemeCookie('dark')
        if (initialPreference !== 'dark') {
          queueMicrotask(() => setPreference('dark'))
        }
      } catch {
        /* noop */
      }
    }
  }, [initialPreference])

  const syncFromBrowser = useCallback(() => {
    try {
      const ls = localStorage.getItem('theme')
      const resolved = resolveThemePreference(ls, document.cookie)
      applyDomTheme(resolved)
      setPreference(resolved)
    } catch {
      try {
        document.documentElement.classList.add('dark')
        writeThemeCookie('dark')
        setPreference('dark')
      } catch {
        /* noop */
      }
    }
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme') syncFromBrowser()
    }
    const onThemeChange = () => syncFromBrowser()
    window.addEventListener('storage', onStorage)
    window.addEventListener('theme-change', onThemeChange as EventListener)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('theme-change', onThemeChange as EventListener)
    }
  }, [syncFromBrowser])

  return <ThemeIsDarkContext.Provider value={isDark}>{children}</ThemeIsDarkContext.Provider>
}

export function useThemeIsDark(): boolean {
  const v = useContext(ThemeIsDarkContext)
  if (v === undefined) {
    throw new Error('useThemeIsDark must be used within ThemePreferenceProvider')
  }
  return v
}
