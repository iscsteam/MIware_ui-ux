// 'use client';

// import { useEffect, useState } from 'react';
// import { dashboardAPI } from '@/services/api';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// interface SystemMetrics {
//   cpu_load_percent: number;
//   memory_usage_percent: number;
//   memory_total_gb: number;
//   memory_used_gb: number;
//   disk_root_usage_percent: number;
//   disk_root_total_gb: number;
//   disk_root_used_gb: number;
//   disk_data_usage_percent: number;
//   network_bytes_sent_mb: number;
//   network_bytes_received_mb: number;
//   timestamp: string;
// }

// const SystemStats = () => {
//   const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchMetrics = async () => {
//       try {
//         const response = await dashboardAPI.getMetrics();
//         if (!response.ok) {
//           throw new Error('Failed to fetch system metrics');
//         }
//         const data = await response.json();
//         setMetrics(data);
//         setError(null);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'An unknown error occurred');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMetrics();
//     const intervalId = setInterval(fetchMetrics, 10000); // Refresh every 10 seconds

//     return () => clearInterval(intervalId);
//   }, []);

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>System Metrics</CardTitle>
//       </CardHeader>
//       <CardContent>
//         {loading ? (
//           <p>Loading...</p>
//         ) : error ? (
//           <p className="text-red-500">{error}</p>
//         ) : metrics ? (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <h3 className="font-bold">CPU</h3>
//               <p>Load: {metrics.cpu_load_percent.toFixed(2)}%</p>
//             </div>
//             <div>
//               <h3 className="font-bold">Memory</h3>
//               <p>Usage: {metrics.memory_usage_percent.toFixed(2)}%</p>
//               <p>Used: {metrics.memory_used_gb.toFixed(2)} GB / {metrics.memory_total_gb.toFixed(2)} GB</p>
//             </div>
//             <div>
//               <h3 className="font-bold">Disk (Root)</h3>
//               <p>Usage: {metrics.disk_root_usage_percent.toFixed(2)}%</p>
//               <p>Used: {metrics.disk_root_used_gb.toFixed(2)} GB / {metrics.disk_root_total_gb.toFixed(2)} GB</p>
//             </div>
//             <div>
//               <h3 className="font-bold">Disk (Data)</h3>
//               <p>Usage: {metrics.disk_data_usage_percent.toFixed(2)}%</p>
//             </div>
//             <div>
//               <h3 className="font-bold">Network</h3>
//               <p>Sent: {metrics.network_bytes_sent_mb.toFixed(2)} MB</p>
//               <p>Received: {metrics.network_bytes_received_mb.toFixed(2)} MB</p>
//             </div>
//           </div>
//         ) : (
//           <p>No metrics data available.</p>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default SystemStats;


// SystemStats.tsx
'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import { Card, CardContent } from '@/components/ui/card'; // Assuming you use shadcn/ui

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

interface DataPoint {
  time: string;
  usage: number;
}

const MAX_GRAPH_POINTS = 12; // Store 12 points for ~2 minutes of history

// --- HELPER COMPONENTS ---

// A versatile mini-graph for the left sidebar
const MiniSparkline = ({ data, chartType, dataKey, color }) => (
  <div style={{ width: '60px', height: '30px' }}>
    <ResponsiveContainer>
      {chartType === 'bar' ? (
        <BarChart data={data}>
          <Bar dataKey={dataKey} fill={color} />
        </BarChart>
      ) : (
        <AreaChart data={data}>
          <Area type="linear" dataKey={dataKey} stroke={color} fill={`${color}33`} strokeWidth={2} />
        </AreaChart>
      )}
    </ResponsiveContainer>
  </div>
);


// --- MAIN COMPONENT ---
const SystemStats = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [cpuHistory, setCpuHistory] = useState<DataPoint[]>([]);
  const [diskHistory, setDiskHistory] = useState<DataPoint[]>([]);
  const [networkHistory, setNetworkHistory] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('CPU');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // MOCK API: Simulates fetching your payload with fluctuating data
        const mockResponse = {
          ok: true,
          json: async (): Promise<SystemMetrics> => ({
            cpu_load_percent: 15 + (Math.random() * 70), // High fluctuation for spikes
            memory_usage_percent: 64.3,
            memory_total_gb: 7.7,
            memory_used_gb: 4.72,
            disk_root_usage_percent: Math.random() * 10, // Bursty disk activity
            disk_root_total_gb: 1006.85,
            disk_root_used_gb: 23.64,
            disk_data_usage_percent: 0.16,
            network_bytes_sent_mb: 11.57 + Math.random(),
            network_bytes_received_mb: 15.95 + Math.random() * 3,
            timestamp: new Date().toISOString(),
          }),
        };

        if (!mockResponse.ok) throw new Error('Failed to fetch system metrics');
        
        const data: SystemMetrics = await mockResponse.json();
        setMetrics(data);

        // --- Update history for all graphs ---
        const now = new Date();
        const timeLabel = now.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });

        const updateHistory = (prevHistory: DataPoint[], newUsage: number) => {
          const newPoint: DataPoint = { time: timeLabel, usage: parseFloat(newUsage.toFixed(1)) };
          const updatedHistory = [...prevHistory, newPoint];
          return updatedHistory.slice(-MAX_GRAPH_POINTS);
        };

        setCpuHistory(prev => updateHistory(prev, data.cpu_load_percent));
        setDiskHistory(prev => updateHistory(prev, data.disk_root_usage_percent));
        setNetworkHistory(prev => updateHistory(prev, data.network_bytes_received_mb)); // Graphing received bytes

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const intervalId = setInterval(fetchMetrics, 10000);

    return () => clearInterval(intervalId);
  }, []);

  // --- RENDER FUNCTIONS ---

  const renderDetailView = () => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!metrics) return <p>No data available.</p>;

    const renderMetric = (label: string, value: string | number, unit: string = '') => (
        <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: '#555' }}>{label}: </span>
            <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>{value}{unit}</span>
        </div>
    );

    switch (activeTab) {
      case 'CPU':
        return (
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'lighter', margin: 0, marginBottom: '1rem' }}>CPU</h2>
            <div style={{ height: '250px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuHistory}>
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#ccc" />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} stroke="#ccc" />
                  <Tooltip />
                  <Area type="linear" dataKey="usage" stroke="#0078d4" fill="#0078d433" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
                {renderMetric("Utilization", metrics.cpu_load_percent.toFixed(1), '%')}
            </div>
          </div>
        );
      
      case 'Memory':
        return (
            <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'lighter', margin: 0, marginBottom: '1rem' }}>Memory</h2>
                {renderMetric("Usage", metrics.memory_usage_percent.toFixed(1), '%')}
                {renderMetric("Used", `${metrics.memory_used_gb.toFixed(2)} GB / ${metrics.memory_total_gb.toFixed(2)} GB`)}
            </div>
        );
        
      case 'Disk (Root)':
        return (
            <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'lighter', margin: 0, marginBottom: '1rem' }}>Disk (Root)</h2>
                {renderMetric("Usage", metrics.disk_root_usage_percent.toFixed(1), '%')}
                {renderMetric("Used", `${metrics.disk_root_used_gb.toFixed(2)} GB / ${metrics.disk_root_total_gb.toFixed(2)} GB`)}
            </div>
        );

      case 'Disk (Data)':
        return (
            <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'lighter', margin: 0, marginBottom: '1rem' }}>Disk (Data)</h2>
                {renderMetric("Usage", metrics.disk_data_usage_percent.toFixed(2), '%')}
            </div>
        );

      case 'Network':
        return (
            <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'lighter', margin: 0, marginBottom: '1rem' }}>Network</h2>
                {renderMetric("Sent", metrics.network_bytes_sent_mb.toFixed(2), " MB")}
                {renderMetric("Received", metrics.network_bytes_received_mb.toFixed(2), " MB")}
            </div>
        );

      default:
        return <p>Select a category</p>;
    }
  };

  const sidebarItems = [
    { name: 'CPU', data: cpuHistory, chartType: 'area', dataKey: 'usage', color: '#0078d4', value: `${metrics?.cpu_load_percent.toFixed(0) ?? '...'}%` },
    { name: 'Memory', data: [{ usage: metrics?.memory_usage_percent ?? 0 }], chartType: 'bar', dataKey: 'usage', color: '#8884d8', value: `${metrics?.memory_usage_percent.toFixed(0) ?? '...'}%` },
    { name: 'Disk (Root)', data: diskHistory, chartType: 'bar', dataKey: 'usage', color: '#28a745', value: `${metrics?.disk_root_usage_percent.toFixed(0) ?? '...'}%` },
    { name: 'Disk (Data)', data: [{usage: metrics?.disk_data_usage_percent ?? 0}], chartType: 'bar', dataKey: 'usage', color: '#28a745', value: `${metrics?.disk_data_usage_percent.toFixed(1) ?? '...'}%` },
    { name: 'Network', data: networkHistory, chartType: 'area', dataKey: 'usage', color: '#fd7e14', value: `${(metrics?.network_bytes_received_mb * 8).toFixed(0) ?? '...'} Kbps` } // Example conversion
  ];

  return (
    <Card style={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd', padding: 0 }}>
      <CardContent style={{ display: 'flex', padding: '0', minHeight: '450px' }}>
        {/* --- LEFT SIDEBAR --- */}
        <div style={{ width: '220px', borderRight: '1px solid #ddd', background: '#e9e9e9', padding: '10px' }}>
          {sidebarItems.map(item => (
            <div
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                cursor: 'pointer',
                backgroundColor: activeTab === item.name ? '#cce5ff' : 'transparent',
                border: `1px solid ${activeTab === item.name ? '#99caff' : 'transparent'}`,
                marginBottom: '5px'
              }}
            >
              <MiniSparkline data={item.data} chartType={item.chartType} dataKey={item.dataKey} color={item.color} />
              <div style={{ marginLeft: '10px', fontSize: '13px' }}>
                <p style={{ fontWeight: '600', margin: 0 }}>{item.name}</p>
                {loading ? '...' : item.value}
              </div>
            </div>
          ))}
        </div>

        {/* --- RIGHT CONTENT AREA --- */}
        <div style={{ flex: 1, padding: '20px', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
          {renderDetailView()}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStats;