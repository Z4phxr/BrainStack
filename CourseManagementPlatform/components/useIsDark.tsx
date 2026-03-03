"use client"
import { useEffect, useState } from 'react'

export default function useIsDark() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const getTheme = () => {
      try {
        const ls = localStorage.getItem('theme')
        const hasClass = document.documentElement.classList.contains('dark')
        const prefers = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        return ls === 'dark' || (ls == null && (prefers || hasClass)) || hasClass
      } catch (e) {
        return false
      }
    }

    setIsDark(getTheme())

    const mq: MediaQueryList | null = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null
    const onChange = () => setIsDark(getTheme())
    mq?.addEventListener?.('change', onChange)

    // Update when localStorage changes in other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme') setIsDark(getTheme())
    }
    window.addEventListener('storage', onStorage)

    // Update when we dispatch a local theme-change event (same-tab)
    const onThemeChange = () => setIsDark(getTheme())
    window.addEventListener('theme-change', onThemeChange as EventListener)

    return () => {
      mq?.removeEventListener?.('change', onChange)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('theme-change', onThemeChange as EventListener)
    }
  }, [])

  return isDark
}
