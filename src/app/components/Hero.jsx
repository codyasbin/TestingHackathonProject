import React from "react";
import {Search, ArrowRight} from "lucide-react";
import {Button} from "@/components/ui/button";

export default function Herosection() {
  return (
    <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 bg-[#F5F3EE]">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 lg:pr-12">
            <h1 className="text-4xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-[0.95] text-emerald-600">
              Book Eco-Friendly Service Providers
              <br />
              <span className="text-gray-900">at your fingertips</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 font-light max-w-xl leading-relaxed">Search, compare and match with sustainable service providers of your choice in 60 seconds</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-in fade-in slide-in-from-top-10 duration-1000 delay-300">
              <Button size="lg" className="gap-2 min-w-[200px] group">
                Browse services
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="min-w-[200px]">
                Become a provider
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative lg:flex hidden items-center justify-center">
            <div className="relative w-full max-w-[550px] aspect-square">
              {/* Circular background with overflow hidden */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full rounded-full bg-linear-to-br from-emerald-200/40 via-green-200/40 to-teal-200/40 overflow-hidden flex items-end justify-center">
                  {/* Image positioned at bottom of circle */}
                  <img src="/worker.png" alt="Home Image" className="w-[70%] h-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
