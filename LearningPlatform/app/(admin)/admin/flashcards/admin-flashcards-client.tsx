'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  ChevronDown,
  Search,
  X,
} from 'lucide-react'
import { FlashcardDialog, type FlashcardInitialData } from '@/components/admin/add-flashcard-dialog'
import { AdminFlashcardTagPicker } from '@/components/admin/admin-flashcard-tag-picker'
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
  _count?: { flashcards?: number; tasks?: number }
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

interface DeckRow {
  id: string
  name: string
  slug: string
  description?: string | null
  /** Payload `subjects` id for standalone main decks (catalog). */
  subjectId?: string | null
  courseId?: string | null
  moduleId?: string | null
  parentDeckId?: string | null
  parentDeck?: { id: string; name: string; slug: string } | null
  tags?: Tag[]
  _count?: { flashcards?: number; childDecks?: number }
}

interface CourseHierarchy {
  id: string
  title: string
  modules: Array<{ id: string; title: string; order: number }>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncate(text: string, max = 80): string {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '…'
}

/** Align Payload / Prisma id strings for Set lookups (case, whitespace). */
function normalizeContentId(id: string | null | undefined): string {
  if (id == null) return ''
  return String(id).trim().toLowerCase()
}

/** All flashcards tab with main deck (and optional subdeck) pre-selected via URL. */
function adminAllFlashcardsHref(mainDeckId: string, subdeckSlug?: string | null) {
  const qs = new URLSearchParams()
  qs.set('view', 'all')
  qs.set('mainDeckId', mainDeckId)
  if (subdeckSlug) qs.set('deckSlug', subdeckSlug)
  return `/admin/flashcards?${qs.toString()}`
}

function tagUsageTotal(tag: Tag): number {
  return (tag._count?.tasks ?? 0) + (tag._count?.flashcards ?? 0)
}

function tagUsageTitle(tag: Tag): string {
  const t = tag._count?.tasks ?? 0
  const f = tag._count?.flashcards ?? 0
  return `${t} task${t === 1 ? '' : 's'}, ${f} flashcard${f === 1 ? '' : 's'}`
}

/** Selected tag in browse strip + on cards; higher contrast in dark mode than primary/20 alone. */
function browseTagFilterActiveTint(): string {
  return cn(
    'border-primary bg-primary/20 text-primary shadow-sm ring-2 ring-primary/40',
    'dark:border-primary dark:bg-primary/50 dark:text-white dark:ring-2 dark:ring-primary dark:ring-offset-2 dark:ring-offset-background',
  )
}

const FLASHCARDS_PER_PAGE = 15
/** Cards listed on page 1 beside the leading “Add new” tile. */
const FIRST_PAGE_CARD_SLOTS = FLASHCARDS_PER_PAGE - 1

function totalFlashcardGridPages(cardCount: number): number {
  if (cardCount <= 0) return 1
  return 1 + Math.ceil((cardCount - FIRST_PAGE_CARD_SLOTS) / FLASHCARDS_PER_PAGE)
}

function sliceFlashcardsForGridPage(page: number, sorted: Flashcard[]): Flashcard[] {
  if (page === 1) return sorted.slice(0, FIRST_PAGE_CARD_SLOTS)
  const start = FIRST_PAGE_CARD_SLOTS + (page - 2) * FLASHCARDS_PER_PAGE
  return sorted.slice(start, start + FLASHCARDS_PER_PAGE)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminFlashcardsPage() {
  const searchParams = useSearchParams()
  type FlashcardsAdminView = 'courseTree' | 'standaloneTree' | 'all'
  const [activeView, setActiveView] = useState<FlashcardsAdminView>('courseTree')
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [showAllTags, setShowAllTags] = useState(false)
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<Set<string>>(new Set())
  const [tagSortField, setTagSortField] = useState<'name' | 'count'>('name')
  const [tagSortDir, setTagSortDir] = useState<'asc' | 'desc'>('asc')
  const [tagPage, setTagPage] = useState(1)
  const [cardPage, setCardPage] = useState(1)
  const [sortKey, setSortKey] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest')
  const [selectedMainDeckId, setSelectedMainDeckId] = useState<string | null>(null)
  const [selectedSubdeckSlug, setSelectedSubdeckSlug] = useState<string | null>(null)
  const [deckRows, setDeckRows] = useState<DeckRow[]>([])
  const [courses, setCourses] = useState<CourseHierarchy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Deck hierarchy: which main decks have their subdeck list expanded (default: none — lists stay hidden)
  const [expandedHierarchyMainIds, setExpandedHierarchyMainIds] = useState<Set<string>>(() => new Set())

  // Create main deck (expandable section in Deck hierarchy)
  const [inlineMainDeckOpen, setInlineMainDeckOpen] = useState(false)
  const [deckSubmitting, setDeckSubmitting] = useState(false)
  const [deckCourseId, setDeckCourseId] = useState('')

  // Inline subdeck row (module picker only)
  const [inlineSubdeckMainId, setInlineSubdeckMainId] = useState<string | null>(null)
  const [inlineSubdeckModuleId, setInlineSubdeckModuleId] = useState('')
  const [subdeckSubmitting, setSubdeckSubmitting] = useState(false)

  // Standalone decks (no course)
  const [inlineStandaloneDeckOpen, setInlineStandaloneDeckOpen] = useState(false)
  const [standaloneNewDeckName, setStandaloneNewDeckName] = useState('')
  const [standaloneNewDeckDescription, setStandaloneNewDeckDescription] = useState('')
  const [subjectOptions, setSubjectOptions] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [standaloneSubjectInput, setStandaloneSubjectInput] = useState('')
  const [standaloneSubjectId, setStandaloneSubjectId] = useState<string | null>(null)
  /** Deck-level tags (separate from catalog subject). */
  const [standaloneDeckTagIds, setStandaloneDeckTagIds] = useState<string[]>([])
  const [standaloneSubjectMenuOpen, setStandaloneSubjectMenuOpen] = useState(false)
  /** Browser `setTimeout` id (number); Node types use `Timeout` — use broad ref for client bundle. */
  const standaloneSubjectBlurTimer = useRef<number | null>(null)
  const [inlineStandaloneSubdeckMainId, setInlineStandaloneSubdeckMainId] = useState<string | null>(null)
  const [inlineStandaloneSubdeckName, setInlineStandaloneSubdeckName] = useState('')
  const [deckDeletingId, setDeckDeletingId] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<FlashcardInitialData | undefined>(undefined)
  const [createFlashcardDeckId, setCreateFlashcardDeckId] = useState<string | undefined>(undefined)
  const [lockCreateFlashcardDeck, setLockCreateFlashcardDeck] = useState(false)
  /** Create-from-browse: limit deck dropdown to subdecks under this main (or standalone main + its subdecks). */
  const [createRestrictParentMainDeckId, setCreateRestrictParentMainDeckId] = useState<string | undefined>(undefined)

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
      if (selectedSubdeckSlug) {
        params.set('deckSlug', selectedSubdeckSlug)
      } else if (selectedMainDeckId) {
        params.set('mainDeckId', selectedMainDeckId)
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
      const dlist: DeckRow[] = deckData.decks ?? []
      setDeckRows(dlist)
    } catch {
      setError('Could not load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [selectedTagSlugs, selectedSubdeckSlug, selectedMainDeckId])

  const fetchCoursesHierarchy = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/courses-hierarchy')
      if (!res.ok) return
      const data = await res.json()
      setCourses(data.courses ?? [])
    } catch {
      // Best-effort only, deck dialog can still work with plain IDs.
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput), 350)
    return () => window.clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchData()
    }, 0)
    return () => window.clearTimeout(t)
  }, [fetchData])

  /** Deck scope from URL (?view=all&mainDeckId=…&deckSlug=… or ?deckScope=all to clear deck filters). */
  useEffect(() => {
    const view = searchParams.get('view')
    const mid = searchParams.get('mainDeckId')?.trim() || null
    const deckSlug = searchParams.get('deckSlug')?.trim() || null
    const deckScopeAll = searchParams.get('deckScope') === 'all'

    if (view === 'all' || mid || deckSlug || deckScopeAll) {
      queueMicrotask(() => setActiveView('all'))
    }

    if (deckScopeAll) {
      queueMicrotask(() => {
        setSelectedMainDeckId(null)
        setSelectedSubdeckSlug(null)
      })
      return
    }

    if (mid && deckSlug) {
      queueMicrotask(() => {
        setSelectedMainDeckId(mid)
        setSelectedSubdeckSlug(deckSlug)
      })
    } else if (mid) {
      queueMicrotask(() => {
        setSelectedMainDeckId(mid)
        setSelectedSubdeckSlug(null)
      })
    } else if (deckSlug) {
      queueMicrotask(() => setSelectedSubdeckSlug(deckSlug))
    } else {
      queueMicrotask(() => {
        setSelectedMainDeckId(null)
        setSelectedSubdeckSlug(null)
      })
    }
  }, [searchParams])

  /** When URL has deckSlug but no mainDeckId, set main from loaded deck rows. */
  useEffect(() => {
    const deckSlug = searchParams.get('deckSlug')?.trim()
    const mid = searchParams.get('mainDeckId')?.trim()
    if (!deckSlug || mid) return
    const row = deckRows.find((d) => d.slug === deckSlug && d.parentDeckId)
    if (row?.parentDeckId) queueMicrotask(() => setSelectedMainDeckId(row.parentDeckId))
  }, [searchParams, deckRows])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchCoursesHierarchy()
    }, 0)
    return () => window.clearTimeout(t)
  }, [fetchCoursesHierarchy])

  // Reset tag pagination when toggling between main/all tags
  useEffect(() => {
    queueMicrotask(() => setTagPage(1))
  }, [showAllTags])

  useEffect(() => {
    queueMicrotask(() => setCardPage(1))
  }, [debouncedSearch, selectedTagSlugs, selectedSubdeckSlug, selectedMainDeckId, sortKey])

  /** Load CMS subjects when the standalone deck form opens; reset combobox state. */
  useEffect(() => {
    if (!inlineStandaloneDeckOpen) {
      if (standaloneSubjectBlurTimer.current != null) {
        clearTimeout(standaloneSubjectBlurTimer.current)
        standaloneSubjectBlurTimer.current = null
      }
      queueMicrotask(() => setStandaloneSubjectMenuOpen(false))
      return
    }
    queueMicrotask(() => {
      setStandaloneSubjectInput('')
      setStandaloneSubjectId(null)
      setStandaloneDeckTagIds([])
    })
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/subjects')
        const data = await res.json()
        if (cancelled || !Array.isArray(data.subjects)) return
        setSubjectOptions(
          data.subjects.map((s: { id: string | number; name?: string; slug?: string }) => ({
            id: String(s.id),
            name: String(s.name ?? ''),
            slug: String(s.slug ?? ''),
          })),
        )
      } catch {
        if (!cancelled) setSubjectOptions([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [inlineStandaloneDeckOpen])

  const filteredSubjectOptions = useMemo(() => {
    const q = standaloneSubjectInput.trim().toLowerCase()
    const base = [...subjectOptions].sort((a, b) => a.name.localeCompare(b.name))
    if (!q) return base.slice(0, 50)
    return base.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 50)
  }, [subjectOptions, standaloneSubjectInput])

  // ── Open dialogs ─────────────────────────────────────────────────────────────

  function openCreateForDeck(deckId: string) {
    setEditData(undefined)
    setCreateFlashcardDeckId(deckId)
    setLockCreateFlashcardDeck(true)
    setCreateRestrictParentMainDeckId(undefined)
    setDialogOpen(true)
  }

  /** Create from All flashcards: apply main / subdeck toolbar filters to the deck picker (or lock target). */
  function openCreateFromBrowse() {
    setEditData(undefined)
    setCreateRestrictParentMainDeckId(undefined)

    if (selectedMainDeckId && selectedSubdeckSlug) {
      const subs = subdecksByMain.get(selectedMainDeckId) ?? []
      const d = subs.find((s) => s.slug === selectedSubdeckSlug)
      if (d) {
        setCreateRestrictParentMainDeckId(selectedMainDeckId)
        setCreateFlashcardDeckId(d.id)
        setLockCreateFlashcardDeck(true)
        setDialogOpen(true)
        return
      }
    }

    if (selectedMainDeckId) {
      const main = deckRows.find((x) => x.id === selectedMainDeckId)
      const isStandaloneMain =
        main != null && (main.courseId == null || String(main.courseId).trim() === '')
      setCreateRestrictParentMainDeckId(selectedMainDeckId)
      if (isStandaloneMain) {
        setCreateFlashcardDeckId(selectedMainDeckId)
        setLockCreateFlashcardDeck(false)
      } else {
        const subs = subdecksByMain.get(selectedMainDeckId) ?? []
        setCreateFlashcardDeckId(subs[0]?.id)
        setLockCreateFlashcardDeck(false)
      }
      setDialogOpen(true)
      return
    }

    if (selectedSubdeckSlug) {
      const d = deckRows.find((x) => x.slug === selectedSubdeckSlug)
      if (d?.parentDeckId) {
        setCreateRestrictParentMainDeckId(d.parentDeckId)
        setCreateFlashcardDeckId(d.id)
        setLockCreateFlashcardDeck(true)
      } else if (d) {
        setCreateFlashcardDeckId(d.id)
        setLockCreateFlashcardDeck(true)
      } else {
        setCreateFlashcardDeckId(undefined)
        setLockCreateFlashcardDeck(false)
      }
      setDialogOpen(true)
      return
    }

    setCreateFlashcardDeckId(undefined)
    setLockCreateFlashcardDeck(false)
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
    setCreateFlashcardDeckId(undefined)
    setLockCreateFlashcardDeck(false)
    setCreateRestrictParentMainDeckId(undefined)
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

  const sortedFlashcards = useMemo(() => {
    const sorted = [...filteredFlashcards]
    sorted.sort((a, b) => {
      if (sortKey === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortKey === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortKey === 'az') return a.question.localeCompare(b.question)
      return b.question.localeCompare(a.question)
    })
    return sorted
  }, [filteredFlashcards, sortKey])

  useEffect(() => {
    const tp = totalFlashcardGridPages(filteredFlashcards.length)
    queueMicrotask(() => setCardPage((p) => Math.min(p, tp)))
  }, [filteredFlashcards.length])

  const browseMode = activeView === 'all'

  const hasActiveFilters =
    selectedTagSlugs.size > 0 ||
    Boolean(selectedMainDeckId) ||
    Boolean(selectedSubdeckSlug) ||
    Boolean(debouncedSearch.trim())

  function clearAllFilters() {
    setSelectedTagSlugs(new Set())
    setSelectedMainDeckId(null)
    setSelectedSubdeckSlug(null)
    setSearchInput('')
    setDebouncedSearch('')
  }

  const courseById = useMemo(() => {
    const map = new Map<string, CourseHierarchy>()
    for (const course of courses) {
      const key = normalizeContentId(course.id)
      if (key) map.set(key, course)
    }
    return map
  }, [courses])

  const moduleById = useMemo(() => {
    const map = new Map<string, { id: string; title: string; courseId: string; order: number }>()
    for (const course of courses) {
      for (const mod of course.modules ?? []) {
        const key = normalizeContentId(mod.id)
        if (!key) continue
        map.set(key, {
          id: mod.id,
          title: mod.title,
          courseId: course.id,
          order: mod.order ?? 0,
        })
      }
    }
    return map
  }, [courses])

  /** Root decks tied to a course (at most one per course in normal data). */
  const mainDeckOptions = useMemo(
    () =>
      deckRows.filter(
        (d) => (d.parentDeckId == null || d.parentDeckId === '') && d.courseId != null && String(d.courseId).trim() !== '',
      ),
    [deckRows],
  )

  /** Root decks not tied to any course (standalone collections). */
  const standaloneMainDeckOptions = useMemo(
    () =>
      deckRows.filter(
        (d) =>
          (d.parentDeckId == null || d.parentDeckId === '') &&
          (d.courseId == null || String(d.courseId).trim() === ''),
      ),
    [deckRows],
  )

  /** Courses that already have a main deck — excluded from the create-main-deck dropdown. */
  const mainDeckCourseIdSet = useMemo(
    () =>
      new Set(
        mainDeckOptions.map((d) => normalizeContentId(d.courseId)).filter(Boolean),
      ),
    [mainDeckOptions],
  )

  const coursesWithoutMainDeck = useMemo(
    () =>
      [...courses]
        .filter((c) => !mainDeckCourseIdSet.has(normalizeContentId(c.id)))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [courses, mainDeckCourseIdSet],
  )

  useEffect(() => {
    if (coursesWithoutMainDeck.length === 0) {
      queueMicrotask(() => setDeckCourseId(''))
      return
    }
    const allowed = new Set(coursesWithoutMainDeck.map((c) => c.id))
    queueMicrotask(() =>
      setDeckCourseId((prev) => (prev && allowed.has(prev) ? prev : coursesWithoutMainDeck[0]!.id)),
    )
  }, [coursesWithoutMainDeck])

  const usedModuleIds = useMemo(
    () =>
      new Set(
        deckRows
          .map((d) => normalizeContentId(d.moduleId))
          .filter(Boolean),
      ),
    [deckRows],
  )

  const subdecksByMain = (() => {
    const grouped = new Map<string, DeckRow[]>()
    for (const deck of deckRows) {
      if (!deck.parentDeckId) continue
      const arr = grouped.get(deck.parentDeckId) ?? []
      arr.push(deck)
      grouped.set(deck.parentDeckId, arr)
    }
    for (const arr of grouped.values()) {
      arr.sort((a, b) => {
        const orderA = a.moduleId
          ? (moduleById.get(normalizeContentId(a.moduleId))?.order ?? 999_999)
          : 999_999
        const orderB = b.moduleId
          ? (moduleById.get(normalizeContentId(b.moduleId))?.order ?? 999_999)
          : 999_999
        if (orderA !== orderB) return orderA - orderB
        const titleA = a.moduleId
          ? (moduleById.get(normalizeContentId(a.moduleId))?.title ?? a.name)
          : a.name
        const titleB = b.moduleId
          ? (moduleById.get(normalizeContentId(b.moduleId))?.title ?? b.name)
          : b.name
        return titleA.localeCompare(titleB)
      })
    }
    return grouped
  })()

  /** Subdecks under the selected main deck (toolbar filter). */
  const subdecksForFilterMain = useMemo(() => {
    if (!selectedMainDeckId) return []
    return subdecksByMain.get(selectedMainDeckId) ?? []
  }, [selectedMainDeckId, subdecksByMain])

  useEffect(() => {
    if (!selectedSubdeckSlug || !selectedMainDeckId) return
    const subs = subdecksByMain.get(selectedMainDeckId) ?? []
    if (!subs.some((s) => s.slug === selectedSubdeckSlug)) {
      queueMicrotask(() => setSelectedSubdeckSlug(null))
    }
  }, [selectedMainDeckId, selectedSubdeckSlug, subdecksByMain])

  useEffect(() => {
    if (!selectedMainDeckId) return
    const stillValid =
      mainDeckOptions.some((d) => d.id === selectedMainDeckId) ||
      standaloneMainDeckOptions.some((d) => d.id === selectedMainDeckId)
    if (!stillValid) {
      queueMicrotask(() => {
        setSelectedMainDeckId(null)
        setSelectedSubdeckSlug(null)
      })
    }
  }, [selectedMainDeckId, mainDeckOptions, standaloneMainDeckOptions])

  useEffect(() => {
    queueMicrotask(() => {
      setInlineSubdeckMainId((cur) =>
        cur != null && !expandedHierarchyMainIds.has(cur) ? null : cur,
      )
      setInlineStandaloneSubdeckMainId((cur) =>
        cur != null && !expandedHierarchyMainIds.has(cur) ? null : cur,
      )
    })
  }, [expandedHierarchyMainIds])

  const mainDeckDialogTitle = useMemo(
    () => (deckCourseId ? (courseById.get(normalizeContentId(deckCourseId))?.title ?? '') : ''),
    [courseById, deckCourseId],
  )

  function availableModulesForMainDeck(mainDeck: DeckRow) {
    if (!mainDeck.courseId) return []
    const mods = courseById.get(normalizeContentId(mainDeck.courseId))?.modules ?? []
    return mods.filter((mod) => !usedModuleIds.has(normalizeContentId(mod.id)))
  }

  function toggleSubdeckInline(mainDeck: DeckRow) {
    setInlineStandaloneSubdeckMainId(null)
    setInlineStandaloneSubdeckName('')
    if (inlineSubdeckMainId === mainDeck.id) {
      setInlineSubdeckMainId(null)
      return
    }
    const avail = availableModulesForMainDeck(mainDeck)
    if (avail.length === 0) {
      setError('All modules in this course already have subdecks.')
      return
    }
    setError('')
    setExpandedHierarchyMainIds((prev) => {
      const next = new Set(prev)
      next.add(mainDeck.id)
      return next
    })
    setInlineSubdeckMainId(mainDeck.id)
    setInlineSubdeckModuleId(avail[0]?.id ?? '')
  }

  function toggleStandaloneSubdeckInline(mainDeck: DeckRow) {
    setInlineSubdeckMainId(null)
    setInlineSubdeckModuleId('')
    if (inlineStandaloneSubdeckMainId === mainDeck.id) {
      setInlineStandaloneSubdeckMainId(null)
      return
    }
    setError('')
    setExpandedHierarchyMainIds((prev) => {
      const next = new Set(prev)
      next.add(mainDeck.id)
      return next
    })
    setInlineStandaloneSubdeckMainId(mainDeck.id)
    setInlineStandaloneSubdeckName('')
  }

  function toggleHierarchyModulesExpanded(mainDeckId: string) {
    setExpandedHierarchyMainIds((prev) => {
      const next = new Set(prev)
      if (next.has(mainDeckId)) next.delete(mainDeckId)
      else next.add(mainDeckId)
      return next
    })
  }

  async function createInlineSubdeck(mainDeck: DeckRow) {
    if (!inlineSubdeckModuleId) {
      setError('Select a module.')
      return
    }
    setSubdeckSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/flashcard-decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SUBDECK',
          courseId: mainDeck.courseId,
          parentDeckId: mainDeck.id,
          moduleId: inlineSubdeckModuleId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const message =
          data?.issues && typeof data.issues === 'object'
            ? Object.values(data.issues).flat().filter(Boolean)[0]
            : data?.error
        setError(typeof message === 'string' ? message : 'Could not create subdeck.')
        return
      }
      setInlineSubdeckMainId(null)
      await Promise.all([fetchData(), fetchCoursesHierarchy()])
    } catch {
      setError('Network error while creating subdeck.')
    } finally {
      setSubdeckSubmitting(false)
    }
  }

  async function createStandaloneSubdeck(mainDeck: DeckRow) {
    const trimmed = inlineStandaloneSubdeckName.trim()
    if (!trimmed) {
      setError('Enter a name for the subdeck.')
      return
    }
    setSubdeckSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/flashcard-decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SUBDECK',
          parentDeckId: mainDeck.id,
          name: trimmed,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const message =
          data?.issues && typeof data.issues === 'object'
            ? Object.values(data.issues).flat().filter(Boolean)[0]
            : data?.error
        setError(typeof message === 'string' ? message : 'Could not create subdeck.')
        return
      }
      setInlineStandaloneSubdeckMainId(null)
      setInlineStandaloneSubdeckName('')
      await fetchData()
    } catch {
      setError('Network error while creating subdeck.')
    } finally {
      setSubdeckSubmitting(false)
    }
  }

  async function deleteDeckRow(deck: DeckRow, opts: { isMain: boolean }) {
    const msg = opts.isMain
      ? deck.courseId != null && String(deck.courseId).trim() !== ''
        ? 'Delete this course deck, all its subdecks, and every flashcard inside them? This cannot be undone.'
        : 'Delete this standalone deck, all its subdecks, and every flashcard inside them? This cannot be undone.'
      : 'Delete this subdeck and all flashcards in it? This cannot be undone.'
    if (!confirm(msg)) return
    setDeckDeletingId(deck.id)
    setError('')
    try {
      const res = await fetch(`/api/flashcard-decks/${deck.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(typeof data?.error === 'string' ? data.error : 'Could not delete deck.')
        return
      }
      if (inlineSubdeckMainId === deck.id) setInlineSubdeckMainId(null)
      if (inlineStandaloneSubdeckMainId === deck.id) {
        setInlineStandaloneSubdeckMainId(null)
        setInlineStandaloneSubdeckName('')
      }
      await Promise.all([fetchData(), fetchCoursesHierarchy()])
    } catch {
      setError('Network error while deleting deck.')
    } finally {
      setDeckDeletingId(null)
    }
  }

  async function createInlineMainDeck() {
    if (!deckCourseId) {
      setError('Select a course.')
      return
    }
    const resolvedName = mainDeckDialogTitle.trim()
    if (!resolvedName) {
      setError('Could not resolve deck name from course.')
      return
    }
    setDeckSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/flashcard-decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: resolvedName,
          type: 'MAIN',
          courseId: deckCourseId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const message =
          data?.issues && typeof data.issues === 'object'
            ? Object.values(data.issues).flat().filter(Boolean)[0]
            : data?.error
        setError(typeof message === 'string' ? message : 'Could not create deck.')
        return
      }
      setInlineMainDeckOpen(false)
      await Promise.all([fetchData(), fetchCoursesHierarchy()])
    } catch {
      setError('Network error while creating deck.')
    } finally {
      setDeckSubmitting(false)
    }
  }

  async function createStandaloneMainDeck() {
    const name = standaloneNewDeckName.trim()
    if (!name) {
      setError('Enter a name for the standalone deck.')
      return
    }
    if (!standaloneSubjectId) {
      setError('Select a subject from the list (search, then click a row).')
      return
    }
    setDeckSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/flashcard-decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'MAIN',
          name,
          ...(standaloneNewDeckDescription.trim()
            ? { description: standaloneNewDeckDescription.trim() }
            : {}),
          subjectId: standaloneSubjectId,
          tagIds: standaloneDeckTagIds,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const message =
          data?.issues && typeof data.issues === 'object'
            ? Object.values(data.issues).flat().filter(Boolean)[0]
            : data?.error
        setError(typeof message === 'string' ? message : 'Could not create deck.')
        return
      }
      setInlineStandaloneDeckOpen(false)
      setStandaloneNewDeckName('')
      setStandaloneNewDeckDescription('')
      await fetchData()
    } catch {
      setError('Network error while creating deck.')
    } finally {
      setDeckSubmitting(false)
    }
  }

  function toggleInlineMainDeck() {
    if (coursesWithoutMainDeck.length === 0) return
    setError('')
    setInlineStandaloneDeckOpen(false)
    setInlineMainDeckOpen((open) => !open)
  }

  function toggleInlineStandaloneDeck() {
    setError('')
    setInlineMainDeckOpen(false)
    setInlineStandaloneDeckOpen((open) => {
      if (open) {
        setStandaloneNewDeckName('')
        setStandaloneNewDeckDescription('')
        setStandaloneDeckTagIds([])
      }
      return !open
    })
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  /** Native <select>: `color-scheme` fixes white OS dropdown in dark mode (esp. Windows). */
  const glassNativeSelectClass =
    'rounded-md border border-slate-300/50 bg-white/40 text-sm text-gray-900 shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-white/20 dark:bg-gray-950 dark:text-gray-100 dark:[color-scheme:dark]'

  const sortSelect = (
    <div className="relative min-w-[9.5rem] shrink-0 sm:min-w-[10.5rem]">
      <label htmlFor="flashcard-sort" className="mb-1 block text-xs font-medium text-muted-foreground" title="Sort flashcards">
        Sort
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center">
          <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>
        </div>
        <select
          id="flashcard-sort"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as 'newest' | 'oldest' | 'az' | 'za')}
          className={cn('h-9 w-full pl-8 pr-3', glassNativeSelectClass)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
        </select>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ── Page header: title block, then toolbar (filters + primary CTA) ── */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">Flashcards</h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400 md:text-lg">
            Create, edit and organise flashcards. Students study them in their dashboard.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant={activeView === 'courseTree' ? 'hero' : 'outline'}
              className={cn(activeView === 'courseTree' ? 'auth-hero-cta' : adminGlassOutlineButton)}
              onClick={() => setActiveView('courseTree')}
            >
              Course deck tree
            </Button>
            <Button
              type="button"
              variant={activeView === 'standaloneTree' ? 'hero' : 'outline'}
              className={cn(activeView === 'standaloneTree' ? 'auth-hero-cta' : adminGlassOutlineButton)}
              onClick={() => setActiveView('standaloneTree')}
            >
              Standalone deck tree
            </Button>
            <Button
              type="button"
              variant={activeView === 'all' ? 'hero' : 'outline'}
              className={cn(activeView === 'all' ? 'auth-hero-cta' : adminGlassOutlineButton)}
              onClick={() => setActiveView('all')}
            >
              All flashcards
            </Button>
          </div>
        </div>
      </div>

      {browseMode && (
        <>
              <div
                className={cn(
                  'flex flex-wrap items-end gap-x-3 gap-y-3 rounded-xl border-0 p-4 shadow-none',
                  adminGlassCard,
                )}
              >
                <div className="relative min-w-[10rem] flex-1 basis-[min(100%,18rem)] sm:max-w-[min(100%,20rem)]">
                  <label htmlFor="flashcard-main-deck-filter" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Main deck
                  </label>
                  <select
                    id="flashcard-main-deck-filter"
                    value={selectedMainDeckId ?? ''}
                    onChange={(e) => {
                      const v = e.target.value || null
                      setSelectedMainDeckId(v)
                      setSelectedSubdeckSlug(null)
                    }}
                    className={cn('h-9 w-full px-3', glassNativeSelectClass)}
                  >
                    <option value="">Show all</option>
                    {mainDeckOptions.length > 0 ? (
                      <optgroup label="Course decks">
                        {[...mainDeckOptions]
                          .sort((a, b) => {
                            const ta = courseById.get(normalizeContentId(a.courseId!))?.title ?? a.name
                            const tb = courseById.get(normalizeContentId(b.courseId!))?.title ?? b.name
                            return ta.localeCompare(tb)
                          })
                          .map((main) => {
                            const courseTitle =
                              courseById.get(normalizeContentId(main.courseId!))?.title ?? main.name
                            return (
                              <option key={main.id} value={main.id}>
                                {courseTitle}
                              </option>
                            )
                          })}
                      </optgroup>
                    ) : null}
                    {standaloneMainDeckOptions.length > 0 ? (
                      <optgroup label="Standalone">
                        {[...standaloneMainDeckOptions]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((main) => (
                            <option key={main.id} value={main.id}>
                              {main.name}
                            </option>
                          ))}
                      </optgroup>
                    ) : null}
                  </select>
                </div>
                <div className="relative min-w-[10rem] flex-1 basis-[min(100%,18rem)] sm:max-w-[min(100%,20rem)]">
                  <label htmlFor="flashcard-subdeck-filter" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Subdeck
                  </label>
                  <select
                    id="flashcard-subdeck-filter"
                    value={selectedSubdeckSlug ?? ''}
                    onChange={(e) => setSelectedSubdeckSlug(e.target.value || null)}
                    disabled={!selectedMainDeckId}
                    className={cn(
                      'h-9 w-full px-3 disabled:cursor-not-allowed disabled:opacity-50',
                      glassNativeSelectClass,
                    )}
                  >
                    <option value="">
                      {selectedMainDeckId ? 'Show all' : 'Select a main deck first'}
                    </option>
                    {subdecksForFilterMain.map((sub) => {
                      const modMeta = sub.moduleId
                        ? moduleById.get(normalizeContentId(sub.moduleId))
                        : undefined
                      const label =
                        modMeta != null ? `${modMeta.order}. ${modMeta.title}` : sub.name
                      return (
                        <option key={sub.id} value={sub.slug}>
                          {label}
                        </option>
                      )
                    })}
                  </select>
                </div>
                {sortSelect}
                <div className="min-w-0 flex-[1.25] basis-[min(100%,22rem)]">
                  <label htmlFor="flashcard-search" className="mb-1 block text-xs font-medium text-muted-foreground">
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
                      className="h-9 border-slate-300/50 bg-white/50 pl-9 dark:border-white/15 dark:bg-white/10"
                      autoComplete="off"
                    />
                  </div>
                </div>
                {hasActiveFilters ? (
                  <Button type="button" variant="outline" size="sm" className={cn(adminGlassOutlineButton, 'h-9 shrink-0')} onClick={clearAllFilters}>
                    <X className="mr-1.5 h-4 w-4" />
                    Clear filters
                  </Button>
                ) : null}
              </div>
        </>
      )}

      {/* ── Course deck tree ── */}
      {activeView === 'courseTree' && (
          <div className={cn('space-y-4 rounded-xl border-0 p-4 shadow-none', adminGlassCard)}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">Course decks</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  One main deck per course; subdecks mirror course modules.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(adminGlassOutlineButton)}
                onClick={toggleInlineMainDeck}
                disabled={coursesWithoutMainDeck.length === 0}
                title={
                  coursesWithoutMainDeck.length === 0
                    ? 'All courses already have a main deck'
                    : undefined
                }
              >
                <Plus className="mr-1.5 h-4 w-4" />
                {inlineMainDeckOpen ? 'Close' : 'Create course deck'}
              </Button>
            </div>

          {inlineMainDeckOpen ? (
            <div className="flex flex-col gap-3 rounded-lg border border-slate-300/40 bg-white/35 p-3 dark:border-white/10 dark:bg-white/[0.04] sm:flex-row sm:flex-wrap sm:items-end">
              <label className="block min-w-[12rem] flex-1 space-y-1 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-200">Create deck — course</span>
                <select
                  value={deckCourseId}
                  onChange={(e) => setDeckCourseId(e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-300/50 bg-white/60 px-3 text-sm dark:border-white/15 dark:bg-white/10 [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-gray-900 dark:[&>option]:text-gray-100"
                  disabled={coursesWithoutMainDeck.length === 0 || deckSubmitting}
                >
                  {coursesWithoutMainDeck.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  type="button"
                  variant="hero"
                  className="auth-hero-cta"
                  disabled={deckSubmitting || !deckCourseId || coursesWithoutMainDeck.length === 0}
                  onClick={() => void createInlineMainDeck()}
                >
                  {deckSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create deck
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(adminGlassOutlineButton)}
                  disabled={deckSubmitting}
                  onClick={() => {
                    setInlineMainDeckOpen(false)
                    setError('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}

          {mainDeckOptions.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No course decks yet. Use <span className="font-medium">Create deck</span> after picking a course.
            </p>
          ) : (
            <div className="space-y-4">
              {mainDeckOptions
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((mainDeck) => {
                  const courseTitle = mainDeck.courseId
                    ? (courseById.get(normalizeContentId(mainDeck.courseId))?.title ?? 'Unknown course')
                    : 'No course'
                  const children = subdecksByMain.get(mainDeck.id) ?? []
                  const subdeckModulesLeft = availableModulesForMainDeck(mainDeck)
                  const hierarchyModulesCollapsed = !expandedHierarchyMainIds.has(mainDeck.id)
                  return (
                    <section key={mainDeck.id} className="rounded-xl border border-slate-300/45 bg-white/[0.22] p-4 dark:border-white/12 dark:bg-white/[0.06]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-start gap-2">
                          <button
                            type="button"
                            className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 dark:hover:bg-white/10 dark:hover:text-gray-100"
                            onClick={() => toggleHierarchyModulesExpanded(mainDeck.id)}
                            aria-expanded={!hierarchyModulesCollapsed}
                            aria-controls={`hierarchy-modules-${mainDeck.id}`}
                            title={hierarchyModulesCollapsed ? 'Show module subdecks' : 'Hide module subdecks'}
                          >
                            {hierarchyModulesCollapsed ? (
                              <ChevronRight className="h-5 w-5" aria-hidden />
                            ) : (
                              <ChevronDown className="h-5 w-5" aria-hidden />
                            )}
                          </button>
                          <div className="min-w-0 space-y-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{courseTitle}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {children.length} subdeck{children.length === 1 ? '' : 's'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={cn(adminGlassOutlineButton)}
                            onClick={() => toggleSubdeckInline(mainDeck)}
                            disabled={
                              subdeckModulesLeft.length === 0 && inlineSubdeckMainId !== mainDeck.id
                            }
                            title={
                              subdeckModulesLeft.length === 0
                                ? 'All modules already have a subdeck'
                                : undefined
                            }
                          >
                            <Plus className="mr-1.5 h-4 w-4" />
                            {inlineSubdeckMainId === mainDeck.id ? 'Close' : 'Add Subdeck'}
                          </Button>
                          <Button variant="outline" size="sm" className={cn(adminGlassOutlineButton)} asChild>
                            <Link
                              href={adminAllFlashcardsHref(mainDeck.id)}
                            >
                              Show all
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={cn(adminGlassOutlineButton)}
                            aria-label="Delete course deck"
                            onClick={() => void deleteDeckRow(mainDeck, { isMain: true })}
                            disabled={deckDeletingId === mainDeck.id}
                          >
                            {deckDeletingId === mainDeck.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {!hierarchyModulesCollapsed ? (
                        <div id={`hierarchy-modules-${mainDeck.id}`} className="mt-3 space-y-2">
                          {children.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No subdecks linked yet.</p>
                          ) : (
                            children.map((subdeck) => {
                              const modMeta = subdeck.moduleId
                                ? moduleById.get(normalizeContentId(subdeck.moduleId))
                                : undefined
                              const moduleOrderLabel =
                                modMeta != null ? `${modMeta.order}.` : null
                              const moduleTitle = modMeta?.title ?? subdeck.name
                              return (
                                <div
                                  key={subdeck.id}
                                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-300/40 bg-white/40 px-3 py-2 dark:border-white/10 dark:bg-white/5"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                      {moduleOrderLabel ? (
                                        <span className="tabular-nums text-gray-500 dark:text-gray-400">
                                          {moduleOrderLabel}
                                        </span>
                                      ) : null}
                                      <span className={moduleOrderLabel ? 'ml-1.5' : ''}>{moduleTitle}</span>
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {subdeck._count?.flashcards ?? 0} cards
                                    </p>
                                  </div>
                                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className={cn(adminGlassOutlineButton)}
                                      onClick={() => openCreateForDeck(subdeck.id)}
                                    >
                                      <Plus className="mr-1.5 h-4 w-4" />
                                      Add Flashcard
                                    </Button>
                                    <Button variant="outline" size="sm" className={cn(adminGlassOutlineButton)} asChild>
                                      <Link href={adminAllFlashcardsHref(mainDeck.id, subdeck.slug)}>Show all</Link>
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className={cn(adminGlassOutlineButton)}
                                      aria-label="Delete subdeck"
                                      onClick={() => void deleteDeckRow(subdeck, { isMain: false })}
                                      disabled={deckDeletingId === subdeck.id}
                                    >
                                      {deckDeletingId === subdeck.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      ) : null}

                      {!hierarchyModulesCollapsed && inlineSubdeckMainId === mainDeck.id ? (
                        <div className="mt-3 flex flex-col gap-3 rounded-lg border border-slate-300/40 bg-white/35 p-3 dark:border-white/10 dark:bg-white/[0.04] sm:flex-row sm:flex-wrap sm:items-end">
                          <label className="block min-w-[12rem] flex-1 space-y-1 text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-200">Add subdeck — module</span>
                            <select
                              value={inlineSubdeckModuleId}
                              onChange={(e) => setInlineSubdeckModuleId(e.target.value)}
                              className="h-10 w-full rounded-md border border-slate-300/50 bg-white/60 px-3 text-sm dark:border-white/15 dark:bg-white/10 [&>option]:bg-white [&>option]:text-gray-900 dark:[&>option]:bg-gray-900 dark:[&>option]:text-gray-100"
                              disabled={subdeckSubmitting || subdeckModulesLeft.length === 0}
                            >
                              {subdeckModulesLeft.map((mod) => (
                                <option key={mod.id} value={mod.id}>
                                  {mod.order}. {mod.title}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div className="flex shrink-0 flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="hero"
                              className="auth-hero-cta"
                              disabled={subdeckSubmitting || !inlineSubdeckModuleId}
                              onClick={() => void createInlineSubdeck(mainDeck)}
                            >
                              {subdeckSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving…
                                </>
                              ) : (
                                'Save'
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(adminGlassOutlineButton)}
                              disabled={subdeckSubmitting}
                              onClick={() => setInlineSubdeckMainId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </section>
                  )
                })}
            </div>
          )}
          </div>
      )}

      {/* ── Standalone deck tree ── */}
      {activeView === 'standaloneTree' && (
          <div className={cn('space-y-4 rounded-xl border-0 p-4 shadow-none', adminGlassCard)}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">Standalone decks</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Not tied to a course. <span className="font-medium text-foreground/90">Add direct flashcard</span> on a
                  main deck for cards on that deck, or add subdecks and use Add Flashcard on a subdeck.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(adminGlassOutlineButton)}
                onClick={toggleInlineStandaloneDeck}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                {inlineStandaloneDeckOpen ? 'Close' : 'Create standalone deck'}
              </Button>
            </div>

            {inlineStandaloneDeckOpen ? (
              <div className="flex flex-col gap-4 rounded-lg border border-slate-300/40 bg-white/35 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                  <label className="block min-w-[12rem] flex-1 space-y-1 text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-200">Deck name</span>
                    <Input
                      value={standaloneNewDeckName}
                      onChange={(e) => setStandaloneNewDeckName(e.target.value)}
                      placeholder="e.g. Certification prep"
                      className="h-10 border-slate-300/50 bg-white/60 dark:border-white/15 dark:bg-white/10"
                      disabled={deckSubmitting}
                    />
                  </label>
                </div>
                <label className="block space-y-1 text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-200">Description (optional)</span>
                  <Textarea
                    value={standaloneNewDeckDescription}
                    onChange={(e) => setStandaloneNewDeckDescription(e.target.value)}
                    placeholder="Short summary for students browsing this deck"
                    rows={3}
                    className="border-slate-300/50 bg-white/60 dark:border-white/15 dark:bg-white/10"
                    disabled={deckSubmitting}
                  />
                </label>

                {/* Catalog subject (Payload) — required for standalone mains */}
                <div className="rounded-lg border border-slate-300/35 bg-white/40 p-3 dark:border-white/12 dark:bg-white/[0.06]">
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Catalog subject</h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Required. Used for browse / grouping — this is <span className="font-medium">not</span> a tag.
                      </p>
                    </div>
                  </div>
                  <div className="relative space-y-1">
                    <label htmlFor="standalone-deck-subject" className="sr-only">
                      Search and select subject
                    </label>
                    <Input
                      id="standalone-deck-subject"
                      value={standaloneSubjectInput}
                      onChange={(e) => {
                        const v = e.target.value
                        setStandaloneSubjectInput(v)
                        setStandaloneSubjectMenuOpen(true)
                        if (standaloneSubjectId) {
                          const sel = subjectOptions.find((s) => s.id === standaloneSubjectId)
                          if (!sel || sel.name !== v) setStandaloneSubjectId(null)
                        }
                      }}
                      onFocus={() => {
                        if (standaloneSubjectBlurTimer.current != null) {
                          clearTimeout(standaloneSubjectBlurTimer.current)
                          standaloneSubjectBlurTimer.current = null
                        }
                        setStandaloneSubjectMenuOpen(true)
                      }}
                      onBlur={() => {
                        standaloneSubjectBlurTimer.current = window.setTimeout(() => {
                          setStandaloneSubjectMenuOpen(false)
                          standaloneSubjectBlurTimer.current = null
                        }, 150)
                      }}
                      placeholder="Search subjects…"
                      autoComplete="off"
                      className="h-10 border-slate-300/50 bg-white/60 dark:border-white/15 dark:bg-white/10"
                      disabled={deckSubmitting}
                      aria-autocomplete="list"
                      aria-expanded={standaloneSubjectMenuOpen}
                    />
                    {standaloneSubjectMenuOpen && filteredSubjectOptions.length > 0 ? (
                      <ul
                        className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-300/60 bg-white py-1 text-sm shadow-lg dark:border-white/15 dark:bg-gray-950"
                        role="listbox"
                      >
                        {filteredSubjectOptions.map((s) => (
                          <li key={s.id} role="option">
                            <button
                              type="button"
                              className="flex w-full px-3 py-2 text-left text-gray-900 hover:bg-slate-100 dark:text-gray-100 dark:hover:bg-white/10"
                              onMouseDown={(e) => {
                                e.preventDefault()
                                setStandaloneSubjectId(s.id)
                                setStandaloneSubjectInput(s.name)
                                setStandaloneSubjectMenuOpen(false)
                              }}
                            >
                              {s.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {standaloneSubjectId ? (
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() => {
                          setStandaloneSubjectId(null)
                          setStandaloneSubjectInput('')
                        }}
                      >
                        Clear subject
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Deck tags — same UX as Add Flashcard */}
                <div className="rounded-lg border border-slate-300/35 bg-white/40 p-3 dark:border-white/12 dark:bg-white/[0.06]">
                  <AdminFlashcardTagPicker
                    active={inlineStandaloneDeckOpen}
                    value={standaloneDeckTagIds}
                    onChange={setStandaloneDeckTagIds}
                    disabled={deckSubmitting}
                    initialTags={allTags}
                    quickPickMode="popular"
                    layout="inline"
                    searchInputId="standalone-deck-tag-search"
                    onTagError={(msg) => setError(msg)}
                    description="Optional. Labels for this deck in admin (search, filters). Independent of the catalog subject above."
                  />
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="hero"
                    className="auth-hero-cta"
                    disabled={deckSubmitting || !standaloneNewDeckName.trim() || !standaloneSubjectId}
                    onClick={() => void createStandaloneMainDeck()}
                  >
                    {deckSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create deck
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(adminGlassOutlineButton)}
                    disabled={deckSubmitting}
                    onClick={() => {
                      setInlineStandaloneDeckOpen(false)
                      setStandaloneNewDeckName('')
                      setStandaloneNewDeckDescription('')
                      setStandaloneDeckTagIds([])
                      setError('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}

            {standaloneMainDeckOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No standalone decks yet. Use <span className="font-medium">Create standalone deck</span> to add one.
              </p>
            ) : (
              <div className="space-y-4">
                {standaloneMainDeckOptions
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((mainDeck) => {
                    const children = subdecksByMain.get(mainDeck.id) ?? []
                    const hierarchyModulesCollapsed = !expandedHierarchyMainIds.has(mainDeck.id)
                    return (
                      <section
                        key={mainDeck.id}
                        className="rounded-xl border border-slate-300/45 bg-white/[0.22] p-4 dark:border-white/12 dark:bg-white/[0.06]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-1 items-start gap-2">
                            <button
                              type="button"
                              className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 dark:hover:bg-white/10 dark:hover:text-gray-100"
                              onClick={() => toggleHierarchyModulesExpanded(mainDeck.id)}
                              aria-expanded={!hierarchyModulesCollapsed}
                              aria-controls={`hierarchy-standalone-${mainDeck.id}`}
                              title={hierarchyModulesCollapsed ? 'Show subdecks' : 'Hide subdecks'}
                            >
                              {hierarchyModulesCollapsed ? (
                                <ChevronRight className="h-5 w-5" aria-hidden />
                              ) : (
                                <ChevronDown className="h-5 w-5" aria-hidden />
                              )}
                            </button>
                            <div className="min-w-0 space-y-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{mainDeck.name}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {mainDeck._count?.flashcards ?? 0} direct cards · {children.length} subdecks
                              </p>
                              {mainDeck.tags && mainDeck.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {mainDeck.tags.map((t) => (
                                    <span
                                      key={t.id}
                                      className={cn(
                                        studentGlassPill,
                                        'py-0.5 text-[10px] font-medium normal-case tracking-tight text-gray-700 dark:text-gray-200',
                                      )}
                                    >
                                      {t.name}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={cn(adminGlassOutlineButton)}
                              onClick={() => openCreateForDeck(mainDeck.id)}
                            >
                              <Plus className="mr-1.5 h-4 w-4" />
                              Add direct flashcard
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={cn(adminGlassOutlineButton)}
                              onClick={() => toggleStandaloneSubdeckInline(mainDeck)}
                            >
                              <Plus className="mr-1.5 h-4 w-4" />
                              {inlineStandaloneSubdeckMainId === mainDeck.id ? 'Close' : 'Add Subdeck'}
                            </Button>
                            <Button variant="outline" size="sm" className={cn(adminGlassOutlineButton)} asChild>
                              <Link
                                href={adminAllFlashcardsHref(mainDeck.id)}
                              >
                                Show all
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={cn(adminGlassOutlineButton)}
                              aria-label="Delete standalone deck"
                              onClick={() => void deleteDeckRow(mainDeck, { isMain: true })}
                              disabled={deckDeletingId === mainDeck.id}
                            >
                              {deckDeletingId === mainDeck.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {!hierarchyModulesCollapsed ? (
                          <div id={`hierarchy-standalone-${mainDeck.id}`} className="mt-3 space-y-2">
                            {children.length === 0 ? (
                              <p className="text-sm text-gray-500 dark:text-gray-400">No subdecks yet.</p>
                            ) : (
                              children.map((subdeck) => {
                                const modMeta = subdeck.moduleId
                                  ? moduleById.get(normalizeContentId(subdeck.moduleId))
                                  : undefined
                                const moduleOrderLabel =
                                  modMeta != null ? `${modMeta.order}.` : null
                                const rowTitle = modMeta?.title ?? subdeck.name
                                return (
                                  <div
                                    key={subdeck.id}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-300/40 bg-white/40 px-3 py-2 dark:border-white/10 dark:bg-white/5"
                                  >
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {moduleOrderLabel ? (
                                          <span className="tabular-nums text-gray-500 dark:text-gray-400">
                                            {moduleOrderLabel}
                                          </span>
                                        ) : null}
                                        <span className={moduleOrderLabel ? 'ml-1.5' : ''}>{rowTitle}</span>
                                      </p>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {subdeck._count?.flashcards ?? 0} cards
                                      </p>
                                    </div>
                                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className={cn(adminGlassOutlineButton)}
                                        onClick={() => openCreateForDeck(subdeck.id)}
                                      >
                                        <Plus className="mr-1.5 h-4 w-4" />
                                        Add Flashcard
                                      </Button>
                                      <Button variant="outline" size="sm" className={cn(adminGlassOutlineButton)} asChild>
                                        <Link href={adminAllFlashcardsHref(mainDeck.id, subdeck.slug)}>Show all</Link>
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className={cn(adminGlassOutlineButton)}
                                        aria-label="Delete subdeck"
                                        onClick={() => void deleteDeckRow(subdeck, { isMain: false })}
                                        disabled={deckDeletingId === subdeck.id}
                                      >
                                        {deckDeletingId === subdeck.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        ) : null}

                        {!hierarchyModulesCollapsed && inlineStandaloneSubdeckMainId === mainDeck.id ? (
                          <div className="mt-3 flex flex-col gap-3 rounded-lg border border-slate-300/40 bg-white/35 p-3 dark:border-white/10 dark:bg-white/[0.04] sm:flex-row sm:flex-wrap sm:items-end">
                            <label className="block min-w-[12rem] flex-1 space-y-1 text-sm">
                              <span className="font-medium text-gray-700 dark:text-gray-200">Subdeck name</span>
                              <Input
                                value={inlineStandaloneSubdeckName}
                                onChange={(e) => setInlineStandaloneSubdeckName(e.target.value)}
                                placeholder="e.g. Week 1 review"
                                className="h-10 border-slate-300/50 bg-white/60 dark:border-white/15 dark:bg-white/10"
                                disabled={subdeckSubmitting}
                              />
                            </label>
                            <div className="flex shrink-0 flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="hero"
                                className="auth-hero-cta"
                                disabled={subdeckSubmitting || !inlineStandaloneSubdeckName.trim()}
                                onClick={() => void createStandaloneSubdeck(mainDeck)}
                              >
                                {subdeckSubmitting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving…
                                  </>
                                ) : (
                                  'Save'
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(adminGlassOutlineButton)}
                                disabled={subdeckSubmitting}
                                onClick={() => {
                                  setInlineStandaloneSubdeckMainId(null)
                                  setInlineStandaloneSubdeckName('')
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </section>
                    )
                  })}
              </div>
            )}
          </div>
      )}

      {/* ── Tags strip ── */}
      {browseMode && allTags.length > 0 && (
        <div className="px-4 sm:px-4">
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
                  { key: 'count-desc', icon: <ArrowDown01 className="h-4 w-4" />, title: 'Most appearances (tasks + flashcards)', onClick: () => { setTagSortField('count'); setTagSortDir('desc') } },
                  { key: 'count-asc',  icon: <ArrowUp01   className="h-4 w-4" />, title: 'Fewest appearances (tasks + flashcards)', onClick: () => { setTagSortField('count'); setTagSortDir('asc') } },
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
                  const ca = tagUsageTotal(a)
                  const cb = tagUsageTotal(b)
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
                        ? browseTagFilterActiveTint()
                        : cn(studentGlassPill, 'h-8 border font-medium normal-case tracking-normal'),
                    )}
                  >
                    <span className="max-w-[18rem] truncate">{tag.name}</span>
                    {tag._count !== undefined && (
                      <span
                        className={cn(
                          'ml-1 rounded-full px-1.5 py-0 text-xs',
                          isActive
                            ? 'bg-primary/30 text-primary dark:bg-primary/60 dark:text-white'
                            : 'bg-white/50 text-slate-700 dark:bg-white/10 dark:text-gray-200',
                        )}
                        title={tagUsageTitle(tag)}
                      >
                        {tagUsageTotal(tag)}
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
      {browseMode && error && (
        <div className="px-4 sm:px-4">
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {browseMode && loading && (
        <div className="flex items-center gap-2 px-4 text-sm text-gray-500 sm:px-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading flashcards…
        </div>
      )}

      {/* ── Flashcard grid + empty state (single group so banner + add tile don’t stack awkwardly) ── */}
      {browseMode && !loading && !error && (
        (() => {
          const listEmpty = sortedFlashcards.length === 0
          const totalCardPages = totalFlashcardGridPages(sortedFlashcards.length)
          const safeCardPage = Math.min(cardPage, totalCardPages)
          const pageCards = sliceFlashcardsForGridPage(safeCardPage, sortedFlashcards)
          const showAddTile = safeCardPage === 1
          const addTileHint = (() => {
            if (listEmpty) {
              return 'Use Main deck / Subdeck above, or a deck tree → Show all on a main deck.'
            }
            if (selectedSubdeckSlug) return 'Opens the editor for the subdeck selected above.'
            if (selectedMainDeckId) return 'Choose a subdeck in the editor (optional).'
            return 'Choose a subdeck in the editor.'
          })()
          return (
            <div className="space-y-4 px-4 sm:px-4">
              {listEmpty ? (
                <div className={cn('flex flex-col gap-4 rounded-xl border-0 p-4 shadow-none', adminGlassCard)}>
                  <div className="flex min-w-0 items-start gap-3">
                    <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="min-w-0 space-y-1 text-left">
                      <p className="text-sm font-medium text-foreground">
                        {flashcards.length > 0
                          ? 'No cards match your search'
                          : hasActiveFilters
                            ? 'No cards for these filters'
                            : 'No flashcards yet'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {flashcards.length > 0
                          ? 'Adjust search, tags, or Main deck / Subdeck filters.'
                          : hasActiveFilters
                            ? 'Loosen or clear filters to see more cards.'
                            : 'Add a card below, or open a deck tree to set up decks.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    {hasActiveFilters ? (
                      <Button type="button" variant="outline" size="default" className={cn(adminGlassOutlineButton, 'h-10 w-full justify-center')} onClick={clearAllFilters}>
                        <X className="mr-1.5 h-4 w-4" />
                        Clear filters
                      </Button>
                    ) : null}
                    {!hasActiveFilters && flashcards.length === 0 ? (
                      <div className="flex w-full flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          variant="outline"
                          size="default"
                          className={cn(adminGlassOutlineButton, 'h-10 flex-1 justify-center')}
                          onClick={() => setActiveView('courseTree')}
                        >
                          Course deck tree
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="default"
                          className={cn(adminGlassOutlineButton, 'h-10 flex-1 justify-center')}
                          onClick={() => setActiveView('standaloneTree')}
                        >
                          Standalone deck tree
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div
                className={cn(
                  'grid gap-4',
                  listEmpty ? 'grid-cols-1' : 'sm:grid-cols-2 xl:grid-cols-3',
                )}
              >
              {showAddTile ? (
                <button
                  type="button"
                  onClick={() => openCreateFromBrowse()}
                  className={cn(
                    'flex min-h-[10.5rem] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/35 bg-primary/[0.06] p-5 text-center shadow-none transition-colors hover:border-primary/55 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-primary/40 dark:bg-primary/[0.08] dark:hover:bg-primary/15',
                    listEmpty && 'sm:min-h-[11rem]',
                  )}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary dark:bg-primary/25">
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Add new flashcard</span>
                  <span className="max-w-[16rem] text-xs leading-snug text-muted-foreground">{addTileHint}</span>
                </button>
              ) : null}
              {pageCards.map((card) => (
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
                    {card.tags.map((tag) => {
                      const tagFiltered = selectedTagSlugs.has(tag.slug)
                      return (
                        <Link key={tag.id} href={`/admin/flashcards/tags/${tag.slug}`}>
                          <span
                            className={cn(
                              'cursor-pointer text-xs normal-case tracking-tight transition-colors hover:opacity-100',
                              tagFiltered
                                ? cn(browseTagFilterActiveTint(), 'inline-flex items-center rounded-full px-2.5 py-1 font-medium')
                                : studentGlassPill,
                            )}
                          >
                            {tag.name}
                          </span>
                        </Link>
                      )
                    })}
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

            {!listEmpty && totalCardPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn(adminGlassOutlineButton)}
                  disabled={safeCardPage <= 1}
                  onClick={() => setCardPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {safeCardPage} of {totalCardPages} ({sortedFlashcards.length} cards)
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn(adminGlassOutlineButton)}
                  disabled={safeCardPage >= totalCardPages}
                  onClick={() => setCardPage((p) => Math.min(totalCardPages, p + 1))}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
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
        initialDeckId={createFlashcardDeckId}
        lockDeckSelection={lockCreateFlashcardDeck}
        restrictToParentMainDeckId={createRestrictParentMainDeckId}
      />
    </div>
  )
}


