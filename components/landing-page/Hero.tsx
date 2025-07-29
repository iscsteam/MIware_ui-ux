import { ChevronDown } from "lucide-react";
import heroImage from "@/public/hero.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage.src})` }} // <-- Fix here
      />

      {/* Geometric Overlay */}
      {/* <div className="geometric-bg">
        <div className="geometric-shape w-32 h-32 top-20 left-20" style={{ animationDelay: '0s' }} />
        <div className="geometric-shape w-24 h-24 top-40 right-32" style={{ animationDelay: '2s' }} />
        <div className="geometric-shape w-20 h-20 bottom-32 left-40" style={{ animationDelay: '4s' }} />
        <div className="geometric-shape w-28 h-28 bottom-20 right-20" style={{ animationDelay: '6s' }} />
      </div> */}

      {/* Gradient Overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
       */}
      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        <div className="animate-slide-in-up">
          <h1 className="font-poppins font-bold text-5xl md:text-7xl leading-tight text-foreground mb-6">
            <span className="text-balance">
              miWare Integration - 
            </span>
            <span className="block text-primary mt-2">
             Cloud-Native Data Orchestration Platform 
            </span>
          </h1>

          {/* <p className="font-inter text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-balance">
            Out-of-the-box or custom – let us deliver the tools your business
            needs.
          </p> */}

          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="btn-hero">Talk to us</button>
            <p className="text-sm text-muted-foreground font-medium">
              Free consultation • No commitment
            </p>
          </div> */}
        </div>
      </div>

      {/* Scroll Indicator */}
      {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <ChevronDown className="w-8 h-8 text-primary pulse-gentle" />
      </div> */}
    </section>
  );
};

export default Hero;
