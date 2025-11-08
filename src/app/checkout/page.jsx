"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Leaf, Lock, CreditCard, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Get current user from localStorage
    const user = localStorage.getItem("currentUser")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  const bookingDetails = {
    provider: "John Plumbing Solutions",
    service: "Full Pipe Repair",
    date: "November 15, 2025",
    time: "10:00 AM",
    price: 250,
    tax: 18,
    discount: -25,
    total: 243,
  }

  const handleKhaltiPayment = async () => {
    setIsProcessing(true)

    try {
      // Convert total to paisa (1 NPR = 100 paisa)
      const amountInPaisa = bookingDetails.total * 100

      const paymentData = {
        return_url: `${window.location.origin}/api/khalti/payment-callback`,
        website_url: window.location.origin,
        amount: amountInPaisa,
        purchase_order_id: `ORDER-${Date.now()}`,
        purchase_order_name: bookingDetails.service,
        customer_info: {
          name: currentUser?.name || "Customer",
          email: currentUser?.email || "customer@example.com",
          phone: currentUser?.phone || "9876543210",
        },
       amount_breakdown: [
          {
            label: "Service Price",
            amount: bookingDetails.price * 100,
          },
          {
            label: "Tax",
            amount: bookingDetails.tax * 100,
          },
          {
            label: "Discount",
            amount: bookingDetails.discount * 100, // Keep it negative
          },
        ],
        product_details: [
          {
            identity: `service-${Date.now()}`,
            name: bookingDetails.service,
            total_price: amountInPaisa,
            quantity: 1,
            unit_price: amountInPaisa,
          },
        ],
      }

      // Call your API route to initiate payment
      const response = await fetch('/api/khalti/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      const data = await response.json()

      if (response.ok && data.payment_url) {
        // Save booking details to localStorage before redirecting
        localStorage.setItem('pendingBooking', JSON.stringify({
          ...bookingDetails,
          orderId: paymentData.purchase_order_id,
          timestamp: new Date().toISOString()
        }))

        // Redirect to Khalti payment page
        window.location.href = data.payment_url
      } else {
        throw new Error(data.error || 'Payment initiation failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment initiation failed. Please try again.')
      setIsProcessing(false)
    }
  }

  const handlePayment = () => {
    if (paymentMethod === "khalti") {
      handleKhaltiPayment()
    } else {
      // Handle other payment methods
      setIsProcessing(true)
      setTimeout(() => {
        setIsProcessing(false)
        setPaymentComplete(true)
        
        // Save booking to localStorage
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
        bookings.push({
          ...bookingDetails,
          id: Date.now().toString(),
          confirmationId: `#RF-${Date.now()}`,
          status: 'confirmed',
          paymentMethod: paymentMethod,
          createdAt: new Date().toISOString()
        })
        localStorage.setItem('bookings', JSON.stringify(bookings))
      }, 2000)
    }
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 border shadow-lg text-center bg-white">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your booking is confirmed. Check your email for details.</p>
          <div className="bg-gray-50 p-4 rounded-lg mb-8 text-left">
            <p className="text-sm font-medium text-gray-800 mb-3">Booking Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Confirmation ID:</span>
                <span className="font-semibold text-gray-800">#RF-{Date.now()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-semibold text-gray-800">{bookingDetails.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-semibold text-gray-800">{bookingDetails.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-semibold text-gray-800">
                  {bookingDetails.date} at {bookingDetails.time}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700">View My Bookings</Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Go Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-600" />
            <span className="text-xl font-bold text-gray-800">RepairFirst</span>
          </Link>
          <Link href="/" className="text-sm hover:text-green-600 transition flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Booking</h1>
              <p className="text-gray-600">Secure payment for your eco-friendly service</p>
            </div>

            {/* Steps */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        s < step
                          ? "bg-green-600 text-white"
                          : s === step
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {s < step ? <CheckCircle className="w-5 h-5" /> : s}
                    </div>
                    {s < 3 && <div className={`flex-1 h-1 ${s < step ? "bg-green-600" : "bg-gray-200"}`} />}
                  </div>
                ))}
              </div>

              {/* Step Labels */}
              <div className="flex justify-between text-xs text-gray-600 mb-8">
                <span>Review</span>
                <span>Payment</span>
                <span>Confirmation</span>
              </div>
            </div>

            {step === 1 && (
              <Card className="p-6 border bg-white shadow-lg mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Review Booking</h2>
                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-lg bg-gray-50 border">
                    <p className="text-sm text-gray-600 mb-1">Service Provider</p>
                    <p className="font-semibold text-gray-800">{bookingDetails.provider}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50 border">
                      <p className="text-sm text-gray-600 mb-1">Service</p>
                      <p className="font-semibold text-gray-800">{bookingDetails.service}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 border">
                      <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                      <p className="font-semibold text-gray-800 text-sm">{bookingDetails.date}</p>
                      <p className="font-semibold text-gray-800 text-sm">{bookingDetails.time}</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setStep(2)}>
                  Continue to Payment
                </Button>
              </Card>
            )}

            {step === 2 && (
              <Card className="p-6 border bg-white shadow-lg mb-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h2>
                  <div className="space-y-3">
                    {[
                      { id: "khalti", label: "Khalti", icon: "💰", description: "Pay with Khalti wallet" },
                      { id: "card", label: "Credit/Debit Card", icon: "💳", description: "Visa, Mastercard, etc." },
                      { id: "wallet", label: "RepairFirst Wallet", icon: "🎁", description: "Use your wallet balance" },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full p-4 rounded-lg border-2 transition flex items-start gap-3 ${
                          paymentMethod === method.id
                            ? "border-green-600 bg-green-50"
                            : "border-gray-300 hover:border-green-400"
                        }`}
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <div className="text-left flex-1">
                          <span className="font-medium text-gray-800 block">{method.label}</span>
                          <span className="text-sm text-gray-600">{method.description}</span>
                        </div>
                        {paymentMethod === method.id && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                      <input
                        type="text"
                        placeholder="4532 1234 5678 9010"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => setStep(3)}>
                    Review & Pay
                  </Button>
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card className="p-6 border bg-white shadow-lg mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Payment</h2>
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
                  <p className="text-sm text-gray-600 mb-3">Payment Method</p>
                  <p className="font-semibold text-gray-800 capitalize">
                    {paymentMethod === "khalti" ? "Khalti Payment Gateway" : 
                     paymentMethod === "card" ? "Credit Card ending in 9010" : 
                     "RepairFirst Wallet"}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 mb-6 flex gap-3">
                  <Leaf className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">
                      By completing this booking, you'll save approximately 0.15 tons of CO₂ through our eco-friendly
                      repair service instead of buying new!
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700" 
                    onClick={handlePayment} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Complete Payment"
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 border bg-white shadow-lg sticky top-24">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3 pb-4 border-b mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium text-gray-800">NPR {bookingDetails.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (7%)</span>
                  <span className="font-medium text-gray-800">NPR {bookingDetails.tax}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">Loyalty Discount</span>
                  <span className="font-medium text-green-600">NPR {bookingDetails.discount}</span>
                </div>
              </div>
              <div className="flex justify-between mb-6">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-green-600">NPR {bookingDetails.total}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 text-green-800 text-sm mb-4">
                <Lock className="w-4 h-4" />
                Secure payment with SSL encryption
              </div>
              <Button variant="outline" className="w-full text-xs text-gray-600">
                Apply Promo Code
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}