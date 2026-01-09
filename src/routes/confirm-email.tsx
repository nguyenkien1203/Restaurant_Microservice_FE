import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/confirm-email')({
  component: ConfirmEmailPage,
})

function OTPInput({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, inputValue: string) => {
    const digit = inputValue.replace(/\D/g, '').slice(-1)
    const chars = value.split('')

    if (digit) {
      chars[index] = digit
      // Fill any gaps with empty strings
      while (chars.length < index) {
        chars.push('')
      }
      onChange(chars.join(''))
      // Move to next input
      if (index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const chars = value.split('')
      if (chars[index]) {
        chars[index] = ''
        onChange(chars.join(''))
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        chars[index - 1] = ''
        onChange(chars.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
    onChange(pastedData)
    const focusIndex = Math.min(pastedData.length, 5)
    setTimeout(() => inputRefs.current[focusIndex]?.focus(), 0)
  }

  const boxes = [0, 1, 2, 3, 4, 5]

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {boxes.map((index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          autoComplete="one-time-code"
          className={cn(
            'w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold',
            'rounded-lg border-2 border-gray-300',
            'bg-white text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-150',
          )}
        />
      ))}
    </div>
  )
}

function ConfirmEmailPage() {
  const navigate = useNavigate()
  const { confirmEmail, resendCode, isLoading, error, clearError } = useAuth()

  // Get email from URL search params if provided
  const searchParams = new URLSearchParams(window.location.search)
  const emailFromUrl = searchParams.get('email') || ''

  const [email, setEmail] = useState(emailFromUrl)
  const [confirmationCode, setConfirmationCode] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      )
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setResendSuccess(false)

    if (confirmationCode.length !== 6) {
      return
    }

    try {
      await confirmEmail({ email, confirmationCode })
      setIsSuccess(true)
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate({ to: '/login' })
      }, 2000)
    } catch {
      // Error is handled by the auth context
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !email) return

    clearError()
    setResendSuccess(false)

    try {
      await resendCode(email)
      setResendSuccess(true)
      setResendCooldown(60) // 60 second cooldown
    } catch {
      // Error is handled by the auth context
    }
  }

  return (
    <div className="fixed inset-0 z-50 min-h-screen flex bg-background">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-secondary">
        <div className="absolute inset-0">
          <img
            src="/elegant-restaurant-interior-with-warm-lighting-and.jpg"
            alt="Restaurant interior"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-secondary/60" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-secondary-foreground">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold">A</span>
            </div>
            <span className="font-semibold text-xl">Aperture Dining</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Almost There!</h2>
            <p className="text-secondary-foreground/80 text-lg">
              We've sent a confirmation code to your email. Enter it below to
              complete your registration and start enjoying exclusive member
              benefits.
            </p>
          </div>
          <p className="text-sm text-secondary-foreground/60">
            © 2025 Aperture Dining. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8">
        {/* Back to signup link */}
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 w-fit cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign up
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-secondary-foreground font-bold">A</span>
              </div>
              <span className="font-semibold text-xl text-foreground">
                Aperture Dining
              </span>
            </div>

            {isSuccess ? (
              // Success state
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Email Confirmed!
                </h1>
                <p className="text-muted-foreground mb-6">
                  Your email has been verified successfully. Redirecting you to
                  login...
                </p>
                <Link to="/login">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Go to Login
                  </Button>
                </Link>
              </div>
            ) : (
              // Form state
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    Confirm your email
                  </h1>
                  <p className="text-muted-foreground">
                    We've sent a 6-digit code to{' '}
                    {email ? (
                      <span className="font-medium text-foreground">
                        {email}
                      </span>
                    ) : (
                      'your email address'
                    )}
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Success message for resend */}
                {resendSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      A new confirmation code has been sent to your email.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {!emailFromUrl && (
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label className="text-center block">
                      Enter verification code
                    </Label>
                    <OTPInput
                      value={confirmationCode}
                      onChange={setConfirmationCode}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Check your email inbox and spam folder for the code
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isLoading || confirmationCode.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Email'
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      className={`font-medium ${
                        resendCooldown > 0 || !email || isLoading
                          ? 'text-muted-foreground cursor-not-allowed'
                          : 'text-primary hover:underline cursor-pointer'
                      }`}
                      onClick={handleResendCode}
                      disabled={resendCooldown > 0 || !email || isLoading}
                    >
                      {resendCooldown > 0
                        ? `Resend code (${resendCooldown}s)`
                        : 'Resend code'}
                    </button>
                  </p>
                </div>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Already confirmed?{' '}
                  <Link
                    to="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
