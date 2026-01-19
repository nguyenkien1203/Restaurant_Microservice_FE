import type { NormalizedMenuItem } from '@/lib/types/menu'
import { CATEGORY_ORDER } from './constants'

export interface CategoryOption {
  id: string
  name: string
}

export function getSortedCategories(
  menuItems: NormalizedMenuItem[],
): CategoryOption[] {
  const categories = Array.from(new Set(menuItems.map((item) => item.category)))
    .sort((a, b) => {
      const orderA = CATEGORY_ORDER[a] ?? 100
      const orderB = CATEGORY_ORDER[b] ?? 100
      if (orderA === orderB) return a.localeCompare(b)
      return orderA - orderB
    })
    .map((cat) => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
    }))

  return categories
}
