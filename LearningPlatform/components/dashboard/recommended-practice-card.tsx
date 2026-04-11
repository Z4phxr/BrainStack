'use client'

/**
 * RecommendedPracticeCard
 *
 * Appears on the student dashboard to surface personalised task recommendations.
 * Clicking "Start Practice" navigates to /practice after pre-fetching a session.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Loader2, Zap } from 'lucide-react'

export function RecommendedPracticeCard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleStartPractice() {
    setLoading(true)
    setError(null)

    try {
      // Verify/kick-off session generation before navigating so errors surface here.
      const res = await fetch('/api/practice/session?limit=10')

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to start practice session')
      }

      const data = await res.json()

      if (!data.tasks || data.tasks.length === 0) {
        setError('No tasks available right now. Complete some lessons first!')
        return
      }

      // Pass sessionId via search param so the practice page can refetch.
      router.push(`/practice?session=${data.sessionId}`)
    } catch {
      setError('Unable to start practice session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="px-4 py-8 sm:px-6">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
          {/* Column 1 — CTA and mix */}
          <div className="flex w-full flex-col items-center justify-center gap-4 text-center">
            <div className="space-y-2">
              <CardTitle className="flex flex-wrap items-center justify-center gap-2.5 text-xl font-bold tracking-tight md:text-2xl">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm"
                  aria-hidden
                >
                  <Zap className="h-5 w-5 text-white" />
                </span>
                <span className="flex flex-wrap items-center justify-center gap-2">
                  Recommended Practice
                  <Badge variant="secondary" className="text-sm font-normal md:text-base">
                    Adaptive
                  </Badge>
                </span>
              </CardTitle>
              <CardDescription className="text-base leading-relaxed md:text-lg">
                Practice tasks selected based on your performance.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-gray-500 dark:text-gray-400 md:text-base">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-5 w-5 shrink-0" />
                <span>~40% weak tags</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600" aria-hidden>
                •
              </span>
              <div className="flex items-center gap-1.5">
                <Zap className="h-5 w-5 shrink-0" />
                <span>~30% medium tags</span>
              </div>
              <span className="text-gray-300 dark:text-gray-600" aria-hidden>
                •
              </span>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-5 w-5 shrink-0" />
                <span>~30% random</span>
              </div>
            </div>

            {error && (
              <p className="text-base leading-relaxed text-red-600 dark:text-red-400 md:text-lg">{error}</p>
            )}

            <Button
              onClick={handleStartPractice}
              disabled={loading}
              size="default"
              className="bg-indigo-600 text-sm hover:bg-indigo-700 md:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing session…
                </>
              ) : (
                'Start Practice'
              )}
            </Button>
          </div>

          {/* Column 2 — how it works */}
          <div className="flex w-full flex-col items-center justify-center gap-4 border-border border-t pt-8 text-center md:border-t-0 md:border-l md:pt-0 md:pl-10 lg:pl-12">
            <h3 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              How does adaptive practice work?
            </h3>
            <p className="max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-400 md:text-lg">
              Our adaptive engine identifies the topics you struggle with most and builds a
              personalised session to help you improve faster.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
