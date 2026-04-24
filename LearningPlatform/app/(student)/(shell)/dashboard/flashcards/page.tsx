'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Brain, BookOpen, ChevronDown, ChevronRight, Loader2, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { studentGlassCard, studentGlassPill } from '@/lib/student-glass-styles'
import type { FlashcardDashboardSummary } from '@/lib/flashcards-dashboard-summary'

type Stats = { total: number; newCards: number; due: number }

function titlesMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

/** Course subdecks are often named after the module (`Modules` sync); avoid `Title: Title`. */
function courseSubdeckLabel(moduleTitle: string | null, deckName: string): string {
  const mt = (moduleTitle ?? '').trim()
  const dn = deckName.trim()
  if (!mt) return dn || 'Module'
  if (!dn) return mt
  if (titlesMatch(mt, dn)) return dn
  return `${mt}: ${dn}`
}

/** Same as course page `moduleFlashcardBoxClass` minus `mt-4` (list spacing handled by parent). */
const moduleFlashcardStripClass = cn(
  'rounded-xl border border-dashed border-primary/35 bg-primary/[0.06] p-4 dark:border-primary/40 dark:bg-primary/[0.12]',
)

/** Same layout as `StatPill` in `components/dashboard/flashcard-section.tsx`. */
function StatPill({ label, count }: { label: string; count: number }) {
  return (
    <div
      className={cn(
        'flex min-w-[4.25rem] flex-col items-center justify-center rounded-2xl border px-2.5 py-2 md:min-w-[4.75rem] md:px-3 md:py-2.5',
        'border-slate-300/45 bg-white/[0.28] shadow-sm backdrop-blur-md dark:border-white/15 dark:bg-white/[0.1] dark:shadow-none',
      )}
    >
      <span className="text-xl font-bold tabular-nums text-slate-800 dark:text-gray-100 md:text-2xl">{count}</span>
      <span className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-600 dark:text-gray-400 md:text-xs">
        {label}
      </span>
    </div>
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
  const standaloneDeckSlug = (searchParams.get('standaloneDeckSlug') ?? '').trim()
  const [summary, setSummary] = useState<FlashcardDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  /** Subdeck lists start collapsed; keyed by main deck id. */
  const [subdeckListOpen, setSubdeckListOpen] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const qs = new URLSearchParams()
        if (courseSlug) qs.set('courseSlug', courseSlug)
        if (standaloneDeckSlug) qs.set('standaloneDeckSlug', standaloneDeckSlug)
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
  }, [courseSlug, standaloneDeckSlug])

  const rows = useMemo(() => {
    if (!summary) return []
    if (courseSlug) {
      return summary.decks.filter((d) => d.source === 'course' && d.course?.slug === courseSlug)
    }
    if (standaloneDeckSlug) {
      return summary.decks.filter((d) => d.source === 'standalone' && d.deck.slug === standaloneDeckSlug)
    }
    return summary.decks
  }, [summary, courseSlug, standaloneDeckSlug])

  const filteredByCourse = Boolean(courseSlug)
  const filteredByStandalone = Boolean(standaloneDeckSlug)
  const pageTitle = filteredByCourse
    ? 'Course flashcards'
    : filteredByStandalone
      ? 'Your deck'
      : 'Your flashcard decks'
  const pageDescription = filteredByCourse
    ? 'Sections below follow this course’s modules. Study the whole course with the top buttons, or focus one module at a time.'
    : filteredByStandalone
      ? 'Use the whole-deck buttons for everything in this collection, or study each section on its own.'
      : 'These are the main decks tied to your courses and to standalone sets you added from Discover decks. Open one to see sections, counts, and study options.'

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8 md:px-8">
      <div className="space-y-8">
        <header className="space-y-4 border-b border-border/60 pb-8">
          <div className="flex justify-start">
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link href="/dashboard" className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back to dashboard
              </Link>
            </Button>
          </div>
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{pageTitle}</h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {pageDescription}
            </p>
            {!filteredByCourse && !filteredByStandalone && (
              <p className="mx-auto max-w-2xl text-xs leading-relaxed text-muted-foreground/90 md:text-sm">
                Tip: open{' '}
                <Link href="/dashboard/flashcards/browse" className="font-medium text-primary underline-offset-4 hover:underline">
                  Discover decks
                </Link>{' '}
                to add more standalone sets to this page.
              </p>
            )}
          </div>
        </header>

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
            <p className="text-gray-600 dark:text-gray-400">
              No flashcard decks match this view. Try the course or standalone link again, or browse decks from the
              dashboard.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading &&
        !error &&
        rows.map((row) => {
          const mainDeckSlugQ = encodeURIComponent(row.deck.slug)
          const courseTitle = row.course ? String(row.course.title ?? '') : ''
          const deckName = String(row.deck.name ?? '')
          const deckTitleSameAsCourse = row.source === 'course' && titlesMatch(deckName, courseTitle)
          const subdecksExpanded = subdeckListOpen[row.deck.id] ?? false
          return (
            <Card
              key={row.deck.id}
              className={cn('mx-auto w-full max-w-xl border-0 shadow-none', studentGlassCard)}
            >
              <CardHeader className="space-y-3 text-center">
                <div className="flex flex-col items-center gap-2">
                  {row.source === 'standalone' ? (
                    <>
                      <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">{row.deck.name}</CardTitle>
                      {row.deck.description ? (
                        <p className="max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                          {row.deck.description}
                        </p>
                      ) : null}
                      {(row.deck.subject?.name || row.deck.tags?.length) ? (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {row.deck.subject?.name ? (
                            <span
                              className={cn(
                                studentGlassPill,
                                'text-[0.7rem] font-medium normal-case tracking-tight sm:text-xs',
                              )}
                            >
                              {row.deck.subject.name}
                            </span>
                          ) : null}
                          {row.deck.tags?.map((t, i) => (
                            <span
                              key={`${t.name}-${i}`}
                              className={cn(
                                studentGlassPill,
                                'text-[0.7rem] font-medium normal-case tracking-tight sm:text-xs',
                              )}
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : deckTitleSameAsCourse ? (
                    <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
                      <Link
                        href={`/courses/${row.course!.slug}`}
                        className="transition-colors hover:text-primary hover:underline dark:hover:text-primary"
                      >
                        {courseTitle}
                      </Link>
                    </CardTitle>
                  ) : (
                    <>
                      <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">{row.deck.name}</CardTitle>
                      <Link href={`/courses/${row.course!.slug}`} className="text-sm text-primary hover:underline">
                        {row.course!.title}
                      </Link>
                    </>
                  )}
                </div>
                <div className="mx-auto flex w-full max-w-md items-stretch justify-center gap-2 sm:gap-3">
                  <StatPill label="due" count={row.stats.due} />
                  <StatPill label="new" count={row.stats.newCards} />
                  <StatPill label="total" count={row.stats.total} />
                </div>
                <div className="mx-auto w-full max-w-sm">
                  <StudyButtons
                    srsHref={`/dashboard/flashcards/study?mode=srs&mainDeckSlug=${mainDeckSlugQ}`}
                    freeHref={`/dashboard/flashcards/study?mode=free&mainDeckSlug=${mainDeckSlugQ}`}
                    disabled={row.stats.total === 0}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {row.subdecks.length === 0 ? (
                  <p className="mx-auto max-w-lg text-center text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {row.source === 'standalone'
                      ? ''
                      : 'No subdecks linked yet.'}
                  </p>
                ) : (
                  <>
                    <button
                      type="button"
                      id={`subdeck-toggle-${row.deck.id}`}
                      className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5 text-sm font-medium text-foreground',
                        'transition-colors hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      )}
                      aria-expanded={subdecksExpanded}
                      aria-controls={`subdeck-list-${row.deck.id}`}
                      onClick={() =>
                        setSubdeckListOpen((m) => ({
                          ...m,
                          [row.deck.id]: !(m[row.deck.id] ?? false),
                        }))
                      }
                    >
                      {subdecksExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                      )}
                      <span>
                        {row.subdecks.length}{' '}
                        {row.subdecks.length === 1 ? 'section' : 'sections'}
                        <span className="font-normal text-muted-foreground">
                          {' '}
                          ({subdecksExpanded ? 'hide' : 'show'})
                        </span>
                      </span>
                    </button>

                    {subdecksExpanded && (
                      <div
                        id={`subdeck-list-${row.deck.id}`}
                        role="region"
                        aria-labelledby={`subdeck-toggle-${row.deck.id}`}
                        className="space-y-2.5 pt-1"
                      >
                        <p className="mx-auto max-w-md pb-1 text-center text-xs leading-relaxed text-muted-foreground md:text-sm">
                          {row.source === 'course'
                            ? 'Each box is a module section you can study it separately or use the whole-course buttons above.'
                            : 'Each box is a section of this deck—study it on its own or use the full-deck buttons above.'}
                        </p>
                        {row.subdecks.map((subdeck) => {
                          const subdeckSlugQ = encodeURIComponent(subdeck.deck.slug)
                          const subStats: Stats = subdeck.stats
                          const sectionLabel =
                            row.source === 'standalone'
                              ? subdeck.deck.name
                              : courseSubdeckLabel(subdeck.deck.moduleTitle, subdeck.deck.name)
                          return (
                            <div key={subdeck.deck.id} className={moduleFlashcardStripClass}>
                              <p className="text-center text-sm font-medium leading-snug text-gray-900 dark:text-gray-100">
                                {sectionLabel}
                              </p>
                              <div className="mx-auto mt-2 flex w-full max-w-md items-stretch justify-center gap-2 sm:gap-3">
                                <StatPill label="due" count={subStats.due} />
                                <StatPill label="new" count={subStats.newCards} />
                                <StatPill label="total" count={subStats.total} />
                              </div>
                              <div className="mx-auto mt-2 w-full max-w-sm">
                                <StudyButtons
                                  srsHref={`/dashboard/flashcards/study?mode=srs&subdeckSlug=${subdeckSlugQ}`}
                                  freeHref={`/dashboard/flashcards/study?mode=free&subdeckSlug=${subdeckSlugQ}`}
                                  disabled={subStats.total === 0}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
