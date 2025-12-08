import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Calendar } from '@/components/reservations/calendar'
import { TimeSlots } from '@/components/reservations/time-slots'
import { GuestSelector } from '@/components/reservations/guest-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, CalendarDays, Clock, Users, UtensilsCrossed } from 'lucide-react'

export const Route = createFileRoute('/reservation')({
  component: ReservationPage,
})

function ReservationPage() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [guests, setGuests] = useState(2)
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
  })

  const [reservationId, setReservationId] = useState<string | null>(null)

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatShortDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleConfirmReservation = () => {
    const id = `RES-${Date.now().toString(36).toUpperCase()}`
    setReservationId(id)
    setStep(3)
  }

  const handlePreOrder = () => {
    const params = new URLSearchParams({
      reservationId: reservationId || '',
      date: selectedDate?.toISOString() || '',
      time: selectedTime || '',
      guests: guests.toString(),
      name: `${formData.firstName} ${formData.lastName}`,
    })
    navigate({ to: '/menu', search: Object.fromEntries(params) })
  }

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-muted py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Restaurant Info */}
            <div>
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">{currentMonth}</p>
                <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground mb-4">
                  Book Your Table
                </h1>
              </div>

              <Card className="overflow-hidden mb-6">
                <img
                  src="/elegant-restaurant-interior-with-warm-lighting-and.jpg"
                  alt="Aperture Dining Restaurant"
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-4">
                  <h2 className="font-semibold text-lg text-card-foreground mb-1">Aperture Dining</h2>
                  <p className="text-sm text-muted-foreground mb-2">Fine Dining • Contemporary</p>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-500">★★★★★</span>
                    <span className="text-muted-foreground">(248 reviews)</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Your Reservation</h3>
                  <div className="bg-card rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="text-foreground">
                        {selectedDate ? formatDate(selectedDate) : 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="text-foreground">{selectedTime || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Guests:</span>
                      <span className="text-foreground">
                        {guests} {guests === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                    {reservationId && (
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="text-muted-foreground">Reservation ID:</span>
                        <span className="text-primary font-medium">{reservationId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Form */}
            <div>
              {step === 1 && (
                <div className="space-y-6">
                  <GuestSelector guests={guests} onGuestsChange={setGuests} />
                  <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                  <TimeSlots selectedTime={selectedTime} onTimeSelect={setSelectedTime} />

                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep(2)}
                  >
                    Continue
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <h3 className="font-semibold text-lg text-card-foreground">Contact Information</h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="notes">Special Requests (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Allergies, special occasions, seating preferences..."
                          rows={3}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleConfirmReservation}
                      disabled={!formData.firstName || !formData.email || !formData.phone}
                    >
                      Confirm Reservation
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-green-800">Reservation Confirmed!</h3>
                          <p className="text-sm text-green-600">Confirmation sent to {formData.email}</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <CalendarDays className="h-5 w-5 text-muted-foreground" />
                          <span className="text-foreground">{formatShortDate(selectedDate)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <span className="text-foreground">{selectedTime}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <span className="text-foreground">
                            {guests} {guests === 1 ? 'Guest' : 'Guests'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <UtensilsCrossed className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground mb-1">Pre-order Your Meal</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Skip the wait! Browse our menu and pre-order your dishes so they're ready when you
                            arrive.
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              Faster service upon arrival
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              Guaranteed dish availability
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              Special dietary requests accommodated
                            </li>
                          </ul>
                          <Button
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={handlePreOrder}
                          >
                            Browse Menu & Pre-order
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="text-center">
                    <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
                      Return to Homepage
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
