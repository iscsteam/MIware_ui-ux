// src/services/workflow-utils.ts
"use client"; // This directive might be needed if it renders client-side
import type {
  WorkflowNode,
  NodeConnection,
} from "@/components/workflow/workflow-context";
import {
  createFileConversionConfig,
  updateDag,
  triggerDagRun,
} from "@/services/file-conversion-service"; // Assuming it's in this service
import { createSalesforceReadConfig } from "@/services/saleforce/saleforceread";
import { createSalesforceWriteConfig } from "@/services/saleforce/saleforcewrite";
import { createCliOperatorConfig } from "@/services/cli-operator-service";

// Enhanced workflow utilities for dynamic file conversion, CLI operations, database operations, and Salesforce

import {
  createFileToFileConfig,
  createFileToDatabaseConfig,
  createDatabaseToFileConfig,
  createSalesforceReadConfig,
} from "@/services/schema-mapper"
import {
  createCliOperatorConfig,
  mapCopyFileToCliOperator,
  mapMoveFileToCliOperator,
  mapRenameFileToCliOperator,
  mapDeleteFileToCliOperator,
// <<<<<<< feature/saleforce
  // mapNodeToSalesforceWriteConfig, // No longer directly used for chained flow, as payload is built directly
} from "@/services/schema-mapper";

import { toast } from "@/components/ui/use-toast";
import { getCurrentClientId } from "@/components/workflow/workflow-context";
// =======
// } from "@/services/cli-operator-service"
// import { toast } from "@/components/ui/use-toast"
// import { getCurrentClientId } from "@/components/workflow/workflow-context"
// >>>>>>> new-workflow

// Helper function to ensure Python-compatible IDs
function makePythonSafeId(id: string): string {
  let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_");
  if (!/^[a-zA-Z_]/.test(safeId)) {
    safeId = "task_" + safeId;
  }
  return safeId;
}

// Interface for file conversion sequence
interface FileConversionSequence {
  readNode: WorkflowNode
  writeNode: WorkflowNode
  filterNode?: WorkflowNode
  sequenceIndex: number
  type: "file-to-file" | "file-to-database" | "database-to-file"
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
}

// Interface for operation config
interface OperationConfig {
  type: "file_conversion" | "cli_operator" | "read_salesforce"
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

// Enhanced function to find all file conversion sequences (including database operations)
function findFileConversionSequences(nodes: WorkflowNode[], connections: NodeConnection[]): FileConversionSequence[] {
  const sequences: FileConversionSequence[] = []

  // Find read-file nodes
  const readFileNodes = nodes.filter((node) => node.type === "read-file")
  // Find database source nodes
  const databaseSourceNodes = nodes.filter((node) => node.type === "source")

  let sequenceIndex = 0

  // Process read-file nodes
  for (const readNode of readFileNodes) {
    let currentNode: WorkflowNode | null = readNode
    let writeNode: WorkflowNode | null = null
    let filterNode: WorkflowNode | null = null

    // Traverse from read node to find write node or database node
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

        // Create file-to-file sequence
        sequences.push({
          readNode,
          writeNode,
          filterNode,
          sequenceIndex: sequenceIndex++,
          type: "file-to-file",
        })

        break
      } else if (nextNode.type === "database") {
        writeNode = nextNode

        // Check if there's a filter node after database node
        const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes)
        if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
          filterNode = nodeAfterWrite
        }

        // Create file-to-database sequence
        sequences.push({
          readNode,
          writeNode,
          filterNode,
          sequenceIndex: sequenceIndex++,
          type: "file-to-database",
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

  // Process database source nodes
  for (const dbSourceNode of databaseSourceNodes) {
    let currentNode: WorkflowNode | null = dbSourceNode
    let writeNode: WorkflowNode | null = null
    let filterNode: WorkflowNode | null = null

    // Traverse from database source to find write-file node
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

        // Create database-to-file sequence
        sequences.push({
          readNode: dbSourceNode,
          writeNode,
          filterNode,
          sequenceIndex: sequenceIndex++,
          type: "database-to-file",
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

// Find all Salesforce sequences in the workflow
function findSalesforceSequences(nodes: WorkflowNode[], connections: NodeConnection[]): SalesforceSequence[] {
  const sequences: SalesforceSequence[] = []
  const salesforceNodes = nodes.filter((node) => node.type === "salesforce-cloud")

  let sequenceIndex = 0

  for (const salesforceNode of salesforceNodes) {
    sequences.push({
      salesforceNode,
      sequenceIndex: sequenceIndex++,
    })
  }

  return sequences
}

// Find all operations in workflow order (mixed file conversions, CLI operations, and Salesforce)
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
    if (nextNode.type === "read-file" || nextNode.type === "source") {
      // Find the complete file conversion sequence
      const readNode = nextNode
      let writeNode: WorkflowNode | null = null
      let filterNode: WorkflowNode | null = null
      let sequenceNode = readNode

      // Traverse to find write node or database node
      while (sequenceNode) {
        const seqNextNode = findNextNode(sequenceNode.id, connections, nodes)
        if (!seqNextNode) break

        if (seqNextNode.type === "write-file" || seqNextNode.type === "database") {
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
    }
    // Check if current node is a Salesforce operation
    else if (nextNode.type === "salesforce-cloud") {
      operations.push({
        type: "read_salesforce",
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
  let firstNodeId: string

  if (firstConfig.type === "file_conversion") {
    firstNodeId = `file_node_${firstConfig.configId}`
  } else if (firstConfig.type === "cli_operator") {
    firstNodeId = `cli_op_node_${firstConfig.configId}`
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
    } else {
      nodeId = `read_salesforce_${config.configId}`
    }

    let nextNodeId: string[]
    if (nextConfig) {
      if (nextConfig.type === "file_conversion") {
        nextNodeId = [`file_node_${nextConfig.configId}`]
      } else if (nextConfig.type === "cli_operator") {
        nextNodeId = [`cli_op_node_${nextConfig.configId}`]
      } else {
        nextNodeId = [`read_salesforce_${nextConfig.configId}`]
      }
    } else {
      nextNodeId = [makePythonSafeId(endNode.id)]
    }

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
  connections: NodeConnection[], // Not directly used in current implementation, but good for future graph traversal
  currentWorkflowId: string | null
): Promise<boolean> {
  const dynamicClientIdString = getCurrentClientId();
  if (!dynamicClientIdString) {
    toast({
      title: "Error",
// <<<<<<< feature/saleforce
//       description:
//         "No client ID found. Please create or select a client first.",
// =======
      description: "Client ID not found. Please ensure you're logged in.",
// >>>>>>> new-workflow
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
      description: "Workflow ID is required to save and run the workflow.",
      variant: "destructive",
    });
    return false;
  }

  if (nodes.length === 0) {
    toast({
      title: "Error",
      description: "Workflow must contain at least one node.",
      variant: "destructive",
    });
    return false;
  }

  try {
// <<<<<<< feature/saleforce
    const startNodesList = nodes.filter((node) => node.type === "start");
    const endNodesList = nodes.filter((node) => node.type === "end");
    if (startNodesList.length === 0 || endNodesList.length === 0) {
// =======
//     const startNodes = nodes.filter((node) => node.type === "start")
//     const endNodes = nodes.filter((node) => node.type === "end")

//     if (startNodes.length === 0 || endNodes.length === 0) {
// >>>>>>> new-workflow
      toast({
        title: "Error",
        description: "Workflow must have both start and end nodes.",
        variant: "destructive",
      });
      return false;
    }

// <<<<<<< feature/saleforce
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
      (node) => node.type === "salesforce-cloud" // This is typically for Salesforce READ
    );
    const salesforceWriteNodes = nodes.filter(
      (node) => node.type === "write-salesforce" // This is for Salesforce WRITE
    );

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
    let operationTypeForDag:
      | "file_conversion"
      | "cli_operator"
      | "read_salesforce"
      | "write_salesforce"
      | null = null;
    let configPayload: any = null;

    // --- WORKFLOW: READ FILE -> WRITE SALESFORCE (Most Specific First) ---
    // This handles the data flow from ReadFileNode to SalesforceWriteNode.
    // The file_path for the Salesforce write operation comes from the ReadFileNode's input.
    if (readFileNodes.length > 0 && salesforceWriteNodes.length > 0) {
      console.log("Detected: Read File -> Salesforce Write Workflow");
      operationTypeForDag = "write_salesforce";
      const salesforceWriteNode = salesforceWriteNodes[0];
      const readNode = readFileNodes[0]; // Assuming one read node
// =======
//     // Find all operations in the workflow
//     const fileConversionSequences = findFileConversionSequences(nodes, connections)
//     const cliOperationSequences = findCliOperationSequences(nodes, connections)
//     const salesforceSequences = findSalesforceSequences(nodes, connections)
//     const allOperations = findAllOperationsInOrder(nodes, connections)

//     console.log(`Found ${fileConversionSequences.length} file conversion sequences`)
//     console.log(`Found ${cliOperationSequences.length} CLI operation sequences`)
//     console.log(`Found ${salesforceSequences.length} Salesforce sequences`)
//     console.log(`Total operations in order:`, allOperations)

//     if (allOperations.length === 0) {
//       toast({
//         title: "Error",
//         description: "No valid operations found in the workflow.",
//         variant: "destructive",
//       })
//       return false
//     }

//     // Process file conversion sequences
//     for (const sequence of fileConversionSequences) {
//       const { readNode, writeNode, filterNode, type } = sequence

//       // Validate required paths based on sequence type
//       if (type === "file-to-file" || type === "file-to-database") {
//         if (!readNode.data.path) {
//           toast({
//             title: "Error",
//             description: `File conversion sequence ${sequence.sequenceIndex + 1} is missing input file path.`,
//             variant: "destructive",
//           })
//           return false
//         }
//       }

//       if (type === "file-to-file") {
//         if (!writeNode.data.path) {
//           toast({
//             title: "Error",
//             description: `File conversion sequence ${sequence.sequenceIndex + 1} is missing output file path.`,
//             variant: "destructive",
//           })
//           return false
//         }
//       }

//       if (type === "file-to-database" || type === "database-to-file") {
//         if (!writeNode.data.connectionString || !writeNode.data.table) {
//           toast({
//             title: "Error",
//             description: `Database operation sequence ${sequence.sequenceIndex + 1} is missing connection string or table name.`,
//             variant: "destructive",
//           })
//           return false
//         }
//       }

//       // Create config payload based on sequence type
//       let configPayload
//       if (type === "file-to-file") {
//         configPayload = createFileToFileConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
//       } else if (type === "file-to-database") {
//         configPayload = createFileToDatabaseConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
//       } else if (type === "database-to-file") {
//         configPayload = createDatabaseToFileConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
//       }

//       console.log(`Creating ${type} config ${sequence.sequenceIndex + 1}:`, configPayload)

//       // Create the config
//       const configResponse = await createFileConversionConfig(clientId, configPayload)
//       if (!configResponse) {
//         throw new Error(`Failed to create ${type} config for sequence ${sequence.sequenceIndex + 1}`)
//       }

//       // Find the corresponding operation in allOperations and update it
//       const operationIndex = allOperations.findIndex((op) => op.nodeId === readNode.id && op.type === "file_conversion")
//       if (operationIndex !== -1) {
//         allOperations[operationIndex].configId = configResponse.id
//       }

//       console.log(`Created ${type} config ${configResponse.id} for sequence ${sequence.sequenceIndex + 1}`)
//     }

//     // Process CLI operation sequences
//     for (const sequence of cliOperationSequences) {
//       const { operationNode } = sequence
//       let cliConfigPayload

//       // Create CLI operator config based on operation type
//       switch (operationNode.type) {
//         case "copy-file":
//           if (!operationNode.data.source_path || !operationNode.data.destination_path) {
//             toast({
//               title: "Error",
//               description: "Copy file node requires both source and destination paths.",
//               variant: "destructive",
//             })
//             return false
//           }
//           cliConfigPayload = mapCopyFileToCliOperator(operationNode)
//           break
//         case "move-file":
//           if (!operationNode.data.source_path || !operationNode.data.destination_path) {
//             toast({
//               title: "Error",
//               description: "Move file node requires both source and destination paths.",
//               variant: "destructive",
//             })
//             return false
//           }
//           cliConfigPayload = mapMoveFileToCliOperator(operationNode)
//           break
//         case "rename-file":
//           if (!operationNode.data.source_path || !operationNode.data.destination_path) {
//             toast({
//               title: "Error",
//               description: "Rename file node requires both source and destination paths.",
//               variant: "destructive",
//             })
//             return false
//           }
//           cliConfigPayload = mapRenameFileToCliOperator(operationNode)
//           break
//         case "delete-file":
//           if (!operationNode.data.source_path) {
//             toast({
//               title: "Error",
//               description: "Delete file node requires a source path.",
//               variant: "destructive",
//             })
//             return false
//           }
//           cliConfigPayload = mapDeleteFileToCliOperator(operationNode)
//           break
//         default:
//           throw new Error(`Unsupported CLI operation type: ${operationNode.type}`)
//       }

//       console.log(`Creating CLI operator config (${operationNode.type}) with:`, cliConfigPayload)

//       // Create the config
//       const configResponse = await createCliOperatorConfig(clientId, cliConfigPayload)
//       if (!configResponse) {
//         throw new Error(`Failed to create CLI operator config for ${operationNode.type} operation`)
//       }

//       // Find the corresponding operation in allOperations and update it
//       const operationIndex = allOperations.findIndex(
//         (op) => op.nodeId === operationNode.id && op.type === "cli_operator",
//       )
//       if (operationIndex !== -1) {
//         allOperations[operationIndex].configId = configResponse.id
//       }

//       console.log(`Created CLI operator config ${configResponse.id} for ${operationNode.type} operation`)
//     }

//     // Process Salesforce sequences
//     for (const sequence of salesforceSequences) {
//       const { salesforceNode } = sequence
// >>>>>>> new-workflow

      // Validate necessary fields from both nodes
      if (
        !salesforceWriteNode.data.object_name ||
        !readNode.data.path // The file_path for Salesforce write comes from the ReadNode's path
      ) {
        toast({
          title: "Error",
          description:
            "Read File -> Salesforce Write workflow requires object name (from Salesforce Write node) and input file path (from Read File node). Please configure both nodes.",
          variant: "destructive",
        });
        return false;
      }

// <<<<<<< feature/saleforce
      // Construct the configPayload for Salesforce Write.
      // The `file_path` for the Salesforce write operation is the path of the file read by the ReadFileNode.
      configPayload = {
        object_name: salesforceWriteNode.data.object_name,
        file_path: readNode.data.path, // <--- KEY CHANGE: File path comes from the ReadFileNode's `path`
        use_bulk_api: salesforceWriteNode.data.use_bulk_api || false,
        // external_id_field: salesforceWriteNode.data.external_id_field || null,
        bulk_batch_size: salesforceWriteNode.data.bulk_batch_size || null,
        // Add any other relevant Salesforce Write specific data here from salesforceWriteNode.data
        // e.g., mapping rules, error handling settings, etc.
      };

      // Additional validation for Bulk API settings if enabled
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
        description: `Configuring Salesforce data write operation for ${configPayload.object_name} using data from ${configPayload.file_path}...`,
        variant: "default",
      });
    }
    // --- SALESFORCE READ WORKFLOW (start → salesforce-cloud → end) ---
    // This is the existing Salesforce Read flow (standalone)
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
        use_bulk_api: salesforceReadNode.data.use_bulk_api || false,
        file_path: salesforceReadNode.data.file_path,
        // fields: salesforceReadNode.data.fields || [],
        // where: salesforceReadNode.data.where || "",
        // limit: salesforceReadNode.data.limit || undefined,
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
    // This handles the data flow from ReadFileNode to WriteFileNode (standard file conversion)
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
    // --- CLI OPERATORS (Copy, Move, Rename, Delete) ---
    // These are general file system operations, not data conversions per se.
    // They usually only require source/destination paths, not data from a read node.
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
          "Unsupported workflow operation. Please connect appropriate nodes (e.g., start → salesforce-cloud → end, or start → read-file → write-salesforce → end).",
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
      // Handle config creation for write_salesforce
      const response = await createSalesforceWriteConfig(
        dynamicClientIdString,
        configPayload
      );
      if (!response?.id)
        throw new Error(
          "Failed to create Salesforce Write config or ID missing."
        );
      createdConfigId = response.id;
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

    // Determine the main task ID and type based on the detected operation.
    // For chained workflows (e.g., Read->Write Salesforce), the main task is the *last* operation.
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
      config_id: 1, // Dummy config_id for start/end nodes
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
      config_id: 1, // Dummy config_id for start/end nodes
      next: [],
    });

    console.log(
      "Updating DAG with sequence:",
      JSON.stringify(dagSequence, null, 2)
    );
    const dagUpdateData = { dag_sequence: dagSequence, active: true };
    const updatedDag = await updateDag(currentWorkflowId, dagUpdateData);
    if (!updatedDag) throw new Error("Failed to update DAG on backend.");
// =======
//       // Create Salesforce configuration payload
//       const configPayload = {
//         object_name: salesforceNode.data.object_name,
//         query: salesforceNode.data.query,
//         fields: salesforceNode.data.fields || [],
//         where: salesforceNode.data.where || "",
//         limit: salesforceNode.data.limit || undefined,
//         use_bulk_api: salesforceNode.data.use_bulk_api || false,
//         file_path: salesforceNode.data.file_path,
//       }

//       console.log(`Creating Salesforce config ${sequence.sequenceIndex + 1}:`, configPayload)

//       // Create the config
//       const configResponse = await createSalesforceReadConfig(dynamicClientIdString, configPayload)
//       if (!configResponse) {
//         throw new Error(`Failed to create Salesforce config for sequence ${sequence.sequenceIndex + 1}`)
//       }

//       // Find the corresponding operation in allOperations and update it
//       const operationIndex = allOperations.findIndex(
//         (op) => op.nodeId === salesforceNode.id && op.type === "read_salesforce",
//       )
//       if (operationIndex !== -1) {
//         allOperations[operationIndex].configId = configResponse.id
//       }

//       console.log(`Created Salesforce config ${configResponse.id} for sequence ${sequence.sequenceIndex + 1}`)
//     }

//     // Filter out operations that don't have config IDs (shouldn't happen, but safety check)
//     const validOperations = allOperations.filter((op) => op.configId !== -1)

//     // Create DAG sequence for all operations
//     const dagSequence = createMixedOperationsDagSequence(validOperations, startNodes[0], endNodes[0])
//     console.log("Generated DAG sequence for mixed operations:", dagSequence)

//     // Update DAG with the generated sequence
//     const dagUpdateData = { dag_sequence: dagSequence, active: true }
//     const updatedDag = await updateDag(currentWorkflowId, dagUpdateData)
// >>>>>>> new-workflow

    if (!updatedDag) {
      throw new Error("Failed to update DAG")
    }

    console.log("DAG updated successfully")

    // Trigger DAG run
    try {
// <<<<<<< feature/saleforce
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
        // Fetch the nodes again to get their specific data for the toast message
        const salesforceWriteNode = salesforceWriteNodes[0];
        const readNode = readFileNodes[0]; // Check if a ReadFileNode was part of the flow

        let description = `Writing data to Salesforce object ${salesforceWriteNode.data.object_name}.`;
        if (readNode && readNode.data.path) { // If a ReadFileNode was detected in the flow
            description = `Writing data from ${readNode.data.path} to Salesforce object ${salesforceWriteNode.data.object_name}.`;
        }
        toast({
          title: "Salesforce Write Workflow Started",
          description: description,
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
// =======
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
// >>>>>>> new-workflow
    }

    // Count operation types for success message
    const fileConversionCount = fileConversionSequences.length
    const cliOperationCount = cliOperationSequences.length
    const salesforceCount = salesforceSequences.length

    toast({
      title: "Success",
// <<<<<<< feature/saleforce
      description: `${
        operationTypeForDag === "read_salesforce"
          ? "Salesforce Read workflow"
          : operationTypeForDag === "write_salesforce"
          ? "Salesforce Write workflow"
          : "Workflow"
      } saved and execution started.`,
    });
    return true;
// =======
//       description: `Workflow saved and triggered successfully with ${fileConversionCount} file conversion(s), ${cliOperationCount} CLI operation(s), and ${salesforceCount} Salesforce operation(s).`,
//     })

//     return true
// >>>>>>> new-workflow
  } catch (error) {
    console.error("Error in saveAndRunWorkflow:", error);
    toast({
// <<<<<<< feature/saleforce
//       title: "Workflow Operation Error",
//       description:
//         error instanceof Error
//           ? error.message
//           : "An unexpected error occurred while saving or running the workflow.",
// =======
      title: "Workflow Error",
      description: error instanceof Error ? error.message : "Failed to save and run workflow.",
// >>>>>>> new-workflow
      variant: "destructive",
    });
    return false;
  }
}

// Helper function to validate workflow structure
export function validateWorkflowStructure(
  nodes: WorkflowNode[],
  connections: NodeConnection[],
// <<<<<<< feature/saleforce
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
// =======
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
//     if (sequence.type === "file-to-file" || sequence.type === "file-to-database") {
//       if (!sequence.readNode.data.path) {
//         errors.push(`Read file node in sequence ${sequence.sequenceIndex + 1} is missing a file path`)
//       }

//       if (!sequence.readNode.data.format) {
//         errors.push(`Read file node in sequence ${sequence.sequenceIndex + 1} is missing a file format`)
//       }
//     }

//     if (sequence.type === "file-to-file") {
//       if (!sequence.writeNode.data.path) {
//         errors.push(`Write file node in sequence ${sequence.sequenceIndex + 1} is missing a file path`)
//       }

//       if (!sequence.writeNode.data.format) {
//         errors.push(`Write file node in sequence ${sequence.sequenceIndex + 1} is missing a file format`)
//       }
//     }

//     if (sequence.type === "file-to-database" || sequence.type === "database-to-file") {
//       if (!sequence.writeNode.data.connectionString) {
//         errors.push(`Database node in sequence ${sequence.sequenceIndex + 1} is missing a connection string`)
//       }

//       if (!sequence.writeNode.data.table) {
//         errors.push(`Database node in sequence ${sequence.sequenceIndex + 1} is missing a table name`)
//       }
//     }
//   }

//   // Check CLI operation sequences
//   const cliOperationSequences = findCliOperationSequences(nodes, connections)

//   for (const sequence of cliOperationSequences) {
//     const { operationNode } = sequence

//     if (!operationNode.data.source_path) {
//       errors.push(`${operationNode.type} node in sequence ${sequence.sequenceIndex + 1} is missing a source path`)
//     }

//     if (
//       (operationNode.type === "copy-file" ||
//         operationNode.type === "move-file" ||
//         operationNode.type === "rename-file") &&
//       !operationNode.data.destination_path
//     ) {
//       errors.push(`${operationNode.type} node in sequence ${sequence.sequenceIndex + 1} is missing a destination path`)
//     }
//   }

//   // Check Salesforce sequences
//   const salesforceSequences = findSalesforceSequences(nodes, connections)

//   for (const sequence of salesforceSequences) {
//     const { salesforceNode } = sequence

//     if (!salesforceNode.data.object_name) {
//       errors.push(`Salesforce node in sequence ${sequence.sequenceIndex + 1} is missing an object name`)
//     }

//     if (!salesforceNode.data.query) {
//       errors.push(`Salesforce node in sequence ${sequence.sequenceIndex + 1} is missing a query`)
//     }

//     if (!salesforceNode.data.file_path) {
//       errors.push(`Salesforce node in sequence ${sequence.sequenceIndex + 1} is missing a file path`)
//     }
//   }

//   return {
//     isValid: errors.length === 0,
//     errors,
//   }
// }

// // Export helper functions for external use
// export { findFileConversionSequences, findCliOperationSequences, findSalesforceSequences, findAllOperationsInOrder }
// >>>>>>> new-workflow
