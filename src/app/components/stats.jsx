import React from "react";
import {Leaf, Users, Recycle} from "lucide-react";

export default function Stats() {
  return (
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
  );
}
