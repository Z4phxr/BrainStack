'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { updateLesson, deleteLesson, toggleLessonPublish } from '@/app/(admin)/admin/actions'

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
    <div className="flex gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/lessons/${lessonId}/builder`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Link>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePublishToggle}
        disabled={loading}
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </Button>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={handleDelete}
        disabled={loading}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
