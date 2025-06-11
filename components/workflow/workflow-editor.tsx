// "use client";

// import type React from "react";
// import { useRef, useState, useEffect, useCallback, useMemo } from "react";
// import {
//   useWorkflow,
//   type WorkflowNode,
//   type NodeConnection,
// } from "./workflow-context";
// import { NodeComponent } from "./node-component";
// import { ConnectionLine } from "./connection-line";
// import { NodeModal } from "./node-modal";
// import { ExecutionModal } from "./execution-modal";
// import { SideModal } from "./sidemodal";
// import { Minimap } from "@/components/minimap/Minimap";
// import SchemaModal from "./SchemaModal";
// import { getNodeSchema } from "./nodeSchemas";
// import {
//   Plus,
//   ZoomIn,
//   ZoomOut,
//   RotateCcw,
//   Maximize2,
//   Grid3X3,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Slider } from "@/components/ui/slider";
// import { Badge } from "@/components/ui/badge";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import {
//   SchemaItem,
//   SchemaModalData,
//   NodeType,
// } from "@/services/interface";

// interface CanvasOffset {
//   x: number;
//   y: number;
// }

// export function WorkflowEditor() {
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
//     addConnection, // Added from Code A logic
//     selectNode,
//     executeNode,
//     getNodeById,
//   } = useWorkflow();

//   // --- MERGED STATE ---
//   // Canvas State (from B)
//   const [canvasOffset, setCanvasOffset] = useState<CanvasOffset>({ x: 0, y: 0 });
//   const [canvasScale, setCanvasScale] = useState(1);
//   const [isPanning, setIsPanning] = useState(false);
//   const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

//   // UI State (Merged)
//   const [isSideModalOpen, setIsSideModalOpen] = useState(false);
//   const [showMinimap, setShowMinimap] = useState(true);
//   const [showGrid, setShowGrid] = useState(true);
//   const [gridSize, setGridSize] = useState(20);

//   // Feature State (from A)
//   const [connectionToSplit, setConnectionToSplit] = useState<NodeConnection | null>(null);
//   const [insertPosition, setInsertPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
//   const [executionModalOpen, setExecutionModalOpen] = useState(false);
//   const [executingNodeId, setExecutingNodeId] = useState<string | null>(null);

//   // Refs
//   const canvasRef = useRef<HTMLDivElement>(null);
//   const svgRef = useRef<SVGSVGElement>(null);

//   // --- NEW CANVAS DESIGN (from B) ---
//   const dynamicGridSize = useMemo(() => {
//     const baseSize = gridSize;
//     if (canvasScale < 0.5) return baseSize * 4;
//     if (canvasScale < 0.75) return baseSize * 2;
//     if (canvasScale > 2) return baseSize / 2;
//     return baseSize;
//   }, [gridSize, canvasScale]);

//   const canvasBackground = useMemo(() => {
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
//       backgroundSize: `
//         100% 100%,
//         ${smallGrid}px ${smallGrid}px,
//         ${smallGrid}px ${smallGrid}px,
//         ${largeGrid}px ${largeGrid}px,
//         ${largeGrid}px ${largeGrid}px
//       `,
//       backgroundPosition: `
//         center center,
//         ${canvasOffset.x}px ${canvasOffset.y}px,
//         ${canvasOffset.x}px ${canvasOffset.y}px,
//         ${canvasOffset.x}px ${canvasOffset.y}px,
//         ${canvasOffset.x}px ${canvasOffset.y}px
//       `,
//     };
//   }, [canvasOffset, canvasScale, dynamicGridSize, showGrid]);

//   // --- MERGED CANVAS INTERACTION ---
//   const handleCanvasMouseDown = useCallback(
//     (e: React.MouseEvent) => {
//       if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
//         e.preventDefault();
//         setIsPanning(true);
//         setLastPanPoint({ x: e.clientX, y: e.clientY });
//       } else if (e.button === 0 && e.target === e.currentTarget) {
//         selectNode(null);
//         setPendingConnection(null);
//       }
//     },
//     [selectNode, setPendingConnection]
//   );

//   const handleCanvasMouseMove = useCallback(
//     (e: React.MouseEvent) => {
//       if (isPanning) {
//         const deltaX = e.clientX - lastPanPoint.x;
//         const deltaY = e.clientY - lastPanPoint.y;
//         setCanvasOffset((prev) => ({
//           x: prev.x + deltaX,
//           y: prev.y + deltaY,
//         }));
//         setLastPanPoint({ x: e.clientX, y: e.clientY });
//       }
//     },
//     [isPanning, lastPanPoint]
//   );

//   const handleCanvasMouseUp = useCallback(() => {
//     setIsPanning(false);
//   }, []);

//   const handleCanvasWheel = useCallback(
//     (e: React.WheelEvent) => {
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
//     },
//     [canvasScale]
//   );
  
//   const handleNodeDragStart = useCallback(
//     (nodeId: string, e: React.MouseEvent) => {
//       const rect = canvasRef.current?.getBoundingClientRect();
//       if (!rect) return;
//       const node = getNodeById(nodeId);
//       if (!node) return;
//       const offsetX = (e.clientX - rect.left - canvasOffset.x) / canvasScale - node.position.x;
//       const offsetY = (e.clientY - rect.top - canvasOffset.y) / canvasScale - node.position.y;
//       setDraggingNodeInfo({ id: nodeId, offset: { x: offsetX, y: offsetY } });
//       selectNode(nodeId);
//     },
//     [canvasOffset, canvasScale, getNodeById, setDraggingNodeInfo, selectNode]
//   );
  
//   useEffect(() => {
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
//       setDraggingNodeInfo(null);
//       setIsPanning(false);
//     };

//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") {
//         setPendingConnection(null);
//         setIsSideModalOpen(false);
//         setPropertiesModalNodeId(null);
//         setDataMappingModalNodeId(null);
//         setExecutionModalOpen(false);
//       }
//     };

//     window.addEventListener("mousemove", handleGlobalMouseMove);
//     window.addEventListener("mouseup", handleGlobalMouseUp);
//     window.addEventListener("keydown", handleKeyDown);

//     return () => {
//       window.removeEventListener("mousemove", handleGlobalMouseMove);
//       window.removeEventListener("mouseup", handleGlobalMouseUp);
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [
//     draggingNodeInfo, pendingConnection, canvasOffset, canvasScale, updateNode,
//     setDraggingNodeInfo, setPendingConnection, setPropertiesModalNodeId,
//     setDataMappingModalNodeId,
//   ]);

//   // --- CANVAS CONTROLS (from B) ---
//   const handleZoomIn = () => setCanvasScale((prev) => Math.min(3, prev * 1.2));
//   const handleZoomOut = () => setCanvasScale((prev) => Math.max(0.1, prev / 1.2));
//   const handleResetView = () => {
//     setCanvasScale(1);
//     setCanvasOffset({ x: 0, y: 0 });
//   };
//   const handleFitToScreen = () => {
//     if (nodes.length === 0) return handleResetView();
//     const padding = 100;
//     const minX = Math.min(...nodes.map((n) => n.position.x)) - padding;
//     const minY = Math.min(...nodes.map((n) => n.position.y)) - padding;
//     const maxX = Math.max(...nodes.map((n) => n.position.x + 200)) + padding; // Node width 200
//     const maxY = Math.max(...nodes.map((n) => n.position.y + 100)) + padding; // Node height 100
//     const rect = canvasRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     const scaleX = rect.width / (maxX - minX);
//     const scaleY = rect.height / (maxY - minY);
//     const newScale = Math.min(scaleX, scaleY, 1);
//     setCanvasScale(newScale);
//     setCanvasOffset({
//       x: (rect.width - (maxX - minX) * newScale) / 2 - minX * newScale,
//       y: (rect.height - (maxY - minY) * newScale) / 2 - minY * newScale,
//     });
//   };

//   // --- MERGED FEATURE HANDLERS ---
//   const handleDrop = useCallback(
//     (e: React.DragEvent) => {
//       e.preventDefault();
//       const nodeType = e.dataTransfer.getData("nodeType") as NodeType;
//       if (!nodeType) return;
//       const rect = canvasRef.current?.getBoundingClientRect();
//       if (!rect) return;
//       const x = (e.clientX - rect.left - canvasOffset.x) / canvasScale;
//       const y = (e.clientY - rect.top - canvasOffset.y) / canvasScale;
//       addNode(nodeType, { x, y });
//     },
//     [canvasOffset, canvasScale, addNode]
//   );
  
//   const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

//   const handleInsertNode = useCallback(
//     (connection: NodeConnection, position: { x: number; y: number }) => {
//       setConnectionToSplit(connection);
//       setInsertPosition(position);
//       setIsSideModalOpen(true);
//     },
//     []
//   );

//   const handleNodeTypeSelect = useCallback((nodeType: NodeType) => {
//       if (connectionToSplit) {
//         const newNodeId = addNode(nodeType, insertPosition);
//         addConnection(connectionToSplit.sourceId, newNodeId);
//         addConnection(newNodeId, connectionToSplit.targetId);
//         removeConnection(connectionToSplit.id);
//         setConnectionToSplit(null);
//       } else {
//         const rect = canvasRef.current?.getBoundingClientRect();
//         if (rect) {
//           const x = (rect.width / 2 - canvasOffset.x) / canvasScale;
//           const y = (rect.height / 2 - canvasOffset.y) / canvasScale;
//           addNode(nodeType, { x, y });
//         }
//       }
//       setIsSideModalOpen(false);
//     },
//     [connectionToSplit, insertPosition, addNode, addConnection, removeConnection, canvasOffset, canvasScale]
//   );

//   const handleExecuteNode = useCallback((nodeId: string) => {
//       setExecutingNodeId(nodeId);
//       setExecutionModalOpen(true);
//       executeNode(nodeId);
//     }, [executeNode]
//   );

//   // --- ROBUST SCHEMA MODAL LOGIC (MERGED) ---
//   const handleOpenSchemaModal = useCallback((nodeId: string) => {
//       setDataMappingModalNodeId(nodeId);
//     }, [setDataMappingModalNodeId]
//   );

//   const schemaModalData = useMemo(() => {
//     if (!dataMappingModalNodeId) return null;
//     const currentNode = getNodeById(dataMappingModalNodeId);
//     if (!currentNode) return null;

//     // Recursive function from Code A for full upstream schema discovery
//     const findAllUpstreamOutputs = (
//       nodeId: string,
//       visited = new Set<string>()
//     ): SchemaItem[] => {
//       if (visited.has(nodeId)) return [];
//       visited.add(nodeId);
//       const incomingConnections = connections.filter((conn) => conn.targetId === nodeId);
//       let collectedOutputs: SchemaItem[] = [];

//       for (const conn of incomingConnections) {
//         const sourceNode = getNodeById(conn.sourceId);
//         if (sourceNode) {
//           const sourceSchema = getNodeSchema(sourceNode.type);
//           if (sourceSchema?.outputSchema) {
//             sourceSchema.outputSchema.forEach((outputItem) => {
//               collectedOutputs.push({
//                 ...outputItem,
//                 name: `${sourceNode.data?.label || sourceNode.type} - ${outputItem.name}`,
//                 originalName: outputItem.name,
//                 sourceNodeId: sourceNode.id,
//               });
//             });
//           }
//           collectedOutputs.push(...findAllUpstreamOutputs(sourceNode.id, visited));
//         }
//       }
//       return collectedOutputs;
//     };

//     const nodeSchema = getNodeSchema(currentNode.type);
//     const availableInputs = findAllUpstreamOutputs(dataMappingModalNodeId);

//     return {
//       nodeId: currentNode.id,
//       nodeType: currentNode.type,
//       nodeLabel: currentNode.data?.label || currentNode.type,
//       baseInputSchema: nodeSchema?.inputSchema || [],
//       baseOutputSchema: nodeSchema?.outputSchema || [],
//       availableInputsFromPrevious: availableInputs,
//     };
//   }, [dataMappingModalNodeId, getNodeById, nodes, connections]);

//   // --- MINIMAP HANDLERS (from B) ---
//   const handleMinimapClick = useCallback((newOffset: CanvasOffset) => setCanvasOffset(newOffset), []);
//   const handleMinimapPan = useCallback((delta: CanvasOffset) => {
//     setCanvasOffset((prev) => ({ x: prev.x + delta.x, y: prev.y + delta.y }));
//   }, []);

//   return (
//     <div className="flex-1 relative overflow-hidden bg-gray-50">
//       {/* Canvas Controls (from B) */}
//       <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
//         <div className="bg-white rounded-lg shadow-lg border p-2 flex flex-col gap-1">
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button variant="ghost" size="sm" onClick={() => setIsSideModalOpen(true)} className="w-full justify-start">
//                   <Plus className="h-4 w-4 mr-2" />
//                   Add Node
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>Add a new node to the workflow</TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>
//         <div className="bg-white rounded-lg shadow-lg border p-2 flex flex-col gap-1">
//           <div className="flex items-center gap-1">
//             <TooltipProvider>
//               <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={handleZoomOut}><ZoomOut className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Zoom out</TooltipContent></Tooltip>
//             </TooltipProvider>
//             <Badge variant="outline" className="px-2 py-1 text-xs min-w-[60px] text-center">{Math.round(canvasScale * 100)}%</Badge>
//             <TooltipProvider>
//               <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={handleZoomIn}><ZoomIn className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Zoom in</TooltipContent></Tooltip>
//             </TooltipProvider>
//           </div>
//           <div className="w-32 px-1"><Slider value={[canvasScale]} onValueChange={([value]) => setCanvasScale(value)} min={0.1} max={3} step={0.1} /></div>
//           <div className="flex gap-1">
//             <TooltipProvider>
//               <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={handleResetView}><RotateCcw className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Reset view</TooltipContent></Tooltip>
//             </TooltipProvider>
//             <TooltipProvider>
//               <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={handleFitToScreen}><Maximize2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Fit to screen</TooltipContent></Tooltip>
//             </TooltipProvider>
//             <TooltipProvider>
//               <Tooltip><TooltipTrigger asChild><Button variant={showGrid ? "default" : "ghost"} size="sm" onClick={() => setShowGrid(!showGrid)}><Grid3X3 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Toggle grid</TooltipContent></Tooltip>
//             </TooltipProvider>
//           </div>
//         </div>
//       </div>

//       {/* Minimap (from B) */}
//       {showMinimap && (
//         <div className="absolute top-4 right-4 z-20 bg-white rounded-lg shadow-lg border overflow-hidden">
//           <Minimap nodes={nodes} connections={connections} canvasOffset={canvasOffset} canvasScale={canvasScale} onMinimapClick={handleMinimapClick} onMinimapPan={handleMinimapPan} />
//         </div>
//       )}

//       {/* Main Canvas */}
//       <div
//         ref={canvasRef}
//         className="w-full h-full cursor-grab active:cursor-grabbing"
//         style={showGrid ? canvasBackground : { background: "radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%)" }}
//         onMouseDown={handleCanvasMouseDown}
//         onMouseMove={handleCanvasMouseMove}
//         onMouseUp={handleCanvasMouseUp}
//         onWheel={handleCanvasWheel}
//         onDrop={handleDrop}
//         onDragOver={handleDragOver}
//       >
//         <div className="relative w-full h-full" style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasScale})`, transformOrigin: "0 0" }}>
//           <svg ref={svgRef} className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
//             {connections.map((connection) => {
//               const sourceNode = getNodeById(connection.sourceId);
//               const targetNode = getNodeById(connection.targetId);
//               if (!sourceNode || !targetNode) return null;
//               return (
//                 <ConnectionLine key={connection.id} connection={connection} sourceNode={sourceNode} targetNode={targetNode} onDelete={() => removeConnection(connection.id)} onInsertNode={handleInsertNode} />
//               );
//             })}
//             {pendingConnection && (
//               <PendingConnectionLine sourceNode={getNodeById(pendingConnection.sourceId) ?? null} mousePosition={mousePosition} />
//             )}
//           </svg>

//           {nodes.map((node) => (
//             <NodeComponent
//               key={node.id}
//               node={node}
//               selected={selectedNodeId === node.id}
//               isConnecting={!!pendingConnection && pendingConnection.sourceId === node.id}
//               onSelect={() => selectNode(node.id)}
//               onDragStart={handleNodeDragStart}
//               onExecuteNode={handleExecuteNode}
//               onOpenProperties={setPropertiesModalNodeId}
//               onOpenSchemaModal={handleOpenSchemaModal}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Connection helper text (from A) */}
//       {pendingConnection && (
//         <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm z-50">
//           Click on an input port to complete connection • Press ESC to cancel
//         </div>
//       )}

//       {/* Modals (Merged) */}
//       <SideModal isOpen={isSideModalOpen} onClose={() => setIsSideModalOpen(false)} onSelectNodeType={handleNodeTypeSelect} />

//       {propertiesModalNodeId && (
//         <NodeModal nodeId={propertiesModalNodeId} isOpen={!!propertiesModalNodeId} onClose={() => setPropertiesModalNodeId(null)} />
//       )}

//       <ExecutionModal isOpen={executionModalOpen} onClose={() => setExecutionModalOpen(false)} nodeId={executingNodeId} />
      
//       {dataMappingModalNodeId && schemaModalData && (
//         <SchemaModal
//           {...schemaModalData}
//           onClose={() => setDataMappingModalNodeId(null)}
//           onSaveMappings={(mappings) => { /* Implement save logic if needed */ }}
//         />
//       )}

//       {/* Status Bar (from B) */}
//       <div className="absolute bottom-4 left-4 z-20 bg-white rounded-lg shadow-lg border px-3 py-2 flex items-center gap-4 text-sm text-gray-600">
//         <span>{nodes.length} nodes</span>
//         <span>{connections.length} connections</span>
//         <span>Scale: {Math.round(canvasScale * 100)}%</span>
//         {selectedNodeId && (<Badge variant="outline">Selected: {getNodeById(selectedNodeId)?.data?.label || selectedNodeId}</Badge>)}
//       </div>
//     </div>
//   );
// }

// // Helper component for pending connection line
// function PendingConnectionLine({
//   sourceNode,
//   mousePosition,
// }: {
//   sourceNode: WorkflowNode | null;
//   mousePosition: { x: number; y: number };
// }) {
//   if (!sourceNode) return null;
//   const sourceX = sourceNode.position.x + 200; // Node width is 200px
//   const sourceY = sourceNode.position.y + 50; // Middle of right edge
//   const controlPointOffset = Math.abs(mousePosition.x - sourceX) * 0.5;
//   const path = `M ${sourceX} ${sourceY} C ${sourceX + controlPointOffset} ${sourceY}, ${mousePosition.x - controlPointOffset} ${mousePosition.y}, ${mousePosition.x} ${mousePosition.y}`;
//   return <path d={path} stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" fill="none" />;
// }


"use client";

import type React from "react";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  useWorkflow,
  type WorkflowNode,
  type NodeConnection,
} from "./workflow-context";
import { NodeComponent } from "./node-component";
import { ConnectionLine } from "./connection-line";
import { NodeModal } from "./node-modal";
 import { ExecutionModal } from "@/components/workflow/execution-modal";
import { SideModal } from "@/components/workflow/sidemodal";
import { Minimap } from "@/components/minimap/Minimap";
import SchemaModal from "./SchemaModal";
import { getNodeSchema } from "./nodeSchemas";
import {
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SchemaItem,
  SchemaModalData,
  NodeType,
} from "@/services/interface";

interface CanvasOffset {
  x: number;
  y: number;
}

export function WorkflowEditor() {
  const {
    nodes,
    connections,
    selectedNodeId,
    pendingConnection,
    setPendingConnection,
    propertiesModalNodeId,
    setPropertiesModalNodeId,
    dataMappingModalNodeId,
    setDataMappingModalNodeId,
    draggingNodeInfo,
    setDraggingNodeInfo,
    addNode,
    updateNode,
    removeConnection,
    addConnection, // Added from Code A logic
    selectNode,
    executeNode,
    getNodeById,
  } = useWorkflow();

  // --- MERGED STATE ---
  // Canvas State (from B)
  const [canvasOffset, setCanvasOffset] = useState<CanvasOffset>({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // UI State (Merged)
  const [isSideModalOpen, setIsSideModalOpen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);

  // Feature State (from A)
  const [connectionToSplit, setConnectionToSplit] = useState<NodeConnection | null>(null);
  const [insertPosition, setInsertPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [executingNodeId, setExecutingNodeId] = useState<string | null>(null);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // --- NEW CANVAS DESIGN (from B) ---
  const dynamicGridSize = useMemo(() => {
    const baseSize = gridSize;
    if (canvasScale < 0.5) return baseSize * 4;
    if (canvasScale < 0.75) return baseSize * 2;
    if (canvasScale > 2) return baseSize / 2;
    return baseSize;
  }, [gridSize, canvasScale]);

  const canvasBackground = useMemo(() => {
    const smallGrid = dynamicGridSize;
    const largeGrid = smallGrid * 5;
    const opacity = Math.min(canvasScale, 1) * 0.6;

    return {
      backgroundImage: `
        radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%),
        linear-gradient(rgba(148, 163, 184, ${opacity * 0.3}) 1px, transparent 1px),
        linear-gradient(90deg, rgba(148, 163, 184, ${opacity * 0.3}) 1px, transparent 1px),
        linear-gradient(rgba(59, 130, 246, ${opacity * 0.6}) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, ${opacity * 0.6}) 1px, transparent 1px)
      `,
      backgroundSize: `
        100% 100%,
        ${smallGrid}px ${smallGrid}px,
        ${smallGrid}px ${smallGrid}px,
        ${largeGrid}px ${largeGrid}px,
        ${largeGrid}px ${largeGrid}px
      `,
      backgroundPosition: `
        center center,
        ${canvasOffset.x}px ${canvasOffset.y}px,
        ${canvasOffset.x}px ${canvasOffset.y}px,
        ${canvasOffset.x}px ${canvasOffset.y}px,
        ${canvasOffset.x}px ${canvasOffset.y}px
      `,
    };
  }, [canvasOffset, canvasScale, dynamicGridSize, showGrid]);

  // --- MERGED CANVAS INTERACTION ---
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
        e.preventDefault();
        setIsPanning(true);
        setLastPanPoint({ x: e.clientX, y: e.clientY });
      } else if (e.button === 0 && e.target === e.currentTarget) {
        selectNode(null);
        setPendingConnection(null);
      }
    },
    [selectNode, setPendingConnection]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const deltaX = e.clientX - lastPanPoint.x;
        const deltaY = e.clientY - lastPanPoint.y;
        setCanvasOffset((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
        setLastPanPoint({ x: e.clientX, y: e.clientY });
      }
    },
    [isPanning, lastPanPoint]
  );

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleCanvasWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(3, canvasScale * delta));

      if (newScale !== canvasScale) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const scaleRatio = newScale / canvasScale;
          setCanvasOffset((prev) => ({
            x: mouseX - (mouseX - prev.x) * scaleRatio,
            y: mouseY - (mouseY - prev.y) * scaleRatio,
          }));
        }
        setCanvasScale(newScale);
      }
    },
    [canvasScale]
  );
  
  const handleNodeDragStart = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const node = getNodeById(nodeId);
      if (!node) return;
      const offsetX = (e.clientX - rect.left - canvasOffset.x) / canvasScale - node.position.x;
      const offsetY = (e.clientY - rect.top - canvasOffset.y) / canvasScale - node.position.y;
      setDraggingNodeInfo({ id: nodeId, offset: { x: offsetX, y: offsetY } });
      selectNode(nodeId);
    },
    [canvasOffset, canvasScale, getNodeById, setDraggingNodeInfo, selectNode]
  );
  
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (draggingNodeInfo) {
        const newX = (e.clientX - rect.left - canvasOffset.x) / canvasScale - draggingNodeInfo.offset.x;
        const newY = (e.clientY - rect.top - canvasOffset.y) / canvasScale - draggingNodeInfo.offset.y;
        updateNode(draggingNodeInfo.id, { position: { x: newX, y: newY } });
      }

      if (pendingConnection) {
        const x = (e.clientX - rect.left - canvasOffset.x) / canvasScale;
        const y = (e.clientY - rect.top - canvasOffset.y) / canvasScale;
        setMousePosition({ x, y });
      }
    };

    const handleGlobalMouseUp = () => {
      setDraggingNodeInfo(null);
      setIsPanning(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPendingConnection(null);
        setIsSideModalOpen(false);
        setPropertiesModalNodeId(null);
        setDataMappingModalNodeId(null);
        setExecutionModalOpen(false);
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    draggingNodeInfo, pendingConnection, canvasOffset, canvasScale, updateNode,
    setDraggingNodeInfo, setPendingConnection, setPropertiesModalNodeId,
    setDataMappingModalNodeId,
  ]);

  // --- CANVAS CONTROLS (from B) ---
  const handleZoomIn = () => setCanvasScale((prev) => Math.min(3, prev * 1.2));
  const handleZoomOut = () => setCanvasScale((prev) => Math.max(0.1, prev / 1.2));
  const handleResetView = () => {
    setCanvasScale(1);
    setCanvasOffset({ x: 0, y: 0 });
  };
  const handleFitToScreen = () => {
    if (nodes.length === 0) return handleResetView();
    const padding = 100;
    const minX = Math.min(...nodes.map((n) => n.position.x)) - padding;
    const minY = Math.min(...nodes.map((n) => n.position.y)) - padding;
    const maxX = Math.max(...nodes.map((n) => n.position.x + 200)) + padding; // Node width 200
    const maxY = Math.max(...nodes.map((n) => n.position.y + 100)) + padding; // Node height 100
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = rect.width / (maxX - minX);
    const scaleY = rect.height / (maxY - minY);
    const newScale = Math.min(scaleX, scaleY, 1);
    setCanvasScale(newScale);
    setCanvasOffset({
      x: (rect.width - (maxX - minX) * newScale) / 2 - minX * newScale,
      y: (rect.height - (maxY - minY) * newScale) / 2 - minY * newScale,
    });
  };

  // --- MERGED FEATURE HANDLERS ---
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData("nodeType") as NodeType;
      if (!nodeType) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - canvasOffset.x) / canvasScale;
      const y = (e.clientY - rect.top - canvasOffset.y) / canvasScale;
      addNode(nodeType, { x, y });
    },
    [canvasOffset, canvasScale, addNode]
  );
  
  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  const handleInsertNode = useCallback(
    (connection: NodeConnection, position: { x: number; y: number }) => {
      setConnectionToSplit(connection);
      setInsertPosition(position);
      setIsSideModalOpen(true);
    },
    []
  );

  const handleNodeTypeSelect = useCallback((nodeType: NodeType) => {
      if (connectionToSplit) {
        const newNodeId = addNode(nodeType, insertPosition);
        addConnection(connectionToSplit.sourceId, newNodeId);
        addConnection(newNodeId, connectionToSplit.targetId);
        removeConnection(connectionToSplit.id);
        setConnectionToSplit(null);
      } else {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (rect.width / 2 - canvasOffset.x) / canvasScale;
          const y = (rect.height / 2 - canvasOffset.y) / canvasScale;
          addNode(nodeType, { x, y });
        }
      }
      setIsSideModalOpen(false);
    },
    [connectionToSplit, insertPosition, addNode, addConnection, removeConnection, canvasOffset, canvasScale]
  );

  const handleExecuteNode = useCallback((nodeId: string) => {
      setExecutingNodeId(nodeId);
      setExecutionModalOpen(true);
      executeNode(nodeId);
    }, [executeNode]
  );

  // --- ROBUST SCHEMA MODAL LOGIC (MERGED) ---
  const handleOpenSchemaModal = useCallback((nodeId: string) => {
      setDataMappingModalNodeId(nodeId);
    }, [setDataMappingModalNodeId]
  );

  const schemaModalData = useMemo(() => {
    if (!dataMappingModalNodeId) return null;
    const currentNode = getNodeById(dataMappingModalNodeId);
    if (!currentNode) return null;

    // Recursive function from Code A for full upstream schema discovery
    const findAllUpstreamOutputs = (
      nodeId: string,
      visited = new Set<string>()
    ): SchemaItem[] => {
      if (visited.has(nodeId)) return [];
      visited.add(nodeId);
      const incomingConnections = connections.filter((conn) => conn.targetId === nodeId);
      let collectedOutputs: SchemaItem[] = [];

      for (const conn of incomingConnections) {
        const sourceNode = getNodeById(conn.sourceId);
        if (sourceNode) {
          const sourceSchema = getNodeSchema(sourceNode.type);
          if (sourceSchema?.outputSchema) {
            sourceSchema.outputSchema.forEach((outputItem) => {
              collectedOutputs.push({
                ...outputItem,
                name: `${sourceNode.data?.label || sourceNode.type} - ${outputItem.name}`,
                originalName: outputItem.name,
                sourceNodeId: sourceNode.id,
              });
            });
          }
          collectedOutputs.push(...findAllUpstreamOutputs(sourceNode.id, visited));
        }
      }
      return collectedOutputs;
    };

    const nodeSchema = getNodeSchema(currentNode.type);
    const availableInputs = findAllUpstreamOutputs(dataMappingModalNodeId);

    return {
      nodeId: currentNode.id,
      nodeType: currentNode.type,
      nodeLabel: currentNode.data?.label || currentNode.type,
      baseInputSchema: nodeSchema?.inputSchema || [],
      baseOutputSchema: nodeSchema?.outputSchema || [],
      availableInputsFromPrevious: availableInputs,
    };
  }, [dataMappingModalNodeId, getNodeById, nodes, connections]);

  // --- MINIMAP HANDLERS (from B) ---
  const handleMinimapClick = useCallback((newOffset: CanvasOffset) => setCanvasOffset(newOffset), []);
  const handleMinimapPan = useCallback((delta: CanvasOffset) => {
    setCanvasOffset((prev) => ({ x: prev.x + delta.x, y: prev.y + delta.y }));
  }, []);

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-50">
      {/* Canvas Controls (from B) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-lg border p-2 flex flex-col gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setIsSideModalOpen(true)} className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Node
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a new node to the workflow</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="bg-white rounded-lg shadow-lg border p-2 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={handleZoomOut}><ZoomOut className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Zoom out</TooltipContent></Tooltip>
            </TooltipProvider>
            <Badge variant="outline" className="px-2 py-1 text-xs min-w-[60px] text-center">{Math.round(canvasScale * 100)}%</Badge>
            <TooltipProvider>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={handleZoomIn}><ZoomIn className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Zoom in</TooltipContent></Tooltip>
            </TooltipProvider>
          </div>
          <div className="w-32 px-1"><Slider value={[canvasScale]} onValueChange={([value]) => setCanvasScale(value)} min={0.1} max={3} step={0.1} /></div>
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={handleResetView}><RotateCcw className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Reset view</TooltipContent></Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" onClick={handleFitToScreen}><Maximize2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Fit to screen</TooltipContent></Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip><TooltipTrigger asChild><Button variant={showGrid ? "default" : "ghost"} size="sm" onClick={() => setShowGrid(!showGrid)}><Grid3X3 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Toggle grid</TooltipContent></Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Minimap (from B) */}
      {showMinimap && (
        <div className="absolute top-4 right-4 z-20 bg-white rounded-lg shadow-lg border overflow-hidden">
          <Minimap nodes={nodes} connections={connections} canvasOffset={canvasOffset} canvasScale={canvasScale} onMinimapClick={handleMinimapClick} onMinimapPan={handleMinimapPan} />
        </div>
      )}

      {/* Main Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={showGrid ? canvasBackground : { background: "radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%)" }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onWheel={handleCanvasWheel}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="relative w-full h-full" style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasScale})`, transformOrigin: "0 0" }}>
          <svg ref={svgRef} className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            {connections.map((connection) => {
              const sourceNode = getNodeById(connection.sourceId);
              const targetNode = getNodeById(connection.targetId);
              if (!sourceNode || !targetNode) return null;
              return (
                <ConnectionLine key={connection.id} connection={connection} sourceNode={sourceNode} targetNode={targetNode} onDelete={() => removeConnection(connection.id)} onInsertNode={handleInsertNode} />
              );
            })}
            {pendingConnection && (
              <PendingConnectionLine sourceNode={getNodeById(pendingConnection.sourceId) ?? null} mousePosition={mousePosition} />
            )}
          </svg>

          {nodes.map((node) => (
            <NodeComponent
              key={node.id}
              node={node}
              selected={selectedNodeId === node.id}
              isConnecting={!!pendingConnection && pendingConnection.sourceId === node.id}
              onSelect={() => selectNode(node.id)}
              onDragStart={handleNodeDragStart}
              onExecuteNode={handleExecuteNode}
              onOpenProperties={setPropertiesModalNodeId}
              onOpenSchemaModal={handleOpenSchemaModal}
            />
          ))}
        </div>
      </div>

      {/* Connection helper text (from A) */}
      {pendingConnection && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm z-50">
          Click on an input port to complete connection • Press ESC to cancel
        </div>
      )}

      {/* Modals (Merged) */}
      <SideModal isOpen={isSideModalOpen} onClose={() => setIsSideModalOpen(false)} onSelectNodeType={handleNodeTypeSelect} />

      {propertiesModalNodeId && (
        <NodeModal nodeId={propertiesModalNodeId} isOpen={!!propertiesModalNodeId} onClose={() => setPropertiesModalNodeId(null)} />
      )}

      <ExecutionModal isOpen={executionModalOpen} onClose={() => setExecutionModalOpen(false)} nodeId={executingNodeId} />
      
      {dataMappingModalNodeId && schemaModalData && (
        <SchemaModal
          {...schemaModalData}
          onClose={() => setDataMappingModalNodeId(null)}
          onSaveMappings={(mappings) => { /* Implement save logic if needed */ }}
        />
      )}

      {/* Status Bar (from B) */}
      <div className="absolute bottom-4 left-4 z-20 bg-white rounded-lg shadow-lg border px-3 py-2 flex items-center gap-4 text-sm text-gray-600">
        <span>{nodes.length} nodes</span>
        <span>{connections.length} connections</span>
        <span>Scale: {Math.round(canvasScale * 100)}%</span>
        {selectedNodeId && (<Badge variant="outline">Selected: {getNodeById(selectedNodeId)?.data?.label || selectedNodeId}</Badge>)}
      </div>
    </div>
  );
}

// Helper component for pending connection line
function PendingConnectionLine({
  sourceNode,
  mousePosition,
}: {
  sourceNode: WorkflowNode | null;
  mousePosition: { x: number; y: number };
}) {
  if (!sourceNode) return null;
  const sourceX = sourceNode.position.x + 200; // Node width is 200px
  const sourceY = sourceNode.position.y + 50; // Middle of right edge
  const controlPointOffset = Math.abs(mousePosition.x - sourceX) * 0.5;
  const path = `M ${sourceX} ${sourceY} C ${sourceX + controlPointOffset} ${sourceY}, ${mousePosition.x - controlPointOffset} ${mousePosition.y}, ${mousePosition.x} ${mousePosition.y}`;
  return <path d={path} stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" fill="none" />;
}
