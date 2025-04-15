"use client"
import type React from "react"
import { useState, useRef } from "react"
import { Play, Power, Trash2, MoreHorizontal, CheckCircle, XCircle, Loader2 } from "lucide-react"

import { type WorkflowNode, useWorkflow } from "./workflow-context"
import { getNodeIcon } from "./node-utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface NodeComponentProps {
  node: WorkflowNode
  selected: boolean
  onSelect: () => void
  onDragStart: (nodeId: string, e: React.MouseEvent) => void
  onExecuteNode: (nodeId: string) => void
}

export function NodeComponent({ node, selected, onSelect, onDragStart, onExecuteNode }: NodeComponentProps) {
  const {
    removeNode,
    pendingConnection,
    setPendingConnection,
    addConnection,
    updateNode,
    nodes,
    connections,
  } = useWorkflow()

  const [isExpanded, setIsExpanded] = useState(false)
  const [isFilenameDialogOpen, setIsFilenameDialogOpen] = useState(false)
  const [tempFilename, setTempFilename] = useState(node.data?.filename || "")
  const nodeRef = useRef<HTMLDivElement>(null)

  const getStatusColor = () => {
    switch (node.status) {
      case "running":
        return "bg-yellow-500"
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-300"
    }
  }

  const handleOutputPortClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPendingConnection({ sourceId: node.id })
  }

  const handleInputPortClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (pendingConnection) {
      if (pendingConnection.sourceId !== node.id) {
        addConnection(pendingConnection.sourceId, node.id)
      }
      setPendingConnection(null)
    }
  }

  const handleDeactivateNode = (e: React.MouseEvent) => {
    e.stopPropagation()
    const isCurrentlyActive = node.data?.active !== false
    updateNode(node.id, {
      data: {
        ...node.data,
        active: !isCurrentlyActive,
      },
    })

    if (isCurrentlyActive) {
      const incomingConnections = connections.filter((conn) => conn.targetId === node.id)
      const outgoingConnections = connections.filter((conn) => conn.sourceId === node.id)

      incomingConnections.forEach((incoming) => {
        outgoingConnections.forEach((outgoing) => {
          addConnection(incoming.sourceId, outgoing.targetId)
        })
      })
    }
  }

  const handleDeleteWithRerouting = (e: React.MouseEvent) => {
    e.stopPropagation()

    const incomingConnections = connections.filter((conn) => conn.targetId === node.id)
    const outgoingConnections = connections.filter((conn) => conn.sourceId === node.id)

    incomingConnections.forEach((incoming) => {
      outgoingConnections.forEach((outgoing) => {
        addConnection(incoming.sourceId, outgoing.targetId)
      })
    })

    removeNode(node.id)
  }

  const getNodeLabel = () => {
    return node.type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getNodeBackgroundColor = () => {
    if (node.type === "start") return "bg-green-500"
    if (node.type === "end") return "bg-red-400"
    return "bg-white"
  }

  const handleFilenameClick = (e: React.MouseEvent) => {
    if (node.type !== "start" && node.type !== "end") {
      e.stopPropagation()
      setTempFilename(node.data?.filename || "")
      setIsFilenameDialogOpen(true)
    }
  }

  const handleSaveFilename = () => {
    updateNode(node.id, {
      data: {
        ...node.data,
        filename: tempFilename,
      },
    })
    setIsFilenameDialogOpen(false)
  }

  return (
    <>
      <div className="absolute group" style={{ left: node.position.x, top: node.position.y }}>
        {/* Node action buttons */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-[100px] flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex bg-gray-200 rounded-md shadow-lg">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="node-action h-8 w-8 rounded-l-md bg-gray-200 hover:bg-gray-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      onExecuteNode(node.id)
                    }}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Execute node</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="node-action h-8 w-8 bg-gray-200 hover:bg-gray-300"
                    onClick={handleDeactivateNode}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{node.data?.active === false ? "Activate node" : "Deactivate node"}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="node-action h-8 w-8 bg-gray-200 hover:bg-gray-300"
                    onClick={handleDeleteWithRerouting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete node</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="node-action h-8 w-8 rounded-r-md bg-gray-200 hover:bg-gray-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsExpanded(!isExpanded)
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>More options</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Node body */}
        <div
          ref={nodeRef}
          className={`flex flex-col rounded-md border ${
            selected ? "border-green-500" : "border-gray-300"
          } ${getNodeBackgroundColor()} shadow-2xl transition-all w-[100px] h-[100px] ${
            pendingConnection && pendingConnection.sourceId === node.id ? "border-blue-500" : ""
          } ${node.data?.active === false ? "opacity-50" : ""}`}
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          onMouseDown={(e) => {
            const target = e.target as HTMLElement
            if (e.button === 0 && !target.closest(".port") && !target.closest(".node-action")) {
              onDragStart(node.id, e)
            }
          }}
        >
          <div className="text-center text-sm font-medium border-b p-1 bg-gray-100 rounded-t-md">
            {node.data?.label || getNodeLabel()}
          </div>

          <div className="flex flex-1 items-center justify-center p-2">
            <div className="flex h-12 w-12 items-center justify-center text-zinc-600">{getNodeIcon(node.type)}</div>
            {node.status !== "idle" && (
              <div className="absolute top-2 right-0">
                {node.status === "success" && <CheckCircle className="h-3 w-3 text-green-500" />}
                {node.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                {node.status === "running" && <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />}
              </div>
            )}
          </div>
        </div>

        {/* Filename display */}
        {node.type !== "start" && node.type !== "end" && (
          <div
            className="text-center text-sm mt-1 cursor-pointer hover:text-blue-500"
            onClick={handleFilenameClick}
          >
            {node.data?.filename || "Filename"}
          </div>
        )}

        {/* Output port */}
        {node.type !== "end" && (
          <div
            className={`port absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full border-2 border-background bg-gray-400 hover:bg-primary hover:scale-110 transition-transform ${
              pendingConnection && pendingConnection.sourceId === node.id
                ? "ring-2 ring-blue-500 scale-125 bg-primary"
                : ""
            }`}
            onClick={handleOutputPortClick}
            title="Click to start connection"
            style={{ top: "50px" }}
          />
        )}

        {/* Input port */}
        {node.type !== "start" && (
          <div
            className={`port absolute left-0 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-background bg-gray-400 hover:bg-primary hover:scale-110 transition-transform ${
              pendingConnection && pendingConnection.sourceId !== node.id
                ? "ring-2 ring-blue-500 animate-pulse"
                : ""
            }`}
            onClick={handleInputPortClick}
            title={pendingConnection ? "Click to complete connection" : "Input port"}
            style={{ top: "50px" }}
          />
        )}
      </div>

      {/* Filename Dialog */}
      <Dialog open={isFilenameDialogOpen} onOpenChange={setIsFilenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Filename</DialogTitle>
          </DialogHeader>
          <Input
            value={tempFilename}
            onChange={(e) => setTempFilename(e.target.value)}
            placeholder="Enter filename"
          />
          <DialogFooter>
            <Button onClick={handleSaveFilename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
