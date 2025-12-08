"use client"

import { categories } from "../../../lib/menu-data"

interface CategoryTabsProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all
            flex items-center gap-2
            ${
              activeCategory === category.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card text-card-foreground hover:bg-accent border border-border"
            }
          `}
        >
          <span>{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  )
}

