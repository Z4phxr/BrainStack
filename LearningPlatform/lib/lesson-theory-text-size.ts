import { useEffect, useState } from 'react'

/** Stored in localStorage; applies to lesson theory, legacy lesson text, and practice tasks on the lesson page. */
export const LESSON_THEORY_TEXT_SIZE_KEY = 'brainstack-lesson-theory-text-size-v2' as const

const LEGACY_LESSON_THEORY_TEXT_SIZE_KEY = 'brainstack-lesson-theory-text-size' as const

export const LESSON_THEORY_TEXT_SIZE_EVENT = 'brainstack-lesson-theory-text-size-changed' as const

/** Three tiers (v2). Labels renamed: old “Comfortable” → Small, old “Large” → Comfortable (default), old “Extra large” → Large. */
export type LessonTheoryTextSize = 'small' | 'comfortable' | 'large'

export const LESSON_THEORY_TEXT_SIZE_OPTIONS: {
  value: LessonTheoryTextSize
  label: string
  description: string
}[] = [
  { value: 'small', label: 'Small', description: 'Tighter lesson text' },
  { value: 'comfortable', label: 'Comfortable', description: 'Default reading size' },
  { value: 'large', label: 'Large', description: 'Largest option' },
]

function migrateLegacyStorageValue(raw: string): LessonTheoryTextSize | null {
  if (raw === 'extra-large') return 'large'
  if (raw === 'large') return 'comfortable'
  if (raw === 'comfortable') return 'small'
  if (raw === 'small') return 'small'
  return null
}

/**
 * Read v2 key, or one-time migrate from v1 localStorage (4 tiers → 3 tiers).
 */
export function parseLessonTheoryTextSize(raw: string | null): LessonTheoryTextSize {
  if (raw === 'small' || raw === 'comfortable' || raw === 'large') return raw
  return 'comfortable'
}

export function readLessonTheoryTextSizeFromStorage(): LessonTheoryTextSize {
  if (typeof window === 'undefined') return 'comfortable'

  const v2 = localStorage.getItem(LESSON_THEORY_TEXT_SIZE_KEY)
  if (v2 === 'small' || v2 === 'comfortable' || v2 === 'large') return v2

  if (v2) {
    const mapped = migrateLegacyStorageValue(v2)
    if (mapped) {
      persistLessonTheoryTextSize(mapped)
      return mapped
    }
  }

  const legacy = localStorage.getItem(LEGACY_LESSON_THEORY_TEXT_SIZE_KEY)
  if (legacy) {
    const migrated = migrateLegacyStorageValue(legacy) ?? 'comfortable'
    persistLessonTheoryTextSize(migrated)
    try {
      localStorage.removeItem(LEGACY_LESSON_THEORY_TEXT_SIZE_KEY)
    } catch {
      /* ignore */
    }
    return migrated
  }

  return 'comfortable'
}

export function persistLessonTheoryTextSize(value: LessonTheoryTextSize) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LESSON_THEORY_TEXT_SIZE_KEY, value)
  window.dispatchEvent(new Event(LESSON_THEORY_TEXT_SIZE_EVENT))
}

/** Body / callout / table / code / titles per tier. Default **comfortable** matches former “Large” body size. */
export function lessonTheorySizeClasses(size: LessonTheoryTextSize) {
  switch (size) {
    case 'small':
      return {
        body: 'text-base leading-relaxed text-foreground',
        callout: 'text-base leading-relaxed text-foreground',
        table: 'text-base',
        mathDisplay: 'text-2xl',
        mathNote: 'text-sm text-muted-foreground italic mt-2',
        imageCaption: 'text-sm',
        calloutTitle: 'text-lg font-semibold tracking-tight text-foreground',
        theoryH1: 'text-2xl font-bold tracking-tight text-foreground',
        theoryH2: 'text-xl font-bold tracking-tight text-foreground',
        calloutIcon: 'h-5 w-5',
        codeInline: 'rounded bg-muted/70 px-1 py-0.5 font-mono text-[0.92em]',
        codeBlock: 'font-mono text-sm leading-relaxed',
        videoTitle: 'text-xl font-semibold text-foreground',
        mathInline: 'text-base leading-normal text-foreground',
      }
    case 'large':
      return {
        body: 'text-xl leading-relaxed text-foreground',
        callout: 'text-xl leading-relaxed text-foreground',
        table: 'text-xl',
        mathDisplay: 'text-4xl',
        mathNote: 'text-lg text-muted-foreground italic mt-2',
        imageCaption: 'text-lg',
        calloutTitle: 'text-2xl font-semibold tracking-tight text-foreground',
        theoryH1: 'text-3xl font-bold tracking-tight text-foreground sm:text-4xl',
        theoryH2: 'text-2xl font-bold tracking-tight text-foreground',
        calloutIcon: 'h-7 w-7',
        codeInline: 'rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[0.95em]',
        codeBlock: 'font-mono text-lg leading-relaxed',
        videoTitle: 'text-3xl font-semibold text-foreground',
        mathInline: 'text-xl leading-normal text-foreground',
      }
    default:
      return {
        body: 'text-lg leading-relaxed text-foreground',
        callout: 'text-lg leading-relaxed text-foreground',
        table: 'text-lg',
        mathDisplay: 'text-3xl',
        mathNote: 'text-base text-muted-foreground italic mt-2',
        imageCaption: 'text-base',
        calloutTitle: 'text-xl font-semibold tracking-tight text-foreground',
        theoryH1: 'text-[1.65rem] font-bold tracking-tight text-foreground sm:text-3xl',
        theoryH2: 'text-xl font-bold tracking-tight text-foreground sm:text-2xl',
        calloutIcon: 'h-6 w-6',
        codeInline: 'rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[0.94em]',
        codeBlock: 'font-mono text-base leading-relaxed',
        videoTitle: 'text-2xl font-semibold text-foreground',
        mathInline: 'text-lg leading-normal text-foreground',
      }
  }
}

/** Practice tasks on the lesson page: match body/headings/buttons to the lesson reading size. */
export function lessonTaskUiClasses(size: LessonTheoryTextSize) {
  const sc = lessonTheorySizeClasses(size)
  const buttonSize = size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'default'
  return {
    sc,
    buttonSize: buttonSize as 'sm' | 'default' | 'lg',
    /** Extra classes so `Button` overrides its base `text-sm` when needed. */
    buttonText: size === 'large' ? 'text-base min-h-11' : '',
    choiceRow:
      size === 'large'
        ? 'gap-4 p-4'
        : size === 'small'
          ? 'gap-2.5 p-2.5'
          : 'gap-3 p-3',
    radioCircle:
      size === 'large'
        ? 'h-8 w-8 text-sm'
        : size === 'small'
          ? 'h-5 w-5 text-[10px]'
          : 'h-6 w-6 text-xs',
    feedbackIcon: size === 'large' ? 'h-6 w-6' : size === 'small' ? 'h-4 w-4' : 'h-5 w-5',
    textareaMinH: size === 'large' ? 'min-h-[140px]' : 'min-h-[120px]',
    sectionHeading: sc.calloutTitle,
    /** Muted helper lines (manual review, difficulty blurb). */
    helperMuted:
      size === 'large' ? 'text-base text-muted-foreground' : 'text-sm text-muted-foreground',
    difficultyTitle: sc.calloutTitle,
    difficultyGridBtn:
      size === 'large' ? 'p-3' : size === 'small' ? 'p-1.5' : 'p-2',
    difficultyNumber: size === 'large' ? 'text-lg' : size === 'small' ? 'text-sm' : 'text-base',
    difficultySub:
      size === 'large' ? 'text-sm text-gray-500' : 'text-xs text-gray-500',
  }
}

export function useLessonTheoryTextSize(): LessonTheoryTextSize {
  const [size, setSize] = useState<LessonTheoryTextSize>('comfortable')

  useEffect(() => {
    const read = () => setSize(readLessonTheoryTextSizeFromStorage())

    read()

    const onStorage = (e: StorageEvent) => {
      if (e.key === LESSON_THEORY_TEXT_SIZE_KEY || e.key === LEGACY_LESSON_THEORY_TEXT_SIZE_KEY) read()
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
