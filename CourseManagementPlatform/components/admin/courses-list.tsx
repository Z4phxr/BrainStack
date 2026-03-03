'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Edit, Eye, Trash2, CheckCircle, Circle } from 'lucide-react'
import { toggleCoursePublish, deleteCourse } from '@/app/(admin)/admin/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Course {
  id: string
  title: string
  slug: string
  subject: string | { id?: string | number; name?: string }
  level: string
  isPublished: boolean
  updatedAt: string
}

export function CoursesList({ courses }: { courses: Course[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleTogglePublish = async (id: string, currentState: boolean) => {
    setLoading(id)
    try {
      await toggleCoursePublish(id, !currentState)
      router.refresh()
    } catch (error) {
      console.error('Error toggling publish:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    const confirmMessage = `⚠️ WARNING!\n\nDeleting the course "${title}" will also:\n- Delete all modules\n- Delete all lessons\n- Delete all tasks\n\nThis action CANNOT be undone!\n\nAre you sure you want to continue?`
    
    if (!confirm(confirmMessage)) return
    
    setLoading(id)
    try {
      await deleteCourse(id)
      router.refresh()
      alert('Course successfully deleted with all related modules, lessons, and tasks.')
    } catch (error) {
      console.error('Error deleting course:', error)
      alert(`Failed to delete course: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(null)
    }
  }

  if (courses.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No courses yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <div
          key={course.id}
          className="flex items-center justify-between rounded-lg border dark:border-gray-700 p-4 hover:shadow-sm"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{course.title}</h3>
              <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                {course.isPublished ? 'Published' : 'Draft'}
              </Badge>
              <Badge variant="outline">{typeof course.subject === 'string' ? course.subject : course.subject?.name ?? '—'}</Badge>
              <Badge variant="outline">{course.level}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date(course.updatedAt).toLocaleDateString('en-US')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTogglePublish(course.id, course.isPublished)}
              disabled={loading === course.id}
            >
              {course.isPublished ? (
                <>
                  <Circle className="mr-2 h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Publish
                </>
              )}
            </Button>
            
            <Button variant="outline" size="sm" asChild>
              <Link href={`/courses/${course.slug}`}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Link>
            </Button>
            
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/courses/${course.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(course.id, course.title)}
              disabled={loading === course.id}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
