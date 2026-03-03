'use client'

import React, { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { submitTaskAnswer } from '@/app/actions/progress'

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

// Helper: Simple comparison for OPEN_ENDED (MVP)
function compareAnswers(userAnswer: string, correctAnswer: string): boolean {
  const normalize = (str: string) => str.trim().toLowerCase()
  return normalize(userAnswer) === normalize(correctAnswer)
}

// Helper: Render rich text (prompt or solution)
function renderRichText(content: unknown): React.ReactNode {
  if (!content) return null
  
  // Helper: render text with preserved newlines
  const renderTextWithLineBreaks = (text?: string) => {
    if (!text) return null
    const parts = text.split('\n')
    return parts.map((part, idx) => (
      // keep keys stable for small lists
      <React.Fragment key={idx}>
        {part}
        {idx < parts.length - 1 && <br />}
      </React.Fragment>
    ))
  }

  // If content is a string
  if (typeof content === 'string') {
    return <p className="whitespace-pre-wrap">{renderTextWithLineBreaks(content)}</p>
  }
  
  // If it's Payload rich text (root object with children)
  if (typeof content === 'object' && content !== null) {
    const root = (content as { root?: { children?: Array<Record<string, unknown>> } }).root
    if (root && Array.isArray(root.children)) {
      return (
        <div className="prose prose-sm max-w-none">
          {root.children.map((node, i) => {
            const nodeType = node.type as string | undefined
            const nodeChildren = node.children as Array<Record<string, unknown>> | undefined
            if (nodeType === 'heading') {
              const level = (node.tag as string | undefined) || 'h2'
              const Tag = level as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
              return (
                <Tag key={i} className={level === 'h2' ? 'text-xl font-bold mt-4 mb-2' : 'text-lg font-semibold mt-3 mb-2'}>
                  {nodeChildren?.map((child, j) => {
                    const childText = child.text as string | undefined
                    if (child.bold) return <strong key={j}>{childText}</strong>
                    if (child.italic) return <em key={j}>{childText}</em>
                    return <span key={j}>{childText}</span>
                  })}
                </Tag>
              )
            }
            if (nodeType === 'paragraph') {
              return (
                <p key={i} className="mb-2">
                  {nodeChildren?.map((child, j) => {
                    const childText = child.text as string | undefined
                    if (child.bold) return <strong key={j}>{renderTextWithLineBreaks(childText)}</strong>
                    if (child.italic) return <em key={j}>{renderTextWithLineBreaks(childText)}</em>
                    if (child.type === 'link') {
                      const childUrl = child.url as string | undefined
                      const linkChildren = child.children as Array<Record<string, unknown>> | undefined
                      return (
                        <a key={j} href={childUrl} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                          {linkChildren?.map((c) => renderTextWithLineBreaks(c.text as string | undefined))}
                        </a>
                      )
                    }
                    return <span key={j}>{renderTextWithLineBreaks(childText)}</span>
                  })}
                </p>
              )
            }
            if (nodeType === 'list') {
              const listType = node.listType as string | undefined
              const ListTag = listType === 'number' ? 'ol' : 'ul'
              return (
                <ListTag key={i} className={listType === 'number' ? 'list-decimal pl-6 mb-2' : 'list-disc pl-6 mb-2'}>
                  {nodeChildren?.map((item, j) => (
                    <li key={j}>
                      {(item.children as Array<Record<string, unknown>> | undefined)?.map((child) => {
                        if (child.type === 'paragraph') {
                          const paragraphChildren = child.children as Array<Record<string, unknown>> | undefined
                          return paragraphChildren?.map((c) => c.text as string | undefined).join('')
                        }
                        return child.text as string | undefined
                      })}
                    </li>
                  ))}
                </ListTag>
              )
            }
            return null
          })}
        </div>
      )
    }
  }
  
  // Fallback for old array format
  if (Array.isArray(content)) {
    return (
      <div className="prose prose-sm max-w-none">
        {content.map((node, i) => {
          const nodeItem = node as Record<string, unknown>
          if (nodeItem.type === 'paragraph') {
            return (
              <p key={i}>
                {(nodeItem.children as Array<Record<string, unknown>> | undefined)?.map((child, j) => (
                  <span key={j}>{child.text as string | undefined}</span>
                ))}
              </p>
            )
          }
          return null
        })}
      </div>
    )
  }
  
  return <p className="text-gray-500 text-sm">Content in an unrecognized format</p>
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
  // Initialize state from userProgress if available
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    userProgress?.submittedAnswer || null
  )
  const [openAnswer, setOpenAnswer] = useState(userProgress?.submittedAnswer || '')
  const [hasChecked, setHasChecked] = useState(!!userProgress)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(userProgress?.isCorrect ?? null)
  const [showSolution, setShowSolution] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showDifficultyDialog, setShowDifficultyDialog] = useState(false)
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

  const getOptionClassName = (optionText: string) => {
    if (!hasChecked) return 'border-gray-300 hover:bg-[var(--block-bg)] cursor-pointer'
    
    const isSelected = selectedAnswer === optionText
    const isCorrectOption = optionText === task.correctAnswer
    
    if (isSelected && isCorrect) {
      return 'border-green-500 bg-green-50 text-green-900'
    }
    if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-50 text-red-900'
    }
    if (showSolution && isCorrectOption) {
      return 'border-green-500 bg-green-50 text-green-900'
    }
    
    return 'border-gray-300 opacity-60'
  }

  return (
    <Card>
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
        <div className="prose max-w-none">
          {renderRichText(task.prompt)}
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
                  'flex items-center gap-3 p-3 border-2 rounded-lg transition-all',
                  getOptionClassName(choice.text),
                  !hasChecked && 'hover:border-blue-300'
                )}
                onClick={() => !hasChecked && setSelectedAnswer(choice.text)}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold shrink-0',
                  selectedAnswer === choice.text && !hasChecked && 'border-blue-500 bg-blue-50',
                  selectedAnswer === choice.text && isCorrect && 'border-green-600 bg-green-500 text-white',
                  selectedAnswer === choice.text && isCorrect === false && 'border-red-600 bg-red-500 text-white'
                )}>
                  {selectedAnswer === choice.text && hasChecked ? (
                    isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </div>
                <span className="flex-1">{choice.text}</span>
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
                  'flex items-center gap-3 p-3 border-2 rounded-lg transition-all',
                  getOptionClassName(value),
                  !hasChecked && 'hover:border-blue-300'
                )}
                onClick={() => !hasChecked && setSelectedAnswer(value)}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0',
                  selectedAnswer === value && !hasChecked && 'border-blue-500 bg-blue-50',
                  selectedAnswer === value && isCorrect && 'border-green-600 bg-green-500 text-white',
                  selectedAnswer === value && isCorrect === false && 'border-red-600 bg-red-500 text-white'
                )}>
                  {selectedAnswer === value && hasChecked ? (
                    isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
                  ) : null}
                </div>
                <span className="font-semibold">{value === 'true' ? 'True' : 'False'}</span>
              </div>
            ))}
          </div>
        )}

        {/* Open Question */}
        {task.type === 'OPEN_ENDED' && (
          <div>
            <textarea
              className={cn(
                'w-full p-3 border-2 rounded-lg min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all',
                hasChecked && isCorrect === true && 'border-green-500 bg-green-50',
                hasChecked && isCorrect === false && 'border-red-500 bg-red-50'
              )}
              placeholder="Type your answer..."
              value={openAnswer}
              onChange={(e) => setOpenAnswer(e.target.value)}
              disabled={hasChecked}
            />
            {hasChecked && !task.correctAnswer && (
              <p className="mt-2 text-sm text-amber-600 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                This task requires manual review. Click &quot;Show solution&quot; below.
              </p>
            )}
          </div>
        )}

        {/* Feedback */}
        {hasChecked && isCorrect !== null && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-600 text-green-900 dark:text-green-100' : 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 text-red-900 dark:text-red-100'}`}>
            <div className="flex items-center gap-3">
              {isCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              <span className="font-semibold">{isCorrect ? 'Correct answer! 🎉' : 'Sorry, that is not correct'}</span>
              {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!hasChecked && (
            <Button 
              onClick={handleCheck}
              disabled={
                (task.type === 'MULTIPLE_CHOICE' || task.type === 'TRUE_FALSE') && !selectedAnswer ||
                task.type === 'OPEN_ENDED' && !openAnswer.trim()
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              Check answer
            </Button>
          )}
          
            <Button 
            variant="outline" 
            onClick={handleShowSolution}
            className="text-blue-600 border-blue-300 hover:bg-[var(--block-bg)]"
          >
            {showSolution ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide solution
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show solution
              </>
            )}
          </Button>

          {hasChecked && (
            <Button 
              variant="ghost" 
              onClick={handleReset}
              className="ml-auto"
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
                  <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Correct answer:
                  </h4>
                  <p className="text-green-800 dark:text-green-100 font-medium">
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
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Sample answer:
                  </h4>
                  <p className="text-blue-800 dark:text-blue-100 whitespace-pre-wrap">{String(task.correctAnswer ?? '')}</p>
                </div>
              )}

              {/* Explanation */}
              {!!task.solution && (
                <div className="block-bg border-l-4 border-gray-400 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Explanation:
                  </h4>
                  <div className="text-gray-800 dark:text-gray-200">
                    {renderRichText(task.solution)}
                  </div>
                </div>
              )}

              {/* Solution Media (Image) */}
              {task.solutionMedia && (
                <div className="bg-purple-50 dark:bg-purple-900/18 border-l-4 border-purple-500 dark:border-purple-600 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-3">
                    📎 Explanation image:
                  </h4>
                  {renderMedia(task.solutionMedia, 'Explanation media')}
                </div>
              )}

              {/* Solution Video (YouTube) */}
              {task.solutionVideoUrl && (
                <div className="bg-purple-50 dark:bg-purple-900/18 border-l-4 border-purple-500 dark:border-purple-600 p-4 rounded-r-lg">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-3">
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
                    return <p className="text-sm text-gray-600">Invalid video link</p>
                  })()}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      {/* Inline Difficulty Rating (shown under open-ended tasks after checking) */}
      {task.type === 'OPEN_ENDED' && hasChecked && difficultyRating == null && (
        <div className="mt-4 p-4 rounded-lg border border-dashed bg-white dark:bg-gray-800">
          <h4 className="font-semibold mb-2">How difficult was this task for you?</h4>
          <p className="text-sm text-gray-600 mb-3">Your feedback helps us personalize your learning experience.</p>
          <div className="grid grid-cols-5 gap-2">
            {[1,2,3,4,5].map((value) => (
              <button
                key={value}
                onClick={() => handleDifficultySubmit(value)}
                disabled={isPending}
                className={`p-2 rounded-lg border transition-colors ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${difficultyRating === value ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <div className="text-center text-sm font-medium">{value}</div>
                <div className="text-xs text-gray-500">{value === 1 ? 'Very Easy' : value === 2 ? 'Easy' : value === 3 ? 'Moderate' : value === 4 ? 'Hard' : 'Very Hard'}</div>
              </button>
            ))}
          </div>
          {/* Skip button removed per UX request */}
        </div>
      )}
    </Card>
  )
}
