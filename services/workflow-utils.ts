// // // src/services/workflow-utils.ts
// import type {
//   WorkflowNode,
//   NodeConnection,
// } from "@/components/workflow/workflow-context";
// import { createSalesforceReadConfig } from "@/services/saleforce/saleforceread";
// import {
//   createFileConversionConfig,
//   updateDag,
//   triggerDagRun,
// } from "@/services/file-conversion-service";
// import { createCliOperatorConfig } from "@/services/cli-operator-service";

// import {
//   createFileToFileConfig,
//   createFileToDatabaseConfig,
//   createDatabaseToFileConfig,
//   mapCopyFileToCliOperator,
//   mapMoveFileToCliOperator,
//   mapRenameFileToCliOperator,
//   mapDeleteFileToCliOperator,
// } from "@/services/schema-mapper";

// import { toast } from "@/components/ui/use-toast";
// import { getCurrentClientId } from "@/components/workflow/workflow-context";

// // Helper function to ensure Python-compatible IDs
// function makePythonSafeId(id: string): string {
//   let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_");
//   if (!/^[a-zA-Z_]/.test(safeId)) {
//     safeId = "task_" + safeId;
//   }
//   return safeId;
// }

// export async function saveAndRunWorkflow(
//   nodes: WorkflowNode[],
//   connections: NodeConnection[],
//   currentWorkflowId: string | null
// ): Promise<boolean> {
//   const dynamicClientIdString = getCurrentClientId();
//   if (!dynamicClientIdString) {
//     toast({
//       title: "Error",
//       description:
//         "No client ID found. Please create or select a client first.",
//       variant: "destructive",
//     });
//     return false;
//   }

//   const clientId = Number.parseInt(dynamicClientIdString, 10);
//   if (isNaN(clientId)) {
//     toast({
//       title: "Error",
//       description: "Invalid client ID format.",
//       variant: "destructive",
//     });
//     return false;
//   }

//   if (!currentWorkflowId) {
//     toast({
//       title: "Error",
//       description: "No workflow ID found. Please create a workflow first.",
//       variant: "destructive",
//     });
//     return false;
//   }

//   if (nodes.length === 0) {
//     toast({
//       title: "Error",
//       description: "Cannot save an empty workflow. Please add nodes first.",
//       variant: "destructive",
//     });
//     return false;
//   }

//   try {
//     const startNodesList = nodes.filter((node) => node.type === "start");
//     const endNodesList = nodes.filter((node) => node.type === "end");
//     if (startNodesList.length === 0 || endNodesList.length === 0) {
//       toast({
//         title: "Error",
//         description: "Workflow needs start and end nodes.",
//         variant: "destructive",
//       });
//       return false;
//     }

//     const readFileNodes = nodes.filter((node) => node.type === "read-file");
//     const writeFileNodes = nodes.filter((node) => node.type === "write-file");
//     const databaseNodes = nodes.filter((node) => node.type === "database");
//     const databaseSourceNodes = nodes.filter((node) => node.type === "source");
//     const copyFileNodes = nodes.filter((node) => node.type === "copy-file");
//     const moveFileNodes = nodes.filter((node) => node.type === "move-file");
//     const renameFileNodes = nodes.filter((node) => node.type === "rename-file");
//     const deleteFileNodes = nodes.filter((node) => node.type === "delete-file");
//     const filterNodes = nodes.filter((node) => node.type === "filter");
//     const salesforceNodes = nodes.filter(
//       (node) => node.type === "salesforce-cloud"
//     );

//     const filterNodeForConversion =
//       filterNodes.length > 0 ? filterNodes[0] : null;
//     if (filterNodeForConversion) {
//       console.log(
//         "DEBUG(workflow-utils): Filter node data *before mapper call*:",
//         JSON.stringify(filterNodeForConversion.data, null, 2)
//       );
//     }

//     let dagSequence: any[] = [];
//     let createdConfigId: number | null = null;
//     let operationTypeForDag:
//       | "file_conversion"
//       | "cli_operator"
//       | "read_salesforce"
//       | null = null;
//     let configPayload: any = null;

//     // --- SALESFORCE WORKFLOW (start → salesforce-cloud → end) ---
//     if (salesforceNodes.length > 0) {
//       console.log("Detected: Salesforce Cloud Workflow");
//       operationTypeForDag = "read_salesforce";
//       const salesforceNode = salesforceNodes[0];

//       // Validate required Salesforce fields
//       if (
//         !salesforceNode.data.object_name ||
//         !salesforceNode.data.query ||
//         !salesforceNode.data.file_path
//       ) {
//         toast({
//           title: "Error",
//           description:
//             "Salesforce workflow requires object name, query, and file path. Please configure the Salesforce node first.",
//           variant: "destructive",
//         });
//         return false;
//       }

//       // Create Salesforce configuration payload
//       // Note: Backend credentials will be used from environment variables
//       configPayload = {
//         object_name: salesforceNode.data.object_name,
//         query: salesforceNode.data.query,
//         // fields: salesforceNode.data.fields || [],
//         // where: salesforceNode.data.where || "",
//         // limit: salesforceNode.data.limit || undefined,
//         use_bulk_api: salesforceNode.data.use_bulk_api || false,
//         file_path: salesforceNode.data.file_path,
//       };

//       console.log(
//         "Creating Salesforce configuration:",
//         JSON.stringify(configPayload, null, 2)
//       );

//       // Show user that Salesforce workflow is being prepared
//       toast({
//         title: "Preparing Salesforce Workflow",
//         description: `Configuring Salesforce data extraction for ${salesforceNode.data.object_name}...`,
//         variant: "default",
//       });
//     }
//     // --- FILE-TO-FILE ---
//     else if (readFileNodes.length > 0 && writeFileNodes.length > 0) {
//       console.log("Detected: File-to-File");
//       operationTypeForDag = "file_conversion";
//       const readNode = readFileNodes[0];
//       const writeNode = writeFileNodes[0];
//       if (!readNode.data.path || !writeNode.data.path) {
//         toast({
//           title: "Error",
//           description: "File-to-File: Input/Output paths required.",
//           variant: "destructive",
//         });
//         return false;
//       }
//       configPayload = createFileToFileConfig(
//         readNode,
//         writeNode,
//         filterNodeForConversion,
//         currentWorkflowId
//       );
//     }
//     // --- FILE-TO-DATABASE ---
//     else if (readFileNodes.length > 0 && databaseNodes.length > 0) {
//       console.log("Detected: File-to-Database");
//       operationTypeForDag = "file_conversion";
//       const readNode = readFileNodes[0];
//       const databaseNode = databaseNodes[0];
//       if (
//         !readNode.data.path ||
//         !databaseNode.data.connectionString ||
//         !databaseNode.data.table
//       ) {
//         toast({
//           title: "Error",
//           description:
//             "File-to-DB: File path, DB connection, and table required.",
//           variant: "destructive",
//         });
//         return false;
//       }
//       configPayload = createFileToDatabaseConfig(
//         readNode,
//         databaseNode,
//         filterNodeForConversion,
//         currentWorkflowId
//       );
//     }
//     // --- DATABASESOURCE-TO-FILE ---
//     else if (databaseSourceNodes.length > 0 && writeFileNodes.length > 0) {
//       console.log("Detected: DatabaseSource('source' node)-to-File");
//       operationTypeForDag = "file_conversion";
//       const dbSourceNode = databaseSourceNodes[0];
//       const writeNode = writeFileNodes[0];

//       if (
//         !dbSourceNode.data.connectionString ||
//         (!dbSourceNode.data.query && !dbSourceNode.data.table) ||
//         !writeNode.data.path
//       ) {
//         toast({
//           title: "Error",
//           description:
//             "DB-to-File: DB conn, (query or table name), and output path required.",
//           variant: "destructive",
//         });
//         return false;
//       }
//       configPayload = createDatabaseToFileConfig(
//         dbSourceNode,
//         writeNode,
//         filterNodeForConversion,
//         currentWorkflowId
//       );
//     }
//     // --- COPY FILE ---
//     else if (copyFileNodes.length > 0) {
//       console.log("Detected: Copy-File");
//       operationTypeForDag = "cli_operator";
//       const node = copyFileNodes[0];
//       if (!node.data.source_path || !node.data.destination_path) {
//         toast({
//           title: "Error",
//           description: "Copy: Source/Destination paths required.",
//           variant: "destructive",
//         });
//         return false;
//       }
//       configPayload = mapCopyFileToCliOperator(node, currentWorkflowId);
//     }
//     // --- MOVE FILE ---
//     else if (moveFileNodes.length > 0) {
//       console.log("Detected: Move-File");
//       operationTypeForDag = "cli_operator";
//       const node = moveFileNodes[0];
//       if (!node.data.source_path || !node.data.destination_path) {
//         toast({
//           title: "Error",
//           description: "Move: Source/Destination paths required.",
//           variant: "destructive",
//         });
//         return false;
//       }
//       configPayload = mapMoveFileToCliOperator(node, currentWorkflowId);
//     }
//     // --- RENAME FILE ---
//     else if (renameFileNodes.length > 0) {
//       console.log("Detected: Rename-File");
//       operationTypeForDag = "cli_operator";
//       const node = renameFileNodes[0];
//       if (!node.data.source_path || !node.data.destination_path) {
//         toast({
//           title: "Error",
//           description: "Rename: Old/New paths (source/destination) required.",
//           variant: "destructive",
//         });
//         return false;
//       }
//       configPayload = mapRenameFileToCliOperator(node, currentWorkflowId);
//     }
//     // --- DELETE FILE ---
//     else if (deleteFileNodes.length > 0) {
//       console.log("Detected: Delete-File");
//       operationTypeForDag = "cli_operator";
//       const node = deleteFileNodes[0];
//       if (!node.data.source_path) {
//         toast({
//           title: "Error",
//           description: "Delete: Source path required.",
//           variant: "destructive",
//         });
//         return false;
//       }
//       configPayload = mapDeleteFileToCliOperator(node, currentWorkflowId);
//     }
//     // --- NO MATCH ---
//     else {
//       console.log("No recognized workflow operation type found.");
//       toast({
//         title: "Error",
//         description:
//           "Unsupported workflow operation. Please connect appropriate nodes (e.g., start → salesforce-cloud → end, or read-file → write-file).",
//         variant: "destructive",
//       });
//       return false;
//     }

//     // Create configuration based on operation type
//     if (operationTypeForDag === "read_salesforce") {
//       console.log(
//         "Creating Salesforce read config with:",
//         JSON.stringify(configPayload, null, 2)
//       );
//       const response = await createSalesforceReadConfig(
//         dynamicClientIdString,
//         configPayload
//       );
//       if (!response?.id)
//         throw new Error(
//           "Failed to create Salesforce read config or ID missing."
//         );
//       createdConfigId = response.id;
//     } else if (operationTypeForDag === "file_conversion") {
//       console.log(
//         "Creating file_conversion config with:",
//         JSON.stringify(configPayload, null, 2)
//       );
//       const response = await createFileConversionConfig(
//         clientId,
//         configPayload
//       );
//       if (!response?.id)
//         throw new Error(
//           "Failed to create file conversion config or ID missing."
//         );
//       createdConfigId = response.id;
//     } else if (operationTypeForDag === "cli_operator") {
//       console.log(
//         `Creating CLI operator config (${configPayload.operation}) with:`,
//         JSON.stringify(configPayload, null, 2)
//       );
//       const response = await createCliOperatorConfig(clientId, configPayload);
//       if (!response?.id)
//         throw new Error(
//           `Failed to create CLI op config for ${configPayload.operation} or ID missing.`
//         );
//       createdConfigId = response.id;
//     }

//     if (createdConfigId === null || !operationTypeForDag) {
//       toast({
//         title: "Error",
//         description: "Config creation failed or operation type missing.",
//         variant: "destructive",
//       });
//       return false;
//     }

//     // --- Build DAG Sequence ---
//     dagSequence = [];
//     const startNodeId = makePythonSafeId(startNodesList[0].id);
//     const endNodeId = makePythonSafeId(endNodesList[0].id);

//     // Create appropriate task ID based on operation type
//     let mainTaskId: string;
//     let taskType: string;

//     if (operationTypeForDag === "read_salesforce") {
//       mainTaskId = `read_salesforce_${createdConfigId}`;
//       taskType = "read_salesforce";
//     } else if (operationTypeForDag === "file_conversion") {
//       mainTaskId = `file_conversion_${createdConfigId}`;
//       taskType = "file_conversion";
//     } else {
//       mainTaskId = `cli_operator_${createdConfigId}`;
//       taskType = "cli_operator";
//     }

//     dagSequence.push({
//       id: startNodeId,
//       type: "start",
//       config_id: 1,
//       next: [mainTaskId],
//     });

//     dagSequence.push({
//       id: mainTaskId,
//       type: taskType,
//       config_id: createdConfigId,
//       next: [endNodeId],
//     });

//     dagSequence.push({
//       id: endNodeId,
//       type: "end",
//       config_id: 1,
//       next: [],
//     });

//     console.log(
//       "Updating DAG with sequence:",
//       JSON.stringify(dagSequence, null, 2)
//     );
//     const dagUpdateData = { dag_sequence: dagSequence, active: true };
//     const updatedDag = await updateDag(currentWorkflowId, dagUpdateData);
//     if (!updatedDag) throw new Error("Failed to update DAG on backend.");

//     try {
//       console.log("Triggering DAG run for workflow:", currentWorkflowId);
//       const triggerResult = await triggerDagRun(currentWorkflowId);
//       if (!triggerResult)
//         console.warn(
//           "DAG run trigger returned non-truthy value, but workflow saved."
//         );

//       // Show success message with specific details for Salesforce
//       if (operationTypeForDag === "read_salesforce") {
//         const salesforceNode = salesforceNodes[0];
//         toast({
//           title: "Salesforce Workflow Started",
//           description: `Extracting ${salesforceNode.data.object_name} data to ${salesforceNode.data.file_path}. File will be created at the specified path.`,
//           variant: "default",
//         });
//       }
//     } catch (triggerError) {
//       console.error("Error triggering DAG run (workflow saved):", triggerError);
//       toast({
//         title: "Partial Success",
//         description:
//           "Workflow saved; run trigger failed. You may need to run it manually.",
//         variant: "default",
//       });
//     }

//     toast({
//       title: "Success",
//       description: `${
//         operationTypeForDag === "read_salesforce"
//           ? "Salesforce workflow"
//           : "Workflow"
//       } saved and execution started.`,
//     });
//     return true;
//   } catch (error) {
//     console.error("Error in saveAndRunWorkflow:", error);
//     toast({
//       title: "Workflow Operation Error",
//       description:
//         error instanceof Error
//           ? error.message
//           : "An unexpected error occurred while saving or running the workflow.",
//       variant: "destructive",
//     });
//     return false;
//   }
// }

// export function findWriteNodesInPath(
//   startNodeId: string,
//   nodes: WorkflowNode[],
//   connections: NodeConnection[],
//   visited: Set<string> = new Set()
// ): WorkflowNode[] {
//   if (visited.has(startNodeId)) {
//     return [];
//   }
//   visited.add(startNodeId);
//   const writeNodes: WorkflowNode[] = [];

//   const node = nodes.find((n) => n.id === startNodeId);
//   if (node?.type === "write-file") {
//     writeNodes.push(node);
//   }

//   for (const conn of connections) {
//     if (conn.sourceId === startNodeId) {
//       const nodesInPath = findWriteNodesInPath(
//         conn.targetId,
//         nodes,
//         connections,
//         visited
//       );
//       writeNodes.push(...nodesInPath);
//     }
//   }
//   return writeNodes;
// }

// // src/services/workflow-utils.ts
"use client"; // This directive might be needed if it renders client-side
import type {
  WorkflowNode,
  NodeConnection,
} from "@/components/workflow/workflow-context";
import {
  createFileConversionConfig,
  updateDag,
  triggerDagRun,

  // NEW: Import the Salesforce Write config creation function
} from "@/services/file-conversion-service"; // Assuming it's in this service
import { createSalesforceReadConfig } from "@/services/saleforce/saleforceread";
import { createSalesforceWriteConfig } from "@/services/saleforce/saleforcewrite";
import { createCliOperatorConfig } from "@/services/cli-operator-service";

import {
  createFileToFileConfig,
  createFileToDatabaseConfig,
  createDatabaseToFileConfig,
  mapCopyFileToCliOperator,
  mapMoveFileToCliOperator,
  mapRenameFileToCliOperator,
  mapDeleteFileToCliOperator,
  mapNodeToSalesforceWriteConfig, // NEW: Import the mapper for Salesforce Write
} from "@/services/schema-mapper";

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
      return false;
    }

    const readFileNodes = nodes.filter((node) => node.type === "read-file");
    const writeFileNodes = nodes.filter((node) => node.type === "write-file");
    const databaseNodes = nodes.filter((node) => node.type === "database");
    const databaseSourceNodes = nodes.filter((node) => node.type === "source");
    const copyFileNodes = nodes.filter((node) => node.type === "copy-file");
    const moveFileNodes = nodes.filter((node) => node.type === "move-file");
    const renameFileNodes = nodes.filter((node) => node.type === "rename-file");
    const deleteFileNodes = nodes.filter((node) => node.type === "delete-file");
    const filterNodes = nodes.filter((node) => node.type === "filter");
    const salesforceReadNodes = nodes.filter(
      (node) => node.type === "salesforce-cloud"
    );
    const salesforceWriteNodes = nodes.filter(
      (node) => node.type === "write-salesforce"
    ); // Filter for Salesforce Write nodes

    const filterNodeForConversion =
      filterNodes.length > 0 ? filterNodes[0] : null;
    if (filterNodeForConversion) {
      console.log(
        "DEBUG(workflow-utils): Filter node data *before mapper call*:",
        JSON.stringify(filterNodeForConversion.data, null, 2)
      );
    }

    let dagSequence: any[] = [];
    let createdConfigId: number | null = null;
    // Added "write_salesforce" to the possible operation types
    let operationTypeForDag:
      | "file_conversion"
      | "cli_operator"
      | "read_salesforce"
      | "write_salesforce"
      | null = null;
    let configPayload: any = null; // This will be populated if a new config needs to be created here

    // --- SALESFORCE WRITE WORKFLOW (start → write-salesforce → end) ---
    if (salesforceWriteNodes.length > 0) {
      console.log("Detected: Salesforce Write Workflow");
      operationTypeForDag = "write_salesforce";
      const salesforceWriteNode = salesforceWriteNodes[0];

      // NEW: Create configPayload using the mapper
      configPayload = mapNodeToSalesforceWriteConfig(salesforceWriteNode);

      // NEW: Perform validation before making API call
      if (!configPayload.object_name || !configPayload.file_path) {
        toast({
          title: "Error",
          description:
            "Salesforce Write workflow requires object name and file path. Please configure the Salesforce Write node first.",
          variant: "destructive",
        });
        return false;
      }
      if (
        configPayload.use_bulk_api &&
        (!configPayload.bulk_batch_size ||
          configPayload.bulk_batch_size <= 0 ||
          configPayload.bulk_batch_size > 10000)
      ) {
        toast({
          title: "Error",
          description:
            "Salesforce Write (Bulk API): Bulk batch size must be between 1 and 10000.",
          variant: "destructive",
        });
        return false;
      }

      console.log(
        "Creating Salesforce Write configuration with payload:",
        JSON.stringify(configPayload, null, 2)
      );

      toast({
        title: "Preparing Salesforce Write Workflow",
        description: `Configuring Salesforce data write operation for ${configPayload.object_name}...`,
        variant: "default",
      });
    }
    // --- SALESFORCE READ WORKFLOW (start → salesforce-cloud → end) ---
    else if (salesforceReadNodes.length > 0) {
      console.log("Detected: Salesforce Read Workflow");
      operationTypeForDag = "read_salesforce";
      const salesforceReadNode = salesforceReadNodes[0];

      // Validate required Salesforce Read fields
      if (
        !salesforceReadNode.data.object_name ||
        !salesforceReadNode.data.query ||
        !salesforceReadNode.data.file_path
      ) {
        toast({
          title: "Error",
          description:
            "Salesforce Read workflow requires object name, query, and file path. Please configure the Salesforce node first.",
          variant: "destructive",
        });
        return false;
      }

      // Create Salesforce Read configuration payload
      configPayload = {
        object_name: salesforceReadNode.data.object_name,
        query: salesforceReadNode.data.query,
        // fields: salesforceReadNode.data.fields || [],
        // where: salesforceReadNode.data.where || "",
        // limit: salesforceReadNode.data.limit || undefined,
        use_bulk_api: salesforceReadNode.data.use_bulk_api || false,
        file_path: salesforceReadNode.data.file_path,
      };

      console.log(
        "Creating Salesforce Read configuration:",
        JSON.stringify(configPayload, null, 2)
      );

      toast({
        title: "Preparing Salesforce Read Workflow",
        description: `Configuring Salesforce data extraction for ${salesforceReadNode.data.object_name}...`,
        variant: "default",
      });
    }
    // --- FILE-TO-FILE ---
    else if (readFileNodes.length > 0 && writeFileNodes.length > 0) {
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
      configPayload = createFileToFileConfig(
        readNode,
        writeNode,
        filterNodeForConversion,
        currentWorkflowId
      );
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
      configPayload = createFileToDatabaseConfig(
        readNode,
        databaseNode,
        filterNodeForConversion,
        currentWorkflowId
      );
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
      configPayload = createDatabaseToFileConfig(
        dbSourceNode,
        writeNode,
        filterNodeForConversion,
        currentWorkflowId
      );
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
      configPayload = mapDeleteFileToCliOperator(node, currentWorkflowId);
    }
    // --- NO MATCH ---
    else {
      console.log("No recognized workflow operation type found.");
      toast({
        title: "Error",
        description:
          "Unsupported workflow operation. Please connect appropriate nodes (e.g., start → salesforce-cloud → end, or start → write-salesforce → end).",
        variant: "destructive",
      });
      return false;
    }

    // Create configuration based on operation type and get the config_id
    if (operationTypeForDag === "read_salesforce") {
      const response = await createSalesforceReadConfig(
        dynamicClientIdString,
        configPayload
      );
      if (!response?.id)
        throw new Error(
          "Failed to create Salesforce Read config or ID missing."
        );
      createdConfigId = response.id;
    } else if (operationTypeForDag === "write_salesforce") {
      // NEW: Handle config creation for write_salesforce
      const response = await createSalesforceWriteConfig(
        dynamicClientIdString,
        configPayload
      );
      if (!response?.id)
        throw new Error(
          "Failed to create Salesforce Write config or ID missing."
        );
      createdConfigId = response.id;

      // Crucially, update the node with the received config_id
      // This ensures the node's data is persisted with the backend ID.
      // This makes subsequent workflow runs for the same node use the existing config_id.
      // The SalesforceWriteNodeProperties component would also need to update its local
      // formData with this ID after a successful save.
      if (salesforceWriteNodes.length > 0) {
        // Should always be true here
        // This is a direct call for updating the node's internal state within the workflow context.
        // In a real application, the NodeProperties component would likely handle this itself
        // after its API call to save the config.
        // However, if workflow-utils is now responsible for generating and saving the config,
        // we need to update the node's data.
        // salesforceWriteNodes[0].data = createdConfigId;
        // We might also want to call updateNode to persist this change immediately,
        // but the overall updateDag handles saving the graph.
      }
    } else if (operationTypeForDag === "file_conversion") {
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

    // --- Build DAG Sequence ---
    dagSequence = [];
    const startNodeId = makePythonSafeId(startNodesList[0].id);
    const endNodeId = makePythonSafeId(endNodesList[0].id);

    // Create appropriate task ID based on operation type
    let mainTaskId: string;
    let taskType: string;

    if (operationTypeForDag === "read_salesforce") {
      mainTaskId = `read_salesforce_${createdConfigId}`;
      taskType = "read_salesforce";
    } else if (operationTypeForDag === "write_salesforce") {
      mainTaskId = `write_salesforce_${createdConfigId}`;
      taskType = "write_salesforce";
    } else if (operationTypeForDag === "file_conversion") {
      mainTaskId = `file_conversion_${createdConfigId}`;
      taskType = "file_conversion";
    } else {
      // This covers 'cli_operator'
      mainTaskId = `cli_operator_${createdConfigId}`;
      taskType = "cli_operator";
    }

    dagSequence.push({
      id: startNodeId,
      type: "start",
      config_id: 1,
      next: [mainTaskId],
    });

    dagSequence.push({
      id: mainTaskId,
      type: taskType,
      config_id: createdConfigId,
      next: [endNodeId],
    });

    dagSequence.push({
      id: endNodeId,
      type: "end",
      config_id: 1,
      next: [],
    });

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

      // Show success message with specific details for Salesforce operations
      if (operationTypeForDag === "read_salesforce") {
        const salesforceReadNode = salesforceReadNodes[0];
        toast({
          title: "Salesforce Read Workflow Started",
          description: `Extracting ${salesforceReadNode.data.object_name} data to ${salesforceReadNode.data.file_path}. File will be created at the specified path.`,
          variant: "default",
        });
      } else if (operationTypeForDag === "write_salesforce") {
        const salesforceWriteNode = salesforceWriteNodes[0]; // Re-fetch or use existing node if needed
        toast({
          title: "Salesforce Write Workflow Started",
          description: `Writing data from ${salesforceWriteNode.data.file_path} to Salesforce object ${salesforceWriteNode.data.object_name}.`,
          variant: "default",
        });
      }
    } catch (triggerError) {
      console.error("Error triggering DAG run (workflow saved):", triggerError);
      toast({
        title: "Partial Success",
        description:
          "Workflow saved; run trigger failed. You may need to run it manually.",
        variant: "default",
      });
    }

    toast({
      title: "Success",
      description: `${
        operationTypeForDag === "read_salesforce"
          ? "Salesforce Read workflow"
          : operationTypeForDag === "write_salesforce"
          ? "Salesforce Write workflow"
          : "Workflow"
      } saved and execution started.`,
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
