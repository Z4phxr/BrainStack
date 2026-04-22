'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { X, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminGlassOutlineButton, studentGlassPill } from '@/lib/student-glass-styles'

export interface FlashcardTagOption {
  id: string
  name: string
  slug: string
  _count?: { flashcards?: number; tasks?: number }
}

function tagPopularity(tag: FlashcardTagOption): number {
  return (tag._count?.flashcards ?? 0) + (tag._count?.tasks ?? 0)
}

export interface AdminFlashcardTagPickerProps {
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
  /** When false, skip loading and outside-click handling. */
  active: boolean
  /**
   * Optional list from parent (e.g. admin page already loaded `/api/tags`).
   * Shown immediately; still refreshed in the background when `active`.
   */
  initialTags?: FlashcardTagOption[]
  /** `all` = full alphabetical quick grid (edit-style); `popular` = top 10 + expand. */
  quickPickMode?: 'popular' | 'all'
  layout?: 'dialog' | 'inline'
  searchInputId?: string
  /** Surface create-tag failures (e.g. duplicate name). */
  onTagError?: (message: string) => void
  /** Optional helper line under the "Tags" label. */
  description?: string | null
}

export function AdminFlashcardTagPicker({
  value,
  onChange,
  disabled = false,
  active,
  initialTags,
  quickPickMode = 'popular',
  layout = 'dialog',
  searchInputId = 'admin-flashcard-tag-search',
  onTagError,
  description,
}: AdminFlashcardTagPickerProps) {
  const [availableTags, setAvailableTags] = useState<FlashcardTagOption[]>(() => initialTags ?? [])
  const [tagSearchQuery, setTagSearchQuery] = useState('')
  const [tagSearchOpen, setTagSearchOpen] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const tagSearchRef = useRef<HTMLDivElement>(null)
  const [tagsLoading, setTagsLoading] = useState(false)
  const [creatingTag, setCreatingTag] = useState(false)

  useEffect(() => {
    if (!active) {
      queueMicrotask(() => setTagSearchOpen(false))
      return
    }
    if (initialTags?.length) {
      queueMicrotask(() => setAvailableTags(initialTags))
    }
    let cancelled = false
    queueMicrotask(() => setTagsLoading(true))
    void fetch('/api/tags')
      .then((r) => r.json())
      .then((data: { tags?: FlashcardTagOption[] }) => {
        if (cancelled) return
        setAvailableTags(data.tags ?? [])
      })
      .catch(() => {
        if (!cancelled && !initialTags?.length) setAvailableTags([])
      })
      .finally(() => {
        if (!cancelled) setTagsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [active, initialTags])

  useEffect(() => {
    if (!tagSearchOpen) return
    function handlePointerDown(e: MouseEvent) {
      if (tagSearchRef.current && !tagSearchRef.current.contains(e.target as Node)) {
        setTagSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [tagSearchOpen])

  const tagsSortedByPopularity = useMemo(() => {
    return [...availableTags].sort(
      (a, b) => tagPopularity(b) - tagPopularity(a) || a.name.localeCompare(b.name),
    )
  }, [availableTags])

  const quickPickTags = useMemo(() => {
    if (quickPickMode === 'all' || tagsExpanded) {
      return [...availableTags].sort((a, b) => a.name.localeCompare(b.name))
    }
    return tagsSortedByPopularity.slice(0, 10)
  }, [availableTags, quickPickMode, tagsExpanded, tagsSortedByPopularity])

  const tagSearchFiltered = useMemo(() => {
    const q = tagSearchQuery.trim().toLowerCase()
    if (!q) return []
    return availableTags
      .filter((t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 12)
  }, [availableTags, tagSearchQuery])

  const tagSearchTrimmed = tagSearchQuery.trim()
  const tagNameExistsExact =
    Boolean(tagSearchTrimmed) &&
    availableTags.some((t) => t.name.toLowerCase() === tagSearchTrimmed.toLowerCase())
  const showCreateInDropdown = Boolean(tagSearchTrimmed && !tagNameExistsExact)

  function toggleTag(id: string) {
    onChange(value.includes(id) ? value.filter((t) => t !== id) : [...value, id])
  }

  function pickTagFromSearch(tagId: string) {
    onChange(
      value.includes(tagId) ? value.filter((t) => t !== tagId) : [...value, tagId],
    )
    setTagSearchQuery('')
    setTagSearchOpen(false)
  }

  async function handleCreateTag(explicitName?: string) {
    const name = (explicitName ?? tagSearchQuery).trim()
    if (!name) return
    setCreatingTag(true)
    onTagError?.('')
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const { tag } = await res.json()
        const enriched: FlashcardTagOption = {
          ...tag,
          _count: { flashcards: 0, tasks: 0 },
        }
        setAvailableTags((prev) => [...prev, enriched].sort((a, b) => a.name.localeCompare(b.name)))
        onChange(value.includes(tag.id) ? value : [...value, tag.id])
        setTagSearchQuery('')
        setTagSearchOpen(false)
      } else if (res.status === 409) {
        const existing = availableTags.find((t) => t.name.toLowerCase() === name.toLowerCase())
        if (existing) {
          onChange(value.includes(existing.id) ? value : [...value, existing.id])
          setTagSearchQuery('')
          setTagSearchOpen(false)
        } else {
          const data = await res.json().catch(() => ({}))
          onTagError?.(
            typeof data?.error === 'string' ? data.error : 'A tag with this name already exists',
          )
        }
      } else {
        const data = await res.json().catch(() => ({}))
        onTagError?.(typeof data?.error === 'string' ? data.error : 'Failed to create tag')
      }
    } finally {
      setCreatingTag(false)
    }
  }

  const compact = layout === 'inline'
  const quickPickLabel = quickPickMode === 'all' ? 'All tags' : 'Quick pick'

  if (!active) return null

  return (
    <section className={cn(compact ? 'space-y-2' : 'space-y-0')}>
      <Label className={cn('mb-2 block font-medium text-gray-700 dark:text-gray-200', compact && 'text-sm')}>
        Tags
      </Label>
      {description ? (
        <p className="mb-2 text-xs text-muted-foreground">{description}</p>
      ) : null}

      {value.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {value.map((id) => {
            const tag = availableTags.find((t) => t.id === id)
            const label = tag?.name ?? id
            return (
              <span
                key={id}
                className={cn(
                  studentGlassPill,
                  'inline-flex items-center gap-1 normal-case tracking-tight',
                )}
              >
                {label}
                <button
                  type="button"
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-black/10 hover:text-foreground dark:hover:bg-white/15"
                  aria-label={`Remove ${label}`}
                  disabled={disabled}
                  onClick={() => toggleTag(id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )
          })}
        </div>
      ) : null}

      <div ref={tagSearchRef} className="relative">
        <Label htmlFor={searchInputId} className="sr-only">
          Search or create tags
        </Label>
        <Input
          id={searchInputId}
          value={tagSearchQuery}
          onChange={(e) => {
            setTagSearchQuery(e.target.value)
            setTagSearchOpen(true)
          }}
          onFocus={() => setTagSearchOpen(true)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            if (creatingTag || disabled) return
            if (tagSearchFiltered[0]) {
              pickTagFromSearch(tagSearchFiltered[0].id)
            } else if (showCreateInDropdown) {
              void handleCreateTag(tagSearchTrimmed)
            }
          }}
          placeholder="Search tags or type a new name…"
          className={cn(compact ? 'h-9 text-sm' : 'h-9 text-sm')}
          autoComplete="off"
          disabled={disabled || tagsLoading}
        />
        {tagSearchOpen ? (
          <div
            className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-gray-950"
            role="listbox"
          >
            {!tagSearchTrimmed ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                Type to search existing tags. If nothing matches, you can create a new tag from the list below.
              </p>
            ) : (
              <>
                {tagSearchFiltered.map((tag) => {
                  const selected = value.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      role="option"
                      className={cn(
                        'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-white/10',
                        selected && 'bg-primary/10',
                      )}
                      onClick={() => pickTagFromSearch(tag.id)}
                    >
                      <span>{tag.name}</span>
                      {selected ? <span className="text-xs text-muted-foreground">Selected</span> : null}
                    </button>
                  )
                })}
                {showCreateInDropdown ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 border-t border-slate-200 px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary/10 dark:border-white/10"
                    disabled={creatingTag || disabled}
                    onClick={() => void handleCreateTag(tagSearchTrimmed)}
                  >
                    {creatingTag ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 shrink-0" />
                    )}
                    Create &ldquo;{tagSearchTrimmed}&rdquo;
                  </button>
                ) : null}
                {tagSearchFiltered.length === 0 && !showCreateInDropdown ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground">No matching tags.</p>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>

      {tagsLoading ? (
        <p className="mt-3 text-sm text-gray-400">Loading tags…</p>
      ) : availableTags.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">No tags yet — use the field above to create one.</p>
      ) : (
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{quickPickLabel}</p>
            {quickPickMode === 'popular' && availableTags.length > 10 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(adminGlassOutlineButton, 'h-7 border-0 px-2 text-xs text-primary')}
                onClick={() => setTagsExpanded((e) => !e)}
              >
                {tagsExpanded ? 'Show fewer' : 'Show more'}
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPickTags.map((tag) => {
              const selected = value.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleTag(tag.id)}
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span
                    className={cn(
                      studentGlassPill,
                      'cursor-pointer select-none normal-case tracking-tight',
                      selected && 'ring-2 ring-primary/35',
                    )}
                  >
                    {tag.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
