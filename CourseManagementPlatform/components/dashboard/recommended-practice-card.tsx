'use client'

/**
 * RecommendedPracticeCard
 *
 * Appears on the student dashboard to surface personalised task recommendations.
 * Clicking "Start Practice" navigates to /practice after pre-fetching a session.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Recommended Practice
              <Badge variant="secondary" className="text-xs font-normal">Adaptive</Badge>
            </CardTitle>
            <CardDescription>
              Practice tasks selected based on your performance.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Our adaptive engine identifies the topics you struggle with most and builds a
          personalised session to help you improve faster.
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <BookOpen className="w-4 h-4" />
            <span>~40% weak tags</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Zap className="w-4 h-4" />
            <span>~30% medium tags</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <BookOpen className="w-4 h-4" />
            <span>~30% random</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <Button
          onClick={handleStartPractice}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Preparing session…
            </>
          ) : (
            'Start Practice'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
