'use client'

/**
 * /practice
 *
 * Practice session page.
 *
 * Flow:
 *   1. On mount, fetch a practice session from /api/practice/session.
 *   2. Load full task data for the current task from /api/practice/task/[id].
 *   3. User selects / types an answer and submits.
 *   4. Answer is scored client-side with the same rules as lesson submissions
 *      (lib/evaluate-task-answer.ts), including open-ended + autoGrade=false → manual review.
 *   5. "Next" advances to the following task.
 *   6. After all tasks, a summary screen is shown.
 *
 * Scores are not persisted — practice is repeatable and does not write TaskProgress.
 * Lesson pages use submitTaskAnswer() for real progress.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, ArrowRight, RotateCcw, Home, Eye } from 'lucide-react'
import { studentGlassCard } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'
import { extractText } from '@/lib/lexical'
import { evaluateTaskAnswer } from '@/lib/evaluate-task-answer'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SessionTask {
  id:    string
  question: string
  tags:  string[]
}

interface FullTask {
  id:               string
  type:             'MULTIPLE_CHOICE' | 'OPEN_ENDED' | 'TRUE_FALSE'
  prompt:           unknown
  questionMedia:    unknown | null
  choices:          Array<{ text: string; id?: string }>
  correctAnswer:    string | null
  /** Only for OPEN_ENDED — when false, answers are not auto-scored (same as lessons). */
  autoGrade?:       boolean
  solution:         unknown | null
  solutionMedia:    unknown | null
  solutionVideoUrl: string | null
  points:           number
  order:            number
  tags:             string[]
}

/** isCorrect null = open-ended without auto-grade (manual review); excluded from right/wrong score. */
interface AnswerResult {
  isCorrect: boolean | null
  correct:   string
}

// ─── Rich-text renderer (minimal) ────────────────────────────────────────────

function RichText({ content }: { content: unknown }) {
  const text = extractText(content)
  if (!text) return null
  return (
    <p className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">{text}</p>
  )
}

// ─── PracticeTaskCard ─────────────────────────────────────────────────────────

interface PracticeTaskCardProps {
  task:       FullTask
  index:      number
  total:      number
  onComplete: (result: AnswerResult) => void
}

function PracticeTaskCard({ task, index, total, onComplete }: PracticeTaskCardProps) {
  const [selected, setSelected]   = useState<string>('')
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult]       = useState<AnswerResult | null>(null)
  const [difficultyRating, setDifficultyRating] = useState<number | null>(null)

  function handleSubmit() {
    if (!selected.trim() || submitted) return
    const answer = task.type === 'OPEN_ENDED' ? selected.trim() : selected
    const { isCorrect, autoGraded } = evaluateTaskAnswer(
      {
        type: task.type,
        correctAnswer: task.correctAnswer,
        autoGrade: task.autoGrade,
      },
      answer,
    )
    const res: AnswerResult = {
      isCorrect: autoGraded ? isCorrect : null,
      correct: task.correctAnswer ?? '',
    }
    setResult(res)
    setSubmitted(true)
    if (task.type === 'OPEN_ENDED') {
      setDifficultyRating(null)
    }
  }

  return (
    <Card className={cn('w-full border-0 shadow-none', studentGlassCard)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Task {index + 1} of {total}
          </CardTitle>
          <div className="flex gap-1.5 flex-wrap">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200/80 dark:bg-white/10">
          <div
            className="h-1.5 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Prompt */}
        <div className="text-base">
          <RichText content={task.prompt} />
        </div>

        {/* Answer area */}
        {!submitted ? (
          <>
            {task.type === 'MULTIPLE_CHOICE' && (
              <div className="space-y-2">
                {(task.choices ?? []).map((choice, i) => (
                  <button
                    key={choice.id ?? i}
                    type="button"
                    onClick={() => setSelected(choice.text)}
                    className={cn(
                      'w-full rounded-xl border px-4 py-3 text-left text-sm shadow-sm backdrop-blur-md transition-colors',
                      selected === choice.text
                        ? 'border-primary/50 bg-primary/15 text-primary dark:border-primary/45 dark:bg-primary/20 dark:text-gray-100'
                        : 'border-slate-300/45 bg-white/[0.28] hover:border-slate-400/55 hover:bg-white/[0.38] dark:border-white/12 dark:bg-white/[0.06] dark:hover:border-white/18 dark:hover:bg-white/[0.1]',
                    )}
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            )}

            {task.type === 'TRUE_FALSE' && (
              <div className="flex gap-3">
                {(['true', 'false'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelected(opt)}
                    className={cn(
                      'flex-1 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm backdrop-blur-md transition-colors',
                      selected === opt
                        ? 'border-primary/50 bg-primary/15 text-primary dark:border-primary/45 dark:bg-primary/20 dark:text-gray-100'
                        : 'border-slate-300/45 bg-white/[0.28] hover:border-slate-400/55 hover:bg-white/[0.38] dark:border-white/12 dark:bg-white/[0.06] dark:hover:border-white/18 dark:hover:bg-white/[0.1]',
                    )}
                  >
                    {opt === 'true' ? 'True' : 'False'}
                  </button>
                ))}
              </div>
            )}

            {task.type === 'OPEN_ENDED' && (
              <textarea
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                placeholder="Type your answer…"
                rows={4}
                className={cn(
                  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs',
                  'ring-offset-background placeholder:text-muted-foreground',
                  'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                )}
              />
            )}

            <Button
              type="button"
              variant="hero"
              className="auth-hero-cta"
              onClick={handleSubmit}
              disabled={!selected.trim()}
            >
              Check Answer
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            {/* Result banner — matches lesson task-card: no red/green verdict for manual open-ended */}
            {result?.isCorrect === null ? (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/40">
                <Eye className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    Answer recorded — not auto-graded
                  </p>
                  <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-300/90">
                    This question needs manual review. Compare your response with the sample answer and explanation below.
                    How difficult was it for you?
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3',
                  result?.isCorrect
                    ? 'border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
                )}
              >
                {result?.isCorrect ? (
                  <CheckCircle className="h-5 w-5 shrink-0 text-green-700 dark:text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-red-700 dark:text-red-400" />
                )}
                <div>
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      result?.isCorrect
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300',
                    )}
                  >
                    {result?.isCorrect ? 'Correct!' : 'Incorrect'}
                  </p>
                  {result?.isCorrect === false && result.correct && task.type !== 'OPEN_ENDED' && (
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                      Correct answer: <span className="font-medium">{result.correct}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Sample answer (open-ended) */}
            {task.type === 'OPEN_ENDED' && task.correctAnswer && (
              <div className="space-y-1 rounded-r-lg border-l-4 border-blue-400 bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Sample answer
                </p>
                <p className="whitespace-pre-wrap text-sm text-blue-900 dark:text-blue-100">{task.correctAnswer}</p>
              </div>
            )}

            {/* Solution / explanation */}
            {!!task.solution && (
              <div className="space-y-1 rounded-r-lg border-l-4 border-blue-400 bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                  Explanation
                </p>
                <RichText content={task.solution} />
              </div>
            )}

            {/* Difficulty (open-ended only — practice does not persist; same prompt as lessons) */}
            {task.type === 'OPEN_ENDED' && difficultyRating == null && (
              <div
                className={cn(
                  'mx-auto w-full max-w-md rounded-xl border border-dashed p-4 backdrop-blur-md sm:max-w-lg',
                  'border-slate-400/50 bg-white/[0.22] dark:border-white/25 dark:bg-white/[0.08]',
                )}
              >
                <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                  How difficult was this task?
                </h4>
                <p className="mb-3 text-xs text-gray-600 dark:text-white/85 sm:text-sm">
                  Optional — helps tune recommendations. (Not saved in practice mode.)
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDifficultyRating(n)}
                      className={cn(
                        'rounded-xl border py-2 text-sm font-semibold shadow-sm backdrop-blur-md transition-colors',
                        'border-slate-300/45 bg-white/[0.28] text-gray-900 hover:border-primary/40 hover:bg-primary/10',
                        'dark:border-white/25 dark:bg-white/[0.1] dark:text-white dark:hover:border-primary/40 dark:hover:bg-primary/20',
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="hero"
              className="auth-hero-cta gap-2"
              onClick={() => onComplete(result!)}
            >
              Next Task <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Summary screen ──────────────────────────────────────────────────────────

interface SummaryProps {
  results: AnswerResult[]
  onRestart: () => void
}

function Summary({ results, onRestart }: SummaryProps) {
  const correct = results.filter((r) => r.isCorrect === true).length
  const wrong = results.filter((r) => r.isCorrect === false).length
  const manual = results.filter((r) => r.isCorrect === null).length
  const scored = correct + wrong
  const pct = scored > 0 ? Math.round((correct / scored) * 100) : 0

  return (
    <Card className={cn('mx-auto w-full max-w-lg border-0 text-center shadow-none', studentGlassCard)}>
      <CardHeader>
        <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">Session Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {scored > 0 ? (
          <div className="text-6xl font-bold text-indigo-600">{pct}%</div>
        ) : (
          <div className="text-2xl font-semibold text-gray-600 dark:text-gray-400">—</div>
        )}
        <p className="text-gray-600 dark:text-gray-400">
          {scored > 0 ? (
            <>
              <span className="font-semibold">{correct}</span> correct ·{' '}
              <span className="font-semibold">{wrong}</span> incorrect
              {scored > 0 && (
                <span className="text-gray-500 dark:text-gray-500"> (auto-graded tasks only)</span>
              )}
            </>
          ) : (
            <>No auto-graded tasks in this session.</>
          )}
          {manual > 0 && (
            <>
              <br />
              <span className="mt-2 inline-block text-sm">
                <span className="font-semibold">{manual}</span> open-ended{' '}
                {manual === 1 ? 'task' : 'tasks'} without auto-grade (review only).
              </span>
            </>
          )}
        </p>

        {/* Per-task breakdown */}
        <div className="flex justify-center gap-2 flex-wrap">
          {results.map((r, i) => (
            <div
              key={i}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white',
                r.isCorrect === true &&
                  'bg-green-600 text-white dark:bg-green-800 dark:text-green-100',
                r.isCorrect === false &&
                  'bg-red-500 text-white dark:bg-red-900 dark:text-red-100',
                r.isCorrect === null && 'bg-gray-400 text-white dark:bg-gray-600 dark:text-gray-100',
              )}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button type="button" onClick={onRestart} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Try Again
          </Button>
          <Button asChild variant="hero" className="auth-hero-cta gap-2">
            <Link href="/dashboard">
              <Home className="h-4 w-4" /> Dashboard
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function PracticePage() {
  const router = useRouter()

  const [sessionTasks, setSessionTasks] = useState<SessionTask[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fullTask, setFullTask]         = useState<FullTask | null>(null)
  const [results, setResults]           = useState<AnswerResult[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [finished, setFinished]         = useState(false)

  const loadingTaskRef = useRef<string | null>(null)

  // ── Fetch session ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchSession() {
      setLoading(true)
      try {
        const res = await fetch('/api/practice/session?limit=10')
        if (res.status === 401) { router.push('/login'); return }
        if (!res.ok) throw new Error('Failed to fetch session')
        const data = await res.json()
        if (!data.tasks?.length) {
          setError('No practice tasks available. Complete some lessons to unlock recommendations.')
          return
        }
        setSessionTasks(data.tasks)
      } catch {
        setError('Unable to start practice session. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [router])

  // ── Load full task data when session tasks / index changes ─────────────────
  const loadTask = useCallback(async (taskId: string) => {
    if (loadingTaskRef.current === taskId) return
    loadingTaskRef.current = taskId
    setFullTask(null)
    try {
      const res = await fetch(`/api/practice/task/${taskId}`)
      if (!res.ok) throw new Error('Task not found')
      const data: FullTask = await res.json()
      setFullTask(data)
    } catch {
      setError('Failed to load task. Skipping to next.')
      handleNext({ isCorrect: false, correct: '' })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sessionTasks.length > 0 && currentIndex < sessionTasks.length) {
      const t = window.setTimeout(() => {
        void loadTask(sessionTasks[currentIndex].id)
      }, 0)
      return () => window.clearTimeout(t)
    }
  }, [sessionTasks, currentIndex, loadTask])

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleNext(result: AnswerResult) {
    const newResults = [...results, result]
    setResults(newResults)

    if (currentIndex + 1 >= sessionTasks.length) {
      setFinished(true)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  function handleRestart() {
    setCurrentIndex(0)
    setResults([])
    setFinished(false)
    setFullTask(null)
    loadingTaskRef.current = null

    // Re-fetch a fresh session
    setLoading(true)
    setError(null)
    setSessionTasks([])
    fetch('/api/practice/session?limit=10')
      .then((r) => r.json())
      .then((data) => {
        if (data.tasks?.length) setSessionTasks(data.tasks)
        else setError('No practice tasks available.')
      })
      .catch(() => setError('Unable to restart. Please refresh the page.'))
      .finally(() => setLoading(false))
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-12">
        <Card className={cn('border-0 shadow-none', studentGlassCard)}>
          <CardContent className="flex flex-col items-center gap-4 px-10 py-10 sm:px-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-center text-gray-600 dark:text-gray-400">Preparing your practice session…</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-lg space-y-6 px-5 py-10 text-center md:px-6 md:py-12">
        <Card className={cn('border-0 shadow-none', studentGlassCard)}>
          <CardContent className="space-y-6 px-5 py-8 sm:px-6">
            <p className="text-base text-red-600 dark:text-red-400">{error}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button type="button" onClick={handleRestart} variant="outline">
                Try Again
              </Button>
              <Button asChild variant="hero" className="auth-hero-cta">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="container mx-auto max-w-5xl px-5 py-7 md:px-6 md:py-8">
        <Summary results={results} onRestart={handleRestart} />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-8 px-5 py-7 md:px-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">
            Practice Session
          </h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            Adaptive practice based on your weak areas
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 self-center sm:self-start">
          <Link href="/dashboard">← Dashboard</Link>
        </Button>
      </div>

      {fullTask ? (
        <PracticeTaskCard
          task={fullTask}
          index={currentIndex}
          total={sessionTasks.length}
          onComplete={handleNext}
        />
      ) : (
        <Card className={cn('border-0 shadow-none', studentGlassCard)}>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
