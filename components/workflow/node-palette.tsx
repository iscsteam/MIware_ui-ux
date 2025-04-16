// // //node-plaette.jsx(sidebar.jsx)
"use client"

import type React from "react"
import { useState } from "react"
import { Plus, Play, FileText, FileInput, FileOutput, Copy, CheckCircle, ChevronRight, ChevronDown, HelpCircle } from "lucide-react"
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
    type: "START",
    label: "Start",
    icon: <PlayIcon className="h-4 w-4" />,
    description: "Starting point of the workflow",
  },
  {
    type: "CREATE",
    label: "Create File",
    icon: <FileText className="h-4 w-4" />,
    description: "Creates a new file or directory",
  },
  {
    type: "READ",
    label: "Read File",
    icon: <FileInput className="h-4 w-4" />,
    description: "Reads content from a file",
  },
  {
    type: "WRITE",
    label: "Write File",
    icon: <FileOutput className="h-4 w-4" />,
    description: "Writes content to a file",
  },
  {
    type: "COPY",
    label: "Copy File",
    icon: <Copy className="h-4 w-4" />,
    description: "Copies a file or directory",
  },
  {
    type: "END",
    label: "End",
    icon: <PauseCircleIcon className="h-4 w-4" />,
    description: "End point of the workflow",
  },
]

// Define custom colors for each node type
const nodeTypeStyles: Record<NodeType, string> = {
  START: "border-green-400 bg-green-50",
  "CREATE": "border-blue-400 bg-blue-50",
  "READ": "border-indigo-400 bg-indigo-50",
  "WRITE": "border-purple-400 bg-purple-50",
  "COPY": "border-yellow-400 bg-yellow-50",
  END: "border-red-400 bg-red-50",
  // CODE: "border-gray-400 bg-gray-50",
}

export function NodePalette() {
  const [isOpen, setIsOpen] = useState(true)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const handleDragStart = (e: React.DragEvent, nodeType: NodeType) => {
    e.dataTransfer.setData("nodeType", nodeType)
    e.dataTransfer.effectAllowed = "move"
  }

  return (
    <div className="w-64 border-r bg-background flex flex-col h-full shadow-sm">
      {/* MI-WARE logo and plus button in sidebar header */}
      <div className="flex items-center justify-between p-4 border-b">
       {/* <Button variant="default" className="text-black-500 bg-white-500 hover:none rounded-md flex items-center gap-2"> */}
          <h1 className="font-bold text-lg" >MI-WARE</h1>
        {/* </Button> */}
        
        <Button variant="ghost" size="sm" className="hover:bg-gray-100">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-grow overflow-y-auto">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between p-4 hover:bg-gray-100">
              <span className="font-medium">File Operations</span>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 p-2">
              {nodeTypes.map((nodeType) => (
                <div
                  key={nodeType.type}
                  className={`flex items-center gap-2 rounded-md border p-2 hover:shadow-md cursor-grab text-sm transition-all ${
                    nodeTypeStyles[nodeType.type] || "border-gray-300 bg-background"
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, nodeType.type)}
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
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Help button at the bottom of sidebar, styled to match the image you shared */}
      <div className="border-t mt-auto">
        <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                <span className="font-normal">Help</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isHelpOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 py-2 text-sm text-gray-600 space-y-2">
              <Button variant="ghost" className="w-full justify-start text-left pl-7 py-1.5 hover:bg-gray-100">Documentation</Button>
              <Button variant="ghost" className="w-full justify-start text-left pl-7 py-1.5 hover:bg-gray-100">Tutorials</Button>
              <Button variant="ghost" className="w-full justify-start text-left pl-7 py-1.5 hover:bg-gray-100">Support</Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}