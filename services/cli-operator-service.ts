// Service for handling CLI operator configurations
//services//cli-operator-service.ts
import { toast } from "@/components/ui/use-toast"

const baseUrl = process.env.NEXT_PUBLIC_USER_API_END_POINT

export interface CliOperatorConfig {
  operation: string
  source_path: string
  destination_path: string
  options: {
    overwrite: boolean
    includeSubDirectories?: boolean
    createNonExistingDirs?: boolean
    [key: string]: any // Allow for future additional options
  }
  executed_by: string
}

export interface CliOperatorConfigResponse extends CliOperatorConfig {
  id: number
  client_id: string
  created_at: string
  updated_at: string
}

/**
 * Creates a CLI operator configuration
 */
export async function createCliOperatorConfig(
  clientId: number,
  config: CliOperatorConfig,
): Promise<CliOperatorConfigResponse | null> {
  try {
    console.log("Creating CLI operator config:", JSON.stringify(config, null, 2))

    const response = await fetch(`${baseUrl}/clients/${clientId}/cli_operators_configs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to create CLI operator config: ${response.status}`)
    }

    const data = await response.json()
    console.log("CLI operator config created successfully:", data)
    return data
  } catch (error) {
    console.error("Error creating CLI operator config:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to create CLI operator config",
      variant: "destructive",
    })
    return null
  }
}
