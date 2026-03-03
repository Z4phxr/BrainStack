'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteMedia } from '@/app/(admin)/admin/actions'

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
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      title="Delete"
    >
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  )
}
