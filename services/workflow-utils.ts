// In workflow-utils.ts

import type { WorkflowNode, NodeConnection } from "@/components/workflow/workflow-context";
import { createFileConversionConfig, updateDag, triggerDagRun } from "@/services/file-conversion-service";
import { toast } from "@/components/ui/use-toast";

const DEFAULT_SPARK_CONFIG = { /* ... */ };
const sanitizeNodeIdForDag = (id: string) => id.replace(/-/g, "_");

// YOU MUST IMPLEMENT THIS: To get name and schedule for the DAG being updated
const getCurrentWorkflowMetadata = (dagId: string | null, nodes: WorkflowNode[]) => {
  // Option 1: Try to find a "currentWorkflow" object in localStorage that has these details
  const workflowDataString = localStorage.getItem("currentWorkflow");
  let name = `Workflow ${dagId || 'Default'}`;
  let schedule = "0 0 * * *"; // Default fallback

  if (workflowDataString) {
    try {
      const parsedWorkflow = JSON.parse(workflowDataString);
      if (parsedWorkflow.dag_id === dagId) { // Make sure it's for the current DAG
        if (parsedWorkflow.name) name = parsedWorkflow.name;
        if (parsedWorkflow.schedule) schedule = parsedWorkflow.schedule;
      }
    } catch (e) {
      console.warn("Could not parse currentWorkflow for metadata", e);
    }
  }
  // Option 2: If the DAG's name/schedule were loaded into the context's state, get them from there.
  // Option 3: If the 'nodes' array itself contains a special node or metadata property.

  console.log(`getCurrentWorkflowMetadata for DAG ${dagId}: Name='${name}', Schedule='${schedule}'`);
  return { name, schedule };
};


export async function saveAndRunWorkflow(
  nodes: WorkflowNode[],
  connections: NodeConnection[],
  dagId: string | null,
  clientId: string | number
): Promise<boolean> {
  console.log(`saveAndRunWorkflow util (linear fixed): Received dagId: ${dagId}, clientId: ${clientId}`);
  // ... (Validations for dagId, clientId, nodes.length)

  try {
    const readFileNodes = nodes.filter((node) => node.type === "read-file");
    const writeFileNodes = nodes.filter((node) => node.type === "write-file");
    const startUiNodes = nodes.filter((node) => node.type === "start"); // Get UI start nodes
    const endUiNodes = nodes.filter((node) => node.type === "end");     // Get UI end nodes

    if (readFileNodes.length === 0 || writeFileNodes.length === 0) { /* ...error... */ return false; }
    if (startUiNodes.length === 0 || endUiNodes.length === 0) { /* ...error... */ return false; }

    const readNode = readFileNodes[0];
    const writeNode = writeFileNodes[0];
    const startNode = startUiNodes[0]; // The actual start node from UI
    const endNode = endUiNodes[0];     // The actual end node from UI

    // --- Get existing config_id for start and end nodes ---
    // ASSUMPTION: originalConfigId is stored in node.data when workflow is loaded
    const startNodeExistingConfigId = startNode.data?.originalConfigId as number | undefined;
    const endNodeExistingConfigId = endNode.data?.originalConfigId as number | undefined;

    if (typeof startNodeExistingConfigId !== 'number') {
      console.warn(`Start node ${startNode.id} missing originalConfigId. Defaulting to 1 for PUT. Ensure nodes load with their config_ids.`);
      // throw new Error(`Start node ${startNode.id} is missing its original backend config_id.`); // Or be stricter
    }
    if (typeof endNodeExistingConfigId !== 'number') {
      console.warn(`End node ${endNode.id} missing originalConfigId. Defaulting to 1 for PUT.`);
      // throw new Error(`End node ${endNode.id} is missing its original backend config_id.`);
    }
    // Use fetched/stored ID or fallback to 1 (ensure '1' is a valid default if original is missing)
    const startConfigIdForPut = typeof startNodeExistingConfigId === 'number' ? startNodeExistingConfigId : 1;
    const endConfigIdForPut = typeof endNodeExistingConfigId === 'number' ? endNodeExistingConfigId : 1;


    const configForApi = { // Renamed to avoid conflict with 'config' module if any
      input: { provider: readNode.data?.provider || "local", /* ... */ path: readNode.data?.path || "" },
      output: { provider: writeNode.data?.provider || "local", /* ... */ path: writeNode.data?.path || "" },
      spark_config: DEFAULT_SPARK_CONFIG,
      dag_id: dagId,
    };

    if (!configForApi.input.path) { /* ...error... */ return false; }
    if (!configForApi.output.path) { /* ...error... */ return false; }

    console.log(`Calling createFileConversionConfig with clientId: ${clientId}, config:`, configForApi);
    const configResponse = await createFileConversionConfig(String(clientId), configForApi);
    if (!configResponse || !configResponse.id) { throw new Error("Failed to create file conv config or ID missing."); }
    const newFileConvConfigId = configResponse.id; // This is an integer

    // Use the actual IDs of the start/end nodes from the UI for the sequence
    const dagSequence = [
      {
        id: sanitizeNodeIdForDag(startNode.id), // Use actual start node ID
        type: "start",
        config_id: startConfigIdForPut,       // USE EXISTING/DEFAULT INTEGER CONFIG ID
        next: [sanitizeNodeIdForDag(`file_node_${newFileConvConfigId}`)], // Link to the new file_conv task
      },
      {
        id: sanitizeNodeIdForDag(`file_node_${newFileConvConfigId}`), // ID for the new file_conv task
        type: "file_conversion",
        config_id: newFileConvConfigId,       // Use newly created config ID (integer)
        next: [sanitizeNodeIdForDag(endNode.id)], // Link to actual end node ID
      },
      {
        id: sanitizeNodeIdForDag(endNode.id),   // Use actual end node ID
        type: "end",
        config_id: endConfigIdForPut,         // USE EXISTING/DEFAULT INTEGER CONFIG ID
        next: [],
      },
    ];

    // Get DAG metadata
    const { name: workflowName, schedule: workflowSchedule } = getCurrentWorkflowMetadata(dagId, nodes);

    const dagUpdateData = {
      name: workflowName,         // ADDED
      schedule: workflowSchedule, // ADDED
      dag_sequence: dagSequence,
      active: true,
    };

    console.log(`Updating DAG ${dagId} with sequence (linear fixed):`, JSON.stringify(dagUpdateData, null, 2));
    const updatedDag = await updateDag(dagId, dagUpdateData); // updateDag is from file-conversion-service.ts
    if (!updatedDag) { // This implies updateDag returned null (likely due to its own error handling for non-OK response)
      throw new Error("Failed to update DAG with new sequence."); // This is line 168 in your trace
    }

    console.log(`Triggering DAG run for ${dagId}`);
    const triggerResult = await triggerDagRun(dagId);
    if (!triggerResult) { throw new Error("Failed to trigger DAG run."); }

    toast({ title: "Success", description: "Workflow saved and run triggered successfully." });
    return true;
  } catch (error) {
    console.error("Error in saveAndRunWorkflow utility (linear fixed):", error);
    toast({
      title: "Operation Failed",
      description: error instanceof Error ? error.message : "Failed to save and run workflow.",
      variant: "destructive",
    });
    return false;
  }
}

// The findWriteNodesInPath helper function seems unused in this simplified linear flow.
// If you intend to build more complex DAG sequences based on actual node connections,
// you'll need a more sophisticated way to traverse the graph (nodes and connections)
// and map them to the backend's DAG sequence structure.
// For now, it's commented out if not directly used by the above logic.
/*
function findWriteNodesInPath(
  startNodeId: string,
  nodes: WorkflowNode[],
  connections: NodeConnection[],
  visited: Set<string> = new Set(),
): WorkflowNode[] {
  // ... (implementation)
}
*/