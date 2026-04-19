'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { FormError, FieldError } from '@/components/ui/form-error'
import { ZodError } from 'zod'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { adminGlassCard, adminGlassOutlineButton } from '@/lib/student-glass-styles'

interface Subject {
  id: string
  name: string
  slug: string
}

export default function AdminSubjectsPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', slug: '' })
  const [error, setError] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const slugify = (s: string) =>
    s
      .toString()
      .trim()
      .toLowerCase()
      .replace(/["'`~!@#\$%\^&\*\(\)\+=\[\]{}\\|;:,<.>\/\?]+/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^[-]+|[-]+$/g, '')

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/subjects')
      if (res.ok) {
        const data = await res.json()
        setSubjects(data.subjects || [])
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      const url = editingId ? `/api/subjects?id=${editingId}` : '/api/subjects'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowForm(false)
        setEditingId(null)
        setFormData({ name: '', slug: '' })
        await fetchSubjects()
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save subject')
      }
    } catch (err: any) {
      // Handle Zod validation errors
      if (err?.name === 'ZodError' || err?.issues) {
        const zodError = err as ZodError
        const fieldErrs: Record<string, string> = {}
        const errorMessages: string[] = []
        
        zodError.issues.forEach((issue) => {
          const field = issue.path[0]?.toString() || 'unknown'
          const message = issue.message
          fieldErrs[field] = message
          errorMessages.push(message)
        })
        
        setFieldErrors(fieldErrs)
        setError(errorMessages.join(', '))
      } else {
        setError(err?.message || 'Failed to save subject')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id)
    setFormData({ name: subject.name, slug: subject.slug })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return

    setLoading(true)
    try {
    setError('')
    setFieldErrors({})
      const res = await fetch(`/api/subjects?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchSubjects()
        router.refresh()
      } else {
        alert('Failed to delete subject')
      }
    } catch (error) {
      alert('Error deleting subject')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', slug: '' })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">Subjects</h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400 md:text-lg">Manage course subjects</p>
        </div>
        {!showForm && (
          <Button variant="hero" className="auth-hero-cta" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add subject
          </Button>
        )}
      </div>

      {showForm && (
        <Card className={cn('border-0 shadow-none', adminGlassCard)}>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit subject' : 'Add new subject'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <FormError message={error} />}
              
              <div>
                <Label htmlFor="name">Subject name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value
                    setFormData({
                      ...formData,
                      name: newName,
                      slug: editingId ? formData.slug : slugify(newName),
                    })
                  }}
                  placeholder="e.g., Mathematics"
                  required
                  className="mt-2"
                />
                {fieldErrors.name && <FieldError message={fieldErrors.name} />}
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., mathematics"
                  required
                  className="mt-2"
                />
                {fieldErrors.slug && <FieldError message={fieldErrors.slug} />}
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="hero" className="auth-hero-cta" disabled={loading}>
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" className={cn(adminGlassOutlineButton)} onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className={cn('border-0 shadow-none', adminGlassCard)}>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">All subjects ({subjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && subjects.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">Loading...</p>
          ) : subjects.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No subjects yet. Add your first subject above.
            </p>
          ) : (
            <div className="space-y-2">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className={cn(
                    'flex items-center justify-between rounded-xl border p-4 shadow-sm backdrop-blur-md',
                    'border-slate-300/45 bg-white/[0.28] dark:border-white/12 dark:bg-white/[0.06] dark:shadow-none',
                  )}
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{subject.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{subject.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(adminGlassOutlineButton)}
                      onClick={() => handleEdit(subject)}
                      disabled={loading}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(subject.id)}
                      disabled={loading}
                      className="border-red-300/50 text-red-700 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
