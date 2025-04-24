"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock, User } from "lucide-react";

interface LoginPageProps {
  onLogin: (success: boolean) => void;
  className?: string;
}

export function LoginPage({ onLogin, className }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Simple authentication check
      if (username === "iscs" && password === "iscs") {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        onLogin(true);
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("An error occurred during login");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center bg-[#f5f5f7]",
        className
      )}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col space-y-2 p-6 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">Mi-Ware</h1>
          <p className="text-gray-500">
            Enter your credentials to access the system
          </p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 border border-red-200">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Sign In"}
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Secure access to Mi-Ware workflow system</p>
            <p className="mt-1 text-xs">© 2025 Mi-Ware. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
