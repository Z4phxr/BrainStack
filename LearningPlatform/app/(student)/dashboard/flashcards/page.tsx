'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Brain, BookOpen, Loader2, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { studentGlassCard, studentGlassPill } from '@/lib/student-glass-styles'
import type { FlashcardDashboardSummary } from '@/lib/flashcards-dashboard-summary'

type Stats = { total: number; newCards: number; due: number }

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <span className={cn(studentGlassPill, 'text-xs')}>
      {label}: <strong className="font-semibold">{value}</strong>
    </span>
  )
}

function StudyButtons({
  srsHref,
  freeHref,
  disabled,
}: {
  srsHref: string
  freeHref: string
  disabled: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Link href={srsHref}>
        <Button className="auth-hero-cta w-full" size="sm" variant="hero" disabled={disabled}>
          <Brain className="mr-1.5 h-4 w-4" />
          SRS Learn
        </Button>
      </Link>
      <Link href={freeHref}>
        <Button className="w-full" size="sm" variant="outline" disabled={disabled}>
          <Zap className="mr-1.5 h-4 w-4" />
          Free Learn
        </Button>
      </Link>
    </div>
  )
}

export default function StudentFlashcardDeckTreePage() {
  const searchParams = useSearchParams()
  const courseSlug = (searchParams.get('courseSlug') ?? '').trim()
  const [summary, setSummary] = useState<FlashcardDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const qs = new URLSearchParams()
        if (courseSlug) qs.set('courseSlug', courseSlug)
        const res = await fetch(`/api/flashcards/dashboard-summary${qs.toString() ? `?${qs.toString()}` : ''}`)
        if (!res.ok) throw new Error('load failed')
        const data = (await res.json()) as FlashcardDashboardSummary
        setSummary(data)
      } catch {
        setError('Could not load deck tree.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [courseSlug])

  const rows = useMemo(() => {
    if (!summary) return []
    if (!courseSlug) return summary.decks
    return summary.decks.filter((d) => d.course.slug === courseSlug)
  }, [summary, courseSlug])

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-5 py-7 md:px-6 md:py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">
          Course flashcard decks
        </h1>
        <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-400 md:text-lg">
          Study per module subdeck or across the full course deck.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading deck tree…
        </div>
      )}

      {error && (
        <Card className={cn('border-0 shadow-none', studentGlassCard)}>
          <CardContent className="py-6 text-center text-red-500">{error}</CardContent>
        </Card>
      )}

      {!loading && !error && rows.length === 0 && (
        <Card className={cn('border-0 shadow-none', studentGlassCard)}>
          <CardContent className="py-10 text-center">
            <BookOpen className="mx-auto mb-2 h-10 w-10 text-gray-300" />
            <p className="text-gray-600 dark:text-gray-400">No started-course flashcard decks found.</p>
          </CardContent>
        </Card>
      )}

      {!loading &&
        !error &&
        rows.map((row) => {
          const mainDeckSlugQ = encodeURIComponent(row.deck.slug)
          return (
            <Card key={row.deck.id} className={cn('border-0 shadow-none', studentGlassCard)}>
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">{row.deck.name}</CardTitle>
                  <Link href={`/courses/${row.course.slug}`} className="text-sm text-primary hover:underline">
                    {row.course.title}
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatPill label="due" value={row.stats.due} />
                  <StatPill label="new" value={row.stats.newCards} />
                  <StatPill label="total" value={row.stats.total} />
                </div>
                <StudyButtons
                  srsHref={`/dashboard/flashcards/study?mode=srs&mainDeckSlug=${mainDeckSlugQ}`}
                  freeHref={`/dashboard/flashcards/study?mode=free&mainDeckSlug=${mainDeckSlugQ}`}
                  disabled={row.stats.total === 0}
                />
              </CardHeader>
              <CardContent className="space-y-2.5">
                {row.subdecks.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No subdecks linked yet.</p>
                ) : (
                  row.subdecks.map((subdeck) => {
                    const subdeckSlugQ = encodeURIComponent(subdeck.deck.slug)
                    const subStats: Stats = subdeck.stats
                    return (
                      <div
                        key={subdeck.deck.id}
                        className="rounded-xl border border-slate-300/45 bg-white/[0.26] p-3 dark:border-white/12 dark:bg-white/[0.06]"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {subdeck.deck.moduleTitle ?? 'Module'}: {subdeck.deck.name}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <StatPill label="due" value={subStats.due} />
                          <StatPill label="new" value={subStats.newCards} />
                          <StatPill label="total" value={subStats.total} />
                        </div>
                        <div className="mt-2">
                          <StudyButtons
                            srsHref={`/dashboard/flashcards/study?mode=srs&subdeckSlug=${subdeckSlugQ}`}
                            freeHref={`/dashboard/flashcards/study?mode=free&subdeckSlug=${subdeckSlugQ}`}
                            disabled={subStats.total === 0}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          )
        })}
    </div>
  )
}
