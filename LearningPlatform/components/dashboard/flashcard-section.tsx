'use client'

/**
 * Student dashboard “Your Flashcards” strip.
 * Loads a small JSON summary after paint so the dashboard shell is not blocked on full card payloads.
 * Shows “All Flashcards” plus one block per deck (name, total / new / due, Study / Free Learn).
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardHorizontalScroll } from '@/components/dashboard/dashboard-horizontal-scroll'
import { Brain, Loader2, BookOpen } from 'lucide-react'
import type { ReactNode } from 'react'
import { studentGlassCard } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'
import type { FlashcardDashboardSummary } from '@/lib/flashcards-dashboard-summary'

interface CardStats {
  total: number
  newCards: number
  due: number
}

function titlesMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

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

function FlashcardBlock({
  title,
  subtitle,
  stats,
  openHref,
}: {
  title: string
  subtitle: string
  stats: CardStats
  openHref: string
}) {
  const canOpen = stats.total > 0
  const showSubtitle = Boolean(subtitle.trim()) && !titlesMatch(title, subtitle)

  return (
    <Card
      className={cn(
        'flex h-full flex-col border-0 shadow-none transition-shadow hover:brightness-[1.02] dark:hover:brightness-[1.03]',
        studentGlassCard,
      )}
    >
      <CardContent className="flex h-full flex-col items-center justify-between gap-4 p-4">
        <div className="w-full text-center">
          <p className="text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-100 md:text-xl">{title}</p>
          {showSubtitle ? (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex w-full items-stretch justify-center gap-2 sm:gap-3">
          <StatPill label="due" count={stats.due} />
          <StatPill label="new" count={stats.newCards} />
          <StatPill label="total" count={stats.total} />
        </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-2">
          <Link href={openHref} className="min-w-0">
            <Button
              size="sm"
              variant="hero"
              className="auth-hero-cta h-auto w-full min-w-0 justify-center gap-1 whitespace-normal px-2 py-2 text-xs leading-tight sm:text-sm"
              disabled={!canOpen}
            >
              <Brain className="h-4 w-4 shrink-0" />
              Open Deck Tree
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function FlashcardSummaryCarousel({ summary }: { summary: FlashcardDashboardSummary }) {
  const items: ReactNode[] = []

  for (const row of summary.decks) {
    const openHref =
      row.source === 'standalone'
        ? `/dashboard/flashcards?standaloneDeckSlug=${encodeURIComponent(row.deck.slug)}`
        : `/dashboard/flashcards?courseSlug=${encodeURIComponent(row.course!.slug)}`
    const subtitle =
      row.source === 'standalone'
        ? row.deck.subject?.name?.trim() ||
          (row.deck.tags?.length ? row.deck.tags.map((t) => t.name).join(' · ') : '') ||
          'Standalone library'
        : row.course!.title
    items.push(
      <FlashcardBlock
        key={`${row.source}-deck:${row.deck.slug}`}
        title={row.deck.name}
        subtitle={subtitle}
        stats={row.stats}
        openHref={openHref}
      />,
    )
  }

  if (items.length === 0) {
    return null
  }

  if (items.length === 1) {
    return (
      <div className="flex w-full justify-center px-1">
        <div className="w-full max-w-md">{items[0]}</div>
      </div>
    )
  }

  return (
    <DashboardHorizontalScroll
      aria-label="Flashcard decks"
      scrollArrows
      itemClassName="w-[min(92vw,22rem)] sm:w-[24rem] md:w-[26rem]"
    >
      {items}
    </DashboardHorizontalScroll>
  )
}

export function FlashcardDashboardSection({ children }: { children?: React.ReactNode }) {
  const [summary, setSummary] = useState<FlashcardDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/flashcards/dashboard-summary')
        if (!res.ok) throw new Error('fetch error')
        const data = (await res.json()) as FlashcardDashboardSummary
        if (
          !data?.all ||
          typeof data.all.total !== 'number' ||
          !Array.isArray(data.decks)
        ) {
          throw new Error('invalid payload')
        }
        setSummary(data)
      } catch {
        setError('Could not load flashcards.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section className="w-full space-y-4">
      <div className="flex w-full items-center">
        <div className="flex-1 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">
            Your Flashcards
          </h2>
          <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-400 md:text-lg">
            Study with spaced repetition or browse freely.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-base text-gray-400 md:text-lg">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading flashcards…
        </div>
      )}

      {error && <p className="text-base leading-relaxed text-red-500 md:text-lg">{error}</p>}

      {!loading && !error && summary && summary.decks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/30 bg-white/10 py-10 text-center backdrop-blur-lg dark:border-white/20 dark:bg-white/10">
          <BookOpen className="mb-3 h-12 w-12 text-gray-300" />
          <p className="text-base leading-relaxed text-gray-500 md:text-lg">No decks in your library yet.</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-400 md:text-base">
            Start a course for course-linked decks, or browse the catalog to add standalone decks to your library.
          </p>
        </div>
      )}

      {!loading && !error && summary && summary.decks.length > 0 && <FlashcardSummaryCarousel summary={summary} />}

      {!loading && !error && summary && (
        <div className="flex justify-center pt-1">
          <Button size="sm" variant="outline" asChild className="min-w-[10rem]">
            <Link href="/dashboard/flashcards/browse">Browse all decks</Link>
          </Button>
        </div>
      )}

      {!loading && children ? <div className="mt-6 w-full">{children}</div> : null}
    </section>
  )
}
