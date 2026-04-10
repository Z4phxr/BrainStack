'use client'

import { cn } from '@/lib/utils'
import { lessonTheorySizeClasses, useLessonTheoryTextSize } from '@/lib/lesson-theory-text-size'

export function LessonLegacyContent({ content }: { content: string }) {
  const tier = useLessonTheoryTextSize()
  const sc = lessonTheorySizeClasses(tier)
  return <p className={cn('whitespace-pre-wrap', sc.body)}>{content}</p>
}
