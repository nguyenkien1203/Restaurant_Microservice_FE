import { CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function PaymentMethodsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
          Payment Methods
        </h1>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Add Payment Method
        </Button>
      </div>
      <Card>
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            No payment methods
          </h3>
          <p className="text-muted-foreground">
            Add a payment method for faster checkout.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
