// //loading-screen.tsx
// "use client"
// import { useEffect, useState } from "react"
// import { Workflow, Sparkles } from "lucide-react"

// interface LoadingScreenProps {
//   onLoadingComplete: () => void
// }

// export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
//   const [progress, setProgress] = useState(0)
//   const [dots, setDots] = useState("")

//   useEffect(() => {
//     // Progress bar animation
//     const progressInterval = setInterval(() => {
//       setProgress((prev) => {
//         if (prev >= 100) {
//           clearInterval(progressInterval)
//           return 100
//         }
//         return prev + 2
//       })
//     }, 60) // Updates every 60ms to reach 100% in 3 seconds

//     // Animated dots
//     const dotsInterval = setInterval(() => {
//       setDots((prev) => {
//         if (prev.length >= 3) return ""
//         return prev + "."
//       })
//     }, 500)

//     // Complete loading after 3 seconds
//     const loadingTimer = setTimeout(() => {
//       onLoadingComplete()
//     }, 3000)

//     return () => {
//       clearInterval(progressInterval)
//       clearInterval(dotsInterval)
//       clearTimeout(loadingTimer)
//     }
//   }, [onLoadingComplete])

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center relative overflow-hidden">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/30 to-red-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-500"></div>
//       </div>

//       {/* Main Loading Content */}
//       <div className="text-center space-y-8 relative z-10">
//         {/* Logo Animation */}
//         <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
//           <Workflow className="w-12 h-12 text-white animate-pulse" />
//         </div>

//         {/* Main Title */}
//         <div className="space-y-4">
//           <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-pulse">
//             MI-WARE
//           </h1>
          
//           {/* Subtitle with animated sparkles */}
//           <div className="flex items-center justify-center gap-3 text-gray-300">
//             <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" />
//             <p className="text-xl font-medium">
//               Initializing Workspace{dots}
//             </p>
//             <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDirection: 'reverse' }} />
//           </div>
//         </div>

//         {/* Progress Bar */}
//         <div className="w-80 mx-auto space-y-3">
//           <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
//             <div 
//               className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-100 ease-out shadow-lg"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//           <p className="text-sm text-gray-400 font-medium">
//             {progress}% Complete
//           </p>
//         </div>

//         {/* Loading Animation */}
//         <div className="flex justify-center space-x-2">
//           <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
//           <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-100"></div>
//           <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-200"></div>
//         </div>

//         {/* Welcome Message */}
//         <div className="text-gray-300 space-y-2 animate-fade-in">
//           <p className="text-lg font-medium">Welcome to the Future</p>
//           <p className="text-sm text-gray-400">Preparing your automation environment</p>
//         </div>
//       </div>

//       {/* Bottom Branding */}
//       <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-gray-400">
//         <p className="text-sm">Powered by Innovation & Excellence</p>
//       </div>
//     </div>
//   )
// }



"use client"
import { useEffect, useState } from "react"
import { Workflow, Sparkles, Zap, Heart, Rocket, Star } from "lucide-react"

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [dots, setDots] = useState("")
  const [phase, setPhase] = useState(0)
  const [pulseScale, setPulseScale] = useState(1)

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 80)

    // Phase transitions
    const phaseInterval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 4)
    }, 1000)

    // Dots animation
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 400)

    // Pulse animation
    const pulseInterval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.1 : 1))
    }, 800)

    // Complete loading
    const timer = setTimeout(() => {
      onLoadingComplete()
    }, 4000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(phaseInterval)
      clearInterval(dotsInterval)
      clearInterval(pulseInterval)
      clearTimeout(timer)
    }
  }, [onLoadingComplete])

  const phases = [
    "🚀 Launching System",
    "⚡ Powering Up", 
    "🎨 Loading Interface",
    "✨ Almost Ready"
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-violet-400 via-pink-400 to-orange-300 relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/30 via-blue-400/20 to-purple-500/30 animate-pulse" />
        
        {/* Floating Orbs - Smaller */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-pink-300/40 to-rose-400/40 rounded-full blur-2xl animate-float-slow" />
        <div className="absolute top-20 right-16 w-24 h-24 bg-gradient-to-r from-blue-300/40 to-cyan-400/40 rounded-full blur-xl animate-float-reverse" />
        <div className="absolute bottom-10 left-16 w-28 h-28 bg-gradient-to-r from-purple-300/40 to-indigo-400/40 rounded-full blur-2xl animate-float-slow" />
        <div className="absolute bottom-16 right-10 w-20 h-20 bg-gradient-to-r from-yellow-300/40 to-orange-400/40 rounded-full blur-xl animate-float" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 2px, transparent 2px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridFlow 15s linear infinite'
          }}
        />
      </div>

      {/* Decorative Elements - Fewer and smaller */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            {i % 4 === 0 && <Heart className="w-4 h-4 text-pink-300/70" />}
            {i % 4 === 1 && <Star className="w-3 h-3 text-yellow-300/70" />}
            {i % 4 === 2 && <Sparkles className="w-3 h-3 text-blue-300/70" />}
            {i % 4 === 3 && <Zap className="w-4 h-4 text-purple-300/70" />}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-6 max-w-xl mx-auto px-4">
        
        {/* Logo Section - Smaller */}
        <div className="relative">
          {/* Outer Glow */}
          <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-white/20 blur-xl animate-pulse" />
          
          {/* Multiple Rotating Rings - Smaller */}
          <div className="relative w-28 h-28 mx-auto">
            <div className="absolute inset-0 rounded-full border-3 border-white/30 animate-spin-slow" />
            <div className="absolute inset-1 rounded-full border-2 border-pink-300/50 animate-spin-reverse" />
            <div className="absolute inset-2 rounded-full border border-blue-300/40 animate-spin-slower" />
            
            {/* Center Logo */}
            <div 
              className="absolute inset-3 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center shadow-xl border border-white/50 transition-transform duration-500"
              style={{ transform: `scale(${pulseScale})` }}
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 flex items-center justify-center animate-pulse">
                <Workflow className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
            </div>
            
            {/* Orbiting Icons */}
            <div className="absolute inset-0 animate-orbit">
              <Rocket className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 text-pink-500" />
            </div>
            <div className="absolute inset-0 animate-orbit-reverse">
              <Sparkles className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Brand Section - Much Smaller */}
        <div className="space-y-4">
          {/* Main Title - Significantly reduced */}
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight relative z-10">
              <span className="bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent drop-shadow-xl animate-text-glow">
                MI-WARE
              </span>
            </h1>
            
            {/* Text Shadow/Glow Effect */}
            <div className="absolute inset-0 text-4xl md:text-5xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent opacity-30 blur-sm">
                MI-WARE
              </span>
            </div>
          </div>

          {/* Subtitle with Glass Morphism - Smaller */}
          <div className="relative">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-xl rounded-full px-6 py-3 border border-white/30 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse" />
                <div className="w-8 h-px bg-gradient-to-r from-pink-400 to-transparent" />
              </div>
              
              <span className="text-base font-semibold text-white/90">
                {phases[phase]}{dots}
              </span>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-px bg-gradient-to-l from-blue-400 to-transparent" />
                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section - Compact */}
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="relative w-full max-w-xs mx-auto">
            <div className="h-4 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full relative transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              >
                {/* Progress Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine" />
                
                {/* Progress Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full blur-md opacity-50 -z-10" />
              </div>
            </div>
            
            {/* Progress Text */}
            <div className="flex justify-between mt-2">
              <span className="text-white/80 font-medium text-sm">Progress</span>
              <span className="text-white font-bold">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Loading Dots - Fewer dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="relative">
                <div
                  className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 shadow-md animate-bounce-stagger"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '1.2s'
                  }}
                />
                <div
                  className="absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 animate-ping opacity-40"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '2s'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Welcome Card - Compact */}
        <div className="relative">
          <div className="bg-white/15 backdrop-blur-2xl rounded-2xl p-4 border border-white/20 shadow-xl">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white/95">
                🎉 Welcome to the Future!
              </h2>
              <p className="text-sm text-white/80">
                Your premium automation workspace is loading
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-white/70">Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                  <span className="text-xs text-white/70">Fast</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                  <span className="text-xs text-white/70">Intelligent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Smaller and positioned better */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/10 backdrop-blur-xl rounded-full px-4 py-2 border border-white/20">
          <p className="text-white/70 text-xs font-medium">✨ Crafted with Love & Innovation</p>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(8deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-8deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        }
        
        @keyframes gridFlow {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes spin-slower {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(56px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(56px) rotate(-360deg); }
        }
        
        @keyframes orbit-reverse {
          from { transform: rotate(360deg) translateX(56px) rotate(360deg); }
          to { transform: rotate(0deg) translateX(56px) rotate(0deg); }
        }
        
        @keyframes text-glow {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(255,255,255,0.5)); }
          50% { filter: drop-shadow(0 0 25px rgba(255,255,255,0.8)) drop-shadow(0 0 30px rgba(236,72,153,0.3)); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-200%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        
        @keyframes bounce-stagger {
          0%, 80%, 100% { transform: scale(0.8) translateY(0); }
          40% { transform: scale(1.1) translateY(-10px); }
        }
        
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 6s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 6s linear infinite; }
        .animate-spin-slower { animation: spin-slower 12s linear infinite; }
        .animate-orbit { animation: orbit 10s linear infinite; }
        .animate-orbit-reverse { animation: orbit-reverse 15s linear infinite; }
        .animate-text-glow { animation: text-glow 3s ease-in-out infinite; }
        .animate-shine { animation: shine 2s ease-in-out infinite; }
        .animate-bounce-stagger { animation: bounce-stagger 1.2s ease-in-out infinite; }
      `}</style>
    </div>
  )
}