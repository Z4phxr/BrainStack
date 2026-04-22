'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createTask } from '@/app/(admin)/admin/actions'
import { useRouter } from 'next/navigation'
import { X, Plus, Trash2, ImageIcon } from 'lucide-react'
import { MediaPicker } from './media-picker'
import Image from 'next/image'
import { FormError, FieldError } from '@/components/ui/form-error'
import { ZodError } from 'zod'
import { cn } from '@/lib/utils'
import { adminGlassCard, adminGlassOutlineButton } from '@/lib/student-glass-styles'

interface AddTaskDialogProps {
  open: boolean
  onClose: () => void
  lessonId?: string
  nextOrder?: number
  // Optional: when provided, the dialog will edit the existing task
  initialTask?: any
  // Optional: master tag list from parent page to avoid duplicate fetches
  masterTags?: Array<{ id: string; name: string; slug: string }>
}

export function AddTaskDialog({ open, onClose, lessonId = '', nextOrder = 1, initialTask, masterTags }: AddTaskDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [taskType, setTaskType] = useState<'MULTIPLE_CHOICE' | 'OPEN_ENDED' | 'TRUE_FALSE'>(
    'MULTIPLE_CHOICE'
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [choices, setChoices] = useState<string[]>(['', '', '', ''])
  const [error, setError] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [promptText, setPromptText] = useState<string>('')
  const [solutionText, setSolutionText] = useState<string>('')
  const [correctAnswerText, setCorrectAnswerText] = useState<string>('')
  const [pointsValue, setPointsValue] = useState<number>(1)
  const [autoGrade, setAutoGrade] = useState<boolean>(false)
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [prefillTaskTags, setPrefillTaskTags] = useState<any[] | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [newTagName, setNewTagName] = useState<string>('')
  const [_tagsLoading, setTagsLoading] = useState<boolean>(false)
  const [creatingTag, setCreatingTag] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortByUsesDesc, setSortByUsesDesc] = useState<boolean>(true)
  const [tagInputFocused, setTagInputFocused] = useState<boolean>(false)
  
  // Question media state (Payload CMS uses string UUIDs, not numbers)
  const [questionMediaId, setQuestionMediaId] = useState<string | null>(null)
  const [questionMediaUrl, setQuestionMediaUrl] = useState<string | undefined>()
  const [showQuestionMediaPicker, setShowQuestionMediaPicker] = useState(false)
  
  // Solution media state (Payload CMS uses string UUIDs, not numbers)
  const [solutionMediaId, setSolutionMediaId] = useState<string | null>(null)
  const [solutionMediaUrl, setSolutionMediaUrl] = useState<string | undefined>()
  const [showSolutionMediaPicker, setShowSolutionMediaPicker] = useState(false)

  // Prefill when editing
  useEffect(() => {
    if (initialTask) {
      queueMicrotask(() => {
        setEditingId(initialTask.id)
        setTaskType(initialTask.type || 'MULTIPLE_CHOICE')
        if (initialTask.choices) setChoices((initialTask.choices as Array<any>).map((c) => c.text || ''))
      })

      // Helper to extract plain text from Lexical-like structures
      const extractPlain = (node: any): string => {
        if (!node) return ''
        if (typeof node === 'string') return node
        const texts: string[] = []
        function walk(n: any) {
          if (!n) return
          if (typeof n === 'string') texts.push(n)
          if (n?.text) texts.push(String(n.text))
          if (Array.isArray(n?.children)) n.children.forEach(walk)
          if (Array.isArray(n?.root?.children)) n.root.children.forEach(walk)
        }
        walk(node)
        return texts.join(' ').trim()
      }

      queueMicrotask(() => {
        setPromptText(typeof initialTask.prompt === 'string' ? initialTask.prompt : extractPlain(initialTask.prompt))
        setSolutionText(typeof initialTask.solution === 'string' ? initialTask.solution : extractPlain(initialTask.solution))
      })

      // Resolve correct answer if stored as index/object
      const rawCorrect = initialTask.correctAnswer
      let resolvedCorrect = ''
      if (rawCorrect !== undefined && rawCorrect !== null) {
        if (typeof rawCorrect === 'string') resolvedCorrect = rawCorrect
        else if (typeof rawCorrect === 'number') resolvedCorrect = (initialTask.choices && initialTask.choices[rawCorrect]?.text) || ''
        else if (typeof rawCorrect === 'object') resolvedCorrect = rawCorrect.text || String(rawCorrect)
      }
      queueMicrotask(() => setCorrectAnswerText(resolvedCorrect))

      // Prefill media ids and try to build preview URLs when available
      if (initialTask.questionMedia) {
        const qm = initialTask.questionMedia
        queueMicrotask(() => setQuestionMediaId(typeof qm === 'string' ? String(qm) : String(qm?.id || '')))
        if (qm && typeof qm === 'object' && (qm.filename || qm.url)) {
          const mediaUrl = qm.filename ? `/api/media/serve/${encodeURIComponent(qm.filename)}` : qm.url
          queueMicrotask(() => setQuestionMediaUrl(mediaUrl))
        }
      }
      if (initialTask.solutionMedia) {
        const sm = initialTask.solutionMedia
        queueMicrotask(() => setSolutionMediaId(typeof sm === 'string' ? String(sm) : String(sm?.id || '')))
        if (sm && typeof sm === 'object' && (sm.filename || sm.url)) {
          const mediaUrl = sm.filename ? `/api/media/serve/${encodeURIComponent(sm.filename)}` : sm.url
          queueMicrotask(() => setSolutionMediaUrl(mediaUrl))
        }
      }

      queueMicrotask(() => setPointsValue(initialTask.points ?? 1))
      // Prefill autoGrade flag for open-ended tasks
      if (initialTask.autoGrade !== undefined) {
        queueMicrotask(() => setAutoGrade(Boolean(initialTask.autoGrade)))
      }
      // Prefill tags if present (support old format and new object format)
      if (Array.isArray(initialTask.tags)) {
        // Try to normalize embedded tag identifiers to the master tag IDs (strings).
        const ids: string[] = []
        for (const t of initialTask.tags) {
          let id: string | undefined = undefined
          if (t?.id) id = String(t.id)
          // If masterTags were passed in and we have a slug/name, try to resolve to master id
          if (!id && masterTags && t?.slug) {
            const found = masterTags.find((mt) => mt.slug === String(t.slug))
            if (found) id = String(found.id)
          }
          if (!id && masterTags && t?.name) {
            const found = masterTags.find((mt) => mt.name === String(t.name))
            if (found) id = String(found.id)
          }
          // Fallback to slug/name/string id so we can still show the tag in the picker
          if (!id) id = String(t?.slug ?? t?.tag ?? t?.name ?? '')
          if (id) ids.push(id)
        }
        queueMicrotask(() => setSelectedTagIds(ids))
        // Save embedded task tags to merge later with master list
        queueMicrotask(() => setPrefillTaskTags(initialTask.tags))
      }
    } else {
      queueMicrotask(() => {
        setEditingId(null)
        setTaskType('MULTIPLE_CHOICE')
        setChoices(['', '', '', ''])
        setQuestionMediaId(null)
        setQuestionMediaUrl(undefined)
        setSolutionMediaId(null)
        setSolutionMediaUrl(undefined)
        setPromptText('')
        setSolutionText('')
        setCorrectAnswerText('')
        setPointsValue(1)
        setSelectedTagIds([])
        setAutoGrade(false)
      })
    }
  }, [initialTask, open])

  useEffect(() => {
    // If parent passed masterTags, use them; otherwise load from API.
    if (masterTags && Array.isArray(masterTags)) {
      queueMicrotask(() =>
        setAvailableTags((prev) => {
          // merge pre-existing prev (if any) with masterTags; normalize ids to strings
          const byId = new Map<string, any>(prev.map((x) => [String(x.id), x]))
          for (const t of masterTags) byId.set(String(t.id), { ...t, id: String(t.id) })
          return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
        }),
      )
      return
    }

    // Load available tags from API for admin tag selection
    let mounted = true
    async function loadTags() {
      try {
        setTagsLoading(true)
        const res = await fetch('/api/tags')
        if (!res.ok) return
        const json = await res.json()
        if (!mounted) return
        setAvailableTags((prev) => {
          const byId = new Map(prev.map((x) => [x.id, x]))
          for (const t of (json.tags || [])) byId.set(t.id, t)
          return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
        })
      } catch {
        // ignore
      } finally {
        if (mounted) setTagsLoading(false)
      }
    }
    void loadTags()
    return () => { mounted = false }
  }, [masterTags])

  // If dialog was opened for editing and the task had embedded tags that
  // were not present in the master list, merge them into availableTags now.
  useEffect(() => {
    if (!prefillTaskTags) return
    queueMicrotask(() => {
      setAvailableTags((prev) => {
        const byId = new Map<string, any>(prev.map((x) => [String(x.id), x]))
        for (const t of prefillTaskTags) {
          const rawId = t.id ?? t.tag ?? t.name ?? t.slug
          if (!rawId) continue
          const id = String(rawId)
          if (!byId.has(id)) byId.set(id, { id, name: t.name || t.tag || t.slug || id, slug: t.slug || '' })
        }
        return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
      })
      setPrefillTaskTags(null)
    })
  }, [prefillTaskTags])

  async function handleCreateTag(nameArg?: string) {
    const name = (nameArg ?? newTagName).trim()
    if (!name) return
    setCreatingTag(true)
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const { tag } = await res.json()
        setAvailableTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)))
        setSelectedTagIds((prev) => Array.from(new Set([...prev, tag.id])))
        setNewTagName('')
      } else {
        const data = await res.json().catch(() => ({}))
        console.error('Failed to create tag', res.status, data)
        setError(data?.error || `Failed to create tag (status ${res.status})`)
      }
    } catch (err) {
      console.error('Failed to create tag', err)
      setError('Failed to create tag')
    } finally {
      setCreatingTag(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const data = {
      lesson: lessonId ? [lessonId] : undefined,
      type: taskType,
      prompt: promptText || (formData.get('prompt') as string),
      choices: taskType === 'MULTIPLE_CHOICE' ? choices.filter((c) => c.trim()) : undefined,
      correctAnswer: correctAnswerText || (formData.get('correctAnswer') as string),
      solution: solutionText || (formData.get('solution') as string),
      questionMedia: questionMediaId,
      solutionMedia: solutionMediaId,
      solutionVideoUrl: formData.get('solutionVideoUrl') as string,
      points: pointsValue || parseInt(formData.get('points') as string) || 1,
      order: nextOrder,
        autoGrade: taskType === 'OPEN_ENDED' ? autoGrade : undefined,
      tags: selectedTagIds.length > 0
        ? selectedTagIds.map((id) => {
            const t = availableTags.find((x) => x.id === id)
            return { id, name: t?.name || id, slug: t?.slug || '' }
          })
        : undefined,
    }

    try {
      if (editingId) {
        const { updateTask } = await import('@/app/(admin)/admin/actions')
        await updateTask(editingId, data as any)
      } else {
        await createTask(data as any)
      }
      onClose()
      router.refresh()
    } catch (error: any) {
      // Handle Zod validation errors
      if (error?.name === 'ZodError' || error?.issues) {
        const zodError = error as ZodError
        const fieldErrs: Record<string, string> = {}
        const errorMessages: string[] = []
        
        zodError.issues.forEach((issue) => {
          const field = issue.path[0]?.toString() || 'unknown'
          const message = issue.message
          fieldErrs[field] = message
          errorMessages.push(message)
        })
        
        setFieldErrors(fieldErrs)
        setError(errorMessages.join(', '))
      } else {
        setError(error?.message || 'Failed to add task')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={cn('flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden shadow-2xl', adminGlassCard)}>
          <div className="flex items-center justify-between p-6 border-b shrink-0">
          <h2 className="text-xl font-bold">{editingId ? 'Edit task' : 'Add task'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-6" id="task-form">
          {error && <FormError message={error} />}
          
          <div>
            <Label className="text-base font-medium">Task type</Label>
            <select
              value={taskType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTaskType(e.target.value as 'MULTIPLE_CHOICE' | 'OPEN_ENDED' | 'TRUE_FALSE')}
              className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="MULTIPLE_CHOICE">Multiple choice</option>
              <option value="OPEN_ENDED">Open-ended</option>
              <option value="TRUE_FALSE">True/False</option>
            </select>
          </div>

          {taskType === 'OPEN_ENDED' && (
            <div className="flex items-center gap-3">
              <input
                id="autoGrade"
                name="autoGrade"
                type="checkbox"
                checked={autoGrade}
                onChange={(e) => setAutoGrade(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="autoGrade" className="text-sm">Auto-grade (attempt automatic checking)</Label>
            </div>
          )}

          <div>
            <Label htmlFor="prompt" className="text-base font-medium">Task prompt *</Label>
            <textarea
              id="prompt"
              name="prompt"
              required
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="mt-3 min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Type your task prompt..."
            />
            {fieldErrors.prompt && <FieldError message={fieldErrors.prompt} />}
          </div>

          <div>
            <Label className="text-base font-medium">Image in task (optional)</Label>
            <p className="text-xs text-gray-500 mt-1 mb-2">Displayed immediately with the task</p>
            
            {questionMediaUrl ? (
              <div className="space-y-2">
                <div className="border rounded-lg overflow-hidden">
                  <div className="relative h-[200px] w-full block-bg">
                    <Image
                      src={questionMediaUrl}
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
                    onClick={() => setShowQuestionMediaPicker(true)}
                    className="flex-1"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Change image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuestionMediaId(null)
                      setQuestionMediaUrl(undefined)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowQuestionMediaPicker(true)}
                className="w-full"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Select from gallery
              </Button>
            )}
          </div>

            {taskType === 'MULTIPLE_CHOICE' && (
            <div>
              <Label className="text-base font-medium">Answers</Label>
              <div className="space-y-2 mt-3">
                {choices.map((choice, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...choices]
                        newChoices[i] = e.target.value
                        setChoices(newChoices)
                      }}
                      placeholder={`Answer ${String.fromCharCode(65 + i)}`}
                    />
                    {i >= 4 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setChoices(choices.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setChoices([...choices, ''])}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add answer
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="correctAnswer" className="text-base font-medium">Correct answer *</Label>
            {taskType === 'MULTIPLE_CHOICE' ? (
              <select
                id="correctAnswer"
                name="correctAnswer"
                required
                value={correctAnswerText}
                onChange={(e) => setCorrectAnswerText(e.target.value)}
                className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select...</option>
                {choices
                  .filter((c) => c.trim())
                  .map((choice, i) => (
                    <option key={i} value={choice}>
                      {String.fromCharCode(65 + i)}. {choice}
                    </option>
                  ))}
              </select>
            ) : taskType === 'TRUE_FALSE' ? (
              <select
                id="correctAnswer"
                name="correctAnswer"
                required
                value={correctAnswerText}
                onChange={(e) => setCorrectAnswerText(e.target.value)}
                className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select...</option>
                <option value="true">True</option>
               <option value="false">False</option>
              </select>
            ) : (
              <Input
                id="correctAnswer"
                name="correctAnswer"
                value={correctAnswerText}
                onChange={(e) => setCorrectAnswerText(e.target.value)}
                placeholder="Example correct answer (for comparison)"
                className="mt-3"
              />
            )}
          </div>

          <div>
            <Label htmlFor="solution" className="text-base font-medium">Explanation/Solution</Label>
            <textarea
              id="solution"
              name="solution"
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              className="mt-3 min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Explain why this answer is correct..."
            />
          </div>

          <div>
            <Label className="text-base font-medium">Image in solution (optional)</Label>
            <p className="text-xs text-gray-500 mt-1 mb-2">Shown ONLY AFTER clicking &apos;Show solution&apos;</p>
            
            {solutionMediaUrl ? (
              <div className="space-y-2">
                <div className="border rounded-lg overflow-hidden">
                  <div className="relative h-[200px] w-full block-bg">
                    <Image
                      src={solutionMediaUrl}
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
                    onClick={() => setShowSolutionMediaPicker(true)}
                    className="flex-1"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Change image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSolutionMediaId(null)
                      setSolutionMediaUrl(undefined)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSolutionMediaPicker(true)}
                className="w-full"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Select from gallery
              </Button>
            )}
          </div>

          <div>
            <Label htmlFor="solutionVideoUrl">YouTube video link (optional)</Label>
            <Input
              id="solutionVideoUrl"
              name="solutionVideoUrl"
              type="url"
              defaultValue={initialTask?.solutionVideoUrl ?? ''}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="points">Points</Label>
            <Input id="points" name="points" type="number" value={pointsValue} onChange={(e) => setPointsValue(Number(e.target.value || 0))} min="1" />
          </div>
          
          <div>
            <Label className="text-base font-medium">Tags</Label>
            <p className="text-xs text-gray-500 mt-1 mb-2">Select topic tags (visible in admin only).</p>
            <div className="mt-2">
              <div className="mb-2">
                  <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search or create tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setTagInputFocused(true)}
                    onBlur={() => setTimeout(() => setTagInputFocused(false), 150)}
                  />
                  {/* Create tag button for quick creation from search input */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const name = searchQuery.trim()
                      if (!name) return
                      void handleCreateTag(name)
                      setSearchQuery('')
                    }}
                    disabled={creatingTag || searchQuery.trim() === ''}
                  >
                    Create
                  </Button>
                  {/* Debug: show how many tags were loaded */}
                  <div className="text-xs text-gray-400 ml-2">{availableTags.length} tags</div>
                  {/* Show usage-sort toggle only when adding (not editing) */}
                  {!editingId && (
                    <button
                      type="button"
                      className="text-sm px-2 py-1 rounded border"
                      onClick={() => setSortByUsesDesc((s) => !s)}
                      title="Toggle sort by usage"
                    >
                      {sortByUsesDesc ? 'Uses ↓' : 'Uses ↑'}
                    </button>
                  )}
                </div>

                {/* Selected tags as chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedTagIds.map((id) => {
                    const t = availableTags.find((x) => x.id === id)
                    if (!t) return null
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedTagIds((s) => s.filter((x) => x !== id))}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/90 px-3 py-1 text-sm font-medium text-primary-foreground shadow-sm backdrop-blur-sm dark:bg-primary/80"
                      >
                        <span>{t.name}</span>
                        <span className="text-xs opacity-80">×</span>
                      </button>
                    )
                  })}
                </div>

                {/* Suggestions / create option */}
                <div className="relative mt-2">
                  {(tagInputFocused || searchQuery.trim() !== '') && (
                      <div className="absolute z-20 w-full rounded border bg-white shadow py-1">
                        {(() => {
                          const q = searchQuery.toLowerCase()
                          const matches = (q === ''
                            ? availableTags.filter((t) => !selectedTagIds.includes(t.id))
                            : availableTags.filter((t) => {
                                const n = (t.name || (t as any).title || '').toLowerCase()
                                return n.includes(q) && !selectedTagIds.includes(t.id)
                              })
                          ).sort((a, b) => {
                            const aUses = (a as any)._count?.tasks ?? (a as any)._count?.flashcards ?? 0
                            const bUses = (b as any)._count?.tasks ?? (b as any)._count?.flashcards ?? 0
                            return sortByUsesDesc ? bUses - aUses : aUses - bUses
                          })

                          if (matches.length > 0) {
                            return matches.slice(0, 10).map((t) => (
                              <div
                                key={t.id}
                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                                onMouseDown={() => setSelectedTagIds((s) => Array.from(new Set([...s, t.id])))}
                              >
                                {t.name}
                                {((t as any)._count?.tasks ?? (t as any)._count?.flashcards ?? 0) > 0 && (
                                  <span className="text-xs text-gray-500">({(t as any)._count?.tasks ?? (t as any)._count?.flashcards ?? 0})</span>
                                )}
                              </div>
                            ))
                          }

                          // No matches: show create option
                          return (
                            <div
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-blue-600"
                              onMouseDown={() => {
                                handleCreateTag(searchQuery.trim())
                                setSearchQuery('')
                              }}
                            >
                              + Create tag "{searchQuery.trim()}"
                            </div>
                          )
                        })()}
                      </div>
                    )}
                </div>

                {/* Unselected tags as chips (sorted by uses) */}
                <div className="flex flex-wrap gap-2 mt-3 max-h-40 overflow-auto">
                  {availableTags
                    .filter((t) => !selectedTagIds.includes(t.id))
                    .sort((a, b) => {
                      const aUses = (a as any)._count?.tasks ?? (a as any)._count?.flashcards ?? 0
                      const bUses = (b as any)._count?.tasks ?? (b as any)._count?.flashcards ?? 0
                      return sortByUsesDesc ? bUses - aUses : aUses - bUses
                    })
                    .map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTagIds((s) => Array.from(new Set([...s, t.id])))}
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                      >
                        <span>{t.name}</span>
                        {((t as any)._count?.tasks ?? (t as any)._count?.flashcards ?? 0) > 0 && (
                          <span className="text-xs text-gray-500">{(t as any)._count?.tasks ?? (t as any)._count?.flashcards ?? 0}</span>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
          </form>
        </div>

          <div className="flex shrink-0 gap-3 border-t border-slate-200/60 p-4 dark:border-white/10">
          <Button type="submit" form="task-form" variant="hero" className="auth-hero-cta" disabled={loading}>
            {loading ? (editingId ? 'Saving...' : 'Adding...') : (editingId ? 'Save changes' : 'Add task')}
          </Button>
          <Button type="button" variant="outline" className={cn(adminGlassOutlineButton)} onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Media Pickers */}
      <MediaPicker
        open={showQuestionMediaPicker}
        onClose={() => setShowQuestionMediaPicker(false)}
        onSelect={(media) => {
          // Always construct URL from filename (don't use media.url which may have wrong route)
          const mediaUrl = `/api/media/serve/${encodeURIComponent(media.filename || '')}`
          console.log('[add-task] Selected question media:', { id: media.id, filename: media.filename, url: mediaUrl })
          setQuestionMediaUrl(mediaUrl)
          setQuestionMediaId(media.id)
        }}
        currentMediaId={questionMediaId}
        filter="image"
      />

      <MediaPicker
        open={showSolutionMediaPicker}
        onClose={() => setShowSolutionMediaPicker(false)}
        onSelect={(media) => {
          // Always construct URL from filename (don't use media.url which may have wrong route)
          const mediaUrl = `/api/media/serve/${encodeURIComponent(media.filename || '')}`
          console.log('[add-task] Selected solution media:', { id: media.id, filename: media.filename, url: mediaUrl })
          setSolutionMediaUrl(mediaUrl)
          setSolutionMediaId(media.id)
        }}
        currentMediaId={solutionMediaId}
        filter="image"
      />
    </div>
  )
}
