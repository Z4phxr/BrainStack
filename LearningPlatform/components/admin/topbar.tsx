'use client'

import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { LogOut, Eye } from 'lucide-react'
import Link from 'next/link'

interface AdminTopbarProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function AdminTopbar({ user }: AdminTopbarProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b dark:border-gray-700 block-contrast px-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Content management</h1>
      
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="default">
          <Link href="/dashboard">
            <Eye className="mr-2 h-4 w-4" />
            Learner preview
          </Link>
        </Button>
        
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-base font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                {(user.name ?? user.email ?? 'A')[0]?.toUpperCase()}
              </div>
              <span className="text-base text-gray-600 dark:text-gray-400">{user.name ?? 'Admin'}</span>
            </div>
            <Button 
              onClick={() => signOut({ callbackUrl: '/' })} 
              variant="ghost" 
              size="default"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
      </div>
    </div>
  )
}
