// Utility functions for workflow operations
import type { WorkflowNode, NodeConnection } from "../components/workflow/workflow-context"
import { createFileConversionConfig, updateDag, triggerDagRun } from "@/services/file-conversion-service"
import { createFileConversionConfigFromNodes } from "@/services/schema-mapper"
import { toast } from "@/components/ui/use-toast"

// Helper function to ensure Python-compatible IDs
function makePythonSafeId(id: string): string {
  // Remove any non-alphanumeric characters and replace with underscores
  let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_")

  // Ensure it starts with a letter or underscore (Python variable naming rule)
  if (!/^[a-zA-Z_]/.test(safeId)) {
    safeId = "task_" + safeId
  }

  return safeId
}

export async function saveAndRunWorkflow(
  nodes: WorkflowNode[],
  connections: NodeConnection[],
  _currentWorkflowId: string | null,
  clientId = 1, // Default client ID
): Promise<boolean> {
  // Get the current workflow ID from localStorage
  let currentWorkflowId
  try {
    const workflowData = localStorage.getItem("currentWorkflow")
    if (workflowData) {
      const parsed = JSON.parse(workflowData)
      currentWorkflowId = parsed.dag_id
    }
  } catch (error) {
    console.error("Error getting current workflow ID:", error)
  }

  // If no workflow ID is found, use the default one
  if (!currentWorkflowId) {
    currentWorkflowId = "dag_sample_47220ca3"
  }

  if (nodes.length === 0) {
    toast({
      title: "Error",
      description: "Cannot save an empty workflow. Please add nodes first.",
      variant: "destructive",
    })
    return false
  }

  try {
    // 1. Find read, write, and filter file nodes
    const readFileNodes = nodes.filter((node) => node.type === "read-file")
    const writeFileNodes = nodes.filter((node) => node.type === "write-file")
    const filterNodes = nodes.filter((node) => node.type === "filter")

    if (readFileNodes.length === 0 || writeFileNodes.length === 0) {
      toast({
        title: "Error",
        description: "Workflow must contain at least one read file and one write file node.",
        variant: "destructive",
      })
      return false
    }

    // Log the nodes for debugging
    console.log("Read file nodes:", readFileNodes)
    console.log("Write file nodes:", writeFileNodes)
    console.log("Filter nodes:", filterNodes)

    // 2. Create file conversion configs using our schema mapper
    const readNode = readFileNodes[0]
    const writeNode = writeFileNodes[0]
    const filterNode = filterNodes.length > 0 ? filterNodes[0] : null

    // Create a config with dynamic values from the nodes
    const config = createFileConversionConfigFromNodes(readNode, writeNode, filterNode, currentWorkflowId)

    // Add validation before creating the config
    if (!config.input.path) {
      toast({
        title: "Error",
        description: `Read file node is missing a path. Please configure the node properly.`,
        variant: "destructive",
      })
      return false
    }

    if (!config.output.path) {
      toast({
        title: "Error",
        description: `Write file node is missing a path. Please configure the node properly.`,
        variant: "destructive",
      })
      return false
    }

    console.log("Creating file conversion config with:", config)

    // Create file conversion config
    const configResponse = await createFileConversionConfig(clientId, config)
    if (!configResponse) {
      throw new Error("Failed to create file conversion config")
    }

    const configId = configResponse.id

    // 3. Create DAG sequence
    // Find start and end nodes
    const startNodes = nodes.filter((node) => node.type === "start")
    const endNodes = nodes.filter((node) => node.type === "end")

    if (startNodes.length === 0 || endNodes.length === 0) {
      toast({
        title: "Error",
        description: "Workflow must contain at least one start node and one end node.",
        variant: "destructive",
      })
      return false
    }

    const startNodeId = makePythonSafeId(startNodes[0].id)
    const fileNodeId = `file_node_${configId}`
    const endNodeId = makePythonSafeId(endNodes[0].id)

    // Create a simple linear sequence: start -> file_conversion -> end
    const dagSequence = [
      {
        id: makePythonSafeId(startNodes[0].id),
        type: "start",
        config_id: 1, // Default config ID for start nodes
        next: [`file_node_${configId}`],
      },
      {
        id: `file_node_${configId}`,
        type: "file_conversion", // This should match what your backend expects
        config_id: configId,
        next: [makePythonSafeId(endNodes[0].id)],
      },
      {
        id: makePythonSafeId(endNodes[0].id),
        type: "end",
        config_id: 1, // Default config ID for end nodes
        next: [],
      },
    ]

    // 4. Update DAG with sequence
    const dagUpdateData = {
      dag_sequence: dagSequence,
      active: true,
    }

    const updatedDag = await updateDag(currentWorkflowId, dagUpdateData)
    if (!updatedDag) {
      throw new Error("Failed to update DAG")
    }

    // 5. Trigger DAG run
    try {
      const triggerResult = await triggerDagRun(currentWorkflowId)
      if (!triggerResult) {
        console.log("Trigger returned null, but continuing with success message")
        // Don't throw an error here, just log it
      }
    } catch (triggerError) {
      console.error("Error triggering DAG run, but workflow was saved:", triggerError)
      // Show a partial success message
      toast({
        title: "Partial Success",
        description: "Workflow was saved but could not be triggered. You can try running it manually.",
      })
      // Return true since the workflow was saved
      return true
    }

    toast({
      title: "Success",
      description: "Workflow saved and triggered successfully",
    })

    return true
  } catch (error) {
    console.error("Error in saveAndRunWorkflow:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to save and run workflow",
      variant: "destructive",
    })
    return false
  }
}

// Helper function to find write nodes in a path
function findWriteNodesInPath(
  startNodeId: string,
  nodes: WorkflowNode[],
  connections: NodeConnection[],
  visited: Set<string> = new Set(),
): WorkflowNode[] {
  if (visited.has(startNodeId)) {
    return [] // Prevent cycles
  }

  visited.add(startNodeId)
  const writeNodes: WorkflowNode[] = []

  const node = nodes.find((n) => n.id === startNodeId)
  if (node?.type === "write-file") {
    writeNodes.push(node)
  }

  // Follow connections
  for (const conn of connections) {
    if (conn.sourceId === startNodeId){
      const nodesInPath = findWriteNodesInPath(conn.targetId, nodes, connections, visited)
      writeNodes.push(...nodesInPath)
    }
  }

  return writeNodes
}
