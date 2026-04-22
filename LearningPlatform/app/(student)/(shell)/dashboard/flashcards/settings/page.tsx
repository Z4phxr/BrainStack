'use client'

/**
 * Student settings: reading/appearance (local) and SRS flashcard options (API).
 * Route: /dashboard/flashcards/settings
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Save, RotateCcw } from 'lucide-react'
import { LessonReadingSizeSettings } from '@/components/settings/lesson-reading-size'
import { studentGlassCard } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'

interface Settings {
  id:                 string
  newCardsPerDay:     number
  maxReviews:         number
  learningSteps:      string
  relearningSteps:    string
  graduatingInterval: number
  easyInterval:       number
  startingEase:       number
  masteredThreshold:  number
}

const DEFAULTS: Omit<Settings, 'id'> = {
  newCardsPerDay:     20,
  maxReviews:         200,
  learningSteps:      '1 10',
  relearningSteps:    '10',
  graduatingInterval: 1,
  easyInterval:       4,
  startingEase:       2.5,
  masteredThreshold:  21,
}

const FIELDS: {
  key:         keyof Omit<Settings, 'id'>
  label:       string
  hint:        string
  type:        'number' | 'text'
  min?:        number
  max?:        number
  step?:       number
  placeholder: string
}[] = [
  {
    key:         'newCardsPerDay',
    label:       'New cards per day',
    hint:        'Maximum number of new (never-seen) cards introduced per day in SRS mode.',
    type:        'number',
    min:         1,
    max:         9999,
    placeholder: '20',
  },
  {
    key:         'maxReviews',
    label:       'Max reviews per session',
    hint:        'Maximum number of due review/relearning cards per SRS session.',
    type:        'number',
    min:         1,
    max:         9999,
    placeholder: '200',
  },
  {
    key:         'learningSteps',
    label:       'Learning steps (minutes)',
    hint:        'Space-separated step durations in minutes. e.g. "1 10" means show again after 1 min, then 10 min before graduating.',
    type:        'text',
    placeholder: '1 10',
  },
  {
    key:         'relearningSteps',
    label:       'Relearning steps (minutes)',
    hint:        'Steps for cards that failed a review. e.g. "10" means show once after 10 min before returning to review.',
    type:        'text',
    placeholder: '10',
  },
  {
    key:         'graduatingInterval',
    label:       'Graduating interval (days)',
    hint:        'Days until first review after a card graduates from Learning with Good.',
    type:        'number',
    min:         1,
    max:         365,
    placeholder: '1',
  },
  {
    key:         'easyInterval',
    label:       'Easy interval (days)',
    hint:        'Days until first review after a card graduates from Learning with Easy.',
    type:        'number',
    min:         1,
    max:         365,
    placeholder: '4',
  },
  {
    key:         'startingEase',
    label:       'Starting ease factor',
    hint:        'Initial ease multiplier for new cards. 2.5 is the Anki default. Min 1.3.',
    type:        'number',
    min:         1.3,
    max:         9.99,
    step:        0.05,
    placeholder: '2.5',
  },
  {
    key:         'masteredThreshold',
    label:       'Mastered threshold (days)',
    hint:        'When a card\'s interval exceeds this value it is labelled "Mastered". It still appears for review normally.',
    type:        'number',
    min:         7,
    max:         3650,
    placeholder: '21',
  },
]

export default function FlashcardSettingsPage() {
  const [form,    setForm]    = useState<Omit<Settings, 'id'>>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/flashcard-settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          const { id: _id, createdAt: _c, updatedAt: _u, userId: _uid, ...rest } = d.settings
          setForm(rest as Omit<Settings, 'id'>)
        }
      })
      .catch(() => { /* use defaults */ })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/flashcard-settings', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error ?? 'Failed to save settings.' })
        return
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    if (!confirm('Reset all settings to defaults?')) return
    setForm(DEFAULTS)
    setMessage(null)
  }

  function setField<K extends keyof Omit<Settings, 'id'>>(key: K, value: Omit<Settings, 'id'>[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setMessage(null)
  }

  return (
    <div className="container mx-auto px-5 py-7 md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>


        <section aria-labelledby="settings-reading-heading" className="space-y-4">
          <div>
            <h2
              id="settings-reading-heading"
              className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-3xl"
            >
              Reading & appearance
            </h2>
            <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-400 md:text-lg">
                How large lesson theory and Markdown text blocks appear. 
            </p>
          </div>
          <div className="space-y-4 md:space-y-5">
            <LessonReadingSizeSettings />
           
          </div>
        </section>

        <section
          aria-labelledby="settings-srs-heading"
          className="space-y-4 border-t border-slate-200/80 pt-8 dark:border-white/10 md:pt-10"
        >
          <div>
            <h2
              id="settings-srs-heading"
              className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-3xl"
            >
              Spaced repetition (SRS)
            </h2>
            <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-400 md:text-lg">
              Fine-tune how flashcards are scheduled in SRS mode. Changes apply to new study sessions.
            </p>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-base text-gray-500 dark:text-gray-400 md:text-lg">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading settings…
            </div>
          )}

          {!loading && (
            <form onSubmit={handleSave} className="space-y-6 md:space-y-8">
              <Card className={cn('border-0 shadow-none', studentGlassCard)}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Daily limits
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 pt-0 sm:grid-cols-2">
                  {FIELDS.filter((f) => f.key === 'newCardsPerDay' || f.key === 'maxReviews').map((field) => (
                    <FormField
                      key={field.key}
                      field={field}
                      value={form[field.key] as string | number}
                      onChange={(v) => setField(field.key, v as never)}
                    />
                  ))}
                </CardContent>
              </Card>

              <Card className={cn('border-0 shadow-none', studentGlassCard)}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Learning steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 pt-0 sm:grid-cols-2">
                  {FIELDS.filter((f) =>
                    f.key === 'learningSteps' ||
                    f.key === 'relearningSteps' ||
                    f.key === 'graduatingInterval' ||
                    f.key === 'easyInterval'
                  ).map((field) => (
                    <FormField
                      key={field.key}
                      field={field}
                      value={form[field.key] as string | number}
                      onChange={(v) => setField(field.key, v as never)}
                    />
                  ))}
                </CardContent>
              </Card>

              <Card className={cn('border-0 shadow-none', studentGlassCard)}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Algorithm tuning
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 pt-0 sm:grid-cols-2">
                  {FIELDS.filter((f) =>
                    f.key === 'startingEase' || f.key === 'masteredThreshold'
                  ).map((field) => (
                    <FormField
                      key={field.key}
                      field={field}
                      value={form[field.key] as string | number}
                      onChange={(v) => setField(field.key, v as never)}
                    />
                  ))}
                </CardContent>
              </Card>

              {message && (
                <div className={
                  message.type === 'success'
                    ? 'rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400'
                }>
                  {message.text}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="border-slate-300/60 bg-white/20 backdrop-blur-sm dark:border-white/20 dark:bg-white/5"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to defaults
                </Button>

                <Button type="submit" variant="hero" className="auth-hero-cta" disabled={saving}>
                  {saving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" />Save settings</>
                  )}
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

// --- Form field ---

function FormField({
  field,
  value,
  onChange,
}: {
  field: typeof FIELDS[number]
  value: string | number
  onChange: (v: string | number) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.key} className="font-medium">
        {field.label}
      </Label>
      <Input
        id={field.key}
        type={field.type}
        min={field.min}
        max={field.max}
        step={field.step ?? (field.type === 'number' ? 1 : undefined)}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => {
          if (field.type === 'number') {
            onChange(field.step ? parseFloat(e.target.value) : parseInt(e.target.value, 10))
          } else {
            onChange(e.target.value)
          }
        }}
        className="font-mono"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400">{field.hint}</p>
    </div>
  )
}

