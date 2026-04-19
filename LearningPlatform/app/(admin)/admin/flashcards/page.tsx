'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  BookOpen,
  Tag as TagIcon,
  ArrowUpAZ,
  ArrowDownAZ,
  ArrowUp01,
  ArrowDown01,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react'
import { FlashcardDialog, type FlashcardInitialData } from '@/components/admin/add-flashcard-dialog'
import { cn } from '@/lib/utils'
import {
  adminGlassCard,
  adminGlassIconToggleActive,
  adminGlassIconToggleInactive,
  adminGlassOutlineButton,
  studentGlassPill,
} from '@/lib/student-glass-styles'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tag {
  id: string
  name: string
  slug: string
  main?: boolean
  _count?: { flashcards: number }
}

type FlashcardState = 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING' | 'MASTERED'

interface Flashcard {
  id: string
  question: string
  answer: string
  questionImageId: string | null
  answerImageId: string | null
  createdAt: string
  nextReviewAt: string | null
  state: FlashcardState
  interval: number
  easeFactor: number
  repetition: number
  tags: Tag[]
  deck: { id: string; name: string; slug: string }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncate(text: string, max = 80): string {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '…'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminFlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [showAllTags, setShowAllTags] = useState(false)
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<Set<string>>(new Set())
  const [tagSortField, setTagSortField] = useState<'name' | 'count'>('name')
  const [tagSortDir, setTagSortDir] = useState<'asc' | 'desc'>('asc')
  const [tagPage, setTagPage] = useState(1)
  const [sortKey, setSortKey] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest')
  const [selectedDeckSlug, setSelectedDeckSlug] = useState<string | null>(null)
  const [deckOptions, setDeckOptions] = useState<Array<{ slug: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<FlashcardInitialData | undefined>(undefined)

  // Optimistic actions
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams()
      if (selectedTagSlugs.size > 0) {
        params.set('tagSlugs', Array.from(selectedTagSlugs).join(','))
      }
      if (selectedDeckSlug) {
        params.set('deckSlug', selectedDeckSlug)
      }
      const qs = params.toString()
      const [fcRes, tagRes, deckRes] = await Promise.all([
        fetch(`/api/flashcards${qs ? `?${qs}` : ''}`),
        fetch('/api/tags'),
        fetch('/api/flashcard-decks'),
      ])
      if (!fcRes.ok) throw new Error('Failed to load flashcards')
      const fcData = await fcRes.json()
      const tagData = tagRes.ok ? await tagRes.json() : { tags: [] }
      const deckData = deckRes.ok ? await deckRes.json() : { decks: [] }
      const cards = fcData.flashcards ?? []
      setFlashcards(cards)
      // Keep full tag list in state; UI decides which to show via toggle
      setAllTags(tagData.tags ?? [])
      const dlist = deckData.decks ?? []
      setDeckOptions(dlist.map((d: { slug: string; name: string }) => ({ slug: d.slug, name: d.name })))
    } catch {
      setError('Could not load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [selectedTagSlugs, selectedDeckSlug])

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput), 350)
    return () => window.clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  // Reset tag pagination when toggling between main/all tags
  useEffect(() => {
    setTagPage(1)
  }, [showAllTags])

  // ── Open dialogs ─────────────────────────────────────────────────────────────

  function openCreate() {
    setEditData(undefined)
    setDialogOpen(true)
  }

  function openEdit(card: Flashcard) {
    setEditData({
      id: card.id,
      question: card.question,
      answer: card.answer,
      deckId: card.deck.id,
      questionImageId: card.questionImageId,
      answerImageId: card.answerImageId,
      tagIds: card.tags.map((t) => t.id),
    })
    setDialogOpen(true)
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    if (!confirm('Delete this flashcard? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/flashcards/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setFlashcards((prev) => prev.filter((f) => f.id !== id))
      } else {
        setError('Failed to delete flashcard.')
      }
    } catch {
      setError('Network error — please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  // ── Delete tag ──────────────────────────────────────────────────────────────
  async function handleDeleteTag(tagId: string) {
    if (!confirm('Delete this tag? This will remove the tag from all flashcards.')) return
    try {
      const res = await fetch(`/api/tags/${tagId}`, { method: 'DELETE' })
      if (res.ok) {
        // Refresh data
        await fetchData()
      } else {
        setError('Failed to delete tag.')
      }
    } catch {
      setError('Network error — please try again.')
    }
  }

  function toggleTagSlug(slug: string) {
    setSelectedTagSlugs((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const filteredFlashcards = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return flashcards
    return flashcards.filter((card) => {
      const hay = [
        card.question,
        card.answer,
        card.id,
        card.deck?.name ?? '',
        card.deck?.slug ?? '',
        ...(card.tags ?? []).map((t) => `${t.name} ${t.slug}`),
      ]
        .join('\n')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [flashcards, debouncedSearch])

  const hasActiveFilters =
    selectedTagSlugs.size > 0 || Boolean(selectedDeckSlug) || Boolean(debouncedSearch.trim())

  function clearAllFilters() {
    setSelectedTagSlugs(new Set())
    setSelectedDeckSlug(null)
    setSearchInput('')
    setDebouncedSearch('')
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ── Page header: title block, then toolbar (filters + primary CTA) ── */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">Flashcards</h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400 md:text-lg">
            Create, edit and organise flashcards. Students study them in their dashboard.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <div className="relative">
              <label htmlFor="flashcard-deck-filter" className="sr-only">Filter by deck</label>
              <select
                id="flashcard-deck-filter"
                value={selectedDeckSlug ?? ''}
                onChange={(e) => setSelectedDeckSlug(e.target.value || null)}
                className="h-9 min-w-[10rem] rounded-md border border-slate-300/50 bg-white/40 px-3 text-sm text-gray-900 shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-white/15 dark:bg-white/10 dark:text-gray-100"
              >
                <option value="">All decks</option>
                {deckOptions.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label htmlFor="flashcard-sort" className="sr-only">Sort flashcards</label>
              <div className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center">
                <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>
              </div>
              <select
                id="flashcard-sort"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as 'newest' | 'oldest' | 'az' | 'za')}
                className="h-9 rounded-md border border-slate-300/50 bg-white/40 pl-8 pr-3 text-sm text-gray-900 shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-white/15 dark:bg-white/10 dark:text-gray-100"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
              </select>
            </div>
          </div>
          <Button variant="hero" className="auth-hero-cta w-full sm:w-auto sm:shrink-0" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Flashcard
          </Button>
        </div>
      </div>

      {/* ── Search ── */}
      <div
        className={cn(
          'flex flex-col gap-3 rounded-xl border-0 p-4 shadow-none sm:flex-row sm:flex-wrap sm:items-end',
          adminGlassCard,
        )}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <label htmlFor="flashcard-search" className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="flashcard-search"
              type="search"
              placeholder="Question, answer, deck, tags, id…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border-slate-300/50 bg-white/50 pl-9 dark:border-white/15 dark:bg-white/10"
              autoComplete="off"
            />
          </div>
        </div>
        {hasActiveFilters ? (
          <Button type="button" variant="outline" size="sm" className={cn(adminGlassOutlineButton)} onClick={clearAllFilters}>
            <X className="mr-1.5 h-4 w-4" />
            Clear filters
          </Button>
        ) : null}
      </div>

      {/* ── Tags strip ── */}
      {allTags.length > 0 && (
        <div>
            <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
              <TagIcon className="h-3.5 w-3.5" />
              <span>Browse by tag</span>
            </div>
            <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" className={cn(adminGlassOutlineButton)} onClick={() => setShowAllTags((s) => !s)}>
                  {showAllTags ? 'Show main tags' : 'Show all tags'}
                </Button>
              <span className="mr-1 text-xs text-gray-400">Sort:</span>
              {(
                [
                  { key: 'name-asc',   icon: <ArrowUpAZ   className="h-4 w-4" />, title: 'A → Z', onClick: () => { setTagSortField('name'); setTagSortDir('asc') } },
                  { key: 'name-desc',  icon: <ArrowDownAZ className="h-4 w-4" />, title: 'Z → A', onClick: () => { setTagSortField('name'); setTagSortDir('desc') } },
                  { key: 'count-desc', icon: <ArrowDown01 className="h-4 w-4" />, title: 'Most used first', onClick: () => { setTagSortField('count'); setTagSortDir('desc') } },
                  { key: 'count-asc',  icon: <ArrowUp01   className="h-4 w-4" />, title: 'Least used first', onClick: () => { setTagSortField('count'); setTagSortDir('asc') } },
                ] as Array<{ key: string; icon: React.ReactNode; title: string; onClick: () => void }>
              ).map(({ key, icon, title, onClick }) => (
                <button
                  key={key}
                  type="button"
                  title={title}
                  onClick={onClick}
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors',
                    (tagSortField === 'name' && key.startsWith('name') && tagSortDir === (key.endsWith('asc') ? 'asc' : 'desc')) ||
                      (tagSortField === 'count' && key.startsWith('count') && tagSortDir === (key.endsWith('asc') ? 'asc' : 'desc'))
                      ? adminGlassIconToggleActive
                      : adminGlassIconToggleInactive,
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Left arrow */}
            <button
              type="button"
              onClick={() => setTagPage((p) => Math.max(1, p - 1))}
              disabled={tagPage === 1}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md border text-gray-600 transition-colors disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-400',
                adminGlassIconToggleInactive,
                'hover:text-foreground',
              )}
              title="Previous tags"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page indicator */}
            {(() => {
              const arr = [...(showAllTags ? allTags : allTags.filter((t) => t.main))]
              const TAGS_PER_PAGE = 15
              const totalPages = Math.max(1, Math.ceil(arr.length / TAGS_PER_PAGE))
              return totalPages > 1 ? (
                <div className="flex items-center px-2 text-xs text-gray-500">
                  {tagPage} / {totalPages}
                </div>
              ) : null
            })()}

            <div className="flex flex-1 flex-wrap gap-2">
              {selectedTagSlugs.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTagSlugs(new Set())}
                  className={cn(studentGlassPill, 'cursor-pointer border-dashed opacity-95 hover:opacity-100')}
                >
                  <span className="mr-1 text-xs">Clear</span>
                  <span className="text-xs text-gray-500">({selectedTagSlugs.size})</span>
                </button>
              )}

              {(() => {
                const arr = [...(showAllTags ? allTags : allTags.filter((t) => t.main))]
                arr.sort((a, b) => {
                  if (tagSortField === 'name') {
                    const cmp = a.name.localeCompare(b.name)
                    return tagSortDir === 'asc' ? cmp : -cmp
                  }
                  const ca = a._count?.flashcards ?? 0
                  const cb = b._count?.flashcards ?? 0
                  if (ca === cb) return a.name.localeCompare(b.name)
                  return tagSortDir === 'asc' ? ca - cb : cb - ca
                })
                // Move selected tag(s) to top while preserving relative order
                if (selectedTagSlugs.size > 0) {
                  const sel: Tag[] = []
                  const rest: Tag[] = []
                  for (const t of arr) {
                    if (selectedTagSlugs.has(t.slug)) sel.push(t)
                    else rest.push(t)
                  }
                  arr.splice(0, arr.length, ...[...sel, ...rest])
                }

                // Paginate: 15 tags per page
                const TAGS_PER_PAGE = 15
                const totalPages = Math.max(1, Math.ceil(arr.length / TAGS_PER_PAGE))
                const startIdx = (tagPage - 1) * TAGS_PER_PAGE
                const paginatedTags = arr.slice(startIdx, startIdx + TAGS_PER_PAGE)

                return paginatedTags.map((tag) => {
                const isActive = selectedTagSlugs.has(tag.slug)
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTagSlug(tag.slug)}
                    className={cn(
                      'inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-primary/45 bg-primary/20 text-primary shadow-sm ring-1 ring-primary/20 dark:bg-primary/25'
                        : cn(studentGlassPill, 'h-8 border font-medium normal-case tracking-normal'),
                    )}
                  >
                    <span className="max-w-[18rem] truncate">{tag.name}</span>
                    {tag._count !== undefined && (
                      <span
                        className={cn(
                          'ml-1 rounded-full px-1.5 py-0 text-xs',
                          isActive
                            ? 'bg-primary/20 text-primary dark:bg-primary/30'
                            : 'bg-white/50 text-slate-700 dark:bg-white/10 dark:text-gray-200',
                        )}
                      >
                        {tag._count.flashcards}
                      </span>
                    )}
                  </button>
                )
              })
            })()}
            </div>

            {/* Right arrow */}
            <button
              type="button"
              onClick={() => {
                const arr = [...(showAllTags ? allTags : allTags.filter((t) => t.main))]
                const TAGS_PER_PAGE = 15
                const totalPages = Math.max(1, Math.ceil(arr.length / TAGS_PER_PAGE))
                setTagPage((p) => Math.min(totalPages, p + 1))
              }}
              disabled={(() => {
                const arr = [...(showAllTags ? allTags : allTags.filter((t) => t.main))]
                const TAGS_PER_PAGE = 15
                const totalPages = Math.max(1, Math.ceil(arr.length / TAGS_PER_PAGE))
                return tagPage >= totalPages
              })()}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md border text-gray-600 transition-colors disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-400',
                adminGlassIconToggleInactive,
                'hover:text-foreground',
              )}
              title="Next tags"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Global error ── */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading flashcards…
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && filteredFlashcards.length === 0 && !error && (
        <div
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-400/40 bg-white/[0.12] py-16 text-center backdrop-blur-md dark:border-white/20 dark:bg-white/[0.04]',
          )}
        >
          <BookOpen className="mb-4 h-10 w-10 text-gray-300" />
          {flashcards.length > 0 ? (
            <>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                No flashcards match your search or filters
              </p>
              <p className="mt-1 max-w-md text-xs text-gray-400">
                Try different keywords, pick &ldquo;All decks&rdquo;, or clear tag filters.
              </p>
              <Button type="button" className={cn('mt-4', adminGlassOutlineButton)} variant="outline" onClick={clearAllFilters}>
                Clear filters
              </Button>
            </>
          ) : hasActiveFilters ? (
            <>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No flashcards match the selected filters</p>
              <Button type="button" className={cn('mt-4', adminGlassOutlineButton)} variant="outline" onClick={clearAllFilters}>
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-500">No flashcards yet</p>
              <p className="mt-1 text-xs text-gray-400">
                Click &ldquo;Add Flashcard&rdquo; to create your first one.
              </p>
              <Button className="auth-hero-cta mt-4" variant="hero" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Flashcard
              </Button>
            </>
          )}
        </div>
      )}

      {/* ── Flashcard grid ── */}
      {!loading && filteredFlashcards.length > 0 && (
        (() => {
          const sorted = [...filteredFlashcards]
          sorted.sort((a, b) => {
            if (sortKey === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            if (sortKey === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            if (sortKey === 'az') return a.question.localeCompare(b.question)
            return b.question.localeCompare(a.question)
          })
          return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sorted.map((card) => (
            <Card
              key={card.id}
              className={cn(
                'relative flex flex-col gap-0 overflow-hidden border-0 py-0 shadow-none',
                adminGlassCard,
              )}
            >
              <CardContent className="flex flex-1 flex-col gap-3 p-4">
                {/* Question */}
                <div>
                  <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Question
                  </p>
                  <p className="font-mono text-sm text-gray-800 dark:text-gray-200">
                    {truncate(card.question)}
                  </p>
                </div>

                {/* Answer */}
                <div>
                  <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Answer
                  </p>
                  <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                    {truncate(card.answer)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn(studentGlassPill, 'normal-case')}>{card.deck?.name ?? 'Deck'}</span>
                </div>

                {/* Tags */}
                {card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {card.tags.map((tag) => (
                      <Link key={tag.id} href={`/admin/flashcards/tags/${tag.slug}`}>
                        <span className={cn(studentGlassPill, 'cursor-pointer text-xs normal-case tracking-tight hover:opacity-100')}>
                          {tag.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Footer row — full width so layout doesn’t leave an empty “strip” beside actions */}
                <div className="mt-auto flex w-full min-w-0 flex-wrap items-center justify-between gap-2 border-t border-slate-200/40 pt-3 dark:border-white/10">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        studentGlassPill,
                        'py-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-90',
                      )}
                    >
                      {card.state}
                    </span>
                    {card.interval > 0 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">{card.interval}d</span>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label="Edit flashcard"
                      onClick={() => openEdit(card)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/30 hover:text-primary dark:hover:bg-white/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      aria-label="Delete flashcard"
                      disabled={deletingId === card.id}
                      onClick={() => handleDelete(card.id)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
                    >
                      {deletingId === card.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
          )
        })()
      )}

      {/* ── Dialog (create + edit) ── */}
      <FlashcardDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          void fetchData()
        }}
        initialData={editData}
      />
    </div>
  )
}


