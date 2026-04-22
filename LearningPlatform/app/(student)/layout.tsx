import { auth } from '@/auth'
import { redirect } from 'next/navigation'

/**
 * Student area: session gate only. Navbar + chrome live in `(shell)/layout.tsx`.
 * The whiteboard at `/creative-space/[spaceId]` stays outside `(shell)` so it never
 * picks up the navbar (no reliance on `x-pathname`, which is missing on some RSC requests).
 */
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  return <>{children}</>
}
