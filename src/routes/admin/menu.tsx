import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Flame, Leaf } from 'lucide-react'
import { fetchAdminMenuItems } from '@/lib/api/menu'
import { useState, useMemo, useCallback } from 'react'
import type { NormalizedMenuItem } from '@/lib/types/menu'
import {
  AdminPageHeader,
  MenuFilters,
  MenuItemRow,
  ActiveFilterTags,
  SortableTableHead,
  TableLoadingState,
  TableErrorState,
  TableEmptyState,
  type StatusFilter,
  type DietaryFilter,
  type SortDirection,
} from '@/components/admin'

export const Route = createFileRoute('/admin/menu')({
  component: AdminMenu,
})

// Category order for sorting
const CATEGORY_ORDER: Record<string, number> = {
  appetizers: 1,
  starters: 1,
  mains: 2,
  desserts: 3,
  drinks: 4,
}

type SortField = 'name' | 'category' | 'price' | null

function useMenuFilters() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dietaryFilters, setDietaryFilters] = useState<DietaryFilter[]>([])

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    )
  }, [])

  const toggleDietary = useCallback((dietary: DietaryFilter) => {
    setDietaryFilters((prev) =>
      prev.includes(dietary)
        ? prev.filter((d) => d !== dietary)
        : [...prev, dietary],
    )
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchQuery('')
    setSelectedCategories([])
    setStatusFilter('all')
    setDietaryFilters([])
  }, [])

  const hasActiveFilters =
    searchQuery.length > 0 ||
    selectedCategories.length > 0 ||
    statusFilter !== 'all' ||
    dietaryFilters.length > 0

  return {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    statusFilter,
    setStatusFilter,
    dietaryFilters,
    setDietaryFilters,
    toggleCategory,
    toggleDietary,
    clearAllFilters,
    hasActiveFilters,
  }
}

function useMenuSorting() {
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = useCallback((field: SortField) => {
    setSortField((currentField) => {
      if (currentField === field) {
        setSortDirection((currentDir) => {
          if (currentDir === 'asc') return 'desc'
          setSortField(null)
          return 'asc'
        })
        return field
      }
      setSortDirection('asc')
      return field
    })
  }, [])

  return { sortField, sortDirection, handleSort }
}

function AdminMenu() {
  const filters = useMenuFilters()
  const sorting = useMenuSorting()
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)

  const {
    data: menuItems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['adminMenuItems'],
    queryFn: fetchAdminMenuItems,
  })

  // Get unique categories sorted by meal order
  const categories = useMemo(() => {
    return Array.from(new Set(menuItems.map((item) => item.category))).sort(
      (a, b) => {
        const orderA = CATEGORY_ORDER[a] ?? 100
        const orderB = CATEGORY_ORDER[b] ?? 100
        if (orderA === orderB) return a.localeCompare(b)
        return orderA - orderB
      },
    )
  }, [menuItems])

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          item.description
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase())
        const matchesCategory =
          filters.selectedCategories.length === 0 ||
          filters.selectedCategories.includes(item.category)
        const matchesStatus =
          filters.statusFilter === 'all' ||
          (filters.statusFilter === 'available' && item.isAvailable) ||
          (filters.statusFilter === 'unavailable' && !item.isAvailable)
        const matchesDietary =
          filters.dietaryFilters.length === 0 ||
          (filters.dietaryFilters.includes('spicy') && item.isSpicy) ||
          (filters.dietaryFilters.includes('vegan') && item.isVegan)
        return (
          matchesSearch && matchesCategory && matchesStatus && matchesDietary
        )
      })
      .sort((a, b) => {
        if (!sorting.sortField) return 0
        const modifier = sorting.sortDirection === 'asc' ? 1 : -1
        if (sorting.sortField === 'name') {
          return a.name.localeCompare(b.name) * modifier
        }
        if (sorting.sortField === 'category') {
          return a.category.localeCompare(b.category) * modifier
        }
        if (sorting.sortField === 'price') {
          return (a.price - b.price) * modifier
        }
        return 0
      })
  }, [menuItems, filters, sorting.sortField, sorting.sortDirection])

  // Build filter tags for display
  const filterTags = useMemo(() => {
    const tags = []
    if (filters.searchQuery) {
      tags.push({
        id: 'search',
        label: `"${filters.searchQuery}"`,
        onRemove: () => filters.setSearchQuery(''),
      })
    }
    filters.selectedCategories.forEach((cat) => {
      tags.push({
        id: `category-${cat}`,
        label: cat,
        onRemove: () => filters.toggleCategory(cat),
      })
    })
    if (filters.statusFilter !== 'all') {
      tags.push({
        id: 'status',
        label:
          filters.statusFilter === 'available' ? 'In Stock' : 'Out of Stock',
        onRemove: () => filters.setStatusFilter('all'),
      })
    }
    filters.dietaryFilters.forEach((filter) => {
      tags.push({
        id: `dietary-${filter}`,
        label: filter,
        icon:
          filter === 'spicy' ? (
            <Flame className="h-3 w-3 text-red-500" />
          ) : (
            <Leaf className="h-3 w-3 text-green-500" />
          ),
        onRemove: () => filters.toggleDietary(filter),
      })
    })
    return tags
  }, [filters])

  // Stats
  const totalItems = menuItems.length
  const availableItems = menuItems.filter((item) => item.isAvailable).length
  const unavailableItems = totalItems - availableItems

  const handleAddItem = () => {
    // TODO: Implement add item functionality
    console.log('Add item clicked')
  }

  const handleEditItem = (item: NormalizedMenuItem) => {
    // TODO: Implement edit item functionality
    console.log('Edit item:', item)
  }

  const handleDeleteItem = (item: NormalizedMenuItem) => {
    // TODO: Implement delete item functionality
    console.log('Delete item:', item)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Menu Management"
        description="Manage your restaurant menu items"
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">
                Menu Items ({totalItems})
              </CardTitle>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {availableItems} In stock
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  {unavailableItems} Out of stock
                </span>
              </div>
            </div>
            <Button onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <MenuFilters
            searchQuery={filters.searchQuery}
            onSearchChange={filters.setSearchQuery}
            categories={categories}
            selectedCategories={filters.selectedCategories}
            onToggleCategory={filters.toggleCategory}
            onClearCategories={() => filters.setSelectedCategories([])}
            statusFilter={filters.statusFilter}
            onStatusChange={filters.setStatusFilter}
            dietaryFilters={filters.dietaryFilters}
            onToggleDietary={filters.toggleDietary}
            onClearDietary={() => filters.setDietaryFilters([])}
          />

          <ActiveFilterTags
            tags={filterTags}
            onClearAll={filters.clearAllFilters}
            resultCount={
              filters.hasActiveFilters ? filteredItems.length : undefined
            }
            totalCount={filters.hasActiveFilters ? totalItems : undefined}
          />

          {isLoading ? (
            <TableLoadingState message="Loading menu items..." />
          ) : error ? (
            <TableErrorState
              error={error}
              fallbackMessage="Failed to load menu items"
            />
          ) : filteredItems.length === 0 ? (
            <TableEmptyState message="No menu items found." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    label="Item"
                    field="name"
                    currentSortField={sorting.sortField}
                    currentSortDirection={sorting.sortDirection}
                    onSort={sorting.handleSort}
                  />
                  <SortableTableHead
                    label="Category"
                    field="category"
                    currentSortField={sorting.sortField}
                    currentSortDirection={sorting.sortDirection}
                    onSort={sorting.handleSort}
                  />
                  <SortableTableHead
                    label="Price"
                    field="price"
                    currentSortField={sorting.sortField}
                    currentSortDirection={sorting.sortDirection}
                    onSort={sorting.handleSort}
                  />
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    isExpanded={expandedItemId === item.id}
                    onToggleExpand={() =>
                      setExpandedItemId(
                        expandedItemId === item.id ? null : item.id,
                      )
                    }
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
