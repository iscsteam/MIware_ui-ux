
// // Utility functions for workflow operations
// import type { WorkflowNode, NodeConnection } from "@/components/workflow/workflow-context"; // Using @ alias
// import { createFileConversionConfig, updateDag, triggerDagRun } from "@/services/file-conversion-service";
// import { createFileConversionConfigFromNodes } from "@/services/schema-mapper";
// import { createCliOperatorConfig, mapCopyFileToCliOperator } from "@/services/cli-operator-service";
// import { toast } from "@/components/ui/use-toast";
// import { getCurrentClientId } from "@/components/workflow/workflow-context"; // Import getCurrentClientId

// // Helper function to ensure Python-compatible IDs
// function makePythonSafeId(id: string): string {
//   // Remove any non-alphanumeric characters and replace with underscores
//   let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_");

//   // Ensure it starts with a letter or underscore (Python variable naming rule)
//   if (!/^[a-zA-Z_]/.test(safeId)) {
//     safeId = "task_" + safeId;
//   }

//   return safeId;
// }

// export async function saveAndRunWorkflow(
//   nodes: WorkflowNode[],
//   connections: NodeConnection[],
//   currentWorkflowId: string | null, // Renamed from _currentWorkflowId for clarity, passed from context
//   // clientId parameter removed, will be fetched dynamically
// ): Promise<boolean> {
//   const dynamicClientIdString = getCurrentClientId();

//   if (!dynamicClientIdString) {
//     toast({
//       title: "Error",
//       description: "Client ID not found. Cannot save and run workflow.",
//       variant: "destructive",
//     });
//     return false;
//   }

//   const clientId = parseInt(dynamicClientIdString, 10);
//   if (isNaN(clientId)) {
//     toast({
//       title: "Error",
//       description: `Invalid Client ID format: "${dynamicClientIdString}". Cannot save and run workflow.`,
//       variant: "destructive",
//     });
//     return false;
//   }

//   // The currentWorkflowId is passed from the context.
//   // The context should have already validated it or handled the null case.
//   if (!currentWorkflowId) {
//     toast({
//       title: "Error",
//       description: "Workflow ID is missing. Cannot save and run workflow.",
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
//     // Find start and end nodes
//     const startNodes = nodes.filter((node) => node.type === "start");
//     const endNodes = nodes.filter((node) => node.type === "end");

//     if (startNodes.length === 0 || endNodes.length === 0) {
//       toast({
//         title: "Error",
//         description: "Workflow must contain at least one start node and one end node.",
//         variant: "destructive",
//       });
//       return false;
//     }

//     // Check for the type of workflow
//     const readFileNodes = nodes.filter((node) => node.type === "read-file");
//     const writeFileNodes = nodes.filter((node) => node.type === "write-file");
//     const copyFileNodes = nodes.filter((node) => node.type === "copy-file");
//     const filterNodes = nodes.filter((node) => node.type === "filter");

//     let dagSequence = [];
//     let createdConfigId: number; // Stores the ID of the created config (either file conversion or CLI)

//     // Handle file conversion workflow
//     if (readFileNodes.length > 0 && writeFileNodes.length > 0) {
//       // Create file conversion config
//       const readNode = readFileNodes[0];
//       const writeNode = writeFileNodes[0];
//       const filterNode = filterNodes.length > 0 ? filterNodes[0] : null;

//       // Create a config with dynamic values from the nodes
//       // currentWorkflowId is already validated to be non-null
//       const configPayload = createFileConversionConfigFromNodes(readNode, writeNode, filterNode, currentWorkflowId);

//       // Add validation before creating the config
//       if (!configPayload.input.path) {
//         toast({
//           title: "Error",
//           description: `Read file node is missing a path. Please configure the node properly.`,
//           variant: "destructive",
//         });
//         return false;
//       }

//       if (!configPayload.output.path) {
//         toast({
//           title: "Error",
//           description: `Write file node is missing a path. Please configure the node properly.`,
//           variant: "destructive",
//         });
//         return false;
//       }

//       console.log("Creating file conversion config with:", configPayload);

//       // Create file conversion config using dynamically fetched clientId
//       const configResponse = await createFileConversionConfig(clientId, configPayload);
//       if (!configResponse) {
//         throw new Error("Failed to create file conversion config");
//       }

//       createdConfigId = configResponse.id;

//     }
//     // Handle CLI operator workflow (copy file)
//     else if (copyFileNodes.length > 0) {
//       const copyNode = copyFileNodes[0];

//       // Validate copy node data
//       if (!copyNode.data.source_path) {
//         toast({
//           title: "Error",
//           description: `Copy file node is missing a source path. Please configure the node properly.`,
//           variant: "destructive",
//         });
//         return false;
//       }

//       if (!copyNode.data.destination_path) {
//         toast({
//           title: "Error",
//           description: `Copy file node is missing a destination path. Please configure the node properly.`,
//           variant: "destructive",
//         });
//         return false;
//       }

//       // Map copy file node to CLI operator config
//       const cliConfigPayload = mapCopyFileToCliOperator(copyNode);
//       console.log("Creating CLI operator config with:", cliConfigPayload);

//       // Create CLI operator config using dynamically fetched clientId
//       const configResponse = await createCliOperatorConfig(clientId, cliConfigPayload);
//       if (!configResponse) {
//         throw new Error("Failed to create CLI operator config");
//       }

//       createdConfigId = configResponse.id;

//     } else {
//       toast({
//         title: "Error",
//         description: "Workflow must contain either read/write file nodes or a copy file node.",
//         variant: "destructive",
//       });
//       return false;
//     }

//     // Create DAG sequence using the createdConfigId
//     dagSequence = [
//       {
//         id: makePythonSafeId(startNodes[0].id),
//         type: "start",
//         config_id: 1, // Default config ID for start nodes
//         next: [`file_node_${createdConfigId}`],
//       },
//       {
//         id: `file_node_${createdConfigId}`,
//         type: (readFileNodes.length > 0 && writeFileNodes.length > 0) ? "file_conversion" : "cli_operator",
//         config_id: createdConfigId,
//         next: [makePythonSafeId(endNodes[0].id)],
//       },
//       {
//         id: makePythonSafeId(endNodes[0].id),
//         type: "end",
//         config_id: 1, // Default config ID for end nodes
//         next: [],
//       },
//     ];

//     // Update DAG with sequence
//     const dagUpdateData = {
//       dag_sequence: dagSequence,
//       active: true,
//     };

//     // currentWorkflowId is already validated to be non-null
//     const updatedDag = await updateDag(currentWorkflowId, dagUpdateData);
//     if (!updatedDag) {
//       throw new Error("Failed to update DAG");
//     }

//     // Trigger DAG run
//     try {
//       // currentWorkflowId is already validated to be non-null
//       const triggerResult = await triggerDagRun(currentWorkflowId);
//       if (!triggerResult) {
//         console.log("Trigger returned null, but continuing with success message");
//         // Don't throw an error here, just log it
//       }
//     } catch (triggerError) {
//       console.error("Error triggering DAG run, but workflow was saved:", triggerError);
//       // Show a partial success message
//       toast({
//         title: "Partial Success",
//         description: "Workflow was saved but could not be triggered. You can try running it manually.",
//       });
//       // Return true since the workflow was saved
//       return true;
//     }

//     toast({
//       title: "Success",
//       description: "Workflow saved and triggered successfully",
//     });

//     return true;
//   } catch (error) {
//     console.error("Error in saveAndRunWorkflow:", error);
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to save and run workflow",
//       variant: "destructive",
//     });
//     return false;
//   }
// }

// // Helper function to find write nodes in a path (remains unchanged)
// function findWriteNodesInPath(
//   startNodeId: string,
//   nodes: WorkflowNode[],
//   connections: NodeConnection[],
//   visited: Set<string> = new Set(),
// ): WorkflowNode[] {
//   if (visited.has(startNodeId)) {
//     return []; // Prevent cycles
//   }

//   visited.add(startNodeId);
//   const writeNodes: WorkflowNode[] = [];

//   const node = nodes.find((n) => n.id === startNodeId);
//   if (node?.type === "write-file") {
//     writeNodes.push(node);
//   }

//   // Follow connections
//   for (const conn of connections) {
//     if (conn.sourceId === startNodeId) {
//       const nodesInPath = findWriteNodesInPath(conn.targetId, nodes, connections, visited);
//       writeNodes.push(...nodesInPath);
//     }
//   }

//   return writeNodes;
// }

// Utility functions for workflow operations
import type { WorkflowNode, NodeConnection } from "@/components/workflow/workflow-context"; // Using @ alias
import { createFileConversionConfig, updateDag, triggerDagRun } from "@/services/file-conversion-service";
import { createFileConversionConfigFromNodes } from "@/services/schema-mapper";
import {
  createCliOperatorConfig,
  mapCopyFileToCliOperator,
  mapMoveFileToCliOperator, // <--- IMPORT mapMoveFileToCliOperator
  // Assuming mapRenameFileToCliOperator and mapDeleteFileToCliOperator are also in cli-operator-service.ts
  mapRenameFileToCliOperator,
  mapDeleteFileToCliOperator,
} from "@/services/cli-operator-service";
import { toast } from "@/components/ui/use-toast";
import { getCurrentClientId } from "@/components/workflow/workflow-context"; // Import getCurrentClientId

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
  currentWorkflowId: string | null,
): Promise<boolean> {
  const dynamicClientIdString = getCurrentClientId();
  if (!dynamicClientIdString) { /* ... client ID error handling ... */ return false; }
  const clientId = parseInt(dynamicClientIdString, 10);
  if (isNaN(clientId)) { /* ... client ID error handling ... */ return false; }

  if (!currentWorkflowId) { /* ... workflow ID error handling ... */ return false; }
  if (nodes.length === 0) { /* ... empty workflow error handling ... */ return false; }

  try {
    const startNodes = nodes.filter((node) => node.type === "start");
    const endNodes = nodes.filter((node) => node.type === "end");
    if (startNodes.length === 0 || endNodes.length === 0) { /* ... start/end node error ... */ return false; }

    // Check for the type of workflow
    const readFileNodes = nodes.filter((node) => node.type === "read-file");
    const writeFileNodes = nodes.filter((node) => node.type === "write-file");
    const copyFileNodes = nodes.filter((node) => node.type === "copy-file");
    const moveFileNodes = nodes.filter((node) => node.type === "move-file"); // <--- Get move nodes
    const renameFileNodes = nodes.filter((node) => node.type === "rename-file"); // Assuming you'll add this
    const deleteFileNodes = nodes.filter((node) => node.type === "delete-file"); // Assuming you'll add this
    const filterNodes = nodes.filter((node) => node.type === "filter");

    let dagSequence: any[] = [];
    let createdConfigId: number | null = null;
    let operationTypeForDag: "file_conversion" | "cli_operator" | null = null;
    let cliConfigPayload: any = null; // To store the generated CLI config

    // --- FILE CONVERSION WORKFLOW ---
    if (readFileNodes.length > 0 && writeFileNodes.length > 0) {
      operationTypeForDag = "file_conversion";
      const readNode = readFileNodes[0];
      const writeNode = writeFileNodes[0];
      const filterNode = filterNodes.length > 0 ? filterNodes[0] : null;
      const configPayload = createFileConversionConfigFromNodes(readNode, writeNode, filterNode, currentWorkflowId);
      if (!configPayload.input.path || !configPayload.output.path) { /* ... validation ... */ return false; }
      console.log("Creating file conversion config with:", configPayload);
      const configResponse = await createFileConversionConfig(clientId, configPayload);
      if (!configResponse) throw new Error("Failed to create file conversion config");
      createdConfigId = configResponse.id;
    }
    // --- COPY FILE WORKFLOW ---
    else if (copyFileNodes.length > 0) {
      operationTypeForDag = "cli_operator";
      const copyNode = copyFileNodes[0];
      if (!copyNode.data.source_path || !copyNode.data.destination_path) { /* ... validation ... */ return false; }
      cliConfigPayload = mapCopyFileToCliOperator(copyNode);
    }
    // --- MOVE FILE WORKFLOW ---
    else if (moveFileNodes.length > 0) {
      operationTypeForDag = "cli_operator";
      const moveNode = moveFileNodes[0];
      if (!moveNode.data.source_path || !moveNode.data.destination_path) {
        toast({ title: "Error", description: "Move file node requires both source and destination paths.", variant: "destructive" });
        return false;
      }
      cliConfigPayload = mapMoveFileToCliOperator(moveNode);
    }
    // --- RENAME FILE WORKFLOW (Example - you'll need mapRenameFileToCliOperator) ---
    else if (renameFileNodes.length > 0) {
        operationTypeForDag = "cli_operator";
        const renameNode = renameFileNodes[0];
        if (!renameNode.data.source_path || !renameNode.data.destination_path) { /* ... validation ... */ return false; }
        cliConfigPayload = mapRenameFileToCliOperator(renameNode); // Make sure this mapper exists
    }
    // --- DELETE FILE WORKFLOW (Example - you'll need mapDeleteFileToCliOperator) ---
    else if (deleteFileNodes.length > 0) {
        operationTypeForDag = "cli_operator";
        const deleteNode = deleteFileNodes[0];
        if (!deleteNode.data.source_path) { /* ... validation ... */ return false; }
        cliConfigPayload = mapDeleteFileToCliOperator(deleteNode); // Make sure this mapper exists
    }
    else {
      toast({
        title: "Error",
        description: "Workflow must contain a recognized operation (read/write, copy, move, rename, or delete).",
        variant: "destructive",
      });
      return false;
    }

    // If it's a CLI operation, create the config
    if (operationTypeForDag === "cli_operator" && cliConfigPayload) {
      console.log(`Creating CLI operator config (${cliConfigPayload.operation}) with:`, cliConfigPayload);
      const configResponse = await createCliOperatorConfig(clientId, cliConfigPayload);
      if (!configResponse) throw new Error(`Failed to create CLI operator config for ${cliConfigPayload.operation}`);
      createdConfigId = configResponse.id;
    }


    // Check if a config was successfully created and an operation type determined
    if (createdConfigId === null || operationTypeForDag === null) {
        toast({
          title: "Error",
          description: "Failed to determine workflow operation or create necessary configuration.",
          variant: "destructive",
        });
        return false;
    }

    // Create DAG sequence using the createdConfigId and operationTypeForDag
    const taskNodeIdPrefix = operationTypeForDag === "file_conversion" ? "fc_node_" : "cli_op_node_";
    dagSequence = [
      { id: makePythonSafeId(startNodes[0].id), type: "start", config_id: 1, next: [`${taskNodeIdPrefix}${createdConfigId}`] },
      { id: `${taskNodeIdPrefix}${createdConfigId}`, type: operationTypeForDag, config_id: createdConfigId, next: [makePythonSafeId(endNodes[0].id)] },
      { id: makePythonSafeId(endNodes[0].id), type: "end", config_id: 1, next: [] },
    ];

    // Update DAG and Trigger Run
    const dagUpdateData = { dag_sequence: dagSequence, active: true };
    const updatedDag = await updateDag(currentWorkflowId, dagUpdateData);
    if (!updatedDag) throw new Error("Failed to update DAG");

    try {
      const triggerResult = await triggerDagRun(currentWorkflowId);
      if (!triggerResult) console.log("Trigger returned null, but continuing.");
    } catch (triggerError) {
      console.error("Error triggering DAG run, but workflow was saved:", triggerError);
      toast({ title: "Partial Success", description: "Workflow saved but failed to trigger. Run manually.", variant: "default" });
      return true;
    }

    toast({ title: "Success", description: "Workflow saved and triggered successfully." });
    return true;

  } catch (error) {
    console.error("Error in saveAndRunWorkflow:", error);
    toast({
      title: "Workflow Error",
      description: error instanceof Error ? error.message : "Failed to save and run workflow.",
      variant: "destructive",
    });
    return false;
  }
}

// findWriteNodesInPath function (remains unchanged)
// ...
function findWriteNodesInPath(
  startNodeId: string,
  nodes: WorkflowNode[],
  connections: NodeConnection[],
  visited: Set<string> = new Set(),
): WorkflowNode[] {
  if (visited.has(startNodeId)) {
    return []; // Prevent cycles
  }

  visited.add(startNodeId);
  const writeNodes: WorkflowNode[] = [];

  const node = nodes.find((n) => n.id === startNodeId);
  if (node?.type === "write-file") {
    writeNodes.push(node);
  }

  // Follow connections
  for (const conn of connections) {
    if (conn.sourceId === startNodeId) {
      const nodesInPath = findWriteNodesInPath(conn.targetId, nodes, connections, visited);
      writeNodes.push(...nodesInPath);
    }
  }

  return writeNodes;
}