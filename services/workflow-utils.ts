// // workflow-utils.ts
// // Enhanced workflow utilities for dynamic file conversion, CLI operations, database operations, and Salesforce
// import type {
//   WorkflowNode,
//   NodeConnection,
// } from "@/components/workflow/workflow-context";
// import {
//   createFileConversionConfig,
//   updateDag,
//   triggerDagRun,
// } from "@/services/file-conversion-service";
// import {
//   createFileToFileConfig,
//   createFileToDatabaseConfig,
//   createDatabaseToFileConfig,
//   // createSalesforceReadConfig,
//   // createSalesforceWriteConfig,
// } from "@/services/schema-mapper";
// import {
//   createCliOperatorConfig,
//   mapCopyFileToCliOperator,
//   mapMoveFileToCliOperator,
//   mapRenameFileToCliOperator,
//   mapDeleteFileToCliOperator,
// } from "@/services/cli-operator-service";
// import { toast } from "@/components/ui/use-toast";
// import { getCurrentClientId } from "@/components/workflow/workflow-context";
// import { createSalesforceReadConfig } from "@/services/salesforce/salesforceread";
// import { createSalesforceWriteConfig } from "@/services/salesforce/salesforcewrite";

// // Helper function to ensure Python-compatible IDs
// function makePythonSafeId(id: string): string {
//   let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_");
//   if (!/^[a-zA-Z_]/.test(safeId)) {
//     safeId = "task_" + safeId;
//   }
//   return safeId;
// }

// // Interface for file conversion sequence
// interface FileConversionSequence {
//   readNode: WorkflowNode;
//   writeNode: WorkflowNode;
//   filterNode?: WorkflowNode;
//   sequenceIndex: number;
//   type: "file-to-file" | "file-to-database" | "database-to-file";
// }

// // Interface for CLI operation sequence
// interface CliOperationSequence {
//   operationNode: WorkflowNode;
//   sequenceIndex: number;
// }

// // Interface for Salesforce read sequence
// interface SalesforceSequence {
//   salesforceNode: WorkflowNode;
//   sequenceIndex: number;
// }

// // Interface for Salesforce write sequence
// interface SalesforceWriteSequence {
//   salesforceNode: WorkflowNode;
//   sequenceIndex: number;
// }

// // Interface for operation config
// interface OperationConfig {
//   type:
//     | "file_conversion"
//     | "cli_operator"
//     | "read_salesforce"
//     | "write_salesforce";
//   configId: number;
//   nodeId: string;
//   sequenceIndex: number;
// }

// // Find the next node in the workflow based on connections
// function findNextNode(
//   currentNodeId: string,
//   connections: NodeConnection[],
//   nodes: WorkflowNode[]
// ): WorkflowNode | null {
//   const connection = connections.find(
//     (conn) => conn.sourceId === currentNodeId
//   );
//   if (!connection) return null;
//   return nodes.find((node) => node.id === connection.targetId) || null;
// }

// // Enhanced function to find all file conversion sequences (including database operations)
// function findFileConversionSequences(
//   nodes: WorkflowNode[],
//   connections: NodeConnection[]
// ): FileConversionSequence[] {
//   const sequences: FileConversionSequence[] = [];

//   // Find read-file nodes
//   const readFileNodes = nodes.filter((node) => node.type === "read-file");
//   // Find database source nodes
//   const databaseSourceNodes = nodes.filter((node) => node.type === "source");

//   let sequenceIndex = 0;

//   // Process read-file nodes
//   for (const readNode of readFileNodes) {
//     let currentNode: WorkflowNode | null = readNode;
//     let writeNode: WorkflowNode | null = null;
//     let filterNode: WorkflowNode | null = null;

//     // Traverse from read node to find write node or database node
//     while (currentNode) {
//       const nextNode = findNextNode(currentNode.id, connections, nodes);
//       if (!nextNode) break;

//       if (nextNode.type === "write-file") {
//         writeNode = nextNode;

//         // Check if there's a filter node after write node
//         const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes);
//         if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
//           filterNode = nodeAfterWrite;
//         }

//         // Create file-to-file sequence
//         sequences.push({
//           readNode,
//           writeNode,
//           filterNode,
//           sequenceIndex: sequenceIndex++,
//           type: "file-to-file",
//         });
//         break;
//       } else if (nextNode.type === "database") {
//         writeNode = nextNode;

//         // Check if there's a filter node after database node
//         const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes);
//         if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
//           filterNode = nodeAfterWrite;
//         }

//         // Create file-to-database sequence
//         sequences.push({
//           readNode,
//           writeNode,
//           filterNode,
//           sequenceIndex: sequenceIndex++,
//           type: "file-to-database",
//         });
//         break;
//       } else if (nextNode.type === "filter") {
//         // Filter node before write node
//         filterNode = nextNode;
//         currentNode = nextNode;
//       } else {
//         currentNode = nextNode;
//       }
//     }
//   }

//   // Process database source nodes (database-to-file)
//   for (const dbSourceNode of databaseSourceNodes) {
//     let currentNode: WorkflowNode | null = dbSourceNode;
//     let writeNode: WorkflowNode | null = null;
//     let filterNode: WorkflowNode | null = null;

//     // Traverse from database source to find write-file node
//     while (currentNode) {
//       const nextNode = findNextNode(currentNode.id, connections, nodes);
//       if (!nextNode) break;

//       if (nextNode.type === "write-file") {
//         writeNode = nextNode;

//         // Check if there's a filter node after write node
//         const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes);
//         if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
//           filterNode = nodeAfterWrite;
//         }

//         // Create database-to-file sequence
//         sequences.push({
//           readNode: dbSourceNode,
//           writeNode,
//           filterNode,
//           sequenceIndex: sequenceIndex++,
//           type: "database-to-file",
//         });
//         break;
//       } else if (nextNode.type === "filter") {
//         // Filter node before write node
//         filterNode = nextNode;
//         currentNode = nextNode;
//       } else {
//         currentNode = nextNode;
//       }
//     }
//   }

//   return sequences;
// }

// // Find all CLI operation sequences in the workflow
// function findCliOperationSequences(
//   nodes: WorkflowNode[],
//   connections: NodeConnection[]
// ): CliOperationSequence[] {
//   const sequences: CliOperationSequence[] = [];
//   const cliOperationNodes = nodes.filter(
//     (node) =>
//       node.type === "copy-file" ||
//       node.type === "move-file" ||
//       node.type === "rename-file" ||
//       node.type === "delete-file"
//   );

//   let sequenceIndex = 0;
//   for (const operationNode of cliOperationNodes) {
//     sequences.push({
//       operationNode,
//       sequenceIndex: sequenceIndex++,
//     });
//   }
//   return sequences;
// }

// // Find all Salesforce read sequences in the workflow
// function findSalesforceSequences(
//   nodes: WorkflowNode[],
//   connections: NodeConnection[]
// ): SalesforceSequence[] {
//   const sequences: SalesforceSequence[] = [];
//   const salesforceNodes = nodes.filter(
//     (node) => node.type === "salesforce-cloud"
//   );

//   let sequenceIndex = 0;
//   for (const salesforceNode of salesforceNodes) {
//     sequences.push({
//       salesforceNode,
//       sequenceIndex: sequenceIndex++,
//     });
//   }
//   return sequences;
// }

// // Find all Salesforce write sequences in the workflow
// function findSalesforceWriteSequences(
//   nodes: WorkflowNode[],
//   connections: NodeConnection[]
// ): SalesforceWriteSequence[] {
//   const sequences: SalesforceWriteSequence[] = [];
//   const salesforceNodes = nodes.filter(
//     (node) => node.type === "write-salesforce"
//   );

//   let sequenceIndex = 0;
//   for (const salesforceNode of salesforceNodes) {
//     sequences.push({
//       salesforceNode,
//       sequenceIndex: sequenceIndex++,
//     });
//   }
//   return sequences;
// }

// // Find all operations in workflow order (mixed file conversions, CLI operations, and Salesforce)
// function findAllOperationsInOrder(
//   nodes: WorkflowNode[],
//   connections: NodeConnection[]
// ): OperationConfig[] {
//   const operations: OperationConfig[] = [];
//   // Find start node
//   const startNode = nodes.find((node) => node.type === "start");
//   if (!startNode) return operations;

//   let currentNode = startNode;
//   let operationIndex = 0;

//   // Traverse the workflow from start to end
//   while (currentNode) {
//     const nextNode = findNextNode(currentNode.id, connections, nodes);
//     if (!nextNode) break;

//     // Check if next node starts a file conversion sequence
//     if (nextNode.type === "read-file" || nextNode.type === "source") {
//       const readNode = nextNode;
//       let writeNode: WorkflowNode | null = null;
//       let filterNode: WorkflowNode | null = null;
//       let sequenceNode = readNode;

//       // Traverse to find write node or database node
//       while (sequenceNode) {
//         const seqNextNode = findNextNode(sequenceNode.id, connections, nodes);
//         if (!seqNextNode) break;

//         if (
//           seqNextNode.type === "write-file" ||
//           seqNextNode.type === "database"
//         ) {
//           writeNode = seqNextNode;
//           // Check for filter after write
//           const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes);
//           if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
//             filterNode = nodeAfterWrite;
//             currentNode = filterNode; // Continue from filter
//           } else {
//             currentNode = writeNode; // Continue from write
//           }
//           break;
//         } else if (seqNextNode.type === "filter") {
//           filterNode = seqNextNode;
//           sequenceNode = seqNextNode;
//         } else {
//           sequenceNode = seqNextNode;
//         }
//       }

//       if (writeNode) {
//         operations.push({
//           type: "file_conversion",
//           configId: -1, // Will be set later
//           nodeId: readNode.id,
//           sequenceIndex: operationIndex++,
//         });
//       }
//     }
//     // Check if next node is a CLI operation
//     else if (
//       nextNode.type === "copy-file" ||
//       nextNode.type === "move-file" ||
//       nextNode.type === "rename-file" ||
//       nextNode.type === "delete-file"
//     ) {
//       operations.push({
//         type: "cli_operator",
//         configId: -1,
//         nodeId: nextNode.id,
//         sequenceIndex: operationIndex++,
//       });
//       currentNode = nextNode;
//     }
//     // Check if next node is a Salesforce read operation
//     else if (nextNode.type === "salesforce-cloud") {
//       operations.push({
//         type: "read_salesforce",
//         configId: -1,
//         nodeId: nextNode.id,
//         sequenceIndex: operationIndex++,
//       });
//       currentNode = nextNode;
//     }
//     // Check if next node is a Salesforce write operation
//     else if (nextNode.type === "write-salesforce") {
//       operations.push({
//         type: "write_salesforce",
//         configId: -1,
//         nodeId: nextNode.id,
//         sequenceIndex: operationIndex++,
//       });
//       currentNode = nextNode;
//     } else {
//       currentNode = nextNode;
//     }
//   }

//   return operations;
// }

// // Create DAG sequence for mixed operations
// function createMixedOperationsDagSequence(
//   operationConfigs: OperationConfig[],
//   startNode: WorkflowNode,
//   endNode: WorkflowNode
// ): any[] {
//   const dagSequence: any[] = [];
//   if (operationConfigs.length === 0) return dagSequence;

//   // Start node
//   const firstConfig = operationConfigs[0];
//   let firstNodeId: string;
//   if (firstConfig.type === "file_conversion") {
//     firstNodeId = `file_node_${firstConfig.configId}`;
//   } else if (firstConfig.type === "cli_operator") {
//     firstNodeId = `cli_op_node_${firstConfig.configId}`;
//   } else if (firstConfig.type === "write_salesforce") {
//     firstNodeId = `write_salesforce_${firstConfig.configId}`;
//   } else {
//     firstNodeId = `read_salesforce_${firstConfig.configId}`;
//   }

//   dagSequence.push({
//     id: makePythonSafeId(startNode.id),
//     type: "start",
//     config_id: 1,
//     next: [firstNodeId],
//   });

//   // Operation nodes
//   for (let i = 0; i < operationConfigs.length; i++) {
//     const config = operationConfigs[i];
//     const nextConfig = operationConfigs[i + 1];

//     let nodeId: string;
//     if (config.type === "file_conversion") {
//       nodeId = `file_node_${config.configId}`;
//     } else if (config.type === "cli_operator") {
//       nodeId = `cli_op_node_${config.configId}`;
//     } else if (config.type === "write_salesforce") {
//       nodeId = `write_salesforce_${config.configId}`;
//     } else {
//       nodeId = `read_salesforce_${config.configId}`;
//     }

//     let nextNodeIds: string[];
//     if (nextConfig) {
//       if (nextConfig.type === "file_conversion") {
//         nextNodeIds = [`file_node_${nextConfig.configId}`];
//       } else if (nextConfig.type === "cli_operator") {
//         nextNodeIds = [`cli_op_node_${nextConfig.configId}`];
//       } else if (nextConfig.type === "write_salesforce") {
//         nextNodeIds = [`write_salesforce_${nextConfig.configId}`];
//       } else {
//         nextNodeIds = [`read_salesforce_${nextConfig.configId}`];
//       }
//     } else {
//       nextNodeIds = [makePythonSafeId(endNode.id)];
//     }

//     dagSequence.push({
//       id: nodeId,
//       type: config.type,
//       config_id: config.configId,
//       next: nextNodeIds,
//     });
//   }

//   // End node
//   dagSequence.push({
//     id: makePythonSafeId(endNode.id),
//     type: "end",
//     config_id: 1,
//     next: [],
//   });

//   return dagSequence;
// }

// // Enhanced save and run workflow function
// export async function saveAndRunWorkflow(
//   nodes: WorkflowNode[],
//   connections: NodeConnection[],
//   currentWorkflowId: string | null
// ): Promise<boolean> {
//   const dynamicClientIdString = getCurrentClientId();
//   if (!dynamicClientIdString) {
//     toast({
//       title: "Error",
//       description: "Client ID not found. Please ensure you're logged in.",
//       variant: "destructive",
//     });
//     return false;
//   }

//   const clientId = Number.parseInt(dynamicClientIdString, 10);
//   if (isNaN(clientId)) {
//     toast({
//       title: "Error",
//       description: "Invalid client ID format.",
//       variant: "destructive",
//     });
//     return false;
//   }

//   if (!currentWorkflowId) {
//     toast({
//       title: "Error",
//       description: "Workflow ID is required to save and run the workflow.",
//       variant: "destructive",
//     });
//     return false;
//   }

//   if (nodes.length === 0) {
//     toast({
//       title: "Error",
//       description: "Workflow must contain at least one node.",
//       variant: "destructive",
//     });
//     return false;
//   }

//   try {
//     const startNodes = nodes.filter((node) => node.type === "start");
//     const endNodes = nodes.filter((node) => node.type === "end");

//     if (startNodes.length === 0 || endNodes.length === 0) {
//       toast({
//         title: "Error",
//         description: "Workflow must have both start and end nodes.",
//         variant: "destructive",
//       });
//       return false;
//     }

//     // Find all operations in the workflow
//     const fileConversionSequences = findFileConversionSequences(
//       nodes,
//       connections
//     );
//     const cliOperationSequences = findCliOperationSequences(nodes, connections);
//     const salesforceReadSequences = findSalesforceSequences(nodes, connections);
//     const salesforceWriteSequences = findSalesforceWriteSequences(
//       nodes,
//       connections
//     );
//     const allOperations = findAllOperationsInOrder(nodes, connections);

//     console.log(
//       `Found ${fileConversionSequences.length} file conversion sequences`
//     );
//     console.log(
//       `Found ${cliOperationSequences.length} CLI operation sequences`
//     );
//     console.log(
//       `Found ${salesforceReadSequences.length} Salesforce‐read sequences`
//     );
//     console.log(
//       `Found ${salesforceWriteSequences.length} Salesforce‐write sequences`
//     );
//     console.log(`Total operations in order:`, allOperations);

//     if (allOperations.length === 0) {
//       toast({
//         title: "Error",
//         description: "No valid operations found in the workflow.",
//         variant: "destructive",
//       });
//       return false;
//     }

//     // Process file conversion sequences
//     for (const sequence of fileConversionSequences) {
//       const { readNode, writeNode, filterNode, type } = sequence;

//       // Validate required paths based on sequence type
//       if (type === "file-to-file" || type === "file-to-database") {
//         if (!readNode.data.path) {
//           toast({
//             title: "Error",
//             description: `File conversion sequence ${
//               sequence.sequenceIndex + 1
//             } is missing input file path.`,
//             variant: "destructive",
//           });
//           return false;
//         }
//       }

//       if (type === "file-to-file") {
//         if (!writeNode.data.path) {
//           toast({
//             title: "Error",
//             description: `File conversion sequence ${
//               sequence.sequenceIndex + 1
//             } is missing output file path.`,
//             variant: "destructive",
//           });
//           return false;
//         }
//       }

//       if (type === "file-to-database" || type === "database-to-file") {
//         if (!writeNode.data.connectionString || !writeNode.data.table) {
//           toast({
//             title: "Error",
//             description: `Database operation sequence ${
//               sequence.sequenceIndex + 1
//             } is missing connection string or table name.`,
//             variant: "destructive",
//           });
//           return false;
//         }
//       }

//       // Create config payload based on sequence type
//       let configPayload;
//       if (type === "file-to-file") {
//         configPayload = createFileToFileConfig(
//           readNode,
//           writeNode,
//           filterNode || null,
//           currentWorkflowId
//         );
//       } else if (type === "file-to-database") {
//         configPayload = createFileToDatabaseConfig(
//           readNode,
//           writeNode,
//           filterNode || null,
//           currentWorkflowId
//         );
//       } else {
//         // database-to-file
//         configPayload = createDatabaseToFileConfig(
//           readNode,
//           writeNode,
//           filterNode || null,
//           currentWorkflowId
//         );
//       }

//       console.log(
//         `Creating ${type} config ${sequence.sequenceIndex + 1}:`,
//         configPayload
//       );

//       // Create the config
//       const configResponse = await createFileConversionConfig(
//         clientId,
//         configPayload
//       );
//       if (!configResponse) {
//         throw new Error(
//           `Failed to create ${type} config for sequence ${
//             sequence.sequenceIndex + 1
//           }`
//         );
//       }

//       // Find the corresponding operation in allOperations and update it
//       const operationIndex = allOperations.findIndex(
//         (op) => op.nodeId === readNode.id && op.type === "file_conversion"
//       );
//       if (operationIndex !== -1) {
//         allOperations[operationIndex].configId = configResponse.id;
//       }

//       console.log(
//         `Created ${type} config ${configResponse.id} for sequence ${
//           sequence.sequenceIndex + 1
//         }`
//       );
//     }

//     // Process CLI operation sequences
//     for (const sequence of cliOperationSequences) {
//       const { operationNode } = sequence;
//       let cliConfigPayload;

//       // Create CLI operator config based on operation type
//       switch (operationNode.type) {
//         case "copy-file":
//           if (
//             !operationNode.data.source_path ||
//             !operationNode.data.destination_path
//           ) {
//             toast({
//               title: "Error",
//               description:
//                 "Copy file node requires both source and destination paths.",
//               variant: "destructive",
//             });
//             return false;
//           }
//           cliConfigPayload = mapCopyFileToCliOperator(operationNode);
//           break;

//         case "move-file":
//           if (
//             !operationNode.data.source_path ||
//             !operationNode.data.destination_path
//           ) {
//             toast({
//               title: "Error",
//               description:
//                 "Move file node requires both source and destination paths.",
//               variant: "destructive",
//             });
//             return false;
//           }
//           cliConfigPayload = mapMoveFileToCliOperator(operationNode);
//           break;

//         case "rename-file":
//           if (
//             !operationNode.data.source_path ||
//             !operationNode.data.destination_path
//           ) {
//             toast({
//               title: "Error",
//               description:
//                 "Rename file node requires both source and destination paths.",
//               variant: "destructive",
//             });
//             return false;
//           }
//           cliConfigPayload = mapRenameFileToCliOperator(operationNode);
//           break;

//         case "delete-file":
//           if (!operationNode.data.source_path) {
//             toast({
//               title: "Error",
//               description: "Delete file node requires a source path.",
//               variant: "destructive",
//             });
//             return false;
//           }
//           cliConfigPayload = mapDeleteFileToCliOperator(operationNode);
//           break;

//         default:
//           throw new Error(
//             `Unsupported CLI operation type: ${operationNode.type}`
//           );
//       }

//       console.log(
//         `Creating CLI operator config (${operationNode.type}) with:`,
//         cliConfigPayload
//       );

//       // Create the config
//       const configResponse = await createCliOperatorConfig(
//         clientId,
//         cliConfigPayload
//       );
//       if (!configResponse) {
//         throw new Error(
//           `Failed to create CLI operator config for ${operationNode.type} operation`
//         );
//       }

//       // Find the corresponding operation in allOperations and update it
//       const operationIndex = allOperations.findIndex(
//         (op) => op.nodeId === operationNode.id && op.type === "cli_operator"
//       );
//       if (operationIndex !== -1) {
//         allOperations[operationIndex].configId = configResponse.id;
//       }

//       console.log(
//         `Created CLI operator config ${configResponse.id} for ${operationNode.type} operation`
//       );
//     }

//     // // Process Salesforce read sequences
//     // for (const sequence of salesforceReadSequences) {
//     //   const { salesforceNode } = sequence;

//     //   // Validate required Salesforce read fields
//     //   if (
//     //     !salesforceNode.data.object_name ||
//     //     !salesforceNode.data.query ||
//     //     !salesforceNode.data.file_path
//     //   ) {
//     //     toast({
//     //       title: "Error",
//     //       description:
//     //         "Salesforce read workflow requires object_name, query, and file_path. Please configure the Salesforce read node first.",
//     //       variant: "destructive",
//     //     });
//     //     return false;
//     //   }

//     //   // Create Salesforce read configuration payload
//     //   const configPayload = {
//     //     object_name: salesforceNode.data.object_name,
//     //     query: salesforceNode.data.query,
//     //     fields: salesforceNode.data.fields || [],
//     //     where: salesforceNode.data.where || "",
//     //     limit: salesforceNode.data.limit || undefined,
//     //     use_bulk_api: salesforceNode.data.use_bulk_api || false,
//     //     file_path: salesforceNode.data.file_path,
//     //   };

//     //   console.log(
//     //     `Creating Salesforce read config ${sequence.sequenceIndex + 1}:`,
//     //     configPayload
//     //   );

//     //   // Create the config
//     //   const configResponse = await createSalesforceReadConfig(
//     //     dynamicClientIdString,
//     //     configPayload
//     //   );
//     //   if (!configResponse) {
//     //     throw new Error(
//     //       `Failed to create Salesforce read config for sequence ${
//     //         sequence.sequenceIndex + 1
//     //       }`
//     //     );
//     //   }

//     //   // Find the corresponding operation in allOperations and update it
//     //   const operationIndex = allOperations.findIndex(
//     //     (op) => op.nodeId === salesforceNode.id && op.type === "read_salesforce"
//     //   );
//     //   if (operationIndex !== -1) {
//     //     allOperations[operationIndex].configId = configResponse.id;
//     //   }

//     //   console.log(
//     //     `Created Salesforce read config ${configResponse.id} for sequence ${
//     //       sequence.sequenceIndex + 1
//     //     }`
//     //   );
//     // }
//     // Process Salesforce read sequences
// for (const sequence of salesforceReadSequences) {
//   const { salesforceNode } = sequence;

//   // Validate required Salesforce read fields
//   if (
//     !salesforceNode.data.object_name ||
//     !salesforceNode.data.query ||
//     !salesforceNode.data.file_path
//   ) {
//     toast({
//       title: "Error",
//       description:
//         "Salesforce read workflow requires object_name, query, and file_path. Please configure the Salesforce read node first.",
//       variant: "destructive",
//     });
//     return false;
//   }

//   // Get fields from either fields or selectedFields property
//   const fields = salesforceNode.data.fields || salesforceNode.data.selectedFields || [];
  
//   console.log("Salesforce node data:", salesforceNode.data); // Debug log
//   console.log("Fields being sent to API:", fields); // Debug log

//   // Create Salesforce read configuration payload
//   const configPayload = {
//     object_name: salesforceNode.data.object_name,
//     query: salesforceNode.data.query,
//     fields: fields, // Use the extracted fields
//     where: salesforceNode.data.where || "",
//     limit: salesforceNode.data.limit || undefined,
//     use_bulk_api: salesforceNode.data.use_bulk_api || false,
//     file_path: salesforceNode.data.file_path,
//   };

//   console.log(
//     `Creating Salesforce read config ${sequence.sequenceIndex + 1}:`,
//     configPayload
//   );

//   // Create the config
//   const configResponse = await createSalesforceReadConfig(
//     dynamicClientIdString,
//     configPayload
//   );
//   if (!configResponse) {
//     throw new Error(
//       `Failed to create Salesforce read config for sequence ${
//         sequence.sequenceIndex + 1
//       }`
//     );
//   }

//   // Find the corresponding operation in allOperations and update it
//   const operationIndex = allOperations.findIndex(
//     (op) => op.nodeId === salesforceNode.id && op.type === "read_salesforce"
//   );
//   if (operationIndex !== -1) {
//     allOperations[operationIndex].configId = configResponse.id;
//   }

//   console.log(
//     `Created Salesforce read config ${configResponse.id} for sequence ${
//       sequence.sequenceIndex + 1
//     }`
//   );
// }

//     // Process Salesforce write sequences
//     for (const sequence of salesforceWriteSequences) {
//       const { salesforceNode } = sequence;

//       // Validate required Salesforce write fields
//       if (
//         !salesforceNode.data.object_name ||
//         !salesforceNode.data.file_path ||
//         !salesforceNode.data.bulk_batch_size
//       ) {
//         toast({
//           title: "Error",
//           description:
//             "Salesforce write workflow requires object_name, file_path, and bulk_batch_size. Please configure the Salesforce write node first.",
//           variant: "destructive",
//         });
//         return false;
//       }

//       // Create Salesforce write configuration payload
//       const configPayload = {
//         object_name: salesforceNode.data.object_name,
//         fields: salesforceNode.data.fields || [],
//         use_bulk_api: salesforceNode.data.use_bulk_api || false,
//         bulk_batch_size: salesforceNode.data.bulk_batch_size || 1000,
//         file_path: salesforceNode.data.file_path,
//       };

//       console.log(
//         `Creating Salesforce write config ${sequence.sequenceIndex + 1}:`,
//         configPayload
//       );

//       // Create the config
//       const configResponse = await createSalesforceWriteConfig(
//         dynamicClientIdString,
//         configPayload
//       );
//       if (!configResponse) {
//         throw new Error(
//           `Failed to create Salesforce write config for sequence ${
//             sequence.sequenceIndex + 1
//           }`
//         );
//       }

//       // Find the corresponding operation in allOperations and update it
//       const operationIndex = allOperations.findIndex(
//         (op) =>
//           op.nodeId === salesforceNode.id && op.type === "write_salesforce"
//       );
//       if (operationIndex !== -1) {
//         allOperations[operationIndex].configId = configResponse.id;
//       }

//       console.log(
//         `Created Salesforce write config ${configResponse.id} for sequence ${
//           sequence.sequenceIndex + 1
//         }`
//       );
//     }

//     // Filter out operations that don't have config IDs (shouldn't happen, but safety check)
//     const validOperations = allOperations.filter((op) => op.configId !== -1);

//     // Create DAG sequence for all operations
//     const dagSequence = createMixedOperationsDagSequence(
//       validOperations,
//       startNodes[0],
//       endNodes[0]
//     );
//     console.log("Generated DAG sequence for mixed operations:", dagSequence);

//     // Update DAG with the generated sequence
//     const dagUpdateData = { dag_sequence: dagSequence, active: true };
//     const updatedDag = await updateDag(currentWorkflowId, dagUpdateData);
//     if (!updatedDag) {
//       throw new Error("Failed to update DAG");
//     }
//     console.log("DAG updated successfully");

//     // Trigger DAG run
//     try {
//       console.log("Triggering DAG run...");
//       const triggerResult = await triggerDagRun(currentWorkflowId);
//       if (!triggerResult) {
//         console.log("Trigger returned null, but continuing.");
//       } else {
//         console.log("DAG run triggered successfully");
//       }
//     } catch (triggerError) {
//       console.error(
//         "Error triggering DAG run, but workflow was saved:",
//         triggerError
//       );
//       toast({
//         title: "Partial Success",
//         description:
//           "Workflow saved but failed to trigger. You can run it manually from the DAG interface.",
//         variant: "default",
//       });
//       return true;
//     }

//     // Count operation types for success message
//     const fileConversionCount = fileConversionSequences.length;
//     const cliOperationCount = cliOperationSequences.length;
//     const salesforceReadCount = salesforceReadSequences.length;
//     const salesforceWriteCount = salesforceWriteSequences.length;

//     toast({
//       title: "Success",
//       description: `Workflow saved and triggered successfully with ${fileConversionCount} file conversion(s), ${cliOperationCount} CLI operation(s), ${salesforceReadCount} Salesforce read(s), and ${salesforceWriteCount} Salesforce write(s).`,
//     });

//     return true;
//   } catch (error) {
//     console.error("Error in saveAndRunWorkflow:", error);
//     toast({
//       title: "Workflow Error",
//       description:
//         error instanceof Error
//           ? error.message
//           : "Failed to save and run workflow.",
//       variant: "destructive",
//     });
//     return false;
//   }
// }

// // Helper function to validate workflow structure
// export function validateWorkflowStructure(
//   nodes: WorkflowNode[],
//   connections: NodeConnection[]
// ): { isValid: boolean; errors: string[] } {
//   const errors: string[] = [];

//   // Check for start and end nodes
//   const startNodes = nodes.filter((node) => node.type === "start");
//   const endNodes = nodes.filter((node) => node.type === "end");
//   if (startNodes.length === 0) {
//     errors.push("Workflow must have a start node");
//   }
//   if (endNodes.length === 0) {
//     errors.push("Workflow must have an end node");
//   }
//   if (startNodes.length > 1) {
//     errors.push("Workflow can only have one start node");
//   }
//   if (endNodes.length > 1) {
//     errors.push("Workflow can only have one end node");
//   }

//   // Check file conversion sequences
//   const fileConversionSequences = findFileConversionSequences(
//     nodes,
//     connections
//   );
//   for (const sequence of fileConversionSequences) {
//     if (
//       sequence.type === "file-to-file" ||
//       sequence.type === "file-to-database"
//     ) {
//       if (!sequence.readNode.data.path) {
//         errors.push(
//           `Read file node in sequence ${
//             sequence.sequenceIndex + 1
//           } is missing a file path`
//         );
//       }
//       if (!sequence.readNode.data.format) {
//         errors.push(
//           `Read file node in sequence ${
//             sequence.sequenceIndex + 1
//           } is missing a file format`
//         );
//       }
//     }
//     if (sequence.type === "file-to-file") {
//       if (!sequence.writeNode.data.path) {
//         errors.push(
//           `Write file node in sequence ${
//             sequence.sequenceIndex + 1
//           } is missing a file path`
//         );
//       }
//       if (!sequence.writeNode.data.format) {
//         errors.push(
//           `Write file node in sequence ${
//             sequence.sequenceIndex + 1
//           } is missing a file format`
//         );
//       }
//     }
//     if (
//       sequence.type === "file-to-database" ||
//       sequence.type === "database-to-file"
//     ) {
//       if (!sequence.writeNode.data.connectionString) {
//         errors.push(
//           `Database node in sequence ${
//             sequence.sequenceIndex + 1
//           } is missing a connection string`
//         );
//       }
//       if (!sequence.writeNode.data.table) {
//         errors.push(
//           `Database node in sequence ${
//             sequence.sequenceIndex + 1
//           } is missing a table name`
//         );
//       }
//     }
//   }

//   // Check CLI operation sequences
//   const cliOperationSequences = findCliOperationSequences(nodes, connections);
//   for (const sequence of cliOperationSequences) {
//     const { operationNode } = sequence;
//     if (!operationNode.data.source_path) {
//       errors.push(
//         `${operationNode.type} node in sequence ${
//           sequence.sequenceIndex + 1
//         } is missing a source path`
//       );
//     }
//     if (
//       (operationNode.type === "copy-file" ||
//         operationNode.type === "move-file" ||
//         operationNode.type === "rename-file") &&
//       !operationNode.data.destination_path
//     ) {
//       errors.push(
//         `${operationNode.type} node in sequence ${
//           sequence.sequenceIndex + 1
//         } is missing a destination path`
//       );
//     }
//   }

//   // Check Salesforce read sequences
//   const salesforceReadSequences = findSalesforceSequences(nodes, connections);
//   for (const sequence of salesforceReadSequences) {
//     const { salesforceNode } = sequence;
//     if (!salesforceNode.data.object_name) {
//       errors.push(
//         `Salesforce read node in sequence ${
//           sequence.sequenceIndex + 1
//         } is missing an object name`
//       );
//     }
//     if (!salesforceNode.data.query) {
//       errors.push(
//         `Salesforce read node in sequence ${
//           sequence.sequenceIndex + 1
//         } is missing a query`
//       );
//     }
//     if (!salesforceNode.data.file_path) {
//       errors.push(
//         `Salesforce read node in sequence ${
//           sequence.sequenceIndex + 1
//         } is missing a file path`
//       );
//     }
//   }

//   // Check Salesforce write sequences
//   const salesforceWriteSequences = findSalesforceWriteSequences(
//     nodes,
//     connections
//   );
//   for (const sequence of salesforceWriteSequences) {
//     const { salesforceNode } = sequence;
//     if (!salesforceNode.data.object_name) {
//       errors.push(
//         `Salesforce write node in sequence ${
//           sequence.sequenceIndex + 1
//         } is missing an object name`
//       );
//     }
//     if (!salesforceNode.data.file_path) {
//       errors.push(
//         `Salesforce write node in sequence ${
//           sequence.sequenceIndex + 1
//         } is missing a file path`
//       );
//     }
//     if (!salesforceNode.data.bulk_batch_size) {
//       errors.push(
//         `Salesforce write node in sequence ${
//           sequence.sequenceIndex + 1
//         } is missing a bulk batch size`
//       );
//     }
//   }

//   return {
//     isValid: errors.length === 0,
//     errors,
//   };
// }

// // Export helper functions for external use
// export {
//   findFileConversionSequences,
//   findCliOperationSequences,
//   findSalesforceSequences,
//   findSalesforceWriteSequences,
//   findAllOperationsInOrder,
// };
// workflow-utils.ts
// Enhanced workflow utilities for dynamic file conversion, CLI operations, database operations, and Salesforce
import type { WorkflowNode, NodeConnection } from "@/components/workflow/workflow-context"
import { createFileConversionConfig, updateDag, triggerDagRun } from "@/services/file-conversion-service"
import {
  createFileToFileConfig,
  createFileToDatabaseConfig,
  createDatabaseToFileConfig,
  // createSalesforceReadConfig,
  // createSalesforceWriteConfig,
} from "@/services/schema-mapper"
import {
  createCliOperatorConfig,
  mapCopyFileToCliOperator,
  mapMoveFileToCliOperator,
  mapRenameFileToCliOperator,
  mapDeleteFileToCliOperator,
} from "@/services/cli-operator-service"
import { toast } from "@/components/ui/use-toast"
import { getCurrentClientId } from "@/components/workflow/workflow-context"
import { createSalesforceReadConfig } from "@/services/salesforce/salesforceread"
import { createSalesforceWriteConfig } from "@/services/salesforce/salesforcewrite"

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
  type: "file-to-file" | "file-to-database" | "database-to-file"
}

// Interface for CLI operation sequence
interface CliOperationSequence {
  operationNode: WorkflowNode
  sequenceIndex: number
}

// Interface for Salesforce read sequence
interface SalesforceSequence {
  salesforceNode: WorkflowNode
  sequenceIndex: number
}

// Interface for Salesforce write sequence
interface SalesforceWriteSequence {
  salesforceNode: WorkflowNode
  sequenceIndex: number
}

// Interface for operation config
interface OperationConfig {
  type: "file_conversion" | "cli_operator" | "read_salesforce" | "write_salesforce"
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

  // Process database source nodes (database-to-file)
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

// Find all Salesforce read sequences in the workflow
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

// Find all Salesforce write sequences in the workflow
function findSalesforceWriteSequences(nodes: WorkflowNode[], connections: NodeConnection[]): SalesforceWriteSequence[] {
  const sequences: SalesforceWriteSequence[] = []
  const salesforceNodes = nodes.filter((node) => node.type === "write-salesforce")

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

    // Check if next node starts a file conversion sequence
    if (nextNode.type === "read-file" || nextNode.type === "source") {
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
    // Check if next node is a CLI operation
    else if (
      nextNode.type === "copy-file" ||
      nextNode.type === "move-file" ||
      nextNode.type === "rename-file" ||
      nextNode.type === "delete-file"
    ) {
      operations.push({
        type: "cli_operator",
        configId: -1,
        nodeId: nextNode.id,
        sequenceIndex: operationIndex++,
      })
      currentNode = nextNode
    }
    // Check if next node is a Salesforce read operation
    else if (nextNode.type === "salesforce-cloud") {
      operations.push({
        type: "read_salesforce",
        configId: -1,
        nodeId: nextNode.id,
        sequenceIndex: operationIndex++,
      })
      currentNode = nextNode
    }
    // Check if next node is a Salesforce write operation
    else if (nextNode.type === "write-salesforce") {
      operations.push({
        type: "write_salesforce",
        configId: -1,
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
    } else {
      nodeId = `read_salesforce_${config.configId}`
    }

    let nextNodeIds: string[]
    if (nextConfig) {
      if (nextConfig.type === "file_conversion") {
        nextNodeIds = [`file_node_${nextConfig.configId}`]
      } else if (nextConfig.type === "cli_operator") {
        nextNodeIds = [`cli_op_node_${nextConfig.configId}`]
      } else if (nextConfig.type === "write_salesforce") {
        nextNodeIds = [`write_salesforce_${nextConfig.configId}`]
      } else {
        nextNodeIds = [`read_salesforce_${nextConfig.configId}`]
      }
    } else {
      nextNodeIds = [makePythonSafeId(endNode.id)]
    }

    dagSequence.push({
      id: nodeId,
      type: config.type,
      config_id: config.configId,
      next: nextNodeIds,
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
    const salesforceReadSequences = findSalesforceSequences(nodes, connections)
    const salesforceWriteSequences = findSalesforceWriteSequences(nodes, connections)
    const allOperations = findAllOperationsInOrder(nodes, connections)

    console.log(`Found ${fileConversionSequences.length} file conversion sequences`)
    console.log(`Found ${cliOperationSequences.length} CLI operation sequences`)
    console.log(`Found ${salesforceReadSequences.length} Salesforce‐read sequences`)
    console.log(`Found ${salesforceWriteSequences.length} Salesforce‐write sequences`)
    console.log(`Total operations in order:`, allOperations)

    if (allOperations.length === 0) {
      toast({
        title: "Error",
        description: "No valid operations found in the workflow.",
        variant: "destructive",
      })
      return false
    }

    // Process file conversion sequences
    for (const sequence of fileConversionSequences) {
      const { readNode, writeNode, filterNode, type } = sequence

      // Validate required paths based on sequence type
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

      if (type === "file-to-file") {
        if (!writeNode.data.path) {
          toast({
            title: "Error",
            description: `File conversion sequence ${sequence.sequenceIndex + 1} is missing output file path.`,
            variant: "destructive",
          })
          return false
        }
      }

      if (type === "file-to-database" || type === "database-to-file") {
        if (!writeNode.data.connectionString || !writeNode.data.table) {
          toast({
            title: "Error",
            description: `Database operation sequence ${
              sequence.sequenceIndex + 1
            } is missing connection string or table name.`,
            variant: "destructive",
          })
          return false
        }
      }

      // Create config payload based on sequence type
      let configPayload
      if (type === "file-to-file") {
        configPayload = createFileToFileConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
      } else if (type === "file-to-database") {
        configPayload = createFileToDatabaseConfig(readNode, writeNode, filterNode || null, currentWorkflowId)

        // Explicitly mark this as a database operation
        configPayload.output = {
          ...configPayload.output,
          type: "database",
        }
      } else {
        // database-to-file
        configPayload = createDatabaseToFileConfig(readNode, writeNode, filterNode || null, currentWorkflowId)
      }

      console.log(`Creating ${type} config ${sequence.sequenceIndex + 1}:`, configPayload)

      // Create the config
      const configResponse = await createFileConversionConfig(clientId, configPayload)
      if (!configResponse) {
        throw new Error(`Failed to create ${type} config for sequence ${sequence.sequenceIndex + 1}`)
      }

      // Find the corresponding operation in allOperations and update it
      const operationIndex = allOperations.findIndex((op) => op.nodeId === readNode.id && op.type === "file_conversion")
      if (operationIndex !== -1) {
        allOperations[operationIndex].configId = configResponse.id
      }

      console.log(`Created ${type} config ${configResponse.id} for sequence ${sequence.sequenceIndex + 1}`)
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

    // // Process Salesforce read sequences
    // for (const sequence of salesforceReadSequences) {
    //   const { salesforceNode } = sequence;

    //   // Validate required Salesforce read fields
    //   if (
    //     !salesforceNode.data.object_name ||
    //     !salesforceNode.data.query ||
    //     !salesforceNode.data.file_path
    //   ) {
    //     toast({
    //       title: "Error",
    //       description:
    //         "Salesforce read workflow requires object_name, query, and file_path. Please configure the Salesforce read node first.",
    //       variant: "destructive",
    //     });
    //     return false;
    //   }

    //   // Create Salesforce read configuration payload
    //   const configPayload = {
    //     object_name: salesforceNode.data.object_name,
    //     query: salesforceNode.data.query,
    //     fields: salesforceNode.data.fields || [],
    //     where: salesforceNode.data.where || "",
    //     limit: salesforceNode.data.limit || undefined,
    //     use_bulk_api: salesforceNode.data.use_bulk_api || false,
    //     file_path: salesforceNode.data.file_path,
    //   };

    //   console.log(
    //     `Creating Salesforce read config ${sequence.sequenceIndex + 1}:`,
    //     configPayload
    //   );

    //   // Create the config
    //   const configResponse = await createSalesforceReadConfig(
    //     dynamicClientIdString,
    //     configPayload
    //   );
    //   if (!configResponse) {
    //     throw new Error(
    //       `Failed to create Salesforce read config for sequence ${
    //         sequence.sequenceIndex + 1
    //       }`
    //     );
    //   }

    //   // Find the corresponding operation in allOperations and update it
    //   const operationIndex = allOperations.findIndex(
    //     (op) => op.nodeId === salesforceNode.id && op.type === "read_salesforce"
    //   );
    //   if (operationIndex !== -1) {
    //     allOperations[operationIndex].configId = configResponse.id;
    //   }

    //   console.log(
    //     `Created Salesforce read config ${configResponse.id} for sequence ${
    //       sequence.sequenceIndex + 1
    //     }`
    //   );
    // }
    // Process Salesforce read sequences
    for (const sequence of salesforceReadSequences) {
      const { salesforceNode } = sequence

      // Validate required Salesforce read fields
      if (!salesforceNode.data.object_name || !salesforceNode.data.query || !salesforceNode.data.file_path) {
        toast({
          title: "Error",
          description:
            "Salesforce read workflow requires object_name, query, and file_path. Please configure the Salesforce read node first.",
          variant: "destructive",
        })
        return false
      }

      // Get fields from either fields or selectedFields property
      const fields = salesforceNode.data.fields || salesforceNode.data.selectedFields || []

      console.log("Salesforce node data:", salesforceNode.data) // Debug log
      console.log("Fields being sent to API:", fields) // Debug log

      // Create Salesforce read configuration payload
      const configPayload = {
        object_name: salesforceNode.data.object_name,
        query: salesforceNode.data.query,
        fields: fields, // Use the extracted fields
        where: salesforceNode.data.where || "",
        limit: salesforceNode.data.limit || undefined,
        use_bulk_api: salesforceNode.data.use_bulk_api || false,
        file_path: salesforceNode.data.file_path,
      }

      console.log(`Creating Salesforce read config ${sequence.sequenceIndex + 1}:`, configPayload)

      // Create the config
      const configResponse = await createSalesforceReadConfig(dynamicClientIdString, configPayload)
      if (!configResponse) {
        throw new Error(`Failed to create Salesforce read config for sequence ${sequence.sequenceIndex + 1}`)
      }

      // Find the corresponding operation in allOperations and update it
      const operationIndex = allOperations.findIndex(
        (op) => op.nodeId === salesforceNode.id && op.type === "read_salesforce",
      )
      if (operationIndex !== -1) {
        allOperations[operationIndex].configId = configResponse.id
      }

      console.log(`Created Salesforce read config ${configResponse.id} for sequence ${sequence.sequenceIndex + 1}`)
    }

    // Process Salesforce write sequences
    for (const sequence of salesforceWriteSequences) {
      const { salesforceNode } = sequence

      // Validate required Salesforce write fields
      if (!salesforceNode.data.object_name || !salesforceNode.data.file_path || !salesforceNode.data.bulk_batch_size) {
        toast({
          title: "Error",
          description:
            "Salesforce write workflow requires object_name, file_path, and bulk_batch_size. Please configure the Salesforce write node first.",
          variant: "destructive",
        })
        return false
      }

      // Create Salesforce write configuration payload
      const configPayload = {
        object_name: salesforceNode.data.object_name,
        fields: salesforceNode.data.fields || [],
        use_bulk_api: salesforceNode.data.use_bulk_api || false,
        bulk_batch_size: salesforceNode.data.bulk_batch_size || 1000,
        file_path: salesforceNode.data.file_path,
      }

      console.log(`Creating Salesforce write config ${sequence.sequenceIndex + 1}:`, configPayload)

      // Create the config
      const configResponse = await createSalesforceWriteConfig(dynamicClientIdString, configPayload)
      if (!configResponse) {
        throw new Error(`Failed to create Salesforce write config for sequence ${sequence.sequenceIndex + 1}`)
      }

      // Find the corresponding operation in allOperations and update it
      const operationIndex = allOperations.findIndex(
        (op) => op.nodeId === salesforceNode.id && op.type === "write_salesforce",
      )
      if (operationIndex !== -1) {
        allOperations[operationIndex].configId = configResponse.id
      }

      console.log(`Created Salesforce write config ${configResponse.id} for sequence ${sequence.sequenceIndex + 1}`)
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
    const salesforceReadCount = salesforceReadSequences.length
    const salesforceWriteCount = salesforceWriteSequences.length

    toast({
      title: "Success",
      description: `Workflow saved and triggered successfully with ${fileConversionCount} file conversion(s), ${cliOperationCount} CLI operation(s), ${salesforceReadCount} Salesforce read(s), and ${salesforceWriteCount} Salesforce write(s).`,
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
    if (sequence.type === "file-to-file" || sequence.type === "file-to-database") {
      if (!sequence.readNode.data.path) {
        errors.push(`Read file node in sequence ${sequence.sequenceIndex + 1} is missing a file path`)
      }
      if (!sequence.readNode.data.format) {
        errors.push(`Read file node in sequence ${sequence.sequenceIndex + 1} is missing a file format`)
      }
    }
    if (sequence.type === "file-to-file") {
      if (!sequence.writeNode.data.path) {
        errors.push(`Write file node in sequence ${sequence.sequenceIndex + 1} is missing a file path`)
      }
      if (!sequence.writeNode.data.format) {
        errors.push(`Write file node in sequence ${sequence.sequenceIndex + 1} is missing a file format`)
      }
    }
    if (sequence.type === "file-to-database" || sequence.type === "database-to-file") {
      if (!sequence.writeNode.data.connectionString) {
        errors.push(`Database node in sequence ${sequence.sequenceIndex + 1} is missing a connection string`)
      }
      if (!sequence.writeNode.data.table) {
        errors.push(`Database node in sequence ${sequence.sequenceIndex + 1} is missing a table name`)
      }
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

  // Check Salesforce read sequences
  const salesforceReadSequences = findSalesforceSequences(nodes, connections)
  for (const sequence of salesforceReadSequences) {
    const { salesforceNode } = sequence
    if (!salesforceNode.data.object_name) {
      errors.push(`Salesforce read node in sequence ${sequence.sequenceIndex + 1} is missing an object name`)
    }
    if (!salesforceNode.data.query) {
      errors.push(`Salesforce read node in sequence ${sequence.sequenceIndex + 1} is missing a query`)
    }
    if (!salesforceNode.data.file_path) {
      errors.push(`Salesforce read node in sequence ${sequence.sequenceIndex + 1} is missing a file path`)
    }
  }

  // Check Salesforce write sequences
  const salesforceWriteSequences = findSalesforceWriteSequences(nodes, connections)
  for (const sequence of salesforceWriteSequences) {
    const { salesforceNode } = sequence
    if (!salesforceNode.data.object_name) {
      errors.push(`Salesforce write node in sequence ${sequence.sequenceIndex + 1} is missing an object name`)
    }
    if (!salesforceNode.data.file_path) {
      errors.push(`Salesforce write node in sequence ${sequence.sequenceIndex + 1} is missing a file path`)
    }
    if (!salesforceNode.data.bulk_batch_size) {
      errors.push(`Salesforce write node in sequence ${sequence.sequenceIndex + 1} is missing a bulk batch size`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Export helper functions for external use
export {
  findFileConversionSequences,
  findCliOperationSequences,
  findSalesforceSequences,
  findSalesforceWriteSequences,
  findAllOperationsInOrder,
}

function createFileToFileConfig(readNode, writeNode, filterNode, workflowId) {
  const config = {
    input: {
      path: readNode.data.path,
      format: readNode.data.format,
      options: readNode.data.options || {},
    },
    output: {
      path: writeNode.data.path,
      format: writeNode.data.format,
      options: writeNode.data.options || {},
    },
    filter: filterNode
      ? {
          condition: filterNode.data.condition,
        }
      : null,
    workflow_id: workflowId,
    nodeType: "write-file",
  }

  return config
}

function createFileToDatabaseConfig(readNode, writeNode, filterNode, workflowId) {
  const config = {
    input: {
      path: readNode.data.path,
      format: readNode.data.format,
      options: readNode.data.options || {},
    },
    output: {
      connectionString: writeNode.data.connectionString,
      table: writeNode.data.table,
      options: writeNode.data.options || {},
    },
    filter: filterNode
      ? {
          condition: filterNode.data.condition,
        }
      : null,
    workflow_id: workflowId,
    nodeType: "database",
  }

  return config
}
