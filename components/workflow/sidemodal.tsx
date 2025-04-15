// // sidemodal.tsx
"use client"

import { useState, useEffect } from "react"
import { Play, FileText, FileInput, FileOutput, Copy, CheckCircle, X } from "lucide-react"
import type { NodeType } from "./workflow-context"
import { Button } from "@/components/ui/button"

interface NodeTypeDefinition {
  type: NodeType
  label: string
  icon: React.ReactNode
  description: string
}

// Define node types with icons and descriptions
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

// Define custom colors for each node type
const nodeTypeStyles: Record<NodeType, string> = {
  start: "border-green-400 bg-green-50",
  "create-file": "border-blue-400 bg-blue-50",
  "read-file": "border-indigo-400 bg-indigo-50",
  "write-file": "border-purple-400 bg-purple-50",
  "copy-file": "border-yellow-400 bg-yellow-50",
  end: "border-red-400 bg-red-50",
  code: "border-gray-400 bg-gray-50",
}

interface SideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNodeType?: (nodeType: NodeType) => void;
}

export function SideModal({ isOpen, onClose, onSelectNodeType }: SideModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Handle opening and closing animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  if (!isVisible && !isOpen) {
    return null;
  }

  const handleDragStart = (e: React.DragEvent, nodeType: NodeType) => {
    e.dataTransfer.setData("nodeType", nodeType);
    e.dataTransfer.effectAllowed = "move";
  }

  const handleSelect = (nodeType: NodeType) => {
    if (onSelectNodeType) {
      onSelectNodeType(nodeType);
    }
    onClose();
  }

  return (
    <div 
      className="fixed top-0 right-0 h-full bg-white shadow-lg z-50 overflow-y-auto"
      style={{
        width: "320px",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease-in-out"
      }}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium">Add Node</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="text-sm font-medium">File Operations</div>
        <div className="space-y-2">
          {nodeTypes.map((nodeType) => (
            <div
              key={nodeType.type}
              className={`flex items-center gap-2 rounded-md border p-2 hover:shadow-md cursor-grab text-sm transition-all ${
                nodeTypeStyles[nodeType.type] || "border-gray-300 bg-background"
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, nodeType.type)}
              onClick={() => handleSelect(nodeType.type)}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md border bg-white shadow-sm">
                {nodeType.icon}
              </div>
              <div className="leading-tight">
                <div className="font-medium text-sm">{nodeType.label}</div>
                <div className="text-xs text-muted-foreground">{nodeType.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}