// "use client"

// import type React from "react"
// import { createContext, useContext, useState, useCallback, useEffect } from "react"
// import { v4 as uuidv4 } from "uuid"

// export type NodeType = "start" | "end" | "create-file" | "read-file" | "write-file" | "copy-file" | "code"

// export type NodeStatus = "idle" | "running" | "success" | "error"

// export interface NodePosition {
//   x: number
//   y: number
// }

// export interface NodeConnection {
//   id: string
//   sourceId: string
//   targetId: string
//   sourceHandle?: string
//   targetHandle?: string
// }

// export interface WorkflowNode {
//   id: string
//   type: NodeType
//   position: NodePosition
//   data: Record<string, any>
//   status: NodeStatus
//   output?: any
//   error?: string
// }

// export interface LogEntry {
//   id: string
//   nodeId: string
//   nodeName: string
//   timestamp: Date
//   status: NodeStatus
//   message: string
//   details?: any
// }

// interface WorkflowContextType {
//   nodes: WorkflowNode[]
//   connections: NodeConnection[]
//   logs: LogEntry[]
//   selectedNodeId: string | null
//   pendingConnection: { sourceId: string } | null
//   setPendingConnection: (connection: { sourceId: string } | null) => void
//   addNode: (type: NodeType, position: NodePosition) => string
//   updateNode: (id: string, updates: Partial<WorkflowNode>) => void
//   removeNode: (id: string) => void
//   selectNode: (id: string | null) => void
//   addConnection: (sourceId: string, targetId: string) => void
//   removeConnection: (connectionId: string) => void
//   clearWorkflow: () => void
//   saveWorkflow: () => void
//   loadWorkflow: (data: any) => void
//   runWorkflow: () => Promise<void>
//   executeNode: (nodeId: string) => Promise<any>
//   addLog: (log: Omit<LogEntry, "id" | "timestamp">) => void
//   clearLogs: () => void
//   getNodeById: (id: string) => WorkflowNode | undefined
// }

// const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

// export function WorkflowProvider({ children }: { children: React.ReactNode }) {
//   const [nodes, setNodes] = useState<WorkflowNode[]>([])
//   const [connections, setConnections] = useState<NodeConnection[]>([])
//   const [logs, setLogs] = useState<LogEntry[]>([])
//   const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
//   const [isRunning, setIsRunning] = useState(false)
//   const [pendingConnection, setPendingConnection] = useState<{ sourceId: string } | null>(null)

//   // Add a new node to the workflow
//   const addNode = useCallback((type: NodeType, position: NodePosition) => {
//     const newNode: WorkflowNode = {
//       id: uuidv4(),
//       type,
//       position,
//       data: { active: true },
//       status: "idle",
//     }

//     setNodes((prev) => [...prev, newNode])
//     return newNode.id
//   }, [])

//   // Update an existing node
//   const updateNode = useCallback((id: string, updates: Partial<WorkflowNode>) => {
//     setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, ...updates } : node)))
//   }, [])

//   // Remove a node and its connections
//   const removeNode = useCallback((id: string) => {
//     setNodes((prev) => prev.filter((node) => node.id !== id))
//     setConnections((prev) => prev.filter((conn) => conn.sourceId !== id && conn.targetId !== id))
//   }, [])

//   // Select a node
//   const selectNode = useCallback((id: string | null) => {
//     setSelectedNodeId(id)
//   }, [])

//   // Add a connection between nodes
//   const addConnection = useCallback(
//     (sourceId: string, targetId: string) => {
//       // Prevent connections to self
//       if (sourceId === targetId) return

//       // Prevent duplicate connections
//       const exists = connections.some((conn) => conn.sourceId === sourceId && conn.targetId === targetId)
//       if (exists) return

//       // Prevent circular connections (would need more complex logic for a full check)
//       // This is a simple check to prevent direct circular connections
//       const targetConnectsToSource = connections.some(
//         (conn) => conn.sourceId === targetId && conn.targetId === sourceId,
//       )
//       if (targetConnectsToSource) return

//       const newConnection: NodeConnection = {
//         id: uuidv4(),
//         sourceId,
//         targetId,
//       }
//       setConnections((prev) => [...prev, newConnection])
//     },
//     [connections],
//   )

//   // Remove a connection
//   const removeConnection = useCallback((connectionId: string) => {
//     setConnections((prev) => prev.filter((conn) => conn.id !== connectionId))
//   }, [])

//   // Clear the entire workflow
//   const clearWorkflow = useCallback(() => {
//     setNodes([])
//     setConnections([])
//     setSelectedNodeId(null)
//     clearLogs()
//   }, [])

//   // Save the workflow to JSON
//   const saveWorkflow = useCallback(() => {
//     const workflow = {
//       nodes,
//       connections,
//     }

//     // Save to localStorage for now
//     localStorage.setItem("workflow", JSON.stringify(workflow))

//     // In a real app, you would send this to the backend
//     console.log("Workflow saved:", workflow)

//     return workflow
//   }, [nodes, connections])

//   // Load a workflow from JSON
//   const loadWorkflow = useCallback((data: any) => {
//     if (data?.nodes && Array.isArray(data.nodes)) {
//       setNodes(data.nodes)
//     }

//     if (data?.connections && Array.isArray(data.connections)) {
//       setConnections(data.connections)
//     }
//   }, [])

//   // Add a log entry
//   const addLog = useCallback((log: Omit<LogEntry, "id" | "timestamp">) => {
//     const newLog: LogEntry = {
//       ...log,
//       id: uuidv4(),
//       timestamp: new Date(),
//     }
//     setLogs((prev) => [...prev, newLog])
//   }, [])

//   // Clear all logs
//   const clearLogs = useCallback(() => {
//     setLogs([])
//   }, [])

//   // Get a node by ID
//   const getNodeById = useCallback((id: string) => nodes.find((node) => node.id === id), [nodes])

//   // Execute a single node
//   const executeNode = useCallback(
//     async (nodeId: string, inputData?: any) => {
//       const node = getNodeById(nodeId)
//       if (!node) return null

//       // Skip inactive nodes
//       if (node.data?.active === false) {
//         addLog({
//           nodeId: node.id,
//           nodeName: `${node.type} (${node.id.slice(0, 6)})`,
//           status: "idle",
//           message: `Skipping inactive node: ${node.type}`,
//         })

//         // Find and execute connected nodes
//         const outgoingConnections = connections.filter((conn) => conn.sourceId === nodeId)

//         for (const connection of outgoingConnections) {
//           await executeNode(connection.targetId, inputData) // Pass through the input data
//         }

//         return inputData
//       }

//       // Update node status to running
//       updateNode(nodeId, { status: "running" })

//       addLog({
//         nodeId: node.id,
//         nodeName: `${node.type} (${node.id.slice(0, 6)})`,
//         status: "running",
//         message: `Executing ${node.type} node`,
//       })

//       // Simulate API call delay
//       await new Promise((resolve) => setTimeout(resolve, 1000))

//       try {
//         // Simulate node execution based on type
//         let output

//         switch (node.type) {
//           case "start":
//             output = { started: true, timestamp: new Date().toISOString() }
//             break

//           case "create-file":
//             // In a real app, this would call the backend API
//             output = {
//               fileInfo: {
//                 fullName: node.data.filename || "new-file.txt",
//                 fileName: (node.data.filename || "new-file.txt").split("/").pop(),
//                 size: 0,
//                 location: "/",
//                 lastModified: new Date().toISOString(),
//               },
//             }
//             break

//           case "read-file":
//             // Simulate reading a file
//             output = {
//               textContent: "This is the content of the file",
//               fileInfo: {
//                 fullName: node.data.filename || "file.txt",
//                 fileName: (node.data.filename || "file.txt").split("/").pop(),
//                 size: 42,
//                 location: "/",
//                 lastModified: new Date().toISOString(),
//               },
//             }
//             break

//           case "write-file":
//             // Simulate writing to a file
//             output = {
//               fileInfo: {
//                 fullName: node.data.filename || "file.txt",
//                 fileName: (node.data.filename || "file.txt").split("/").pop(),
//                 size: node.data.textContent?.length || 0,
//                 location: "/",
//                 lastModified: new Date().toISOString(),
//               },
//             }
//             break

//           case "copy-file":
//             // Simulate copying a file
//             output = {
//               fileInfo: {
//                 fullName: node.data.toFilename || "copied-file.txt",
//                 fileName: (node.data.toFilename || "copied-file.txt").split("/").pop(),
//                 size: 42,
//                 location: "/",
//                 lastModified: new Date().toISOString(),
//               },
//             }
//             break

//           case "code":
//             // Simulate code execution
//             output = {
//               result: "Code executed successfully",
//               data: { processed: true, items: 5 },
//             }
//             break

//           case "end":
//             output = { ended: true, timestamp: new Date().toISOString() }
//             break

//           default:
//             output = { executed: true }
//         }

//         // Update node with success status and output
//         updateNode(nodeId, { status: "success", output })

//         addLog({
//           nodeId: node.id,
//           nodeName: `${node.type} (${node.id.slice(0, 6)})`,
//           status: "success",
//           message: `Successfully executed ${node.type} node`,
//           details: output,
//         })

//         // Find and execute connected nodes
//         const outgoingConnections = connections.filter((conn) => conn.sourceId === nodeId)

//         for (const connection of outgoingConnections) {
//           await executeNode(connection.targetId, output)
//         }

//         return output
//       } catch (error) {
//         // Update node with error status
//         updateNode(nodeId, {
//           status: "error",
//           error: error instanceof Error ? error.message : String(error),
//         })

//         addLog({
//           nodeId: node.id,
//           nodeName: `${node.type} (${node.id.slice(0, 6)})`,
//           status: "error",
//           message: `Error executing ${node.type} node: ${error instanceof Error ? error.message : String(error)}`,
//         })

//         throw error
//       }
//     },
//     [connections, getNodeById, updateNode, addLog],
//   )

//   // Run the workflow
//   const runWorkflow = useCallback(async () => {
//     if (isRunning) return
//     setIsRunning(true)

//     // Reset all node statuses
//     setNodes((prev) =>
//       prev.map((node) => ({
//         ...node,
//         status: "idle",
//         output: undefined,
//         error: undefined,
//       })),
//     )

//     clearLogs()

//     // Find start nodes (in a real app, validate workflow structure first)
//     const startNodes = nodes.filter((node) => node.type === "start" && node.data?.active !== false)

//     if (startNodes.length === 0) {
//       addLog({
//         nodeId: "system",
//         nodeName: "System",
//         status: "error",
//         message: "Workflow must have at least one active Start node",
//       })
//       setIsRunning(false)
//       return
//     }

//     try {
//       // Start with the start nodes
//       for (const startNode of startNodes) {
//         await executeNode(startNode.id)
//       }
//     } catch (error) {
//       console.error("Workflow execution failed:", error)
//       addLog({
//         nodeId: "system",
//         nodeName: "System",
//         status: "error",
//         message: `Workflow execution failed: ${error instanceof Error ? error.message : String(error)}`,
//       })
//     } finally {
//       setIsRunning(false)
//     }
//   }, [nodes, executeNode, isRunning, clearLogs, addLog])

//   // Load workflow from localStorage on initial render
//   useEffect(() => {
//     const savedWorkflow = localStorage.getItem("workflow")
//     if (savedWorkflow) {
//       try {
//         const parsed = JSON.parse(savedWorkflow)
//         loadWorkflow(parsed)
//       } catch (error) {
//         console.error("Failed to load saved workflow:", error)
//       }
//     }
//   }, [loadWorkflow])

//   const value = {
//     nodes,
//     connections,
//     logs,
//     selectedNodeId,
//     pendingConnection,
//     setPendingConnection,
//     addNode,
//     updateNode,
//     removeNode,
//     selectNode,
//     addConnection,
//     removeConnection,
//     clearWorkflow,
//     saveWorkflow,
//     loadWorkflow,
//     runWorkflow,
//     executeNode,
//     addLog,
//     clearLogs,
//     getNodeById,
//   }

//   return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
// }

// export function useWorkflow() {
//   const context = useContext(WorkflowContext)
//   if (context === undefined) {
//     throw new Error("useWorkflow must be used within a WorkflowProvider")
//   }
//   return context
// }


// "use client";

// import type React from "react";
// import {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   useEffect,
//   SetStateAction, // Import SetStateAction
// } from "react";
// import { v4 as uuidv4 } from "uuid";

// // --- Type Definitions ---
// // Assuming these are defined correctly, potentially in a separate types file
// // and imported, or defined here if not imported.
// // For this example, we'll define them here for clarity.

// export type NodeType = "READ" | "WRITE" | "COPY" | "CREATE" | "START" | "END";
// export type NodeStatus = "idle" | "running" | "success" | "error";

// export interface NodePosition {
//   x: number;
//   y: number;
// }

// // Interface for a single item within an input or output schema
// export interface SchemaItem {
//     name: string;
//     datatype: "string" | "integer" | "boolean" | "complex" | string; // Allow string for extensibility
//     description: string;
//     required?: boolean; // Optional flag
// }

// // Defines the data specific to a node *instance* (configuration, schemas, etc.)
// export interface NodeInstanceData {
//   label?: string;
//   active?: boolean; // Important for execution logic
//   inputSchema?: Record<string, SchemaItem>; // Use SchemaItem for better typing later
//   outputSchema?: Record<string, SchemaItem>; // Use SchemaItem
//   // Allow other dynamic properties potentially set by specific node types
//   [key: string]: any;
// }

// // Represents the full node object managed by the context
// export interface WorkflowNode {
//   id: string;
//   type: NodeType;
//   position: NodePosition;
//   data: NodeInstanceData; // Node-specific configuration and schemas
//   status: NodeStatus;
//   output?: any; // Result of successful execution
//   error?: string; // Error message on failure
// }

// // Connection between two nodes
// export interface NodeConnection {
//   id: string;
//   sourceId: string;
//   targetId: string;
// }

// // Log entry structure
// export interface LogEntry {
//   id: string;
//   nodeId: string;
//   nodeName: string;
//   timestamp: Date;
//   status: NodeStatus | "info";
//   message: string;
//   details?: any;
// }

// // --- Context Type Definition ---
// interface WorkflowContextType {
//   // Core State
//   nodes: WorkflowNode[]; // Use the correct WorkflowNode type
//   connections: NodeConnection[];
//   logs: LogEntry[];

//   // UI Interaction State
//   selectedNodeId: string | null;
//   pendingConnection: { sourceId: string } | null;
//   propertiesModalNodeId: string | null;
//   dataMappingModalNodeId: string | null;
//   draggingNodeInfo: { id: string; offset: { x: number; y: number } } | null;

//   // State Setters
//   setPendingConnection: (connection: { sourceId: string } | null) => void;
//   setPropertiesModalNodeId: (nodeId: string | null) => void;
//   setDataMappingModalNodeId: (nodeId: string | null) => void;
//   setDraggingNodeInfo: (
//     info: { id: string; offset: { x: number; y: number } } | null
//   ) => void;

//   // Core Actions
//   addNode: (type: NodeType, position: NodePosition) => string;
//   updateNode: (
//     id: string,
//     updates: Partial<Omit<WorkflowNode, "data">> | { data: Partial<NodeInstanceData> } // Use NodeInstanceData for data updates
//   ) => void;
//   removeNode: (id: string) => void;
//   selectNode: (id: string | null) => void;
//   addConnection: (sourceId: string, targetId: string) => void;
//   removeConnection: (connectionId: string) => void;
//   clearWorkflow: () => void;
//   saveWorkflow: () => { nodes: WorkflowNode[]; connections: NodeConnection[] }; // Use WorkflowNode
//   loadWorkflow: (data: {
//     nodes: WorkflowNode[]; // Use WorkflowNode
//     connections: NodeConnection[];
//   }) => void;

//   // Execution & Logging
//   runWorkflow: () => Promise<void>;
//   executeNode: (nodeId: string, inputData?: any) => Promise<any>;
//   addLog: (log: Omit<LogEntry, "id" | "timestamp">) => void;
//   clearLogs: () => void;

//   // Helpers
//   getNodeById: (id: string) => WorkflowNode | undefined; // Use WorkflowNode
// }

// // --- Context Creation ---
// const WorkflowContext = createContext<WorkflowContextType | undefined>(
//   undefined
// );

// // --- Initial Data (Converted to WorkflowNode[]) ---
// const initialNodes: WorkflowNode[] = [
//     { id: 'node-start', type: 'START', position: { x: 50, y: 50 }, data: { active: true, label: 'Start' }, status: 'idle' },
//     { id: 'node-read-1', type: 'READ', position: { x: 200, y: 150 }, data: { active: true, label: 'Read File 1' }, status: 'idle' },
//     { id: 'node-write-1', type: 'WRITE', position: { x: 400, y: 150 }, data: { active: true, label: 'Write File 1' }, status: 'idle' },
//     { id: 'node-copy-1', type: 'COPY', position: { x: 200, y: 300 }, data: { active: true, label: 'Copy File 1' }, status: 'idle' },
//     { id: 'node-stop', type: 'END', position: { x: 600, y: 250 }, data: { active: true, label: 'End' }, status: 'idle' },
// ];


// // --- Provider Component ---
// export function WorkflowProvider({ children }: { children: React.ReactNode }) {
//   // --- Core State (Use WorkflowNode[]) ---
//   const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes); // Use WorkflowNode[]
//   const [connections, setConnections] = useState<NodeConnection[]>([]);
//   const [logs, setLogs] = useState<LogEntry[]>([]);

//   // --- UI Interaction State ---
//   const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
//   const [pendingConnection, setPendingConnection] = useState<{ sourceId: string } | null>(null);
//   const [propertiesModalNodeId, setPropertiesModalNodeId] = useState<string | null>(null);
//   const [dataMappingModalNodeId, setDataMappingModalNodeId] = useState<string | null>(null);
//   const [draggingNodeInfo, setDraggingNodeInfo] = useState<{id: string; offset: { x: number; y: number }} | null>(null);

//   // --- Execution State ---
//   const [isRunning, setIsRunning] = useState(false);

//   // --- Actions ---

//   // Add a new node
//   const addNode = useCallback(
//     (type: NodeType, position: NodePosition): string => {
//       const newNode: WorkflowNode = { // Create a full WorkflowNode
//         id: uuidv4(),
//         type,
//         position,
//         data: { // Initialize data according to NodeInstanceData
//           active: true,
//           label: type // Simple default label, adjust as needed
//           // Initialize inputSchema/outputSchema based on 'type' if necessary
//         },
//         status: "idle", // Initialize status
//       };
//       // Use the functional update form of setNodes
//       setNodes((prevNodes) => [...prevNodes, newNode]);
//       return newNode.id;
//     },
//     [] // No dependencies needed for this form of setNodes
//   );

//   // Update an existing node
//   const updateNode = useCallback(
//     (
//       id: string,
//       updates: Partial<Omit<WorkflowNode, "data">> | { data: Partial<NodeInstanceData> }
//     ) => {
//       // Use functional update form to ensure we work with the latest state
//       setNodes((currentNodes) =>
//         currentNodes.map((node): WorkflowNode => { // Explicit return type
//           if (node.id === id) {
//             if ("data" in updates && typeof updates.data === "object" && updates.data !== null) {
//               // Merge data object correctly
//               return {
//                 ...node,
//                 data: { ...node.data, ...updates.data }, // Merge existing and new data
//               };
//             } else if (!("data" in updates)) {
//               // Merge top-level properties (e.g., position, status, output, error)
//               // Exclude 'data' itself from the top-level merge target
//               const { data, ...otherUpdates } = updates as Partial<Omit<WorkflowNode, "data">>;
//               return { ...node, ...otherUpdates };
//             }
//              // Safeguard (should not be reached with TS checking the input `updates`)
//              console.warn("updateNode called with invalid structure:", updates);
//              return node;
//           }
//           return node;
//         })
//       );
//     },
//     [] // No dependencies needed for this form of setNodes
//   );

//   // Remove a node and its connections
//   const removeNode = useCallback(
//     (id: string) => {
//       setNodes((prev) => prev.filter((node) => node.id !== id));
//       setConnections((prev) =>
//         prev.filter((conn) => conn.sourceId !== id && conn.targetId !== id)
//       );
//       // Deselect or close modals if the removed node was selected/open
//       // Use functional updates for state based on previous state
//       setSelectedNodeId((prevId) => (prevId === id ? null : prevId));
//       setPropertiesModalNodeId((prevId) => (prevId === id ? null : prevId));
//       setDataMappingModalNodeId((prevId) => (prevId === id ? null : prevId));
//     },
//     [] // No external dependencies needed if using functional updates
//   );

//   // Select a node (for visual indication)
//   const selectNode = useCallback((id: string | null) => {
//     setSelectedNodeId(id);
//   }, []);

//   // Add a connection
//    const addConnection = useCallback(
//      (sourceId: string, targetId: string) => {
//        if (sourceId === targetId) return; // Prevent self-connection

//        setConnections((prevConnections) => {
//          // Check existence within the functional update to avoid race conditions
//          const exists = prevConnections.some(
//            (conn) => conn.sourceId === sourceId && conn.targetId === targetId
//          );
//          if (exists) {
//            console.warn("Connection already exists:", sourceId, "->", targetId);
//            return prevConnections; // Return previous state if exists
//          }
//          // Basic cycle check (A->B, B->A)
//          const createsCycle = prevConnections.some(
//            (conn) => conn.sourceId === targetId && conn.targetId === sourceId
//          );
//          if (createsCycle) {
//            console.warn("Cannot create circular connection:", sourceId, "->", targetId);
//            return prevConnections; // Return previous state if cycle
//          }

//          const newConnection: NodeConnection = { id: uuidv4(), sourceId, targetId };
//          return [...prevConnections, newConnection]; // Add the new connection
//        });
//      },
//      [] // No dependency on 'connections' needed when using functional update
//    );

//   // Remove a connection
//   const removeConnection = useCallback((connectionId: string) => {
//     setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));
//   }, []);

//    // --- Logging --- (Placed before clearWorkflow which uses it)
//   const addLog = useCallback((log: Omit<LogEntry, "id" | "timestamp">) => {
//     const newLog: LogEntry = {
//       ...log,
//       id: uuidv4(),
//       timestamp: new Date(),
//     };
//     setLogs((prev) => [newLog, ...prev]); // Add to beginning
//   }, []);

//   const clearLogs = useCallback(() => {
//     setLogs([]);
//   }, []);


//   // Clear the workflow
//   const clearWorkflow = useCallback(() => {
//     setNodes([]);
//     setConnections([]);
//     setSelectedNodeId(null);
//     setPropertiesModalNodeId(null);
//     setDataMappingModalNodeId(null);
//     setPendingConnection(null);
//     setDraggingNodeInfo(null);
//     clearLogs(); // Call the separate clearLogs function
//   }, [clearLogs]); // Add clearLogs dependency

//   // Save workflow state
//   const saveWorkflow = useCallback(() => {
//     const workflowData = { nodes, connections }; // Now 'nodes' is WorkflowNode[]
//     localStorage.setItem("workflow", JSON.stringify(workflowData));
//     console.log("Workflow saved:", workflowData);
//     return workflowData;
//   }, [nodes, connections]);

//   // Load workflow state
//   const loadWorkflow = useCallback(
//     (data: { nodes: WorkflowNode[]; connections: NodeConnection[] }) => { // Expect WorkflowNode[]
//       if (data && Array.isArray(data.nodes) && Array.isArray(data.connections)) {
//         // Basic validation passed, potentially add more checks here
//         setNodes(data.nodes);
//         setConnections(data.connections);
//         // Reset UI states
//         setSelectedNodeId(null);
//         setPropertiesModalNodeId(null);
//         setDataMappingModalNodeId(null);
//         setPendingConnection(null);
//         setDraggingNodeInfo(null);
//         clearLogs();
//       } else {
//         console.error("Failed to load workflow: Invalid data structure", data);
//       }
//     },
//     [clearLogs] // Add clearLogs dependency
//   );


//   // --- Execution Logic ---
//   const getNodeById = useCallback(
//     (id: string): WorkflowNode | undefined => // Returns WorkflowNode | undefined
//       nodes.find((node) => node.id === id),
//     [nodes] // Depends on the nodes state
//   );

//   // Execute a single node and potentially trigger subsequent nodes
//   const executeNode = useCallback(
//     async (nodeId: string, inputData?: any): Promise<any> => {
//       const node = getNodeById(nodeId); // Will be WorkflowNode | undefined
//       if (!node) {
//         const errorMsg = `Node not found: ${nodeId}`;
//         console.error(errorMsg);
//         addLog({ nodeId: nodeId, nodeName: 'Unknown', status: 'error', message: errorMsg });
//         throw new Error(errorMsg);
//       }

//       const nodeIdentifier = `${node.type} (${node.id.slice(0, 6)})`;

//       // Skip inactive nodes
//       if (node.data?.active === false) {
//         addLog({
//           nodeId: node.id, nodeName: nodeIdentifier, status: "info",
//           message: `Skipping inactive node: ${node.type}`
//         });
//         updateNode(nodeId, { status: "idle" });

//         // Find and execute next connected nodes, passing current inputData through
//         const outgoingConnections = connections.filter(conn => conn.sourceId === nodeId);
//         let lastOutput = inputData;
//         for (const connection of outgoingConnections) {
//             lastOutput = await executeNode(connection.targetId, inputData); // Await to maintain sequence for branches from inactive node
//         }
//         return lastOutput;
//       }

//       // --- Start Execution ---
//       updateNode(nodeId, { status: "running", error: undefined, output: undefined }); // Clear previous error/output
//       addLog({
//         nodeId: node.id, nodeName: nodeIdentifier, status: "running",
//         message: `Executing ${node.type}`, details: { input: inputData }
//       });

//       // Simulate async work
//       await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));

//       try {
//         // --- Simulated Node Logic (Replace with actual implementations) ---
//         let output: any;
//         switch (node.type) {
//           case "START": output = { ...inputData, started: true, timestamp: new Date().toISOString() }; break;
//           case "CREATE": output = { ...inputData, fileCreated: node.data.filename || `file-${node.id.slice(0,4)}.txt` }; break;
//           case "READ": output = { ...inputData, fileContent: `Content of ${node.data.filename || 'unknown_file'}`, read: true }; break;
//           case "WRITE": output = { ...inputData, fileWritten: node.data.filename || 'output.txt', bytes: node.data.textContent?.length || 0 }; break;
//           case "COPY": output = { ...inputData, fileCopied: `${node.data.fromFilename || '?'} to ${node.data.toFilename || '?'}` }; break;
//           case "END": output = { ...inputData, ended: true, finalTimestamp: new Date().toISOString() }; break;
//           default:
//             console.warn(`Execution logic not defined for node type: ${node.type}`);
//             output = { ...inputData, executed: true, type: node.type };
//         }
//         // --- End Simulated Logic ---

//         updateNode(nodeId, { status: "success", output: output });
//         addLog({
//           nodeId: node.id, nodeName: nodeIdentifier, status: "success",
//           message: `Successfully executed ${node.type}`, details: output
//         });

//         // Execute next connected nodes sequentially
//         const outgoingConnections = connections.filter(conn => conn.sourceId === nodeId);
//         let lastBranchOutput = output;
//         for (const connection of outgoingConnections) {
//             lastBranchOutput = await executeNode(connection.targetId, output); // Pass current output as input
//         }
//         return lastBranchOutput; // Return the result from the last branch executed

//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : String(error);
//         updateNode(nodeId, { status: "error", error: errorMessage });
//         addLog({
//           nodeId: node.id, nodeName: nodeIdentifier, status: "error",
//           message: `Error executing ${node.type}: ${errorMessage}`, details: error
//         });
//         console.error(`Error in node ${nodeIdentifier}:`, error);
//         throw error; // Re-throw to stop the workflow run
//       }
//     },
//     [getNodeById, updateNode, addLog, connections] // Added connections dependency
//   );

//   // Run the entire workflow
//   const runWorkflow = useCallback(async () => {
//     if (isRunning) return; // Prevent concurrent runs
//     setIsRunning(true);
//     addLog({ nodeId: "system", nodeName: "System", status: "info", message: "Workflow run started." });

//     // Reset all node statuses before starting
//     setNodes((prevNodes) =>
//         prevNodes.map(node => ({ ...node, status: 'idle', output: undefined, error: undefined }))
//     );
//     // Consider if logs should be cleared here or appended: setLogs([]);

//     // Find active start nodes
//     const startNodes = nodes.filter(node => node.type === 'START'); // Don't filter by active here, let executeNode handle it

//     if (startNodes.length === 0) {
//         addLog({ nodeId: "system", nodeName: "System", status: "error", message: "No Start node found." });
//         setIsRunning(false);
//         return;
//     }

//     try {
//       // Execute all start nodes sequentially (or use Promise.all for parallel)
//       for (const startNode of startNodes) {
//         await executeNode(startNode.id); // Initial input can be passed here if needed
//       }
//       addLog({ nodeId: "system", nodeName: "System", status: "success", message: "Workflow run completed." });
//     } catch (error) {
//       // Error is already logged by executeNode, just log the overall failure
//       addLog({ nodeId: "system", nodeName: "System", status: "error", message: "Workflow run failed." });
//       console.error("Workflow execution failed:", error);
//     } finally {
//       setIsRunning(false);
//     }
//   }, [nodes, executeNode, isRunning, addLog]); // Added nodes dependency

//   // --- Effects ---
//   // Load saved workflow on mount
//   useEffect(() => {
//     const savedData = localStorage.getItem("workflow");
//     if (savedData) {
//       try {
//         const parsedData = JSON.parse(savedData);
//         // Add more robust validation before loading if needed
//         if (parsedData && parsedData.nodes && parsedData.connections) {
//             loadWorkflow(parsedData);
//         } else {
//             throw new Error("Invalid saved data structure");
//         }
//       } catch (e) {
//         console.error("Failed to parse or load saved workflow:", e);
//         localStorage.removeItem("workflow"); // Clear corrupted data
//       }
//     }
//      // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // Run only once on mount, loadWorkflow is stable


//   // --- Context Value ---
//   const value: WorkflowContextType = {
//     // State
//     nodes, // Now correctly typed as WorkflowNode[]
//     connections,
//     logs,
//     selectedNodeId,
//     pendingConnection,
//     propertiesModalNodeId,
//     dataMappingModalNodeId,
//     draggingNodeInfo,

//     // Setters
//     setPendingConnection,
//     setPropertiesModalNodeId,
//     setDataMappingModalNodeId,
//     setDraggingNodeInfo,

//     // Actions
//     addNode,
//     updateNode,
//     removeNode,
//     selectNode,
//     addConnection,
//     removeConnection,
//     clearWorkflow,
//     saveWorkflow, // Returns WorkflowNode[]
//     loadWorkflow, // Expects WorkflowNode[]
//     runWorkflow,
//     executeNode,
//     addLog,
//     clearLogs,
//     getNodeById, // Returns WorkflowNode | undefined
//   };

//   return (
//     <WorkflowContext.Provider value={value}>
//       {children}
//     </WorkflowContext.Provider>
//   );
// }

// // --- Hook ---
// export function useWorkflow() {
//   const context = useContext(WorkflowContext);
//   if (context === undefined) {
//     throw new Error("useWorkflow must be used within a WorkflowProvider");
//   }
//   return context;
// }

"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";

// --- Type Definitions ---
// export type NodeType = "start" | "end" | "create-file" | "read-file" | "write-file" | "copy-file" | "code"

export type NodeStatus = "idle" | "running" | "success" | "error";

export interface NodePosition {
  x: number;
  y: number;
}

// Use the specific WorkflowNodeData type from previous example for better type safety
export interface WorkflowNodeData {
  label?: string;
  active?: boolean;
  inputSchema?: Record<string, string>;
  outputSchema?: Record<string, string>;
  // Allow other properties potentially set by specific node types
  [key: string]: any;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: NodePosition;
  data: WorkflowNodeData; // Use the more specific type here
  status?: NodeStatus;
  output?: any; // Result of successful execution
  error?: string; // Error message on failure
}

export interface NodeConnection {
  id: string;
  sourceId: string;
  targetId: string;
  // Optional: if you need specific handles on ports later
  // sourceHandle?: string
  // targetHandle?: string
}

export interface LogEntry {
  id: string;
  nodeId: string; // Can be 'system' for general messages
  nodeName: string;
  timestamp: Date;
  status: NodeStatus | "info"; // Allow 'info' status for general logs
  message: string;
  details?: any;
}

// src/types/workflow.ts

// Define the possible node types
export type NodeType = "READ" | "WRITE" | "COPY" | "CREATE" | "START" | "END";

// Interface for a single item within an input or output schema
export interface SchemaItem {
  name: string;
  datatype: "string" | "integer" | "boolean" | "complex" | string; // Allow string for extensibility
  description: string;
  required?: boolean; // Optional flag
}

// Interface for the complete schema definition of a node
export interface NodeSchema {
  label: string;
  description: string;
  inputSchema: SchemaItem[];
  outputSchema: SchemaItem[];
}

// Interface for the data representing a node instance on the canvas
export interface WorkflowNodeData {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data?: WorkflowNodeData; // Node-specific instance data
  // You might add other node-specific instance data here later
  // e.g., configuredInputValues: Record<string, any>;
}

// --- Context Type Definition ---
interface WorkflowContextType {
  // Core State
  nodes: WorkflowNode[];
  connections: NodeConnection[];
  logs: LogEntry[];

  // UI Interaction State
  selectedNodeId: string | null; // For visual selection indication (optional)
  pendingConnection: { sourceId: string } | null; // For drawing new connections
  propertiesModalNodeId: string | null; // ID of node whose properties modal is open
  dataMappingModalNodeId: string | null; // ID of node whose data mapping modal is open
  draggingNodeInfo: { id: string; offset: { x: number; y: number } } | null; // Info about node being dragged

  // State Setters
  setPendingConnection: (connection: { sourceId: string } | null) => void;
  setPropertiesModalNodeId: (nodeId: string | null) => void;
  setDataMappingModalNodeId: (nodeId: string | null) => void;
  setDraggingNodeInfo: (
    info: { id: string; offset: { x: number; y: number } } | null
  ) => void;

  // Core Actions
  addNode: (type: NodeType, position: NodePosition) => string;
  updateNode: (
    id: string,
    updates:
      | Partial<Omit<WorkflowNode, "data">>
      | { data: Partial<WorkflowNodeData> }
  ) => void; // Improved update type
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void; // Keep for visual selection if needed
  addConnection: (sourceId: string, targetId: string) => void;
  removeConnection: (connectionId: string) => void;
  clearWorkflow: () => void;
  saveWorkflow: () => { nodes: WorkflowNode[]; connections: NodeConnection[] }; // Return the saved data
  loadWorkflow: (data: {
    nodes: WorkflowNode[];
    connections: NodeConnection[];
  }) => void; // Use stricter type

  // Execution & Logging
  runWorkflow: () => Promise<void>;
  executeNode: (nodeId: string, inputData?: any) => Promise<any>; // Allow passing input data
  addLog: (log: Omit<LogEntry, "id" | "timestamp">) => void;
  clearLogs: () => void;

  // Helpers
  getNodeById: (id: string) => WorkflowNode | undefined;
}

// --- Context Creation ---
const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
);

const initialNodes: WorkflowNodeData[] = [
  { id: "node-start", type: "START", position: { x: 50, y: 50 } },
  { id: "node-read-1", type: "READ", position: { x: 200, y: 150 } },
  { id: "node-write-1", type: "WRITE", position: { x: 400, y: 150 } },
  { id: "node-copy-1", type: "COPY", position: { x: 200, y: 300 } },
  { id: "node-stop", type: "END", position: { x: 600, y: 250 } },
];

// --- Provider Component ---
export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  // --- Core State ---
  // const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [nodes, setNodes] = useState<WorkflowNodeData[]>(initialNodes);
  const [connections, setConnections] = useState<NodeConnection[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // --- UI Interaction State ---
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null); // Visual selection (optional)
  const [pendingConnection, setPendingConnection] = useState<{
    sourceId: string;
  } | null>(null);
  const [propertiesModalNodeId, setPropertiesModalNodeId] = useState<
    string | null
  >(null); // <<<--- ADDED State for Properties Modal
  const [dataMappingModalNodeId, setDataMappingModalNodeId] = useState<
    string | null
  >(null); // <<<--- ADDED State for Data Mapping Modal
  const [draggingNodeInfo, setDraggingNodeInfo] = useState<{
    id: string;
    offset: { x: number; y: number };
  } | null>(null); // <<<--- ADDED State for Dragging

  // --- Execution State ---
  const [isRunning, setIsRunning] = useState(false);

  // --- Actions ---

  // Add a new node
  const addNode = useCallback(
    (type: NodeType, position: NodePosition): string => {
      const newNode: WorkflowNode = {
        id: uuidv4(),
        type,
        position,
        // Initialize data, ensure 'active' is present for execution logic
        data: { active: true, label: type }, // Add a default label maybe
        status: "idle",
      };
      setNodes((prev) => [...prev, newNode]);
      return newNode.id; // Return the ID of the newly created node
    },
    []
  );

  // Update an existing node (Improved Implementation)
  const updateNode = useCallback(
    (
      id: string,
      updates:
        | Partial<Omit<WorkflowNode, "data">>
        | { data: Partial<WorkflowNodeData> }
    ) => {
      // setNodes((currentNodes) =>
      //   currentNodes.map((node) => {
      //     if (node.id === id) {
      //       if (
      //         "data" in updates &&
      //         typeof updates.data === "object" &&
      //         updates.data !== null
      //       ) {
      //         // If 'data' is in updates, merge the data object carefully
      //         return {
      //           ...node,
      //           data: { ...(node.data || {}), ...updates.data }, // Merge existing and new data
      //         };
      //       } else if (!("data" in updates)) {
      //         // If 'data' is not in updates, merge top-level properties (like position, status, etc.)
      //         return { ...node, ...updates };
      //       }
      //       // This case should technically not be reached with the current type definition,
      //       // but provides a safeguard. If updates ONLY contains 'data' but it's not an object,
      //       // we don't modify the node.
      //       console.warn(
      //         "updateNode called with invalid 'data' structure:",
      //         updates
      //       );
      //       return node;
      //     }
      //     return node;
      //   })
      // );
    },
    []
  );

  // Remove a node and its connections
  const removeNode = useCallback(
    (id: string) => {
      setNodes((prev) => prev.filter((node) => node.id !== id));
      setConnections((prev) =>
        prev.filter((conn) => conn.sourceId !== id && conn.targetId !== id)
      );
      // Deselect or close modals if the removed node was selected/open
      if (selectedNodeId === id) setSelectedNodeId(null);
      if (propertiesModalNodeId === id) setPropertiesModalNodeId(null);
      if (dataMappingModalNodeId === id) setDataMappingModalNodeId(null);
    },
    [selectedNodeId, propertiesModalNodeId, dataMappingModalNodeId]
  ); // Add dependencies

  // Select a node (for visual indication)
  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  // Add a connection
  const addConnection = useCallback(
    (sourceId: string, targetId: string) => {
      if (sourceId === targetId) {
        console.warn("Attempted to connect node to itself:", sourceId);
        return;
      }
      const exists = connections.some(
        (conn) => conn.sourceId === sourceId && conn.targetId === targetId
      );
      if (exists) {
        console.warn("Connection already exists:", sourceId, "->", targetId);
        return;
      }
      // Basic cycle check (A->B, B->A) - more complex checks are harder
      const createsCycle = connections.some(
        (conn) => conn.sourceId === targetId && conn.targetId === sourceId
      );
      if (createsCycle) {
        console.warn(
          "Cannot create circular connection:",
          sourceId,
          "->",
          targetId
        );
        return;
      }

      const newConnection: NodeConnection = {
        id: uuidv4(),
        sourceId,
        targetId,
      };
      setConnections((prev) => [...prev, newConnection]);
    },
    [connections]
  );

  // Remove a connection
  const removeConnection = useCallback((connectionId: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));
  }, []);

  // Clear the workflow
  const clearWorkflow = useCallback(() => {
    setNodes([]);
    setConnections([]);
    setSelectedNodeId(null);
    setPropertiesModalNodeId(null);
    setDataMappingModalNodeId(null);
    setPendingConnection(null);
    setDraggingNodeInfo(null);
    clearLogs(); // Keep clearLogs call separate
  }, []); // Removed clearLogs from dependency array, it's defined below

  // Save workflow state
  const saveWorkflow = useCallback(() => {
    const workflowData = { nodes, connections };
    localStorage.setItem("workflow", JSON.stringify(workflowData));
    console.log("Workflow saved:", workflowData);
    return workflowData; // Return the data
  }, [nodes, connections]);

  // Load workflow state
  const loadWorkflow = useCallback(
    (data: { nodes: WorkflowNode[]; connections: NodeConnection[] }) => {
      // Basic validation (more thorough validation recommended)
      if (
        data &&
        Array.isArray(data.nodes) &&
        Array.isArray(data.connections)
      ) {
        setNodes(data.nodes);
        setConnections(data.connections);
        // Reset UI states after loading
        setSelectedNodeId(null);
        setPropertiesModalNodeId(null);
        setDataMappingModalNodeId(null);
        setPendingConnection(null);
        setDraggingNodeInfo(null);
        clearLogs();
      } else {
        console.error("Failed to load workflow: Invalid data structure", data);
      }
    },
    []
  ); // Removed clearLogs from dependency array

  // --- Logging ---
  const addLog = useCallback((log: Omit<LogEntry, "id" | "timestamp">) => {
    const newLog: LogEntry = {
      ...log,
      id: uuidv4(),
      timestamp: new Date(),
    };
    // Add to the beginning of the array for newest first display
    setLogs((prev) => [newLog, ...prev]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // --- Execution Logic ---
  const getNodeById = useCallback(
    (id: string): WorkflowNode | undefined =>
      nodes.find((node) => node.id === id),
    [nodes]
  );

  const executeNode = useCallback(
    async (nodeId: string, inputData?: any): Promise<any> => {
      const node = getNodeById(nodeId);
      if (!node) {
        console.error(`Node not found for execution: ${nodeId}`);
        throw new Error(`Node not found: ${nodeId}`);
      }

      const nodeIdentifier = `${node.type} (${node.id.slice(0, 6)})`;

      // Skip inactive nodes
      if (node.data?.active === false) {
        addLog({
          nodeId: node.id,
          nodeName: nodeIdentifier,
          status: "info",
          message: `Skipping inactive node: ${node.type}`,
        });
        updateNode(nodeId, { status: "idle" }); // Ensure status reflects skip
        // Find and execute next nodes in sequence, passing current input
        const outgoingConnections = connections.filter(
          (conn) => conn.sourceId === nodeId
        );
        let lastOutput = inputData; // Keep track of output from parallel branches if needed (simplification here)
        for (const connection of outgoingConnections) {
          // Don't await here if parallel execution is desired for branches stemming from inactive nodes
          // Awaiting ensures sequential execution of branches
          lastOutput = await executeNode(connection.targetId, inputData);
        }
        return lastOutput; // Return the input data as it was passed through
      }

      updateNode(nodeId, { status: "running" });
      addLog({
        nodeId: node.id,
        nodeName: nodeIdentifier,
        status: "running",
        message: `Executing ${node.type}`,
        details: { input: inputData },
      });

      // Simulate API call or processing delay
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 500 + 200)
      ); // Random delay

      try {
        // --- Simulated Node Execution Logic ---
        let output: any;
        // You would replace this switch with actual API calls or function executions
        switch (node.type) {
          case "START":
            output = {
              ...inputData,
              started: true,
              timestamp: new Date().toISOString(),
            };
            break;
          case "CREATE":
            output = {
              ...inputData,
              fileCreated: node.data.filename || "default.txt",
            };
            break;
          case "READ":
            output = {
              ...inputData,
              fileContent: `Content of ${node.data.filename || "default.txt"}`,
              read: true,
            };
            break;
          case "WRITE":
            output = {
              ...inputData,
              fileWritten: node.data.filename || "default.txt",
              bytes: node.data.textContent?.length || 0,
            };
            break;
          case "COPY":
            output = {
              ...inputData,
              fileCopied: `${node.data.fromFilename} to ${node.data.toFilename}`,
            };
            break;
          // case "code":        output = { ...inputData, codeResult: "executed", customData: { value: 123 } }; break; // Simulate some output
          case "END":
            output = {
              ...inputData,
              ended: true,
              finalTimestamp: new Date().toISOString(),
            };
            break;
          default:
            console.warn(
              `Execution logic not defined for node type: ${node.type}`
            );
            output = { ...inputData, executed: true, type: node.type };
        }
        // --- End Simulated Logic ---

        updateNode(nodeId, { status: "success", output: output });
        addLog({
          nodeId: node.id,
          nodeName: nodeIdentifier,
          status: "success",
          message: `Successfully executed ${node.type}`,
          details: output,
        });

        // Execute next nodes
        const outgoingConnections = connections.filter(
          (conn) => conn.sourceId === nodeId
        );
        let lastBranchOutput = output; // Keep output from last branch if sequential
        for (const connection of outgoingConnections) {
          // Await ensures sequential execution down each branch
          lastBranchOutput = await executeNode(connection.targetId, output);
        }
        return lastBranchOutput; // Return output from the last executed branch in this sequence
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        updateNode(nodeId, { status: "error", error: errorMessage });
        addLog({
          nodeId: node.id,
          nodeName: nodeIdentifier,
          status: "error",
          message: `Error executing ${node.type}: ${errorMessage}`,
          details: error,
        });
        console.error(`Error in node ${nodeIdentifier}:`, error);
        throw error; // Re-throw to potentially stop the workflow run
      }
    },
    [connections, getNodeById,updateNode, addLog] // Removed node Identifier calc from deps
  );

  // Run the entire workflow from start nodes
  const runWorkflow = useCallback(async () => {
    if (isRunning) {
      console.warn("Workflow is already running.");
      return;
    }
    setIsRunning(true);
    addLog({
      nodeId: "system",
      nodeName: "System",
      status: "info",
      message: "Workflow run started.",
    });

    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        status: "idle",
        output: undefined,
        error: undefined,
      }))
    );
    // Don't clear logs here, append to existing logs for history

    const startNodes = nodes.filter((node) => node.type === "START"); // Allow inactive start nodes to be found, execution logic handles skipping

    if (startNodes.length === 0) {
      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "error",
        message: "No Start node found in workflow.",
      });
      setIsRunning(false);
      return;
    }

    try {
      // Execute all start nodes (can be done in parallel or sequentially)
      // Using Promise.all for parallel start node execution:
      // await Promise.all(startNodes.map(startNode => executeNode(startNode.id)));

      // Using for...of for sequential start node execution:
      for (const startNode of startNodes) {
        await executeNode(startNode.id);
      }

      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "success",
        message: "Workflow run completed.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "error",
        message: `Workflow run failed: ${errorMessage}`,
      });
      console.error("Workflow execution failed:", error);
    } finally {
      setIsRunning(false);
    }
  }, [nodes, executeNode, isRunning, addLog]); // Removed clearLogs

  // --- Effects ---
  // Load saved workflow on mount
  useEffect(() => {
    const savedData = localStorage.getItem("workflow");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Add validation here if needed before loading
        loadWorkflow(parsedData);
      } catch (e) {
        console.error("Failed to parse saved workflow:", e);
        localStorage.removeItem("workflow"); // Clear corrupted data
      }
    }
  }, [loadWorkflow]); // Depend only on loadWorkflow

  // --- Context Value ---
  const value: WorkflowContextType = {
    // State,
    // nodes,
    nodes,
    connections,
    logs,
    selectedNodeId,
    pendingConnection,
    propertiesModalNodeId, // <<<--- ADDED Value
    dataMappingModalNodeId, // <<<--- ADDED Value
    draggingNodeInfo, // <<<--- ADDED Value

    // Setters
    setPendingConnection,
    setPropertiesModalNodeId, // <<<--- ADDED Value
    setDataMappingModalNodeId, // <<<--- ADDED Value
    setDraggingNodeInfo, // <<<--- ADDED Value

    // Actions
    addNode,
    // updateNode,
    removeNode,
    selectNode,
    addConnection,
    removeConnection,
    clearWorkflow,
    // saveWorkflow,
    loadWorkflow,
    runWorkflow,
    executeNode,
    addLog,
    clearLogs,
    getNodeById,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

// --- Hook ---
export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
}
