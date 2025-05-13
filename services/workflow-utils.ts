// // Utility functions for workflow operations
// import type { WorkflowNode, NodeConnection } from "../components/workflow/workflow-context"
// import { createFileConversionConfig, updateDag, triggerDagRun } from "@/services/file-conversion-service"
// import { toast } from "@/components/ui/use-toast"

// // Default spark config
// const DEFAULT_SPARK_CONFIG = {
//   executor_instances: 1,
//   executor_cores: 1,
//   executor_memory: "512m",
//   driver_memory: "512m",
//   driver_cores: 1,
// }

// export async function saveAndRunWorkflow(
//   nodes: WorkflowNode[],
//   connections: NodeConnection[],
//   currentWorkflowId: string | null,
//   clientId = 1, // Default client ID
// ): Promise<boolean> {
//   if (!currentWorkflowId) {
//     toast({
//       title: "Error",
//       description: "No active workflow to save. Please create a workflow first.",
//       variant: "destructive",
//     })
//     return false
//   }

//   if (nodes.length === 0) {
//     toast({
//       title: "Error",
//       description: "Cannot save an empty workflow. Please add nodes first.",
//       variant: "destructive",
//     })
//     return false
//   }

//   try {
//     // 1. Find read and write file nodes
//     const readFileNodes = nodes.filter((node) => node.type === "read-file")
//     const writeFileNodes = nodes.filter((node) => node.type === "write-file")

//     if (readFileNodes.length === 0 || writeFileNodes.length === 0) {
//       toast({
//         title: "Error",
//         description: "Workflow must contain at least one read file and one write file node.",
//         variant: "destructive",
//       })
//       return false
//     }

//     // 2. Create file conversion configs for each read-write pair
//     const configPromises = []
//     const nodeConfigMap = new Map()

//     for (const readNode of readFileNodes) {
//       // Find connected write nodes
//       const connectedWriteNodes = []

//       // Find direct connections
//       for (const conn of connections) {
//         if (conn.sourceId === readNode.id) {
//           // Find if target is write node or leads to write node
//           const targetNode = nodes.find((n) => n.id === conn.targetId)
//           if (targetNode?.type === "write-file") {
//             connectedWriteNodes.push(targetNode)
//           } else {
//             // Follow the path to find write nodes
//             const writeNodesInPath = findWriteNodesInPath(conn.targetId, nodes, connections)
//             connectedWriteNodes.push(...writeNodesInPath)
//           }
//         }
//       }

//       // Create config for each read-write pair
//       for (const writeNode of connectedWriteNodes) {
//         const config = {
//           input: {
//             provider: readNode.data?.provider || "local",
//             format: readNode.data?.format || "csv",
//             path: readNode.data?.path || "",
//             options: {
//               rowTag: "Record",
//               rootTag: "Records",
//             },
//           },
//           output: {
//             provider: writeNode.data?.provider || "local",
//             format: writeNode.data?.format || "json",
//             path: writeNode.data?.path || "",
//             mode: writeNode.data?.mode || "overwrite",
//             options: {},
//           },
//           spark_config: DEFAULT_SPARK_CONFIG,
//           dag_id: currentWorkflowId,
//         }

//         // Create file conversion config
//         const configPromise = createFileConversionConfig(clientId, config).then((response) => {
//           if (response) {
//             // Store the mapping between nodes and config
//             nodeConfigMap.set(`${readNode.id}-${writeNode.id}`, {
//               configId: response.id,
//               readNodeId: readNode.id,
//               writeNodeId: writeNode.id,
//             })
//             return response
//           }
//           return null
//         })

//         configPromises.push(configPromise)
//       }
//     }

//     // Wait for all configs to be created
//     const configResults = await Promise.all(configPromises)
//     if (configResults.some((result) => result === null)) {
//       throw new Error("Failed to create one or more file conversion configs")
//     }

//     // 3. Create DAG sequence
//     const dagSequence = []

//     // Add start nodes
//     const startNodes = nodes.filter((node) => node.type === "start")
//     for (const startNode of startNodes) {
//       const nextNodes = []
//       for (const conn of connections) {
//         if (conn.sourceId === startNode.id) {
//           nextNodes.push(conn.targetId)
//         }
//       }

//       dagSequence.push({
//         id: startNode.id,
//         type: "start",
//         config_id: 1, // Default config ID for start nodes
//         next: nextNodes,
//       })
//     }

//     // Add file conversion nodes
//     for (const [key, value] of nodeConfigMap.entries()) {
//       const { configId, readNodeId, writeNodeId } = value

//       // Find next nodes from write node
//       const nextNodes = []
//       for (const conn of connections) {
//         if (conn.sourceId === writeNodeId) {
//           nextNodes.push(conn.targetId)
//         }
//       }

//       dagSequence.push({
//         id: `file_node_${configId}`,
//         type: "file_conversion",
//         config_id: configId,
//         next: nextNodes,
//       })
//     }

//     // Add end nodes
//     const endNodes = nodes.filter((node) => node.type === "end")
//     for (const endNode of endNodes) {
//       dagSequence.push({
//         id: endNode.id,
//         type: "end",
//         config_id: 1, // Default config ID for end nodes
//         next: [],
//       })
//     }

//     // 4. Update DAG with sequence
//     const dagUpdateData = {
//       dag_sequence: dagSequence,
//       active: true,
//     }

//     const updatedDag = await updateDag(currentWorkflowId, dagUpdateData)
//     if (!updatedDag) {
//       throw new Error("Failed to update DAG")
//     }

//     // 5. Trigger DAG run
//     const triggerResult = await triggerDagRun(currentWorkflowId)
//     if (!triggerResult) {
//       throw new Error("Failed to trigger DAG run")
//     }

//     toast({
//       title: "Success",
//       description: "Workflow saved and triggered successfully",
//     })

//     return true
//   } catch (error) {
//     console.error("Error in saveAndRunWorkflow:", error)
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to save and run workflow",
//       variant: "destructive",
//     })
//     return false
//   }
// }

// // Helper function to find write nodes in a path
// function findWriteNodesInPath(
//   startNodeId: string,
//   nodes: WorkflowNode[],
//   connections: NodeConnection[],
//   visited: Set<string> = new Set(),
// ): WorkflowNode[] {
//   if (visited.has(startNodeId)) {
//     return [] // Prevent cycles
//   }

//   visited.add(startNodeId)
//   const writeNodes: WorkflowNode[] = []

//   const node = nodes.find((n) => n.id === startNodeId)
//   if (node?.type === "write-file") {
//     writeNodes.push(node)
//   }

//   // Follow connections
//   for (const conn of connections) {
//     if (conn.sourceId === startNodeId) {
//       const nodesInPath = findWriteNodesInPath(conn.targetId, nodes, connections, visited)
//       writeNodes.push(...nodesInPath)
//     }
//   }

//   return writeNodes
// }

// Service for handling file conversion configurations
// import { toast } from "@/components/ui/use-toast"

// const baseUrl = process.env.NEXT_PUBLIC_USER_API_END_POINT

// export interface FileConversionConfig {
//   input: {
//     provider: string
//     format: string
//     path: string
//     options?: Record<string, any>
//   }
//   output: {
//     provider: string
//     format: string
//     path: string
//     mode: string
//     options?: Record<string, any>
//   }
//   spark_config?: {
//     executor_instances: number
//     executor_cores: number
//     executor_memory: string
//     driver_memory: string
//     driver_cores: number
//   }
//   dag_id?: string
// }

// export interface FileConversionConfigResponse extends FileConversionConfig {
//   id: number
//   client_id: number
//   created_at: string
//   updated_at: string
// }

// export async function createFileConversionConfig(
//   clientId: number,
//   config: FileConversionConfig,
// ): Promise<FileConversionConfigResponse | null> {
//   try {
//     console.log("Creating file conversion config:", JSON.stringify(config, null, 2))

//     const response = await fetch(`${baseUrl}/clients/1/file_conversion_configs`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(config),
//     })

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
//       throw new Error(errorData.detail || `Failed to create file conversion config: ${response.status}`)
//     }

//     const data = await response.json()
//     console.log("File conversion config created successfully:", data)
//     return data
//   } catch (error) {
//     console.error("Error creating file conversion config:", error)
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to create file conversion config",
//       variant: "destructive",
//     })
//     return null
//   }
// }

// export async function updateDag(
//   dagId: string,
//   data: {
//     name?: string
//     schedule?: string
//     dag_sequence?: Array<{
//       id: string
//       type: string
//       config_id: number
//       next: string[]
//     }>
//     active?: boolean
//   },
// ): Promise<any> {
//   try {
//     console.log("Updating DAG:", JSON.stringify(data, null, 2))

//     const response = await fetch(`${baseUrl}/dags/dag_test1q_95d90bc6`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     })

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
//       throw new Error(errorData.detail || `Failed to update DAG: ${response.status}`)
//     }

//     const result = await response.json()
//     console.log("DAG updated successfully:", result)
//     return result
//   } catch (error) {
//     console.error("Error updating DAG:", error)
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to update DAG",
//       variant: "destructive",
//     })
//     return null
//   }
// }

// export async function triggerDagRun(dagId: string): Promise<any> {
//   try {
//     console.log("Triggering DAG run for:", dagId)

//     // The URL should match the FastAPI router endpoint
//     // The router is likely mounted under a prefix like /api
//     const response = await fetch(`${baseUrl}/dag_runs/dag_test1q_95d90bc6/trigger_run`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         conf: {}, // Send an empty object or required configuration
//         force_stop: false, // Optional: Add this if necessary
//       }),
//     })

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
//       throw new Error(errorData.detail || `Failed to trigger DAG run: ${response.status}`)
//     }

//     const result = await response.json()
//     console.log("DAG run triggered successfully:", result)
//     return result
//   } catch (error) {
//     console.error("Error triggering DAG run:", error)
//     toast({
//       title: "Error",
//       description: error instanceof Error ? error.message : "Failed to trigger DAG run",
//       variant: "destructive",
//     })
//     return null
//   }
// }
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
    const currentWorkflowId = "dag_test_bdaa1681";
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
