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
import { ExecutionModal } from "./execution-modal";
import { SideModal } from "./sidemodal";
import SchemaModal from "./SchemaModal";
import { getNodeSchema } from "./nodeSchemas";
import {
  type SchemaItem,
  type SchemaModalData,
  NodeType,
} from "@/services/interface";
import {Minimap} from "@/components/minimap/Minimap"

// Lucide Icons for UI controls
import {
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Grid3X3,
  Eye,
  EyeOff,
} from "lucide-react";
// Assuming UI components from a library like shadcn/ui
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define representative node dimensions (adjust if necessary)
const NODE_WIDTH = 100;
const NODE_HEIGHT = 100; // NodeComponent port is at Y=50, implying height could be 100

export function WorkflowEditor() {
  const {
    nodes,
    connections,
    selectedNodeId,
    pendingConnection,
    setPendingConnection,
    addNode,
    updateNode,
    selectNode,
    removeConnection,
    executeNode,
    addConnection,
  } = useWorkflow();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 }); // In content coordinates (pre-scale)
  const [canvasScale, setCanvasScale] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [sideModalOpen, setSideModalOpen] = useState(false);
  const [insertPosition, setInsertPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [connectionToSplit, setConnectionToSplit] =
    useState<NodeConnection | null>(null);
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [executingNodeId, setExecutingNodeId] = useState<string | null>(null);
  // const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(false); // Not used directly in new controls
  const [activeNodeForModal, setActiveNodeForModal] =
    useState<WorkflowNode | null>(null);

  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  // const [nodeTypeForSchemaModal, setNodeTypeForSchemaModal] = useState<NodeType | null>(null); // Not used
  const [modalOpen, setModalOpen] = useState(false); // For NodeModal (properties)
  const [schemaModalData, setSchemaModalData] =
    useState<SchemaModalData | null>(null);

  // Grid and Minimap State
  const [gridSize] = useState(20); // Base grid size in pixels at 1x zoom
  const [showGrid, setShowGrid] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);

  const dynamicGridSize = useMemo(() => {
    const baseSize = gridSize;
    if (canvasScale < 0.5) return baseSize * 4;
    if (canvasScale < 0.75) return baseSize * 2;
    if (canvasScale > 2) return baseSize / 2; // For scales up to 2.5
    return baseSize;
  }, [gridSize, canvasScale]);

  const canvasBackgroundStyle = useMemo(() => {
    const plainBgColor = "hsl(var(--background))"; // Example: using CSS var for background
                                                  // or specific: '#f0f4f8' (light blueish gray)

    if (!showGrid) {
      return { backgroundColor: plainBgColor };
    }

    const smallGrid = dynamicGridSize;
    const largeGrid = smallGrid * 5;
    const baseOpacity = 0.4; // Adjusted for better visibility
    const lineOpacity = Math.min(1, canvasScale * 0.6) * baseOpacity;

    return {
      backgroundImage: `
            linear-gradient(rgba(200, 200, 200, ${
              lineOpacity * 0.5
            }) 0.5px, transparent 0.5px),
            linear-gradient(90deg, rgba(200, 200, 200, ${
              lineOpacity * 0.5
            }) 0.5px, transparent 0.5px),
            linear-gradient(rgba(180, 180, 180, ${lineOpacity}) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180, 180, 180, ${lineOpacity}) 1px, transparent 1px)
        `,
      backgroundSize: `
            ${smallGrid}px ${smallGrid}px,
            ${smallGrid}px ${smallGrid}px,
            ${largeGrid}px ${largeGrid}px,
            ${largeGrid}px ${largeGrid}px
        `,
      backgroundPosition: `
            ${canvasOffset.x * canvasScale}px ${canvasOffset.y * canvasScale}px,
            ${canvasOffset.x * canvasScale}px ${canvasOffset.y * canvasScale}px,
            ${canvasOffset.x * canvasScale}px ${canvasOffset.y * canvasScale}px,
            ${canvasOffset.x * canvasScale}px ${canvasOffset.y * canvasScale}px
        `,
      backgroundColor: plainBgColor,
    };
  }, [canvasOffset, canvasScale, dynamicGridSize, showGrid]);

  const handleOpenSchemaModal = useCallback(/* ... as in your original code ... */
    (nodeId: string) => {
      const targetNode = nodes.find((n) => n.id === nodeId);
      if (!targetNode) {
        console.error("Target node not found for schema modal:", nodeId);
        return;
      }

      const nodeType = targetNode.type;
      const baseSchema = getNodeSchema(nodeType);

      if (!baseSchema) {
        console.warn("Schema not found for node type:", nodeType, "- using empty schema.");
        setSchemaModalData({
           nodeId,
          nodeType,
          baseInputSchema: [],
          baseOutputSchema: [],
          availableInputsFromPrevious: [],
          nodeLabel: targetNode.data?.label || nodeType,
        });
        setIsSchemaModalOpen(true);
        return;
      }
      const findAllUpstreamOutputs = (
        currentNodeId: string,
        visited = new Set<string>()
      ): SchemaItem[] => {
        if (visited.has(currentNodeId)) return [];
        visited.add(currentNodeId);

        const incomingConnections = connections.filter(
          (conn) => conn.targetId === currentNodeId
        );
        let collectedOutputs: SchemaItem[] = [];
        for (const conn of incomingConnections) {
          const sourceNode = nodes.find((n) => n.id === conn.sourceId);
          if (sourceNode) {
            const sourceSchema = getNodeSchema(sourceNode.type);
            if (sourceSchema?.outputSchema) {
              sourceSchema.outputSchema.forEach((outputItem) => {
                const uniqueName = `${
                  sourceNode.data?.label || sourceNode.type
                } - ${outputItem.name}`;
                collectedOutputs.push({
                  ...outputItem,
                  name: uniqueName,
                  description: `${outputItem.description || ""} (from ${
                    sourceNode.data?.label || sourceNode.type
                  })`,
                  originalName: outputItem.name,
                  sourceNodeId: sourceNode.id,
                });
              });
            }
            const upstreamOutputs = findAllUpstreamOutputs(
              sourceNode.id,
              visited
            );
            collectedOutputs = collectedOutputs.concat(upstreamOutputs);
          }
        }
        return collectedOutputs;
      };
      const availableInputs = findAllUpstreamOutputs(nodeId);
      setSchemaModalData({
        nodeId,
        nodeType,
        baseInputSchema: baseSchema.inputSchema || [],
        baseOutputSchema: baseSchema.outputSchema || [],
        availableInputsFromPrevious: availableInputs,
        nodeLabel: targetNode.data?.label || nodeType,
      });
      setIsSchemaModalOpen(true);
    },
    [nodes, connections]
  );

  const handleCloseSchemaModal = () => {
    setSchemaModalData(null);
    setIsSchemaModalOpen(false);
  };

  const handleDrop = useCallback(/* ... as in your original code ... */
    (e: React.DragEvent) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData("nodeType") as NodeType;
      if (!nodeType) return;
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      const x = (e.clientX - canvasRect.left) / canvasScale - canvasOffset.x;
      const y = (e.clientY - canvasRect.top) / canvasScale - canvasOffset.y;
      addNode(nodeType, { x, y });
    },
    [addNode, canvasScale, canvasOffset]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  const startNodeDrag = useCallback(/* ... as in your original code ... */
    (nodeId: string, e: React.MouseEvent) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      setIsDragging(true);
      selectNode(nodeId);
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      // Offset is mouse position relative to top-left of node, scaled by current zoom
      const scaledNodeX = node.position.x * canvasScale + canvasOffset.x * canvasScale;
      const scaledNodeY = node.position.y * canvasScale + canvasOffset.y * canvasScale;
      setDragOffset({
        x: e.clientX - canvasRect.left - scaledNodeX,
        y: e.clientY - canvasRect.top - scaledNodeY,
      });
    },
    [nodes, selectNode, canvasScale, canvasOffset]
  );

  const handleMouseMove = useCallback(/* ... as in your original code ... */
    (e: MouseEvent) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const currentMouseX = (e.clientX - canvasRect.left);
      const currentMouseY = (e.clientY - canvasRect.top);

      setMousePosition({
        x: (currentMouseX / canvasScale) - canvasOffset.x,
        y: (currentMouseY / canvasScale) - canvasOffset.y,
      });

      if (isDragging && selectedNodeId) {
        const newX = (currentMouseX - dragOffset.x) / canvasScale - canvasOffset.x;
        const newY = (currentMouseY - dragOffset.y) / canvasScale - canvasOffset.y;
        updateNode(selectedNodeId, { position: { x: newX, y: newY } });
      }
    },
    [isDragging, selectedNodeId, dragOffset, updateNode, canvasScale, canvasOffset]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleCanvasClick = useCallback(() => {
    if (pendingConnection) {
      setPendingConnection(null);
    } else {
      selectNode(null);
      setModalOpen(false); // Close NodeModal (properties)
    }
  }, [pendingConnection, setPendingConnection, selectNode]);

  useEffect(() => { /* ... event listeners as in your original code ... */
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPendingConnection(null);
        setSideModalOpen(false);
        setModalOpen(false); // Close NodeModal
        setIsSchemaModalOpen(false); // Close SchemaModal
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
  }, [handleMouseMove, handleMouseUp, setPendingConnection]);

  

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const scrollSensitivity = 0.1; // Make it consistent with first example
      const deltaFactor = e.deltaY > 0 ? 1 - scrollSensitivity : 1 + scrollSensitivity;
      const newScale = Math.max(0.2, Math.min(2.5, canvasScale * deltaFactor));

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const mouseX = e.clientX - canvasRect.left; // Mouse position relative to viewport
      const mouseY = e.clientY - canvasRect.top;

      // Calculate new offset to zoom towards mouse position
      // Tx_new = (MouseX_vp / S_new) - (MouseX_vp / S_old - Tx_old)
      const newOffsetX = mouseX / newScale - (mouseX / canvasScale - canvasOffset.x);
      const newOffsetY = mouseY / newScale - (mouseY / canvasScale - canvasOffset.y);

      setCanvasScale(newScale);
      setCanvasOffset({ x: newOffsetX, y: newOffsetY });
    },
    [canvasScale, canvasOffset]
  );

useEffect(() => {
  const el = canvasRef.current;
  if (!el) return;

  // Native wheel event handler that delegates to handleWheel
  const nativeWheelHandler = (e: WheelEvent) => {
    // Create a synthetic React-like event object for handleWheel
    // but only pass the native event, since handleWheel expects a React.WheelEvent
    // We'll need to adapt handleWheel to accept native events
    // Or, just inline the logic here (recommended for clarity)
    e.preventDefault();
    const scrollSensitivity = 0.1;
    const deltaFactor = e.deltaY > 0 ? 1 - scrollSensitivity : 1 + scrollSensitivity;
    const newScale = Math.max(0.2, Math.min(2.5, canvasScale * deltaFactor));

    const canvasRect = el.getBoundingClientRect();
    if (!canvasRect) return;

    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    const newOffsetX = mouseX / newScale - (mouseX / canvasScale - canvasOffset.x);
    const newOffsetY = mouseY / newScale - (mouseY / canvasScale - canvasOffset.y);

    setCanvasScale(newScale);
    setCanvasOffset({ x: newOffsetX, y: newOffsetY });
  };

  el.addEventListener("wheel", nativeWheelHandler, { passive: false });

  return () => {
    el.removeEventListener("wheel", nativeWheelHandler);
  };
}, [canvasScale, canvasOffset]);


  const getPendingConnectionSourceNode = useCallback(() => {
    if (!pendingConnection) return null;
    return nodes.find((node) => node.id === pendingConnection.sourceId) || null;
  }, [pendingConnection, nodes]);

  const handleInsertNode = useCallback(/* ... as in your original code ... */
    (connection: NodeConnection, position: { x: number; y: number }) => {
      setConnectionToSplit(connection);
      setInsertPosition(position);
      setSideModalOpen(true);
    }, []
  );

  const handleNodeTypeSelect = useCallback(/* ... as in your original code ... */
    (nodeType: NodeType) => {
      if (connectionToSplit) {
        const newNodeId = addNode(nodeType, insertPosition);
        if (newNodeId) { // Check if addNode returned an ID
          addConnection(connectionToSplit.sourceId, newNodeId);
          addConnection(newNodeId, connectionToSplit.targetId);
          removeConnection(connectionToSplit.id);
        }
        setConnectionToSplit(null);
      } else {
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (canvasRect) {
          const centerX = (canvasRect.width / 2 / canvasScale) - canvasOffset.x;
          const centerY = (canvasRect.height / 2 / canvasScale) - canvasOffset.y;
          addNode(nodeType, { x: centerX, y: centerY });
        }
      }
      setSideModalOpen(false);
    },
    [connectionToSplit, insertPosition, addNode, addConnection, removeConnection, canvasScale, canvasOffset]
  );

  const handleExecuteNode = useCallback(/* ... as in your original code ... */
    (nodeId: string) => {
      setExecutingNodeId(nodeId);
      setExecutionModalOpen(true);
      executeNode(nodeId);
    }, [executeNode]
  );

  const toggleSideModal = useCallback(() => {
    setSideModalOpen((prev) => !prev);
  }, []);

  const handleOpenProperties = useCallback((nodeId: string) => {
    selectNode(nodeId);
    setModalOpen(true); // This opens NodeModal
  }, [selectNode]);

  const handleCloseProperties = useCallback(() => setModalOpen(false), []);

  // New UI Control Handlers
  const handleZoomIn = () => setCanvasScale((prev) => Math.min(2.5, prev * 1.2));
  const handleZoomOut = () => setCanvasScale((prev) => Math.max(0.2, prev / 1.2));
  const handleResetView = () => {
    setCanvasScale(1);
    setCanvasOffset({ x: 0, y: 0 }); // Reset to origin of content space
  };

  const handleFitToScreen = () => {
    if (nodes.length === 0 || !canvasRef.current) {
      handleResetView();
      return;
    }
    const padding = 50; // Screen pixels padding
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach(n => {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + NODE_WIDTH);
      maxY = Math.max(maxY, n.position.y + NODE_HEIGHT);
    });

    if (maxX === -Infinity) { handleResetView(); return; }

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    if (canvasRect.width <= 0 || canvasRect.height <= 0 || contentWidth <=0 || contentHeight <=0) {
        handleResetView();
        return;
    }

    const scaleX = (canvasRect.width - 2 * padding) / contentWidth;
    const scaleY = (canvasRect.height - 2 * padding) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 2.5); // Cap at max zoom

    setCanvasScale(newScale);
    // New offset to center the content bounding box (with padding)
    const newOffsetX = (padding / newScale) - minX;
    const newOffsetY = (padding / newScale) - minY;
    setCanvasOffset({ x: newOffsetX, y: newOffsetY });
  };

  // Minimap click handler
  const handleMinimapClick = useCallback((newContentOffset: { x: number; y: number }) => {
    setCanvasOffset(newContentOffset);
  }, []);


  function DotsBackground() { /* ... as in your original code ... */
    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1.2" fill="rgba(38, 37, 37, 0.2)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
    );
  }

  return (
    // Use a general background color for the editor area, canvas gets its own specific BG
    <div className="relative flex-1 overflow-hidden bg-background dark:bg-background">
      <TooltipProvider>
        {/* Toolbar */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-card dark:bg-card p-1.5 rounded-md shadow-lg border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleSideModal}>
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Node</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
          <Badge variant="outline" className="px-2 py-0.5 text-xs min-w-[50px] text-center h-7 flex items-center select-none">
            {Math.round(canvasScale * 100)}%
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleResetView}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset View</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFitToScreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit to Screen</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={showGrid ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setShowGrid(s => !s)}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Grid</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={showMinimap ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setShowMinimap(s => !s)}>
                {showMinimap ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Minimap</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Minimap */}
      {showMinimap && canvasRef.current && (
          <div className="absolute top-2 right-2 z-10 bg-card dark:bg-card rounded-md shadow-lg border dark:border-border overflow-hidden">
              <Minimap
                  nodes={nodes}
                  connections={connections}
                  canvasOffset={canvasOffset}
                  canvasScale={canvasScale}
                  viewportWidth={canvasRef.current.clientWidth}
                  viewportHeight={canvasRef.current.clientHeight}
                  onMinimapClick={handleMinimapClick}
                  nodeWidth={NODE_WIDTH}
                  nodeHeight={NODE_HEIGHT}
              />
          </div>
      )}

      <div
        ref={canvasRef}
        className="h-full w-full overflow-hidden" // Removed cursor-grab, let specific interactions handle cursors
        style={canvasBackgroundStyle} // Apply dynamic grid or plain background
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        // onWheel={handleWheel}
        onClick={handleCanvasClick}
      >

        


        {!showGrid && <DotsBackground />} {/* Show dots if grid is off */}
        <div
          className="h-full w-full" // transformOrigin is default 0 0
          style={{
            transform: `scale(${canvasScale}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
            transformOrigin: "0 0", // Explicitly set
          }}
        >
          {/* Connections */}
          <svg className="absolute h-full w-full pointer-events-none overflow-visible">
            {connections.map((connection) => {
              const source = nodes.find((n) => n.id === connection.sourceId);
              const target = nodes.find((n) => n.id === connection.targetId);
              if (!source || !target || source.data?.active === false || target.data?.active === false) return null;
              return (
                <ConnectionLine
                  key={connection.id}
                  connection={connection}
                  sourceNode={source}
                  targetNode={target}
                  onDelete={() => removeConnection(connection.id)}
                  onInsertNode={handleInsertNode}
                />
              );
            })}
            {pendingConnection && (
              <PendingConnectionLine
                sourceNode={getPendingConnectionSourceNode()}
                mousePosition={mousePosition}
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <NodeComponent
              key={node.id}
              node={node}
              selected={node.id === selectedNodeId}
              isConnecting={!!pendingConnection && pendingConnection.sourceId === node.id}
              onSelect={() => {
                if (isSchemaModalOpen || modalOpen || sideModalOpen || executionModalOpen) return;
                selectNode(node.id);
              }}
              onDragStart={startNodeDrag}
              onExecuteNode={handleExecuteNode}
              onOpenProperties={handleOpenProperties}
              onOpenSchemaModal={handleOpenSchemaModal}
            />
          ))}
        </div>
      </div>

      {pendingConnection && ( /* ... Connection helper text ... */
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm z-50">
          Click on an input port to complete connection • Press ESC to cancel
        </div>
      )}
      {selectedNodeId && ( /* ... Node Modal ... */
        <NodeModal nodeId={selectedNodeId} isOpen={modalOpen} onClose={handleCloseProperties} />
      )}
      <SideModal /* ... Side modal ... */
        isOpen={sideModalOpen}
        onClose={() => setSideModalOpen(false)}
        onSelectNodeType={handleNodeTypeSelect}
      />
      <ExecutionModal /* ... Execution modal ... */
        isOpen={executionModalOpen}
        onClose={() => setExecutionModalOpen(false)}
        nodeId={executingNodeId}
      />
      {schemaModalData && ( /* ... Schema Modal ... */
        <SchemaModal
          nodeId={schemaModalData.nodeId}
          nodeType={schemaModalData.nodeType}
          nodeLabel={schemaModalData.nodeLabel}
          baseInputSchema={schemaModalData.baseInputSchema}
          baseOutputSchema={schemaModalData.baseOutputSchema}
          availableInputsFromPrevious={schemaModalData.availableInputsFromPrevious}
          onClose={handleCloseSchemaModal}
          // Assuming SchemaModal has an onSave or similar prop if needed
        />
      )}
    </div>
  );
}

function PendingConnectionLine({ /* ... as in your original code ... */
  sourceNode,
  mousePosition,
}: {
  sourceNode: WorkflowNode | null;
  mousePosition: { x: number; y: number };
}) {
  if (!sourceNode) return null;
  const sourceX = sourceNode.position.x + NODE_WIDTH; // Node width
  const sourceY = sourceNode.position.y + NODE_HEIGHT / 2; // Port at middle-right

  const controlPointOffset = Math.max(50, Math.abs(mousePosition.x - sourceX) * 0.3);
  const path = `M ${sourceX} ${sourceY} C ${sourceX + controlPointOffset} ${sourceY}, ${mousePosition.x - controlPointOffset} ${mousePosition.y}, ${mousePosition.x} ${mousePosition.y}`;
  return <path d={path} stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" fill="none" />;
}
