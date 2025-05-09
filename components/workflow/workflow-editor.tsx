
"use client"

import type React from "react"
import { useRef, useState, useEffect, useCallback } from "react"
import { useWorkflow, type NodeType, type WorkflowNode, type NodeConnection } from "./workflow-context"
import { NodeComponent } from "./node-component"
import { ConnectionLine } from "./connection-line"
import { NodeModal } from "./node-modal"
import { ExecutionModal } from "./execution-modal"
import { SideModal } from "./sidemodal"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import SchemaModal from "./SchemaModal"
import { getNodeSchema } from "./nodeSchemas"

// Define SchemaItem interface which was missing
interface SchemaItem {
  name: string
  type?: string
  description?: string
  required?: boolean
  originalName?: string
  sourceNodeId?: string
}

interface SchemaModalData {
  nodeType: NodeType
  baseInputSchema: SchemaItem[]
  baseOutputSchema: SchemaItem[]
  availableInputsFromPrevious: SchemaItem[] // Outputs from connected source nodes
  nodeLabel?: string // Optional: Pass the specific node's label
}

// Define NodeComponentProps interface to fix TypeScript error
interface NodeComponentProps {
  key: string
  node: WorkflowNode
  selected: boolean
  isConnecting: boolean
  onSelect: () => void
  onDragStart: (nodeId: string, e: React.MouseEvent) => void
  onExecuteNode: (nodeId: string) => void
  onOpenProperties: (nodeId: string) => void
  onOpenSchemaModal: (nodeId: string) => void
}

export function WorkflowEditor() {
  const {
    nodes,
    connections,
    selectedNodeId,
    pendingConnection,
    setPendingConnection,
    addNode,
    updateNode,
    selectNode,
    removeConnection,
    executeNode,
    addConnection,
  } = useWorkflow()

  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [canvasScale, setCanvasScale] = useState(1)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [sideModalOpen, setSideModalOpen] = useState(false)
  const [insertPosition, setInsertPosition] = useState<{
    x: number
    y: number
  }>({ x: 0, y: 0 })
  const [connectionToSplit, setConnectionToSplit] = useState<NodeConnection | null>(null)
  const [executionModalOpen, setExecutionModalOpen] = useState(false)
  const [executingNodeId, setExecutingNodeId] = useState<string | null>(null)
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(false)
  const [activeNodeForModal, setActiveNodeForModal] = useState<WorkflowNode | null>(null)

  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false)
  const [nodeTypeForSchemaModal, setNodeTypeForSchemaModal] = useState<NodeType | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [schemaModalData, setSchemaModalData] = useState<SchemaModalData | null>(null)

  const handleOpenSchemaModal = useCallback(
    (nodeId: string) => {
      const targetNode = nodes.find((n) => n.id === nodeId)
      if (!targetNode) {
        console.error("Target node not found for schema modal:", nodeId)
        return
      }

      const nodeType = targetNode.type
      const baseSchema = getNodeSchema(nodeType)

      if (!baseSchema) {
        console.error("Schema not found for node type:", nodeType)
        setSchemaModalData({
          nodeId,
          nodeType,
          baseInputSchema: [],
          baseOutputSchema: [],
          availableInputsFromPrevious: [],
          nodeLabel: targetNode.data?.label || nodeType,
        })
        setIsSchemaModalOpen(true) // Make sure to open the modal
        return
      }


      // Recursive function to collect outputs from all upstream nodes
      const findAllUpstreamOutputs = (currentNodeId: string, visited = new Set<string>()): SchemaItem[] => {
        if (visited.has(currentNodeId)) return []
        visited.add(currentNodeId)

        const incomingConnections = connections.filter((conn) => conn.targetId === currentNodeId)

        let collectedOutputs: SchemaItem[] = []

        for (const conn of incomingConnections) {
          const sourceNode = nodes.find((n) => n.id === conn.sourceId)
          if (sourceNode) {
            const sourceSchema = getNodeSchema(sourceNode.type)

            if (sourceSchema?.outputSchema) {
              sourceSchema.outputSchema.forEach((outputItem) => {
                const uniqueName = `${sourceNode.data?.label || sourceNode.type} - ${outputItem.name}`
                collectedOutputs.push({
                  ...outputItem,
                  name: uniqueName,
                  description: `${outputItem.description || ""} (from ${
                    sourceNode.data?.label || sourceNode.type
                  })`,
                  originalName: outputItem.name,
                  sourceNodeId: sourceNode.id,
                })
              })
            }


            // Recursively collect outputs from further upstream
            const upstreamOutputs = findAllUpstreamOutputs(sourceNode.id, visited)
            collectedOutputs = collectedOutputs.concat(upstreamOutputs)
          }
        }

        return collectedOutputs
      }

      const availableInputs = findAllUpstreamOutputs(nodeId)

      setSchemaModalData({
        nodeId,
        nodeType,
        baseInputSchema: baseSchema.inputSchema || [],
        baseOutputSchema: baseSchema.outputSchema || [],
        availableInputsFromPrevious: availableInputs,
        nodeLabel: targetNode.data?.label || nodeType,
      })
      setIsSchemaModalOpen(true) // Make sure to open the modal
    },
    [nodes, connections],
  )

  const handleCloseSchemaModal = () => {
    setSchemaModalData(null)
    setIsSchemaModalOpen(false)
  }

  // Handle node drop from palette
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()

      const nodeType = e.dataTransfer.getData("nodeType") as NodeType
      if (!nodeType) return

      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return

      // Calculate position relative to canvas, accounting for scroll and zoom
      const x = (e.clientX - canvasRect.left) / canvasScale - canvasOffset.x
      const y = (e.clientY - canvasRect.top) / canvasScale - canvasOffset.y

      addNode(nodeType, { x, y })
    },
    [addNode, canvasScale, canvasOffset],
  )

  // Handle drag over for drop target
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  // start node dragging
  const startNodeDrag = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      setIsDragging(true)
      selectNode(nodeId)

      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return

      // Calculate offset between mouse and node position
      const x = e.clientX - canvasRect.left - node.position.x * canvasScale
      const y = e.clientY - canvasRect.top - node.position.y * canvasScale

      setDragOffset({ x, y })
    },
    [nodes, selectNode, canvasScale],
  )

  // Handle mouse move for node dragging and pending connection
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return

      // Update mouse position for pending connection line
      const x = (e.clientX - canvasRect.left) / canvasScale
      const y = (e.clientY - canvasRect.top) / canvasScale
      setMousePosition({ x, y })

      // Handle node dragging
      if (isDragging && selectedNodeId) {
        // Calculate new position, accounting for scale and offset
        const x = (e.clientX - canvasRect.left - dragOffset.x) / canvasScale
        const y = (e.clientY - canvasRect.top - dragOffset.y) / canvasScale

        updateNode(selectedNodeId, {
          position: { x, y },
        })
      }
    },
    [isDragging, selectedNodeId, dragOffset, updateNode, canvasScale],
  )

  // Handle mouse up to end dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle canvas click to cancel pending connection
  const handleCanvasClick = useCallback(() => {
    if (pendingConnection) {
      setPendingConnection(null)
    } else {
      selectNode(null)
      setModalOpen(false)
    }
  }, [pendingConnection, setPendingConnection, selectNode])

  // Set up event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e)
    }

    const handleGlobalMouseUp = () => {
      handleMouseUp()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPendingConnection(null)
        setSideModalOpen(false)
        setModalOpen(false)
        setIsSchemaModalOpen(false)
      }
    }

    window.addEventListener("mousemove", handleGlobalMouseMove)
    window.addEventListener("mouseup", handleGlobalMouseUp)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove)
      window.removeEventListener("mouseup", handleGlobalMouseUp)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleMouseMove, handleMouseUp, setPendingConnection])

  // Handle zoom with mouse wheel
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()

      // Calculate zoom factor
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.5, Math.min(2, canvasScale * delta))

      // Calculate mouse position relative to canvas
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return

      const mouseX = e.clientX - canvasRect.left
      const mouseY = e.clientY - canvasRect.top

      // Calculate new offset to zoom toward mouse position
      const newOffsetX = mouseX / newScale - (mouseX / canvasScale - canvasOffset.x)
      const newOffsetY = mouseY / newScale - (mouseY / canvasScale - canvasOffset.y)

      setCanvasScale(newScale)
      setCanvasOffset({ x: newOffsetX, y: newOffsetY })
    },
    [canvasScale, canvasOffset],
  )

  // Find source node for pending connection
  const getPendingConnectionSourceNode = useCallback(() => {
    if (!pendingConnection) return null
    return nodes.find((node) => node.id === pendingConnection.sourceId)
  }, [pendingConnection, nodes])

  // Handle inserting a node into a connection
  const handleInsertNode = useCallback((connection: NodeConnection, position: { x: number; y: number }) => {
    setConnectionToSplit(connection)
    setInsertPosition(position)
    setSideModalOpen(true)
  }, [])

  // Handle node selection from palette for insertion
  const handleNodeTypeSelect = useCallback(
    (nodeType: NodeType) => {
      if (connectionToSplit) {
        // Create the new node
        const newNodeId = addNode(nodeType, insertPosition)

        // Create connections from source to new node and from new node to target
        addConnection(connectionToSplit.sourceId, newNodeId)
        addConnection(newNodeId, connectionToSplit.targetId)

        // Remove the original connection
        removeConnection(connectionToSplit.id)

        // Reset state
        setConnectionToSplit(null)
      } else {
        // Add node in the center of the canvas if no position specified
        const canvasRect = canvasRef.current?.getBoundingClientRect()
        if (canvasRect) {
          const centerX = canvasRect.width / 2 / canvasScale - canvasOffset.x
          const centerY = canvasRect.height / 2 / canvasScale - canvasOffset.y
          addNode(nodeType, { x: centerX, y: centerY })
        }
      }

      // Close the side modal
      setSideModalOpen(false)
    },
    [connectionToSplit, insertPosition, addNode, addConnection, removeConnection, canvasScale, canvasOffset],
  )

  // Handle executing a single node
  const handleExecuteNode = useCallback(
    (nodeId: string) => {
      setExecutingNodeId(nodeId)
      setExecutionModalOpen(true)

      // Execute the node
      executeNode(nodeId)
    },
    [executeNode],
  )

  // Toggle Side Modal
  const toggleSideModal = useCallback(() => {
    setSideModalOpen((prev) => !prev)
  }, [])

  // Open properties panel when double-clicking on node icon
  const handleOpenProperties = useCallback(
    (nodeId: string) => {
      selectNode(nodeId)
      setModalOpen(true)
    },
    [selectNode],
  )

  // Close properties panel
  const handleCloseProperties = useCallback(() => {
    setModalOpen(false)
  }, [])

  function DotsBackground() {
    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <defs>
          <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1.2" fill="rgba(38, 37, 37, 0.2)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
    )
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-blue">
      {/* Add Button in top-right corner */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={toggleSideModal}
          variant="outline"
          size="icon"
          className=" bg-white shadow-md hover:bg-gray-100"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={canvasRef}
        className="h-full w-full overflow-hidden"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
      >
        <DotsBackground />
        <div
          className="h-full w-full"
          style={{
            transform: `scale(${canvasScale}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
            transformOrigin: "0 0",
          }}
        >
          {/* Connections */}
          <svg className="absolute h-full w-full pointer-events-none">
            {connections.map((connection) => {
              const source = nodes.find((n) => n.id === connection.sourceId)
              const target = nodes.find((n) => n.id === connection.targetId)

              if (!source || !target) return null

              // Skip connections to/from inactive nodes
              if (source.data?.active === false || target.data?.active === false) {
                return null
              }

              return (
                <ConnectionLine
                  key={connection.id}
                  connection={connection}
                  sourceNode={source}
                  targetNode={target}
                  onDelete={() => removeConnection(connection.id)}
                  onInsertNode={handleInsertNode}
                />
              )
            })}

            {/* Pending connection line */}
            {pendingConnection && (
              <PendingConnectionLine
                sourceNode={getPendingConnectionSourceNode() ?? null}
                mousePosition={mousePosition}
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <NodeComponent
              key={node.id}
              node={node}
              selected={node.id === selectedNodeId}
              isConnecting={!!pendingConnection && pendingConnection.sourceId === node.id}
              // Pass down callbacks
              onSelect={() => {
                // Prevent select if modal open
                if (isSchemaModalOpen || propertiesPanelOpen || sideModalOpen || executionModalOpen) return
                selectNode(node.id)
              }}
              onDragStart={startNodeDrag} // Already checks for modals
              onExecuteNode={handleExecuteNode} // Already checks for modals
              onOpenProperties={handleOpenProperties} // Already checks for modals
              onOpenSchemaModal={handleOpenSchemaModal} // Pass the handler
            />
          ))}
        </div>
      </div>

      {/* Connection helper text */}
      {pendingConnection && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm z-50">
          Click on an input port to complete connection • Press ESC to cancel
        </div>
      )}

      {/* Node Modal */}
      {selectedNodeId && <NodeModal nodeId={selectedNodeId} isOpen={modalOpen} onClose={handleCloseProperties} />}

      {/* Side modal for adding nodes */}
      <SideModal
        isOpen={sideModalOpen}
        onClose={() => setSideModalOpen(false)}
        onSelectNodeType={handleNodeTypeSelect}
      />

      {/* Execution modal */}
      <ExecutionModal
        isOpen={executionModalOpen}
        onClose={() => setExecutionModalOpen(false)}
        nodeId={executingNodeId}
      />

      {/* Schema Modal */}
      {schemaModalData && (
        <SchemaModal
          nodeType={schemaModalData.nodeType}
          nodeLabel={schemaModalData.nodeLabel}
          baseInputSchema={schemaModalData.baseInputSchema}
          baseOutputSchema={schemaModalData.baseOutputSchema}
          availableInputsFromPrevious={schemaModalData.availableInputsFromPrevious}
          onClose={handleCloseSchemaModal}
        />
      )}
    </div>
  )
}

// Component for rendering the pending connection line
function PendingConnectionLine({
  sourceNode,
  mousePosition,
}: {
  sourceNode: WorkflowNode | null
  mousePosition: { x: number; y: number }
}) {
  if (!sourceNode) return null

  // Calculate the starting point of the connection
  const sourceX = sourceNode.position.x + 100 // Node width is 100px
  const sourceY = sourceNode.position.y + 50 // Node height is 100px, port at middle

  // Create a bezier curve path from source to mouse position
  const controlPointOffset = 60
  const sourceControlX = sourceX + controlPointOffset
  const targetControlX = mousePosition.x - controlPointOffset

  const path = `M ${sourceX} ${sourceY} C ${sourceControlX} ${sourceY}, ${targetControlX} ${mousePosition.y}, ${mousePosition.x} ${mousePosition.y}`

  return <path d={path} stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" fill="none" />
}
