'use client'

/**
 * ─── FlashcardDashboardSection ───────────────────────────────────────────────
 *
 * Shows on the student dashboard under "Your Flashcards".
 * Renders "All Flashcards", one block per imported deck, then subject or tag slices.
 * Each block displays total / new / due counts and Study / Free Learn links.
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardHorizontalScroll } from '@/components/dashboard/dashboard-horizontal-scroll'
import { Brain, Zap, Loader2, BookOpen, Settings } from 'lucide-react'
import type { ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tag {
  id: string
  name: string
  slug: string
}

interface FlashcardDeckSummary {
  id: string
  name: string
  slug: string
}

interface Flashcard {
  id: string
  state: 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING' | 'MASTERED'
  nextReviewAt: string | null
  tags: Tag[]
  deck?: FlashcardDeckSummary | null
}

interface Subject {
  name: string
  slug: string
  tagSlugs: string[]
}

interface CardStats {
  total: number
  newCards: number
  due: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeStats(cards: Flashcard[]): CardStats {
  const now = new Date()
  let newCards = 0
  let due = 0
  for (const c of cards) {
    if (c.state === 'NEW') {
      newCards++
    } else {
      const d = c.nextReviewAt ? new Date(c.nextReviewAt) : null
      if (d && d <= now) due++
    }
  }
  return { total: cards.length, newCards, due }
}

// ─── Stat Pill ───────────────────────────────────────────────────────────────

function StatPill({
  label,
  count,
  color,
}: {
  label: string
  count: number
  color: string
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-md px-3 py-2 text-base font-medium md:text-lg ${color}`}>
      <span className="text-xl font-bold md:text-2xl">{count}</span>
      <span className="mt-1 text-sm opacity-80 md:text-base">{label}</span>
    </div>
  )
}

// ─── Single flashcard block ───────────────────────────────────────────────────

function FlashcardBlock({
  title,
  stats,
  studyHref,
  freeHref,
}: {
  title: string
  stats: CardStats
  studyHref: string
  freeHref: string
}) {
  const canStudy = stats.due + stats.newCards > 0

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
      <CardContent className="flex h-full flex-col items-center justify-between gap-4 p-4">
        <div className="text-center w-full">
          <p className="text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-100 md:text-xl">
            {title}
          </p>
        </div>

        <div className="w-full flex items-center justify-between gap-2">
          <div className="flex flex-1 justify-center">
            <StatPill
              label="due"
              count={stats.due}
              color="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            />
          </div>
          <div className="flex flex-1 justify-center">
            <StatPill
              label="new"
              count={stats.newCards}
              color="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            />
          </div>
          <div className="flex flex-1 justify-center">
            <StatPill
              label="total"
              count={stats.total}
              color="bg-gray-50 text-gray-500 dark:bg-gray-900/50 dark:text-gray-400"
            />
          </div>
        </div>

        <div className="grid w-full min-w-0 grid-cols-2 gap-2">
          <Link href={studyHref} className="min-w-0">
            <Button
              size="sm"
              className="h-auto w-full min-w-0 justify-center gap-1 whitespace-normal px-2 py-2 text-xs leading-tight sm:text-sm"
              disabled={!canStudy}
            >
              <Brain className="h-4 w-4 shrink-0" />
              Study Now
            </Button>
          </Link>
          <Link href={freeHref} className="min-w-0">
            <Button
              size="sm"
              variant="outline"
              className="h-auto w-full min-w-0 justify-center gap-1 whitespace-normal px-2 py-2 text-xs leading-tight sm:text-sm"
              disabled={stats.total === 0}
            >
              <Zap className="h-4 w-4 shrink-0" />
              Free Learn
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Carousel of flashcard blocks ────────────────────────────────────────────

function FlashcardBlocksCarousel({
  flashcards,
  subjects,
  tags,
  decks,
}: {
  flashcards: Flashcard[]
  subjects: Subject[]
  tags: Tag[]
  decks: FlashcardDeckSummary[]
}) {
  const cardsByDeckSlug = useMemo(() => {
    const m = new Map<string, Flashcard[]>()
    for (const c of flashcards) {
      const slug = c.deck?.slug
      if (!slug) continue
      const list = m.get(slug)
      if (list) list.push(c)
      else m.set(slug, [c])
    }
    return m
  }, [flashcards])

  const cardsByTagSlug = useMemo(() => {
    const m = new Map<string, Flashcard[]>()
    for (const c of flashcards) {
      for (const t of c.tags ?? []) {
        const list = m.get(t.slug)
        if (list) list.push(c)
        else m.set(t.slug, [c])
      }
    }
    return m
  }, [flashcards])

  const items: ReactNode[] = [
    <FlashcardBlock
      key="all"
      title="All Flashcards"
      stats={computeStats(flashcards)}
      studyHref="/dashboard/flashcards/study?mode=srs"
      freeHref="/dashboard/flashcards/study?mode=free"
    />,
  ]

  for (const deck of decks) {
    const deckCards = cardsByDeckSlug.get(deck.slug) ?? []
    if (deckCards.length === 0) continue
    const slugQ = encodeURIComponent(deck.slug)
    items.push(
      <FlashcardBlock
        key={`deck:${deck.slug}`}
        title={deck.name}
        stats={computeStats(deckCards)}
        studyHref={`/dashboard/flashcards/study?mode=srs&deckSlug=${slugQ}`}
        freeHref={`/dashboard/flashcards/study?mode=free&deckSlug=${slugQ}`}
      />,
    )
  }

  if (subjects.length > 0) {
    for (const subject of subjects) {
      const slugs = subject.tagSlugs ?? []
      const seen = new Set<string>()
      const tagCards: Flashcard[] = []
      for (const s of slugs) {
        for (const c of cardsByTagSlug.get(s) ?? []) {
          if (!seen.has(c.id)) {
            seen.add(c.id)
            tagCards.push(c)
          }
        }
      }
      if (tagCards.length === 0) continue
      items.push(
        <FlashcardBlock
          key={subject.slug}
          title={subject.name}
          stats={computeStats(tagCards)}
          studyHref={`/dashboard/flashcards/study?mode=srs&subject=${encodeURIComponent(subject.slug)}`}
          freeHref={`/dashboard/flashcards/study?mode=free&subject=${encodeURIComponent(subject.slug)}`}
        />,
      )
    }
  } else {
    for (const tag of tags) {
      const tagCards = cardsByTagSlug.get(tag.slug) ?? []
      if (tagCards.length === 0) continue
      items.push(
        <FlashcardBlock
          key={tag.id}
          title={tag.name}
          stats={computeStats(tagCards)}
          studyHref={`/dashboard/flashcards/study?mode=srs&tagSlug=${encodeURIComponent(tag.slug)}`}
          freeHref={`/dashboard/flashcards/study?mode=free&tagSlug=${encodeURIComponent(tag.slug)}`}
        />,
      )
    }
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

// ─── Main section ─────────────────────────────────────────────────────────────

export function FlashcardDashboardSection() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [decks, setDecks] = useState<FlashcardDeckSummary[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        // Use the student-facing study endpoint (mode=free) which returns all cards
        // and is protected by requireAuth instead of admin-only access.
        const res = await fetch('/api/flashcards/study?mode=free')
        if (!res.ok) throw new Error('fetch error')
        const data = await res.json()
        const cards: Flashcard[] = data.cards ?? []

        // Derive tag list from the returned cards to avoid calling admin-only /api/tags
        const tagMap = new Map<string, Tag>()
        for (const c of cards) {
          for (const t of c.tags ?? []) {
            tagMap.set(t.slug, t)
          }
        }

        setFlashcards(cards)
        setTags(Array.from(tagMap.values()))

        const deckMap = new Map<string, FlashcardDeckSummary>()
        for (const c of cards) {
          if (c.deck?.slug) {
            deckMap.set(c.deck.slug, c.deck)
          }
        }
        setDecks(
          Array.from(deckMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
        )

        // Try to load a taxonomy of subject headings (optional). If present,
        // this file maps main subject names -> arrays of granular tag slugs.
        try {
          const subjRes = await fetch('/api/subjects')
          if (subjRes.ok) {
            const subjData = await subjRes.json()
            const s = subjData?.subjects ?? []
            if (Array.isArray(s) && s.length > 0) setSubjects(s)
          }
        } catch {
          // ignore and fall back to per-tag blocks
        }
      } catch (err) {
        setError('Could not load flashcards.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section className="w-full space-y-4">
      {/* ── Section header ── */}
      <div className="flex w-full items-center">
        <div className="flex-1 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">
            Your Flashcards
          </h2>
          <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-400 md:text-lg">
            Study with spaced repetition or browse freely.
          </p>
        </div>
        {/* Settings button moved below the flashcards and centered */}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center gap-2 text-base text-gray-400 md:text-lg">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading flashcards…
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <p className="text-base leading-relaxed text-red-500 md:text-lg">{error}</p>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && flashcards.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
          <BookOpen className="mb-3 h-12 w-12 text-gray-300" />
          <p className="text-base leading-relaxed text-gray-500 md:text-lg">No flashcards available yet.</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-400 md:text-base">
            Your instructor will add flashcards to your study deck.
          </p>
        </div>
      )}

      {/* ── Deck blocks (horizontal scroll) ── */}
      {!loading && !error && flashcards.length > 0 && (
        <FlashcardBlocksCarousel
          flashcards={flashcards}
          subjects={subjects}
          tags={tags}
          decks={decks}
        />
      )}

      {/* Link to full settings (reading, theme, SRS) */}
      <div className="mt-4 flex w-full justify-center">
        <Link href="/dashboard/flashcards/settings">
          <Button
            variant="ghost"
            size="default"
            className="text-sm text-gray-600 hover:bg-gray-800/10 dark:text-gray-400 md:text-base"
          >
            <Settings className="mr-1.5 h-5 w-5" />
            Settings
          </Button>
        </Link>
      </div>
    </section>
  )
}
