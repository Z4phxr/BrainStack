'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { adminGlassCard, adminGlassOutlineButton } from '@/lib/student-glass-styles'
import { AlertTriangle, BookOpen, Loader2, Trash2, X } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LessonRef {
  id: string
  title: string
}

interface DeleteTaskDialogProps {
  open: boolean
  /** Display name / prompt text of the task — shown in the confirmation. */
  taskName: string
  /** Lessons that currently reference this task. */
  usedInLessons?: LessonRef[]
  /** Whether the delete operation is in progress. */
  loading?: boolean
  onClose: () => void
  onConfirm: () => void
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function DeleteTaskDialog({
  open,
  taskName,
  usedInLessons = [],
  loading = false,
  onClose,
  onConfirm,
}: DeleteTaskDialogProps) {
  if (!open) return null

  const isUsed = usedInLessons.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={cn('w-full max-w-md overflow-hidden shadow-2xl', adminGlassCard)}
        data-testid="delete-task-dialog"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b p-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-base font-bold">Delete task?</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this task?
          </p>

          {/* Task name preview */}
          <p className="rounded-md bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm font-mono text-gray-700 dark:text-gray-300 line-clamp-3">
            {taskName}
          </p>

          {/* Lesson usage warning */}
          {isUsed && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-700 dark:bg-amber-900/20">
              <p className="mb-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                This task is currently used in:
              </p>
              <ul className="space-y-1">
                {usedInLessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300"
                    data-testid={`used-in-lesson-${lesson.id}`}
                  >
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    {lesson.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            This action{' '}
            <span className="font-semibold text-red-600 dark:text-red-400">
              cannot be undone
            </span>
            . All student progress associated with this task will also be removed.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t dark:border-gray-700 p-4 flex gap-3">
          <Button
            variant="destructive"
            disabled={loading}
            onClick={onConfirm}
            data-testid="confirm-delete-btn"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete task
              </>
            )}
          </Button>
          <Button variant="outline" className={cn(adminGlassOutlineButton)} onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
