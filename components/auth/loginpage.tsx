//loginpage.tsx
"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Workflow, Lock, User, Sparkles, ArrowRight } from "lucide-react"

interface LoginForm {
  name: string
  password: string
}

interface User {
  name: string
}

interface LoginPageProps {
  onLogin: (user: User) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [formData, setFormData] = useState<LoginForm>({
    name: "",
    password: ""
  })

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem("userCredentials")
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials)
        setFormData({
          name: parsed.name || "",
          password: parsed.password || ""
        })
      } catch (error) {
        console.error("Failed to parse saved credentials:", error)
      }
    }
  }, [])
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof LoginForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (!formData.name.trim()) {
      setError("Name is required")
      setIsLoading(false)
      return
    }

    if (formData.password !== "password") {
      setError("Invalid password. Please use: password")
      setIsLoading(false)
      return
    }

    // Success - save credentials and pass user data to parent
    const userData = {
      name: formData.name.trim()
    }
    
    // Store credentials in localStorage
    const credentialsToStore = {
      name: formData.name.trim(),
      password: formData.password
    }
    
    console.log("Saving credentials to localStorage:", credentialsToStore) // Debug log
    localStorage.setItem("userCredentials", JSON.stringify(credentialsToStore))
    
    // Verify it was saved
    const saved = localStorage.getItem("userCredentials")
    console.log("Verified saved credentials:", saved) // Debug log
    
    setIsLoading(false)
    onLogin(userData)
  }

  const isFormValid = formData.name.trim() && formData.password

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-red-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <Workflow className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              MI-WARE
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <p className="text-lg">
                Workflow Automation Platform
              </p>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-gray-400 text-sm">
              Sign in to unleash the power of automation
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl text-center font-bold text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-gray-300">
              Enter your credentials to continue your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2 text-gray-200">
                  <User className="w-4 h-4 text-blue-400" />
                  Your Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  placeholder="Enter your name"
                  className="h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/50 rounded-xl"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2 text-gray-200">
                  <Lock className="w-4 h-4 text-purple-400" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    placeholder="Enter your password"
                    className="h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="border-red-400/50 bg-red-500/20 backdrop-blur-sm">
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing you in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign in to MI-WARE
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400">
          <p className="flex items-center justify-center gap-2">
            © 2025 MI-WARE Studio
            <span className="text-gray-500">•</span>
            Powered by Innovation
          </p>
        </div>
      </div>
    </div>
  )
}