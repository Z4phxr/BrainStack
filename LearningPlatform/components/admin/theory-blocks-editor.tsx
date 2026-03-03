'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, ChevronUp, ChevronDown, Type, Image as ImageIcon, Calculator, AlertCircle, Video, Table2, Plus, X, Minus } from 'lucide-react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { MediaPicker } from './media-picker'
import Image from 'next/image'

interface TextBlock {
  type: 'text'
  id: string
  content: string
}

interface ImageBlock {
  type: 'image'
  id: string
  image: string | null // Media ID (Payload uses string UUIDs)
  caption: string
  align: 'left' | 'center' | 'right'
  width: 'sm' | 'md' | 'lg' | 'full'
}

interface MathBlock {
  type: 'math'
  id: string
  latex: string
  displayMode: boolean
  note: string
}

interface CalloutBlock {
  type: 'callout'
  id: string
  variant: 'info' | 'warning' | 'tip'
  title: string
  content: string
}

interface VideoBlock {
  type: 'video'
  id: string
  videoUrl: string
  title: string
  caption: string
  aspectRatio: '16:9' | '4:3'
}

interface TableBlock {
  type: 'table'
  id: string
  caption: string
  hasHeaders: boolean
  headers: string[]
  rows: string[][]
}

type Block = TextBlock | ImageBlock | MathBlock | CalloutBlock | VideoBlock | TableBlock

interface TheoryBlocksEditorProps {
  initialBlocks?: unknown[]
  onChange: (blocks: unknown[]) => void
}

export function TheoryBlocksEditor({ initialBlocks = [], onChange }: TheoryBlocksEditorProps) {
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({}) // Cache media URLs by ID (Payload uses string UUIDs)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [currentImageBlockId, setCurrentImageBlockId] = useState<string | null>(null)
  
  // Fetch media URLs for all image blocks on mount
  useEffect(() => {
    const fetchMediaUrls = async () => {
      if (!initialBlocks || initialBlocks.length === 0) return
      
      const mediaIds: string[] = []
      initialBlocks.forEach((block: any) => {
        if (block.blockType === 'image') {
          if (typeof block.image === 'string') {
            mediaIds.push(block.image)
          } else if (block.image?.id) {
            mediaIds.push(String(block.image.id))
          }
        }
      })
      
      if (mediaIds.length === 0) return
      
      // Fetch media data for all IDs
      try {
        const response = await fetch('/api/media/list')
        const data = await response.json()
        const allMedia = data.media || []
        
        const newUrls: Record<string, string> = {}
        mediaIds.forEach(id => {
          const media = allMedia.find((m: any) => String(m.id) === String(id))
          if (media?.filename) {
            newUrls[id] = `/api/media/serve/${encodeURIComponent(media.filename)}`
          }
        })
        
        setMediaUrls(prev => ({ ...prev, ...newUrls }))
      } catch (error) {
        console.error('Failed to fetch media URLs:', error)
      }
    }
    
    fetchMediaUrls()
  }, [])
  
  const [blocks, setBlocks] = useState<Block[]>(() => {
    // Convert Payload blocks to editor format
    if (!initialBlocks || initialBlocks.length === 0) return []
    
    return initialBlocks.map((block: any, index) => {
      const id = `block-${Date.now()}-${index}`
      
      if (block.blockType === 'text') {
        // Extract text from Lexical JSON format
        let textContent = ''
        if (typeof block.content === 'string') {
          textContent = block.content
        } else if (block.content?.root?.children) {
          // Parse Lexical JSON to extract text
          textContent = block.content.root.children
            .map((child: any) => {
              if (child.children) {
                return child.children.map((c: any) => c.text || '').join('')
              }
              return child.text || ''
            })
            .join('\n')
        }
        return {
          type: 'text',
          id,
          content: textContent,
        }
      }
      
      if (block.blockType === 'image') {
        // Extract media ID from the image field (could be number or object)
        const imageId = typeof block.image === 'number' 
          ? block.image 
          : typeof block.image === 'object' && block.image?.id
          ? block.image.id
          : null
        
        // Store media URL if available
        if (imageId && typeof block.image === 'object' && block.image?.filename) {
          setMediaUrls(prev => ({ ...prev, [imageId]: `/api/media/serve/${encodeURIComponent(block.image.filename)}` }))
        }
        
        return {
          type: 'image',
          id,
          image: imageId,
          caption: block.caption || '',
          align: block.align || 'center',
          width: block.width || 'md',
        }
      }
      
      if (block.blockType === 'math') {
        return {
          type: 'math',
          id,
          latex: block.latex || '',
          displayMode: block.displayMode ?? true,
          note: block.note || '',
        }
      }
      
      if (block.blockType === 'callout') {
        // Extract text from Lexical JSON format for callout content
        let textContent = ''
        if (typeof block.content === 'string') {
          textContent = block.content
        } else if (block.content?.root?.children) {
          textContent = block.content.root.children
            .map((child: any) => {
              if (child.children) {
                return child.children.map((c: any) => c.text || '').join('')
              }
              return child.text || ''
            })
            .join('\n')
        }
        return {
          type: 'callout',
          id,
          variant: block.variant || 'info',
          title: block.title || '',
          content: textContent,
        }
      }
      
      if (block.blockType === 'video') {
        return {
          type: 'video',
          id,
          videoUrl: block.videoUrl || '',
          title: block.title || '',
          caption: block.caption || '',
          aspectRatio: block.aspectRatio || '16:9',
        }
      }
      
      if (block.blockType === 'table') {
        return {
          type: 'table',
          id,
          caption: block.caption || '',
          hasHeaders: block.hasHeaders ?? true,
          headers: Array.isArray(block.headers) ? block.headers.map(String) : ['Column 1', 'Column 2', 'Column 3'],
          rows: Array.isArray(block.rows)
            ? block.rows.map((row: unknown) =>
                Array.isArray(row) ? row.map(String) : []
              )
            : [['', '', ''], ['', '', '']],
        }
      }
      
      return {
        type: 'text',
        id,
        content: '',
      }
    })
  })

  const [mathPreview, setMathPreview] = useState<Record<string, string>>({})
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const updateBlocks = (newBlocks: Block[]) => {
    setBlocks(newBlocks)
    
    // Convert to Payload format
    const payloadBlocks = newBlocks.map((block) => {
      if (block.type === 'text') {
        return {
          blockType: 'text',
          content: {
            root: {
              type: 'root',
              children: [{
                type: 'paragraph',
                children: [{ type: 'text', text: block.content }]
              }]
            }
          }
        }
      }
      
      if (block.type === 'image') {
        return {
          blockType: 'image',
          image: block.image, // Media ID
          caption: block.caption,
          align: block.align,
          width: block.width,
        }
      }
      
      if (block.type === 'math') {
        return {
          blockType: 'math',
          latex: block.latex,
          displayMode: block.displayMode,
          note: block.note,
        }
      }
      
      if (block.type === 'callout') {
        return {
          blockType: 'callout',
          variant: block.variant,
          title: block.title,
          content: {
            root: {
              type: 'root',
              children: [{
                type: 'paragraph',
                children: [{ type: 'text', text: block.content }]
              }]
            }
          }
        }
      }
      
      if (block.type === 'video') {
        return {
          blockType: 'video',
          videoUrl: block.videoUrl,
          title: block.title,
          caption: block.caption,
          aspectRatio: block.aspectRatio,
        }
      }
      
      if (block.type === 'table') {
        return {
          blockType: 'table',
          caption: block.caption,
          hasHeaders: block.hasHeaders,
          headers: block.headers,
          rows: block.rows,
        }
      }
      
      return block
    })
    
    onChange(payloadBlocks)
  }

  const addBlock = (type: Block['type']) => {
    const id = `block-${Date.now()}`
    const newBlock: Block = (() => {
      switch (type) {
        case 'text':
          return { type: 'text', id, content: '' }
        case 'image':
          return { type: 'image', id, image: null, caption: '', align: 'center', width: 'md' }
        case 'math':
          return { type: 'math', id, latex: '', displayMode: true, note: '' }
        case 'callout':
          return { type: 'callout', id, variant: 'info', title: '', content: '' }
        case 'video':
          return { type: 'video', id, videoUrl: '', title: '', caption: '', aspectRatio: '16:9' }
        case 'table':
          return {
            type: 'table',
            id,
            caption: '',
            hasHeaders: true,
            headers: ['Column 1', 'Column 2', 'Column 3'],
            rows: [['', '', ''], ['', '', '']],
          }
      }
    })()

    const newBlocks = [...blocks, newBlock]
    updateBlocks(newBlocks)

    // Scroll the newly added block into view after render
    // small delay to allow DOM update
    setTimeout(() => {
      const el = blockRefs.current[newBlock.id]
      if (el && typeof el.scrollIntoView === 'function') {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } catch (e) {
          el.scrollIntoView()
        }
      }
    }, 60)
  }

  const removeBlock = (id: string) => {
    updateBlocks(blocks.filter(b => b.id !== id))
  }

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id)
    if (index === -1) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= blocks.length) return
    
    const newBlocks = [...blocks]
    const [moved] = newBlocks.splice(index, 1)
    newBlocks.splice(newIndex, 0, moved)
    updateBlocks(newBlocks)
  }

  const updateBlock = (id: string, updates: Partial<Block>) => {
    updateBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } as Block : b))
  }

  const renderMathPreview = (latex: string, displayMode: boolean, id: string) => {
    try {
      const html = katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
      })
      setMathPreview(prev => ({ ...prev, [id]: html }))
    } catch (e) {
      setMathPreview(prev => ({ ...prev, [id]: `Error: ${(e as Error).message}` }))
    }
  }

  // ─── Table helpers ────────────────────────────────────────────────────────

  const tableAddRow = (id: string) => {
    const block = blocks.find(b => b.id === id) as TableBlock | undefined
    if (!block) return
    const colCount = block.headers.length || 1
    updateBlock(id, { rows: [...block.rows, Array(colCount).fill('')] } as Partial<TableBlock>)
  }

  const tableRemoveRow = (id: string, rowIdx: number) => {
    const block = blocks.find(b => b.id === id) as TableBlock | undefined
    if (!block || block.rows.length <= 1) return
    updateBlock(id, { rows: block.rows.filter((_, i) => i !== rowIdx) } as Partial<TableBlock>)
  }

  const tableAddColumn = (id: string) => {
    const block = blocks.find(b => b.id === id) as TableBlock | undefined
    if (!block) return
    updateBlock(id, {
      headers: [...block.headers, `Column ${block.headers.length + 1}`],
      rows: block.rows.map(row => [...row, '']),
    } as Partial<TableBlock>)
  }

  const tableRemoveColumn = (id: string, colIdx: number) => {
    const block = blocks.find(b => b.id === id) as TableBlock | undefined
    if (!block || block.headers.length <= 1) return
    updateBlock(id, {
      headers: block.headers.filter((_, i) => i !== colIdx),
      rows: block.rows.map(row => row.filter((_, i) => i !== colIdx)),
    } as Partial<TableBlock>)
  }

  const tableUpdateCell = (id: string, rowIdx: number, colIdx: number, value: string) => {
    const block = blocks.find(b => b.id === id) as TableBlock | undefined
    if (!block) return
    const newRows = block.rows.map((row, ri) =>
      ri === rowIdx ? row.map((cell, ci) => (ci === colIdx ? value : cell)) : row
    )
    updateBlock(id, { rows: newRows } as Partial<TableBlock>)
  }

  const tableUpdateHeader = (id: string, colIdx: number, value: string) => {
    const block = blocks.find(b => b.id === id) as TableBlock | undefined
    if (!block) return
    const newHeaders = block.headers.map((h, i) => (i === colIdx ? value : h))
    updateBlock(id, { headers: newHeaders } as Partial<TableBlock>)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => addBlock('text')} variant="outline" size="sm">
          <Type className="w-4 h-4 mr-2" />
          Text
        </Button>
        <Button onClick={() => addBlock('image')} variant="outline" size="sm">
          <ImageIcon className="w-4 h-4 mr-2" />
          Image
        </Button>
        <Button onClick={() => addBlock('math')} variant="outline" size="sm">
          <Calculator className="w-4 h-4 mr-2" />
          Formula
        </Button>
        <Button onClick={() => addBlock('callout')} variant="outline" size="sm">
          <AlertCircle className="w-4 h-4 mr-2" />
          Callout
        </Button>
        <Button onClick={() => addBlock('video')} variant="outline" size="sm">
          <Video className="w-4 h-4 mr-2" />
          Video
        </Button>
        <Button onClick={() => addBlock('table')} variant="outline" size="sm">
          <Table2 className="w-4 h-4 mr-2" />
          Table
        </Button>
      </div>

      {blocks.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              No blocks yet. Add the first block above.
            </p>
          </CardContent>
        </Card>
      )}

      {blocks.map((block, index) => (
        <div key={block.id} ref={(el) => { blockRefs.current[block.id] = el }}>
          <Card>
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {block.type === 'text' && '📝 Text block'}
                {block.type === 'image' && '🖼️ Image block'}
                {block.type === 'math' && '🧮 Math formula'}
                {block.type === 'callout' && '💡 Callout'}
                {block.type === 'video' && '🎥 Video'}
                {block.type === 'table' && '📊 Table'}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveBlock(block.id, 'up')}
                  disabled={index === 0}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveBlock(block.id, 'down')}
                  disabled={index === blocks.length - 1}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBlock(block.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {block.type === 'text' && (
              <div>
                <Label>Content</Label>
                <Textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  placeholder="Enter text block content..."
                  rows={5}
                  className="mt-1"
                />
              </div>
            )}

            {block.type === 'image' && (
              <>
                <div>
                  <Label>Image</Label>
                  
                  {block.image && mediaUrls[block.image] ? (
                    <div className="space-y-2">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="relative h-[200px] w-full block-bg">
                          <Image
                            src={mediaUrls[block.image]}
                            alt="Preview"
                            unoptimized
                            fill
                            sizes="(max-width: 768px) 100vw, 720px"
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentImageBlockId(block.id)
                            setShowMediaPicker(true)
                          }}
                          className="flex-1"
                        >
                          Change image
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateBlock(block.id, { image: null })}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCurrentImageBlockId(block.id)
                        setShowMediaPicker(true)
                      }}
                      className="w-full"
                    >
                      Choose from library
                    </Button>
                  )}
                </div>
                <div>
                  <Label>Caption (optional)</Label>
                  <Input
                    value={block.caption}
                    onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                    placeholder="Image description..."
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Alignment</Label>
                    <Select
                      value={block.align}
                      onValueChange={(value: string) => updateBlock(block.id, { align: value as ImageBlock['align'] })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Width</Label>
                    <Select
                      value={block.width}
                      onValueChange={(value: string) => updateBlock(block.id, { width: value as ImageBlock['width'] })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="md">Medium</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {block.type === 'math' && (
              <>
                <div>
                  <Label>LaTeX formula</Label>
                  <Textarea
                    value={block.latex}
                    onChange={(e) => {
                      updateBlock(block.id, { latex: e.target.value })
                      renderMathPreview(e.target.value, block.displayMode, block.id)
                    }}
                    placeholder="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
                    rows={3}
                    className="mt-1 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the formula without $ or $$
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={block.displayMode}
                    onChange={(e) => {
                      updateBlock(block.id, { displayMode: e.target.checked })
                      if (block.latex) renderMathPreview(block.latex, e.target.checked, block.id)
                    }}
                    className="rounded"
                  />
                  <Label>Block display mode</Label>
                </div>
                <div>
                  <Label>Note (optional)</Label>
                  <Input
                    value={block.note}
                    onChange={(e) => updateBlock(block.id, { note: e.target.value })}
                    placeholder="e.g. Discriminant formula..."
                    className="mt-1"
                  />
                </div>
                {block.latex && mathPreview[block.id] && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                    <div 
                      className={`${block.displayMode ? 'text-center text-xl' : ''} dark:[&_.katex]:!text-gray-100 dark:[&_.katex]:![background:transparent]`}
                      dangerouslySetInnerHTML={{ __html: mathPreview[block.id] }} 
                    />
                  </div>
                )}
              </>
            )}

            {block.type === 'callout' && (
              <>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={block.variant}
                    onValueChange={(value: string) => updateBlock(block.id, { variant: value as CalloutBlock['variant'] })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">ℹ️ Info</SelectItem>
                      <SelectItem value="warning">⚠️ Warning</SelectItem>
                      <SelectItem value="tip">💡 Tip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title (optional)</Label>
                  <Input
                    value={block.title}
                    onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                    placeholder="e.g. Important"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Callout content..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </>
            )}

            {block.type === 'video' && (
              <>
                <div>
                  <Label>Video URL *</Label>
                  <Input
                    value={block.videoUrl}
                    onChange={(e) => updateBlock(block.id, { videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="mt-1"
                    type="url"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    YouTube link only
                  </p>
                </div>
                <div>
                  <Label>Aspect ratio</Label>
                  <Select
                    value={block.aspectRatio}
                    onValueChange={(value: '16:9' | '4:3') => 
                      updateBlock(block.id, { aspectRatio: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                      <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title (optional)</Label>
                  <Input
                    value={block.title}
                    onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                    placeholder="e.g. Introduction"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Caption (optional)</Label>
                  <Input
                    value={block.caption}
                    onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                    placeholder="e.g. Watch to understand the concept"
                    className="mt-1"
                  />
                </div>
                {block.videoUrl && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">URL preview:</p>
                    <p className="text-sm font-mono break-all">{block.videoUrl}</p>
                  </div>
                )}
              </>
            )}

            {block.type === 'table' && (
              <>
                {/* Caption */}
                <div>
                  <Label>Caption (optional)</Label>
                  <Input
                    value={block.caption}
                    onChange={(e) => updateBlock(block.id, { caption: e.target.value } as Partial<TableBlock>)}
                    placeholder="e.g. Algorithm complexity comparison"
                    className="mt-1"
                  />
                </div>

                {/* Has headers toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`headers-${block.id}`}
                    checked={block.hasHeaders}
                    onChange={(e) =>
                      updateBlock(block.id, { hasHeaders: e.target.checked } as Partial<TableBlock>)
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor={`headers-${block.id}`} className="cursor-pointer">
                    Column headers (first row as header)
                  </Label>
                </div>

                {/* Table grid editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Table data</Label>
                    <span className="text-xs text-muted-foreground">
                      {block.rows.length} row{block.rows.length !== 1 ? 's' : ''} ×{' '}
                      {block.headers.length} col{block.headers.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-md border border-border">
                    <table className="w-full border-collapse text-sm">
                      {/* Column header row */}
                      {block.hasHeaders && (
                        <thead>
                          <tr className="bg-muted/60 dark:bg-muted/30">
                            {/* Delete-row gutter spacer */}
                            <th className="w-8 border-r border-border" />
                            {block.headers.map((header, colIdx) => (
                              <th
                                key={colIdx}
                                className="border-r border-border p-1 font-semibold text-foreground last:border-r-0"
                              >
                                <div className="flex flex-col gap-1 min-w-[90px]">
                                  <input
                                    value={header}
                                    onChange={(e) => tableUpdateHeader(block.id, colIdx, e.target.value)}
                                    placeholder={`Column ${colIdx + 1}`}
                                    className="w-full bg-transparent border border-border rounded px-2 py-1 text-xs font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                  />
                                  {block.headers.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => tableRemoveColumn(block.id, colIdx)}
                                      title="Remove column"
                                      className="flex items-center justify-center w-full h-5 rounded text-xs text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </th>
                            ))}
                            {/* Add column button */}
                            <th className="w-10 p-1">
                              <button
                                type="button"
                                onClick={() => tableAddColumn(block.id)}
                                title="Add column"
                                className="flex items-center justify-center w-8 h-8 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </th>
                          </tr>
                        </thead>
                      )}

                      <tbody>
                        {block.rows.map((row, rowIdx) => (
                          <tr
                            key={rowIdx}
                            className="border-t border-border odd:bg-background even:bg-muted/20 dark:odd:bg-background dark:even:bg-muted/10"
                          >
                            {/* Delete row button */}
                            <td className="w-8 border-r border-border text-center align-middle p-0">
                              {block.rows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => tableRemoveRow(block.id, rowIdx)}
                                  title="Remove row"
                                  className="flex items-center justify-center mx-auto w-6 h-6 rounded text-xs text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </td>

                            {row.map((cell, colIdx) => (
                              <td
                                key={colIdx}
                                className="border-r border-border p-1 align-top last:border-r-0"
                              >
                                <textarea
                                  value={cell}
                                  onChange={(e) => tableUpdateCell(block.id, rowIdx, colIdx, e.target.value)}
                                  placeholder="Cell…"
                                  rows={2}
                                  className="w-full min-w-[90px] resize-y bg-transparent border border-border rounded px-2 py-1 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                />
                              </td>
                            ))}

                            {/* column add spacer (only when no headers shown) */}
                            {!block.hasHeaders && rowIdx === 0 && (
                              <td
                                className="w-10 p-1 align-middle text-center"
                                rowSpan={block.rows.length}
                              >
                                <button
                                  type="button"
                                  onClick={() => tableAddColumn(block.id)}
                                  title="Add column"
                                  className="flex items-center justify-center w-8 h-8 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mx-auto"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}

                        {/* Add row */}
                        <tr className="border-t border-border bg-muted/10">
                          <td
                            colSpan={block.headers.length + (!block.hasHeaders ? 2 : 2)}
                            className="p-1"
                          >
                            <button
                              type="button"
                              onClick={() => tableAddRow(block.id)}
                              className="flex items-center gap-1 px-3 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full justify-center"
                            >
                              <Plus className="w-3 h-3" />
                              Add row
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Preview hint */}
                  <p className="text-xs text-muted-foreground">
                    Cells support multi-line text. Drag the textarea corner to resize.
                  </p>
                </div>
              </>
            )}
          </CardContent>
          </Card>
        </div>
      ))}

      {/* Small centered icon-only quick-add buttons (light/dark aware) */}
      <div className="flex justify-center gap-3 mt-4">
        <Button variant="ghost" size="icon" onClick={() => addBlock('text')} title="Add text">
          <Type className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => addBlock('image')} title="Add image">
          <ImageIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => addBlock('math')} title="Add formula">
          <Calculator className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => addBlock('callout')} title="Add callout">
          <AlertCircle className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => addBlock('video')} title="Add video">
          <Video className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => addBlock('table')} title="Add table">
          <Table2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Media Picker Dialog */}
      <MediaPicker
        open={showMediaPicker}
        onClose={() => {
          setShowMediaPicker(false)
          setCurrentImageBlockId(null)
        }}
        onSelect={(media) => {
          if (currentImageBlockId) {
            // Set media URL and update block immediately
            const mediaUrl = media.url || `/api/media/serve/${encodeURIComponent(media.filename || '')}`
            setMediaUrls(prev => ({ ...prev, [media.id]: mediaUrl }))
            updateBlock(currentImageBlockId, { image: media.id })
          }
        }}
        currentMediaId={
          currentImageBlockId 
            ? (blocks.find(b => b.id === currentImageBlockId && b.type === 'image') as ImageBlock)?.image 
            : null
        }
        filter="image"
      />
    </div>
  )
}
