import { ChevronDown } from "lucide-react";
import heroImage from "@/public/hero.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center text-center justify-center overflow-hidden">
      {/* Background Image - Using a placeholder since we don't have the actual image */}

      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage.src})` }} // <-- Fix here
      />

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="animate-pulse">
          <h1 className="font-bold text-2xl md:text-5xl leading-tight text-white mb-6">
            <span className="text-balance">miWare</span>
          </h1>

          <h4 className="font-bold text-3xl md:text-5xl leading-tight text-white mb-12">
            <span className="block text-blue-400 mt-2">
              Transform Data Integration Into Strategic Advantage
            </span>
          </h4>

          <p className="text-gray-200 font-semibold text-xl md:text-2xl mb-8 max-w-4xl mx-auto">
            <span>
              The enterprise-grade, cloud-native platform that transforms weeks
              of pipeline development into hours of streamlined automation.
              Empower your teams with self-service data workflows and real-time
              intelligence.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl">
              Talk to us
            </button>
            <p className="text-lg text-gray-300 font-medium">
              Free consultation • No commitment
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white opacity-70" />
      </div>
    </section>
  );
};

export default Hero;
