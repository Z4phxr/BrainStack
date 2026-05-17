'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import { countUnusedMedia, deleteAllUnusedMedia } from '@/app/(admin)/admin/actions'
import { cn } from '@/lib/utils'
import { adminGlassOutlineButton } from '@/lib/student-glass-styles'

export function MediaDeleteUnusedButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDeleteAllUnused = async () => {
    setLoading(true)
    try {
      const count = await countUnusedMedia()
      if (count === 0) {
        alert('No unused files to delete.')
        return
      }

      const confirmed = confirm(
        `Delete ${count} unused file${count === 1 ? '' : 's'} from the media library?\n\nThis only removes files not linked to lessons, tasks, course covers, or flashcards. This cannot be undone.`,
      )
      if (!confirmed) return

      const { deleted } = await deleteAllUnusedMedia()
      router.refresh()
      alert(deleted === 0 ? 'No unused files were deleted.' : `Deleted ${deleted} unused file${deleted === 1 ? '' : 's'}.`)
    } catch (error) {
      alert(`Failed to delete unused media: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        adminGlassOutlineButton,
        'border-red-300/50 text-red-700 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30',
      )}
      onClick={() => void handleDeleteAllUnused()}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="mr-2 h-4 w-4" />
      )}
      Delete all unused
    </Button>
  )
}
