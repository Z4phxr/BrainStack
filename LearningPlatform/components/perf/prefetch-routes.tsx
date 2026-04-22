'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const ROUTES_TO_PREFETCH = [
  '/login',
  '/register',
  '/courses',
  '/dashboard',
  '/creative-space',
  '/admin/login',
  '/admin/dashboard',
]

export function PrefetchRoutes() {
  const router = useRouter()

  useEffect(() => {
    ROUTES_TO_PREFETCH.forEach((route) => {
      router.prefetch(route)
    })
  }, [router])

  return null
}
