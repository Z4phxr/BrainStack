'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Loader2,
  Tag as TagIcon,
  Pencil,
  Trash2,
  Check,
  X,
  ArrowUpAZ,
  ArrowDownAZ,
  ArrowUp01,
  ArrowDown01,
  Search,
  Star,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MasterTag {
  id: string
  name: string
  slug: string
  main: boolean
  _count?: { tasks?: number; flashcards?: number }
}

type SortKey = 'name-asc' | 'name-desc' | 'count-asc' | 'count-desc'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── Pill with inline edit/delete ────────────────────────────────────────────

function TagPill({
  tag,
  taskCount,
  onDelete,
  onRename,
  onToggleMain,
}: {
  tag: MasterTag
  taskCount: number
  onDelete: (tag: MasterTag) => void
  onRename: (tag: MasterTag, newName: string) => Promise<void>
  onToggleMain: (tag: MasterTag) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(tag.name)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setValue(tag.name)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 30)
  }

  function cancelEdit() {
    setValue(tag.name)
    setEditing(false)
  }

  async function commitEdit() {
    const trimmed = value.trim()
    if (!trimmed || trimmed === tag.name) { cancelEdit(); return }
    setSaving(true)
    try {
      await onRename(tag, trimmed)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); void commitEdit() }
    if (e.key === 'Escape') cancelEdit()
  }

  const pillBase =
    'inline-flex items-center gap-0 rounded-full border border-blue-200 bg-blue-50 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300'

  if (editing) {
    return (
      <div className={`${pillBase} overflow-hidden pr-0.5`}>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={saving}
          className="min-w-0 w-40 bg-transparent px-3 py-1 text-sm outline-none"
        />
        <button
          type="button"
          onClick={() => void commitEdit()}
          disabled={saving}
          className="flex h-8 w-8 items-center justify-center border-l border-blue-200 bg-blue-100 text-blue-700 hover:bg-green-100 hover:text-green-700 dark:border-blue-700 dark:bg-blue-900/50 dark:hover:bg-green-900/30"
          title="Save"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={cancelEdit}
          disabled={saving}
          className="flex h-8 w-8 items-center justify-center rounded-r-full border-l border-blue-200 bg-blue-50 text-blue-500 hover:bg-red-100 hover:text-red-600 dark:border-blue-700 dark:bg-blue-900/30 dark:hover:bg-red-900/30"
          title="Cancel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className={`${pillBase} overflow-hidden`}>
      {/* Name + count area */}
      <span className="flex items-center gap-2 px-3 py-1">
        <span className="max-w-[32rem] truncate">{tag.name}</span>
        <span className="rounded-full bg-blue-200/60 px-1.5 text-xs text-blue-800 dark:bg-blue-800/60 dark:text-blue-200">
          {taskCount}
        </span>
      </span>

      {/* Star button for main toggle */}
      <button
        type="button"
        onClick={() => void onToggleMain(tag)}
        title={tag.main ? 'Remove from main tags' : 'Add to main tags'}
        className={`flex h-8 w-8 items-center justify-center border-l border-blue-200 transition-colors dark:border-blue-700 ${
          tag.main
            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50'
            : 'bg-blue-50 text-gray-400 hover:bg-blue-100 hover:text-yellow-500 dark:bg-blue-900/30 dark:hover:bg-blue-900/50'
        }`}
      >
        <Star className={`h-3.5 w-3.5 ${tag.main ? 'fill-current' : ''}`} />
      </button>

      {/* Edit button */}
      <button
        type="button"
        onClick={startEdit}
        title="Rename tag"
        className="flex h-8 w-8 items-center justify-center border-l border-blue-200 bg-blue-50 text-blue-500 transition-colors hover:bg-blue-100 hover:text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onDelete(tag)}
        title="Delete tag"
        className="flex h-8 w-8 items-center justify-center rounded-r-full border-l border-blue-200 bg-blue-50 text-blue-500 transition-colors hover:bg-destructive hover:text-white dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTagsPage() {
  const [tags, setTags] = useState<MasterTag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search
  const [search, setSearch] = useState('')

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('name-asc')

  // Create form
  const [creating, setCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [createError, setCreateError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<MasterTag | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Add to main dialog state
  const [showAddMainDialog, setShowAddMainDialog] = useState(false)
  const [mainDialogSearch, setMainDialogSearch] = useState('')
  const [addingMain, setAddingMain] = useState(false)

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/tags')
      if (!res.ok) throw new Error('Failed to load tags')
      const data = await res.json()
      setTags(data.tags ?? [])
    } catch {
      setError('Could not load tags. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchTags() }, [fetchTags])

  // ── Derive task counts ────────────────────────────────────────────────────────

  const taskCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const t of tags) {
      m.set(t.id, t._count?.tasks ?? 0)
    }
    return m
  }, [tags])

  // ── Filtered + sorted display list ─────────────────────────────────────────────

  const { mainTags, otherTags } = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q ? tags.filter((t) => t.name.toLowerCase().includes(q)) : [...tags]

    const sortFn = (a: MasterTag, b: MasterTag) => {
      if (sortKey === 'name-asc') return a.name.localeCompare(b.name)
      if (sortKey === 'name-desc') return b.name.localeCompare(a.name)
      const ca = taskCounts.get(a.id) ?? 0
      const cb = taskCounts.get(b.id) ?? 0
      if (sortKey === 'count-asc') return ca === cb ? a.name.localeCompare(b.name) : ca - cb
      // count-desc
      return ca === cb ? a.name.localeCompare(b.name) : cb - ca
    }

    const main = filtered.filter((t) => t.main).sort(sortFn)
    const other = filtered.filter((t) => !t.main).sort(sortFn)

    return { mainTags: main, otherTags: other }
  }, [tags, search, sortKey, taskCounts])

  const displayTags = useMemo(() => [...mainTags, ...otherTags], [mainTags, otherTags])

  // ── Create ────────────────────────────────────────────────────────────────────

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const name = newTagName.trim()
    if (!name) { setCreateError('Tag name is required'); return }
    setCreateLoading(true)
    setCreateError('')
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug: slugify(name) }),
      })
      const data = await res.json()
      if (!res.ok) { setCreateError(data.error ?? 'Failed to create tag'); return }
      setNewTagName('')
      setCreating(false)
      await fetchTags()
    } catch {
      setCreateError('Failed to create tag')
    } finally {
      setCreateLoading(false)
    }
  }

  // ── Rename ────────────────────────────────────────────────────────────────────

  async function handleRename(tag: MasterTag, newName: string) {
    const res = await fetch(`/api/tags/${tag.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error ?? 'Failed to rename tag')
      return
    }
    await fetchTags()
  }

  // ── Delete ────────────────────────────────────────────────────────────────────

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/tags/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setDeleteTarget(null)
      await fetchTags()
    } catch {
      alert('Failed to delete tag — check server logs')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Toggle main status ─────────────────────────────────────────────────────────

  async function handleToggleMain(tag: MasterTag) {
    // Optimistic update: flip locally first for snappy UI, then persist.
    const previous = tags
    setTags((cur) => cur.map((t) => (t.id === tag.id ? { ...t, main: !t.main } : t)))
    try {
      const res = await fetch(`/api/tags/${tag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ main: !tag.main }),
      })
      if (!res.ok) throw new Error('Failed to toggle main')
      const data = await res.json()
      // Reconcile with server-returned tag (keeps counts/fields in sync)
      if (data?.tag) {
        setTags((cur) => cur.map((t) => (t.id === data.tag.id ? data.tag : t)))
      }
    } catch {
      // Rollback on error
      setTags(previous)
      alert('Failed to update tag')
    }
  }

  // ── Add tags to main (from dialog) ─────────────────────────────────────────────

  async function handleAddToMain(tagId: string) {
    setAddingMain(true)
    // Optimistic: mark locally first
    const previous = tags
    setTags((cur) => cur.map((t) => (t.id === tagId ? { ...t, main: true } : t)))
    try {
      const res = await fetch(`/api/tags/${tagId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ main: true }),
      })
      if (!res.ok) throw new Error('Failed to add to main')
      const data = await res.json()
      if (data?.tag) setTags((cur) => cur.map((t) => (t.id === data.tag.id ? data.tag : t)))
      setMainDialogSearch('')
      setShowAddMainDialog(false)
    } catch {
      setTags(previous)
      alert('Failed to add tag to main')
    } finally {
      setAddingMain(false)
    }
  }

  // ── Sort button helper ────────────────────────────────────────────────────────

  const sortButtons: Array<{ key: SortKey; icon: React.ReactNode; title: string }> = [
    { key: 'name-asc',   icon: <ArrowUpAZ   className="h-4 w-4" />, title: 'A → Z' },
    { key: 'name-desc',  icon: <ArrowDownAZ className="h-4 w-4" />, title: 'Z → A' },
    { key: 'count-desc', icon: <ArrowDown01 className="h-4 w-4" />, title: 'Most used first' },
    { key: 'count-asc',  icon: <ArrowUp01   className="h-4 w-4" />, title: 'Least used first' },
  ]

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage tags used to organise tasks and flashcards.
          </p>
        </div>
        <Button onClick={() => { setCreating(true); setCreateError(''); setNewTagName('') }}>
          <Plus className="mr-2 h-4 w-4" />
          New Tag
        </Button>
      </div>

      {/* ── Create form ───────────────────────────────────────────────────────── */}
      {creating && (
        <form
          onSubmit={(e) => void handleCreate(e)}
          className="flex flex-wrap items-end gap-3 rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="new-tag-name" className="text-xs font-medium text-gray-500">
              Tag name
            </label>
            <Input
              id="new-tag-name"
              value={newTagName}
              onChange={(e) => { setNewTagName(e.target.value); setCreateError('') }}
              placeholder="e.g. algorytmy"
              className="h-8 w-64 text-sm"
              autoFocus
            />
            {createError && <p className="text-xs text-red-500">{createError}</p>}
          </div>
          <Button type="submit" size="sm" disabled={createLoading}>
            {createLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-2 h-3.5 w-3.5" />}
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => { setCreating(false); setCreateError(''); setNewTagName('') }}
          >
            Cancel
          </Button>
        </form>
      )}

      {/* ── Toolbar: search + sort ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute inset-y-0 left-2.5 my-auto h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags…"
            className="h-9 w-64 pl-8 text-sm"
          />
        </div>

        {/* Sort toggle buttons */}
        <div className="flex items-center gap-1">
          <span className="mr-1 text-xs text-gray-400">Sort:</span>
          {sortButtons.map(({ key, icon, title }) => (
            <button
              key={key}
              type="button"
              title={title}
              onClick={() => setSortKey(key)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors ${
                sortKey === key
                  ? 'border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      {!loading && (
        <p className="text-sm text-gray-500">
          {displayTags.length} {displayTags.length === 1 ? 'tag' : 'tags'}
          {search && ` matching "${search}"`}
          {' '}out of {tags.length} total
        </p>
      )}

      {/* ── Error ────────────────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ── Loading ──────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading tags…
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────────── */}
      {!loading && displayTags.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <TagIcon className="mb-4 h-10 w-10 text-gray-300" />
          {search ? (
            <>
              <p className="text-sm font-medium text-gray-500">No tags matching &ldquo;{search}&rdquo;</p>
              <Button className="mt-4" variant="outline" onClick={() => setSearch('')}>
                Clear search
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-500">No tags yet</p>
              <p className="mt-1 text-xs text-gray-400">Click &ldquo;New Tag&rdquo; to add one.</p>
              <Button className="mt-4" onClick={() => { setCreating(true); setNewTagName('') }}>
                <Plus className="mr-2 h-4 w-4" />
                New Tag
              </Button>
            </>
          )}
        </div>
      )}

      {/* ── Tags grid (split into Main and Other) ─────────────────────────────── */}
      {!loading && displayTags.length > 0 && (
        <div className="space-y-6">
          {/* Main Tags Section */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                Main Tags
              </h2>
              {mainTags.length === 0 && (
                <Button size="sm" variant="outline" onClick={() => setShowAddMainDialog(true)}>
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Add tags as main
                </Button>
              )}
            </div>
            {mainTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {mainTags.map((tag) => (
                  <TagPill
                    key={tag.id}
                    tag={tag}
                    taskCount={taskCounts.get(tag.id) ?? 0}
                    onDelete={setDeleteTarget}
                    onRename={handleRename}
                    onToggleMain={handleToggleMain}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 px-4 py-8 text-center dark:border-gray-700 dark:bg-gray-900/30">
                <p className="text-sm text-gray-500">No main tags yet. Click "Add tags as main" to mark important tags.</p>
              </div>
            )}
          </div>

          {/* Other Tags Section */}
          {otherTags.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                <TagIcon className="h-5 w-5" />
                Other Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {otherTags.map((tag) => (
                  <TagPill
                    key={tag.id}
                    tag={tag}
                    taskCount={taskCounts.get(tag.id) ?? 0}
                    onDelete={setDeleteTarget}
                    onRename={handleRename}
                    onToggleMain={handleToggleMain}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Delete confirmation modal ─────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-xl dark:border-gray-700">
            <h2 className="text-lg font-semibold">Delete tag</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete the tag{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">&ldquo;{deleteTarget.name}&rdquo;</span>?
              This will remove all connections to tasks and flashcards.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={deleteLoading}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteLoading}
                onClick={() => void confirmDelete()}
              >
                {deleteLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-2 h-3.5 w-3.5" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add tags as main dialog ───────────────────────────────────────────── */}
      {showAddMainDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl dark:border-gray-700">
            <h2 className="text-lg font-semibold">Add tags as main</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Select tags to mark as main/featured tags.
            </p>
            
            {/* Search/filter */}
            <div className="mt-4 relative">
              <Search className="pointer-events-none absolute inset-y-0 left-2.5 my-auto h-4 w-4 text-gray-400" />
              <Input
                value={mainDialogSearch}
                onChange={(e) => setMainDialogSearch(e.target.value)}
                placeholder="Search tags..."
                className="pl-8"
                autoFocus
              />
            </div>

            {/* Tag list */}
            <div className="mt-4 max-h-64 overflow-y-auto space-y-1">
              {otherTags
                .filter((t) => 
                  !mainDialogSearch || 
                  t.name.toLowerCase().includes(mainDialogSearch.toLowerCase())
                )
                .map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    disabled={addingMain}
                    onClick={() => void handleAddToMain(tag.id)}
                    className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-left transition-colors hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-blue-900/20"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{tag.name}</span>
                      <span className="text-xs text-gray-500">
                        {taskCounts.get(tag.id) ?? 0} tasks
                      </span>
                    </span>
                    <Star className="h-4 w-4 text-gray-400" />
                  </button>
                ))}
              {otherTags.filter((t) => 
                !mainDialogSearch || 
                t.name.toLowerCase().includes(mainDialogSearch.toLowerCase())
              ).length === 0 && (
                <p className="py-8 text-center text-sm text-gray-500">
                  {mainDialogSearch ? 'No matching tags' : 'No tags available'}
                </p>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                disabled={addingMain}
                onClick={() => { setShowAddMainDialog(false); setMainDialogSearch('') }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
