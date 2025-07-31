'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Play, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';
import { useExecutionStats } from '@/hooks/useExecutionStats';
import SkeletonLoader from '../SkeletonLoader';

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export default function ExecutionStats() {
  const { data, loading, error } = useExecutionStats();

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Failed to load execution stats</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Play className="h-5 w-5" />
          <span>Workflow Executions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.total.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Success</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{data.successful.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Failed</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{data.failed.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Time</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.avgTime}s</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Executions Over Time</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.timeline}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="executions" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Success Rate</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.successRate}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.successRate.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Queue Length:</span>
            <span className="font-medium text-gray-900 dark:text-white">{data.queueLength}</span>
          </div>
          <div className="flex items-center space-x-2">
            <RotateCcw className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Retries:</span>
            <span className="font-medium text-gray-900 dark:text-white">{data.retryCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}