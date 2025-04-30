//sidemodal.tsx
"use client"
import { useState, useEffect } from "react"
import {Play, FileText, FileInput, FileOutput, Copy, CheckCircle, X, Search, ChevronDown, ChevronRight, FolderPlus, File, FileEdit, FilePlus2, FolderOpen, Trash2, Files, Clock, Server, Send, Globe, FileCode, FileJson, ArrowLeft} from "lucide-react"
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

// Updated to use minimal styling for a plain look without borders
const nodeTypeStyles = "hover:bg-slate-50";

interface SideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNodeType?: (nodeType: NodeType) => void;
}

type CategoryType = "main" | "file" | "general" | "http" | "xml";

export function SideModal({ isOpen, onClose, onSelectNodeType }: SideModalProps) {
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
  }

  const handleSelect = (nodeType: NodeType) => {
    onSelectNodeType?.(nodeType);
    onClose();
  }

  // Filter nodes based on search term
  const filteredNodeTypes = nodeTypes.filter(node =>
    node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get nodes by category
  const fileOperations = filteredNodeTypes.filter(node => node.category === "file");
  const generalOperations = filteredNodeTypes.filter(node => node.category === "general");
  const httpOperations = filteredNodeTypes.filter(node => node.category === "http");
  const xmlOperations = filteredNodeTypes.filter(node => node.category === "xml");

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
  );

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
            <div className="flex h-8 w-8 items-center justify-center rounded-md shadow-sm">
              {nodeType.icon}
            </div>
            <div className="leading-tight">
              <div className="font-medium text-sm text-slate-800">{nodeType.label}</div>
              <div className="text-xs text-slate-500">{nodeType.description}</div>
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
            <div className="text-center py-8 text-slate-500">
              No nodes found matching "{searchTerm}"
            </div>
          </>
        );
      }
      
      // Group search results by category
      const fileResults = allFilteredNodes.filter(node => node.category === "file");
      const httpResults = allFilteredNodes.filter(node => node.category === "http");
      const xmlResults = allFilteredNodes.filter(node => node.category === "xml");
      const generalResults = allFilteredNodes.filter(node => node.category === "general");
      
      return (
        <>
          {searchInput}
          <div className="space-y-4">
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
            
            {generalResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-slate-600 flex items-center gap-2">
                  <Play className="h-4 w-4 text-green-500" />
                  Workflow Controls
                </h3>
                {renderNodeList(generalResults)}
              </div>
            )}
          </div>
        </>
      );
    }
    
    // Default main view with category cards - simplified with no borders or backgrounds
    return (
      <>
        {searchInput}
        <div className="grid gap-3">
          {/* File Operations Card */}
          <div 
            className="cursor-pointer hover:bg-slate-50 py-2 px-3 rounded-md"
            onClick={() => setCurrentView("file")}
          >
            <div className="w-full flex justify-between items-center text-sm font-medium text-slate-700">
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">File Operations</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* HTTP Operations Card */}
          <div 
            className="cursor-pointer hover:bg-slate-50 py-2 px-3 rounded-md"
            onClick={() => setCurrentView("http")}
          >
            <div className="w-full flex justify-between items-center text-sm font-medium text-slate-700">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-emerald-500" />
                <span className="font-semibold">HTTP Operations</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* XML Operations Card */}
          <div 
            className="cursor-pointer hover:bg-slate-50 py-2 px-3 rounded-md"
            onClick={() => setCurrentView("xml")}
          >
            <div className="w-full flex justify-between items-center text-sm font-medium text-slate-700">
              <div className="flex items-center space-x-2">
                <FileCode className="h-5 w-5 text-violet-500" />
                <span className="font-semibold">XML Operations</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </div>
          </div>

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
        </div>
      </>
    );
  };

  const renderCategoryView = (category: "file" | "general" | "http" | "xml", title: string, icon: React.ReactNode) => {
    const operations = filteredNodeTypes.filter(node => node.category === category);
    
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
          <div className="text-center py-8 text-slate-500">
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
        return renderCategoryView("file", "File Operations", <FolderOpen className="h-5 w-5 text-blue-500" />);
      case "http":
        return renderCategoryView("http", "HTTP Operations", <Globe className="h-5 w-5 text-emerald-500" />);
      case "xml":
        return renderCategoryView("xml", "XML Operations", <FileCode className="h-5 w-5 text-violet-500" />);
      case "general":
        return renderCategoryView("general", "Workflow Controls", <Play className="h-5 w-5 text-green-500" />);
      default:
        return renderMainView();
    }
  };

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
        {renderContent()}
      </div>
    </div>
  );
}
// "use client"
// import { useState, useEffect } from "react"
// import type React from "react"

// import {
//   Play,
//   FileText,
//   Copy,
//   CheckCircle,
//   X,
//   Search,
//   FileEdit,
//   FilePlus2,
//   FolderOpen,
//   Trash2,
//   Files,
//   Clock,
//   Server,
//   Send,
//   Globe,
//   FileCode,
//   FileJson,
//   ArrowLeft,
// } from "lucide-react"
// import type { NodeType } from "./workflow-context"
// import { Button } from "@/components/ui/button"

// interface NodeTypeDefinition {
//   type: NodeType
//   label: string
//   icon: React.ReactNode
//   description: string
//   category: "file" | "general" | "http" | "xml"
// }

// const nodeTypes: NodeTypeDefinition[] = [
//   {
//     type: "start",
//     label: "Start",
//     icon: <Play className="h-5 w-5 text-green-600" />,
//     description: "Starting point of the workflow",
//     category: "general",
//   },
//   {
//     type: "create-file",
//     label: "Create",
//     icon: <FilePlus2 className="h-5 w-5 text-blue-600" />,
//     description: "Creates a new file or directory",
//     category: "file",
//   },
//   {
//     type: "read-file",
//     label: "Read",
//     icon: <FileText className="h-5 w-5 text-indigo-600" />,
//     description: "Reads content from a file",
//     category: "file",
//   },
//   {
//     type: "write-file",
//     label: "Write",
//     icon: <FileEdit className="h-5 w-5 text-purple-600" />,
//     description: "Writes content to a file",
//     category: "file",
//   },
//   {
//     type: "copy-file",
//     label: "Copy",
//     icon: <Copy className="h-5 w-5 text-amber-600" />,
//     description: "Copies a file or directory",
//     category: "file",
//   },
//   {
//     type: "delete-file",
//     label: "Delete",
//     icon: <Trash2 className="h-5 w-5 text-red-500" />,
//     description: "Deletes a file or directory",
//     category: "file",
//   },
//   {
//     type: "list-files",
//     label: "List",
//     icon: <Files className="h-5 w-5 text-teal-600" />,
//     description: "Lists files in a directory",
//     category: "file",
//   },
//   {
//     type: "file-poller",
//     label: "Poller",
//     icon: <Clock className="h-5 w-5 text-cyan-600" />,
//     description: "Monitors a file or directory for changes",
//     category: "file",
//   },
//   {
//     type: "http-receiver",
//     label: "Receiver",
//     icon: <Server className="h-5 w-5 text-emerald-600" />,
//     description: "Listens for incoming HTTP requests",
//     category: "http",
//   },
//   {
//     type: "send-http-request",
//     label: "Request",
//     icon: <Send className="h-5 w-5 text-rose-600" />,
//     description: "Sends an HTTP request to an external service",
//     category: "http",
//   },
//   {
//     type: "send-http-response",
//     label: "Response",
//     icon: <Globe className="h-5 w-5 text-sky-600" />,
//     description: "Sends an HTTP response back to the client",
//     category: "http",
//   },
//   {
//     type: "xml-parser",
//     label: "Parser",
//     icon: <FileCode className="h-5 w-5 text-violet-600" />,
//     description: "Parses XML content into structured data",
//     category: "xml",
//   },
//   {
//     type: "xml-render",
//     label: "Render",
//     icon: <FileJson className="h-5 w-5 text-fuchsia-600" />,
//     description: "Renders data as XML format",
//     category: "xml",
//   },
//   {
//     type: "end",
//     label: "End",
//     icon: <CheckCircle className="h-5 w-5 text-red-600" />,
//     description: "End point of the workflow",
//     category: "general",
//   },
// ]

// // Category definitions with simplified names
// const categories = [
//   {
//     id: "file",
//     label: "File",
//     icon: <FolderOpen className="h-6 w-6 text-blue-500" />,
//   },
//   {
//     id: "http",
//     label: "HTTP",
//     icon: <Globe className="h-6 w-6 text-emerald-500" />,
//   },
//   {
//     id: "xml",
//     label: "XML",
//     icon: <FileCode className="h-6 w-6 text-violet-500" />,
//   },
//   {
//     id: "general",
//     label: "General",
//     icon: <Play className="h-6 w-6 text-green-500" />,
//   },
// ]

// interface SideModalProps {
//   isOpen: boolean
//   onClose: () => void
//   onSelectNodeType?: (nodeType: NodeType) => void
// }

// type CategoryType = "main" | "file" | "general" | "http" | "xml"

// export function SideModal({ isOpen, onClose, onSelectNodeType }: SideModalProps) {
//   const [isVisible, setIsVisible] = useState(false)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [currentView, setCurrentView] = useState<CategoryType>("main")

//   useEffect(() => {
//     if (isOpen) {
//       setIsVisible(true)
//     } else {
//       const timer = setTimeout(() => {
//         setIsVisible(false)
//       }, 300)
//       return () => clearTimeout(timer)
//     }
//   }, [isOpen])

//   // Reset to main view when modal closes
//   useEffect(() => {
//     if (!isOpen) {
//       setCurrentView("main")
//       setSearchTerm("")
//     }
//   }, [isOpen])

//   if (!isVisible && !isOpen) return null

//   const handleDragStart = (e: React.DragEvent, nodeType: NodeType) => {
//     e.dataTransfer.setData("nodeType", nodeType)
//     e.dataTransfer.effectAllowed = "move"
//   }

//   const handleSelect = (nodeType: NodeType) => {
//     onSelectNodeType?.(nodeType)
//     onClose()
//   }

//   // Filter nodes based on search term
//   const filteredNodeTypes = nodeTypes.filter(
//     (node) =>
//       node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       node.description.toLowerCase().includes(searchTerm.toLowerCase()),
//   )

//   // Search input that appears on every view
//   const searchInput = (
//     <div className="relative mb-4">
//       <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
//       <input
//         type="text"
//         placeholder="Search nodes..."
//         className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none bg-slate-50"
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//       />
//     </div>
//   )

//   // Render category grid (app-like icons)
//   const renderCategoryGrid = () => {
//     return (
//       <div className="grid grid-cols-3 gap-4">
//         {categories.map((category) => (
//           <div
//             key={category.id}
//             className="flex flex-col items-center justify-center p-3 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
//             onClick={() => setCurrentView(category.id as CategoryType)}
//           >
//             <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 mb-2">
//               {category.icon}
//             </div>
//             <span className="text-sm font-medium text-slate-700">{category.label}</span>
//           </div>
//         ))}
//       </div>
//     )
//   }

//   // Render nodes in a grid layout
//   const renderNodeGrid = (nodes: NodeTypeDefinition[]) => {
//     return (
//       <div className="grid grid-cols-3 gap-3">
//         {nodes.map((nodeType) => (
//           <div
//             key={nodeType.type}
//             className="flex flex-col items-center p-3 cursor-grab rounded-lg hover:bg-slate-100 transition-colors"
//             draggable
//             onDragStart={(e) => handleDragStart(e, nodeType.type)}
//             onClick={() => handleSelect(nodeType.type)}
//             title={nodeType.description}
//           >
//             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 mb-2">
//               {nodeType.icon}
//             </div>
//             <span className="text-xs font-medium text-slate-700 text-center">{nodeType.label}</span>
//           </div>
//         ))}
//       </div>
//     )
//   }

//   const renderMainView = () => {
//     // Show search results directly on main view if there's a search term
//     if (searchTerm.trim() !== "") {
//       const allFilteredNodes = filteredNodeTypes

//       if (allFilteredNodes.length === 0) {
//         return (
//           <>
//             {searchInput}
//             <div className="text-center py-8 text-slate-500">No nodes found matching "{searchTerm}"</div>
//           </>
//         )
//       }

//       // Group search results by category
//       const fileResults = allFilteredNodes.filter((node) => node.category === "file")
//       const httpResults = allFilteredNodes.filter((node) => node.category === "http")
//       const xmlResults = allFilteredNodes.filter((node) => node.category === "xml")
//       const generalResults = allFilteredNodes.filter((node) => node.category === "general")

//       return (
//         <>
//           {searchInput}
//           <div className="space-y-6">
//             {fileResults.length > 0 && (
//               <div>
//                 <h3 className="font-medium text-sm text-slate-600 mb-3 flex items-center gap-2">
//                   <FolderOpen className="h-4 w-4 text-blue-500" />
//                   File
//                 </h3>
//                 {renderNodeGrid(fileResults)}
//               </div>
//             )}

//             {httpResults.length > 0 && (
//               <div>
//                 <h3 className="font-medium text-sm text-slate-600 mb-3 flex items-center gap-2">
//                   <Globe className="h-4 w-4 text-emerald-500" />
//                   HTTP
//                 </h3>
//                 {renderNodeGrid(httpResults)}
//               </div>
//             )}

//             {xmlResults.length > 0 && (
//               <div>
//                 <h3 className="font-medium text-sm text-slate-600 mb-3 flex items-center gap-2">
//                   <FileCode className="h-4 w-4 text-violet-500" />
//                   XML
//                 </h3>
//                 {renderNodeGrid(xmlResults)}
//               </div>
//             )}

//             {generalResults.length > 0 && (
//               <div>
//                 <h3 className="font-medium text-sm text-slate-600 mb-3 flex items-center gap-2">
//                   <Play className="h-4 w-4 text-green-500" />
//                   General
//                 </h3>
//                 {renderNodeGrid(generalResults)}
//               </div>
//             )}
//           </div>
//         </>
//       )
//     }

//     // Default main view with category grid (app-like)
//     return (
//       <>
//         {searchInput}
//         {renderCategoryGrid()}
//       </>
//     )
//   }

//   const renderCategoryView = (category: "file" | "general" | "http" | "xml", title: string, icon: React.ReactNode) => {
//     const operations = filteredNodeTypes.filter((node) => node.category === category)

//     return (
//       <>
//         <div className="flex items-center mb-4">
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setCurrentView("main")}
//             className="mr-2 hover:bg-slate-200 rounded-full"
//           >
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div className="flex items-center space-x-2">
//             {icon}
//             <h3 className="font-semibold text-slate-800">{title}</h3>
//           </div>
//         </div>

//         {searchInput}

//         {operations.length > 0 ? (
//           renderNodeGrid(operations)
//         ) : (
//           <div className="text-center py-8 text-slate-500">No nodes found matching "{searchTerm}"</div>
//         )}
//       </>
//     )
//   }

//   // Content based on current view
//   const renderContent = () => {
//     switch (currentView) {
//       case "file":
//         return renderCategoryView("file", "File", <FolderOpen className="h-5 w-5 text-blue-500" />)
//       case "http":
//         return renderCategoryView("http", "HTTP", <Globe className="h-5 w-5 text-emerald-500" />)
//       case "xml":
//         return renderCategoryView("xml", "XML", <FileCode className="h-5 w-5 text-violet-500" />)
//       case "general":
//         return renderCategoryView("general", "General", <Play className="h-5 w-5 text-green-500" />)
//       default:
//         return renderMainView()
//     }
//   }

//   return (
//     <div
//       className="fixed top-0 right-0 h-full bg-white shadow-lg z-50 overflow-y-auto border-l border-slate-200"
//       style={{
//         width: "340px",
//         transform: isOpen ? "translateX(0)" : "translateX(100%)",
//         transition: "transform 0.3s ease-in-out",
//       }}
//     >
//       <div className="p-4 border-b flex justify-between items-center bg-slate-50">
//         <h2 className="text-lg font-semibold text-slate-800">Add Node</h2>
//         <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-200 rounded-full">
//           <X className="h-4 w-4" />
//         </Button>
//       </div>

//       <div className="p-4">{renderContent()}</div>
//     </div>
//   )
// }
