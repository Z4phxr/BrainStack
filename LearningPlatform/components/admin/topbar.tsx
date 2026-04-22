'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { Eye, LogOut, Moon, Settings, Sun } from 'lucide-react'
import Link from 'next/link'
import { adminGlassOutlineButton, adminGlassTopbar } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'

const THEME_KEY = 'theme'

interface AdminTopbarProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function AdminTopbar({ user }: AdminTopbarProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true
    const stored = localStorage.getItem(THEME_KEY)
    return stored !== 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light')
      return next
    })
  }

  const outlineGlass = cn(adminGlassOutlineButton)

  return (
    <div
      className={cn(
        'sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between px-5 md:px-6',
        adminGlassTopbar,
      )}
    >
      <h1 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100 md:text-xl">
        Content management
      </h1>

      <div className="flex items-center gap-2 md:gap-3">
        <Button
          variant="outline"
          size="icon"
          className={outlineGlass}
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="outline" size="icon" className={outlineGlass} asChild aria-label="Admin settings">
          <Link href="/admin/settings">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>

        <Button variant="outline" size="default" className={outlineGlass} asChild>
          <Link href="/dashboard">
            <Eye className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Learner preview</span>
            <span className="sm:hidden">Preview</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2 border-l border-slate-200/60 pl-2 dark:border-white/10 md:pl-3">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-base font-semibold backdrop-blur-sm',
              'border-slate-400/45 bg-slate-200/75 text-slate-800 shadow-sm ring-1 ring-slate-900/[0.06]',
              'dark:border-white/20 dark:bg-white/10 dark:text-gray-100 dark:shadow-none dark:ring-0',
            )}
            aria-hidden
          >
            {(user.name ?? user.email ?? 'A')[0]?.toUpperCase()}
          </div>
          <span className="hidden max-w-[8rem] truncate text-base text-gray-700 dark:text-gray-200 sm:inline sm:max-w-[12rem] md:max-w-none">
            {user.name ?? 'Admin'}
          </span>
          <Button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            variant="outline"
            size="icon"
            className={cn('shrink-0', outlineGlass)}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
