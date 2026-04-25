'use client'

import { useId, useState } from 'react'
import { MessageSquareText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { studentGlassCard } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'
import type { LessonAssistantModelPreset } from '@/lib/lesson-assistant-models'
import { TheoryMarkdown } from '@/components/student/markdown-theory-body'
import { useLessonTheoryTextSize } from '@/lib/lesson-theory-text-size'

export function FlashcardAssistantFab({
  enabled,
  cardFront,
  cardBack,
}: {
  enabled: boolean
  cardFront: string
  cardBack: string
}) {
  const questionInputId = useId()
  const tier = useLessonTheoryTextSize()
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelPreset, setModelPreset] = useState<LessonAssistantModelPreset>('haiku')
  const [composerCollapsed, setComposerCollapsed] = useState(false)

  async function submit() {
    const q = question.trim()
    if (!q || loading) return
    setLoading(true)
    setError(null)
    setAnswer('')
    try {
      const res = await fetch('/api/flashcard-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          cardFront,
          cardBack,
          modelPreset,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string }
      if (res.status === 429) {
        setError('Too many requests. Please wait a moment and try again.')
        return
      }
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        return
      }
      setAnswer((data.answer ?? '').trim())
      setComposerCollapsed(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!enabled) return null

  return (
    <>
      {open ? (
        <aside
          className={cn(
            'fixed bottom-4 right-4 z-30 flex w-[min(96vw,34rem)] min-w-0 flex-col gap-3 rounded-xl border-0 p-4 shadow-none',
            studentGlassCard,
            'max-h-[calc(100dvh-2rem)]',
          )}
        >
          <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
            <h2 className="text-base font-semibold leading-snug text-foreground">Ask about this flashcard</h2>
            <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" aria-hidden />
              <span className="sr-only">Close assistant</span>
            </Button>
          </div>

          {!composerCollapsed ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="flashcard-assistant-model" className="text-sm font-medium text-foreground">
                  Model
                </Label>
                <Select
                  value={modelPreset}
                  onValueChange={(v) => setModelPreset(v as LessonAssistantModelPreset)}
                  disabled={loading}
                >
                  <SelectTrigger id="flashcard-assistant-model" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="haiku">Haiku 4.5 — faster, lower cost</SelectItem>
                    <SelectItem value="sonnet">Sonnet 4.5 — richer answers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={questionInputId} className="sr-only">
                  Your question
                </Label>
                <Textarea
                  id={questionInputId}
                  placeholder="Your question…"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void submit()
                    }
                  }}
                  className="min-h-[88px] resize-y text-base"
                  disabled={loading}
                />
              </div>

              <Button
                type="button"
                variant="hero"
                className="auth-hero-cta w-full"
                onClick={() => void submit()}
                disabled={loading || !question.trim()}
              >
                {loading ? 'Thinking…' : 'Ask'}
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2">
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {question.trim() ? `Question: ${question.trim()}` : 'Previous question'}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => setComposerCollapsed(false)} className="shrink-0">
                Ask another
              </Button>
            </div>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="overflow-y-auto rounded-md border bg-muted/20 px-3 py-2 md:max-h-[calc(100dvh-16rem)]">
            {answer ? (
              <TheoryMarkdown markdown={answer} tier={tier} className="min-w-0" />
            ) : (
              <p className="text-sm text-muted-foreground">Answer will appear here.</p>
            )}
          </div>
        </aside>
      ) : null}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'fixed z-30 flex h-14 w-14 items-center justify-center rounded-full border bg-primary text-primary-foreground shadow-lg transition hover:opacity-95',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            'bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))]',
          )}
          aria-label="Open flashcard assistant"
          aria-expanded={false}
        >
          <MessageSquareText className="h-7 w-7" aria-hidden />
        </button>
      ) : null}
    </>
  )
}

