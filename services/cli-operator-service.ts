//cli-operator-service.ts
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
    mode?: "copy" | "append" | "new_file" | "compressed_copy"
    textContent?: string // Ensure textContent is explicitly defined
    content?: string // Keep both for compatibility
    addLineSeparator?: boolean
    compressionFormat?: string
    append?: boolean
    create_dirs?: boolean
    compress?: string
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

// Read File Request Interface
export interface ReadFileRequest {
  input_path: string
  limit?: number
  pretty?: boolean
}

// Read File Response Interface
export interface ReadFileResponse {
  content?: string
  file_path?: string
  file_type?: string
  record_count?: number
  success: boolean
  error_message?: string
  timestamp: string
  limit?: number
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

    // Log the textContent in the response for debugging
    if (data.options?.textContent) {
      console.log("✅ textContent found in response:", data.options.textContent.substring(0, 100) + "...")
    } else {
      console.warn("⚠️ textContent not found in response options")
    }

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

    // Log the textContent in the response for debugging
    if (data.options?.textContent) {
      console.log("✅ textContent found in update response:", data.options.textContent.substring(0, 100) + "...")
    } else {
      console.warn("⚠️ textContent not found in update response options")
    }

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

/**
 * Reads file content using CLI operator
 */
export async function readFileWithContent(clientId: number, request: ReadFileRequest): Promise<ReadFileResponse> {
  try {
    console.log("Reading file with content:", JSON.stringify(request, null, 2))

    const { input_path, limit = 50, pretty = false } = request

    // Build URL with query parameters
    const url = new URL(baseUrl(URLS.readFileWithContent(clientId)))
    url.searchParams.append("limit", limit.toString())
    url.searchParams.append("pretty", pretty.toString())

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input_path,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.text()

    // Helper function to detect file type
    const detectFileType = (path: string): string => {
      const extension = path.split(".").pop()?.toLowerCase()
      switch (extension) {
        case "json":
          return "json"
        case "xml":
          return "xml"
        case "csv":
          return "csv"
        default:
          return "text"
      }
    }

    // Helper function to count records
    const countRecords = (content: string): number => {
      const lines = content.split("\n").filter((line) => line.trim() !== "")
      return lines.length
    }

    const successResponse: ReadFileResponse = {
      content: result,
      file_path: input_path,
      file_type: detectFileType(input_path),
      record_count: countRecords(result),
      success: true,
      timestamp: new Date().toISOString(),
      limit: limit,
    }

    console.log("File read successfully")
    return successResponse
  } catch (error) {
    console.error("Error reading file:", error)

    const errorMessage = error instanceof Error ? error.message : "Failed to read file"

    toast({
      title: "File Read Error",
      description: errorMessage,
      variant: "destructive",
    })

    const errorResponse: ReadFileResponse = {
      success: false,
      error_message: errorMessage,
      timestamp: new Date().toISOString(),
    }

    return errorResponse
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

/**
 * Maps read file node properties to CLI operator configuration
 */
export function mapReadFileToCliOperator(readNode: WorkflowNode): CliOperatorConfig {
  if (!readNode || !readNode.data) {
    throw new Error("Invalid read file node data")
  }
  const { input_path, limit, pretty } = readNode.data

  if (!input_path) throw new Error("Read file node is missing an input path.")

  return {
    operation: "read",
    source_path: input_path,
    options: {
      limit: limit || 50,
      pretty: pretty || false,
    },
    executed_by: "workflow_user",
  }
}

/**
 * Maps write node properties to CLI operator configuration.
 * Supports basic copy, copy and append, append-only, write new file, and compressed file copy.
 * FIXED: Ensures textContent is properly included in CLI operator config options
 */
export function mapWriteNodeToCliOperator(writeNode: WorkflowNode): CliOperatorConfig {
  if (!writeNode || !writeNode.data) {
    throw new Error("Invalid write node data")
  }

  console.log("🔍 Mapping write node to CLI operator:", {
    nodeId: writeNode.id,
    nodeData: writeNode.data,
    options: writeNode.data.options,
  })

  const { source_path, destination_path, options } = writeNode.data

  if (!destination_path) {
    throw new Error("Write node is missing a destination path.")
  }

  // Extract textContent from all possible locations with priority order
  let textContent = ""

  // Priority 1: options.textContent (from the form)
  if (options?.textContent) {
    textContent = options.textContent
    console.log("📝 Found textContent in options.textContent:", textContent.substring(0, 100) + "...")
  }
  // Priority 2: direct data.textContent
  else if (writeNode.data.textContent) {
    textContent = writeNode.data.textContent
    console.log("📝 Found textContent in data.textContent:", textContent.substring(0, 100) + "...")
  }
  // Priority 3: data.content (fallback)
  else if (writeNode.data.content) {
    textContent = writeNode.data.content
    console.log("📝 Found textContent in data.content:", textContent.substring(0, 100) + "...")
  } else {
    console.warn("⚠️ No textContent found in any location")
  }

  // Build CLI operator config with explicit textContent in options
  const cliConfig: CliOperatorConfig = {
    operation: "write",
    source_path: source_path || "",
    destination_path,
    options: {
      // Core write-node options
      append: options?.append || false,
      textContent: textContent, // Explicitly include textContent
      addLineSeparator: options?.addLineSeparator || false,
      create_dirs: options?.create_dirs || false,
      compress: options?.compress || "none",

      // Additional compatibility fields
      content: textContent, // Also include as content for backward compatibility
      overwrite: writeNode.data.overwrite || false,
    },
    executed_by: "workflow_user",
  }

  console.log("✅ Created CLI config for write-node:", {
    operation: cliConfig.operation,
    destination_path: cliConfig.destination_path,
    hasTextContent: !!cliConfig.options?.textContent,
    textContentLength: cliConfig.options?.textContent?.length || 0,
    options: cliConfig.options,
  })

  return cliConfig
}
