"use client"
import { useState, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";

const CTABanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercentage >= 80 && !isSubmitted) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSubmitted]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50 animate-slide-in-up">
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl shadow-2xl p-6 max-w-md mx-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          aria-label="Close banner"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="pr-8">
          <h3 className="font-poppins font-bold text-xl text-white mb-2">
            Ready to scale?
          </h3>
          <p className="font-inter text-white/90 mb-4 text-sm">
            Get a free consultation and see how Mi-Ware can transform your business.
          </p>
          
          <button
            onClick={handleSubmit}
            className="bg-white text-primary hover:bg-white/90 font-medium px-6 py-2 rounded-lg 
                       transition-all duration-300 flex items-center gap-2 text-sm"
          >
            Schedule Call
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CTABanner;