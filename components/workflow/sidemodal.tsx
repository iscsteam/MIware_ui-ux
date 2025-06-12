"use client";
import { useState, useEffect } from "react";
import type React from "react";

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
} from "lucide-react";

import type { NodeType } from "@/services/interface";

import { Button } from "@/components/ui/button";

interface NodeTypeDefinition {
  type: NodeType;
  label: string;
  icon: React.ReactNode;
  description: string;
  category:
    | "file"
    | "general"
    | "http"
    | "xml"
    | "json"
    | "filenode"
    | "data"
    | "databaseoperations"
    | "salesforceoperations";
}

const nodeTypes: NodeTypeDefinition[] = [
  {
    type: "file",
    label: "File",
    icon: <File className="h-4 w-4 text-white" />,
    description: "this will convert file from one to another format",
    category: "filenode",
  },
  {
    type: "start",
    label: "Start",
    icon: <Play className="h-4 w-4 text-white" />,
    description: "Starting point of the workflow",
    category: "general",
  },
  {
    type: "create-file",
    label: "Create File",
    icon: <FilePlus2 className="h-4 w-4 text-white" />,
    description: "Creates a new file or directory",
    category: "file",
  },
  {
    type: "read-file",
    label: "Read File",
    icon: <FileText className="h-4 w-4 text-white" />,
    description: "Reads content from a file",
    category: "file",
  },
  {
    type: "write-file",
    label: "Write File",
    icon: <FileEdit className="h-4 w-4 text-white" />,
    description: "Writes content to a file",
    category: "file",
  },
  {
    type: "copy-file",
    label: "Copy File",
    icon: <Copy className="h-4 w-4 text-white" />,
    description: "Copies a file or directory",
    category: "file",
  },
  {
    type: "rename-file",
    label: "Rename File",
    icon: <FilePenLine className="h-4 w-4 text-white" />,
    description: "Renames a file or directory",
    category: "file",
  },
  {
    type: "delete-file",
    label: "Delete File",
    icon: <Trash2 className="h-4 w-4 text-white" />,
    description: "Deletes a file or directory",
    category: "file",
  },
  {
    type: "move-file",
    label: "Move File",
    icon: <Files className="h-4 w-4 text-white" />,
    description: "Move a file or directory",
    category: "file",
  },
  {
    type: "list-files",
    label: "List Files",
    icon: <Files className="h-4 w-4 text-white" />,
    description: "Lists files in a directory",
    category: "file",
  },
  {
    type: "file-poller",
    label: "File Poller",
    icon: <Clock className="h-4 w-4 text-white" />,
    description: "Monitors a file or directory for changes",
    category: "file",
  },
  {
    type: "http-receiver",
    label: "HTTP Receiver",
    icon: <Server className="h-4 w-4 text-white" />,
    description: "Listens for incoming HTTP requests",
    category: "http",
  },
  {
    type: "send-http-request",
    label: "Send HTTP Request",
    icon: <Send className="h-4 w-4 text-white" />,
    description: "Sends an HTTP request to an external service",
    category: "http",
  },
  {
    type: "send-http-response",
    label: "Send HTTP Response",
    icon: <Globe className="h-4 w-4 text-white" />,
    description: "Sends an HTTP response back to the client",
    category: "http",
  },
  {
    type: "database",
    label: "Database",
    icon: <Database className="h-4 w-4 text-white" />,
    description: "Database operations with connection and write modes",
    category: "databaseoperations",
  },
  {
    type: "source",
    label: "Source",
    icon: <FileInput className="h-4 w-4 text-white" />,
    description:
      "Load data from various source providers with schema definition",
    category: "databaseoperations",
  },
  {
    type: "xml-parser",
    label: "XML Parser",
    icon: <FileCode className="h-4 w-4 text-white" />,
    description: "Parses XML content into structured data",
    category: "xml",
  },
  {
    type: "xml-render",
    label: "XML Render",
    icon: <FileJson className="h-4 w-4 text-white" />,
    description: "Renders data as XML format",
    category: "xml",
  },
  {
    type: "transform-xml",
    label: "Transform XML",
    icon: <Copy className="h-4 w-4 text-white" />,
    description: "Transform",
    category: "xml",
  },
  {
    type: "json-parse",
    label: "JSON Parse",
    icon: <Copy className="h-4 w-4 text-white" />,
    description: "Transform",
    category: "json",
  },
  {
    type: "json-render",
    label: "JSON Render",
    icon: <Copy className="h-4 w-4 text-white" />,
    description: "Transform",
    category: "json",
  },
  {
    type: "transform-json",
    label: "Transform Json",
    icon: <Copy className="h-4 w-4 text-white" />,
    description: "Transform",
    category: "json",
  },
  {
    type: "parse-data",
    label: "Parse Data",
    icon: <Database className="h-4 w-4 text-white" />,
    description: "Parses structured data into usable format",
    category: "data",
  },
  {
    type: "render-data",
    label: "Render Data",
    icon: <Database className="h-4 w-4 text-white" />,
    description: "Renders data in specified format",
    category: "data",
  },
  {
    type: "salesforce-cloud",
    label: "Salesforce Cloud",
    icon: <Database className="h-4 w-4 text-white" />,
    description: "Read data from Salesforce using SOQL queries",
    category: "salesforceoperations",
  },
  {
    type: "write-salesforce",
    label: "write-salesforce",
    icon: <Database className="h-4 w-4 text-white" />,
    description: "Read data from Salesforce using SOQL queries",
    category: "salesforceoperations",
  },
  {
    type: "end",
    label: "End",
    icon: <CheckCircle className="h-4 w-4 text-white" />,
    description: "End point of the workflow",
    category: "general",
  },
  {
    type: "filter",
    label: "Filter",
    icon: <Filter className="h-4 w-4 text-white" />,
    description: "Filters data based on specified conditions",
    category: "data",
  },
];

interface SideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNodeType?: (nodeType: NodeType) => void;
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
  | "salesforceoperations";

// Category configurations with colors matching your image
const categoryConfigs = {
  filenode: { 
    color: "bg-teal-500", 
    name: "File Operations",
    icon: <FolderOpen className="h-4 w-4 text-white" />
  },
  general: { 
    color: "bg-blue-500", 
    name: "Workflow Controls",
    icon: <Play className="h-4 w-4 text-white" />
  },
  file: { 
    color: "bg-purple-500", 
    name: "File Operations",
    icon: <FolderOpen className="h-4 w-4 text-white" />
  },
  http: { 
    color: "bg-orange-500", 
    name: "HTTP Operations",
    icon: <Globe className="h-4 w-4 text-white" />
  },
  xml: { 
    color: "bg-purple-600", 
    name: "XML Operations",
    icon: <FileCode className="h-4 w-4 text-white" />
  },
  json: { 
    color: "bg-purple-600", 
    name: "JSON Operations",
    icon: <FileCode className="h-4 w-4 text-white" />
  },
  data: { 
    color: "bg-blue-500", 
    name: "Data Operations",
    icon: <Database className="h-4 w-4 text-white" />
  },
  databaseoperations: { 
    color: "bg-green-500", 
    name: "Database Operations",
    icon: <Database className="h-4 w-4 text-white" />
  },
  salesforceoperations: { 
    color: "bg-blue-500", 
    name: "Salesforce Operations",
    icon: <Database className="h-4 w-4 text-white" />
  },
};

export function SideModal({
  isOpen,
  onClose,
  onSelectNodeType,
}: SideModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState<CategoryType>("main");

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

  // Reset to main view when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentView("main");
      setSearchTerm("");
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const handleDragStart = (e: React.DragEvent, nodeType: NodeType) => {
    e.dataTransfer.setData("nodeType", nodeType);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSelect = (nodeType: NodeType) => {
    onSelectNodeType?.(nodeType);
    onClose();
  };

  // Filter nodes based on search term
  const filteredNodeTypes = nodeTypes.filter(
    (node) =>
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get count of operations by category
  const getCategoryCount = (category: string) => {
    return nodeTypes.filter(node => node.category === category).length;
  };

  // Search input that appears on every view
  const searchInput = (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search for nodes..."
        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none bg-gray-50"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );

  // Helper function to render a list of nodes
  const renderNodeList = (nodes: NodeTypeDefinition[]) => {
    return (
      <div className="space-y-2">
        {nodes.map((nodeType) => (
          <div
            key={nodeType.type}
            className="flex items-center gap-3 p-2 cursor-grab text-sm transition hover:bg-gray-50 rounded-md"
            draggable
            onDragStart={(e) => handleDragStart(e, nodeType.type)}
            onClick={() => handleSelect(nodeType.type)}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-md ${categoryConfigs[nodeType.category]?.color || 'bg-gray-500'}`}>
              {nodeType.icon}
            </div>
            <div className="flex-1 leading-tight">
              <div className="font-medium text-sm text-gray-800">
                {nodeType.label}
              </div>
              <div className="text-xs text-gray-500">
                {nodeType.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMainView = () => {
    // Show search results directly on main view if there's a search term
    if (searchTerm.trim() !== "") {
      const allFilteredNodes = filteredNodeTypes;

      if (allFilteredNodes.length === 0) {
        return (
          <>
            {searchInput}
            <div className="text-center py-8 text-gray-500">
              No nodes found matching "{searchTerm}"
            </div>
          </>
        );
      }

      // Group search results by category
      const groupedResults = Object.entries(categoryConfigs).reduce((acc, [key, config]) => {
        const categoryNodes = allFilteredNodes.filter(node => node.category === key);
        if (categoryNodes.length > 0) {
          acc[key] = categoryNodes;
        }
        return acc;
      }, {} as Record<string, NodeTypeDefinition[]>);

      return (
        <>
          {searchInput}
          <div className="space-y-4">
            {Object.entries(groupedResults).map(([category, nodes]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-medium text-sm text-gray-600 flex items-center gap-2">
                  {categoryConfigs[category as keyof typeof categoryConfigs]?.icon}
                  {categoryConfigs[category as keyof typeof categoryConfigs]?.name}
                </h3>
                {renderNodeList(nodes)}
              </div>
            ))}
          </div>
        </>
      );
    }

    // Default main view with category cards - compact design matching your image
    return (
      <>
        {searchInput}
        <div className="space-y-3">
          {Object.entries(categoryConfigs).map(([categoryKey, config]) => {
            const count = getCategoryCount(categoryKey);
            return (
              <div
                key={categoryKey}
                className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                onClick={() => setCurrentView(categoryKey as CategoryType)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                      {config.icon}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">{config.name}</div>
                      <div className="text-xs text-gray-500">{count} operations available</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

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
      | "salesforceoperations",
    title: string,
    icon: React.ReactNode
  ) => {
    const operations = filteredNodeTypes.filter(
      (node) => node.category === category
    );

    return (
      <>
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentView("main")}
            className="mr-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="font-semibold text-gray-800">{title}</h3>
          </div>
        </div>

        {searchInput}

        {operations.length > 0 ? (
          renderNodeList(operations)
        ) : (
          <div className="text-center py-8 text-gray-500">
            No nodes found matching "{searchTerm}"
          </div>
        )}
      </>
    );
  };

  // Content based on current view
  const renderContent = () => {
    switch (currentView) {
      case "file":
        return renderCategoryView(
          "file",
          "File Operations",
          <FolderOpen className="h-5 w-5 text-purple-500" />
        );
      case "http":
        return renderCategoryView(
          "http",
          "HTTP Operations",
          <Globe className="h-5 w-5 text-orange-500" />
        );
      case "xml":
        return renderCategoryView(
          "xml",
          "XML Operations",
          <FileCode className="h-5 w-5 text-purple-500" />
        );
      case "json":
        return renderCategoryView(
          "json",
          "JSON Operations",
          <FileCode className="h-5 w-5 text-purple-500" />
        );
      case "data":
        return renderCategoryView(
          "data",
          "Data Operations",
          <Database className="h-5 w-5 text-blue-500" />
        );
      case "databaseoperations":
        return renderCategoryView(
          "databaseoperations",
          "Database Operations",
          <Database className="h-5 w-5 text-green-500" />
        );
      case "salesforceoperations":
        return renderCategoryView(
          "salesforceoperations",
          "Salesforce Operations",
          <Database className="h-5 w-5 text-blue-500" />
        );
      case "filenode":
        return renderCategoryView(
          "filenode",
          "File Operations",
          <FolderOpen className="h-5 w-5 text-teal-500" />
        );
      case "general":
        return renderCategoryView(
          "general",
          "Workflow Controls",
          <Play className="h-5 w-5 text-blue-500" />
        );
      default:
        return renderMainView();
    }
  };

  return (
    <div
      className="fixed top-0 right-0 h-full bg-white shadow-lg z-50 overflow-y-auto border-l border-gray-200"
      style={{
        width: "340px",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      {/* Header matching your image */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Play className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add Node</h2>
              <p className="text-sm text-gray-500">Drag or click to add</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
}