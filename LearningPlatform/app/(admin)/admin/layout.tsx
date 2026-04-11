export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminTopbar } from '@/components/admin/topbar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Protect admin routes - only ADMIN role
  if (!session?.user) {
    redirect('/admin/login')
  }
  
  // Safe guard: check if role exists and is ADMIN
  const userRole = session.user?.role;
  if (!userRole || userRole !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6 text-base leading-relaxed">
          {children}
        </main>
      </div>
    </div>
  )
}
