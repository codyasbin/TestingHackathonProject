"use client";

import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import Link from "next/link";
import {Leaf, Droplets, Zap, Recycle, Users, Star, ArrowRight} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {AvatarImage} from "@/components/ui/avatar";
import {Avatar} from "@/components/ui/avatar";
import {AvatarFallback} from "@/components/ui/avatar";
import {useRouter} from "next/navigation";
import Header from "./components/header";

export default function Home() {
  const router = useRouter();
  const serviceCategories = [
    {
      icon: Leaf,
      title: "Eco Gardening",
      description: "Sustainable landscaping and organic gardening services",
      color: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      icon: Droplets,
      title: "Water Conservation",
      description: "Smart irrigation and water-saving solutions",
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: Zap,
      title: "Energy Efficiency",
      description: "Solar installation and energy audits",
      color: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      icon: Recycle,
      title: "Waste Management",
      description: "Recycling coordination and composting setup",
      color: "bg-green-50 dark:bg-green-900/20",
    },
    {
      icon: Users,
      title: "Community Programs",
      description: "Local environmental initiatives",
      color: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="w-full bg-background">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            <span className="text-balance">Connect with Eco-Friendly Services in Your Community</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover local service providers committed to sustainability. From gardening to energy efficiency, build a greener lifestyle with trusted professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg" className="gap-2">
                Browse Services <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline">
                Become a Provider
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section id="services" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Sustainable Services for Every Need</h2>
            <p className="text-lg text-muted-foreground">Explore our range of eco-friendly services designed to help you live sustainably.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={index} className={`p-6 border border-border hover:border-primary transition-all cursor-pointer group ${category.color}`}>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sustainability Impact */}
      <section id="impact" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-block mb-4 p-4 rounded-full bg-primary/10">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">1,200+</h3>
              <p className="text-muted-foreground">Eco-friendly providers</p>
            </div>
            <div className="text-center">
              <div className="inline-block mb-4 p-4 rounded-full bg-primary/10">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">25,000+</h3>
              <p className="text-muted-foreground">Community members</p>
            </div>
            <div className="text-center">
              <div className="inline-block mb-4 p-4 rounded-full bg-primary/10">
                <Recycle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">50 tons</h3>
              <p className="text-muted-foreground">Waste diverted from landfills</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                number: "1",
                title: "Browse",
                description: "Explore services in your area",
              },
              {
                number: "2",
                title: "Compare",
                description: "Read ratings and reviews",
              },
              {
                number: "3",
                title: "Book",
                description: "Schedule with your chosen provider",
              },
              {
                number: "4",
                title: "Enjoy",
                description: "Reduce your carbon footprint",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">{step.number}</div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-secondary/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Providers</h2>
            <p className="text-lg text-muted-foreground">Trusted professionals making a difference</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Green Thumb Landscaping",
                rating: 4.9,
                reviews: 128,
                specialty: "Eco Gardening",
              },
              {
                name: "Sunny Solutions",
                rating: 4.8,
                reviews: 95,
                specialty: "Solar Energy",
              },
              {
                name: "Waste Wise Co.",
                rating: 4.7,
                reviews: 112,
                specialty: "Waste Management",
              },
            ].map((provider, index) => (
              <Card key={index} className="p-6 border border-border hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20"></div>
                  <div>
                    <h3 className="font-semibold text-foreground">{provider.name}</h3>
                    <p className="text-xs text-muted-foreground">{provider.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(provider.rating) ? "fill-primary text-primary" : "text-muted"}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">{provider.rating}</span>
                  <span className="text-xs text-muted-foreground">({provider.reviews})</span>
                </div>
                <Button className="w-full bg-transparent" variant="outline">
                  View Profile
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-lg mb-8 opacity-90">Join thousands of people building a sustainable future.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg" variant="secondary">
                Get Started
              </Button>
            </Link>
            <Link href="#impact">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-primary" />
                <span className="font-bold text-foreground">GreenCircle</span>
              </div>
              <p className="text-sm text-muted-foreground">Building sustainable communities, one service at a time.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Browse Services
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Become a Provider
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 GreenCircle. Committed to sustainability.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
