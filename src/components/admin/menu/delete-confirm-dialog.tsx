import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'
import type { NormalizedMenuItem } from '@/lib/types/menu'

interface DeleteConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  item: NormalizedMenuItem | null
  isLoading?: boolean
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  item,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  if (!item) return null

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Dialog open={open} onClose={onClose} className="max-w-md">
      <DialogHeader onClose={onClose}>
        <DialogTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Delete Menu Item
        </DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>
      </DialogHeader>

      <DialogContent>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{' '}
          <span className="font-medium text-foreground">"{item.name}"</span>?
          This will permanently remove the item from your menu.
        </p>
      </DialogContent>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Delete
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
