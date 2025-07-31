"use client"
import { useState, useEffect } from "react";
import { Quote } from "lucide-react";

const Testimonial = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-16 px-6 bg-muted/20">
      <div className="max-w-4xl mx-auto text-center">
        <div 
          className={`transition-all duration-1000 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <Quote className="w-12 h-12 text-primary mx-auto mb-6" />
          
          <blockquote className="font-inter text-2xl md:text-3xl text-foreground font-medium mb-6 italic">
            "Mi-Ware tripled our deployment speed and transformed how we handle customer data. 
            Their custom analytics dashboard gave us insights we never knew we needed."
          </blockquote>
          
          <cite className="font-poppins text-lg text-muted-foreground font-semibold">
            {/* Operations Lead, South African Retail Group */}
          </cite>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;