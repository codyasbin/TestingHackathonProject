"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Gift, Star, Zap, Trophy, TrendingUp, CheckCircle, Lock, Sparkles } from "lucide-react"

export default function RewardsPage() {
  const [userPoints, setUserPoints] = useState(2450)
  const [redeemedCoupons, setRedeemedCoupons] = useState([])

  const pointsHistory = [
    { id: 1, action: "Completed repair booking", points: 500, date: "2024-11-05" },
    { id: 2, action: "Referred a friend", points: 300, date: "2024-11-01" },
    { id: 3, action: "Used eco-friendly service", points: 200, date: "2024-10-28" },
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
      type: "discount",
      icon: "🎟️",
      color: "blue",
      validity: "30 days"
    },
    {
      id: 2,
      title: "15% OFF",
      description: "Get 15% discount on any service",
      points: 800,
      type: "discount",
      icon: "🎫",
      color: "purple",
      validity: "30 days"
    },
    {
      id: 3,
      title: "20% OFF",
      description: "Get 20% discount on any service",
      points: 1200,
      type: "discount",
      icon: "🏷️",
      color: "pink",
      validity: "45 days"
    },
    {
      id: 4,
      title: "Free Consultation",
      description: "Free 30-minute consultation with any expert",
      points: 600,
      type: "service",
      icon: "💬",
      color: "green",
      validity: "60 days"
    },
    {
      id: 5,
      title: "Priority Support",
      description: "Get priority customer support for 1 month",
      points: 1000,
      type: "service",
      icon: "⚡",
      color: "yellow",
      validity: "30 days"
    },
    {
      id: 6,
      title: "Free Service (Up to $50)",
      description: "Get any service worth up to $50 completely free",
      points: 2000,
      type: "service",
      icon: "🎁",
      color: "red",
      validity: "90 days"
    },
    {
      id: 7,
      title: "25% OFF Premium",
      description: "Get 25% off on premium services only",
      points: 1500,
      type: "discount",
      icon: "👑",
      color: "indigo",
      validity: "60 days"
    },
    {
      id: 8,
      title: "Double Points Week",
      description: "Earn 2x Sahayog Points on all bookings for 7 days",
      points: 1800,
      type: "special",
      icon: "✨",
      color: "orange",
      validity: "Available to activate anytime"
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

  const handleRedeem = (coupon) => {
    if (userPoints >= coupon.points) {
      setUserPoints(userPoints - coupon.points)
      setRedeemedCoupons([...redeemedCoupons, { ...coupon, redeemedAt: new Date().toISOString() }])
      alert(`🎉 Congratulations! You've redeemed: ${coupon.title}\n\nYour coupon code: SAHAYOG${Math.random().toString(36).substr(2, 9).toUpperCase()}\n\nValid for: ${coupon.validity}`)
    }
  }

  const getNextMilestone = () => {
    if (userPoints < 1000) return { points: 1000, reward: "Bronze Badge" }
    if (userPoints < 2500) return { points: 2500, reward: "Silver Badge" }
    if (userPoints < 5000) return { points: 5000, reward: "Gold Badge" }
    return { points: 10000, reward: "Platinum Badge" }
  }

  const nextMilestone = getNextMilestone()
  const milestoneProgress = (userPoints / nextMilestone.points) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Sahayog Rewards Program</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your Reward Points
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Earn points with every repair and redeem amazing rewards!
            </p>
          </div>

          {/* Points Display */}
          <div className="mt-12 max-w-2xl mx-auto">
            <Card className="bg-white/95 backdrop-blur p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
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
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
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
            <Gift className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-800">Redeem Rewards</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableCoupons.map((coupon) => {
              const canAfford = userPoints >= coupon.points
              return (
                <Card
                  key={coupon.id}
                  className={`relative overflow-hidden transition-all duration-300 ${
                    canAfford
                      ? "hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
                      : "opacity-60"
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
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-gray-800">{coupon.points} points</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Valid for: {coupon.validity}</p>
                    <Button
                      onClick={() => handleRedeem(coupon)}
                      disabled={!canAfford}
                      className={`w-full ${
                        canAfford
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
                <Card key={index} className="p-6 bg-white hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{way.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{way.action}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-green-600">+{way.points} points</span>
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

            <Card className="bg-white">
              <div className="divide-y">
                {pointsHistory.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{item.action}</p>
                          <p className="text-sm text-gray-500">{item.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-green-600">+{item.points}</span>
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Redeemed Coupons & Info */}
          <div className="space-y-6">
            {/* Redeemed Coupons */}
            <Card className="p-6 bg-white">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                My Coupons
              </h3>
              {redeemedCoupons.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No coupons redeemed yet</p>
                  <p className="text-gray-400 text-xs mt-1">Start redeeming to see your coupons here!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {redeemedCoupons.map((coupon, index) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{coupon.icon}</span>
                        <span className="font-semibold text-gray-800 text-sm">{coupon.title}</span>
                      </div>
                      <p className="text-xs text-gray-600">{coupon.description}</p>
                      <p className="text-xs text-green-600 font-medium mt-2">
                        Valid: {coupon.validity}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Program Benefits */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
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
                  <span className="text-gray-700">Points never expire</span>
                </li>
              </ul>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Total Earned</span>
                    <span className="font-bold text-gray-800">3,200 points</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "76%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Redeemed</span>
                    <span className="font-bold text-gray-800">{redeemedCoupons.length} coupons</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Rank</span>
                    <span className="font-bold text-gray-800">Silver Member</span>
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