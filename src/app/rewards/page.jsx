"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Gift, Star, Zap, Trophy, TrendingUp, CheckCircle, Lock, Sparkles, Copy, Check } from "lucide-react"
import { toast } from "react-toastify"
import Header from "../components/header"

export default function RewardsPage() {
  const [userPoints, setUserPoints] = useState(0)
  const [redeemedCoupons, setRedeemedCoupons] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [copiedCode, setCopiedCode] = useState(null)

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get current user
      const user = localStorage.getItem("currentUser");
      if (user) {
        const parsedUser = JSON.parse(user);
        setCurrentUser(parsedUser);

        // Load user points
        const pointsData = JSON.parse(localStorage.getItem("userPoints") || "{}");
        setUserPoints(pointsData[parsedUser.id] || 2450); // Default points

        // Load redeemed coupons
        const couponsData = JSON.parse(localStorage.getItem("redeemedCoupons") || "{}");
        setRedeemedCoupons(couponsData[parsedUser.id] || []);
      }
    }
  }, []);

  const pointsHistory = [
    { id: 1, action: "Used eco-friendly service", points: 500, date: "2024-11-05" },
    { id: 2, action: "Referred a friend", points: 300, date: "2024-11-01" },
    { id: 3, action: "Completed repair booking", points: 200, date: "2024-10-28" },
    { id: 4, action: "Profile completed", points: 150, date: "2024-10-25" },
    { id: 5, action: "First booking", points: 500, date: "2024-10-20" },
    { id: 6, action: "Wrote a review", points: 100, date: "2024-10-18" },
    { id: 7, action: "Shared on social media", points: 50, date: "2024-10-15" },
    { id: 8, action: "Account verification", points: 200, date: "2024-10-10" },
    { id: 9, action: "Completed survey", points: 150, date: "2024-10-05" },
    { id: 10, action: "Newsletter signup", points: 100, date: "2024-10-01" },
  ]

  const availableCoupons = [
    {
      id: 1,
      title: "10% OFF",
      description: "Get 10% discount on any service",
      points: 500,
      type: "percentage",
      discountValue: 10,
      icon: "🎟️",
      color: "blue",
      validity: "30 days",
      validityDays: 30
    },
    {
      id: 2,
      title: "15% OFF",
      description: "Get 15% discount on any service",
      points: 800,
      type: "percentage",
      discountValue: 15,
      icon: "🎫",
      color: "purple",
      validity: "30 days",
      validityDays: 30
    },
    {
      id: 3,
      title: "20% OFF",
      description: "Get 20% discount on any service",
      points: 1200,
      type: "percentage",
      discountValue: 20,
      icon: "🏷️",
      color: "pink",
      validity: "45 days",
      validityDays: 45
    },
    {
      id: 4,
      title: "Free Consultation",
      description: "Free 30-minute consultation with any expert",
      points: 600,
      type: "service",
      discountValue: 0,
      icon: "💬",
      color: "green",
      validity: "60 days",
      validityDays: 60
    },
    {
      id: 5,
      title: "Priority Support",
      description: "Get priority customer support for 1 month",
      points: 1000,
      type: "service",
      discountValue: 0,
      icon: "⚡",
      color: "yellow",
      validity: "30 days",
      validityDays: 30
    },
    {
      id: 6,
      title: "$50 OFF",
      description: "Get $50 off on any service",
      points: 2000,
      type: "fixed",
      discountValue: 50,
      icon: "🎁",
      color: "red",
      validity: "90 days",
      validityDays: 90
    },
    {
      id: 7,
      title: "25% OFF Premium",
      description: "Get 25% off on premium services only",
      points: 1500,
      type: "percentage",
      discountValue: 25,
      icon: "👑",
      color: "indigo",
      validity: "60 days",
      validityDays: 60
    },
    {
      id: 8,
      title: "$30 OFF",
      description: "Get $30 off on any service",
      points: 1200,
      type: "fixed",
      discountValue: 30,
      icon: "💰",
      color: "orange",
      validity: "45 days",
      validityDays: 45
    },
  ]

  const earnMoreWays = [
    { action: "Complete a booking", points: 500, icon: "📋" },
    { action: "Refer a friend", points: 300, icon: "👥" },
    { action: "Write a review", points: 100, icon: "⭐" },
    { action: "Use eco-friendly service", points: 200, icon: "🌱" },
    { action: "Share on social media", points: 50, icon: "📱" },
    { action: "Complete your profile", points: 150, icon: "✅" },
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 border-blue-200",
      purple: "from-purple-500 to-purple-600 border-purple-200",
      pink: "from-pink-500 to-pink-600 border-pink-200",
      green: "from-green-500 to-green-600 border-green-200",
      yellow: "from-yellow-500 to-yellow-600 border-yellow-200",
      red: "from-red-500 to-red-600 border-red-200",
      indigo: "from-indigo-500 to-indigo-600 border-indigo-200",
      orange: "from-orange-500 to-orange-600 border-orange-200",
    }
    return colors[color] || colors.blue
  }

  const generateCouponCode = () => {
    return `SAHAYOG${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  const handleRedeem = (coupon) => {
    if (!currentUser) {
      toast.error("Please login to redeem coupons");
      return;
    }

    if (userPoints >= coupon.points) {
      const couponCode = generateCouponCode();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + coupon.validityDays);

      const redeemedCoupon = {
        ...coupon,
        code: couponCode,
        redeemedAt: new Date().toISOString(),
        expiresAt: expiryDate.toISOString(),
        used: false,
        active: true
      };

      // Update points
      const newPoints = userPoints - coupon.points;
      setUserPoints(newPoints);

      // Save points to localStorage
      const pointsData = JSON.parse(localStorage.getItem("userPoints") || "{}");
      pointsData[currentUser.id] = newPoints;
      localStorage.setItem("userPoints", JSON.stringify(pointsData));

      // Update redeemed coupons
      const newCoupons = [...redeemedCoupons, redeemedCoupon];
      setRedeemedCoupons(newCoupons);

      // Save coupons to localStorage
      const couponsData = JSON.parse(localStorage.getItem("redeemedCoupons") || "{}");
      couponsData[currentUser.id] = newCoupons;
      localStorage.setItem("redeemedCoupons", JSON.stringify(couponsData));

      toast.success(
        `🎉 Congratulations! You've redeemed: ${coupon.title}\n\nYour coupon code: ${couponCode}\n\nValid until: ${expiryDate.toLocaleDateString()}`
      );
    } else {
      toast.error(`You need ${coupon.points - userPoints} more points to redeem this coupon`);
    }
  }

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Coupon code copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  }

  const getNextMilestone = () => {
    if (userPoints < 1000) return { points: 1000, reward: "Bronze Badge" }
    if (userPoints < 2500) return { points: 2500, reward: "Silver Badge" }
    if (userPoints < 5000) return { points: 5000, reward: "Gold Badge" }
    return { points: 10000, reward: "Platinum Badge" }
  }

  const nextMilestone = getNextMilestone()
  const milestoneProgress = (userPoints / nextMilestone.points) * 100

  // Filter active (non-expired, unused) coupons
  const activeCoupons = redeemedCoupons.filter(coupon => {
    const isExpired = new Date(coupon.expiresAt) < new Date();
    return !coupon.used && !isExpired;
  });

  const usedCoupons = redeemedCoupons.filter(coupon => coupon.used);
  const expiredCoupons = redeemedCoupons.filter(coupon => {
    const isExpired = new Date(coupon.expiresAt) < new Date();
    return !coupon.used && isExpired;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      {/* Hero Section */}
      <Header />
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4 backdrop-blur-sm">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Sahayog Rewards Program</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your Reward Points
            </h1>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Earn points with every service and redeem amazing rewards!
            </p>
          </div>

          {/* Points Display */}
          <div className="mt-12 max-w-2xl mx-auto">
            <Card className="bg-white/95 backdrop-blur p-8 shadow-2xl border border-emerald-200">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4 shadow-lg">
                  <Star className="w-10 h-10 text-white fill-white" />
                </div>
                <h2 className="text-5xl font-bold text-gray-800 mb-2">
                  {userPoints.toLocaleString()}
                </h2>
                <p className="text-gray-600 font-medium">Sahayog Points</p>
              </div>

              {/* Milestone Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-gray-600">Next milestone: {nextMilestone.reward}</span>
                  <span className="font-semibold text-gray-800">{nextMilestone.points} points</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(milestoneProgress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {nextMilestone.points - userPoints} points to go!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Available Coupons */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Gift className="w-8 h-8 text-emerald-600" />
            <h2 className="text-3xl font-bold text-gray-800">Redeem Rewards</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableCoupons.map((coupon) => {
              const canAfford = userPoints >= coupon.points
              return (
                <Card
                  key={coupon.id}
                  className={`relative overflow-hidden transition-all duration-300 border-2 ${
                    canAfford
                      ? "hover:shadow-2xl hover:-translate-y-1 cursor-pointer border-emerald-200"
                      : "opacity-60 border-gray-200"
                  }`}
                >
                  <div className={`h-2 bg-gradient-to-r ${getColorClasses(coupon.color)}`} />
                  <div className="p-6">
                    {!canAfford && (
                      <div className="absolute top-4 right-4">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="text-4xl mb-4">{coupon.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {coupon.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {coupon.description}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-gray-800">{coupon.points} points</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Valid for: {coupon.validity}</p>
                    <Button
                      onClick={() => handleRedeem(coupon)}
                      disabled={!canAfford}
                      className={`w-full ${
                        canAfford
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {canAfford ? "Redeem Now" : `Need ${coupon.points - userPoints} more`}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Earn More Points */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-800">Earn More Points</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {earnMoreWays.map((way, index) => (
                <Card key={index} className="p-6 bg-white hover:shadow-lg transition-shadow border border-emerald-100">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{way.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{way.action}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-emerald-600">+{way.points} points</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Points History */}
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-8 h-8 text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-800">Points History</h2>
            </div>

            <Card className="bg-white border border-emerald-100">
              <div className="divide-y">
                {pointsHistory.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-emerald-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.action}</p>
                          <p className="text-sm text-gray-500">{item.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-emerald-600">+{item.points}</span>
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Redeemed Coupons & Info */}
          <div className="space-y-6">
            {/* Active Coupons */}
            <Card className="p-6 bg-white border border-emerald-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Active Coupons ({activeCoupons.length})
              </h3>
              {activeCoupons.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No active coupons</p>
                  <p className="text-gray-400 text-xs mt-1">Redeem coupons above to use at checkout!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeCoupons.map((coupon, index) => (
                    <div key={index} className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{coupon.icon}</span>
                          <span className="font-bold text-gray-800 text-sm">{coupon.title}</span>
                        </div>
                        <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full font-semibold">
                          ACTIVE
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{coupon.description}</p>
                      
                      {/* Coupon Code */}
                      <div className="bg-white border-2 border-dashed border-emerald-300 rounded-lg p-3 mb-2">
                        <p className="text-xs text-gray-500 mb-1">Coupon Code:</p>
                        <div className="flex items-center justify-between">
                          <code className="font-mono font-bold text-emerald-700 text-sm">
                            {coupon.code}
                          </code>
                          <button
                            onClick={() => copyCouponCode(coupon.code)}
                            className="p-1.5 hover:bg-emerald-100 rounded transition-colors"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                        </span>
                        {coupon.type === "percentage" && (
                          <span className="font-semibold text-emerald-600">
                            {coupon.discountValue}% OFF
                          </span>
                        )}
                        {coupon.type === "fixed" && (
                          <span className="font-semibold text-emerald-600">
                            ${coupon.discountValue} OFF
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Used Coupons */}
            {usedCoupons.length > 0 && (
              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Used Coupons ({usedCoupons.length})
                </h3>
                <div className="space-y-2">
                  {usedCoupons.map((coupon, index) => (
                    <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-60">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{coupon.icon}</span>
                        <span className="font-medium text-gray-700 text-xs">{coupon.title}</span>
                        <span className="text-xs bg-gray-400 text-white px-2 py-0.5 rounded-full ml-auto">
                          USED
                        </span>
                      </div>
                      <code className="text-xs text-gray-500 font-mono">{coupon.code}</code>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Program Benefits */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Program Benefits</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-gray-700">Earn points on every booking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-gray-700">Exclusive discounts and free services</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-gray-700">Referral bonuses for friends</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-gray-700">Priority customer support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-gray-700">Use coupons at checkout</span>
                </li>
              </ul>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Available Points</span>
                    <span className="font-bold text-gray-800">{userPoints.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((userPoints / 5000) * 100, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Active Coupons</span>
                    <span className="font-bold text-emerald-600">{activeCoupons.length}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Total Redeemed</span>
                    <span className="font-bold text-gray-800">{redeemedCoupons.length}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Rank</span>
                    <span className="font-bold text-gray-800">
                      {userPoints >= 5000 ? "Gold" : userPoints >= 2500 ? "Silver" : "Bronze"} Member
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}