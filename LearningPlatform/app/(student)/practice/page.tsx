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
 *   4. Answer is evaluated client-side and the result is shown.
 *   5. "Next" advances to the following task.
 *   6. After all tasks, a summary screen is shown.
 *
 * Answer evaluation is intentionally local (no server persistence) so practice
 * sessions are a lightweight, repeatable experience that do not affect lesson
 * progress.  Real lesson-progress recording happens only inside lesson pages.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, ArrowRight, RotateCcw, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { extractText } from '@/lib/lexical'

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
  solution:         unknown | null
  solutionMedia:    unknown | null
  solutionVideoUrl: string | null
  points:           number
  order:            number
  tags:             string[]
}

interface AnswerResult {
  isCorrect: boolean
  correct:   string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function evaluateAnswer(task: FullTask, answer: string): boolean {
  if (!task.correctAnswer) return false
  return answer.trim().toLowerCase() === task.correctAnswer.trim().toLowerCase()
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

  function handleSubmit() {
    if (!selected || submitted) return
    const isCorrect = evaluateAnswer(task, selected)
    const res: AnswerResult = { isCorrect, correct: task.correctAnswer ?? '' }
    setResult(res)
    setSubmitted(true)
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
                {['True', 'False'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelected(opt)}
                    className={cn(
                      'flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors',
                      selected === opt
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300',
                    )}
                  >
                    {opt}
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
            {/* Result banner */}
            <div
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg',
                result?.isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
              )}
            >
              {result?.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <div>
                <p className={cn('font-semibold text-sm', result?.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300')}>
                  {result?.isCorrect ? 'Correct!' : 'Incorrect'}
                </p>
                {!result?.isCorrect && result?.correct && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Correct answer: <span className="font-medium">{result.correct}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Solution */}
            {!!task.solution && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-r-lg space-y-1">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Explanation</p>
                <RichText content={task.solution} />
              </div>
            )}

            <Button
              onClick={() => onComplete(result!)}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2"
            >
              Next Task <ArrowRight className="w-4 h-4" />
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
  const correct = results.filter((r) => r.isCorrect).length
  const total   = results.length
  const pct     = Math.round((correct / total) * 100)

  return (
    <Card className="w-full max-w-lg mx-auto text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Session Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-6xl font-bold text-indigo-600">{pct}%</div>
        <p className="text-gray-600 dark:text-gray-400">
          You answered <span className="font-semibold">{correct}</span> of <span className="font-semibold">{total}</span> tasks correctly.
        </p>

        {/* Per-task breakdown */}
        <div className="flex justify-center gap-2 flex-wrap">
          {results.map((r, i) => (
            <div
              key={i}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold',
                r.isCorrect ? 'bg-green-500' : 'bg-red-400',
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
