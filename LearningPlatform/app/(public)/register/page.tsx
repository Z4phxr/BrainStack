'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import DarkBackground from '@/components/DarkBackground'
import useIsDark from '@/components/useIsDark'
import ThemeToggle from '@/components/theme-toggle'
import Link from 'next/link'
import { Home } from 'lucide-react'

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter'
  if (!/[0-9]/.test(password)) return 'Password must include a number'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include a special character'
  return null
}

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const passwordError = useMemo(() => validatePassword(password), [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordError) {
      setError(passwordError)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email,
          password,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setError(payload?.error || 'Unable to create account')
        setIsLoading(false)
        return
      }

      const login = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (login?.error) {
        router.push('/login')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isDark = useIsDark()

  return (
    <div className="relative min-h-screen">
      <DarkBackground />

      {/* Fixed top-right: theme toggle + home icon */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" asChild aria-label="Go to home">
          <Link href="/">
            <Home className={`w-4 h-4 ${isDark ? '' : 'text-black'}`} />
          </Link>
        </Button>
      </div>

      <div className={`relative z-10 flex min-h-screen items-center justify-center px-4 ${isDark ? 'text-white' : 'text-black'}`}>
        <Card className="w-full max-w-md bg-white/10 dark:bg-white/10 backdrop-blur-lg border border-white/20">
        <CardHeader className="space-y-1">
          <CardTitle className={`text-2xl font-bold text-center ${isDark ? 'text-white' : 'text-black'}`}>Create account</CardTitle>
          <CardDescription className={`text-center ${isDark ? 'text-white' : 'text-black'}`}>
            Start learning by creating your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={isDark ? 'text-white' : 'text-black'}>Name (optional)</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className={`${isDark ? 'text-white placeholder:text-white/60' : 'text-black placeholder:text-black/60'} bg-transparent`}
              />
            </div>
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className={`${isDark ? 'text-white placeholder:text-white/60' : 'text-black placeholder:text-black/60'} bg-transparent`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={isDark ? 'text-white' : 'text-black'}>Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

            <Button type="submit" className={"w-full btn-themed opacity-80"} disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/login" className={`${isDark ? 'text-white' : 'text-black'} hover:underline`}>
              Already have an account? Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  )
}
