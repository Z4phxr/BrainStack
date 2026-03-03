import DarkBackground from '@/components/DarkBackground'
import HeroContent from '@/components/HeroContent'
import ThemeToggle from '@/components/theme-toggle'

export default function MainPage() {
  // NOTE: This `/main` route renders the same hero as the public `/` page.
  // Unlike `/`, it does not include any auth-based redirect logic. If `/main`
  // is intended as an alternate landing page that's distinct from `/`,
  // document that intent and keep navigation consistent (update links/redirects).
  // Otherwise consider removing this duplicate and using `/` as the single
  // canonical homepage to avoid multiple entry points and confusing redirects.
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <DarkBackground />

      {/* Fixed top-right: theme toggle only */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero centered both horizontally and vertically */}
      <div className="relative z-10 px-4 w-full max-w-3xl mx-auto">
        <HeroContent />
      </div>
    </div>
  )
}
