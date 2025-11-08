"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, Leaf } from "lucide-react"
import Link from "next/link"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [bookingDetails, setBookingDetails] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const verifyPayment = async () => {
      const pidx = searchParams.get('pidx')
      const status = searchParams.get('status')
      const purchase_order_id = searchParams.get('purchase_order_id')

      if (!pidx) {
        setError("Invalid payment reference")
        setIsVerifying(false)
        return
      }

      try {
        // Verify payment with backend
        const response = await fetch('/api/khalti/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pidx }),
        })

        const data = await response.json()

        if (data.success && data.data.status === 'Completed') {
          setPaymentVerified(true)
          
          // Get pending booking from localStorage
          const pendingBooking = localStorage.getItem('pendingBooking')
          if (pendingBooking) {
            const booking = JSON.parse(pendingBooking)
            
            // Save confirmed booking
            const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
            const confirmedBooking = {
              ...booking,
              id: Date.now().toString(),
              confirmationId: `#RF-${Date.now()}`,
              status: 'confirmed',
              paymentMethod: 'khalti',
              paymentId: pidx,
              transactionId: data.data.transaction_id,
              createdAt: new Date().toISOString()
            }
            bookings.push(confirmedBooking)
            localStorage.setItem('bookings', JSON.stringify(bookings))
            
            setBookingDetails(confirmedBooking)
            
            // Clear pending booking
            localStorage.removeItem('pendingBooking')
          }
        } else {
          setError("Payment verification failed. Please contact support.")
        }
      } catch (err) {
        console.error('Verification error:', err)
        setError("Unable to verify payment. Please contact support.")
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams])

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center bg-white">
          <Loader2 className="w-16 h-16 text-green-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Payment...</h2>
          <p className="text-gray-600 text-sm">Please wait while we confirm your payment</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center bg-white">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4">
            <Link href="/checkout" className="flex-1">
              <Button variant="outline" className="w-full">Try Again</Button>
            </Link>
            <Link href="/contact" className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700">Contact Support</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  if (paymentVerified && bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center bg-white shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your booking is confirmed. We've sent a confirmation email with all the details.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6 text-left">
            <p className="text-sm font-semibold text-gray-800 mb-4">Booking Details</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Confirmation ID:</span>
                <span className="font-semibold text-gray-800">{bookingDetails.confirmationId}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Provider:</span>
                <span className="font-semibold text-gray-800 text-right">{bookingDetails.provider}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Service:</span>
                <span className="font-semibold text-gray-800 text-right">{bookingDetails.service}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-semibold text-gray-800 text-right">
                  {bookingDetails.date}<br />{bookingDetails.time}
                </span>
              </div>
              <div className="flex justify-between items-start pt-3 border-t border-gray-300">
                <span className="text-gray-600">Total Paid:</span>
                <span className="font-bold text-green-600 text-lg">NPR {bookingDetails.total}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Leaf className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm font-medium text-emerald-900 mb-1">
                Environmental Impact
              </p>
              <p className="text-xs text-emerald-800">
                You've saved approximately 0.15 tons of CO₂ by repairing instead of replacing! 🌍
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/dashboard" className="w-full">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                View My Bookings
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )   
  }

  return null
}