// //workflow-utils.ts
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
// } from "@/services/schema-mapper";
// import { createSalesforceReadConfig } from "@/services/salesforce/salesforceread";
// import {
//   createCliOperatorConfig,
//   mapCopyFileToCliOperator,
//   mapMoveFileToCliOperator,
//   mapRenameFileToCliOperator,
//   mapDeleteFileToCliOperator,
// } from "@/services/cli-operator-service";
// import { toast } from "@/components/ui/use-toast";
// import { getCurrentClientId } from "@/components/workflow/workflow-context";

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

// // Interface for Salesforce sequence
// interface SalesforceSequence {
//   salesforceNode: WorkflowNode;
//   sequenceIndex: number;
// }

// // Interface for operation config
// interface OperationConfig {
//   type: "file_conversion" | "cli_operator" | "salesforce-cloud" | "write-salesforce";
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

//   // Process database source nodes
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

// // Find all Salesforce sequences in the workflow
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

//     // Check if current node starts a file conversion sequence
//     if (nextNode.type === "read-file" || nextNode.type === "source") {
//       // Find the complete file conversion sequence
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
//     // Check if current node is a CLI operation
//     else if (
//       nextNode.type === "copy-file" ||
//       nextNode.type === "move-file" ||
//       nextNode.type === "rename-file" ||
//       nextNode.type === "delete-file"
//     ) {
//       operations.push({
//         type: "cli_operator",
//         configId: -1, // Will be set later
//         nodeId: nextNode.id,
//         sequenceIndex: operationIndex++,
//       });
//       currentNode = nextNode;
//     }
//     // Check if current node is a Salesforce operation
//     else if (nextNode.type === "salesforce-cloud") {
//       operations.push({
//         type: "salesforce-cloud",
//         configId: -1, // Will be set later
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
//   } else {
//     firstNodeId = `salesforce-cloud_${firstConfig.configId}`;
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
//     } else {
//       nodeId = `salesforce-cloud_${config.configId}`;
//     }

//     let nextNodeId: string[];
//     if (nextConfig) {
//       if (nextConfig.type === "file_conversion") {
//         nextNodeId = [`file_node_${nextConfig.configId}`];
//       } else if (nextConfig.type === "cli_operator") {
//         nextNodeId = [`cli_op_node_${nextConfig.configId}`];
//       } else {
//         nextNodeId = [`salesforce-cloud_${nextConfig.configId}`];
//       }
//     } else {
//       nextNodeId = [makePythonSafeId(endNode.id)];
//     }

//     dagSequence.push({
//       id: nodeId,
//       type: config.type,
//       config_id: config.configId,
//       next: nextNodeId,
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
//     const salesforceSequences = findSalesforceSequences(nodes, connections);
//     const allOperations = findAllOperationsInOrder(nodes, connections);

//     console.log(
//       `Found ${fileConversionSequences.length} file conversion sequences`
//     );
//     console.log(
//       `Found ${cliOperationSequences.length} CLI operation sequences`
//     );
//     console.log(`Found ${salesforceSequences.length} Salesforce sequences`);
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
//       } else if (type === "database-to-file") {
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

//     // Process Salesforce sequences
//     for (const sequence of salesforceSequences) {
//       const { salesforceNode } = sequence;

//       // Validate required Salesforce fields
//       if (
//         !salesforceNode.data.object_name ||
//         !salesforceNode.data.query ||
//         !salesforceNode.data.file_path
//       ) {
//         toast({
//           title: "Error",
//           description:
//             "Salesforce workflow requires object name, query, and file path. Please configure the Salesforce node first.",
//           variant: "destructive",
//         });
//         return false;
//       }

//       // Create Salesforce configuration payload
//       const configPayload = {
//         object_name: salesforceNode.data.object_name,
//         query: salesforceNode.data.query,
//         fields: salesforceNode.data.fields || [],
//         where: salesforceNode.data.where || "",
//         limit: salesforceNode.data.limit || undefined,
//         use_bulk_api: salesforceNode.data.use_bulk_api || false,
//         file_path: salesforceNode.data.file_path,
//       };

//       console.log(
//         `Creating Salesforce config ${sequence.sequenceIndex + 1}:`,
//         configPayload
//       );

//       // Create the config
//       const configResponse = await createSalesforceReadConfig(
//         dynamicClientIdString,
//         configPayload
//       );
//       if (!configResponse) {
//         throw new Error(
//           `Failed to create Salesforce config for sequence ${
//             sequence.sequenceIndex + 1
//           }`
//         );
//       }

//       // Find the corresponding operation in allOperations and update it
//       const operationIndex = allOperations.findIndex(
//         (op) => op.nodeId === salesforceNode.id && op.type === "salesforce-cloud"
//       );
//       if (operationIndex !== -1) {
//         allOperations[operationIndex].configId = configResponse.id;
//       }

//       console.log(
//         `Created Salesforce config ${configResponse.id} for sequence ${
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
//     const salesforceCount = salesforceSequences.length;

//     toast({
//       title: "Success",
//       description: `Workflow saved and triggered successfully with ${fileConversionCount} file conversion(s), ${cliOperationCount} CLI operation(s), and ${salesforceCount} Salesforce operation(s).`,
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

//   // Check Salesforce sequences
//   const salesforceSequences = findSalesforceSequences(nodes, connections);

//   for (const sequence of salesforceSequences) {
//     const { salesforceNode } = sequence;

//     if (!salesforceNode.data.object_name) {
//       errors.push(
//         `Salesforce node in sequence ${
//           sequence.sequenceIndex + 1
//         } is missing an object name`
//       );
//     }

//     if (!salesforceNode.data.query) {
//       errors.push(
//         `Salesforce node in sequence ${
//           sequence.sequenceIndex + 1
//         } is missing a query`
//       );
//     }

//     if (!salesforceNode.data.file_path) {
//       errors.push(
//         `Salesforce node in sequence ${
//           sequence.sequenceIndex + 1
//         } is missing a file path`
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
//   findAllOperationsInOrder,
// };

import type {
  WorkflowNode,
  NodeConnection,
} from "@/components/workflow/workflow-context";
import {
  createFileConversionConfig,
  updateDag,
  triggerDagRun,
} from "@/services/file-conversion-service";
import {
  createFileToFileConfig,
  createFileToDatabaseConfig,
  createDatabaseToFileConfig,
} from "@/services/schema-mapper";
import { createSalesforceReadConfig } from "@/services/salesforce/salesforceread";
import { createSalesforceWriteConfig } from "@/services/salesforce/salesforcewrite"; // Correct import
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

// Interface for file conversion sequence
interface FileConversionSequence {
  readNode: WorkflowNode;
  writeNode: WorkflowNode;
  filterNode?: WorkflowNode;
  sequenceIndex: number;
  type: "file-to-file" | "file-to-database" | "database-to-file";
}

// Interface for CLI operation sequence
interface CliOperationSequence {
  operationNode: WorkflowNode;
  sequenceIndex: number;
}

// Interface for Salesforce read sequence
interface SalesforceReadSequence {
  salesforceNode: WorkflowNode;
  sequenceIndex: number;
}

// Interface for Salesforce write sequence
interface SalesforceWriteSequence {
  salesforceNode: WorkflowNode;
  sequenceIndex: number;
}

// Interface for operation config
interface OperationConfig {
  type: "file_conversion" | "cli_operator" | "salesforce-cloud" | "write-salesforce";
  configId: number;
  nodeId: string;
  sequenceIndex: number;
}

// Find the next node in the workflow based on connections
function findNextNode(
  currentNodeId: string,
  connections: NodeConnection[],
  nodes: WorkflowNode[]
): WorkflowNode | null {
  const connection = connections.find(
    (conn) => conn.sourceId === currentNodeId
  );
  if (!connection) return null;
  return nodes.find((node) => node.id === connection.targetId) || null;
}

// Enhanced function to find all file conversion sequences (including database operations)
function findFileConversionSequences(
  nodes: WorkflowNode[],
  connections: NodeConnection[]
): FileConversionSequence[] {
  const sequences: FileConversionSequence[] = [];

  const readFileNodes = nodes.filter((node) => node.type === "read-file");
  const databaseSourceNodes = nodes.filter((node) => node.type === "source");

  let sequenceIndex = 0;

  for (const readNode of readFileNodes) {
    let currentNode: WorkflowNode | null = readNode;
    let writeNode: WorkflowNode | null = null;
    let filterNode: WorkflowNode | null = null;

    while (currentNode) {
      const nextNode = findNextNode(currentNode.id, connections, nodes);
      if (!nextNode) break;

      if (nextNode.type === "write-file") {
        writeNode = nextNode;
        const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes);
        if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
          filterNode = nodeAfterWrite;
        }
        sequences.push({
          readNode,
          writeNode,
          filterNode,
          sequenceIndex: sequenceIndex++,
          type: "file-to-file",
        });
        break;
      } else if (nextNode.type === "database") {
        writeNode = nextNode;
        const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes);
        if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
          filterNode = nodeAfterWrite;
        }
        sequences.push({
          readNode,
          writeNode,
          filterNode,
          sequenceIndex: sequenceIndex++,
          type: "file-to-database",
        });
        break;
      } else if (nextNode.type === "filter") {
        filterNode = nextNode;
        currentNode = nextNode;
      } else {
        currentNode = nextNode;
      }
    }
  }

  for (const dbSourceNode of databaseSourceNodes) {
    let currentNode: WorkflowNode | null = dbSourceNode;
    let writeNode: WorkflowNode | null = null;
    let filterNode: WorkflowNode | null = null;

    while (currentNode) {
      const nextNode = findNextNode(currentNode.id, connections, nodes);
      if (!nextNode) break;

      if (nextNode.type === "write-file") {
        writeNode = nextNode;
        const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes);
        if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
          filterNode = nodeAfterWrite;
        }
        sequences.push({
          readNode: dbSourceNode,
          writeNode,
          filterNode,
          sequenceIndex: sequenceIndex++,
          type: "database-to-file",
        });
        break;
      } else if (nextNode.type === "filter") {
        filterNode = nextNode;
        currentNode = nextNode;
      } else {
        currentNode = nextNode;
      }
    }
  }

  return sequences;
}

// Find all CLI operation sequences in the workflow
function findCliOperationSequences(
  nodes: WorkflowNode[],
  connections: NodeConnection[]
): CliOperationSequence[] {
  const sequences: CliOperationSequence[] = [];
  const cliOperationNodes = nodes.filter(
    (node) =>
      node.type === "copy-file" ||
      node.type === "move-file" ||
      node.type === "rename-file" ||
      node.type === "delete-file"
  );

  let sequenceIndex = 0;
  for (const operationNode of cliOperationNodes) {
    sequences.push({
      operationNode,
      sequenceIndex: sequenceIndex++,
    });
  }

  return sequences;
}

// Find all Salesforce read sequences in the workflow
function findSalesforceReadSequences(
  nodes: WorkflowNode[],
  connections: NodeConnection[] // Parameter 'connections' is not used in this function but kept for consistency with other findSequence functions if needed later.
): SalesforceReadSequence[] {
  const sequences: SalesforceReadSequence[] = [];
  const salesforceReadNodes = nodes.filter(
    (node) => node.type === "salesforce-cloud"
  );

  let sequenceIndex = 0;
  for (const salesforceNode of salesforceReadNodes) {
    sequences.push({
      salesforceNode,
      sequenceIndex: sequenceIndex++,
    });
  }

  return sequences;
}

// Find all Salesforce write sequences in the workflow
function findSalesforceWriteSequences(
  nodes: WorkflowNode[],
  connections: NodeConnection[] // Parameter 'connections' is not used in this function but kept for consistency.
): SalesforceWriteSequence[] {
  const sequences: SalesforceWriteSequence[] = [];
  const salesforceWriteNodes = nodes.filter(
    (node) => node.type === "write-salesforce" // Correct type for Salesforce write nodes
  );

  let sequenceIndex = 0;
  for (const salesforceNode of salesforceWriteNodes) {
    sequences.push({
      salesforceNode,
      sequenceIndex: sequenceIndex++,
    });
  }

  return sequences;
}

// Find all operations in workflow order (mixed file conversions, CLI operations, and Salesforce read/write)
function findAllOperationsInOrder(
  nodes: WorkflowNode[],
  connections: NodeConnection[]
): OperationConfig[] {
  const operations: OperationConfig[] = [];
  const startNode = nodes.find((node) => node.type === "start");
  if (!startNode) return operations;

  let currentNode = startNode;
  let operationIndex = 0;

  while (currentNode) {
    const nextNode = findNextNode(currentNode.id, connections, nodes);
    if (!nextNode) break;

    if (nextNode.type === "read-file" || nextNode.type === "source") {
      const readNode = nextNode;
      let writeNode: WorkflowNode | null = null;
      let filterNode: WorkflowNode | null = null;
      let sequenceNode: WorkflowNode | null = readNode;

      while (sequenceNode) {
        const seqNextNode = findNextNode(sequenceNode.id, connections, nodes);
        if (!seqNextNode) break;

        if (seqNextNode.type === "write-salesforce") { // If read-file leads to write-salesforce directly
          currentNode = seqNextNode; // Advance current node to handle write-salesforce in next iteration
          writeNode = null; // Ensure file_conversion is not pushed for this path
          break;
        } else if (
          seqNextNode.type === "write-file" ||
          seqNextNode.type === "database"
        ) {
          writeNode = seqNextNode;
          const nodeAfterWrite = findNextNode(writeNode.id, connections, nodes);
          if (nodeAfterWrite && nodeAfterWrite.type === "filter") {
            filterNode = nodeAfterWrite;
            currentNode = filterNode;
          } else {
            currentNode = writeNode;
          }
          break;
        } else if (seqNextNode.type === "filter") {
          filterNode = seqNextNode;
          sequenceNode = seqNextNode;
        } else {
          // If it's another type of node (e.g. CLI, SF-Read) break to handle it as a standalone operation.
          // This prevents file_conversion from consuming unrelated subsequent nodes.
          // The 'currentNode' should be advanced to this 'seqNextNode' if it's an operation to be processed.
          // However, the outer loop's nextNode logic will handle this.
          // For now, we stop processing the file_conversion sequence here.
          // The 'currentNode' for the outer loop will still be the 'sequenceNode' (which is 'readNode' or 'filterNode' before 'seqNextNode')
          // So we need to advance `currentNode` to `sequenceNode` so that the *next* `nextNode` in the outer loop becomes `seqNextNode`.
          currentNode = sequenceNode; // Current node remains the start of the sequence that didn't complete.
                                      // The next iteration of the outer loop will process `seqNextNode`.
          break; // Break from inner while loop
        }
      }

      if (writeNode) { // Only push file_conversion if a write-file or database target was found
        operations.push({
          type: "file_conversion",
          configId: -1,
          nodeId: readNode.id, // readNode.id identifies the start of this conversion sequence
          sequenceIndex: operationIndex++,
        });
      } else if (currentNode !== nextNode && nodes.find(n => n.id === currentNode.id)?.type !== "write-salesforce") {
         // If no writeNode was found for a file_conversion, and currentNode was not advanced to write-salesforce,
         // advance currentNode to ensure progress.
         // This handles cases where a read-file might not lead to a write-file/database
         // or write-salesforce directly, and other nodes follow.
         // The next iteration will then pick up `nextNode` from this new `currentNode`.
         // This logic might need refinement based on how isolated read-files should be handled.
         // For now, assuming read-file must lead to a conversion or write-salesforce,
         // or it's an incomplete sequence. If currentNode didn't change, advance it.
         if (findNextNode(currentNode.id, connections, nodes) === nextNode){
            // This means sequenceNode loop didn't advance currentNode significantly.
            // Let the outer loop advance it.
         }
      }
       // If currentNode was updated to write-salesforce, the next iteration will handle it.
       // If writeNode was found, currentNode was updated to writeNode or filterNode.
       // If no writeNode and not write-salesforce, currentNode is where the sequence broke.
       // The outer loop `currentNode = nextNode` (or the updated `currentNode` from sequence processing) will handle progress.

    } else if (
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
      });
      currentNode = nextNode;
    } else if (nextNode.type === "salesforce-cloud") {
      operations.push({
        type: "salesforce-cloud",
        configId: -1,
        nodeId: nextNode.id,
        sequenceIndex: operationIndex++,
      });
      currentNode = nextNode;
    } else if (nextNode.type === "write-salesforce") {
      operations.push({
        type: "write-salesforce",
        configId: -1,
        nodeId: nextNode.id,
        sequenceIndex: operationIndex++,
      });
      currentNode = nextNode;
    } else {
      // For any other node type, just advance currentNode
      currentNode = nextNode;
    }
  }

  return operations;
}

// Create DAG sequence for mixed operations
function createMixedOperationsDagSequence(
  operationConfigs: OperationConfig[],
  startNode: WorkflowNode,
  endNode: WorkflowNode
): any[] {
  const dagSequence: any[] = [];
  if (operationConfigs.length === 0) {
    // If no operations, connect start directly to end
    dagSequence.push({
      id: makePythonSafeId(startNode.id),
      type: "start",
      config_id: 1, // Placeholder or default config_id for start/end
      next: [makePythonSafeId(endNode.id)],
    });
    dagSequence.push({
      id: makePythonSafeId(endNode.id),
      type: "end",
      config_id: 1, // Placeholder or default config_id for start/end
      next: [],
    });
    return dagSequence;
  }


  const firstConfig = operationConfigs[0];
  let firstNodeDagId: string;

  // Determine DAG ID for the first operational node
  if (firstConfig.type === "file_conversion") {
    firstNodeDagId = `file_node_${firstConfig.configId}`;
  } else if (firstConfig.type === "cli_operator") {
    firstNodeDagId = `cli_op_node_${firstConfig.configId}`;
  } else if (firstConfig.type === "salesforce-cloud") {
    firstNodeDagId = `salesforce_read_${firstConfig.configId}`;
  } else { // This will be "write-salesforce"
    firstNodeDagId = `salesforce_write_${firstConfig.configId}`;
  }

  dagSequence.push({
    id: makePythonSafeId(startNode.id),
    type: "start",
    config_id: 1, // Assuming a default or placeholder config_id for start
    next: [makePythonSafeId(firstNodeDagId)], // Python-safe ID for the next node
  });

  for (let i = 0; i < operationConfigs.length; i++) {
    const config = operationConfigs[i];
    const nextConfig = operationConfigs[i + 1];

    let currentDagNodeId: string;
    if (config.type === "file_conversion") {
      currentDagNodeId = `file_node_${config.configId}`;
    } else if (config.type === "cli_operator") {
      currentDagNodeId = `cli_op_node_${config.configId}`;
    } else if (config.type === "salesforce-cloud") {
      currentDagNodeId = `salesforce_read_${config.configId}`;
    } else { // "write-salesforce"
      currentDagNodeId = `salesforce_write_${config.configId}`;
    }

    let nextNodeDagIds: string[];
    if (nextConfig) {
      if (nextConfig.type === "file_conversion") {
        nextNodeDagIds = [`file_node_${nextConfig.configId}`];
      } else if (nextConfig.type === "cli_operator") {
        nextNodeDagIds = [`cli_op_node_${nextConfig.configId}`];
      } else if (nextConfig.type === "salesforce-cloud") {
        nextNodeDagIds = [`salesforce_read_${nextConfig.configId}`];
      } else { // "write-salesforce"
        nextNodeDagIds = [`salesforce_write_${nextConfig.configId}`];
      }
       nextNodeDagIds = nextNodeDagIds.map(id => makePythonSafeId(id)); // Ensure next IDs are python-safe
    } else {
      nextNodeDagIds = [makePythonSafeId(endNode.id)];
    }

    dagSequence.push({
      id: makePythonSafeId(currentDagNodeId), // Python-safe ID for current node
      type: config.type,
      config_id: config.configId,
      next: nextNodeDagIds,
    });
  }

  dagSequence.push({
    id: makePythonSafeId(endNode.id),
    type: "end",
    config_id: 1, // Assuming a default or placeholder config_id for end
    next: [],
  });

  return dagSequence;
}

// Enhanced save and run workflow function
export async function saveAndRunWorkflow(
  nodes: WorkflowNode[],
  connections: NodeConnection[],
  currentWorkflowId: string | null
): Promise<boolean> {
  const dynamicClientIdString = getCurrentClientId();
  if (!dynamicClientIdString) {
    toast({
      title: "Error",
      description: "Client ID not found. Please ensure you're logged in.",
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
    const startNodes = nodes.filter((node) => node.type === "start");
    const endNodes = nodes.filter((node) => node.type === "end");

    if (startNodes.length === 0 || endNodes.length === 0) {
      toast({
        title: "Error",
        description: "Workflow must have both start and end nodes.",
        variant: "destructive",
      });
      return false;
    }
     if (startNodes.length > 1 || endNodes.length > 1) {
      toast({
        title: "Error",
        description: "Workflow must have exactly one start and one end node.",
        variant: "destructive",
      });
      return false;
    }


    const allOperations = findAllOperationsInOrder(nodes, connections);
    console.log(`Total operations in order:`, allOperations);

    if (allOperations.length === 0 && connections.some(c => c.sourceId === startNodes[0].id && c.targetId === endNodes[0].id)) {
      // This is a valid Start -> End workflow with no operations.
      // No configs to create, just update DAG.
    } else if (allOperations.length === 0) {
       toast({
        title: "Error",
        description: "No valid operations found between start and end nodes.",
        variant: "destructive",
      });
      return false;
    }


    // Re-fetch sequences here as their data might be used for creating configs
    const fileConversionSequences = findFileConversionSequences(nodes, connections);
    const cliOperationSequences = findCliOperationSequences(nodes, connections);
    const sfReadSequences = findSalesforceReadSequences(nodes, connections);
    const sfWriteSequences = findSalesforceWriteSequences(nodes, connections);


    console.log(`Found ${fileConversionSequences.length} file conversion sequences`);
    console.log(`Found ${cliOperationSequences.length} CLI operation sequences`);
    console.log(`Found ${sfReadSequences.length} Salesforce-read sequences`);
    console.log(`Found ${sfWriteSequences.length} Salesforce-write sequences`);


    // Process file conversion sequences
    for (const sequence of fileConversionSequences) {
      const { readNode, writeNode, filterNode, type } = sequence;
      const operation = allOperations.find(op => op.nodeId === readNode.id && op.type === "file_conversion");
      if (!operation) continue; // This sequence is not part of the main ordered flow

      if ((type === "file-to-file" || type === "file-to-database") && !readNode.data.path) {
        toast({ title: "Error", description: `File conversion (read node ${readNode.id}) is missing input file path.`, variant: "destructive" });
        return false;
      }
      if (type === "file-to-file" && !writeNode.data.path) {
        toast({ title: "Error", description: `File conversion (write node ${writeNode.id}) is missing output file path.`, variant: "destructive" });
        return false;
      }
      if ((type === "file-to-database" || type === "database-to-file") && (!writeNode.data.connectionString || !writeNode.data.table)) {
        toast({ title: "Error", description: `Database operation (node ${writeNode.id}) is missing connection string or table name.`, variant: "destructive" });
        return false;
      }

      let configPayload;
      if (type === "file-to-file") configPayload = createFileToFileConfig(readNode, writeNode, filterNode || null, currentWorkflowId);
      else if (type === "file-to-database") configPayload = createFileToDatabaseConfig(readNode, writeNode, filterNode || null, currentWorkflowId);
      else configPayload = createDatabaseToFileConfig(readNode, writeNode, filterNode || null, currentWorkflowId);

      console.log(`Creating ${type} config for node ${readNode.id}:`, configPayload);
      const configResponse = await createFileConversionConfig(clientId, configPayload);
      if (!configResponse) throw new Error(`Failed to create ${type} config for node ${readNode.id}`);
      operation.configId = configResponse.id;
      console.log(`Created ${type} config ${configResponse.id} for node ${readNode.id}`);
    }

    // Process CLI operation sequences
    for (const sequence of cliOperationSequences) {
      const { operationNode } = sequence;
      const operation = allOperations.find(op => op.nodeId === operationNode.id && op.type === "cli_operator");
      if (!operation) continue;

      let cliConfigPayload;
      switch (operationNode.type) {
        case "copy-file":
          if (!operationNode.data.source_path || !operationNode.data.destination_path) {
            toast({ title: "Error", description: `Copy file node ${operationNode.id} requires source/destination paths.`, variant: "destructive" }); return false;
          }
          cliConfigPayload = mapCopyFileToCliOperator(operationNode); break;
        case "move-file":
          if (!operationNode.data.source_path || !operationNode.data.destination_path) {
            toast({ title: "Error", description: `Move file node ${operationNode.id} requires source/destination paths.`, variant: "destructive" }); return false;
          }
          cliConfigPayload = mapMoveFileToCliOperator(operationNode); break;
        case "rename-file":
          if (!operationNode.data.source_path || !operationNode.data.destination_path) {
            toast({ title: "Error", description: `Rename file node ${operationNode.id} requires source/destination paths.`, variant: "destructive" }); return false;
          }
          cliConfigPayload = mapRenameFileToCliOperator(operationNode); break;
        case "delete-file":
          if (!operationNode.data.source_path) {
            toast({ title: "Error", description: `Delete file node ${operationNode.id} requires a source path.`, variant: "destructive" }); return false;
          }
          cliConfigPayload = mapDeleteFileToCliOperator(operationNode); break;
        default: throw new Error(`Unsupported CLI operation type: ${operationNode.type}`);
      }

      console.log(`Creating CLI operator config (${operationNode.type}) for node ${operationNode.id}:`, cliConfigPayload);
      const configResponse = await createCliOperatorConfig(clientId, cliConfigPayload);
      if (!configResponse) throw new Error(`Failed to create CLI config for ${operationNode.type} node ${operationNode.id}`);
      operation.configId = configResponse.id;
      console.log(`Created CLI operator config ${configResponse.id} for ${operationNode.type} node ${operationNode.id}`);
    }

    // Process Salesforce read sequences
    for (const sequence of sfReadSequences) {
      const { salesforceNode } = sequence;
      const operation = allOperations.find(op => op.nodeId === salesforceNode.id && op.type === "salesforce-cloud");
      if (!operation) continue;

      if (!salesforceNode.data.object_name || !salesforceNode.data.query || !salesforceNode.data.file_path) {
        toast({ title: "Error", description: `Salesforce read node ${salesforceNode.id} requires object name, query, and file path.`, variant: "destructive" });
        return false;
      }
      const configPayload = {
        object_name: salesforceNode.data.object_name, query: salesforceNode.data.query,
        fields: salesforceNode.data.fields || [], where: salesforceNode.data.where || "",
        limit: salesforceNode.data.limit === 0 ? 0 : salesforceNode.data.limit || undefined, // Explicitly allow 0 for limit
        use_bulk_api: salesforceNode.data.use_bulk_api || false, file_path: salesforceNode.data.file_path,
      };
      console.log(`Creating Salesforce read config for node ${salesforceNode.id}:`, configPayload);
      const configResponse = await createSalesforceReadConfig(dynamicClientIdString, configPayload);
      if (!configResponse) throw new Error(`Failed to create Salesforce read config for node ${salesforceNode.id}`);
      operation.configId = configResponse.id;
      console.log(`Created Salesforce read config ${configResponse.id} for node ${salesforceNode.id}`);
    }

    // Process Salesforce write sequences
    for (const sequence of sfWriteSequences) {
      const { salesforceNode } = sequence;
      const operation = allOperations.find(op => op.nodeId === salesforceNode.id && op.type === "write-salesforce");
      if (!operation) continue;

      // **MODIFIED VALIDATION for bulk_batch_size**
      if (
        !salesforceNode.data.object_name ||
        salesforceNode.data.bulk_batch_size === undefined || // Changed from !salesforceNode.data.bulk_batch_size
        salesforceNode.data.use_bulk_api === undefined ||
        !salesforceNode.data.file_path
      ) {
        toast({
          title: "Error",
          description: `Salesforce write node ${salesforceNode.id} requires object name, bulk_batch_size, use_bulk_api, and file path. Please configure the node.`,
          variant: "destructive",
        });
        return false;
      }
      const configPayload = {
        object_name: salesforceNode.data.object_name,
        bulk_batch_size: salesforceNode.data.bulk_batch_size,
        use_bulk_api: salesforceNode.data.use_bulk_api,
        file_path: salesforceNode.data.file_path,
      };
      console.log(`Creating Salesforce write config for node ${salesforceNode.id}:`, configPayload);
      const configResponse = await createSalesforceWriteConfig(dynamicClientIdString, configPayload);
      if (!configResponse) throw new Error(`Failed to create Salesforce write config for node ${salesforceNode.id}`);
      operation.configId = configResponse.id;
      console.log(`Created Salesforce write config ${configResponse.id} for node ${salesforceNode.id}`);
    }

    const validOperations = allOperations.filter(op => op.configId !== -1 && op.configId !== undefined);
    if (allOperations.length > 0 && validOperations.length !== allOperations.length) {
        const missingConfigOps = allOperations.filter(op => op.configId === -1 || op.configId === undefined);
        console.error("Some operations are missing config IDs after processing:", missingConfigOps);
        toast({
            title: "Error",
            description: `Internal error: Not all operations could be configured. Problematic nodes: ${missingConfigOps.map(op => op.nodeId).join(', ')}`,
            variant: "destructive",
        });
        return false;
    }


    const dagSequence = createMixedOperationsDagSequence(validOperations, startNodes[0], endNodes[0]);
    console.log("Generated DAG sequence for mixed operations:", dagSequence);

    const dagUpdateData = { dag_sequence: dagSequence, active: true };
    const updatedDag = await updateDag(currentWorkflowId, dagUpdateData);
    if (!updatedDag) throw new Error("Failed to update DAG");
    console.log("DAG updated successfully");

    try {
      console.log("Triggering DAG run...");
      const triggerResult = await triggerDagRun(currentWorkflowId);
      console.log("DAG run trigger attempt result:", triggerResult); // Log result even if null/undefined
    } catch (triggerError) {
      console.error("Error triggering DAG run, but workflow was saved:", triggerError);
      toast({
        title: "Partial Success",
        description: "Workflow saved but failed to trigger. You can run it manually from the DAG interface.",
        variant: "default", // Changed to default as it's not a full failure of saving
      });
      return true; // Workflow was saved
    }

    const fcCount = validOperations.filter(op => op.type === 'file_conversion').length;
    const cliCount = validOperations.filter(op => op.type === 'cli_operator').length;
    const sfReadCount = validOperations.filter(op => op.type === 'salesforce-cloud').length;
    const sfWriteCount = validOperations.filter(op => op.type === 'write-salesforce').length;

    toast({
      title: "Success",
      description: `Workflow saved and triggered successfully with ${fcCount} file conversion(s), ${cliCount} CLI operation(s), ${sfReadCount} Salesforce-read(s), and ${sfWriteCount} Salesforce-write(s).`,
    });
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

// Helper function to validate workflow structure
export function validateWorkflowStructure(
  nodes: WorkflowNode[],
  connections: NodeConnection[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const startNodes = nodes.filter((node) => node.type === "start");
  const endNodes = nodes.filter((node) => node.type === "end");

  if (startNodes.length === 0) errors.push("Workflow must have a start node");
  if (endNodes.length === 0) errors.push("Workflow must have an end node");
  if (startNodes.length > 1) errors.push("Workflow can only have one start node");
  if (endNodes.length > 1) errors.push("Workflow can only have one end node");

  const fileConversionSequences = findFileConversionSequences(nodes, connections);
  for (const sequence of fileConversionSequences) {
    const { readNode, writeNode, type, sequenceIndex } = sequence; // Use original sequenceIndex for user message
    const userFriendlyIndex = sequenceIndex +1; // For 1-based indexing in messages

    if ((type === "file-to-file" || type === "file-to-database")) {
      if (!readNode.data.path) errors.push(`Read file node (${readNode.id}) in sequence ${userFriendlyIndex} is missing a file path`);
      if (!readNode.data.format) errors.push(`Read file node (${readNode.id}) in sequence ${userFriendlyIndex} is missing a file format`);
    }
    if (type === "file-to-file") {
      if (!writeNode.data.path) errors.push(`Write file node (${writeNode.id}) in sequence ${userFriendlyIndex} is missing a file path`);
      if (!writeNode.data.format) errors.push(`Write file node (${writeNode.id}) in sequence ${userFriendlyIndex} is missing a file format`);
    }
    if ((type === "file-to-database" || type === "database-to-file")) {
      if (!writeNode.data.connectionString) errors.push(`Database node (${writeNode.id}) in sequence ${userFriendlyIndex} is missing a connection string`);
      if (!writeNode.data.table) errors.push(`Database node (${writeNode.id}) in sequence ${userFriendlyIndex} is missing a table name`);
    }
  }

  const cliOperationSequences = findCliOperationSequences(nodes, connections);
  for (const sequence of cliOperationSequences) {
    const { operationNode, sequenceIndex } = sequence;
    const userFriendlyIndex = sequenceIndex +1;
    if (!operationNode.data.source_path) errors.push(`${operationNode.type} node (${operationNode.id}) in sequence ${userFriendlyIndex} is missing a source path`);
    if ((operationNode.type === "copy-file" || operationNode.type === "move-file" || operationNode.type === "rename-file") && !operationNode.data.destination_path) {
      errors.push(`${operationNode.type} node (${operationNode.id}) in sequence ${userFriendlyIndex} is missing a destination path`);
    }
  }

  const sfReadSequences = findSalesforceReadSequences(nodes, connections);
  for (const sequence of sfReadSequences) {
    const { salesforceNode, sequenceIndex } = sequence;
    const userFriendlyIndex = sequenceIndex +1;
    if (!salesforceNode.data.object_name) errors.push(`Salesforce read node (${salesforceNode.id}) in sequence ${userFriendlyIndex} is missing an object name`);
    if (!salesforceNode.data.query) errors.push(`Salesforce read node (${salesforceNode.id}) in sequence ${userFriendlyIndex} is missing a query`);
    if (!salesforceNode.data.file_path) errors.push(`Salesforce read node (${salesforceNode.id}) in sequence ${userFriendlyIndex} is missing a file path`);
  }

  const sfWriteSequences = findSalesforceWriteSequences(nodes, connections);
  for (const sequence of sfWriteSequences) {
    const { salesforceNode, sequenceIndex } = sequence;
    const userFriendlyIndex = sequenceIndex +1;
    if (!salesforceNode.data.object_name) errors.push(`Salesforce write node (${salesforceNode.id}) in sequence ${userFriendlyIndex} is missing an object name`);
    // Consistent check for undefined for both properties
    if (salesforceNode.data.use_bulk_api === undefined || salesforceNode.data.bulk_batch_size === undefined) {
      errors.push(`Salesforce write node (${salesforceNode.id}) in sequence ${userFriendlyIndex} is missing bulk_batch_size or use_bulk_api configuration`);
    }
    if (!salesforceNode.data.file_path) errors.push(`Salesforce write node (${salesforceNode.id}) in sequence ${userFriendlyIndex} is missing a file path`);
  }

  return { isValid: errors.length === 0, errors };
}

export {
  findFileConversionSequences,
  findCliOperationSequences,
  findSalesforceReadSequences,
  findSalesforceWriteSequences,
  findAllOperationsInOrder,
};