//schema-mapper.ts
// Schema mapper service to map node properties to file conversion payload
import type { WorkflowNode } from "@/components/workflow/workflow-context"

// Default spark config
export const DEFAULT_SPARK_CONFIG = {
  executor_instances: 1,
  executor_cores: 1,
  executor_memory: "2g",
  driver_memory: "2g",
  driver_cores: 1,
}

/**
 * Maps read file node properties to input configuration
 */
export function mapReadFileToInput(readNode: WorkflowNode) {
  if (!readNode || !readNode.data) {
    return null
  }

  const input = {
    provider: readNode.data.provider || "local",
    format: readNode.data.format || "csv",
    path: readNode.data.path || "",
    options: readNode.data.options || {},
  }

  // Add schema if available
  if (readNode.data.schema) {
    return {
      ...input,
      schema: readNode.data.schema,
    }
  }

  return input
}

/**
 * Maps write file node properties to output configuration
 */
export function mapWriteFileToOutput(writeNode: WorkflowNode) {
  if (!writeNode || !writeNode.data) {
    return null
  }

  return {
    provider: writeNode.data.provider || "local",
    format: writeNode.data.format || "csv",
    path: writeNode.data.path || "",
    mode: writeNode.data.mode || "overwrite",
    options: writeNode.data.options || {},
  }
}

/**
 * Maps filter node properties to filter, order_by, and aggregation configurations
 */
export function mapFilterNodeToConfigs(filterNode: WorkflowNode) {
  if (!filterNode || !filterNode.data) {
    return {}
  }

  const result: any = {}

  // Add filter if available
  if (filterNode.data.filter) {
    result.filter = filterNode.data.filter
  }

  // Add order_by if available
  if (filterNode.data.order_by) {
    result.order_by = filterNode.data.order_by
  }

  // Add aggregation if available
  if (filterNode.data.aggregation) {
    result.aggregation = filterNode.data.aggregation
  }

  return result
}

/**
 * Creates a complete file conversion configuration from node properties
 */
export function createFileConversionConfigFromNodes(
  readNode: WorkflowNode,
  writeNode: WorkflowNode,
  filterNode: WorkflowNode | null,
  dagId: string,
) {
  const input = mapReadFileToInput(readNode)
  const output = mapWriteFileToOutput(writeNode)
  const filterConfigs = filterNode ? mapFilterNodeToConfigs(filterNode) : {}

  if (!input || !output) {
    throw new Error("Invalid read or write node configuration")
  }

  return {
    input,
    output,
    ...filterConfigs,
    spark_config: DEFAULT_SPARK_CONFIG,
    dag_id: dagId,
  }
}


/**
 * Maps copy file node properties to CLI operator configuration
 */
export function mapCopyFileToCliOperator(copyNode: any) {
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

/**
 * Maps rename file node properties to CLI operator configuration
 */
export function mapRenameFileToCliOperator(renameNode: any) {
  if (!renameNode || !renameNode.data) {
    throw new Error("Invalid rename file node")
  }

  return {
    operation: "rename",
    source_path: renameNode.data.source_path || "",
    destination_path: renameNode.data.destination_path || "",
    options: {
      overwrite: false, // Default value for rename operation
    },
    executed_by: "cli_user",
  }
}
