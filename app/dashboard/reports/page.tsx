'use client';

import { useEffect, useState, useMemo } from 'react';
import { reportsAPI } from '@/services/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Report {
  dag_id: string;
  name: string;
  status: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  trigger_type: string;
}

// Helper function to format duration from seconds to HH:MM:SS
const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getReports({ limit, offset });
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      setReports(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(); // Initial fetch

    const intervalId = setInterval(() => {
      fetchReports(); // Fetch reports every 30 seconds
    }, 30000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [offset]);

  const handleNextPage = () => {
    setOffset((prevOffset) => prevOffset + limit);
  };

  const handlePreviousPage = () => {
    setOffset((prevOffset) => Math.max(0, prevOffset - limit));
  };

  const memoizedReports = useMemo(() => reports, [reports]);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && reports.length === 0 ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DAG ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Trigger Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memoizedReports.map((report) => (
                    <TableRow key={`${report.dag_id}-${report.start_time}`}>
                      <TableCell>{report.dag_id}</TableCell>
                      <TableCell>{report.name}</TableCell>
                      <TableCell>{report.status}</TableCell>
                      <TableCell>{new Date(report.start_time).toLocaleString()}</TableCell>
                      <TableCell>{new Date(report.end_time).toLocaleString()}</TableCell>
                      <TableCell>{formatDuration(report.duration_seconds)}</TableCell>
                      <TableCell>{report.trigger_type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end space-x-2 mt-4">
                <Button onClick={handlePreviousPage} disabled={offset === 0}>
                  Previous
                </Button>
                <Button onClick={handleNextPage} disabled={reports.length < limit}>
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
