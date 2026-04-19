'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LessonReadingSizeSettings } from '@/components/settings/lesson-reading-size'
import { getActivityLoggingSetting, setActivityLoggingSetting } from '@/app/(admin)/admin/actions/platform-settings'
import { cn } from '@/lib/utils'
import { adminGlassCard, adminGlassOutlineButton } from '@/lib/student-glass-styles'

export default function AdminSettingsPage() {
  const [activityLogging, setActivityLogging] = useState<boolean | null>(null)
  const [activityLoggingSaving, setActivityLoggingSaving] = useState(false)
  const [activityLoggingError, setActivityLoggingError] = useState('')

  useEffect(() => {
    let cancelled = false
    void getActivityLoggingSetting()
      .then((v) => {
        if (!cancelled) setActivityLogging(v)
      })
      .catch(() => {
        if (!cancelled) setActivityLoggingError('Could not load activity log setting.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function toggleActivityLogging() {
    if (activityLogging === null || activityLoggingSaving) return
    const next = !activityLogging
    setActivityLoggingSaving(true)
    setActivityLoggingError('')
    const res = await setActivityLoggingSetting(next)
    setActivityLoggingSaving(false)
    if (res.ok) {
      setActivityLogging(next)
    } else {
      setActivityLoggingError(res.error)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">Settings</h1>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400 md:text-lg">Personalize your admin experience</p>
      </div>

      <LessonReadingSizeSettings />

      <Card className={cn('border-0 shadow-none', adminGlassCard)}>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">Activity logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Record new activity</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                When off, no new rows are written to Activity Logs. Existing entries stay. Turn on again to resume
                recording.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className={cn(adminGlassOutlineButton, 'shrink-0')}
              disabled={activityLogging === null || activityLoggingSaving}
              onClick={toggleActivityLogging}
            >
              {activityLogging === null
                ? 'Loading…'
                : activityLoggingSaving
                  ? 'Saving…'
                  : activityLogging
                    ? 'Turn off logging'
                    : 'Turn on logging'}
            </Button>
          </div>
          {activityLogging !== null ? (
            <p className="text-xs text-muted-foreground">
              Status:{' '}
              <span className="font-medium text-foreground">
                {activityLogging ? 'Logging is on' : 'Logging is paused'}
              </span>
            </p>
          ) : null}
          {activityLoggingError ? (
            <p className="text-sm text-destructive" role="alert">
              {activityLoggingError}
            </p>
          ) : null}
        </CardContent>
      </Card>

    </div>
  )
}
