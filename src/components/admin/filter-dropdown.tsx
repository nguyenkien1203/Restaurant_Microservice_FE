import { useState, useRef, useEffect, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterDropdownProps {
  label: string
  icon?: ReactNode
  children: ReactNode
  hasActiveFilters?: boolean
}

export function FilterDropdown({
  label,
  icon,
  children,
  hasActiveFilters,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors whitespace-nowrap',
          hasActiveFilters
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border bg-card text-foreground hover:bg-accent',
        )}
      >
        {icon}
        {label}
        {hasActiveFilters && (
          <span className="h-2 w-2 rounded-full bg-primary" />
        )}
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-card border border-border rounded-lg shadow-lg z-50 py-2">
          {children}
        </div>
      )}
    </div>
  )
}

// Helper components for building filter dropdown content
interface FilterDropdownHeaderProps {
  children: ReactNode
}

export function FilterDropdownHeader({ children }: FilterDropdownHeaderProps) {
  return (
    <div className="px-3 py-2 border-b border-border">
      <p className="text-xs font-medium text-muted-foreground uppercase">
        {children}
      </p>
    </div>
  )
}

interface FilterDropdownClearProps {
  onClear: () => void
  show?: boolean
}

export function FilterDropdownClear({
  onClear,
  show = true,
}: FilterDropdownClearProps) {
  if (!show) return null

  return (
    <div className="px-3 py-2 border-t border-border">
      <button
        onClick={onClear}
        className="text-xs text-primary hover:underline"
      >
        Clear
      </button>
    </div>
  )
}
