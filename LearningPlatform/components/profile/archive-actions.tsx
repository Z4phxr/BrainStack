'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
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

function ActionToast({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md border border-black/10 bg-black/85 px-3 py-2 text-xs text-white shadow-lg"
    >
      {message}
    </div>
  )
}

function useActionToast() {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const showToast = (message: string) => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
    }
    setToastMessage(message)
    timeoutRef.current = window.setTimeout(() => {
      setToastMessage(null)
      timeoutRef.current = null
    }, 2200)
  }

  return { toastMessage, showToast }
}

export function ArchiveCourseButton({ courseSlug }: { courseSlug: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const { toastMessage, showToast } = useActionToast()

  return (
    <>
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
            showToast('Course archived')
            router.refresh()
          })
        }}
      >
        {pending ? 'Archiving...' : 'Archive course'}
      </Button>
      {toastMessage ? <ActionToast message={toastMessage} /> : null}
    </>
  )
}

export function ArchiveDeckButton({ deckId }: { deckId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const { toastMessage, showToast } = useActionToast()

  return (
    <>
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
            showToast('Deck archived')
            router.refresh()
          })
        }}
      >
        {pending ? 'Archiving...' : 'Archive deck'}
      </Button>
      {toastMessage ? <ActionToast message={toastMessage} /> : null}
    </>
  )
}

export function UnarchiveCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const { toastMessage, showToast } = useActionToast()
  return (
    <>
      <Button
        type="button"
        variant="hero"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await postJson('/api/profile/unarchive', { type: 'course', courseId })
            showToast('Course unarchived')
            router.refresh()
          })
        }
      >
        {pending ? 'Unarchiving...' : 'Unarchive'}
      </Button>
      {toastMessage ? <ActionToast message={toastMessage} /> : null}
    </>
  )
}

export function UnarchiveDeckButton({ deckId }: { deckId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const { toastMessage, showToast } = useActionToast()
  return (
    <>
      <Button
        type="button"
        variant="hero"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await postJson('/api/profile/unarchive', { type: 'deck', deckId })
            showToast('Deck unarchived')
            router.refresh()
          })
        }
      >
        {pending ? 'Unarchiving...' : 'Unarchive'}
      </Button>
      {toastMessage ? <ActionToast message={toastMessage} /> : null}
    </>
  )
}
