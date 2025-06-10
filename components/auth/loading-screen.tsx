//loading-screen.tsx
"use client"
import { useEffect, useState } from "react"
import { Workflow, Sparkles } from "lucide-react"

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [dots, setDots] = useState("")

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 60) // Updates every 60ms to reach 100% in 3 seconds

    // Animated dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ""
        return prev + "."
      })
    }, 500)

    // Complete loading after 3 seconds
    const loadingTimer = setTimeout(() => {
      onLoadingComplete()
    }, 3000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(dotsInterval)
      clearTimeout(loadingTimer)
    }
  }, [onLoadingComplete])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/30 to-red-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Loading Content */}
      <div className="text-center space-y-8 relative z-10">
        {/* Logo Animation */}
        <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
          <Workflow className="w-12 h-12 text-white animate-pulse" />
        </div>

        {/* Main Title */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-pulse">
            MI-WARE
          </h1>
          
          {/* Subtitle with animated sparkles */}
          <div className="flex items-center justify-center gap-3 text-gray-300">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" />
            <p className="text-xl font-medium">
              Initializing Workspace{dots}
            </p>
            <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-80 mx-auto space-y-3">
          <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
            <div 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-100 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 font-medium">
            {progress}% Complete
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-200"></div>
        </div>

        {/* Welcome Message */}
        <div className="text-gray-300 space-y-2 animate-fade-in">
          <p className="text-lg font-medium">Welcome to the Future</p>
          <p className="text-sm text-gray-400">Preparing your automation environment</p>
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-gray-400">
        <p className="text-sm">Powered by Innovation & Excellence</p>
      </div>
    </div>
  )
}