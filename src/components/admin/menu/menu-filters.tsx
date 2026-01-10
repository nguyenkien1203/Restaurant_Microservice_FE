import { Filter, Leaf, Flame, CheckCircle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  FilterDropdown,
  FilterDropdownHeader,
  FilterDropdownClear,
} from '../filter-dropdown'
import { SearchInput } from '../search-input'

export type StatusFilter = 'all' | 'available' | 'unavailable'
export type DietaryFilter = 'spicy' | 'vegan'

interface MenuFiltersProps {
  // Search
  searchQuery: string
  onSearchChange: (value: string) => void
  // Categories
  categories: string[]
  selectedCategories: string[]
  onToggleCategory: (category: string) => void
  onClearCategories: () => void
  // Status
  statusFilter: StatusFilter
  onStatusChange: (status: StatusFilter) => void
  // Dietary
  dietaryFilters: DietaryFilter[]
  onToggleDietary: (filter: DietaryFilter) => void
  onClearDietary: () => void
}

export function MenuFilters({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  statusFilter,
  onStatusChange,
  dietaryFilters,
  onToggleDietary,
  onClearDietary,
}: MenuFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search menu items by name..."
      />

      <div className="flex gap-2">
        {/* Category Filter */}
        <FilterDropdown
          label="Category"
          icon={<Filter className="h-4 w-4" />}
          hasActiveFilters={selectedCategories.length > 0}
        >
          <FilterDropdownHeader>Categories</FilterDropdownHeader>
          <div className="max-h-64 overflow-y-auto">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer"
              >
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => onToggleCategory(category)}
                />
                <span className="capitalize text-sm">{category}</span>
              </label>
            ))}
          </div>
          <FilterDropdownClear
            onClear={onClearCategories}
            show={selectedCategories.length > 0}
          />
        </FilterDropdown>

        {/* Dietary Filter */}
        <FilterDropdown
          label="Dietary"
          icon={<Leaf className="h-4 w-4" />}
          hasActiveFilters={dietaryFilters.length > 0}
        >
          <FilterDropdownHeader>Dietary Options</FilterDropdownHeader>
          <div>
            <label className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer">
              <Checkbox
                checked={dietaryFilters.includes('spicy')}
                onCheckedChange={() => onToggleDietary('spicy')}
              />
              <span className="flex items-center gap-2 text-sm">
                <Flame className="h-3 w-3 text-red-500" />
                Spicy
              </span>
            </label>
            <label className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer">
              <Checkbox
                checked={dietaryFilters.includes('vegan')}
                onCheckedChange={() => onToggleDietary('vegan')}
              />
              <span className="flex items-center gap-2 text-sm">
                <Leaf className="h-3 w-3 text-green-500" />
                Vegan
              </span>
            </label>
          </div>
          <FilterDropdownClear
            onClear={onClearDietary}
            show={dietaryFilters.length > 0}
          />
        </FilterDropdown>

        {/* Status Filter */}
        <FilterDropdown
          label="Status"
          icon={<CheckCircle className="h-4 w-4" />}
          hasActiveFilters={statusFilter !== 'all'}
        >
          <FilterDropdownHeader>Availability</FilterDropdownHeader>
          <div>
            {[
              { value: 'all', label: 'All Items', color: 'bg-primary' },
              { value: 'available', label: 'In Stock', color: 'bg-green-500' },
              { value: 'unavailable', label: 'Out of Stock', color: 'bg-red-500' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => onStatusChange(option.value as StatusFilter)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left',
                  statusFilter === option.value && 'bg-accent',
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    statusFilter === option.value
                      ? option.color
                      : 'bg-transparent border border-border',
                  )}
                />
                {option.label}
              </button>
            ))}
          </div>
        </FilterDropdown>
      </div>
    </div>
  )
}
