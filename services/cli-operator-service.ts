
import { toast } from "@/components/ui/use-toast"
import type { WorkflowNode } from "@/components/workflow/workflow-context"
import { URLS } from "./url"
import { baseUrl } from "@/services/api"

// Updated CliOperatorConfig interface
export interface CliOperatorConfig {
  operation: string
  source_path: string
  destination_path?: string
  options?: {
    overwrite?: boolean
    includeSubDirectories?: boolean
    createNonExistingDirs?: boolean
    recursive?: boolean
    skipTrash?: boolean
    onlyIfExists?: boolean
    [key: string]: any
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

    const response = await fetch(baseUrl(URLS.listCreateCLIoperations(clientId)), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown API error" }))
      throw new Error(errorData.detail || `Failed to create CLI operator config: ${response.status}`)
    }

    const data = await response.json()
    console.log("CLI operator config created successfully:", data)
    return data
  } catch (error) {
    console.error("Error creating CLI operator config:", error)
    toast({
      title: "Config Creation Error",
      description: error instanceof Error ? error.message : "Failed to create CLI operator config",
      variant: "destructive",
    })
    return null
  }
}

/**
 * Updates a CLI operator configuration
 */
export async function updateCliOperatorConfig(
  clientId: number,
  configId: number,
  config: Partial<CliOperatorConfig>,
): Promise<CliOperatorConfigResponse | null> {
  try {
    console.log("Updating CLI operator config:", JSON.stringify(config, null, 2))

    const response = await fetch(baseUrl(`${URLS.listCreateCLIoperations(clientId)}/${configId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown API error" }))
      throw new Error(errorData.detail || `Failed to update CLI operator config: ${response.status}`)
    }

    const data = await response.json()
    console.log("CLI operator config updated successfully:", data)
    return data
  } catch (error) {
    console.error("Error updating CLI operator config:", error)
    toast({
      title: "Config Update Error",
      description: error instanceof Error ? error.message : "Failed to update CLI operator config",
      variant: "destructive",
    })
    return null
  }
}

// --- CLI Operator Mappers ---

/**
 * Maps copy file node properties to CLI operator configuration
 */
export function mapCopyFileToCliOperator(copyNode: WorkflowNode): CliOperatorConfig {
  if (!copyNode || !copyNode.data) {
    throw new Error("Invalid copy file node data")
  }
  const { source_path, destination_path, overwrite, includeSubDirectories, createNonExistingDirs } = copyNode.data

  if (!source_path) throw new Error("Copy file node is missing a source path.")
  if (!destination_path) throw new Error("Copy file node is missing a destination path.")
  return {
    operation: "copy",
    source_path,
    destination_path,
    options: {
      overwrite: overwrite || false,
      includeSubDirectories: includeSubDirectories || false,
      createNonExistingDirs: createNonExistingDirs || false,
    },
    executed_by: "workflow_user",
  }
}

/**
 * Maps move file node properties to CLI operator configuration
 */
export function mapMoveFileToCliOperator(moveNode: WorkflowNode): CliOperatorConfig {
  if (!moveNode || !moveNode.data) {
    throw new Error("Invalid move file node data")
  }

  const { source_path, destination_path, overwrite } = moveNode.data

  if (!source_path) {
    throw new Error("Move file node is missing a source path.")
  }
  if (!destination_path) {
    throw new Error("Move file node is missing a destination path.")
  }

  return {
    operation: "move",
    source_path: source_path,
    destination_path: destination_path,
    options: {
      overwrite: overwrite || false,
    },
    executed_by: "workflow_user",
  }
}

/**
 * Maps rename file node properties to CLI operator configuration
 */
export function mapRenameFileToCliOperator(renameNode: WorkflowNode): CliOperatorConfig {
  if (!renameNode || !renameNode.data) {
    throw new Error("Invalid rename file node data")
  }
  const { source_path, destination_path, overwrite } = renameNode.data

  if (!source_path) throw new Error("Rename file node is missing a source path.")
  if (!destination_path) throw new Error("Rename file node is missing a new name/path (destination_path).")

  return {
    operation: "rename",
    source_path,
    destination_path,
    options: {
      overwrite: overwrite || false,
    },
    executed_by: "workflow_user",
  }
}

/**
 * Maps delete file node properties to CLI operator configuration
 */
export function mapDeleteFileToCliOperator(deleteNode: WorkflowNode): CliOperatorConfig {
  if (!deleteNode || !deleteNode.data) {
    throw new Error("Invalid delete file node data")
  }
  const { source_path, recursive } = deleteNode.data

  if (!source_path) throw new Error("Delete file node is missing a source path (file to delete).")

  return {
    operation: "delete",
    source_path,
    options: {
      recursive: recursive || false,
    },
    executed_by: "workflow_user",
  }
}
