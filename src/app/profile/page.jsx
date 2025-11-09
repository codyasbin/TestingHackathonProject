"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Leaf, Mail, Phone, MapPin, Award, TrendingUp, Settings, LogOut, Edit2 } from "lucide-react"
import Link from "next/link"
import Header from "../components/header"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Passionate about sustainable living and eco-friendly solutions",
    carbonSaved: 2.5,
    bookingsCompleted: 18,
    memberSince: "2024",
  })


  // fetch userdata from localStorage on component mount
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    if (currentUser) {
      setProfile((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        // location: currentUser.location || prev.location,
      }))
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Header />
      {/* <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">GreenCircle</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm hover:text-primary transition">
              Dashboard
            </Link>
            <Button variant="outline" size="sm">
              Sign out
            </Button>
          </div>
        </div>
      </nav> */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your account and sustainability journey</p>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="sm" className="gap-2">
            <Edit2 className="w-4 h-4" />
            {isEditing ? "Done" : "Edit"}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-2 p-8 border border-border">
            <div className="flex items-start gap-6 mb-8 pb-8 border-b border-border">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold text-primary">{profile.name[0]}</span>
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="text-2xl font-bold text-foreground w-full mb-2 px-2 py-1 rounded border border-border bg-input"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-foreground mb-2">{profile.name}</h2>
                )}
                {isEditing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-border bg-input text-muted-foreground text-sm"
                    rows="2"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">{profile.bio}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="flex-1 px-2 py-1 rounded border border-border bg-input text-foreground"
                  />
                ) : (
                  <span className="text-foreground">{profile.email}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="flex-1 px-2 py-1 rounded border border-border bg-input text-foreground"
                  />
                ) : (
                  <span className="text-foreground">{profile.phone}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="flex-1 px-2 py-1 rounded border border-border bg-input text-foreground"
                  />
                ) : (
                  <span className="text-foreground">{profile.location}</span>
                )}
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="space-y-4">
            <Card className="p-6 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Carbon Saved</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{profile.carbonSaved} tons</div>
              <p className="text-xs text-muted-foreground mt-2">Equivalent to planting 40 trees</p>
            </Card>

            <Card className="p-6 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Bookings</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{profile.bookingsCompleted}</div>
              <p className="text-xs text-muted-foreground mt-2">Services completed</p>
            </Card>

            <Card className="p-6 border border-border">
              <div className="flex items-center gap-3 mb-2">
                <Leaf className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Member Since</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{profile.memberSince}</div>
              <p className="text-xs text-muted-foreground mt-2">Growing our community</p>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
