"use client"
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ThemeToggle() {
  // null = not yet hydrated; avoids SSR/client mismatch
  const [isDark, setIsDark] = useState<boolean | null>(null)

  useEffect(() => {
    // Read real theme state only after mount (client-only)
    try {
      const ls = localStorage.getItem('theme')
      if (ls === 'dark') { setIsDark(true); return }
      if (ls === 'light') { setIsDark(false); return }
      setIsDark(true)
    } catch {
      setIsDark(true)
    }
  }, [])

  useEffect(() => {
    if (isDark === null) return   // not yet mounted — don't touch the DOM
    try {
      if (isDark) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    } catch (e) {
      // noop
    }
  }, [isDark])

  const toggleAndReload = () => {
    const next = !isDark
    try {
      if (next) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    } catch (e) {
      // noop
    }
    // update local state only; avoid reloading so the color transition can animate
    setIsDark(next)
    try {
      // notify other components in this window so they can re-read theme and re-render
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { isDark: next } }))
    } catch (e) {
      // noop
    }
  }

  // Before hydration: render an invisible placeholder with the same size so
  // layout doesn't shift. Both server and client agree on this output.
  if (isDark === null) {
    return (
      <Button
        variant="ghost"
        size="icon-xl"
        aria-label="Toggle theme"
        disabled
        className="opacity-0"
      />
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-xl"
      onClick={toggleAndReload}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="size-6" />
      ) : (
        <Moon className="size-6 text-black dark:text-white" />
      )}
    </Button>
  )
}
