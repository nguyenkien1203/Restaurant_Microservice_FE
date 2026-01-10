import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Flame, Leaf, Clock, Zap, Pencil, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NormalizedMenuItem } from '@/lib/types/menu'
import { MENU_TAGS } from '@/lib/types/menu'

interface MenuItemRowProps {
  item: NormalizedMenuItem
  isExpanded: boolean
  onToggleExpand: () => void
  onEdit?: (item: NormalizedMenuItem) => void
  onDelete?: (item: NormalizedMenuItem) => void
  onToggleAvailability?: (
    item: NormalizedMenuItem,
    isAvailable: boolean,
  ) => void
  isTogglingAvailability?: boolean
}

export function MenuItemRow({
  item,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleAvailability,
  isTogglingAvailability = false,
}: MenuItemRowProps) {
  return (
    <TableRow
      onClick={onToggleExpand}
      className={cn(
        'cursor-pointer transition-all',
        isExpanded && 'bg-muted/30',
      )}
    >
      <TableCell className="py-3">
        <div className="flex items-start gap-3">
          <img
            src={item.image || '/placeholder.svg'}
            alt={item.name}
            className="rounded-lg object-cover w-12 h-12"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">{item.name}</p>
            <p
              className={cn(
                'text-sm text-muted-foreground max-w-xs transition-all whitespace-normal',
                isExpanded ? '' : 'line-clamp-1',
              )}
            >
              {item.description}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="capitalize text-sm bg-muted px-2 py-1 rounded">
          {item.category}
        </span>
      </TableCell>
      <TableCell>
        <span className="font-semibold text-primary">
          ${item.price.toFixed(2)}
        </span>
      </TableCell>
      <TableCell>
        <MenuItemDetails item={item} />
      </TableCell>
      <TableCell>
        <MenuItemStatus
          item={item}
          onToggle={onToggleAvailability}
          isToggling={isTogglingAvailability}
        />
      </TableCell>
      <TableCell className="text-right">
        <MenuItemActions item={item} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
}

function MenuItemDetails({ item }: { item: NormalizedMenuItem }) {
  const isSpicy = item.tags.includes(MENU_TAGS.SPICY)
  const isVegan = item.tags.includes(MENU_TAGS.VEGAN)

  return (
    <div className="flex items-center gap-2">
      {isSpicy && (
        <span className="bg-red-100 text-red-600 p-1 rounded" title="Spicy">
          <Flame className="h-3 w-3" />
        </span>
      )}
      {isVegan && (
        <span className="bg-green-100 text-green-600 p-1 rounded" title="Vegan">
          <Leaf className="h-3 w-3" />
        </span>
      )}
      {item.calories && (
        <span
          className="text-xs text-muted-foreground flex items-center gap-1"
          title="Calories"
        >
          <Zap className="h-3 w-3" />
          {item.calories}
        </span>
      )}
      {item.preparationTime && (
        <span
          className="text-xs text-muted-foreground flex items-center gap-1"
          title="Prep time"
        >
          <Clock className="h-3 w-3" />
          {item.preparationTime}m
        </span>
      )}
    </div>
  )
}

interface MenuItemStatusProps {
  item: NormalizedMenuItem
  onToggle?: (item: NormalizedMenuItem, isAvailable: boolean) => void
  isToggling?: boolean
}

function MenuItemStatus({ item, onToggle, isToggling }: MenuItemStatusProps) {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="flex items-center gap-2" onClick={handleToggle}>
      {isToggling ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Switch
          checked={item.isAvailable}
          onCheckedChange={(checked) => onToggle?.(item, checked)}
          disabled={isToggling}
        />
      )}
      <span
        className={cn(
          'text-xs font-medium',
          item.isAvailable ? 'text-green-600' : 'text-muted-foreground',
        )}
      >
        {item.isAvailable ? 'Available' : 'Unavailable'}
      </span>
    </div>
  )
}

interface MenuItemActionsProps {
  item: NormalizedMenuItem
  onEdit?: (item: NormalizedMenuItem) => void
  onDelete?: (item: NormalizedMenuItem) => void
}

function MenuItemActions({ item, onEdit, onDelete }: MenuItemActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        title="Edit"
        onClick={(e) => {
          e.stopPropagation()
          onEdit?.(item)
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
        title="Delete"
        onClick={(e) => {
          e.stopPropagation()
          onDelete?.(item)
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
