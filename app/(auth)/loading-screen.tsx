// // // //loading-screen.tsx
// "use client"
// import { useEffect, useState } from "react"
// import { Workflow, CheckCircle, Globe, Lock, Zap, Shield, Star, Sparkles } from "lucide-react"

// interface LoadingScreenProps {
//   onLoadingComplete: () => void
// }

// export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
//   const [progress, setProgress] = useState(0)
//   const [dots, setDots] = useState("")
//   const [phase, setPhase] = useState(0)
//   const [mounted, setMounted] = useState(false)

//   useEffect(() => {
//     setMounted(true)
    
//     // Progress animation
//     const progressInterval = setInterval(() => {
//       setProgress((prev) => {
//         if (prev >= 100) {
//           clearInterval(progressInterval)
//           return 100
//         }
//         return prev + 2.5
//       })
//     }, 60)

//     // Phase transitions
//     const phaseInterval = setInterval(() => {
//       setPhase((prev) => (prev + 1) % 4)
//     }, 1200)

//     // Dots animation
//     const dotsInterval = setInterval(() => {
//       setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
//     }, 500)

//     // Complete loading
//     const timer = setTimeout(() => {
//       onLoadingComplete()
//     }, 4000)

//     return () => {
//       clearInterval(progressInterval)
//       clearInterval(phaseInterval)
//       clearInterval(dotsInterval)
//       clearTimeout(timer)
//     }
//   }, [onLoadingComplete])

//   const phases = [
//     "Initializing System",
//     "Loading Components", 
//     "Preparing Dashboard",
//     "Almost Ready"
//   ]

//   if (!mounted) {
//     return null
//   }

//   return (
//     <div className="h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden flex items-center justify-center">
//       {/* Enhanced Background Pattern */}
//       <div className="absolute inset-0 opacity-5">
//         <div className="absolute inset-0" style={{
//           backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//         }}></div>
//       </div>

//       {/* Beautiful Floating Elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         {/* Large Gradient Orbs */}
//         <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-emerald-200/30 to-teal-300/20 rounded-full blur-3xl animate-float-slow"></div>
//         <div className="absolute bottom-10 right-10 w-48 h-48 bg-gradient-to-br from-teal-200/25 to-cyan-300/20 rounded-full blur-3xl animate-float-reverse"></div>
//         <div className="absolute top-1/2 left-0 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-emerald-300/20 rounded-full blur-2xl animate-float"></div>
        
//         {/* Sparkle Effects */}
//         {[...Array(12)].map((_, i) => (
//           <div
//             key={i}
//             className="absolute animate-sparkle"
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//               animationDelay: `${Math.random() * 3}s`,
//               animationDuration: `${2 + Math.random() * 2}s`
//             }}
//           >
//             {i % 3 === 0 && <Star className="w-3 h-3 text-emerald-400/60" />}
//             {i % 3 === 1 && <Sparkles className="w-2 h-2 text-teal-400/60" />}
//             {i % 3 === 2 && <div className="w-1 h-1 bg-cyan-400/60 rounded-full" />}
//           </div>
//         ))}
//       </div>

//       {/* Main Content - Compact Layout */}
//       <div className="relative z-10 w-full max-w-md mx-auto px-4">
        
//         {/* Logo Section - Compact */}
//         <div className="text-center mb-6">
//           <div className="relative inline-block mb-4">
//             {/* Multiple Rotating Rings */}
//             <div className="absolute -inset-6 border-2 border-emerald-300/20 rounded-full animate-spin-slow"></div>
//             <div className="absolute -inset-4 border border-teal-300/30 rounded-full animate-spin-reverse"></div>
//             <div className="absolute -inset-2 border border-cyan-300/20 rounded-full animate-spin-slower"></div>
            
//             {/* Logo with Glow */}
//             <div className="relative">
//               <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-50"></div>
//               <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl">
//                 <Workflow className="w-8 h-8 text-white" />
//               </div>
//             </div>
            
//             {/* Orbiting Icons */}
//             <div className="absolute inset-0 animate-orbit">
//               <CheckCircle className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 text-emerald-500" />
//             </div>
//             <div className="absolute inset-0 animate-orbit-reverse">
//               <Shield className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-500" />
//             </div>
//           </div>
          
//           <h1 className="text-3xl font-bold text-gray-800 mb-1">MI-WARE</h1>
//           <p className="text-emerald-600 font-medium text-sm">Workflow Automation Platform</p>
//         </div>

//         {/* Beautiful Loading Card */}
//         <div className="relative group mb-4">
//           {/* Card Glow Effect */}
//           <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
          
//           <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/50">
//             {/* Header with Status */}
//             <div className="text-center mb-4">
//               <div className="inline-flex items-center gap-2 bg-emerald-50 rounded-full px-4 py-2 mb-2">
//                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
//                 <span className="text-emerald-700 font-semibold text-sm">
//                   {phases[phase]}{dots}
//                 </span>
//               </div>
//               <p className="text-gray-600 text-xs">Setting up your workspace</p>
//             </div>

//             {/* Enhanced Progress Bar */}
//             <div className="mb-4">
//               <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
//                 <div 
//                   className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-300 ease-out relative"
//                   style={{ width: `${progress}%` }}
//                 >
//                   {/* Multiple shine effects */}
//                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shine"></div>
//                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent animate-shine-slow"></div>
//                 </div>
//               </div>
              
//               <div className="flex justify-between text-xs mt-1">
//                 <span className="text-gray-500">Progress</span>
//                 <span className="text-emerald-600 font-bold">{Math.round(progress)}%</span>
//               </div>
//             </div>

//             {/* Compact Status Grid */}
//             <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
//               <div className="flex items-center gap-2 bg-emerald-50/50 rounded-lg p-2">
//                 <CheckCircle className="w-3 h-3 text-emerald-500" />
//                 <span className="text-emerald-700">Secure</span>
//               </div>
//               <div className="flex items-center gap-2 bg-teal-50/50 rounded-lg p-2">
//                 <Globe className="w-3 h-3 text-teal-500" />
//                 <span className="text-teal-700">Connected</span>
//               </div>
//               <div className="flex items-center gap-2 bg-cyan-50/50 rounded-lg p-2">
//                 <Lock className="w-3 h-3 text-cyan-500" />
//                 <span className="text-cyan-700">Encrypted</span>
//               </div>
//               <div className="flex items-center gap-2 bg-emerald-50/50 rounded-lg p-2">
//                 <Zap className="w-3 h-3 text-emerald-500" />
//                 <span className="text-emerald-700">Ready</span>
//               </div>
//             </div>

//             {/* Beautiful Loading Animation */}
//             <div className="flex justify-center items-center gap-2">
//               {[0, 1, 2, 3, 4].map((i) => (
//                 <div key={i} className="relative">
//                   <div
//                     className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 animate-bounce-wave"
//                     style={{
//                       animationDelay: `${i * 0.1}s`,
//                       animationDuration: '1.4s'
//                     }}
//                   />
//                   <div
//                     className="absolute inset-0 w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 animate-ping opacity-30"
//                     style={{
//                       animationDelay: `${i * 0.1}s`,
//                       animationDuration: '2s'
//                     }}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Welcome Banner - Compact */}
//         <div className="relative">
//           <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl p-4 text-white shadow-xl">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
//                   <Sparkles className="w-5 h-5 text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-sm">Welcome to MI-WARE</h3>
//                   <p className="text-white/80 text-xs">Your workspace is loading</p>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="text-2xl font-bold">{Math.round(progress)}%</div>
//                 <div className="text-xs text-white/80">Complete</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer - Compact */}
//         <div className="text-center mt-4">
//           <p className="text-xs text-gray-500">© 2025 MI-WARE Studio</p>
//         </div>
//       </div>

//       {/* Enhanced Custom Animations */}
//       <style jsx>{`
//         @keyframes shine {
//           0% { transform: translateX(-100%); }
//           100% { transform: translateX(100%); }
//         }
        
//         @keyframes shine-slow {
//           0% { transform: translateX(-100%); }
//           100% { transform: translateX(100%); }
//         }
        
//         @keyframes float {
//           0%, 100% { transform: translateY(0px) rotate(0deg); }
//           50% { transform: translateY(-10px) rotate(5deg); }
//         }
        
//         @keyframes float-slow {
//           0%, 100% { transform: translateY(0px) scale(1); }
//           50% { transform: translateY(-15px) scale(1.05); }
//         }
        
//         @keyframes float-reverse {
//           0%, 100% { transform: translateY(0px) rotate(0deg); }
//           50% { transform: translateY(15px) rotate(-5deg); }
//         }
        
//         @keyframes sparkle {
//           0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
//           50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
//         }
        
//         @keyframes spin-slow {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
        
//         @keyframes spin-reverse {
//           from { transform: rotate(360deg); }
//           to { transform: rotate(0deg); }
//         }
        
//         @keyframes spin-slower {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
        
//         @keyframes orbit {
//           from { transform: rotate(0deg) translateX(40px) rotate(0deg); }
//           to { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
//         }
        
//         @keyframes orbit-reverse {
//           from { transform: rotate(360deg) translateX(40px) rotate(360deg); }
//           to { transform: rotate(0deg) translateX(40px) rotate(0deg); }
//         }
        
//         @keyframes bounce-wave {
//           0%, 80%, 100% { transform: scale(0.8) translateY(0); }
//           40% { transform: scale(1.2) translateY(-8px); }
//         }
        
//         .animate-shine { animation: shine 2s ease-in-out infinite; }
//         .animate-shine-slow { animation: shine-slow 3s ease-in-out infinite; }
//         .animate-float { animation: float 4s ease-in-out infinite; }
//         .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
//         .animate-float-reverse { animation: float-reverse 5s ease-in-out infinite; }
//         .animate-sparkle { animation: sparkle 3s ease-in-out infinite; }
//         .animate-spin-slow { animation: spin-slow 8s linear infinite; }
//         .animate-spin-reverse { animation: spin-reverse 6s linear infinite; }
//         .animate-spin-slower { animation: spin-slower 12s linear infinite; }
//         .animate-orbit { animation: orbit 8s linear infinite; }
//         .animate-orbit-reverse { animation: orbit-reverse 10s linear infinite; }
//         .animate-bounce-wave { animation: bounce-wave 1.4s ease-in-out infinite; }
//       `}</style>
//     </div>
//   )
// }