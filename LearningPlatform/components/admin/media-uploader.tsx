"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MediaPicker } from './media-picker'
import { Upload } from 'lucide-react'

export function MediaUploader() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="hero" className="auth-hero-cta" onClick={() => setOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Upload media
      </Button>

      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={() => {
          setOpen(false)
          if (typeof window !== 'undefined') window.location.reload()
        }}
        filter="all"
      />
    </>
  )
}
