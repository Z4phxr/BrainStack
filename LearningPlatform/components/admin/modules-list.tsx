'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Trash2, CheckCircle, Circle, Eye, Edit, ArrowUp, ArrowDown, Pencil, Check, X } from 'lucide-react'
import { deleteModule, toggleModulePublish, createLesson, deleteLesson, moveLesson, updateModule, moveModule } from '@/app/(admin)/admin/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { adminGlassCard, adminGlassOutlineButton, studentGlassPill } from '@/lib/student-glass-styles'

interface Lesson {
  id: string
  title: string
  order: number
  isPublished: boolean
}

interface Module {
  id: string
  title: string
  order: number
  isPublished: boolean
  lessons?: Lesson[]
}

export function ModulesList({ modules, courseId }: { modules: Module[]; courseId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [showAddLesson, setShowAddLesson] = useState<string | null>(null)
  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  const handleTogglePublish = async (id: string, currentState: boolean) => {
    setLoading(id)
    try {
      await toggleModulePublish(id, !currentState)
      router.refresh()
    } catch {
      alert('Failed to change publish status')
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteModule = async (id: string, title: string) => {
    const confirmMsg = `⚠️ WARNING!\n\nDeleting the module "${title}" will also remove all lessons and tasks in it.\n\nDo you want to continue?`
    if (!confirm(confirmMsg)) return
    
    setLoading(id)
    try {
      await deleteModule(id)
      router.refresh()
      alert('Module deleted successfully.')
    } catch (error) {
      alert(`Failed to delete module: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(null)
    }
  }

  const handleAddLesson = async (moduleId: string) => {
    if (!newLessonTitle.trim()) {
      alert('Please enter a lesson title')
      return
    }

    setLoading(moduleId)
    try {
      const courseModule = modules.find(m => m.id === moduleId)
      const lessonOrder = (courseModule?.lessons?.length || 0) + 1

      const newLesson = await createLesson({
        course: courseId,
        module: moduleId,
        title: newLessonTitle,
        content: '',
        order: lessonOrder,
      })

      setShowAddLesson(null)
      setNewLessonTitle('')
      
      // Redirect to lesson builder
      router.push(`/admin/lessons/${newLesson.id}/builder`)
    } catch (error) {
      alert(`Failed to add lesson: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(null)
    }
  }

  const handleStartEditModule = (mod: Module) => {
    setEditingModuleId(mod.id)
    setEditingTitle(mod.title)
  }

  const handleSaveEditModule = async (moduleId: string) => {
    if (!editingTitle.trim()) return
    setEditLoading(true)
    try {
      await updateModule(moduleId, { title: editingTitle.trim() })
      setEditingModuleId(null)
      router.refresh()
    } catch {
      alert('Failed to rename module')
    } finally {
      setEditLoading(false)
    }
  }

  const handleCancelEditModule = () => {
    setEditingModuleId(null)
    setEditingTitle('')
  }

  const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
    if (!confirm(`Are you sure you want to delete the lesson "${lessonTitle}"?`)) return
    
    setLoading(lessonId)
    try {
      await deleteLesson(lessonId)
      router.refresh()
      alert('Lesson deleted.')
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(null)
    }
  }

  if (modules.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No modules yet. Add the first module.</p>
  }

  return (
    <div className="space-y-4">
      {modules.map((courseModule, index) => (
        <div key={courseModule.id} className={cn('overflow-hidden rounded-xl border-0 shadow-none', adminGlassCard)}>
          {/* Module Header */}
          <div className="flex items-center justify-between border-b border-slate-200/40 bg-white/[0.12] p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.06]">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400">
                Module {index + 1}
              </span>
              {editingModuleId === courseModule.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEditModule(courseModule.id)
                      if (e.key === 'Escape') handleCancelEditModule()
                    }}
                    autoFocus
                    className="h-8 text-base font-semibold"
                    disabled={editLoading}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-green-600 hover:text-green-700"
                    onClick={() => handleSaveEditModule(courseModule.id)}
                    disabled={editLoading}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={handleCancelEditModule}
                    disabled={editLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold dark:text-gray-100">{courseModule.title}</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={() => handleStartEditModule(courseModule)}
                    disabled={!!loading}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <span
                    className={cn(
                      studentGlassPill,
                      courseModule.isPublished ? 'text-emerald-800 dark:text-emerald-200' : 'opacity-90',
                    )}
                  >
                    {courseModule.isPublished ? 'Published' : 'Draft'}
                  </span>
                </>
              )}
            </div>

            <div className="flex shrink-0 gap-1 ml-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={async () => {
                  if (loading) return
                  setLoading(courseModule.id)
                  try {
                    await moveModule(courseModule.id, 'up')
                    router.refresh()
                  } catch {
                    alert('Failed to move module up')
                  } finally {
                    setLoading(null)
                  }
                }}
                disabled={!!loading || index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={async () => {
                  if (loading) return
                  setLoading(courseModule.id)
                  try {
                    await moveModule(courseModule.id, 'down')
                    router.refresh()
                  } catch {
                    alert('Failed to move module down')
                  } finally {
                    setLoading(null)
                  }
                }}
                disabled={!!loading || index === modules.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={courseModule.isPublished ? 'outline' : 'hero'}
                className={courseModule.isPublished ? cn(adminGlassOutlineButton) : 'auth-hero-cta'}
                onClick={() => handleTogglePublish(courseModule.id, courseModule.isPublished)}
                disabled={loading === courseModule.id}
              >
                {courseModule.isPublished ? (
                  <>
                    <Circle className="mr-2 h-3 w-3" />
                    Hide
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-3 w-3" />
                    Publish
                  </>
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteModule(courseModule.id, courseModule.title)}
                disabled={loading === courseModule.id}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>

          {/* Lessons List */}
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Lessons ({courseModule.lessons?.length || 0})
              </h4>
              <Button
                size="sm"
                variant="outline"
                className={cn(adminGlassOutlineButton)}
                onClick={() => setShowAddLesson(showAddLesson === courseModule.id ? null : courseModule.id)}
              >
                <Plus className="mr-2 h-3 w-3" />
                Add lesson
              </Button>
            </div>

            {/* Add Lesson Form */}
            {showAddLesson === courseModule.id && (
              <div className="mb-3 rounded-xl border border-slate-300/40 bg-white/[0.22] p-3 backdrop-blur-md dark:border-white/12 dark:bg-white/[0.08]">
                <div className="flex gap-2">
                  <Input
                    placeholder="New lesson title..."
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddLesson(courseModule.id)
                      if (e.key === 'Escape') {
                        setShowAddLesson(null)
                        setNewLessonTitle('')
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="hero"
                    className="auth-hero-cta"
                    onClick={() => handleAddLesson(courseModule.id)}
                    disabled={loading === courseModule.id}
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(adminGlassOutlineButton)}
                    onClick={() => {
                      setShowAddLesson(null)
                      setNewLessonTitle('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Lessons */}
            {!courseModule.lessons || courseModule.lessons.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No lessons in this module yet. Add the first lesson.
              </p>
            ) : (
              <div className="space-y-2">
                {courseModule.lessons?.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-3 shadow-sm backdrop-blur-md',
                      'border-slate-300/45 bg-white/[0.28] dark:border-white/12 dark:bg-white/[0.06] dark:shadow-none',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        #{lessonIndex + 1}
                      </span>
                      <span className="font-medium dark:text-gray-100">{lesson.title}</span>
                      <span
                        className={cn(
                          studentGlassPill,
                          lesson.isPublished ? 'text-emerald-800 dark:text-emerald-200' : 'opacity-90',
                        )}
                      >
                        {lesson.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/courses/${courseId}/lessons/${lesson.id}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (loading) return
                          setLoading(lesson.id)
                          try {
                            await moveLesson(lesson.id, 'up')
                            router.refresh()
                          } catch (err) {
                            alert('Failed to move lesson up')
                          } finally {
                            setLoading(null)
                          }
                        }}
                        disabled={loading === lesson.id || lessonIndex === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (loading) return
                          setLoading(lesson.id)
                          try {
                            await moveLesson(lesson.id, 'down')
                            router.refresh()
                          } catch (err) {
                            alert('Failed to move lesson down')
                          } finally {
                            setLoading(null)
                          }
                        }}
                        disabled={loading === lesson.id || lessonIndex === (courseModule.lessons?.length || 0) - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>

                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/lessons/${lesson.id}/builder`}>
                          <Edit className="mr-2 h-3 w-3" />
                          Edit
                        </Link>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                        disabled={loading === lesson.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
