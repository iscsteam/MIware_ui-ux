// "use client"
// import React, { useMemo, useState, useCallback } from "react"
// import type { WorkflowNode, NodeConnection } from "@/components/workflow/workflow-context"
// import { Maximize2, Minimize2 } from "lucide-react"
// import { Button } from "@/components/ui/button"

// const NODE_WIDTH = 100
// const NODE_HEIGHT = 60

// type MinimapProps = {
//   nodes: WorkflowNode[]
//   connections?: NodeConnection[]
//   canvasOffset: { x: number; y: number }
//   canvasScale: number
//   onMinimapClick: (newOffset: { x: number; y: number }) => void
//   onMinimapPan?: (delta: { x: number; y: number }) => void
//   width?: number
//   height?: number
// }

// export const Minimap: React.FC<MinimapProps> = ({
//   nodes,
//   connections = [],
//   canvasOffset,
//   canvasScale,
//   onMinimapClick,
//   onMinimapPan,
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false)
//   const [isDragging, setIsDragging] = useState(false)
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

//   const MINIMAP_WIDTH = isExpanded ? 320 : 192
//   const MINIMAP_HEIGHT = isExpanded ? 240 : 128
//   const PADDING = 60

//   const bounds = useMemo(() => {
//     if (nodes.length === 0) {
//       return {
//         minX: -200,
//         minY: -200,
//         maxX: 400,
//         maxY: 400,
//         width: 600,
//         height: 600,
//       }
//     }

//     const positions = nodes.map((n) => ({
//       x: n.position.x,
//       y: n.position.y,
//       width: NODE_WIDTH,
//       height: NODE_HEIGHT,
//     }))

//     const minX = Math.min(...positions.map((p) => p.x)) - PADDING
//     const minY = Math.min(...positions.map((p) => p.y)) - PADDING
//     const maxX = Math.max(...positions.map((p) => p.x + p.width)) + PADDING
//     const maxY = Math.max(...positions.map((p) => p.y + p.height)) + PADDING

//     return {
//       minX,
//       minY,
//       maxX,
//       maxY,
//       width: maxX - minX,
//       height: maxY - minY,
//     }
//   }, [nodes])

//   const scale = useMemo(() => {
//     const scaleX = MINIMAP_WIDTH / bounds.width
//     const scaleY = MINIMAP_HEIGHT / bounds.height
//     return Math.min(scaleX, scaleY, 1)
//   }, [bounds, MINIMAP_WIDTH, MINIMAP_HEIGHT])

//   const viewportWidth = (MINIMAP_WIDTH / canvasScale) * scale
//   const viewportHeight = (MINIMAP_HEIGHT / canvasScale) * scale

//   const handleMouseDown = useCallback((e: React.MouseEvent) => {
//     e.preventDefault()
//     setIsDragging(true)
//     setDragStart({ x: e.clientX, y: e.clientY })
//   }, [])

//   const handleMouseMove = useCallback(
//     (e: MouseEvent) => {
//       if (!isDragging || !onMinimapPan) return

//       const deltaX = (e.clientX - dragStart.x) / scale
//       const deltaY = (e.clientY - dragStart.y) / scale

//       onMinimapPan({ x: -deltaX, y: -deltaY })
//       setDragStart({ x: e.clientX, y: e.clientY })
//     },
//     [isDragging, dragStart, scale, onMinimapPan],
//   )

//   const handleMouseUp = useCallback(() => {
//     setIsDragging(false)
//   }, [])

//   React.useEffect(() => {
//     if (isDragging) {
//       window.addEventListener("mousemove", handleMouseMove)
//       window.addEventListener("mouseup", handleMouseUp)
//       return () => {
//         window.removeEventListener("mousemove", handleMouseMove)
//         window.removeEventListener("mouseup", handleMouseUp)
//       }
//     }
//   }, [isDragging, handleMouseMove, handleMouseUp])

//   const handleClick = useCallback(
//     (e: React.MouseEvent) => {
//       if (isDragging) return

//       const rect = (e.currentTarget as SVGElement).getBoundingClientRect()
//       const clickX = e.clientX - rect.left
//       const clickY = e.clientY - rect.top

//       const canvasX = clickX / scale + bounds.minX
//       const canvasY = clickY / scale + bounds.minY

//       onMinimapClick({
//         x: canvasX - MINIMAP_WIDTH / 2 / canvasScale,
//         y: canvasY - MINIMAP_HEIGHT / 2 / canvasScale,
//       })
//     },
//     [isDragging, scale, bounds, onMinimapClick, canvasScale, MINIMAP_WIDTH, MINIMAP_HEIGHT],
//   )

//   const getNodeColor = (node: WorkflowNode) => {
//     const colors = {
//       "http-request": "#3b82f6",
//       "data-transformation": "#10b981",
//       conditional: "#f59e0b",
//       loop: "#8b5cf6",
//       webhook: "#ef4444",
//       database: "#06b6d4",
//       email: "#ec4899",
//       "file-operation": "#84cc16",
//       "api-call": "#6366f1",
//       timer: "#f97316",
//     }
//     return colors[node.type as keyof typeof colors] || "#6b7280"
//   }

//   return (
//     <div className="relative">
//       <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
//         <span className="text-xs font-medium text-gray-600">Minimap</span>
//         <div className="flex gap-1">
//           <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-6 w-6 p-0">
//             {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
//           </Button>
//         </div>
//       </div>

//       <svg
//         width={MINIMAP_WIDTH}
//         height={MINIMAP_HEIGHT}
//         onClick={handleClick}
//         onMouseDown={handleMouseDown}
//         className={`cursor-pointer transition-all duration-200 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
//         style={{ display: "block" }}
//       >
//         <defs>
//           <pattern id="minimap-grid" width="10" height="10" patternUnits="userSpaceOnUse">
//             <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
//           </pattern>
//           <filter id="node-shadow">
//             <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.3" />
//           </filter>
//         </defs>

//         <rect width="100%" height="100%" fill="#fafafa" />
//         <rect width="100%" height="100%" fill="url(#minimap-grid)" opacity="0.5" />

//         {/* Connections */}
//         {connections.map((connection) => {
//           const sourceNode = nodes.find((n) => n.id === connection.sourceId)
//           const targetNode = nodes.find((n) => n.id === connection.targetId)

//           if (!sourceNode || !targetNode) return null

//           const sourceX = (sourceNode.position.x - bounds.minX + NODE_WIDTH) * scale
//           const sourceY = (sourceNode.position.y - bounds.minY + NODE_HEIGHT / 2) * scale
//           const targetX = (targetNode.position.x - bounds.minX) * scale
//           const targetY = (targetNode.position.y - bounds.minY + NODE_HEIGHT / 2) * scale

//           return (
//             <line
//               key={connection.id}
//               x1={sourceX}
//               y1={sourceY}
//               x2={targetX}
//               y2={targetY}
//               stroke="#d1d5db"
//               strokeWidth="1"
//               opacity="0.6"
//             />
//           )
//         })}

//         {/* Nodes */}
//         {nodes.map((node) => {
//           const x = (node.position.x - bounds.minX) * scale
//           const y = (node.position.y - bounds.minY) * scale
//           const width = Math.max(8, NODE_WIDTH * scale)
//           const height = Math.max(6, NODE_HEIGHT * scale)

//           return (
//             <g key={node.id}>
//               <rect
//                 x={x}
//                 y={y}
//                 width={width}
//                 height={height}
//                 fill={getNodeColor(node)}
//                 opacity={node.data?.active === false ? 0.3 : 0.8}
//                 rx={Math.max(1, 4 * scale)}
//                 filter="url(#node-shadow)"
//               />
//               {isExpanded && scale > 0.1 && (
//                 <text
//                   x={x + width / 2}
//                   y={y + height / 2}
//                   textAnchor="middle"
//                   dominantBaseline="middle"
//                   fontSize={Math.max(6, 10 * scale)}
//                   fill="white"
//                   opacity="0.9"
//                 >
//                   {node.data?.label?.substring(0, 8) || node.type.substring(0, 8)}
//                 </text>
//               )}
//             </g>
//           )
//         })}

//         {/* Viewport */}
//         <rect
//           x={(-canvasOffset.x - bounds.minX) * scale}
//           y={(-canvasOffset.y - bounds.minY) * scale}
//           width={viewportWidth}
//           height={viewportHeight}
//           stroke="#ef4444"
//           strokeWidth="2"
//           fill="rgba(239, 68, 68, 0.1)"
//           rx="2"
//           className="pointer-events-none"
//         />

//         {/* Crosshair */}
//         <g opacity="0.3">
//           <line
//             x1={MINIMAP_WIDTH / 2}
//             y1={0}
//             x2={MINIMAP_WIDTH / 2}
//             y2={MINIMAP_HEIGHT}
//             stroke="#6b7280"
//             strokeWidth="1"
//             strokeDasharray="2,2"
//           />
//           <line
//             x1={0}
//             y1={MINIMAP_HEIGHT / 2}
//             x2={MINIMAP_WIDTH}
//             y2={MINIMAP_HEIGHT / 2}
//             stroke="#6b7280"
//             strokeWidth="1"
//             strokeDasharray="2,2"
//           />
//         </g>
//       </svg>

//       <div className="px-2 py-1 bg-gray-50 border-t text-xs text-gray-500 flex justify-between">
//         <span>{nodes.length} nodes</span>
//         <span>{Math.round(canvasScale * 100)}%</span>
//       </div>
//     </div>
//   )
// }
