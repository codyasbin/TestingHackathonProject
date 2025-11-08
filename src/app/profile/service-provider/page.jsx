"use client";

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Leaf, Mail, Phone, MapPin, Award, TrendingUp, Settings, LogOut, Edit2, DollarSign, Clock, CheckCircle, Wrench, Star, Sparkles, Loader2, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";




export default function ServiceProviderProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const [profile, setProfile] = useState({
    // Personal Info
    name: "John Plumbing Solutions",
    email: "john@plumbingsolutions.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    bio: "Expert plumber with 10 years experience",

    // Service Details
    category: "plumbing",
    services: ["Pipe Repairs", "Leak Detection", "Installation", "Emergency Services"],
    price: 50,
    negotiable: true,
    description: "I provide comprehensive plumbing solutions for residential and commercial properties. Specializing in repairs, installations, and emergency services.",
    sustainability: "Uses eco-friendly materials and water-saving fixtures",
    languages: ["English", "Spanish"],
    responseTime: "30 mins",

    // Stats
    rating: 4.8,
    reviews: 234,
    bookingsCompleted: 156,
    carbonSaved: 5.2,
    memberSince: "2020",
    verified: true,
  });

  const [newService, setNewService] = useState("")
  const [newLanguage, setNewLanguage] = useState("")
  
  // AI Enhancement States
  const [aiModal, setAiModal] = useState({ open: false, field: null })
  const [aiPrompt, setAiPrompt] = useState("")
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhancedText, setEnhancedText] = useState("")

  useEffect(() => {
    // Load from localStorage on mount
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.role === "provider") {
        setProfile((prev) => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
          location: user.location || prev.location,
        }));
      }
    }
  }, []);

  const handleSave = () => {
    // Save to localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const updatedUser = {...currentUser, ...profile};
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    // Update in users array
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u) => u.email === profile.email);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem("users", JSON.stringify(users));
    }

    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const addService = () => {
    if (newService.trim()) {
      setProfile({
        ...profile,
        services: [...profile.services, newService.trim()],
      });
      setNewService("");
    }
  };

  const removeService = (index) => {
    setProfile({
      ...profile,
      services: profile.services.filter((_, i) => i !== index),
    });
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !profile.languages.includes(newLanguage.trim())) {
      setProfile({
        ...profile,
        languages: [...profile.languages, newLanguage.trim()],
      });
      setNewLanguage("");
    }
  };

  const removeLanguage = (index) => {
    setProfile({
      ...profile,
      languages: profile.languages.filter((_, i) => i !== index)
    })
  }

  // AI Enhancement Functions
  const openAiModal = (field) => {
    setAiModal({ open: true, field })
    setAiPrompt("")
    setEnhancedText("")
  }

  const closeAiModal = () => {
    setAiModal({ open: false, field: null })
    setAiPrompt("")
    setEnhancedText("")
  }

  const enhanceWithAI = async (useCustomPrompt = false) => {
    setIsEnhancing(true)
    setEnhancedText("")
    
    try {
      const currentText = profile[aiModal.field]
      const fieldName = aiModal.field === 'bio' ? 'professional bio' : 
                       aiModal.field === 'description' ? 'service description' :
                       aiModal.field === 'sustainability' ? 'sustainability practices description' : aiModal.field
      
      let userMessage = ""
      if (useCustomPrompt && aiPrompt.trim()) {
        userMessage = `Enhance the following ${fieldName} according to these instructions: "${aiPrompt}"\n\nCurrent text: "${currentText}"\n\nProvide only the enhanced text without any explanations or preamble.`
      } else {
        userMessage = `Enhance the following ${fieldName} to make it more professional, engaging, and compelling while maintaining authenticity. Keep it concise but impactful.\n\nCurrent text: "${currentText}"\n\nProvide only the enhanced text without any explanations or preamble.`
      }

      const response = await fetch('/api/gpt/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are an expert copywriter specializing in service provider profiles. Your task is to enhance text to be professional, compelling, and authentic."
            },
            {
              role: "user",
              content: userMessage
            }
          ]
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to enhance text')
      }

      const data = await response.json()
      
      // Extract content from OpenAI-style response structure
      const enhanced = data.choices?.[0]?.message?.content || "Enhancement failed"
      setEnhancedText(enhanced.trim())
    } catch (error) {
      console.error('AI Enhancement Error:', error)
      alert('Failed to enhance text. Please try again.')
    } finally {
      setIsEnhancing(false)
    }
  }

  const applyEnhancement = () => {
    if (enhancedText) {
      setProfile({
        ...profile,
        [aiModal.field]: enhancedText
      })
      closeAiModal()
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50">
      {/* Navigation */}
      <Header/>
      {/* <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-600" />
            <span className="text-xl font-bold text-gray-800">RepairFirst</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/provider-dashboard" className="text-sm hover:text-green-600 transition">
              Dashboard
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem("currentUser");
                window.location.href = "/login";
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </nav> */}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Service Provider Profile</h1>
            <p className="text-gray-600">Manage your service details and availability</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <Card className="lg:col-span-2 p-8 bg-white shadow-lg">
            <div className="flex items-start gap-6 mb-8 pb-8 border-b">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center shrink-0 relative">
                <span className="text-3xl font-bold text-green-600">{profile.name.substring(0, 2).toUpperCase()}</span>
                {profile.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="text-2xl font-bold w-full mb-2 px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
                    {profile.verified && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                        Verified
                      </span>
                    )}
                    <Button
                      onClick={() => router.push("/verify-profile")}
                      className="bg-blue-500 text-white rounded-full px-2 py-1 text-xs"
                    >
                      Verify Your Profile
                    </Button>
                  </div>
                )}
                
                {/* Bio with AI Enhancement */}
                <div className="relative">
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-gray-600 text-sm"
                        rows="2"
                      />
                      <Button
                        onClick={() => openAiModal('bio')}
                        size="sm"
                        variant="outline"
                        className="gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        <Sparkles className="w-3 h-3" />
                        Enhance with AI
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">{profile.bio}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(profile.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{profile.rating}</span>
                  <span className="text-sm text-gray-500">({profile.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 mb-8 pb-8 border-b">
              <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="flex-1 px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                ) : (
                  <span className="text-gray-700">{profile.email}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="flex-1 px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                ) : (
                  <span className="text-gray-700">{profile.phone}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                    className="flex-1 px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                ) : (
                  <span className="text-gray-700">{profile.location}</span>
                )}
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-800">Service Details</h3>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                {isEditing ? (
                  <select
                    value={profile.category}
                    onChange={(e) => setProfile({...profile, category: e.target.value})}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="appliance">Appliance Repair</option>
                    <option value="hvac">HVAC</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium capitalize">{profile.category}</span>
                )}
              </div>

              {/* Services Offered */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Services Offered</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.services.map((service, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {service}
                      {isEditing && (
                        <button onClick={() => removeService(index)} className="ml-1 hover:text-red-600">
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="Add new service"
                      className="flex-1 px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                      onKeyPress={(e) => e.key === "Enter" && addService()}
                    />
                    <Button onClick={addService} size="sm" className="bg-green-600 hover:bg-green-700">
                      Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Price ($/hour)</label>
                  {isEditing ? (
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={profile.price}
                        onChange={(e) => setProfile({...profile, price: parseFloat(e.target.value)})}
                        className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-800">${profile.price}/hr</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Negotiable</label>
                  {isEditing ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.negotiable}
                        onChange={(e) => setProfile({...profile, negotiable: e.target.checked})}
                        className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Price is negotiable</span>
                    </label>
                  ) : (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${profile.negotiable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {profile.negotiable ? "Negotiable" : "Fixed Price"}
                    </span>
                  )}
                </div>
              </div>

              {/* Description with AI Enhancement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Description</label>
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={profile.description}
                      onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                      rows="4"
                    />
                    <Button
                      onClick={() => openAiModal('description')}
                      size="sm"
                      variant="outline"
                      className="gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      Enhance with AI
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">{profile.description}</p>
                )}
              </div>

              {/* Sustainability with AI Enhancement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sustainability Practices</label>
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={profile.sustainability}
                      onChange={(e) => setProfile({ ...profile, sustainability: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                      rows="2"
                    />
                    <Button
                      onClick={() => openAiModal('sustainability')}
                      size="sm"
                      variant="outline"
                      className="gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      Enhance with AI
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm flex items-start gap-2">
                    <Leaf className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    {profile.sustainability}
                  </p>
                )}
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.languages.map((lang, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {lang}
                      {isEditing && (
                        <button onClick={() => removeLanguage(index)} className="ml-1 hover:text-red-600">
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Add language"
                      className="flex-1 px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none text-sm"
                      onKeyPress={(e) => e.key === "Enter" && addLanguage()}
                    />
                    <Button onClick={addLanguage} size="sm" className="bg-green-600 hover:bg-green-700">
                      Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Response Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Average Response Time</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.responseTime}
                    onChange={(e) => setProfile({...profile, responseTime: e.target.value})}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="e.g., 30 mins"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {profile.responseTime}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            <Card className="p-6 bg-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Carbon Saved</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{profile.carbonSaved} tons</div>
              <p className="text-xs text-gray-500 mt-2">Equivalent to planting {Math.round(profile.carbonSaved * 16)} trees</p>
            </Card>

            <Card className="p-6 bg-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Jobs Completed</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{profile.bookingsCompleted}</div>
              <p className="text-xs text-gray-500 mt-2">Total services delivered</p>
            </Card>

            <Card className="p-6 bg-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">Reviews</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{profile.reviews}</div>
              <p className="text-xs text-gray-500 mt-2">Customer feedback received</p>
            </Card>

            <Card className="p-6 bg-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-gray-600">Member Since</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{profile.memberSince}</div>
              <p className="text-xs text-gray-500 mt-2">Growing our community</p>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="my-8 flex gap-4">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Account Settings
          </Button>
          <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
        <Footer/>
      </div>

      {/* AI Enhancement Modal */}
      {aiModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full bg-white shadow-2xl">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">AI Enhancement</h2>
                  <p className="text-sm text-gray-600">Improve your {aiModal.field} with AI</p>
                </div>
              </div>
              <button
                onClick={closeAiModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Original Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Text</label>
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200">
                  {profile[aiModal.field]}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., Make it more professional, add emphasis on experience, highlight certifications..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  rows="3"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => enhanceWithAI(false)}
                  disabled={isEnhancing}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 gap-2"
                >
                  {isEnhancing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Auto Enhance
                    </>
                  )}
                </Button>
                {aiPrompt.trim() && (
                  <Button
                    onClick={() => enhanceWithAI(true)}
                    disabled={isEnhancing}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    {isEnhancing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Enhance with Prompt
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Enhanced Result */}
              {enhancedText && (
                <div className="space-y-3 pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700">Enhanced Text</label>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg text-sm text-gray-800 border border-purple-200">
                    {enhancedText}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={applyEnhancement}
                      className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Apply Enhancement
                    </Button>
                    <Button
                      onClick={() => setEnhancedText("")}
                      variant="outline"
                      className="gap-2"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
