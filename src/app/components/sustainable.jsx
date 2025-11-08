import React from "react";
import {Card} from "@/components/ui/card";
import {Leaf, Droplets, Zap, Recycle, Users} from "lucide-react";
const serviceCategories = [
  {
    icon: Leaf,
    title: "Eco Gardening",
    description: "Sustainable landscaping and organic gardening services",
    color: "bg-emerald-50 dark:bg-emerald-900/80",
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
    color: "bg-yellow-50 dark:bg-yellow-900/40",
  },
  {
    icon: Recycle,
    title: "Waste Management",
    description: "Recycling coordination and composting setup",
    color: "bg-green-50 dark:bg-green-900/50",
  },
  {
    icon: Users,
    title: "Community Programs",
    description: "Local environmental initiatives",
    color: "bg-purple-50 dark:bg-purple-900/60",
  },
];
export default function Sustainable() {
  return (
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
  );
}
