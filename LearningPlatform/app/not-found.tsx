import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-sm font-semibold text-gray-500">404</p>
        <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
        <p className="text-gray-600">
          The page you are looking for does not exist or is not available.
        </p>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
