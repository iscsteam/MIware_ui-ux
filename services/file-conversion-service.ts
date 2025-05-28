//file-conversion-service.ts
import { toast } from "@/components/ui/use-toast";
import { URLS } from "@/services/url";
import { buildUrl } from "@/services/api";

// Types
export interface FileConversionConfig {
  input: {
    provider: string;
    format: string;
    path: string;
    options?: Record<string, any>;
    schema?: {
      fields: Array<{
        name: string;
        type: string;
        nullable: boolean;
      }>;
    };
  };
  output: {
    provider: string;
    format: string;
    path: string;
    mode: string;
    options?: Record<string, any>;
  };
  filter?: {
    operator: string;
    conditions: any[];
  };
  order_by?: Array<[string, string]>;
  aggregation?: {
    group_by: string[];
    aggregations: Array<[string, string]>;
  };
  spark_config?: {
    executor_instances: number;
    executor_cores: number;
    executor_memory: string;
    driver_memory: string;
    driver_cores: number;
  };
  dag_id?: string;
}

export interface FileConversionConfigResponse extends FileConversionConfig {
  id: number;
  client_id: number;
  created_at: string;
  updated_at: string;
}

// API: Create File Conversion Config
export async function createFileConversionConfig(
  clientId: number,
  config: FileConversionConfig
): Promise<FileConversionConfigResponse | null> {
  try {
    const response = await fetch(
      buildUrl(URLS.listCreateFileConversionConfigs(clientId)),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(errorData.detail || `Failed to create file conversion config: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating file conversion config:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to create file conversion config",
      variant: "destructive",
    });
    return null;
  }
}

// API: Update DAG
export async function updateDag(
  dagId: string,
  data: {
    name?: string;
    schedule?: string;
    dag_sequence?: Array<{
      id: string;
      type: string;
      config_id: number;
      next: string[];
    }>;
    active?: boolean;
  }
): Promise<any> {
  try {
    const response = await fetch(buildUrl(URLS.manageDAG(dagId)), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(errorData.detail || `Failed to update DAG: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating DAG:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to update DAG",
      variant: "destructive",
    });
    return null;
  }
}

// API: Trigger DAG Run
export async function triggerDagRun(dagId: string): Promise<any> {
  try {
    const response = await fetch(buildUrl(URLS.triggerrun(dagId)), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dag_id: dagId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(errorData.detail || `Failed to trigger DAG run: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error triggering DAG run:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to trigger DAG run",
      variant: "destructive",
    });
    return null;
  }
}

// API: Stop DAG Run
export async function stopDagRun(dagId: string): Promise<any> {
  try {
    const response = await fetch(buildUrl(URLS.forcestop(dagId)), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(errorData.detail || `Failed to stop DAG run: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error stopping DAG run:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to stop DAG run",
      variant: "destructive",
    });
    return null;
  }
}

// Helper: Make Python-safe ID
export function makePythonSafeId(id: string): string {
  let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_");
  if (!/^[a-zA-Z_]/.test(safeId)) {
    safeId = "task_" + safeId;
  }
  return safeId;
}

// Helper: Get JDBC Driver from provider
export function getDatabaseDriver(provider: string): string {
  const drivers: Record<string, string> = {
    postgresql: "org.postgresql.Driver",
    mysql: "com.mysql.cj.jdbc.Driver",
    sqlserver: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    oracle: "oracle.jdbc.driver.OracleDriver",
    local: "org.postgresql.Driver",
  };
  return drivers[provider] || drivers.local;
}

