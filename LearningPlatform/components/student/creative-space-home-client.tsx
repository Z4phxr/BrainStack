'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Clock, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { studentGlassCard } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'

type CreativeSpace = {
  id: string
  title: string
  updatedAt: string
}

function formatUpdatedAt(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d)
}

const spaceRowSurface =
  'group flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-stretch sm:justify-between sm:gap-6 sm:p-5 ' +
  'border-slate-300/45 bg-white/[0.28] shadow-sm backdrop-blur-md transition-[box-shadow,transform] duration-200 ' +
  'hover:shadow-md dark:border-white/15 dark:bg-white/[0.1] dark:shadow-none dark:hover:brightness-[1.02]'

const inlineNewRowSurface =
  'flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-stretch sm:justify-between sm:gap-6 sm:p-5 ' +
  'border-primary/35 bg-white/[0.34] shadow-sm ring-2 ring-primary/20 backdrop-blur-md dark:border-primary/30 dark:bg-white/[0.12] dark:ring-primary/25'

type CreativeSpaceRowProps = {
  space: CreativeSpace
  deleting: boolean
  deleteBusy: boolean
  onDelete: () => void
}

function CreativeSpaceRow({ space, deleting, deleteBusy, onDelete }: CreativeSpaceRowProps) {
  const openDisabled = deleting

  return (
    <div className={cn('group flex flex-col gap-4', spaceRowSurface)}>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 text-left">
        <h3 className="text-balance text-base font-semibold leading-snug tracking-tight text-gray-900 dark:text-gray-50 sm:text-lg">
          {space.title}
        </h3>
        <div className="flex items-start gap-2.5 text-muted-foreground">
          <Clock
            className="mt-0.5 size-4 shrink-0 text-slate-500 opacity-80 dark:text-gray-400"
            aria-hidden
          />
          <div className="min-w-0 space-y-0.5">
            <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Last updated
            </p>
            <time
              dateTime={space.updatedAt}
              className="block text-sm tabular-nums leading-snug text-gray-600 dark:text-gray-300 sm:text-[0.9375rem]"
            >
              {formatUpdatedAt(space.updatedAt)}
            </time>
          </div>
        </div>
      </div>
      <div className="flex w-full shrink-0 flex-row items-stretch gap-2 sm:w-auto sm:items-center sm:border-l sm:border-slate-200/70 sm:pl-6 dark:sm:border-white/15">
        {openDisabled ? (
          <Button
            type="button"
            variant="hero"
            size="default"
            disabled
            className="auth-hero-cta h-11 min-h-11 flex-1 px-5 sm:min-w-[11.5rem]"
          >
            Open whiteboard
          </Button>
        ) : (
          <Button
            asChild
            variant="hero"
            size="default"
            className="auth-hero-cta h-11 min-h-11 flex-1 px-5 sm:min-w-[11.5rem]"
          >
            <Link href={`/creative-space/${space.id}`}>Open whiteboard</Link>
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11 shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={`Delete “${space.title}”`}
          disabled={deleteBusy}
          onClick={() => void onDelete()}
        >
          {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        </Button>
      </div>
    </div>
  )
}

export function CreativeSpaceHomeClient() {
  const [spaces, setSpaces] = useState<CreativeSpace[]>([])
  const [showCreateRow, setShowCreateRow] = useState(false)
  const [createTitle, setCreateTitle] = useState('')
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadSpaces = useCallback(async () => {
    const res = await fetch('/api/creative-spaces')
    if (!res.ok) return
    const data = (await res.json()) as { spaces: CreativeSpace[] }
    setSpaces(data.spaces ?? [])
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadSpaces()
    }, 0)
    return () => window.clearTimeout(t)
  }, [loadSpaces])

  const startInlineCreate = useCallback(() => {
    setCreateTitle('')
    setCreateError(null)
    setShowCreateRow(true)
  }, [])

  const cancelInlineCreate = useCallback(() => {
    if (createSubmitting) return
    setShowCreateRow(false)
    setCreateTitle('')
    setCreateError(null)
  }, [createSubmitting])

  useEffect(() => {
    if (!showCreateRow) return
    const t = window.setTimeout(() => {
      document.getElementById('inline-create-space-name')?.focus()
    }, 0)
    return () => window.clearTimeout(t)
  }, [showCreateRow])

  useEffect(() => {
    if (!showCreateRow) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelInlineCreate()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showCreateRow, cancelInlineCreate])

  const submitCreateSpace = useCallback(async () => {
    const name = createTitle.trim()
    if (!name) {
      setCreateError('Enter a name for your space.')
      document.getElementById('inline-create-space-name')?.focus()
      return
    }
    setCreateSubmitting(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/creative-spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: name }),
      })
      if (!res.ok) {
        setCreateError('Could not create the space. Try again.')
        return
      }
      setShowCreateRow(false)
      setCreateTitle('')
      await loadSpaces()
    } finally {
      setCreateSubmitting(false)
    }
  }, [createTitle, loadSpaces])

  const deleteSpace = useCallback(async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/creative-spaces/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) return
      await loadSpaces()
    } finally {
      setDeletingId(null)
    }
  }, [loadSpaces])

  const listHasContent = spaces.length > 0 || showCreateRow

  return (
    <div className="container mx-auto px-5 py-7 md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <section className="w-full space-y-4">
          <div className="flex w-full items-center">
            <div className="flex-1 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">
                Creative Spaces
              </h2>
              <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-400 md:text-lg">
                Open a board or start a new canvas for notes, decks, and sketches.
              </p>
            </div>
          </div>

          <Card className={cn('border-0 shadow-none', studentGlassCard)}>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
              <div className="space-y-1.5 text-center sm:text-left">
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  Your boards
                </p>
                <CardTitle className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                  All creative spaces
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                  Each space is its own whiteboard. Create as many as you need.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="hero"
                className="auth-hero-cta w-full shrink-0 sm:w-auto"
                onClick={startInlineCreate}
                disabled={showCreateRow}
              >
                Create creative space
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 sm:pt-0">
              {!listHasContent ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/30 bg-white/10 px-4 py-10 text-center backdrop-blur-lg dark:border-white/20 dark:bg-white/10">
                  <p className="max-w-md text-base leading-relaxed text-gray-600 dark:text-gray-400 md:text-lg">
                    No creative spaces yet. Create one to open the whiteboard.
                  </p>
                  <Button type="button" variant="hero" className="auth-hero-cta" onClick={startInlineCreate}>
                    Create creative space
                  </Button>
                </div>
              ) : (
                <>
                  {spaces.length === 0 && showCreateRow ? (
                    <p className="text-center text-sm text-muted-foreground sm:text-left">
                      Name your first space, then save to open the whiteboard.
                    </p>
                  ) : null}

                  {showCreateRow ? (
                    <form
                      className={inlineNewRowSurface}
                      onSubmit={(e) => {
                        e.preventDefault()
                        void submitCreateSpace()
                      }}
                    >
                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 text-left">
                        <div className="space-y-1.5">
                          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-primary">
                            New creative space
                          </p>
                        </div>
                        <Input
                          id="inline-create-space-name"
                          name="title"
                          autoComplete="off"
                          placeholder="e.g. Data science intro"
                          value={createTitle}
                          onChange={(e) => {
                            setCreateTitle(e.target.value)
                            if (createError) setCreateError(null)
                          }}
                          disabled={createSubmitting}
                          aria-invalid={createError ? true : undefined}
                          aria-describedby={createError ? 'inline-create-error' : undefined}
                          maxLength={120}
                          className="h-10 bg-white/50 text-base dark:bg-black/20 sm:max-w-xl"
                        />
                        {createError ? (
                          <p id="inline-create-error" className="text-sm text-destructive">
                            {createError}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col gap-2 sm:items-stretch sm:justify-center sm:border-l sm:border-slate-200/70 sm:pl-6 dark:sm:border-white/15">
                        <Button
                          type="submit"
                          variant="hero"
                          className="auth-hero-cta h-auto min-h-11 w-full px-5 sm:min-w-[10.5rem]"
                          disabled={createSubmitting || !createTitle.trim()}
                        >
                          {createSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving…
                            </>
                          ) : (
                            'Save'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:min-w-[10.5rem]"
                          onClick={cancelInlineCreate}
                          disabled={createSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : null}

                  {spaces.map((space) => (
                    <CreativeSpaceRow
                      key={space.id}
                      space={space}
                      deleting={deletingId === space.id}
                      deleteBusy={deletingId !== null}
                      onDelete={() => void deleteSpace(space.id)}
                    />
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
