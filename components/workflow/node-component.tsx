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
  // X, // Not used if DialogClose is used
} from "lucide-react";
import {
  type WorkflowNode,
  type WorkflowNodeData, // Import if needed for casting, though not strictly necessary here
  useWorkflow,
  NodeType, // Import NodeType
} from "./workflow-context";
import { getNodeIcon } from "./node-utils";
import { getNodeSchema } from "./nodeSchemas"; // <<--- IMPORT getNodeSchema
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input"; // Not used directly here
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Dialog imports are for the Tree Modal, which seems less used now
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogClose,
// } from "@/components/ui/dialog";
// import { SchemaFieldList } from "./SchemaFieldList"; // For Tree Modal
import SchemaModal from "./SchemaModal"; // Main Schema Modal

// --- Interfaces ---
interface NodeComponentProps {
  node: WorkflowNode;
  selected: boolean;
  onSelect: () => void;
  onDragStart: (nodeId: string, e: React.MouseEvent) => void; // Renamed for consistency
  onExecuteNode: (nodeId: string) => void;
  onOpenProperties: (nodeId: string) => void; // <<--- ADDED PROP DEFINITION
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
  onOpenProperties, // Prop received
}: NodeComponentProps) {
  const {
    removeNode,
    pendingConnection,
    setPendingConnection,
    addConnection,
    updateNode,
    connections, // Keep connections if needed for delete logic
  } = useWorkflow();

  // State for the primary SchemaModal (opened via AlignJustify icon)
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState<boolean>(false);

  // State/Refs for the inline Tree/Data Mapping Modal (might be deprecated?)
  const [isTreeModalOpen, setIsTreeModalOpen] = useState(false); // Kept for now if logic depends on it
  const nodeRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const svgContainerRef = useRef<HTMLDivElement>(null); // For Tree Modal
  const svgRef = useRef<SVGSVGElement>(null); // For Tree Modal
  const inputColumnRef = useRef<HTMLDivElement>(null); // For Tree Modal
  const outputColumnRef = useRef<HTMLDivElement>(null); // For Tree Modal
  const scrollRafRef = useRef<number | null>(null); // For Tree Modal scroll
  const [lines, setLines] = useState<LineCoords[]>([]); // For Tree Modal

  const registerFieldRef = useCallback(
    (key: string, element: HTMLDivElement | null) => {
      fieldRefs.current[key] = element;
    },
    []
  );

  // --- Function to Calculate Line Coordinates (for Tree Modal) ---
  // This function now fetches the schema definition
  const calculateLines = useCallback(() => {
    if (
      !isTreeModalOpen ||
      !svgRef.current ||
      !inputColumnRef.current ||
      !outputColumnRef.current
    ) {
      setLines([]);
      return;
    }

    // --- Fetch schema definition ---
    const schema = getNodeSchema(node.type); // Use helper
    const inputSchemaDef = schema?.inputSchema;
    const outputSchemaDef = schema?.outputSchema;
    // ------------------------------

    const newLines: LineCoords[] = [];

    // Ensure schemas exist and are arrays
    if (!Array.isArray(inputSchemaDef) || !Array.isArray(outputSchemaDef)) {
        setLines([]);
        return;
    }


    const svgRect = svgRef.current.getBoundingClientRect();
    if (svgRect.width === 0 || svgRect.height === 0) {
      return; // Avoid errors if SVG isn't rendered yet
    }

    // --- Mapping Logic (Matching names between input/output schemas) ---
     inputSchemaDef.forEach((inputField) => {
        // Find if there's an output field with the same name
        const matchingOutputField = outputSchemaDef.find(outputField => outputField.name === inputField.name);

        if (matchingOutputField) {
            const inputFieldKey = `input-${inputField.name}`;
            const outputFieldKey = `output-${matchingOutputField.name}`; // Same name

            const inputEl = fieldRefs.current[inputFieldKey];
            const outputEl = fieldRefs.current[outputFieldKey];

            if (inputEl && outputEl) {
                 const inputRect = inputEl.getBoundingClientRect();
                 const outputRect = outputEl.getBoundingClientRect();

                 const x1 = inputRect.right - svgRect.left;
                 const y1 = inputRect.top + inputRect.height / 2 - svgRect.top;
                 const x2 = outputRect.left - svgRect.left;
                 const y2 = outputRect.top + outputRect.height / 2 - svgRect.top;

                // Simplified visibility check (can be refined)
                if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
                    newLines.push({ id: `line-${inputField.name}`, x1, y1, x2, y2 });
                }
            }
        }
    });


    setLines(newLines);
  }, [isTreeModalOpen, node.type]); // Depend on node.type now

  // --- Effect for Tree Modal Calculation, Resize, and SCROLL ---
  useEffect(() => {
    if (isTreeModalOpen) {
      const initialRafId = requestAnimationFrame(() => {
        calculateLines();
      });
      const handleScroll = () => {
        if (scrollRafRef.current === null) {
          scrollRafRef.current = requestAnimationFrame(() => {
            calculateLines();
            scrollRafRef.current = null;
          });
        }
      };
      let resizeRafId: number | null = null;
      const handleResize = () => {
        if (resizeRafId) cancelAnimationFrame(resizeRafId);
        resizeRafId = requestAnimationFrame(() => {
          calculateLines();
        });
      };
      const inputColEl = inputColumnRef.current;
      const outputColEl = outputColumnRef.current;
      window.addEventListener("resize", handleResize);
      inputColEl?.addEventListener("scroll", handleScroll, { passive: true });
      outputColEl?.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("resize", handleResize);
        inputColEl?.removeEventListener("scroll", handleScroll);
        outputColEl?.removeEventListener("scroll", handleScroll);
        cancelAnimationFrame(initialRafId);
        if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);
        if (resizeRafId) cancelAnimationFrame(resizeRafId);
        fieldRefs.current = {};
        setLines([]);
      };
    }
  }, [isTreeModalOpen, calculateLines]); // Effect depends on modal state and calculateLines

  // --- Port Click Handlers ---
  const handleOutputPortClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Include handle ID if necessary for distinguishing multiple outputs
    setPendingConnection({ sourceId: node.id /*, sourceHandle: 'output-handle-id' */ });
  };

  const handleInputPortClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pendingConnection && pendingConnection.sourceId !== node.id) {
      // Include handle IDs if necessary
      addConnection(pendingConnection.sourceId, node.id /*, pendingConnection.sourceHandle, 'input-handle-id' */);
      setPendingConnection(null);
    } else {
      // Cancel pending connection if clicking input without valid source
      setPendingConnection(null);
    }
  };

  // --- Node Action Handlers ---
   const handleDeactivateNode = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const isCurrentlyActive = node.data?.active !== false;
        // Update the node's active status
        updateNode(node.id, { data: { active: !isCurrentlyActive } });

        // Optional: Basic rerouting logic when deactivating
        // This could become complex; consider if it's truly needed or handled elsewhere
        if (isCurrentlyActive) { // Node was active, now inactive
             console.log(`Node ${node.id} deactivated. Rerouting logic could run here.`);
            // Find connections passing *through* this node
            const incoming = connections.filter(conn => conn.targetId === node.id);
            const outgoing = connections.filter(conn => conn.sourceId === node.id);

            incoming.forEach(inc => {
                outgoing.forEach(out => {
                    // Avoid creating duplicate connections
                    if (!connections.some(c => c.sourceId === inc.sourceId && c.targetId === out.targetId)) {
                        addConnection(inc.sourceId, out.targetId, inc.sourceHandle, out.targetHandle); // Pass handles if used
                    }
                });
            });
             // Optionally remove original connections to/from the deactivated node
             // incoming.forEach(c => removeConnection(c.id));
             // outgoing.forEach(c => removeConnection(c.id));
        }
    }, [node.id, node.data?.active, connections, updateNode, addConnection]); // Dependencies

    const handleDeleteWithRerouting = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
         console.log(`Deleting node ${node.id}. Rerouting logic could run here.`);
        // Similar rerouting logic as deactivation, but then remove the node
        const incoming = connections.filter(conn => conn.targetId === node.id);
        const outgoing = connections.filter(conn => conn.sourceId === node.id);

        incoming.forEach(inc => {
            outgoing.forEach(out => {
                if (!connections.some(c => c.sourceId === inc.sourceId && c.targetId === out.targetId)) {
                    addConnection(inc.sourceId, out.targetId, inc.sourceHandle, out.targetHandle);
                }
            });
        });

        removeNode(node.id); // Remove the node itself AFTER potentially adding bypass connections
    }, [node.id, connections, addConnection, removeNode]); // Dependencies

  // --- Helpers ---
  const getNodeLabel = () => {
    return (
      node.data?.label || // Use instance label first
      node.type // Fallback to type if no label
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  const getNodeBackgroundColor = () => {
    // Use lowercase for comparison
    if (node.type === "start") return "bg-green-200";
    if (node.type === "end") return "bg-red-200"; // Corrected comparison
    return "bg-white dark:bg-gray-800"; // Added dark mode example
  };

  // --- Modal Open/Close Handlers ---
  // Opens the main SchemaModal
  const handleOpenSchemaModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSchemaModalOpen(true);
  };

  const handleCloseSchemaModal = () => {
    setIsSchemaModalOpen(false);
  };

  // Handle node body/icon single click
  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(); // Select the node
  };

  // Handle node body/icon double-click to open properties
  const handleNodeDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenProperties(node.id); // Call the passed-in function
  };

  return (
    <>
      <div
        className="absolute group"
        style={{ left: node.position.x, top: node.position.y }}
        ref={nodeRef} // Ref for potential size calculations if needed
      >
        {/* --- Action Buttons --- */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-auto flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
           <div className="flex bg-gray-200 dark:bg-gray-700 rounded-md shadow-sm"> {/* Dark mode bg */}
              <TooltipProvider delayDuration={100}>
                  {/* Execute */}
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button
                              variant="ghost" size="icon" className="node-action h-8 w-8 rounded-l-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200" // Dark mode styles
                              onClick={(e) => { e.stopPropagation(); onExecuteNode(node.id); }}
                          > <Play className="h-4 w-4" /> </Button>
                      </TooltipTrigger>
                      <TooltipContent>Execute node</TooltipContent>
                  </Tooltip>
                   {/* (De)Activate */}
                   <Tooltip>
                       <TooltipTrigger asChild>
                           <Button
                               variant="ghost" size="icon" className="node-action h-8 w-8 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200" // Dark mode styles
                               onClick={handleDeactivateNode}
                            > <Power className="h-4 w-4" /> </Button>
                       </TooltipTrigger>
                       <TooltipContent>{node.data?.active !== false ? "Deactivate" : "Activate"} node</TooltipContent>
                   </Tooltip>
                    {/* Delete */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost" size="icon" className="node-action h-8 w-8 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200" // Dark mode styles
                                onClick={handleDeleteWithRerouting}
                            > <Trash2 className="h-4 w-4" /> </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete node</TooltipContent>
                    </Tooltip>
                     {/* Schema / Data Mapping */}
                     <Tooltip>
                         <TooltipTrigger asChild>
                             <Button
                                variant="ghost" size="icon" className="node-action h-8 w-8 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200" // Dark mode styles
                                onClick={handleOpenSchemaModal} // Opens SchemaModal now
                            > <AlignJustify className="h-4 w-4" /> </Button>
                         </TooltipTrigger>
                         <TooltipContent>Configure Schema/Mappings</TooltipContent>
                     </Tooltip>
                      {/* More Options (Example) */}
                     <Tooltip>
                          <TooltipTrigger asChild>
                              <Button
                                 variant="ghost" size="icon" className="node-action h-8 w-8 rounded-r-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200" // Dark mode styles
                                 // Add onClick for dropdown or further actions
                                 onClick={(e) => {e.stopPropagation(); console.log("More options clicked")}}
                              > <MoreHorizontal className="h-4 w-4" /> </Button>
                          </TooltipTrigger>
                          <TooltipContent>More options</TooltipContent>
                      </Tooltip>
              </TooltipProvider>
           </div>
        </div>

        {/* --- Node Body --- */}
        <div
          // Use single click for selection, double click for properties
          onClick={handleNodeClick}
          onDoubleClick={handleNodeDoubleClick} // <<--- CORRECTED
          className={`relative flex flex-col rounded-md border ${
            selected ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-300 dark:border-gray-600" // Dark mode border
          } ${getNodeBackgroundColor()} shadow-md transition-all w-[100px] h-[100px] cursor-grab ${
            pendingConnection && pendingConnection.sourceId === node.id ? "border-blue-500" : ""
          } ${node.data?.active === false ? "opacity-50 pointer-events-none" : ""}` // Added pointer-events-none when inactive
          }
          onMouseDown={(e) => { // Handle drag start only on the node body
            const target = e.target as HTMLElement;
            // Check if the click is directly on the main body/icon area, not ports/actions
            if (e.button === 0 && target.closest('.flex-col.items-center.justify-center')) {
              onDragStart(node.id, e);
            }
          }}
          title={`Type: ${node.type}\nID: ${node.id}\nStatus: ${node.status || 'idle'}`} // More info on hover
        >
          {/* Icon and Label Area */}
          <div className="flex flex-1 flex-col items-center justify-center p-2 overflow-hidden pointer-events-none"> {/* Disable pointer events for inner div to ensure drag works */}
             <div className="flex h-10 w-10 items-center justify-center text-zinc-600 dark:text-zinc-300 mb-1"> {/* Dark mode icon color */}
                {getNodeIcon(node.type)}
             </div>
             {/* Status Indicator */}
             {node.status && node.status !== "idle" && (
                <div className="absolute top-1 right-1">
                    {node.status === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {node.status === "error" && <XCircle className="h-4 w-4 text-red-600" />}
                    {node.status === "running" && <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />}
                </div>
             )}
             <div className="text-center text-black dark:text-gray-200 text-xs px-1 break-words w-full"> {/* Dark mode text */}
                {getNodeLabel()}
             </div>
          </div>
        </div>

        {/* --- Ports --- */}
         {/* Output Port */}
        {node.type !== "end" && ( // Use lowercase 'end'
            <div
                className={`port absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full border-2 border-background bg-gray-400 hover:bg-blue-500 hover:scale-110 transition-all ${
                pendingConnection && pendingConnection.sourceId === node.id ? "ring-2 ring-blue-500 scale-125 bg-blue-500" : ""
                }`}
                onClick={handleOutputPortClick}
                title="Output: Click to start connection"
                // style={{ top: '50%' }} // Redundant if using translate-y-1/2
            />
        )}
        {/* Input Port */}
        {node.type !== "start" && ( // Use lowercase 'start'
            <div
                className={`port absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 cursor-pointer rounded-full border-2 border-background bg-gray-400 hover:bg-blue-500 hover:scale-110 transition-all ${
                pendingConnection && pendingConnection.sourceId !== node.id ? "ring-2 ring-blue-500 animate-pulse" : ""
                }`}
                onClick={handleInputPortClick}
                title={pendingConnection ? "Input: Click to complete connection" : "Input port"}
                // style={{ top: '50%' }} // Redundant
            />
        )}
      </div>

      {/* Render the Schema Modal when needed */}
      {isSchemaModalOpen && (
        <SchemaModal
          nodeType={node.type} // Pass the correct type
          onClose={handleCloseSchemaModal}
        />
      )}

      {/* Conditional rendering for the Tree Modal (if still needed) */}
      {/* {isTreeModalOpen && ( ... tree modal JSX ... )} */}
    </>
  );
}