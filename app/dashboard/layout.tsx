// app/dashboard/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './components/collapsible-sidebar'; // Make sure paths are correct
import { Navbar } from './components/navbar';
import { ThemeProvider } from '@/components/theme-provider'; // Import your custom provider

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
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const handleToggleSidebar = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  if (!user) {
    return null; // Or a loading spinner while checking auth
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar 
          collapsed={isCollapsed} 
          onToggle={handleToggleSidebar} 
          user={user}
        />
        <div className="flex flex-1 flex-col h-full min-h-0 overflow-hidden">
          <Navbar user={user} onLogout={handleLogout} />
          {/* The 'children' here is where your page.tsx will be rendered */}
          <main className="h-full overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}