'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, Pencil, Loader2, BookOpen, Tag as TagIcon, ArrowUpAZ, ArrowDownAZ, ArrowUp01, ArrowDown01, ChevronLeft, ChevronRight } from 'lucide-react'
import { FlashcardDialog, type FlashcardInitialData } from '@/components/admin/add-flashcard-dialog'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<FlashcardInitialData | undefined>(undefined)

  // Optimistic actions
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchData = useCallback(async (tagSlugsCsv?: string | null) => {
    try {
      setLoading(true)
      setError('')
      const [fcRes, tagRes] = await Promise.all([
        fetch(`/api/flashcards${tagSlugsCsv ? `?tagSlugs=${encodeURIComponent(tagSlugsCsv)}` : ''}`),
        fetch('/api/tags'),
      ])
      if (!fcRes.ok) throw new Error('Failed to load flashcards')
      const fcData = await fcRes.json()
      const tagData = tagRes.ok ? await tagRes.json() : { tags: [] }
      const cards = fcData.flashcards ?? []
      setFlashcards(cards)
      // Keep full tag list in state; UI decides which to show via toggle
      setAllTags(tagData.tags ?? [])
    } catch {
      setError('Could not load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const tagSlugsCsv = selectedTagSlugs.size > 0 ? Array.from(selectedTagSlugs).join(',') : null
    void fetchData(tagSlugsCsv)
  }, [fetchData, selectedTagSlugs])

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

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flashcards</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, edit and organise flashcards. Students study them in their dashboard.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <label htmlFor="flashcard-sort" className="sr-only">Sort flashcards</label>
            <div className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center">
              <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>
            </div>
            <select
              id="flashcard-sort"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as 'newest' | 'oldest' | 'az' | 'za')}
              className="h-9 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
          </div>
          <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Flashcard
          </Button>
        </div>
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
                <Button size="sm" variant="outline" onClick={() => setShowAllTags((s) => !s)}>
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
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors ${
                    (tagSortField === 'name' && key.startsWith('name') && tagSortDir === (key.endsWith('asc') ? 'asc' : 'desc')) ||
                    (tagSortField === 'count' && key.startsWith('count') && tagSortDir === (key.endsWith('asc') ? 'asc' : 'desc'))
                      ? 'border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400'
                  }`}
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
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
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
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
                    className={isActive
                      ? 'inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border border-blue-400 bg-blue-400 px-3 text-sm font-medium text-blue-50 dark:border-blue-600 dark:bg-blue-600 dark:text-white'
                      : 'inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-700 transition-colors hover:border-blue-400 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                    }
                  >
                    <span className="truncate max-w-[18rem]">{tag.name}</span>
                    {tag._count !== undefined && (
                      <span className="ml-1 rounded-full bg-blue-200/60 px-1.5 py-0 text-xs text-blue-800 dark:bg-blue-800/60 dark:text-blue-200">
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
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
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
      {!loading && flashcards.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <BookOpen className="mb-4 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No flashcards yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Click &ldquo;Add Flashcard&rdquo; to create your first one.
          </p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Flashcard
          </Button>
        </div>
      )}

      {/* ── Flashcard grid ── */}
      {!loading && flashcards.length > 0 && (
        (() => {
          const sorted = [...flashcards]
          sorted.sort((a, b) => {
            if (sortKey === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            if (sortKey === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            if (sortKey === 'az') return a.question.localeCompare(b.question)
            return b.question.localeCompare(a.question)
          })
          return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sorted.map((card) => (
            <Card key={card.id} className="relative flex flex-col">
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

                {/* Tags */}
                {card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {card.tags.map((tag) => (
                      <Link key={tag.id} href={`/admin/flashcards/tags/${tag.slug}`}>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer text-xs hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
                        >
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Footer row */}
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {/* State badge */}
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {card.state}
                    </span>
                    {card.interval > 0 && (
                      <span className="text-xs text-gray-400">{card.interval}d</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Edit */}
                    <button
                      type="button"
                      aria-label="Edit flashcard"
                      onClick={() => openEdit(card)}
                      className="rounded p-1 text-gray-400 hover:text-blue-500"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      aria-label="Delete flashcard"
                      disabled={deletingId === card.id}
                      onClick={() => handleDelete(card.id)}
                      className="rounded p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
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
        onSaved={fetchData}
        initialData={editData}
      />
    </div>
  )
}


