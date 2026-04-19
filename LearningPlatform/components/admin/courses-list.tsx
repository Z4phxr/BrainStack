'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { studentGlassPill } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'
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
  createdAt: string
  updatedAt: string
  lastUpdatedBy: string | null
  createdVia: string | null
}

function courseUpdatedByLabel(lastUpdatedBy: string | null, createdVia: string | null): string {
  const who = lastUpdatedBy?.trim()
  if (who) return who
  if (createdVia === 'import') return 'Import'
  return 'Not recorded'
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
          className={cn(
            'flex flex-col justify-between gap-4 rounded-xl border p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center',
            'border-slate-300/45 bg-white/[0.28] dark:border-white/12 dark:bg-white/[0.06] dark:shadow-none',
          )}
        >
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">{course.title}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  studentGlassPill,
                  course.isPublished ? 'text-emerald-800 dark:text-emerald-200' : 'opacity-90',
                )}
              >
                {course.isPublished ? 'Published' : 'Draft'}
              </span>
              <span className={cn(studentGlassPill, 'max-w-[14rem] truncate font-medium normal-case tracking-tight')}>
                {typeof course.subject === 'string' ? course.subject : course.subject?.name ?? '—'}
              </span>
              <span className={cn(studentGlassPill, 'uppercase')}>{course.level}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              <span>Created: {new Date(course.createdAt).toLocaleDateString('en-US')}</span>
              {course.updatedAt ? (
                <span>Updated: {new Date(course.updatedAt).toLocaleDateString('en-US')}</span>
              ) : null}
              <span>
                Updated by: {courseUpdatedByLabel(course.lastUpdatedBy, course.createdVia)}
              </span>
            </div>
          </div>

          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/25 bg-white/10 backdrop-blur-sm hover:bg-white/15 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10"
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
            
            <Button
              variant="outline"
              size="sm"
              className="border-white/25 bg-white/10 backdrop-blur-sm hover:bg-white/15 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10"
              asChild
            >
              <Link href={`/courses/${course.slug}`}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Link>
            </Button>

            <Button variant="hero" size="sm" className="auth-hero-cta" asChild>
              <Link href={`/admin/courses/${course.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-red-300/50 text-red-700 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30"
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
