'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { X, ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { MediaPicker } from './media-picker'
import { AdminFlashcardTagPicker } from './admin-flashcard-tag-picker'
import { cn } from '@/lib/utils'
import { adminGlassOutlineButton, adminGlassSheet } from '@/lib/student-glass-styles'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlashcardDeckRow {
  id: string
  name: string
  slug: string
  courseId?: string | null
  moduleId?: string | null
  parentDeckId?: string | null
  parentDeck?: { id: string; name: string; slug: string } | null
}

interface CourseHierarchy {
  id: string
  title: string
  modules: Array<{ id: string; title: string; order?: number }>
}

/** Middle-dot segments: Subdeck · module (or deck name) · course title. */
const DECK_OPTION_LABEL_SEP = ' · '

/** Decks shown in the create/edit target dropdown (create + browse filters + lock). */
function filterEligibleFlashcardDecks(
  list: FlashcardDeckRow[],
  opts: {
    isEditMode: boolean
    initialDeckId?: string
    editDeckId?: string
    restrictToParentMainDeckId?: string | null
    lockDeckSelection?: boolean
  },
): FlashcardDeckRow[] {
  const { isEditMode, initialDeckId, editDeckId, restrictToParentMainDeckId, lockDeckSelection } = opts

  let pool = list

  if (!isEditMode && restrictToParentMainDeckId) {
    const main = list.find((d) => d.id === restrictToParentMainDeckId)
    if (!main) {
      pool = []
    } else {
      const isStandaloneMain = !main.courseId || String(main.courseId).trim() === ''
      pool = list.filter((deck) => {
        if (deck.parentDeckId === restrictToParentMainDeckId) return true
        if (isStandaloneMain && deck.id === restrictToParentMainDeckId) return true
        return false
      })
    }
  }

  pool = pool.filter((deck) => {
    if (deck.parentDeckId) return true
    const standaloneMain = !deck.courseId || String(deck.courseId).trim() === ''
    if (standaloneMain) return true
    return deck.id === editDeckId || deck.id === initialDeckId
  })

  const lockId = initialDeckId ?? editDeckId
  if (lockDeckSelection && lockId) {
    const inPool = pool.find((d) => d.id === lockId)
    if (inPool) return [inPool]
    const inList = list.find((d) => d.id === lockId)
    return inList ? [inList] : pool
  }

  return pool
}

function formatFlashcardDeckOptionLabel(
  d: FlashcardDeckRow,
  courseById: Record<string, string>,
  moduleById: Record<string, string>,
): string {
  const courseTitle = (d.courseId && courseById[d.courseId]) || ''
  if (d.parentDeckId) {
    const moduleTitle = d.moduleId ? moduleById[d.moduleId] : ''
    const displayName = moduleTitle || d.name
    const parts = ['Subdeck', displayName]
    if (courseTitle) parts.push(courseTitle)
    return parts.join(DECK_OPTION_LABEL_SEP)
  }
  const standaloneMain = !d.courseId || String(d.courseId).trim() === ''
  if (standaloneMain) {
    return `Standalone main · ${d.name}`
  }
  const parts = ['Main deck', d.name]
  if (courseTitle) parts.push(courseTitle)
  return parts.join(DECK_OPTION_LABEL_SEP)
}

export interface FlashcardInitialData {
  /** When present the dialog operates in **edit** mode. */
  id: string
  question: string
  answer: string
  deckId: string
  questionImageId?: string | null
  answerImageId?: string | null
  tagIds: string[]
}

interface FlashcardDialogProps {
  open: boolean
  onClose: () => void
  /** Called after a successful save so the parent can refresh its list. */
  onSaved?: () => void
  /** Omit for create mode, supply for edit mode. */
  initialData?: FlashcardInitialData
  /** Optional deck preselection for contextual create flows. */
  initialDeckId?: string
  /** When true, deck selection is locked to initial deck. */
  lockDeckSelection?: boolean
  /**
   * Create mode only: limit the deck dropdown to this main deck’s subdecks, or — for a standalone
   * main — that main plus its subdecks.
   */
  restrictToParentMainDeckId?: string
}

// keep old prop shape working
interface AddFlashcardDialogProps {
  open: boolean
  onClose: () => void
  /** Called after a flashcard is successfully created so the parent can refresh. */
  onCreated?: () => void
}

// ─── LaTeX preview helper ─────────────────────────────────────────────────────
// Renders a tiny inline preview via KaTeX.  Loaded lazily to avoid SSR issues.

function LatexPreview({ source }: { source: string }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    if (!source.trim()) {
      queueMicrotask(() => setHtml(''))
      return
    }
    let cancelled = false
    import('katex').then((katex) => {
      if (cancelled) return
      try {
        const rendered = katex.default.renderToString(source, {
          throwOnError: false,
          displayMode: false,
        })
        setHtml(rendered)
      } catch {
        setHtml(source)
      }
    })
    return () => {
      cancelled = true
    }
  }, [source])

  if (!html) return null

  return (
    <div
      className="mt-1 rounded border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800/40"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

// ─── Image field helper ───────────────────────────────────────────────────────

interface ImageFieldProps {
  imageId: string | null
  imageUrl: string | undefined
  label: string
  onClear: () => void
  onOpen: () => void
}

function ImageField({ imageId, imageUrl, label, onClear, onOpen }: ImageFieldProps) {
  if (imageId && imageUrl) {
    return (
      <div className="relative inline-block">
        <Image src={imageUrl} alt={label} width={200} height={120} unoptimized className="rounded-md border object-cover" />
        <button
          type="button"
          onClick={onClear}
          className="absolute -right-2 -top-2 rounded-full bg-white p-0.5 shadow dark:bg-gray-800"
          aria-label={`Remove ${label}`}
        >
          <X className="h-3.5 w-3.5 text-red-500" />
        </button>
      </div>
    )
  }
  if (imageId && !imageUrl) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-12 w-20 items-center justify-center rounded-md border bg-gray-50 text-gray-400 dark:bg-gray-800">
          <ImageIcon className="h-5 w-5" />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onOpen}>Change</Button>
        <button type="button" onClick={onClear} className="text-xs text-red-400 hover:underline">Remove</button>
      </div>
    )
  }
  return (
    <Button type="button" variant="outline" size="sm" onClick={onOpen}>
      <ImageIcon className="mr-2 h-4 w-4" />
      Add {label.toLowerCase()}
    </Button>
  )
}

// ─── FlashcardDialog (create + edit) ─────────────────────────────────────────

export function FlashcardDialog({
  open,
  onClose,
  onSaved,
  initialData,
  initialDeckId,
  lockDeckSelection = false,
  restrictToParentMainDeckId: restrictToParentMainDeckIdProp,
}: FlashcardDialogProps) {
  const isEditMode = Boolean(initialData?.id)
  const restrictToParentMainDeckId = isEditMode ? undefined : restrictToParentMainDeckIdProp

  // ── Form fields ──────────────────────────────────────────────────────────────
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  // ── Image pickers ────────────────────────────────────────────────────────────
  const [questionImageId, setQuestionImageId] = useState<string | null>(null)
  const [questionImageUrl, setQuestionImageUrl] = useState<string | undefined>()
  const [showQuestionPicker, setShowQuestionPicker] = useState(false)

  const [answerImageId, setAnswerImageId] = useState<string | null>(null)
  const [answerImageUrl, setAnswerImageUrl] = useState<string | undefined>()
  const [showAnswerPicker, setShowAnswerPicker] = useState(false)

  // ── Deck ─────────────────────────────────────────────────────────────────────
  const [decks, setDecks] = useState<FlashcardDeckRow[]>([])
  const [deckId, setDeckId] = useState<string>('')
  const [decksLoading, setDecksLoading] = useState(false)
  const [courseById, setCourseById] = useState<Record<string, string>>({})
  const [moduleById, setModuleById] = useState<Record<string, string>>({})

  // ── Tags (shared picker) ─────────────────────────────────────────────────────
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  // ── Submission ───────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // ── Populate fields (and load tags) when dialog opens ────────────────────────
  useEffect(() => {
    if (!open) return

    // Pre-fill fields from initialData
    queueMicrotask(() => {
      setQuestion(initialData?.question ?? '')
      setAnswer(initialData?.answer ?? '')
      setQuestionImageId(initialData?.questionImageId ?? null)
      setAnswerImageId(initialData?.answerImageId ?? null)
      setQuestionImageUrl(undefined)
      setAnswerImageUrl(undefined)
      setSelectedTagIds(initialData?.tagIds ?? [])
      setError('')
      setFieldErrors({})
    })

    queueMicrotask(() => setDecksLoading(true))
    Promise.all([
      fetch('/api/flashcard-decks').then((r) => r.json()),
      fetch('/api/admin/courses-hierarchy').then((r) => r.json()),
    ])
      .then(([deckData, hierarchyData]) => {
        const list: FlashcardDeckRow[] = deckData.decks ?? []
        setDecks(list)
        const courses: CourseHierarchy[] = hierarchyData.courses ?? []
        const nextCourseById: Record<string, string> = {}
        const nextModuleById: Record<string, string> = {}
        for (const course of courses) {
          nextCourseById[course.id] = course.title
          for (const mod of course.modules ?? []) {
            nextModuleById[mod.id] = mod.title
          }
        }
        setCourseById(nextCourseById)
        setModuleById(nextModuleById)
        const eligible = filterEligibleFlashcardDecks(list, {
          isEditMode: Boolean(initialData?.id),
          initialDeckId,
          editDeckId: initialData?.deckId,
          restrictToParentMainDeckId: restrictToParentMainDeckId ?? null,
          lockDeckSelection,
        })
        const preferred = initialDeckId ?? initialData?.deckId
        const resolved =
          preferred && eligible.some((d) => d.id === preferred)
            ? preferred
            : eligible[0]?.id ?? ''
        setDeckId(resolved)
      })
      .catch(() => {
        setDecks([])
        setDeckId('')
        setCourseById({})
        setModuleById({})
      })
      .finally(() => {
        setDecksLoading(false)
      })

    // Resolve image URLs in edit mode
    const idsToResolve = [initialData?.questionImageId, initialData?.answerImageId].filter(Boolean)
    if (idsToResolve.length) {
      fetch('/api/media/list')
        .then((r) => r.json())
        .then((data: { media?: Array<{ id: string | number; url: string }> }) => {
          const list = data.media ?? []
          if (initialData?.questionImageId) {
            const m = list.find((x) => String(x.id) === String(initialData.questionImageId))
            if (m) setQuestionImageUrl(m.url)
          }
          if (initialData?.answerImageId) {
            const m = list.find((x) => String(x.id) === String(initialData.answerImageId))
            if (m) setAnswerImageUrl(m.url)
          }
        })
        .catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialDeckId, initialData?.deckId, restrictToParentMainDeckId, lockDeckSelection])

  const eligibleDecks = useMemo(
    () =>
      filterEligibleFlashcardDecks(decks, {
        isEditMode: Boolean(initialData?.id),
        initialDeckId,
        editDeckId: initialData?.deckId,
        restrictToParentMainDeckId: restrictToParentMainDeckId ?? null,
        lockDeckSelection,
      }),
    [decks, initialData?.id, initialData?.deckId, initialDeckId, restrictToParentMainDeckId, lockDeckSelection],
  )

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function handleClose() {
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setFieldErrors({})

    if (!deckId) {
      setError('Choose a deck before saving.')
      setSubmitting(false)
      return
    }

    const body = {
      question,
      answer,
      deckId,
      questionImageId: questionImageId ?? null,
      answerImageId: answerImageId ?? null,
      tagIds: selectedTagIds,
    }

    try {
      const url = isEditMode ? `/api/flashcards/${initialData!.id}` : '/api/flashcards'
      const method = isEditMode ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        onSaved?.()
        onClose()
      } else {
        const data = await res.json()
        if (data.issues) setFieldErrors(data.issues)
        else setError(data.error ?? 'Failed to save flashcard')
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const formId = isEditMode ? 'edit-flashcard-form' : 'add-flashcard-form'
  const titleText = isEditMode ? 'Edit Flashcard' : 'Add Flashcard'
  const saveLabel = isEditMode ? 'Save changes' : 'Save Flashcard'

  const sortedDecks = [...eligibleDecks].sort((a, b) => {
    const aCourse = (a.courseId ? courseById[a.courseId] : '') || ''
    const bCourse = (b.courseId ? courseById[b.courseId] : '') || ''
    if (aCourse !== bCourse) return aCourse.localeCompare(bCourse)
    if (a.parentDeckId === null && b.parentDeckId !== null) return -1
    if (a.parentDeckId !== null && b.parentDeckId === null) return 1
    const aSortName =
      a.parentDeckId && a.moduleId && moduleById[a.moduleId] ? moduleById[a.moduleId]! : a.name
    const bSortName =
      b.parentDeckId && b.moduleId && moduleById[b.moduleId] ? moduleById[b.moduleId]! : b.name
    return aSortName.localeCompare(bSortName)
  })

  return (
    <>
      {/* ── Backdrop ── */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={handleClose} aria-hidden />

      {/* ── Panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="flashcard-dialog-title"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col overflow-hidden',
          adminGlassSheet,
        )}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200/60 px-6 py-4 dark:border-white/10">
          <h2 id="flashcard-dialog-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {titleText}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-white/30 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form id={formId} onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
          {/* Global error */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* ── Question ── */}
          <section>
            <Label htmlFor="question" className="mb-1 block font-medium">
              Question <span className="text-red-500">*</span>
            </Label>
            <p className="mb-2 text-xs text-gray-500">
              Supports LaTeX — wrap inline math in <code>$…$</code> and display math in{' '}
              <code>$$…$$</code>.
            </p>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What is $E = mc^2$?"
              rows={4}
              required
              className="font-mono text-sm"
            />
            {fieldErrors.question && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.question[0]}</p>
            )}
            <div className="mt-3">
              <ImageField
                imageId={questionImageId}
                imageUrl={questionImageUrl}
                label="Question image"
                onClear={() => { setQuestionImageId(null); setQuestionImageUrl(undefined) }}
                onOpen={() => setShowQuestionPicker(true)}
              />
            </div>
          </section>

          {/* ── Answer ── */}
          <section>
            <Label htmlFor="answer" className="mb-1 block font-medium">
              Answer <span className="text-red-500">*</span>
            </Label>
            <p className="mb-2 text-xs text-gray-500">
              Supports LaTeX — use the same <code>$…$</code> / <code>$$…$$</code> syntax.
            </p>
            <Textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="e.g. Energy equals mass times speed of light squared."
              rows={4}
              required
              className="font-mono text-sm"
            />
            {fieldErrors.answer && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.answer[0]}</p>
            )}
            <div className="mt-3">
              <ImageField
                imageId={answerImageId}
                imageUrl={answerImageUrl}
                label="Answer image"
                onClear={() => { setAnswerImageId(null); setAnswerImageUrl(undefined) }}
                onOpen={() => setShowAnswerPicker(true)}
              />
            </div>
          </section>

          {/* ── Deck ── */}
          <section>
            <Label htmlFor="flashcard-deck" className="mb-1 block font-medium">
              Deck <span className="text-red-500">*</span>
            </Label>
            {decksLoading ? (
              <p className="text-sm text-gray-400">Loading decks…</p>
            ) : decks.length === 0 ? (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                No decks yet. Run a flashcard import or create a deck via the API.
              </p>
            ) : (
              <select
                id="flashcard-deck"
                value={deckId}
                onChange={(e) => setDeckId(e.target.value)}
                disabled={lockDeckSelection}
                required
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-gray-700 dark:bg-gray-900"
              >
                {sortedDecks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {formatFlashcardDeckOptionLabel(d, courseById, moduleById)}
                  </option>
                ))}
              </select>
            )}
            {!decksLoading && sortedDecks.length === 0 && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                No subdecks or standalone main decks yet. Create a subdeck or a standalone collection first.
              </p>
            )}
            {fieldErrors.deckId && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.deckId[0]}</p>
            )}
          </section>

          {/* ── LaTeX quick preview ── */}
          {(question.includes('$') || answer.includes('$')) && (
            <section>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                LaTeX preview
              </p>
              {question.includes('$') && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400">Question</p>
                  <LatexPreview source={question.replace(/\$\$([\s\S]*?)\$\$/g, '$1').replace(/\$([\s\S]*?)\$/g, '$1')} />
                </div>
              )}
              {answer.includes('$') && (
                <div>
                  <p className="text-xs text-gray-400">Answer</p>
                  <LatexPreview source={answer.replace(/\$\$([\s\S]*?)\$\$/g, '$1').replace(/\$([\s\S]*?)\$/g, '$1')} />
                </div>
              )}
            </section>
          )}

          {/* ── Tags ── */}
          <AdminFlashcardTagPicker
            active={open}
            value={selectedTagIds}
            onChange={setSelectedTagIds}
            disabled={submitting}
            quickPickMode={isEditMode ? 'all' : 'popular'}
            layout="dialog"
            searchInputId="flashcard-tag-search"
            onTagError={(msg) => setError(msg)}
          />
        </form>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-slate-200/60 px-6 py-4 dark:border-white/10">
          <Button
            type="button"
            variant="outline"
            className={cn(adminGlassOutlineButton)}
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" form={formId} variant="hero" className="auth-hero-cta" disabled={submitting}>
            {submitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
            ) : (
              saveLabel
            )}
          </Button>
        </div>
      </div>

      {/* ── Media pickers ── */}
      <MediaPicker
        open={showQuestionPicker}
        onClose={() => setShowQuestionPicker(false)}
        onSelect={(media) => { setQuestionImageId(media.id); setQuestionImageUrl(media.url); setShowQuestionPicker(false) }}
        currentMediaId={questionImageId}
        filter="image"
      />
      <MediaPicker
        open={showAnswerPicker}
        onClose={() => setShowAnswerPicker(false)}
        onSelect={(media) => { setAnswerImageId(media.id); setAnswerImageUrl(media.url); setShowAnswerPicker(false) }}
        currentMediaId={answerImageId}
        filter="image"
      />
    </>
  )
}

/** @deprecated Use FlashcardDialog with no initialData instead. */
export function AddFlashcardDialog({ open, onClose, onCreated }: AddFlashcardDialogProps) {
  return <FlashcardDialog open={open} onClose={onClose} onSaved={onCreated} />
}