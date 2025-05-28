
// Service for handling CLI operator configurations
import { toast } from "@/components/ui/use-toast";
import type { WorkflowNode } from "@/components/workflow/workflow-context"; // Import WorkflowNode type
import { buildUrl } from "./api"; // Assuming this handles base URLs etc.
import { URLS } from "./url"; // Assuming this contains endpoint constants

// const buildUrl = process.env.NEXT_PUBLIC_USER_API_END_POINT;

// Updated CliOperatorConfig interface
export interface CliOperatorConfig {
  operation: string;
  source_path: string;
  destination_path?: string; // Optional: not used by 'delete'
  options?: {
    overwrite?: boolean;
    // Copy specific
    includeSubDirectories?: boolean;
    createNonExistingDirs?: boolean;
    // Delete specific
    recursive?: boolean;
    skipTrash?: boolean;
    onlyIfExists?: boolean;
    // Allow for future additional options
    [key: string]: any;
  };
  executed_by: string;
}

export interface CliOperatorConfigResponse extends CliOperatorConfig {
  id: number;
  client_id: string; // Or number, depending on your API
  created_at: string;
  updated_at: string;
}

/**
 * Creates a CLI operator configuration
 */
export async function createCliOperatorConfig(
  clientId: number,
  config: CliOperatorConfig,
): Promise<CliOperatorConfigResponse | null> {
  try {
    console.log("Creating CLI operator config:", JSON.stringify(config, null, 2));

    const response = await fetch(`${buildUrl}/clients/${clientId}/cli_operators_configs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown API error" }));
      throw new Error(errorData.detail || `Failed to create CLI operator config: ${response.status}`);
    }

    const data = await response.json();
    console.log("CLI operator config created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error creating CLI operator config:", error);
    toast({
      title: "Config Creation Error",
      description: error instanceof Error ? error.message : "Failed to create CLI operator config",
      variant: "destructive",
    });
    return null;
  }
}

// --- CLI Operator Mappers ---

/**
 * Maps copy file node properties to CLI operator configuration
 */
export function mapCopyFileToCliOperator(copyNode: WorkflowNode): CliOperatorConfig { // Use WorkflowNode type
  if (!copyNode || !copyNode.data) {
    throw new Error("Invalid copy file node data");
  }
  const { source_path, destination_path, overwrite, includeSubDirectories, createNonExistingDirs } = copyNode.data;

  if (!source_path) throw new Error("Copy file node is missing a source path.");
  if (!destination_path) throw new Error("Copy file node is missing a destination path.");
  return {
    operation: "copy",
    source_path,
    destination_path,
    options: {
      overwrite: overwrite || false,
      includeSubDirectories: includeSubDirectories || false,
      createNonExistingDirs: createNonExistingDirs || false,
    },
    executed_by: "workflow_user", // Using workflow_user for consistency
  };
}

/**
 * Maps move file node properties to CLI operator configuration
 * CORRECTED VERSION
 */
export function mapMoveFileToCliOperator(moveNode: WorkflowNode): CliOperatorConfig { // Use WorkflowNode type and correct parameter name
  if (!moveNode || !moveNode.data) {
    throw new Error("Invalid move file node data"); // Corrected error message
  }

  const { source_path, destination_path, overwrite } = moveNode.data;

  if (!source_path) {
    throw new Error("Move file node is missing a source path.");
  }
  if (!destination_path) {
    throw new Error("Move file node is missing a destination path.");
  }

  return {
    operation: "move",
    source_path: source_path,
    destination_path: destination_path,
    options: {
      overwrite: overwrite || false, // Only 'overwrite' is typically relevant for move
    },
    executed_by: "workflow_user", // Using workflow_user for consistency
  };
}

/**
 * Maps rename file node properties to CLI operator configuration
 */
export function mapRenameFileToCliOperator(renameNode: WorkflowNode): CliOperatorConfig {
  if (!renameNode || !renameNode.data) {
    throw new Error("Invalid rename file node data");
  }
  const { source_path, destination_path, overwrite } = renameNode.data; // destination_path is the new name

  if (!source_path) throw new Error("Rename file node is missing a source path.");
  if (!destination_path) throw new Error("Rename file node is missing a new name/path (destination_path).");

  return {
    operation: "rename", // Your backend might expect "move" if rename is a special case of move
    source_path,
    destination_path, // The new name or full path
    options: {
      overwrite: overwrite || false,
    },
    executed_by: "workflow_user",
  };
}

/**
 * Maps delete file node properties to CLI operator configuration
 */
export function mapDeleteFileToCliOperator(deleteNode: WorkflowNode): CliOperatorConfig {
  if (!deleteNode || !deleteNode.data) {
    throw new Error("Invalid delete file node data");
  }
  // Ensure these property names match what's in your deleteFileNode's `data` object
  // (e.g., from its schema: recursive, skipTrash, onlyIfExists)
  const { source_path, recursive } = deleteNode.data;

  if (!source_path) throw new Error("Delete file node is missing a source path (file to delete).");

  return {
    operation: "delete",
    source_path,
    // destination_path is not used for delete operation
    options: {
      recursive: recursive || false,
      // skipTrash: skipTrash || false,
      // onlyIfExists: onlyIfExists || false, // If true, no error if file doesn't exist
    },
    executed_by: "workflow_user",
  };
}