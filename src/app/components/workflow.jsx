import React from "react";

export default function Workflow() {
  return (
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
  );
}
