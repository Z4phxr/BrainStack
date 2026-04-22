'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// tabs removed: consolidate upload + browse into single view
import { X, Search, Upload, Loader2, Image as ImageIcon, Video, Check } from 'lucide-react'
import { adminGlassCard, adminGlassOutlineButton } from '@/lib/student-glass-styles'

interface Media {
  id: string  // Payload CMS uses varchar UUIDs, not integers
  filename: string
  url: string
  mimeType: string
  alt?: string
  filesize?: number
  createdAt: string
}

interface MediaPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (media: { id: string; url: string; alt?: string; filename?: string }) => void
  currentMediaId?: string | number | null  // Accept both for backward compatibility
  filter?: 'image' | 'video' | 'all'
}

export function MediaPicker({ open, onClose, onSelect, currentMediaId, filter = 'all' }: MediaPickerProps) {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse')
  const [selectedId, setSelectedId] = useState<string | null>(currentMediaId ? String(currentMediaId) : null)
  
  // Upload state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function fetchMedia() {
    try {
      setLoading(true)
      const response = await fetch('/api/media/list')
      if (!response.ok) throw new Error('Failed to fetch media')
      const data = await response.json()
      setMedia(data.media || [])
    } catch (error) {
      setMedia([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => {
      void fetchMedia()
      setSelectedId(currentMediaId ? String(currentMediaId) : null)
    }, 0)
    return () => window.clearTimeout(t)
  }, [open, currentMediaId])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (filter === 'image' && !isImage) {
      setUploadError('Please select an image file')
      return
    }
    if (filter === 'video' && !isVideo) {
      setUploadError('Please select a video file')
      return
    }
    if (filter === 'all' && !isImage && !isVideo) {
      setUploadError('Please select an image or video')
      return
    }

    // Validate file size (max 10MB for images, 50MB for videos)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError(`File is too large (max ${isVideo ? '50' : '10'}MB)`)
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      
      // Refresh media list
      await fetchMedia()
      
      // Auto-select uploaded media
      setSelectedId(data.id)
      setActiveTab('browse')
    } catch (err) {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleSelect = () => {
    const selected = media.find(m => m.id === selectedId)
    if (selected) {
      onSelect({
          id: selected.id,
          url: `/api/media/serve/${encodeURIComponent(selected.filename)}`,
          alt: selected.alt,
          filename: selected.filename,
        })
      onClose()
    }
  }

  const filteredMedia = media.filter(m => {
    // Apply filter
    if (filter === 'image' && !m.mimeType.startsWith('image/')) return false
    if (filter === 'video' && !m.mimeType.startsWith('video/')) return false
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        m.filename.toLowerCase().includes(query) ||
        m.alt?.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
      !open && "hidden"
    )}>
      <div className={cn('flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden shadow-2xl', adminGlassCard)}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Select media</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="mb-4 mt-4 px-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Media Grid with upload tile first */}
          <div className="flex-1 overflow-y-auto pb-8 px-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 pb-4">
                {/* Upload tile as first item */}
                <div className="cursor-pointer rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <Label htmlFor="file-upload" className="w-full h-full cursor-pointer flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 p-6 text-center">
                      {uploading ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <span className="text-sm font-medium text-primary">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <div className="rounded-full border border-primary/25 bg-primary/10 p-3 backdrop-blur-sm dark:bg-primary/15">
                            <Upload className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Click to select file</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">or drag and drop</p>
                          </div>
                        </>
                      )}
                    </div>
                  </Label>
                </div>

                {filteredMedia.map((item) => {
                  const isImage = item.mimeType.startsWith('image/')
                  const isVideo = item.mimeType.startsWith('video/')
                  const isSelected = selectedId === item.id

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        'relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:shadow-lg group',
                        isSelected
                          ? 'border-primary ring-2 ring-primary/25'
                          : 'border-slate-300/50 hover:border-primary/40 dark:border-white/15'
                      )}
                    >
                      {/* Preview */}
                      <div className="relative flex aspect-square items-center justify-center bg-slate-100/80 dark:bg-black/40">
                        {isImage && (
                          <Image
                            src={`/api/media/serve/${encodeURIComponent(item.filename)}`}
                            alt={item.alt || item.filename}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover"
                          />
                        )}
                        {isVideo && (
                          <div className="relative w-full h-full bg-black flex items-center justify-center">
                            <Video className="h-12 w-12 text-white opacity-80" />
                          </div>
                        )}

                        {/* Selected badge only (no opaque overlay) */}
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="rounded-full bg-primary p-1 shadow-md">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}

                        {/* Type badge */}
                        <Badge 
                          variant="secondary" 
                          className="absolute top-2 left-2 text-xs"
                        >
                          {isImage ? '🖼️' : '🎥'}
                        </Badge>
                      </div>

                      {/* Info */}
                      <div className="border-t border-white/20 bg-white/[0.15] p-2 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.06]">
                        <p className="text-xs font-medium truncate" title={item.filename}>
                          {item.filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(item.filesize)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t pb-6">
            <Button variant="outline" onClick={onClose} className={cn(adminGlassOutlineButton)}>
              Cancel
            </Button>
            <Button onClick={handleSelect} disabled={!selectedId} variant="hero" className="auth-hero-cta">
              Select
            </Button>
          </div>

          {/* Hidden file input used by the upload tile */}
          <Input
            id="file-upload"
            type="file"
            accept={
              filter === 'image' ? 'image/*' :
              filter === 'video' ? 'video/*' :
              'image/*,video/*'
            }
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </div>
      </div>
    </div>
  )
}
