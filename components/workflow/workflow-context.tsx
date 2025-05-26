"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { NodeType, SchemaItem } from "@/services/interface"
import { useToast } from "@/components/ui/use-toast"
import { saveAndRunWorkflow as saveAndRunWorkflowUtil } from "@/services/workflow-utils"

const baseurl = process.env.NEXT_PUBLIC_USER_API_END_POINT

export type NodeStatus = "idle" | "running" | "success" | "error" | "configured"

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
  filter?: any
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
  provider?: string
  format?: string
  schema?: any
  order_by?: any
  aggregation?: any
  // Add CLI operator specific fields
  source_path?: string
  destination_path?: string
  cliOperatorPayload?: {
    operation: string
    source_path: string
    destination_path: string
    options: {
      overwrite: boolean
      includeSubDirectories?: boolean
      createNonExistingDirs?: boolean
      [key: string]: any
    }
    executed_by: string
  }
  // Database specific fields
  connectionString?: string
  writeMode?: string
  tableName?: string
  username?: string
  password?: string
  batchSize?: string
  // Source specific fields
  filePath?: string
  csvOptions?: Record<string, any>
}

export interface WorkflowNode {
  id: string
  type: NodeType
  position: NodePosition
  data: WorkflowNodeData
  status?: NodeStatus
  output?: any
  error?: string
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

export interface DAG {
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
  saveWorkflow: () => { nodes: WorkflowNode[]; connections: NodeConnection[] }
  saveWorkflowToBackend: () => Promise<void>
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
    const clientDataString = localStorage.getItem("currentClient")
    if (clientDataString) {
      const parsedClient = JSON.parse(clientDataString)
      if (parsedClient && parsedClient.id && String(parsedClient.id).trim() !== "") {
        return String(parsedClient.id)
      }
    }

    // 2. Fallback: Check for "client_id" inside "currentWorkflow" item
    const workflowDataString = localStorage.getItem("currentWorkflow")
    if (workflowDataString) {
      const parsedWorkflow = JSON.parse(workflowDataString)
      if (parsedWorkflow && parsedWorkflow.client_id && String(parsedWorkflow.client_id).trim() !== "") {
        return String(parsedWorkflow.client_id)
      }
    }
    // If neither found:
    console.warn(
      "getCurrentClientId: No valid client_id found in localStorage ('currentClient' or 'currentWorkflow.client_id').",
    )
  } catch (error) {
    console.error("getCurrentClientId: Error accessing localStorage:", error)
  }
  return null
}

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<NodeConnection[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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

  // Get toast hook for notifications
  const toast = useToast()

  // --- Node Management ---
  const addNode = useCallback((type: NodeType, position: NodePosition, initialData?: Partial<WorkflowNodeData>) => {
    // Use displayName if provided, otherwise generate a name based on type
    const displayName = initialData?.displayName || `${type}_${Math.floor(Math.random() * 10000)}`

    // Create a Python-compatible ID from the displayName
    const nodeId = makePythonSafeId(displayName)

    const newNode: WorkflowNode = {
      id: nodeId,
      type,
      position,
      // Initialize data with active: true and any provided initial data
      data: {
        label: type,
        displayName: displayName,
        active: true,
        ...initialData,
      },
      status: "idle",
    }
    setNodes((prev) => [...prev, newNode])
    return newNode.id
  }, [])

  // Helper function to create Python-compatible IDs
  const makePythonSafeId = (name: string): string => {
    // Remove any non-alphanumeric characters and replace with underscores
    let safeId = name.replace(/[^a-zA-Z0-9_]/g, "_")

    // Ensure it starts with a letter or underscore (Python variable naming rule)
    if (!/^[a-zA-Z_]/.test(safeId)) {
      safeId = "node_" + safeId
    }

    return safeId
  }

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
            // Merge node-level updates and data updates separately
            const { data: dataUpdates, ...nodeUpdates } = updates
            return {
              ...node,
              ...nodeUpdates, // Apply updates like position, status, etc.
              data: {
                // Merge data ensuring previous data isn't lost
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
      // Also remove connections associated with this node
      setConnections((prev) => prev.filter((conn) => conn.sourceId !== id && conn.targetId !== id))
      // Clear selection/modals if the removed node was active
      if (selectedNodeId === id) setSelectedNodeId(null)
      if (propertiesModalNodeId === id) setPropertiesModalNodeId(null)
    },
    [selectedNodeId, propertiesModalNodeId],
  )

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id)
  }, [])

  // --- Connection Management ---
  const addConnection = useCallback(
    (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => {
      if (sourceId === targetId) return // Prevent self-connections

      // Check for existing connection (consider handles if they are relevant)
      const exists = connections.some(
        (conn) =>
          conn.sourceId === sourceId &&
          conn.targetId === targetId &&
          conn.sourceHandle === sourceHandle && // Include handle checks if necessary
          conn.targetHandle === targetHandle,
      )
      if (exists) return

      // Basic check for direct circular connection (A->B and B->A)
      // More complex cycle detection might be needed for larger graphs
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
    setPendingConnection(null)
    setDraggingNodeInfo(null)
    clearLogs() // Assuming clearLogs is defined elsewhere or added here
  }, [])

  // Helper function to get current workflow ID
  const getCurrentWorkflowId = useCallback(() => {
    try {
      const workflowData = localStorage.getItem("currentWorkflow")
      if (workflowData) {
        const parsed = JSON.parse(workflowData)
        return parsed.dag_id
      }
    } catch (error) {
      console.error("Error getting current workflow ID:", error)
    }
    return null
  }, [])

  // Convert workflow to backend DAG format
  const convertWorkflowToDAG = useCallback(() => {
    // Create a map of node connections
    const nodeConnectionMap: Record<string, string[]> = {}

    // Initialize with empty arrays for all nodes
    nodes.forEach((node) => {
      nodeConnectionMap[node.id] = []
    })

    // Fill in the connections
    connections.forEach((connection) => {
      if (nodeConnectionMap[connection.sourceId]) {
        nodeConnectionMap[connection.sourceId].push(connection.targetId)
      }
    })

    const sanitizeId = (id: string) => {
      // Ensure the ID is Python-compatible (starts with letter, contains only letters, numbers, underscores)
      let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_")

      // Ensure it starts with a letter or underscore (Python variable naming rule)
      if (!/^[a-zA-Z_]/.test(safeId)) {
        safeId = "task_" + safeId
      }

      return safeId
    }
    // Convert to DAG sequence format
    const dagSequence = nodes.map((node) => {
      return {
        id: sanitizeId(node.id),
        type: node.type,
        config_id: 1, // Default config_id
        next: (nodeConnectionMap[node.id] || []).map(sanitizeId),
      }
    })

    return {
      dag_sequence: dagSequence,
    }
  }, [nodes, connections])

  // Save workflow to backend
  const saveWorkflowToBackend = useCallback(async () => {
    // Get the current workflow ID from localStorage
    let workflowId
    try {
      const workflowData = localStorage.getItem("currentWorkflow")
      if (workflowData) {
        const parsed = JSON.parse(workflowData)
        workflowId = parsed.dag_id
      }
    } catch (error) {
      console.error("Error getting current workflow ID:", error)
    }

    // If no workflow ID is found, use the default one
    if (!workflowId) {
      workflowId = "dag_sample_47220ca3"
    }

    const saveWorkflow = () => {
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
    }

    if (!workflowId) {
      toast.toast({
        title: "Error",
        description: "No active workflow to save. Please create a workflow first.",
        variant: "destructive",
      })
      return
    }

    if (nodes.length === 0) {
      toast.toast({
        title: "Error",
        description: "Cannot save an empty workflow. Please add nodes first.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Convert workflow to DAG format
      const dagData = convertWorkflowToDAG()

      // Update the workflow in the backend
      const response = await fetch(`${baseurl}/dags/${workflowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dagData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to save workflow")
      }

      // Save to localStorage as well
      saveWorkflow()

      toast.toast({
        title: "Success",
        description: "Workflow saved successfully",
        variant: "default",
      })
    } catch (error) {
      console.error("Error saving workflow:", error)
      toast.toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save workflow",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [nodes, connections, convertWorkflowToDAG, toast])

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
      setPendingConnection(null)
      setDraggingNodeInfo(null)
      console.log("Workflow loaded.")
    } else {
      console.error("Invalid data format for loading workflow.")
    }
  }, [])

  //--- Logging ---
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
      const node = getNodeById(nodeId)
      if (!node) {
        console.warn(`Node with ID ${nodeId} not found during execution.`)
        return null // Or throw an error
      }

      // Use optional chaining for safety when accessing `node.data`
      if (node.data?.active === false) {
        addLog({
          nodeId: node.id,
          nodeName: `${node.data?.label || node.type} (inactive)`,
          status: "info",
          message: `Skipping inactive node: ${node.data?.label || node.type}`,
        })

        // Find outgoing connections and execute next nodes *with the current inputData*
        const outgoingConnections = connections.filter((conn) => conn.sourceId === nodeId)
        let lastOutput = inputData // Pass data through inactive node
        for (const connection of outgoingConnections) {
          // TODO: Handle data mapping based on source/target handles if necessary
          // For now, just pass the entire output
          lastOutput = await executeNode(connection.targetId, inputData)
        }
        return lastOutput // Return data from the last node in the chain after the inactive one
      }

      // Update node status to running
      updateNode(nodeId, { status: "running" })
      addLog({
        nodeId: node.id,
        nodeName: node.data?.label || node.type,
        status: "running",
        message: `Executing ${node.data?.label || node.type}`,
        details: { input: inputData }, // Log input for debugging
      })

      try {
        // --- Node Execution Simulation ---
        // Replace this with actual backend calls or logic execution
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 100)) // Simulate async work

        let output: any
        const nodeData = node.data || {} // Use node.data safely

        // Example execution logic (expand significantly for real app)
        switch (node.type) {
          case "start":
            output = {
              trigger: "manual",
              startTime: new Date().toISOString(),
              ...(inputData || {}),
            }
            break
          case "create-file":
            console.log(`Simulating CREATE file: ${nodeData.filename} with overwrite: ${nodeData.overwrite}`)
            output = {
              filePath: nodeData.filename || "default.txt",
              created: true,
            }
            break
          case "read-file":
            console.log(`Simulating READ file: ${nodeData.path || nodeData.filename}`)
            output = {
              content: `Content of ${nodeData.path || nodeData.filename || "default.txt"}`,
              encoding: nodeData.encoding || "utf-8",
            }
            break
          case "write-file":
            console.log(
              `Simulating WRITE file: ${nodeData.path || nodeData.filename} with content: ${
                nodeData.content?.substring(0, 50) || ""
              }...`,
            )
            output = {
              filePath: nodeData.path || nodeData.filename || "default.txt",
              written: true,
              bytes: nodeData.content?.length || 0,
            }
            break
          case "copy-file":
            console.log(
              `Simulating COPY file: ${nodeData.source_path || nodeData.sourceFilename} to ${
                nodeData.destination_path || nodeData.targetFilename || nodeData.toFilename
              }`,
            )
            output = {
              source: nodeData.source_path || nodeData.sourceFilename,
              target: nodeData.destination_path || nodeData.targetFilename || nodeData.toFilename,
              copied: true,
            }
            break
          case "rename-file":
            console.log(`Simulating RENAME file: ${nodeData.oldFilename} to ${nodeData.newFilename}`)
            output = {
              oldPath: nodeData.oldFilename,
              newPath: nodeData.newFilename,
              renamed: true,
            }
            break

          case "database":
            console.log(
              `Simulating DATABASE operation: ${nodeData.provider || "unknown"} to ${nodeData.tableName || "unknown"}`,
            )
            output = {
              success: true,
              rowsProcessed: Math.floor(Math.random() * 1000) + 100,
              executionTime: Math.floor(Math.random() * 5000) + 500,
              message: "Database operation completed successfully",
              timestamp: new Date().toISOString(),
            }
            break

          case "source":
            console.log(
              `Simulating SOURCE operation: ${nodeData.provider || "unknown"} format ${nodeData.format || "unknown"}`,
            )
            output = {
              data: { sample: "data from source" },
              schema: nodeData.schema,
              rowCount: Math.floor(Math.random() * 1000) + 100,
              filePath: nodeData.filePath,
              format: nodeData.format,
            }
            break

          case "code":
            console.log(`Simulating EXECUTE code: ${nodeData.language || "unknown"}`)
            // In real scenario, execute nodeData.code with inputData
            output = {
              result: `Executed code successfully`,
              inputReceived: !!inputData,
              logs: ["Log line 1"],
            }
            break
          case "xml-parser":
            console.log(`Simulating XML PARSE: ${nodeData.xmlString?.substring(0, 50)}...`)
            output = {
              parsedObject: { root: { item: ["value1", "value2"] } },
              error: null,
            } // Simulate success
            break
          case "xml-render":
            console.log(`Simulating XML RENDER object`)
            output = {
              xmlString: "<root><item>value1</item></root>",
              error: null,
            } // Simulate success
            break
          case "end":
            output = {
              finalStatus: "completed",
              endTime: new Date().toISOString(),
              result: inputData,
            }
            break
          default:
            console.warn(`Execution logic not implemented for node type: ${node.type}`)
            output = { ...inputData, [`${node.type}_processed`]: true } // Generic output
        }
        // --- End Simulation ---

        updateNode(nodeId, {
          status: "success",
          output: output,
          error: undefined,
        })
        addLog({
          nodeId: node.id,
          nodeName: node.data?.label || node.type,
          status: "success",
          message: `Successfully executed ${node.data?.label || node.type}`,
          details: { output: output },
        })

        // Execute next connected nodes
        const outgoingConnections = connections.filter((conn) => conn.sourceId === nodeId)
        let lastOutput = output // Start with current node's output
        for (const connection of outgoingConnections) {
          // TODO: Handle data mapping based on source/target handles if necessary
          // For now, just pass the entire output
          lastOutput = await executeNode(connection.targetId, output) // Pass current node's output as input
        }
        return lastOutput // Return the output of the last node executed in this branch
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        updateNode(nodeId, {
          status: "error",
          error: errorMessage,
          output: undefined,
        })
        addLog({
          nodeId: node.id,
          nodeName: node.data?.label || node.type,
          status: "error",
          message: `Error executing ${node.data?.label || node.type}: ${errorMessage}`,
          details: { error: error }, // Log the actual error object if needed
        })
        throw error // Re-throw to potentially stop the whole workflow run
      }
    },
    [nodes, connections, getNodeById, updateNode, addLog], // Correct dependencies
  )

  const runWorkflow = useCallback(async () => {
    if (isRunning) {
      console.warn("Workflow is already running.")
      return
    }
    setIsRunning(true)
    addLog({
      nodeId: "system",
      nodeName: "System",
      status: "info",
      message: "Workflow execution started.",
    })

    // Reset statuses before run
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        status: "idle",
        output: undefined,
        error: undefined,
      })),
    )
    clearLogs() // Optionally clear logs for the new run

    // Find active start nodes
    const startNodes = nodes.filter((node) => node.type === "start" && node.data?.active !== false)

    if (startNodes.length === 0) {
      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "error",
        message: "No active start nodes found.",
      })
      setIsRunning(false)
      return
    }

    try {
      // Execute all active start nodes concurrently (or sequentially if needed)
      // Using Promise.all for concurrent start
      await Promise.all(startNodes.map((startNode) => executeNode(startNode.id)))
      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "info",
        message: "Workflow execution finished.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("Workflow execution failed:", error)
      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "error",
        message: `Workflow execution failed: ${errorMessage}`,
      })
      // Decide if partial results are okay or if the whole run failed
    } finally {
      setIsRunning(false)
    }
  }, [nodes, executeNode, isRunning, clearLogs, addLog]) // Added isRunning, clearLogs, addLog dependencies

  // --- Effect for Loading from localStorage ---
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("workflowData")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        // Add basic validation before loading
        if (parsedData && Array.isArray(parsedData.nodes) && Array.isArray(parsedData.connections)) {
          loadWorkflow(parsedData)
        } else {
          console.warn("Invalid workflow data found in localStorage.")
        }
      }
    } catch (error) {
      console.error("Failed to load workflow from localStorage:", error)
      localStorage.removeItem("workflowData") // Clear invalid data
    }
  }, [loadWorkflow]) // Load only on initial mount or when loadWorkflow function identity changes

  // Update the saveAndRunWorkflow function to use the utility function
  const saveAndRunWorkflow = useCallback(async () => {
    const workflowId = getCurrentWorkflowId()
    if (!workflowId) {
      toast.toast({
        title: "Error",
        description: "No active workflow to save. Please create a workflow first.",
        variant: "destructive",
      })
      return
    }

    await saveAndRunWorkflowUtil(nodes, connections, workflowId)
  }, [nodes, connections, getCurrentWorkflowId, toast])

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
    saveWorkflowToBackend,
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

// --- Custom Hook ---
export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider")
  }
  return context
}
