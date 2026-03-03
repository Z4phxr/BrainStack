'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { updateCourse, createCourse, createModule, toggleCoursePublish, deleteCourse } from '@/app/(admin)/admin/actions'
import { useRouter } from 'next/navigation'
import { ModulesList } from './modules-list'
import { FormError, FieldError } from '@/components/ui/form-error'
import { ZodError } from 'zod'

interface Course {
  id: string
  title: string
  slug: string
  description?: string
  subject: string | { id?: string | number; name?: string }
  level: string
  isPublished: boolean
  topics?: string[]
}

interface Module {
  id: string
  title: string
  order: number
  isPublished: boolean
  lessons?: Lesson[]
}

interface Lesson {
  id: string
  title: string
  order: number
  isPublished: boolean
}

export function CourseEditor({ course, modules }: { course: Course; modules: Module[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showAddModule, setShowAddModule] = useState(false)
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([])
  const [subjectName, setSubjectName] = useState<string | null>(null)
  const [courseError, setCourseError] = useState<string>('')
  const [courseFieldErrors, setCourseFieldErrors] = useState<Record<string, string>>({})
  const [moduleError, setModuleError] = useState<string>('')
  const [moduleFieldErrors, setModuleFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    let isMounted = true
    const fetchSubjects = async () => {
      try {
        const res = await fetch('/api/subjects')
        if (!res.ok) return
        const data = await res.json()
        if (isMounted && Array.isArray(data.subjects)) {
          setSubjects(data.subjects)
          const subjectId = course.subject && typeof course.subject === 'object' ? String((course.subject as any).id) : String(course.subject)
          const found = data.subjects.find((s: any) => String(s.id) === subjectId)
          setSubjectName(found ? found.name : null)
        }
      } catch {
        if (isMounted) setSubjects([])
      }
    }
    void fetchSubjects()
    return () => {
      isMounted = false
    }
  }, [])


  const handleUpdateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setCourseError('')
    setCourseFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const data: any = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      subject: formData.get('subject') as string || undefined,
      level: (formData.get('level') as string) || undefined,
    }

    try {
      // If this editor is for a new (unsaved) course, call createCourse instead
      if (course.id === 'new') {
        // Ensure required fields for creation: slug and level
        const title = (data.title || '').trim()
        const slugFromTitle = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `untitled-${Date.now()}`
        const createPayload = {
          ...data,
          slug: slugFromTitle,
          level: data.level || 'BEGINNER',
        }

        const created = await createCourse(createPayload)
        const newId = created?.id || (created?.course && created.course.id)
        if (newId) {
          // Navigate to the canonical edit page for further editing
          router.push(`/admin/courses/${String(newId)}/edit`)
          return
        }
        // If no id returned, show fallback
        setCourseError('Course created but no id returned')
      } else {
        await updateCourse(course.id, data)
        alert('Course updated!')
        router.refresh()
      }
    } catch (error: any) {
      // Handle Zod validation errors
      if (error?.name === 'ZodError' || error?.issues) {
        const zodError = error as ZodError
        const fieldErrors: Record<string, string> = {}
        const errorMessages: string[] = []
        
        zodError.issues.forEach((issue) => {
          const field = issue.path[0]?.toString() || 'unknown'
          const message = issue.message
          fieldErrors[field] = message
          errorMessages.push(message)
        })
        
        setCourseFieldErrors(fieldErrors)
        setCourseError(errorMessages.join(', '))
      } else {
        setCourseError(error?.message || 'Failed to save course')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddModule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setModuleError('')
    setModuleFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('moduleTitle') as string,
      course: course.id,
      order: modules.length + 1,
    }

    try {
      await createModule(data)
      setShowAddModule(false)
      router.refresh()
    } catch (error: any) {
      // Handle Zod validation errors
      if (error?.name === 'ZodError' || error?.issues) {
        const zodError = error as ZodError
        const fieldErrors: Record<string, string> = {}
        const errorMessages: string[] = []
        
        zodError.issues.forEach((issue) => {
          const field = issue.path[0]?.toString() || 'unknown'
          const message = issue.message
          fieldErrors[field] = message
          errorMessages.push(message)
        })
        
        setModuleFieldErrors(fieldErrors)
        setModuleError(errorMessages.join(', '))
      } else {
        setModuleError(error?.message || 'Failed to add module')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{course.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">Edit course and manage modules</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="text-red-600 hover:text-red-700 dark:text-red-400"
          onClick={async () => {
            if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return
            setLoading(true)
            try {
              await deleteCourse(course.id)
              router.push('/admin/dashboard')
              router.refresh()
            } catch {
              alert('Failed to delete course')
              setLoading(false)
            }
          }}
          disabled={loading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete course
        </Button>
      </div>

      {/* Course Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateCourse} className="space-y-6">
            {courseError && <FormError message={courseError} />}
            
            <div>
              <Label htmlFor="title" className="text-base font-medium">Title</Label>
              <Input id="title" name="title" defaultValue={course.title} className="mt-3" />
              {courseFieldErrors.title && <FieldError message={courseFieldErrors.title} />}
            </div>
            <div>
              <Label htmlFor="description" className="text-base font-medium">Description</Label>
              <textarea
                id="description"
                name="description"
                defaultValue={course.description}
                className="mt-3 min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              {courseFieldErrors.description && <FieldError message={courseFieldErrors.description} />}
            </div>
            <div>
              <Label htmlFor="subject" className="text-base font-medium">Subject</Label>
              <select 
                id="subject" 
                name="subject" 
                defaultValue={typeof course.subject === 'object' ? String((course.subject as any)?.id) : String(course.subject)} 
                className="mt-3 block w-full rounded-md border border-input bg-background p-2 text-sm"
              >
                <option value="">Select a subject</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {courseFieldErrors.subject && <FieldError message={courseFieldErrors.subject} />}
            </div>
            <div>
              <Label htmlFor="level" className="text-base font-medium">Level</Label>
              <select
                id="level"
                name="level"
                defaultValue={course.level || 'BEGINNER'}
                className="mt-3 block w-full rounded-md border border-input bg-background p-2 text-sm"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
              {courseFieldErrors.level && <FieldError message={courseFieldErrors.level} />}
            </div>
            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant={course.isPublished ? "outline" : "default"}
                className="flex-1"
                onClick={async () => {
                  setLoading(true)
                  try {
                    await toggleCoursePublish(course.id, !course.isPublished)
                    router.refresh()
                  } catch {
                    alert('Failed to toggle publish')
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                {course.isPublished ? 'Unpublish' : 'Publish'}
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Modules ({modules.length})</CardTitle>
            <Button onClick={() => setShowAddModule(!showAddModule)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add module
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddModule && (
            <form onSubmit={handleAddModule} className="rounded-lg border dark:border-gray-700 block-bg p-4 space-y-4">
              {moduleError && <FormError message={moduleError} />}
              
              <div>
                <Label htmlFor="moduleTitle" className="text-base font-medium">Module title</Label>
                <Input
                  id="moduleTitle"
                  name="moduleTitle"
                  placeholder="e.g. Foundational concepts"
                  required
                  className="mt-3"
                />
                {moduleFieldErrors.title && <FieldError message={moduleFieldErrors.title} />}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  Add
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModule(false)
                    setModuleError('')
                    setModuleFieldErrors({})
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <ModulesList modules={modules} courseId={course.id} />
        </CardContent>
      </Card>
    </div>
  )
}
