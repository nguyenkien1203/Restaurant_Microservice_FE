import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface AddressesTabProps {
  address?: string
}

export function AddressesTab({ address }: AddressesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
          My Addresses
        </h1>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Add New Address
        </Button>
      </div>

      {address ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Primary Address</p>
                  <p className="text-sm text-muted-foreground mt-1">{address}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              No addresses saved
            </h3>
            <p className="text-muted-foreground">
              Add an address for faster delivery checkout.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
