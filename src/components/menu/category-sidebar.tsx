import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { CategoryOption } from './utils'

interface CategorySidebarProps {
  categories: CategoryOption[]
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
}

export function CategorySidebar({
  categories,
  activeCategory,
  onCategoryChange,
}: CategorySidebarProps) {
  return (
    <Card className="bg-card sticky top-20">
      <CardContent className="px-4">
        <h3 className="font-semibold text-card-foreground mb-4">Categories</h3>
        <nav className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer',
              )}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  )
}
