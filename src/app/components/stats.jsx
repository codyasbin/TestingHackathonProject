import React, {useState, useEffect, useRef} from "react";
import {Leaf, Users, Recycle} from "lucide-react";

function CountUp({end, duration = 2000, suffix = ""}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      {threshold: 0.1}
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const endValue = parseInt(end.toString().replace(/,/g, ""));

    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuad = progress * (2 - progress);
      const current = Math.floor(easeOutQuad * endValue);

      setCount(current);

      if (progress === 1) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section id="impact" className="py-10 md:py-16 px-4 sm:px-6 lg:px-8 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-block mb-4 p-4 rounded-full bg-primary/10">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              <CountUp end={1200} suffix="+" />
            </h3>
            <p className="text-muted-foreground">Eco-friendly providers</p>
          </div>
          <div className="text-center">
            <div className="inline-block mb-4 p-4 rounded-full bg-primary/10">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              <CountUp end={25000} suffix="+" />
            </h3>
            <p className="text-muted-foreground">Community members</p>
          </div>
          <div className="text-center">
            <div className="inline-block mb-4 p-4 rounded-full bg-primary/10">
              <Recycle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              <CountUp end={50} suffix=" tons" />
            </h3>
            <p className="text-muted-foreground">Waste diverted from landfills</p>
          </div>
        </div>
      </div>
    </section>
  );
}
