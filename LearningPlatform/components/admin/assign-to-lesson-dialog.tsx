'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { assignTask } from '@/app/(admin)/admin/actions'
import {
  X,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Layers,
  FileText,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminGlassCard, adminGlassOutlineButton } from '@/lib/student-glass-styles'

// ─── Module-level cache (survives re-renders, cleared on page navigation) ───────
interface LessonItem { id: string; title: string }
interface ModuleItem { id: string; title: string; lessons: LessonItem[] }
interface CourseItem { id: string; title: string; modules: ModuleItem[] }

let _cache: { data: CourseItem[]; ts: number } | null = null
const CACHE_TTL_MS = 2 * 60 * 1000 // 2 minutes

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AssignToLessonDialogProps {
  open: boolean
  /** ID of the task being assigned. */
  taskId: string
  /** Currently-assigned lesson IDs — used to pre-check checkboxes. */
  currentLessonIds?: string[]
  onClose: () => void
  /** Called after a successful (re)assignment. */
  onAssigned: () => void
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function AssignToLessonDialog({
  open,
  taskId,
  currentLessonIds = [],
  onClose,
  onAssigned,
}: AssignToLessonDialogProps) {
  // Seed from cache immediately so there's no flash of empty state
  const [courses, setCourses] = useState<CourseItem[]>(() => _cache?.data ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(
    new Set(currentLessonIds),
  )

  // Which courses / modules are expanded (by id)
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  // Track the last taskId we applied expansion logic for so we don't repeat it
  const lastExpandedFor = useRef<string | null>(null)

  // ── Fetch hierarchy on open ───────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return
    queueMicrotask(() => setSelectedLessonIds(new Set(currentLessonIds)))

    const now = Date.now()
    // During tests, skip the module cache so tests that stub `fetch` observe
    // the mocked responses instead of stale cached data from other tests.
    const cacheValid =
      _cache &&
      now - _cache.ts < CACHE_TTL_MS &&
      process.env.NODE_ENV !== 'test' &&
      process.env.VITEST !== 'true'

    function applyExpansion(courseList: CourseItem[]) {
      if (currentLessonIds.length > 0) {
        const newExpandedCourses = new Set<string>()
        const newExpandedModules = new Set<string>()
        for (const course of courseList) {
          for (const mod of course.modules) {
            if (mod.lessons.some((l) => currentLessonIds.includes(l.id))) {
              newExpandedCourses.add(course.id)
              newExpandedModules.add(mod.id)
            }
          }
        }
        setExpandedCourses(newExpandedCourses)
        setExpandedModules(newExpandedModules)
      } else {
        // Expand all courses by default so the tree is visible immediately
        setExpandedCourses(new Set(courseList.map((c) => c.id)))
      }
    }

    if (cacheValid) {
      // Instant render — no network request needed
      queueMicrotask(() => setCourses(_cache!.data))
      if (lastExpandedFor.current !== taskId) {
        applyExpansion(_cache!.data)
        lastExpandedFor.current = taskId
      }
      return
    }

    let mounted = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/admin/courses-hierarchy')
        if (!res.ok) throw new Error('Failed to load courses')
        const data = await res.json()
        if (!mounted) return
        const courseList: CourseItem[] = data.courses ?? []
        _cache = { data: courseList, ts: Date.now() }
        setCourses(courseList)
        applyExpansion(courseList)
        lastExpandedFor.current = taskId
      } catch {
        if (mounted) setError('Could not load courses. Please try again.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [open, currentLessonIds, taskId])

  // ── Assign ────────────────────────────────────────────────────────────────────

  async function handleAssign() {
    setSaving(true)
    try {
      await assignTask(taskId, Array.from(selectedLessonIds))
      onAssigned()
      onClose()
    } catch {
      setError('Failed to assign task. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle helpers ────────────────────────────────────────────────────────────

  function toggleLesson(id: string) {
    setSelectedLessonIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleCourse(id: string) {
    setExpandedCourses((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleModule(id: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!open) return null

  const selectedCount = selectedLessonIds.size

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={cn('flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden shadow-2xl', adminGlassCard)}>
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700 shrink-0">
          <div>
            <h2 className="text-lg font-bold">Assign to lessons</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Check all lessons this task should belong to.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 py-8 justify-center text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading courses…
            </div>
          )}

          {!loading && courses.length === 0 && !error && (
            <p className="py-8 text-center text-sm text-gray-500">
              No courses found.
            </p>
          )}

          {/* Tree */}
          {!loading && courses.length > 0 && (
            <ul className="space-y-1" data-testid="course-tree">
              {courses.map((course) => {
                const isCourseOpen = expandedCourses.has(course.id)
                return (
                  <li key={course.id}>
                    {/* Course row */}
                    <button
                      type="button"
                      onClick={() => toggleCourse(course.id)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                      data-testid={`course-${course.id}`}
                    >
                      {isCourseOpen ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                      )}
                      <BookOpen className="h-4 w-4 shrink-0 text-blue-500" />
                      {course.title}
                    </button>

                    {/* Modules */}
                    {isCourseOpen && (
                      <ul className="ml-6 mt-0.5 space-y-0.5">
                        {course.modules.length === 0 && (
                          <li className="px-2 py-1 text-xs text-gray-400 italic">
                            No modules
                          </li>
                        )}
                        {course.modules.map((mod) => {
                          const isModOpen = expandedModules.has(mod.id)
                          return (
                            <li key={mod.id}>
                              {/* Module row */}
                              <button
                                type="button"
                                onClick={() => toggleModule(mod.id)}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                data-testid={`module-${mod.id}`}
                              >
                                {isModOpen ? (
                                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                )}
                                <Layers className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                                {mod.title}
                              </button>

                              {/* Lessons */}
                              {isModOpen && (
                                <ul className="ml-6 mt-0.5 space-y-0.5">
                                  {mod.lessons.length === 0 && (
                                    <li className="px-2 py-1 text-xs text-gray-400 italic">
                                      No lessons
                                    </li>
                                  )}
                                  {mod.lessons.map((lesson) => {
                                    const isChecked = selectedLessonIds.has(lesson.id)
                                    return (
                                      <li key={lesson.id}>
                                        <label
                                          className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                                            isChecked
                                              ? 'bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/40 dark:text-blue-300'
                                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                          }`}
                                          data-testid={`lesson-${lesson.id}`}
                                        >
                                          <input
                                            type="checkbox"
                                            className="h-3.5 w-3.5 shrink-0 accent-blue-600"
                                            checked={isChecked}
                                            onChange={() => toggleLesson(lesson.id)}
                                          />
                                          <FileText className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                          <span className="flex-1 text-left">{lesson.title}</span>
                                        </label>
                                      </li>
                                    )
                                  })}
                                </ul>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 space-y-2 border-t border-slate-200/60 p-4 dark:border-white/10">
          <p className="text-xs text-gray-500">
            {selectedCount === 0
              ? 'No lessons selected — task will become standalone.'
              : `${selectedCount} lesson${selectedCount !== 1 ? 's' : ''} selected.`}
          </p>
          <div className="flex gap-3">
            <Button variant="hero" className="auth-hero-cta" disabled={saving} onClick={handleAssign}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save assignments'
              )}
            </Button>
            <Button variant="outline" className={cn(adminGlassOutlineButton)} onClick={onClose} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
