'use client'

import React, { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { studentGlassCard } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'
import { submitTaskAnswer } from '@/app/actions/progress'
import { LexicalRichText } from '@/components/student/lexical-rich-text'
import { lessonTaskUiClasses, useLessonTheoryTextSize } from '@/lib/lesson-theory-text-size'

interface Choice {
  text: string
  id?: string
}

interface Media {
  id: string
  url: string
  filename: string
  mimeType: string
  alt?: string
}

interface Task {
  id: string
  type: 'MULTIPLE_CHOICE' | 'OPEN_ENDED' | 'TRUE_FALSE'
  prompt: unknown // Rich text
  questionMedia?: Media | string | null
  choices?: Choice[]
  correctAnswer?: string | null
  solution?: unknown // Rich text
  solutionMedia?: Media | string | null
  solutionVideoUrl?: string | null
  points: number
  order: number
}

interface UserProgress {
  submittedAnswer: string | null
  isCorrect: boolean | null
  earnedPoints: number
  status: string
}

interface TaskCardProps {
  task: Task
  index: number
  lessonId: string
  courseSlug: string
  userProgress?: UserProgress | null
}

// Helper: Convert YouTube/Vimeo URL to embed format
function getEmbedUrl(url: string): string | null {
  if (!url) return null

  try {
    const urlObj = new URL(url)
    
    // YouTube
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v')
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`
    }
    
    if (urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.pathname.slice(1)
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`
    }
    
    // Vimeo
    if (urlObj.hostname.includes('vimeo.com')) {
      const videoId = urlObj.pathname.split('/')[1]
      if (videoId) return `https://player.vimeo.com/video/${videoId}`
    }
    
    return null
  } catch {
    return null
  }
}

// Helper: Check if domain is safe for iframe
function isSafeDomain(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const safeDomains = ['youtube.com', 'youtube-nocookie.com', 'youtu.be', 'vimeo.com', 'player.vimeo.com']
    return safeDomains.some(domain => urlObj.hostname.includes(domain))
  } catch {
    return false
  }
}

// Helper: Render media (image or video)
function renderMedia(media: Media | string | null | undefined, alt?: string): React.ReactNode {
  if (!media) return null
  
  const mediaObj = typeof media === 'string' ? null : media
  if (!mediaObj || !mediaObj.filename) return null
  
  // Use serve API route for production compatibility
  const mediaUrl = `/api/media/serve/${encodeURIComponent(mediaObj.filename)}`
  
  const isVideo = mediaObj.mimeType?.startsWith('video/')
  
  if (isVideo) {
    return (
      <div className="my-4 rounded-lg overflow-hidden bg-black">
        <video
          src={mediaUrl}
          controls
          className="w-full max-h-[500px]"
          preload="metadata"
        >
          Your browser does not support video playback.
        </video>
      </div>
    )
  } else {
    return (
      <div className="my-4 rounded-lg overflow-hidden border">
        <Image
          src={mediaUrl}
          alt={mediaObj.alt || alt || 'Task image'}
          width={1200}
          height={800}
          unoptimized
          sizes="100vw"
          className="w-full h-auto"
        />
      </div>
    )
  }
}

export function TaskCard({ task, index, lessonId, courseSlug, userProgress }: TaskCardProps) {
  const tier = useLessonTheoryTextSize()
  const ui = lessonTaskUiClasses(tier)

  // Initialize state from userProgress if available
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    userProgress?.submittedAnswer || null
  )
  const [openAnswer, setOpenAnswer] = useState(userProgress?.submittedAnswer || '')
  const [hasChecked, setHasChecked] = useState(!!userProgress)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(userProgress?.isCorrect ?? null)
  const [showSolution, setShowSolution] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [difficultyRating, setDifficultyRating] = useState<number | null>(null)

  const handleCheck = async () => {
    // Determine the answer to submit
    let answerToSubmit = ''
    
    if (task.type === 'MULTIPLE_CHOICE' || task.type === 'TRUE_FALSE') {
      if (!selectedAnswer) return
      answerToSubmit = selectedAnswer
    } else if (task.type === 'OPEN_ENDED') {
      if (!openAnswer.trim()) return
      answerToSubmit = openAnswer
    }

    // Optimistic update - show immediate feedback
    const optimisticCorrect = task.type === 'OPEN_ENDED' 
      ? null  // We'll let server decide for open-ended
      : answerToSubmit === task.correctAnswer
    
    setIsCorrect(optimisticCorrect)
    setHasChecked(true)

    // For open-ended tasks, show inline difficulty rating prompt after submission

    // Submit to server in background
        startTransition(async () => {
      try {
        const result = await submitTaskAnswer(
          task.id,
          lessonId,
          answerToSubmit,
          courseSlug,
          difficultyRating || undefined
        )
            // Update with server result (might differ from optimistic)
            // If server indicates the task was NOT auto-graded, treat as ungraded
            // so we don't show a "Sorry, that is not correct" message; instead
            // open the solution panel for manual review.
            if (result.autoGraded === false) {
              setIsCorrect(null)
              setShowSolution(true)
            } else {
              setIsCorrect(result.isCorrect)
            }
      } catch (error) {
        console.error('Failed to submit answer:', error)
        // Rollback optimistic update on error
        setHasChecked(false)
        setIsCorrect(null)
        alert('Failed to submit answer. Please try again.')
      }
    })
  }

  const handleDifficultySubmit = async (rating: number) => {
    setDifficultyRating(rating)

    // Resubmit with difficulty rating
    startTransition(async () => {
      try {
        await submitTaskAnswer(
          task.id,
          lessonId,
          openAnswer,
          courseSlug,
          rating
        )
      } catch (error) {
        console.error('Failed to submit difficulty rating:', error)
      }
    })
  }

  const handleShowSolution = () => {
    setShowSolution((prev) => !prev)
    if (!hasChecked) setHasChecked(true)
  }

  const handleReset = () => {
    setSelectedAnswer(null)
    setOpenAnswer('')
    setHasChecked(false)
    setIsCorrect(null)
    setShowSolution(false)
  }

  /** Match feedback banner tones: bg-green/red-50 + dark:bg-*-900/20 + readable text (not neon fills). */
  const getOptionClassName = (optionText: string) => {
    if (!hasChecked) {
      return 'border-gray-300 hover:bg-[var(--block-bg)] cursor-pointer dark:border-gray-600'
    }

    const isSelected = selectedAnswer === optionText
    const isCorrectOption = optionText === task.correctAnswer

    if (isSelected && isCorrect) {
      return 'border-green-500 bg-green-50 text-green-900 dark:border-green-600 dark:bg-green-900/20 dark:text-green-100'
    }
    if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-50 text-red-900 dark:border-red-600 dark:bg-red-900/20 dark:text-red-100'
    }
    if (showSolution && isCorrectOption) {
      return 'border-green-500 bg-green-50 text-green-900 dark:border-green-600 dark:bg-green-900/20 dark:text-green-100'
    }

    return 'border-gray-300 opacity-60 dark:border-gray-600'
  }

  return (
    <Card className={cn('border-0 shadow-none', studentGlassCard)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline">Task {index + 1}</Badge>
            <Badge 
              variant={
                task.type === 'MULTIPLE_CHOICE' ? 'default' :
                task.type === 'TRUE_FALSE' ? 'secondary' : 'outline'
              }
            >
              {task.type === 'MULTIPLE_CHOICE' ? 'Multiple choice' :
               task.type === 'TRUE_FALSE' ? 'T/F' : 'Open-ended'}
            </Badge>
          </div>
          <Badge variant="secondary">{task.points} pts</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Prompt (Rich Text) */}
        <div className="min-w-0 max-w-none">
          <LexicalRichText content={task.prompt} tier={tier} />
        </div>

        {/* Question Media */}
        {renderMedia(task.questionMedia, 'Question media')}

        {/* Multiple Choice Options */}
        {task.type === 'MULTIPLE_CHOICE' && task.choices && (
          <div className="space-y-2">
            {task.choices.map((choice, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center border-2 rounded-lg transition-all',
                  ui.choiceRow,
                  getOptionClassName(choice.text),
                  !hasChecked && 'hover:border-blue-300 dark:hover:border-blue-500'
                )}
                onClick={() => !hasChecked && setSelectedAnswer(choice.text)}
              >
                <div className={cn(
                  'rounded-full border-2 flex items-center justify-center font-semibold shrink-0',
                  ui.radioCircle,
                  selectedAnswer === choice.text && !hasChecked && 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40',
                  selectedAnswer === choice.text &&
                    isCorrect &&
                    'border-green-600 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/30 dark:text-green-200',
                  selectedAnswer === choice.text &&
                    isCorrect === false &&
                    'border-red-600 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-200'
                )}>
                  {selectedAnswer === choice.text && hasChecked ? (
                    isCorrect ? <CheckCircle className={ui.feedbackIcon} /> : <XCircle className={ui.feedbackIcon} />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </div>
                <span className={cn('flex-1', ui.sc.body)}>{choice.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* True/False Options */}
        {task.type === 'TRUE_FALSE' && (
          <div className="space-y-2">
            {['true', 'false'].map((value) => (
              <div
                key={value}
                className={cn(
                  'flex items-center border-2 rounded-lg transition-all',
                  ui.choiceRow,
                  getOptionClassName(value),
                  !hasChecked && 'hover:border-blue-300 dark:hover:border-blue-500'
                )}
                onClick={() => !hasChecked && setSelectedAnswer(value)}
              >
                <div className={cn(
                  'rounded-full border-2 flex items-center justify-center shrink-0',
                  ui.radioCircle,
                  selectedAnswer === value && !hasChecked && 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40',
                  selectedAnswer === value &&
                    isCorrect &&
                    'border-green-600 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/30 dark:text-green-200',
                  selectedAnswer === value &&
                    isCorrect === false &&
                    'border-red-600 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-200'
                )}>
                  {selectedAnswer === value && hasChecked ? (
                    isCorrect ? <CheckCircle className={ui.feedbackIcon} /> : <XCircle className={ui.feedbackIcon} />
                  ) : null}
                </div>
                <span className={cn('font-semibold', ui.sc.body)}>{value === 'true' ? 'True' : 'False'}</span>
              </div>
            ))}
          </div>
        )}

        {/* Open Question */}
        {task.type === 'OPEN_ENDED' && (
          <div>
            <textarea
              className={cn(
                'w-full border-2 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all',
                ui.textareaMinH,
                ui.sc.body,
                hasChecked &&
                  isCorrect === true &&
                  'border-green-500 bg-green-50 text-green-900 dark:border-green-600 dark:bg-green-900/20 dark:text-green-100',
                hasChecked &&
                  isCorrect === false &&
                  'border-red-500 bg-red-50 text-red-900 dark:border-red-600 dark:bg-red-900/20 dark:text-red-100'
              )}
              placeholder="Type your answer..."
              value={openAnswer}
              onChange={(e) => setOpenAnswer(e.target.value)}
              disabled={hasChecked}
            />
            {hasChecked && !task.correctAnswer && (
              <p className={cn('mt-2 flex items-center gap-2', ui.helperMuted, 'text-amber-600 dark:text-amber-500')}>
                <Eye className={ui.feedbackIcon} />
                This task requires manual review. Click &quot;Show solution&quot; below.
              </p>
            )}
          </div>
        )}

        {/* Feedback */}
        {hasChecked && isCorrect !== null && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-600 text-green-900 dark:text-green-100' : 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 text-red-900 dark:text-red-100'}`}>
            <div className="flex items-center gap-3">
              {isCorrect ? <CheckCircle className={ui.feedbackIcon} /> : <XCircle className={ui.feedbackIcon} />}
              <span className={cn('font-semibold', ui.sc.body)}>{isCorrect ? 'Correct answer! 🎉' : 'Sorry, that is not correct'}</span>
              {isPending && <Loader2 className={cn('ml-2 animate-spin', ui.feedbackIcon)} />}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {!hasChecked && (
            <Button
              type="button"
              variant="hero"
              size={ui.buttonSize}
              className={cn('auth-hero-cta', ui.buttonText)}
              onClick={handleCheck}
              disabled={
                (task.type === 'MULTIPLE_CHOICE' || task.type === 'TRUE_FALSE') && !selectedAnswer ||
                task.type === 'OPEN_ENDED' && !openAnswer.trim()
              }
            >
              Check answer
            </Button>
          )}

          <Button
            type="button"
            size={ui.buttonSize}
            variant="outline"
            onClick={handleShowSolution}
            className={cn(
              'border-white/25 bg-white/10 backdrop-blur-sm hover:bg-white/15 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10',
              ui.buttonText,
            )}
          >
            {showSolution ? (
              <>
                <EyeOff className="mr-2 h-4 w-4 shrink-0" />
                Hide solution
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4 shrink-0" />
                Show solution
              </>
            )}
          </Button>

          {hasChecked && (
            <Button
              type="button"
              size={ui.buttonSize}
              variant="ghost"
              onClick={handleReset}
              className={cn('ml-auto', ui.buttonText)}
            >
              Reset
            </Button>
          )}
        </div>

        {/* Solution Panel */}
        {showSolution && (
          <>
            <Separator />
            <div className="space-y-4 pt-2">
              {/* Correct Answer */}
              {task.correctAnswer && (task.type === 'MULTIPLE_CHOICE' || task.type === 'TRUE_FALSE') && (
                <div className="block-bg border-l-4 border-green-500 p-4 rounded-r-lg">
                  <h4 className={cn(ui.sectionHeading, 'mb-2 flex items-center gap-2 text-green-900 dark:text-green-200')}>
                    <CheckCircle className={ui.feedbackIcon} />
                    Correct answer:
                  </h4>
                  <p className={cn(ui.sc.body, 'font-medium text-green-800 dark:text-green-100')}>
                    {task.type === 'TRUE_FALSE' 
                      ? (task.correctAnswer === 'true' ? 'True' : 'False')
                      : String(task.correctAnswer ?? '')
                    }
                  </p>
                </div>
              )}

              {/* Example Answer for OPEN_ENDED */}
              {task.type === 'OPEN_ENDED' && task.correctAnswer && (
                <div className="block-bg border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <h4 className={cn(ui.sectionHeading, 'mb-2 text-blue-900 dark:text-blue-200')}>
                    Sample answer:
                  </h4>
                  <p className={cn(ui.sc.body, 'whitespace-pre-wrap text-blue-800 dark:text-blue-100')}>{String(task.correctAnswer ?? '')}</p>
                </div>
              )}

              {/* Explanation */}
              {!!task.solution && (
                <div className="block-bg border-l-4 border-gray-400 p-4 rounded-r-lg">
                  <h4 className={cn(ui.sectionHeading, 'mb-3 text-gray-900 dark:text-gray-100')}>
                    Explanation:
                  </h4>
                  <div className={cn(ui.sc.body, 'text-gray-800 dark:text-gray-200')}>
                    <LexicalRichText content={task.solution} tier={tier} />
                  </div>
                </div>
              )}

              {/* Solution Media (Image) */}
              {task.solutionMedia && (
                <div className="bg-purple-50 dark:bg-purple-900/18 border-l-4 border-purple-500 dark:border-purple-600 p-4 rounded-r-lg">
                  <h4 className={cn(ui.sectionHeading, 'mb-3 text-purple-900 dark:text-purple-200')}>
                    📎 Explanation image:
                  </h4>
                  {renderMedia(task.solutionMedia, 'Explanation media')}
                </div>
              )}

              {/* Solution Video (YouTube) */}
              {task.solutionVideoUrl && (
                <div className="bg-purple-50 dark:bg-purple-900/18 border-l-4 border-purple-500 dark:border-purple-600 p-4 rounded-r-lg">
                  <h4 className={cn(ui.sectionHeading, 'mb-3 text-purple-900 dark:text-purple-200')}>
                    🎥 Explanation video:
                  </h4>
                  {(() => {
                    const embedUrl = getEmbedUrl(task.solutionVideoUrl)
                    if (embedUrl && isSafeDomain(task.solutionVideoUrl)) {
                      return (
                        <div className="relative w-full pt-[56.25%]">
                          <iframe
                            src={embedUrl}
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )
                    }
                    return <p className={cn(ui.sc.body, 'text-gray-600')}>Invalid video link</p>
                  })()}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      {/* Inline Difficulty Rating (shown under open-ended tasks after checking) */}
      {task.type === 'OPEN_ENDED' && hasChecked && difficultyRating == null && (
        <div
          className={cn(
            'mx-auto mt-4 w-full max-w-md rounded-xl border border-dashed p-4 backdrop-blur-md sm:max-w-lg',
            'border-slate-400/50 bg-white/[0.22] dark:border-white/25 dark:bg-white/[0.08]',
          )}
        >
          <h4 className={cn(ui.difficultyTitle, 'mb-2 text-gray-900 dark:text-white')}>
            How difficult was this task for you?
          </h4>
          <p
            className={cn(
              'mb-3 text-gray-600 dark:text-white/85',
              tier === 'large' ? 'text-base' : 'text-sm',
            )}
          >
            Your feedback helps us personalize your learning experience.
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleDifficultySubmit(value)}
                disabled={isPending}
                className={cn(
                  'rounded-xl border transition-colors',
                  ui.difficultyGridBtn,
                  isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                  difficultyRating === value
                    ? 'border-blue-500 bg-blue-50 text-gray-900 dark:border-blue-400/70 dark:bg-blue-500/25 dark:text-white'
                    : 'border-slate-300/70 bg-white/50 text-gray-900 hover:border-slate-400 dark:border-white/25 dark:bg-white/[0.1] dark:text-white dark:hover:border-white/40',
                )}
              >
                <div className={cn('text-center font-semibold text-gray-900 dark:text-white', ui.difficultyNumber)}>
                  {value}
                </div>
                <div
                  className={cn(
                    'mt-0.5 text-center text-gray-600 dark:text-white/80',
                    tier === 'large' ? 'text-sm' : 'text-xs',
                  )}
                >
                  {value === 1 ? 'Very Easy' : value === 2 ? 'Easy' : value === 3 ? 'Moderate' : value === 4 ? 'Hard' : 'Very Hard'}
                </div>
              </button>
            ))}
          </div>
          {/* Skip button removed per UX request */}
        </div>
      )}
    </Card>
  )
}
