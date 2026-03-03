'use client'

/**
 * ─── FlashcardDashboardSection ───────────────────────────────────────────────
 *
 * Shows on the student dashboard under "Your Flashcards".
 * Renders one block for "All Flashcards" and one block per tag.
 * Each block displays total / new / due counts and Study / Free Learn links.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Brain, Zap, Loader2, BookOpen, Settings } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tag {
  id: string
  name: string
  slug: string
}

interface Flashcard {
  id: string
  state: 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING' | 'MASTERED'
  nextReviewAt: string | null
  tags: Tag[]
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
    <div className={`flex flex-col items-center justify-center rounded-md px-3 py-2 text-sm font-medium ${color}`}>
      <span className="text-lg font-bold">{count}</span>
      <span className="mt-1 text-xs opacity-80">{label}</span>
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
          <p className="font-semibold text-gray-800 dark:text-gray-100">{title}</p>
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

        <div className="w-full flex gap-2 justify-center">
          <Link href={studyHref}>
            <Button size="sm" className="w-36" disabled={!canStudy}>
              <Brain className="mr-1.5 h-3.5 w-3.5" />
              Study Now
            </Button>
          </Link>
          <Link href={freeHref}>
            <Button size="sm" variant="outline" className="w-36" disabled={stats.total === 0}>
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Free Learn
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function FlashcardDashboardSection() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
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
    <section className="space-y-4">
      {/* ── Section header ── */}
      <div className="max-w-6xl mx-auto flex items-center">
        <div className="flex-1 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Flashcards</h2>
          <p className="mt-0.5 text-sm text-gray-500">Study with spaced repetition or browse freely.</p>
        </div>
        {/* Settings button moved below the flashcards and centered */}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading flashcards…
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && flashcards.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
          <BookOpen className="mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">No flashcards available yet.</p>
          <p className="mt-1 text-xs text-gray-400">
            Your instructor will add flashcards to your study deck.
          </p>
        </div>
      )}

      {/* ── Blocks grid ── */}
      {!loading && !error && flashcards.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* All flashcards block */}
          <FlashcardBlock
            title="All Flashcards"
            stats={computeStats(flashcards)}
            studyHref="/dashboard/flashcards/study?mode=srs"
            freeHref="/dashboard/flashcards/study?mode=free"
          />

          {/* Per-subject blocks (if taxonomy provided) */}
          {subjects.length > 0 ? (
            subjects.map((subject) => {
              const tagCards = flashcards.filter((c) =>
                c.tags.some((t) => (subject.tagSlugs ?? []).includes(t.slug))
              )
              if (tagCards.length === 0) return null
              return (
                <FlashcardBlock
                  key={subject.slug}
                  title={subject.name}
                  stats={computeStats(tagCards)}
                  studyHref={`/dashboard/flashcards/study?mode=srs&subject=${encodeURIComponent(subject.slug)}`}
                  freeHref={`/dashboard/flashcards/study?mode=free&subject=${encodeURIComponent(subject.slug)}`}
                />
              )
            })
          ) : (
            /* Fallback: per-tag blocks (legacy behavior) */
            tags.map((tag) => {
              const tagCards = flashcards.filter((c) =>
                c.tags.some((t) => t.slug === tag.slug)
              )
              if (tagCards.length === 0) return null
              return (
                <FlashcardBlock
                  key={tag.id}
                  title={tag.name}
                  stats={computeStats(tagCards)}
                  studyHref={`/dashboard/flashcards/study?mode=srs&tagSlug=${encodeURIComponent(tag.slug)}`}
                  freeHref={`/dashboard/flashcards/study?mode=free&tagSlug=${encodeURIComponent(tag.slug)}`}
                />
              )
            })
          )}
        </div>
      )}

      {/* Centered SRS Settings button under flashcards */}
      <div className="max-w-6xl mx-auto mt-4 flex justify-center">
        <Link href="/dashboard/flashcards/settings">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-white hover:bg-gray-800/10">
            <Settings className="mr-1.5 h-4 w-4" />
            SRS Settings
          </Button>
        </Link>
      </div>
    </section>
  )
}
