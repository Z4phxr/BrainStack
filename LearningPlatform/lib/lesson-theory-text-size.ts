import { useEffect, useState } from 'react'

/** Stored in localStorage; applies to lesson theory blocks (and legacy lesson text). */
export const LESSON_THEORY_TEXT_SIZE_KEY = 'brainstack-lesson-theory-text-size' as const

export const LESSON_THEORY_TEXT_SIZE_EVENT = 'brainstack-lesson-theory-text-size-changed' as const

export type LessonTheoryTextSize = 'comfortable' | 'large' | 'extra-large'

export const LESSON_THEORY_TEXT_SIZE_OPTIONS: {
  value: LessonTheoryTextSize
  label: string
  description: string
}[] = [
  { value: 'comfortable', label: 'Comfortable', description: 'Default reading size' },
  { value: 'large', label: 'Large', description: 'Bigger lesson text' },
  { value: 'extra-large', label: 'Extra large', description: 'Largest option' },
]

export function parseLessonTheoryTextSize(raw: string | null): LessonTheoryTextSize {
  if (raw === 'large' || raw === 'extra-large') return raw
  return 'comfortable'
}

export function persistLessonTheoryTextSize(value: LessonTheoryTextSize) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LESSON_THEORY_TEXT_SIZE_KEY, value)
  window.dispatchEvent(new Event(LESSON_THEORY_TEXT_SIZE_EVENT))
}

/** Body / callout / table cell text classes per tier (no smaller than previous default). */
export function lessonTheorySizeClasses(size: LessonTheoryTextSize) {
  switch (size) {
    case 'large':
      return {
        body: 'text-lg leading-relaxed text-foreground',
        callout: 'text-lg leading-relaxed text-foreground',
        table: 'text-lg',
        mathDisplay: 'text-3xl',
        mathNote: 'text-base text-muted-foreground italic mt-2',
        imageCaption: 'text-base',
      }
    case 'extra-large':
      return {
        body: 'text-xl leading-relaxed text-foreground',
        callout: 'text-xl leading-relaxed text-foreground',
        table: 'text-xl',
        mathDisplay: 'text-4xl',
        mathNote: 'text-lg text-muted-foreground italic mt-2',
        imageCaption: 'text-lg',
      }
    default:
      return {
        body: 'text-base leading-relaxed text-foreground',
        callout: 'text-base leading-relaxed text-foreground',
        table: 'text-base',
        mathDisplay: 'text-2xl',
        mathNote: 'text-sm text-muted-foreground italic mt-2',
        imageCaption: 'text-sm',
      }
  }
}

export function useLessonTheoryTextSize(): LessonTheoryTextSize {
  const [size, setSize] = useState<LessonTheoryTextSize>('comfortable')

  useEffect(() => {
    const read = () =>
      setSize(parseLessonTheoryTextSize(localStorage.getItem(LESSON_THEORY_TEXT_SIZE_KEY)))

    read()

    const onStorage = (e: StorageEvent) => {
      if (e.key === LESSON_THEORY_TEXT_SIZE_KEY) read()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener(LESSON_THEORY_TEXT_SIZE_EVENT, read)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(LESSON_THEORY_TEXT_SIZE_EVENT, read)
    }
  }, [])

  return size
}
