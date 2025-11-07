"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Leaf, Lock, CreditCard, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)

  const bookingDetails = {
    provider: "Green Thumb Landscaping",
    service: "Full Garden Design",
    date: "November 15, 2025",
    time: "10:00 AM",
    price: 250,
    tax: 18,
    discount: -25,
    total: 243,
  }

  const handlePayment = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentComplete(true)
    }, 2000)
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 border border-border shadow-lg text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">Your booking is confirmed. Check your email for details.</p>
          <div className="bg-muted/30 p-4 rounded-lg mb-8 text-left">
            <p className="text-sm font-medium text-foreground mb-3">Booking Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmation ID:</span>
                <span className="font-semibold text-foreground">#GC-2025-1847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-semibold text-foreground">{bookingDetails.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-semibold text-foreground">{bookingDetails.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-semibold text-foreground">
                  {bookingDetails.date} at {bookingDetails.time}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full">View My Bookings</Button>
            </Link>
            <Link href="/browse" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Browse More Services
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">GreenCircle</span>
          </Link>
          <Link href="/browse" className="text-sm hover:text-primary transition flex items-center gap-1">
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Booking</h1>
              <p className="text-muted-foreground">Secure payment for your eco-friendly service</p>
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
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s < step ? <CheckCircle className="w-5 h-5" /> : s}
                    </div>
                    {s < 3 && <div className={`flex-1 h-1 ${s < step ? "bg-green-600" : "bg-muted"}`} />}
                  </div>
                ))}
              </div>

              {/* Step Labels */}
              <div className="flex justify-between text-xs text-muted-foreground mb-8">
                <span>Review</span>
                <span>Payment</span>
                <span>Confirmation</span>
              </div>
            </div>

            {step === 1 && (
              <Card className="p-6 border border-border mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Review Booking</h2>
                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Service Provider</p>
                    <p className="font-semibold text-foreground">{bookingDetails.provider}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Service</p>
                      <p className="font-semibold text-foreground">{bookingDetails.service}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                      <p className="font-semibold text-foreground text-sm">{bookingDetails.date}</p>
                      <p className="font-semibold text-foreground text-sm">{bookingDetails.time}</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setStep(2)}>
                  Continue to Payment
                </Button>
              </Card>
            )}

            {step === 2 && (
              <Card className="p-6 border border-border mb-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Select Payment Method</h2>
                  <div className="space-y-3">
                    {[
                      { id: "card", label: "Credit/Debit Card", icon: CreditCard },
                      { id: "paypal", label: "PayPal", icon: CreditCard },
                      { id: "wallet", label: "GreenCircle Wallet", icon: Leaf },
                    ].map((method) => {
                      const Icon = method.icon
                      return (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`w-full p-4 rounded-lg border-2 transition flex items-center gap-3 ${
                            paymentMethod === method.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <Icon className="w-5 h-5 text-primary" />
                          <span className="font-medium text-foreground">{method.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Card Number</label>
                      <input
                        type="text"
                        placeholder="4532 1234 5678 9010"
                        className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(3)}>
                    Review & Pay
                  </Button>
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card className="p-6 border border-border mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Confirm Payment</h2>
                <div className="bg-muted/30 p-4 rounded-lg mb-6 border border-border">
                  <p className="text-sm text-muted-foreground mb-3">Payment Method</p>
                  <p className="font-semibold text-foreground">Credit Card ending in 9010</p>
                </div>

                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 mb-6 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                      By completing this booking, you'll save approximately 0.15 tons of CO₂ through our eco-friendly
                      service.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handlePayment} disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Complete Payment"}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 border border-border sticky top-24">
              <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-3 pb-4 border-b border-border mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium text-foreground">${bookingDetails.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (7%)</span>
                  <span className="font-medium text-foreground">${bookingDetails.tax}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">Loyalty Discount</span>
                  <span className="font-medium text-green-600">{bookingDetails.discount}</span>
                </div>
              </div>
              <div className="flex justify-between mb-6">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">${bookingDetails.total}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary text-sm mb-4">
                <Lock className="w-4 h-4" />
                Secure payment
              </div>
              <Button variant="outline" className="w-full text-xs text-muted-foreground bg-transparent">
                Apply Promo Code
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
