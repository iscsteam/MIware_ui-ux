//loginpage.tsx
"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Workflow, Lock, User, Mail, CheckCircle, Globe, ArrowRight } from "lucide-react"

interface LoginForm {
  email: string
  password: string
}

interface User {
  id: number
  email: string
  name: string
  unique_client_id: string
  role: string
  is_active: boolean
}

interface LoginPageProps {
  onLogin: (user: User) => void
}

// Simulated login function for demo
const loginUser = async (loginData: any) => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  return {
    id: 1,
    email: loginData.email,
    unique_client_id: "demo_client_123",
    role: "admin",
    is_active: true
  }
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: ""
  })

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedCredentials = localStorage?.getItem("userCredentials")
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials)
        setFormData({
          email: parsed.email || "",
          password: parsed.password || ""
        })
      } catch (error) {
        console.error("Failed to parse saved credentials:", error)
      }
    }
  }, [])

  const handleInputChange = (field: keyof LoginForm) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    if (error) setError("")
  }

  const handleLogin = async () => {
    setIsLoading(true)
    setError("")

    if (!formData.email.trim()) {
      setError("Email is required")
      setIsLoading(false)
      return
    }

    if (!formData.password) {
      setError("Password is required")
      setIsLoading(false)
      return
    }

    try {
      const loginData = {
        email: formData.email.trim(),
        password: formData.password
      }

      const response = await loginUser(loginData)

      if (!response) {
        setError("Login failed. Please try again.")
        setIsLoading(false)
        return
      }

      if (!response.is_active) {
        setError("Your account is not active. Please contact support.")
        setIsLoading(false)
        return
      }

      const userData: User = {
        id: response.id,
        email: response.email,
        name: response.email.split('@')[0],
        unique_client_id: response.unique_client_id,
        role: response.role,
        is_active: response.is_active
      }
      
      const credentialsToStore = {
        email: formData.email.trim(),
        password: formData.password,
        user: userData
      }
      
      localStorage?.setItem("userCredentials", JSON.stringify(credentialsToStore))
      
      setIsLoading(false)
      onLogin(userData)

    } catch (error: any) {
      console.error("Login error:", error)
      setError("Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  const isFormValid = formData.email.trim() && formData.password

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-bounce" style={{animationDuration: '6s'}}></div>
        <div className="absolute bottom-40 right-20 w-20 h-20 bg-white/10 rounded-full animate-bounce" style={{animationDuration: '8s'}}></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{animationDuration: '4s'}}></div>

        {/* Content */}
        <div className="flex flex-col justify-center items-start p-16 relative z-10">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Workflow className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">MI-WARE</h1>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
              Welcome to the Future of<br />
              <span className="text-emerald-200">Workflow Automation</span>
            </h2>
            
            <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
              Streamline your business processes with our intelligent automation platform. 
              Experience seamless workflow management like never before.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <CheckCircle className="w-5 h-5 text-emerald-200" />
              <span>Intelligent Process Automation</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle className="w-5 h-5 text-emerald-200" />
              <span>Real-time Analytics & Monitoring</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle className="w-5 h-5 text-emerald-200" />
              <span>Secure Cloud Infrastructure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Workflow className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">MI-WARE</h1>
            </div>
            <p className="text-gray-600">Workflow Automation Platform</p>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                Sign In
              </CardTitle>
              <CardDescription className="text-gray-600">
                Access your MI-WARE dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-6">
              <div className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      placeholder="Enter your email address"
                      className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 rounded-xl bg-gray-50 focus:bg-white transition-all duration-300 pl-4 text-gray-800"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange("password")}
                      placeholder="Enter your password"
                      className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 rounded-xl bg-gray-50 focus:bg-white transition-all duration-300 pl-4 pr-12 text-gray-800"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-emerald-600 transition-colors"
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
                  <Alert className="border-red-200 bg-red-50 rounded-xl">
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Login Button */}
                <Button
                  onClick={handleLogin}
                  disabled={!isFormValid || isLoading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Secure Authentication</span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>Global Access</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Secure</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              © 2025 MI-WARE Studio. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}