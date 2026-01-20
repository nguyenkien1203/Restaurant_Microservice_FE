import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { UserProfile } from '@/lib/types/profile'
import { getMembershipRankBadgeClasses } from '@/lib/ui/membership'

interface UserRowProps {
  user: UserProfile
}

export function UserRow({ user }: UserRowProps) {
  const fullName = user.fullName || 'N/A'
  const email = user.email || 'N/A'
  const phone = user.phone || 'N/A'
  const address = user.address || 'N/A'
  //   const userIdDisplay =
  //     user.userId.length > 12
  //       ? `${user.userId.slice(0, 8)}...${user.userId.slice(-4)}`
  //       : user.userId

  const createdAt = new Date(user.createdAt)
  const updatedAt = new Date(user.updatedAt)

  return (
    <TableRow>
      {/* <TableCell>
        <span className="text-sm text-foreground" title={user.userId}>
          {userIdDisplay}
        </span>
      </TableCell> */}
      <TableCell>
        <span className="font-medium text-foreground">{fullName}</span>
      </TableCell>
      <TableCell>
        <Badge
          variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
          className={user.role === 'ADMIN' ? 'uppercase' : ''}
        >
          {user.role === 'ADMIN' ? 'Admin' : 'Member'}
        </Badge>
      </TableCell>
      <TableCell>
        {user.role === 'USER' && user.membershipRank ? (
          <Badge
            className={`uppercase hover:none hover:bg-accent ${getMembershipRankBadgeClasses(
              user.membershipRank
            )}`}
          >
            {user.membershipRank}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <span className="text-sm text-foreground break-all">{email}</span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-foreground break-all">{phone}</span>
      </TableCell>
      <TableCell className="max-w-xs">
        <span className="text-sm text-muted-foreground line-clamp-2">
          {address}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex flex-col text-xs text-muted-foreground">
          <span>
            Joined{' '}
            {createdAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span>
            Updated{' '}
            {updatedAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </TableCell>
    </TableRow>
  )
}
