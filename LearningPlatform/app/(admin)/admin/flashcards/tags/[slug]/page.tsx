'use client'

import { useEffect, useState, useCallback } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, Pencil, Loader2, BookOpen, ArrowLeft, Tag as TagIcon } from 'lucide-react'
import { FlashcardDialog, type FlashcardInitialData } from '@/components/admin/add-flashcard-dialog'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tag {
  id: string
  name: string
  slug: string
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

export default function FlashcardsByTagPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)

  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [tagName, setTagName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<FlashcardInitialData | undefined>(undefined)

  // Optimistic actions
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Fetch flashcards for this tag ────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const [fcRes, tagRes] = await Promise.all([
        fetch(`/api/flashcards?tagSlug=${encodeURIComponent(slug)}`),
        fetch('/api/tags'),
      ])

      if (!fcRes.ok) throw new Error('Failed to load flashcards')

      const fcData = await fcRes.json()
      const cards: Flashcard[] = fcData.flashcards ?? []
      setFlashcards(cards)

      if (tagRes.ok) {
        const tagData = await tagRes.json()
        const found = (tagData.tags ?? []).find((t: Tag) => t.slug === slug)
        if (found) setTagName(found.name)
      }
    } catch {
      setError('Could not load flashcards for this tag.')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchData()
    }, 0)
    return () => window.clearTimeout(t)
  }, [fetchData])

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

  // ── Render ───────────────────────────────────────────────────────────────────

  const displayName = tagName || slug

  return (
    <div className="space-y-6">
      {/* ── Navigation breadcrumb ── */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          href="/admin/flashcards"
          className="flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Flashcards
        </Link>
        <span>/</span>
        <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
          <TagIcon className="h-3.5 w-3.5" />
          {displayName}
        </span>
      </div>

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Tag:{' '}
            <span className="text-blue-600 dark:text-blue-400">{displayName}</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading
              ? 'Loading…'
              : `${flashcards.length} flashcard${flashcards.length !== 1 ? 's' : ''} with this tag`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Flashcard
          </Button>
        </div>
      </div>

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
          <p className="text-sm font-medium text-gray-500">
            No flashcards with tag &ldquo;{displayName}&rdquo;
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Create one below, or go back and assign this tag to existing flashcards.
          </p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Flashcard
          </Button>
        </div>
      )}

      {/* ── Flashcard grid ── */}
      {!loading && flashcards.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {flashcards.map((card) => (
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

                {/* All tags on this card */}
                {card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {card.tags.map((tag) => (
                      <Link key={tag.id} href={`/admin/flashcards/tags/${tag.slug}`}>
                        <Badge
                          variant={tag.slug === slug ? 'default' : 'secondary'}
                          className="cursor-pointer text-xs hover:opacity-80"
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
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      {card.state}
                    </span>
                    {card.interval > 0 && (
                      <span className="text-xs text-gray-400">{card.interval}d</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Edit flashcard"
                      onClick={() => openEdit(card)}
                      className="rounded p-1 text-gray-400 hover:text-blue-500"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

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
      )}

      {/* ── Dialog ── */}
      <FlashcardDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={fetchData}
        initialData={editData}
      />
    </div>
  )
}
