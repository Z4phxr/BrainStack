'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { studentGlassCard } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'
import {
  LESSON_THEORY_TEXT_SIZE_OPTIONS,
  persistLessonTheoryTextSize,
  readLessonTheoryTextSizeFromStorage,
  type LessonTheoryTextSize,
} from '@/lib/lesson-theory-text-size'

export function LessonReadingSizeSettings() {
  const [value, setValue] = useState<LessonTheoryTextSize>('comfortable')

  useEffect(() => {
    setValue(readLessonTheoryTextSizeFromStorage())
  }, [])

  function select(next: LessonTheoryTextSize) {
    setValue(next)
    persistLessonTheoryTextSize(next)
  }

  return (
    <Card className={cn('border-0 shadow-none', studentGlassCard)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Lesson text size
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2 sm:grid-cols-3">
          {LESSON_THEORY_TEXT_SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => select(opt.value)}
              className={cn(
                'rounded-lg border px-3 py-3 text-left transition-colors',
                value === opt.value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border hover:bg-muted/50',
              )}
            >
              <span className="block font-medium text-foreground">{opt.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{opt.description}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
