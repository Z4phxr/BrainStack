'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card>
      <CardHeader>
        <CardTitle>Lesson text size</CardTitle>
        <CardDescription>
          How large lesson theory and Markdown text blocks appear. Stored in this browser only.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
