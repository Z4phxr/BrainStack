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

  return (
    <>
      {!isFullscreen && <Navbar />}
      <main
        className={cn(
          'min-h-screen bg-background',
          isFullscreen && 'min-w-0 overflow-x-hidden',
        )}
      >
        {children}
      </main>
    </>
  );
}
