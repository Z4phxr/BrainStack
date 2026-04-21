import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Navbar } from '@/components/navbar'
import { cn } from '@/lib/utils'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const isFullscreen = pathname.startsWith('/dashboard/flashcards/study')

  if (isFullscreen) {
    return (
      <div className="min-h-screen bg-background">
        <main className="min-w-0 overflow-x-hidden text-base leading-relaxed">{children}</main>
      </div>
    )
  }

  return (
    <div className="relative isolate min-h-dvh w-full">
      <div className="student-app-shell-bg" aria-hidden />
      <div className="student-app-shell">
        <Navbar />
        <main className="pt-[4.5rem] text-base leading-relaxed sm:pt-[4.75rem]">{children}</main>
      </div>
    </div>
  )
}
