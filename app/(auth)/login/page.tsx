//  "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
//   Eye,
//   EyeOff,
//   Workflow,
//   Lock,
//   Mail,
//   CheckCircle,
//   Globe,
//   ArrowRight,
// } from "lucide-react";
// import { loginUser } from "@/services/client";

// interface LoginForm {
//   email: string;
//   password: string;
// }

// interface UserData {
//   id: number;
//   email: string;
//   name: string;
//   unique_client_id: string;
//   role: string;
//   is_active: boolean;
// }

// export default function LoginPage() {
//   const [formData, setFormData] = useState<LoginForm>({ email: "", password: "" });
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     setMounted(true);
//     const savedCredentials = localStorage?.getItem("userCredentials");
//     if (savedCredentials) {
//       try {
//         const parsed = JSON.parse(savedCredentials);
//         setFormData({
//           email: parsed.email || "",
//           password: parsed.password || "",
//         });
//       } catch (error) {
//         console.error("Failed to parse saved credentials:", error);
//       }
//     }
//   }, []);

//   const handleInputChange = (field: keyof LoginForm) =>
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       setFormData((prev) => ({ ...prev, [field]: e.target.value }));
//       if (error) setError("");
//     };

//   const isFormValid = formData.email.trim() && formData.password;

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && isFormValid && !isLoading) {
//       handleLogin();
//     }
//   };

//   const handleLogin = async () => {
//     setIsLoading(true);
//     setError("");

//     if (!formData.email.trim()) {
//       setError("Email is required");
//       setIsLoading(false);
//       return;
//     }

//     if (!formData.password) {
//       setError("Password is required");
//       setIsLoading(false);
//       return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email.trim())) {
//       setError("Please enter a valid email address");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const loginData = { email: formData.email.trim(), password: formData.password };
//       const response = await loginUser(loginData);

//       if (!response || !response.is_active) {
//         setError("Invalid login or account inactive.");
//         setIsLoading(false);
//         return;
//       }

//       const userData: UserData = {
//         id: response.id,
//         email: response.email,
//         name: response.email.split("@")[0],
//         unique_client_id: response.unique_client_id,
//         role: response.role,
//         is_active: response.is_active,
//       };

//       localStorage?.setItem("userCredentials", JSON.stringify({
//         email: formData.email.trim(),
//         password: formData.password,
//         user: userData,
//       }));

//       router.push("/canvas");
//     } catch (error: any) {
//       let errorMessage = "Login failed. Please try again.";
//       if (error instanceof Error && error.message) {
//         errorMessage = error.message;
//       }
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!mounted) return null;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex">
//       {/* Left Branding */}
//       <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
//         <div className="absolute inset-0 opacity-10">
//           <div
//             className="absolute inset-0"
//             style={{ backgroundImage: `url("data:image/svg+xml,...")` }}
//           />
//         </div>
//         <div className="flex flex-col justify-center items-start p-16 z-10">
//           <div className="flex items-center gap-4 mb-8">
//             <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
//               <Workflow className="w-8 h-8 text-white" />
//             </div>
//             <h1 className="text-4xl font-bold text-white">MI-WARE</h1>
//           </div>
//           <h2 className="text-3xl font-bold text-white mb-6">
//             Welcome to the Future of
//             <br />
//             <span className="text-emerald-200">Workflow Automation</span>
//           </h2>
//           <p className="text-emerald-100 text-lg mb-8">
//             Streamline your business processes with our intelligent automation platform.
//           </p>
//           <div className="space-y-4">
//             <div className="flex items-center gap-3 text-white">
//               <CheckCircle className="w-5 h-5 text-emerald-200" />
//               Intelligent Process Automation
//             </div>
//             <div className="flex items-center gap-3 text-white">
//               <CheckCircle className="w-5 h-5 text-emerald-200" />
//               Real-time Analytics & Monitoring
//             </div>
//             <div className="flex items-center gap-3 text-white">
//               <CheckCircle className="w-5 h-5 text-emerald-200" />
//               Secure Cloud Infrastructure
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Right Login Form */}
//       <div className="flex-1 flex items-center justify-center p-8">
//         <div className="w-full max-w-md">
//           <div className="lg:hidden text-center mb-8">
//             <div className="inline-flex items-center gap-3 mb-4">
//               <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500  flex items-center justify-center">
//                 <Workflow className="w-6 h-6 text-white" />
//               </div>
//               <h1 className="text-2xl font-bold text-gray-800">MI-WARE</h1>
//             </div>
//             <p className="text-gray-600">Workflow Automation Platform</p>
//           </div>

//           <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
//             <CardHeader className="text-center pb-2">
//               <CardTitle className="text-2xl font-bold text-gray-800 mb-2">Sign In</CardTitle>
//               <CardDescription className="text-gray-600">Access your MI-WARE dashboard</CardDescription>
//             </CardHeader>

//             <CardContent className="p-8 pt-6">
//               <div className="space-y-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                     <Mail className="w-4 h-4 text-emerald-600" /> Email Address
//                   </Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={handleInputChange("email")}
//                     onKeyPress={handleKeyPress}
//                     placeholder="Enter your email"
//                     className="h-12 border-2 border-gray-200 focus:border-emerald-500  bg-gray-50 pl-4"
//                     required
//                     disabled={isLoading}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                     <Lock className="w-4 h-4 text-emerald-600" /> Password
//                   </Label>
//                   <div className="relative">
//                     <Input
//                       id="password"
//                       type={showPassword ? "text" : "password"}
//                       value={formData.password}
//                       onChange={handleInputChange("password")}
//                       onKeyPress={handleKeyPress}
//                       placeholder="Enter your password"
//                       className="h-12 border-2 border-gray-200 focus:border-emerald-500  bg-gray-50 pl-4 pr-12"
//                       required
//                       disabled={isLoading}
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-4 top-1/2 transform -trangray-y-1/2"
//                       disabled={isLoading}
//                     >
//                       {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                     </button>
//                   </div>
//                 </div>

//                 {error && (
//                   <Alert className="border-red-200 bg-red-50 ">
//                     <AlertDescription className="text-red-700">{error}</AlertDescription>
//                   </Alert>
//                 )}

//                 <Button
//                   onClick={handleLogin}
//                   disabled={!isFormValid || isLoading}
//                   className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold  shadow-lg"
//                 >
//                   {isLoading ? (
//                     <div className="flex items-center gap-3">
//                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                       <span>Signing In...</span>
//                     </div>
//                   ) : (
//                     <div className="flex items-center gap-2">
//                       <span>Sign In</span>
//                       <ArrowRight className="w-4 h-4" />
//                     </div>
//                   )}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           <div className="text-center mt-8 text-sm text-gray-500">
//             © 2025 MI-WARE Studio. All rights reserved.
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function AuthCard() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleMode = () => setIsLogin((prev) => !prev);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-4">
      <div className="flex w-full max-w-5xl  backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20">
        {/* Left panel: either image/text (login) or tabs + register form */}
        <div className="w-1/2 p-10 bg-gradient-to-br from-gray-200 to-blue-50/30 flex flex-col items-center justify-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="left-login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center relative z-10 w-full h-full"
              >
                <div className="mb-8 w-full h-full bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
                    alt="Login"
                    fill
                    className="object-cover rounded-2xl"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-center bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl">
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
                onSubmit={handleSubmit}
                className="w-full space-y-5 relative z-10"
              >
                <div className="flex w-[200px] justify-center space-x-1 mb-8  bg-gray-200/50 backdrop-blur-sm p-1  shadow-inner border border-white/30 rounded-xl">
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
                        ? " text-gray-900  bg-gray-300 transform scale-105"
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

                <div>
                  <Label
                    htmlFor="r-name"
                    className="text-gray-700 font-semibold mb-2 block"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="r-name"
                    required
                    placeholder="Enter Your Full Name"
                    className="h-10  border-2 border-gray-200 focus:outline-none focus:ring-0   bg-white/80 backdrop-blur-sm "
                  />
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
                    placeholder="Enter Your Email"
                    className="h-10  border-2 border-gray-200 focus:outline-none focus:ring-0   bg-white/80 backdrop-blur-sm "
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
                      placeholder="Enter your Password"
                      className="h-10  border-2 border-gray-200 focus:outline-none focus:ring-0   bg-white/80 backdrop-blur-sm "
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold  shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing up...</span>
                    </div>
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                <p className="text-center text-sm text-gray-500 pt-2">
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
        <div className="w-1/2 p-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="right-login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6 relative z-10"
              >
                {/* Enhanced Tabs */}
                <div className="flex w-[200px] justify-center space-x-1 mb-8 bg-gray-200/50 backdrop-blur-sm p-1  shadow-inner border border-gray-200/30 rounded-xl">
                  <button
                    type="button"
                    className={`px-4 py-2 font-semibold rounded-lg transition-all duration-300 ${
                      isLogin
                        ? " text-gray-900 bg-gray-300 transform scale-105"
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
                        ? " text-white shadow-lg transform scale-105"
                        : "text-gray-600"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label
                      htmlFor="l-email"
                      className="text-gray-700 font-semibold mb-2 block"
                    >
                      Email
                    </Label>
                    <div className="relative ">
                      <Input
                        id="l-email"
                        type="email"
                        required
                        placeholder="Enter You Email"
                        className="h-10  border-2 border-gray-200    focus:outline-none focus:ring-0"
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
                        required
                        className="h-10  border-2 border-gray-200 focus:outline-none focus:ring-0   bg-white/80 backdrop-blur-sm "
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

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold  shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:transform-none mt-6"
                  >
                    {loading ? (
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
                <div className="mb-8 w-full h-full bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
                    alt="Sign Up"
                    fill
                    className="object-cover rounded-2xl"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-center bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl">
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
    </div>
  );
}