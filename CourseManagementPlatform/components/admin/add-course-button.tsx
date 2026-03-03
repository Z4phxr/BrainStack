"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function AddCourseButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCreate() {
    // Navigate to a client-side new course editor instead of creating on click
    setLoading(true)
    try {
      router.push('/admin/courses/new')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCreate} disabled={loading} variant="default">
      <Plus className="mr-2 h-4 w-4" />
      Add Course
    </Button>
  )
}
