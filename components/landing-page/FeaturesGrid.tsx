// import FlipCard from "./FlipCard";

// const FeaturesGrid = () => {
//   const features = [
//     {
    
//       title: "Lightning-Fast Deployment",
//       frontImg : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
//       backText:
//         "Compress pipeline deployment from weeks to hours. Dynamic generation engine converts workflows into executable code in real-time, enabling unprecedented agility.",
//       ctaText: "App Solutions",
//     },
//     {
     
//       title: "Event-Driven Intelligence",
//       frontImg : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
//       backText: "Go beyond static scheduling with dynamic, business-aligned triggers. Respond to real-time events with contextual data propagation throughout your entire workflow.",
//       ctaText: "Analytics Services",
//     },
//     {
    
//       title: "Self-Service Empowerment",
//       frontImg : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
//       backText: "SAbstract complex engineering tasks to enable business analysts and data stakeholders to independently configure sophisticated workflows without technical dependencies.",
//       ctaText: "Cloud & DevOps",
//     },
//     {
     
//       title: "Real-Time Observability",
//       frontImg : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
//       backText: "Asynchronous Tracker Engine provides comprehensive monitoring without performance overhead. Transform distributed complexity into actionable insights.",
//       ctaText: "Security Audit",
//     },
//     {
     
//       title: "Future-Proof Architecture",
//       frontImg : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
//       backText: "Built on Kubernetes with microservices architecture. Independent scaling of Control and Execution planes ensures performance under any load scenario.",
//       ctaText: "Product Catalog",
//     },
//     {
    
//       title: "Enterprise Governance",
//       frontImg : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
//       backText: "Centralized integration logic with comprehensive auditability, heightened security, and unwavering workflow dependability for mission-critical operations.",
//       ctaText: "Support Plans",
//     },
//   ];

//   return (
//     <section className="py-20 px-6 bg-background">
//       <div className="max-w-7xl mx-auto">
//         <div className="text-center mb-16">
//           <h2 className="font-poppins font-bold text-4xl md:text-5xl text-foreground mb-6">
//             Everything your business needs
//           </h2>
//           <p className="font-inter text-xl text-muted-foreground max-w-3xl mx-auto">
//             From custom development to ready-made solutions, we deliver
//             technology that scales with your ambitions.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
//           {features.map((feature, index) => (
//             <FlipCard
//               key={index}
            
//               title={feature.title}
//               backText={feature.backText}
//               frontImg={feature.frontImg}
//               ctaText={feature.ctaText}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default FeaturesGrid;


"use client";
import React, { FC, useState, KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Sparkles, ExternalLink } from "lucide-react";

interface FlipCardProps {
  title: string;
  frontImg?: string;
  backText: string;
  ctaText: string;
  width?: number;
  height?: number;
}

const FlipCard: FC<FlipCardProps> = ({
  title,
  frontImg,
  backText,
  ctaText,
  width = 320,
  height = 380,
}) => {
  const [flipped, setFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const toggle = () => setFlipped((f) => !f);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div
      className="group perspective inline-block cursor-pointer"
      style={{ width, height }}
      tabIndex={0}
      onClick={toggle}
      onKeyDown={onKey}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative w-full h-full transition-all duration-700 ease-out [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        } ${isHovered && !flipped ? "scale-105" : ""}`}
        style={{ transformOrigin: "center center" }}
      >
        {/* Front Side */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden backface-hidden group-hover:shadow-2xl transition-all duration-500">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Floating Elements */}
          <div className="absolute top-4 right-4">
            <div className={`w-3 h-3 bg-blue-400 rounded-full transition-all duration-500 ${isHovered ? 'animate-pulse' : ''}`} />
          </div>
          <div className="absolute top-6 right-8">
            <div className={`w-2 h-2 bg-purple-400 rounded-full transition-all duration-700 ${isHovered ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.2s' }} />
          </div>

          {frontImg && (
            <div className="relative overflow-hidden">
              <img
                src={frontImg}
                alt={title}
                className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              
              {/* Sparkle Icon */}
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <Sparkles className="w-5 h-5 text-white drop-shadow-lg" />
              </div>
            </div>
          )}
          
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center relative">
            <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight group-hover:text-blue-700 transition-colors duration-300">
              {title}
            </h3>
            
            {/* Interactive CTA */}
            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium bg-blue-50 px-4 py-2 rounded-full border border-blue-100 group-hover:bg-blue-100 group-hover:border-blue-200 transition-all duration-300">
              <span>Tap to explore</span>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            </div>

            {/* Bottom decoration */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl shadow-2xl border border-slate-700 backface-hidden [transform:rotateY(180deg)] overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/20 via-transparent to-purple-400/20" />
            <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-xl" />
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-purple-400/10 rounded-full blur-xl" />
          </div>

          <div className="relative z-10 p-6 h-full flex flex-col">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-blue-300">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs font-medium">Back</span>
              </div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-gray-200 leading-relaxed text-sm mb-8 font-light">
                {backText}
              </p>
            </div>

            {/* Enhanced CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 border border-blue-500/30 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 group/cta">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold text-sm block">
                    {ctaText}
                  </span>
                  <span className="text-blue-200 text-xs">
                    Learn more
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ExternalLink className="w-4 h-4 text-blue-200 group-hover/cta:text-white group-hover/cta:scale-110 transition-all duration-300" />
                </div>
              </div>
              
              {/* Progress bar effect */}
              <div className="mt-3 h-1 bg-blue-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-300 to-white rounded-full w-0 group-hover/cta:w-full transition-all duration-1000 ease-out" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced FeaturesGrid Component
const FeaturesGrid = () => {
  const features = [
    {
      title: "Lightning-Fast Deployment",
      frontImg: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      backText: "Compress pipeline deployment from weeks to hours. Dynamic generation engine converts workflows into executable code in real-time, enabling unprecedented agility.",
      ctaText: "App Solutions",
    },
    {
      title: "Event-Driven Intelligence",
      frontImg: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1434&q=80",
      backText: "Go beyond static scheduling with dynamic, business-aligned triggers. Respond to real-time events with contextual data propagation throughout your entire workflow.",
      ctaText: "Analytics Services",
    },
    {
      title: "Self-Service Empowerment",
      frontImg: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1415&q=80",
      backText: "Abstract complex engineering tasks to enable business analysts and data stakeholders to independently configure sophisticated workflows without technical dependencies.",
      ctaText: "Cloud & DevOps",
    },
    {
      title: "Real-Time Observability",
      frontImg: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      backText: "Asynchronous Tracker Engine provides comprehensive monitoring without performance overhead. Transform distributed complexity into actionable insights.",
      ctaText: "Security Audit",
    },
    {
      title: "Future-Proof Architecture",
      frontImg: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1425&q=80",
      backText: "Built on Kubernetes with microservices architecture. Independent scaling of Control and Execution planes ensures performance under any load scenario.",
      ctaText: "Product Catalog",
    },
    {
      title: "Enterprise Governance",
      frontImg: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80",
      backText: "Centralized integration logic with comprehensive auditability, heightened security, and unwavering workflow dependability for mission-critical operations.",
      ctaText: "Support Plans",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-100">
            <Sparkles className="w-4 h-4" />
            <span>Premium Features</span>
          </div>
          
          <h2 className="font-bold text-4xl md:text-6xl text-gray-900 mb-6 leading-tight">
            Everything your business
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              needs to thrive
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From custom development to ready-made solutions, we deliver
            technology that scales with your ambitions and transforms your vision into reality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {features.map((feature, index) => (
            <div
              key={index}
              style={{ animationDelay: `${index * 0.1}s` }}
              className="animate-fade-in-up"
            >
              <FlipCard
                title={feature.title}
                backText={feature.backText}
                frontImg={feature.frontImg}
                ctaText={feature.ctaText}
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .perspective {
          perspective: 1000px;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </section>
  );
};

export default FeaturesGrid;