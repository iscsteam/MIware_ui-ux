//salesforcewrite.ts
import { toast } from "@/components/ui/use-toast"
import { URLS } from "@/services/url"
import { baseUrl } from "@/services/api"

export interface SalesforceWriteConfig {
  object_name: string
  bulk_batch_size: number
  use_bulk_api: boolean
  file_path: string
  update_objects: boolean
}

export interface SalesforceWriteConfigResponse extends SalesforceWriteConfig {
  id: number
  client_id: string
  created_at: string
  updated_at: string
}

export interface SalesforceWriteConfigCreate {
  object_name: string
  fields?: string[]
  limit?: number
  use_bulk_api: boolean
  bulk_batch_size: number
  file_path: string
  update_objects: boolean
}

export async function createSalesforceWriteConfig(
  clientId: string,
  config: SalesforceWriteConfigCreate,
): Promise<SalesforceWriteConfigResponse | null> {
  try {
    const response = await fetch(baseUrl(URLS.listCreateSaleforceWriteConfigs(clientId)), {
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

export async function listSalesforceWriteConfigs(clientId: string): Promise<SalesforceWriteConfigResponse[]> {
  try {
    const response = await fetch(baseUrl(URLS.listCreateSaleforceWriteConfigs(clientId)), {
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

export async function updateSalesforceWriteConfig(
  clientId: string,
  configId: number,
  config: Partial<SalesforceWriteConfigCreate>,
): Promise<SalesforceWriteConfigResponse | null> {
  try {
    const response = await fetch(baseUrl(URLS.manageSaleforceWriteConfigs(clientId, configId)), {
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

export async function deleteSalesforceWriteConfig(clientId: string, configId: number): Promise<boolean> {
  try {
    const response = await fetch(baseUrl(URLS.manageSaleforceWriteConfigs(clientId, configId)), {
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
