import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface FilterTag {
  id: string
  label: string
  icon?: ReactNode
  onRemove: () => void
}

interface ActiveFilterTagsProps {
  tags: FilterTag[]
  onClearAll: () => void
  resultCount?: number
  totalCount?: number
}

export function ActiveFilterTags({
  tags,
  onClearAll,
  resultCount,
  totalCount,
}: ActiveFilterTagsProps) {
  if (tags.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap text-sm">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-foreground rounded-md"
          >
            {tag.icon}
            {tag.label}
            <button
              onClick={tag.onRemove}
              className="hover:text-destructive ml-1"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          onClick={onClearAll}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          Clear all
        </button>
      </div>
      {resultCount !== undefined && totalCount !== undefined && (
        <p className="text-sm text-muted-foreground">
          Showing {resultCount} of {totalCount} items
        </p>
      )}
    </div>
  )
}
