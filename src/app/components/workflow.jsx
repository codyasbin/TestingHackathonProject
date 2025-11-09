import React from "react";
import {Search, GitCompare, Calendar, Sparkles} from "lucide-react";
import {Card} from "@/components/ui/card";

export default function Workflow() {
  const steps = [
    {
      number: "01",
      title: "Browse",
      description: "Explore services in your area",
      icon: Search,
      color: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      number: "02",
      title: "Compare",
      description: "Read ratings and reviews",
      icon: GitCompare,
      color: "bg-purple-50 dark:bg-purple-950/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      number: "03",
      title: "Book",
      description: "Schedule with your chosen provider",
      icon: Calendar,
      color: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-800",
    },
    {
      number: "04",
      title: "Enjoy",
      description: "Reduce your carbon footprint",
      icon: Sparkles,
      color: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
  ];

  return (
    <section className="py-10 md:py-18 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Four easy steps to connect with local services</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Animated connecting dots */}
          <div className="hidden md:flex absolute top-14 left-0 right-0 items-center justify-between px-16 pointer-events-none">
            <div className="flex-1 h-px bg-linear-to-r from-blue-200 via-purple-200  to-emerald-200 dark:from-blue-800 dark:via-purple-800  dark:to-emerald-800"></div>
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="relative p-6 border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900">
                {/* Icon circle */}
                <div className="mb-6">
                  <div className={`inline-flex w-14 h-14 rounded-2xl ${step.color} border ${step.borderColor} items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`w-7 h-7 ${step.iconColor}`} strokeWidth={2} />
                  </div>
                </div>

                {/* Step number */}
                <div className="mb-4">
                  <span className={`text-sm font-bold ${step.iconColor} tracking-wider`}>STEP {step.number}</span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>

                {/* Decorative corner accent */}
                <div className={`absolute top-0 right-0 w-20 h-20 ${step.color} opacity-50 blur-2xl rounded-full -z-10 transition-opacity duration-300 group-hover:opacity-100`}></div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
