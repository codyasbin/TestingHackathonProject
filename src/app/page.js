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
import FeaturedProviders from "./components/Featured-Providers";
import Herosection from "./components/Hero";
import Sustainable from "./components/sustainable";
import Stats from "./components/stats";
import Workflow from "./components/workflow";



export default function Home() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="w-full bg-background">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <Herosection />

      {/* Service Categories */}
      <Sustainable />

      {/* Sustainability Impact */}
      <Stats />

      {/* Featured Providers */}
      <FeaturedProviders />
      <Workflow />

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
