"use client"
import useIsDark from './useIsDark'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HeroContent() {
  const isDark = useIsDark()

  // Text color adapts to theme: black in light mode, white in dark mode
  const heroTextClass = isDark ? 'text-white' : 'text-black'
  const subtitleClass = isDark ? 'text-gray-300' : 'text-gray-600'

  return (
    <div className={`text-center ${heroTextClass}`}>
      <h1 className="mb-6 text-5xl font-bold">BrainStack</h1>
      <p className={`mb-8 text-xl ${subtitleClass}`}>
        Platform for courses, lessons, and interactive learning content.
      </p>
      <div className="flex justify-center items-center gap-4">
        <Button asChild size="lg" className="btn-themed opacity-80">
          <Link href="/register">Get started</Link>
        </Button>
        <Button asChild size="lg" className="btn-themed opacity-80">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </div>
  )
}
