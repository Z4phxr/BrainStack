'use client'

/**
 * â”€â”€â”€ Flashcard Study Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 *
 * Supports two modes (selected via ?mode= query param):
 *   srs  â€” Only shows cards that are due today (respects daily limits).
 *   free â€” Shows ALL cards in the set regardless of due date.
 *
 * An optional ?tagSlug= query param limits the session to one tag.
 *
 * The study loop:
 *  1. Fetch due cards from /api/flashcards/study
 *  2. Show ONE card at a time (question side up)
 *  3. Click / tap â†’ flip to reveal answer
 *  4. Tap Again / Hard / Good / Easy â†’ POST to /api/flashcards/[id]/review
 *  5. SRS algorithm runs server-side and returns updated card state
 *  6. If the card is still in a short-step phase (LEARNING/RELEARNING with
 *     nextReviewAt within REQUEUE_WINDOW_MS), push it back to the END of the
 *     in-memory queue so it reappears in this session.
 *  7. When queue is empty â†’ show completion screen
 */

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Settings,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Tag {
  id:   string
  name: string
  slug: string
}

interface StudyCard {
  id:              string
  question:        string
  answer:          string
  questionImageId: string | null
  answerImageId:   string | null
  state:           string
  interval:        number
  easeFactor:      number
  repetition:      number
  stepIndex:       number
  nextReviewAt:    string | null
  lastReviewedAt:  string | null
  tags:            Tag[]
}

type AnswerButton = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'
type Phase        = 'loading' | 'question' | 'answer' | 'submitting' | 'done' | 'empty'

/** Cards answered Again/Hard in LEARNING are requeued if due within this window (ms). */
const REQUEUE_WINDOW_MS = 25 * 60 * 1000  // 25 minutes

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function stateLabel(state: string): { label: string; color: string } {
  switch (state) {
    case 'NEW':        return { label: 'New',        color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
    case 'LEARNING':   return { label: 'Learning',   color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' }
    case 'REVIEW':     return { label: 'Review',     color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' }
    case 'RELEARNING': return { label: 'Relearning', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' }
    case 'MASTERED':   return { label: 'Mastered',   color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' }
    default:           return { label: state,        color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' }
  }
}

/** Render LaTeX if katex is loaded, otherwise return the raw string. */
async function renderLatex(raw: string): Promise<string> {
  try {
    const katex = (await import('katex')).default
    // Block LaTeX: $$...$$
    let html = raw.replace(/\$\$([\s\S]*?)\$\$/g, (_m, tex) => {
      try { return katex.renderToString(tex, { displayMode: true, throwOnError: false }) }
      catch { return _m }
    })
    // Inline LaTeX: $...$
    html = html.replace(/\$([\s\S]*?)\$/g, (_m, tex) => {
      try { return katex.renderToString(tex, { displayMode: false, throwOnError: false }) }
      catch { return _m }
    })
    return html
  } catch {
    return raw
  }
}

// â”€â”€â”€ Answer button configs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ANSWER_BUTTONS: {
  label:   string
  answer:  AnswerButton
  desc:    string
  variant: string
}[] = [
  {
    label:   'Again',
    answer:  'AGAIN',
    desc:    'Complete blackout',
    variant: 'bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700',
  },
  {
    label:   'Hard',
    answer:  'HARD',
    desc:    'Difficult to recall',
    variant: 'bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-600 dark:hover:bg-orange-700',
  },
  {
    label:   'Good',
    answer:  'GOOD',
    desc:    'Recalled with effort',
    variant: 'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700',
  },
  {
    label:   'Easy',
    answer:  'EASY',
    desc:    'Recalled instantly',
    variant: 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700',
  },
]

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Wrapper required by Next.js App Router so that useSearchParams() is
 * consumed inside a Suspense boundary (avoids full-route deopt warning).
 */
export default function StudyPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <StudyPage />
    </Suspense>
  )
}

function StudyPage() {
  const searchParams = useSearchParams()

  const mode    = searchParams.get('mode') === 'free' ? 'free' : 'srs'
  const tagSlug = searchParams.get('tagSlug') ?? ''
  const subject = searchParams.get('subject') ?? ''
  // â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const [queue,        setQueue]        = useState<StudyCard[]>([])
  const [currentIdx,   setCurrentIdx]   = useState(0)
  const [phase,        setPhase]        = useState<Phase>('loading')
  const [error,        setError]        = useState('')
  const [reviewedCount,setReviewedCount]= useState(0)
  const totalRef = useRef(0)

  // LaTeX-rendered HTML for the current card
  const [questionHtml, setQuestionHtml] = useState('')
  const [answerHtml,   setAnswerHtml]   = useState('')

  // Image URLs resolved from Payload CMS media IDs
  const [questionImgUrl, setQuestionImgUrl] = useState<string | null>(null)
  const [answerImgUrl,   setAnswerImgUrl]   = useState<string | null>(null)

  // â”€â”€ Fetch study session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const loadSession = useCallback(async () => {
    setPhase('loading')
    setError('')
    setCurrentIdx(0)
    setReviewedCount(0)
    try {
      const qs = new URLSearchParams({ mode })
      if (tagSlug) qs.set('tagSlug', tagSlug)
      if (subject) qs.set('subject', subject)
      const res = await fetch(`/api/flashcards/study?${qs}`)
      if (!res.ok) throw new Error('Failed to load session')
      const data = await res.json()
      const cards: StudyCard[] = data.cards ?? []
      totalRef.current = cards.length
      setQueue(cards)
      setPhase(cards.length === 0 ? 'empty' : 'question')
    } catch {
      setError('Could not load study session. Please try again.')
      setPhase('empty')
    }
  }, [mode, tagSlug])

  useEffect(() => { loadSession() }, [loadSession])

  // â”€â”€ Render LaTeX whenever current card changes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  useEffect(() => {
    const card = queue[currentIdx]
    if (!card) return

    setQuestionHtml('')
    setAnswerHtml('')
    setQuestionImgUrl(null)
    setAnswerImgUrl(null)

    renderLatex(card.question).then(setQuestionHtml)
    renderLatex(card.answer).then(setAnswerHtml)

    // Resolve image IDs â†’ URLs
    if (card.questionImageId || card.answerImageId) {
      fetch('/api/media/list')
        .then((r) => r.json())
        .then((d) => {
          const docs: { id: string | number; url: string }[] = d?.docs ?? []
          if (card.questionImageId) {
            const m = docs.find((x) => String(x.id) === card.questionImageId)
            if (m) setQuestionImgUrl(m.url)
          }
          if (card.answerImageId) {
            const m = docs.find((x) => String(x.id) === card.answerImageId)
            if (m) setAnswerImgUrl(m.url)
          }
        })
        .catch(() => { /* ignore â€” images optional */ })
    }
  }, [queue, currentIdx])

  // â”€â”€ Keyboard shortcuts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase === 'question' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault()
        setPhase('answer')
      }
      if (phase === 'answer') {
        if (e.key === '1') handleAnswer('AGAIN')
        if (e.key === '2') handleAnswer('HARD')
        if (e.key === '3') handleAnswer('GOOD')
        if (e.key === '4') handleAnswer('EASY')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIdx, queue])

  // â”€â”€ Answer handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async function handleAnswer(answer: AnswerButton) {
    const card = queue[currentIdx]
    if (!card || phase === 'submitting') return

    setPhase('submitting')

    try {
      const res = await fetch(`/api/flashcards/${card.id}/review`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ answer }),
      })

      if (!res.ok) throw new Error('Review failed')

      const data: { flashcard: StudyCard } = await res.json()
      const updated = data.flashcard

      // Decide whether to requeue this card (short learning step due within window)
      const shouldRequeue =
        (updated.state === 'LEARNING' || updated.state === 'RELEARNING') &&
        updated.nextReviewAt !== null &&
        new Date(updated.nextReviewAt).getTime() - Date.now() <= REQUEUE_WINDOW_MS

      setReviewedCount((c) => c + 1)

      // Build the new queue synchronously, then decide next index
      const patchedQueue = queue.map((c, i) => (i === currentIdx ? updated : c))

      let nextQueue: StudyCard[]
      let nextIdx:   number

      if (shouldRequeue) {
        // Move the answered card to the end of the queue; stay at current index
        // (which now points to what was previously the next card)
        nextQueue = [
          ...patchedQueue.slice(0, currentIdx),
          ...patchedQueue.slice(currentIdx + 1),
          updated,
        ]
        nextIdx = currentIdx >= nextQueue.length - 1 ? 0 : currentIdx
        // If after requeue the remaining non-requeued items are exhausted,
        // we're done with the "fresh" cards â€” treat as done when queue is 1 item long
        if (nextQueue.length === 1) {
          // Only the re-queued card remains; reset index to 0 and continue
          nextIdx = 0
        }
      } else {
        // Normal advance: remove no card; just move forward
        nextQueue = patchedQueue
        nextIdx   = currentIdx + 1
      }

      setQueue(nextQueue)

      if (nextIdx >= nextQueue.length) {
        setPhase('done')
      } else {
        setCurrentIdx(nextIdx)
        setPhase('question')
      }
    } catch {
      setError('Failed to save review. Please try again.')
      setPhase('answer')
    }
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const card          = queue[currentIdx]
  const progressTotal = totalRef.current
  const progressDone  = reviewedCount
  const pct           = progressTotal > 0 ? Math.round((progressDone / progressTotal) * 100) : 0
  const backHref      = '/dashboard'

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div className="flex flex-col gap-0 -m-6">
      {/* â”€â”€ Top bar â”€â”€ */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            {subject ? subject : (tagSlug ? tagSlug : 'Flashcards')}
          </Link>
          <span className="text-gray-300 dark:text-gray-700">Â·</span>
          <span className={cn(
            'rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
            mode === 'free'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
          )}>
            {mode === 'free' ? 'âšˇ Free Learn' : 'đź“… SRS Mode'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/flashcards/settings">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* â”€â”€ Progress bar â”€â”€ */}
      {progressTotal > 0 && (
        <div className="h-1 w-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full bg-blue-500 transition-all duration-300 dark:bg-blue-400"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* â”€â”€ Main content â”€â”€ */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 bg-gray-50 dark:bg-gray-950 min-h-[calc(100vh-8rem)]">

        {/* Loading */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-4 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Preparing your study sessionâ€¦</p>
          </div>
        )}

        {/* Error */}
        {error && phase !== 'loading' && (
          <div className="mb-4 w-full max-w-lg rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Empty / no cards due */}
        {phase === 'empty' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <BookOpen className="h-14 w-14 text-gray-300 dark:text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              No cards due!
            </h2>
            <p className="max-w-sm text-sm text-gray-500">
              {mode === 'srs'
                ? 'All caught up for today. Come back later or switch to Free Learn to study all cards.'
                : 'No flashcards found in this set.'}
            </p>
            <div className="flex gap-3">
              <Link href={backHref} className="mt-2">
                <Button variant="outline">â† Back</Button>
              </Link>
              {mode === 'srs' && (
                <Link href={`/dashboard/flashcards/study?mode=free${tagSlug ? `&tagSlug=${tagSlug}` : ''}`} className="mt-2">
                  <Button>
                    <Zap className="mr-2 h-4 w-4" />
                    Free Learn
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Done */}
        {phase === 'done' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-14 w-14 text-green-500 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              Session complete!
            </h2>
            <p className="max-w-sm text-sm text-gray-500">
              You reviewed <strong>{reviewedCount}</strong> card{reviewedCount !== 1 ? 's' : ''} this session.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={loadSession}
                className="mt-2 flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <RotateCcw className="h-4 w-4" />
                Start Again
              </button>
              <Link href={backHref} className="mt-2">
                <Button>â† Back to Flashcards</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Study card (question or answer phase) */}
        {card && (phase === 'question' || phase === 'answer' || phase === 'submitting') && (
          <div className="flex w-full max-w-2xl flex-col gap-6">

            {/* Progress counter */}
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
              <span>{currentIdx + 1} / {queue.length} remaining</span>
              <div className="flex items-center gap-1.5">
                {(() => {
                  const sl = stateLabel(card.state)
                  return (
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', sl.color)}>
                      {sl.label}
                    </span>
                  )
                })()}
                {card.interval > 0 && (
                  <span className="text-gray-400">
                    {card.interval}d interval
                  </span>
                )}
              </div>
            </div>

            {/* Flip card */}
            <button
              type="button"
              disabled={phase === 'submitting'}
              onClick={() => phase === 'question' && setPhase('answer')}
              className={cn(
                'group relative min-h-[280px] w-full cursor-pointer overflow-hidden rounded-2xl border',
                'bg-white text-left shadow-md transition-all duration-200',
                'dark:bg-gray-900 dark:border-gray-700',
                phase === 'question'
                  ? 'hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700'
                  : 'cursor-default',
                phase === 'submitting' && 'opacity-70',
              )}
              aria-label={phase === 'question' ? 'Click to reveal answer' : 'Answer revealed'}
            >
              {/* Question side (always visible) */}
              <div className="flex flex-col gap-4 p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                  Question
                </p>
                {questionHtml ? (
                  <div
                    className="prose prose-sm max-w-none font-mono text-lg leading-relaxed text-gray-800 dark:prose-invert dark:text-gray-100"
                     
                    dangerouslySetInnerHTML={{ __html: questionHtml }}
                  />
                ) : (
                  <p className="font-mono text-lg text-gray-800 dark:text-gray-100">{card.question}</p>
                )}
                {questionImgUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={questionImgUrl}
                    alt="Question image"
                    className="mt-2 max-h-60 rounded-lg object-contain"
                  />
                )}
              </div>

              {/* Answer side (revealed after flip) */}
              {phase !== 'question' && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-8 dark:border-gray-800 dark:bg-gray-800/30">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                    Answer
                  </p>
                  {answerHtml ? (
                    <div
                      className="prose prose-sm max-w-none font-mono text-base leading-relaxed text-gray-700 dark:prose-invert dark:text-gray-200"
                       
                      dangerouslySetInnerHTML={{ __html: answerHtml }}
                    />
                  ) : (
                    <p className="font-mono text-base text-gray-700 dark:text-gray-200">{card.answer}</p>
                  )}
                  {answerImgUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={answerImgUrl}
                      alt="Answer image"
                      className="mt-2 max-h-60 rounded-lg object-contain"
                    />
                  )}
                </div>
              )}

              {/* "Click to reveal" hint */}
              {phase === 'question' && (
                <div className="absolute bottom-3 right-4 text-xs text-gray-300 group-hover:text-gray-400 dark:text-gray-700 dark:group-hover:text-gray-600">
                  Space / click to reveal â†“
                </div>
              )}
            </button>

            {/* Answer buttons */}
            {(phase === 'answer' || phase === 'submitting') && (
              <div className="grid grid-cols-4 gap-3">
                {ANSWER_BUTTONS.map((btn) => (
                  <button
                    key={btn.answer}
                    disabled={phase === 'submitting'}
                    onClick={() => handleAnswer(btn.answer)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl px-3 py-3 text-sm font-semibold',
                      'transition-all duration-150 disabled:opacity-60',
                      btn.variant,
                    )}
                  >
                    <span>{btn.label}</span>
                    <span className="text-[10px] font-normal opacity-80">{btn.desc}</span>
                    <span className="text-[10px] font-normal opacity-60">[{ANSWER_BUTTONS.indexOf(btn) + 1}]</span>
                  </button>
                ))}
              </div>
            )}

            {/* Tags */}
            {card.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {card.tags.map((t) => (
                  <span
                    key={t.id}
                    className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* â”€â”€ KaTeX CSS â”€â”€ */}
      { }
      <style>{`
        .katex { font-size: 1.1em; }
        .katex-display { overflow-x: auto; overflow-y: hidden; padding: 0.25rem 0; }
      `}</style>
    </div>
  )
}

