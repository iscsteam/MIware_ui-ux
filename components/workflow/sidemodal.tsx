//sidemodal.tsx
"use client"
import { useState, useEffect } from "react"
import {Play, FileText, FileInput, FileOutput, Copy, CheckCircle, X, Search, ChevronDown, ChevronRight, FolderPlus, File, FileEdit, FilePlus2, FolderOpen, Trash2, Files, Clock, Server, Send, Globe, FileCode, FileJson} from "lucide-react"
import type { NodeType } from "./workflow-context"
import { Button } from "@/components/ui/button"

interface NodeTypeDefinition {
  type: NodeType
  label: string
  icon: React.ReactNode
  description: string
  category: "file" | "general" | "http" | "xml"
}

const nodeTypes: NodeTypeDefinition[] = [
  {
    type: "start",
    label: "Start",
    icon: <Play className="h-5 w-5 text-green-600" />,
    description: "Starting point of the workflow",
    category: "general"
  },
  {
    type: "create-file",
    label: "Create File",
    icon: <FilePlus2 className="h-5 w-5 text-blue-600" />,
    description: "Creates a new file or directory",
    category: "file"
  },
  {
    type: "read-file",
    label: "Read File",
    icon: <FileText className="h-5 w-5 text-indigo-600" />,
    description: "Reads content from a file",
    category: "file"
  },
  {
    type: "write-file",
    label: "Write File",
    icon: <FileEdit className="h-5 w-5 text-purple-600" />,
    description: "Writes content to a file",
    category: "file"
  },
  {
    type: "copy-file",
    label: "Copy File",
    icon: <Copy className="h-5 w-5 text-amber-600" />,
    description: "Copies a file or directory",
    category: "file"
  },
  {
    type: "delete-file",
    label: "Delete File",
    icon: <Trash2 className="h-5 w-5 text-red-500" />,
    description: "Deletes a file or directory",
    category: "file"
  },
  {
    type: "list-files",
    label: "List Files",
    icon: <Files className="h-5 w-5 text-teal-600" />,
    description: "Lists files in a directory",
    category: "file"
  },
  {
    type: "file-poller",
    label: "File Poller",
    icon: <Clock className="h-5 w-5 text-cyan-600" />,
    description: "Monitors a file or directory for changes",
    category: "file"
  },
  {
    type: "http-receiver",
    label: "HTTP Receiver",
    icon: <Server className="h-5 w-5 text-emerald-600" />,
    description: "Listens for incoming HTTP requests",
    category: "http"
  },
  {
    type: "send-http-request",
    label: "Send HTTP Request",
    icon: <Send className="h-5 w-5 text-rose-600" />,
    description: "Sends an HTTP request to an external service",
    category: "http"
  },
  {
    type: "send-http-response",
    label: "Send HTTP Response",
    icon: <Globe className="h-5 w-5 text-sky-600" />,
    description: "Sends an HTTP response back to the client",
    category: "http"
  },
  {
    type: "xml-parser",
    label: "XML Parser",
    icon: <FileCode className="h-5 w-5 text-violet-600" />,
    description: "Parses XML content into structured data",
    category: "xml"
  },
  {
    type: "xml-render",
    label: "XML Render",
    icon: <FileJson className="h-5 w-5 text-fuchsia-600" />,
    description: "Renders data as XML format",
    category: "xml"
  },
  {
    type: "end",
    label: "End",
    icon: <CheckCircle className="h-5 w-5 text-red-600" />,
    description: "End point of the workflow",
    category: "general"
  },
]

const nodeTypeStyles: Record<NodeType, string> = {
  start: "border-green-400 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200",
  "create-file": "border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200",
  "read-file": "border-indigo-400 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200",
  "write-file": "border-purple-400 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200",
  "copy-file": "border-amber-400 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200",
  "delete-file": "border-red-400 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200",
  "list-files": "border-teal-400 bg-gradient-to-r from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200",
  "file-poller": "border-cyan-400 bg-gradient-to-r from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200",
  "http-receiver": "border-emerald-400 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200",
  "send-http-request": "border-rose-400 bg-gradient-to-r from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200",
  "send-http-response": "border-sky-400 bg-gradient-to-r from-sky-50 to-sky-100 hover:from-sky-100 hover:to-sky-200",
  "xml-parser": "border-violet-400 bg-gradient-to-r from-violet-50 to-violet-100 hover:from-violet-100 hover:to-violet-200",
  "xml-render": "border-fuchsia-400 bg-gradient-to-r from-fuchsia-50 to-fuchsia-100 hover:from-fuchsia-100 hover:to-fuchsia-200",
  end: "border-red-400 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200",
  code: "border-gray-400 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200",
}

interface SideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNodeType?: (nodeType: NodeType) => void;
}

export function SideModal({ isOpen, onClose, onSelectNodeType }: SideModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFileOpsOpen, setIsFileOpsOpen] = useState(false);
  const [isGeneralOpsOpen, setIsGeneralOpsOpen] = useState(false);
  const [isHttpOpsOpen, setIsHttpOpsOpen] = useState(false);
  const [isXmlOpsOpen, setIsXmlOpsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const handleDragStart = (e: React.DragEvent, nodeType: NodeType) => {
    e.dataTransfer.setData("nodeType", nodeType);
    e.dataTransfer.effectAllowed = "move";
  }

  const handleSelect = (nodeType: NodeType) => {
    onSelectNodeType?.(nodeType);
    onClose();
  }

  const filteredNodeTypes = nodeTypes.filter(node =>
    node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fileOperations = filteredNodeTypes.filter(node => node.category === "file");
  const generalOperations = filteredNodeTypes.filter(node => node.category === "general");
  const httpOperations = filteredNodeTypes.filter(node => node.category === "http");
  const xmlOperations = filteredNodeTypes.filter(node => node.category === "xml");

  return (
    <div
      className="fixed top-0 right-0 h-full bg-white shadow-lg z-50 overflow-y-auto border-l border-slate-200"
      style={{
        width: "340px",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease-in-out"
      }}
    >
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800">Add Node</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-200 rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none bg-slate-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* File Operations Section */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => setIsFileOpsOpen(!isFileOpsOpen)}
            className="w-full flex justify-between items-center text-sm font-medium text-slate-700 py-3 px-4 hover:bg-slate-50 bg-slate-100 transition"
          >
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">File Operations</span>
            </div>
            {isFileOpsOpen ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {isFileOpsOpen && (
            <div className="mt-1 p-3 space-y-2 bg-white">
              {fileOperations.map((nodeType) => (
                <div
                  key={nodeType.type}
                  className={`flex items-center gap-3 rounded-lg border p-1 hover:shadow-md cursor-grab text-sm transition transform hover:scale-[1.01] ${
                    nodeTypeStyles[nodeType.type] || "border-gray-300 bg-background"
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, nodeType.type)}
                  onClick={() => handleSelect(nodeType.type)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-white shadow-sm">
                    {nodeType.icon}
                  </div>
                  <div className="leading-tight">
                    <div className="font-medium text-sm">{nodeType.label}</div>
                    <div className="text-xs text-slate-500">{nodeType.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HTTP Operations Section */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => setIsHttpOpsOpen(!isHttpOpsOpen)}
            className="w-full flex justify-between items-center text-sm font-medium text-slate-700 py-3 px-4 hover:bg-slate-50 bg-slate-100 transition"
          >
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-emerald-500" />
              <span className="font-semibold">HTTP Operations</span>
            </div>
            {isHttpOpsOpen ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {isHttpOpsOpen && (
            <div className="mt-1 p-3 space-y-2 bg-white">
              {httpOperations.map((nodeType) => (
                <div
                  key={nodeType.type}
                  className={`flex items-center gap-3 rounded-lg border p-1 hover:shadow-md cursor-grab text-sm transition transform hover:scale-[1.01] ${
                    nodeTypeStyles[nodeType.type] || "border-gray-300 bg-background"
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, nodeType.type)}
                  onClick={() => handleSelect(nodeType.type)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-white shadow-sm">
                    {nodeType.icon}
                  </div>
                  <div className="leading-tight">
                    <div className="font-medium text-sm">{nodeType.label}</div>
                    <div className="text-xs text-slate-500">{nodeType.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* XML Operations Section */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => setIsXmlOpsOpen(!isXmlOpsOpen)}
            className="w-full flex justify-between items-center text-sm font-medium text-slate-700 py-3 px-4 hover:bg-slate-50 bg-slate-100 transition"
          >
            <div className="flex items-center space-x-2">
              <FileCode className="h-5 w-5 text-violet-500" />
              <span className="font-semibold">XML Operations</span>
            </div>
            {isXmlOpsOpen ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {isXmlOpsOpen && (
            <div className="mt-1 p-3 space-y-2 bg-white">
              {xmlOperations.map((nodeType) => (
                <div
                  key={nodeType.type}
                  className={`flex items-center gap-3 rounded-lg border p-1 hover:shadow-md cursor-grab text-sm transition transform hover:scale-[1.01] ${
                    nodeTypeStyles[nodeType.type] || "border-gray-300 bg-background"
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, nodeType.type)}
                  onClick={() => handleSelect(nodeType.type)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-white shadow-sm">
                    {nodeType.icon}
                  </div>
                  <div className="leading-tight">
                    <div className="font-medium text-sm">{nodeType.label}</div>
                    <div className="text-xs text-slate-500">{nodeType.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* General Operations Section */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => setIsGeneralOpsOpen(!isGeneralOpsOpen)}
            className="w-full flex justify-between items-center text-sm font-medium text-slate-700 py-3 px-4 hover:bg-slate-50 bg-slate-100 transition"
          >
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Workflow Controls</span>
            </div>
            {isGeneralOpsOpen ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {isGeneralOpsOpen && (
            <div className="mt-1 p-3 space-y-2 bg-white">
              {generalOperations.map((nodeType) => (
                <div
                  key={nodeType.type}
                  className={`flex items-center gap-3 rounded-lg border p-1 hover:shadow-md cursor-grab text-sm transition transform hover:scale-[1.01] ${
                    nodeTypeStyles[nodeType.type] || "border-gray-300 bg-background"
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, nodeType.type)}
                  onClick={() => handleSelect(nodeType.type)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-white shadow-sm">
                    {nodeType.icon}
                  </div>
                  <div className="leading-tight">
                    <div className="font-medium text-sm">{nodeType.label}</div>
                    <div className="text-xs text-slate-500">{nodeType.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}