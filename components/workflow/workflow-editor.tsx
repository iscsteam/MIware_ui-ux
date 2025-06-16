"use client";

import type React from "react";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  useWorkflow,
  type WorkflowNode as ContextWorkflowNode,
  type NodeConnection as ContextNodeConnection,
  type DAG,
  type WorkflowNodeData, // Assuming WorkflowNodeData is exported from context
} from "@/components/workflow/workflow-context";
import { NodeComponent } from "@/components/workflow/node-component"; // Removed type NodeComponentProps as it's defined in node-component
import { ConnectionLine } from "@/components/workflow/connection-line"; // Removed type ConnectionLineProps
import { NodeModal } from "@/components/workflow/node-modal";
import { SideModal } from "@/components/workflow/sidemodal";
import { Minimap } from "@/components/minimap/Minimap";
import {
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Grid3X3,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type SchemaItem,
  type SchemaModalData,
  NodeType,
} from "@/services/interface";
import SchemaModal from "@/components/workflow/SchemaModal";
import { getNodeSchema } from "@/components/workflow/nodeSchemas";

const NODE_WIDTH = 100;
const NODE_HEIGHT = 60; // Base height, name display adds more

interface CanvasOffset {
  x: number;
  y: number;
}

interface WorkflowEditorProps {
  initialDagData?: DAG;
  onClose?: () => void;
  dagId?: string;
}

// Ensure WorkflowNodeData in context includes this if you use it
// interface WorkflowNodeDataExtended extends WorkflowNodeData {
//   fieldMappings?: Record<string, string>; // Example type for mappings
// }

export function WorkflowEditor({
  initialDagData,
  onClose,
  dagId,
}: WorkflowEditorProps) {
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
    addConnection,
    selectNode,
    executeNode,
    getNodeById,
    loadWorkflowFromDAG,
    clearWorkflow,
    runWorkflow,
    removeNode,
  } = useWorkflow();

  const [canvasOffset, setCanvasOffset] = useState<CanvasOffset>({
    x: 0,
    y: 0,
  });
  const [canvasScale, setCanvasScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [isSideModalOpen, setIsSideModalOpen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize] = useState(20);

  const canvasRef = useRef<HTMLDivElement>(null);

  const [insertContext, setInsertContext] = useState<{
    connection: ContextNodeConnection;
    position: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    if (initialDagData) {
      if (clearWorkflow) clearWorkflow();
      loadWorkflowFromDAG(initialDagData).catch((err) => {
        console.error("WorkflowEditor: Error loading initial DAG data", err);
      });
    } else if (dagId && !nodes.length && !initialDagData) {
      console.warn(
        `WorkflowEditor: dagId ${dagId} provided but no fetching logic implemented yet to load by ID directly.`
      );
    }
  }, [initialDagData, loadWorkflowFromDAG, clearWorkflow, dagId, nodes.length]);

  const dynamicGridSize = useMemo(() => {
    const baseSize = gridSize;
    if (canvasScale < 0.5) return baseSize * 4;
    if (canvasScale < 0.75) return baseSize * 2;
    if (canvasScale > 2) return baseSize / 2;
    return baseSize;
  }, [gridSize, canvasScale]);

  const canvasBackground = useMemo(() => {
    if (!showGrid)
      return {
        background:
          "radial-gradient(circle at center, rgba(59, 130, 246, 0.03) 0%, transparent 70%)",
      };
    const smallGrid = dynamicGridSize;
    const largeGrid = smallGrid * 5;
    const baseOpacity = 0.5;
    const adjustedOpacity = Math.min(canvasScale * 0.7, 1) * baseOpacity;

    return {
      backgroundImage: `
            radial-gradient(circle at center, rgba(59, 130, 246, 0.03) 0%, transparent 60%),
            linear-gradient(rgba(200, 200, 200, ${
              adjustedOpacity * 0.3
            }) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200, 200, 200, ${
              adjustedOpacity * 0.3
            }) 1px, transparent 1px),
            linear-gradient(rgba(180, 180, 180, ${
              adjustedOpacity * 0.6
            }) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180, 180, 180, ${
              adjustedOpacity * 0.6
            }) 1px, transparent 1px)
        `,
      backgroundSize: `100% 100%, ${smallGrid}px ${smallGrid}px, ${smallGrid}px ${smallGrid}px, ${largeGrid}px ${largeGrid}px, ${largeGrid}px ${largeGrid}px`,
      backgroundPosition: `center center, ${canvasOffset.x}px ${canvasOffset.y}px, ${canvasOffset.x}px ${canvasOffset.y}px, ${canvasOffset.x}px ${canvasOffset.y}px, ${canvasOffset.x}px ${canvasOffset.y}px`,
    };
  }, [canvasOffset, canvasScale, dynamicGridSize, showGrid]);

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        setIsPanning(true);
        setLastPanPoint({ x: e.clientX, y: e.clientY });
        if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
      } else if (e.button === 0 && e.target === e.currentTarget) {
        if (selectNode) selectNode(null);
        if (setPendingConnection) setPendingConnection(null);
      }
    },
    [selectNode, setPendingConnection]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const deltaX = e.clientX - lastPanPoint.x;
        const deltaY = e.clientY - lastPanPoint.y;
        setCanvasOffset((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        setLastPanPoint({ x: e.clientX, y: e.clientY });
      }
      if (pendingConnection && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - canvasOffset.x) / canvasScale;
        const y = (e.clientY - rect.top - canvasOffset.y) / canvasScale;
        setMousePosition({ x, y });
      }
    },
    [
      isPanning,
      lastPanPoint,
      pendingConnection,
      canvasOffset.x,
      canvasOffset.y,
      canvasScale,
    ]
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    }
  }, [isPanning]);

  const handleCanvasWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const scrollSensitivity = 0.1;
      const delta =
        e.deltaY > 0 ? 1 - scrollSensitivity : 1 + scrollSensitivity;
      const newScale = Math.max(0.2, Math.min(2.5, canvasScale * delta));

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newOffsetX =
          mouseX - (mouseX - canvasOffset.x) * (newScale / canvasScale);
        const newOffsetY =
          mouseY - (mouseY - canvasOffset.y) * (newScale / canvasScale);

        setCanvasOffset({ x: newOffsetX, y: newOffsetY });
        setCanvasScale(newScale);
      }
    },
    [canvasScale, canvasOffset.x, canvasOffset.y]
  );

  const handleNodeDragStart = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect || !getNodeById) return;
      const node = getNodeById(nodeId);
      if (!node) return;

      const mouseCanvasX =
        (e.clientX - rect.left - canvasOffset.x) / canvasScale;
      const mouseCanvasY =
        (e.clientY - rect.top - canvasOffset.y) / canvasScale;

      const offsetX = mouseCanvasX - node.position.x;
      const offsetY = mouseCanvasY - node.position.y;

      if (setDraggingNodeInfo)
        setDraggingNodeInfo({ id: nodeId, offset: { x: offsetX, y: offsetY } });
      if (selectNode) selectNode(nodeId);
    },
    [canvasOffset, canvasScale, getNodeById, setDraggingNodeInfo, selectNode]
  );

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggingNodeInfo && canvasRef.current && updateNode) {
        const rect = canvasRef.current.getBoundingClientRect();
        const newX =
          (e.clientX - rect.left - canvasOffset.x) / canvasScale -
          draggingNodeInfo.offset.x;
        const newY =
          (e.clientY - rect.top - canvasOffset.y) / canvasScale -
          draggingNodeInfo.offset.y;
        updateNode(draggingNodeInfo.id, { position: { x: newX, y: newY } });
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (draggingNodeInfo && setDraggingNodeInfo) {
        setDraggingNodeInfo(null);
      }
      if (isPanning) {
        setIsPanning(false);
        if (canvasRef.current) canvasRef.current.style.cursor = "grab";
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const targetElement = e.target as HTMLElement;
      const isInputFocused =
        targetElement.tagName === "INPUT" ||
        targetElement.tagName === "TEXTAREA" ||
        targetElement.isContentEditable;

      if (e.key === "Escape") {
        if (setPendingConnection) setPendingConnection(null);
        setIsSideModalOpen(false);
        if (setPropertiesModalNodeId) setPropertiesModalNodeId(null);
        if (setDataMappingModalNodeId) setDataMappingModalNodeId(null);
        if (selectNode) selectNode(null);
        setInsertContext(null);
      }

      if (
        !isInputFocused &&
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedNodeId &&
        removeNode &&
        removeConnection &&
        getNodeById
      ) {
        e.preventDefault();
        const node = getNodeById(selectedNodeId);
        if (node && node.type !== "start" && node.type !== "end") {
          const connectionsToDelete = connections.filter(
            (conn) =>
              conn.sourceId === selectedNodeId ||
              conn.targetId === selectedNodeId
          );
          connectionsToDelete.forEach((conn) => removeConnection(conn.id));
          removeNode(selectedNodeId);
          if (selectNode) selectNode(null);
        }
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
    draggingNodeInfo,
    canvasOffset,
    canvasScale,
    updateNode,
    setDraggingNodeInfo,
    setPendingConnection,
    isPanning,
    selectNode,
    selectedNodeId,
    setPropertiesModalNodeId,
    setDataMappingModalNodeId,
    removeConnection,
    removeNode,
    getNodeById,
    connections,
  ]);

  const handleZoomIn = () =>
    setCanvasScale((prev) => Math.min(2.5, prev * 1.2));
  const handleZoomOut = () =>
    setCanvasScale((prev) => Math.max(0.2, prev / 1.2));
  const handleResetView = () => {
    setCanvasScale(1);
    setCanvasOffset({ x: 0, y: 0 });
  };

  const handleFitToScreen = () => {
    if (nodes.length === 0) return handleResetView();
    const padding = 50;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    nodes.forEach((n) => {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + NODE_WIDTH);
      maxY = Math.max(maxY, n.position.y + NODE_HEIGHT + 20);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    if (contentWidth <= 0 || contentHeight <= 0) return handleResetView();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const scaleX = (rect.width - 2 * padding) / contentWidth;
    const scaleY = (rect.height - 2 * padding) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 1.5);

    setCanvasScale(newScale);
    setCanvasOffset({
      x: (rect.width - contentWidth * newScale) / 2 - minX * newScale + padding,
      y:
        (rect.height - contentHeight * newScale) / 2 -
        minY * newScale +
        padding,
    });
  };

  const handleNodeTypeSelectFromSideModalGeneral = useCallback(
    (nodeType: NodeType) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      let x = NODE_WIDTH,
        y = NODE_HEIGHT;
      if (rect) {
        x = (rect.width / 2 - canvasOffset.x) / canvasScale;
        y = (rect.height / 2 - canvasOffset.y) / canvasScale;
      }
      if (addNode)
        addNode(nodeType, { x, y }, { label: nodeType, displayName: nodeType });
      setIsSideModalOpen(false);
    },
    [addNode, canvasOffset, canvasScale]
  );

  const prepareInsertNodeOnConnection = useCallback(
    (connection: ContextNodeConnection, position: { x: number; y: number }) => {
      setInsertContext({ connection, position });
      setIsSideModalOpen(true);
    },
    []
  );

  const finalizeInsertNodeOnConnection = useCallback(
    (nodeType: NodeType) => {
      if (!insertContext || !removeConnection || !addNode || !addConnection)
        return;

      const { connection, position } = insertContext;
      removeConnection(connection.id);
      const newNodeId = addNode(nodeType, position, {
        label: nodeType,
        displayName: nodeType,
      });

      if (newNodeId) {
        addConnection(connection.sourceId, newNodeId);
        addConnection(newNodeId, connection.targetId);
      } else {
        console.error(
          "Failed to create new node during insertion on connection."
        );
        addConnection(connection.sourceId, connection.targetId);
      }
      setInsertContext(null);
      setIsSideModalOpen(false);
    },
    [insertContext, removeConnection, addNode, addConnection]
  );

  const handleOpenSchemaModal = useCallback(
    (nodeId: string) => {
      if (setDataMappingModalNodeId) setDataMappingModalNodeId(nodeId);
    },
    [setDataMappingModalNodeId]
  );

  const schemaModalData = useMemo((): SchemaModalData | null => {
    if (!dataMappingModalNodeId || !getNodeById) return null;
    const currentNode = getNodeById(dataMappingModalNodeId);
    if (!currentNode) return null;

    const findAllUpstreamOutputs = (
      targetNodeId: string,
      visited = new Set<string>()
    ): SchemaItem[] => {
      if (visited.has(targetNodeId)) return [];
      visited.add(targetNodeId);
      const upstreamOutputs: SchemaItem[] = [];
      connections.forEach((conn) => {
        if (conn.targetId === targetNodeId) {
          const sourceNode = getNodeById(conn.sourceId);
          if (sourceNode) {
            const sourceSchema = getNodeSchema(sourceNode.type);
            if (sourceSchema?.outputSchema) {
              upstreamOutputs.push(
                ...sourceSchema.outputSchema.map((item) => ({
                  ...item,
                  sourceNodeId: sourceNode.id,
                  sourceNodeLabel:
                    sourceNode.data.displayName ||
                    sourceNode.data.label ||
                    sourceNode.type,
                }))
              );
            }
          }
        }
      });
      return Array.from(
        new Map(
          upstreamOutputs.map((item) => [
            `${item.sourceNodeId}-${item.name}`,
            item,
          ])
        ).values()
      ); // Ensure unique items
    };

    const nodeSchema = getNodeSchema(currentNode.type);
    const availableInputs = findAllUpstreamOutputs(dataMappingModalNodeId);

    return {
      nodeId: currentNode.id,
      nodeType: currentNode.type,
      nodeLabel:
        currentNode.data?.displayName ||
        currentNode.data?.label ||
        currentNode.type,
      baseInputSchema: nodeSchema?.inputSchema || [],
      baseOutputSchema: nodeSchema?.outputSchema || [],
      availableInputsFromPrevious: availableInputs,
      // currentMappings: (currentNode.data as any)?.fieldMappings || {}, // Cast to any if fieldMappings is not on WorkflowNodeData
    };
  }, [dataMappingModalNodeId, getNodeById, connections]);

  const handleMinimapClick = useCallback(
    (newOffset: CanvasOffset) => setCanvasOffset(newOffset),
    []
  );
  const handleMinimapPan = useCallback((delta: CanvasOffset) => {
    setCanvasOffset((prev) => ({ x: prev.x + delta.x, y: prev.y + delta.y }));
  }, []);

  const handleExecuteWorkflow = () => {
    if (runWorkflow) runWorkflow();
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
      <div className="bg-background dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInsertContext(null);
                    setIsSideModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Node
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add New Node to Canvas</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleZoomOut}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Badge
            variant="outline"
            className="px-2 py-0.5 text-xs min-w-[50px] text-center h-7 flex items-center"
          >
            {Math.round(canvasScale * 100)}%
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleZoomIn}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleResetView}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset View</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleFitToScreen}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fit to Screen</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showGrid ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Grid</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {/* <div className="flex items-center gap-2">
            {runWorkflow && (
                <Button onClick={handleExecuteWorkflow} size="sm" className="h-7 flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white">
                    <Play className="h-3.5 w-3.5" /> Run
                </Button>
            )}
            {onClose && (
                 <Button variant="outline" size="sm" className="h-7" onClick={onClose}>Close Editor</Button>
            )}
        </div> */}
      </div>

      <div className="flex-1 relative overflow-hidden">
        {showMinimap && canvasRef.current && (
          <div className="absolute top-3 right-3 z-10 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Minimap
              nodes={nodes.map((n) => ({
                ...n,
                width: NODE_WIDTH,
                height:
                  NODE_HEIGHT +
                  (n.type !== "start" && n.type !== "end" ? 20 : 0),
              }))}
              connections={connections}
              canvasOffset={canvasOffset}
              canvasScale={canvasScale}
              onMinimapClick={handleMinimapClick}
              onMinimapPan={handleMinimapPan}
              width={canvasRef.current.clientWidth}
              height={canvasRef.current.clientHeight}
            />
          </div>
        )}

        <div
          ref={canvasRef}
          className="w-full h-full cursor-grab"
          style={canvasBackground}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onWheel={handleCanvasWheel}
        >
          <div
            className="relative w-full h-full"
            style={{
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasScale})`,
              transformOrigin: "0 0",
              transition: isPanning ? "none" : "transform 0.05s ease-out",
            }}
          >
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: "100%", height: "100%", overflow: "visible" }}
            >
              {connections.map((connection) => {
                const sourceNode = getNodeById
                  ? getNodeById(connection.sourceId)
                  : undefined;
                const targetNode = getNodeById
                  ? getNodeById(connection.targetId)
                  : undefined;
                if (!sourceNode || !targetNode) return null;
                return (
                  <ConnectionLine
                    key={connection.id}
                    connection={connection}
                    sourceNode={sourceNode}
                    targetNode={targetNode}
                    onDelete={() => {
                      if (removeConnection) removeConnection(connection.id);
                    }}
                    onInsertNode={prepareInsertNodeOnConnection}
                  />
                );
              })}
              {pendingConnection &&
                getNodeById &&
                getNodeById(pendingConnection.sourceId) && (
                  <PendingConnectionLine
                    sourceNode={
                      getNodeById(
                        pendingConnection.sourceId
                      ) as ContextWorkflowNode
                    }
                    mousePosition={mousePosition}
                    nodeWidth={NODE_WIDTH}
                    nodeHeight={NODE_HEIGHT}
                  />
                )}
            </svg>

            {nodes.map((node) => (
              <NodeComponent
                key={node.id}
                node={node}
                selected={selectedNodeId === node.id}
                isConnecting={
                  !!pendingConnection && pendingConnection.sourceId === node.id
                }
                onSelect={() => {
                  if (selectNode) selectNode(node.id);
                }}
                onDragStart={handleNodeDragStart}
                onExecuteNode={executeNode ? (id) => executeNode(id) : () => {}}
                onOpenProperties={
                  setPropertiesModalNodeId
                    ? (id) => setPropertiesModalNodeId(id)
                    : () => {}
                }
                onOpenSchemaModal={
                  handleOpenSchemaModal
                    ? (id) => handleOpenSchemaModal(id)
                    : () => {}
                }
              />
            ))}
          </div>
        </div>
      </div>

      <SideModal
        isOpen={isSideModalOpen}
        onClose={() => {
          setIsSideModalOpen(false);
          setInsertContext(null);
        }}
        onSelectNodeType={(nodeType) => {
          if (insertContext) {
            finalizeInsertNodeOnConnection(nodeType);
          } else {
            handleNodeTypeSelectFromSideModalGeneral(nodeType);
          }
        }}
      />

      {propertiesModalNodeId && setPropertiesModalNodeId && (
        <NodeModal
          nodeId={propertiesModalNodeId}
          isOpen={!!propertiesModalNodeId}
          onClose={() => setPropertiesModalNodeId(null)}
        />
      )}

      {dataMappingModalNodeId &&
        schemaModalData &&
        setDataMappingModalNodeId &&
        updateNode &&
        getNodeById && (
          <SchemaModal
            {...schemaModalData}
            onClose={() => setDataMappingModalNodeId(null)}
            onSaveMappings={(mappings) => {
              const nodeToUpdate = getNodeById(dataMappingModalNodeId); // Already checked by schemaModalData condition
              if (nodeToUpdate) {
                // Redundant check, but safe
                updateNode(dataMappingModalNodeId, {
                  data: {
                    ...nodeToUpdate.data,
                    fieldMappings: mappings, // Ensure WorkflowNodeData in context includes fieldMappings
                  } as WorkflowNodeData, // Cast if fieldMappings is optional or not strictly typed
                });
              }
              setDataMappingModalNodeId(null);
            }}
          />
        )}
    </div>
  );
}

function PendingConnectionLine({
  sourceNode,
  mousePosition,
  nodeWidth,
  nodeHeight,
}: {
  sourceNode: ContextWorkflowNode;
  mousePosition: { x: number; y: number };
  nodeWidth: number;
  nodeHeight: number;
}) {
  if (!sourceNode) return null;
  const sourcePortXOffset = nodeWidth;
  const sourcePortYOffset = nodeHeight / 2;

  const sourceX = sourceNode.position.x + sourcePortXOffset;
  const sourceY = sourceNode.position.y + sourcePortYOffset;

  const controlPointOffset = Math.max(
    50,
    Math.abs(mousePosition.x - sourceX) * 0.3
  );

  const path = `M ${sourceX} ${sourceY} C ${
    sourceX + controlPointOffset
  } ${sourceY}, ${mousePosition.x - controlPointOffset} ${mousePosition.y}, ${
    mousePosition.x
  } ${mousePosition.y}`;

  return (
    <path
      d={path}
      stroke="#3b82f6"
      strokeWidth="2.5"
      strokeDasharray="6,6"
      fill="none"
      className="animate-connector-flow"
    />
  );
}

// Add this to your global CSS or a relevant stylesheet:
/*
@keyframes connector-flow {
  to {
    stroke-dashoffset: -24; 
  }
}
.animate-connector-flow {
  animation: connector-flow 1s linear infinite;
}
*/
