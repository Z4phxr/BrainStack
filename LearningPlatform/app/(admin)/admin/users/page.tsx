import { UsersAdminTable } from '@/components/admin/users-admin-table'

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <p className="mt-1 text-muted-foreground">
          View all accounts, roles, and grant or revoke Pro access for the lesson assistant.
        </p>
      </div>
      <UsersAdminTable />
    </div>
  )
}
