"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MediaPicker } from './media-picker'

export function MediaUploader() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="ml-4">
        Upload media
      </Button>

      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={() => {
          // After upload/select, refresh the page to show new media in the server-rendered list
          setOpen(false)
          if (typeof window !== 'undefined') window.location.reload()
        }}
        filter="all"
      />
    </>
  )
}
