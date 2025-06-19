// // "use client"

// // import type React from "react"

// // import { useState, useRef, useCallback, useEffect } from "react"
// // import { Button } from "@/components/ui/button"
// // import { Card, CardContent } from "@/components/ui/card"
// // import { Badge } from "@/components/ui/badge"
// // import { ZoomIn, ZoomOut, RotateCcw, Play, Square, Settings } from "lucide-react"
// // import { WorkflowNode } from "./workflow-node"
// // import { NodePalette } from "./node-palette"
// // import { ConnectionPath } from "./connection-path"

// // interface WorkflowCanvasProps {
// //   config: any
// //   onClose: () => void
// // }

// // interface Node {
// //   id: string
// //   type: string
// //   x: number
// //   y: number
// //   label: string
// //   status?: "idle" | "running" | "success" | "error"
// //   config?: any
// // }

// // interface Connection {
// //   id: string
// //   from: string
// //   to: string
// // }

// // export function WorkflowCanvas({ config, onClose }: WorkflowCanvasProps) {
// //   const [nodes, setNodes] = useState<Node[]>([
// //     { id: "start", type: "start", x: 100, y: 200, label: "Start", status: "success" },
// //     { id: "read", type: "read", x: 300, y: 150, label: "Read Data", status: "success" },
// //     { id: "transform", type: "transform", x: 500, y: 200, label: "Transform", status: "running" },
// //     { id: "write", type: "write", x: 700, y: 150, label: "Write Data", status: "idle" },
// //     { id: "end", type: "end", x: 900, y: 200, label: "End", status: "idle" },
// //   ])

// //   const [connections, setConnections] = useState<Connection[]>([
// //     { id: "conn1", from: "start", to: "read" },
// //     { id: "conn2", from: "read", to: "transform" },
// //     { id: "conn3", from: "transform", to: "write" },
// //     { id: "conn4", from: "write", to: "end" },
// //   ])

// //   const [selectedNode, setSelectedNode] = useState<string | null>(null)
// //   const [dragging, setDragging] = useState<{ nodeId: string; offset: { x: number; y: number } } | null>(null)
// //   const [connecting, setConnecting] = useState<{ from: string } | null>(null)
// //   const [scale, setScale] = useState(1)
// //   const [offset, setOffset] = useState({ x: 0, y: 0 })
// //   const [isPanning, setPanning] = useState(false)
// //   const [panStart, setPanStart] = useState({ x: 0, y: 0 })

// //   const canvasRef = useRef<HTMLDivElement>(null)
// //   const svgRef = useRef<SVGSVGElement>(null)

// //   // Handle node dragging
// //   const handleNodeMouseDown = useCallback(
// //     (nodeId: string, e: React.MouseEvent) => {
// //       e.stopPropagation()
// //       const node = nodes.find((n) => n.id === nodeId)
// //       if (!node) return

// //       const rect = canvasRef.current?.getBoundingClientRect()
// //       if (!rect) return

// //       const offsetX = (e.clientX - rect.left - offset.x) / scale - node.x
// //       const offsetY = (e.clientY - rect.top - offset.y) / scale - node.y

// //       setDragging({ nodeId, offset: { x: offsetX, y: offsetY } })
// //       setSelectedNode(nodeId)
// //     },
// //     [nodes, offset, scale],
// //   )

// //   // Handle canvas panning
// //   const handleCanvasMouseDown = useCallback(
// //     (e: React.MouseEvent) => {
// //       if (e.button === 0 && !e.target.closest(".workflow-node")) {
// //         setPanning(true)
// //         setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
// //         setSelectedNode(null)
// //       }
// //     },
// //     [offset],
// //   )

// //   // Global mouse move handler
// //   useEffect(() => {
// //     const handleMouseMove = (e: MouseEvent) => {
// //       if (dragging) {
// //         const rect = canvasRef.current?.getBoundingClientRect()
// //         if (!rect) return

// //         const newX = (e.clientX - rect.left - offset.x) / scale - dragging.offset.x
// //         const newY = (e.clientY - rect.top - offset.y) / scale - dragging.offset.y

// //         setNodes((prev) => prev.map((node) => (node.id === dragging.nodeId ? { ...node, x: newX, y: newY } : node)))
// //       } else if (isPanning) {
// //         setOffset({
// //           x: e.clientX - panStart.x,
// //           y: e.clientY - panStart.y,
// //         })
// //       }
// //     }

// //     const handleMouseUp = () => {
// //       setDragging(null)
// //       setPanning(false)
// //     }

// //     if (dragging || isPanning) {
// //       document.addEventListener("mousemove", handleMouseMove)
// //       document.addEventListener("mouseup", handleMouseUp)
// //     }

// //     return () => {
// //       document.removeEventListener("mousemove", handleMouseMove)
// //       document.removeEventListener("mouseup", handleMouseUp)
// //     }
// //   }, [dragging, isPanning, offset, scale, panStart])

// //   // Handle zoom
// //   const handleWheel = useCallback(
// //     (e: React.WheelEvent) => {
// //       e.preventDefault()
// //       const delta = e.deltaY > 0 ? 0.9 : 1.1
// //       const newScale = Math.max(0.1, Math.min(3, scale * delta))

// //       if (newScale !== scale) {
// //         const rect = canvasRef.current?.getBoundingClientRect()
// //         if (rect) {
// //           const mouseX = e.clientX - rect.left
// //           const mouseY = e.clientY - rect.top

// //           const scaleRatio = newScale / scale
// //           setOffset((prev) => ({
// //             x: mouseX - (mouseX - prev.x) * scaleRatio,
// //             y: mouseY - (mouseY - prev.y) * scaleRatio,
// //           }))
// //         }
// //         setScale(newScale)
// //       }
// //     },
// //     [scale],
// //   )

// //   // Canvas controls
// //   const handleZoomIn = () => setScale((prev) => Math.min(3, prev * 1.2))
// //   const handleZoomOut = () => setScale((prev) => Math.max(0.1, prev / 1.2))
// //   const handleResetView = () => {
// //     setScale(1)
// //     setOffset({ x: 0, y: 0 })
// //   }

// //   // Connection handling
// //   const handleStartConnection = (nodeId: string) => {
// //     setConnecting({ from: nodeId })
// //   }

// //   const handleCompleteConnection = (nodeId: string) => {
// //     if (connecting && connecting.from !== nodeId) {
// //       const newConnection: Connection = {
// //         id: `conn_${Date.now()}`,
// //         from: connecting.from,
// //         to: nodeId,
// //       }
// //       setConnections((prev) => [...prev, newConnection])
// //     }
// //     setConnecting(null)
// //   }

// //   // Add node from palette
// //   const handleAddNode = (nodeType: string) => {
// //     const newNode: Node = {
// //       id: `node_${Date.now()}`,
// //       type: nodeType,
// //       x: 400,
// //       y: 300,
// //       label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
// //       status: "idle",
// //     }
// //     setNodes((prev) => [...prev, newNode])
// //   }

// //   // Simulate workflow execution
// //   const handleExecuteWorkflow = () => {
// //     setNodes((prev) => prev.map((node) => ({ ...node, status: "running" as const })))

// //     // Simulate execution progress
// //     setTimeout(() => {
// //       setNodes((prev) =>
// //         prev.map((node, index) => ({
// //           ...node,
// //           status: index < 3 ? ("success" as const) : ("running" as const),
// //         })),
// //       )
// //     }, 1000)

// //     setTimeout(() => {
// //       setNodes((prev) => prev.map((node) => ({ ...node, status: "success" as const })))
// //     }, 2000)
// //   }

// //   return (
// //     <div className="flex-1 flex">
// //       {/* Node Palette */}
// //       <NodePalette onAddNode={handleAddNode} />

// //       {/* Main Canvas Area */}
// //       <div className="flex-1 flex flex-col">
// //         {/* Canvas Controls */}
// //         <div className="bg-white border-b p-4 flex items-center justify-between">
// //           <div className="flex items-center gap-4">
// //             <div className="flex items-center gap-2">
// //               <Button size="sm" variant="outline" onClick={handleZoomOut}>
// //                 <ZoomOut className="h-4 w-4" />
// //               </Button>
// //               <Badge variant="outline" className="px-3">
// //                 {Math.round(scale * 100)}%
// //               </Badge>
// //               <Button size="sm" variant="outline" onClick={handleZoomIn}>
// //                 <ZoomIn className="h-4 w-4" />
// //               </Button>
// //               <Button size="sm" variant="outline" onClick={handleResetView}>
// //                 <RotateCcw className="h-4 w-4" />
// //               </Button>
// //             </div>
// //           </div>

// //           <div className="flex items-center gap-2">
// //             <Button onClick={handleExecuteWorkflow} className="flex items-center gap-2">
// //               <Play className="h-4 w-4" />
// //               Execute Workflow
// //             </Button>
// //             <Button variant="outline">
// //               <Square className="h-4 w-4" />
// //             </Button>
// //           </div>
// //         </div>

// //         {/* Canvas */}
// //         <div
// //           ref={canvasRef}
// //           className="flex-1 relative overflow-hidden bg-gray-50 cursor-grab active:cursor-grabbing"
// //           onMouseDown={handleCanvasMouseDown}
// //           onWheel={handleWheel}
// //           style={{
// //             backgroundImage: `
// //               radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)
// //             `,
// //             backgroundSize: `${20 * scale}px ${20 * scale}px`,
// //             backgroundPosition: `${offset.x}px ${offset.y}px`,
// //           }}
// //         >
// //           {/* SVG for connections */}
// //           <svg
// //             ref={svgRef}
// //             className="absolute inset-0 pointer-events-none"
// //             style={{
// //               width: "100%",
// //               height: "100%",
// //               transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
// //               transformOrigin: "0 0",
// //             }}
// //           >
// //             <defs>
// //               <filter id="glow">
// //                 <feGaussianBlur stdDeviation="3" result="coloredBlur" />
// //                 <feMerge>
// //                   <feMergeNode in="coloredBlur" />
// //                   <feMergeNode in="SourceGraphic" />
// //                 </feMerge>
// //               </filter>
// //             </defs>

// //             {connections.map((connection) => {
// //               const fromNode = nodes.find((n) => n.id === connection.from)
// //               const toNode = nodes.find((n) => n.id === connection.to)

// //               if (!fromNode || !toNode) return null

// //               return <ConnectionPath key={connection.id} from={fromNode} to={toNode} status={fromNode.status} />
// //             })}
// //           </svg>

// //           {/* Nodes */}
// //           <div
// //             style={{
// //               transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
// //               transformOrigin: "0 0",
// //             }}
// //           >
// //             {nodes.map((node) => (
// //               <WorkflowNode
// //                 key={node.id}
// //                 node={node}
// //                 selected={selectedNode === node.id}
// //                 connecting={connecting?.from === node.id}
// //                 onMouseDown={handleNodeMouseDown}
// //                 onStartConnection={handleStartConnection}
// //                 onCompleteConnection={handleCompleteConnection}
// //               />
// //             ))}
// //           </div>
// //         </div>
// //       </div>

// //       {/* Properties Panel */}
// //       {selectedNode && (
// //         <div className="w-80 bg-white border-l">
// //           <Card className="h-full rounded-none border-0">
// //             <CardContent className="p-4">
// //               <div className="space-y-4">
// //                 <div className="flex items-center gap-2">
// //                   <Settings className="h-5 w-5" />
// //                   <h3 className="font-semibold">Node Properties</h3>
// //                 </div>

// //                 {(() => {
// //                   const node = nodes.find((n) => n.id === selectedNode)
// //                   if (!node) return null

// //                   return (
// //                     <div className="space-y-3">
// //                       <div>
// //                         <label className="text-sm font-medium">Label</label>
// //                         <input
// //                           type="text"
// //                           value={node.label}
// //                           onChange={(e) =>
// //                             setNodes((prev) =>
// //                               prev.map((n) => (n.id === selectedNode ? { ...n, label: e.target.value } : n)),
// //                             )
// //                           }
// //                           className="w-full mt-1 px-3 py-2 border rounded-md"
// //                         />
// //                       </div>

// //                       <div>
// //                         <label className="text-sm font-medium">Type</label>
// //                         <p className="mt-1 px-3 py-2 bg-gray-50 rounded-md text-sm">{node.type}</p>
// //                       </div>

// //                       <div>
// //                         <label className="text-sm font-medium">Status</label>
// //                         <div className="mt-1">
// //                           <Badge
// //                             variant={
// //                               node.status === "success"
// //                                 ? "default"
// //                                 : node.status === "error"
// //                                   ? "destructive"
// //                                   : node.status === "running"
// //                                     ? "secondary"
// //                                     : "outline"
// //                             }
// //                           >
// //                             {node.status}
// //                           </Badge>
// //                         </div>
// //                       </div>

// //                       <div>
// //                         <label className="text-sm font-medium">Position</label>
// //                         <div className="mt-1 grid grid-cols-2 gap-2">
// //                           <input
// //                             type="number"
// //                             value={Math.round(node.x)}
// //                             onChange={(e) =>
// //                               setNodes((prev) =>
// //                                 prev.map((n) =>
// //                                   n.id === selectedNode ? { ...n, x: Number.parseInt(e.target.value) || 0 } : n,
// //                                 ),
// //                               )
// //                             }
// //                             className="px-2 py-1 border rounded text-sm"
// //                             placeholder="X"
// //                           />
// //                           <input
// //                             type="number"
// //                             value={Math.round(node.y)}
// //                             onChange={(e) =>
// //                               setNodes((prev) =>
// //                                 prev.map((n) =>
// //                                   n.id === selectedNode ? { ...n, y: Number.parseInt(e.target.value) || 0 } : n,
// //                                 ),
// //                               )
// //                             }
// //                             className="px-2 py-1 border rounded text-sm"
// //                             placeholder="Y"
// //                           />
// //                         </div>
// //                       </div>
// //                     </div>
// //                   )
// //                 })()}
// //               </div>
// //             </CardContent>
// //           </Card>
// //         </div>
// //       )}
// //     </div>
// //   )
// // }
// // src/components/workflow/WorkflowCanvas.tsx (or your path)
// "use client";

// import type React from "react";
// import { useRef, useState, useEffect, useCallback, useMemo } from "react";
// import {
//   useWorkflow, // THE KEY CHANGE: Using the context
//   type WorkflowNode as ContextWorkflowNode, // Renaming to avoid conflict with local if any
//   type NodeConnection as ContextNodeConnection,
//   type DAG, // Assuming DAG might be passed to initialize
// } from "@/components/workflow/workflow-context"; // Adjust path to your workflow-context
// import { NodeComponent } from "@/components/workflow/node-component"; // Using the same NodeComponent as WorkflowEditor
// import { ConnectionLine } from "@/components/workflow/connection-line"; // Using the same ConnectionLine
// import { NodeModal } from "@/components/workflow/node-modal"; // For properties
// import { SideModal } from "@/components/workflow/sidemodal"; // For adding nodes (replaces NodePalette)
// import { Minimap } from "@/components/minimap/Minimap"; // Assuming path
// import {
//   Plus, ZoomIn, ZoomOut, RotateCcw, Maximize2, Grid3X3, Play, Square, Settings, // Play, Square, Settings might be for top menu now
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Slider } from "@/components/ui/slider";
// import { Badge } from "@/components/ui/badge";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { SchemaItem, SchemaModalData, NodeType } from "@/services/interface"; // For type consistency
// import SchemaModal from "@/components/workflow/SchemaModal"; // If SchemaModal is used
// import { getNodeSchema } from "@/components/workflow/nodeSchemas"; // If used by SchemaModal
// // Removed: Local Node, Connection interfaces, NodePalette, ConnectionPath if replaced

// interface CanvasOffset {
//   x: number;
//   y: number;
// }

// // These constants are usually defined in workflow-editor or a shared place
// const NODE_WIDTH = 180; // Example, adjust to your NodeComponent's typical width
// const NODE_HEIGHT = 80; // Example, adjust to your NodeComponent's typical height

// interface WorkflowCanvasProps {
//   // 'config' could be a DAG object to load initially if not already in context
//   initialDagData?: DAG; // Changed 'config' to be more specific
//   onClose?: () => void; // Kept onClose if this canvas is part of a modal or specific view
//   // You might not need dagId if initialDagData is provided, or if context handles loading
//   dagId?: string;
// }

// export function WorkflowCanvas({ initialDagData, onClose, dagId }: WorkflowCanvasProps) {
//   const {
//     nodes,
//     connections,
//     selectedNodeId,
//     pendingConnection,
//     setPendingConnection,
//     propertiesModalNodeId,
//     setPropertiesModalNodeId,
//     dataMappingModalNodeId,
//     setDataMappingModalNodeId,
//     draggingNodeInfo,
//     setDraggingNodeInfo,
//     addNode,
//     updateNode,
//     removeConnection,
//     addConnection,
//     selectNode,
//     executeNode, // For node-specific execution if needed
//     getNodeById,
//     loadWorkflowFromDAG, // To load the initialDagData
//     clearWorkflow, // To clear before loading new
//     runWorkflow, // For the main "Execute Workflow" button
//     // saveAndRunWorkflow, // If you have save + run
//   } = useWorkflow();

//   // Canvas interaction states (similar to WorkflowEditor)
//   const [canvasOffset, setCanvasOffset] = useState<CanvasOffset>({ x: 0, y: 0 });
//   const [canvasScale, setCanvasScale] = useState(1);
//   const [isPanning, setIsPanning] = useState(false);
//   const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // For pending connection line

//   // UI states
//   const [isSideModalOpen, setIsSideModalOpen] = useState(false); // For adding nodes
//   const [showMinimap, setShowMinimap] = useState(true); // Default to true
//   const [showGrid, setShowGrid] = useState(true); // Default to true
//   const [gridSize, setGridSize] = useState(20); // Default grid size

//   // Refs
//   const canvasRef = useRef<HTMLDivElement>(null);
//   // svgRef is not explicitly used for direct manipulation here but good to have if extending

//   // Load initial DAG data when component mounts or initialDagData changes
//   useEffect(() => {
//     if (initialDagData) {
//       console.log("WorkflowCanvas: Loading initialDagData:", initialDagData.dag_id);
//       clearWorkflow(); // Clear existing nodes/connections in context
//       loadWorkflowFromDAG(initialDagData).catch(err => {
//         console.error("WorkflowCanvas: Error loading initial DAG data", err);
//         // Add toast or error display here
//       });
//     }
//     // If only dagId is provided and initialDagData is not, you might fetch it here
//     // else if (dagId && !initialDagData) { /* fetch logic then loadWorkflowFromDAG */ }
//   }, [initialDagData, loadWorkflowFromDAG, clearWorkflow, dagId]);


//   // --- Canvas Interaction Logic (Adopted from WorkflowEditor) ---
//   const dynamicGridSize = useMemo(() => { /* ... same as WorkflowEditor ... */
//     const baseSize = gridSize;
//     if (canvasScale < 0.5) return baseSize * 4;
//     if (canvasScale < 0.75) return baseSize * 2;
//     if (canvasScale > 2) return baseSize / 2;
//     return baseSize;
//   }, [gridSize, canvasScale]);

//   const canvasBackground = useMemo(() => { /* ... same as WorkflowEditor ... */
//     const smallGrid = dynamicGridSize;
//     const largeGrid = smallGrid * 5;
//     const opacity = Math.min(canvasScale, 1) * 0.6;
//     return {
//       backgroundImage: `
//         radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%),
//         linear-gradient(rgba(148, 163, 184, ${opacity * 0.3}) 1px, transparent 1px),
//         linear-gradient(90deg, rgba(148, 163, 184, ${opacity * 0.3}) 1px, transparent 1px),
//         linear-gradient(rgba(59, 130, 246, ${opacity * 0.6}) 1px, transparent 1px),
//         linear-gradient(90deg, rgba(59, 130, 246, ${opacity * 0.6}) 1px, transparent 1px)
//       `,
//       backgroundSize: `100% 100%, ${smallGrid}px ${smallGrid}px, ${smallGrid}px ${smallGrid}px, ${largeGrid}px ${largeGrid}px, ${largeGrid}px ${largeGrid}px`,
//       backgroundPosition: `center center, ${canvasOffset.x}px ${canvasOffset.y}px, ${canvasOffset.x}px ${canvasOffset.y}px, ${canvasOffset.x}px ${canvasOffset.y}px, ${canvasOffset.x}px ${canvasOffset.y}px`,
//     };
//   }, [canvasOffset, canvasScale, dynamicGridSize, showGrid]);

//   const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => { /* ... same as WorkflowEditor ... */
//       if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle mouse or Ctrl+Left Click for panning
//         e.preventDefault();
//         setIsPanning(true);
//         setLastPanPoint({ x: e.clientX, y: e.clientY });
//       } else if (e.button === 0 && e.target === e.currentTarget) { // Left click on canvas background
//         selectNode(null); // Deselect node
//         setPendingConnection(null); // Cancel pending connection
//       }
//     },[selectNode, setPendingConnection] // Added dependencies
//   );

//   const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => { /* ... same as WorkflowEditor ... */
//       if (isPanning) {
//         const deltaX = e.clientX - lastPanPoint.x;
//         const deltaY = e.clientY - lastPanPoint.y;
//         setCanvasOffset((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
//         setLastPanPoint({ x: e.clientX, y: e.clientY });
//       }
//     }, [isPanning, lastPanPoint]
//   );

//   const handleCanvasMouseUp = useCallback(() => { /* ... same as WorkflowEditor ... */
//     setIsPanning(false);
//   }, []);

//   const handleCanvasWheel = useCallback((e: React.WheelEvent) => { /* ... same as WorkflowEditor ... */
//       e.preventDefault();
//       const delta = e.deltaY > 0 ? 0.9 : 1.1;
//       const newScale = Math.max(0.1, Math.min(3, canvasScale * delta));
//       if (newScale !== canvasScale) {
//         const rect = canvasRef.current?.getBoundingClientRect();
//         if (rect) {
//           const mouseX = e.clientX - rect.left;
//           const mouseY = e.clientY - rect.top;
//           const scaleRatio = newScale / canvasScale;
//           setCanvasOffset((prev) => ({
//             x: mouseX - (mouseX - prev.x) * scaleRatio,
//             y: mouseY - (mouseY - prev.y) * scaleRatio,
//           }));
//         }
//         setCanvasScale(newScale);
//       }
//     }, [canvasScale]
//   );

//   const handleNodeDragStart = useCallback((nodeId: string, e: React.MouseEvent) => { /* ... same as WorkflowEditor ... */
//       const rect = canvasRef.current?.getBoundingClientRect();
//       if (!rect) return;
//       const node = getNodeById(nodeId);
//       if (!node) return;
//       // Calculate offset relative to the node's top-left corner
//       const offsetX = (e.clientX - rect.left - canvasOffset.x) / canvasScale - node.position.x;
//       const offsetY = (e.clientY - rect.top - canvasOffset.y) / canvasScale - node.position.y;
//       setDraggingNodeInfo({ id: nodeId, offset: { x: offsetX, y: offsetY } });
//       selectNode(nodeId); // Select node on drag start
//     }, [canvasOffset, canvasScale, getNodeById, setDraggingNodeInfo, selectNode]
//   );

//   useEffect(() => { // Global mouse move/up for dragging node and pending connection
//     const handleGlobalMouseMove = (e: MouseEvent) => {
//       const rect = canvasRef.current?.getBoundingClientRect();
//       if (!rect) return;

//       if (draggingNodeInfo) {
//         const newX = (e.clientX - rect.left - canvasOffset.x) / canvasScale - draggingNodeInfo.offset.x;
//         const newY = (e.clientY - rect.top - canvasOffset.y) / canvasScale - draggingNodeInfo.offset.y;
//         updateNode(draggingNodeInfo.id, { position: { x: newX, y: newY } });
//       }

//       if (pendingConnection) {
//         const x = (e.clientX - rect.left - canvasOffset.x) / canvasScale;
//         const y = (e.clientY - rect.top - canvasOffset.y) / canvasScale;
//         setMousePosition({ x, y });
//       }
//     };

//     const handleGlobalMouseUp = () => {
//       if (draggingNodeInfo) setDraggingNodeInfo(null);
//       // Pending connection completion is handled by NodeComponent's onMouseUp/onClick on a target port
//       if (isPanning) setIsPanning(false);
//     };

//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") {
//         setPendingConnection(null);
//         setIsSideModalOpen(false); // Close add node modal
//         setPropertiesModalNodeId(null); // Close properties modal
//         setDataMappingModalNodeId(null); // Close schema modal
//       }
//       // Add more keyboard shortcuts if needed (e.g., Delete for selectedNodeId)
//     };

//     window.addEventListener("mousemove", handleGlobalMouseMove);
//     window.addEventListener("mouseup", handleGlobalMouseUp);
//     window.addEventListener("keydown", handleKeyDown);
//     return () => {
//       window.removeEventListener("mousemove", handleGlobalMouseMove);
//       window.removeEventListener("mouseup", handleGlobalMouseUp);
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [draggingNodeInfo, pendingConnection, canvasOffset, canvasScale, updateNode, setDraggingNodeInfo, setPendingConnection, isPanning, setPropertiesModalNodeId, setDataMappingModalNodeId]);

//   // Canvas controls actions
//   const handleZoomIn = () => setCanvasScale((prev) => Math.min(3, prev * 1.2));
//   const handleZoomOut = () => setCanvasScale((prev) => Math.max(0.1, prev / 1.2));
//   const handleResetView = () => { setCanvasScale(1); setCanvasOffset({ x: 0, y: 0 }); };
//   const handleFitToScreen = () => { /* ... same as WorkflowEditor ... */
//     if (nodes.length === 0) return handleResetView();
//     const padding = 100;
//     const minX = Math.min(...nodes.map((n) => n.position.x)) - padding;
//     const minY = Math.min(...nodes.map((n) => n.position.y)) - padding;
//     const maxX = Math.max(...nodes.map((n) => n.position.x + NODE_WIDTH)) + padding;
//     const maxY = Math.max(...nodes.map((n) => n.position.y + NODE_HEIGHT)) + padding;
//     const rect = canvasRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const scaleX = rect.width / (maxX - minX);
//     const scaleY = rect.height / (maxY - minY);
//     const newScale = Math.min(scaleX, scaleY, 1); // Cap max scale at 1 for fit to screen
//     setCanvasScale(newScale);
//     setCanvasOffset({
//       x: (rect.width - (maxX - minX) * newScale) / 2 - minX * newScale,
//       y: (rect.height - (maxY - minY) * newScale) / 2 - minY * newScale,
//     });
//   };

//   // Node adding and connection (simplified, using context features)
//   const handleNodeTypeSelectFromSideModal = useCallback((nodeType: NodeType) => {
//       // Add node at the center of the current view or a predefined offset
//       const rect = canvasRef.current?.getBoundingClientRect();
//       let x = 200, y = 200; // Default position
//       if (rect) {
//         x = (rect.width / 2 - canvasOffset.x) / canvasScale;
//         y = (rect.height / 2 - canvasOffset.y) / canvasScale;
//       }
//       addNode(nodeType, { x, y });
//       setIsSideModalOpen(false);
//     }, [addNode, canvasOffset, canvasScale]
//   );

//   // Schema Modal logic (copied from WorkflowEditor)
//   const handleOpenSchemaModal = useCallback((nodeId: string) => {
//       setDataMappingModalNodeId(nodeId);
//     },[setDataMappingModalNodeId]
//   );

//   const schemaModalData = useMemo(() => {
//     if (!dataMappingModalNodeId) return null;
//     const currentNode = getNodeById(dataMappingModalNodeId);
//     if (!currentNode) return null;
//     // ... (findAllUpstreamOutputs logic from WorkflowEditor)
//     const findAllUpstreamOutputs = (
//         nodeId: string,
//         visited = new Set<string>()
//       ): SchemaItem[] => {
//         // ... (implementation from WorkflowEditor)
//         return []; // Placeholder
//       };
//     const nodeSchema = getNodeSchema(currentNode.type);
//     const availableInputs = findAllUpstreamOutputs(dataMappingModalNodeId); // Placeholder
//     return {
//       nodeId: currentNode.id,
//       nodeType: currentNode.type,
//       nodeLabel: currentNode.data?.label || currentNode.type,
//       baseInputSchema: nodeSchema?.inputSchema || [],
//       baseOutputSchema: nodeSchema?.outputSchema || [],
//       availableInputsFromPrevious: availableInputs,
//     };
//   }, [dataMappingModalNodeId, getNodeById, connections]); // Add connections


//   // Minimap handlers
//   const handleMinimapClick = useCallback((newOffset: CanvasOffset) => setCanvasOffset(newOffset), []);
//   const handleMinimapPan = useCallback((delta: CanvasOffset) => {
//     setCanvasOffset((prev) => ({ x: prev.x + delta.x, y: prev.y + delta.y }));
//   }, []);

//   // Simulate workflow execution (could use context's runWorkflow)
//   const handleExecuteWorkflow = () => {
//     runWorkflow(); // Use context's runWorkflow
//   };


//   // The main difference from WorkflowEditor is this component might be more self-contained
//   // in its UI structure (e.g., no global TopMenu, but its own controls bar).
//   // It also includes the `onClose` prop.

//   return (
//     <div className="flex-1 flex flex-col h-full"> {/* Ensure it takes full height if it's the main view */}
//       {/* Top Controls Bar specific to this Canvas (if not using a global TopMenu) */}
//       <div className="bg-background border-b p-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
//         <div className="flex items-center gap-2">
//             <TooltipProvider>
//                  <Tooltip>
//                     <TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={() => setIsSideModalOpen(true)}><Plus className="h-4 w-4 mr-1" /> Add</Button></TooltipTrigger>
//                     <TooltipContent>Add Node</TooltipContent>
//                  </Tooltip>
//                  <Tooltip>
//                     <TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={handleZoomOut}><ZoomOut className="h-4 w-4" /></Button></TooltipTrigger>
//                     <TooltipContent>Zoom Out</TooltipContent>
//                 </Tooltip>
//             </TooltipProvider>
//             <Badge variant="outline" className="px-2 py-1 text-xs min-w-[50px] text-center">{Math.round(canvasScale * 100)}%</Badge>
//             <TooltipProvider>
//                 <Tooltip>
//                     <TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={handleZoomIn}><ZoomIn className="h-4 w-4" /></Button></TooltipTrigger>
//                     <TooltipContent>Zoom In</TooltipContent>
//                 </Tooltip>
//                  <Tooltip>
//                     <TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={handleResetView}><RotateCcw className="h-4 w-4" /></Button></TooltipTrigger>
//                     <TooltipContent>Reset View</TooltipContent>
//                  </Tooltip>
//                  <Tooltip>
//                     <TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={handleFitToScreen}><Maximize2 className="h-4 w-4" /></Button></TooltipTrigger>
//                     <TooltipContent>Fit to Screen</TooltipContent>
//                  </Tooltip>
//                   <Tooltip>
//                     <TooltipTrigger asChild><Button variant={showGrid ? "secondary" : "ghost"} size="sm" onClick={() => setShowGrid(!showGrid)}><Grid3X3 className="h-4 w-4" /></Button></TooltipTrigger>
//                     <TooltipContent>Toggle Grid</TooltipContent>
//                  </Tooltip>
//             </TooltipProvider>
//         </div>
//         <div className="flex items-center gap-2">
//             <Button onClick={handleExecuteWorkflow} size="sm" className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700">
//                 <Play className="h-4 w-4" /> Run
//             </Button>
//             {/* <Button variant="outline" size="sm"><Square className="h-4 w-4 mr-1.5"/> Stop</Button> */}
//             {onClose && (
//                  <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
//             )}
//         </div>
//       </div>

//       {/* Main Canvas Area */}
//       <div className="flex-1 relative overflow-hidden bg-gray-50"> {/* Added relative and overflow-hidden */}
//         {showMinimap && (
//           <div className="absolute top-2 right-2 z-20 bg-white rounded-md shadow-lg border overflow-hidden">
//             <Minimap
//               nodes={nodes.map(n => ({...n, width: NODE_WIDTH, height: NODE_HEIGHT}))} // Pass node dimensions to minimap
//               connections={connections}
//               canvasOffset={canvasOffset}
//               canvasScale={canvasScale}
//               onMinimapClick={handleMinimapClick}
//               onMinimapPan={handleMinimapPan}
//               viewportWidth={canvasRef.current?.clientWidth || 0}
//               viewportHeight={canvasRef.current?.clientHeight || 0}
//             />
//           </div>
//         )}

//         <div
//           ref={canvasRef}
//           className="w-full h-full cursor-grab active:cursor-grabbing" // Ensure w-full h-full
//           style={showGrid ? canvasBackground : { background: "radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%)" }}
//           onMouseDown={handleCanvasMouseDown}
//           onMouseMove={handleCanvasMouseMove}
//           onMouseUp={handleCanvasMouseUp}
//           onWheel={handleCanvasWheel}
//           // onDrop and onDragOver would be needed if dragging nodes from an external palette onto this canvas
//         >
//           <div
//             className="relative w-full h-full" // Added for proper positioning of SVG and nodes
//             style={{
//               transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasScale})`,
//               transformOrigin: "0 0",
//             }}
//           >
//             <svg
//               className="absolute inset-0 pointer-events-none"
//               style={{ width: "100%", height: "100%", overflow: "visible" }} // Ensure SVG is visible
//             >
//               {/* Connections Rendering */}
//               {connections.map((connection) => {
//                 const sourceNode = getNodeById(connection.sourceId);
//                 const targetNode = getNodeById(connection.targetId);
//                 if (!sourceNode || !targetNode) return null;
//                 return (
//                   <ConnectionLine
//                     key={connection.id}
//                     connection={connection}
//                     sourceNode={sourceNode}
//                     targetNode={targetNode}
//                     onDelete={() => removeConnection(connection.id)}
//                     // onInsertNode might not be used if SideModal handles all node additions
//                   />
//                 );
//               })}
//               {/* Pending Connection Line */}
//               {pendingConnection && getNodeById(pendingConnection.sourceId) && (
//                 <PendingConnectionLine
//                   sourceNode={getNodeById(pendingConnection.sourceId) as ContextWorkflowNode} // Cast for safety
//                   mousePosition={mousePosition}
//                 />
//               )}
//             </svg>

//             {/* Nodes Rendering */}
//             {nodes.map((node) => (
//               <NodeComponent // Using NodeComponent from WorkflowEditor's ecosystem
//                 key={node.id}
//                 node={node}
//                 selected={selectedNodeId === node.id}
//                 isConnecting={!!pendingConnection && pendingConnection.sourceId === node.id}
//                 onSelect={() => selectNode(node.id)}
//                 onDragStart={handleNodeDragStart} // This will use context's setDraggingNodeInfo
//                 onExecuteNode={executeNode ? () => executeNode(node.id) : undefined}
//                 onOpenProperties={setPropertiesModalNodeId ? () => setPropertiesModalNodeId(node.id) : undefined}
//                 onOpenSchemaModal={handleOpenSchemaModal ? () => handleOpenSchemaModal(node.id) : undefined}
//                 // onStartConnection and onCompleteConnection are now implicitly handled by NodeComponent's ports
//                 // interacting with setPendingConnection and addConnection from the context
//               />
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Modals (similar to WorkflowEditor) */}
//       <SideModal
//         isOpen={isSideModalOpen}
//         onClose={() => setIsSideModalOpen(false)}
//         onSelectNodeType={handleNodeTypeSelectFromSideModal}
//       />

//       {propertiesModalNodeId && (
//         <NodeModal
//           nodeId={propertiesModalNodeId}
//           isOpen={!!propertiesModalNodeId}
//           onClose={() => setPropertiesModalNodeId(null)}
//         />
//       )}

//       {/* No direct ExecutionModal or separate Properties Panel here unless you add them back */}
//       {/* The NodeModal (properties) is triggered by setPropertiesModalNodeId */}
//       {/* Schema Modal */}
//       {dataMappingModalNodeId && schemaModalData && (
//         <SchemaModal
//           {...schemaModalData}
//           onClose={() => setDataMappingModalNodeId(null)}
//           onSaveMappings={(mappings) => { /* ... save mappings logic ... */ }}
//         />
//       )}
//     </div>
//   );
// }

// // Helper for pending connection line (copied from WorkflowEditor)
// function PendingConnectionLine({ sourceNode, mousePosition }: { sourceNode: ContextWorkflowNode; mousePosition: { x: number; y: number }}) {
//   if (!sourceNode) return null;
//   const sourcePortOffset = { x: NODE_WIDTH, y: NODE_HEIGHT / 2 }; // Assuming output port is middle-right
//   const sourceX = sourceNode.position.x + sourcePortOffset.x;
//   const sourceY = sourceNode.position.y + sourcePortOffset.y;
//   const controlPointOffset = Math.abs(mousePosition.x - sourceX) * 0.5;
//   const path = `M ${sourceX} ${sourceY} C ${sourceX + controlPointOffset} ${sourceY}, ${mousePosition.x - controlPointOffset} ${mousePosition.y}, ${mousePosition.x} ${mousePosition.y}`;
//   return <path d={path} stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" fill="none" />;
// }