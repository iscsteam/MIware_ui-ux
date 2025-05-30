// //enhanced-workflow-utils.tsx
// // Enhanced workflow utilities for dynamic file conversion
// import type { WorkflowNode, NodeConnection } from "@/components/workflow/workflow-context"
// import { createFileConversionConfig, updateDag, triggerDagRun } from "@/services/file-conversion-service"
// import { createFileConversionConfigFromNodes } from "@/services/schema-mapper"
// import {
//   createCliOperatorConfig,
//   mapCopyFileToCliOperator,
//   mapMoveFileToCliOperator,
//   mapRenameFileToCliOperator,
//   mapDeleteFileToCliOperator,
// } from "@/services/cli-operator-service"
// import { toast } from "@/components/ui/use-toast"
// import { getCurrentClientId } from "@/components/workflow/workflow-context"

// // Helper function to ensure Python-compatible IDs
// function makePythonSafeId(id: string): string {
//   let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_")
//   if (!/^[a-zA-Z_]/.test(safeId)) {
//     safeId = "task_" + safeId
//   }
//   return safeId
// }

// // Interface for file conversion sequence
// interface FileConversionSequence {
//   readNode: WorkflowNode
//   writeNode: WorkflowNode
//   filterNode?: WorkflowNode
//   sequenceIndex: number
// }

// // Find the next node in the workflow based on connections
// function findNextNode(
//   currentNodeId: string,
//   connections: NodeConnection[],
//   nodes: WorkflowNode[],
// ): WorkflowNode | null {
//   const connection = connections.find((conn) => conn.sourceId === currentNodeId)
//   if (!connection) return null

//   return nodes.find((node) => node.id === connection.targetId) || null
// }

// // Find all file conversion sequences in the workflow
// function findFileConversionSequences(nodes: WorkflowNode[], connections: NodeConnection[]): FileConversionSequence[] {
//   const sequences: FileConversionSequence[] = []
//   const readFileNodes = nodes.filter((node) => node.type === "read-file")

//   let sequenceIndex = 0

//   for (const readNode of readFileNodes) {
//     let currentNode: WorkflowNode | null = readNode
//     let writeNode: WorkflowNode | null = null
//     let filterNode: WorkflowNode | null = null

//     // Traverse from read node to find write node
//     while (currentNode) {
//       const nextNode = findNextNode(currentNode.id, connections, nodes)

//       if (!nextNode) break

//       if (nextNode.type === "write-file") {
//         writeNode = nextNode

//         // Check if there's a filter node after write node
//         const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes)
//         if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
//           filterNode = nodeAfterWrite
//         }

//         // Create sequence
//         sequences.push({
//           readNode,
//           writeNode,
//           filterNode,
//           sequenceIndex: sequenceIndex++,
//         })

//         break
//       } else if (nextNode.type === "filter") {
//         // Filter node before write node
//         filterNode = nextNode
//         currentNode = nextNode
//       } else {
//         currentNode = nextNode
//       }
//     }
//   }
//   return sequences
// }

// // Create DAG sequence for multiple file conversions
// function createMultipleFileConversionDagSequence(
//   configIds: number[],
//   startNode: WorkflowNode,
//   endNode: WorkflowNode,
// ): any[] {
//   const dagSequence: any[] = []

//   // Start node
//   const firstConfigId = configIds[0]
//   dagSequence.push({
//     id: makePythonSafeId(startNode.id),
//     type: "start",
//     config_id: 1,
//     next: [`file_node_${firstConfigId}`],
//   })

//   // File conversion nodes
//   for (let i = 0; i < configIds.length; i++) {
//     const configId = configIds[i]
//     const nextConfigId = configIds[i + 1]

//     const nextNodeId = nextConfigId ? [`file_node_${nextConfigId}`] : [makePythonSafeId(endNode.id)]

//     dagSequence.push({
//       id: `file_node_${configId}`,
//       type: "file_conversion",
//       config_id: configId,
//       next: nextNodeId,
//     })
//   }

//   // End node
//   dagSequence.push({
//     id: makePythonSafeId(endNode.id),
//     type: "end",
//     config_id: 1,
//     next: [],
//   })

//   return dagSequence
// }

// // Enhanced save and run workflow function
// export async function saveAndRunWorkflow(
//   nodes: WorkflowNode[],
//   connections: NodeConnection[],
//   currentWorkflowId: string | null,
// ): Promise<boolean> {
//   const dynamicClientIdString = getCurrentClientId()
//   if (!dynamicClientIdString) {
//     toast({
//       title: "Error",
//       description: "Client ID not found. Please ensure you're logged in.",
//       variant: "destructive",
//     })
//     return false
//   }

//   const clientId = Number.parseInt(dynamicClientIdString, 10)
//   if (isNaN(clientId)) {
//     toast({
//       title: "Error",
//       description: "Invalid client ID format.",
//       variant: "destructive",
//     })
//     return false
//   }

//   if (!currentWorkflowId) {
//     toast({
//       title: "Error",
//       description: "Workflow ID is required to save and run the workflow.",
//       variant: "destructive",
//     })
//     return false
//   }

//   if (nodes.length === 0) {
//     toast({
//       title: "Error",
//       description: "Workflow must contain at least one node.",
//       variant: "destructive",
//     })
//     return false
//   }

//   try {
//     const startNodes = nodes.filter((node) => node.type === "start")
//     const endNodes = nodes.filter((node) => node.type === "end")

//     if (startNodes.length === 0 || endNodes.length === 0) {
//       toast({
//         title: "Error",
//         description: "Workflow must have both start and end nodes.",
//         variant: "destructive",
//       })
//       return false
//     }

//     // Check for different types of workflows
//     const fileConversionSequences = findFileConversionSequences(nodes, connections)
//     const copyFileNodes = nodes.filter((node) => node.type === "copy-file")
//     const moveFileNodes = nodes.filter((node) => node.type === "move-file")
//     const renameFileNodes = nodes.filter((node) => node.type === "rename-file")
//     const deleteFileNodes = nodes.filter((node) => node.type === "delete-file")

//     let dagSequence: any[] = []
//     let operationTypeForDag: "file_conversion" | "cli_operator" | null = null

//     // --- MULTIPLE FILE CONVERSION WORKFLOW ---
//     if (fileConversionSequences.length > 0) {
//       operationTypeForDag = "file_conversion"
//       const configIds: number[] = []

//       console.log(`Found ${fileConversionSequences.length} file conversion sequences`)

//       // Create configs for all file conversion sequences
//       for (const sequence of fileConversionSequences) {
//         const { readNode, writeNode, filterNode } = sequence

//         // Validate required paths
//         if (!readNode.data.path || !writeNode.data.path) {
//           toast({
//             title: "Error",
//             description: `File conversion sequence ${sequence.sequenceIndex + 1} is missing required file paths.`,
//             variant: "destructive",
//           })
//           return false
//         }

//         // Create config payload
//         const configPayload = createFileConversionConfigFromNodes(
//           readNode,
//           writeNode,
//           filterNode || null,
//           currentWorkflowId,
//         )

//         console.log(`Creating file conversion config ${sequence.sequenceIndex + 1}:`, configPayload)

//         // Create the config
//         const configResponse = await createFileConversionConfig(clientId, configPayload)
//         if (!configResponse) {
//           throw new Error(`Failed to create file conversion config for sequence ${sequence.sequenceIndex + 1}`)
//         }

//         configIds.push(configResponse.id)
//         console.log(`Created config ${configResponse.id} for sequence ${sequence.sequenceIndex + 1}`)
//       }

//       // Create DAG sequence for multiple file conversions
//       dagSequence = createMultipleFileConversionDagSequence(configIds, startNodes[0], endNodes[0])

//       console.log("Generated DAG sequence for multiple file conversions:", dagSequence)
//     }
//     // --- SINGLE CLI OPERATION WORKFLOWS ---
//     else if (copyFileNodes.length > 0) {
//       operationTypeForDag = "cli_operator"
//       const copyNode = copyFileNodes[0]

//       if (!copyNode.data.source_path || !copyNode.data.destination_path) {
//         toast({
//           title: "Error",
//           description: "Copy file node requires both source and destination paths.",
//           variant: "destructive",
//         })
//         return false
//       }

//       const cliConfigPayload = mapCopyFileToCliOperator(copyNode)
//       console.log("Creating CLI operator config (copy) with:", cliConfigPayload)

//       const configResponse = await createCliOperatorConfig(clientId, cliConfigPayload)
//       if (!configResponse) {
//         throw new Error("Failed to create CLI operator config for copy operation")
//       }

//       // Create simple DAG sequence for single CLI operation
//       dagSequence = [
//         {
//           id: makePythonSafeId(startNodes[0].id),
//           type: "start",
//           config_id: 1,
//           next: [`cli_op_node_${configResponse.id}`],
//         },
//         {
//           id: `cli_op_node_${configResponse.id}`,
//           type: "cli_operator",
//           config_id: configResponse.id,
//           next: [makePythonSafeId(endNodes[0].id)],
//         },
//         { id: makePythonSafeId(endNodes[0].id), type: "end", config_id: 1, next: [] },
//       ]
//     } else if (moveFileNodes.length > 0) {
//       operationTypeForDag = "cli_operator"
//       const moveNode = moveFileNodes[0]

//       if (!moveNode.data.source_path || !moveNode.data.destination_path) {
//         toast({
//           title: "Error",
//           description: "Move file node requires both source and destination paths.",
//           variant: "destructive",
//         })
//         return false
//       }

//       const cliConfigPayload = mapMoveFileToCliOperator(moveNode)
//       console.log("Creating CLI operator config (move) with:", cliConfigPayload)

//       const configResponse = await createCliOperatorConfig(clientId, cliConfigPayload)
//       if (!configResponse) {
//         throw new Error("Failed to create CLI operator config for move operation")
//       }

//       dagSequence = [
//         {
//           id: makePythonSafeId(startNodes[0].id),
//           type: "start",
//           config_id: 1,
//           next: [`cli_op_node_${configResponse.id}`],
//         },
//         {
//           id: `cli_op_node_${configResponse.id}`,
//           type: "cli_operator",
//           config_id: configResponse.id,
//           next: [makePythonSafeId(endNodes[0].id)],
//         },
//         { id: makePythonSafeId(endNodes[0].id), type: "end", config_id: 1, next: [] },
//       ]
//     } else if (renameFileNodes.length > 0) {
//       operationTypeForDag = "cli_operator"
//       const renameNode = renameFileNodes[0]

//       if (!renameNode.data.source_path || !renameNode.data.destination_path) {
//         toast({
//           title: "Error",
//           description: "Rename file node requires both source and destination paths.",
//           variant: "destructive",
//         })
//         return false
//       }

//       const cliConfigPayload = mapRenameFileToCliOperator(renameNode)
//       const configResponse = await createCliOperatorConfig(clientId, cliConfigPayload)
//       if (!configResponse) {
//         throw new Error("Failed to create CLI operator config for rename operation")
//       }

//       dagSequence = [
//         {
//           id: makePythonSafeId(startNodes[0].id),
//           type: "start",
//           config_id: 1,
//           next: [`cli_op_node_${configResponse.id}`],
//         },
//         {
//           id: `cli_op_node_${configResponse.id}`,
//           type: "cli_operator",
//           config_id: configResponse.id,
//           next: [makePythonSafeId(endNodes[0].id)],
//         },
//         { id: makePythonSafeId(endNodes[0].id), type: "end", config_id: 1, next: [] },
//       ]
//     } else if (deleteFileNodes.length > 0) {
//       operationTypeForDag = "cli_operator"
//       const deleteNode = deleteFileNodes[0]

//       if (!deleteNode.data.source_path) {
//         toast({
//           title: "Error",
//           description: "Delete file node requires a source path.",
//           variant: "destructive",
//         })
//         return false
//       }

//       const cliConfigPayload = mapDeleteFileToCliOperator(deleteNode)
//       const configResponse = await createCliOperatorConfig(clientId, cliConfigPayload)
//       if (!configResponse) {
//         throw new Error("Failed to create CLI operator config for delete operation")
//       }

//       dagSequence = [
//         {
//           id: makePythonSafeId(startNodes[0].id),
//           type: "start",
//           config_id: 1,
//           next: [`cli_op_node_${configResponse.id}`],
//         },
//         {
//           id: `cli_op_node_${configResponse.id}`,
//           type: "cli_operator",
//           config_id: configResponse.id,
//           next: [makePythonSafeId(endNodes[0].id)],
//         },
//         { id: makePythonSafeId(endNodes[0].id), type: "end", config_id: 1, next: [] },
//       ]
//     } else {
//       toast({
//         title: "Error",
//         description: "Workflow must contain a recognized operation (file conversion, copy, move, rename, or delete).",
//         variant: "destructive",
//       })
//       return false
//     }

//     // Update DAG with the generated sequence
//     console.log("Updating DAG with sequence:", dagSequence)
//     const dagUpdateData = { dag_sequence: dagSequence, active: true }
//     const updatedDag = await updateDag(currentWorkflowId, dagUpdateData)

//     if (!updatedDag) {
//       throw new Error("Failed to update DAG")
//     }

//     console.log("DAG updated successfully")

//     // Trigger DAG run
//     try {
//       console.log("Triggering DAG run...")
//       const triggerResult = await triggerDagRun(currentWorkflowId)

//       if (!triggerResult) {
//         console.log("Trigger returned null, but continuing.")
//       } else {
//         console.log("DAG run triggered successfully")
//       }
//     } catch (triggerError) {
//       console.error("Error triggering DAG run, but workflow was saved:", triggerError)
//       toast({
//         title: "Partial Success",
//         description: "Workflow saved but failed to trigger. You can run it manually from the DAG interface.",
//         variant: "default",
//       })
//       return true
//     }

//     toast({
//       title: "Success",
//       description: `Workflow saved and triggered successfully with ${fileConversionSequences.length > 0 ? fileConversionSequences.length + " file conversion(s)" : "1 operation"}.`,
//     })

//     return true
//   } catch (error) {
//     console.error("Error in saveAndRunWorkflow:", error)
//     toast({
//       title: "Workflow Error",
//       description: error instanceof Error ? error.message : "Failed to save and run workflow.",
//       variant: "destructive",
//     })
//     return false
//   }
// }

// // Helper function to validate workflow structure
// export function validateWorkflowStructure(
//   nodes: WorkflowNode[],
//   connections: NodeConnection[],
// ): { isValid: boolean; errors: string[] } {
//   const errors: string[] = []

//   // Check for start and end nodes
//   const startNodes = nodes.filter((node) => node.type === "start")
//   const endNodes = nodes.filter((node) => node.type === "end")

//   if (startNodes.length === 0) {
//     errors.push("Workflow must have a start node")
//   }

//   if (endNodes.length === 0) {
//     errors.push("Workflow must have an end node")
//   }

//   if (startNodes.length > 1) {
//     errors.push("Workflow can only have one start node")
//   }

//   if (endNodes.length > 1) {
//     errors.push("Workflow can only have one end node")
//   }

//   // Check file conversion sequences
//   const fileConversionSequences = findFileConversionSequences(nodes, connections)

//   for (const sequence of fileConversionSequences) {
//     if (!sequence.readNode.data.path) {
//       errors.push(`Read file node in sequence ${sequence.sequenceIndex + 1} is missing a file path`)
//     }

//     if (!sequence.writeNode.data.path) {
//       errors.push(`Write file node in sequence ${sequence.sequenceIndex + 1} is missing a file path`)
//     }

//     if (!sequence.readNode.data.format) {
//       errors.push(`Read file node in sequence ${sequence.sequenceIndex + 1} is missing a file format`)
//     }

//     if (!sequence.writeNode.data.format) {
//       errors.push(`Write file node in sequence ${sequence.sequenceIndex + 1} is missing a file format`)
//     }
//   }

//   return {
//     isValid: errors.length === 0,
//     errors,
//   }
// }

// // Export the file conversion sequences finder for external use
// export { findFileConversionSequences }





//testing
// Enhanced workflow utilities for dynamic file conversion and CLI operations
import type { WorkflowNode, NodeConnection } from "@/components/workflow/workflow-context"
import { createFileConversionConfig, updateDag, triggerDagRun } from "@/services/file-conversion-service"
import { createFileConversionConfigFromNodes } from "@/services/schema-mapper"
import {
  createCliOperatorConfig,
  mapCopyFileToCliOperator,
  mapMoveFileToCliOperator,
  mapRenameFileToCliOperator,
  mapDeleteFileToCliOperator,
} from "@/services/cli-operator-service"
import { toast } from "@/components/ui/use-toast"
import { getCurrentClientId } from "@/components/workflow/workflow-context"

// Helper function to ensure Python-compatible IDs
function makePythonSafeId(id: string): string {
  let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_")
  if (!/^[a-zA-Z_]/.test(safeId)) {
    safeId = "task_" + safeId
  }
  return safeId
}

// Interface for file conversion sequence
interface FileConversionSequence {
  readNode: WorkflowNode
  writeNode: WorkflowNode
  filterNode?: WorkflowNode
  sequenceIndex: number
}

// Interface for CLI operation sequence
interface CliOperationSequence {
  operationNode: WorkflowNode
  sequenceIndex: number
}

// Interface for operation config
interface OperationConfig {
  type: "file_conversion" | "cli_operator"
  configId: number
  nodeId: string
  sequenceIndex: number
}

// Find the next node in the workflow based on connections
function findNextNode(
  currentNodeId: string,
  connections: NodeConnection[],
  nodes: WorkflowNode[],
): WorkflowNode | null {
  const connection = connections.find((conn) => conn.sourceId === currentNodeId)
  if (!connection) return null

  return nodes.find((node) => node.id === connection.targetId) || null
}

// Find all file conversion sequences in the workflow
function findFileConversionSequences(nodes: WorkflowNode[], connections: NodeConnection[]): FileConversionSequence[] {
  const sequences: FileConversionSequence[] = []
  const readFileNodes = nodes.filter((node) => node.type === "read-file")

  let sequenceIndex = 0

  for (const readNode of readFileNodes) {
    let currentNode: WorkflowNode | null = readNode
    let writeNode: WorkflowNode | null = null
    let filterNode: WorkflowNode | null = null

    // Traverse from read node to find write node
    while (currentNode) {
      const nextNode = findNextNode(currentNode.id, connections, nodes)

      if (!nextNode) break

      if (nextNode.type === "write-file") {
        writeNode = nextNode

        // Check if there's a filter node after write node
        const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes)
        if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
          filterNode = nodeAfterWrite
        }

        // Create sequence
        sequences.push({
          readNode,
          writeNode,
          filterNode,
          sequenceIndex: sequenceIndex++,
        })

        break
      } else if (nextNode.type === "filter") {
        // Filter node before write node
        filterNode = nextNode
        currentNode = nextNode
      } else {
        currentNode = nextNode
      }
    }
  }

  return sequences
}

// Find all CLI operation sequences in the workflow
function findCliOperationSequences(nodes: WorkflowNode[], connections: NodeConnection[]): CliOperationSequence[] {
  const sequences: CliOperationSequence[] = []
  const cliOperationNodes = nodes.filter(
    (node) =>
      node.type === "copy-file" ||
      node.type === "move-file" ||
      node.type === "rename-file" ||
      node.type === "delete-file",
  )

  let sequenceIndex = 0

  for (const operationNode of cliOperationNodes) {
    sequences.push({
      operationNode,
      sequenceIndex: sequenceIndex++,
    })
  }

  return sequences
}

// Find all operations in workflow order (mixed file conversions and CLI operations)
function findAllOperationsInOrder(nodes: WorkflowNode[], connections: NodeConnection[]): OperationConfig[] {
  const operations: OperationConfig[] = []

  // Find start node
  const startNode = nodes.find((node) => node.type === "start")
  if (!startNode) return operations

  let currentNode = startNode
  let operationIndex = 0

  // Traverse the workflow from start to end
  while (currentNode) {
    const nextNode = findNextNode(currentNode.id, connections, nodes)
    if (!nextNode) break

    // Check if current node starts a file conversion sequence
    if (nextNode.type === "read-file") {
      // Find the complete file conversion sequence
      const readNode = nextNode
      let writeNode: WorkflowNode | null = null
      let filterNode: WorkflowNode | null = null
      let sequenceNode = readNode

      // Traverse to find write node
      while (sequenceNode) {
        const seqNextNode = findNextNode(sequenceNode.id, connections, nodes)
        if (!seqNextNode) break

        if (seqNextNode.type === "write-file") {
          writeNode = seqNextNode

          // Check for filter after write
          const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes)
          if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
            filterNode = nodeAfterWrite
            currentNode = filterNode // Continue from filter
          } else {
            currentNode = writeNode // Continue from write
          }
          break
        } else if (seqNextNode.type === "filter") {
          filterNode = seqNextNode
          sequenceNode = seqNextNode
        } else {
          sequenceNode = seqNextNode
        }
      }

      if (writeNode) {
        // This will be handled later when creating configs
        operations.push({
          type: "file_conversion",
          configId: -1, // Will be set later
          nodeId: readNode.id,
          sequenceIndex: operationIndex++,
        })
      }
    }
    // Check if current node is a CLI operation
    else if (
      nextNode.type === "copy-file" ||
      nextNode.type === "move-file" ||
      nextNode.type === "rename-file" ||
      nextNode.type === "delete-file"
    ) {
      operations.push({
        type: "cli_operator",
        configId: -1, // Will be set later
        nodeId: nextNode.id,
        sequenceIndex: operationIndex++,
      })
      currentNode = nextNode
    } else {
      currentNode = nextNode
    }
  }

  return operations
}

// Create DAG sequence for mixed operations
function createMixedOperationsDagSequence(
  operationConfigs: OperationConfig[],
  startNode: WorkflowNode,
  endNode: WorkflowNode,
): any[] {
  const dagSequence: any[] = []

  if (operationConfigs.length === 0) return dagSequence

  // Start node
  const firstConfig = operationConfigs[0]
  const firstNodeId =
    firstConfig.type === "file_conversion" ? `file_node_${firstConfig.configId}` : `cli_op_node_${firstConfig.configId}`

  dagSequence.push({
    id: makePythonSafeId(startNode.id),
    type: "start",
    config_id: 1,
    next: [firstNodeId],
  })

  // Operation nodes
  for (let i = 0; i < operationConfigs.length; i++) {
    const config = operationConfigs[i]
    const nextConfig = operationConfigs[i + 1]

    const nodeId = config.type === "file_conversion" ? `file_node_${config.configId}` : `cli_op_node_${config.configId}`

    const nextNodeId = nextConfig
      ? [
          nextConfig.type === "file_conversion"
            ? `file_node_${nextConfig.configId}`
            : `cli_op_node_${nextConfig.configId}`,
        ]
      : [makePythonSafeId(endNode.id)]

    dagSequence.push({
      id: nodeId,
      type: config.type,
      config_id: config.configId,
      next: nextNodeId,
    })
  }

  // End node
  dagSequence.push({
    id: makePythonSafeId(endNode.id),
    type: "end",
    config_id: 1,
    next: [],
  })

  return dagSequence
}

// Enhanced save and run workflow function
export async function saveAndRunWorkflow(
  nodes: WorkflowNode[],
  connections: NodeConnection[],
  currentWorkflowId: string | null,
): Promise<boolean> {
  const dynamicClientIdString = getCurrentClientId()
  if (!dynamicClientIdString) {
    toast({
      title: "Error",
      description: "Client ID not found. Please ensure you're logged in.",
      variant: "destructive",
    })
    return false
  }

  const clientId = Number.parseInt(dynamicClientIdString, 10)
  if (isNaN(clientId)) {
    toast({
      title: "Error",
      description: "Invalid client ID format.",
      variant: "destructive",
    })
    return false
  }

  if (!currentWorkflowId) {
    toast({
      title: "Error",
      description: "Workflow ID is required to save and run the workflow.",
      variant: "destructive",
    })
    return false
  }

  if (nodes.length === 0) {
    toast({
      title: "Error",
      description: "Workflow must contain at least one node.",
      variant: "destructive",
    })
    return false
  }

  try {
    const startNodes = nodes.filter((node) => node.type === "start")
    const endNodes = nodes.filter((node) => node.type === "end")

    if (startNodes.length === 0 || endNodes.length === 0) {
      toast({
        title: "Error",
        description: "Workflow must have both start and end nodes.",
        variant: "destructive",
      })
      return false
    }

    // Find all operations in the workflow
    const fileConversionSequences = findFileConversionSequences(nodes, connections)
    const cliOperationSequences = findCliOperationSequences(nodes, connections)
    const allOperations = findAllOperationsInOrder(nodes, connections)

    console.log(`Found ${fileConversionSequences.length} file conversion sequences`)
    console.log(`Found ${cliOperationSequences.length} CLI operation sequences`)
    console.log(`Total operations in order:`, allOperations)

    if (allOperations.length === 0) {
      toast({
        title: "Error",
        description: "No valid operations found in the workflow.",
        variant: "destructive",
      })
      return false
    }

    // Create configs for all operations
    const operationConfigs: OperationConfig[] = []

    // Process file conversion sequences
    for (const sequence of fileConversionSequences) {
      const { readNode, writeNode, filterNode } = sequence

      // Validate required paths
      if (!readNode.data.path || !writeNode.data.path) {
        toast({
          title: "Error",
          description: `File conversion sequence ${sequence.sequenceIndex + 1} is missing required file paths.`,
          variant: "destructive",
        })
        return false
      }

      // Create config payload
      const configPayload = createFileConversionConfigFromNodes(
        readNode,
        writeNode,
        filterNode || null,
        currentWorkflowId,
      )

      console.log(`Creating file conversion config ${sequence.sequenceIndex + 1}:`, configPayload)

      // Create the config
      const configResponse = await createFileConversionConfig(clientId, configPayload)
      if (!configResponse) {
        throw new Error(`Failed to create file conversion config for sequence ${sequence.sequenceIndex + 1}`)
      }

      // Find the corresponding operation in allOperations and update it
      const operationIndex = allOperations.findIndex((op) => op.nodeId === readNode.id && op.type === "file_conversion")
      if (operationIndex !== -1) {
        allOperations[operationIndex].configId = configResponse.id
      }

      console.log(`Created file conversion config ${configResponse.id} for sequence ${sequence.sequenceIndex + 1}`)
    }

    // Process CLI operation sequences
    for (const sequence of cliOperationSequences) {
      const { operationNode } = sequence
      let cliConfigPayload

      // Create CLI operator config based on operation type
      switch (operationNode.type) {
        case "copy-file":
          if (!operationNode.data.source_path || !operationNode.data.destination_path) {
            toast({
              title: "Error",
              description: "Copy file node requires both source and destination paths.",
              variant: "destructive",
            })
            return false
          }
          cliConfigPayload = mapCopyFileToCliOperator(operationNode)
          break
        case "move-file":
          if (!operationNode.data.source_path || !operationNode.data.destination_path) {
            toast({
              title: "Error",
              description: "Move file node requires both source and destination paths.",
              variant: "destructive",
            })
            return false
          }
          cliConfigPayload = mapMoveFileToCliOperator(operationNode)
          break
        case "rename-file":
          if (!operationNode.data.source_path || !operationNode.data.destination_path) {
            toast({
              title: "Error",
              description: "Rename file node requires both source and destination paths.",
              variant: "destructive",
            })
            return false
          }
          cliConfigPayload = mapRenameFileToCliOperator(operationNode)
          break
        case "delete-file":
          if (!operationNode.data.source_path) {
            toast({
              title: "Error",
              description: "Delete file node requires a source path.",
              variant: "destructive",
            })
            return false
          }
          cliConfigPayload = mapDeleteFileToCliOperator(operationNode)
          break
        default:
          throw new Error(`Unsupported CLI operation type: ${operationNode.type}`)
      }

      console.log(`Creating CLI operator config (${operationNode.type}) with:`, cliConfigPayload)

      // Create the config
      const configResponse = await createCliOperatorConfig(clientId, cliConfigPayload)
      if (!configResponse) {
        throw new Error(`Failed to create CLI operator config for ${operationNode.type} operation`)
      }

      // Find the corresponding operation in allOperations and update it
      const operationIndex = allOperations.findIndex(
        (op) => op.nodeId === operationNode.id && op.type === "cli_operator",
      )
      if (operationIndex !== -1) {
        allOperations[operationIndex].configId = configResponse.id
      }

      console.log(`Created CLI operator config ${configResponse.id} for ${operationNode.type} operation`)
    }

    // Filter out operations that don't have config IDs (shouldn't happen, but safety check)
    const validOperations = allOperations.filter((op) => op.configId !== -1)

    // Create DAG sequence for all operations
    const dagSequence = createMixedOperationsDagSequence(validOperations, startNodes[0], endNodes[0])
    console.log("Generated DAG sequence for mixed operations:", dagSequence)

    // Update DAG with the generated sequence
    const dagUpdateData = { dag_sequence: dagSequence, active: true }
    const updatedDag = await updateDag(currentWorkflowId, dagUpdateData)

    if (!updatedDag) {
      throw new Error("Failed to update DAG")
    }

    console.log("DAG updated successfully")

    // Trigger DAG run
    try {
      console.log("Triggering DAG run...")
      const triggerResult = await triggerDagRun(currentWorkflowId)

      if (!triggerResult) {
        console.log("Trigger returned null, but continuing.")
      } else {
        console.log("DAG run triggered successfully")
      }
    } catch (triggerError) {
      console.error("Error triggering DAG run, but workflow was saved:", triggerError)
      toast({
        title: "Partial Success",
        description: "Workflow saved but failed to trigger. You can run it manually from the DAG interface.",
        variant: "default",
      })
      return true
    }

    // Count operation types for success message
    const fileConversionCount = fileConversionSequences.length
    const cliOperationCount = cliOperationSequences.length

    toast({
      title: "Success",
      description: `Workflow saved and triggered successfully with ${fileConversionCount} file conversion(s) and ${cliOperationCount} CLI operation(s).`,
    })

    return true
  } catch (error) {
    console.error("Error in saveAndRunWorkflow:", error)
    toast({
      title: "Workflow Error",
      description: error instanceof Error ? error.message : "Failed to save and run workflow.",
      variant: "destructive",
    })
    return false
  }
}

// Helper function to validate workflow structure
export function validateWorkflowStructure(
  nodes: WorkflowNode[],
  connections: NodeConnection[],
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for start and end nodes
  const startNodes = nodes.filter((node) => node.type === "start")
  const endNodes = nodes.filter((node) => node.type === "end")

  if (startNodes.length === 0) {
    errors.push("Workflow must have a start node")
  }

  if (endNodes.length === 0) {
    errors.push("Workflow must have an end node")
  }

  if (startNodes.length > 1) {
    errors.push("Workflow can only have one start node")
  }

  if (endNodes.length > 1) {
    errors.push("Workflow can only have one end node")
  }

  // Check file conversion sequences
  const fileConversionSequences = findFileConversionSequences(nodes, connections)

  for (const sequence of fileConversionSequences) {
    if (!sequence.readNode.data.path) {
      errors.push(`Read file node in sequence ${sequence.sequenceIndex + 1} is missing a file path`)
    }

    if (!sequence.writeNode.data.path) {
      errors.push(`Write file node in sequence ${sequence.sequenceIndex + 1} is missing a file path`)
    }

    if (!sequence.readNode.data.format) {
      errors.push(`Read file node in sequence ${sequence.sequenceIndex + 1} is missing a file format`)
    }

    if (!sequence.writeNode.data.format) {
      errors.push(`Write file node in sequence ${sequence.sequenceIndex + 1} is missing a file format`)
    }
  }

  // Check CLI operation sequences
  const cliOperationSequences = findCliOperationSequences(nodes, connections)

  for (const sequence of cliOperationSequences) {
    const { operationNode } = sequence

    if (!operationNode.data.source_path) {
      errors.push(`${operationNode.type} node in sequence ${sequence.sequenceIndex + 1} is missing a source path`)
    }

    if (
      (operationNode.type === "copy-file" ||
        operationNode.type === "move-file" ||
        operationNode.type === "rename-file") &&
      !operationNode.data.destination_path
    ) {
      errors.push(`${operationNode.type} node in sequence ${sequence.sequenceIndex + 1} is missing a destination path`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Export helper functions for external use
export { findFileConversionSequences, findCliOperationSequences, findAllOperationsInOrder }
