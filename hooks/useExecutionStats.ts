'use client';

import { useState, useEffect } from 'react';

interface ExecutionStats {
  total: number;
  successful: number;
  failed: number;
  avgTime: number;
  queueLength: number;
  retryCount: number;
  timeline: Array<{ time: string; executions: number }>;
  successRate: Array<{ name: string; value: number }>;
}

export function useExecutionStats() {
  const [data, setData] = useState<ExecutionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setData({
          total: 15420,
          successful: 14180,
          failed: 1240,
          avgTime: 2.8,
          queueLength: 12,
          retryCount: 387,
          timeline: [
            { time: '00:00', executions: 45 },
            { time: '04:00', executions: 32 },
            { time: '08:00', executions: 78 },
            { time: '12:00', executions: 95 },
            { time: '16:00', executions: 85 },
            { time: '20:00', executions: 67 },
          ],
          successRate: [
            { name: 'Success', value: 14180 },
            { name: 'Failed', value: 1240 },
          ],
        });
      } catch (err) {
        setError('Failed to fetch execution stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}