
"use client"

import type React from "react"
import { useState } from "react"
import {
  PlayIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClipboardIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PauseCircleIcon,
} from '@heroicons/react/24/outline';


// import { Play, FileText, FileInput, FileOutput, Copy, CheckCircle, ChevronRight, ChevronDown } from "lucide-react"
import type { NodeType } from "./workflow-context"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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
    icon: <PlayIcon className="h-4 w-4 " />,    
    description: "Starting point of the workflow",
  },
  {
    type: "create-file",
    label: "Create File",
    icon: <DocumentTextIcon className="h-4 w-4" />,
    description: "Creates a new file or directory",
  },
  {
    type: "read-file",
    label: "Read File",
    icon: <ClipboardIcon className="h-4 w-4" />,
    description: "Reads content from a file",
  },
  {
    type: "write-file",
    label: "Write File",
    icon: <ClipboardIcon className="h-4 w-4" />,
    description: "Writes content to a file",
  },
  {
    type: "copy-file",
    label: "Copy File",
    icon: <ClipboardIcon className="h-4 w-4" />,
    description: "Copies a file or directory",
  },
  {
    type: "end",
    label: "End",
    icon: <PauseCircleIcon className="h-4 w-4" />,
    description: "End point of the workflow",
  },
  // {
  //   type: "code",
  //   label: "Code",
  //   icon: <ClipboardIcon className="h-4 w-4" />,
  //   description: "Represents a code operation",
  // },
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

export function NodePalette() {
  const [isOpen, setIsOpen] = useState(true)

  const handleDragStart = (e: React.DragEvent, nodeType: NodeType) => {
    e.dataTransfer.setData("nodeType", nodeType)
    e.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="w-64 border-r bg-background">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Node Palette</h2>
        <p className="text-sm text-muted-foreground">Drag nodes to the canvas</p>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex w-full justify-between p-4">
            <span>File Operations</span>
            {isOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {/* <div className="space-y-1 p-2">
            {nodeTypes.map((nodeType) => (
              <div
                key={nodeType.type}
                className={`flex items-center gap-3 rounded-md border p-3 hover:shadow-md cursor-grab ${
                  nodeTypeStyles[nodeType.type] || "border-gray-300 bg-background"
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, nodeType.type)}
              >
                <div className="flex h-8 w-8 text-grey-400 items-center justify-center rounded-md border bg-white">
                  {nodeType.icon}
                </div>
                <div>
                  <div className="font-medium">{nodeType.label}</div>
                  <div className="text-xs text-muted-foreground">{nodeType.description}</div>
                </div>
              </div>
            ))}
          </div> */}
          <div className="space-y-1 p-2">
  {nodeTypes.map((nodeType) => (
    <div
      key={nodeType.type}
      className={`flex items-center gap-2 rounded-lg border p-2 hover:shadow cursor-grab text-sm ${
        nodeTypeStyles[nodeType.type] || "border-gray-300 bg-background"
      }`}
      draggable
      onDragStart={(e) => handleDragStart(e, nodeType.type)}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-md border bg-white">
        {nodeType.icon}
      </div>
      <div className="leading-tight">
        <div className="font-medium text-sm">{nodeType.label}</div>
        <div className="text-xs text-muted-foreground">{nodeType.description}</div>
      </div>
    </div>
  ))}
</div>

        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
