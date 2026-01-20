import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AdminPageHeader,
  ActiveFilterTags,
  UserFilters,
} from '@/components/admin'
import { getAllProfiles } from '@/lib/api/profile'
import type {
  UserProfile,
  MembershipRank,
  UserRole,
} from '@/lib/types/profile'
import { UserTable } from '@/components/users'
import type {
  RoleFilter,
  MembershipRankFilter,
} from '@/components/admin/user/user-filters'

export const Route = createFileRoute('/admin/users')({
  component: AdminUsers,
})

function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [membershipFilter, setMembershipFilter] =
    useState<MembershipRankFilter>('all')

  const {
    data: users,
    isLoading,
    error,
  } = useQuery<UserProfile[]>({
    queryKey: ['adminUsers'],
    queryFn: getAllProfiles,
  })

  const filteredUsers = useMemo(() => {
    if (!users) return []

    const query = searchQuery.toLowerCase().trim()

    return users.filter((user) => {
      // Text search
      if (query) {
        const fullName = (user.fullName || '').toLowerCase()
        const email = (user.email || '').toLowerCase()
        const phone = (user.phone || '').toLowerCase()
        const address = (user.address || '').toLowerCase()
        const userId = (user.userId || '').toLowerCase()

        const matchesText =
          fullName.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          address.includes(query) ||
          userId.includes(query)

        if (!matchesText) {
          return false
        }
      }

      // Role filter
      if (roleFilter !== 'all' && user.role !== (roleFilter as UserRole)) {
        return false
      }

      // Membership filter (only for non-admins)
      if (membershipFilter !== 'all') {
        if (user.role !== 'USER') return false
        if (user.membershipRank !== (membershipFilter as MembershipRank)) {
          return false
        }
      }

      return true
    })
  }, [users, searchQuery, roleFilter, membershipFilter])

  const totalUsers = users?.length ?? 0
  const filteredCount = filteredUsers.length
  const hasActiveFilters =
    searchQuery.length > 0 ||
    roleFilter !== 'all' ||
    membershipFilter !== 'all'

  const filterTags = useMemo(() => {
    const tags: {
      id: string
      label: string
      onRemove: () => void
    }[] = []

    if (searchQuery) {
      tags.push({
        id: 'search',
        label: `"${searchQuery}"`,
        onRemove: () => setSearchQuery(''),
      })
    }

    if (roleFilter !== 'all') {
      tags.push({
        id: 'role',
        label: roleFilter === 'ADMIN' ? 'Admin' : 'Member',
        onRemove: () => setRoleFilter('all'),
      })
    }

    if (membershipFilter !== 'all') {
      tags.push({
        id: 'membership',
        label: membershipFilter,
        onRemove: () => setMembershipFilter('all'),
      })
    }

    return tags
  }, [searchQuery, roleFilter, membershipFilter])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        description="Manage all Aperture users in the system"
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Users ({totalUsers})</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                View all user profiles connected to your restaurant.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <UserFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            roleFilter={roleFilter}
            onRoleChange={setRoleFilter}
            membershipFilter={membershipFilter}
            onMembershipChange={setMembershipFilter}
          />

          <ActiveFilterTags
            tags={filterTags}
            onClearAll={() => {
              setSearchQuery('')
              setRoleFilter('all')
              setMembershipFilter('all')
            }}
            resultCount={hasActiveFilters ? filteredCount : undefined}
            totalCount={hasActiveFilters ? totalUsers : undefined}
          />
          <UserTable
            users={filteredUsers}
            isLoading={isLoading}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  )
}
