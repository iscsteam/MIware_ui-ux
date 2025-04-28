"use client";
import type React from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Power,
  Trash2,
  MoreHorizontal,
  AlignJustify,
} from "lucide-react";
import { type WorkflowNode, useWorkflow } from "./workflow-context";
import { getNodeIcon } from "./node-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { NodeType } from "./workflow-context";
import SchemaModal from "./SchemaModal"; // Adjust path

// --- Interfaces ---
interface NodeComponentProps {
  node: WorkflowNode
  selected: boolean

  onSelect: () => void
  onDragstart: (nodeId: string, e: React.MouseEvent) => void
  onExecuteNode: (nodeId: string) => void
  onOpenProperties: (nodeId: string) => void
}

interface LineCoords {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// --- Component ---
export function NodeComponent({
  node,
  selected,
  onSelect,
  onDragStart,
  onExecuteNode,
  onOpenProperties,
  onOpenSchemaModal,
  isConnecting,
}: NodeComponentProps) {
  // ... (existing hooks and state: useWorkflow, useState, nodeRef) ...
  const {
    removeNode,
    pendingConnection,
    setPendingConnection,
    addConnection,
    updateNode,
    nodes,
    connections,
  } = useWorkflow();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isTreeModalOpen, setIsTreeModalOpen] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // --- Refs for Modal Elements ---
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // Refs for the scrollable column containers themselves
  const inputColumnRef = useRef<HTMLDivElement>(null);
  const outputColumnRef = useRef<HTMLDivElement>(null);
  // Ref to track pending animation frame for scroll updates
  const scrollRafRef = useRef<number | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [selectedNodeType, setSelectedNodeType] = useState<NodeType | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // --- State for Line Coordinates ---
  const [lines, setLines] = useState<LineCoords[]>([]);

  const [isFilenameDialogOpen, setIsFilenameDialogOpen] = useState(false);
  const [tempFilename, setTempFilename] = useState(node.data?.filename || "");

  // --- Callback ref function to populate fieldRefs ---
  const registerFieldRef = useCallback(
    (key: string, element: HTMLDivElement | null) => {
      fieldRefs.current[key] = element;
    },
    []
  );

  // --- Function to Calculate Line Coordinates ---
  const calculateLines = useCallback(() => {
    // Added check for column refs as well, though svgRef implies they should exist if modal is open
    if (
      !isTreeModalOpen ||
      !svgRef.current ||
      !inputColumnRef.current ||
      !outputColumnRef.current
    ) {
      setLines([]);
      return;
    }

    const inputSchema = node.data?.inputSchema;
    const outputSchema = node.data?.outputSchema;
    const newLines: LineCoords[] = [];

    if (
      !inputSchema ||
      !outputSchema ||
      typeof inputSchema !== "object" ||
      typeof outputSchema !== "object"
    ) {
      setLines([]);
      return;
    }

    const svgRect = svgRef.current.getBoundingClientRect();
    if (svgRect.width === 0 || svgRect.height === 0) {
      // console.warn("SVG Rect has zero dimensions, skipping calculation.");
      return; // Avoid errors if SVG isn't rendered yet
    }

    // --- Mapping Logic (Back to: 1:1 by matching name) ---
    Object.keys(inputSchema).forEach((inputFieldName) => {
      // Check if the output schema has a property with the exact same name
      if (Object.prototype.hasOwnProperty.call(outputSchema, inputFieldName)) {
        const outputFieldName = inputFieldName; // Names match

        const inputFieldKey = `input-${inputFieldName}`;
        const outputFieldKey = `output-${outputFieldName}`;

        const inputEl = fieldRefs.current[inputFieldKey];
        const outputEl = fieldRefs.current[outputFieldKey];

        if (inputEl && outputEl) {
          const inputRect = inputEl.getBoundingClientRect();
          const outputRect = outputEl.getBoundingClientRect();

          // Crucially, getBoundingClientRect() *already* gives position relative to viewport,
          // accounting for parent scroll. We just need to make it relative to the SVG's origin.
          const x1 = inputRect.right - svgRect.left;
          const y1 = inputRect.top + inputRect.height / 2 - svgRect.top;
          const x2 = outputRect.left - svgRect.left;
          const y2 = outputRect.top + outputRect.height / 2 - svgRect.top;

          // Optimization: Only add lines if they are potentially visible within the SVG bounds
          const svgHeight = svgRect.height;
          if (
            (y1 >= 0 && y1 <= svgHeight) || // start point visible
            (y2 >= 0 && y2 <= svgHeight) || // End point visible
            (y1 < 0 && y2 > svgHeight) || // Line crosses from top to bottom
            (y2 < 0 && y1 > svgHeight) // Line crosses from bottom to top
          ) {
            // Use the original line ID format based on the matching field name
            newLines.push({ id: `line-${inputFieldName}`, x1, y1, x2, y2 });
          }
        }
      }
    }); // End loop through input fields

    setLines(newLines);
    // console.log("Lines recalculated (matching names only)"); // Debugging
  }, [isTreeModalOpen, node.data?.inputSchema, node.data?.outputSchema]); // Dependencies include schemas

  // --- Effect for Initial Calculation, Resize, and SCROLL ---
  useEffect(() => {
    if (isTreeModalOpen) {
      // --- Initial calculation ---
      // Use RAF to wait for layout after modal opens
      const initialRafId = requestAnimationFrame(() => {
        calculateLines();
      });

      // --- Scroll Handler ---
      // Use RAF to throttle calculations during scroll
      const handleScroll = () => {
        if (scrollRafRef.current === null) {
          // Only request if no frame is pending
          scrollRafRef.current = requestAnimationFrame(() => {
            calculateLines();
            scrollRafRef.current = null; // Allow next request
          });
        }
      };

      // --- Resize Handler ---
      // Use RAF for resize as well
      let resizeRafId: number | null = null;
      const handleResize = () => {
        if (resizeRafId) cancelAnimationFrame(resizeRafId);
        resizeRafId = requestAnimationFrame(() => {
          calculateLines();
        });
      };

      // Get stable references to column elements for listener cleanup
      const inputColEl = inputColumnRef.current;
      const outputColEl = outputColumnRef.current;

      // Attach listeners
      window.addEventListener("resize", handleResize);
      inputColEl?.addEventListener("scroll", handleScroll, { passive: true }); // Use passive for better scroll perf
      outputColEl?.addEventListener("scroll", handleScroll, { passive: true });

      // --- Cleanup ---
      return () => {
        // console.log("Cleaning up modal listeners"); // Debugging
        window.removeEventListener("resize", handleResize);
        inputColEl?.removeEventListener("scroll", handleScroll);
        outputColEl?.removeEventListener("scroll", handleScroll);

        // Cancel any pending animation frames
        cancelAnimationFrame(initialRafId);
        if (scrollRafRef.current !== null) {
          cancelAnimationFrame(scrollRafRef.current);
          scrollRafRef.current = null;
        }
        if (resizeRafId) {
          cancelAnimationFrame(resizeRafId);
        }

        // Clear refs and lines
        fieldRefs.current = {};
        setLines([]);
      };
    }
    // No 'else' needed, cleanup handles everything when isTreeModalOpen becomes false
  }, [isTreeModalOpen, calculateLines]); // Effect depends on modal state and the stable calculateLines function

  // --- Keep Existing Handlers (handleOutputPortClick, handleInputPortClick, etc.) ---
  const handleOutputPortClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingConnection({ sourceId: node.id });
  };

  const handleInputPortClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pendingConnection && pendingConnection.sourceId !== node.id) {
      addConnection(pendingConnection.sourceId, node.id);
      setPendingConnection(null);
    } else {
      setPendingConnection(null);
    }
  };

  const handleDeactivateNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyActive = node.data?.active !== false;
    updateNode(node.id, { data: { ...node.data, active: !isCurrentlyActive } });
    // Add rerouting logic if needed
    if (isCurrentlyActive) {
      const incomingConnections = connections.filter(
        (conn) => conn.targetId === node.id
      );
      const outgoingConnections = connections.filter(
        (conn) => conn.sourceId === node.id
      );
      incomingConnections.forEach((incoming) => {
        outgoingConnections.forEach((outgoing) => {
          if (
            !connections.some(
              (c) =>
                c.sourceId === incoming.sourceId &&
                c.targetId === outgoing.targetId
            )
          ) {
            addConnection(incoming.sourceId, outgoing.targetId);
          }
        });
      });
      // Consider removing original connections depending on desired deactivation behavior
    }
  };

  const handleDeleteWithRerouting = (e: React.MouseEvent) => {
    e.stopPropagation();

    const incomingConnections = connections.filter(
      (conn) => conn.targetId === node.id
    );
    const outgoingConnections = connections.filter(
      (conn) => conn.sourceId === node.id
    );
    incomingConnections.forEach((incoming) => {
      outgoingConnections.forEach((outgoing) => {
        if (
          !connections.some(
            (c) =>
              c.sourceId === incoming.sourceId &&
              c.targetId === outgoing.targetId
          )
        ) {
          addConnection(incoming.sourceId, outgoing.targetId);
        }
      });
    });
    removeNode(node.id);
  };

  const getNodeLabel = () => {
    return (
      node.data?.label ||
      node.type
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  const getNodeBackgroundColor = () => {
    if (node.type === "start") return "bg-white"
    if (node.type === "end") return "bg-white"
    return "bg-white"
  }

  const handleOpenTreeModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    fieldRefs.current = {}; // Clear previous refs
    setLines([]); // Clear previous lines
    setIsTreeModalOpen(true);
    // Calculation now happens in useEffect after render
  };

  const handleNodeClick = (nodeId: string, nodeType: NodeType) => {
    console.log(`Node clicked: ID=${nodeId}, Type=${nodeType}`);
    setSelectedNodeType(nodeType);
    setIsModalOpen(true);
  };

  // Handler function with type
  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedNodeType(null); // Reset selected type when closing
  };

  // Add handler for filename click
  const handleFilenameClick = (e: React.MouseEvent) => {
    if (node.type !== "start" && node.type !== "end") {
      e.stopPropagation();
      setTempFilename(node.data?.filename || "");
      setIsFilenameDialogOpen(true);
    }
  };

  // Add handler for saving filename
  const handleSaveFilename = () => {
    updateNode(node.id, {
      data: {
        ...node.data,
        filename: tempFilename,
      },
    });
    setIsFilenameDialogOpen(false);
  };

  // Handle icon double-click to open properties panel
  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(); // Still select the node on single click

    // We'll use the double-click event directly on the icon
  };

  // Handle double-click on the icon to open properties
  const handleIconDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onOpenProperties(node.id)
  }

  // Function to format filename path for display
  const formatFilename = (filename: string | undefined): string => {
    if (!filename) return "Filename"

    // If filename is short enough, return it as is
    if (filename.length <= 20) return filename

    // For longer paths, show just the filename part
    const parts = filename.split(/[/\\]/)
    const filenameOnly = parts[parts.length - 1]

    // If just the filename is too long, truncate it
    if (filenameOnly.length > 15) {
      return filenameOnly.substring(0, 12) + "..."
    }

    // Otherwise show directory/.../filename format
    if (parts.length > 2) {
      return parts[0] + "/.../" + filenameOnly
    }

    return filename
  }

  return (
    <>
      {/* --- Node Visual Representation (Unchanged) --- */}
      <div
        className="absolute group"
        style={{ left: node.position.x, top: node.position.y }}
      >
        {/* Node action buttons (Unchanged) */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-auto flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="flex bg-gray-200 rounded-md shadow-sm">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="node-action h-8 w-8 rounded-l-md bg-gray-200 hover:bg-gray-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExecuteNode(node.id);
                    }}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Execute node</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="node-action h-8 w-8 bg-gray-200 hover:bg-gray-300"
                    onClick={handleDeactivateNode}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {node.data?.active === false
                    ? "Activate node"
                    : "Deactivate node"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="node-action h-8 w-8 bg-gray-200 hover:bg-gray-300"
                    onClick={handleDeleteWithRerouting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete node</TooltipContent>
              </Tooltip>

              {/* <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="node-action h-8 w-8 bg-gray-200 hover:bg-gray-300"
                    // onClick={handleOpenTreeModal}
                    onClick={(e) => handleNodeClick(node.id, node.type)}
                  >
                    <AlignJustify className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Data Mapping</TooltipContent>
              </Tooltip> */}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    // --- CORRECTED onClick ---
                    className="node-action h-8 w-8 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-r-md" // Ensure correct rounding
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSchemaModal(node.type); // Call parent handler
                    }}
                    // --- End Correction ---
                    aria-label="Open Data Mapping"
                  >
                    <AlignJustify className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Data Mapping</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="node-action h-8 w-8 rounded-r-md bg-gray-200 hover:bg-gray-300"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>More options</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Node body with header and body sections */}
        <div
          ref={nodeRef}
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          // onClick={handleIconClick}
          onDoubleClick={handleIconDoubleClick}
          className={`relative flex flex-col rounded-md border ${
            selected ? "border-green-500 ring-1 ring-green-500" : "border-gray-300"
          } ${getNodeBackgroundColor()} shadow-md transition-all w-[100px] h-[100px] cursor-grab ${
            pendingConnection && pendingConnection.sourceId === node.id ? "border-blue-500" : ""
          } ${node.data?.active === false ? "opacity-50" : ""}`}
          
          onMouseDown={(e) => {
            const target = e.target as HTMLElement;
            if (
              e.button === 0 &&
              !target.closest(".port") &&
              !target.closest(".node-action")
            ) {
              onDragStart(node.id, e);
            }
          }}
          title={`Type: ${node.type}\nID: ${node.id}`}
        >
          {/* Header section with node label */}
          <div className="text-center text-sm font-medium border-b p-1 bg-gray-100 rounded-t-md">
            {node.data?.label || getNodeLabel()}
          </div>

          {/* Body section with icon */}
          <div className="flex flex-1 items-center justify-center p-2">
            <div className="flex h-12 w-12 items-center justify-center text-zinc-600">
              {getNodeIcon(node.type)}
            </div>
            {node.status !== "idle" && (
              <div className="absolute top-2 right-1">
                {node.status === "success" && (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
                {node.status === "error" && (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                {node.status === "running" && (
                  <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                )}
              </div>
            )}
          </div>

          {/* Output port */}
          {node.type !== "end" && (
            <div
              className={`port absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full border-2 border-background bg-gray-400 hover:bg-primary hover:scale-110 transition-transform ${
                pendingConnection && pendingConnection.sourceId === node.id
                  ? "ring-2 ring-blue-500 scale-125 bg-primary"
                  : ""
              }`}
              onClick={handleOutputPortClick}
              title="Click to start connection"
            />
          )}
          {/* Output port */}
          {node.type !== "end" && (
            <div
              className={`port absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full border-2 border-background bg-gray-400 hover:bg-primary hover:scale-110 transition-transform ${
                pendingConnection && pendingConnection.sourceId === node.id
                  ? "ring-2 ring-blue-500 scale-125 bg-primary"
                  : ""
              }`}
              onClick={handleOutputPortClick}
              title="Click to start connection"
            />
          )}

          {/* Input port */}
          {node.type !== "start" && (
            <div
              className={`port absolute left-0 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-background bg-gray-400 hover:bg-primary hover:scale-110 transition-transform ${
                pendingConnection && pendingConnection.sourceId !== node.id ? "ring-2 ring-blue-500 animate-pulse" : ""
              }`}
              onClick={handleInputPortClick}
              title={pendingConnection ? "Click to complete connection" : "Input port"}
            />
          )}
        </div>

        {/* Filename display below the node */}
        {node.type !== "start" && node.type !== "end" && (
          <div
            className="text-center text-xs mt-1 cursor-pointer hover:text-blue-500 max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap"
            onClick={handleFilenameClick}
            title={node.data?.filename || "Filename"}
          >
            {formatFilename(node.data?.filename)}
          </div>
        )}
      </div>

      {/* Filename Dialog */}
      <Dialog
        open={isFilenameDialogOpen}
        onOpenChange={setIsFilenameDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Filename</DialogTitle>
          </DialogHeader>
          <Input
            value={tempFilename}
            onChange={(e) => setTempFilename(e.target.value)}
            placeholder="Enter filename"
          />
          <DialogFooter>
            <Button onClick={handleSaveFilename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

     
    </>
  );
}
