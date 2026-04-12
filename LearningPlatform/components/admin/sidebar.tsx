'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, BrainCircuit, GraduationCap, Image, Settings, LayoutDashboard, ChevronLeft, ChevronRight, ClipboardList, Tag, ScrollText, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Lessons',
    href: '/admin/lessons',
    icon: GraduationCap,
  },
  {
    title: 'Subjects',
    href: '/admin/subjects',
    icon: BookOpen,
  },
  {
    title: 'Tags',
    href: '/admin/tags',
    icon: Tag,
  },
  {
    title: 'Tasks',
    href: '/admin/tasks',
    icon: ClipboardList,
  },
  {
    title: 'Flashcards',
    href: '/admin/flashcards',
    icon: BrainCircuit,
  },
  {
    title: 'Media',
    href: '/admin/media',
    icon: Image,
  },
  {
    title: 'Logs',
    href: '/admin/logs',
    icon: ScrollText,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState<boolean>(false)

  useEffect(() => {
    // Read persisted state from localStorage; default open (false)
    try {
      const stored = localStorage.getItem('adminSidebarCollapsed')
      setCollapsed(stored === 'true')
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('adminSidebarCollapsed', collapsed ? 'true' : 'false')
    } catch (e) {
      // ignore
    }
  }, [collapsed])

  return (
    <div className={cn('h-screen border-r block-contrast dark:border-gray-700 transition-all flex flex-col', collapsed ? 'w-16' : 'w-64')}>
      <div className="flex h-16 items-center border-b dark:border-gray-700 px-3 justify-between">
        <Link href="/admin/dashboard" className={cn('flex items-center gap-2', collapsed ? 'mx-auto' : '')}>
          <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">{!collapsed && 'Admin Panel'}</span>
        </Link>
        <button
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded hover:shadow-sm"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      
      <nav className="flex flex-col gap-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'text-gray-700 hover:shadow-sm dark:text-gray-300'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={cn(collapsed ? 'hidden' : '')}>{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
