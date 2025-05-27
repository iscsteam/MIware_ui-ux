// src/services/workflow-utils.ts (or your equivalent path)
import type {
  WorkflowNode,
  NodeConnection,
} from "@/components/workflow/workflow-context"; // Adjust path if necessary
import {
  createFileConversionConfig,
  updateDag,
  triggerDagRun,
} from "@/services/file-conversion-service";
// Removed: import { createFileConversionConfigFromNodes } from "@/services/schema-mapper"; // Was unused in the provided saveAndRunWorkflow
import {
  createCliOperatorConfig,
  mapCopyFileToCliOperator,
  mapMoveFileToCliOperator,
  mapRenameFileToCliOperator,
  mapDeleteFileToCliOperator,
} from "@/services/cli-operator-service";
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

// Helper function to get database driver based on provider
function getDatabaseDriver(provider?: string): string {
  const drivers: Record<string, string> = {
    postgresql: "org.postgresql.Driver",
    mysql: "com.mysql.cj.jdbc.Driver",
    sqlserver: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    oracle: "oracle.jdbc.driver.OracleDriver",
    sqlite: "org.sqlite.JDBC",
    local: "org.postgresql.Driver", // Assuming local defaults to PostgreSQL for Spark, or adjust to org.sqlite.JDBC if SQLite
  };
  return (
    drivers[provider?.toLowerCase() || "postgresql"] || "org.postgresql.Driver"
  );
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
        return false; // Changed from return to return false
      }

      const readFileNodes = nodes.filter((node) => node.type === "read-file");
      const writeFileNodes = nodes.filter((node) => node.type === "write-file");
      const databaseNodes = nodes.filter((node) => node.type === "database");
      const databaseSourceNodes = nodes.filter(
        (node) => node.type === "source" // Assuming 'source' type is for database sources
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
        const filterNode = filterNodes.length > 0 ? filterNodes[0] : null;
        if (!readNode.data.path || !writeNode.data.path) {
          toast({
            title: "Error",
            description: "File-to-File: Input/Output paths required.",
            variant: "destructive",
          });
          return false; // Changed
        }
        configPayload = {
          input: {
            provider: readNode.data.provider || "local",
            format: readNode.data.format || "csv",
            path: readNode.data.path,
            options: readNode.data.options || {},
            schema: readNode.data.schema,
          },
          output: {
            provider: writeNode.data.provider || "local",
            format: writeNode.data.format || "parquet",
            path: writeNode.data.path,
            mode: writeNode.data.writeMode || "overwrite",
            options: writeNode.data.options || {},
          },
          filter: filterNode
            ? {
                operator: filterNode.data.operator || "and",
                conditions: filterNode.data.conditions || [],
              }
            : undefined,
          dag_id: currentWorkflowId,
        };
      }
      // --- FILE-TO-DATABASE ---
      else if (readFileNodes.length > 0 && databaseNodes.length > 0) {
        console.log("Detected: File-to-Database");
        operationTypeForDag = "file_conversion";
        const readNode = readFileNodes[0];
        const databaseNode = databaseNodes[0];
        const filterNode = filterNodes.length > 0 ? filterNodes[0] : null;
        if (
          !readNode.data.path ||
          !databaseNode.data.connectionString ||
          !databaseNode.data.table // Changed from tableName to table
        ) {
          toast({
            title: "Error",
            description:
              "File-to-DB: File path, DB connection, and table required.",
            variant: "destructive",
          });
          return false; // Changed
        }
        configPayload = {
          input: {
            provider: readNode.data.provider || "local",
            format: readNode.data.format || "csv",
            path: readNode.data.path,
            options: readNode.data.options || {},
            schema: readNode.data.schema,
          },
          output: {
            provider:
              databaseNode.data.provider === "local"
                ? "local" // Assuming 'local' database provider means SQLite for output
                : databaseNode.data.provider,
            format: "sql",
            path: databaseNode.data.connectionString,
            mode: databaseNode.data.writeMode || "overwrite",
            options: {
              table: databaseNode.data.table, // Changed from tableName
              user: databaseNode.data.user || "", // Changed from username
              password: databaseNode.data.password || "",
              batchSize: databaseNode.data.batchSize || "5000",
              driver: getDatabaseDriver(databaseNode.data.provider),
            },
          },
          filter: filterNode
            ? {
                operator: filterNode.data.operator || "and",
                conditions: filterNode.data.conditions || [],
              }
            : undefined,
          dag_id: currentWorkflowId,
        };
      }
      // --- DATABASESOURCE-TO-FILE ---
      else if (databaseSourceNodes.length > 0 && writeFileNodes.length > 0) {
        console.log("Detected: DatabaseSource('source' node)-to-File");
        operationTypeForDag = "file_conversion";
        const dbSourceNode = databaseSourceNodes[0];
        const writeNode = writeFileNodes[0];
        const filterNode = filterNodes.length > 0 ? filterNodes[0] : null;

        if (
          !dbSourceNode.data.connectionString ||
          (!dbSourceNode.data.query && !dbSourceNode.data.table) || // Use 'table'
          !writeNode.data.path
        ) {
          toast({
            title: "Error",
            description:
              "DB-to-File: DB conn, (query or table name), and output path required.",
            variant: "destructive",
          });
          return false; // Changed
        }

        configPayload = {
          input: {
            provider: dbSourceNode.data.provider || "postgresql",
            format: "sql",
            path: dbSourceNode.data.connectionString,
            options: {
              // Query logic can be complex; if only table is provided, backend might construct query
              // Or, ensure 'query' is populated if that's the primary way to define input.
              query: dbSourceNode.data.query, // Prefer explicit query if available
              table: dbSourceNode.data.table, // Send table name as well
              user: dbSourceNode.data.user || "", // Changed from username
              password: dbSourceNode.data.password || "",
              driver: getDatabaseDriver(dbSourceNode.data.provider),
            },
            schema: dbSourceNode.data.schema,
          },
          output: {
            provider: writeNode.data.provider || "local",
            format: writeNode.data.format || "xml",
            path: writeNode.data.path,
            mode: writeNode.data.writeMode || "overwrite",
            options: writeNode.data.options || {
              rootTag: "TableData", // Example default for XML
              rowTag: "Row",
            },
          },
          filter: filterNode
            ? {
                operator: filterNode.data.operator || "and",
                conditions: filterNode.data.conditions || [],
              }
            : undefined,
          dag_id: currentWorkflowId,
        };
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
          return false; // Changed
        }
        configPayload = mapCopyFileToCliOperator(node); // map... functions should handle node.data
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
          return false; // Changed
        }
        configPayload = mapMoveFileToCliOperator(node);
      }
      // --- RENAME FILE ---
      else if (renameFileNodes.length > 0) {
        console.log("Detected: Rename-File");
        operationTypeForDag = "cli_operator";
        const node = renameFileNodes[0];
        // Ensure your mapRenameFileToCliOperator uses source_path for old and destination_path for new if that's the convention
        if (!node.data.source_path || !node.data.destination_path) {
          toast({
            title: "Error",
            description: "Rename: Old/New paths (source/destination) required.",
            variant: "destructive",
          });
          return false; // Changed
        }
        configPayload = mapRenameFileToCliOperator(node);
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
          return false; // Changed
        }
        configPayload = mapDeleteFileToCliOperator(node);
      }
      // --- NO MATCH ---
      else {
        console.log("No recognized workflow operation type found.");
        toast({
          title: "Error",
          description: "Unsupported workflow operation. Please connect appropriate source and target nodes (e.g., read-file to write-file, or a CLI operation node).",
          variant: "destructive",
        });
        return false; // Changed
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
        // Add dag_id to CLI operator payload if your backend expects it for association
        // configPayload.dag_id = currentWorkflowId; // Example if needed
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
        return false; // Changed
      }

      const taskNodeIdPrefix =
        operationTypeForDag === "file_conversion" ? "fc_node_" : "cli_op_node_";
      dagSequence = [
        {
          id: makePythonSafeId(startNodesList[0].id),
          type: "start",
          config_id: 1, // Default/placeholder config_id for start/end
          next: [`${taskNodeIdPrefix}${createdConfigId}`],
        },
        {
          id: `${taskNodeIdPrefix}${createdConfigId}`,
          type: operationTypeForDag,
          config_id: createdConfigId,
          next: [makePythonSafeId(endNodesList[0].id)],
        },
        {
          id: makePythonSafeId(endNodesList[0].id),
          type: "end",
          config_id: 1, // Default/placeholder config_id for start/end
          next: [],
        },
      ];

      console.log(
        "Updating DAG with sequence:",
        JSON.stringify(dagSequence, null, 2)
      );
      const dagUpdateData = { dag_sequence: dagSequence, active: true };
      const updatedDag = await updateDag(currentWorkflowId, dagUpdateData); // Pass workflowId (dag_id)
      if (!updatedDag) throw new Error("Failed to update DAG on backend.");

      try {
        console.log("Triggering DAG run for workflow:", currentWorkflowId);
        const triggerResult = await triggerDagRun(currentWorkflowId); // Pass workflowId (dag_id)
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
          variant: "default", // Or "warning" if you have one
        });
        // Do not return false here, as saving was successful
      }

      toast({
        title: "Success",
        description: "Workflow saved and run triggered.",
      });
      return true; // Indicate overall success

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
      return false; // Indicate failure
    }
}

// Keep the existing findWriteNodesInPath function unchanged if it's still needed elsewhere
// For this refactoring, it's not directly used by saveAndRunWorkflow
export function findWriteNodesInPath( // Added export if it's used by other modules
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