import React from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Leaf, Sun, Droplets, Zap, Recycle, Users} from "lucide-react";
import GlareHover from "@/components/GlareHover";

const serviceCategories = [
  {
    icon: Leaf,
    title: "Eco Gardening",
    description: "Sustainable landscaping & organic methods",
    gradient: "from-emerald-500 to-teal-600",
    hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-900/40",
  },
  {
    icon: Droplets,
    title: "Water Conservation",
    description: "Smart irrigation & water-saving tech",
    gradient: "from-blue-500 to-cyan-600",
    hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-900/40",
  },
  {
    icon: Zap,
    title: "Energy Efficiency",
    description: "Solar installs & energy audits",
    gradient: "from-yellow-500 to-amber-600",
    hoverBg: "hover:bg-yellow-50 dark:hover:bg-yellow-900/40",
  },
  {
    icon: Recycle,
    title: "Waste Management",
    description: "Recycling & composting systems",
    gradient: "from-green-500 to-lime-600",
    hoverBg: "hover:bg-green-50 dark:hover:bg-green-900/40",
  },
  {
    icon: Users,
    title: "Community Programs",
    description: "Local eco initiatives & education",
    gradient: "from-purple-500 to-indigo-600",
    hoverBg: "hover:bg-purple-50 dark:hover:bg-purple-900/40",
  },
  {
    icon: Sun,
    title: "Renewable Energy",
    description: "Promoting Solar panels & wind solutions",
    gradient: "from-orange-500 to-red-600",
    hoverBg: "hover:bg-orange-50 dark:hover:bg-orange-900/40",
  },
];

export default function Sustainable() {
  return (
    <section id="services" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold  mb-4 bg-clip-text text-transparent bg-linear-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400">Sustainable Services</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Compact, eco-friendly solutions for modern living.</p>
        </div>

        {/* Fixed-Size Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {serviceCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div
                key={index}
                className="flex justify-center"
                style={{perspective: "1000px"}} // Enhances 3D glare effect
              >
                <GlareHover glareColor="#228B22" glareOpacity={0.3} glareAngle={-45} glareSize={300} transitionDuration={600} playOnce={false} className="w-full max-h-40 max-w-[380px]">
                  <Card
                    className={`w-full h-44 border border-border/60 bg-card/90 backdrop-blur-sm 
                      shadow-md transition-all duration-300 rounded-xl overflow-hidden
                      ${category.hoverBg} hover:shadow-lg hover:-translate-y-1 
                      hover:border-primary/30 group cursor-pointer`}
                  >
                    <CardContent className="p-5 h-full flex flex-col justify-between">
                      <div className="flex items-center gap-3">
                        {/* Gradient Icon */}
                        <div
                          className={`p-2.5 rounded-lg bg-linear-to-br ${category.gradient} 
      text-white shadow-sm group-hover:scale-110 transition-transform duration-300`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>

                        {/* Title - Now vertically centered */}
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">{category.title}</h3>
                      </div>

                      {/* Compact Description */}
                      <p className="text-sm text-muted-foreground mt-2 leading-snug line-clamp-2">{category.description}</p>
                    </CardContent>
                  </Card>
                </GlareHover>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
