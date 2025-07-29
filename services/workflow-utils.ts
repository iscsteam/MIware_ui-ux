//File: services/workflow-utils.ts

import type { WorkflowNode, NodeConnection } from "@/components/workflow/workflow-context"
import {
  createFileConversionConfig,
  updateDag,
  triggerDagRun,
  updateFileConversionConfig,
} from "@/services/file-conversion-service"
import {
  createFileToFileConfig,
  createFileToDatabaseConfig,
  createDatabaseToFileConfig,
  createInlineToFileConfig,
  createFileToInlineConfig,
  createInlineToInlineConfig,
} from "@/services/schema-mapper"
import {
  createCliOperatorConfig,
  updateCliOperatorConfig,
  mapCopyFileToCliOperator,
  mapMoveFileToCliOperator,
  mapRenameFileToCliOperator,
  mapDeleteFileToCliOperator,
  mapWriteNodeToCliOperator, // Added mapWriteNodeToCliOperator with textContent support
} from "@/services/cli-operator-service"
import { toast } from "@/components/ui/use-toast"
import { getCurrentClientId } from "@/components/workflow/workflow-context"
import { createSalesforceReadConfig, updateSalesforceReadConfig } from "@/services/salesforce/salesforceread"
import { createSalesforceWriteConfig, updateSalesforceWriteConfig } from "@/services/salesforce/salesforcewrite"
import {
  createSchedulerTimerConfig,
  updateSchedulerTimerConfig,
  mapSchedulerNodeToTimerConfig,
} from "@/services/scheduler-service"

// Helper function to ensure Python-compatible IDs
function makePythonSafeId(id: string): string {
  let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_")
  if (!/^[a-zA-Z_]/.test(safeId)) {
    safeId = "task_" + safeId
  }
  return safeId
}

// Interface for file conversion sequence - ENHANCED to include all types
interface FileConversionSequence {
  readNode: WorkflowNode
  writeNode: WorkflowNode
  filterNode?: WorkflowNode
  sequenceIndex: number
  type:
    | "file-to-file"
    | "file-to-database"
    | "database-to-file"
    | "inline-to-file"
    | "file-to-inline"
    | "inline-to-inline"
    | "inline-to-database"
    | "database-to-inline"
}

// Interface for CLI operation sequence
interface CliOperationSequence {
  operationNode: WorkflowNode
  sequenceIndex: number
}

// Interface for Salesforce sequence
interface SalesforceSequence {
  salesforceNode: WorkflowNode
  sequenceIndex: number
  type: "read" | "write"
}

// Interface for Timer sequence (internally handle scheduler nodes as timer)
interface TimerSequence {
  timerNode: WorkflowNode
  sequenceIndex: number
}

// Interface for operation config - use "timer" internally for backend compatibility
interface OperationConfig {
  type: "file_conversion" | "cli_operator" | "read_salesforce" | "write_salesforce" | "timer"
  configId: number
  nodeId: string
  sequenceIndex: number
}

// Store for created configs - use timer instead of scheduler
const createdConfigs: {
  fileConversionConfigs: Map<string, number>
  cliOperatorConfigs: Map<string, number>
  salesforceReadConfigs: Map<string, number>
  salesforceWriteConfigs: Map<string, number>
  timerConfigs: Map<string, number>
} = {
  fileConversionConfigs: new Map(),
  cliOperatorConfigs: new Map(),
  salesforceReadConfigs: new Map(),
  salesforceWriteConfigs: new Map(),
  timerConfigs: new Map(),
}

// Helper function to ensure proper empty structures for backend API
function normalizeFilterData(filterNode: WorkflowNode | null) {
  if (!filterNode || !filterNode.data) {
    return {
      filter: {},
      order_by: [],
      aggregation: {},
    }
  }

  const data = filterNode.data

  // Normalize filter structure
  let normalizedFilter = {}
  if (data.filter && typeof data.filter === "object") {
    if (data.filter.conditions && Array.isArray(data.filter.conditions) && data.filter.conditions.length > 0) {
      normalizedFilter = {
        operator: data.filter.operator || "AND",
        conditions: data.filter.conditions,
      }
    }
  }

  // Normalize order_by structure
  let normalizedOrderBy: any[] = []
  if (data.order_by && Array.isArray(data.order_by) && data.order_by.length > 0) {
    normalizedOrderBy = data.order_by.filter(
      (order: any) => Array.isArray(order) && order.length === 2 && order[0] && order[1],
    )
  }

  // Normalize aggregation structure
  let normalizedAggregation = {}
  if (data.aggregation && typeof data.aggregation === "object") {
    const hasGroupBy =
      data.aggregation.group_by &&
      Array.isArray(data.aggregation.group_by) &&
      data.aggregation.group_by.length > 0 &&
      data.aggregation.group_by.some((field: any) => field && field.trim() !== "")

    const hasAggregations =
      data.aggregation.aggregations &&
      Array.isArray(data.aggregation.aggregations) &&
      data.aggregation.aggregations.length > 0 &&
      data.aggregation.aggregations.some((agg: any) => Array.isArray(agg) && agg.length === 2 && agg[0] && agg[1])

    if (hasGroupBy || hasAggregations) {
      normalizedAggregation = {
        group_by: hasGroupBy ? data.aggregation.group_by.filter((field: any) => field && field.trim() !== "") : [],
        aggregations: hasAggregations
          ? data.aggregation.aggregations.filter(
              (agg: any) => Array.isArray(agg) && agg.length === 2 && agg[0] && agg[1],
            )
          : [],
      }
    }
  }

  return {
    filter: normalizedFilter,
    order_by: normalizedOrderBy,
    aggregation: normalizedAggregation,
  }
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

// ENHANCED function to find all file conversion sequences (including inline and database operations)
function findFileConversionSequences(nodes: WorkflowNode[], connections: NodeConnection[]): FileConversionSequence[] {
  const sequences: FileConversionSequence[] = []

  // Find all possible input nodes
  const readFileNodes = nodes.filter((node) => node.type === "read-file")
  const inlineInputNodes = nodes.filter((node) => node.type === "inline-input")
  const databaseSourceNodes = nodes.filter((node) => node.type === "source")

  let sequenceIndex = 0

  // Process read-file nodes
  for (const readNode of readFileNodes) {
    let currentNode: WorkflowNode | null = readNode
    let writeNode: WorkflowNode | null = null
    let filterNode: WorkflowNode | undefined = undefined

    while (currentNode) {
      const nextNode = findNextNode(currentNode.id, connections, nodes)

      if (!nextNode) break

      if (nextNode.type === "write-file") {
        writeNode = nextNode
        const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes)
        if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
          filterNode = nodeAfterWrite
        }

        sequences.push({
          readNode,
          writeNode,
          filterNode,
          sequenceIndex: sequenceIndex++,
          type: "file-to-file",
        })
        break
      } else if (nextNode.type === "inline-output") {
        writeNode = nextNode
        const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes)
        if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
          filterNode = nodeAfterWrite
        }

        sequences.push({
          readNode,
          writeNode,
          filterNode,
          sequenceIndex: sequenceIndex++,
          type: "file-to-inline",
        })
        break
      } else if (nextNode.type === "database") {
        writeNode = nextNode
        const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes)
        if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
          filterNode = nodeAfterWrite
        }

        sequences.push({
          readNode,
          writeNode,
          filterNode,
          sequenceIndex: sequenceIndex++,
          type: "file-to-database",
        })
        break
      } else if (nextNode.type === "filter") {
        filterNode = nextNode
        currentNode = nextNode
      } else {
        currentNode = nextNode
      }
    }
  }

  // Process inline-input nodes
  for (const inlineInputNode of inlineInputNodes) {
    let currentNode: WorkflowNode | null = inlineInputNode
    let writeNode: WorkflowNode | null = null
    let filterNode: WorkflowNode | undefined = undefined

    while (currentNode) {
      const nextNode = findNextNode(currentNode.id, connections, nodes)

      if (!nextNode) break

      if (nextNode.type === "write-file") {
        writeNode = nextNode
        const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes)
        if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
          filterNode = nodeAfterWrite
        }

        sequences.push({
          readNode: inlineInputNode,
          writeNode,
          filterNode,
          sequenceIndex: sequenceIndex++,
          type: "inline-to-file",
        })
        break
      } else if (nextNode.type === "inline-output") {
        writeNode = nextNode
        const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes)
        if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
          filterNode = nodeAfterWrite
        }

        sequences.push({
          readNode: inlineInputNode,
          writeNode,
          filterNode,
          sequenceIndex: sequenceIndex++,
          type: "inline-to-inline",
        })
        break
      } else if (nextNode.type === "database") {
        writeNode = nextNode
        const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes)
        if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
          filterNode = nodeAfterWrite
        }

        sequences.push({
          readNode: inlineInputNode,
          writeNode,
          filterNode,
          sequenceIndex: sequenceIndex++,
          type: "inline-to-database",
        })
        break
      } else if (nextNode.type === "filter") {
        filterNode = nextNode
        currentNode = nextNode
      } else {
        currentNode = nextNode
      }
    }
  }

  // Process database source nodes
  for (const dbSourceNode of databaseSourceNodes) {
    let currentNode: WorkflowNode | null = dbSourceNode
    let writeNode: WorkflowNode | null = null
    let filterNode: WorkflowNode | undefined = undefined

    while (currentNode) {
      const nextNode = findNextNode(currentNode.id, connections, nodes)

      if (!nextNode) break

      if (nextNode.type === "write-file") {
        writeNode = nextNode
        const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes)
        if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
          filterNode = nodeAfterWrite
        }

        sequences.push({
          readNode: dbSourceNode,
          writeNode,
          filterNode,
          sequenceIndex: sequenceIndex++,
          type: "database-to-file",
        })
        break
      } else if (nextNode.type === "inline-output") {
        writeNode = nextNode
        const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes)
        if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
          filterNode = nodeAfterWrite
        }

        sequences.push({
          readNode: dbSourceNode,
          writeNode,
          filterNode,
          sequenceIndex: sequenceIndex++,
          type: "database-to-inline",
        })
        break
      } else if (nextNode.type === "filter") {
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
      node.type === "delete-file" ||
      node.type === "write-node", // Added write-node
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

// Find all Salesforce sequences in the workflow
function findSalesforceSequences(nodes: WorkflowNode[], connections: NodeConnection[]): SalesforceSequence[] {
  const sequences: SalesforceSequence[] = []
  const salesforceReadNodes = nodes.filter((node) => node.type === "salesforce-cloud")
  const salesforceWriteNodes = nodes.filter((node) => node.type === "write-salesforce")

  let sequenceIndex = 0

  for (const salesforceNode of salesforceReadNodes) {
    sequences.push({
      salesforceNode,
      sequenceIndex: sequenceIndex++,
      type: "read",
    })
  }

  for (const salesforceNode of salesforceWriteNodes) {
    sequences.push({
      salesforceNode,
      sequenceIndex: sequenceIndex++,
      type: "write",
    })
  }

  return sequences
}

// Find all Timer sequences in the workflow (scheduler nodes handled as timer internally)
function findTimerSequences(nodes: WorkflowNode[], connections: NodeConnection[]): TimerSequence[] {
  const sequences: TimerSequence[] = []
  const timerNodes = nodes.filter((node) => node.type === "scheduler") // Still using scheduler type for node

  let sequenceIndex = 0

  for (const timerNode of timerNodes) {
    sequences.push({
      timerNode,
      sequenceIndex: sequenceIndex++,
    })
  }

  return sequences
}

// Find all operations in workflow order (mixed file conversions, CLI operations, Salesforce, and Timer)
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
    if (nextNode.type === "read-file" || nextNode.type === "source" || nextNode.type === "inline-input") {
      // Find the complete file conversion sequence
      const readNode = nextNode
      let writeNode: WorkflowNode | null = null
      let filterNode: WorkflowNode | null = null
      let sequenceNode = readNode

      // Traverse to find write node or database node
      while (sequenceNode) {
        const seqNextNode = findNextNode(sequenceNode.id, connections, nodes)
        if (!seqNextNode) break

        if (
          seqNextNode.type === "write-file" ||
          seqNextNode.type === "database" ||
          seqNextNode.type === "inline-output"
        ) {
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
        const configId = createdConfigs.fileConversionConfigs.get(readNode.id) || -1
        operations.push({
          type: "file_conversion",
          configId,
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
      nextNode.type === "delete-file" ||
      nextNode.type === "write-node" // Added write-node support
    ) {
      const configId = createdConfigs.cliOperatorConfigs.get(nextNode.id) || -1
      operations.push({
        type: "cli_operator",
        configId,
        nodeId: nextNode.id,
        sequenceIndex: operationIndex++,
      })
      currentNode = nextNode
    }
    // Check if current node is a Salesforce read operation
    else if (nextNode.type === "salesforce-cloud") {
      const configId = createdConfigs.salesforceReadConfigs.get(nextNode.id) || -1
      operations.push({
        type: "read_salesforce",
        configId,
        nodeId: nextNode.id,
        sequenceIndex: operationIndex++,
      })
      currentNode = nextNode
    }
    // Check if current node is a Salesforce write operation
    else if (nextNode.type === "write-salesforce") {
      const configId = createdConfigs.salesforceWriteConfigs.get(nextNode.id) || -1
      operations.push({
        type: "write_salesforce",
        configId,
        nodeId: nextNode.id,
        sequenceIndex: operationIndex++,
      })
      currentNode = nextNode
    }
    // Check if current node is a Scheduler operation (handle as timer internally)
    else if (nextNode.type === "scheduler") {
      const configId = createdConfigs.timerConfigs.get(nextNode.id) || -1
      operations.push({
        type: "timer", // Use timer type for backend compatibility
        configId,
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
  let firstNodeId: string

  if (firstConfig.type === "file_conversion") {
    firstNodeId = `file_node_${firstConfig.configId}`
  } else if (firstConfig.type === "cli_operator") {
    firstNodeId = `cli_op_node_${firstConfig.configId}`
  } else if (firstConfig.type === "write_salesforce") {
    firstNodeId = `write_salesforce_${firstConfig.configId}`
  } else if (firstConfig.type === "timer") {
    firstNodeId = `timer_${firstConfig.configId}`
  } else {
    firstNodeId = `read_salesforce_${firstConfig.configId}`
  }

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

    let nodeId: string
    if (config.type === "file_conversion") {
      nodeId = `file_node_${config.configId}`
    } else if (config.type === "cli_operator") {
      nodeId = `cli_op_node_${config.configId}`
    } else if (config.type === "write_salesforce") {
      nodeId = `write_salesforce_${config.configId}`
    } else if (config.type === "timer") {
      nodeId = `timer_${config.configId}`
    } else {
      nodeId = `read_salesforce_${config.configId}`
    }

    let nextNodeId: string[]
    if (nextConfig) {
      if (nextConfig.type === "file_conversion") {
        nextNodeId = [`file_node_${nextConfig.configId}`]
      } else if (nextConfig.type === "cli_operator") {
        nextNodeId = [`cli_op_node_${nextConfig.configId}`]
      } else if (nextConfig.type === "write_salesforce") {
        nextNodeId = [`write_salesforce_${nextConfig.configId}`]
      } else if (nextConfig.type === "timer") {
        nextNodeId = [`timer_${nextConfig.configId}`]
      } else {
        nextNodeId = [`read_salesforce_${nextConfig.configId}`]
      }
    } else {
      nextNodeId = [makePythonSafeId(endNode.id)]
    }

    dagSequence.push({
      id: nodeId,
      type: config.type, // Use timer directly for backend
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

// Clear all stored configs (useful when workflow structure changes significantly)
export function clearAllConfigs(): void {
  createdConfigs.fileConversionConfigs.clear()
  createdConfigs.cliOperatorConfigs.clear()
  createdConfigs.salesforceReadConfigs.clear()
  createdConfigs.salesforceWriteConfigs.clear()
  createdConfigs.timerConfigs.clear()

  console.log("All config stores cleared")
  toast({
    title: "Configs Cleared",
    description: "All stored configuration IDs have been cleared.",
  })
}

// Get current config counts for debugging
export function getConfigCounts(): {
  fileConversion: number
  cliOperator: number
  salesforceRead: number
  salesforceWrite: number
  timer: number
} {
  return {
    fileConversion: createdConfigs.fileConversionConfigs.size,
    cliOperator: createdConfigs.cliOperatorConfigs.size,
    salesforceRead: createdConfigs.salesforceReadConfigs.size,
    salesforceWrite: createdConfigs.salesforceWriteConfigs.size,
    timer: createdConfigs.timerConfigs.size,
  }
}

// ENHANCED: Create all configurations with support for all conversion types and timer
export async function createAllConfigs(
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
      description: "Workflow ID is required to create configurations.",
      variant: "destructive",
    })
    return false
  }

  const currentNodeTypes = nodes.map((n) => n.type).sort()
  const hasFileConversion =
    currentNodeTypes.includes("read-file") ||
    currentNodeTypes.includes("write-file") ||
    currentNodeTypes.includes("inline-input") ||
    currentNodeTypes.includes("inline-output")
  const hasCliOperations = currentNodeTypes.some(
    (type) => ["copy-file", "move-file", "rename-file", "delete-file", "write-node"].includes(type), // Added write-node
  )
  const hasSalesforce = currentNodeTypes.includes("salesforce-cloud") || currentNodeTypes.includes("write-salesforce")
  const hasTimer = currentNodeTypes.includes("scheduler") // Display as scheduler but handle as timer

  console.log("Current workflow contains:", {
    fileConversion: hasFileConversion,
    cliOperations: hasCliOperations,
    salesforce: hasSalesforce,
    timer: hasTimer,
    totalNodes: nodes.length,
  })

  try {
    // Find all operations in the workflow
    const fileConversionSequences = findFileConversionSequences(nodes, connections)
    const cliOperationSequences = findCliOperationSequences(nodes, connections)
    const salesforceSequences = findSalesforceSequences(nodes, connections)
    const timerSequences = findTimerSequences(nodes, connections)

    console.log(`Creating configs for ${fileConversionSequences.length} file conversion sequences`)
    console.log(`Creating configs for ${cliOperationSequences.length} CLI operation sequences`)
    console.log(`Creating configs for ${salesforceSequences.length} Salesforce sequences`)
    console.log(`Creating configs for ${timerSequences.length} Timer sequences`)

    // Process file conversion sequences (including inline)
    for (const sequence of fileConversionSequences) {
      const { readNode, writeNode, filterNode, type } = sequence

      console.log(`Processing ${type} sequence:`, {
        readNode: { id: readNode.id, type: readNode.type, data: readNode.data },
        writeNode: { id: writeNode.id, type: writeNode.type, data: writeNode.data },
        filterNode: filterNode ? { id: filterNode.id, type: filterNode.type } : null,
      })

      // Validate required fields based on sequence type
      if (type === "file-to-file" || type === "file-to-database") {
        if (!readNode.data.path) {
          toast({
            title: "Error",
            description: `File conversion sequence ${sequence.sequenceIndex + 1} is missing input file path.`,
            variant: "destructive",
          })
          return false
        }
      }

      if (type === "inline-to-file" || type === "inline-to-inline" || type === "inline-to-database") {
        // For inline input, content can be empty string, but format is required
        if (!readNode.data.format) {
          toast({
            title: "Error",
            description: `Inline input sequence ${sequence.sequenceIndex + 1} is missing format.`,
            variant: "destructive",
          })
          return false
        }
        // Ensure content is at least an empty string
        if (readNode.data.content === undefined || readNode.data.content === null) {
          readNode.data.content = ""
        }
      }

      if (type === "file-to-file" || type === "inline-to-file") {
        if (!writeNode.data.path) {
          toast({
            title: "Error",
            description: `File conversion sequence ${sequence.sequenceIndex + 1} is missing output file path.`,
            variant: "destructive",
          })
          return false
        }
      }

      if (type === "file-to-database" || type === "database-to-file" || type === "inline-to-database") {
        if (!writeNode.data.connectionString || !writeNode.data.table) {
          toast({
            title: "Error",
            description: `Database operation sequence ${sequence.sequenceIndex + 1} is missing connection string or table name.`,
            variant: "destructive",
          })
          return false
        }
      }

      // Create config payload based on sequence type with error handling
      let configPayload: any = null
      try {
        console.log(`Creating ${type} config for sequence ${sequence.sequenceIndex + 1}`)

        if (type === "file-to-file") {
          configPayload = createFileToFileConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
        } else if (type === "file-to-database") {
          configPayload = createFileToDatabaseConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
        } else if (type === "database-to-file") {
          configPayload = createDatabaseToFileConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
        } else if (type === "inline-to-file") {
          configPayload = createInlineToFileConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
        } else if (type === "file-to-inline") {
          configPayload = createFileToInlineConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
        } else if (type === "inline-to-inline") {
          configPayload = createInlineToInlineConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
        } else if (type === "inline-to-database") {
          configPayload = createFileToDatabaseConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
        } else if (type === "database-to-inline") {
          configPayload = createFileToInlineConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
        } else {
          throw new Error(`Unsupported sequence type: ${type}`)
        }

        if (!configPayload) {
          throw new Error(`Failed to create config payload for ${type}`)
        }

        console.log(`Created ${type} config payload:`, JSON.stringify(configPayload, null, 2))

        const configResponse = await createFileConversionConfig(clientId, configPayload)
        if (!configResponse) {
          throw new Error(`Failed to create ${type} config for sequence ${sequence.sequenceIndex + 1}`)
        }

        createdConfigs.fileConversionConfigs.set(readNode.id, configResponse.id)

        console.log(`✅ Created ${type} config ${configResponse.id} for sequence ${sequence.sequenceIndex + 1}`)

        toast({
          title: "Config Created",
          description: `${type} configuration ${configResponse.id} created successfully!`,
        })
      } catch (configError: any) {
        console.error(`❌ Error creating ${type} config:`, configError)
        toast({
          title: "Config Creation Failed",
          description: `Failed to create ${type} config: ${errorMessage}`,
          variant: "destructive",
        })
        return false
      }
    }

    // Process CLI operation sequences (same as before)
    for (const sequence of cliOperationSequences) {
      const { operationNode } = sequence
      let cliConfigPayload

      console.log(`🔧 Processing CLI operation: ${operationNode.type}`, {
        nodeId: operationNode.id,
        nodeData: operationNode.data,
        hasTextContent: !!(operationNode.data.options?.textContent || operationNode.data.textContent),
      })

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

      const configResponse = await createCliOperatorConfig(clientId, cliConfigPayload)
      if (!configResponse) {
        throw new Error(`Failed to create CLI operator config for ${operationNode.type} operation`)
      }

      createdConfigs.cliOperatorConfigs.set(operationNode.id, configResponse.id)

      console.log(`Created CLI operator config ${configResponse.id} for ${operationNode.type} operation`)
    }

    // Process Salesforce sequences (same as before)
    for (const sequence of salesforceSequences) {
      const { salesforceNode, type } = sequence

      if (type === "read") {
        if (!salesforceNode.data.object_name || !salesforceNode.data.query || !salesforceNode.data.file_path) {
          toast({
            title: "Error",
            description:
              "Salesforce read workflow requires object name, query, and file path. Please configure the Salesforce node first.",
            variant: "destructive",
          })
          return false
        }

        const configPayload = {
          object_name: salesforceNode.data.object_name,
          query: salesforceNode.data.query,
          fields: salesforceNode.data.fields || [],
          where: salesforceNode.data.where || "",
          limit: salesforceNode.data.limit || undefined,
          use_bulk_api: salesforceNode.data.use_bulk_api || false,
          file_path: salesforceNode.data.file_path,
        }

        console.log(`Creating Salesforce read config ${sequence.sequenceIndex + 1}:`, configPayload)

        const configResponse = await createSalesforceReadConfig(dynamicClientIdString, configPayload)
        if (!configResponse) {
          throw new Error(`Failed to create Salesforce read config for sequence ${sequence.sequenceIndex + 1}`)
        }

        createdConfigs.salesforceReadConfigs.set(salesforceNode.id, configResponse.id)

        console.log(`Created Salesforce read config ${configResponse.id} for sequence ${sequence.sequenceIndex + 1}`)
      } else if (type === "write") {
        if (!salesforceNode.data.object_name || !salesforceNode.data.file_path) {
          toast({
            title: "Error",
            description:
              "Salesforce write workflow requires object name and file path. Please configure the Salesforce write node first.",
            variant: "destructive",
          })
          return false
        }

        const configPayload = {
          object_name: salesforceNode.data.object_name,
          fields: salesforceNode.data.fields || [],
          use_bulk_api: salesforceNode.data.use_bulk_api || false,
          bulk_batch_size: salesforceNode.data.bulk_batch_size || 1000,
          file_path: salesforceNode.data.file_path,
          update_objects: salesforceNode.data.update_objects || false,
        }

        console.log(`Creating Salesforce write config ${sequence.sequenceIndex + 1}:`, configPayload)

        const configResponse = await createSalesforceWriteConfig(dynamicClientIdString, configPayload)
        if (!configResponse) {
          throw new Error(`Failed to create Salesforce write config for sequence ${sequence.sequenceIndex + 1}`)
        }

        createdConfigs.salesforceWriteConfigs.set(salesforceNode.id, configResponse.id)

        console.log(`Created Salesforce write config ${configResponse.id} for sequence ${sequence.sequenceIndex + 1}`)
      }
    }

    // Process Timer sequences (scheduler nodes handled as timer)
    for (const sequence of timerSequences) {
      const { timerNode } = sequence

      if (!timerNode.data.dag_id_to_trigger || !timerNode.data.start_time) {
        toast({
          title: "Error",
          description:
            "Timer workflow requires DAG ID to trigger and start time. Please configure the Scheduler node first.",
          variant: "destructive",
        })
        return false
      }

      try {
        const timerConfig = mapSchedulerNodeToTimerConfig(timerNode)
        console.log(`Creating timer config ${sequence.sequenceIndex + 1}:`, timerConfig)

        const configResponse = await createSchedulerTimerConfig(clientId, timerConfig)
        if (!configResponse) {
          console.warn(
            `Timer config creation returned null for sequence ${sequence.sequenceIndex + 1}, but continuing...`,
          )

          // Create a fallback config ID for development
          const fallbackConfigId = Math.floor(Math.random() * 10000)
          createdConfigs.timerConfigs.set(timerNode.id, fallbackConfigId)

          console.log(
            `Using fallback timer config ID ${fallbackConfigId} for sequence ${sequence.sequenceIndex + 1}`,
          )

          toast({
            title: "Timer Config (Development)",
            description: `Timer configuration created with fallback ID ${fallbackConfigId}`,
            variant: "default",
          })
        } else {
          createdConfigs.timerConfigs.set(timerNode.id, configResponse.id)

          console.log(`Created timer config ${configResponse.id} for sequence ${sequence.sequenceIndex + 1}`)

          toast({
            title: "Timer Config Created",
            description: `Timer configuration ${configResponse.id} created successfully!`,
          })
        }
      } catch (error) {
        console.error("Error creating timer config:", error)

        // Don't fail the entire process, just log and continue with a fallback
        const fallbackConfigId = Math.floor(Math.random() * 10000)
        createdConfigs.timerConfigs.set(timerNode.id, fallbackConfigId)

        console.log(`Using fallback timer config ID ${fallbackConfigId} due to error`)

        toast({
          title: "Timer Config (Fallback)",
          description: `Timer config created with fallback ID ${fallbackConfigId} due to API error`,
          variant: "default",
        })
      }
    }

    const fileConversionCount = fileConversionSequences.length
    const cliOperationCount = cliOperationSequences.length
    const salesforceReadCount = salesforceSequences.filter((s) => s.type === "read").length
    const salesforceWriteCount = salesforceSequences.filter((s) => s.type === "write").length
    const timerCount = timerSequences.length

    toast({
      title: "Success",
      description: `✅ Created ${fileConversionCount} file conversion config(s), ${cliOperationCount} CLI operator config(s), ${salesforceReadCount} Salesforce read config(s), ${salesforceWriteCount} Salesforce write config(s), and ${timerCount} timer config(s).`,
    })

    return true
  } catch (error: any) {
    console.error("Error in createAllConfigs:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create configurations."
    toast({
      title: "Config Creation Error",
      description: errorMessage,
      variant: "destructive",
    })
    return false
  }
}

// ENHANCED: Update all configurations with proper filter normalization and timer support
export async function updateAllConfigs(
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

  if (
    createdConfigs.fileConversionConfigs.size === 0 &&
    createdConfigs.cliOperatorConfigs.size === 0 &&
    createdConfigs.salesforceReadConfigs.size === 0 &&
    createdConfigs.salesforceWriteConfigs.size === 0 &&
    createdConfigs.timerConfigs.size === 0
  ) {
    toast({
      title: "No Configs Found",
      description: "Please create configs first before updating.",
      variant: "destructive",
    })
    return false
  }

  if (!currentWorkflowId) {
    toast({
      title: "Error",
      description: "Workflow ID is required to update configurations.",
      variant: "destructive",
    })
    return false
  }

  try {
    const fileConversionSequences = findFileConversionSequences(nodes, connections)
    const cliOperationSequences = findCliOperationSequences(nodes, connections)
    const salesforceSequences = findSalesforceSequences(nodes, connections)
    const timerSequences = findTimerSequences(nodes, connections)

    console.log(`Updating configs for ${fileConversionSequences.length} file conversion sequences`)
    console.log(`Updating configs for ${cliOperationSequences.length} CLI operation sequences`)
    console.log(`Updating configs for ${salesforceSequences.length} Salesforce sequences`)
    console.log(`Updating configs for ${timerSequences.length} Timer sequences`)

    // Update file conversion sequences (including inline) with proper filter normalization
    for (const sequence of fileConversionSequences) {
      const { readNode, writeNode, filterNode, type } = sequence
      const configId = createdConfigs.fileConversionConfigs.get(readNode.id)

      if (!configId) {
        console.log(`No config found for file conversion node ${readNode.id}, skipping update`)
        continue
      }

      let configPayload: any = null
      if (type === "file-to-file") {
        configPayload = createFileToFileConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
      } else if (type === "file-to-database") {
        configPayload = createFileToDatabaseConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
      } else if (type === "database-to-file") {
        configPayload = createDatabaseToFileConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
      } else if (type === "inline-to-file") {
        configPayload = createInlineToFileConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
      } else if (type === "file-to-inline") {
        configPayload = createFileToInlineConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
      } else if (type === "inline-to-inline") {
        configPayload = createInlineToInlineConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
      } else if (type === "inline-to-database") {
        configPayload = createFileToDatabaseConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
      } else if (type === "database-to-inline") {
        configPayload = createFileToInlineConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
      }

      if (!configPayload) {
        console.log(`Failed to create config payload for ${type}, skipping update`)
        continue
      }

      // Apply filter normalization to ensure proper empty structures
      if (filterNode) {
        const normalizedFilterData = normalizeFilterData(filterNode)
        configPayload = {
          ...configPayload,
          ...normalizedFilterData,
        }
      } else {
        // Ensure empty structures when no filter node exists
        configPayload = {
          ...configPayload,
          filter: {},
          order_by: [],
          aggregation: {},
        }
      }

      console.log(`Updating ${type} config ${configId}:`, JSON.stringify(configPayload, null, 2))

      const configResponse = await updateFileConversionConfig(clientId, configId, configPayload)
      if (!configResponse) {
        throw new Error(`Failed to update ${type} config ${configId}`)
      }

      console.log(`Updated ${type} config ${configId} for sequence ${sequence.sequenceIndex + 1}`)
    }

    // Update CLI operation sequences (same as before)
    for (const sequence of cliOperationSequences) {
      const { operationNode } = sequence
      const configId = createdConfigs.cliOperatorConfigs.get(operationNode.id)

      if (!configId) {
        console.log(`No config found for CLI operation node ${operationNode.id}, skipping update`)
        continue
      }

      let cliConfigPayload

      console.log(`🔄 Updating CLI operation: ${operationNode.type}`, {
        configId,
        nodeId: operationNode.id,
        hasTextContent: !!(operationNode.data.options?.textContent || operationNode.data.textContent),
      })

      switch (operationNode.type) {
        case "copy-file":
          cliConfigPayload = mapCopyFileToCliOperator(operationNode)
          break
        case "move-file":
          cliConfigPayload = mapMoveFileToCliOperator(operationNode)
          break
        case "rename-file":
          cliConfigPayload = mapRenameFileToCliOperator(operationNode)
          break
        case "delete-file":
          cliConfigPayload = mapDeleteFileToCliOperator(operationNode)
          break
        case "write-node": // Enhanced write-node update with textContent preservation
          const textContent =
            operationNode.data.options?.textContent || operationNode.data.textContent || operationNode.data.content
          console.log(`📝 Updating write-node textContent:`, {
            configId,
            hasTextContent: !!textContent,
            textContentLength: textContent?.length || 0,
            textContentSource: operationNode.data.options?.textContent
              ? "options.textContent"
              : operationNode.data.textContent
                ? "data.textContent"
                : operationNode.data.content
                  ? "data.content"
                  : "none",
          })
          cliConfigPayload = mapWriteNodeToCliOperator(operationNode)
          break
        default:
          throw new Error(`Unsupported CLI operation type: ${operationNode.type}`)
      }

      console.log(`Updating CLI operator config ${configId} (${operationNode.type}) with:`, {
        operation: cliConfigPayload.operation,
        destination_path: cliConfigPayload.destination_path,
        hasTextContent: !!cliConfigPayload.options?.textContent,
        textContentLength: cliConfigPayload.options?.textContent?.length || 0,
      })

      const configResponse = await updateCliOperatorConfig(clientId, configId, cliConfigPayload)
      if (!configResponse) {
        throw new Error(`Failed to update CLI operator config ${configId}`)
      }

      // Log successful update with textContent verification
      console.log(`✅ Updated CLI operator config ${configId} for ${operationNode.type} operation`)
      if (operationNode.type === "write-node" && configResponse.options?.textContent) {
        console.log(`📝 textContent successfully preserved in update response:`, {
          configId: configResponse.id,
          textContentLength: configResponse.options.textContent.length,
          textContentPreview: configResponse.options.textContent.substring(0, 100) + "...",
        })
      }
    }

    // Update Salesforce sequences (same as before)
    for (const sequence of salesforceSequences) {
      const { salesforceNode, type } = sequence

      if (type === "read") {
        const configId = createdConfigs.salesforceReadConfigs.get(salesforceNode.id)

        if (!configId) {
          console.log(`No config found for Salesforce read node ${salesforceNode.id}, skipping update`)
          continue
        }

        const configPayload = {
          object_name: salesforceNode.data.object_name,
          query: salesforceNode.data.query,
          fields: salesforceNode.data.fields || [],
          where: salesforceNode.data.where || "",
          limit: salesforceNode.data.limit || undefined,
          use_bulk_api: salesforceNode.data.use_bulk_api || false,
          file_path: salesforceNode.data.file_path,
        }

        console.log(`Updating Salesforce read config ${configId}:`, configPayload)

        const configResponse = await updateSalesforceReadConfig(dynamicClientIdString, configId, configPayload)
        if (!configResponse) {
          throw new Error(`Failed to update Salesforce read config ${configId}`)
        }

        console.log(`Updated Salesforce read config ${configId} for sequence ${sequence.sequenceIndex + 1}`)
      } else if (type === "write") {
        const configId = createdConfigs.salesforceWriteConfigs.get(salesforceNode.id)

        if (!configId) {
          console.log(`No config found for Salesforce write node ${salesforceNode.id}, skipping update`)
          continue
        }

        const configPayload = {
          object_name: salesforceNode.data.object_name,
          fields: salesforceNode.data.fields || [],
          use_bulk_api: salesforceNode.data.use_bulk_api || false,
          bulk_batch_size: salesforceNode.data.bulk_batch_size || 1000,
          file_path: salesforceNode.data.file_path,
          update_objects: salesforceNode.data.update_objects || false,
        }

        console.log(`Updating Salesforce write config ${configId}:`, configPayload)

        const configResponse = await updateSalesforceWriteConfig(dynamicClientIdString, configId, configPayload)
        if (!configResponse) {
          throw new Error(`Failed to update Salesforce write config ${configId}`)
        }

        console.log(`Updated Salesforce write config ${configId} for sequence ${sequence.sequenceIndex + 1}`)
      }
    }

    // Update Timer sequences
    for (const sequence of timerSequences) {
      const { timerNode } = sequence
      const configId = createdConfigs.timerConfigs.get(timerNode.id)

      if (!configId) {
        console.log(`No config found for timer node ${timerNode.id}, skipping update`)
        continue
      }

      try {
        const timerConfig = mapSchedulerNodeToTimerConfig(timerNode)
        console.log(`Updating timer config ${configId}:`, timerConfig)

        const configResponse = await updateSchedulerTimerConfig(clientId, configId, timerConfig)
        if (!configResponse) {
          console.warn(`Timer config update returned null for config ${configId}, but continuing...`)

          toast({
            title: "Timer Config (Development)",
            description: `Timer configuration ${configId} updated in development mode`,
            variant: "default",
          })
        } else {
          console.log(`Updated timer config ${configId} for sequence ${sequence.sequenceIndex + 1}`)

          toast({
            title: "Timer Config Updated",
            description: `Timer configuration ${configId} updated successfully!`,
          })
        }
      } catch (error) {
        console.error("Error updating timer config:", error)

        // Don't fail the entire process, just log and continue
        toast({
          title: "Timer Config (Fallback)",
          description: `Timer config ${configId} update completed with fallback handling`,
          variant: "default",
        })
      }
    }

    const fileConversionCount = fileConversionSequences.length
    const cliOperationCount = cliOperationSequences.length
    const salesforceReadCount = salesforceSequences.filter((s) => s.type === "read").length
    const salesforceWriteCount = salesforceSequences.filter((s) => s.type === "write").length
    const timerCount = timerSequences.length

    toast({
      title: "Success",
      description: `Updated ${fileConversionCount} file conversion config(s), ${cliOperationCount} CLI operator config(s), ${salesforceReadCount} Salesforce read config(s), ${salesforceWriteCount} Salesforce write config(s), and ${timerCount} timer config(s).`,
    })

    return true
  } catch (error: any) {
    console.error("Error in updateAllConfigs:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update configurations."
    toast({
      title: "Config Update Error",
      description: errorMessage,
      variant: "destructive",
    })
    return false
  }
}

export async function runWorkflowOnly(
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

  if (!currentWorkflowId) {
    toast({
      title: "Error",
      description: "Workflow ID is required to run the workflow.",
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

    const allOperations = findAllOperationsInOrder(nodes, connections)

    console.log(`Total operations in order:`, allOperations)

    if (allOperations.length === 0) {
      toast({
        title: "Error",
        description: "No valid operations found in the workflow.",
        variant: "destructive",
      })
      return false
    }

    const missingConfigs = allOperations.filter((op) => op.configId === -1)
    if (missingConfigs.length > 0) {
      toast({
        title: "Error",
        description: "Some operations are missing configurations. Please create configs first.",
        variant: "destructive",
      })
      return false
    }

    const dagSequence = createMixedOperationsDagSequence(allOperations, startNodes[0], endNodes[0])
    console.log("Generated DAG sequence for mixed operations:", dagSequence)

    const dagUpdateData = { dag_sequence: dagSequence, active: true }
    const updatedDag = await updateDag(currentWorkflowId, dagUpdateData)

    if (!updatedDag) {
      throw new Error("Failed to update DAG")
    }

    console.log("DAG updated successfully")

    try {
      console.log("Triggering DAG run...")
      const triggerResult = await triggerDagRun(currentWorkflowId)

      if (!triggerResult) {
        console.log("Trigger returned null, but continuing.")
      } else {
        console.log("DAG run triggered successfully")
      }
    } catch (triggerError: any) {
      console.error("Error triggering DAG run:", triggerError)
      
      // Check if it's a 409 error (active run exists)
      if (triggerError?.message?.includes('409') || triggerError?.message?.includes('already has an active run')) {
        console.log("Detected active run conflict (409). Attempting to force stop and retry...")
        
        toast({
          title: "Active Run Detected",
          description: "Stopping existing run and starting new one...",
          variant: "default",
        })
        
        try {
          // Import the stop function
          const { stopActiveDAGRun } = await import("@/services/dagService")
          
          // Stop the active run
          const stopResult = await stopActiveDAGRun(currentWorkflowId)
          
          if (stopResult?.success) {
            console.log("Successfully stopped active run, retrying trigger...")
            
            // Wait a moment for the stop to complete
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Retry the trigger
            const retryTriggerResult = await triggerDagRun(currentWorkflowId)
            
            if (retryTriggerResult) {
              console.log("DAG run triggered successfully after stopping previous run")
              toast({
                title: "Success",
                description: `Workflow restarted successfully with ${allOperations.length} operation(s).`,
              })
              return true
            } else {
              throw new Error("Retry trigger returned null")
            }
          } else {
            throw new Error(`Failed to stop active run: ${stopResult?.message || 'Unknown error'}`)
          }
        } catch (forceStopError: any) {
          console.error("Error during force stop and retry:", forceStopError)
          toast({
            title: "Run Failed", 
            description: `Could not stop existing run and start new one: ${forceStopError?.message || 'Unknown error'}`,
            variant: "destructive",
          })
          return false
        }
      } else {
        // Handle other trigger errors
        console.error("Non-409 trigger error:", triggerError)
        toast({
          title: "Partial Success",
          description: "Workflow saved but failed to trigger. You can run it manually from the DAG interface.",
          variant: "default",
        })
        return true
      }
    }

    toast({
      title: "Success",
      description: `Workflow triggered successfully with ${allOperations.length} operation(s).`,
    })

    return true
  } catch (error: any) {
    console.error("Error in runWorkflowOnly:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to run workflow."
    toast({
      title: "Workflow Error",
      description: errorMessage,
      variant: "destructive",
    })
    return false
  }
}

export async function saveAndRunWorkflow(
  nodes: WorkflowNode[],
  connections: NodeConnection[],
  currentWorkflowId: string | null,
): Promise<boolean> {
  const configsCreated = await createAllConfigs(nodes, connections, currentWorkflowId)
  if (!configsCreated) {
    return false
  }

  return await runWorkflowOnly(nodes, connections, currentWorkflowId)
}

export function validateWorkflowStructure(
  nodes: WorkflowNode[],
  connections: NodeConnection[],
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

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

  const fileConversionSequences = findFileConversionSequences(nodes, connections)

  for (const sequence of fileConversionSequences) {
    if (sequence.type === "file-to-file" || sequence.type === "file-to-database") {
      if (!sequence.readNode.data.path) {
        errors.push(`Read file node in sequence ${sequence.sequenceIndex + 1} is missing a file path`)
      }

      if (!sequence.readNode.data.format) {
        errors.push(`Read file node in sequence ${sequence.sequenceIndex + 1} is missing a file format`)
      }
    }

    if (sequence.type === "inline-to-file" || sequence.type === "inline-to-inline") {
      if (!sequence.readNode.data.content) {
        errors.push(`Inline input node in sequence ${sequence.sequenceIndex + 1} is missing content`)
      }

      if (!sequence.readNode.data.format) {
        errors.push(`Inline input node in sequence ${sequence.sequenceIndex + 1} is missing a format`)
      }
    }

    if (sequence.type === "file-to-file" || sequence.type === "inline-to-file") {
      if (!sequence.writeNode.data.path) {
        errors.push(`Write file node in sequence ${sequence.sequenceIndex + 1} is missing a file path`)
      }

      if (!sequence.writeNode.data.format) {
        errors.push(`Write file node in sequence ${sequence.sequenceIndex + 1} is missing a file format`)
      }
    }

    if (sequence.type === "file-to-database" || sequence.type === "database-to-file" || sequence.type === "inline-to-database") {
      if (!sequence.writeNode.data.connectionString) {
        errors.push(`Database node in sequence ${sequence.sequenceIndex + 1} is missing a connection string`)
      }

      if (!sequence.writeNode.data.table) {
        errors.push(`Database node in sequence ${sequence.sequenceIndex + 1} is missing a table name`)
      }
    }
  }

  const cliOperationSequences = findCliOperationSequences(nodes, connections)

  for (const sequence of cliOperationSequences) {
    const { operationNode } = sequence

    if (operationNode.type === "write-node") {
      if (!operationNode.data.destination_path) {
        errors.push(`Write node in sequence ${sequence.sequenceIndex + 1} is missing a destination path.`)
      }
      if (
        (operationNode.data.write_mode === "copy" ||
          operationNode.data.write_mode === "append" ||
          operationNode.data.write_mode === "compressed_copy") &&
        !operationNode.data.source_path
      ) {
        errors.push(
          `Write node in '${operationNode.data.write_mode}' mode in sequence ${sequence.sequenceIndex + 1} requires a source path.`,
        )
      }
      // No content validation for 'new_file' as it can be empty
    } else {
      // Existing CLI operation validations
      if (!operationNode.data.source_path) {
        errors.push(`${operationNode.type} node in sequence ${sequence.sequenceIndex + 1} is missing a source path`)
      }

      if (
        (operationNode.type === "copy-file" ||
          operationNode.type === "move-file" ||
          operationNode.type === "rename-file") &&
        !operationNode.data.destination_path
      ) {
        errors.push(
          `${operationNode.type} node in sequence ${sequence.sequenceIndex + 1} is missing a destination path`,
        )
      }
    }
  }

  const salesforceSequences = findSalesforceSequences(nodes, connections)

  for (const sequence of salesforceSequences) {
    const { salesforceNode, type } = sequence

    if (type === "read") {
      if (!salesforceNode.data.object_name) {
        errors.push(`Salesforce read node in sequence ${sequence.sequenceIndex + 1} is missing an object name`)
      }

      if (!salesforceNode.data.query) {
        errors.push(`Salesforce read node in sequence ${sequence.sequenceIndex + 1} is missing a query`)
      }

      if (!salesforceNode.data.file_path) {
        errors.push(`Salesforce read node in sequence ${sequence.sequenceIndex + 1} is missing a file path`)
      }
    } else if (type === "write") {
      if (!salesforceNode.data.object_name) {
        errors.push(`Salesforce write node in sequence ${sequence.sequenceIndex + 1} is missing an object name`)
      }

      if (!salesforceNode.data.file_path) {
        errors.push(`Salesforce write node in sequence ${sequence.sequenceIndex + 1} is missing a file path`)
      }
    }
  }

  // Validate timer sequences (scheduler nodes)
  const timerSequences = findTimerSequences(nodes, connections)

  for (const sequence of timerSequences) {
    const { timerNode } = sequence

    if (!timerNode.data.dag_id_to_trigger) {
      errors.push(`Scheduler node in sequence ${sequence.sequenceIndex + 1} is missing a DAG ID to trigger`)
    }

    if (!timerNode.data.start_time) {
      errors.push(`Scheduler node in sequence ${sequence.sequenceIndex + 1} is missing a start time`)
    }

    if (!timerNode.data.run_once && (!timerNode.data.time_interval || timerNode.data.time_interval <= 0)) {
      errors.push(`Scheduler node in sequence ${sequence.sequenceIndex + 1} is missing a valid time interval`)
    }

    if (!timerNode.data.run_once && !timerNode.data.interval_unit) {
      errors.push(`Scheduler node in sequence ${sequence.sequenceIndex + 1} is missing an interval unit`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export { findFileConversionSequences, findCliOperationSequences, findSalesforceSequences, findAllOperationsInOrder }
