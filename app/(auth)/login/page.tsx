
 "use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Workflow,
  Lock,
  Mail,
  CheckCircle,
  Globe,
  ArrowRight,
} from "lucide-react";
import { loginUser } from "@/services/client";

interface LoginForm {
  email: string;
  password: string;
}

interface UserData {
  id: number;
  email: string;
  name: string;
  unique_client_id: string;
  role: string;
  is_active: boolean;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginForm>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const savedCredentials = localStorage?.getItem("userCredentials");
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials);
        setFormData({
          email: parsed.email || "",
          password: parsed.password || "",
        });
      } catch (error) {
        console.error("Failed to parse saved credentials:", error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof LoginForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (error) setError("");
    };

  const isFormValid = formData.email.trim() && formData.password;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isFormValid && !isLoading) {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    if (!formData.email.trim()) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const loginData = { email: formData.email.trim(), password: formData.password };
      const response = await loginUser(loginData);

      if (!response || !response.is_active) {
        setError("Invalid login or account inactive.");
        setIsLoading(false);
        return;
      }

      const userData: UserData = {
        id: response.id,
        email: response.email,
        name: response.email.split("@")[0],
        unique_client_id: response.unique_client_id,
        role: response.role,
        is_active: response.is_active,
      };

      localStorage?.setItem("userCredentials", JSON.stringify({
        email: formData.email.trim(),
        password: formData.password,
        user: userData,
      }));

      router.push("/canvas");
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex">
      {/* Left Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: `url("data:image/svg+xml,...")` }}
          />
        </div>
        <div className="flex flex-col justify-center items-start p-16 z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Workflow className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">MI-WARE</h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">
            Welcome to the Future of
            <br />
            <span className="text-emerald-200">Workflow Automation</span>
          </h2>
          <p className="text-emerald-100 text-lg mb-8">
            Streamline your business processes with our intelligent automation platform.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <CheckCircle className="w-5 h-5 text-emerald-200" />
              Intelligent Process Automation
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle className="w-5 h-5 text-emerald-200" />
              Real-time Analytics & Monitoring
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle className="w-5 h-5 text-emerald-200" />
              Secure Cloud Infrastructure
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Workflow className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">MI-WARE</h1>
            </div>
            <p className="text-gray-600">Workflow Automation Platform</p>
          </div>

          <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-gray-800 mb-2">Sign In</CardTitle>
              <CardDescription className="text-gray-600">Access your MI-WARE dashboard</CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Mail className="w-4 h-4 text-emerald-600" /> Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your email"
                    className="h-12 border-2 border-gray-200 focus:border-emerald-500 rounded-xl bg-gray-50 pl-4"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Lock className="w-4 h-4 text-emerald-600" /> Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange("password")}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your password"
                      className="h-12 border-2 border-gray-200 focus:border-emerald-500 rounded-xl bg-gray-50 pl-4 pr-12"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50 rounded-xl">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleLogin}
                  disabled={!isFormValid || isLoading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg"
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
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8 text-sm text-gray-500">
            © 2025 MI-WARE Studio. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
