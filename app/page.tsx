'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginPage } from '@/components/auth/loginpage';
import { LoadingScreen } from '@/components/auth/loading-screen';
import { ThemeProvider } from '@/components/theme-provider';

interface User {
  id: number;
  email: string;
  name: string;
  unique_client_id: string;
  role: string;
  is_active: boolean;
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (userData: User) => {
    localStorage.setItem('userCredentials', JSON.stringify(userData));
    setIsLoading(true);
    router.push('/dashboard');
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    const savedCredentials = localStorage.getItem('userCredentials');
    if (savedCredentials) {
      router.push('/dashboard');
    }
  }, [router]);

  if (isLoading) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="workflow-theme">
        <LoadingScreen onLoadingComplete={handleLoadingComplete} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="workflow-theme">
      <LoginPage onLogin={handleLogin} />
    </ThemeProvider>
  );
};

export default Index;
