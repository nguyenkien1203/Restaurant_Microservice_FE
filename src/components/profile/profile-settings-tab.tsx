import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Pencil,
  Check,
  X,
  Loader2,
  Shield,
  UserCog,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { updateMyProfile } from '@/lib/api/profile'
import type { UserProfile, UpdateProfileRequest } from '@/lib/types/profile'

interface ProfileSettingsTabProps {
  profile?: UserProfile
  email: string
  fullName: string
  onProfileUpdate?: () => void
}

export function ProfileSettingsTab({
  profile,
  email,
  fullName,
  onProfileUpdate,
}: ProfileSettingsTabProps) {
  const queryClient = useQueryClient()
  const { updateUser, isAdmin } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || fullName,
    phone: profile?.phone || '',
    address: profile?.address || '',
  })

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        phone: profile.phone || '',
        address: profile.address || '',
      })
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateMyProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile', 'me'], updatedProfile)
      updateUser({ fullName: updatedProfile.fullName })
      setIsEditing(false)
      setShowSuccess(true)
      onProfileUpdate?.()
    },
  })

  const handleSave = () => {
    updateMutation.mutate({
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
    })
  }

  const handleCancel = () => {
    setFormData({
      fullName: profile?.fullName || fullName,
      phone: profile?.phone || '',
      address: profile?.address || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
          Profile Settings
        </h1>
        {!isEditing ? (
          <Button
            onClick={() => {
              setIsEditing(true)
              setShowSuccess(false)
            }}
            variant="outline"
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="gap-2"
              disabled={updateMutation.isPending}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Error message */}
      {updateMutation.isError && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">
            {updateMutation.error instanceof Error
              ? updateMutation.error.message
              : 'Failed to update profile. Please try again.'}
          </p>
        </div>
      )}

      {/* Success message */}
      {showSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <p className="text-sm text-green-700">Profile updated successfully!</p>
          <button
            onClick={() => setShowSuccess(false)}
            className="text-green-700 hover:text-green-900 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Card>
        <CardContent className="px-6 py-2 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <span className="text-3xl font-semibold text-primary">
                {(isEditing ? formData.fullName : fullName).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {isEditing ? formData.fullName : fullName}
              </h3>
              <p className="text-muted-foreground">{email}</p>
            </div>
          </div>

          <div className="grid gap-4">
            {/* Full Name */}
            <div className="py-3 border-b border-border">
              <Label className="font-medium text-foreground">Full Name</Label>
              {isEditing ? (
                <Input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="mt-2"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{fullName}</p>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="py-3 border-b border-border">
              <Label className="font-medium text-foreground">Email</Label>
              <p className="text-sm text-muted-foreground mt-1">{email}</p>
              {isEditing && (
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="py-3 border-b border-border">
              <Label className="font-medium text-foreground">Phone Number</Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="mt-2"
                  placeholder="Enter your phone number"
                  type="tel"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {profile?.phone || 'Not set'}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="py-3">
              <Label className="font-medium text-foreground">Address</Label>
              {isEditing ? (
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="mt-2"
                  placeholder="Enter your address"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {profile?.address || 'Not set'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      {profile && (
        <Card>
          <CardContent className="px-6 py-2">
            <h3 className="font-semibold text-foreground mb-4">
              Account Information
            </h3>
            <div className="grid gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Role</span>
                {isAdmin() ? (
                  <div className="relative group">
                    <span className="inline-flex items-center gap-1.5 cursor-pointer">
                      <Shield className="h-4 w-4 text-amber-500" />
                      <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">
                        Administrator
                      </Badge>
                    </span>
                    {/* Custom Tooltip */}
                    <div className="absolute right-0 bottom-full mb-2 px-3 py-2 bg-foreground/70 text-background text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-56 z-50">
                      <div className="flex items-start gap-2">
                        <Shield className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                        <span>
                          You have full admin access to manage the restaurant
                        </span>
                      </div>
                      <div className="absolute right-4 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-foreground" />
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <span className="inline-flex items-center gap-1.5 cursor-pointer">
                      <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">
                        Member
                      </Badge>
                    </span>
                    <div className="absolute right-0 bottom-full mb-2 px-3 py-2 bg-foreground/70 text-background text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-60 z-50">
                      <div className="flex items-start gap-2">
                        <UserCog className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                        <span>
                          Standard member account with access to reservations and
                          orders
                        </span>
                      </div>
                      <div className="absolute right-4 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-foreground/70" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="text-foreground">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last updated</span>
                <span className="text-foreground">
                  {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
