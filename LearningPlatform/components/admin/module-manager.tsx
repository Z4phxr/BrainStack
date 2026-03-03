'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { createLesson } from '@/app/(admin)/admin/actions'
import { useRouter } from 'next/navigation'
import { LessonsList } from './lessons-list'
import { FormError, FieldError } from '@/components/ui/form-error'
import { ZodError } from 'zod'

interface Module {
  id: string
  title: string
  course: unknown
}

interface Lesson {
  id: string
  title: string
  order: number
  isPublished: boolean
}

interface Course {
  id: string
  title: string
  slug: string
}

export function ModuleManager({
  module: courseModule,
  lessons,
  course,
}: {
  module: Module
  lessons: Lesson[]
  course: Course
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [error, setError] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleAddLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('lessonTitle') as string,
      course: course.id,
      module: courseModule.id,
      order: lessons.length + 1,
    }

    try {
      const lesson = await createLesson(data)
      router.push(`/admin/lessons/${lesson.id}/builder`)
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
        setError(error?.message || 'Failed to add lesson')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{courseModule.title}</h1>
          <p className="text-sm text-muted-foreground">Course: {course.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lessons</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setShowAddLesson(!showAddLesson)
                setError('')
                setFieldErrors({})
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add lesson
            </Button>
          </div>
          {error && <FormError message={error} className="mb-3" />}
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddLesson && (
            <form onSubmit={handleAddLesson} className="rounded-lg border p-4">
              <Label htmlFor="lessonTitle">Lesson title</Label>
              <div className="mt-2 flex gap-2">
                <div className="flex-1">
                  <Input
                    id="lessonTitle"
                    name="lessonTitle"
                    placeholder="e.g. Working with numbers"
                    required
                  />
                  {fieldErrors.title && <FieldError message={fieldErrors.title} />}
                </div>
                <Button type="submit" disabled={loading}>
                  Add
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddLesson(false)
                    setError('')
                    setFieldErrors({})
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <LessonsList lessons={lessons} courseSlug={course.slug} />
        </CardContent>
      </Card>
    </div>
  )
}
