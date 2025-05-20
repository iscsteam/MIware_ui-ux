import type { WorkflowNode, NodeConnection } from "../components/workflow/workflow-context"
import { createFileConversionConfig, updateDag, triggerDagRun } from "@/services/file-conversion-service"
import {
  createFileConversionConfigFromNodes,
  mapCopyFileToCliOperator,
  mapRenameFileToCliOperator,
  mapDeleteFileToCliOperator,
} from "@/services/schema-mapper"
import { createCliOperatorConfig } from "@/services/cli-operator-service"
import { toast } from "@/components/ui/use-toast"
//hi
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

// Example function (to be expanded upon):
export const getNodesByType = (nodes: any[], type: string): any[] => {
  return nodes.filter((node) => node.type === type)
}

export const getAllNodeIds = (nodes: any[]): string[] => {
  return nodes.map((node) => node.id)
}

export const filterNodes = (nodes: any[], searchTerm: string): any[] => {
  return nodes.filter((node) => node.data.label.toLowerCase().includes(searchTerm.toLowerCase()))
}

export const getNodeById = (nodes: any[], id: string): any | undefined => {
  return nodes.find((node) => node.id === id)
}

export const getNodesAndEdges = (workflowData: any) => {
  const nodes = workflowData?.nodes || []
  const edges = workflowData?.edges || []
  return { nodes, edges }
}

export const getNodeTypes = (nodes: any[]) => {
  const inputNodes = nodes.filter((node) => node.type === "input")
  const outputNodes = nodes.filter((node) => node.type === "output")
  const processingNodes = nodes.filter((node) => node.type === "processing")
  const conditionNodes = nodes.filter((node) => node.type === "condition")
  const apiCallNodes = nodes.filter((node) => node.type === "api-call")
  const webhookNodes = nodes.filter((node) => node.type === "webhook")
  const emailNodes = nodes.filter((node) => node.type === "email")
  const delayNodes = nodes.filter((node) => node.type === "delay")
  const manualTaskNodes = nodes.filter((node) => node.type === "manual-task")
  const deleteFileNodes = nodes.filter((node) => node.type === "delete-file")

  return {
    inputNodes,
    outputNodes,
    processingNodes,
    conditionNodes,
    apiCallNodes,
    webhookNodes,
    emailNodes,
    delayNodes,
    manualTaskNodes,
    deleteFileNodes,
  }
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

    // Check for the type of workflow
    const readFileNodes = nodes.filter((node) => node.type === "read-file")
    const writeFileNodes = nodes.filter((node) => node.type === "write-file")
    const copyFileNodes = nodes.filter((node) => node.type === "copy-file")
    const renameFileNodes = nodes.filter((node) => node.type === "rename-file")
    const deleteFileNodes = nodes.filter((node) => node.type === "delete-file")
    const filterNodes = nodes.filter((node) => node.type === "filter")

    let dagSequence = []
    let configId: number

    // Handle file conversion workflow
    if (readFileNodes.length > 0 && writeFileNodes.length > 0) {
      // Create file conversion config
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

      configId = configResponse.id

      // Create a simple linear sequence: start -> file_conversion -> end
      dagSequence = [
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
    }
    // Handle CLI operator workflow (copy file)
    else if (copyFileNodes.length > 0) {
      const copyNode = copyFileNodes[0]

      // Validate copy node data
      if (!copyNode.data.source_path) {
        toast({
          title: "Error",
          description: `Copy file node is missing a source path. Please configure the node properly.`,
          variant: "destructive",
        })
        return false
      }

      if (!copyNode.data.destination_path) {
        toast({
          title: "Error",
          description: `Copy file node is missing a destination path. Please configure the node properly.`,
          variant: "destructive",
        })
        return false
      }

      // Map copy file node to CLI operator config
      const cliConfig = mapCopyFileToCliOperator(copyNode)
      console.log("Creating CLI operator config with:", cliConfig)

      // Create CLI operator config
      const configResponse = await createCliOperatorConfig(2, cliConfig) // Using client ID 2 as specified
      if (!configResponse) {
        throw new Error("Failed to create CLI operator config")
      }

      configId = configResponse.id

      // Create a simple linear sequence: start -> cli_operator -> end
      dagSequence = [
        {
          id: makePythonSafeId(startNodes[0].id),
          type: "start",
          config_id: 1, // Default config ID for start nodes
          next: [`file_node_${configId}`],
        },
        {
          id: `file_node_${configId}`,
          type: "cli_operator", // CLI operator type
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
    }
    // Handle CLI operator workflow (rename file)
    else if (renameFileNodes.length > 0) {
      const renameNode = renameFileNodes[0]

      // Validate rename node data
      if (!renameNode.data.source_path) {
        toast({
          title: "Error",
          description: `Rename file node is missing a source path. Please configure the node properly.`,
          variant: "destructive",
        })
        return false
      }

      if (!renameNode.data.destination_path) {
        toast({
          title: "Error",
          description: `Rename file node is missing a destination path. Please configure the node properly.`,
          variant: "destructive",
        })
        return false
      }

      // Map rename file node to CLI operator config
      const cliConfig = mapRenameFileToCliOperator(renameNode)
      console.log("Creating CLI operator config with:", cliConfig)

      // Create CLI operator config
      const configResponse = await createCliOperatorConfig(2, cliConfig) // Using client ID 2 as specified
      if (!configResponse) {
        throw new Error("Failed to create CLI operator config")
      }

      configId = configResponse.id

      // Create a simple linear sequence: start -> cli_operator -> end
      dagSequence = [
        {
          id: makePythonSafeId(startNodes[0].id),
          type: "start",
          config_id: 1, // Default config ID for start nodes
          next: [`file_node_${configId}`],
        },
        {
          id: `file_node_${configId}`,
          type: "cli_operator", // CLI operator type
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
    }
    // Handle CLI operator workflow (delete file)
    else if (deleteFileNodes.length > 0) {
      const deleteNode = deleteFileNodes[0]

      // Validate delete node data
      if (!deleteNode.data.source_path) {
        toast({
          title: "Error",
          description: `Delete file node is missing a source path. Please configure the node properly.`,
          variant: "destructive",
        })
        return false
      }

      // Map delete file node to CLI operator config
      const cliConfig = mapDeleteFileToCliOperator(deleteNode)
      console.log("Creating CLI operator config with:", cliConfig)

      // Create CLI operator config
      const configResponse = await createCliOperatorConfig(2, cliConfig) // Using client ID 2 as specified
      if (!configResponse) {
        throw new Error("Failed to create CLI operator config")
      }

      configId = configResponse.id

      // Create a simple linear sequence: start -> cli_operator -> end
      dagSequence = [
        {
          id: makePythonSafeId(startNodes[0].id),
          type: "start",
          config_id: 1, // Default config ID for start nodes
          next: [`file_node_${configId}`],
        },
        {
          id: `file_node_${configId}`,
          type: "cli_operator", // CLI operator type
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
    } else {
      toast({
        title: "Error",
        description:
          "Workflow must contain either read/write file nodes, a copy file node, a rename file node, or a delete file node.",
        variant: "destructive",
      })
      return false
    }

    // Update DAG with sequence
    const dagUpdateData = {
      dag_sequence: dagSequence,
      active: true,
    }

    const updatedDag = await updateDag(currentWorkflowId, dagUpdateData)
    if (!updatedDag) {
      throw new Error("Failed to update DAG")
    }

    // Trigger DAG run
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
    if (conn.sourceId === startNodeId) {
      const nodesInPath = findWriteNodesInPath(conn.targetId, nodes, connections, visited)
      writeNodes.push(...nodesInPath)
    }
  }

  return writeNodes
}
