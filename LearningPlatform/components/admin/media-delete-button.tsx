'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteMedia } from '@/app/(admin)/admin/actions'
import { cn } from '@/lib/utils'
import { adminGlassOutlineButton } from '@/lib/student-glass-styles'

interface MediaDeleteButtonProps {
  mediaId: string | number
  filename: string
  usageCount: number
}

export function MediaDeleteButton({ mediaId, filename, usageCount }: MediaDeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    const warning = usageCount > 0
      ? `This file is currently used in ${usageCount} place${usageCount === 1 ? '' : 's'}. Deleting it may break lessons or tasks.\n\nDelete "${filename}" anyway?`
      : `Delete "${filename}"?`

    if (!confirm(warning)) return

    setLoading(true)
    try {
      await deleteMedia(String(mediaId))
      router.refresh()
    } catch (error) {
      alert(`Failed to delete media: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        adminGlassOutlineButton,
        'border-red-300/50 text-red-700 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30',
      )}
      onClick={handleDelete}
      disabled={loading}
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
