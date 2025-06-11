"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, RotateCcw, Play, Square, Settings } from "lucide-react"
import { WorkflowNode } from "./workflow-node"
import { NodePalette } from "./node-palette"
import { ConnectionPath } from "./connection-path"

interface WorkflowCanvasProps {
  config: any
  onClose: () => void
}

interface Node {
  id: string
  type: string
  x: number
  y: number
  label: string
  status?: "idle" | "running" | "success" | "error"
  config?: any
}

interface Connection {
  id: string
  from: string
  to: string
}

export function WorkflowCanvas({ config, onClose }: WorkflowCanvasProps) {
  const [nodes, setNodes] = useState<Node[]>([
    { id: "start", type: "start", x: 100, y: 200, label: "Start", status: "success" },
    { id: "read", type: "read", x: 300, y: 150, label: "Read Data", status: "success" },
    { id: "transform", type: "transform", x: 500, y: 200, label: "Transform", status: "running" },
    { id: "write", type: "write", x: 700, y: 150, label: "Write Data", status: "idle" },
    { id: "end", type: "end", x: 900, y: 200, label: "End", status: "idle" },
  ])

  const [connections, setConnections] = useState<Connection[]>([
    { id: "conn1", from: "start", to: "read" },
    { id: "conn2", from: "read", to: "transform" },
    { id: "conn3", from: "transform", to: "write" },
    { id: "conn4", from: "write", to: "end" },
  ])

  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ nodeId: string; offset: { x: number; y: number } } | null>(null)
  const [connecting, setConnecting] = useState<{ from: string } | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Handle node dragging
  const handleNodeMouseDown = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const offsetX = (e.clientX - rect.left - offset.x) / scale - node.x
      const offsetY = (e.clientY - rect.top - offset.y) / scale - node.y

      setDragging({ nodeId, offset: { x: offsetX, y: offsetY } })
      setSelectedNode(nodeId)
    },
    [nodes, offset, scale],
  )

  // Handle canvas panning
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0 && !e.target.closest(".workflow-node")) {
        setPanning(true)
        setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
        setSelectedNode(null)
      }
    },
    [offset],
  )

  // Global mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const newX = (e.clientX - rect.left - offset.x) / scale - dragging.offset.x
        const newY = (e.clientY - rect.top - offset.y) / scale - dragging.offset.y

        setNodes((prev) => prev.map((node) => (node.id === dragging.nodeId ? { ...node, x: newX, y: newY } : node)))
      } else if (isPanning) {
        setOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        })
      }
    }

    const handleMouseUp = () => {
      setDragging(null)
      setPanning(false)
    }

    if (dragging || isPanning) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [dragging, isPanning, offset, scale, panStart])

  // Handle zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.1, Math.min(3, scale * delta))

      if (newScale !== scale) {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) {
          const mouseX = e.clientX - rect.left
          const mouseY = e.clientY - rect.top

          const scaleRatio = newScale / scale
          setOffset((prev) => ({
            x: mouseX - (mouseX - prev.x) * scaleRatio,
            y: mouseY - (mouseY - prev.y) * scaleRatio,
          }))
        }
        setScale(newScale)
      }
    },
    [scale],
  )

  // Canvas controls
  const handleZoomIn = () => setScale((prev) => Math.min(3, prev * 1.2))
  const handleZoomOut = () => setScale((prev) => Math.max(0.1, prev / 1.2))
  const handleResetView = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  // Connection handling
  const handleStartConnection = (nodeId: string) => {
    setConnecting({ from: nodeId })
  }

  const handleCompleteConnection = (nodeId: string) => {
    if (connecting && connecting.from !== nodeId) {
      const newConnection: Connection = {
        id: `conn_${Date.now()}`,
        from: connecting.from,
        to: nodeId,
      }
      setConnections((prev) => [...prev, newConnection])
    }
    setConnecting(null)
  }

  // Add node from palette
  const handleAddNode = (nodeType: string) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: nodeType,
      x: 400,
      y: 300,
      label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
      status: "idle",
    }
    setNodes((prev) => [...prev, newNode])
  }

  // Simulate workflow execution
  const handleExecuteWorkflow = () => {
    setNodes((prev) => prev.map((node) => ({ ...node, status: "running" as const })))

    // Simulate execution progress
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((node, index) => ({
          ...node,
          status: index < 3 ? ("success" as const) : ("running" as const),
        })),
      )
    }, 1000)

    setTimeout(() => {
      setNodes((prev) => prev.map((node) => ({ ...node, status: "success" as const })))
    }, 2000)
  }

  return (
    <div className="flex-1 flex">
      {/* Node Palette */}
      <NodePalette onAddNode={handleAddNode} />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Controls */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Badge variant="outline" className="px-3">
                {Math.round(scale * 100)}%
              </Badge>
              <Button size="sm" variant="outline" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleResetView}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleExecuteWorkflow} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Execute Workflow
            </Button>
            <Button variant="outline">
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-gray-50 cursor-grab active:cursor-grabbing"
          onMouseDown={handleCanvasMouseDown}
          onWheel={handleWheel}
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)
            `,
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${offset.x}px ${offset.y}px`,
          }}
        >
          {/* SVG for connections */}
          <svg
            ref={svgRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              width: "100%",
              height: "100%",
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: "0 0",
            }}
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {connections.map((connection) => {
              const fromNode = nodes.find((n) => n.id === connection.from)
              const toNode = nodes.find((n) => n.id === connection.to)

              if (!fromNode || !toNode) return null

              return <ConnectionPath key={connection.id} from={fromNode} to={toNode} status={fromNode.status} />
            })}
          </svg>

          {/* Nodes */}
          <div
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: "0 0",
            }}
          >
            {nodes.map((node) => (
              <WorkflowNode
                key={node.id}
                node={node}
                selected={selectedNode === node.id}
                connecting={connecting?.from === node.id}
                onMouseDown={handleNodeMouseDown}
                onStartConnection={handleStartConnection}
                onCompleteConnection={handleCompleteConnection}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <div className="w-80 bg-white border-l">
          <Card className="h-full rounded-none border-0">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  <h3 className="font-semibold">Node Properties</h3>
                </div>

                {(() => {
                  const node = nodes.find((n) => n.id === selectedNode)
                  if (!node) return null

                  return (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Label</label>
                        <input
                          type="text"
                          value={node.label}
                          onChange={(e) =>
                            setNodes((prev) =>
                              prev.map((n) => (n.id === selectedNode ? { ...n, label: e.target.value } : n)),
                            )
                          }
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <p className="mt-1 px-3 py-2 bg-gray-50 rounded-md text-sm">{node.type}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <div className="mt-1">
                          <Badge
                            variant={
                              node.status === "success"
                                ? "default"
                                : node.status === "error"
                                  ? "destructive"
                                  : node.status === "running"
                                    ? "secondary"
                                    : "outline"
                            }
                          >
                            {node.status}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Position</label>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={Math.round(node.x)}
                            onChange={(e) =>
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === selectedNode ? { ...n, x: Number.parseInt(e.target.value) || 0 } : n,
                                ),
                              )
                            }
                            className="px-2 py-1 border rounded text-sm"
                            placeholder="X"
                          />
                          <input
                            type="number"
                            value={Math.round(node.y)}
                            onChange={(e) =>
                              setNodes((prev) =>
                                prev.map((n) =>
                                  n.id === selectedNode ? { ...n, y: Number.parseInt(e.target.value) || 0 } : n,
                                ),
                              )
                            }
                            className="px-2 py-1 border rounded text-sm"
                            placeholder="Y"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
