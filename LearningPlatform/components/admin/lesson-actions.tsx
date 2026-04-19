'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { deleteLesson, toggleLessonPublish } from '@/app/(admin)/admin/actions'
import { cn } from '@/lib/utils'
import { adminGlassOutlineButton } from '@/lib/student-glass-styles'

interface LessonActionsProps {
  lessonId: string | number
  lessonTitle: string
  isPublished: boolean
}

export function LessonActions({ lessonId, lessonTitle, isPublished }: LessonActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handlePublishToggle = async () => {
    setLoading(true)
    try {
      await toggleLessonPublish(String(lessonId), !isPublished)
      router.refresh()
    } catch (error) {
      alert('Failed to update: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete lesson "${lessonTitle}"?`)) return
    
    setLoading(true)
    try {
      await deleteLesson(String(lessonId))
      router.refresh()
    } catch (error) {
      alert('Failed to delete: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="hero" size="sm" className="auth-hero-cta" asChild>
        <Link href={`/admin/lessons/${lessonId}/builder`}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={cn(adminGlassOutlineButton)}
        onClick={handlePublishToggle}
        disabled={loading}
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="border-red-300/50 text-red-700 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30"
        onClick={handleDelete}
        disabled={loading}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
