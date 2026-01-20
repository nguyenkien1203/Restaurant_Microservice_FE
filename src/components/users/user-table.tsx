import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  TableLoadingState,
  TableErrorState,
  TableEmptyState,
} from '@/components/admin'
import type { UserProfile } from '@/lib/types/profile'
import { UserRow } from './user-row'

interface UserTableProps {
  users: UserProfile[] | undefined
  isLoading: boolean
  error: unknown
}

export function UserTable({ users, isLoading, error }: UserTableProps) {
  if (isLoading) {
    return <TableLoadingState message="Loading users..." />
  }

  if (error) {
    return (
      <TableErrorState error={error} fallbackMessage="Failed to load users." />
    )
  }

  if (!users || users.length === 0) {
    return <TableEmptyState message="No users found." />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {/* <TableHead>User ID</TableHead> */}
          <TableHead>Full Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Membership</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Activity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <UserRow key={user.id} user={user} />
        ))}
      </TableBody>
    </Table>
  )
}
