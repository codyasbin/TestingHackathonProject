"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Leaf, Search, MessageSquare, Mail, Phone, HelpCircle, BookOpen, Users, ChevronDown } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedFaq, setExpandedFaq] = useState(null)

  const categories = [
    { icon: Users, label: "Getting Started", id: "getting-started" },
    { icon: BookOpen, label: "Booking Services", id: "booking" },
    { icon: MessageSquare, label: "Messaging", id: "messaging" },
    { icon: Leaf, label: "Sustainability", id: "sustainability" },
  ]

  const faqs = [
    {
      category: "getting-started",
      q: "How do I create an account on GreenCircle?",
      a: "Click the \"Sign up\" button on the homepage. Choose whether you're a customer or service provider. Fill in your details and verify your email. You're all set to start exploring eco-friendly services!",
    },
    {
      category: "getting-started",
      q: "How does GreenCircle ensure provider quality?",
      a: "All providers are verified and must maintain a minimum rating of 4.0. We conduct background checks and verify eco-certifications. Customers can leave reviews after each service completion.",
    },
    {
      category: "booking",
      q: "How do I book a service?",
      a: "Browse services, select a provider, check availability, choose your service date/time, review pricing, and complete payment. You'll receive a confirmation with provider details.",
    },
    {
      category: "booking",
      q: "Can I reschedule or cancel a booking?",
      a: "Yes! You can reschedule up to 24 hours before the service. Cancellations within 24 hours may incur a small fee. Emergency cancellations have different policies.",
    },
    {
      category: "booking",
      q: "What payment methods are accepted?",
      a: "We accept credit/debit cards, PayPal, Apple Pay, Google Pay, and GreenCircle wallet. All transactions are secure and encrypted.",
    },
    {
      category: "messaging",
      q: "How do I contact a service provider?",
      a: "Once you've booked or found a provider you're interested in, go to the Messages section. You can send direct messages to discuss details before confirming the booking.",
    },
    {
      category: "messaging",
      q: "What if I need emergency support?",
      a: 'Click the "Contact Support" button in the help center or call our 24/7 hotline at 1-800-GREEN-1. We\'re here to help with booking issues or emergencies.',
    },
    {
      category: "sustainability",
      q: "How is my carbon savings calculated?",
      a: "We use industry-standard calculations based on the service type. For example, eco-gardening replaces synthetic fertilizer use (0.15 tons CO₂ saved). Check your sustainability dashboard for detailed breakdowns.",
    },
    {
      category: "sustainability",
      q: "Can I share my sustainability impact?",
      a: 'Visit your sustainability dashboard and click "Share Your Achievement" to share on social media. You\'ll inspire others to make eco-friendly choices!',
    },
    {
      category: "sustainability",
      q: "What are the rewards points for?",
      a: "Earn points for every booking and referral. Redeem them for discounts on future services, premium memberships, or carbon offsets. Points don't expire!",
    },
  ]

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || faq.a.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const contactOptions = [
    { icon: MessageSquare, label: "Live Chat", desc: "Average response: 2 minutes", available: true },
    { icon: Mail, label: "Email Support", desc: "support@greencircle.com", available: true },
    { icon: Phone, label: "Phone Support", desc: "1-800-GREEN-1 (24/7)", available: true },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">GreenCircle</span>
          </Link>
          <Link href="/profile" className="text-sm hover:text-primary transition">
            Profile
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-4">Help Center</h1>
          <p className="text-lg text-muted-foreground mb-8">Find answers, guides, and support for GreenCircle</p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Quick Access Categories */}
        <div className="grid md:grid-cols-4 gap-4 mb-16">
          {categories.map((cat, index) => {
            const Icon = cat.icon
            return (
              <Card
                key={index}
                className="p-6 border border-border hover:border-primary hover:shadow-lg transition cursor-pointer"
              >
                <Icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground">{cat.label}</h3>
              </Card>
            )
          })}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 mb-16 border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Need Immediate Help?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => {
              const Icon = option.icon
              return (
                <Card key={index} className="p-6 border border-border hover:shadow-lg transition">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                    <h3 className="font-semibold text-foreground">{option.label}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{option.desc}</p>
                  <Button variant="outline" className="w-full bg-transparent">
                    {option.label === "Live Chat"
                      ? "Start Chat"
                      : option.label === "Email Support"
                        ? "Send Email"
                        : "Call Now"}
                  </Button>
                </Card>
              )
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>

          {searchTerm && filteredFaqs.length === 0 ? (
            <Card className="p-8 text-center border border-border">
              <p className="text-muted-foreground">
                No results found for "{searchTerm}". Try different keywords or contact support.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => (
                <Card key={index} className="border border-border overflow-hidden hover:border-primary transition">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full p-6 flex items-start justify-between hover:bg-muted/30 transition text-left"
                  >
                    <div>
                      <div className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                        {categories.find((c) => c.id === faq.category)?.label}
                      </div>
                      <h3 className="font-semibold text-foreground text-lg">{faq.q}</h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition ${
                        expandedFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expandedFaq === index && (
                    <div className="px-6 py-4 bg-muted/30 border-t border-border">
                      <p className="text-foreground">{faq.a}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Community Section */}
        <Card className="p-8 border border-border bg-gradient-to-br from-primary/5 to-transparent">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <Users className="w-10 h-10 text-primary mb-3" />
              <h3 className="text-xl font-bold text-foreground mb-3">Join Our Community</h3>
              <p className="text-muted-foreground mb-4">
                Connect with other eco-conscious members, share tips, and learn about sustainable living practices.
              </p>
              <Button variant="outline">Visit Community Forum</Button>
            </div>
            <div>
              <BookOpen className="w-10 h-10 text-primary mb-3" />
              <h3 className="text-xl font-bold text-foreground mb-3">Resources & Guides</h3>
              <p className="text-muted-foreground mb-4">
                Explore comprehensive guides on sustainability, eco-friendly living, and maximizing your impact.
              </p>
              <Button variant="outline">Browse Resources</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
