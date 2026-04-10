'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  LESSON_THEORY_TEXT_SIZE_KEY,
  LESSON_THEORY_TEXT_SIZE_OPTIONS,
  parseLessonTheoryTextSize,
  persistLessonTheoryTextSize,
  type LessonTheoryTextSize,
} from '@/lib/lesson-theory-text-size'

export function LessonReadingSizeSettings() {
  const [value, setValue] = useState<LessonTheoryTextSize>('comfortable')

  useEffect(() => {
    setValue(parseLessonTheoryTextSize(localStorage.getItem(LESSON_THEORY_TEXT_SIZE_KEY)))
  }, [])

  function select(next: LessonTheoryTextSize) {
    setValue(next)
    persistLessonTheoryTextSize(next)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lesson reading</CardTitle>
        <CardDescription>
          Text size for theory blocks when you study a lesson. Saved in this browser only.
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
