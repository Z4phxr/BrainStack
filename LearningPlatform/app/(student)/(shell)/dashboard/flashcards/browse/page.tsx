'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { FormEvent } from 'react'
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Loader2, Library } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { studentGlassCard } from '@/lib/student-glass-styles'

type CatalogDeck = {
  id: string
  slug: string
  name: string
  description: string | null
  kind: 'standalone' | 'course'
  subject: { id: string; name: string } | null
  tags: { id: string; name: string; slug: string }[]
  cardCount: number
  enrolled: boolean
  course: { id: string; title: string; slug: string } | null
}

const DECKS_PER_PAGE = 15

const DECK_SORT_DEFAULT = 'title'

const DECK_SORT_LABELS: { value: string; label: string }[] = [
  { value: 'title', label: 'Title (A–Z)' },
  { value: '-title', label: 'Title (Z–A)' },
  { value: '-cards', label: 'Most cards' },
  { value: 'cards', label: 'Fewest cards' },
]

function deckMatchesSearchQuery(d: CatalogDeck, q: string): boolean {
  if (!q) return true
  const hay = [
    d.name,
    d.description ?? '',
    d.subject?.name ?? '',
    d.slug,
    d.kind === 'course' && d.course ? d.course.title : '',
  ]
    .join(' ')
    .toLowerCase()
  return hay.includes(q)
}

export default function StandaloneFlashcardBrowsePage() {
  const [decks, setDecks] = useState<CatalogDeck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busySlug, setBusySlug] = useState<string | null>(null)

  /** Draft values in the filter bar (applied on Submit). */
  const [formSearch, setFormSearch] = useState('')
  const [formSubjectId, setFormSubjectId] = useState('')
  const [formSort, setFormSort] = useState(DECK_SORT_DEFAULT)

  /** Values that drive the deck list (updated when user clicks Apply). */
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedSubjectId, setAppliedSubjectId] = useState('')
  const [appliedSort, setAppliedSort] = useState(DECK_SORT_DEFAULT)

  const [deckListPage, setDeckListPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/flashcards/standalone-decks')
      if (!res.ok) throw new Error('load failed')
      const data = (await res.json()) as { decks?: CatalogDeck[] }
      setDecks(Array.isArray(data.decks) ? data.decks : [])
    } catch {
      setError('Could not load decks.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setDeckListPage(1)
  }, [appliedSearch, appliedSubjectId, appliedSort])

  const catalogSubjects = useMemo(() => {
    const byId = new Map<string, { id: string; name: string }>()
    for (const d of decks) {
      if (d.subject?.id) byId.set(d.subject.id, d.subject)
    }
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [decks])

  const filteredDecks = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase()
    const list = decks.filter((d) => {
      if (appliedSubjectId) {
        if (!d.subject || d.subject.id !== appliedSubjectId) return false
      }
      if (!deckMatchesSearchQuery(d, q)) return false
      return true
    })
    const sorted = [...list].sort((a, b) => {
      switch (appliedSort) {
        case '-title':
          return b.name.localeCompare(a.name)
        case '-cards':
          return b.cardCount - a.cardCount
        case 'cards':
          return a.cardCount - b.cardCount
        case 'title':
        default:
          return a.name.localeCompare(b.name)
      }
    })
    return sorted
  }, [decks, appliedSearch, appliedSubjectId, appliedSort])

  const deckListTotalPages = Math.max(1, Math.ceil(filteredDecks.length / DECKS_PER_PAGE))

  useEffect(() => {
    setDeckListPage((p) => Math.min(p, deckListTotalPages))
  }, [deckListTotalPages])

  const paginatedFilteredDecks = useMemo(() => {
    const start = (deckListPage - 1) * DECKS_PER_PAGE
    return filteredDecks.slice(start, start + DECKS_PER_PAGE)
  }, [filteredDecks, deckListPage])

  async function enroll(slug: string) {
    setBusySlug(slug)
    setError('')
    try {
      const res = await fetch('/api/flashcards/standalone-decks/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckSlug: slug }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const msg = typeof body?.error === 'string' ? body.error : 'Could not add deck.'
        throw new Error(msg)
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add deck.')
    } finally {
      setBusySlug(null)
    }
  }

  const hasActiveFilters =
    Boolean(appliedSearch.trim()) ||
    Boolean(appliedSubjectId.trim()) ||
    appliedSort !== DECK_SORT_DEFAULT

  function applyDeckFilters(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAppliedSearch(formSearch)
    setAppliedSubjectId(formSubjectId)
    setAppliedSort(formSort)
    setDeckListPage(1)
  }

  function clearDeckFilters() {
    setFormSearch('')
    setFormSubjectId('')
    setFormSort(DECK_SORT_DEFAULT)
    setAppliedSearch('')
    setAppliedSubjectId('')
    setAppliedSort(DECK_SORT_DEFAULT)
    setDeckListPage(1)
  }

  return (
    <div className="container mx-auto px-6 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="flex w-full flex-col gap-0">
          <div className="flex w-full justify-start">
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link href="/dashboard" className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back to dashboard
              </Link>
            </Button>
          </div>
          <div className="mx-auto w-full max-w-3xl p-0 text-center">
            <h1 className="mb-3 mt-0 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">
              Discover decks
            </h1>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400 md:text-xl">
              Explore flashcard collections to study; add a standalone set to your library or open a course you&apos;ve
              started.
            </p>
          </div>
        </div>

      {!loading && decks.length > 0 && (
        <form
          onSubmit={applyDeckFilters}
          className={cn('grid gap-4 p-4 shadow-none md:grid-cols-2 md:p-6 lg:grid-cols-12 lg:items-end', studentGlassCard)}
        >
          <div className="flex flex-col gap-1.5 lg:col-span-5">
            <label htmlFor="deck-catalog-q" className="text-sm font-medium text-foreground">
              Search by title
            </label>
            <Input
              id="deck-catalog-q"
              name="q"
              type="search"
              placeholder="Type a deck name…"
              value={formSearch}
              onChange={(e) => setFormSearch(e.target.value)}
              autoComplete="off"
              className={cn(
                'h-10 w-full border border-input bg-background text-sm text-foreground shadow-xs dark:bg-background',
                'placeholder:text-muted-foreground',
                'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5 lg:col-span-3">
            <label htmlFor="deck-catalog-subject" className="text-sm font-medium text-foreground">
              Subject
            </label>
            <select
              id="deck-catalog-subject"
              name="subject"
              value={formSubjectId}
              onChange={(e) => setFormSubjectId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">All subjects</option>
              {catalogSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 lg:col-span-3">
            <label htmlFor="deck-catalog-sort" className="text-sm font-medium text-foreground">
              Sort by
            </label>
            <select
              id="deck-catalog-sort"
              name="sort"
              value={formSort}
              onChange={(e) => setFormSort(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {DECK_SORT_LABELS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 lg:col-span-1">
            <span className="invisible select-none text-sm font-medium text-foreground" aria-hidden>
              Apply
            </span>
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="auth-hero-cta h-10 w-full shrink-0 px-4 lg:w-auto"
            >
              Apply
            </Button>
          </div>
        </form>
      )}

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={clearDeckFilters}>
            Clear all filters
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      )}

      {error ? (
        <Card className={cn('border-0 shadow-none', studentGlassCard)}>
          <CardContent className="py-4 text-center text-red-600 dark:text-red-400">{error}</CardContent>
        </Card>
      ) : null}

      {!loading && !error && decks.length === 0 ? (
        <Card className={cn('border-0 shadow-none', studentGlassCard)}>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Library className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-gray-600 dark:text-gray-400">No decks are available to browse yet.</p>
          </CardContent>
        </Card>
      ) : null}

      {!loading && !error && decks.length > 0 && filteredDecks.length === 0 ? (
        <Card className={cn('border-0 shadow-none', studentGlassCard)}>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No decks match these filters. Try clearing a filter or choose a different combination.
          </CardContent>
        </Card>
      ) : null}

      {!loading && !error && filteredDecks.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {paginatedFilteredDecks.map((d) => (
            <Card
              key={d.id}
              className={cn(
                'flex h-full flex-col gap-0 border-dotted py-0 shadow-none transition-shadow hover:brightness-[1.02] dark:hover:brightness-[1.03]',
                studentGlassCard,
              )}
            >
              <CardHeader className="!flex min-h-0 flex-1 flex-col items-center justify-between gap-0 px-6 py-6 text-center">
                <div className="flex w-full max-w-md flex-col items-center gap-3 text-center">
                  <CardTitle className="w-full text-center text-xl text-blue-900 dark:text-blue-400">
                    {d.name}
                  </CardTitle>
                  <p className="flex w-full flex-wrap items-center justify-center gap-x-2 text-center text-sm text-muted-foreground">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {d.subject?.name?.trim() ? d.subject.name : 'Unknown'}
                    </span>
                    <span className="text-muted-foreground/50" aria-hidden>
                      ·
                    </span>
                    <span className="tabular-nums">
                      {d.cardCount} card{d.cardCount === 1 ? '' : 's'}
                    </span>
                  </p>
                  {d.description || (d.kind === 'course' && d.course) ? (
                    <div className="flex w-full max-w-md flex-col items-center gap-2 text-center">
                      {d.description ? (
                        <CardDescription className="w-full text-pretty text-center">{d.description}</CardDescription>
                      ) : null}
                      {d.kind === 'course' && d.course ? (
                        <CardDescription className="w-full text-pretty text-center">
                          Course deck — details on the{' '}
                          <Link
                            href={`/courses/${encodeURIComponent(d.course.slug)}`}
                            className="font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
                          >
                            {d.course.title}
                          </Link>{' '}
                          page.
                        </CardDescription>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className="mt-auto flex w-full max-w-sm flex-col items-center gap-2 pt-4 text-center">
                  {d.kind === 'standalone' ? (
                    d.enrolled ? (
                      <>
                        <span className="w-full text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          In your library
                        </span>
                        <Button size="sm" variant="outline" asChild className="w-full">
                          <Link href={`/dashboard/flashcards?standaloneDeckSlug=${encodeURIComponent(d.slug)}`}>
                            Open deck tree
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="hero"
                        className="auth-hero-cta w-full"
                        disabled={busySlug === d.slug}
                        onClick={() => void enroll(d.slug)}
                      >
                        {busySlug === d.slug ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding…
                          </>
                        ) : (
                          'Add to my flashcards'
                        )}
                      </Button>
                    )
                  ) : d.enrolled ? (
                    <>
                      <span className="w-full text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        You&apos;re enrolled in this course
                      </span>
                      <Button size="sm" variant="outline" asChild className="w-full">
                        <Link href={`/dashboard/flashcards?courseSlug=${encodeURIComponent(d.course!.slug)}`}>
                          <BookOpen className="mr-1.5 h-4 w-4" />
                          Deck tree
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" asChild className="w-full">
                        <Link href={`/courses/${encodeURIComponent(d.course!.slug)}`}>
                          <BookOpen className="mr-1.5 h-4 w-4" />
                          View course
                        </Link>
                      </Button>
                      <p className="w-full text-xs text-muted-foreground">
                        Enroll in the course to use these flashcards on your dashboard.
                      </p>
                    </>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : null}

      {!loading && !error && filteredDecks.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200/60 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-4">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            Showing{' '}
            <span className="font-medium tabular-nums text-foreground">
              {(deckListPage - 1) * DECKS_PER_PAGE + 1}
            </span>
            {'–'}
            <span className="font-medium tabular-nums text-foreground">
              {Math.min(deckListPage * DECKS_PER_PAGE, filteredDecks.length)}
            </span>{' '}
            of <span className="font-medium tabular-nums text-foreground">{filteredDecks.length}</span> deck
            {filteredDecks.length === 1 ? '' : 's'}
          </p>
          <div className="flex items-center justify-center gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2"
              disabled={deckListPage <= 1}
              onClick={() => setDeckListPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              <span className="sr-only">Previous page</span>
            </Button>
            <span className="min-w-[4.5rem] text-center text-xs tabular-nums text-muted-foreground">
              {deckListPage} / {deckListTotalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2"
              disabled={deckListPage >= deckListTotalPages}
              onClick={() => setDeckListPage((p) => Math.min(deckListTotalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  )
}
