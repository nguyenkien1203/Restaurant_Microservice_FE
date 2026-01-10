import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { NormalizedMenuItem, MenuItemFormData } from '@/lib/types/menu'

const CATEGORY_OPTIONS = [
  { value: 'Appetizers', label: 'Appetizers' },
  { value: 'Mains', label: 'Mains' },
  { value: 'Desserts', label: 'Desserts' },
  { value: 'Drinks', label: 'Drinks' },
]

const DEFAULT_FORM_DATA: MenuItemFormData = {
  name: '',
  description: '',
  price: '',
  category: 'Mains',
  imageUrl: '',
  isAvailable: true,
  preparationTime: '',
  calories: '',
  isSpicy: false,
  isVegan: false,
}

interface MenuItemFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: MenuItemFormData) => Promise<void>
  item?: NormalizedMenuItem | null
  isLoading?: boolean
}

export function MenuItemFormDialog({
  open,
  onClose,
  onSubmit,
  item,
  isLoading = false,
}: MenuItemFormDialogProps) {
  const [formData, setFormData] = useState<MenuItemFormData>(DEFAULT_FORM_DATA)
  const [errors, setErrors] = useState<
    Partial<Record<keyof MenuItemFormData, string>>
  >({})

  const isEditing = !!item

  // Reset form when dialog opens/closes or item changes
  useEffect(() => {
    if (open && item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category:
          item.category.charAt(0).toUpperCase() + item.category.slice(1),
        imageUrl: item.image || '',
        isAvailable: item.isAvailable,
        preparationTime: item.preparationTime?.toString() || '',
        calories: item.calories?.toString() || '',
        isSpicy: item.isSpicy || false,
        isVegan: item.isVegan || false,
      })
    } else if (open) {
      setFormData(DEFAULT_FORM_DATA)
    }
    setErrors({})
  }, [open, item])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MenuItemFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (
      !formData.price ||
      isNaN(parseFloat(formData.price)) ||
      parseFloat(formData.price) <= 0
    ) {
      newErrors.price = 'Valid price is required'
    }
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    if (formData.preparationTime && isNaN(parseInt(formData.preparationTime))) {
      newErrors.preparationTime = 'Must be a number'
    }
    if (formData.calories && isNaN(parseInt(formData.calories))) {
      newErrors.calories = 'Must be a number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    await onSubmit(formData)
  }

  const updateField = <K extends keyof MenuItemFormData>(
    field: K,
    value: MenuItemFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="max-w-2xl">
      <form onSubmit={handleSubmit}>
        <DialogHeader onClose={onClose}>
          <DialogTitle>
            {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
          </DialogTitle>
        </DialogHeader>

        <DialogContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Grilled Salmon"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateField('category', value)}
                options={CATEGORY_OPTIONS}
                placeholder="Select category"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="A delicious dish..."
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Price and Details */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder="14.99"
                className={errors.price ? 'border-destructive' : ''}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparationTime">Prep Time (min)</Label>
              <Input
                id="preparationTime"
                type="number"
                min="0"
                value={formData.preparationTime}
                onChange={(e) => updateField('preparationTime', e.target.value)}
                placeholder="25"
                className={errors.preparationTime ? 'border-destructive' : ''}
              />
              {errors.preparationTime && (
                <p className="text-xs text-destructive">
                  {errors.preparationTime}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                value={formData.calories}
                onChange={(e) => updateField('calories', e.target.value)}
                placeholder="450"
                className={errors.calories ? 'border-destructive' : ''}
              />
              {errors.calories && (
                <p className="text-xs text-destructive">{errors.calories}</p>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => updateField('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formData.isAvailable}
                onCheckedChange={(checked) =>
                  updateField('isAvailable', checked === true)
                }
              />
              <span className="text-sm">Available</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formData.isSpicy}
                onCheckedChange={(checked) =>
                  updateField('isSpicy', checked === true)
                }
              />
              <span className="text-sm">Spicy</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={formData.isVegan}
                onCheckedChange={(checked) =>
                  updateField('isVegan', checked === true)
                }
              />
              <span className="text-sm">Vegan</span>
            </label>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Add Item'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
