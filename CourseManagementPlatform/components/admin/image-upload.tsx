'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Loader2, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  onUpload: (mediaId: number, url: string) => void
  currentMediaId?: number | null
  currentUrl?: string
  onClear?: () => void
}

export function ImageUpload({ onUpload, currentMediaId, currentUrl, onClear }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  void currentMediaId

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type (only images)
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large (max 5MB)')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onUpload(data.id, data.url)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Label htmlFor="image-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 h-9 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">Select image (max 5MB)</span>
                </>
              )}
            </div>
          </Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </div>

        {currentUrl && onClear && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClear}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {currentUrl && (
        <div className="mt-3 border rounded-lg overflow-hidden">
          <div className="relative h-[200px] w-full block-bg">
            <Image
              src={currentUrl}
              alt="Preview"
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-contain"
            />
          </div>
          <div className="p-2 block-bg text-xs text-gray-600 truncate">
            {currentUrl}
          </div>
        </div>
      )}
    </div>
  )
}
