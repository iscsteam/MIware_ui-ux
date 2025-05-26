//file-conversion-service.ts
import { toast } from "@/components/ui/use-toast"

const baseUrl = process.env.NEXT_PUBLIC_USER_API_END_POINT

export interface FileConversionConfig {
  input: {
    provider: string
    format: string
    path: string
    options?: Record<string, any>
    schema?: {
      fields: Array<{
        name: string
        type: string
        nullable: boolean
      }>
    }
  }
  output: {
    provider: string
    format: string
    path: string
    mode: string
    options?: Record<string, any>
  }
  filter?: {
    operator: string
    conditions: any[]
  }
  order_by?: Array<[string, string]>
  aggregation?: {
    group_by: string[]
    aggregations: Array<[string, string]>
  }
  spark_config?: {
    executor_instances: number
    executor_cores: number
    executor_memory: string
    driver_memory: string
    driver_cores: number
  }
  dag_id?: string
}

export interface FileConversionConfigResponse extends FileConversionConfig {
  id: number
  client_id: number
  created_at: string
  updated_at: string
}

export async function createFileConversionConfig(
  clientId: number,
  config: FileConversionConfig,
): Promise<FileConversionConfigResponse | null> {
  try {
    console.log("Creating file conversion config:", JSON.stringify(config, null, 2))

    // Use the correct endpoint
    const response = await fetch(`${baseUrl}/clients/${clientId}/file_conversion_configs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to create file conversion config: ${response.status}`)
    }

    const data = await response.json()
    console.log("File conversion config created successfully:", data)
    return data
  } catch (error) {
    console.error("Error creating file conversion config:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to create file conversion config",
      variant: "destructive",
    })
    return null
  }
}

export async function updateDag(
  dagId: string,
  data: {
    name?: string
    schedule?: string
    dag_sequence?: Array<{
      id: string
      type: string
      config_id: number
      next: string[]
    }>
    active?: boolean
  },
): Promise<any> {
  try {
    console.log("Updating DAG:", JSON.stringify(data, null, 2))

    // Use the dynamic dagId instead of hardcoded value
    const response = await fetch(`${baseUrl}/dags/${dagId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to update DAG: ${response.status}`)
    }

    const result = await response.json()
    console.log("DAG updated successfully:", result)
    return result
  } catch (error) {
    console.error("Error updating DAG:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to update DAG",
      variant: "destructive",
    })
    return null
  }
}

export async function triggerDagRun(dagId: string): Promise<any> {
  try {
    console.log("Triggering DAG run for:", dagId)

    // Use the dynamic dagId instead of hardcoded value
    const response = await fetch(`${baseUrl}/dag_runs/${dagId}/trigger_run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to trigger DAG run: ${response.status}`)
    }

    const result = await response.json()
    console.log("DAG run triggered successfully:", result)
    return result
  } catch (error) {
    console.error("Error triggering DAG run:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to trigger DAG run",
      variant: "destructive",
    })
    return null
  }
}

// Add a new function to stop a running DAG after the triggerDagRun function

export async function stopDagRun(dagId: string): Promise<any> {
  try {
    console.log("Stopping DAG run for:", dagId)

    // Use the force_stop_active_run endpoint
    const response = await fetch(`${baseUrl}/dag_runs/${dagId}/force_stop_active_run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to stop DAG run: ${response.status}`)
    }

    const result = await response.json()
    console.log("DAG run stopped successfully:", result)
    return result
  } catch (error) {
    console.error("Error stopping DAG run:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to stop DAG run",
      variant: "destructive",
    })
    return null
  }
}


// Helper function to ensure Python-compatible IDs
export function makePythonSafeId(id: string): string {
  // Remove any non-alphanumeric characters and replace with underscores
  let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_")

  // Ensure it starts with a letter or underscore (Python variable naming rule)
  if (!/^[a-zA-Z_]/.test(safeId)) {
    safeId = "task_" + safeId
  }

  return safeId
}



export async function getDatabaseDriver(provider: string): string {
  const drivers: Record<string, string> = {
    postgresql: "org.postgresql.Driver",
    mysql: "com.mysql.cj.jdbc.Driver",
    sqlserver: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    oracle: "oracle.jdbc.driver.OracleDriver",
    local: "org.sqlite.JDBC",
  }
  return drivers[provider] || drivers.local
}
