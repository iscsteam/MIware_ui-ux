import React, { JSX, useState, useRef, useEffect, useCallback } from 'react';
import { getNodeSchema } from './nodeSchemas'; // Adjust path
import { NodeType, SchemaItem } from './workflow-context'; // Adjust path
import { Badge } from '@/components/ui/badge'; // Assuming you have a Badge component

// Define props interface
interface SchemaModalProps {
    nodeType: NodeType | null;
    onClose: () => void;
}

export interface Connection {
  inputId: string;
  outputId: string;
}

interface Point {
  x: number;
  y: number;
}

const SchemaModal: React.FC<SchemaModalProps> = ({ nodeType, onClose }) => {
    const [selectedInput, setSelectedInput] = useState<SchemaItem | null>(null);
    const [connections, setConnections] = useState<Connection[]>([]);
    const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const svgContainerRef = useRef<HTMLDivElement | null>(null);
    const [coordsVersion, setCoordsVersion] = useState(0);

    // --- Effect to recalculate coordinates ---
    useEffect(() => {
        itemRefs.current.clear();
        const timeoutId = setTimeout(() => {
            // console.log("Triggering coord update via useEffect [nodeType]");
            setCoordsVersion(prev => prev + 1);
        }, 50);
        return () => clearTimeout(timeoutId);
    }, [nodeType]);

    useEffect(() => {
        const handleResize = () => {
            // console.log("Triggering coord update via useEffect [resize]");
            setCoordsVersion(prev => prev + 1);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!nodeType) return null;
    const schema = getNodeSchema(nodeType);

    if (!schema) {
        // Error handling...
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
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
    const setItemRef = useCallback((id: string, element: HTMLDivElement | null) => {
        const map = itemRefs.current;
        if (element) {
            map.set(id, element);
        } else {
            if (map.has(id)) {
                map.delete(id);
            }
        }
    }, []);

    // --- Click Handler ---
    const handleItemClick = (item: SchemaItem, type: 'input' | 'output') => {
        // ... (logic remains the same)
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
                 requestAnimationFrame(() => setCoordsVersion(prev => prev + 1));
            }
            setSelectedInput(null);
        }
    };

    // --- Helper to get coordinates ---
    const getElementCoords = useCallback((elementId: string): Point | null => {
        // ... (logic remains the same)
        const element = itemRefs.current.get(elementId);
        const svgContainer = svgContainerRef.current;
        if (!element || !svgContainer) return null;
        const elementRect = element.getBoundingClientRect();
        const containerRect = svgContainer.getBoundingClientRect();
        const scrollX = svgContainer.scrollLeft;
        const scrollY = svgContainer.scrollTop;
        const isInput = schema.inputSchema?.some(item => item.name === elementId);
        const x = (isInput ? elementRect.right : elementRect.left) - containerRect.left + scrollX;
        const y = elementRect.top + elementRect.height / 2 - containerRect.top + scrollY;
        return { x, y };
    }, [schema.inputSchema]);

    // --- Generate SVG Path Data ---
    const getPathData = (startPoint: Point, endPoint: Point): string => {
        // ... (logic remains the same)
         const dx = endPoint.x - startPoint.x;
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
         // ... (logic remains the same)
        if (!schemaItems || schemaItems.length === 0) {
            return <p className="text-gray-500 italic mt-2 px-1 text-xs">No items defined.</p>;
        }
        return (
            <div className="space-y-1">
                {schemaItems.map((item) => {
                    const isSelected = type === 'input' && selectedInput?.name === item.name;
                    const id = item.name;
                    return (
                        <div
                            key={id}
                            ref={(el) => setItemRef(id, el)}
                            className={`p-1.5 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150 ${
                                isSelected ? 'bg-blue-100 dark:bg-blue-900 ring-1 ring-blue-400' : ''
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

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

    // --- Calculate connections path data ---
    const connectionPaths = React.useMemo(() => {
        // console.log(`Recalculating paths (version: ${coordsVersion})`);
        return connections.map((conn) => {
            const startPoint = getElementCoords(conn.inputId);
            const endPoint = getElementCoords(conn.outputId);
            if (startPoint && endPoint) {
                const pathData = getPathData(startPoint, endPoint);
                return (
                    <path
                        key={`${conn.inputId}-${conn.outputId}`}
                        d={pathData}
                        stroke="#3b82f6" strokeWidth="2" fill="none"
                    />
                );
            }
            return null;
        }).filter(Boolean);
    }, [connections, coordsVersion, getElementCoords]);

    // ***** START SOLUTION *****
    // Handler to stop wheel event propagation
    const stopWheelPropagation = (e: React.WheelEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };
    // ***** END SOLUTION *****

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                 className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col relative"
                onClick={(e) => e.stopPropagation()}
                // ***** SOLUTION STEP *****
                // Optional: Add here if the *entire* modal itself scrolls and causes zoom
                // onWheel={stopWheelPropagation}
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2 flex-shrink-0">
                    {/* ... header content ... */}
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

        {/* Description */}
        {schema.description && (
          <p className="mb-6 text-sm text-gray-600 flex-shrink-0">{schema.description}</p>
        )}

                {/* Schema Columns Container */}
                <div ref={svgContainerRef} className="flex-grow flex flex-col md:flex-row gap-4 md:gap-4 overflow-hidden relative">

                    {/* Input Schema Column */}
                    <div
                        className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto"
                        // ***** SOLUTION STEP *****
                        onWheel={stopWheelPropagation} // Stop propagation here
                    >
                        <h3 className="text-base font-semibold mb-3 border-b dark:border-gray-700 pb-1 text-blue-700 dark:text-blue-400 flex-shrink-0 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm pt-1 -mt-1 z-10">Input Schema</h3>
                        <div className="flex-grow pr-2 -mr-2">
                            {renderSchemaItems(schema.inputSchema, 'input')}
                        </div>
                    </div>

                    {/* Output Schema Column */}
                     <div
                        className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto"
                        // ***** SOLUTION STEP *****
                        onWheel={stopWheelPropagation} // Stop propagation here
                     >
                        <h3 className="text-base font-semibold mb-3 border-b dark:border-gray-700 pb-1 text-green-700 dark:text-green-400 flex-shrink-0 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm pt-1 -mt-1 z-10">Output Schema</h3>
                        <div className="flex-grow pr-2 -mr-2">
                            {renderSchemaItems(schema.outputSchema, 'output')}
                        </div>
                    </div>

                     {/* SVG Overlay for Connections */}
                     {svgContainerRef.current && (
                        <svg
                            width="100%" height="100%"
                            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 5, overflow: 'visible' }}
                        >
                           {/* ... defs ... */}
                           <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7"
                                refX="0" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                                </marker>
                            </defs>
                            {connectionPaths}
                        </svg>
                     )}
                </div>
                {/* End Schema Columns Container */}

        {/* Footer */}
        <div className="mt-6 text-right border-t pt-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchemaModal;