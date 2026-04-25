'use client'

import { useTransition } from 'react'
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

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        const archiveLinkedDeck = window.confirm(
          'Do you also want to archive this course flashcard deck?',
        )
        startTransition(async () => {
          await postJson('/api/profile/archive', {
            type: 'course',
            courseSlug,
            archiveLinkedDeck,
          })
          router.refresh()
        })
      }}
    >
      {pending ? 'Archiving...' : 'Archive course'}
    </Button>
  )
}

export function ArchiveDeckButton({ deckId }: { deckId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        const archiveLinkedCourse = window.confirm(
          'This deck may be linked to a course. Do you also want to archive the course?',
        )
        startTransition(async () => {
          await postJson('/api/profile/archive', {
            type: 'deck',
            deckId,
            archiveLinkedCourse,
          })
          router.refresh()
        })
      }}
    >
      {pending ? 'Archiving...' : 'Archive deck'}
    </Button>
  )
}

export function UnarchiveCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <Button
      type="button"
      variant="hero"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await postJson('/api/profile/unarchive', { type: 'course', courseId })
          router.refresh()
        })
      }
    >
      {pending ? 'Unarchiving...' : 'Unarchive'}
    </Button>
  )
}

export function UnarchiveDeckButton({ deckId }: { deckId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <Button
      type="button"
      variant="hero"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await postJson('/api/profile/unarchive', { type: 'deck', deckId })
          router.refresh()
        })
      }
    >
      {pending ? 'Unarchiving...' : 'Unarchive'}
    </Button>
  )
}
