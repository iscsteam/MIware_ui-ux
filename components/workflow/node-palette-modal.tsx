"use client"

import type React from "react"
import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Play,
  FileText,
  FileInput,
  FileOutput,
  Copy,
  CheckCircle,
} from "lucide-react"
import type { NodeType } from "./workflow-context"

interface NodeTypeDefinition {
  type: NodeType
  label: string
  icon: React.ReactNode
  description: string
}

const nodeTypes: NodeTypeDefinition[] = [
  {
    type: "start",
    label: "Start",
    icon: <Play className="h-4 w-4" />,
    description: "Starting point of the workflow",
  },
  {
    type: "create-file",
    label: "Create File",
    icon: <FileText className="h-4 w-4" />,
    description: "Creates a new file or directory",
  },
  {
    type: "read-file",
    label: "Read File",
    icon: <FileInput className="h-4 w-4" />,
    description: "Reads content from a file",
  },
  {
    type: "write-file",
    label: "Write File",
    icon: <FileOutput className="h-4 w-4" />,
    description: "Writes content to a file",
  },
  {
    type: "copy-file",
    label: "Copy File",
    icon: <Copy className="h-4 w-4" />,
    description: "Copies a file or directory",
  },
  {
    type: "end",
    label: "End",
    icon: <CheckCircle className="h-4 w-4" />,
    description: "End point of the workflow",
  },
]

interface NodePaletteModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectNodeType: (nodeType: NodeType) => void
}

export function NodePaletteModal({
  isOpen,
  onClose,
  onSelectNodeType,
}: NodePaletteModalProps) {
  const [selectedNode, setSelectedNode] = useState<NodeTypeDefinition | null>(null)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Node</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {nodeTypes.map((nodeType) => (
              <div
                key={nodeType.type}
                className="flex items-center gap-3 rounded-md border border-transparent bg-background p-3 hover:border-border hover:bg-accent cursor-pointer"
                onClick={() => setSelectedNode(nodeType)}
                onDoubleClick={() => onSelectNodeType(nodeType.type)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background">
                  {nodeType.icon}
                </div>
                <div>
                  <div className="font-medium">{nodeType.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {nodeType.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal for node properties */}
      
    </>
  )
}
