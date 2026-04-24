"use client"
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { writeThemeCookie } from '@/lib/theme-cookie'
import useIsDark from '@/components/useIsDark'

export default function ThemeToggle() {
  const isDark = useIsDark()

  const toggleAndReload = () => {
    const next = !isDark
    try {
      if (next) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
        writeThemeCookie('dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
        writeThemeCookie('light')
      }
    } catch {
      // noop
    }
    try {
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { isDark: next } }))
    } catch {
      // noop
    }
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
