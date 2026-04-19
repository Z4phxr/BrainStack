"use client"
import { useEffect, useState } from 'react'

export default function useIsDark() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const getTheme = () => {
      try {
        const ls = localStorage.getItem('theme')
        if (ls === 'light') return false
        if (ls === 'dark') return true
        return true
      } catch {
        // Match root layout default (dark) if storage is unavailable
        return true
      }
    }

    setIsDark(getTheme())

    // Update when localStorage changes in other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme') setIsDark(getTheme())
    }
    window.addEventListener('storage', onStorage)

    // Update when we dispatch a local theme-change event (same-tab)
    const onThemeChange = () => setIsDark(getTheme())
    window.addEventListener('theme-change', onThemeChange as EventListener)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('theme-change', onThemeChange as EventListener)
    }
  }, [])

  return isDark
}
