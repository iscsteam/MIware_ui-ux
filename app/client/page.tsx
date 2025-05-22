"use client";

import { useEffect, useState } from "react";
import { fetchClients } from "@/services/client";
import { listCreateFileConversionConfigs, getDAGStatus } from "@/services/api";

interface FileConversionConfig {
  dag_id: string;
  trigger_id?: string; // trigger_id might still be useful for other things, or can be removed if truly unused
  client_id: number;
}

interface DAGStatusResponse {
  // Make sure this matches what your new endpoint (or mapped response) returns.
  // If your API returns { state: 'success' }, this should be:
  // state: string;
  // And then you'd use statusRes.state below.
  // For now, assuming it's { status: 'success' }
  // status: string;
  status: string;
}

interface Client {
  id: number;
  name: string;
}

export default function ClientDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [dagStatuses, setDagStatuses] = useState<
    Record<string, { client_id: number; status: string }>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const clientsRes = await fetchClients();

        if (!clientsRes) {
          setClients([]);
          setLoading(false);
          return;
        }

        setClients(clientsRes);

        const statusMap: Record<string, { client_id: number; status: string }> =
          {};

        for (const client of clientsRes) {
          if (!client?.id) continue;

          const configsRes = await listCreateFileConversionConfigs(client.id);
          const configs: FileConversionConfig[] = configsRes || [];

          for (const config of configs) {
            // Since trigger_id is not needed for getDAGStatus,
            // we attempt to fetch status for every config.
            try {
              const statusRes: DAGStatusResponse = await getDAGStatus(
                config.dag_id
              );

              statusMap[config.dag_id] = {
                client_id: config.client_id,
                status: statusRes.status || "Unknown",
                
              };
            } catch (err) {
              console.error(
                `Failed to get status for DAG ${config.dag_id}`,
                err
              );
              statusMap[config.dag_id] = {
                client_id: config.client_id,
                status: "Error fetching status",
              };
            }
          }
        }

        setDagStatuses(statusMap);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Client File Conversions</h1>
      {Object.entries(dagStatuses).length === 0 ? (
        <p>No file conversion DAGs found or statuses available.</p>
      ) : (
        <ul className="space-y-4">
          {Object.entries(dagStatuses).map(([dagId, data]) => (
            <li key={dagId} className="bg-gray-100 rounded p-4 shadow">
              <p>
                <strong>DAG ID:</strong> {dagId}
              </p>
              <p>
                <strong>Client ID:</strong> {data.client_id}
              </p>
              <p>
                <strong>Status:</strong> {data.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
