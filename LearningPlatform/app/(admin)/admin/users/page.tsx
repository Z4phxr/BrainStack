import { auth } from '@/auth'
import { UsersAdminTable } from '@/components/admin/users-admin-table'

export default async function AdminUsersPage() {
  const session = await auth()
  const currentUserId = session?.user?.id ?? null

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">Users</h1>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">
          View all accounts and manage credentials: Pro access for the lesson assistant and admin role.
        </p>
      </div>
      <UsersAdminTable currentUserId={currentUserId} />
    </div>
  )
}
