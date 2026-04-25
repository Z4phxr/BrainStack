'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardHorizontalScroll } from '@/components/dashboard/dashboard-horizontal-scroll'
import { Brain } from 'lucide-react'
import type { ReactNode } from 'react'
import { studentGlassCard } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'

export type FlashcardDeckCarouselRow = {
  id: string
  name: string
  subtitle: string
  openHref: string
  stats: { total: number; newCards: number; due: number }
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

function DeckCard({
  row,
  compact,
  action,
}: {
  row: FlashcardDeckCarouselRow
  compact?: boolean
  action?: ReactNode
}) {
  const canOpen = row.stats.total > 0
  return (
    <Card
      className={cn(
        'flex h-full flex-col border-0 shadow-none transition-shadow hover:brightness-[1.02] dark:hover:brightness-[1.03]',
        compact && 'scale-[0.95]',
        studentGlassCard,
      )}
    >
      <CardContent className="flex h-full flex-col items-center justify-between gap-4 p-4">
        <div className="w-full text-center">
          <p className="text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-100 md:text-xl">{row.name}</p>
          {row.subtitle ? <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{row.subtitle}</p> : null}
        </div>
        <div className="flex w-full items-stretch justify-center gap-2 sm:gap-3">
          <StatPill label="due" count={row.stats.due} />
          <StatPill label="new" count={row.stats.newCards} />
          <StatPill label="total" count={row.stats.total} />
        </div>
        <div className="grid w-full min-w-0 grid-cols-1 gap-2">
          {canOpen ? (
            <Link href={row.openHref} className="min-w-0">
              <Button
                size="sm"
                variant="hero"
                className="auth-hero-cta h-auto w-full min-w-0 justify-center gap-1 whitespace-normal px-2 py-2 text-xs leading-tight sm:text-sm"
              >
                <Brain className="h-4 w-4 shrink-0" />
                Open Deck Tree
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              variant="hero"
              className="auth-hero-cta h-auto w-full min-w-0 justify-center gap-1 whitespace-normal px-2 py-2 text-xs leading-tight sm:text-sm"
              disabled
            >
              <Brain className="h-4 w-4 shrink-0" />
              Open Deck Tree
            </Button>
          )}
          {action ? <div className="flex justify-center pt-1">{action}</div> : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function FlashcardDeckCarousel({
  rows,
  compact = false,
  actionByDeckId,
}: {
  rows: FlashcardDeckCarouselRow[]
  compact?: boolean
  actionByDeckId?: Record<string, ReactNode>
}) {
  if (rows.length === 0) return null
  if (rows.length === 1) {
    const row = rows[0]
    return (
      <div className="flex w-full justify-center px-1">
        <div className="w-full max-w-md">
          <DeckCard row={row} compact={compact} action={actionByDeckId?.[row.id]} />
        </div>
      </div>
    )
  }
  return (
    <DashboardHorizontalScroll
      aria-label="Flashcard decks"
      scrollArrows
      itemClassName="w-[min(92vw,22rem)] sm:w-[24rem] md:w-[26rem]"
    >
      {rows.map((row) => (
        <DeckCard key={row.id} row={row} compact={compact} action={actionByDeckId?.[row.id]} />
      ))}
    </DashboardHorizontalScroll>
  )
}
