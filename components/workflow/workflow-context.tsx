

"use client"
import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { NodeType, SchemaItem } from "@/services/interface"
import { useToast } from "@/components/ui/use-toast"
import { saveAndRunWorkflow as saveAndRunWorkflowUtil } from "@/services/workflow-utils";

const baseurl = process.env.NEXT_PUBLIC_USER_API_END_POINT || "http://localhost:30010"

// ... (rest of your interfaces: NodeStatus, NodePosition, NodeSchema, WorkflowNodeData, WorkflowNode, etc. remain unchanged) ...
export type NodeStatus = "idle" | "running" | "success" | "error"

export interface NodePosition {
  x: number
  y: number
}

export interface NodeSchema {
  label: string
  description: string
  inputSchema: SchemaItem[]
  outputSchema: SchemaItem[]
}

export interface WorkflowNodeData {
  label?: string
  displayName?: string
  filename?: string
  content?: string
  textContent?: string
  toFilename?: string
  sourceFilename?: string
  targetFilename?: string 
  overwrite?: boolean
  isDirectory?: boolean
  includeTimestamp?: boolean
  encoding?: string
  readAs?: string
  excludeContent?: boolean
  append?: boolean
  writeAs?: string
  addLineSeparator?: boolean
  includeSubDirectories?: boolean
  createNonExistingDirs?: boolean
  mode?: string
  language?: string
  code?: string
  recursive?: boolean
  directory?: string
  filter?: string
  interval?: number
  path?: string
  method?: string
  port?: number
  url?: string
  headers?: Record<string, string>
  body?: any
  timeout?: number
  options?: Record<string, any>
  jsonObject?: object
  xmlString?: string
  inputSchema?: string
  outputSchema?: string
  oldFilename?: string
  newFilename?: string
  active?: boolean
  provider?: string;
  format?: string;
}

export interface WorkflowNode {
  id: string
  type: NodeType
  position: NodePosition
  data: WorkflowNodeData
  status?: NodeStatus
  output?: any
  error?: string
  config_id: number
}

export interface NodeConnection {
  id: string
  sourceId: string
  targetId: string
  sourceHandle?: string
  targetHandle?: string
}

export interface LogEntry {
  id: string
  nodeId: string
  nodeName: string
  timestamp: Date
  status: NodeStatus | "info"
  message: string
  details?: any
}

export interface DAG { // This was in your previous context, ensure it's defined if used directly
  id: number
  name: string
  dag_id: string
  schedule: string | null
  active: boolean
  dag_sequence: Array<{
    id: string
    type: string
    config_id: number
    next: string[]
  }>
  active_dag_run: number | null
  created_at: string
  updated_at: string
}

interface WorkflowContextType {
  nodes: WorkflowNode[]
  connections: NodeConnection[]
  logs: LogEntry[]
  selectedNodeId: string | null
  pendingConnection: { sourceId: string; sourceHandle?: string } | null
  propertiesModalNodeId: string | null
  dataMappingModalNodeId: string | null
  draggingNodeInfo: { id: string; offset: { x: number; y: number } } | null
  setPendingConnection: (connection: { sourceId: string; sourceHandle?: string } | null) => void
  setPropertiesModalNodeId: (nodeId: string | null) => void
  setDataMappingModalNodeId: (nodeId: string | null) => void
  setDraggingNodeInfo: (info: { id: string; offset: { x: number; y: number } } | null) => void
  addNode: (type: NodeType, position: NodePosition, initialData?: Partial<WorkflowNodeData>) => string
  updateNode: (
    id: string,
    updates: Partial<Omit<WorkflowNode, "data">> & {
      data?: Partial<WorkflowNodeData>
    },
  ) => void
  removeNode: (id: string) => void
  selectNode: (id: string | null) => void
  addConnection: (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => void
  removeConnection: (connectionId: string) => void
  clearWorkflow: () => void
  saveWorkflow: () => { nodes: WorkflowNode[]; connections: NodeConnection[] } // LocalStorage save
  saveWorkflowToBackend: () => Promise<void> // Backend save
  loadWorkflow: (data: {
    nodes: WorkflowNode[]
    connections: NodeConnection[]
  }) => void
  runWorkflow: () => Promise<void>
  executeNode: (nodeId: string, inputData?: any) => Promise<any>
  addLog: (log: Omit<LogEntry, "id" | "timestamp">) => void
  clearLogs: () => void
  getNodeById: (id: string) => WorkflowNode | undefined
  getCurrentWorkflowId: () => string | null
  saveAndRunWorkflow: () => Promise<void>
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)


export const getCurrentClientId = (): string | null => {
  try {
    // 1. Check dedicated "currentClient" item
    const clientDataString = localStorage.getItem("currentClient");
    if (clientDataString) {
      const parsedClient = JSON.parse(clientDataString);
      if (parsedClient && parsedClient.id && String(parsedClient.id).trim() !== '') {
        return String(parsedClient.id);
      }
    }

    // 2. Fallback: Check for "client_id" inside "currentWorkflow" item
    const workflowDataString = localStorage.getItem("currentWorkflow");
    if (workflowDataString) {
      const parsedWorkflow = JSON.parse(workflowDataString);
      if (parsedWorkflow && parsedWorkflow.client_id && String(parsedWorkflow.client_id).trim() !== '') {
        return String(parsedWorkflow.client_id);
      }
    }
    // If neither found:
    console.warn("getCurrentClientId: No valid client_id found in localStorage ('currentClient' or 'currentWorkflow.client_id').");
  } catch (error) {
    console.error("getCurrentClientId: Error accessing localStorage:", error);
  }
  return null;
};

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<NodeConnection[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false) // For overall workflow run
  const [isSaving, setIsSaving] = useState(false)   // For backend save operation
  const [pendingConnection, setPendingConnection] = useState<{
    sourceId: string
    sourceHandle?: string
  } | null>(null)
  const [propertiesModalNodeId, setPropertiesModalNodeId] = useState<string | null>(null)
  const [dataMappingModalNodeId, setDataMappingModalNodeId] = useState<string | null>(null)
  const [draggingNodeInfo, setDraggingNodeInfo] = useState<{
    id: string
    offset: { x: number; y: number }
  } | null>(null)

  const { toast } = useToast()

  // ... (addNode, updateNode, removeNode, selectNode, addConnection, removeConnection, clearLogs, clearWorkflow are likely fine) ...
  const addNode = useCallback((type: NodeType, position: NodePosition, initialData?: Partial<WorkflowNodeData>) => {
    const newNode: WorkflowNode = {
      id: uuidv4(),
      type,
      position,
      data: { label: type, active: true, ...initialData },
      status: "idle",
    }
    setNodes((prev) => [...prev, newNode])
    return newNode.id
  }, [])

  const updateNode = useCallback(
    (
      id: string,
      updates: Partial<Omit<WorkflowNode, "data">> & {
        data?: Partial<WorkflowNodeData>
      },
    ) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === id) {
            const { data: dataUpdates, ...nodeUpdates } = updates
            return {
              ...node,
              ...nodeUpdates,
              data: {
                ...node.data,
                ...dataUpdates,
              },
            }
          }
          return node
        }),
      )
    },
    [],
  )

  const removeNode = useCallback(
    (id: string) => {
      setNodes((prev) => prev.filter((node) => node.id !== id))
      setConnections((prev) => prev.filter((conn) => conn.sourceId !== id && conn.targetId !== id))
      if (selectedNodeId === id) setSelectedNodeId(null)
      if (propertiesModalNodeId === id) setPropertiesModalNodeId(null)
    },
    [selectedNodeId, propertiesModalNodeId],
  )

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id)
  }, [])

  const addConnection = useCallback(
    (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => {
      if (sourceId === targetId) return
      const exists = connections.some(
        (conn) =>
          conn.sourceId === sourceId &&
          conn.targetId === targetId &&
          conn.sourceHandle === sourceHandle &&
          conn.targetHandle === targetHandle,
      )
      if (exists) return
      const isCircular = connections.some((conn) => conn.sourceId === targetId && conn.targetId === sourceId)
      if (isCircular) {
        console.warn("Preventing direct circular connection")
        return
      }
      const newConnection: NodeConnection = {
        id: uuidv4(),
        sourceId,
        targetId,
        sourceHandle,
        targetHandle,
      }
      setConnections((prev) => [...prev, newConnection])
    },
    [connections],
  )

  const removeConnection = useCallback((connectionId: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== connectionId))
  }, [])
  
  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  const clearWorkflow = useCallback(
    () => {
      setNodes([])
      setConnections([])
      setSelectedNodeId(null)
      setPropertiesModalNodeId(null)
      setPendingConnection(null)
      setDraggingNodeInfo(null)
      clearLogs() 
    },
    [clearLogs], 
  )


  const getCurrentWorkflowId = useCallback(() => {
    try {
      // Add a log to see what's being retrieved
      const workflowDataString = localStorage.getItem("currentWorkflow")
      console.log("WorkflowContext: localStorage 'currentWorkflow':", workflowDataString);
      if (workflowDataString) {
        const parsed = JSON.parse(workflowDataString)
        console.log("WorkflowContext: Parsed 'currentWorkflow' data:", parsed);
        if (parsed && typeof parsed.dag_id === 'string' && parsed.dag_id.trim() !== '') {
            return parsed.dag_id;
        } else {
            console.warn("WorkflowContext: 'dag_id' is missing, null, or empty in 'currentWorkflow' data.");
        }
      } else {
        console.warn("WorkflowContext: No 'currentWorkflow' found in localStorage.");
      }
    } catch (error) {
      console.error("WorkflowContext: Error getting current workflow ID from localStorage:", error)
    }
    return null
  }, [])

  const convertWorkflowToDAG = useCallback(() => {
    const nodeConnectionMap: Record<string, string[]> = {}
    nodes.forEach((node) => {
      nodeConnectionMap[node.id] = []
    })
    connections.forEach((connection) => {
      if (nodeConnectionMap[connection.sourceId]) {
        nodeConnectionMap[connection.sourceId].push(connection.targetId)
      }
    })
    const sanitizeId = (id: string) => id.replace(/-/g, "_");
    const dagSequence = nodes.map((node) => {
      return {
        id: sanitizeId(node.id),
        type: node.type,
        config_id: 1, // Assuming config_id is static or handled elsewhere
        next: (nodeConnectionMap[node.id] || []).map(sanitizeId),
      }
    })
    return {
      dag_sequence: dagSequence,
    }
  }, [nodes, connections])

  const saveWorkflowToBackend = useCallback(async () => {
    console.log("WorkflowContext: saveWorkflowToBackend called"); // For debugging
    const workflowId = getCurrentWorkflowId();
    console.log("WorkflowContext: Retrieved workflowId for save:", workflowId); // For debugging

    const backupWorkflowToLocalStorage = () => {
      const workflowData = { nodes, connections }
      try {
        localStorage.setItem("workflowData", JSON.stringify(workflowData))
        console.log("Workflow backed up to localStorage successfully.")
      } catch (error) {
        console.error("Failed to backup workflow to localStorage:", error)
      }
    }

    if (!workflowId) {
      toast({
        title: "Save Failed",
        description: "No active workflow ID found. Please create or select a workflow first.",
        variant: "destructive",
      })
      return
    }

    if (nodes.length === 0) {
      toast({
        title: "Save Failed",
        description: "Cannot save an empty workflow. Please add nodes first.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true) // This is the context's saving state

    try {
      const dagData = convertWorkflowToDAG()
      console.log("WorkflowContext: Converted DAG data for save:", dagData); // For debugging
      console.log(`WorkflowContext: Attempting to save to URL: ${baseurl}/dags/${workflowId}`); // For debugging

      const response = await fetch(`${baseurl}/dags/${workflowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dagData),
      })

      console.log("WorkflowContext: Save API response status:", response.status); // For debugging

      if (!response.ok) {
        let errorDetail = "Failed to save workflow to backend.";
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || `API Error ${response.status}: ${response.statusText}`;
            console.error("WorkflowContext: Save API error data:", errorData); // For debugging
        } catch (jsonError) {
            errorDetail = `API Error ${response.status}: ${response.statusText}. Failed to parse error response.`;
            console.error("WorkflowContext: Save API failed to parse error response:", jsonError); // For debugging
        }
        throw new Error(errorDetail);
      }

      backupWorkflowToLocalStorage()

      toast({
        title: "Success",
        description: "Workflow saved successfully to backend.",
        variant: "default",
      })
    } catch (error) {
      console.error("WorkflowContext: Error saving workflow to backend:", error)
      toast({
        title: "Save Error",
        description: error instanceof Error ? error.message : "An unknown error occurred while saving workflow.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      console.log("WorkflowContext: saveWorkflowToBackend finished."); // For debugging
    }
  }, [nodes, connections, getCurrentWorkflowId, convertWorkflowToDAG, toast, baseurl, setIsSaving]) // Added baseurl, setIsSaving

  const saveWorkflow = useCallback(() => { // This is for localStorage save only
    const workflowData = { nodes, connections }
    try {
      localStorage.setItem("workflowData", JSON.stringify(workflowData))
      console.log("Workflow (local) saved successfully.")
    } catch (error) {
      console.error("Failed to save workflow (local):", error)
    }
    return workflowData
  }, [nodes, connections])

  const loadWorkflow = useCallback((data: { nodes: WorkflowNode[]; connections: NodeConnection[] }) => {
    if (data && Array.isArray(data.nodes) && Array.isArray(data.connections)) {
      setNodes(data.nodes)
      setConnections(data.connections)
      setSelectedNodeId(null)
      setPropertiesModalNodeId(null)
      setPendingConnection(null)
      setDraggingNodeInfo(null)
      console.log("Workflow loaded.")
    } else {
      console.error("Invalid data format for loading workflow.")
    }
  }, [])

  const addLog = useCallback((log: Omit<LogEntry, "id" | "timestamp">) => {
    const newLog: LogEntry = {
      ...log,
      id: uuidv4(),
      timestamp: new Date(),
    }
    setLogs((prev) => [newLog, ...prev.slice(0, 99)])
  }, [])

  const getNodeById = useCallback((id: string) => nodes.find((node) => node.id === id), [nodes])

  const executeNode = useCallback(
    // ... (executeNode logic seems fine, no changes needed for save button) ...
    async (nodeId: string, inputData?: any): Promise<any> => {
        const node = getNodeById(nodeId)
        if (!node) {
          console.warn(`Node with ID ${nodeId} not found during execution.`)
          addLog({ // Add log for not found node
              nodeId: nodeId,
              nodeName: `Unknown Node (${nodeId.substring(0,8)})`,
              status: "error",
              message: `Node not found for execution.`,
          });
          return null 
        }
  
        if (node.data?.active === false) {
          addLog({
            nodeId: node.id,
            nodeName: `${node.data?.label || node.type} (inactive)`,
            status: "info",
            message: `Skipping inactive node: ${node.data?.label || node.type}`,
          })
          const outgoingConnections = connections.filter((conn) => conn.sourceId === nodeId)
          let lastOutput = inputData
          for (const connection of outgoingConnections) {
            lastOutput = await executeNode(connection.targetId, inputData)
          }
          return lastOutput
        }
  
        updateNode(nodeId, { status: "running" })
        addLog({
          nodeId: node.id,
          nodeName: node.data?.label || node.type,
          status: "running",
          message: `Executing ${node.data?.label || node.type}`,
          details: { input: inputData },
        })
  
        try {
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 100)) 
          let output: any
          const nodeData = node.data || {}
  
          switch (node.type) {
            case "start":
              output = { trigger: "manual", startTime: new Date().toISOString(), ...(inputData || {}) }; break;
            case "create-file":
              output = { filePath: nodeData.filename || "default.txt", created: true }; break;
            case "read-file":
              output = { content: `Content of ${nodeData.path || nodeData.filename || "default.txt"}`, encoding: nodeData.encoding || "utf-8" }; break;
            case "write-file":
              output = { filePath: nodeData.path || nodeData.filename || "default.txt", written: true, bytes: nodeData.content?.length || 0 }; break;
            case "copy-file":
              output = { source: nodeData.sourceFilename, target: nodeData.targetFilename || nodeData.toFilename, copied: true }; break;
            case "code":
              output = { result: `Executed code successfully`, inputReceived: !!inputData, logs: ["Log line 1"] }; break;
            case "xml-parser":
              output = { parsedObject: { root: { item: ["value1", "value2"] } }, error: null }; break;
            case "xml-render":
              output = { xmlString: "<root><item>value1</item></root>", error: null }; break;
            case "end":
              output = { finalStatus: "completed", endTime: new Date().toISOString(), result: inputData }; break;
            default:
              console.warn(`Execution logic not implemented for node type: ${node.type}`)
              output = { ...inputData, [`${node.type}_processed`]: true }
          }
          
          updateNode(nodeId, { status: "success", output: output, error: undefined })
          addLog({
            nodeId: node.id,
            nodeName: node.data?.label || node.type,
            status: "success",
            message: `Successfully executed ${node.data?.label || node.type}`,
            details: { output: output },
          })
  
          const outgoingConnections = connections.filter((conn) => conn.sourceId === nodeId)
          let lastOutput = output
          for (const connection of outgoingConnections) {
            lastOutput = await executeNode(connection.targetId, output)
          }
          return lastOutput
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          updateNode(nodeId, { status: "error", error: errorMessage, output: undefined })
          addLog({
            nodeId: node.id,
            nodeName: node.data?.label || node.type,
            status: "error",
            message: `Error executing ${node.data?.label || node.type}: ${errorMessage}`,
            details: { error: error },
          })
          throw error
        }
    },
    [nodes, connections, getNodeById, updateNode, addLog],
  )

  const runWorkflow = useCallback(async () => {
    // ... (runWorkflow logic seems fine, no changes needed for save button) ...
    if (isRunning) {
        console.warn("Workflow is already running.")
        return
      }
      setIsRunning(true)
      addLog({ nodeId: "system", nodeName: "System", status: "info", message: "Workflow execution started." })
  
      setNodes((prev) =>
        prev.map((node) => ({ ...node, status: "idle", output: undefined, error: undefined })),
      )
  
      const startNodes = nodes.filter((node) => node.type === "start" && node.data?.active !== false)
  
      if (startNodes.length === 0) {
        addLog({ nodeId: "system", nodeName: "System", status: "error", message: "No active start nodes found." })
        setIsRunning(false)
        return
      }
  
      try {
        await Promise.all(startNodes.map((startNode) => executeNode(startNode.id)))
        addLog({ nodeId: "system", nodeName: "System", status: "info", message: "Workflow execution finished." })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error("Workflow execution failed:", error)
        addLog({ nodeId: "system", nodeName: "System", status: "error", message: `Workflow execution failed: ${errorMessage}`})
      } finally {
        setIsRunning(false)
      }
  }, [nodes, executeNode, isRunning, addLog, setIsRunning, setNodes]) // Added setIsRunning, setNodes

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("workflowData")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        if (parsedData && Array.isArray(parsedData.nodes) && Array.isArray(parsedData.connections)) {
          loadWorkflow(parsedData)
        } else {
          console.warn("Invalid workflow data found in localStorage.")
        }
      }
    } catch (error) {
      console.error("Failed to load workflow from localStorage:", error)
      localStorage.removeItem("workflowData")
    }
  }, [loadWorkflow])

  // const saveAndRunWorkflow = useCallback(async () => {
  //   // ... (saveAndRunWorkflow logic seems fine, no changes for save button) ...
  //   const workflowId = getCurrentWorkflowId();
  //   if (!workflowId) {
  //     toast({
  //       title: "Error",
  //       description: "No active workflow to save and run. Please create or select a workflow first.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }
    
  //   try {
  //     setIsSaving(true); 
  //     setIsRunning(true); 
  //     await saveAndRunWorkflowUtil(nodes, connections, workflowId);
  //   } catch (error) {
  //     console.error("Error in saveAndRunWorkflow:", error);
  //     toast({
  //       title: "Operation Failed",
  //       description: error instanceof Error ? error.message : "Failed to save and run workflow.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsSaving(false);
  //     setIsRunning(false);
  //   }
  // }, [nodes, connections, getCurrentWorkflowId, toast, saveAndRunWorkflowUtil, setIsRunning, setIsSaving]); // Added setIsRunning, setIsSaving

  // In components/workflow/workflow-context.tsx

// ... other imports ...
// Make sure getCurrentClientId is imported or defined in this file
// import { getCurrentClientId } from './path-to-where-getCurrentClientId-is'; 
// Or if it's defined within this file already, that's fine.

// ...

// Example: If defined in the same workflow-context.tsx file or imported

// In workflow-context.tsx or client-utils.ts


// In components/workflow/workflow-context.tsx (or the correct file)



// ... rest of your WorkflowProvider and useWorkflow ...



const saveAndRunWorkflow = useCallback(async () => {
    const dagIdFromStorage = getCurrentWorkflowId();
    const clientIdFromStorage = getCurrentClientId(); // You are already getting this
    console.log(`WorkflowContext (saveAndRunWorkflow): Retrieved dagId: ${dagIdFromStorage}, clientId: ${clientIdFromStorage}`);

    if (!dagIdFromStorage) {
      toast({ title: "Error", description: "No active workflow ID found.", variant: "destructive" });
      return;
    }
    if (!clientIdFromStorage) { // Validate if clientId was successfully retrieved
      toast({ title: "Error", description: "No active client ID found. Please select or create a client.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true); 
    setIsRunning(true); 
    try {
      // Pass ALL FOUR arguments, including clientIdFromStorage
      const success = await saveAndRunWorkflowUtil(
        nodes,
        connections,
        dagIdFromStorage,
        clientIdFromStorage // <<< ADD THIS ARGUMENT
      ); 

      if (success) {
        // The utility function should handle its own success toast
        console.log("WorkflowContext: saveAndRunWorkflowUtil reported success.");
      } else {
        // The utility function should handle its own error toast
        console.log("WorkflowContext: saveAndRunWorkflowUtil reported failure (returned false).");
      }
    } catch (error) { 
      console.error("Error in saveAndRunWorkflow (context) after calling utility:", error);
      toast({
        title: "Operation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred during save and run.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setIsRunning(false);
    }
  }, [
    nodes,
    connections,
    getCurrentWorkflowId, // Dependency
    // getCurrentClientId, // Add if it's not a static utility and its identity can change
    toast,
    // saveAndRunWorkflowUtil, // Add if its identity can change (usually stable if imported)
    setIsRunning,
    setIsSaving
]);
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
    saveWorkflow, // LocalStorage save
    saveWorkflowToBackend, // Backend save
    loadWorkflow,
    runWorkflow,
    executeNode,
    addLog,
    clearLogs,
    getNodeById,
    getCurrentWorkflowId,
    saveAndRunWorkflow,
  }

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider")
  }
  return context
}