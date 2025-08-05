//stats/SystemStats.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, MemoryStick, HardDrive, Database, Wifi } from 'lucide-react';
import { dashboardAPI } from '@/services/api';

// --- INTERFACES ---
interface SystemMetrics {
  cpu_load_percent: number;
  memory_usage_percent: number;
  memory_total_gb: number;
  memory_used_gb: number;
  disk_root_usage_percent: number;
  disk_root_total_gb: number;
  disk_root_used_gb: number;
  disk_data_usage_percent: number;
  network_bytes_sent_mb: number;
  network_bytes_received_mb: number;
  timestamp: string;
}

// Allow null for initial empty state
interface DataPoint {
  time: string;
  usage: number | null;
}

interface NetworkDataPoint {
  time: string;
  sent: number | null;
  received: number | null;
}

const MAX_GRAPH_POINTS = 30; // Store 30 points for history

// --- 1. Create initial empty data arrays for the "scrolling" effect ---
const initialDataPoints: DataPoint[] = Array.from({ length: MAX_GRAPH_POINTS }, () => ({
  time: '',
  usage: null, 
}));

const initialNetworkDataPoints: NetworkDataPoint[] = Array.from({ length: MAX_GRAPH_POINTS }, () => ({
  time: '',
  sent: null,
  received: null,
}));


// --- HELPER COMPONENTS ---
const MiniSparkline = ({ data, chartType, dataKey, color }: { data: any[], chartType: string, dataKey: string, color: string }) => (
  <div className="w-16 h-8">
    <ResponsiveContainer>
      {chartType === 'bar' ? (
        <BarChart data={data}>
          <Bar dataKey={dataKey} fill={color} isAnimationActive={false} />
        </BarChart>
      ) : (
        <AreaChart data={data}>
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={`${color}33`} strokeWidth={2} isAnimationActive={false} connectNulls={false} />
        </AreaChart>
      )}
    </ResponsiveContainer>
  </div>
);

const MetricCard = ({ label, value, unit = '', icon: Icon, color }: { 
  label: string; 
  value: string | number; 
  unit?: string; 
  icon?: React.ElementType; 
  color?: string;
}) => (
  <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {Icon && <Icon className="h-4 w-4" style={{ color }} />}
    </div>
    <div className="text-2xl font-bold">{value}{unit}</div>
  </div>
);

// --- MAIN COMPONENT ---
const SystemStats = () => {
  // --- 2. Initialize state with the pre-filled empty arrays ---
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [cpuHistory, setCpuHistory] = useState<DataPoint[]>(initialDataPoints);
  const [memoryHistory, setMemoryHistory] = useState<DataPoint[]>(initialDataPoints);
  const [diskRootHistory, setDiskRootHistory] = useState<DataPoint[]>(initialDataPoints);
  const [diskDataHistory, setDiskDataHistory] = useState<DataPoint[]>(initialDataPoints);
  const [networkHistory, setNetworkHistory] = useState<NetworkDataPoint[]>(initialNetworkDataPoints);
  const [networkRates, setNetworkRates] = useState({ sentMbps: 0, receivedMbps: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('CPU');
  const prevMetricsRef = useRef<SystemMetrics | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await dashboardAPI.getMetrics();
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        const data: SystemMetrics = await response.json();
        
        setMetrics(data);

        const now = new Date();
        const timeLabel = now.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });

        // This function now correctly creates the scrolling effect
        const updateHistory = (prevHistory: DataPoint[], newUsage: number): DataPoint[] => {
          const newPoint: DataPoint = { time: timeLabel, usage: parseFloat(newUsage.toFixed(1)) };
          const updatedHistory = [...prevHistory, newPoint];
          return updatedHistory.slice(-MAX_GRAPH_POINTS);
        };
        
        const prevMetrics = prevMetricsRef.current;
        
        // Don't calculate rates on the very first fetch to avoid a large initial spike
        if (prevMetrics) {
          const timeDiffSec = (new Date(data.timestamp).getTime() - new Date(prevMetrics.timestamp).getTime()) / 1000 || 1;
          const sentMbDiff = data.network_bytes_sent_mb - prevMetrics.network_bytes_sent_mb;
          const receivedMbDiff = data.network_bytes_received_mb - prevMetrics.network_bytes_received_mb;
          
          const receivedMbps = Math.max(0, (receivedMbDiff * 8) / timeDiffSec);
          const sentMbps = Math.max(0, (sentMbDiff * 8) / timeDiffSec);
          
          setNetworkRates({ sentMbps, receivedMbps });
          
          const newNetworkPoint: NetworkDataPoint = { 
            time: timeLabel, 
            sent: parseFloat(sentMbps.toFixed(2)), 
            received: parseFloat(receivedMbps.toFixed(2)) 
          };
          setNetworkHistory(prev => [...prev, newNetworkPoint].slice(-MAX_GRAPH_POINTS));
        }
        
        setCpuHistory(prev => updateHistory(prev, data.cpu_load_percent));
        setMemoryHistory(prev => updateHistory(prev, data.memory_usage_percent));
        setDiskRootHistory(prev => updateHistory(prev, data.disk_root_usage_percent));
        setDiskDataHistory(prev => updateHistory(prev, data.disk_data_usage_percent));

        prevMetricsRef.current = data;
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error("Fetch metrics error:", err);
      } finally {
        setLoading(false);
      }
    };

    const intervalId = setInterval(fetchMetrics, 2000);
    return () => clearInterval(intervalId);
  }, []);

  // --- RENDER FUNCTIONS ---
  const renderDetailView = () => {
    if (loading && !metrics) return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Waiting for first metric...</p>
        </div>
      </div>
    );
    
    if (error) return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive text-center">Error: {error}</p>
      </div>
    );
    
    if (!metrics) return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );

    const renderGraph = (title: string, data: any[], dataKey: string, stroke: string, fill: string, unit: string) => (
      <div className="bg-card rounded-lg p-4 border border-border">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}${unit}`, title.replace(' Over Time', '')]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Area type="monotone" dataKey={dataKey} stroke={stroke} fill={fill} strokeWidth={2} dot={false} isAnimationActive={false} connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );

    switch (activeTab) {
      case 'CPU':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-semibold">CPU Performance</h2>
            </div>
            {renderGraph('Usage Over Time', cpuHistory, 'usage', '#3b82f6', '#3b82f630', '%')}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard label="Current Usage" value={metrics.cpu_load_percent.toFixed(1)} unit="%" icon={Activity} color="#3b82f6" />
              <MetricCard label="Average (30s)" value={(cpuHistory.filter(p => p.usage !== null).reduce((sum, point) => sum + (point.usage || 0), 0) / (cpuHistory.filter(p => p.usage !== null).length || 1)).toFixed(1)} unit="%" icon={Activity} color="#3b82f6" />
            </div>
          </div>
        );
      
      case 'Memory':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <MemoryStick className="h-6 w-6 text-purple-500" />
              <h2 className="text-2xl font-semibold">Memory Usage</h2>
            </div>
            {renderGraph('Usage Over Time', memoryHistory, 'usage', '#8b5cf6', '#8b5cf630', '%')}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard label="Usage" value={metrics.memory_usage_percent.toFixed(1)} unit="%" icon={MemoryStick} color="#8b5cf6" />
              <MetricCard label="Used" value={metrics.memory_used_gb.toFixed(2)} unit=" GB" />
              <MetricCard label="Total" value={metrics.memory_total_gb.toFixed(2)} unit=" GB" />
            </div>
          </div>
        );
        
      case 'Disk (Root)':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <HardDrive className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-semibold">Root Disk Usage</h2>
            </div>
             {renderGraph('Usage Over Time', diskRootHistory, 'usage', '#10b981', '#10b98130', '%')}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard label="Usage" value={metrics.disk_root_usage_percent.toFixed(1)} unit="%" icon={HardDrive} color="#10b981" />
              <MetricCard label="Used" value={metrics.disk_root_used_gb.toFixed(2)} unit=" GB" />
              <MetricCard label="Total" value={metrics.disk_root_total_gb.toFixed(2)} unit=" GB" />
            </div>
          </div>
        );

      case 'Disk (Data)':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Database className="h-6 w-6 text-emerald-500" />
              <h2 className="text-2xl font-semibold">Data Disk Usage</h2>
            </div>
            {renderGraph('Usage Over Time', diskDataHistory, 'usage', '#059669', '#05966930', '%')}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard label="Current Usage" value={metrics.disk_data_usage_percent.toFixed(2)} unit="%" icon={Database} color="#059669" />
              <MetricCard label="Average (30s)" value={(diskDataHistory.filter(p=> p.usage !== null).reduce((sum, point) => sum + (point.usage || 0), 0) / (diskDataHistory.filter(p=> p.usage !== null).length||1)).toFixed(1)} unit="%" />
            </div>
          </div>
        );

      case 'Network':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Wifi className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-semibold">Network Activity</h2>
            </div>
            
            <div className="bg-card rounded-lg p-4 border border-border">
              <h3 className="text-lg font-medium mb-4">Transfer Rate Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={networkHistory}>
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis unit=" Mbps" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={60} />
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value.toFixed(2)} Mbps`, name === 'received' ? 'Download' : 'Upload']}
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }}
                    />
                    <Line type="monotone" dataKey="received" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} name="received" connectNulls={false} />
                    <Line type="monotone" dataKey="sent" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} name="sent" connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Download Rate" value={networkRates.receivedMbps.toFixed(2)} unit=" Mbps" icon={Wifi} color="#3b82f6" />
              <MetricCard label="Upload Rate" value={networkRates.sentMbps.toFixed(2)} unit=" Mbps" icon={Wifi} color="#ef4444" />
              <MetricCard label="Total Received" value={metrics.network_bytes_received_mb.toFixed(2)} unit=" MB" />
              <MetricCard label="Total Sent" value={metrics.network_bytes_sent_mb.toFixed(2)} unit=" MB" />
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Select a category from the sidebar</p>
          </div>
        );
    }
  };

  const sidebarItems = [
    { name: 'CPU', data: cpuHistory, chartType: 'area', dataKey: 'usage', color: '#3b82f6', value: `${metrics?.cpu_load_percent.toFixed(0) ?? '...'}%`, icon: Activity },
    { name: 'Memory', data: memoryHistory, chartType: 'area', dataKey: 'usage', color: '#8b5cf6', value: `${metrics?.memory_usage_percent.toFixed(0) ?? '...'}%`, icon: MemoryStick },
    { name: 'Disk (Root)', data: diskRootHistory, chartType: 'area', dataKey: 'usage', color: '#10b981', value: `${metrics?.disk_root_usage_percent.toFixed(0) ?? '...'}%`, icon: HardDrive },
    { name: 'Disk (Data)', data: diskDataHistory, chartType: 'area', dataKey: 'usage', color: '#059669', value: `${metrics?.disk_data_usage_percent.toFixed(1) ?? '...'}%`, icon: Database },
    { name: 'Network', data: networkHistory.map(point => ({ time: point.time, usage: point.received })), chartType: 'area', dataKey: 'usage', color: '#3b82f6', value: `${networkRates.receivedMbps.toFixed(1)} Mbps`, icon: Wifi }
  ];

  return (
    <Card className="bg-background border-border shadow-lg overflow-hidden">
      <CardContent className="flex p-0 min-h-[500px]">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-border bg-muted/30 p-4">
          <h3 className="text-lg font-semibold mb-4 text-foreground">System Metrics</h3>
          <div className="space-y-2">
            {sidebarItems.map(item => (
              <div
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                  activeTab === item.name 
                    ? 'bg-primary/10 border border-primary/20 shadow-sm' 
                    : 'bg-card hover:bg-muted/50 border border-transparent'
                }`}
              >
                <div className="flex-shrink-0 mr-3">
                  <item.icon className="h-5 w-5" style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(loading && !metrics) ? 'Loading...' : item.value}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <MiniSparkline data={item.data} chartType={item.chartType} dataKey={item.dataKey} color={item.color} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 bg-background">
          {renderDetailView()}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStats;