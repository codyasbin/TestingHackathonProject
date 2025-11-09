import React from "react";
import {ServiceProviders} from "@/data/ServiceProvider";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Star} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function FeaturedProviders() {
  const providers = ServiceProviders;

  if (!providers.length) {
    return <p className="text-center text-muted-foreground">No providers available.</p>;
  }

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-secondary/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Providers</h2>
          <p className="text-lg text-muted-foreground">Trusted professionals making a difference</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {providers.slice(0, 3).map((provider) => (
            <Card key={provider.id} className="p-6 border border-border hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image src={provider.image} alt={`${provider.name} profile`} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{provider.name}</h3>
                  <p className="text-xs text-muted-foreground">{provider.service}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < provider.rating ? "fill-primary text-primary" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">{provider.rating}</span>
                <span className="text-xs text-muted-foreground">({provider.ratingCount})</span>
              </div>
              <Link href={`/provider/${provider.id}`}>
                <Button className="w-full bg-transparent" variant="outline">
                  View Profile
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
