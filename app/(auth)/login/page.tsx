"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { loginUser, createCredentials, CredentialOut } from "@/services/client";

interface LoginForm {
  email: string;
  password: string;
}

interface CreateCredentials {
  email: string;
  password: string;
  role?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserData {
  id: number;
  email: string;
  name: string;
  unique_client_id: string;
  role: string;
  is_active: boolean;
}

export default function AuthCard() {
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [formDataRegister, setFormDataRegister] = useState({
    email: "",
    password: "",
    role: "user",
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredential, setCreatedCredential] =
    useState<CredentialOut | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is already logged in and redirect
    const savedCredentials = localStorage?.getItem("userCredentials");
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials);
        // If user has valid credentials, redirect to dashboard
        if (parsed.user && parsed.user.is_active) {
          router.push("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Failed to parse saved credentials:", error);
        // Clear invalid credentials
        localStorage?.removeItem("userCredentials");
      }
    }
    
    // Forms remain empty - no auto-population
  }, [router]);

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    // Clear both forms when switching modes
    setFormData({ email: "", password: "" });
    setFormDataRegister({ email: "", password: "", role: "user" });
    setError(""); // Clear any existing errors
  };

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError(""); // Clear error when user starts typing
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
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
      const loginData = {
        email: formData.email.trim(),
        password: formData.password,
      };
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
      
      localStorage?.setItem(
        "userCredentials",
        JSON.stringify({
          user: userData,
        })
      );
      
      router.push("/dashboard");
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      // Reset form on error
      setFormData({ email: "", password: "" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCredentials = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validation
    if (!formDataRegister.email.trim() || !formDataRegister.password.trim()) {
      setError("Email and password are required.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    if (!emailRegex.test(formDataRegister.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formDataRegister.password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const created = await createCredentials(formDataRegister);

      if (!created || !created.id) {
        throw new Error("Credential creation failed or didn't return an ID.");
      }

      // Automatically log in the user after successful registration
      const loginData = {
        email: formDataRegister.email.trim(),
        password: formDataRegister.password,
      };
      const response = await loginUser(loginData);

      if (!response || !response.is_active) {
        throw new Error("Login failed after account creation.");
      }

      const userData: UserData = {
        id: response.id,
        email: response.email,
        name: response.email.split("@")[0],
        unique_client_id: response.unique_client_id,
        role: response.role,
        is_active: response.is_active,
      };

      localStorage?.setItem(
        "userCredentials",
        JSON.stringify({
          user: userData,
        })
      );

      setCreatedCredential(created);
      // Reset form
      setFormDataRegister({
        email: "",
        password: "",
        role: "",
      });
      
      // Redirect to dashboard
      router.push("/dashboard");
      setFormData({ email: "", password: "" });
    } catch (error: unknown) {
      console.error("Failed to create credentials:", error);
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        setError(
          "Cannot connect to the API server. Please ensure the backend service is accessible."
        );
      } else if (error instanceof Error) {
        setError(`Error: ${error.message}`);
      } else {
        setError("An unknown error occurred.");
      }
      // Reset registration form on error
      setFormDataRegister({
        email: "",
        password: "",
        role: "user",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-4">
    //   <div className="flex w-full max-w-5xl backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20">
    <div className="min-h-screen w-full flex bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">

        {/* Left panel: either image/text (login) or tabs + register form */}
        <div className="w-1/2 p-0 bg-gradient-to-br from-gray-200 to-blue-50/30 flex flex-col items-center justify-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="left-login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center relative z-10 w-full h-full"
              >
                <div className="mb-8 w-full h-full bg-white/60 backdrop-blur-sm shadow-lg border border-white/30 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
                    alt="Login"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-center bg-gradient-to-t from-black/60 to-transparent">
                    <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-50 to-gray-300 bg-clip-text text-transparent">
                      miWare
                    </h2>
                    <p className="text-gray-50 text-lg font-medium">
                      Sign in to your account
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="left-register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleCreateCredentials}
                className="w-full space-y-5 relative z-10 p-16"
              >
                <div className="flex w-[200px] justify-center space-x-1 mb-4 bg-gray-200/50 backdrop-blur-sm p-1 shadow-inner border border-white/30 rounded-xl">
                  <button
                    type="button"
                    onClick={toggleMode}
                    className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 ${
                      isLogin
                        ? "text-white shadow-lg transform scale-105"
                        : "text-gray-600"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 ${
                      !isLogin
                        ? "text-gray-900 bg-gray-300 transform scale-105"
                        : "text-gray-700 hover:bg-white/60"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <div className="">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-950 bg-clip-text text-transparent">
                    Create your new account
                  </h2>
                  <p className="">
                    Join us to access exclusive features and stay connected.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="credential-role">Role</Label>
                  <Select
                    value={formDataRegister.role}
                    onValueChange={(value) =>
                      setFormDataRegister((prev) => ({ ...prev, role: value }))
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="r-email"
                    className="text-gray-700 font-semibold mb-2 block"
                  >
                    Email
                  </Label>
                  <Input
                    id="r-email"
                    type="email"
                    required
                    value={formDataRegister.email}
                    onChange={(e) =>
                      setFormDataRegister({
                        ...formDataRegister,
                        email: e.target.value,
                      })
                    }
                    placeholder="Enter Your Email"
                    className="h-10 border-2 border-gray-200 focus:outline-none focus:ring-0 bg-white/80 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="r-password"
                    className="text-slate-700 font-semibold mb-2 block"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="r-password"
                      type={showPwd ? "text" : "password"}
                      required
                      value={formDataRegister.password}
                      onChange={(e) =>
                        setFormDataRegister({
                          ...formDataRegister,
                          password: e.target.value,
                        })
                      }
                      placeholder="Enter your Password"
                      className="h-10 border-2 border-gray-200 focus:outline-none focus:ring-0 bg-white/80 backdrop-blur-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-gray-950 transition-colors duration-200 p-1"
                    >
                      {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing up...</span>
                    </div>
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                <p className="text-center text-sm text-gray-500 ">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200"
                  >
                    Sign In
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Right panel: either login form under tabs (login) or image/text (register) */}
        <div className="w-1/2 p-0 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="right-login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6 relative z-10 p-16"
              >
                {/* Enhanced Tabs */}
                <div className="flex w-[200px] justify-center space-x-1 mb-8 bg-gray-200/50 backdrop-blur-sm p-1 shadow-inner border border-gray-200/30 rounded-xl">
                  <button
                    type="button"
                    className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 ${
                      isLogin
                        ? "text-gray-900 bg-gray-300 transform scale-105"
                        : "text-gray-700 hover:bg-white/60"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={toggleMode}
                    className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 ${
                      !isLogin
                        ? "text-white shadow-lg transform scale-105"
                        : "text-gray-600"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <Label
                      htmlFor="l-email"
                      className="text-gray-700 font-semibold mb-2 block"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="l-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter Your Email"
                        className="h-10 border-2 border-gray-200 focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="l-password"
                      className="text-gray-700 font-semibold mb-2 block"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="l-password"
                        type={showPwd ? "text" : "password"}
                        placeholder="Enter Your Password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                        className="h-10 border-2 border-gray-200 focus:outline-none focus:ring-0 bg-white/80 backdrop-blur-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 transition-colors duration-200 p-1"
                      >
                        {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors duration-200"
                      />
                      <span className="text-gray-600 font-medium">
                        Remember me
                      </span>
                    </label>
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200"
                    >
                      Forgot Password?
                    </a>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:transform-none mt-6"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <p className="text-center text-sm text-gray-500 pt-2">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-colors duration-200"
                    >
                      Sign Up
                    </button>
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="right-signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="text-center relative z-10 w-full h-full"
              >
                <div className="mb-8 w-full h-full bg-white/60 backdrop-blur-sm shadow-lg border border-white/30 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
                    alt="Sign Up"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-center bg-gradient-to-t from-black/60 to-transparent">
                    <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-50 to-gray-300 bg-clip-text text-transparent">
                      miWare
                    </h2>
                    <p className="text-gray-50 text-lg font-medium">
                      Create your account and get started
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    // </div>
  );
}