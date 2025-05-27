// Utility functions for workflow operations
import type {
  WorkflowNode,
  NodeConnection,
} from "@/components/workflow/workflow-context";
import {
  createFileConversionConfig,
  updateDag,
  triggerDagRun,
} from "@/services/file-conversion-service";
import { createFileConversionConfigFromNodes } from "@/services/schema-mapper"; // Assumed to handle read-file to write-file
import {
  createCliOperatorConfig,
  mapCopyFileToCliOperator,
  mapMoveFileToCliOperator,
  mapRenameFileToCliOperator,
  mapDeleteFileToCliOperator,
} from "@/services/cli-operator-service";
import { toast } from "@/components/ui/use-toast";
import { getCurrentClientId } from "@/components/workflow/workflow-context";

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
): Promise<boolean> {
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
        return;
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

      let dagSequence: any[] = [];
      let createdConfigId: number | null = null;
      let operationTypeForDag: "file_conversion" | "cli_operator" | null = null;
      let configPayload: any = null; // Generic payload for either type

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
          return;
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
          !databaseNode.data.table
        ) {
          toast({
            title: "Error",
            description:
              "File-to-DB: File path, DB connection, and table required.",
            variant: "destructive",
          });
          return;
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
                ? "sqlite"
                : databaseNode.data.provider,
            format: "sql",
            path: databaseNode.data.connectionString,
            mode: databaseNode.data.writeMode || "overwrite",
            options: {
              table: databaseNode.data.table,
              user: databaseNode.data.user || "",
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
        // << ENSURE THIS LINE IS CORRECT
        console.log("Detected: DatabaseSource('source' node)-to-File"); // << THIS LOG SHOULD APPEAR
        operationTypeForDag = "file_conversion";
        const dbSourceNode = databaseSourceNodes[0];
        const writeNode = writeFileNodes[0];
        const filterNode = filterNodes.length > 0 ? filterNodes[0] : null;

        // Validation using the correct field names from your node data
        if (
          !dbSourceNode.data.connectionString ||
          (!dbSourceNode.data.query && !dbSourceNode.data.table) || // Check 'tableName'
          !writeNode.data.path
        ) {
          toast({
            title: "Error",
            description:
              "DB-to-File: DB conn, (query or table name), and output path required.",
            variant: "destructive",
          });
          return; // Exit if validation fails
        }

        // Determine the actual database provider
        // const actualDbProvider =
        //   // dbSourceNode.data.databaseprovider ||
        //   dbSourceNode.data.provider || "postgresql";

        configPayload = {
          input: {
            provider: dbSourceNode.data.provider || "postgresql",
            format: "sql",
            path: dbSourceNode.data.connectionString,
            options: {
              // query:
              //   dbSourceNode.data.query ||
              //   (dbSourceNode.data.table
              //     ? `SELECT * FROM "${dbSourceNode.data.table}"`
              //     : undefined), // Use 'tableName'
              table: dbSourceNode.data.table,
              user: dbSourceNode.data.user || dbSourceNode.data.user || "", // Use 'username'
              password: dbSourceNode.data.password || "",

              driver: getDatabaseDriver(dbSourceNode.data.provider),
            },
            schema: dbSourceNode.data.schema,
          },
          output: {
            provider: writeNode.data.provider || "local",
            format: writeNode.data.format || "xml", // Assuming XML from your earlier payload example
            path: writeNode.data.path,
            mode: writeNode.data.writeMode || "overwrite",
            options: writeNode.data.options || {
              rootTag: "TableData",
              rowTag: "Row",
            }, // Default XML options
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
          return;
        }
        configPayload = mapCopyFileToCliOperator(node);
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
          return;
        }
        configPayload = mapMoveFileToCliOperator(node);
      }
      // --- RENAME FILE ---
      else if (renameFileNodes.length > 0) {
        console.log("Detected: Rename-File");
        operationTypeForDag = "cli_operator";
        const node = renameFileNodes[0];
        // Assuming rename also uses source_path for old and destination_path for new for consistency with mappers
        if (!node.data.source_path || !node.data.destination_path) {
          toast({
            title: "Error",
            description: "Rename: Old/New paths required.",
            variant: "destructive",
          });
          return;
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
          return;
        }
        configPayload = mapDeleteFileToCliOperator(node);
      }
      // --- NO MATCH ---
      else {
        console.log("No recognized workflow operation type found.");
        toast({
          title: "Error",
          description: "Unsupported workflow operation.",
          variant: "destructive",
        });
        return;
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
          description: "Config creation failed.",
          variant: "destructive",
        });
        return;
      }

      const taskNodeIdPrefix =
        operationTypeForDag === "file_conversion" ? "fc_node_" : "cli_op_node_";
      dagSequence = [
        {
          id: makePythonSafeId(startNodesList[0].id),
          type: "start",
          config_id: 1,
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
          config_id: 1,
          next: [],
        },
      ];

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
          description: "Workflow saved; run trigger failed. Run manually.",
          variant: "default",
        });
      }

      toast({
        title: "Success",
        description: "Workflow saved and run triggered.",
      });
    } catch (error) {
      console.error("Error in saveAndRunWorkflow:", error);
      toast({
        title: "Workflow Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save/run workflow.",
        variant: "destructive",
      });
    }
}

// Helper function to get database driver based on provider
function getDatabaseDriver(provider?: string): string {
  // Made provider optional for safety
  const drivers: Record<string, string> = {
    postgresql: "org.postgresql.Driver",
    mysql: "com.mysql.cj.jdbc.Driver",
    sqlserver: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    oracle: "oracle.jdbc.driver.OracleDriver",
    sqlite: "org.sqlite.JDBC", // SQLite driver (often used with 'local' or 'sqlite' provider)
    local: "org.postgresql.Driver", // Alias for SQLite
  };
  return (
    drivers[provider?.toLowerCase() || "postgresql"] || "org.postgresql.Driver"
  ); // Default to postgresql if not found
}

// Keep the existing findWriteNodesInPath function unchanged (if it's still needed elsewhere)
function findWriteNodesInPath(
  startNodeId: string,
  nodes: WorkflowNode[],
  connections: NodeConnection[],
  visited: Set<string> = new Set()
): WorkflowNode[] {
  // ... (implementation as provided) ...
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
