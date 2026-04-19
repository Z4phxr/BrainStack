'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Save, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { updateLesson, toggleLessonPublish } from '@/app/(admin)/admin/actions'
import { useRouter } from 'next/navigation'
import { TasksList } from './tasks-list'
import { AddTaskDialog } from './add-task-dialog'
import { TheoryBlocksEditor } from './theory-blocks-editor'
import { FormError, FieldError } from '@/components/ui/form-error'
import { ZodError } from 'zod'
import { cn } from '@/lib/utils'
import { adminGlassCard, adminGlassOutlineButton } from '@/lib/student-glass-styles'

interface Lesson {
  id: string
  title: string
  content?: unknown
  theoryBlocks?: unknown[]
  isPublished: boolean
  course: unknown
  module: unknown
}

interface Task {
  id: string
  type: string
  prompt: string
  choices?: Array<{ text: string }>
  correctAnswer?: string
  solution?: string
  points: number
  order: number
  isPublished: boolean
}

export function LessonBuilder({ lesson, tasks }: { lesson: Lesson; tasks: Task[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [editingTask, setEditingTask] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<'theory' | 'tasks'>('theory')
  const [theoryBlocks, setTheoryBlocks] = useState(lesson.theoryBlocks || [])
  const [title, setTitle] = useState(lesson.title)
  const [error, setError] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const courseSlug =
    typeof lesson.course === 'object' &&
    lesson.course !== null &&
    'slug' in lesson.course
      ? (lesson.course as { slug?: string }).slug
      : undefined
  const previewHref = courseSlug ? `/courses/${courseSlug}/lessons/${lesson.id}?preview=1` : '/courses'

  const handleSave = async () => {
    setError('')
    setFieldErrors({})
    setLoading(true)

    try {
      await updateLesson(lesson.id, {
        title,
        theoryBlocks,
      })
      alert('Lesson saved!')
      router.refresh()
    } catch (error: any) {
      // Handle Zod validation errors
      if (error?.name === 'ZodError' || error?.issues) {
        const zodError = error as ZodError
        const fieldErrs: Record<string, string> = {}
        const errorMessages: string[] = []
        
        zodError.issues.forEach((issue) => {
          const field = issue.path[0]?.toString() || 'unknown'
          const message = issue.message
          fieldErrs[field] = message
          errorMessages.push(message)
        })
        
        setFieldErrors(fieldErrs)
        setError(errorMessages.join(', '))
      } else {
        setError(error?.message || 'Failed to save lesson')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    try {
      await toggleLessonPublish(lesson.id, !lesson.isPublished)
      router.refresh()
    } catch (error) {
      alert(`Failed to change publish status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLesson = async () => {
    if (!confirm(`Are you sure you want to delete the lesson "${lesson.title}"?`)) return
    setLoading(true)
    try {
      const { deleteLesson } = await import('@/app/(admin)/admin/actions')
      await deleteLesson(lesson.id)
      router.push('/admin/lessons')
    } catch (error) {
      alert(`Failed to delete lesson: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" className={cn(adminGlassOutlineButton)} asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">
              {lesson.title}
            </h1>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">Lesson editor</p>
            {/** Show who last updated the lesson (if available) */}
            {('lastUpdatedBy' in (lesson as any)) && (lesson as any).lastUpdatedBy && (
              <p className="text-xs text-gray-500 mt-1">Last updated by: {(lesson as any).lastUpdatedBy}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
          <Button variant="outline" className={cn(adminGlassOutlineButton)} asChild>
            <Link href={previewHref}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
          {activeTab === 'theory' && (
            <Button
              type="button"
              variant="hero"
              className="auth-hero-cta"
              disabled={loading}
              onClick={() => void handleSave()}
              title="Save lesson title and theory blocks (does not publish)"
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            className={cn(adminGlassOutlineButton)}
            onClick={() => void handlePublish()}
            disabled={loading}
            title="Show or hide this lesson for students. Use Save to store your edits first."
          >
            {lesson.isPublished ? 'Hide' : 'Publish'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-red-300/50 text-red-700 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30"
            onClick={() => void handleDeleteLesson()}
            disabled={loading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-slate-300/40 bg-white/[0.12] px-1 backdrop-blur-md dark:border-white/12 dark:bg-white/[0.06]">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('theory')}
            className={cn(
              'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === 'theory'
                ? 'bg-white/50 text-primary shadow-sm dark:bg-white/10 dark:text-primary'
                : 'text-muted-foreground hover:bg-white/25 hover:text-foreground dark:hover:bg-white/5',
            )}
          >
            Theory
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={cn(
              'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === 'tasks'
                ? 'bg-white/50 text-primary shadow-sm dark:bg-white/10 dark:text-primary'
                : 'text-muted-foreground hover:bg-white/25 hover:text-foreground dark:hover:bg-white/5',
            )}
          >
            Tasks
          </button>
        </div>
      </div>

      {error && <FormError message={error} />}

      {/* Theory Tab */}
      {activeTab === 'theory' && (
        <Card className={cn('border-0 shadow-none', adminGlassCard)}>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Lesson content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-base font-medium">Lesson title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-3"
                />
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Theory blocks
                </Label>
                <TheoryBlocksEditor 
                  initialBlocks={theoryBlocks}
                  onChange={setTheoryBlocks}
                />
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  variant="hero"
                  className="auth-hero-cta min-w-[14rem] px-8"
                  size="lg"
                  onClick={() => void handleSave()}
                  disabled={loading}
                >
                  <Save className="mr-2 h-5 w-5" />
                  Save theory
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <Card className={cn('border-0 shadow-none', adminGlassCard)}>
          <CardHeader>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <CardTitle className="text-gray-900 dark:text-gray-100">Questions and tasks</CardTitle>
              <Button variant="hero" className="auth-hero-cta w-full shrink-0 sm:w-auto" onClick={() => setShowAddTask(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TasksList tasks={tasks} onEdit={(t) => { setEditingTask(t); setShowAddTask(true); }} />
          </CardContent>
        </Card>
      )}

      <AddTaskDialog
        open={showAddTask}
        onClose={() => { setShowAddTask(false); setEditingTask(null); }}
        lessonId={lesson.id}
        nextOrder={editingTask ? editingTask.order : tasks.length + 1}
        initialTask={editingTask || undefined}
      />
    </div>
  )
}
