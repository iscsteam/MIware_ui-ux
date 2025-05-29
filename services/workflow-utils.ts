// src/services/workflow-utils.ts
import type {
  WorkflowNode,
  NodeConnection,
} from "@/components/workflow/workflow-context"; // Adjust path if necessary
import {
  createFileConversionConfig,
  updateDag,
  triggerDagRun,
} from "@/services/file-conversion-service";
import {
  createCliOperatorConfig, // Only this one is kept from cli-operator-service directly
} from "@/services/cli-operator-service";

import {
  // --- CRITICAL: Import ALL mapping functions from schema-mapper.ts ---
  createFileToFileConfig,
  createFileToDatabaseConfig,
  createDatabaseToFileConfig,
  mapCopyFileToCliOperator,
  mapMoveFileToCliOperator,
  mapRenameFileToCliOperator,
  mapDeleteFileToCliOperator,
} from "@/services/schema-mapper";

import { toast } from "@/components/ui/use-toast"; // Assuming this path is correct for your project
import { getCurrentClientId } from "@/components/workflow/workflow-context"; // Adjust path if necessary


// Helper function to ensure Python-compatible IDs
function makePythonSafeId(id: string): string {
  let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_");
  if (!/^[a-zA-Z_]/.test(safeId)) {
    safeId = "task_" + safeId;
  }
  return safeId;
}

export async function saveAndRunWorkflow(
  nodes: WorkflowNode[],
  connections: NodeConnection[],
  currentWorkflowId: string | null
): Promise<boolean> { // Return boolean to indicate pre-check failures
  const dynamicClientIdString = getCurrentClientId();
  if (!dynamicClientIdString) {
    toast({
      title: "Error",
      description:
        "No client ID found. Please create or select a client first.",
      variant: "destructive",
    });
    return false;
  }

  const clientId = Number.parseInt(dynamicClientIdString, 10);
  if (isNaN(clientId)) {
    toast({
      title: "Error",
      description: "Invalid client ID format.",
      variant: "destructive",
    });
    return false;
  }

  if (!currentWorkflowId) {
    toast({
      title: "Error",
      description: "No workflow ID found. Please create a workflow first.",
      variant: "destructive",
    });
    return false;
  }

  if (nodes.length === 0) {
    toast({
      title: "Error",
      description: "Cannot save an empty workflow. Please add nodes first.",
      variant: "destructive",
    });
    return false;
  }

    try {
      const startNodesList = nodes.filter((node) => node.type === "start");
      const endNodesList = nodes.filter((node) => node.type === "end");
      if (startNodesList.length === 0 || endNodesList.length === 0) {
        toast({
          title: "Error",
          description: "Workflow needs start and end nodes.",
          variant: "destructive",
        });
        return false;
      }

      const readFileNodes = nodes.filter((node) => node.type === "read-file");
      const writeFileNodes = nodes.filter((node) => node.type === "write-file");
      const databaseNodes = nodes.filter((node) => node.type === "database");
      const databaseSourceNodes = nodes.filter(
        (node) => node.type === "source"
      );
      const copyFileNodes = nodes.filter((node) => node.type === "copy-file");
      const moveFileNodes = nodes.filter((node) => node.type === "move-file");
      const renameFileNodes = nodes.filter(
        (node) => node.type === "rename-file"
      );
      const deleteFileNodes = nodes.filter(
        (node) => node.type === "delete-file"
      );
      const filterNodes = nodes.filter((node) => node.type === "filter");

      // --- CRUCIAL DEBUG LOG ---
      // This debug log will show you the filter node's data as it is stored in your frontend state
      const filterNodeForConversion = filterNodes.length > 0 ? filterNodes[0] : null;
      if (filterNodeForConversion) {
          console.log("DEBUG(workflow-utils): Filter node data *before mapper call*:", JSON.stringify(filterNodeForConversion.data, null, 2));
      } else {
          console.log("DEBUG(workflow-utils): No filter node detected in the workflow.");
      }
      // --- END CRUCIAL DEBUG LOG ---

      let dagSequence: any[] = [];
      let createdConfigId: number | null = null;
      let operationTypeForDag: "file_conversion" | "cli_operator" | null = null;
      let configPayload: any = null;

      // --- FILE-TO-FILE ---
      if (readFileNodes.length > 0 && writeFileNodes.length > 0) {
        console.log("Detected: File-to-File");
        operationTypeForDag = "file_conversion";
        const readNode = readFileNodes[0];
        const writeNode = writeFileNodes[0];
        if (!readNode.data.path || !writeNode.data.path) {
          toast({
            title: "Error",
            description: "File-to-File: Input/Output paths required.",
            variant: "destructive",
          });
          return false;
        }
        // --- USE MAPPING FUNCTION FROM SCHEMA-MAPPER.TS ---
        configPayload = createFileToFileConfig(readNode, writeNode, filterNodeForConversion, currentWorkflowId);
      }
      // --- FILE-TO-DATABASE ---
      else if (readFileNodes.length > 0 && databaseNodes.length > 0) {
        console.log("Detected: File-to-Database");
        operationTypeForDag = "file_conversion";
        const readNode = readFileNodes[0];
        const databaseNode = databaseNodes[0];
        if (
          !readNode.data.path ||
          !databaseNode.data.connectionString ||
          !databaseNode.data.table
        ) {
          toast({
            title: "Error",
            description:
              "File-to-DB: File path, DB connection, and table required.",
            variant: "destructive",
          });
          return false;
        }
        // --- USE MAPPING FUNCTION FROM SCHEMA-MAPPER.TS ---
        configPayload = createFileToDatabaseConfig(readNode, databaseNode, filterNodeForConversion, currentWorkflowId);
      }
      // --- DATABASESOURCE-TO-FILE ---
      else if (databaseSourceNodes.length > 0 && writeFileNodes.length > 0) {
        console.log("Detected: DatabaseSource('source' node)-to-File");
        operationTypeForDag = "file_conversion";
        const dbSourceNode = databaseSourceNodes[0];
        const writeNode = writeFileNodes[0];

        if (
          !dbSourceNode.data.connectionString ||
          (!dbSourceNode.data.query && !dbSourceNode.data.table) ||
          !writeNode.data.path
        ) {
          toast({
            title: "Error",
            description:
              "DB-to-File: DB conn, (query or table name), and output path required.",
            variant: "destructive",
          });
          return false;
        }
        // --- USE MAPPING FUNCTION FROM SCHEMA-MAPPER.TS ---
        configPayload = createDatabaseToFileConfig(dbSourceNode, writeNode, filterNodeForConversion, currentWorkflowId);
      }
      // --- COPY FILE ---
      else if (copyFileNodes.length > 0) {
        console.log("Detected: Copy-File");
        operationTypeForDag = "cli_operator";
        const node = copyFileNodes[0];
        if (!node.data.source_path || !node.data.destination_path) {
          toast({
            title: "Error",
            description: "Copy: Source/Destination paths required.",
            variant: "destructive",
          });
          return false;
        }
        // --- USE MAPPING FUNCTION FROM SCHEMA-MAPPER.TS ---
        configPayload = mapCopyFileToCliOperator(node, currentWorkflowId);
      }
      // --- MOVE FILE ---
      else if (moveFileNodes.length > 0) {
        console.log("Detected: Move-File");
        operationTypeForDag = "cli_operator";
        const node = moveFileNodes[0];
        if (!node.data.source_path || !node.data.destination_path) {
          toast({
            title: "Error",
            description: "Move: Source/Destination paths required.",
            variant: "destructive",
          });
          return false;
        }
        // --- USE MAPPING FUNCTION FROM SCHEMA-MAPPER.TS ---
        configPayload = mapMoveFileToCliOperator(node, currentWorkflowId);
      }
      // --- RENAME FILE ---
      else if (renameFileNodes.length > 0) {
        console.log("Detected: Rename-File");
        operationTypeForDag = "cli_operator";
        const node = renameFileNodes[0];
        if (!node.data.source_path || !node.data.destination_path) {
          toast({
            title: "Error",
            description: "Rename: Old/New paths (source/destination) required.",
            variant: "destructive",
          });
          return false;
        }
        // --- USE MAPPING FUNCTION FROM SCHEMA-MAPPER.TS ---
        configPayload = mapRenameFileToCliOperator(node, currentWorkflowId);
      }
      // --- DELETE FILE ---
      else if (deleteFileNodes.length > 0) {
        console.log("Detected: Delete-File");
        operationTypeForDag = "cli_operator";
        const node = deleteFileNodes[0];
        if (!node.data.source_path) {
          toast({
            title: "Error",
            description: "Delete: Source path required.",
            variant: "destructive",
          });
          return false;
        }
        // --- USE MAPPING FUNCTION FROM SCHEMA-MAPPER.TS ---
        configPayload = mapDeleteFileToCliOperator(node, currentWorkflowId);
      }
      // --- NO MATCH ---
      else {
        console.log("No recognized workflow operation type found.");
        toast({
          title: "Error",
          description: "Unsupported workflow operation. Please connect appropriate source and target nodes (e.g., read-file to write-file, or a CLI operation node).",
          variant: "destructive",
        });
        return false;
      }

      // Create configuration
      if (operationTypeForDag === "file_conversion") {
        console.log(
          "Creating file_conversion config with:",
          JSON.stringify(configPayload, null, 2)
        );
        const response = await createFileConversionConfig(
          clientId,
          configPayload
        );
        if (!response?.id)
          throw new Error(
            "Failed to create file conversion config or ID missing."
          );
        createdConfigId = response.id;
      } else if (operationTypeForDag === "cli_operator") {
        console.log(
          `Creating CLI operator config (${configPayload.operation}) with:`,
          JSON.stringify(configPayload, null, 2)
        );
        const response = await createCliOperatorConfig(clientId, configPayload);
        if (!response?.id)
          throw new Error(
            `Failed to create CLI op config for ${configPayload.operation} or ID missing.`
          );
        createdConfigId = response.id;
      }

      if (createdConfigId === null || !operationTypeForDag) {
        toast({
          title: "Error",
          description: "Config creation failed or operation type missing.",
          variant: "destructive",
        });
        return false;
      }

      // --- CRITICAL: Build DAG Sequence for single file_conversion_task ---
      dagSequence = [];
      const startNodeId = makePythonSafeId(startNodesList[0].id);
      const endNodeId = makePythonSafeId(endNodesList[0].id);
      const mainTaskId = `${operationTypeForDag}_${createdConfigId}`; // e.g., 'file_conversion_294'

      dagSequence.push({
        id: startNodeId,
        type: "start",
        config_id: 1, // Placeholder
        next: [mainTaskId],
      });

      dagSequence.push({
        id: mainTaskId,
        type: operationTypeForDag, // e.g., 'file_conversion' or 'cli_operator'
        config_id: createdConfigId, // The ID of the created configuration
        next: [endNodeId],
      });

      dagSequence.push({
        id: endNodeId,
        type: "end",
        config_id: 1, // Placeholder
        next: [],
      });
      // --- END CRITICAL CHANGE ---

      console.log(
        "Updating DAG with sequence:",
        JSON.stringify(dagSequence, null, 2)
      );
      const dagUpdateData = { dag_sequence: dagSequence, active: true };
      const updatedDag = await updateDag(currentWorkflowId, dagUpdateData);
      if (!updatedDag) throw new Error("Failed to update DAG on backend.");

      try {
        console.log("Triggering DAG run for workflow:", currentWorkflowId);
        const triggerResult = await triggerDagRun(currentWorkflowId);
        if (!triggerResult)
          console.warn(
            "DAG run trigger returned non-truthy value, but workflow saved."
          );
      } catch (triggerError) {
        console.error(
          "Error triggering DAG run (workflow saved):",
          triggerError
        );
        toast({
          title: "Partial Success",
          description: "Workflow saved; run trigger failed. You may need to run it manually.",
          variant: "default",
        });
      }

      toast({
        title: "Success",
        description: "Workflow saved and run triggered.",
      });
      return true;

    } catch (error) {
      console.error("Error in saveAndRunWorkflow:", error);
      toast({
        title: "Workflow Operation Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while saving or running the workflow.",
        variant: "destructive",
      });
      return false;
    }
}

// Keep the existing findWriteNodesInPath function unchanged if it's still needed elsewhere
export function findWriteNodesInPath(
  startNodeId: string,
  nodes: WorkflowNode[],
  connections: NodeConnection[],
  visited: Set<string> = new Set()
): WorkflowNode[] {
  if (visited.has(startNodeId)) {
    return [];
  }
  visited.add(startNodeId);
  const writeNodes: WorkflowNode[] = [];

  const node = nodes.find((n) => n.id === startNodeId);
  if (node?.type === "write-file") {
    writeNodes.push(node);
  }

  for (const conn of connections) {
    if (conn.sourceId === startNodeId) {
      const nodesInPath = findWriteNodesInPath(
        conn.targetId,
        nodes,
        connections,
        visited
      );
      writeNodes.push(...nodesInPath);
    }
  }
  return writeNodes;
}