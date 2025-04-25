
// import React, { JSX, useState, useRef, useEffect, useCallback } from 'react';
// import { getNodeSchema } from './nodeSchemas'; // Adjust path
// import { NodeType, SchemaItem } from './workflow-context'; // Adjust path
// import { Badge } from '@/components/ui/badge'; // Assuming you have a Badge component

// // Define props interface
// interface SchemaModalProps {
//     nodeType: NodeType | null;
//     onClose: () => void;
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
//     const [selectedInput, setSelectedInput] = useState<SchemaItem | null>(null);
//     const [connections, setConnections] = useState<Connection[]>([]);
//     const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
//     const svgContainerRef = useRef<HTMLDivElement | null>(null);
//     const [coordsVersion, setCoordsVersion] = useState(0);

//     // --- Effect to recalculate coordinates ---
//     useEffect(() => {
//         itemRefs.current.clear();
//         const timeoutId = setTimeout(() => {
//             // console.log("Triggering coord update via useEffect [nodeType]");
//             setCoordsVersion(prev => prev + 1);
//         }, 50); // Short delay to allow refs to potentially settle after render
//         return () => clearTimeout(timeoutId);
//     }, [nodeType]); // Rerun if nodeType changes

//     // --- Effect for resize ---
//     useEffect(() => {
//         const handleResize = () => {
//             // console.log("Triggering coord update via useEffect [resize]");
//             setCoordsVersion(prev => prev + 1);
//         };
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []); // Run only once on mount/unmount

//     if (!nodeType) return null;
//     const schema = getNodeSchema(nodeType);

//     // --- Error Handling ---
//     if (!schema) {
//         return (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
//                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md text-center border border-red-300 dark:border-red-700">
//                     <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">Error</h3>
//                     <p className="text-gray-700 dark:text-gray-300">Could not load schema for node type: <span className="font-mono bg-red-100 dark:bg-red-900/50 px-1 rounded">{nodeType}</span>.</p>
//                     <button
//                         onClick={onClose}
//                         className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
//                     >
//                         Close
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     // --- Ref Management ---
//     const setItemRef = useCallback((id: string, element: HTMLDivElement | null) => {
//         const map = itemRefs.current;
//         if (element) {
//             map.set(id, element);
//         } else {
//             if (map.has(id)) {
//                 map.delete(id);
//             }
//         }
//     }, []);

//     // --- Click Handler ---
//     const handleItemClick = (item: SchemaItem, type: 'input' | 'output') => {
//         if (type === 'input') {
//             // Toggle selection for input
//             if (selectedInput?.name === item.name) {
//                 setSelectedInput(null);
//             } else {
//                 setSelectedInput(item);
//             }
//         } else if (type === 'output' && selectedInput) {
//             // Create connection if an input is selected
//             const newConnection: Connection = {
//                 inputId: selectedInput.name,
//                 outputId: item.name,
//             };
//             // Avoid duplicate connections
//             if (!connections.some(c => c.inputId === newConnection.inputId && c.outputId === newConnection.outputId)) {
//                 setConnections(prevConnections => [...prevConnections, newConnection]);
//                  // Force coordinate update after connection state changes
//                  requestAnimationFrame(() => setCoordsVersion(prev => prev + 1));
//             }
//             // Deselect input after connection
//             setSelectedInput(null);
//         }
//     };

//     // --- Helper to get coordinates ---
//     // This version relies on getBoundingClientRect relative to the SVG container
//     // It should work correctly even with scrolling inside the columns
//     const getElementCoords = useCallback((elementId: string): Point | null => {
//         const element = itemRefs.current.get(elementId);
//         const svgContainer = svgContainerRef.current;

//         if (!element || !svgContainer) {
//              // console.warn(`Element or SVG container not found for ID: ${elementId}`);
//              return null;
//         }

//         const elementRect = element.getBoundingClientRect();
//         const containerRect = svgContainer.getBoundingClientRect();

//         // Determine if it's an input or output based on schema (more robust)
//         const isInput = schema.inputSchema?.some(item => item.name === elementId);
//         const isOutput = schema.outputSchema?.some(item => item.name === elementId);

//         let x: number;
//         if (isInput) {
//             // Connect to the right side of input items
//             x = elementRect.right - containerRect.left;
//         } else if (isOutput) {
//             // Connect to the left side of output items
//             x = elementRect.left - containerRect.left;
//         } else {
//             // Fallback or error - shouldn't happen if elementId is from schema
//              console.warn(`Element ID ${elementId} not found in input or output schema`);
//              return null;
//         }

//         // Calculate Y position relative to the container's top edge
//         const y = elementRect.top + elementRect.height / 2 - containerRect.top;

//         // Ensure coordinates are within the bounds (optional, but good practice)
//         // if (x < 0 || y < 0 || x > containerRect.width || y > containerRect.height) {
//         //     console.warn(`Calculated coords for ${elementId} are outside SVG container bounds.`);
//         //     // Decide how to handle: return null, clamp values, etc.
//         //     // Returning null might be safest if elements aren't visible
//         //     // return null;
//         // }


//         return { x, y };
//     }, [schema.inputSchema, schema.outputSchema]); // Dependencies for schema access

//     // --- Generate SVG Path Data ---
//     const getPathData = (startPoint: Point, endPoint: Point): string => {
//         const dx = endPoint.x - startPoint.x;
//         // Control points for a smooth horizontal curve
//         const controlPointX1 = startPoint.x + dx * 0.5;
//         const controlPointY1 = startPoint.y;
//         const controlPointX2 = endPoint.x - dx * 0.5;
//         const controlPointY2 = endPoint.y;
//         return `M ${startPoint.x} ${startPoint.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${endPoint.x} ${endPoint.y}`;
//     };


//     // --- Render Schema Items ---
//     const renderSchemaItems = (
//         schemaItems: SchemaItem[] | undefined,
//         type: 'input' | 'output'
//     ): JSX.Element => {
//         if (!schemaItems || schemaItems.length === 0) {
//             return <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-1 text-xs">No items defined.</p>;
//         }
//         return (
//             <div className="space-y-1"> {/* Use space-y for consistent spacing */}
//                 {schemaItems.map((item) => {
//                     const isSelected = type === 'input' && selectedInput?.name === item.name;
//                     const id = item.name; // Use name as unique key/id within its type
//                     return (
//                         <div
//                             key={id}
//                             ref={(el) => setItemRef(id, el)} // Set ref for coordinate calculation
//                             className={`p-1.5 rounded border border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer ${
//                                 isSelected ? 'bg-blue-100 dark:bg-blue-900 ring-1 ring-blue-400' : ''
//                             }`}
//                             onClick={() => handleItemClick(item, type)}
//                             role="button"
//                             aria-pressed={isSelected}
//                             title={item.description || item.name} // Tooltip for description
//                         >
//                            {/* Item Content Layout */}
//                            <div className="flex justify-between items-start mb-0.5">
//                                 <span className="font-medium font-mono text-gray-800 dark:text-gray-200 break-all text-xs leading-tight">
//                                     {item.name}
//                                     {item.required && <span className="text-red-500 ml-1">*</span>}
//                                 </span>
//                                 <Badge variant="outline" className="text-xs font-normal px-1.5 py-0.5 ml-2 flex-shrink-0 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
//                                     {item.datatype}
//                                 </Badge>
//                             </div>
//                             {item.description && (
//                                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{item.description}</p>
//                             )}
//                         </div>
//                     );
//                 })}
//             </div>
//         );
//     };

//   // Handle backdrop click to close modal
//   const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (e.target === e.currentTarget) { // Only close if backdrop itself is clicked
//       onClose();
//     }
//   };

//     // --- Calculate connections path data ---
//     // Use React.useMemo to recalculate paths only when dependencies change
//     const connectionPaths = React.useMemo(() => {
//         // console.log(`Recalculating paths (version: ${coordsVersion})`);
//         return connections.map((conn) => {
//             const startPoint = getElementCoords(conn.inputId);
//             const endPoint = getElementCoords(conn.outputId);

//             // Only render path if both start and end points are valid
//             if (startPoint && endPoint) {
//                 const pathData = getPathData(startPoint, endPoint);
//                 return (
//                     <path
//                         key={`${conn.inputId}-${conn.outputId}`}
//                         d={pathData}
//                         stroke="currentColor" // Use currentColor for theme adaptability
//                         strokeWidth="1.5"
//                         fill="none"
//                         className="text-blue-500 dark:text-blue-400" // Set color via className
//                         markerEnd="url(#arrowhead)" // Add arrowhead marker
//                     />
//                 );
//             }
//             // console.warn(`Skipping connection render for ${conn.inputId} -> ${conn.outputId} due to missing coords.`);
//             return null; // Return null for invalid connections
//         }).filter(Boolean); // Filter out null values
//     // Depend on connections array and the coordsVersion state
//     }, [connections, coordsVersion, getElementCoords, getPathData]);


//     // ***** START SOLUTION *****
//     // Handler to stop wheel event propagation from bubbling up
//     const stopWheelPropagation = (e: React.WheelEvent<HTMLDivElement>) => {
//         e.stopPropagation();
//     };
//     // ***** END SOLUTION *****

//     return (
//         <div
//             className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
//             onClick={handleBackdropClick}
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="modal-title"
//         >
//             {/* Modal Content Box */}
//             <div
//                  className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-xl w-full max-w-4xl max-h-[450px] flex flex-col relative border border-gray-200 dark:border-gray-700" // Added max-h, changed padding, added border
//                 onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
//                 // ***** SOLUTION STEP (Optional) *****
//                 // Add here ONLY if the *entire* modal scrolls AND causes unwanted page zoom/scroll.
//                 // Usually, stopping propagation on the inner columns is sufficient.
//                 // onWheel={stopWheelPropagation}
//             >
//                 {/* Modal Header */}
//                 <div className="flex justify-between items-center mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 flex-shrink-0 px-1">
//                      <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
//                         {schema.label || nodeType} Node Schema
//                     </h2>
//                     <button
//                         onClick={onClose}
//                         className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold leading-none p-1 -mr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//                         aria-label="Close modal"
//                     >
//                         × {/* More standard 'times' symbol */}
//                     </button>
//                 </div>

//                 {/* Optional: Schema Description */}
//                 {schema.description && (
//                     <p className="mb-3 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0 px-1">{schema.description}</p>
//                 )}

//                 {/* Schema Columns Container - Takes remaining space */}
//                 {/* Added ref here */}
//                 <div ref={svgContainerRef} className="flex-grow flex flex-col md:flex-row gap-3 md:gap-4 overflow-hidden relative min-h-[200px]"> {/* Ensure minimum height for flex-grow */}

//                     {/* Input Schema Column - Scrollable */}
//                     <div
//                         className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto" // <-- THIS ENABLES SCROLLING
//                         // ***** SOLUTION STEP *****
//                         onWheel={stopWheelPropagation} // Stop wheel events here
//                     >
//                         {/* Sticky Header for Input Column */}
//                         <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-blue-700 dark:text-blue-400 flex-shrink-0 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm px-2 pt-2 z-10"> {/* Added padding */}
//                             Inputs
//                         </h3>
//                         {/* Scrollable Content Area for Input */}
//                         <div className="flex-grow p-1"> {/* Padding moved here */}
//                             {renderSchemaItems(schema.inputSchema, 'input')}
//                         </div>
//                     </div>

//                     {/* Output Schema Column - Scrollable */}
//                      <div
//                         className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto" // <-- THIS ENABLES SCROLLING
//                          // ***** SOLUTION STEP *****
//                          onWheel={stopWheelPropagation} // Stop wheel events here
//                      >
//                          {/* Sticky Header for Output Column */}
//                         <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-green-700 dark:text-green-400 flex-shrink-0 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm px-2 pt-2 z-10"> {/* Added padding */}
//                             Outputs
//                         </h3>
//                          {/* Scrollable Content Area for Output */}
//                         <div className="flex-grow p-2"> {/* Padding moved here */}
//                             {renderSchemaItems(schema.outputSchema, 'output')}
//                         </div>
//                     </div>

//                      {/* SVG Overlay for Connections - Positioned Absolutely */}
//                      {/* Render SVG only after container ref is available */}
//                      {svgContainerRef.current && (
//                         <svg
//                             width="100%"
//                             height="100%"
//                             style={{
//                                 position: 'absolute',
//                                 top: 0,
//                                 left: 0,
//                                 pointerEvents: 'none', // Allow clicks to pass through to elements below
//                                 zIndex: 5, // Ensure SVG is above columns but below modal controls if needed
//                                 overflow: 'visible' // Allow markers/paths to draw slightly outside bounds if needed
//                              }}
//                         >
//                            {/* Arrowhead Definition */}
//                            <defs>
//                                 <marker
//                                     id="arrowhead"
//                                     markerWidth="8" // Smaller arrowhead
//                                     markerHeight="6"
//                                     refX="7" // Adjust refX so tip aligns with line end
//                                     refY="3"
//                                     orient="auto"
//                                     markerUnits="strokeWidth" // Scale with stroke width
//                                 >
//                                 <path d="M0,0 L8,3 L0,6 Z" fill="currentColor" /> {/* Use currentColor */}
//                                 </marker>
//                             </defs>
//                             {/* Render calculated connection paths */}
//                             {connectionPaths}
//                         </svg>
//                      )}
//                 </div>
//                 {/* End Schema Columns Container */}

//                 {/* Footer */}
//                 <div className="mt-3 text-right border-t border-gray-200 dark:border-gray-700 pt-3 flex-shrink-0 px-1">
//                     <button
//                         onClick={onClose}
//                         className="px-5 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm font-medium"
//                     >
//                         Done
//                     </button>
//                 </div>
//             </div> {/* End Modal Content Box */}
//         </div> /* End Modal Backdrop */
//     );
// };

// export default SchemaModal;


import React, { useState, useRef, useEffect, useCallback } from 'react';
// Removed: import { getNodeSchema } from './nodeSchemas'; - Schema is now passed in
import { NodeType, SchemaItem } from './workflow-context'; // Adjust path
import { Badge } from '@/components/ui/badge'; // Adjust path

interface SchemaModalProps {
    nodeType: NodeType | null; // Keep for context, maybe display error if schemas are empty
    nodeLabel?: string; // Display specific node label or type
    baseInputSchema: SchemaItem[]; // Current node's defined inputs
    baseOutputSchema: SchemaItem[]; // Current node's defined outputs
    availableInputsFromPrevious: SchemaItem[]; // Outputs from connected previous nodes
    onClose: () => void;
    // Add props here if you need to *create* connections from the modal
    // e.g., onConnect?: (sourceOutputName: string, targetInputName: string) => void;
}

// Keep Connection interface if you handle connections *within* the modal later
// export interface Connection {
//   inputId: string;
//   outputId: string;
// }

// Point interface for potential SVG drawing (if you add it back)
interface Point { x: number; y: number; }

const SchemaModal: React.FC<SchemaModalProps> = ({
    nodeType,
    nodeLabel,
    baseInputSchema,
    baseOutputSchema,
    availableInputsFromPrevious,
    onClose,
}) => {
    // State for potential *interaction* within the modal (e.g., selecting an input to map)
    const [selectedCurrentInput, setSelectedCurrentInput] = useState<SchemaItem | null>(null);
    // Removed: connections state and related useEffect

    const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const svgContainerRef = useRef<HTMLDivElement | null>(null);
    // Removed: coordsVersion and related effects unless you add SVG drawing back

    // --- Combine base inputs and available previous outputs for display ---
    // This structure assumes you want to list the node's own inputs,
    // and under each, list the compatible inputs from previous nodes.
    interface DisplayInputItem extends SchemaItem {
        possibleSources: SchemaItem[];
    }

    const [displayInputs, setDisplayInputs] = useState<DisplayInputItem[]>([]);

    useEffect(() => {
        // Clear refs when schema changes
        itemRefs.current.clear();

        // Prepare the display structure
        const newDisplayInputs = baseInputSchema.map(inputItem => {
            // Simple type matching - adjust as needed for more complex compatibility
            const compatibleSources = availableInputsFromPrevious.filter(
                prevOutput => prevOutput.datatype === inputItem.datatype
            );
            return {
                ...inputItem,
                possibleSources: compatibleSources,
            };
        });
        setDisplayInputs(newDisplayInputs);

    }, [baseInputSchema, availableInputsFromPrevious]); // Re-run when props change

    if (!nodeType) return null; // Should ideally not happen if parent logic is correct

    // --- Render Schema Items (Modified for Display Structure) ---
    const renderSchemaItems = (items: DisplayInputItem[]): JSX.Element => {
        if (!items || items.length === 0) {
            return <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-1 text-xs">No inputs defined for this node.</p>;
        }
        return (
            <div className="space-y-2"> {/* Increased spacing */}
                {items.map((item) => {
                    const isSelected = selectedCurrentInput?.name === item.name;
                    const id = `input-${item.name}`; // Unique ID for ref

                    return (
                        <div
                            key={id}
                            ref={(el) => itemRefs.current.set(id, el)}
                            className={`p-1.5 rounded border hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-150 ${isSelected ? 'bg-blue-100 dark:bg-blue-900 ring-1 ring-blue-400 border-blue-300 dark:border-blue-700' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/60'}`}
                            // onClick={() => handleItemClick(item)} // Decide what clicking does now
                             onClick={() => setSelectedCurrentInput(item === selectedCurrentInput ? null : item)} // Simple selection toggle
                             title={item.description || item.name}
                        >
                            {/* Current Node Input Details */}
                            <div className="flex justify-between items-start mb-0.5 cursor-pointer">
                                <span className="font-medium font-mono text-gray-800 dark:text-gray-200 break-all text-xs leading-tight">
                                    {item.name}
                                    {item.required && <span className="text-red-500 ml-1">*</span>}
                                </span>
                                <Badge variant="outline" className="text-xs font-normal px-1.5 py-0.5 ml-2 flex-shrink-0 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                                    {item.datatype}
                                </Badge>
                            </div>
                            {item.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{item.description}</p>}

                            {/* Available Inputs from Previous Nodes */}
                            {item.possibleSources.length > 0 && (
                                <div className="mt-1.5 pt-1.5 border-t border-dashed border-gray-300 dark:border-gray-600">
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Available Sources:</span>
                                    <ul className="space-y-1 pl-1">
                                        {item.possibleSources.map(source => (
                                            <li
                                                key={source.name} // Assumes parent made source.name unique
                                                className="text-xs p-1 rounded bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 flex justify-between items-center group"
                                                title={source.description || source.name}
                                            >
                                                <span className='font-mono text-green-800 dark:text-green-300'>
                                                   {source.name} {/* Display the unique name */}
                                                </span>
                                                 {/* Add a button or interaction to "use" this source */}
                                                 <button
                                                     className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-2 px-1 rounded border border-current"
                                                     onClick={(e) => {
                                                         e.stopPropagation(); // Prevent selecting the parent item
                                                         console.log(`Connect ${source.name} to ${item.name}`);
                                                         // Call a prop like onConnect(source.name, item.name) here if needed
                                                     }}
                                                 >
                                                     Use
                                                 </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                             {item.possibleSources.length === 0 && baseInputSchema.length > 0 && availableInputsFromPrevious.length > 0 && (
                                 <p className="text-xs text-orange-600 dark:text-orange-400 italic mt-1 pt-1 border-t border-dashed border-gray-300 dark:border-gray-600">No type-compatible sources found.</p>
                             )}
                        </div>
                    );
                })}
            </div>
        );
    };

     // --- Render Basic Schema Items (for Outputs) ---
    const renderOutputSchemaItems = (schemaItems: SchemaItem[]): JSX.Element => {
        if (!schemaItems || schemaItems.length === 0) {
            return <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-1 text-xs">No items defined.</p>;
        }
        return (
            <div className="space-y-1">
                {schemaItems.map((item) => {
                    const id = `output-${item.name}`;
                    return (
                        <div
                            key={id}
                            ref={(el) => itemRefs.current.set(id, el)}
                            className="p-1.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors duration-150"
                            title={item.description || item.name}
                        >
                            <div className="flex justify-between items-start mb-0.5">
                                <span className="font-medium font-mono text-gray-800 dark:text-gray-200 break-all text-xs leading-tight">
                                    {item.name}
                                    {/* Outputs usually aren't required in the same way */}
                                </span>
                                <Badge variant="outline" className="text-xs font-normal px-1.5 py-0.5 ml-2 flex-shrink-0 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                                    {item.datatype}
                                </Badge>
                            </div>
                            {item.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{item.description}</p>}
                        </div>
                    );
                })}
            </div>
        );
    };


    // Removed: handleItemClick (as it was tied to the old connection logic)
    // Removed: SVG drawing logic unless you re-implement it based on new data

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-xl w-full max-w-4xl max-h-[600px] flex flex-col relative border border-gray-200 dark:border-gray-700"> {/* Increased max-h */}
                <div className="flex justify-between items-center mb-2 border-b border-gray-200 dark:border-gray-700 pb-2 flex-shrink-0 px-1">
                    <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
                        {nodeLabel || nodeType} - Data Mapping {/* Use the passed label */}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold leading-none p-1 -mr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">×</button>
                </div>

                 {/* Error handling if schema loading failed in parent */}
                 {baseInputSchema.length === 0 && baseOutputSchema.length === 0 && availableInputsFromPrevious.length === 0 && (
                     <div className="text-center p-4 text-red-600 dark:text-red-400">
                         Could not load schema information for node type: <span className="font-mono bg-red-100 dark:bg-red-900/50 px-1 rounded">{nodeType}</span>.
                     </div>
                 )}

                <div ref={svgContainerRef} className="flex-grow flex flex-col md:flex-row gap-3 md:gap-4 overflow-hidden relative min-h-[300px]"> {/* Increased min-h */}
                    {/* Input Column (Current Node Inputs + Available Sources) */}
                    <div className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto">
                        <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-blue-700 dark:text-blue-400 flex-shrink-0 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm px-2 pt-2 z-10">Node Inputs</h3>
                        <div className="flex-grow p-2">
                             {availableInputsFromPrevious.length === 0 && baseInputSchema.length > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 italic px-1 mb-2">No connected previous nodes providing outputs.</p>
                             )}
                            {renderSchemaItems(displayInputs)}
                        </div>
                    </div>

                    {/* Output Column (Current Node Outputs) */}
                    <div className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto">
                        <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-green-700 dark:text-green-400 flex-shrink-0 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm px-2 pt-2 z-10">Node Outputs</h3>
                        <div className="flex-grow p-2">
                            {renderOutputSchemaItems(baseOutputSchema)}
                        </div>
                    </div>

                    {/* Optional: SVG Canvas for drawing connections if needed */}
                    {/* <div className="absolute inset-0 pointer-events-none">
                        <svg width="100%" height="100%">
                           Lines would be drawn here if connection logic is added
                        </svg>
                    </div> */}
                </div>
                 <div className="flex-shrink-0 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-end px-1">
                     <button
                         onClick={onClose}
                         className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                     >
                         Close
                     </button>
                 </div>
            </div>
        </div>
    );
};

export default SchemaModal;