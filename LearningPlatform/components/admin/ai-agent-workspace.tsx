'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bot, Send, Sparkles, Wand2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { adminGlassCard, adminGlassOutlineButton } from '@/lib/student-glass-styles'

type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
type Provider = 'anthropic' | 'openai'

type DiscoveryForm = {
  topic: string
  title: string
  level: Level
  currentKnowledge: 'beginner' | 'novice' | 'intermediate' | 'advanced'
  learningWhy: 'job' | 'project' | 'school' | 'professional' | 'hobby'
  depth: 'overview' | 'foundation' | 'deep' | 'expert'
  timeBudget: 'week30' | 'month1h' | 'months2h' | 'selfpaced'
  focusAreas: string
  wantFlashcards: boolean
  flashcardTarget: '50' | '100' | '200'
  model: string
}

type Draft = {
  subject: { name: string; slug: string }
  course: { title: string; slug: string; description: string; level: Level }
  tags: Array<{ name: string; slug: string }>
  modules: Array<{
    title: string
    order: number
    lessons: Array<{
      title: string
      order: number
      learningGoal: string
      targetTheoryBlocks: number
      targetTasks: number
    }>
  }>
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

type Run = {
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  timeline: Array<{ id: string; label: string; status: 'pending' | 'running' | 'done' | 'error'; detail?: string }>
  result?: Record<string, unknown>
  error?: string
}

const defaultForm: DiscoveryForm = {
  topic: '',
  title: '',
  level: 'BEGINNER',
  currentKnowledge: 'beginner',
  learningWhy: 'job',
  depth: 'foundation',
  timeBudget: 'month1h',
  focusAreas: '',
  wantFlashcards: false,
  flashcardTarget: '50',
  model: 'claude-sonnet-4-5',
}

function providerFromModel(model: string): Provider {
  if (model.startsWith('gpt-')) return 'openai'
  return 'anthropic'
}

function draftSummary(draft: Draft): string {
  const moduleCount = draft.modules.length
  const lessonCount = draft.modules.reduce((acc, m) => acc + m.lessons.length, 0)
  return `Draft ready: ${draft.course.title} (${moduleCount} modules, ${lessonCount} lessons).`
}

export function AIAgentWorkspace() {
  const [form, setForm] = useState<DiscoveryForm>(defaultForm)
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [error, setError] = useState('')
  const [loadingDraft, setLoadingDraft] = useState(false)
  const [startingRun, setStartingRun] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [run, setRun] = useState<Run | null>(null)
  const [lastRunStatusNotified, setLastRunStatusNotified] = useState<Run['status'] | null>(null)

  const discoveryPayload = useMemo(
    () => ({
      ...form,
      provider: providerFromModel(form.model),
      title: form.title.trim() || undefined,
      focusAreas: form.focusAreas.trim() || undefined,
      model: form.model.trim() || undefined,
      level: form.level,
    }),
    [form],
  )

  async function requestDraft(customMessage?: string) {
    const userMessage = (customMessage ?? prompt).trim()
    if (!form.topic.trim()) {
      setError('Please provide what the course is about.')
      return
    }
    if (!userMessage) {
      setError('Write a prompt so the AI can generate or revise structure.')
      return
    }
    setError('')
    setLoadingDraft(true)
    try {
      setChat((prev) => [...prev, { role: 'user', content: userMessage }])
      setChat((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Starting draft generation for topic "${form.topic.trim() || 'your topic'}"...`,
        },
      ])
      setPrompt('')
      const res = await fetch('/api/admin/ai-agent/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discovery: discoveryPayload,
          userMessage,
          currentDraft: draft ?? undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to generate draft')
      setDraft(data.draft)
      setChat((prev) => [...prev, { role: 'assistant', content: draftSummary(data.draft) }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate draft')
    } finally {
      setLoadingDraft(false)
    }
  }

  async function acceptDraft() {
    if (!draft) {
      setError('Generate and review draft first.')
      return
    }
    setError('')
    setStartingRun(true)
    try {
      setChat((prev) => [
        ...prev,
        { role: 'user', content: 'Generate full course from this approved structure.' },
        { role: 'assistant', content: 'Starting generation from approved draft...' },
      ])

      const body = JSON.stringify({
        discovery: discoveryPayload,
        draft,
      })

      let data: any = null
      let started = false

      for (let attempt = 1; attempt <= 2; attempt++) {
        const res = await fetch('/api/admin/ai-agent/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        })
        data = await res.json().catch(() => ({}))
        if (res.ok) {
          started = true
          break
        }
        // Dev first-hit race sometimes fails while endpoint recompiles; retry once.
        if (attempt === 1 && res.status >= 500) {
          await new Promise((resolve) => setTimeout(resolve, 700))
          continue
        }
        throw new Error(data?.error || 'Failed to start generation')
      }

      if (!started) {
        throw new Error(data?.error || 'Failed to start generation')
      }
      setRunId(data.runId)
      setRun(null)
      setLastRunStatusNotified(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start generation')
    } finally {
      setStartingRun(false)
    }
  }

  useEffect(() => {
    if (!runId) return
    let active = true
    let timer: ReturnType<typeof setInterval> | null = null
    const poll = async () => {
      try {
        const res = await fetch(`/api/admin/ai-agent/progress/${runId}`, { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (res.status === 404) {
          if (!active) return
          setRun({
            status: 'failed',
            progress: 0,
            timeline: [
              {
                id: 'missing-run',
                label: 'Generation run not found',
                status: 'error',
                detail: 'This in-memory run likely expired after a dev reload. Start generation again.',
              },
            ],
            error: 'Run not found',
          })
          if (timer) clearInterval(timer)
          return
        }
        if (!res.ok) throw new Error(data?.error || 'Failed to load progress')
        if (!active) return
        setRun(data.run)
        if (data.run.status === 'completed' || data.run.status === 'failed') {
          if (timer) clearInterval(timer)
        }
      } catch {
        // Keep polling on transient errors.
      }
    }
    timer = setInterval(() => {
      void poll()
    }, 1500)
    void poll()
    return () => {
      active = false
      if (timer) clearInterval(timer)
    }
  }, [runId])

  useEffect(() => {
    if (!run?.status) return
    if (lastRunStatusNotified === run.status) return

    if (run.status === 'completed') {
      setChat((prev) => [...prev, { role: 'assistant', content: 'Generation completed successfully.' }])
      setLastRunStatusNotified('completed')
      return
    }

    if (run.status === 'failed') {
      const detail = run.error ? ` ${run.error}` : ''
      setChat((prev) => [...prev, { role: 'assistant', content: `Generation failed.${detail}` }])
      setLastRunStatusNotified('failed')
      return
    }

    if (run.status === 'running') {
      setLastRunStatusNotified('running')
    }
  }, [run, lastRunStatusNotified])

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
      <Card className={cn('border-0 shadow-none xl:col-span-5', adminGlassCard)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Sparkles className="h-5 w-5" />
            AI Agent Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topic">What is the course about?</Label>
            <Input
              id="topic"
              value={form.topic}
              onChange={(e) => setForm((v) => ({ ...v, topic: e.target.value }))}
              placeholder="e.g. Docker for web developers"
            />
          </div>

          <div>
            <Label htmlFor="title">Course title (optional)</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
              placeholder="Leave empty and AI will propose one"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Level</Label>
              <select
                className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm"
                value={form.level}
                onChange={(e) => setForm((v) => ({ ...v, level: e.target.value as Level }))}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <Label>Current knowledge</Label>
              <select
                className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm"
                value={form.currentKnowledge}
                onChange={(e) => setForm((v) => ({ ...v, currentKnowledge: e.target.value as DiscoveryForm['currentKnowledge'] }))}
              >
                <option value="beginner">Complete beginner</option>
                <option value="novice">Novice</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <Label>Learning goal</Label>
              <select
                className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm"
                value={form.learningWhy}
                onChange={(e) => setForm((v) => ({ ...v, learningWhy: e.target.value as DiscoveryForm['learningWhy'] }))}
              >
                <option value="job">Job / interview</option>
                <option value="project">Personal project</option>
                <option value="school">School / university</option>
                <option value="professional">Professional development</option>
                <option value="hobby">Hobby / interest</option>
              </select>
            </div>
            <div>
              <Label>Depth</Label>
              <select
                className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm"
                value={form.depth}
                onChange={(e) => setForm((v) => ({ ...v, depth: e.target.value as DiscoveryForm['depth'] }))}
              >
                <option value="overview">Quick overview</option>
                <option value="foundation">Solid foundation</option>
                <option value="deep">Deep dive</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <Label>Time budget</Label>
              <select
                className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm"
                value={form.timeBudget}
                onChange={(e) => setForm((v) => ({ ...v, timeBudget: e.target.value as DiscoveryForm['timeBudget'] }))}
              >
                <option value="week30">30 min/day for 1 week</option>
                <option value="month1h">1 hour/day for 1 month</option>
                <option value="months2h">2 hours/day for 3 months</option>
                <option value="selfpaced">Self-paced</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="model">Model</Label>
            <select
              id="model"
              value={form.model}
              onChange={(e) => setForm((v) => ({ ...v, model: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-input bg-background p-2 text-sm"
            >
              <option value="claude-sonnet-4-5">Claude Sonnet 4.5</option>
              <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
              <option value="gpt-4.1">ChatGPT (GPT-4.1)</option>
            </select>
          </div>

          <div>
            <Label htmlFor="focusAreas">Focus areas (optional)</Label>
            <textarea
              id="focusAreas"
              value={form.focusAreas}
              onChange={(e) => setForm((v) => ({ ...v, focusAreas: e.target.value }))}
              className="mt-1 min-h-[80px] w-full rounded-md border border-input bg-background p-2 text-sm"
              placeholder="Specific concepts to prioritize"
            />
          </div>

          <div className="rounded-md border border-input p-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="wantFlashcards">Generate flashcards</Label>
              <input
                id="wantFlashcards"
                type="checkbox"
                checked={form.wantFlashcards}
                onChange={(e) => setForm((v) => ({ ...v, wantFlashcards: e.target.checked }))}
              />
            </div>
            {form.wantFlashcards ? (
              <select
                className="mt-3 block w-full rounded-md border border-input bg-background p-2 text-sm"
                value={form.flashcardTarget}
                onChange={(e) => setForm((v) => ({ ...v, flashcardTarget: e.target.value as '50' | '100' | '200' }))}
              >
                <option value="50">~50 cards</option>
                <option value="100">~100 cards</option>
                <option value="200">~200 cards</option>
              </select>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Button
              variant="hero"
              className="auth-hero-cta flex-1"
              onClick={() => requestDraft(`Generate draft structure for topic: ${form.topic}`)}
              disabled={loadingDraft}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {loadingDraft ? 'Generating draft...' : 'Generate Draft'}
            </Button>
            <Button
              variant="outline"
              className={cn('flex-1', adminGlassOutlineButton)}
              onClick={acceptDraft}
              disabled={!draft || startingRun}
            >
              {startingRun ? 'Starting...' : 'Accept and Generate'}
            </Button>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </CardContent>
      </Card>

      <div className="space-y-8 xl:col-span-7">
        <Card className={cn('border-0 shadow-none', adminGlassCard)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Bot className="h-5 w-5" />
              AI Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 max-h-[320px] space-y-3 overflow-auto rounded-xl border border-slate-300/40 bg-white/[0.12] p-3 backdrop-blur-md dark:border-white/12 dark:bg-white/[0.05]">
              {chat.length === 0 ? (
                <p className="text-sm text-muted-foreground">No messages yet. Generate a draft or type a follow-up instruction.</p>
              ) : (
                chat.map((m, i) => (
                  <div
                    key={`${m.role}-${i}`}
                    className={cn(
                      'max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm',
                      m.role === 'user'
                        ? 'ml-auto border border-primary/35 bg-primary/90 text-primary-foreground backdrop-blur-sm dark:bg-primary/80'
                        : 'border border-slate-200/50 bg-white/[0.35] text-foreground backdrop-blur-md dark:border-white/10 dark:bg-white/[0.08]',
                    )}
                  >
                    {m.content}
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g. "Change module 2 to be more practical"'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void requestDraft()
                  }
                }}
              />
              <Button variant="hero" className="auth-hero-cta shrink-0" size="icon" onClick={() => requestDraft()} disabled={loadingDraft}>
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 border-t pt-4">
              <p className="mb-2 text-sm font-medium">Generation timeline</p>
              {!run ? (
                <p className="text-sm text-muted-foreground">No active run yet.</p>
              ) : (
                <div className="space-y-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${run.progress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Status: <span className="font-medium">{run.status}</span> - {run.progress}%
                  </p>
                  <div className="space-y-2">
                    {run.timeline.map((t) => (
                      <div key={t.id} className="rounded-md border p-2 text-sm">
                        <p className="font-medium">{t.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.status}
                          {t.detail ? ` - ${t.detail}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                  {run.error ? <p className="text-sm text-red-600">{run.error}</p> : null}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={cn('border-0 shadow-none', adminGlassCard)}>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Draft Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!draft ? (
              <p className="text-sm text-muted-foreground">Draft will appear here after generation.</p>
            ) : (
              <>
                <div className="rounded-md border p-3">
                  <p className="text-sm font-medium">{draft.course.title}</p>
                  <p className="text-xs text-muted-foreground">{draft.subject.name} - {draft.course.level}</p>
                </div>
                <div className="space-y-2">
                  {draft.modules.map((m) => (
                    <div key={m.order} className="rounded-md border p-3">
                      <p className="text-sm font-medium">
                        {m.order}. {m.title}
                      </p>
                      <ul className="mt-1 list-disc pl-5 text-xs text-muted-foreground">
                        {m.lessons.map((l) => (
                          <li key={l.order}>
                            {m.order}.{l.order} {l.title} ({l.targetTheoryBlocks} blocks, {l.targetTasks} tasks)
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
