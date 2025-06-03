// //file-conversion-service.ts
// import { toast } from "@/components/ui/use-toast"
// import { URLS } from "@/services/url"
// import { buildUrl } from "@/services/api"
// export interface FileConversionConfig {
//   input: {
//     provider: string
//     format: string
//     path: string
//     options?: Record<string, any>
//     schema?: {
//       fields: Array<{
//         name: string
//         type: string
//         nullable: boolean
//       }>
//     }
//   }
//   output: {
//     provider: string
//     format: string
//     path: string
//     mode: string
//     options?: Record<string, any>
//   }
//   filter?: {
//     operator: string
//     conditions: any[]
//   }
//   order_by?: Array<[string, string]>
//   aggregation?: {
//     group_by: string[]
//     aggregations: Array<[string, string]>
//   }
//   spark_config?: {
//     executor_instances: number
//     executor_cores: number
//     executor_memory: string
//     driver_memory: string
//     driver_cores: number
//   }
//   dag_id?: string
// }

// export interface FileConversionConfigResponse extends FileConversionConfig {
//   id: number
//   client_id: number
//   created_at: string
//   updated_at: string
// }

// // Salesforce Configuration Types
// export interface SalesforceReadConfig {
//   object_name: string
//   query: string
//   fields?: string[]
//   where?: string
//   limit?: number
//   use_bulk_api: boolean
//   file_path: string
// }

// export interface SalesforceReadConfigResponse extends SalesforceReadConfig {
//   id: number
//   client_id: string
//   created_at: string
//   updated_at: string
// }

// export interface SalesforceReadConfigCreate {
//   object_name: string
//   query: string
//   fields?: string[]
//   where?: string
//   limit?: number
//   use_bulk_api: boolean
//   file_path: string
// }

// // API: Create File Conversion Config
// export async function createFileConversionConfig(
//   clientId: number,
//   config: FileConversionConfig,
// ): Promise<FileConversionConfigResponse | null> {
//   try {
//     const response = await fetch(buildUrl(URLS.listCreateFileConversionConfigs(clientId)), {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(config),
//     })

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
//       throw new Error(errorData.detail || `Failed to create file conversion config: ${response.status}`)
//     }

//     const data = await response.json()
//     return data
//   } catch (error) {
//     console.error("Error creating file conversion config:", error)
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to create file conversion config",
//       variant: "destructive",
//     })
//     return null
//   }
// }

// // API: Update DAG
// export async function updateDag(
//   dagId: string,
//   data: {
//     name?: string
//     schedule?: string
//     dag_sequence?: Array<{
//       id: string
//       type: string
//       config_id: number
//       next: string[]
//     }>
//     active?: boolean
//   },
// ): Promise<any> {
//   try {
//     const response = await fetch(buildUrl(URLS.manageDAG(dagId)), {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     })

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
//       throw new Error(errorData.detail || `Failed to update DAG: ${response.status}`)
//     }

//     return await response.json()
//   } catch (error) {
//     console.error("Error updating DAG:", error)
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to update DAG",
//       variant: "destructive",
//     })
//     return null
//   }
// }

// // API: Trigger DAG Run
// export async function triggerDagRun(dagId: string): Promise<any> {
//   try {
//     const response = await fetch(buildUrl(URLS.triggerrun(dagId)), {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ dag_id: dagId }),
//     })

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
//       throw new Error(errorData.detail || `Failed to trigger DAG run: ${response.status}`)
//     }

//     return await response.json()
//   } catch (error) {
//     console.error("Error triggering DAG run:", error)
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to trigger DAG run",
//       variant: "destructive",
//     })
//     return null
//   }
// }

// // API: Stop DAG Run
// export async function stopDagRun(dagId: string): Promise<any> {
//   try {
//     const response = await fetch(buildUrl(URLS.forcestop(dagId)), {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({}),
//     })

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
//       throw new Error(errorData.detail || `Failed to stop DAG run: ${response.status}`)
//     }

//     return await response.json()
//   } catch (error) {
//     console.error("Error stopping DAG run:", error)
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to stop DAG run",
//       variant: "destructive",
//     })
//     return null
//   }
// }

// // Helper: Make Python-safe ID
// export function makePythonSafeId(id: string): string {
//   let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_")
//   if (!/^[a-zA-Z_]/.test(safeId)) {
//     safeId = "task_" + safeId
//   }
//   return safeId
// }

// // Update DAG name and schedule specifically
// export async function updateDagNameAndSchedule(
//   dagId: string,
//   data: {
//     name?: string
//     schedule?: string
//   },
// ): Promise<any> {
//   try {
//     console.log("Updating DAG name and schedule:", JSON.stringify(data, null, 2))

//     const response = await fetch(buildUrl(URLS.manageDAG(dagId)), {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     })

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
//       throw new Error(errorData.detail || `Failed to update DAG: ${response.status}`)
//     }

//     const result = await response.json()
//     console.log("DAG updated successfully:", result)
//     return result
//   } catch (error) {
//     console.error("Error updating DAG:", error)
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to update DAG",
//       variant: "destructive",
//     })
//     return null
//   }
// }

// // Helper: Get JDBC Driver from provider
// export function getDatabaseDriver(provider: string): string {
//   const drivers: Record<string, string> = {
//     postgresql: "org.postgresql.Driver",
//     mysql: "com.mysql.cj.jdbc.Driver",
//     sqlserver: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
//     oracle: "oracle.jdbc.driver.OracleDriver",
//     local: "org.postgresql.Driver",
//   }
//   return drivers[provider] || drivers.local
// }

// // API: Create Salesforce Read Config
// export async function createSalesforceReadConfig(
//   clientId: string,
//   config: SalesforceReadConfigCreate,
// ): Promise<SalesforceReadConfigResponse | null> {
//   try {
//     const response = await fetch(buildUrl(`/clients/${clientId}/read_salesforce_configs/`), {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(config),
//     })

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
//       throw new Error(errorData.detail || `Failed to create Salesforce config: ${response.status}`)
//     }

//     const data = await response.json()
//     return data
//   } catch (error) {
//     console.error("Error creating Salesforce config:", error)
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to create Salesforce configuration",
//       variant: "destructive",
//     })
//     return null
//   }
// }

// // API: List Salesforce Read Configs
// export async function listSalesforceReadConfigs(clientId: string): Promise<SalesforceReadConfigResponse[]> {
//   try {
//     const response = await fetch(buildUrl(`/clients/${clientId}/read_salesforce_configs/`), {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     })

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
//       throw new Error(errorData.detail || `Failed to list Salesforce configs: ${response.status}`)
//     }

//     return await response.json()
//   } catch (error) {
//     console.error("Error listing Salesforce configs:", error)
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to list Salesforce configurations",
//       variant: "destructive",
//     })
//     return []
//   }
// }

// // API: Update Salesforce Read Config
// export async function updateSalesforceReadConfig(
//   clientId: string,
//   configId: number,
//   config: Partial<SalesforceReadConfigCreate>,
// ): Promise<SalesforceReadConfigResponse | null> {
//   try {
//     const response = await fetch(buildUrl(`/clients/${clientId}/read_salesforce_configs/${configId}`), {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(config),
//     })

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
//       throw new Error(errorData.detail || `Failed to update Salesforce config: ${response.status}`)
//     }

//     return await response.json()
//   } catch (error) {
//     console.error("Error updating Salesforce config:", error)
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to update Salesforce configuration",
//       variant: "destructive",
//     })
//     return null
//   }
// }

// // API: Delete Salesforce Read Config
// export async function deleteSalesforceReadConfig(clientId: string, configId: number): Promise<boolean> {
//   try {
//     const response = await fetch(buildUrl(`/clients/${clientId}/read_salesforce_configs/${configId}`), {
//       method: "DELETE",
//       headers: { "Content-Type": "application/json" },
//     })

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
//       throw new Error(errorData.detail || `Failed to delete Salesforce config: ${response.status}`)
//     }

//     return true
//   } catch (error) {
//     console.error("Error deleting Salesforce config:", error)
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to delete Salesforce configuration",
//       variant: "destructive",
//     })
//     return false
//   }
// }

//file-conversion-service.ts
import { toast } from "@/components/ui/use-toast"
import { URLS } from "@/services/url"
import { buildUrl } from "@/services/api"
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

// Salesforce Configuration Types
export interface SalesforceReadConfig {
  object_name: string
  query: string
  fields?: string[]
  where?: string
  limit?: number
  use_bulk_api: boolean
  file_path: string
}

export interface SalesforceReadConfigResponse extends SalesforceReadConfig {
  id: number
  client_id: string
  created_at: string
  updated_at: string
}

export interface SalesforceReadConfigCreate {
  object_name: string
  query: string
  fields?: string[]
  where?: string
  limit?: number
  use_bulk_api: boolean
  file_path: string
}

// API: Create File Conversion Config
export async function createFileConversionConfig(
  clientId: number,
  config: FileConversionConfig,
): Promise<FileConversionConfigResponse | null> {
  try {
    const response = await fetch(buildUrl(URLS.listCreateFileConversionConfigs(clientId)), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to create file conversion config: ${response.status}`)
    }

    const data = await response.json()
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

// API: Update File Conversion Config
export async function updateFileConversionConfig(
  clientId: number,
  configId: number,
  config: Partial<FileConversionConfig>,
): Promise<FileConversionConfigResponse | null> {
  try {
    const response = await fetch(buildUrl(`${URLS.listCreateFileConversionConfigs(clientId)}/${configId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to update file conversion config: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error updating file conversion config:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to update file conversion config",
      variant: "destructive",
    })
    return null
  }
}

// API: Update DAG
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
    const response = await fetch(buildUrl(URLS.manageDAG(dagId)), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to update DAG: ${response.status}`)
    }

    return await response.json()
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

// API: Trigger DAG Run
export async function triggerDagRun(dagId: string): Promise<any> {
  try {
    const response = await fetch(buildUrl(URLS.triggerrun(dagId)), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dag_id: dagId }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to trigger DAG run: ${response.status}`)
    }

    return await response.json()
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

// API: Stop DAG Run
export async function stopDagRun(dagId: string): Promise<any> {
  try {
    const response = await fetch(buildUrl(URLS.forcestop(dagId)), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to stop DAG run: ${response.status}`)
    }

    return await response.json()
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

// Helper: Make Python-safe ID
export function makePythonSafeId(id: string): string {
  let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_")
  if (!/^[a-zA-Z_]/.test(safeId)) {
    safeId = "task_" + safeId
  }
  return safeId
}

// Update DAG name and schedule specifically
export async function updateDagNameAndSchedule(
  dagId: string,
  data: {
    name?: string
    schedule?: string
  },
): Promise<any> {
  try {
    console.log("Updating DAG name and schedule:", JSON.stringify(data, null, 2))

    const response = await fetch(buildUrl(URLS.manageDAG(dagId)), {
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

// Helper: Get JDBC Driver from provider
export function getDatabaseDriver(provider: string): string {
  const drivers: Record<string, string> = {
    postgresql: "org.postgresql.Driver",
    mysql: "com.mysql.cj.jdbc.Driver",
    sqlserver: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    oracle: "oracle.jdbc.driver.OracleDriver",
    local: "org.postgresql.Driver",
  }
  return drivers[provider] || drivers.local
}

// API: Create Salesforce Read Config
export async function createSalesforceReadConfig(
  clientId: string,
  config: SalesforceReadConfigCreate,
): Promise<SalesforceReadConfigResponse | null> {
  try {
    const response = await fetch(buildUrl(`/clients/${clientId}/read_salesforce_configs/`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to create Salesforce config: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error creating Salesforce config:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to create Salesforce configuration",
      variant: "destructive",
    })
    return null
  }
}

// API: List Salesforce Read Configs
export async function listSalesforceReadConfigs(clientId: string): Promise<SalesforceReadConfigResponse[]> {
  try {
    const response = await fetch(buildUrl(`/clients/${clientId}/read_salesforce_configs/`), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to list Salesforce configs: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error listing Salesforce configs:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to list Salesforce configurations",
      variant: "destructive",
    })
    return []
  }
}

// API: Update Salesforce Read Config
export async function updateSalesforceReadConfig(
  clientId: string,
  configId: number,
  config: Partial<SalesforceReadConfigCreate>,
): Promise<SalesforceReadConfigResponse | null> {
  try {
    const response = await fetch(buildUrl(`/clients/${clientId}/read_salesforce_configs/${configId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to update Salesforce config: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating Salesforce config:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to update Salesforce configuration",
      variant: "destructive",
    })
    return null
  }
}

// API: Delete Salesforce Read Config
export async function deleteSalesforceReadConfig(clientId: string, configId: number): Promise<boolean> {
  try {
    const response = await fetch(buildUrl(`/clients/${clientId}/read_salesforce_configs/${configId}`), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to delete Salesforce config: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error("Error deleting Salesforce config:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to delete Salesforce configuration",
      variant: "destructive",
    })
    return false
  }
}
