//workflow-context.tsx
"use client"
import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

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
  | "code"

export type NodeStatus = "idle" | "running" | "success" | "error"

export interface NodePosition {
  x: number
  y: number
}

export interface NodeConnection {
  id: string
  sourceId: string
  targetId: string
  sourceHandle?: string
  targetHandle?: string
}

export interface WorkflowNode {
  id: string
  type: NodeType
  position: NodePosition
  data: Record<string, any>
  status: NodeStatus
  output?: any
  error?: string
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

interface WorkflowContextType {
  nodes: WorkflowNode[]
  connections: NodeConnection[]
  logs: LogEntry[]
  selectedNodeId: string | null
  pendingConnection: { sourceId: string } | null
  propertiesModalNodeId: string | null
  dataMappingModalNodeId: string | null
  draggingNodeInfo: { id: string; offset: { x: number; y: number } } | null
  setPendingConnection: (connection: { sourceId: string } | null) => void
  setPropertiesModalNodeId: (nodeId: string | null) => void
  setDataMappingModalNodeId: (nodeId: string | null) => void
  setDraggingNodeInfo: (info: { id: string; offset: { x: number; y: number } } | null) => void
  addNode: (type: NodeType, position: NodePosition) => string
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void
  removeNode: (id: string) => void
  selectNode: (id: string | null) => void
  addConnection: (sourceId: string, targetId: string) => void
  removeConnection: (connectionId: string) => void
  clearWorkflow: () => void
  saveWorkflow: () => void
  loadWorkflow: (data: any) => void
  runWorkflow: () => Promise<void>
  executeNode: (nodeId: string) => Promise<any>
  addLog: (log: Omit<LogEntry, "id" | "timestamp">) => void
  clearLogs: () => void
  getNodeById: (id: string) => WorkflowNode | undefined
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<NodeConnection[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [pendingConnection, setPendingConnection] = useState<{ sourceId: string } | null>(null)
  const [propertiesModalNodeId, setPropertiesModalNodeId] = useState<string | null>(null)
  const [dataMappingModalNodeId, setDataMappingModalNodeId] = useState<string | null>(null)
  const [draggingNodeInfo, setDraggingNodeInfo] = useState<{ id: string; offset: { x: number; y: number } } | null>(null)

  // Add a new node to the workflow
  const addNode = useCallback((type: NodeType, position: NodePosition) => {
    const newNode: WorkflowNode = {
      id: uuidv4(),
      type,
      position,
      data: { active: true },
      status: "idle",
    }

    setNodes((prev) => [...prev, newNode])
    return newNode.id
  }, [])

  // Update an existing node
  const updateNode = useCallback((id: string, updates: Partial<WorkflowNode>) => {
    setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, ...updates } : node)))
  }, [])

  // Remove a node and its connections
  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id))
    setConnections((prev) => prev.filter((conn) => conn.sourceId !== id && conn.targetId !== id))
    
    // Deselect or close modals if the removed node was selected/open
    if (selectedNodeId === id) setSelectedNodeId(null)
    if (propertiesModalNodeId === id) setPropertiesModalNodeId(null)
    if (dataMappingModalNodeId === id) setDataMappingModalNodeId(null)
  }, [selectedNodeId, propertiesModalNodeId, dataMappingModalNodeId])

  // Select a node
  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id)
  }, [])

  // Add a connection between nodes
  const addConnection = useCallback(
    (sourceId: string, targetId: string) => {
      // Prevent connections to self
      if (sourceId === targetId) return

      // Prevent duplicate connections
      const exists = connections.some((conn) => conn.sourceId === sourceId && conn.targetId === targetId)
      if (exists) return

      // Prevent circular connections (would need more complex logic for a full check)
      // This is a simple check to prevent direct circular connections
      const targetConnectsToSource = connections.some(
        (conn) => conn.sourceId === targetId && conn.targetId === sourceId,
      )
      if (targetConnectsToSource) return

      const newConnection: NodeConnection = {
        id: uuidv4(),
        sourceId,
        targetId,
      }
      setConnections((prev) => [...prev, newConnection])
    },
    [connections],
  )

  // Remove a connection
  const removeConnection = useCallback((connectionId: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== connectionId))
  }, [])

  // Clear the entire workflow
  const clearWorkflow = useCallback(() => {
    setNodes([])
    setConnections([])
    setSelectedNodeId(null)
    setPropertiesModalNodeId(null)
    setDataMappingModalNodeId(null)
    setPendingConnection(null)
    setDraggingNodeInfo(null)
    clearLogs()
  }, [])

  // Save the workflow to JSON
  const saveWorkflow = useCallback(() => {
    const workflow = {
      nodes,
      connections,
    }

    // Save to localStorage for now
    localStorage.setItem("workflow", JSON.stringify(workflow))

    // In a real app, you would send this to the backend
    console.log("Workflow saved:", workflow)

    return workflow
  }, [nodes, connections])

  // Load a workflow from JSON
  const loadWorkflow = useCallback((data: any) => {
    if (data?.nodes && Array.isArray(data.nodes)) {
      setNodes(data.nodes)
    }

    if (data?.connections && Array.isArray(data.connections)) {
      setConnections(data.connections)
    }
    
    // Reset UI states after loading
    setSelectedNodeId(null)
    setPropertiesModalNodeId(null)
    setDataMappingModalNodeId(null)
    setPendingConnection(null)
    setDraggingNodeInfo(null)
  }, [])

  // Add a log entry
  const addLog = useCallback((log: Omit<LogEntry, "id" | "timestamp">) => {
    const newLog: LogEntry = {
      ...log,
      id: uuidv4(),
      timestamp: new Date(),
    }
    setLogs((prev) => [...prev, newLog])
  }, [])

  // Clear all logs
  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  // Get a node by ID
  const getNodeById = useCallback((id: string) => nodes.find((node) => node.id === id), [nodes])

  // Execute a single node
  const executeNode = useCallback(
    async (nodeId: string, inputData?: any) => {
      const node = getNodeById(nodeId)
      if (!node) return null

      // Skip inactive nodes
      if (node.data?.active === false) {
        addLog({
          nodeId: node.id,
          nodeName: `${node.type} (${node.id.slice(0, 6)})`,
          status: "idle",
          message: `Skipping inactive node: ${node.type}`,
        })

        // Find and execute connected nodes
        const outgoingConnections = connections.filter((conn) => conn.sourceId === nodeId)

        for (const connection of outgoingConnections) {
          await executeNode(connection.targetId, inputData) // Pass through the input data
        }

        return inputData
      }

      // Update node status to running
      updateNode(nodeId, { status: "running" })

      addLog({
        nodeId: node.id,
        nodeName: `${node.type} (${node.id.slice(0, 6)})`,
        status: "running",
        message: `Executing ${node.type} node`,
      })

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      try {
        // Simulate node execution based on type
        let output

        switch (node.type) {
          case "start":
            output = { started: true, timestamp: new Date().toISOString() }
            break

          case "create-file":
            // In a real app, this would call the backend API
            output = {
              fileInfo: {
                fullName: node.data.filename || "new-file.txt",
                fileName: (node.data.filename || "new-file.txt").split("/").pop(),
                size: 0,
                location: "/",
                lastModified: new Date().toISOString(),
              },
            }
            break

          case "read-file":
            // Simulate reading a file
            output = {
              textContent: "This is the content of the file",
              fileInfo: {
                fullName: node.data.filename || "file.txt",
                fileName: (node.data.filename || "file.txt").split("/").pop(),
                size: 42,
                location: "/",
                lastModified: new Date().toISOString(),
              },
            }
            break

          case "write-file":
            // Simulate writing to a file
            output = {
              fileInfo: {
                fullName: node.data.filename || "file.txt",
                fileName: (node.data.filename || "file.txt").split("/").pop(),
                size: node.data.textContent?.length || 0,
                location: "/",
                lastModified: new Date().toISOString(),
              },
            }
            break

          case "copy-file":
            // Simulate copying a file
            output = {
              fileInfo: {
                fullName: node.data.toFilename || "copied-file.txt",
                fileName: (node.data.toFilename || "copied-file.txt").split("/").pop(),
                size: 42,
                location: "/",
                lastModified: new Date().toISOString(),
              },
            }
            break

          case "code":
            // Simulate code execution
            output = {
              result: "Code executed successfully",
              data: { processed: true, items: 5 },
            }
            break

          case "end":
            output = { ended: true, timestamp: new Date().toISOString() }
            break

          default:
            output = { executed: true }
        }

        // Update node with success status and output
        updateNode(nodeId, { status: "success", output })

        addLog({
          nodeId: node.id,
          nodeName: `${node.type} (${node.id.slice(0, 6)})`,
          status: "success",
          message: `Successfully executed ${node.type} node`,
          details: output,
        })

        // Find and execute connected nodes
        const outgoingConnections = connections.filter((conn) => conn.sourceId === nodeId)

        for (const connection of outgoingConnections) {
          await executeNode(connection.targetId, output)
        }

        return output
      } catch (error) {
        // Update node with error status
        updateNode(nodeId, {
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        })

        addLog({
          nodeId: node.id,
          nodeName: `${node.type} (${node.id.slice(0, 6)})`,
          status: "error",
          message: `Error executing ${node.type} node: ${error instanceof Error ? error.message : String(error)}`,
        })

        throw error
      }
    },
    [connections, getNodeById, updateNode, addLog],
  )

  // Run the workflow
  const runWorkflow = useCallback(async () => {
    if (isRunning) return
    setIsRunning(true)

    // Reset all node statuses
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        status: "idle",
        output: undefined,
        error: undefined,
      })),
    )

    clearLogs()

    // Find start nodes (in a real app, validate workflow structure first)
    const startNodes = nodes.filter((node) => node.type === "start" && node.data?.active !== false)

    if (startNodes.length === 0) {
      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "error",
        message: "Workflow must have at least one active start node",
      })
      setIsRunning(false)
      return
    }

    try {
      // start with the start nodes
      for (const startNode of startNodes) {
        await executeNode(startNode.id)
      }
    } catch (error) {
      console.error("Workflow execution failed:", error)
      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "error",
        message: `Workflow execution failed: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsRunning(false)
    }
  }, [nodes, executeNode, isRunning, clearLogs, addLog])

  // Load workflow from localStorage on initial render
  useEffect(() => {
    const savedWorkflow = localStorage.getItem("workflow")
    if (savedWorkflow) {
      try {
        const parsed = JSON.parse(savedWorkflow)
        loadWorkflow(parsed)
      } catch (error) {
        console.error("Failed to load saved workflow:", error)
      }
    }
  }, [loadWorkflow])

  const value = {
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

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider")
  }
  return context
}