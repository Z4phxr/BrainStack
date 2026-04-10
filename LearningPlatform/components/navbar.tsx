import Link from 'next/link';
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
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          BrainStack
        </Link>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {initial}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-100">
                  {displayName ?? 'Account'}
                </span>
              </div>
              {session.user?.role === 'ADMIN' && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/dashboard">Admin dashboard</Link>
                </Button>
              )}
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild size="sm">
                <Link href="/register">Get started</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
