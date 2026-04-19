'use client'

import { useCallback, useEffect, useId, useState, type ReactNode } from 'react'
import { MessageSquareText, X, Highlighter } from 'lucide-react'
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

const THEORY_ROOT_ID = 'lesson-theory-root'

function getSelectedTextInElement(root: HTMLElement | null): string {
  if (typeof window === 'undefined' || !root) return ''
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed) return ''

  const anchor = sel.anchorNode
  const focus = sel.focusNode
  if (!anchor || !focus) return ''

  const contains = (n: Node) => {
    const el = n.nodeType === Node.TEXT_NODE ? n.parentElement : (n as HTMLElement)
    return el ? root.contains(el) : false
  }

  if (!contains(anchor) || !contains(focus)) return ''

  return sel.toString().trim()
}

interface LessonAssistantShellProps {
  lessonId: string
  courseSlug: string
  enabled: boolean
  /** Breadcrumb, title, module badge, admin preview — full width above the two columns. */
  lessonHeader: ReactNode
  /** Theory, tasks, nav — left column; top aligns with assistant when open. */
  lessonBody: ReactNode
}

/**
 * Pro: header full width; with assistant open, equal two-column grid for body + panel.
 */
export function LessonAssistantShell({
  lessonId,
  courseSlug,
  enabled,
  lessonHeader,
  lessonBody,
}: LessonAssistantShellProps) {
  const panelTitleId = useId()
  const questionInputId = useId()
  const tier = useLessonTheoryTextSize()
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelPreset, setModelPreset] = useState<LessonAssistantModelPreset>('haiku')

  const refreshSelection = useCallback(() => {
    const root = document.getElementById(THEORY_ROOT_ID)
    const t = getSelectedTextInElement(root)
    setSelectedText(t)
  }, [])

  useEffect(() => {
    if (!open) return
    refreshSelection()
  }, [open, refreshSelection])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function submit() {
    const q = question.trim()
    if (!q || loading) return
    setLoading(true)
    setError(null)
    setAnswer('')
    try {
      const res = await fetch('/api/lesson-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          courseSlug,
          question: q,
          selectedText: selectedText.trim() || undefined,
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
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const shellBase = 'mx-auto w-full px-4 py-7 sm:px-6 sm:py-8'

  const singleColumnWrap = (content: ReactNode) => (
    <div className={cn(shellBase, 'max-w-4xl')}>{content}</div>
  )

  if (!enabled) {
    return singleColumnWrap(
      <>
        {lessonHeader}
        {lessonBody}
      </>,
    )
  }

  const wideOpen = open

  return (
    <div className={cn(shellBase, wideOpen ? 'max-w-[90rem]' : 'max-w-4xl')}>
      <div className="mb-8 min-w-0">{lessonHeader}</div>

      {open ? (
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-8 lg:gap-10">
          <div className="min-w-0">{lessonBody}</div>

          <aside
            className={cn(
              'flex w-full min-w-0 flex-col gap-3 rounded-xl border-0 p-4 shadow-none',
              studentGlassCard,
              'min-h-0 max-h-[min(90dvh,40rem)] md:max-h-[calc(100dvh-5.5rem)]',
              'md:sticky md:top-6',
            )}
            aria-labelledby={panelTitleId}
          >
            <div className="flex shrink-0 flex-col gap-3">
              <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                <h2 id={panelTitleId} className="text-base font-semibold leading-snug text-foreground">
                  Ask about this lesson
                </h2>
                <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" aria-hidden />
                  <span className="sr-only">Close assistant</span>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Select text in the theory, then capture it. Your question is sent with full lesson context.
              </p>

              <div className="space-y-2">
                <Label htmlFor="lesson-assistant-model" className="text-sm font-medium text-foreground">
                  Model
                </Label>
                <Select
                  value={modelPreset}
                  onValueChange={(v) => setModelPreset(v as LessonAssistantModelPreset)}
                  disabled={loading}
                >
                  <SelectTrigger id="lesson-assistant-model" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="haiku">Haiku 4.5 — faster, lower cost</SelectItem>
                    <SelectItem value="sonnet">Sonnet 4.5 — richer answers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="button" variant="outline" size="sm" onClick={refreshSelection} className="w-fit gap-1.5">
                <Highlighter className="h-4 w-4" aria-hidden />
                Use page selection
              </Button>

              {selectedText ? (
                <div className="max-h-24 overflow-y-auto rounded-md border border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  {selectedText}
                </div>
              ) : null}

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
                  aria-describedby={`${questionInputId}-hint`}
                  className="min-h-[88px] resize-y text-base"
                  disabled={loading}
                />
                <p id={`${questionInputId}-hint`} className="text-xs text-muted-foreground">
                  <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[0.7rem]">Enter</kbd> to send ·{' '}
                  <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[0.7rem]">Shift</kbd> +{' '}
                  <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[0.7rem]">Enter</kbd> for new line
                </p>
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

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-md border bg-muted/20 px-3 py-2">
              {answer ? (
                <TheoryMarkdown markdown={answer} tier={tier} className="min-w-0" />
              ) : (
                <p className="text-sm text-muted-foreground">Answer will appear here.</p>
              )}
            </div>
          </aside>
        </div>
      ) : (
        <div className="min-w-0">{lessonBody}</div>
      )}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'fixed z-30 flex h-14 w-14 items-center justify-center rounded-full border bg-primary text-primary-foreground shadow-lg transition hover:opacity-95',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            'bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))]',
          )}
          aria-label="Open lesson assistant"
          aria-expanded={false}
        >
          <MessageSquareText className="h-7 w-7" aria-hidden />
        </button>
      ) : null}
    </div>
  )
}

export { THEORY_ROOT_ID }
