'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { adminGlassOutlineButton, studentGlassPill } from '@/lib/student-glass-styles'
import { Edit, Eye, Trash2 } from 'lucide-react'
import { deleteLesson } from '@/app/(admin)/admin/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Lesson {
  id: string
  title: string
  order: number
  isPublished: boolean
}

export function LessonsList({ lessons, courseSlug }: { lessons: Lesson[]; courseSlug: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return
    setLoading(id)
    try {
      await deleteLesson(id)
      router.refresh()
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert(`Failed to delete lesson: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(null)
    }
  }

  if (lessons.length === 0) {
    return <p className="py-8 text-center text-gray-500 dark:text-gray-400">No lessons yet. Add the first lesson.</p>
  }

  return (
    <div className="space-y-3">
      {lessons.map((lesson, index) => (
        <div
          key={lesson.id}
          className={cn(
            'flex items-center justify-between rounded-xl border p-4 shadow-sm backdrop-blur-md',
            'border-slate-300/45 bg-white/[0.28] dark:border-white/12 dark:bg-white/[0.06] dark:shadow-none',
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Lesson {index + 1}</span>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{lesson.title}</h3>
            <span
              className={cn(
                studentGlassPill,
                lesson.isPublished ? 'text-emerald-800 dark:text-emerald-200' : 'opacity-90',
              )}
            >
              {lesson.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className={cn(adminGlassOutlineButton)} asChild>
              <Link href={`/courses/${courseSlug}/lessons/${lesson.id}?preview=1`}>
                <Eye className="mr-2 h-3 w-3" />
                Preview
              </Link>
            </Button>

            <Button variant="hero" size="sm" className="auth-hero-cta" asChild>
              <Link href={`/admin/lessons/${lesson.id}/builder`}>
                <Edit className="mr-2 h-3 w-3" />
                Edit
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-red-300/50 text-red-700 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30"
              onClick={() => handleDelete(lesson.id)}
              disabled={loading === lesson.id}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
