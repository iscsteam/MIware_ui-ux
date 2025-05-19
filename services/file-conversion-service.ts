// In services/file-conversion-service.ts
import { toast } from "@/components/ui/use-toast"; // Ensure this path is correct

const baseUrl = process.env.NEXT_PUBLIC_USER_API_END_POINT;

export interface FileConversionConfig {
  input: {
    provider: string;
    format: string;
    path: string;
    options?: Record<string, any>;
  };
  output: {
    provider: string;
    format: string;
    path: string;
    mode: string; // Make sure 'mode' is part of your WorkflowNodeData if used from there
    options?: Record<string, any>;
  };
  spark_config?: {
    executor_instances: number;
    executor_cores: number;
    executor_memory: string;
    driver_memory: string;
    driver_cores: number;
  };
  dag_id?: string; // This is good to have for association
}

export interface FileConversionConfigResponse extends FileConversionConfig {
  id: number; // This is the ID of the config itself
  client_id: number;
  created_at: string;
  updated_at: string;
}

export async function createFileConversionConfig(
  clientId: string | number, // Accepts dynamic clientId
  config: FileConversionConfig,
): Promise<FileConversionConfigResponse | null> {
  try {
    console.log(
      `Creating file conversion config for clientId: ${clientId}, config:`,
      JSON.stringify(config, null, 2),
    );

    if (!baseUrl) {
        console.error("API baseUrl is not configured.");
        toast({ title: "Configuration Error", description: "API endpoint is not set.", variant: "destructive" });
        return null;
    }

    // Use the dynamic clientId in the URL
    const response = await fetch(`${baseUrl}/clients/${clientId}/file_conversion_configs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      let errorDetail = `Failed to create file conversion config: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch (e) { /* ignore if response not json */ }
      throw new Error(errorDetail);
    }

    const data: FileConversionConfigResponse = await response.json();
    console.log("File conversion config created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error creating file conversion config:", error);
    toast({
      title: "Config Creation Error",
      description: error instanceof Error ? error.message : "Failed to create file conversion config",
      variant: "destructive",
    });
    return null;
  }
}

export async function updateDag(
  dagId: string, // Accepts dynamic dagId
  data: {
    name?: string;
    schedule?: string;
    dag_sequence?: Array<{
      id: string;
      type: string;
      config_id: number | null; // Allow null for config_id
      next: string[];
    }>;
    active?: boolean;
  },
): Promise<any | null> { // Return null on failure
  try {
    console.log(`Updating DAG: ${dagId} with data:`, JSON.stringify(data, null, 2));

    if (!baseUrl) {
        console.error("API baseUrl is not configured.");
        toast({ title: "Configuration Error", description: "API endpoint is not set.", variant: "destructive" });
        return null;
    }

    // Use the dynamic dagId in the URL
    const response = await fetch(`${baseUrl}/dags/${dagId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorDetail = `Failed to update DAG: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch (e) { /* ignore if response not json */ }
      throw new Error(errorDetail);
    }

    const result = await response.json();
    console.log("DAG updated successfully:", result);
    return result;
  } catch (error) {
    console.error("Error updating DAG:", error);
    toast({
      title: "DAG Update Error",
      description: error instanceof Error ? error.message : "Failed to update DAG",
      variant: "destructive",
    });
    return null;
  }
}

export async function triggerDagRun(dagId: string): Promise<any | null> { // Return null on failure
  try {
    console.log("Triggering DAG run for:", dagId);

    if (!baseUrl) {
        console.error("API baseUrl is not configured.");
        toast({ title: "Configuration Error", description: "API endpoint is not set.", variant: "destructive" });
        return null;
    }

    // Use the dynamic dagId in the URL
    // Ensure your backend endpoint for triggering is `/dag_runs/{dag_id}/trigger_run`
    // or `/dags/{dag_id}/dagRuns` or similar, and adjust the path accordingly.
    // The original `/dag_runs/dag_test_bdaa1681/trigger_run` implies the dag_id is part of the path.
    const response = await fetch(`${baseUrl}/dag_runs/${dagId}/trigger_run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // conf: {}, // Send an empty object or specific configuration if your backend expects it
      }),
    });

    if (!response.ok) {
      let errorDetail = `Failed to trigger DAG run: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch (e) { /* ignore if response not json */ }
      throw new Error(errorDetail);
    }

    const result = await response.json();
    console.log("DAG run triggered successfully:", result);
    return result;
  } catch (error) {
    console.error("Error triggering DAG run:", error);
    toast({
      title: "DAG Run Error",
      description: error instanceof Error ? error.message : "Failed to trigger DAG run",
      variant: "destructive",
    });
    return null;
  }
}


