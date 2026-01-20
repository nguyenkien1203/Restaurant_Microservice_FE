import { Shield, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterDropdown, FilterDropdownHeader } from '../filter-dropdown'
import { SearchInput } from '../search-input'
import type { MembershipRank, UserRole } from '@/lib/types/profile'

export type RoleFilter = 'all' | UserRole
export type MembershipRankFilter = 'all' | MembershipRank

interface UserFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  roleFilter: RoleFilter
  onRoleChange: (value: RoleFilter) => void
  membershipFilter: MembershipRankFilter
  onMembershipChange: (value: MembershipRankFilter) => void
}

export function UserFilters({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleChange,
  membershipFilter,
  onMembershipChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search users by name, email, phone, address, or ID..."
      />

      <div className="flex flex-wrap gap-2">
        <FilterDropdown
          label="Role"
          icon={<Shield className="h-4 w-4" />}
          hasActiveFilters={roleFilter !== 'all'}
        >
          <FilterDropdownHeader>User Role</FilterDropdownHeader>
          <div>
            {[
              { value: 'all', label: 'All Roles' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'USER', label: 'Member' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => onRoleChange(option.value as RoleFilter)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left',
                  roleFilter === option.value && 'bg-accent',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterDropdown>

        <FilterDropdown
          label="Membership"
          icon={<Award className="h-4 w-4" />}
          hasActiveFilters={membershipFilter !== 'all'}
        >
          <FilterDropdownHeader>Membership Rank</FilterDropdownHeader>
          <div>
            {[
              { value: 'all', label: 'All Memberships' },
              { value: 'SILVER', label: 'Silver' },
              { value: 'GOLD', label: 'Gold' },
              { value: 'PLATINUM', label: 'Platinum' },
              { value: 'VIP', label: 'VIP' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  onMembershipChange(option.value as MembershipRankFilter)
                }
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left',
                  membershipFilter === option.value && 'bg-accent',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterDropdown>
      </div>
    </div>
  )
}

