'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Loader2,
  ClipboardList,
  Tag as TagIcon,
  BookOpen,
  X,
  Pencil,
  Trash2,
  Link2,
  ArrowUpAZ,
  ArrowDownAZ,
  ArrowUp01,
  ArrowDown01,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react'

import { AddTaskDialog } from '@/components/admin/add-task-dialog'
import { DeleteTaskDialog } from '@/components/admin/delete-task-dialog'
import { AssignToLessonDialog } from '@/components/admin/assign-to-lesson-dialog'
import { deleteTask } from '@/app/(admin)/admin/actions'
import { extractText } from '@/lib/lexical'
import { cn } from '@/lib/utils'
import {
  adminGlassCard,
  adminGlassIconToggleActive,
  adminGlassIconToggleInactive,
  adminGlassOutlineButton,
  studentGlassPill,
} from '@/lib/student-glass-styles'

type SortKey = 'newest' | 'oldest' | 'az' | 'za' | 'tagged' | 'id-asc' | 'id-desc'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TaskTag {
  id: string
  name: string
  slug: string
  main?: boolean
  _count?: { tasks?: number; flashcards?: number }
}

interface LessonRef {
  id: string
  title: string
}

interface Task {
  id: string
  title: string
  type: 'MULTIPLE_CHOICE' | 'OPEN_ENDED' | 'TRUE_FALSE'
  prompt: unknown // Lexical rich text
  lesson?: Array<LessonRef | string>
  tags?: TaskTag[]
  choices?: Array<{ text: string }>
  correctAnswer?: string
  points: number
  order: number
  isPublished: boolean
  createdAt: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function truncate(text: string, max = 90): string {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '…'
}

// Normalize slug text to a canonical key used across master tags and embedded
// task tags. Matches server-side slugify used by /api/tags.
function slugKey(text?: string) {
  if (!text) return ''
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function tagUsageTotalFromApi(t: TaskTag): number | null {
  if (t._count == null) return null
  return (t._count.tasks ?? 0) + (t._count.flashcards ?? 0)
}

function tagUsageTitle(t: TaskTag): string {
  const tasks = t._count?.tasks ?? 0
  const fc = t._count?.flashcards ?? 0
  return `${tasks} task${tasks === 1 ? '' : 's'}, ${fc} flashcard${fc === 1 ? '' : 's'}`
}

// Extract numeric value from an id string (e.g. "tsk-123" -> 123).
// Returns NaN if no numeric portion found.
function numericIdValue(id?: string): number {
  if (!id) return NaN
  const matches = id.match(/\d+/g)
  if (!matches || matches.length === 0) return NaN
  return Number.parseInt(matches[matches.length - 1], 10)
}

function typeLabel(type: Task['type']): string {
  switch (type) {
    case 'MULTIPLE_CHOICE': return 'Multiple choice'
    case 'OPEN_ENDED':      return 'Open-ended'
    case 'TRUE_FALSE':      return 'True / False'
  }
}

function typeBadgeAccent(type: Task['type']): string {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return 'text-blue-800 dark:text-blue-200'
    case 'OPEN_ENDED':
      return 'text-violet-800 dark:text-violet-200'
    case 'TRUE_FALSE':
      return 'text-emerald-800 dark:text-emerald-200'
  }
}

function resolveLessons(lesson: Task['lesson']): LessonRef[] {
  if (!lesson || lesson.length === 0) return []
  return lesson.map((l) =>
    typeof l === 'string' ? { id: l, title: 'Lesson' } : l
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Tag filter (multi-select, AND logic)
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<Set<string>>(new Set())

  // Search (client-side: title, prompt text, id, lesson titles) + type filter (server-side via API)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'' | Task['type']>('')

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('newest')

  // Pagination
  const PAGE_SIZE = 50
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Master tag list from /api/tags (shows all tags even if no task has them yet)
  const [masterTags, setMasterTags] = useState<TaskTag[]>([])
  const [showAllTags, setShowAllTags] = useState(false)
  const [tagSortField, setTagSortField] = useState<'name' | 'count'>('name')
  const [tagSortDir, setTagSortDir] = useState<'asc' | 'desc'>('asc')
  const [tagPage, setTagPage] = useState(1)

  // Tag sort buttons (mirror /admin/tags controls)
  const tagSortButtons: Array<{ key: string; icon: React.ReactNode; title: string; onClick: () => void }> = [
    { key: 'name-asc',   icon: <ArrowUpAZ   className="h-4 w-4" />, title: 'A → Z', onClick: () => { setTagSortField('name'); setTagSortDir('asc') } },
    { key: 'name-desc',  icon: <ArrowDownAZ className="h-4 w-4" />, title: 'Z → A', onClick: () => { setTagSortField('name'); setTagSortDir('desc') } },
    { key: 'count-desc', icon: <ArrowDown01 className="h-4 w-4" />, title: 'Most appearances (tasks + flashcards)', onClick: () => { setTagSortField('count'); setTagSortDir('desc') } },
    { key: 'count-asc',  icon: <ArrowUp01   className="h-4 w-4" />, title: 'Fewest appearances (tasks + flashcards)', onClick: () => { setTagSortField('count'); setTagSortDir('asc') } },
  ]

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | undefined>(undefined)

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Assign dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<Task | null>(null)

  // ── Data fetching ─────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams()
      if (selectedTagSlugs.size > 0) {
        params.set('tagSlugs', Array.from(selectedTagSlugs).join(','))
      }
      if (typeFilter) {
        params.set('type', typeFilter)
      }
      const qs = params.toString()
      const [tasksRes, tagsRes] = await Promise.all([
        fetch(`/api/admin/tasks${qs ? `?${qs}` : ''}`),
        fetch('/api/tags'),
      ])
      if (!tasksRes.ok) throw new Error('Failed to load tasks')
      const tasksData = await tasksRes.json()
      setTasks(tasksData.tasks ?? [])
      if (tagsRes.ok) {
        const tagsData = await tagsRes.json()
        // Keep full master list in state; UI toggle controls what is shown
        setMasterTags(
          (tagsData.tags ?? []).map((t: { id: string; name: string; slug: string; main?: boolean; _count?: { tasks?: number; flashcards?: number } }) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            main: t.main,
            _count: t._count,
          })),
        )
      }
    } catch {
      setError('Could not load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [selectedTagSlugs, typeFilter])

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput), 350)
    return () => window.clearTimeout(t)
  }, [searchInput])

  // Refetch when tag or task-type filters change (search is applied client-side on the loaded list).
  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchData()
    }, 0)
    return () => window.clearTimeout(t)
  }, [fetchData])

  function toggleTagSlug(slug: string) {
    setSelectedTagSlugs((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  // ── Tag list: master tags merged with any extra tags found in task data ────────
  // Always shows all known tags. Count comes from loaded tasks.

  const allTags = useMemo<TaskTag[]>(() => {
    const seen = new Map<string, TaskTag>()
    // Seed from master list
    for (const t of masterTags) seen.set(slugKey(t.slug || t.name), t)
    // Also capture any tags embedded in task data not yet in master list
    for (const task of tasks) {
      for (const tag of task.tags ?? []) {
        const k = slugKey(tag.slug || tag.name)
        if (!seen.has(k)) seen.set(k, tag)
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [masterTags, tasks])

  // Apply the showAllTags toggle: if false, only display tags marked as main
  const visibleTags = useMemo<TaskTag[]>(() => {
    if (showAllTags) return allTags
    return allTags.filter((t) => t.main)
  }, [allTags, showAllTags])

  // ── Tag → task count (memoized to avoid O(tags × tasks) in JSX) ──────────────
  const tagCounts = useMemo<Map<string, number>>(() => {
    const m = new Map<string, number>()
    for (const task of tasks) {
      for (const tag of task.tags ?? []) {
        const k = slugKey(tag.slug || tag.name)
        m.set(k, (m.get(k) ?? 0) + 1)
      }
    }
    return m
  }, [tasks])

  // Sorted tag list according to selected sort field and direction
  const sortedTags = useMemo<TaskTag[]>(() => {
    const arr = Array.from(visibleTags)
    arr.sort((a, b) => {
      if (tagSortField === 'name') {
        const cmp = a.name.localeCompare(b.name)
        return tagSortDir === 'asc' ? cmp : -cmp
      }
      const ka = slugKey(a.slug || a.name)
      const kb = slugKey(b.slug || b.name)
      const ca = tagUsageTotalFromApi(a) ?? tagCounts.get(ka) ?? 0
      const cb = tagUsageTotalFromApi(b) ?? tagCounts.get(kb) ?? 0
      if (ca === cb) return a.name.localeCompare(b.name)
      return tagSortDir === 'asc' ? ca - cb : cb - ca
    })

    // Move selected tags to the top of the list (preserve relative order)
    if (selectedTagSlugs.size > 0) {
      const sel: TaskTag[] = []
      const rest: TaskTag[] = []
      for (const t of arr) {
        if (selectedTagSlugs.has(slugKey(t.slug || t.name))) sel.push(t)
        else rest.push(t)
      }
      return [...sel, ...rest]
    }

    return arr
  }, [visibleTags, tagCounts, tagSortField, tagSortDir, selectedTagSlugs])

  // ── Filtered + sorted task list ───────────────────────────────────────────────

  const filteredTasks = useMemo<Task[]>(() => {
    let list = [...tasks]
    const q = debouncedSearch.trim().toLowerCase()
    if (q.length > 0) {
      list = list.filter((t) => {
        const lessons = resolveLessons(t.lesson)
        const hay = [
          t.title ?? '',
          extractText(t.prompt),
          t.id,
          ...lessons.map((l) => l.title ?? ''),
        ]
          .join('\n')
          .toLowerCase()
        return hay.includes(q)
      })
    }

    switch (sortKey) {
      case 'newest': list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break
      case 'oldest': list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break
      case 'az':     list.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '')); break
      case 'za':     list.sort((a, b) => (b.title ?? '').localeCompare(a.title ?? '')); break
      case 'tagged': list.sort((a, b) => (b.tags?.length ?? 0) - (a.tags?.length ?? 0)); break
      case 'id-desc': list.sort((a, b) => {
        const na = numericIdValue(a.id), nb = numericIdValue(b.id)
        const va = Number.isNaN(na) ? Number.NEGATIVE_INFINITY : na
        const vb = Number.isNaN(nb) ? Number.NEGATIVE_INFINITY : nb
        return vb - va
      }); break
      case 'id-asc': list.sort((a, b) => {
        const na = numericIdValue(a.id), nb = numericIdValue(b.id)
        const va = Number.isNaN(na) ? Number.POSITIVE_INFINITY : na
        const vb = Number.isNaN(nb) ? Number.POSITIVE_INFINITY : nb
        return va - vb
      }); break
    }
    return list
  }, [tasks, debouncedSearch, sortKey])

  const hasActiveFilters =
    selectedTagSlugs.size > 0 || Boolean(debouncedSearch.trim()) || Boolean(typeFilter)

  function clearAllFilters() {
    setSelectedTagSlugs(new Set())
    setSearchInput('')
    setDebouncedSearch('')
    setTypeFilter('')
  }

  // Reset page to 1 whenever filters/sort or underlying tasks change
  useEffect(() => {
    queueMicrotask(() => setCurrentPage(1))
  }, [tasks, debouncedSearch, typeFilter, selectedTagSlugs, sortKey])

  // Reset tag pagination when toggling between main/all tags
  useEffect(() => {
    queueMicrotask(() => setTagPage(1))
  }, [showAllTags])

  // Paged tasks (50 per page)
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE))
  const pagedTasks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredTasks.slice(start, start + PAGE_SIZE)
  }, [filteredTasks, currentPage])

  // ── Edit handlers ─────────────────────────────────────────────────────────────

  function openEdit(task: Task) {
    setEditTask(task)
    setEditDialogOpen(true)
  }

  function closeEdit() {
    setEditDialogOpen(false)
    setEditTask(undefined)
    fetchData()
  }

  // ── Delete handlers ───────────────────────────────────────────────────────────

  function openDelete(task: Task) {
    setDeleteTarget(task)
    setDeleteDialogOpen(true)
  }

  function closeDelete() {
    if (deleting) return
    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteTask(deleteTarget.id)
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id))
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    } catch {
      setError('Failed to delete task.')
      setDeleteDialogOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  // ── Assign handlers ───────────────────────────────────────────────────────────

  function openAssign(task: Task) {
    setAssignTarget(task)
    setAssignDialogOpen(true)
  }

  function closeAssign() {
    setAssignDialogOpen(false)
    setAssignTarget(null)
  }

  function handleAssigned() {
    fetchData()
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ── Page header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">Tasks</h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400 md:text-lg">
            Create, edit and organise standalone tasks. Tasks can be attached to lessons or kept free.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {/* Sort dropdown */}
          <div className="relative">
            <label htmlFor="task-sort" className="sr-only">Sort tasks</label>
            <select
              id="task-sort"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="h-9 rounded-md border border-slate-300/50 bg-white/40 px-3 text-sm text-gray-900 shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-white/15 dark:bg-white/10 dark:text-gray-100"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
          </div>

          <Button
            variant="hero"
            className="auth-hero-cta"
            onClick={() => {
              setEditTask(undefined)
              setEditDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* ── Search + task type ── */}
      <div
        className={cn(
          'flex flex-col gap-3 rounded-xl border-0 p-4 shadow-none sm:flex-row sm:flex-wrap sm:items-end',
          adminGlassCard,
        )}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <label htmlFor="task-search" className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="task-search"
              type="search"
              placeholder="Title, question text, task id, lesson…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border-slate-300/50 bg-white/50 pl-9 dark:border-white/15 dark:bg-white/10"
              autoComplete="off"
            />
          </div>
        </div>
        <div className="w-full space-y-1 sm:w-52">
          <label htmlFor="task-type-filter" className="text-xs font-medium text-muted-foreground">
            Task type
          </label>
          <select
            id="task-type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter((e.target.value || '') as '' | Task['type'])}
            className="h-9 w-full rounded-md border border-slate-300/50 bg-white/40 px-3 text-sm text-gray-900 shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-white/15 dark:bg-white/10 dark:text-gray-100"
          >
            <option value="">All types</option>
            <option value="MULTIPLE_CHOICE">Multiple choice</option>
            <option value="OPEN_ENDED">Open-ended</option>
            <option value="TRUE_FALSE">True / false</option>
          </select>
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
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(adminGlassOutlineButton)}
                  onClick={() => setShowAllTags((s) => !s)}
                >
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
              const TAGS_PER_PAGE = 15
              const totalPages = Math.max(1, Math.ceil(sortedTags.length / TAGS_PER_PAGE))
              return totalPages > 1 ? (
                <div className="flex items-center px-2 text-xs text-gray-500">
                  {tagPage} / {totalPages}
                </div>
              ) : null
            })()}

            <div className="flex flex-1 flex-wrap gap-2">
              {/* "Clear all" chip (shown when any tag is selected) */}
              {selectedTagSlugs.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTagSlugs(new Set())}
                  className={cn(
                    studentGlassPill,
                    'cursor-pointer border-dashed opacity-95 hover:opacity-100',
                  )}
                >
                  <X className="h-3 w-3" />
                  Clear ({selectedTagSlugs.size})
                </button>
              )}
              {(() => {
                // Paginate: 15 tags per page
                const TAGS_PER_PAGE = 15
                const totalPages = Math.max(1, Math.ceil(sortedTags.length / TAGS_PER_PAGE))
                const startIdx = (tagPage - 1) * TAGS_PER_PAGE
                const paginatedTags = sortedTags.slice(startIdx, startIdx + TAGS_PER_PAGE)
                return paginatedTags.map((tag) => {
              const isActive = selectedTagSlugs.has(slugKey(tag.slug))
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTagSlug(slugKey(tag.slug))}
                  className={cn(
                    'inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-primary/45 bg-primary/20 text-primary shadow-sm ring-1 ring-primary/20 dark:bg-primary/25 dark:text-primary'
                      : cn(
                          studentGlassPill,
                          'h-8 border font-medium normal-case tracking-normal',
                        ),
                  )}
                >
                  <span className="max-w-[28rem] truncate">{tag.name}</span>
                    <span
                      className={cn(
                        'ml-1 rounded-full px-1.5 py-0 text-xs',
                        isActive
                          ? 'bg-primary/20 text-primary dark:bg-primary/30'
                          : 'bg-white/50 text-slate-700 dark:bg-white/10 dark:text-gray-200',
                      )}
                      title={
                        tagUsageTotalFromApi(tag) != null
                          ? tagUsageTitle(tag)
                          : `In loaded tasks: ${tagCounts.get(slugKey(tag.slug || tag.name)) ?? 0}`
                      }
                    >
                    {tagUsageTotalFromApi(tag) ?? tagCounts.get(slugKey(tag.slug || tag.name)) ?? 0}
                  </span>
                </button>
              )
            })
              })()}
            </div>

            {/* Right arrow */}
            <button
              type="button"
              onClick={() => {
                const TAGS_PER_PAGE = 15
                const totalPages = Math.max(1, Math.ceil(sortedTags.length / TAGS_PER_PAGE))
                setTagPage((p) => Math.min(totalPages, p + 1))
              }}
              disabled={(() => {
                const TAGS_PER_PAGE = 15
                const totalPages = Math.max(1, Math.ceil(sortedTags.length / TAGS_PER_PAGE))
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

      {/* (Removed duplicate pagination here; controls moved below task grid) */}

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
          Loading tasks…
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && filteredTasks.length === 0 && !error && (
        <div
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-400/40 bg-white/[0.12] py-16 text-center backdrop-blur-md dark:border-white/20 dark:bg-white/[0.04]',
          )}
        >
          <ClipboardList className="mb-4 h-10 w-10 text-gray-300" />
          {tasks.length > 0 ? (
            <>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                No tasks match your search or filters
              </p>
              <p className="mt-1 max-w-md text-xs text-gray-400">
                Try different keywords, clear the task type filter, or adjust tag filters.
              </p>
              <Button type="button" className={cn('mt-4', adminGlassOutlineButton)} variant="outline" onClick={clearAllFilters}>
                Clear filters
              </Button>
            </>
          ) : hasActiveFilters ? (
            <>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No tasks match the selected filters</p>
              <Button type="button" className={cn('mt-4', adminGlassOutlineButton)} variant="outline" onClick={clearAllFilters}>
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-500">No tasks yet</p>
              <p className="mt-1 text-xs text-gray-400">
                Click &ldquo;Add Task&rdquo; to create your first one.
              </p>
              <Button
                className="auth-hero-cta mt-4"
                variant="hero"
                onClick={() => {
                  setEditTask(undefined)
                  setEditDialogOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </>
          )}
        </div>
      )}

      {/* ── Tasks grid ── */}
      {!loading && filteredTasks.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(filteredTasks.length === 0) ? 0 : (Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredTasks.length))}
              {filteredTasks.length > 0 && (
                <span>–{Math.min(currentPage * PAGE_SIZE, filteredTasks.length)}</span>
              )} of {filteredTasks.length}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" className={cn(adminGlassOutlineButton)} disabled={currentPage <= 1} onClick={() => setCurrentPage(1)}>
                First
              </Button>
              <Button size="sm" variant="outline" className={cn(adminGlassOutlineButton)} disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                Prev
              </Button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <Button size="sm" variant="outline" className={cn(adminGlassOutlineButton)} disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                Next
              </Button>
              <Button size="sm" variant="outline" className={cn(adminGlassOutlineButton)} disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)}>
                Last
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="tasks-grid">
          {pagedTasks.map((task) => {
            const promptText = extractText(task.prompt)
            const lessons = resolveLessons(task.lesson)

            return (
              <Card
                key={task.id}
                className={cn('relative flex flex-col border-0 shadow-none', adminGlassCard)}
                data-testid={`task-card-${task.id}`}
              >
                <CardContent className="flex flex-1 flex-col gap-3 p-4">
                  {/* Question preview */}
                  <div>
                    <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Question
                    </p>
                    <p className="font-mono text-sm text-gray-800 dark:text-gray-200">
                      {promptText ? truncate(promptText) : <span className="italic text-gray-400">No prompt</span>}
                    </p>
                  </div>

                  {/* Type + points */}
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(studentGlassPill, 'font-semibold normal-case tracking-tight', typeBadgeAccent(task.type))}
                    >
                      {typeLabel(task.type)}
                    </span>
                    <span className="text-xs text-gray-400">{task.points} pt{task.points !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Tags */}
                  {(task.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.tags!.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTagSlug(slugKey(tag.slug))}
                        >
                          <span
                            className={cn(
                              studentGlassPill,
                              'cursor-pointer text-xs transition-colors',
                              selectedTagSlugs.has(slugKey(tag.slug))
                                ? 'ring-2 ring-primary/35'
                                : 'opacity-90 hover:opacity-100',
                            )}
                          >
                            {tag.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Lesson info */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs" data-testid={`lesson-info-${task.id}`}>
                    {lessons.length > 0 ? (
                      <>
                        <BookOpen className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="text-gray-500">{lessons.length === 1 ? 'Lesson:' : 'Lessons:'}</span>
                        {lessons.map((l, i) => (
                          <span key={l.id} className="inline-flex items-center gap-0.5">
                            <Link
                              href={`/admin/lessons/${l.id}/builder`}
                              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {l.title}
                            </Link>
                            {i < lessons.length - 1 && <span className="text-gray-400">,</span>}
                          </span>
                        ))}
                      </>
                    ) : (
                      <>
                        <ClipboardList className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="italic text-gray-400" data-testid="not-in-lesson">Not in any lesson</span>
                      </>
                    )}
                  </div>

                  {/* Footer row: date + actions */}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-[11px] text-gray-400">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Edit */}
                      <button
                        type="button"
                        aria-label="Edit task"
                        onClick={() => openEdit(task)}
                        className="rounded p-1 text-gray-400 hover:text-blue-500"
                        data-testid={`edit-btn-${task.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      {/* Assign to lesson */}
                      <button
                        type="button"
                        aria-label="Assign to lesson"
                        onClick={() => openAssign(task)}
                        className="rounded p-1 text-gray-400 hover:text-indigo-500"
                        title="Assign to lesson"
                        data-testid={`assign-btn-${task.id}`}
                      >
                        <Link2 className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        aria-label="Delete task"
                        onClick={() => openDelete(task)}
                        className="rounded p-1 text-gray-400 hover:text-red-500"
                        data-testid={`delete-btn-${task.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>

                {/* Task ID removed from card footer (not needed in UI) */}
              </Card>
            )
          })}
        </div>

          {/* Bottom pagination controls */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button size="sm" variant="outline" className={cn(adminGlassOutlineButton)} disabled={currentPage <= 1} onClick={() => setCurrentPage(1)}>
              First
            </Button>
            <Button size="sm" variant="outline" className={cn(adminGlassOutlineButton)} disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
              Prev
            </Button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <Button size="sm" variant="outline" className={cn(adminGlassOutlineButton)} disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </Button>
            <Button size="sm" variant="outline" className={cn(adminGlassOutlineButton)} disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)}>
              Last
            </Button>
          </div>

        </div>
      )}

      {/* Edit / create dialog */}
      <AddTaskDialog
        open={editDialogOpen}
        onClose={closeEdit}
        initialTask={editTask}
        masterTags={masterTags}
      />
      

      {/* Delete confirmation dialog */}
      <DeleteTaskDialog
        open={deleteDialogOpen}
        taskName={deleteTarget ? (extractText(deleteTarget.prompt) || deleteTarget.title || 'Unnamed task') : ''}
        usedInLessons={deleteTarget ? resolveLessons(deleteTarget.lesson) : []}
        loading={deleting}
        onClose={closeDelete}
        onConfirm={confirmDelete}
      />

      {/* Assign to lesson dialog */}
      {assignTarget && (
        <AssignToLessonDialog
          open={assignDialogOpen}
          taskId={assignTarget.id}
          currentLessonIds={resolveLessons(assignTarget.lesson).map((l) => l.id)}
          onClose={closeAssign}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  )
}
