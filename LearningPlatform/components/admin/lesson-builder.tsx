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
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{lesson.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Lesson editor</p>
            {/** Show who last updated the lesson (if available) */}
            {('lastUpdatedBy' in (lesson as any)) && (lesson as any).lastUpdatedBy && (
              <p className="text-xs text-gray-500 mt-1">Last updated by: {(lesson as any).lastUpdatedBy}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href={previewHref}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
          {activeTab === 'theory' && (
            <Button
              type="button"
              variant="secondary"
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
            onClick={() => void handlePublish()}
            disabled={loading}
            title="Show or hide this lesson for students. Use Save to store your edits first."
          >
            {lesson.isPublished ? 'Hide' : 'Publish'}
          </Button>
          <Button type="button" variant="destructive" onClick={() => void handleDeleteLesson()} disabled={loading}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('theory')}
            className={`border-b-2 px-4 py-2 font-medium ${
              activeTab === 'theory'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Theory
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`border-b-2 px-4 py-2 font-medium ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Tasks
          </button>
        </div>
      </div>

      {error && <FormError message={error} />}

      {/* Theory Tab */}
      {activeTab === 'theory' && (
        <Card>
          <CardHeader>
            <CardTitle>Lesson content</CardTitle>
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
                  size="lg"
                  className="min-w-[14rem] px-8"
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Questions and tasks</CardTitle>
              <Button onClick={() => setShowAddTask(true)}>
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
