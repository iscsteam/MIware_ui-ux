// app/dashboard/page.tsx
'use client';

// Update these import paths
//import SystemStats from './components/stats/SystemStats';
import ExecutionStats from './components/stats/ExecutionStats';
// import { ThemeProvider } from './components/ThemeProvider';
// import { ThemeProvider } from '@/components/theme-provider';
//import UserStats from './components/stats/UserStats';
//import NodeUsageStats from './components/stats/NodeUsageStats';

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor your workflow automation system performance and usage
        </p>
      </div>

      <div className="space-y-6">
        <ExecutionStats />
        {/* <SystemStats />
        
        <UserStats />
        <NodeUsageStats /> */}
      </div>
    </div>
  );
}