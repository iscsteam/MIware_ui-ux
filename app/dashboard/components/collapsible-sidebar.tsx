'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Play,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  History,
  GalleryVerticalEnd,
} from 'lucide-react';

// Define a User interface, similar to the one in Navbar
interface User {
  name: string;
  email: string;
}

// Update SidebarProps to accept the user
interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  user: User | null; // <-- Add user prop here
}

const navigation = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Studio', href: '/studio', icon: GalleryVerticalEnd },
  { name: 'Reports', href: '/dashboard/reports', icon: History },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

// Accept the new "user" prop in the function signature
export function Sidebar({ collapsed, onToggle, user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex h-full flex-col">
        {/* ... (Top part of the sidebar is unchanged) ... */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Miware</span>
            </div>
          )}
          <button
            onClick={() => onToggle(!collapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-5 w-5 text-gray-500" /> : <ChevronLeft className="h-5 w-5 text-gray-500" />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section (Modified) */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  {/* Use the first letter of the user's name for the avatar */}
                  <span className="text-sm font-medium text-white">{user?.name?.[0]}</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                {/* Use the user's name and email from props */}
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}