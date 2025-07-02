"use client"
import { useState, useEffect } from "react"
import type React from "react"

import {
  Play,
  FileText,
  Filter,
  Copy,
  CheckCircle,
  X,
  Search,
  ChevronRight,
  File,
  FileEdit,
  FilePlus2,
  FolderOpen,
  Trash2,
  Files,
  Clock,
  Server,
  Send,
  Globe,
  FileCode,
  FileJson,
  ArrowLeft,
  Database,
  FilePenLine,
  FileInput,
    FileOutput,
  ScanText,
} from "lucide-react"

import type { NodeType } from "@/services/interface"

import { Button } from "@/components/ui/button"

interface NodeTypeDefinition {
  type: NodeType
  label: string
  icon: React.ReactNode
  description: string
  category:
    | "file"
    | "general"
    | "http"
    | "xml"
    | "json"
    | "filenode"
    | "data"
    | "databaseoperations"
    | "salesforceoperations"
    | "inlineoperations"
}

const nodeTypes: NodeTypeDefinition[] = [
  {
    type: "file",
    label: "File",
    icon: <File className="h-5 w-5 text-green-600" />,
    description: "this will convert file from one to another format",
    category: "filenode",
  },
  {
    type: "start",
    label: "Start",
    icon: <Play className="h-5 w-5 text-green-600" />,
    description: "Starting point of the workflow",
    category: "general",
  },
  {
    type: "create-file",
    label: "Create File",
    icon: <FilePlus2 className="h-5 w-5 text-blue-600" />,
    description: "Creates a new file or directory",
    category: "file",
  },
  {
    type: "read-file",
    label: "Read File",
    icon: <FileText className="h-5 w-5 text-indigo-600" />,
    description: "Reads content from a file",
    category: "file",
  },
  {
    type: "write-file",
    label: "Write File",
    icon: <FileEdit className="h-5 w-5 text-purple-600" />,
    description: "Writes content to a file",
    category: "file",
  },
  {
    type: "copy-file",
    label: "Copy File",
    icon: <Copy className="h-5 w-5 text-amber-600" />,
    description: "Copies a file or directory",
    category: "file",
  },
  {
    type: "rename-file",
    label: "Rename File",
    icon: <FilePenLine className="h-5 w-5 text-orange-500" />,
    description: "Renames a file or directory",
    category: "file",
  },
  {
    type: "delete-file",
    label: "Delete File",
    icon: <Trash2 className="h-5 w-5 text-red-500" />,
    description: "Deletes a file or directory",
    category: "file",
  },
  {
    type: "move-file",
    label: "Move File",
    icon: <Files className="h-5 w-5 text-red-500" />,
    description: "Move a file or directory",
    category: "file",
  },
  {
    type: "list-files",
    label: "List Files",
    icon: <Files className="h-5 w-5 text-teal-600" />,
    description: "Lists files in a directory",
    category: "file",
  },
  {
    type: "file-poller",
    label: "File Poller",
    icon: <Clock className="h-5 w-5 text-cyan-600" />,
    description: "Monitors a file or directory for changes",
    category: "file",
  },
  // Add ReadNode to the list
  {
    type: "read-node",
    label: "Read Node",
    icon: <ScanText  className="h-5 w-5 text-blue-600" />,
    description: "Reads content from files",
    category: "file",
  },
  {
    type: "http-receiver",
    label: "HTTP Receiver",
    icon: <Server className="h-5 w-5 text-emerald-600" />,
    description: "Listens for incoming HTTP requests",
    category: "http",
  },
  {
    type: "send-http-request",
    label: "Send HTTP Request",
    icon: <Send className="h-5 w-5 text-rose-600" />,
    description: "Sends an HTTP request to an external service",
    category: "http",
  },
  {
    type: "send-http-response",
    label: "Send HTTP Response",
    icon: <Globe className="h-5 w-5 text-sky-600" />,
    description: "Sends an HTTP response back to the client",
    category: "http",
  },
  {
    type: "database",
    label: "Database",
    icon: <Database className="h-5 w-5 text-green-500" />,
    description: "Database operations with connection and write modes",
    category: "databaseoperations",
  },
  {
    type: "source",
    label: "Source",
    icon: <FileInput className="h-5 w-5 text-blue-500" />,
    description: "Load data from various source providers with schema definition",
    category: "databaseoperations",
  },
  {
    type: "xml-parser",
    label: "XML Parser",
    icon: <FileCode className="h-5 w-5 text-violet-600" />,
    description: "Parses XML content into structured data",
    category: "xml",
  },
  {
    type: "xml-render",
    label: "XML Render",
    icon: <FileJson className="h-5 w-5 text-fuchsia-600" />,
    description: "Renders data as XML format",
    category: "xml",
  },
  {
    type: "transform-xml",
    label: "Transform XML",
    icon: <Copy className="h-5 w-5 text-amber-600" />,
    description: "Transform",
    category: "xml",
  },
  {
    type: "json-parse",
    label: "JSON Parse",
    icon: <Copy className="h-5 w-5 text-amber-600" />,
    description: "Transform",
    category: "json",
  },
  {
    type: "json-render",
    label: "JSON Render",
    icon: <Copy className="h-5 w-5 text-amber-600" />,
    description: "Transform",
    category: "json",
  },
  {
    type: "transform-json",
    label: "Transform Json",
    icon: <Copy className="h-5 w-5 text-amber-600" />,
    description: "Transform",
    category: "json",
  },
  {
    type: "parse-data",
    label: "Parse Data",
    icon: <Database className="h-5 w-5 text-blue-500" />,
    description: "Parses structured data into usable format",
    category: "data",
  },
  {
    type: "render-data",
    label: "Render Data",
    icon: <Database className="h-5 w-5 text-purple-500" />,
    description: "Renders data in specified format",
    category: "data",
  },
  {
    type: "salesforce-cloud",
    label: "Salesforce Cloud",
    icon: <Database className="h-5 w-5 text-blue-500" />,
    description: "Read data from Salesforce using SOQL queries",
    category: "salesforceoperations",
  },
  {
    type: "write-salesforce",
    label: "write-salesforce",
    icon: <Database className="h-5 w-5 text-blue-500" />,
    description: "Read data from Salesforce using SOQL queries",
    category: "salesforceoperations",
  },
  {
    type: "inline-input",
    label: "Inline Input",
    icon: <FileInput className="h-5 w-5 text-blue-600" />,
    description: "Process inline data content directly",
    category: "inlineoperations",
  },
  {
    type: "inline-output",
    label: "Inline Output",
    icon: <FileOutput className="h-5 w-5 text-green-600" />,
    description: "Convert and save processed data to file",
    category: "inlineoperations",
  },
  {
    type: "end",
    label: "End",
    icon: <CheckCircle className="h-5 w-5 text-red-600" />,
    description: "End point of the workflow",
    category: "general",
  },
  {
    type: "filter",
    label: "Filter",
    icon: <Filter className="h-5 w-5 text-orange-500" />,
    description: "Filters data based on specified conditions",
    category: "data",
  },
]

// Updated to use minimal styling for a plain look without borders
const nodeTypeStyles = "hover:bg-slate-50"

interface SideModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectNodeType?: (nodeType: NodeType) => void
}

type CategoryType =
  | "main"
  | "file"
  | "general"
  | "http"
  | "xml"
  | "json"
  | "filenode"
  | "data"
  | "databaseoperations"
  | "salesforceoperations"
  | "inlineoperations"

export function SideModal({ isOpen, onClose, onSelectNodeType }: SideModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentView, setCurrentView] = useState<CategoryType>("main")

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Reset to main view when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentView("main")
      setSearchTerm("")
    }
  }, [isOpen])

  if (!isVisible && !isOpen) return null

  const handleDragStart = (e: React.DragEvent, nodeType: NodeType) => {
    e.dataTransfer.setData("nodeType", nodeType)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleSelect = (nodeType: NodeType) => {
    onSelectNodeType?.(nodeType)
    onClose()
  }

  // Filter nodes based on search term
  const filteredNodeTypes = nodeTypes.filter(
    (node) =>
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get nodes by category
  const fileOperations = filteredNodeTypes.filter((node) => node.category === "file")
  const generalOperations = filteredNodeTypes.filter((node) => node.category === "general")
  const httpOperations = filteredNodeTypes.filter((node) => node.category === "http")
  const xmlOperations = filteredNodeTypes.filter((node) => node.category === "xml")
  const jsonOperations = filteredNodeTypes.filter((node) => node.category === "json")
  const fileOperation = filteredNodeTypes.filter((node) => node.category === "filenode")
  const dataOperations = filteredNodeTypes.filter((node) => node.category === "data")
  const databaseOperations = filteredNodeTypes.filter((node) => node.category === "databaseoperations")
  const salesforceOperations = filteredNodeTypes.filter((node) => node.category === "salesforceoperations")
  const inlineOperations = filteredNodeTypes.filter((node) => node.category === "inlineoperations")

  // Search input that appears on every view
  const searchInput = (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input
        type="text"
        placeholder="Search nodes..."
        className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none bg-slate-50"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )

  // Helper function to render a list of nodes
  const renderNodeList = (nodes: NodeTypeDefinition[]) => {
    return (
      <div className="space-y-2">
        {nodes.map((nodeType) => (
          <div
            key={nodeType.type}
            className={`flex items-center gap-3 p-2 cursor-grab text-sm transition transform hover:scale-[1.01] rounded ${nodeTypeStyles}`}
            draggable
            onDragStart={(e) => handleDragStart(e, nodeType.type)}
            onClick={() => handleSelect(nodeType.type)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md shadow-sm">{nodeType.icon}</div>
            <div className="leading-tight">
              <div className="font-medium text-sm text-slate-800">{nodeType.label}</div>
              <div className="text-xs text-slate-500">{nodeType.description}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderMainView = () => {
    // Show search results directly on main view if there's a search term
    if (searchTerm.trim() !== "") {
      const allFilteredNodes = filteredNodeTypes

      if (allFilteredNodes.length === 0) {
        return (
          <>
            {searchInput}
            <div className="text-center py-8 text-slate-500">No nodes found matching "{searchTerm}"</div>
          </>
        )
      }

      // Group search results by category
      const fileResults = allFilteredNodes.filter((node) => node.category === "file")
      const httpResults = allFilteredNodes.filter((node) => node.category === "http")
      const xmlResults = allFilteredNodes.filter((node) => node.category === "xml")
      const jsonResults = allFilteredNodes.filter((node) => node.category === "json")
      const generalResults = allFilteredNodes.filter((node) => node.category === "general")
      const fileOperation = allFilteredNodes.filter((node) => node.category === "filenode")
      const dataResults = allFilteredNodes.filter((node) => node.category === "data")
      const databaseResults = allFilteredNodes.filter((node) => node.category === "databaseoperations")
      const salesforceResults = allFilteredNodes.filter((node) => node.category === "salesforceoperations")
      const inlineResults = allFilteredNodes.filter((node) => node.category === "inlineoperations")

      return (
        <>
          {searchInput}
          <div className="space-y-4">
            {fileOperation.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-slate-600 flex items-center gap-2">
                  <Play className="h-4 w-4 text-green-500" />
                  File Operation
                </h3>
                {renderNodeList(fileOperation)}
              </div>
            )}

            {generalResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-slate-600 flex items-center gap-2">
                  <Play className="h-4 w-4 text-green-500" />
                  Workflow Controls
                </h3>
                {renderNodeList(generalResults)}
              </div>
            )}

            {fileResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-slate-600 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-blue-500" />
                  File Operations
                </h3>
                {renderNodeList(fileResults)}
              </div>
            )}

            {httpResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-slate-600 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-500" />
                  HTTP Operations
                </h3>
                {renderNodeList(httpResults)}
              </div>
            )}

            {xmlResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-slate-600 flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-violet-500" />
                  XML Operations
                </h3>
                {renderNodeList(xmlResults)}
              </div>
            )}

            {jsonResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-slate-600 flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-violet-500" />
                  JSON Operations
                </h3>
                {renderNodeList(jsonResults)}
              </div>
            )}

            {databaseResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-slate-600 flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-500" />
                  Database Operations
                </h3>
                {renderNodeList(databaseResults)}
              </div>
            )}

            {dataResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-slate-600 flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  Data Operations
                </h3>
                {renderNodeList(dataResults)}
              </div>
            )}

            {salesforceResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-slate-600 flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  Salesforce Operations
                </h3>
                {renderNodeList(salesforceResults)}
              </div>
            )}

            {inlineResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-slate-600 flex items-center gap-2">
                  <FileInput className="h-4 w-4 text-blue-600" />
                  Inline Operations
                </h3>
                {renderNodeList(inlineResults)}
              </div>
            )}
          </div>
        </>
      )
    }

    // Default main view with category cards - simplified with no borders or backgrounds
    return (
      <>
        {searchInput}
        <div className="grid gap-3">
          {/* General Operations Card */}
          <div
            className="cursor-pointer hover:bg-slate-50 py-2 px-3 rounded-md"
            onClick={() => setCurrentView("general")}
          >
            <div className="w-full flex justify-between items-center text-sm font-medium text-slate-700">
              <div className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Workflow Controls</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* File Operations Card */}
          <div className="cursor-pointer hover:bg-slate-50 py-2 px-3 rounded-md" onClick={() => setCurrentView("file")}>
            <div className="w-full flex justify-between items-center text-sm font-medium text-slate-700">
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">File Operations</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* HTTP Operations Card */}
          <div className="cursor-pointer hover:bg-slate-50 py-2 px-3 rounded-md" onClick={() => setCurrentView("http")}>
            <div className="w-full flex justify-between items-center text-sm font-medium text-slate-700">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-emerald-500" />
                <span className="font-semibold">HTTP Operations</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* XML Operations Card */}
          <div className="cursor-pointer hover:bg-slate-50 py-2 px-3 rounded-md" onClick={() => setCurrentView("xml")}>
            <div className="w-full flex justify-between items-center text-sm font-medium text-slate-700">
              <div className="flex items-center space-x-2">
                <FileCode className="h-5 w-5 text-violet-500" />
                <span className="font-semibold">XML Operations</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* JSON Operations Card */}
          <div className="cursor-pointer hover:bg-slate-50 py-2 px-3 rounded-md" onClick={() => setCurrentView("json")}>
            <div className="w-full flex justify-between items-center text-sm font-medium text-slate-700">
              <div className="flex items-center space-x-2">
                <FileCode className="h-5 w-5 text-violet-500" />
                <span className="font-semibold">JSON Operations</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Database Operations Card */}
          <div
            className="cursor-pointer hover:bg-slate-50 py-2 px-3 rounded-md"
            onClick={() => setCurrentView("databaseoperations")}
          >
            <div className="w-full flex justify-between items-center text-sm font-medium text-slate-700">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Database Operations</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Data Operations Card */}
          <div className="cursor-pointer hover:bg-slate-50 py-2 px-3 rounded-md" onClick={() => setCurrentView("data")}>
            <div className="w-full flex justify-between items-center text-sm font-medium text-slate-700">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Data Operations</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* File Operation Card */}
          <div
            className="cursor-pointer hover:bg-slate-50 py-2 px-3 rounded-md"
            onClick={() => setCurrentView("filenode")}
          >
            <div className="w-full flex justify-between items-center text-sm font-medium text-slate-700">
              <div className="flex items-center space-x-2">
                <FileCode className="h-5 w-5 text-violet-500" />
                <span className="font-semibold">File Operation</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Salesforce Operations Card */}
          <div
            className="cursor-pointer hover:bg-slate-50 py-2 px-3 rounded-md"
            onClick={() => setCurrentView("salesforceoperations")}
          >
            <div className="w-full flex justify-between items-center text-sm font-medium text-slate-700">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Salesforce Operations</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Inline Operations Card */}
          <div
            className="cursor-pointer hover:bg-slate-50 py-2 px-3 rounded-md"
            onClick={() => setCurrentView("inlineoperations")}
          >
            <div className="w-full flex justify-between items-center text-sm font-medium text-slate-700">
              <div className="flex items-center space-x-2">
                <FileInput className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Inline Operations</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
          </div>
        </div>
      </>
    )
  }

  const renderCategoryView = (
    category:
      | "file"
      | "general"
      | "http"
      | "xml"
      | "json"
      | "filenode"
      | "data"
      | "databaseoperations"
      | "salesforceoperations"
      | "inlineoperations",
    title: string,
    icon: React.ReactNode,
  ) => {
    const operations = filteredNodeTypes.filter((node) => node.category === category)

    return (
      <>
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentView("main")}
            className="mr-2 hover:bg-slate-200 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="font-semibold text-slate-800">{title}</h3>
          </div>
        </div>

        {searchInput}

        {operations.length > 0 ? (
          renderNodeList(operations)
        ) : (
          <div className="text-center py-8 text-slate-500">No nodes found matching "{searchTerm}"</div>
        )}
      </>
    )
  }

  // Content based on current view
  const renderContent = () => {
    switch (currentView) {
      case "file":
        return renderCategoryView("file", "File Operations", <FolderOpen className="h-5 w-5 text-blue-500" />)
      case "http":
        return renderCategoryView("http", "HTTP Operations", <Globe className="h-5 w-5 text-emerald-500" />)
      case "xml":
        return renderCategoryView("xml", "XML Operations", <FileCode className="h-5 w-5 text-violet-500" />)
      case "json":
        return renderCategoryView("json", "JSON Operations", <FileCode className="h-5 w-5 text-violet-500" />)
      case "data":
        return renderCategoryView("data", "Data Operations", <Database className="h-5 w-5 text-blue-500" />)
      case "databaseoperations":
        return renderCategoryView(
          "databaseoperations",
          "Database Operations",
          <Database className="h-5 w-5 text-green-500" />,
        )
      case "salesforceoperations":
        return renderCategoryView(
          "salesforceoperations",
          "Salesforce Operations",
          <Database className="h-5 w-5 text-blue-500" />,
        )
      case "filenode":
        return renderCategoryView("filenode", "File Operation", <File className="h-5 w-5 text-violet-500" />)
      case "general":
        return renderCategoryView("general", "Workflow Controls", <Play className="h-5 w-5 text-green-500" />)
      case "inlineoperations":
        return renderCategoryView(
          "inlineoperations",
          "Inline Operations",
          <FileInput className="h-5 w-5 text-blue-600" />,
        )
      default:
        return renderMainView()
    }
  }

  return (
    <div
      className="fixed top-0 right-0 h-full bg-white shadow-lg z-50 overflow-y-auto border-l border-slate-200"
      style={{
        width: "340px",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800">Add Node</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-200 rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">{renderContent()}</div>
    </div>
  )
}
