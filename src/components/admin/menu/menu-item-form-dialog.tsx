import { useState, useEffect, useRef } from 'react'
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
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react'
import type { NormalizedMenuItem, MenuItemFormData } from '@/lib/types/menu'
import { MENU_TAGS } from '@/lib/types/menu'
import { uploadMenuImage } from '@/lib/api/menu'

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
  tags: [],
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

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        tags: item.tags || [],
      })
      setImagePreview(item.image || null)
    } else if (open) {
      setFormData(DEFAULT_FORM_DATA)
      setImagePreview(null)
    }
    setErrors({})
    setImageFile(null)
    setUploadError(null)
  }, [open, item])

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB')
      return
    }

    setImageFile(file)
    setUploadError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData(prev => ({ ...prev, imageUrl: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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

    try {
      let finalImageUrl = formData.imageUrl

      // Upload image if a new file was selected
      if (imageFile) {
        setIsUploading(true)
        setUploadError(null)
        try {
          finalImageUrl = await uploadMenuImage(imageFile)
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : 'Failed to upload image')
          setIsUploading(false)
          return
        }
        setIsUploading(false)
      }

      // Submit with the uploaded image URL
      await onSubmit({ ...formData, imageUrl: finalImageUrl })
    } catch (err) {
      console.error('Failed to submit:', err)
    }
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

  const isSubmitting = isLoading || isUploading

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

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="relative w-24 h-24 rounded-lg border-2 border-dashed border-border bg-muted/50 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              {/* Upload button */}
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {imageFile ? 'Change Image' : 'Upload Image'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF up to 5MB
                </p>
                {uploadError && (
                  <p className="text-xs text-destructive">{uploadError}</p>
                )}
                {isUploading && (
                  <p className="text-xs text-primary flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Uploading...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-12">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={formData.tags.includes(MENU_TAGS.SPICY)}
                  onCheckedChange={(checked) => {
                    const newTags = checked
                      ? [...formData.tags, MENU_TAGS.SPICY]
                      : formData.tags.filter((t) => t !== MENU_TAGS.SPICY)
                    updateField('tags', newTags)
                  }}
                />
                <span className="text-sm">Spicy</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={formData.tags.includes(MENU_TAGS.VEGAN)}
                  onCheckedChange={(checked) => {
                    const newTags = checked
                      ? [...formData.tags, MENU_TAGS.VEGAN]
                      : formData.tags.filter((t) => t !== MENU_TAGS.VEGAN)
                    updateField('tags', newTags)
                  }}
                />
                <span className="text-sm">Vegan</span>
              </label>
            </div>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isUploading ? 'Uploading...' : isEditing ? 'Save Changes' : 'Add Item'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
