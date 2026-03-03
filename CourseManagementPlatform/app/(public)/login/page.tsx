'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DarkBackground from '@/components/DarkBackground';
import useIsDark from '@/components/useIsDark';
import ThemeToggle from '@/components/theme-toggle';
import Link from 'next/link';
import { Home } from 'lucide-react';

function LoginForm() {
  const isDark = useIsDark();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  // Prevent open redirect: only allow relative paths starting with /
  // Disallow protocol-relative URLs like //evil.com
  const safeCallbackUrl =
    typeof callbackUrl === 'string' &&
    callbackUrl.startsWith('/') &&
    !callbackUrl.startsWith('//')
      ? callbackUrl
      : '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push(safeCallbackUrl);
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white/10 dark:bg-white/10 backdrop-blur-lg border border-white/20">
          <CardHeader className="space-y-1">
            <CardTitle className={`text-2xl font-bold text-center ${isDark ? 'text-white' : 'text-black'}`}>Sign in</CardTitle>
            <CardDescription className={`text-center ${isDark ? 'text-white' : 'text-black'}`}>Enter your details to continue</CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className={isDark ? 'text-white' : 'text-black'}>Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className={`${isDark ? 'text-white placeholder:text-white/60' : 'text-black placeholder:text-black/60'} bg-transparent`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className={isDark ? 'text-white' : 'text-black'}>Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className={`${isDark ? 'text-white placeholder:text-white/60' : 'text-black placeholder:text-black/60'} bg-transparent`}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className={`w-full btn-themed opacity-80`} 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className={`mb-2 ${isDark ? 'text-white' : 'text-black'}`}>New here?</p>
            <button
              type="button"
              className={`${isDark ? 'text-white' : 'text-black'} px-3 py-1 rounded bg-transparent hover:underline`}
              onClick={() => router.push('/register')}
            >
              Create a user account
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  const isDark = useIsDark()

  return (
    <>
      {/* Fixed top-right: theme toggle + home icon */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" asChild aria-label="Go to home">
          <Link href="/">
            <Home className={`w-4 h-4 ${isDark ? '' : 'text-black'}`} />
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <div className="relative min-h-screen">
          <DarkBackground />

          <div className="relative z-10">
            <LoginFormWrapper />
          </div>
        </div>
      </Suspense>
    </>
  );
}

function LoginFormWrapper() {
  const isDark = useIsDark()
  return (
    <div className={isDark ? 'text-white' : 'text-black'}>
      <LoginForm />
    </div>
  )
}
