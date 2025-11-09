"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Leaf, Lock, CreditCard, CheckCircle, AlertCircle, ArrowLeft, Tag, X, Gift } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"
import { getUserActiveCoupons, applyCoupon, markCouponAsUsed, getCouponDisplayText, addPoints } from "@/utils/couponUtils"

export default function CheckoutPage() {
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [bookingDetails, setBookingDetails] = useState(null)
  
  // Coupon states
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [couponCode, setCouponCode] = useState("")
  const [showCouponList, setShowCouponList] = useState(false)
  
  const [confirmationId, setConfirmationId] = useState("")

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    // Get current user from localStorage
    const user = localStorage.getItem("currentUser")
    if (user) {
      const parsedUser = JSON.parse(user)
      setCurrentUser(parsedUser)
      
      // Load user's active coupons
      const coupons = getUserActiveCoupons(parsedUser.id)
      setAvailableCoupons(coupons)
    }

    // Get booking details from localStorage (passed from booking modal)
    const booking = localStorage.getItem("pendingCheckout")
    if (booking) {
      const parsedBooking = JSON.parse(booking)
      setBookingDetails(parsedBooking)
    } else {
      // Default booking for testing
      setBookingDetails({
        provider: "John Plumbing Solutions",
        providerId: "provider_123",
        service: "Full Pipe Repair",
        date: "November 15, 2025",
        time: "10:00 AM",
        price: 250,
        tax: 18,
      })
    }
  }, [])

  // Calculate totals
  const subtotal = bookingDetails?.price || 0
  const tax = bookingDetails?.tax || 0
  const total = subtotal + tax - discount

  const handleApplyCoupon = (coupon) => {
    if (!currentUser) {
      toast.error("Please login to apply coupons")
      return
    }

    const result = applyCoupon(coupon.code, subtotal, currentUser.id)

    if (result.success) {
      setAppliedCoupon(result.coupon)
      setDiscount(result.discount)
      setCouponCode(coupon.code)
      setShowCouponList(false)
      toast.success(`🎉 ${result.message}! You saved NPR ${result.discount}`)
    } else {
      toast.error(result.error)
    }
  }

  const handleApplyCouponByCode = () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code")
      return
    }

    const result = applyCoupon(couponCode, subtotal, currentUser.id)

    if (result.success) {
      setAppliedCoupon(result.coupon)
      setDiscount(result.discount)
      toast.success(`🎉 ${result.message}! You saved NPR ${result.discount}`)
    } else {
      toast.error(result.error)
      setCouponCode("")
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscount(0)
    setCouponCode("")
    toast.info("Coupon removed")
  }

  const handleKhaltiPayment = async () => {
    setIsProcessing(true)

    try {
      const amountInPaisa = Math.round(total * 100)
      const orderId = `ORDER-${Date.now()}`

      const paymentData = {
        return_url: `${window.location.origin}/api/khalti/payment-callback`,
        website_url: window.location.origin,
        amount: amountInPaisa,
        purchase_order_id: orderId,
        purchase_order_name: bookingDetails.service,
        customer_info: {
          name: currentUser?.name || "Customer",
          email: currentUser?.email || "customer@example.com",
          phone: currentUser?.phone_number || "9876543210",
        },
        amount_breakdown: [
          {
            label: "Service Price",
            amount: subtotal * 100,
          },
          {
            label: "Tax",
            amount: tax * 100,
          },
          ...(discount > 0 ? [{
            label: "Discount",
            amount: -discount * 100,
          }] : []),
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

      const response = await fetch('/api/khalti/initiate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      const data = await response.json()

      if (response.ok && data.payment_url) {
        // Save booking details before redirecting
        const booking = {
          ...bookingDetails,
          orderId: orderId,
          customerId: currentUser?.id,
          customerName: currentUser?.name,
          total: total,
          subtotal: subtotal,
          tax: tax,
          discount: discount,
          coupon: appliedCoupon,
          paymentMethod: "khalti",
          status: "confirmed", // Khalti payments are confirmed immediately
          timestamp: new Date().toISOString()
        }
        
        localStorage.setItem('pendingBooking', JSON.stringify(booking))

        // Mark coupon as used
        if (appliedCoupon) {
          markCouponAsUsed(appliedCoupon.code, currentUser.id)
        }

        // Redirect to Khalti
        window.location.href = data.payment_url
      } else {
        throw new Error(data.error || 'Payment initiation failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment initiation failed. Please try again.')
      setIsProcessing(false)
    }
  }

  const handlePayment = async () => {
    if (paymentMethod === "khalti") {
      handleKhaltiPayment()
      return
    }

    // For other payment methods - create booking in MongoDB
    setIsProcessing(true)
    
    try {
      const confId = `SAH-${Date.now()}`
      
      // Create booking object
      const bookingData = {
        confirmationId: confId,
        customerId: currentUser?.id,
        customerName: currentUser?.name,
        customerEmail: currentUser?.email,
        customerPhone: currentUser?.phone_number,
        providerId: bookingDetails.providerId,
        provider: bookingDetails.provider,
        service: bookingDetails.service,
        date: bookingDetails.date,
        time: bookingDetails.time,
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        total: total,
        coupon: appliedCoupon || undefined,
        paymentMethod: paymentMethod,
        status: "pending"
      }

      // Save to MongoDB
      const response = await fetch(`${BACKEND_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create booking')
      }

      setConfirmationId(confId)

      // Mark coupon as used
      if (appliedCoupon) {
        markCouponAsUsed(appliedCoupon.code, currentUser.id)
      }

      // Award points for booking (only 50% for pending bookings)
      addPoints(currentUser.id, 250, "Booking request created")

      setIsProcessing(false)
      setPaymentComplete(true)

      // Clear pending checkout
      localStorage.removeItem('pendingCheckout')
      
      toast.success("Booking request sent successfully!")
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Failed to create booking. Please try again.')
      setIsProcessing(false)
    }
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-gray-600">Loading checkout...</p>
        </Card>
      </div>
    )
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 border-2 border-emerald-200 shadow-2xl text-center bg-white">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-emerald-600 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Request Sent!</h1>
          <p className="text-gray-600 mb-6">
            {paymentMethod === "khalti" 
              ? "Your booking is confirmed. Check your email for details."
              : "Your booking request has been sent to the service provider. You'll be notified once they accept."}
          </p>
          
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl mb-8 text-left border-2 border-emerald-200">
            <p className="text-sm font-bold text-emerald-700 mb-4 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Booking Details
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Confirmation ID:</span>
                <span className="font-semibold text-gray-800">{confirmationId}</span>
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
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-600">Total Paid:</span>
                <span className="text-xl font-bold text-emerald-600">NPR {total.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="text-sm">💰 You Saved:</span>
                  <span className="font-bold">NPR {discount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              ✨ You earned <span className="font-bold">250 Sahayog Points</span>!
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/bookings" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                View My Bookings
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                Go Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-600" />
            <span className="text-xl font-bold text-gray-800">Sahayog</span>
          </Link>
          <Link href="/" className="text-sm hover:text-emerald-600 transition flex items-center gap-1">
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
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        s < step
                          ? "bg-emerald-600 text-white"
                          : s === step
                            ? "bg-emerald-600 text-white shadow-lg"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {s < step ? <CheckCircle className="w-5 h-5" /> : s}
                    </div>
                    {s < 3 && <div className={`flex-1 h-1 rounded ${s < step ? "bg-emerald-600" : "bg-gray-200"}`} />}
                  </div>
                ))}
              </div>

              {/* Step Labels */}
              <div className="flex justify-between text-xs text-gray-600 mb-8">
                <span className="font-medium">Review</span>
                <span className="font-medium">Payment</span>
                <span className="font-medium">Confirmation</span>
              </div>
            </div>

            {/* Step 1: Review */}
            {step === 1 && (
              <Card className="p-6 border-2 border-emerald-200 bg-white shadow-xl mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Review Booking</h2>
                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                    <p className="text-sm text-gray-600 mb-1">Service Provider</p>
                    <p className="font-bold text-gray-800">{bookingDetails.provider}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Service</p>
                      <p className="font-semibold text-gray-800">{bookingDetails.service}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                      <p className="font-semibold text-gray-800 text-sm">{bookingDetails.date}</p>
                      <p className="font-semibold text-gray-800 text-sm">{bookingDetails.time}</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" onClick={() => setStep(2)}>
                  Continue to Payment
                </Button>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <Card className="p-6 border-2 border-emerald-200 bg-white shadow-xl mb-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h2>
                  <div className="space-y-3">
                    {[
                      { id: "khalti", label: "Khalti", icon: "💰", description: "Pay instantly with Khalti (Confirmed immediately)" },
                      { id: "card", label: "Credit/Debit Card", icon: "💳", description: "Pay on arrival (Pending approval)" },
                      { id: "cash", label: "Cash on Service", icon: "💵", description: "Pay when service is done (Pending approval)" },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                          paymentMethod === method.id
                            ? "border-emerald-600 bg-emerald-50 shadow-md"
                            : "border-gray-300 hover:border-emerald-400 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <div className="text-left flex-1">
                          <span className="font-semibold text-gray-800 block">{method.label}</span>
                          <span className="text-sm text-gray-600">{method.description}</span>
                        </div>
                        {paymentMethod === method.id && (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod !== "khalti" && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Booking Request</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Your booking will be sent as a request to the provider. You'll be notified when they accept.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" onClick={() => setStep(3)}>
                    Review & Pay
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <Card className="p-6 border-2 border-emerald-200 bg-white shadow-xl mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Payment</h2>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Payment Method</p>
                  <p className="font-bold text-gray-800 capitalize">
                    {paymentMethod === "khalti" ? "💰 Khalti Payment Gateway" : 
                     paymentMethod === "card" ? "💳 Credit/Debit Card (Pay on Arrival)" : 
                     "💵 Cash on Service"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 mb-6 flex gap-3">
                  <Leaf className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      🌍 By completing this booking, you'll save approximately 0.15 tons of CO₂ through our eco-friendly
                      repair service instead of buying new!
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-gray-300" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg" 
                    onClick={handlePayment} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>Complete Booking</>
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 border-2 border-emerald-200 bg-white shadow-xl sticky top-24">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              
              <div className="space-y-3 pb-4 border-b mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium text-gray-800">NPR {subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (7%)</span>
                  <span className="font-medium text-gray-800">NPR {tax}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Coupon Discount
                    </span>
                    <span className="font-bold text-emerald-600">-NPR {discount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between mb-6">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-emerald-600">NPR {total.toFixed(2)}</span>
              </div>

              {/* Coupon Section */}
              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-emerald-700">Coupon Applied!</span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="p-1 hover:bg-red-50 rounded-full">
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-800">{appliedCoupon.title}</p>
                      <code className="text-xs bg-white px-2 py-1 rounded mt-1 inline-block font-mono text-emerald-700">
                        {appliedCoupon.code}
                      </code>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCouponByCode()}
                      />
                      <Button 
                        size="sm" 
                        onClick={handleApplyCouponByCode}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Apply
                      </Button>
                    </div>
                    
                    {availableCoupons.length > 0 && (
                      <button
                        onClick={() => setShowCouponList(!showCouponList)}
                        className="w-full text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
                      >
                        {showCouponList ? "Hide" : "View"} Available Coupons ({availableCoupons.length})
                      </button>
                    )}

                    {showCouponList && availableCoupons.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {availableCoupons.map((coupon) => (
                          <div
                            key={coupon.code}
                            onClick={() => handleApplyCoupon(coupon)}
                            className="p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{coupon.title}</p>
                                <p className="text-xs text-gray-600">{coupon.description}</p>
                              </div>
                              <span className="text-xs font-bold text-emerald-600">
                                {getCouponDisplayText(coupon)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 text-green-800 text-sm mb-4">
                <Lock className="w-4 h-4" />
                Secure payment with SSL encryption
              </div>

              {!appliedCoupon && availableCoupons.length === 0 && (
                <Link href="/rewards">
                  <Button variant="outline" className="w-full text-sm border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                    Get Coupons from Rewards
                  </Button>
                </Link>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}