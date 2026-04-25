'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || 'Request failed')
  }
}

export function ArchiveCourseButton({ courseSlug }: { courseSlug: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          setError(null)
          const archiveLinkedDeck = window.confirm(
            'Do you also want to archive this course flashcard deck?',
          )
          startTransition(async () => {
            try {
              await postJson('/api/profile/archive', {
                type: 'course',
                courseSlug,
                archiveLinkedDeck,
              })
              router.refresh()
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to archive course')
            }
          })
        }}
      >
        {pending ? 'Archiving...' : 'Archive course'}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

export function ArchiveDeckButton({ deckId }: { deckId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          setError(null)
          const archiveLinkedCourse = window.confirm(
            'This deck may be linked to a course. Do you also want to archive the course?',
          )
          startTransition(async () => {
            try {
              await postJson('/api/profile/archive', {
                type: 'deck',
                deckId,
                archiveLinkedCourse,
              })
              router.refresh()
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to archive deck')
            }
          })
        }}
      >
        {pending ? 'Archiving...' : 'Archive deck'}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

export function UnarchiveCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant="hero"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null)
            try {
              await postJson('/api/profile/unarchive', { type: 'course', courseId })
              router.refresh()
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to unarchive course')
            }
          })
        }
      >
        {pending ? 'Unarchiving...' : 'Unarchive'}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

export function UnarchiveDeckButton({ deckId }: { deckId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant="hero"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null)
            try {
              await postJson('/api/profile/unarchive', { type: 'deck', deckId })
              router.refresh()
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to unarchive deck')
            }
          })
        }
      >
        {pending ? 'Unarchiving...' : 'Unarchive'}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
