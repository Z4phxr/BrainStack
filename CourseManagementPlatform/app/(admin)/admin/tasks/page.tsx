'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
  ArrowDownUp,
  ArrowUpAZ,
  ArrowDownAZ,
  ArrowUp01,
  ArrowDown01,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { AddTaskDialog } from '@/components/admin/add-task-dialog'
import { DeleteTaskDialog } from '@/components/admin/delete-task-dialog'
import { AssignToLessonDialog } from '@/components/admin/assign-to-lesson-dialog'
import { deleteTask } from '@/app/(admin)/admin/actions'
import { extractText } from '@/lib/lexical'

type SortKey = 'newest' | 'oldest' | 'az' | 'tagged' | 'id-asc' | 'id-desc'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TaskTag {
  id: string
  name: string
  slug: string
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

function typeBadgeClass(type: Task['type']): string {
  switch (type) {
    case 'MULTIPLE_CHOICE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    case 'OPEN_ENDED':      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
    case 'TRUE_FALSE':      return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
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
    { key: 'count-desc', icon: <ArrowDown01 className="h-4 w-4" />, title: 'Most used first', onClick: () => { setTagSortField('count'); setTagSortDir('desc') } },
    { key: 'count-asc',  icon: <ArrowUp01   className="h-4 w-4" />, title: 'Least used first', onClick: () => { setTagSortField('count'); setTagSortDir('asc') } },
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

  const fetchData = useCallback(async (tagSlugsCsv?: string | null) => {
    try {
      setLoading(true)
      setError('')
      const [tasksRes, tagsRes] = await Promise.all([
        fetch(`/api/admin/tasks${tagSlugsCsv ? `?tagSlugs=${encodeURIComponent(tagSlugsCsv)}` : ''}`),
        fetch('/api/tags'),
      ])
      if (!tasksRes.ok) throw new Error('Failed to load tasks')
      const tasksData = await tasksRes.json()
      setTasks(tasksData.tasks ?? [])
      if (tagsRes.ok) {
        const tagsData = await tagsRes.json()
        // Keep full master list in state; UI toggle controls what is shown
        setMasterTags(
          (tagsData.tags ?? []).map((t: any) => ({ id: t.id, name: t.name, slug: t.slug, main: t.main }))
        )
      }
    } catch {
      setError('Could not load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Refetch when selectedTagSlugs changes: if any tags selected, ask server to filter (AND semantics).
  useEffect(() => {
    const tagSlugsCsv = selectedTagSlugs.size > 0 ? Array.from(selectedTagSlugs).join(',') : null
    void fetchData(tagSlugsCsv)
  }, [fetchData, selectedTagSlugs])

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
    return allTags.filter((t: any) => (t as any).main)
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
      const ca = tagCounts.get(slugKey(a.slug || a.name)) ?? 0
      const cb = tagCounts.get(slugKey(b.slug || b.name)) ?? 0
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
    const list = selectedTagSlugs.size > 0
      ? tasks.filter((t) =>
          Array.from(selectedTagSlugs).every((slug) =>
            t.tags?.some((tag) => slugKey(tag.slug) === slugKey(slug))
          )
        )
      : [...tasks]

    switch (sortKey) {
      case 'newest': list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break
      case 'oldest': list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break
      case 'az':     list.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '')); break
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
  }, [tasks, selectedTagSlugs, sortKey])

  // Reset page to 1 whenever filters/sort or underlying tasks change
  useEffect(() => {
    setCurrentPage(1)
  }, [tasks, selectedTagSlugs, sortKey])

  // Reset tag pagination when toggling between main/all tags
  useEffect(() => {
    setTagPage(1)
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
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, edit and organise standalone tasks. Tasks can be attached to lessons or kept free.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort dropdown */}
          <div className="relative">
            <label htmlFor="task-sort" className="sr-only">Sort tasks</label>
            <div className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center">
              <ArrowDownUp className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <select
              id="task-sort"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="h-9 rounded-md border border-input bg-background pl-8 pr-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
          </div>

          <Button onClick={() => { setEditTask(undefined); setEditDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
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
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
                  className={
                    isActive
                      ? 'inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border border-blue-400 bg-blue-400 px-3 text-sm font-medium text-blue-50 dark:border-blue-600 dark:bg-blue-600 dark:text-white'
                      : 'inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-700 transition-colors hover:border-blue-400 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                  }
                >
                  <span className="truncate max-w-[28rem]">{tag.name}</span>
                    <span className="ml-1 rounded-full bg-blue-200/60 px-1.5 py-0 text-xs text-blue-800 dark:bg-blue-800/60 dark:text-blue-200">
                    {tagCounts.get(slugKey(tag.slug || tag.name)) ?? 0}
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
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
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
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <ClipboardList className="mb-4 h-10 w-10 text-gray-300" />
          {selectedTagSlugs.size > 0 ? (
            <>
              <p className="text-sm font-medium text-gray-500">No tasks match the selected tags</p>
              <Button className="mt-4" variant="outline" onClick={() => setSelectedTagSlugs(new Set())}>
                Clear filter
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-500">No tasks yet</p>
              <p className="mt-1 text-xs text-gray-400">
                Click &ldquo;Add Task&rdquo; to create your first one.
              </p>
              <Button className="mt-4" onClick={() => { setEditTask(undefined); setEditDialogOpen(true) }}>
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
            <div className="flex items-center gap-2">
              <Button size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(1)}>First</Button>
              <Button size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <div className="text-sm text-gray-500">Page {currentPage} of {totalPages}</div>
              <Button size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
              <Button size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)}>Last</Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="tasks-grid">
          {pagedTasks.map((task) => {
            const promptText = extractText(task.prompt)
            const lessons = resolveLessons(task.lesson)

            return (
              <Card key={task.id} className="relative flex flex-col" data-testid={`task-card-${task.id}`}>
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
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeBadgeClass(task.type)}`}
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
                          <Badge
                            variant="secondary"
                            className={`cursor-pointer text-xs transition-colors ${
                              selectedTagSlugs.has(slugKey(tag.slug))
                                ? 'bg-blue-200 text-blue-800 dark:bg-blue-800/60 dark:text-blue-200'
                                : 'hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/40 dark:hover:text-blue-300'
                            }`}
                          >
                            {tag.name}
                          </Badge>
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
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(1)}>First</Button>
            <Button size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Prev</Button>
            <div className="text-sm text-gray-500">Page {currentPage} of {totalPages}</div>
            <Button size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
            <Button size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)}>Last</Button>
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
