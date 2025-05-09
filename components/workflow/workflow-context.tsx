//workflow-context.tsx
"use client"
import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

// Keep NodeType definition as is
export type NodeType =
  | "start"
  | "end"
  | "create-file"
  | "read-file"
  | "write-file"
  | "copy-file"
  | "delete-file"
  | "list-files"
  | "file-poller"
  | "http-receiver"
  | "send-http-request"
  | "send-http-response"
  | "xml-parser"
  | "xml-render"
  | "code"

export type NodeStatus = "idle" | "running" | "success" | "error"

export interface NodePosition {
  x: number;
  y: number;
}

// Interface for schema items (used by nodeSchemas.ts and SchemaModal)
export interface SchemaItem {
  name: string;
  datatype: "string" | "integer" | "boolean" | "complex" | "any" | string; // Added 'any'
  description: string;
  required?: boolean;
  originalName?: string;
  sourceNodeId?: string;
}

// Interface for the *definition* of a node's schema (used by nodeSchemas.ts)
export interface NodeSchema {
  label: string;
  description: string;
  inputSchema: SchemaItem[];
  outputSchema: SchemaItem[];
}
// This interface holds the specific configuration and runtime data FOR A SINGLE NODE INSTANCE.
// It should contain properties set via the NodePropertiesPanel or runtime state.
export interface WorkflowNodeData {
  label?: string; // Optional: A user-defined label for this specific node instance
  displayName?: string;
  // Configuration properties used by specific node types (make them optional)
  filename?: string;
  content?: string;
  textContent?: string;
  toFilename?: string; // Often used for write/copy destination
  sourceFilename?: string; // Explicitly for copy source
  targetFilename?: string; // <<<<<<<<<<<< ADD THIS LINE (Explicitly for copy target)
  overwrite?: boolean;
  isDirectory?: boolean;
  includeTimestamp?: boolean;
  encoding?: string;
  readAs?: string;
  excludeContent?: boolean;
  append?: boolean;
  writeAs?: string;
  addLineSeparator?: boolean;
  // fromFilename?: string; // Duplicate of sourceFilename? Standardize if possible.
  includeSubDirectories?: boolean;
  createNonExistingDirs?: boolean;
  mode?: string; // For code node
  language?: string; // For code node
  code?: string; // For code node
  recursive?: boolean; // For delete/list node
  directory?: string; // For list/poller node
  filter?: string; // For list/poller node
  interval?: number; // For poller node
  path?: string; // For http-receiver node
  method?: string; // For http-receiver/sender node
  port?: number; // For http-receiver node
  url?: string; // For http-sender node
  headers?: Record<string, string>; // For http nodes
  body?: any; // For http nodes
  timeout?: number; // For http-sender/code node
  options?: Record<string, any>; // For XML parser/render options
  jsonObject?: object; // For xml-render node
  xmlString?: string; // For xml-parser node
  // Add other config properties from NodePropertiesPanel as needed...
  inputSchema?: string;
  outputSchema?: string;

  // Runtime/UI state flags
  active?: boolean; // The flag to control if the node runs
}
// --- END OF CORRECTION ---


// Interface for the actual node object used in the workflow state/canvas
export interface WorkflowNode {
  id: string; // Unique ID for this node instance
  type: NodeType; // The type of node (determines behavior and schema)
  position: NodePosition; // Position on the canvas
  data: WorkflowNodeData; // Node-specific configuration and runtime data
  status?: NodeStatus; // Current execution status
  output?: any; // Result of successful execution
  error?: string; // Error message on failure
}

// Interface for connections between nodes
export interface NodeConnection {
  id: string;
  sourceId: string; // ID of the source node
  targetId: string; // ID of the target node
  sourceHandle?: string; // Optional: ID of the specific output handle/port
  targetHandle?: string; // Optional: ID of the specific input handle/port
}

// Interface for log entries
export interface LogEntry {
  id: string;
  nodeId: string; // Can be 'system' for general messages
  nodeName: string; // Usually type + partial ID
  timestamp: Date;
  status: NodeStatus | "info"; // Allow 'info' status for general logs
  message: string;
  details?: any; // Optional extra details (like node output/error object)
}


// --- Context Type Definition ---
interface WorkflowContextType {
  nodes: WorkflowNode[]
  connections: NodeConnection[]
  logs: LogEntry[]
  selectedNodeId: string | null
  // UI Interaction States
  pendingConnection: { sourceId: string; sourceHandle?: string } | null // Added handle
  propertiesModalNodeId: string | null
  dataMappingModalNodeId: string | null // Consider removing if not used
  draggingNodeInfo: { id: string; offset: { x: number; y: number } } | null
  setPendingConnection: (connection: { sourceId: string; sourceHandle?: string } | null) => void
  setPropertiesModalNodeId: (nodeId: string | null) => void
  setDataMappingModalNodeId: (nodeId: string | null) => void
  setDraggingNodeInfo: (info: { id: string; offset: { x: number; y: number } } | null) => void
  // Core Workflow Actions
  addNode: (type: NodeType, position: NodePosition, initialData?: Partial<WorkflowNodeData>) => string // Allow initial data
  updateNode: (id: string, updates: Partial<Omit<WorkflowNode, 'data'>> & { data?: Partial<WorkflowNodeData> }) => void // Better update typing
  removeNode: (id: string) => void
  selectNode: (id: string | null) => void
  addConnection: (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => void // Added handles
  removeConnection: (connectionId: string) => void
  clearWorkflow: () => void
  // Persistence & Execution
  saveWorkflow: () => { nodes: WorkflowNode[]; connections: NodeConnection[] } // Return type
  loadWorkflow: (data: { nodes: WorkflowNode[]; connections: NodeConnection[] }) => void // Param type
  runWorkflow: () => Promise<void>
  executeNode: (nodeId: string, inputData?: any) => Promise<any> // Input data for execution
  // Logging
  addLog: (log: Omit<LogEntry, "id" | "timestamp">) => void
  clearLogs: () => void
  // Helpers
  getNodeById: (id: string) => WorkflowNode | undefined
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<NodeConnection[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  // --- UI State ---
  const [pendingConnection, setPendingConnection] = useState<{ sourceId: string; sourceHandle?: string } | null>(null)
  const [propertiesModalNodeId, setPropertiesModalNodeId] = useState<string | null>(null)
  const [dataMappingModalNodeId, setDataMappingModalNodeId] = useState<string | null>(null)
  const [draggingNodeInfo, setDraggingNodeInfo] = useState<{ id: string; offset: { x: number; y: number } } | null>(null)

  // --- Node Management ---
  const addNode = useCallback((type: NodeType, position: NodePosition, initialData?: Partial<WorkflowNodeData>) => {
    const newNode: WorkflowNode = {
      id: uuidv4(),
      type,
      position,
      // Initialize data with active: true and any provided initial data
      data: { label: type, active: true, ...initialData }, // Default label to type, ensure active is true
      status: "idle",
    }
    setNodes((prev) => [...prev, newNode])
    return newNode.id
  }, [])

  const updateNode = useCallback((id: string, updates: Partial<Omit<WorkflowNode, 'data'>> & { data?: Partial<WorkflowNodeData> }) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === id) {
          // Merge node-level updates and data updates separately
          const { data: dataUpdates, ...nodeUpdates } = updates;
          return {
            ...node,
            ...nodeUpdates, // Apply updates like position, status, etc.
            data: { // Merge data ensuring previous data isn't lost
              ...node.data,
              ...dataUpdates,
            },
          };
        }
        return node;
      })
    );
  }, []);


  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id))
    // Also remove connections associated with this node
    setConnections((prev) => prev.filter((conn) => conn.sourceId !== id && conn.targetId !== id))
    // Clear selection/modals if the removed node was active
    if (selectedNodeId === id) setSelectedNodeId(null)
    if (propertiesModalNodeId === id) setPropertiesModalNodeId(null)
    // if (dataMappingModalNodeId === id) setDataMappingModalNodeId(null); // If using this modal
  }, [selectedNodeId, propertiesModalNodeId /*, dataMappingModalNodeId*/])

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id)
  }, [])

  // --- Connection Management ---
  const addConnection = useCallback(
    (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => {
      if (sourceId === targetId) return; // Prevent self-connections

      // Check for existing connection (consider handles if they are relevant)
      const exists = connections.some(
        (conn) =>
          conn.sourceId === sourceId &&
          conn.targetId === targetId &&
          conn.sourceHandle === sourceHandle && // Include handle checks if necessary
          conn.targetHandle === targetHandle
      );
      if (exists) return;

      // Basic check for direct circular connection (A->B and B->A)
      // More complex cycle detection might be needed for larger graphs
      const isCircular = connections.some(
        (conn) => conn.sourceId === targetId && conn.targetId === sourceId
      );
      if (isCircular) {
          console.warn("Preventing direct circular connection");
          return;
      };

      const newConnection: NodeConnection = {
        id: uuidv4(),
        sourceId,
        targetId,
        sourceHandle,
        targetHandle,
      }
      setConnections((prev) => [...prev, newConnection])
    },
    [connections], // Dependency array
  )

  const removeConnection = useCallback((connectionId: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== connectionId))
  }, [])

  // --- Workflow Management ---
  const clearWorkflow = useCallback(() => {
    setNodes([])
    setConnections([])
    setSelectedNodeId(null)
    setPropertiesModalNodeId(null)
    // setDataMappingModalNodeId(null);
    setPendingConnection(null)
    setDraggingNodeInfo(null)
    clearLogs() // Assuming clearLogs is defined elsewhere or added here
  }, [/* dependency: clearLogs */]) // Add clearLogs if defined outside

  const saveWorkflow = useCallback(() => {
    const workflowData = { nodes, connections }
    // Example: Save to localStorage
    try {
      localStorage.setItem("workflowData", JSON.stringify(workflowData))
      console.log("Workflow saved successfully.")
    } catch (error) {
      console.error("Failed to save workflow:", error)
    }
    // In a real app, you might send this to a backend API
    return workflowData
  }, [nodes, connections])

  const loadWorkflow = useCallback((data: { nodes: WorkflowNode[]; connections: NodeConnection[] }) => {
    // Basic validation might be good here
    if (data && Array.isArray(data.nodes) && Array.isArray(data.connections)) {
      setNodes(data.nodes)
      setConnections(data.connections)
      // Reset UI state after loading
      setSelectedNodeId(null)
      setPropertiesModalNodeId(null)
      // setDataMappingModalNodeId(null);
      setPendingConnection(null)
      setDraggingNodeInfo(null)
      console.log("Workflow loaded.")
    } else {
      console.error("Invalid data format for loading workflow.")
    }
  }, [])

  // --- Logging ---
  const addLog = useCallback((log: Omit<LogEntry, "id" | "timestamp">) => {
    const newLog: LogEntry = {
      ...log,
      id: uuidv4(),
      timestamp: new Date(),
    }
    // Keep logs manageable, e.g., limit to last 100 entries
    setLogs((prev) => [newLog, ...prev.slice(0, 99)])
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  // --- Execution Logic ---
  const getNodeById = useCallback((id: string) => nodes.find((node) => node.id === id), [nodes])

  const executeNode = useCallback(
    async (nodeId: string, inputData?: any): Promise<any> => {
      const node = getNodeById(nodeId);
      if (!node) {
        console.warn(`Node with ID ${nodeId} not found during execution.`);
        return null; // Or throw an error
      }

      // Use optional chaining for safety when accessing `node.data`
      if (node.data?.active === false) {
        addLog({
          nodeId: node.id,
          nodeName: `${node.data?.label || node.type} (inactive)`,
          status: "info",
          message: `Skipping inactive node: ${node.data?.label || node.type}`,
        });

        // Find outgoing connections and execute next nodes *with the current inputData*
        const outgoingConnections = connections.filter((conn) => conn.sourceId === nodeId);
        let lastOutput = inputData; // Pass data through inactive node
        for (const connection of outgoingConnections) {
             // TODO: Handle data mapping based on source/target handles if necessary
             // For now, just pass the entire output
             lastOutput = await executeNode(connection.targetId, inputData);
        }
        return lastOutput; // Return data from the last node in the chain after the inactive one
      }

      // Update node status to running
      updateNode(nodeId, { status: "running" });
      addLog({
        nodeId: node.id,
        nodeName: node.data?.label || node.type,
        status: "running",
        message: `Executing ${node.data?.label || node.type}`,
        details: { input: inputData }, // Log input for debugging
      });

      try {
        // --- Node Execution Simulation ---
        // Replace this with actual backend calls or logic execution
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100)); // Simulate async work

        let output: any;
        const nodeData = node.data || {}; // Use node.data safely

        // Example execution logic (expand significantly for real app)
        switch (node.type) {
          case "start":
            output = { trigger: "manual", startTime: new Date().toISOString(), ...(inputData || {}) };
            break;
          case "create-file":
             console.log(`Simulating CREATE file: ${nodeData.filename} with overwrite: ${nodeData.overwrite}`);
             output = { filePath: nodeData.filename || 'default.txt', created: true };
             break;
          case "read-file":
             console.log(`Simulating READ file: ${nodeData.filename}`);
             output = { content: `Content of ${nodeData.filename || 'default.txt'}`, encoding: nodeData.encoding || 'utf-8' };
             break;
          case "write-file":
             console.log(`Simulating WRITE file: ${nodeData.filename} with content: ${nodeData.content?.substring(0, 50)}...`);
             output = { filePath: nodeData.filename || 'default.txt', written: true, bytes: nodeData.content?.length || 0 };
             break;
           case "copy-file":
             console.log(`Simulating COPY file: ${nodeData.sourceFilename} to ${nodeData.targetFilename || nodeData.toFilename}`); // Use consistent naming
             output = { source: nodeData.sourceFilename, target: nodeData.targetFilename || nodeData.toFilename, copied: true };
             break;
           case "code":
              console.log(`Simulating EXECUTE code: ${nodeData.language || 'unknown'}`);
              // In real scenario, execute nodeData.code with inputData
              output = { result: `Executed code successfully`, inputReceived: !!inputData, logs: ["Log line 1"] };
              break;
          case "xml-parser":
              console.log(`Simulating XML PARSE: ${nodeData.xmlString?.substring(0,50)}...`);
              output = { parsedObject: { root: { item: ["value1", "value2"] } }, error: null }; // Simulate success
              break;
          case "xml-render":
              console.log(`Simulating XML RENDER object`);
              output = { xmlString: '<root><item>value1</item></root>', error: null }; // Simulate success
              break;
          case "end":
            output = { finalStatus: "completed", endTime: new Date().toISOString(), result: inputData };
            break;
          default:
             console.warn(`Execution logic not implemented for node type: ${node.type}`);
             output = { ...inputData, [`${node.type}_processed`]: true }; // Generic output
        }
        // --- End Simulation ---

        updateNode(nodeId, { status: "success", output: output, error: undefined });
        addLog({
          nodeId: node.id,
          nodeName: node.data?.label || node.type,
          status: "success",
          message: `Successfully executed ${node.data?.label || node.type}`,
          details: { output: output },
        });

        // Execute next connected nodes
        const outgoingConnections = connections.filter((conn) => conn.sourceId === nodeId);
        let lastOutput = output; // Start with current node's output
        for (const connection of outgoingConnections) {
            // TODO: Handle data mapping based on source/target handles if necessary
            // For now, just pass the entire output
            lastOutput = await executeNode(connection.targetId, output); // Pass current node's output as input
        }
        return lastOutput; // Return the output of the last node executed in this branch

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        updateNode(nodeId, { status: "error", error: errorMessage, output: undefined });
        addLog({
          nodeId: node.id,
          nodeName: node.data?.label || node.type,
          status: "error",
          message: `Error executing ${node.data?.label || node.type}: ${errorMessage}`,
          details: { error: error }, // Log the actual error object if needed
        });
        throw error; // Re-throw to potentially stop the whole workflow run
      }
    },
    [nodes, connections, getNodeById, updateNode, addLog], // Correct dependencies
  );


  const runWorkflow = useCallback(async () => {
    if (isRunning) {
      console.warn("Workflow is already running.");
      return;
    }
    setIsRunning(true);
    addLog({ nodeId: 'system', nodeName: 'System', status: 'info', message: 'Workflow execution started.' });

    // Reset statuses before run
    setNodes((prev) =>
      prev.map((node) => ({ ...node, status: "idle", output: undefined, error: undefined }))
    );
    clearLogs(); // Optionally clear logs for the new run

    // Find active start nodes
    const startNodes = nodes.filter((node) => node.type === "start" && node.data?.active !== false);

    if (startNodes.length === 0) {
       addLog({ nodeId: 'system', nodeName: 'System', status: 'error', message: 'No active start nodes found.' });
       setIsRunning(false);
       return;
    }

    try {
      // Execute all active start nodes concurrently (or sequentially if needed)
      // Using Promise.all for concurrent start
      await Promise.all(startNodes.map(startNode => executeNode(startNode.id)));
      addLog({ nodeId: 'system', nodeName: 'System', status: 'info', message: 'Workflow execution finished.' });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Workflow execution failed:", error);
       addLog({ nodeId: 'system', nodeName: 'System', status: 'error', message: `Workflow execution failed: ${errorMessage}` });
      // Decide if partial results are okay or if the whole run failed
    } finally {
      setIsRunning(false);
    }
  }, [nodes, executeNode, isRunning, clearLogs, addLog]); // Added isRunning, clearLogs, addLog dependencies


  // --- Effect for Loading from localStorage ---
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("workflowData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Add basic validation before loading
        if (parsedData && Array.isArray(parsedData.nodes) && Array.isArray(parsedData.connections)) {
             loadWorkflow(parsedData);
        } else {
            console.warn("Invalid workflow data found in localStorage.");
        }
      }
    } catch (error) {
      console.error("Failed to load workflow from localStorage:", error);
      localStorage.removeItem("workflowData"); // Clear invalid data
    }
  }, [loadWorkflow]); // Load only on initial mount or when loadWorkflow function identity changes


  // --- Context Value ---
  const value: WorkflowContextType = {
    nodes,
    connections,
    logs,
    selectedNodeId,
    pendingConnection,
    propertiesModalNodeId,
    dataMappingModalNodeId,
    draggingNodeInfo,
    setPendingConnection,
    setPropertiesModalNodeId,
    setDataMappingModalNodeId,
    setDraggingNodeInfo,
    addNode,
    updateNode,
    removeNode,
    selectNode,
    addConnection,
    removeConnection,
    clearWorkflow,
    saveWorkflow,
    loadWorkflow,
    runWorkflow,
    executeNode,
    addLog,
    clearLogs,
    getNodeById,
  }

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}

// --- Custom Hook ---
export function useWorkflow() {

  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider")
  }
  return context
}