'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Workflow, History } from 'lucide-react';

export function CollapsibleSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`relative min-h-screen flex`}>
      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between p-4">
          <h1 className={`text-xl font-bold ${!isExpanded && 'hidden'}`}>MI-WARE</h1>
          <Button variant="ghost" onClick={toggleSidebar}>
            {isExpanded ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <Link href="/dashboard/studio" className="flex items-center p-4 hover:bg-gray-700">
                <Workflow className="h-6 w-6" />
                <span className={`ml-4 ${!isExpanded && 'hidden'}`}>Studio</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/studio" className="flex items-center p-4 hover:bg-gray-700">
                <History className="h-6 w-6" />
                <span className={`ml-4 ${!isExpanded && 'hidden'}`}>Executions</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="sm:hidden fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:hidden w-64 bg-gray-800 text-white">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold">MI-WARE</h1>
          </div>
          <nav className="mt-4">
            <ul>
              <li>
                <Link href="/dashboard/studio" className="flex items-center p-4 hover:bg-gray-700">
                  <Workflow className="h-6 w-6" />
                  <span className="ml-4">Studio</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/studio" className="flex items-center p-4 hover:bg-gray-700">
                  <History className="h-6 w-6" />
                  <span className="ml-4">Executions</span>
                </Link>
              </li>
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
