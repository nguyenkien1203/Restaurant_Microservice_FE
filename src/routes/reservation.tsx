import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Calendar } from '@/components/reservations/calendar'
import {
  TimeSlots,
  type TimeSlotData,
} from '@/components/reservations/time-slots'
import { GuestSelector } from '@/components/reservations/guest-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  CheckCircle2,
  CalendarDays,
  UtensilsCrossed,
  User,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getMyProfile } from '@/lib/api/profile'
import type { UserProfile } from '@/lib/types/profile'
import {
  checkAvailability,
  createMemberReservation,
  createGuestReservation,
  formatTime24to12,
  formatTime12to24,
} from '@/lib/api/reservation'
import { APP_TIMEZONE } from '@/lib/utils'

export const Route = createFileRoute('/reservation')({
  component: ReservationPage,
})

function ReservationPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [guests, setGuests] = useState(2)
  const [step, setStep] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')
  const SPECIAL_REQUESTS_LIMIT = 200
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlotData[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
  })

  // Fetch user profile if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getMyProfile()
        .then((profile) => {
          setUserProfile(profile)
          // Pre-fill form data from profile
          const nameParts = profile.fullName?.split(' ') || []
          setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: profile.email || '',
            phone: profile.phone || '',
            notes: '',
          })
        })
        .catch((err) => {
          console.error('Failed to fetch profile:', err)
        })
    }
  }, [isAuthenticated])

  // Fetch availability when date or guests change
  const fetchAvailability = useCallback(
    async (date: Date, partySize: number) => {
      setIsLoadingSlots(true)
      setSelectedTime(null) // Reset selected time when fetching new availability

      try {
        // Format date as YYYY-MM-DD in UTC+7 timezone
        const dateStr = date.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE })
        const response = await checkAvailability(dateStr, partySize)

        // Convert backend response to TimeSlotData format
        const slots: TimeSlotData[] = response.availableSlots.map((slot) => ({
          time: formatTime24to12(slot.time),
          available: slot.tablesAvailable > 0,
          tablesAvailable: slot.tablesAvailable,
        }))

        setTimeSlots(slots)
      } catch (error) {
        console.error('Failed to fetch availability:', error)
        setTimeSlots([]) // Clear slots on error
      } finally {
        setIsLoadingSlots(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate, guests)
    }
  }, [selectedDate, guests, fetchAvailability])

  const [reservationId, setReservationId] = useState<number | null>(null)
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const formatDate = (date: Date | null) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: APP_TIMEZONE,
    })
  }

  const handleConfirmReservation = async () => {
    if (!selectedDate || !selectedTime) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Format date as YYYY-MM-DD in UTC+7 timezone
      const reservationDate = selectedDate.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE })
      // Convert time from 12-hour to 24-hour format (HH:mm)
      const time24 = formatTime12to24(selectedTime)
      const startTime = time24.substring(0, 5) // Remove seconds, keep HH:mm

      // Call appropriate API based on auth state
      const response = isAuthenticated
        ? await createMemberReservation({
            reservationDate,
            startTime,
            partySize: guests,
            specialRequests: specialRequests || undefined,
          })
        : await createGuestReservation({
            reservationDate,
            startTime,
            partySize: guests,
            specialRequests: specialRequests || undefined,
            guestName: `${formData.firstName} ${formData.lastName}`.trim(),
            guestEmail: formData.email,
            guestPhone: formData.phone,
          })

      setReservationId(response.id)
      setConfirmationCode(response.confirmationCode)

      // Store special requests in notes for logged-in users
      if (isAuthenticated) {
        setFormData((prev) => ({ ...prev, notes: specialRequests }))
      }
      setStep(3)
    } catch (error) {
      console.error('Failed to create reservation:', error)
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to create reservation',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreOrder = () => {
    const name = isAuthenticated
      ? userProfile?.fullName || user?.fullName || ''
      : `${formData.firstName} ${formData.lastName}`
    const params = new URLSearchParams({
      reservationId: reservationId?.toString() || '',
      date: selectedDate?.toISOString() || '',
      time: selectedTime || '',
      guests: guests.toString(),
      name,
    })

    // For guest users, pass contact info to menu/checkout
    if (!isAuthenticated) {
      if (formData.firstName) params.set('firstName', formData.firstName)
      if (formData.lastName) params.set('lastName', formData.lastName)
      if (formData.email) params.set('email', formData.email)
      if (formData.phone) params.set('phone', formData.phone)
    }

    // Always pass reservation date and time for pre-orders
    if (selectedDate) {
      // Format date as YYYY-MM-DD in UTC+7 timezone
      const dateStr = selectedDate.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE })
      params.set('reservationDate', dateStr)
    }
    if (selectedTime) {
      params.set('reservationTime', selectedTime)
    }

    navigate({ to: '/menu', search: Object.fromEntries(params) })
  }

  // Get the email to display in confirmation
  const getConfirmationEmail = () => {
    return isAuthenticated
      ? userProfile?.email || user?.email || ''
      : formData.email
  }

  const currentMonth = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: APP_TIMEZONE,
  })

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-muted py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-2">{currentMonth}</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-foreground">
              Book Your Table
            </h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Selection Forms (2/3 width) */}
            <div className="lg:col-span-2">
              {step === 1 && (
                <div className="space-y-6">
                  <GuestSelector guests={guests} onGuestsChange={setGuests} />
                  <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                  />
                  <TimeSlots
                    selectedTime={selectedTime}
                    onTimeSelect={setSelectedTime}
                    slots={timeSlots.length > 0 ? timeSlots : undefined}
                    isLoading={isLoadingSlots}
                    hasDateSelected={!!selectedDate}
                  />

                  {/* Special Requests - for all users */}
                  <Card>
                    <CardContent className="px-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-muted-foreground" />
                          <Label
                            htmlFor="specialRequests"
                            className="text-sm font-medium"
                          >
                            Special Requests (Optional)
                          </Label>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {specialRequests.length}/{SPECIAL_REQUESTS_LIMIT}
                        </span>
                      </div>
                      <Textarea
                        id="specialRequests"
                        placeholder="Allergies, special occasions, seating preferences..."
                        rows={3}
                        value={specialRequests}
                        onChange={(e) => {
                          if (e.target.value.length <= SPECIAL_REQUESTS_LIMIT) {
                            setSpecialRequests(e.target.value)
                          }
                        }}
                        maxLength={SPECIAL_REQUESTS_LIMIT}
                        className="resize-none"
                      />
                    </CardContent>
                  </Card>

                  {/* Continue button only for guests (logged-in users confirm via sidebar) */}
                  {!isAuthenticated && (
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => setStep(2)}
                    >
                      Continue
                    </Button>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="px-6 space-y-4">
                      <h3 className="font-semibold text-lg text-card-foreground">
                        Contact Information
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                firstName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                lastName: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {submitError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                      {submitError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleConfirmReservation}
                      disabled={
                        isSubmitting ||
                        !formData.firstName ||
                        !formData.email ||
                        !formData.phone
                      }
                    >
                      {isSubmitting ? 'Creating...' : 'Confirm Reservation'}
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="px-6 py-2">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-green-800">
                            Reservation Confirmed!
                          </h3>
                          <p className="text-sm text-green-600">
                            Confirmation sent to {getConfirmationEmail()}
                          </p>
                        </div>
                      </div>

                      {/* Reservation ID and Confirmation Code */}
                      <div className="bg-white border-2 border-dashed border-green-300 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                              Reservation ID
                            </p>
                            <p className="text-2xl font-bold text-primary">
                              #{reservationId}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                              Confirmation Code
                            </p>
                            <p className="text-lg font-bold text-primary tracking-wider">
                              {confirmationCode}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="px-6 py-2">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <UtensilsCrossed className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground mb-1">
                            Pre-order Your Meal
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Skip the wait! Browse our menu and pre-order your
                            dishes so they're ready when you arrive.
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
                    <Button
                      variant="ghost"
                      onClick={() => navigate({ to: '/' })}
                    >
                      Return to Homepage
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Reservation Summary (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                {/* Summary Card */}
                <Card>
                  <CardContent className="px-4">
                    {/* Card Header */}
                    <div className="p-4 pt-0 border-b border-border">
                      <h2 className="font-semibold text-foreground text-lg">
                        Reservation Summary
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Please review your booking details below
                      </p>
                    </div>
                    {/* Contact Info Section - Same layout for all users */}
                    <div className="p-4 border-b border-border">
                      <h3 className="font-medium text-foreground text-sm mb-3 flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Contact Information
                      </h3>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">
                              Name
                            </p>
                            <p className="text-sm text-foreground font-medium">
                              {isAuthenticated
                                ? userProfile?.fullName || user?.fullName || '—'
                                : formData.firstName && formData.lastName
                                  ? `${formData.firstName} ${formData.lastName}`
                                  : formData.firstName || '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">
                              Email
                            </p>
                            <p className="text-sm text-foreground font-medium">
                              {isAuthenticated
                                ? userProfile?.email || user?.email || '—'
                                : formData.email || '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">
                              Phone
                            </p>
                            <p className="text-sm text-foreground font-medium">
                              {isAuthenticated
                                ? userProfile?.phone || '—'
                                : formData.phone || '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reservation Details Section */}
                    <div className="p-4">
                      <h3 className="font-medium text-foreground text-sm mb-3 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Booking Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Date
                          </span>
                          <span className="text-sm text-foreground font-medium">
                            {selectedDate
                              ? formatDate(selectedDate)
                              : 'Not selected'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Time
                          </span>
                          <span className="text-sm text-foreground font-medium">
                            {selectedTime || 'Not selected'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Party Size
                          </span>
                          <span className="text-sm text-foreground font-medium">
                            {guests} {guests === 1 ? 'person' : 'people'}
                          </span>
                        </div>
                        {specialRequests ? (
                          <div>
                            <span className="text-sm text-muted-foreground">
                              Special Requests
                            </span>
                            <p className="text-sm text-foreground mt-1 bg-muted/50 rounded-md p-2">
                              {specialRequests}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Special Requests
                            </span>
                            <span className="text-sm text-foreground font-medium">
                              None
                            </span>
                          </div>
                        )}
                        {reservationId && (
                          <div className="pt-3 border-t border-border">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Reservation ID
                              </span>
                              <span className="text-sm text-primary font-semibold">
                                {reservationId}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Error display for logged-in users */}
                      {isAuthenticated && submitError && step === 1 && (
                        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                          {submitError}
                        </div>
                      )}

                      {/* Confirm Button for logged-in users */}
                      {isAuthenticated && step === 1 && (
                        <Button
                          className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={
                            isSubmitting || !selectedDate || !selectedTime
                          }
                          onClick={handleConfirmReservation}
                        >
                          {isSubmitting ? 'Creating...' : 'Confirm Reservation'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
