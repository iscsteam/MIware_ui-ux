// //workflow-context.tsx
"use client"
import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { NodeType, SchemaItem } from "@/services/interface"
import { useToast } from "@/components/ui/use-toast"
import {
  createFileConversionConfig,
  updateDag,
  triggerDagRun,
  makePythonSafeId,
} from "@/services/file-conversion-service"

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
  const { toast } = useToast()

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
      toast({
        title: "Error",
        description: "No active workflow to save. Please create a workflow first.",
        variant: "destructive",
      })
      return
    }

    if (nodes.length === 0) {
      toast({
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

      toast({
        title: "Success",
        description: "Workflow saved successfully",
        variant: "default",
      })
    } catch (error) {
      console.error("Error saving workflow:", error)
      toast({
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
              path: nodeData.path || nodeData.filename,
              provider: nodeData.provider || "local",
              format: nodeData.format || "csv",
              options: nodeData.options || {},
              schema: nodeData.schema,
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

            // Check if we have input data from a read-file node
            if (inputData && (inputData.content || inputData.path)) {
              console.log(`Processing file data for database insertion: ${nodeData.tableName}`)
              output = {
                success: true,
                rowsProcessed: Math.floor(Math.random() * 1000) + 100,
                executionTime: Math.floor(Math.random() * 5000) + 500,
                message: `Successfully inserted file data from ${inputData.path || "uploaded file"} into ${nodeData.tableName}`,
                timestamp: new Date().toISOString(),
                inputFile: inputData.path,
                tableName: nodeData.tableName,
                provider: nodeData.provider,
                connectionString: nodeData.connectionString,
                writeMode: nodeData.writeMode,
              }
            } else {
              output = {
                success: true,
                rowsProcessed: Math.floor(Math.random() * 1000) + 100,
                executionTime: Math.floor(Math.random() * 5000) + 500,
                message: "Database operation completed successfully",
                timestamp: new Date().toISOString(),
                tableName: nodeData.tableName,
                provider: nodeData.provider,
              }
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

  // Helper function to get database driver based on provider
  const getDatabaseDriver = (provider: string): string => {
    const drivers: Record<string, string> = {
      postgresql: "org.postgresql.Driver",
      mysql: "com.mysql.cj.jdbc.Driver",
      sqlserver: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
      oracle: "oracle.jdbc.driver.OracleDriver",
      local: "org.sqlite.JDBC",
    }
    return drivers[provider] || drivers.postgresql
  }

  // Update the saveAndRunWorkflow function to use the existing file-conversion-service functions
  const saveAndRunWorkflow = useCallback(async () => {
    const dynamicClientIdString = getCurrentClientId()
    if (!dynamicClientIdString) {
      toast({
        title: "Error",
        description: "No client ID found. Please create or select a client first.",
        variant: "destructive",
      })
      return
    }

    const clientId = Number.parseInt(dynamicClientIdString, 10)
    if (isNaN(clientId)) {
      toast({
        title: "Error",
        description: "Invalid client ID format.",
        variant: "destructive",
      })
      return
    }

    const currentWorkflowId = getCurrentWorkflowId()
    if (!currentWorkflowId) {
      toast({
        title: "Error",
        description: "No workflow ID found. Please create a workflow first.",
        variant: "destructive",
      })
      return
    }

    if (nodes.length === 0) {
      toast({
        title: "Error",
        description: "Cannot save an empty workflow. Please add nodes first.",
        variant: "destructive",
      })
      return
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
        return
      }

      // Check for the type of workflow
      const readFileNodes = nodes.filter((node) => node.type === "read-file")
      const writeFileNodes = nodes.filter((node) => node.type === "write-file")
      const databaseNodes = nodes.filter((node) => node.type === "database")
      const filterNodes = nodes.filter((node) => node.type === "filter")

      let dagSequence: any[] = []
      let createdConfigId: number | null = null
      let operationTypeForDag: "file_conversion" | null = null

      // --- FILE CONVERSION WORKFLOW ---
      if (readFileNodes.length > 0 && writeFileNodes.length > 0) {
        operationTypeForDag = "file_conversion"
        const readNode = readFileNodes[0]
        const writeNode = writeFileNodes[0]
        const filterNode = filterNodes.length > 0 ? filterNodes[0] : null

        if (!readNode.data.path || !writeNode.data.path) {
          toast({
            title: "Error",
            description: "File conversion workflow requires both input and output paths.",
            variant: "destructive",
          })
          return
        }

        const configPayload = {
          input: {
            provider: readNode.data.provider || "local",
            format: readNode.data.format || "csv",
            path: readNode.data.path,
            options: readNode.data.options || {},
            schema: readNode.data.schema,
          },
          output: {
            provider: writeNode.data.provider || "local",
            format: writeNode.data.format || "parquet",
            path: writeNode.data.path,
            mode: writeNode.data.writeMode || "overwrite",
            options: writeNode.data.options || {},
          },
          filter: filterNode
            ? {
                operator: filterNode.data.operator || "and",
                conditions: filterNode.data.conditions || [],
              }
            : undefined,
          dag_id: currentWorkflowId,
        }

        console.log("Creating file conversion config with:", configPayload)
        const configResponse = await createFileConversionConfig(clientId, configPayload)
        if (!configResponse) throw new Error("Failed to create file conversion config")
        createdConfigId = configResponse.id
      }
      // --- DATABASE WORKFLOW ---
      else if (readFileNodes.length > 0 && databaseNodes.length > 0) {
        operationTypeForDag = "file_conversion"
        const readNode = readFileNodes[0]
        const databaseNode = databaseNodes[0]
        const filterNode = filterNodes.length > 0 ? filterNodes[0] : null

        if (!readNode.data.path || !databaseNode.data.connectionString || !databaseNode.data.tableName) {
          toast({
            title: "Error",
            description: "Database workflow requires file path, connection string, and table name.",
            variant: "destructive",
          })
          return
        }

        // Create file conversion config for database workflow using existing service
        const configPayload = {
          input: {
            provider: readNode.data.provider || "local",
            format: readNode.data.format || "csv",
            path: readNode.data.path,
            options: readNode.data.options || {},
            schema: readNode.data.schema,
          },
          output: {
            provider: databaseNode.data.provider === "local" ? "sqlite" : databaseNode.data.provider,
            format: "sql",
            path: databaseNode.data.connectionString,
            mode: databaseNode.data.writeMode || "overwrite",
            options: {
              tableName: databaseNode.data.tableName,
              username: databaseNode.data.username || "",
              password: databaseNode.data.password || "",
              batchSize: databaseNode.data.batchSize || "5000",
              driver: getDatabaseDriver(databaseNode.data.provider),
            },
          },
          filter: filterNode
            ? {
                operator: filterNode.data.operator || "and",
                conditions: filterNode.data.conditions || [],
              }
            : undefined,
          dag_id: currentWorkflowId,
        }

        console.log("Creating database workflow config with:", configPayload)
        const configResponse = await createFileConversionConfig(clientId, configPayload)
        if (!configResponse) throw new Error("Failed to create database workflow config")
        createdConfigId = configResponse.id
      } else {
        toast({
          title: "Error",
          description: "Workflow must contain a recognized operation (read/write files or database).",
          variant: "destructive",
        })
        return
      }

      // Check if a config was successfully created and an operation type determined
      if (createdConfigId === null || operationTypeForDag === null) {
        toast({
          title: "Error",
          description: "Failed to determine workflow operation or create necessary configuration.",
          variant: "destructive",
        })
        return
      }

      // Create DAG sequence using the createdConfigId and operationTypeForDag
      const taskNodeIdPrefix = "fc_node_"
      dagSequence = [
        {
          id: makePythonSafeId(startNodes[0].id),
          type: "start",
          config_id: 1,
          next: [`${taskNodeIdPrefix}${createdConfigId}`],
        },
        {
          id: `${taskNodeIdPrefix}${createdConfigId}`,
          type: operationTypeForDag,
          config_id: createdConfigId,
          next: [makePythonSafeId(endNodes[0].id)],
        },
        { id: makePythonSafeId(endNodes[0].id), type: "end", config_id: 1, next: [] },
      ]

      // Update DAG and Trigger Run using existing service functions
      const dagUpdateData = { dag_sequence: dagSequence, active: true }
      const updatedDag = await updateDag(currentWorkflowId, dagUpdateData)
      if (!updatedDag) throw new Error("Failed to update DAG")

      try {
        const triggerResult = await triggerDagRun(currentWorkflowId)
        if (!triggerResult) console.log("Trigger returned null, but continuing.")
      } catch (triggerError) {
        console.error("Error triggering DAG run, but workflow was saved:", triggerError)
        toast({
          title: "Partial Success",
          description: "Workflow saved but failed to trigger. Run manually.",
          variant: "default",
        })
        return
      }

      toast({ title: "Success", description: "Workflow saved and triggered successfully." })
    } catch (error) {
      console.error("Error in saveAndRunWorkflow:", error)
      toast({
        title: "Workflow Error",
        description: error instanceof Error ? error.message : "Failed to save and run workflow.",
        variant: "destructive",
      })
    }
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
