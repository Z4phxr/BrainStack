import { Suspense } from 'react'
import { AdminFlashcardsPage } from './admin-flashcards-client'

export default function AdminFlashcardsRoutePage() {
  return (
    <Suspense fallback={null}>
      <AdminFlashcardsPage />
    </Suspense>
  )
}
