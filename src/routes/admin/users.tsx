import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminPageHeader, SearchInput } from '@/components/admin'
import { getAllProfiles } from '@/lib/api/profile'
import type { UserProfile } from '@/lib/types/profile'
import { UserTable } from '@/components/users'

export const Route = createFileRoute('/admin/users')({
  component: AdminUsers,
})

function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('')

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
    if (!searchQuery.trim()) return users

    const query = searchQuery.toLowerCase().trim()
    return users.filter((user) => {
      const fullName = (user.fullName || '').toLowerCase()
      const email = (user.email || '').toLowerCase()
      const phone = (user.phone || '').toLowerCase()
      const address = (user.address || '').toLowerCase()
      const userId = (user.userId || '').toLowerCase()

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        address.includes(query) ||
        userId.includes(query)
      )
    })
  }, [users, searchQuery])

  const totalUsers = users?.length ?? 0
  const filteredCount = filteredUsers.length

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
          <div className="flex items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search users by name, email, phone, address, or ID..."
              className="max-w"
            />
            {searchQuery && (
              <span className="text-sm text-muted-foreground">
                {filteredCount} of {totalUsers} users
              </span>
            )}
          </div>
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
