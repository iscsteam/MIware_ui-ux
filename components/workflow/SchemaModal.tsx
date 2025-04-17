import React, { JSX, useState, useRef, useEffect, useCallback } from 'react';
import { getNodeSchema } from './nodeSchemas'; // Adjust path
import { NodeType, SchemaItem } from './workflow-context'; // Adjust path
import { Badge } from '@/components/ui/badge'; // Assuming you have a Badge component

// Define props interface
interface SchemaModalProps {
    nodeType: NodeType | null;
    onClose: () => void;
    // Optional: If you want to manage connections outside the modal
    // initialConnections?: Connection[];
    // onConnectionsChange?: (connections: Connection[]) => void;
}

// Define the structure for a connection
interface Connection {
    inputId: string; // Unique identifier for the input item (e.g., item.name)
    outputId: string; // Unique identifier for the output item (e.g., item.name)
}

// Define the structure for storing coordinates
interface Point {
    x: number;
    y: number;
}

const SchemaModal: React.FC<SchemaModalProps> = ({ nodeType, onClose }) => {
    const [selectedInput, setSelectedInput] = useState<SchemaItem | null>(null);
    const [connections, setConnections] = useState<Connection[]>([]);
    const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const svgContainerRef = useRef<HTMLDivElement | null>(null);

    // State to force SVG redraw when needed
    const [coordsVersion, setCoordsVersion] = useState(0);

    // Recalculate coordinates after mount/nodeType change allows refs to populate
    useEffect(() => {
        // Clear refs from previous node type to avoid stale refs if component isn't fully remounted
        // Although React should handle unmount refs, being explicit can prevent edge cases.
        itemRefs.current.clear();

        // Use a timeout to allow the DOM to update and refs to be set
        // before triggering the coordinate calculation and SVG redraw.
        const timeoutId = setTimeout(() => {
             console.log("Triggering coord update via useEffect [nodeType]");
             setCoordsVersion(prev => prev + 1); // Trigger SVG redraw
        }, 50); // Small delay for layout settling and refs assignment

        return () => clearTimeout(timeoutId);
    }, [nodeType]); // Recalculate when nodeType changes

    // Optional: Add effect for window resize if needed
    useEffect(() => {
        const handleResize = () => {
            // Debounce this in a real app for performance
             console.log("Triggering coord update via useEffect [resize]");
             setCoordsVersion(prev => prev + 1);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Run once on mount


    // Early return if no nodeType is provided
    if (!nodeType) return null;

    const schema = getNodeSchema(nodeType);

    // --- Error Handling ---
    if (!schema) {
        // ... (error handling remains the same)
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                {/* Error content */}
                 <div className="bg-white p-6 rounded-lg shadow-xl max-w-md text-center">
                    <h3 className="text-lg font-semibold text-red-600 mb-3">Error</h3>
                    <p className="text-gray-700">Could not load schema for node type: <span className="font-mono bg-red-100 px-1 rounded">{nodeType}</span>.</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-150"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    // --- Ref Management ---
    // This callback's ONLY job is to update the refs map.
    // DO NOT trigger state updates here as it runs during the commit phase
    // and will cause infinite loops if it triggers a re-render.
    const setItemRef = useCallback((id: string, element: HTMLDivElement | null) => {
        const map = itemRefs.current;
        if (element) {
            // console.log(`Setting ref for ${id}`);
            map.set(id, element);
        } else {
             // console.log(`Deleting ref for ${id}`);
             // Check if it exists before deleting to avoid unnecessary map operations if called multiple times with null
            if (map.has(id)) {
                map.delete(id);
            }
        }
        // --- REMOVED THE STATE UPDATE THAT CAUSED THE INFINITE LOOP ---
        // setCoordsVersion(prev => prev + 1); // <-- DO NOT DO THIS HERE
    }, []); // Empty dependency array is correct: the function itself doesn't depend on anything changing


    // --- Click Handler ---
    const handleItemClick = (item: SchemaItem, type: 'input' | 'output') => {
        if (type === 'input') {
            if (selectedInput?.name === item.name) {
                setSelectedInput(null);
            } else {
                setSelectedInput(item);
            }
        } else if (type === 'output' && selectedInput) {
            const newConnection: Connection = {
                inputId: selectedInput.name,
                outputId: item.name,
            };
            if (!connections.some(c => c.inputId === newConnection.inputId && c.outputId === newConnection.outputId)) {
                setConnections(prevConnections => [...prevConnections, newConnection]);
                 // Trigger coordinate update AFTER connection state is set and component re-renders
                 // You might not strictly need this if the connection drawing logic
                 // relies solely on the 'connections' state and the existing coordsVersion trigger.
                 // However, explicitly triggering can ensure immediate redraw if needed.
                 // Use requestAnimationFrame or setTimeout to ensure it happens after the current render cycle.
                 requestAnimationFrame(() => setCoordsVersion(prev => prev + 1));
            }
            setSelectedInput(null);
        }
    };

    // --- Helper to get coordinates ---
    const getElementCoords = useCallback((elementId: string): Point | null => {
        // Use useCallback to memoize this potentially complex function if needed,
        // though it depends on itemRefs.current which changes outside React's cycle.
        // Dependencies would be tricky. Let's keep it simple for now.
        const element = itemRefs.current.get(elementId);
        const svgContainer = svgContainerRef.current;

        if (!element || !svgContainer) {
            // console.warn(`Element or SVG container not found for ref: ${elementId}`);
            return null;
        }

        const elementRect = element.getBoundingClientRect();
        const containerRect = svgContainer.getBoundingClientRect();

        const scrollX = svgContainer.scrollLeft; // Scroll of the SVG container itself
        const scrollY = svgContainer.scrollTop; // Scroll of the SVG container itself

        // Determine if it's an input or output based on the schema for positioning
        const isInput = schema.inputSchema?.some(item => item.name === elementId);

        // Calculate coords relative to the svg container's top-left corner
        const x = (isInput ? elementRect.right : elementRect.left) - containerRect.left + scrollX;
        const y = elementRect.top + elementRect.height / 2 - containerRect.top + scrollY;

        return { x, y };
    }, [schema.inputSchema]); // Depend on schema if its structure affects logic

    // --- Generate SVG Path Data ---
    const getPathData = (startPoint: Point, endPoint: Point): string => {
        const dx = endPoint.x - startPoint.x;
        // Make control points proportional to the distance, prevents weird loops on short distances
        const controlPointX1 = startPoint.x + dx * 0.5;
        const controlPointY1 = startPoint.y;
        const controlPointX2 = endPoint.x - dx * 0.5;
        const controlPointY2 = endPoint.y;

        return `M ${startPoint.x} ${startPoint.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${endPoint.x} ${endPoint.y}`;
    };


    // --- Render Schema Items ---
    const renderSchemaItems = (
        schemaItems: SchemaItem[] | undefined,
        type: 'input' | 'output'
    ): JSX.Element => {
        // ... (rendering logic remains the same, using the fixed setItemRef)
        if (!schemaItems || schemaItems.length === 0) {
            return <p className="text-gray-500 italic mt-2 px-1 text-xs">No items defined.</p>;
        }

        return (
            <div className="space-y-1">
                {schemaItems.map((item) => {
                    const isSelected = type === 'input' && selectedInput?.name === item.name;
                    const id = item.name; // Use name as unique ID

                    return (
                        <div
                            key={id}
                            ref={(el) => setItemRef(id, el)} // Assign ref callback
                            className={`p-1.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150 ${
                                isSelected ? 'bg-blue-100 dark:bg-blue-900 ring-1 ring-blue-400' : '' // Added dark mode example
                            }`}
                            onClick={() => handleItemClick(item, type)}
                            role="button"
                            aria-pressed={isSelected}
                        >
                            <div className="flex justify-between items-start mb-0.5">
                                <span className="font-medium font-mono text-gray-700 dark:text-gray-300 break-all text-xs">
                                    {item.name}
                                    {item.required && <span className="text-red-500 ml-1">*</span>}
                                </span>
                                <Badge variant="outline" className="text-xs font-normal px-1.5 py-0.5 ml-2 flex-shrink-0">
                                    {item.datatype}
                                </Badge>
                            </div>
                            {item.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // --- Backdrop Click Handler ---
    const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Calculate connections path data memoized based on coordsVersion and connections list
    // This recalculates only when explicitly told to (coordsVersion change) or when connections change.
    const connectionPaths = React.useMemo(() => {
        console.log(`Recalculating paths (version: ${coordsVersion})`);
        return connections.map((conn) => {
            const startPoint = getElementCoords(conn.inputId);
            const endPoint = getElementCoords(conn.outputId);

            if (startPoint && endPoint) {
                const pathData = getPathData(startPoint, endPoint);
                return (
                    <path
                        key={`${conn.inputId}-${conn.outputId}`}
                        d={pathData}
                        stroke="#3b82f6"
                        strokeWidth="2"
                        fill="none"
                        // markerEnd="url(#arrowhead)" // Optional
                    />
                );
            }
            return null;
        }).filter(Boolean); // Filter out nulls where points weren't found
        // Depend on connections array identity and coordsVersion
    }, [connections, coordsVersion, getElementCoords]); // Added getElementCoords as dependency


    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                 className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col relative" // Added dark mode example
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2 flex-shrink-0">
                    <h2 id="modal-title" className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {schema.label || nodeType} Node Configuration
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-2xl font-bold leading-none p-1 -mr-1"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {/* Optional Description */}
                {schema.description && (
                    <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">{schema.description}</p>
                )}

                {/* Schema Columns Container */}
                <div ref={svgContainerRef} className="flex-grow flex flex-col md:flex-row gap-4 md:gap-4 overflow-hidden relative">

                    {/* Input Schema Column */}
                    <div className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto">
                        <h3 className="text-base font-semibold mb-3 border-b dark:border-gray-700 pb-1 text-blue-700 dark:text-blue-400 flex-shrink-0 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm pt-1 -mt-1 z-10">Input Schema</h3>
                        <div className="flex-grow pr-2 -mr-2">
                            {renderSchemaItems(schema.inputSchema, 'input')}
                        </div>
                    </div>

                    {/* Output Schema Column */}
                     <div className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto">
                        <h3 className="text-base font-semibold mb-3 border-b dark:border-gray-700 pb-1 text-green-700 dark:text-green-400 flex-shrink-0 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm pt-1 -mt-1 z-10">Output Schema</h3>
                        <div className="flex-grow pr-2 -mr-2">
                            {renderSchemaItems(schema.outputSchema, 'output')}
                        </div>
                    </div>

                     {/* SVG Overlay for Connections */}
                     {svgContainerRef.current && (
                        <svg
                            // No key needed here anymore as re-renders are controlled by connectionPaths memo
                            width="100%"
                            height="100%"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                pointerEvents: 'none',
                                zIndex: 5,
                                overflow: 'visible'
                            }}
                        >
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7"
                                refX="0" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                                </marker>
                            </defs>
                            {/* Render the memoized paths */}
                            {connectionPaths}
                        </svg>
                     )}
                </div>
                {/* End Schema Columns Container */}

                {/* Modal Footer */}
                <div className="mt-6 text-right border-t dark:border-gray-700 pt-4 flex-shrink-0">
                     <button
                        onClick={onClose}
                        className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SchemaModal;