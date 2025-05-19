// Service for handling CLI operator configurations
import { toast } from "@/components/ui/use-toast"

const baseUrl = process.env.NEXT_PUBLIC_USER_API_END_POINT

export interface CliOperatorConfig {
  operation: string
  source_path: string
  destination_path: string
  options: {
    overwrite: boolean
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

/**
 * Maps copy file node properties to CLI operator configuration
 */
export function mapCopyFileToCliOperator(copyNode: any): CliOperatorConfig {
  if (!copyNode || !copyNode.data) {
    throw new Error("Invalid copy file node")
  }

  return {
    operation: "copy",
    source_path: copyNode.data.source_path || "",
    destination_path: copyNode.data.destination_path || "",
    options: {
      overwrite: copyNode.data.overwrite || false,
      includeSubDirectories: copyNode.data.includeSubDirectories || false,
      createNonExistingDirs: copyNode.data.createNonExistingDirs || false,
    },
    executed_by: "cli_user",
  }
}
