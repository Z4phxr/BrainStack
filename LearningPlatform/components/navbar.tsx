import Link from 'next/link';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/auth';
import { signOut } from '@/auth';
import ThemeToggle from '@/components/theme-toggle';

export async function Navbar() {
  const session = await auth();
  const displayName = session?.user?.name ?? null
  const initial = (displayName ?? session?.user?.email ?? 'A')[0]?.toUpperCase()

  return (
    <nav className="border-b dark:border-gray-700 block-contrast">
      <div className="container mx-auto flex min-h-[4.25rem] items-center justify-between gap-4 px-4 py-3 sm:min-h-[4.5rem] sm:py-4">
        <Link
          href="/dashboard"
          className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl"
        >
          BrainStack
        </Link>
        
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 md:gap-4">
          {session ? (
            <>
              {/* Order: user → theme → settings → (admin) → sign out */}
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-base font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                  aria-hidden
                >
                  {initial}
                </div>
                <span className="max-w-[10rem] truncate text-base text-gray-700 dark:text-gray-100 sm:max-w-[14rem] md:max-w-none">
                  {displayName ?? 'Account'}
                </span>
              </div>
              <ThemeToggle />
              <Button asChild variant="ghost" size="icon-lg" aria-label="Settings">
                <Link href="/dashboard/flashcards/settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
              {session.user?.role === 'ADMIN' && (
                <Button asChild variant="outline" size="default" className="text-base">
                  <Link href="/admin/dashboard">Admin dashboard</Link>
                </Button>
              )}
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <Button type="submit" variant="outline" size="default" className="text-base">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Button asChild size="default" className="text-base">
                <Link href="/register">Get started</Link>
              </Button>
              <Button asChild variant="outline" size="default" className="text-base">
                <Link href="/login">Sign in</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
