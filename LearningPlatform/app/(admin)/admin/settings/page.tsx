'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LessonReadingSizeSettings } from '@/components/settings/lesson-reading-size'

const STORAGE_KEY = 'theme'

export default function AdminSettingsPage() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (stored === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
      return
    }
    if (stored === 'light') {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
      return
    }

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    setIsDark(prefersDark)
    document.documentElement.classList.toggle('dark', prefersDark)
  }, [])

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Personalize your admin experience</p>
      </div>

      <LessonReadingSizeSettings />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Dark mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Toggle the admin theme</p>
          </div>
          <Button type="button" variant="outline" onClick={toggleTheme}>
            {isDark ? 'Disable' : 'Enable'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
