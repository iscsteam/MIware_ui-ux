'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CollapsibleSidebar } from './components/collapsible-sidebar';
import { Navbar } from './components/navbar';
import { ThemeProvider } from '@/components/theme-provider';

interface User {
  id: number;
  email: string;
  name: string;
  unique_client_id: string;
  role: string;
  is_active: boolean;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedCredentials = localStorage.getItem('userCredentials');
    if (savedCredentials) {
      setUser(JSON.parse(savedCredentials));
    } else {
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userCredentials');
    localStorage.removeItem('currentClient');
    localStorage.removeItem('currentWorkflow');
    setUser(null);
    router.push('/');
  };

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="workflow-theme">
      <div className="flex min-h-screen">
        <CollapsibleSidebar />
        <div className="flex flex-1 flex-col">
          <Navbar user={user} onLogout={handleLogout} />
          <main className="flex-1 p-4">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}