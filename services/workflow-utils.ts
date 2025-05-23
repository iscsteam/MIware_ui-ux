

// // Utility functions for workflow operations
// import type { WorkflowNode, NodeConnection } from "@/components/workflow/workflow-context"; // Using @ alias
// import { createFileConversionConfig, updateDag, triggerDagRun } from "@/services/file-conversion-service";
// import { createFileConversionConfigFromNodes } from "@/services/schema-mapper";
// import {
//   createCliOperatorConfig,
//   mapCopyFileToCliOperator,
//   mapMoveFileToCliOperator, // <--- IMPORT mapMoveFileToCliOperator
//   // Assuming mapRenameFileToCliOperator and mapDeleteFileToCliOperator are also in cli-operator-service.ts
//   mapRenameFileToCliOperator,
//   mapDeleteFileToCliOperator,
// } from "@/services/cli-operator-service";
// import { toast } from "@/components/ui/use-toast";
// import { getCurrentClientId } from "@/components/workflow/workflow-context"; // Import getCurrentClientId

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
//   currentWorkflowId: string | null,
// ): Promise<boolean> {
//   const dynamicClientIdString = getCurrentClientId();
//   if (!dynamicClientIdString) { /* ... client ID error handling ... */ return false; }
//   const clientId = parseInt(dynamicClientIdString, 10);
//   if (isNaN(clientId)) { /* ... client ID error handling ... */ return false; }

//   if (!currentWorkflowId) { /* ... workflow ID error handling ... */ return false; }
//   if (nodes.length === 0) { /* ... empty workflow error handling ... */ return false; }

//   try {
//     const startNodes = nodes.filter((node) => node.type === "start");
//     const endNodes = nodes.filter((node) => node.type === "end");
//     if (startNodes.length === 0 || endNodes.length === 0) { /* ... start/end node error ... */ return false; }

//     // Check for the type of workflow
//     const readFileNodes = nodes.filter((node) => node.type === "read-file");
//     const writeFileNodes = nodes.filter((node) => node.type === "write-file");
//     const copyFileNodes = nodes.filter((node) => node.type === "copy-file");
//     const moveFileNodes = nodes.filter((node) => node.type === "move-file"); // <--- Get move nodes
//     const renameFileNodes = nodes.filter((node) => node.type === "rename-file"); // Assuming you'll add this
//     const deleteFileNodes = nodes.filter((node) => node.type === "delete-file"); // Assuming you'll add this
//     const filterNodes = nodes.filter((node) => node.type === "filter");

//     let dagSequence: any[] = [];
//     let createdConfigId: number | null = null;
//     let operationTypeForDag: "file_conversion" | "cli_operator" | null = null;
//     let cliConfigPayload: any = null; // To store the generated CLI config

//     // --- FILE CONVERSION WORKFLOW ---
//     if (readFileNodes.length > 0 && writeFileNodes.length > 0) {
//       operationTypeForDag = "file_conversion";
//       const readNode = readFileNodes[0];
//       const writeNode = writeFileNodes[0];
//       const filterNode = filterNodes.length > 0 ? filterNodes[0] : null;
//       const configPayload = createFileConversionConfigFromNodes(readNode, writeNode, filterNode, currentWorkflowId);
//       if (!configPayload.input.path || !configPayload.output.path) { /* ... validation ... */ return false; }
//       console.log("Creating file conversion config with:", configPayload);
//       const configResponse = await createFileConversionConfig(clientId, configPayload);
//       if (!configResponse) throw new Error("Failed to create file conversion config");
//       createdConfigId = configResponse.id;
//     }
//     // --- COPY FILE WORKFLOW ---
//     else if (copyFileNodes.length > 0) {
//       operationTypeForDag = "cli_operator";
//       const copyNode = copyFileNodes[0];
//       if (!copyNode.data.source_path || !copyNode.data.destination_path) { /* ... validation ... */ return false; }
//       cliConfigPayload = mapCopyFileToCliOperator(copyNode);
//     }
//     // --- MOVE FILE WORKFLOW ---
//     else if (moveFileNodes.length > 0) {
//       operationTypeForDag = "cli_operator";
//       const moveNode = moveFileNodes[0];
//       if (!moveNode.data.source_path || !moveNode.data.destination_path) {
//         toast({ title: "Error", description: "Move file node requires both source and destination paths.", variant: "destructive" });
//         return false;
//       }
//       cliConfigPayload = mapMoveFileToCliOperator(moveNode);
//     }
//     // --- RENAME FILE WORKFLOW (Example - you'll need mapRenameFileToCliOperator) ---
//     else if (renameFileNodes.length > 0) {
//         operationTypeForDag = "cli_operator";
//         const renameNode = renameFileNodes[0];
//         if (!renameNode.data.source_path || !renameNode.data.destination_path) { /* ... validation ... */ return false; }
//         cliConfigPayload = mapRenameFileToCliOperator(renameNode); // Make sure this mapper exists
//     }
//     // --- DELETE FILE WORKFLOW (Example - you'll need mapDeleteFileToCliOperator) ---
//     else if (deleteFileNodes.length > 0) {
//         operationTypeForDag = "cli_operator";
//         const deleteNode = deleteFileNodes[0];
//         if (!deleteNode.data.source_path) { /* ... validation ... */ return false; }
//         cliConfigPayload = mapDeleteFileToCliOperator(deleteNode); // Make sure this mapper exists
//     }
//     else {
//       toast({
//         title: "Error",
//         description: "Workflow must contain a recognized operation (read/write, copy, move, rename, or delete).",
//         variant: "destructive",
//       });
//       return false;
//     }

//     // If it's a CLI operation, create the config
//     if (operationTypeForDag === "cli_operator" && cliConfigPayload) {
//       console.log(`Creating CLI operator config (${cliConfigPayload.operation}) with:`, cliConfigPayload);
//       const configResponse = await createCliOperatorConfig(clientId, cliConfigPayload);
//       if (!configResponse) throw new Error(`Failed to create CLI operator config for ${cliConfigPayload.operation}`);
//       createdConfigId = configResponse.id;
//     }


//     // Check if a config was successfully created and an operation type determined
//     if (createdConfigId === null || operationTypeForDag === null) {
//         toast({
//           title: "Error",
//           description: "Failed to determine workflow operation or create necessary configuration.",
//           variant: "destructive",
//         });
//         return false;
//     }

//     // Create DAG sequence using the createdConfigId and operationTypeForDag
//     const taskNodeIdPrefix = operationTypeForDag === "file_conversion" ? "fc_node_" : "cli_op_node_";
//     dagSequence = [
//       { id: makePythonSafeId(startNodes[0].id), type: "start", config_id: 1, next: [`${taskNodeIdPrefix}${createdConfigId}`] },
//       { id: `${taskNodeIdPrefix}${createdConfigId}`, type: operationTypeForDag, config_id: createdConfigId, next: [makePythonSafeId(endNodes[0].id)] },
//       { id: makePythonSafeId(endNodes[0].id), type: "end", config_id: 1, next: [] },
//     ];

//     // Update DAG and Trigger Run
//     const dagUpdateData = { dag_sequence: dagSequence, active: true };
//     const updatedDag = await updateDag(currentWorkflowId, dagUpdateData);
//     if (!updatedDag) throw new Error("Failed to update DAG");

//     try {
//       const triggerResult = await triggerDagRun(currentWorkflowId);
//       if (!triggerResult) console.log("Trigger returned null, but continuing.");
//     } catch (triggerError) {
//       console.error("Error triggering DAG run, but workflow was saved:", triggerError);
//       toast({ title: "Partial Success", description: "Workflow saved but failed to trigger. Run manually.", variant: "default" });
//       return true;
//     }

//     toast({ title: "Success", description: "Workflow saved and triggered successfully." });
//     return true;

//   } catch (error) {
//     console.error("Error in saveAndRunWorkflow:", error);
//     toast({
//       title: "Workflow Error",
//       description: error instanceof Error ? error.message : "Failed to save and run workflow.",
//       variant: "destructive",
//     });
//     return false;
//   }
// }

// // findWriteNodesInPath function (remains unchanged)
// // ...
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
import type { WorkflowNode, NodeConnection } from "@/components/workflow/workflow-context";
// Assuming WorkflowNodeData interface is defined elsewhere and imported if needed
// For example: import type { WorkflowNodeData } from "./your-workflow-node-data-interface-path";
import { createFileConversionConfig, updateDag, triggerDagRun } from "@/services/file-conversion-service";
import { createFileConversionConfigFromNodes } from "@/services/schema-mapper";
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

// Interface to store details for each actual operation that will become a DAG task
interface NodeOperationDetail {
  nodeId: string; // The ID of the primary UI node representing this operation
  typeInDag: "file_conversion" | "cli_operator" | "copy_file" | "move_file" | "rename_file" | "delete_file"; // More specific types if your backend prefers
  config_id: number;
  // For file conversion, specifies which other UI nodes are part of this single DAG operation
  consumedNodeIds?: string[];
}

export async function saveAndRunWorkflow(
  // Ensure nodes are typed if WorkflowNodeData is used: nodes: WorkflowNode<WorkflowNodeData>[],
  nodes: WorkflowNode[], // Using the simpler WorkflowNode for now as in original
  connections: NodeConnection[],
  currentWorkflowId: string | null,
): Promise<boolean> {
  const dynamicClientIdString = getCurrentClientId();
  if (!dynamicClientIdString) {
    toast({ title: "Error", description: "Client ID is missing.", variant: "destructive" });
    return false;
  }
  const clientId = parseInt(dynamicClientIdString, 10);
  if (isNaN(clientId)) {
    toast({ title: "Error", description: "Invalid Client ID format.", variant: "destructive" });
    return false;
  }

  if (!currentWorkflowId) {
    toast({ title: "Error", description: "Workflow ID is missing.", variant: "destructive" });
    return false;
  }
  if (nodes.length === 0) {
    toast({ title: "Error", description: "Workflow is empty.", variant: "destructive" });
    return false;
  }

  const startNodes = nodes.filter((node) => node.type === "start");
  const endNodes = nodes.filter((node) => node.type === "end");
  if (startNodes.length !== 1 || endNodes.length !== 1) {
    toast({ title: "Error", description: "Workflow must have exactly one start and one end node.", variant: "destructive" });
    return false;
  }

  try {
    const nodeOperations = new Map<string, NodeOperationDetail>(); // Map UI node ID to its operation detail
    const processedNodeIds = new Set<string>(); // To track nodes already part of a multi-node operation (like write-file in FC)

    // --- PHASE 1: Identify all operations and create their configurations ---
    // Helper to find connected nodes for FC blocks
    const findConnectedNode = (
        sourceNodeId: string,
        targetType: WorkflowNode["type"],
        currentNodes: WorkflowNode[],
        currentConnections: NodeConnection[],
        visited: Set<string> = new Set()
    ): WorkflowNode | null => {
        if (visited.has(sourceNodeId)) return null;
        visited.add(sourceNodeId);
        for (const conn of currentConnections) {
            if (conn.sourceId === sourceNodeId) {
                const targetNode = currentNodes.find(n => n.id === conn.targetId);
                if (targetNode?.type === targetType) return targetNode;
                if (targetNode?.type === "filter" && targetType === "write-file") {
                    const found = findConnectedNode(targetNode.id, targetType, currentNodes, currentConnections, new Set(visited));
                    if (found) return found;
                }
            }
        }
        return null;
    };
    const findConnectedFilterNode = (
        sourceNodeId: string, writeNodeId: string,
        currentNodes: WorkflowNode[], currentConnections: NodeConnection[]
    ): WorkflowNode | null => {
        for (const conn1 of currentConnections) {
            if (conn1.sourceId === sourceNodeId) {
                const intermediateNode = currentNodes.find(n => n.id === conn1.targetId);
                if (intermediateNode?.type === "filter") {
                    for (const conn2 of currentConnections) {
                        if (conn2.sourceId === intermediateNode.id && conn2.targetId === writeNodeId) return intermediateNode;
                    }
                }
            }
        }
        return null;
    };

    for (const node of nodes) {
      if (processedNodeIds.has(node.id) || node.type === "start" || node.type === "end" || node.type === "filter" /* Filters handled by FC for now */) {
        continue;
      }

      let operationDetail: Omit<NodeOperationDetail, 'nodeId'> | null = null;
      let cliConfigPayload: any = null;
      const nodeLabel = node.data?.label || node.data?.displayName || node.id; // Use data if available

      if (node.type === "read-file") {
        const readNode = node;
        const writeNode = findConnectedNode(readNode.id, "write-file", nodes, connections);

        if (writeNode && !processedNodeIds.has(writeNode.id)) {
          const filterNode = findConnectedFilterNode(readNode.id, writeNode.id, nodes, connections);
          if (filterNode && processedNodeIds.has(filterNode.id)) { /* ... error ... */ return false; }

          const configPayload = createFileConversionConfigFromNodes(readNode, writeNode, filterNode, currentWorkflowId);
          if (!configPayload.input.path || !configPayload.output.path) { /* ... validation ... */ return false; }
          
          console.log(`Creating file_conversion config for read-node: ${readNode.id}`, configPayload);
          const configResponse = await createFileConversionConfig(clientId, configPayload);
          if (!configResponse) throw new Error(`Failed to create file_conversion config for ${nodeLabel}`);

          operationDetail = {
            typeInDag: "file_conversion",
            config_id: configResponse.id,
            consumedNodeIds: [writeNode.id, filterNode?.id].filter(Boolean) as string[],
          };
          processedNodeIds.add(readNode.id); // Mark read-node as processed (it's the primary for this op)
          processedNodeIds.add(writeNode.id); // Mark write-node as consumed
          if (filterNode) processedNodeIds.add(filterNode.id); // Mark filter as consumed
        } else if (writeNode && processedNodeIds.has(writeNode.id)) {
            console.warn(`Read node ${nodeLabel} points to an already consumed write node. Skipping this read node.`);
        }
      }
      else if (node.type === "copy-file") {
        if (!node.data?.source_path || !node.data?.destination_path) { /* ... validation ... */ return false; }
        cliConfigPayload = mapCopyFileToCliOperator(node);
        operationDetail = { typeInDag: "copy_file", config_id: 0 }; // Placeholder config_id, real one after creation
      }
      else if (node.type === "move-file") {
        if (!node.data?.source_path || !node.data?.destination_path) { /* ... validation ... */ return false; }
        cliConfigPayload = mapMoveFileToCliOperator(node);
        operationDetail = { typeInDag: "move_file", config_id: 0 };
      }
      else if (node.type === "rename-file") {
        if (!node.data?.source_path || !node.data?.destination_path) { /* ... validation ... */ return false; }
        cliConfigPayload = mapRenameFileToCliOperator(node);
        operationDetail = { typeInDag: "rename_file", config_id: 0 };
      }
      else if (node.type === "delete-file") {
        if (!node.data?.source_path) { /* ... validation ... */ return false; }
        cliConfigPayload = mapDeleteFileToCliOperator(node);
        operationDetail = { typeInDag: "delete_file", config_id: 0 };
      }

      // If it was a CLI operation, create its config now
      if (cliConfigPayload && operationDetail && operationDetail.typeInDag !== "file_conversion") {
        console.log(`Creating ${operationDetail.typeInDag} config for node: ${node.id}`, cliConfigPayload);
        const configResponse = await createCliOperatorConfig(clientId, cliConfigPayload);
        if (!configResponse) throw new Error(`Failed to create CLI operator config for ${operationDetail.typeInDag} node ${nodeLabel}`);
        operationDetail.config_id = configResponse.id;
        processedNodeIds.add(node.id); // Mark this CLI node as processed
      }
      
      if (operationDetail && operationDetail.config_id > 0) { // Ensure config was created
        nodeOperations.set(node.id, { ...operationDetail, nodeId: node.id });
      } else if (node.type !== "read-file" && // read-file handled above or skipped if no write-node
                 node.type !== "filter" && // filters are auxiliary or skipped if standalone
                 !processedNodeIds.has(node.id)) { // not already processed as part of FC or CLI
        console.warn(`Node ${nodeLabel} (${node.type}) was not part of any recognized and configured operation.`);
      }
    }

    if (nodeOperations.size === 0 && nodes.filter(n => n.type !== 'start' && n.type !== 'end').length > 0) {
        toast({ title: "Error", description: "No valid operations found in the workflow to execute.", variant: "destructive" });
        return false;
    }

    // --- PHASE 2: Build DAG Sequence ---
    const dagSequence: any[] = [];
    const dagTaskIds = new Set<string>(); // To track IDs of tasks added to dagSequence

    for (const uiNode of nodes) { // Iterate through all UI nodes
      let isConsumed = false;
      for (const op of nodeOperations.values()) {
        if (op.consumedNodeIds?.includes(uiNode.id)) {
          isConsumed = true;
          break;
        }
      }
      if (isConsumed) {
        console.log(`UI Node ${uiNode.id} (${uiNode.type}) is consumed, skipping direct DAG task.`);
        continue; // This UI node is part of another operation (e.g., write_file in an FC block)
      }

      const safeTaskId = makePythonSafeId(uiNode.id);
      if (dagTaskIds.has(safeTaskId)) continue; // Should not happen if logic is correct

      let taskEntry: { id: string; type: string; config_id: number; next: string[] } | null = null;
      const opDetail = nodeOperations.get(uiNode.id);

      if (uiNode.type === "start") {
        taskEntry = { id: safeTaskId, type: "start", config_id: 1, next: [] };
      } else if (uiNode.type === "end") {
        taskEntry = { id: safeTaskId, type: "end", config_id: 1, next: [] };
      } else if (opDetail) { // This UI node is the primary node for an operation
        taskEntry = {
          id: safeTaskId,
          type: opDetail.typeInDag, // DYNAMIC TYPE from Phase 1
          config_id: opDetail.config_id,
          next: [],
        };
      } else {
        // This UI node is not start/end, not a primary op node, and not consumed.
        // E.g., a standalone filter, or an unhandled operational node.
        console.warn(`UI Node ${uiNode.id} (${uiNode.type}) will not be included as a DAG task.`);
        continue;
      }

      // Determine 'next' tasks based on UI connections
      let nodeIdToTraceConnectionsFrom = uiNode.id;
      if (opDetail?.typeInDag === "file_conversion" && opDetail.consumedNodeIds) {
        const writeNodeId = opDetail.consumedNodeIds.find(id => nodes.find(n => n.id === id)?.type === 'write-file');
        if (writeNodeId) nodeIdToTraceConnectionsFrom = writeNodeId;
      }

      for (const conn of connections) {
        if (conn.sourceId === nodeIdToTraceConnectionsFrom) {
          let actualTargetUiNodeId = conn.targetId;
          // If the connection target is a consumed node, find its parent operation's primary node
          const targetConsumingOp = Array.from(nodeOperations.values()).find(op => op.consumedNodeIds?.includes(actualTargetUiNodeId));
          if (targetConsumingOp) {
            actualTargetUiNodeId = targetConsumingOp.nodeId;
          }
          
          // Check if this actualTargetUiNodeId will be a task in the DAG
          const targetUiNodeExists = nodes.find(n => n.id === actualTargetUiNodeId);
          const targetIsOperation = nodeOperations.has(actualTargetUiNodeId);
          const targetIsStartOrEnd = targetUiNodeExists && (targetUiNodeExists.type === 'start' || targetUiNodeExists.type === 'end');

          if (targetIsOperation || targetIsStartOrEnd) {
            taskEntry.next.push(makePythonSafeId(actualTargetUiNodeId));
          } else {
            console.warn(`Omitting connection from ${safeTaskId} to ${makePythonSafeId(conn.targetId)} because target UI node ${actualTargetUiNodeId} is not a valid DAG task.`);
          }
        }
      }
      dagSequence.push(taskEntry);
      dagTaskIds.add(safeTaskId);
    }
    
    // Final validation of sequence
    if (dagSequence.filter(t => t.type !== 'start' && t.type !== 'end').length === 0 && nodeOperations.size > 0) {
        toast({ title: "Error", description: "Operations were identified but could not be formed into executable DAG tasks.", variant: "destructive" });
        return false;
    }
    if (dagSequence.length < 2 && nodes.length > 0) { // At least start and end should be there if any nodes present
        toast({ title: "Error", description: "Invalid DAG sequence generated.", variant: "destructive" });
        return false;
    }


    console.log("Generated DAG Sequence:", JSON.stringify(dagSequence, null, 2));

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

// findWriteNodesInPath is not directly used by this new logic for DAG sequence building
// but can be kept if used elsewhere or for other validation purposes.
// The new logic relies on direct connections and identifying FC blocks.