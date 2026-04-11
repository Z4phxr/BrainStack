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
  return <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{text}</p>
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-300">
            Task {index + 1} of {total}
          </CardTitle>
          <div className="flex gap-1.5 flex-wrap">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
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
                    onClick={() => setSelected(choice.text)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors',
                      selected === choice.text
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
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
                      'flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors',
                      selected === opt
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300',
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm
                           bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            )}

            <Button
              onClick={handleSubmit}
              disabled={!selected.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
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
                  <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-red-600" />
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
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-900/40">
                <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  How difficult was this task?
                </h4>
                <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
                  Optional — helps tune recommendations. (Not saved in practice mode.)
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDifficultyRating(n)}
                      className="rounded-lg border border-gray-300 py-2 text-sm font-medium transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-600 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/50"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => onComplete(result!)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
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
    <Card className="w-full max-w-lg mx-auto text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Session Complete!</CardTitle>
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
                r.isCorrect === true && 'bg-green-500',
                r.isCorrect === false && 'bg-red-400',
                r.isCorrect === null && 'bg-gray-400',
              )}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <Button onClick={onRestart} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" /> Try Again
          </Button>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Link href="/dashboard">
              <Home className="w-4 h-4" /> Dashboard
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
      loadTask(sessionTasks[currentIndex].id)
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-gray-500">Preparing your practice session…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-lg text-center space-y-6">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={handleRestart} variant="outline">Try Again</Button>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="container mx-auto px-6 py-12">
        <Summary results={results} onRestart={handleRestart} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Practice Session</h1>
          <p className="text-sm text-gray-500 mt-1">
            Adaptive practice based on your weak areas
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
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
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
