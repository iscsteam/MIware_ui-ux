
// Utility functions for workflow operations
import type { WorkflowNode, NodeConnection } from "@/components/workflow/workflow-context"
import { createFileConversionConfig, updateDag, triggerDagRun } from "@/services/file-conversion-service"
import { toast } from "@/components/ui/use-toast"

// Default spark config
const DEFAULT_SPARK_CONFIG = {
  executor_instances: 1,
  executor_cores: 1,
  executor_memory: "512m",
  driver_memory: "512m",
  driver_cores: 1,
}

export async function saveAndRunWorkflow(
  nodes: WorkflowNode[],
  connections: NodeConnection[],
  _currentWorkflowId: string | null,
  clientId = 1, // Default client ID
): Promise<boolean> {
    const currentWorkflowId = "dag_test14_65308242";
  if (!currentWorkflowId) {
    toast({
      title: "Error",
      description: "No active workflow to save. Please create a workflow first.",
      variant: "destructive",
    })
    return false
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
    // 1. Find read and write file nodes
    const readFileNodes = nodes.filter((node) => node.type === "read-file")
    const writeFileNodes = nodes.filter((node) => node.type === "write-file")

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

    // 2. Create file conversion configs for each read-write pair
    const configPromises = []
    const nodeConfigMap = new Map()

    // For simplicity, let's just connect the first read node to the first write node
    // This can be enhanced later to follow actual connections
    const readNode = readFileNodes[0]
    const writeNode = writeFileNodes[0]

    // Create a single config for the read-write pair
    const config = {
      input: {
        provider: readNode.data?.provider || "local",
        format: readNode.data?.format || "csv",
        path: readNode.data?.path || "", // Use path instead of filename
        options: {
          rowTag: "Record",
          rootTag: "Records",
        },
      },
      output: {
        provider: writeNode.data?.provider || "local",
        format: writeNode.data?.format || "json",
        path: writeNode.data?.path || "", // Use path instead of filename
        mode: writeNode.data?.mode || "overwrite",
        options: {},
      },
      spark_config: DEFAULT_SPARK_CONFIG,
      dag_id: currentWorkflowId,
    }

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

    // Create a simple linear sequence: start -> file_conversion -> end
    const dagSequence = [
      {
        id: startNodes[0].id,
        type: "start",
        config_id: 1, // Default config ID for start nodes
        next: [`file_node_${configId}`],
      },
      {
        id: `file_node_${configId}`,
        type: "file_conversion", // This should match what your backend expects
        config_id: configId,
        next: [endNodes[0].id],
      },
      {
        id: endNodes[0].id,
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
    const triggerResult = await triggerDagRun(currentWorkflowId)
    if (!triggerResult) {
      throw new Error("Failed to trigger DAG run")
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
    if (conn.sourceId === startNodeId) {
      const nodesInPath = findWriteNodesInPath(conn.targetId, nodes, connections, visited)
      writeNodes.push(...nodesInPath)
    }
  }

  return writeNodes
}
