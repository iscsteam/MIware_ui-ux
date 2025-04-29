

// import React, { JSX, useState, useRef, useEffect, useCallback } from "react";
// import { getNodeSchema } from "./nodeSchemas"; // Adjust path
// import { NodeType, SchemaItem } from "./workflow-context"; // Adjust path
// import { Badge } from "@/components/ui/badge"; // Assuming you have a Badge component

// // Define props interface
// interface SchemaModalProps {
//   nodeType: NodeType | null;
//   onClose: () => void;
// }

// export interface Connection {
//   inputId: string;
//   outputId: string;
// }

// interface Point {
//   x: number;
//   y: number;
// }

// const SchemaModal: React.FC<SchemaModalProps> = ({ nodeType, onClose }) => {
//   const [selectedInput, setSelectedInput] = useState<SchemaItem | null>(null);
//   const [connections, setConnections] = useState<Connection[]>([]);
//   const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
//   const svgContainerRef = useRef<HTMLDivElement | null>(null);
//   const [coordsVersion, setCoordsVersion] = useState(0);

//   // --- Effect to recalculate coordinates ---
//   useEffect(() => {
//     itemRefs.current.clear();
//     const timeoutId = setTimeout(() => {
//       // console.log("Triggering coord update via useEffect [nodeType]");
//       setCoordsVersion((prev) => prev + 1);
//     }, 50); // Short delay to allow refs to potentially settle after render
//     return () => clearTimeout(timeoutId);
//   }, [nodeType]); // Rerun if nodeType changes

//   // --- Effect for resize ---
//   useEffect(() => {
//     const handleResize = () => {
//       // console.log("Triggering coord update via useEffect [resize]");
//       setCoordsVersion((prev) => prev + 1);
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []); // Run only once on mount/unmount

//   if (!nodeType) return null;
//   const schema = getNodeSchema(nodeType);

//   // --- Error Handling ---
//   if (!schema) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
//         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md text-center border border-red-300 dark:border-red-700">
//           <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
//             Error
//           </h3>
//           <p className="text-gray-700 dark:text-gray-300">
//             Could not load schema for node type:{" "}
//             <span className="font-mono bg-red-100 dark:bg-red-900/50 px-1 rounded">
//               {nodeType}
//             </span>
//             .
//           </p>
//           <button
//             onClick={onClose}
//             className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // --- Ref Management ---
//   const setItemRef = useCallback(
//     (id: string, element: HTMLDivElement | null) => {
//       const map = itemRefs.current;
//       if (element) {
//         map.set(id, element);
//       } else {
//         if (map.has(id)) {
//           map.delete(id);
//         }
//       }
//     },
//     []
//   );

//   // --- Click Handler ---
//   const handleItemClick = (item: SchemaItem, type: "input" | "output") => {
//     if (type === "input") {
//       // Toggle selection for input
//       if (selectedInput?.name === item.name) {
//         setSelectedInput(null);
//       } else {
//         setSelectedInput(item);
//       }
//     } else if (type === "output" && selectedInput) {
//       // Create connection if an input is selected
//       const newConnection: Connection = {
//         inputId: selectedInput.name,
//         outputId: item.name,
//       };
//       // Avoid duplicate connections
//       if (
//         !connections.some(
//           (c) =>
//             c.inputId === newConnection.inputId &&
//             c.outputId === newConnection.outputId
//         )
//       ) {
//         setConnections((prevConnections) => [
//           ...prevConnections,
//           newConnection,
//         ]);
//         // Force coordinate update after connection state changes
//         requestAnimationFrame(() => setCoordsVersion((prev) => prev + 1));
//       }
//       // Deselect input after connection
//       setSelectedInput(null);
//     }
//   };

//   // --- Helper to get coordinates ---
//   // This version relies on getBoundingClientRect relative to the SVG container
//   // It should work correctly even with scrolling inside the columns
//   const getElementCoords = useCallback(
//     (elementId: string): Point | null => {
//       const element = itemRefs.current.get(elementId);
//       const svgContainer = svgContainerRef.current;

//       if (!element || !svgContainer) {
//         // console.warn(`Element or SVG container not found for ID: ${elementId}`);
//         return null;
//       }

//       const elementRect = element.getBoundingClientRect();
//       const containerRect = svgContainer.getBoundingClientRect();

//       // Determine if it's an input or output based on schema (more robust)
//       const isInput = schema.inputSchema?.some(
//         (item) => item.name === elementId
//       );
//       const isOutput = schema.outputSchema?.some(
//         (item) => item.name === elementId
//       );

//       let x: number;
//       if (isInput) {
//         // Connect to the right side of input items
//         x = elementRect.right - containerRect.left;
//       } else if (isOutput) {
//         // Connect to the left side of output items
//         x = elementRect.left - containerRect.left;
//       } else {
//         // Fallback or error - shouldn't happen if elementId is from schema
//         console.warn(
//           `Element ID ${elementId} not found in input or output schema`
//         );
//         return null;
//       }

//       // Calculate Y position relative to the container's top edge
//       const y = elementRect.top + elementRect.height / 2 - containerRect.top;

//       // Ensure coordinates are within the bounds (optional, but good practice)
//       // if (x < 0 || y < 0 || x > containerRect.width || y > containerRect.height) {
//       //     console.warn(`Calculated coords for ${elementId} are outside SVG container bounds.`);
//       //     // Decide how to handle: return null, clamp values, etc.
//       //     // Returning null might be safest if elements aren't visible
//       //     // return null;
//       // }

//       return { x, y };
//     },
//     [schema.inputSchema, schema.outputSchema]
//   ); // Dependencies for schema access

//   // --- Generate SVG Path Data ---
//   const getPathData = (startPoint: Point, endPoint: Point): string => {
//     const dx = endPoint.x - startPoint.x;
//     // Control points for a smooth horizontal curve
//     const controlPointX1 = startPoint.x + dx * 0.5;
//     const controlPointY1 = startPoint.y;
//     const controlPointX2 = endPoint.x - dx * 0.5;
//     const controlPointY2 = endPoint.y;
//     return `M ${startPoint.x} ${startPoint.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${endPoint.x} ${endPoint.y}`;
//   };

//   // --- Render Schema Items ---
//   const renderSchemaItems = (
//     schemaItems: SchemaItem[] | undefined,
//     type: "input" | "output"
//   ): JSX.Element => {
//     if (!schemaItems || schemaItems.length === 0) {
//       return (
//         <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-1 text-xs">
//           No items defined.
//         </p>
//       );
//     }
//     return (
//       <div className="space-y-1">
//         {" "}
//         {/* Use space-y for consistent spacing */}
//         {schemaItems.map((item) => {
//           const isSelected =
//             type === "input" && selectedInput?.name === item.name;
//           const id = item.name; // Use name as unique key/id within its type
//           return (
//             <div
//               key={id}
//               ref={(el) => setItemRef(id, el)} // Set ref for coordinate calculation
//               className={`p-1.5 rounded border border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer ${
//                 isSelected
//                   ? "bg-blue-100 dark:bg-blue-900 ring-1 ring-blue-400"
//                   : ""
//               }`}
//               onClick={() => handleItemClick(item, type)}
//               role="button"
//               aria-pressed={isSelected}
//               title={item.description || item.name} // Tooltip for description
//             >
//               {/* Item Content Layout */}
//               <div className="flex justify-between items-start mb-0.5">
//                 <span className="font-medium font-mono text-gray-800 dark:text-gray-200 break-all text-xs leading-tight">
//                   {item.name}
//                   {item.required && (
//                     <span className="text-red-500 ml-1">*</span>
//                   )}
//                 </span>
//                 <Badge
//                   variant="outline"
//                   className="text-xs font-normal px-1.5 py-0.5 ml-2 flex-shrink-0 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
//                 >
//                   {item.datatype}
//                 </Badge>
//               </div>
//               {item.description && (
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
//                   {item.description}
//                 </p>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   // Handle backdrop click to close modal
//   const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (e.target === e.currentTarget) {
//       // Only close if backdrop itself is clicked
//       onClose();
//     }
//   };

//   // --- Calculate connections path data ---
//   // Use React.useMemo to recalculate paths only when dependencies change
//   const connectionPaths = React.useMemo(() => {
//     // console.log(`Recalculating paths (version: ${coordsVersion})`);
//     return connections
//       .map((conn) => {
//         const startPoint = getElementCoords(conn.inputId);
//         const endPoint = getElementCoords(conn.outputId);

//         // Only render path if both start and end points are valid
//         if (startPoint && endPoint) {
//           const pathData = getPathData(startPoint, endPoint);
//           return (
//             <path
//               key={`${conn.inputId}-${conn.outputId}`}
//               d={pathData}
//               stroke="currentColor" // Use currentColor for theme adaptability
//               strokeWidth="1.5"
//               fill="none"
//               className="text-blue-500 dark:text-blue-400" // Set color via className
//               markerEnd="url(#arrowhead)" // Add arrowhead marker
//             />
//           );
//         }
//         // console.warn(`Skipping connection render for ${conn.inputId} -> ${conn.outputId} due to missing coords.`);
//         return null; // Return null for invalid connections
//       })
//       .filter(Boolean); // Filter out null values
//     // Depend on connections array and the coordsVersion state
//   }, [connections, coordsVersion, getElementCoords, getPathData]);

//   // ***** START SOLUTION *****
//   // Handler to stop wheel event propagation from bubbling up
//   const stopWheelPropagation = (e: React.WheelEvent<HTMLDivElement>) => {
//     e.stopPropagation();
//   };
//   // ***** END SOLUTION *****

//   return (
//     <div
//       className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
//       onClick={handleBackdropClick}
//       role="dialog"
//       aria-modal="true"
//       aria-labelledby="modal-title"
//     >
//       {/* Modal Content Box */}
//       <div
//         className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-xl w-full max-w-4xl max-h-[450px] flex flex-col relative border border-gray-200 dark:border-gray-700" // Added max-h, changed padding, added border
//         onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
//         // ***** SOLUTION STEP (Optional) *****
//         // Add here ONLY if the *entire* modal scrolls AND causes unwanted page zoom/scroll.
//         // Usually, stopping propagation on the inner columns is sufficient.
//         // onWheel={stopWheelPropagation}
//       >
//         {/* Modal Header */}
//         <div className="flex justify-between items-center mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 flex-shrink-0 px-1">
//           <h2
//             id="modal-title"
//             className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100"
//           >
//             {schema.label || nodeType} Node Schema
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold leading-none p-1 -mr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//             aria-label="Close modal"
//           >
//             × {/* More standard 'times' symbol */}
//           </button>
//         </div>

//         {/* Optional: Schema Description */}
//         {schema.description && (
//           <p className="mb-3 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0 px-1">
//             {schema.description}
//           </p>
//         )}

//         {/* Schema Columns Container - Takes remaining space */}
//         {/* Added ref here */}
//         <div
//           ref={svgContainerRef}
//           className="flex-grow flex flex-col md:flex-row gap-3 md:gap-4 overflow-hidden relative min-h-[200px]"
//         >
//           {" "}
//           {/* Ensure minimum height for flex-grow */}
//           {/* Input Schema Column - Scrollable */}
//           <div
//             className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto" // <-- THIS ENABLES SCROLLING
//             // ***** SOLUTION STEP *****
//             onWheel={stopWheelPropagation} // Stop wheel events here
//           >
//             {/* Sticky Header for Input Column */}
//             <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-blue-700 dark:text-blue-400 flex-shrink-0 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm px-2 pt-2 z-10">
//               {" "}
//               {/* Added padding */}
//               Inputs
//             </h3>
//             {/* Scrollable Content Area for Input */}
//             <div className="flex-grow p-1">
//               {" "}
//               {/* Padding moved here */}
//               {renderSchemaItems(schema.inputSchema, "input")}
//             </div>
//           </div>
//           {/* Output Schema Column - Scrollable */}
//           <div
//             className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto" // <-- THIS ENABLES SCROLLING
//             // ***** SOLUTION STEP *****
//             onWheel={stopWheelPropagation} // Stop wheel events here
//           >
//             {/* Sticky Header for Output Column */}
//             <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-green-700 dark:text-green-400 flex-shrink-0 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm px-2 pt-2 z-10">
//               {" "}
//               {/* Added padding */}
//               Outputs
//             </h3>
//             {/* Scrollable Content Area for Output */}
//             <div className="flex-grow p-2">
//               {" "}
//               {/* Padding moved here */}
//               {renderSchemaItems(schema.outputSchema, "output")}
//             </div>
//           </div>
//           {/* SVG Overlay for Connections - Positioned Absolutely */}
//           {/* Render SVG only after container ref is available */}
//           {svgContainerRef.current && (
//             <svg
//               width="100%"
//               height="100%"
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 pointerEvents: "none", // Allow clicks to pass through to elements below
//                 zIndex: 5, // Ensure SVG is above columns but below modal controls if needed
//                 overflow: "visible", // Allow markers/paths to draw slightly outside bounds if needed
//               }}
//             >
//               {/* Arrowhead Definition */}
//               <defs>
//                 <marker
//                   id="arrowhead"
//                   markerWidth="8" // Smaller arrowhead
//                   markerHeight="6"
//                   refX="7" // Adjust refX so tip aligns with line end
//                   refY="3"
//                   orient="auto"
//                   markerUnits="strokeWidth" // Scale with stroke width
//                 >
//                   <path d="M0,0 L8,3 L0,6 Z" fill="currentColor" />{" "}
//                   {/* Use currentColor */}
//                 </marker>
//               </defs>
//               {/* Render calculated connection paths */}
//               {connectionPaths}
//             </svg>
//           )}
//         </div>
//         {/* End Schema Columns Container */}

//         {/* Footer */}
//         <div className="mt-3 text-right border-t border-gray-200 dark:border-gray-700 pt-3 flex-shrink-0 px-1">
//           <button
//             onClick={onClose}
//             className="px-5 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm font-medium"
//           >
//             Done
//           </button>
//         </div>
//       </div>{" "}
//       {/* End Modal Content Box */}
//     </div> /* End Modal Backdrop */
//   );
// };

// export default SchemaModal;









import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  JSX,
} from "react";
import { NodeType, SchemaItem } from "./workflow-context"; // Adjust path
import { Badge } from "@/components/ui/badge"; // Adjust path

// --- Data Types ---

// Keep the original SchemaItem if it doesn't have source info
// type SchemaItem = {
//   name: string;
//   datatype: string;
//   required?: boolean;
//   description?: string;
// };

type ExtendedSchemaItem = SchemaItem & {
  sourceNodeId?: string; // Added unique ID for the source node
  sourceNodeType?: string;
  sourceNodeLabel?: string;
  mappedFrom?: string; // Name of the source item it's mapped from
  mappedFromNodeId?: string; // ID of the source node it's mapped from
  mappedFromNodeLabel?: string; // Label of the source node it's mapped from
};

interface SchemaModalProps {
  nodeType: NodeType | null;
  nodeId: string; // Need current node's ID for unique ref keys
  nodeLabel?: string;
  baseInputSchema: SchemaItem[]; // Use basic SchemaItem here
  baseOutputSchema: SchemaItem[]; // Use basic SchemaItem here
  availableInputsFromPrevious: ExtendedSchemaItem[]; // Source items already have extra info
  onClose: () => void;
  // Optional: Callback to persist the mappings
  onSaveMappings?: (updatedInputs: ExtendedSchemaItem[]) => void;
}

interface GroupedSource {
  nodeId: string; // Keep track of the source node ID
  nodeLabel: string; // Display label for the group
  nodeType: string; // Type for potential icon/styling
  outputs: ExtendedSchemaItem[];
}

interface Connection {
  sourceItemId: string; // Ref ID of the source element (available output)
  targetItemId: string; // Ref ID of the target element (current input)
}

interface Point {
  x: number;
  y: number;
}

// --- Component ---

const SchemaModal: React.FC<SchemaModalProps> = ({
  nodeType,
  nodeId: currentNodeId, // Rename for clarity
  nodeLabel,
  baseInputSchema,
  baseOutputSchema,
  availableInputsFromPrevious,
  onClose,
  onSaveMappings, // Add this prop if you need to save
}) => {
  // --- State ---
  const [localInputSchema, setLocalInputSchema] = useState<
    ExtendedSchemaItem[]
  >([]);
  const [selectedSourceItem, setSelectedSourceItem] =
    useState<ExtendedSchemaItem | null>(null); // The selected available output
  const [selectedTargetItem, setSelectedTargetItem] =
    useState<ExtendedSchemaItem | null>(null); // The selected current input
  const [connections, setConnections] = useState<Connection[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [coordsVersion, setCoordsVersion] = useState(0); // For forcing SVG redraw

  // --- Refs ---
  const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const svgContainerRef = useRef<HTMLDivElement | null>(null);

  // --- Effects ---

  // Initialize local state and connections when props change
  useEffect(() => {
    // Initialize local input schema, potentially preserving existing mappings
    const initialLocalInputs = baseInputSchema.map((baseInput) => {
      // Find if this input was already mapped in the availableInputs (e.g., loading saved state)
      // This requires the parent component to pass mappings within availableInputsFromPrevious
      // OR load mappings separately. Assuming baseInputSchema doesn't have mapping initially.
      // For now, just copy base schema. A more robust solution would merge existing mappings.
      const existingMapping = availableInputsFromPrevious.find(
        (prev) => prev.mappedFrom === baseInput.name /* && check target node/input? */
      ); // This logic might need refinement based on how mappings are stored/passed

      return {
        ...baseInput,
        mappedFrom: existingMapping?.name, // Example: Try to find pre-existing mapping
        mappedFromNodeId: existingMapping?.sourceNodeId,
        mappedFromNodeLabel: existingMapping?.sourceNodeLabel,
      };
    });
    setLocalInputSchema(initialLocalInputs);

    // Initialize connections based on the initial localInputSchema
    const initialConnections: Connection[] = [];
    initialLocalInputs.forEach((input) => {
      if (input.mappedFrom && input.mappedFromNodeId) {
        const sourceItemId = `source-${input.mappedFromNodeId}-${input.mappedFrom}`;
        const targetItemId = `target-${currentNodeId}-${input.name}`;
        // Check if the source item actually exists in the available list
        const sourceExists = availableInputsFromPrevious.some(
            source => source.sourceNodeId === input.mappedFromNodeId && source.name === input.mappedFrom
        );
        if (sourceExists) {
            initialConnections.push({ sourceItemId, targetItemId });
        } else {
            console.warn(`Initial mapping found for ${input.name} from ${input.mappedFromNodeLabel} (${input.mappedFrom}), but the source item is not available.`);
            // Optionally clear the mapping if the source is gone
            input.mappedFrom = undefined;
            input.mappedFromNodeId = undefined;
            input.mappedFromNodeLabel = undefined;
        }
      }
    });
    setConnections(initialConnections);

    // Clear refs and trigger coordinate update
    itemRefs.current.clear();
    setSelectedSourceItem(null);
    setSelectedTargetItem(null);
    const timeoutId = setTimeout(() => setCoordsVersion((prev) => prev + 1), 50);
    return () => clearTimeout(timeoutId);
  }, [baseInputSchema, availableInputsFromPrevious, currentNodeId, nodeType]); // Rerun if essential props change

  // Update coordinates on resize
  useEffect(() => {
    const handleResize = () => setCoordsVersion((prev) => prev + 1);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Ref Management ---
  const setItemRef = useCallback((id: string, element: HTMLDivElement | null) => {
    const map = itemRefs.current;
    if (element) {
      map.set(id, element);
    } else {
      map.delete(id); // Clean up deleted refs
    }
    // Trigger potential coordinate update when refs change (debounced slightly)
    // Be cautious with this, might cause loops if not careful
    // setTimeout(() => setCoordsVersion(prev => prev + 1), 0);
  }, []);


  // --- Data Grouping ---
  const groupAvailableInputs = useCallback((): GroupedSource[] => {
    const grouped: Record<string, { nodeId: string; nodeType: string; nodeLabel: string; outputs: ExtendedSchemaItem[] }> = {};

    availableInputsFromPrevious.forEach((source) => {
      // Use sourceNodeId for unique grouping, sourceNodeLabel for display
      const groupId = source.sourceNodeId || "unknown-source";
      const groupLabel = source?.name || "Unknown Source";
      const nodeType = source.sourceNodeType || "Unknown";

      if (!grouped[groupId]) {
        grouped[groupId] = { nodeId: groupId, nodeType: nodeType, nodeLabel: groupLabel, outputs: [] };
      }
      grouped[groupId].outputs.push(source);
    });

    // Sort groups, e.g., alphabetically by label
    return Object.values(grouped).sort((a, b) => a.nodeLabel.localeCompare(b.nodeLabel));

  }, [availableInputsFromPrevious]);

  const groupedSources = useMemo(() => groupAvailableInputs(), [groupAvailableInputs]);

  // --- Interaction Logic ---

  const handleItemClick = (
    item: ExtendedSchemaItem,
    type: "available" | "currentInput"
  ) => {
    // Generate IDs matching the refs
    const sourceNodeId = type === "available" ? item.sourceNodeId : selectedSourceItem?.sourceNodeId;
    const sourceItemId = type === "available" ? `source-${sourceNodeId}-${item.name}` : `source-${sourceNodeId}-${selectedSourceItem?.name}`;
    const targetItemId = type === "currentInput" ? `target-${currentNodeId}-${item.name}` : `target-${currentNodeId}-${selectedTargetItem?.name}`;

    let connectionMade = false;

    if (type === "available") {
      // Clicked on a source/available item
      if (
        selectedTargetItem &&
        item.datatype === selectedTargetItem.datatype
      ) {
        // Target was already selected, and types match: Create connection
        const newConnection: Connection = { sourceItemId, targetItemId: `target-${currentNodeId}-${selectedTargetItem.name}` };

        setConnections((prev) => {
          // Remove any existing connection TO this target before adding new one
          const filtered = prev.filter(c => c.targetItemId !== newConnection.targetItemId);
          return [...filtered, newConnection];
        });

        // Update localInputSchema with mapping info
        setLocalInputSchema((prev) =>
          prev.map((input) =>
            input.name === selectedTargetItem.name
              ? {
                  ...input,
                  mappedFrom: item.name,
                  mappedFromNodeId: item.sourceNodeId,
                  mappedFromNodeLabel: item.sourceNodeLabel,
                }
              : input
          )
        );

        setSelectedSourceItem(null);
        setSelectedTargetItem(null);
        connectionMade = true;

      } else {
        // No compatible target selected, or type mismatch: Select this source
        setSelectedSourceItem(item === selectedSourceItem ? null : item); // Toggle selection
        setSelectedTargetItem(null); // Deselect target
      }
    } else if (type === "currentInput") {
      // Clicked on a target/currentInput item
      if (
        selectedSourceItem &&
        item.datatype === selectedSourceItem.datatype
      ) {
        // Source was already selected, and types match: Create connection
        const newConnection: Connection = { sourceItemId: `source-${selectedSourceItem.sourceNodeId}-${selectedSourceItem.name}`, targetItemId };

        setConnections((prev) => {
          // Remove any existing connection TO this target before adding new one
           const filtered = prev.filter(c => c.targetItemId !== newConnection.targetItemId);
           return [...filtered, newConnection];
        });

        // Update localInputSchema with mapping info
        setLocalInputSchema((prev) =>
          prev.map((input) =>
            input.name === item.name
              ? {
                  ...input,
                  mappedFrom: selectedSourceItem.name,
                  mappedFromNodeId: selectedSourceItem.sourceNodeId,
                  mappedFromNodeLabel: selectedSourceItem.sourceNodeLabel,
                }
              : input
          )
        );

        setSelectedSourceItem(null);
        setSelectedTargetItem(null);
        connectionMade = true;
      } else {
        // No compatible source selected, or type mismatch: Select this target
        setSelectedTargetItem(item === selectedTargetItem ? null : item); // Toggle selection
        setSelectedSourceItem(null); // Deselect source
      }
    }

    // Force coordinate update if a connection was made or selection changed significantly
    if (connectionMade) {
      requestAnimationFrame(() => setCoordsVersion((prev) => prev + 1));
    }
  };

  // --- Coordinate Calculation ---
  const getElementCoords = useCallback((elementId: string): Point | null => {
      const element = itemRefs.current.get(elementId);
      const svgContainer = svgContainerRef.current;

      if (!element || !svgContainer) return null;

      const elementRect = element.getBoundingClientRect();
      const containerRect = svgContainer.getBoundingClientRect();

      // Determine side based on ID prefix
      const isSource = elementId.startsWith('source-');
      const isTarget = elementId.startsWith('target-');

      let x: number;
      if (isSource) {
          // Connect to the right side of source items
          x = elementRect.right - containerRect.left;
      } else if (isTarget) {
          // Connect to the left side of target items
          x = elementRect.left - containerRect.left;
      } else {
           console.warn(`Cannot determine side for element ID: ${elementId}`);
           return null;
      }

      const y = elementRect.top + elementRect.height / 2 - containerRect.top;

      return { x, y };
  }, []); // No dependencies needed as it reads refs directly

  // --- SVG Path Generation ---
   const getPathData = (startPoint: Point, endPoint: Point): string => {
        const dx = endPoint.x - startPoint.x;
        // Simple curve: control points halfway horizontally
        const controlPointX1 = startPoint.x + dx * 0.5;
        const controlPointY1 = startPoint.y;
        const controlPointX2 = endPoint.x - dx * 0.5;
        const controlPointY2 = endPoint.y;
        // Bezier curve: M = move, C = curve (control1, control2, end)
        return `M ${startPoint.x} ${startPoint.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${endPoint.x} ${endPoint.y}`;
    };

  // --- Memoized Connection Paths ---
  const connectionPaths = useMemo(() => {
    // console.log(`Recalculating paths (version: ${coordsVersion})`);
    return connections
      .map((conn) => {
        const startPoint = getElementCoords(conn.sourceItemId);
        const endPoint = getElementCoords(conn.targetItemId);

        if (startPoint && endPoint) {
          const pathData = getPathData(startPoint, endPoint);
          return (
            <path
              key={`${conn.sourceItemId}-${conn.targetItemId}`}
              d={pathData}
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              className="text-blue-500 dark:text-blue-400 opacity-80 hover:opacity-100" // Style the path
              markerEnd="url(#arrowhead)"
            />
          );
        }
        // console.warn(`Skipping connection render for ${conn.sourceItemId} -> ${conn.targetItemId} due to missing coords.`);
        return null;
      })
      .filter(Boolean); // Remove nulls if coords weren't found
  // Depend on connections state and the coordsVersion trigger
  }, [connections, coordsVersion, getElementCoords]); // getPathData is stable


  // --- Rendering Functions ---

  const toggleExpandGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
     // Allow layout to settle before potentially recalculating coords
    setTimeout(() => setCoordsVersion(v => v + 1), 50);
  };

  // Render Available Outputs (Grouped) - Left Column
  const renderAvailableOutputs = () => {
    if (groupedSources.length === 0) {
      return (
        <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-2 text-xs">
          No outputs available from previous nodes.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {groupedSources.map((group) => (
          <div key={group.nodeId} className="space-y-1">
            {/* Group Header */}
            <div
              onClick={() => toggleExpandGroup(group.nodeId)}
              className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 text-xs flex items-center justify-between bg-gray-100 dark:bg-gray-700/80 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600/80 transition sticky top-0 z-10" // Make group header sticky within its scroll container
            >
              <span className="truncate pr-2" title={group.nodeLabel}>{group.nodeLabel} <span className="font-normal text-gray-500 dark:text-gray-400">({group.nodeType})</span></span>
              <span className="text-gray-500 dark:text-gray-400 text-lg leading-none">
                {expandedGroups[group.nodeId] ? "-" : "+"}
              </span>
            </div>

            {/* Group Items (Conditional Render) */}
            {expandedGroups[group.nodeId] && (
              <ul className="space-y-1 pl-2 pt-1">
                {group.outputs.length === 0 && (
                   <li className="text-xs text-gray-500 dark:text-gray-400 italic px-1">
                        No outputs defined for this node.
                    </li>
                )}
                {group.outputs.map((source) => {
                  const id = `source-${source.sourceNodeId}-${source.name}`;
                  const isSelected = selectedSourceItem?.name === source.name && selectedSourceItem?.sourceNodeId === source.sourceNodeId;
                  const isCompatible = selectedTargetItem?.datatype === source.datatype;
                  const canConnect = selectedTargetItem && isCompatible;

                  return (
                    <li
                      key={id}
                      //  ref={(el) => setItemRef(id, el)}
                      
                  
                      className={`p-1 rounded border transition-all duration-150 cursor-pointer group relative ${
                        isSelected
                          ? "bg-green-100 dark:bg-green-900/50 ring-1 ring-green-400 border-green-300 dark:border-green-700"
                          : `border-gray-200 dark:border-gray-700 ${canConnect ? 'hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-300 dark:hover:border-green-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'}`
                      } ${!selectedTargetItem || isCompatible ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}`} // Dim if incompatible with selected target
                      onClick={() => (!selectedTargetItem || isCompatible) && handleItemClick(source, "available")}
                      title={!selectedTargetItem || isCompatible ? (source.description || source.name) : `Type mismatch (expects ${selectedTargetItem?.datatype})`}
                    >
                      <div className="flex justify-between items-start text-xs">
                        <span className="font-mono text-gray-800 dark:text-gray-200 break-all leading-tight">
                          {source.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs font-normal px-1 py-0 ml-1 flex-shrink-0 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                        >
                          {source.datatype}
                        </Badge>
                      </div>
                      {source.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                          {source.description}
                        </p>
                      )}
                      {/* Visual cue for potential connection */}
                       {canConnect && (
                            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-400 dark:bg-green-500 group-hover:scale-125 transition-transform"></div>
                       )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render Node Inputs - Right Column
  const renderNodeInputs = () => {
    if (!localInputSchema || localInputSchema.length === 0) {
      return (
        <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-2 text-xs">
          No inputs defined for this node.
        </p>
      );
    }

    return (
      <div className="space-y-1.5">
        {localInputSchema.map((item) => {
          const id = `target-${currentNodeId}-${item.name}`;
          const isSelected = selectedTargetItem?.name === item.name;
          const isConnected = !!item.mappedFrom;
          const isCompatible = selectedSourceItem?.datatype === item.datatype;
          const canConnect = selectedSourceItem && isCompatible;

          return (
            <div
              key={id}
              ref={(el) => setItemRef(id, el)}
              className={`p-1.5 rounded border transition-all duration-150 cursor-pointer group relative ${
                isSelected
                  ? "bg-blue-100 dark:bg-blue-900/50 ring-1 ring-blue-400 border-blue-300 dark:border-blue-700"
                   : isConnected
                   ? "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600" // Indicate connected state
                   : `border-gray-200 dark:border-gray-700 ${canConnect ? 'hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'}`
              } ${!selectedSourceItem || isCompatible ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}`} // Dim if incompatible
              onClick={() => (!selectedSourceItem || isCompatible) && handleItemClick(item, "currentInput")}
               title={!selectedSourceItem || isCompatible ? (item.description || item.name) : `Type mismatch (expects ${selectedSourceItem?.datatype})`}
            >
              <div className="flex justify-between items-start mb-0.5">
                <span className="font-medium font-mono text-gray-800 dark:text-gray-200 break-all text-xs leading-tight">
                  {item.name}
                  {item.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs font-normal px-1.5 py-0.5 ml-2 flex-shrink-0 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                >
                  {item.datatype}
                </Badge>
              </div>

              {item.description && !item.mappedFrom && ( // Show description only if not mapped
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                  {item.description}
                </p>
              )}

              {item.mappedFrom && (
                <p className="text-xs text-green-700 dark:text-green-300 mt-0.5 leading-snug flex items-center">
                   <span className="mr-1">←</span> {/* Use arrow */}
                   <span className="font-mono bg-green-100 dark:bg-green-900/50 px-1 rounded">{item.mappedFrom}</span>
                   <span className="ml-1 text-gray-500 dark:text-gray-400 truncate">({item.mappedFromNodeLabel || 'Unknown'})</span>
                 </p>
              )}
               {/* Visual cue for potential connection */}
                {canConnect && (
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500 group-hover:scale-125 transition-transform"></div>
                )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render Node Outputs (Static Display) - Can be in a third column or below
  const renderNodeOutputs = () => {
    if (!baseOutputSchema || baseOutputSchema.length === 0) {
      return (
        <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-1 text-xs">
          No outputs defined for this node.
        </p>
      );
    }
    return (
      <div className="space-y-1">
        {baseOutputSchema.map((item) => (
          <div
            key={`output-${item.name}`}
            className="p-1.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
            title={item.description || item.name}
          >
            <div className="flex justify-between items-start mb-0.5">
              <span className="font-medium font-mono text-gray-800 dark:text-gray-200 break-all text-xs leading-tight">
                {item.name}
              </span>
              <Badge
                variant="outline"
                className="text-xs font-normal px-1.5 py-0.5 ml-2 flex-shrink-0 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
              >
                {item.datatype}
              </Badge>
            </div>
            {item.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

   // Stop wheel event propagation (from V2)
    const stopWheelPropagation = (e: React.WheelEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose(); // Or trigger save logic if needed
        }
    };

    // Handle Save/Done
    const handleDone = () => {
      if (onSaveMappings) {
        onSaveMappings(localInputSchema); // Pass the current state of inputs with mappings
      }
      onClose();
    };


  // --- Main Render ---
  if (!nodeType) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-xl w-full max-w-5xl max-h-[80vh] flex flex-col relative border border-gray-300 dark:border-gray-700" // Increased max-w, max-h
        onClick={(e) => e.stopPropagation()} // Prevent modal close on internal click
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-2 border-b border-gray-200 dark:border-gray-700 pb-2 flex-shrink-0 px-1">
          <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 truncate pr-4">
            Configure Inputs: {nodeLabel || nodeType}
          </h2>
          <button
            onClick={onClose} // Use onClose directly for cancel/close
            className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold leading-none p-1 -mr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content Area with Columns and SVG */}
        <div
          ref={svgContainerRef}
          className="flex-grow flex flex-col md:flex-row gap-3 md:gap-4 overflow-hidden relative min-h-[300px]" // Core container for columns + SVG
        >
          {/* Column 1: Available Outputs (Scrollable) */}
          <div
            className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto"
            onWheel={stopWheelPropagation} // Prevent page scroll
          >
            <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-green-700 dark:text-green-400 sticky top-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-2 pt-2 z-20">
              Available Outputs (from Previous Nodes)
            </h3>
            <div className="flex-grow p-2">
              {renderAvailableOutputs()}
            </div>
          </div>

          {/* Column 2: Node Inputs (Scrollable) */}
          <div
            className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto"
            onWheel={stopWheelPropagation} // Prevent page scroll
          >
            <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-blue-700 dark:text-blue-400 sticky top-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-2 pt-2 z-20">
              Node Inputs (Connect Here)
            </h3>
            <div className="flex-grow p-2">
              {renderNodeInputs()}
            </div>
          </div>

          {/* Column 3: Node Outputs (Static, Scrollable) */}
           <div className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800/50 overflow-y-auto"
               onWheel={stopWheelPropagation}
            >
                <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-purple-700 dark:text-purple-400 sticky top-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-2 pt-2 z-20">
                    Node Outputs (Informational)
                </h3>
                <div className="flex-grow p-2">
                    {renderNodeOutputs()}
                </div>
           </div>

          {/* SVG Overlay for Connections */}
          {svgContainerRef.current && (
            <svg
              width="100%"
              height="100%"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                pointerEvents: "none", // Click through SVG
                zIndex: 10, // Above columns but below modal header/footer potentially
                overflow: "visible",
              }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7" // Position arrowhead tip at line end
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L8,3 L0,6 Z" fill="currentColor" /> {/* Use current color */}
                </marker>
              </defs>
              {/* Render connection paths */}
              {connectionPaths}
            </svg>
          )}
        </div> {/* End Content Area */}

        {/* Footer */}
        <div className="flex-shrink-0 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end px-1 space-x-2">
          {/* Optional Cancel Button */}
           <button
                onClick={onClose}
                type="button"
                className="px-4 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-150 text-sm"
            >
                Cancel
            </button>
          <button
            onClick={handleDone} // Use the handler that potentially saves
            type="button" // Important for forms, though not strictly needed here
            className="px-5 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div> {/* End Modal Content Box */}
    </div> /* End Modal Backdrop */
  );
};

export default SchemaModal;





// import React, {
//   useState,
//   useRef,
//   useEffect,
//   useCallback,
//   useMemo,
//   JSX,
// } from "react";
// import { NodeType, SchemaItem } from "./workflow-context"; // Adjust path
// import { Badge } from "@/components/ui/badge"; // Adjust path

// // --- Data Types (Keep as before) ---
// type ExtendedSchemaItem = SchemaItem & {
//   sourceNodeId?: string;
//   sourceNodeType?: string;
//   sourceNodeLabel?: string;
//   mappedFrom?: string;
//   mappedFromNodeId?: string;
//   mappedFromNodeLabel?: string;
//   // Add a flag to distinguish original inputs from available sources when combined
//   isAvailableSource?: boolean;
// };

// interface SchemaModalProps {
//   nodeType: NodeType | null;
//   nodeId?: string;
//   nodeLabel?: string;
//   baseInputSchema: SchemaItem[];
//   baseOutputSchema: SchemaItem[];
//   availableInputsFromPrevious: ExtendedSchemaItem[];
//   onClose: () => void;
//   onSaveMappings?: (updatedInputs: ExtendedSchemaItem[]) => void;
// }

// interface GroupedSource {
//   nodeId: string;
//   nodeLabel: string;
//   nodeType: string;
//   outputs: ExtendedSchemaItem[];
// }

// interface Connection {
//   sourceItemId: string; // Ref ID: source-{nodeId}-{itemName}
//   targetItemId: string; // Ref ID: target-{nodeId}-{itemName}
// }

// interface Point {
//   x: number;
//   y: number;
// }

// // --- Component ---
// const SchemaModal: React.FC<SchemaModalProps> = ({
//   nodeType,
//   nodeId: currentNodeId,
//   nodeLabel,
//   baseInputSchema,
//   baseOutputSchema,
//   availableInputsFromPrevious,
//   onClose,
//   onSaveMappings,
// }) => {
//   // --- State (Keep as before) ---
//   const [localInputSchema, setLocalInputSchema] = useState<ExtendedSchemaItem[]>([]);
//   const [selectedSourceItem, setSelectedSourceItem] = useState<ExtendedSchemaItem | null>(null);
//   const [selectedTargetItem, setSelectedTargetItem] = useState<ExtendedSchemaItem | null>(null);
//   const [connections, setConnections] = useState<Connection[]>([]);
//   const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
//   const [coordsVersion, setCoordsVersion] = useState(0);

//   // --- Refs (Keep as before) ---
//   const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
//   const svgContainerRef = useRef<HTMLDivElement | null>(null); // This now wraps Input+Available and Output columns

//   // --- Effects (Keep as before, logic is sound) ---
//   useEffect(() => {
//     // Initialize local input schema
//      const initialLocalInputs = baseInputSchema.map((baseInput) => ({
//         ...baseInput,
//         // Logic to potentially load existing mappings if passed differently
//         // For now, assume baseInputSchema doesn't contain mappings yet
//     }));
//     setLocalInputSchema(initialLocalInputs);

//     // Initialize connections based on potential pre-mapped data *if* availableInputsFromPrevious
//     // contained items that were *already* mapped to this node's inputs
//     // This depends heavily on how initial state is passed. The current setup
//     // rebuilds connections based on user actions within the modal.
//     // If you need to load saved connections, enhance this part.
//     // const initialConnections: Connection[] = [];
//     //  // Example: If initialLocalInputs *did* have mapping info after loading:
//     //  initialLocalInputs.forEach((input) => {
//     //    if (input.mappedFrom && input.mappedFromNodeId) {
//     //      const sourceItemId = `source-${input.mappedFromNodeId}-${input.mappedFrom}`;
//     //      const targetItemId = `target-${currentNodeId}-${input.name}`;
//     //      const sourceExists = availableInputsFromPrevious.some(
//     //          s => s.sourceNodeId === input.mappedFromNodeId && s.name === input.mappedFrom
//     //      );
//     //      if (sourceExists) {
//     //          initialConnections.push({ sourceItemId, targetItemId });
//     //      }
//     //    }
//     //  });
//     // setConnections(initialConnections);


//     itemRefs.current.clear();
//     setSelectedSourceItem(null);
//     setSelectedTargetItem(null);
//     // Expand all groups by default in the new layout? Or keep state?
//     // setExpandedGroups({}); // Reset expanded state
//     const timeoutId = setTimeout(() => setCoordsVersion((prev) => prev + 1), 50);
//     return () => clearTimeout(timeoutId);
//   }, [baseInputSchema, availableInputsFromPrevious, currentNodeId]); // Removed nodeType dependency if not directly used here

//   useEffect(() => {
//     const handleResize = () => setCoordsVersion((prev) => prev + 1);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // --- Ref Management (Keep as before) ---
//   const setItemRef = useCallback((id: string, element: HTMLDivElement | null) => {
//     const map = itemRefs.current;
//     if (element) {
//       map.set(id, element);
//     } else {
//       map.delete(id);
//     }
//   }, []);

//   // --- Data Grouping (Keep as before) ---
//   const groupAvailableInputs = useCallback((): GroupedSource[] => {
//      const grouped: Record<string, { nodeId: string; nodeType: string; nodeLabel: string; outputs: ExtendedSchemaItem[] }> = {};
//      availableInputsFromPrevious.forEach((source) => {
//        const groupId = source.sourceNodeId || "unknown-source"; // Group unknown sources together
//        const groupLabel = source.name || (groupId === "unknown-source" ? "Unknown Source" : source.name || "Unnamed Node");
//        const nodeType = source.sourceNodeType || "Unknown";
//        if (!grouped[groupId]) {
//          grouped[groupId] = { nodeId: groupId, nodeType: nodeType, nodeLabel: groupLabel, outputs: [] };
//        }
//         // Add flag to distinguish these when rendering
//        grouped[groupId].outputs.push({ ...source, isAvailableSource: true });
//      });
//       // Sort Unknown source to top/bottom? Example: push unknown to end
//      const sortedGroups = Object.values(grouped).sort((a, b) => {
//         if (a.nodeId === "unknown-source") return 1;
//         if (b.nodeId === "unknown-source") return -1;
//         return a.nodeLabel.localeCompare(b.nodeLabel);
//      });
//      return sortedGroups;
//   }, [availableInputsFromPrevious]);

//   const groupedSources = useMemo(() => groupAvailableInputs(), [groupAvailableInputs]);

//   // --- Interaction Logic (Keep as before, type handles context) ---
//    const handleItemClick = (
//     item: ExtendedSchemaItem,
//     // Type now determined by item's 'isAvailableSource' flag or lack thereof
//     // We pass 'available' or 'currentInput' contextually from the render function
//     context: "available" | "currentInput"
//   ) => {
//      const sourceNodeId = context === "available" ? item.sourceNodeId : selectedSourceItem?.sourceNodeId;
//      // Ensure IDs are generated correctly based on context
//      const sourceItemId = context === "available"
//        ? `source-${item.sourceNodeId}-${item.name}` // ID for the source item clicked
//        : selectedSourceItem // ID for the currently selected source
//        ? `source-${selectedSourceItem.sourceNodeId}-${selectedSourceItem.name}`
//        : ''; // Should not happen if selectedSourceItem is required

//      const targetItemId = context === "currentInput"
//        ? `target-${currentNodeId}-${item.name}` // ID for the target item clicked
//        : selectedTargetItem // ID for the currently selected target
//        ? `target-${currentNodeId}-${selectedTargetItem.name}`
//        : ''; // Should not happen if selectedTargetItem is required


//     let connectionMade = false;

//     if (context === "available") {
//       // Clicked on a source/available item
//       if (
//         selectedTargetItem && // A target input must be selected
//         item.datatype === selectedTargetItem.datatype // Types must match
//       ) {
//         // Target selected & types match: Create connection
//         const currentTargetItemId = `target-${currentNodeId}-${selectedTargetItem.name}`; // Get the definite ID
//         const newConnection: Connection = { sourceItemId, targetItemId: currentTargetItemId };

//         setConnections((prev) => {
//           // Remove existing connection TO this target, add new one
//           const filtered = prev.filter(c => c.targetItemId !== newConnection.targetItemId);
//           return [...filtered, newConnection];
//         });

//         // Update localInputSchema with mapping info for the selected target
//         setLocalInputSchema((prev) =>
//           prev.map((input) =>
//             input.name === selectedTargetItem.name // Find the target in the local list
//               ? {
//                   ...input,
//                   mappedFrom: item.name,
//                   mappedFromNodeId: item.sourceNodeId,
//                   mappedFromNodeLabel: item.sourceNodeLabel,
//                 }
//               : input
//           )
//         );

//         setSelectedSourceItem(null); // Clear selections
//         setSelectedTargetItem(null);
//         connectionMade = true;

//       } else {
//         // No compatible target selected, or type mismatch: Select/toggle this source
//         setSelectedSourceItem(item === selectedSourceItem ? null : item);
//         setSelectedTargetItem(null); // Deselect any target
//       }
//     } else if (context === "currentInput") {
//       // Clicked on a target/currentInput item
//       if (
//         selectedSourceItem && // A source must be selected
//         item.datatype === selectedSourceItem.datatype // Types must match
//       ) {
//         // Source selected & types match: Create connection
//         const currentSourceItemId = `source-${selectedSourceItem.sourceNodeId}-${selectedSourceItem.name}`; // Get definite ID
//         const newConnection: Connection = { sourceItemId: currentSourceItemId, targetItemId };

//         setConnections((prev) => {
//            // Remove existing connection TO this target, add new one
//            const filtered = prev.filter(c => c.targetItemId !== newConnection.targetItemId);
//            return [...filtered, newConnection];
//         });

//         // Update this specific input item in localInputSchema
//         setLocalInputSchema((prev) =>
//           prev.map((input) =>
//             input.name === item.name // Find the clicked input
//               ? {
//                   ...input,
//                   mappedFrom: selectedSourceItem.name,
//                   mappedFromNodeId: selectedSourceItem.sourceNodeId,
//                   mappedFromNodeLabel: selectedSourceItem.sourceNodeLabel,
//                 }
//               : input
//           )
//         );

//         setSelectedSourceItem(null); // Clear selections
//         setSelectedTargetItem(null);
//         connectionMade = true;
//       } else {
//         // No compatible source selected, or type mismatch: Select/toggle this target
//         setSelectedTargetItem(item === selectedTargetItem ? null : item);
//         setSelectedSourceItem(null); // Deselect any source
//       }
//     }

//     if (connectionMade) {
//       requestAnimationFrame(() => setCoordsVersion((prev) => prev + 1));
//     }
//   };


//   // --- Coordinate Calculation (Keep as before) ---
//   // Calculates coords relative to svgContainerRef based on element ID prefix
//   const getElementCoords = useCallback((elementId: string): Point | null => {
//       const element = itemRefs.current.get(elementId);
//       const svgContainer = svgContainerRef.current;
//       if (!element || !svgContainer) return null;

//       const elementRect = element.getBoundingClientRect();
//       const containerRect = svgContainer.getBoundingClientRect();
//       const isSource = elementId.startsWith('source-');
//       const isTarget = elementId.startsWith('target-');

//       let x: number;
//       // Source connection point = right edge of element
//       if (isSource) x = elementRect.right - containerRect.left;
//       // Target connection point = left edge of element
//       else if (isTarget) x = elementRect.left - containerRect.left;
//       else return null; // Should not happen

//       const y = elementRect.top + elementRect.height / 2 - containerRect.top;
//       return { x, y };
//   }, []);

//   // --- SVG Path Generation (Keep as before) ---
//   const getPathData = (startPoint: Point, endPoint: Point): string => {
//     const dx = endPoint.x - startPoint.x;
//     const controlPointX1 = startPoint.x + dx * 0.5;
//     const controlPointY1 = startPoint.y;
//     const controlPointX2 = endPoint.x - dx * 0.5;
//     const controlPointY2 = endPoint.y;
//     return `M ${startPoint.x} ${startPoint.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${endPoint.x} ${endPoint.y}`;
//   };

//   // --- Memoized Connection Paths (Keep as before) ---
//   const connectionPaths = useMemo(() => {
//     return connections.map((conn) => {
//       const startPoint = getElementCoords(conn.sourceItemId);
//       const endPoint = getElementCoords(conn.targetItemId);
//       if (startPoint && endPoint) {
//         const pathData = getPathData(startPoint, endPoint);
//         return (
//           <path
//             key={`${conn.sourceItemId}-${conn.targetItemId}`}
//             d={pathData}
//             stroke="currentColor"
//             strokeWidth="1.5"
//             fill="none"
//             className="text-blue-500 dark:text-blue-400 opacity-80"
//             markerEnd="url(#arrowhead)"
//           />
//         );
//       }
//       return null;
//     }).filter(Boolean);
//   }, [connections, coordsVersion, getElementCoords]); // getPathData is stable


//   // --- Rendering Functions ---

//   const toggleExpandGroup = (groupId: string) => {
//     setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
//     setTimeout(() => setCoordsVersion(v => v + 1), 50); // Update coords after expand/collapse
//   };

//   // *** MODIFIED: Render Node Inputs AND Available Sources together ***
//   const renderCombinedInputsAndSources = () => {
//     return (
//       <>
//         {/* Section 1: Current Node Inputs */}
//         {!localInputSchema || localInputSchema.length === 0 ? (
//           <p className="text-gray-500 dark:text-gray-400 italic px-1 text-xs mb-4">
//             No inputs defined for this node.
//           </p>
//         ) : (
//           <div className="space-y-1.5 mb-4">
//             {localInputSchema.map((item) => {
//               // --- Rendering logic for TARGET items ---
//               const id = `target-${currentNodeId}-${item.name}`;
//               const isSelected = selectedTargetItem?.name === item.name;
//               const isConnected = !!item.mappedFrom;
//               const isCompatible = selectedSourceItem?.datatype === item.datatype;
//               const canConnect = selectedSourceItem && isCompatible;

//               return (
//                 <div
//                   key={id}
//                   ref={(el) => setItemRef(id, el)}
//                   className={`p-1.5 rounded border transition-all duration-150 cursor-pointer group relative ${
//                     isSelected
//                       ? "bg-blue-100 dark:bg-blue-900/50 ring-1 ring-blue-400 border-blue-300 dark:border-blue-700" // Selected Target
//                       : isConnected
//                       ? "bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600" // Connected Target
//                       : `border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 ${canConnect ? 'hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'}` // Default/Hover Target
//                   } ${!selectedSourceItem || isCompatible ? 'opacity-100' : 'opacity-60 cursor-not-allowed'}`} // Dim if incompatible source selected
//                   onClick={() => (!selectedSourceItem || isCompatible) && handleItemClick(item, "currentInput")} // Pass context
//                   title={!selectedSourceItem || isCompatible ? (item.description || item.name) : `Type mismatch (expects ${selectedSourceItem?.datatype})`}
//                 >
//                   {/* Left connection point visual */}
//                   <div className="absolute -left-[1px] top-0 bottom-0 w-1.5 bg-transparent group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 rounded-l-md transition-colors"></div>
//                    {/* Visual cue for potential connection */}
//                    {canConnect && (
//                       <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-400 dark:bg-blue-500 ring-2 ring-white dark:ring-gray-800 shadow-md group-hover:scale-110 transition-transform"></div>
//                     )}

//                   <div className="flex justify-between items-start mb-0.5 ml-1"> {/* Added ml-1 to give space from potential dot */}
//                     <span className="font-medium font-mono text-gray-800 dark:text-gray-200 break-all text-xs leading-tight">
//                       {item.name}
//                       {item.required && !item.mappedFrom && ( // Show required only if not connected
//                         <span className="text-red-500 ml-1">*</span>
//                       )}
//                     </span>
//                     <Badge variant="outline" className="text-xs font-normal px-1.5 py-0.5 ml-2 flex-shrink-0 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
//                       {item.datatype}
//                     </Badge>
//                   </div>

//                   {item.description && !item.mappedFrom && (
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug ml-1">
//                       {item.description}
//                     </p>
//                   )}

//                   {item.mappedFrom && (
//                     <p className="text-xs text-green-700 dark:text-green-300 mt-0.5 leading-snug flex items-center ml-1">
//                       <span className="mr-1 font-semibold">←</span>
//                       <span className="font-mono bg-green-100 dark:bg-green-900/50 px-1 rounded">{item.mappedFrom}</span>
//                       <span className="ml-1 text-gray-500 dark:text-gray-400 truncate text-[11px]">({item.mappedFromNodeLabel || 'Unknown'})</span>
//                     </p>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Separator */}
//         <hr className="my-3 border-gray-300 dark:border-gray-600"/>

//         {/* Section 2: Available Sources (Grouped) */}
//         <h4 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400 px-1">
//            Available Outputs from Previous Nodes
//         </h4>
//         {groupedSources.length === 0 ? (
//           <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-1 text-xs">
//             No outputs available to connect from.
//           </p>
//         ) : (
//           <div className="space-y-3">
//             {groupedSources.map((group) => (
//               <div key={group.nodeId} className="space-y-1">
//                 {/* Group Header */}
//                 <div
//                   onClick={() => toggleExpandGroup(group.nodeId)}
//                    className={`cursor-pointer font-semibold text-gray-700 dark:text-gray-300 text-xs flex items-center justify-between p-1.5 rounded transition ${expandedGroups[group.nodeId] ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-600/80'}`}
//                 >
//                   <span className="truncate pr-2" title={`${group.nodeLabel} (${group.nodeType})`}>
//                     {group.nodeLabel}
//                     <span className="font-normal text-gray-500 dark:text-gray-400 ml-1">({group.nodeType})</span>
//                   </span>
//                   <span className="text-gray-500 dark:text-gray-400 text-lg leading-none">
//                     {expandedGroups[group.nodeId] ? "−" : "+"}
//                   </span>
//                 </div>

//                 {/* Group Items (Conditional Render) */}
//                 {expandedGroups[group.nodeId] && (
//                   <ul className="space-y-1 pl-2 pt-1 border-l-2 border-gray-200 dark:border-gray-600 ml-1.5">
//                     {group.outputs.length === 0 ? (
//                       <li className="text-xs text-gray-500 dark:text-gray-400 italic px-1">
//                         No outputs from this node.
//                       </li>
//                     ) : (
//                       group.outputs.map((source) => {
//                          // --- Rendering logic for SOURCE items ---
//                          const id = `source-${source.sourceNodeId}-${source.name}`;
//                          const isSelected = selectedSourceItem?.name === source.name && selectedSourceItem?.sourceNodeId === source.sourceNodeId;
//                          const isCompatible = selectedTargetItem?.datatype === source.datatype;
//                          const canConnect = selectedTargetItem && isCompatible;

//                          return (
//                            <li
//                              key={id}
//                              ref={(el) => setItemRef(id, el)}
//                              className={`p-1.5 rounded border transition-all duration-150 cursor-pointer group relative ${
//                                 isSelected
//                                  ? "bg-green-100 dark:bg-green-900/50 ring-1 ring-green-400 border-green-300 dark:border-green-700" // Selected Source
//                                  : `border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 ${canConnect ? 'hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-300 dark:hover:border-green-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'}` // Default/Hover Source
//                              } ${!selectedTargetItem || isCompatible ? 'opacity-100' : 'opacity-60 cursor-not-allowed'}`} // Dim if incompatible target selected
//                              onClick={() => (!selectedTargetItem || isCompatible) && handleItemClick(source, "available")} // Pass context
//                              title={!selectedTargetItem || isCompatible ? (source.description || source.name) : `Type mismatch (expects ${selectedTargetItem?.datatype})`}
//                            >
//                             {/* Right connection point visual */}
//                              <div className="absolute -right-[1px] top-0 bottom-0 w-1.5 bg-transparent group-hover:bg-green-200 dark:group-hover:bg-green-800/50 rounded-r-md transition-colors"></div>
//                              {/* Visual cue for potential connection */}
//                               {canConnect && (
//                                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-green-400 dark:bg-green-500 ring-2 ring-white dark:ring-gray-800 shadow-md group-hover:scale-110 transition-transform"></div>
//                               )}

//                              <div className="flex justify-between items-start text-xs mr-1"> {/* Added mr-1 */}
//                                <span className="font-mono text-gray-800 dark:text-gray-200 break-all leading-tight">
//                                  {source.name}
//                                </span>
//                                <Badge variant="outline" className="text-xs font-normal px-1 py-0 ml-1 flex-shrink-0 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
//                                  {source.datatype}
//                                </Badge>
//                              </div>
//                              {source.description && (
//                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug mr-1">
//                                  {source.description}
//                                </p>
//                              )}
//                            </li>
//                          );
//                       })
//                     )}
//                   </ul>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </>
//     );
//   };

//   // Render Node Outputs (Static Display) - Keep as before
//   const renderNodeOutputs = () => {
//     // ... (Keep the exact implementation from the previous version) ...
//      if (!baseOutputSchema || baseOutputSchema.length === 0) {
//       return (
//         <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-1 text-xs">
//           No outputs defined for this node.
//         </p>
//       );
//     }
//     return (
//       <div className="space-y-1">
//         {baseOutputSchema.map((item) => (
//           <div
//             key={`output-${item.name}`} // Use unique key
//             // No ref needed unless outputs become connectable *from*
//             className="p-1.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
//             title={item.description || item.name}
//           >
//             <div className="flex justify-between items-start mb-0.5">
//               <span className="font-medium font-mono text-gray-800 dark:text-gray-200 break-all text-xs leading-tight">
//                 {item.name}
//               </span>
//               <Badge
//                 variant="outline"
//                 className="text-xs font-normal px-1.5 py-0.5 ml-2 flex-shrink-0 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
//               >
//                 {item.datatype}
//               </Badge>
//             </div>
//             {item.description && (
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
//                 {item.description}
//               </p>
//             )}
//           </div>
//         ))}
//       </div>
//     );
//   };

//   // --- Utility Functions (Keep as before) ---
//   const stopWheelPropagation = (e: React.WheelEvent<HTMLDivElement>) => e.stopPropagation();
//   const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (e.target === e.currentTarget) onClose();
//   };
//   const handleDone = () => {
//     if (onSaveMappings) {
//       // Filter out the temporary 'isAvailableSource' flag before saving
//       const inputsToSave = localInputSchema.map(({ isAvailableSource, ...rest }) => rest);
//       onSaveMappings(inputsToSave);
//     }
//     onClose();
//   };

//   // --- Main Render ---
//   if (!nodeType) return null;

//   return (
//     <div
//       className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
//       onClick={handleBackdropClick}
//       role="dialog"
//       aria-modal="true"
//       aria-labelledby="modal-title"
//     >
//       <div
//         className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col relative border border-gray-300 dark:border-gray-700" // Reduced max-width as we only have 2 main columns now
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header (Keep as before) */}
//          <div className="flex justify-between items-center mb-2 border-b border-gray-200 dark:border-gray-700 pb-2 flex-shrink-0 px-1">
//            <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 truncate pr-4">
//              Configure Inputs: {nodeLabel || nodeType}
//            </h2>
//            <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold leading-none p-1 -mr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close"> × </button>
//          </div>

//         {/* Content Area with Columns and SVG */}
//         {/* *** MODIFIED: Now only two direct children columns *** */}
//         <div
//           ref={svgContainerRef} // Ref covers both columns for coordinate calculations
//           className="flex-grow flex flex-col md:flex-row gap-3 md:gap-4 overflow-hidden relative min-h-[300px]"
//         >
//           {/* Column 1: Combined Inputs & Available Sources (Scrollable) */}
//           <div
//             className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto relative" // Added relative for sticky positioning context
//             onWheel={stopWheelPropagation}
//           >
//              {/* Sticky Header is now part of the combined column */}
//             <h3 className="text-base font-semibold mb-0 border-b border-gray-200 dark:border-gray-700 pb-1 text-blue-700 dark:text-blue-400 sticky top-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-2 pt-2 z-20">
//                Node Inputs & Available Sources
//             </h3>
//              {/* Scrollable Content Area */}
//             <div className="flex-grow p-2">
//                {/* Render the combined content */}
//               {renderCombinedInputsAndSources()}
//             </div>
//           </div>

//           {/* Column 2: Node Outputs (Static, Scrollable) */}
//            <div
//              className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800/50 overflow-y-auto relative" // Added relative
//              onWheel={stopWheelPropagation}
//             >
//                 <h3 className="text-base font-semibold mb-0 border-b border-gray-200 dark:border-gray-700 pb-1 text-purple-700 dark:text-purple-400 sticky top-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-2 pt-2 z-20">
//                     Node Outputs
//                 </h3>
//                 <div className="flex-grow p-2">
//                     {renderNodeOutputs()}
//                 </div>
//            </div>

//           {/* SVG Overlay (Keep as before, covers the whole container) */}
//           {svgContainerRef.current && (
//             <svg
//               width="100%"
//               height="100%"
//               style={{
//                 position: "absolute", top: 0, left: 0,
//                 pointerEvents: "none", zIndex: 10, overflow: "visible",
//               }}
//             >
//               <defs>
//                 <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
//                   <path d="M0,0 L8,3 L0,6 Z" fill="currentColor" />
//                 </marker>
//               </defs>
//               {connectionPaths}
//             </svg>
//           )}
//         </div> {/* End Content Area */}

//         {/* Footer (Keep as before) */}
//         <div className="flex-shrink-0 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end px-1 space-x-2">
//             {/* <button onClick={onClose} type="button" className="px-4 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-150 text-sm"> Cancel </button> */}
//             <button onClick={handleDone} type="button" className="px-5 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm font-medium"> Done </button>
//         </div>
//       </div> {/* End Modal Content Box */}
//     </div> /* End Modal Backdrop */
//   );
// };

// export default SchemaModal;
