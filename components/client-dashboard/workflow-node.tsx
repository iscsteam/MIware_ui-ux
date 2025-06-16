// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Card } from "@/components/ui/card"
// import {
//   Play,
//   Square,
//   Database,
//   FileText,
//   Settings,
//   Upload,
//   Download,
//   CheckCircle,
//   XCircle,
//   Clock,
//   Loader2,
// } from "lucide-react"

// interface Node {
//   id: string
//   type: string
//   x: number
//   y: number
//   label: string
//   status?: "idle" | "running" | "success" | "error"
//   config?: any
// }

// interface WorkflowNodeProps {
//   node: Node
//   selected: boolean
//   connecting: boolean
//   onMouseDown: (nodeId: string, e: React.MouseEvent) => void
//   onStartConnection: (nodeId: string) => void
//   onCompleteConnection: (nodeId: string) => void
// }

// export function WorkflowNode({
//   node,
//   selected,
//   connecting,
//   onMouseDown,
//   onStartConnection,
//   onCompleteConnection,
// }: WorkflowNodeProps) {
//   const [isHovered, setIsHovered] = useState(false)

//   const getNodeIcon = (type: string) => {
//     switch (type) {
//       case "start":
//         return <Play className="h-5 w-5 text-green-600" />
//       case "end":
//         return <Square className="h-5 w-5 text-red-600" />
//       case "read":
//         return <Download className="h-5 w-5 text-blue-600" />
//       case "write":
//         return <Upload className="h-5 w-5 text-orange-600" />
//       case "transform":
//         return <Settings className="h-5 w-5 text-purple-600" />
//       case "database":
//         return <Database className="h-5 w-5 text-indigo-600" />
//       default:
//         return <FileText className="h-5 w-5 text-gray-600" />
//     }
//   }

//   const getStatusIcon = (status?: string) => {
//     switch (status) {
//       case "success":
//         return <CheckCircle className="h-4 w-4 text-green-500" />
//       case "error":
//         return <XCircle className="h-4 w-4 text-red-500" />
//       case "running":
//         return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
//       default:
//         return <Clock className="h-4 w-4 text-gray-400" />
//     }
//   }

//   const getNodeColor = (type: string) => {
//     switch (type) {
//       case "start":
//         return "border-green-300 bg-green-50"
//       case "end":
//         return "border-red-300 bg-red-50"
//       case "read":
//         return "border-blue-300 bg-blue-50"
//       case "write":
//         return "border-orange-300 bg-orange-50"
//       case "transform":
//         return "border-purple-300 bg-purple-50"
//       case "database":
//         return "border-indigo-300 bg-indigo-50"
//       default:
//         return "border-gray-300 bg-gray-50"
//     }
//   }

//   const getStatusBorder = (status?: string) => {
//     switch (status) {
//       case "success":
//         return "ring-2 ring-green-400"
//       case "error":
//         return "ring-2 ring-red-400"
//       case "running":
//         return "ring-2 ring-blue-400 animate-pulse"
//       default:
//         return ""
//     }
//   }

//   return (
//     <div
//       className="workflow-node absolute"
//       style={{ left: node.x, top: node.y }}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <Card
//         className={`
//           w-32 h-20 cursor-move transition-all duration-200
//           ${getNodeColor(node.type)}
//           ${selected ? "ring-2 ring-blue-500" : ""}
//           ${getStatusBorder(node.status)}
//           ${isHovered ? "shadow-lg scale-105" : "shadow-md"}
//           ${connecting ? "ring-2 ring-yellow-400" : ""}
//         `}
//         onMouseDown={(e) => onMouseDown(node.id, e)}
//       >
//         <div className="p-3 h-full flex flex-col justify-between">
//           {/* Header with icon and status */}
//           <div className="flex items-center justify-between">
//             {getNodeIcon(node.type)}
//             {getStatusIcon(node.status)}
//           </div>

//           {/* Label */}
//           <div className="text-center">
//             <p className="text-xs font-medium text-gray-700 truncate">{node.label}</p>
//           </div>
//         </div>
//       </Card>

//       {/* Connection Ports */}
//       {node.type !== "start" && (
//         <div
//           className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white cursor-pointer hover:bg-blue-600 transition-colors"
//           onClick={() => onCompleteConnection(node.id)}
//           title="Input port"
//         />
//       )}

//       {node.type !== "end" && (
//         <div
//           className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white cursor-pointer hover:bg-green-600 transition-colors"
//           onClick={() => onStartConnection(node.id)}
//           title="Output port"
//         />
//       )}

//       {/* Hover Actions */}
//       {isHovered && (
//         <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1 bg-white rounded-md shadow-lg border p-1">
//           <button className="p-1 hover:bg-gray-100 rounded" title="Configure">
//             <Settings className="h-3 w-3" />
//           </button>
//           <button className="p-1 hover:bg-gray-100 rounded" title="Execute">
//             <Play className="h-3 w-3" />
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }
