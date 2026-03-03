'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, ChevronUp, ChevronDown, Pencil } from 'lucide-react'
import { deleteTask } from '@/app/(admin)/admin/actions'
import { extractText } from '@/lib/lexical'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Task {
  id: string
  type: string
  prompt: unknown // Rich text (Lexical format)
  choices?: Array<{ text: string }>
  correctAnswer?: string
  points: number
  order: number
  isPublished: boolean
}

export function TasksList({ tasks, onEdit }: { tasks: Task[]; onEdit?: (task: Task) => void }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    setLoading(id)
    try {
      await deleteTask(id)
      router.refresh()
    } catch {
      alert('Failed to delete task')
    } finally {
      setLoading(null)
    }
  }

  if (tasks.length === 0) {
    return <p className="py-8 text-center text-gray-500 dark:text-gray-400">No tasks yet. Add the first one.</p>
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="rounded-lg border dark:border-gray-700 p-4 block-bg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {task.type === 'MULTIPLE_CHOICE' && 'Multiple choice'}
                  {task.type === 'OPEN_ENDED' && 'Open-ended'}
                  {task.type === 'TRUE_FALSE' && 'True/False'}
                </Badge>
                <Badge variant={task.isPublished ? 'default' : 'secondary'} className="text-xs">
                  {task.isPublished ? 'Published' : 'Draft'}
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">{task.points} pts</span>
              </div>

              <p className="mt-2 font-medium dark:text-gray-100">{extractText(task.prompt)}</p>

              {task.type === 'MULTIPLE_CHOICE' && task.choices && (
                <div className="mt-2 space-y-1">
                  {task.choices.map((choice, i) => (
                    <div
                      key={i}
                      className={`text-sm ${
                        choice.text === task.correctAnswer
                          ? 'font-medium text-green-600 dark:text-green-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {String.fromCharCode(65 + i)}. {choice.text}
                      {choice.text === task.correctAnswer && ' ✓'}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="sm" onClick={() => onEdit?.(task)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" disabled>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" disabled>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(task.id)}
                disabled={loading === task.id}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
