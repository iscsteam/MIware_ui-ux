//schema-mapper.ts
// Schema mapper service to map node properties to file conversion payload
import type { WorkflowNode } from "@/components/workflow/workflow-context";
import type { CliOperatorConfig } from "./cli-operator-service"; // Adjust path

// Default spark config
export const DEFAULT_SPARK_CONFIG = {
  executor_instances: 1,
  executor_cores: 1,
  executor_memory: "512m",
  driver_memory: "512m",
  driver_cores: 1,
};

/**
 * Maps read file node properties to input configuration
 */
export function mapReadFileToInput(readNode: WorkflowNode) {
  if (!readNode || !readNode.data) {
    return null;
  }

  const input = {
    provider: readNode.data.provider || "local",
    format: readNode.data.format || "csv",
    path: readNode.data.path || "",
    options: readNode.data.options || {},
  };

  // Add schema if available
  if (readNode.data.schema) {
    return {
      ...input,
      schema: readNode.data.schema,
    };
  }

  return input;
}

/**
 * Maps write file node properties to output configuration
 */
export function mapWriteFileToOutput(writeNode: WorkflowNode) {
  if (!writeNode || !writeNode.data) {
    return null;
  }

  return {
    provider: writeNode.data.provider || "local",
    format: writeNode.data.format || "csv",
    path: writeNode.data.path || "",
    mode: writeNode.data.mode || "overwrite",
    options: writeNode.data.options || {},
  };
}

/**
 * Maps filter node properties to filter, order_by, and aggregation configurations
 */
export function mapFilterNodeToConfigs(filterNode: WorkflowNode) {
  if (!filterNode || !filterNode.data) {
    return {};
  }

  const result: any = {};

  // Add filter if available
  if (filterNode.data.filter) {
    result.filter = filterNode.data.filter;
  }

  // Add order_by if available
  if (filterNode.data.order_by) {
    result.order_by = filterNode.data.order_by;
  }

  // Add aggregation if available
  if (filterNode.data.aggregation) {
    result.aggregation = filterNode.data.aggregation;
  }

  return result;
}

/**
 * Creates a complete file conversion configuration from node properties
 */
export function createFileConversionConfigFromNodes(
  readNode: WorkflowNode,
  writeNode: WorkflowNode,
  filterNode: WorkflowNode | null,
  dagId: string
) {
  const input = mapReadFileToInput(readNode);
  const output = mapWriteFileToOutput(writeNode);
  const filterConfigs = filterNode ? mapFilterNodeToConfigs(filterNode) : {};

  if (!input || !output) {
    throw new Error("Invalid read or write node configuration");
  }

  return {
    input,
    output,
    ...filterConfigs,
    spark_config: DEFAULT_SPARK_CONFIG,
    dag_id: dagId,
  };
}


export function mapMoveFileToCliOperator(moveNode: WorkflowNode): CliOperatorConfig {
  if (!moveNode || !moveNode.data) {
    throw new Error("Invalid move file node data");
  }

  // Assuming moveNode.data contains source_path, destination_path, and optionally overwrite
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
      overwrite: overwrite || false, // Default to false if not provided
      // Add any other move-specific options your backend might support
    },
    executed_by: "workflow_user", // Or "cli_user" or a dynamic value
  };
}