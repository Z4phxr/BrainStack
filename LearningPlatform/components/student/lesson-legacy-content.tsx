'use client'

import { LexicalRichText } from '@/components/student/lexical-rich-text'
import { useLessonTheoryTextSize } from '@/lib/lesson-theory-text-size'

/** Legacy `lessons.content` is Lexical rich text (object) or occasionally a plain string (rendered as Markdown). */
export function LessonLegacyContent({ content }: { content: unknown }) {
  const tier = useLessonTheoryTextSize()

  if (content == null) return null

  return <LexicalRichText content={content} tier={tier} className="min-w-0" />
}
