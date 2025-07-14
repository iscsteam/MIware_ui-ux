
// import React, {
//   useState,
//   useRef,
//   useEffect,
//   useCallback,
//   useMemo,
//   JSX,
// } from "react";
// import { NodeType, SchemaItem } from "@/services/interface"; // Adjust path
// import { Badge } from "@/components/ui/badge"; // Adjust path
// import {GroupedSource,Connection ,SchemaModalProps , MappingSourceInfo ,ExtendedSchemaItem} from "@/services/interface"; // Adjust path

// // --- Data Types ---

// // Information about a single source mapped to an input property
// // type MappingSourceInfo = {
// //   name: string; // Name of the source property
// //   nodeId: string; // ID of the source node
// //   nodeLabel?: string; // Label of the source node
// //   nodeType?: string; // Type of the source node
// // };

// // type ExtendedSchemaItem = SchemaItem & {
// //   // For items in availableInputsFromPrevious (source items)
// //   sourceNodeId?: string;
// //   sourceNodeType?: string;
// //   sourceNodeLabel?: string;
// //   datatype?:string;

// //   // For items in localInputSchema (target items / current node's inputs)
// //   mappings?: MappingSourceInfo[]; // Array of sources mapped to this input
// // };



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
//   const [localInputSchema, setLocalInputSchema] = useState<ExtendedSchemaItem[]>([]);
//   const [selectedSourceItem, setSelectedSourceItem] = useState<ExtendedSchemaItem | null>(null);
//   const [selectedTargetItem, setSelectedTargetItem] = useState<ExtendedSchemaItem | null>(null);
//   const [connections, setConnections] = useState<Connection[]>([]);
//   const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
//   const [coordsVersion, setCoordsVersion] = useState(0);

//   const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
//   const svgContainerRef = useRef<HTMLDivElement | null>(null);
//   const availableOutputsColumnRef = useRef<HTMLDivElement | null>(null);
//   const nodeInputsColumnRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const processedInputs = baseInputSchema.map((baseInput): ExtendedSchemaItem => {
//       const extendedBaseInput = baseInput as ExtendedSchemaItem;
//       return {
//         ...baseInput, // Spread name, datatype, required, description
//         // Ensure mappings is an array, defaulting to empty if not present or not an array
//         mappings: Array.isArray(extendedBaseInput.mappings) ? extendedBaseInput.mappings : [],
//         // Clear any source-specific fields if baseInput was mistakenly a source-like ExtendedSchemaItem
//         sourceNodeId: undefined,
//         sourceNodeType: undefined,
//         sourceNodeLabel: undefined,
//       };
//     });

//     // Clean up stale mappings and prepare initial connections
//     const validInitialConnections: Connection[] = [];
//     const cleanedLocalInputs = processedInputs.map(input => {
//       if (!input.mappings || input.mappings.length === 0) {
//         return input;
//       }
//       const validMappings = input.mappings.filter(mapping => {
//         const sourceExists = availableInputsFromPrevious.some(
//           availableSource => availableSource.sourceNodeId === mapping.nodeId && availableSource.name === mapping.name
//         );
//         if (sourceExists) {
//           validInitialConnections.push({
//             sourceItemId: `source-${mapping.nodeId}-${mapping.name}`,
//             targetItemId: `target-${currentNodeId}-${input.name}`,
//           });
//         } else {
//           console.warn(`Initial mapping for input '${input.name}' from source '${mapping.name}' (node: ${mapping.nodeLabel || mapping.nodeId}) is stale and source no longer exists. Removing this mapping.`);
//         }
//         return sourceExists;
//       });

//       if (validMappings.length !== input.mappings.length) {
//         return { ...input, mappings: validMappings };
//       }
//       return input;
//     });

//     setLocalInputSchema(cleanedLocalInputs);
//     setConnections(validInitialConnections);

//     itemRefs.current.clear();
//     setSelectedSourceItem(null);
//     setSelectedTargetItem(null);
//     const timeoutId = setTimeout(() => setCoordsVersion((prev) => prev + 1), 50);
//     return () => clearTimeout(timeoutId);
//   }, [baseInputSchema, availableInputsFromPrevious, currentNodeId, nodeType]);


//   useEffect(() => {
//     const handleResize = () => requestAnimationFrame(() => setCoordsVersion((prev) => prev + 1));
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     const leftCol = availableOutputsColumnRef.current;
//     const rightCol = nodeInputsColumnRef.current;
//     const handleScroll = () => requestAnimationFrame(() => setCoordsVersion((prev) => prev + 1));

//     if (leftCol) leftCol.addEventListener("scroll", handleScroll, { passive: true });
//     if (rightCol) rightCol.addEventListener("scroll", handleScroll, { passive: true });
//     const timeoutId = setTimeout(() => handleScroll(), 100);

//     return () => {
//       if (leftCol) leftCol.removeEventListener("scroll", handleScroll);
//       if (rightCol) rightCol.removeEventListener("scroll", handleScroll);
//       clearTimeout(timeoutId);
//     };
//   }, []);

//   const setItemRef = useCallback((id: string, element: HTMLDivElement | null) => {
//     const map = itemRefs.current;
//     if (element) map.set(id, element);
//     else map.delete(id);
//   }, []);

//   const groupAvailableInputs = useCallback((): GroupedSource[] => {
//     const grouped: Record<string, GroupedSource> = {};
//     availableInputsFromPrevious.forEach((source) => {
//       const groupId = source.sourceNodeId || "unknown-source";
//       if (!grouped[groupId]) {
//         grouped[groupId] = {
//           nodeId: groupId,
//           nodeLabel: source.name || "Unknown Source",
//           nodeType: source.sourceNodeType || "Unknown",
//           outputs: []
//         };
//       }
//       grouped[groupId].outputs.push(source);
//     });
//     return Object.values(grouped).sort((a, b) => a.nodeLabel.localeCompare(b.nodeLabel));
//   }, [availableInputsFromPrevious]);

//   const groupedSources = useMemo(() => groupAvailableInputs(), [groupAvailableInputs]);

//   const handleItemClick = (
//     item: ExtendedSchemaItem,
//     type: "available" | "currentInput"
//   ) => {
//     let connectionChanged = false;

//     if (type === "available") { // Clicked on a source/available item
//       const clickedSourceItem = item;
//       if (selectedTargetItem && clickedSourceItem.datatype === selectedTargetItem.datatype) {
//         // A target is selected, and types match: try to make/break connection
//         const mappingInfo: MappingSourceInfo = {
//           name: clickedSourceItem.name,
//           nodeId: clickedSourceItem.sourceNodeId!,
//           nodeLabel: clickedSourceItem.sourceNodeLabel || clickedSourceItem.sourceNodeType,
//           nodeType: clickedSourceItem.sourceNodeType
//         };
//         const connection: Connection = {
//           sourceItemId: `source-${mappingInfo.nodeId}-${mappingInfo.name}`,
//           targetItemId: `target-${currentNodeId}-${selectedTargetItem.name}`
//         };

//         const existingMappingIndex = (selectedTargetItem.mappings || []).findIndex(
//           m => m.nodeId === mappingInfo.nodeId && m.name === mappingInfo.name
//         );

//         if (existingMappingIndex > -1) { // Connection exists, so remove it
//           setLocalInputSchema(prev => prev.map(input =>
//             input.name === selectedTargetItem.name
//             ? { ...input, mappings: (input.mappings || []).filter((_, i) => i !== existingMappingIndex) }
//             : input
//           ));
//           setConnections(prev => prev.filter(c =>
//             !(c.sourceItemId === connection.sourceItemId && c.targetItemId === connection.targetItemId)
//           ));
//         } else { // Connection doesn't exist, so add it
//           setLocalInputSchema(prev => prev.map(input =>
//             input.name === selectedTargetItem.name
//             ? { ...input, mappings: [...(input.mappings || []), mappingInfo] }
//             : input
//           ));
//           setConnections(prev => [...prev, connection]);
//         }
//         setSelectedSourceItem(null); // Clear selections after action
//         setSelectedTargetItem(null);
//         connectionChanged = true;
//       } else { // No compatible target selected, or type mismatch: select this source
//         setSelectedSourceItem(
//           clickedSourceItem.name === selectedSourceItem?.name && clickedSourceItem.sourceNodeId === selectedSourceItem?.sourceNodeId
//           ? null
//           : clickedSourceItem
//         );
//         // Keep target selected if user is trying different sources
//       }
//     } else if (type === "currentInput") { // Clicked on a target/currentInput item
//       const clickedTargetItem = item;
//       if (selectedSourceItem && clickedTargetItem.datatype === selectedSourceItem.datatype) {
//         // A source is selected, and types match: try to make/break connection
//         const mappingInfo: MappingSourceInfo = {
//           name: selectedSourceItem.name,
//           nodeId: selectedSourceItem.sourceNodeId!,
//           nodeLabel: selectedSourceItem.sourceNodeLabel || selectedSourceItem.sourceNodeType,
//           nodeType: selectedSourceItem.sourceNodeType
//         };
//         const connection: Connection = {
//           sourceItemId: `source-${mappingInfo.nodeId}-${mappingInfo.name}`,
//           targetItemId: `target-${currentNodeId}-${clickedTargetItem.name}`
//         };

//         const existingMappingIndex = (clickedTargetItem.mappings || []).findIndex(
//           m => m.nodeId === mappingInfo.nodeId && m.name === mappingInfo.name
//         );

//         if (existingMappingIndex > -1) { // Connection exists, so remove it
//           setLocalInputSchema(prev => prev.map(input =>
//             input.name === clickedTargetItem.name
//             ? { ...input, mappings: (input.mappings || []).filter((_, i) => i !== existingMappingIndex) }
//             : input
//           ));
//           setConnections(prev => prev.filter(c =>
//             !(c.sourceItemId === connection.sourceItemId && c.targetItemId === connection.targetItemId)
//           ));
//         } else { // Connection doesn't exist, so add it
//           setLocalInputSchema(prev => prev.map(input =>
//             input.name === clickedTargetItem.name
//             ? { ...input, mappings: [...(input.mappings || []), mappingInfo] }
//             : input
//           ));
//           setConnections(prev => [...prev, connection]);
//         }
//         setSelectedSourceItem(null); // Clear selections after action
//         setSelectedTargetItem(null);
//         connectionChanged = true;
//       } else { // No compatible source selected, or type mismatch: select this target
//         setSelectedTargetItem(
//           clickedTargetItem.name === selectedTargetItem?.name && clickedTargetItem.name === selectedTargetItem.name
//           ? null
//           : clickedTargetItem
//         );
//         // Keep source selected
//       }
//     }

//     if (connectionChanged) {
//       requestAnimationFrame(() => setCoordsVersion((prev) => prev + 1));
//     }
//   };

//   const getElementCoords = useCallback((elementId: string): Point | null => {
//       const element = itemRefs.current.get(elementId);
//       const svgContainer = svgContainerRef.current;
//       if (!element || !svgContainer) return null;
//       const elementRect = element.getBoundingClientRect();
//       const containerRect = svgContainer.getBoundingClientRect();
//       const isSource = elementId.startsWith('source-');
//       const x = isSource ? (elementRect.right - containerRect.left) : (elementRect.left - containerRect.left);
//       const y = elementRect.top + elementRect.height / 2 - containerRect.top;
//       return { x, y };
//   }, []);

//   const getPathData = (startPoint: Point, endPoint: Point): string => {
//         const dx = endPoint.x - startPoint.x;
//         const controlPointX1 = startPoint.x + dx * 0.35;
//         const controlPointY1 = startPoint.y;
//         const controlPointX2 = endPoint.x - dx * 0.35;
//         const controlPointY2 = endPoint.y;
//         return `M ${startPoint.x} ${startPoint.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${endPoint.x} ${endPoint.y}`;
//   };

//   const connectionPaths = useMemo(() => {
//     return connections
//       .map((conn) => {
//         const startPoint = getElementCoords(conn.sourceItemId);
//         const endPoint = getElementCoords(conn.targetItemId);
//         if (startPoint && endPoint) {
//           return (
//             <path
//               key={`${conn.sourceItemId}-${conn.targetItemId}`}
//               d={getPathData(startPoint, endPoint)}
//               stroke="currentColor" strokeWidth="1.5" fill="none"
//               className="text-blue-500 dark:text-blue-400 opacity-80 hover:opacity-100"
//               markerEnd="url(#arrowhead)"
//             />
//           );
//         }
//         return null;
//       })
//       .filter(Boolean);
//   }, [connections, coordsVersion, getElementCoords]); // getPathData is stable

//   const toggleExpandGroup = (groupId: string) => {
//     setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
//     setTimeout(() => setCoordsVersion(v => v + 1), 50);
//   };

//   const renderAvailableOutputs = () => {
//     if (groupedSources.length === 0) return <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-2 text-xs">No outputs available.</p>;
//     return (
//       <div className="space-y-3">
//         {groupedSources.map((group) => (
//           <div key={group.nodeId} className="space-y-1">
//             <div onClick={() => toggleExpandGroup(group.nodeId)} className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 text-xs flex items-center justify-between bg-gray-100 dark:bg-gray-700/80 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600/80 transition sticky top-0 z-10">
//               <span className="truncate pr-2" title={group.nodeLabel}>{group.nodeLabel} <span className="font-normal text-gray-500 dark:text-gray-400">({group.nodeType})</span></span>
//               <span className="text-gray-500 dark:text-gray-400 text-lg leading-none">{expandedGroups[group.nodeId] ? "-" : "+"}</span>
//             </div>
//             {expandedGroups[group.nodeId] && (
//               <ul className="space-y-1 pl-2 pt-1">
//                 {group.outputs.length === 0 && <li className="text-xs text-gray-500 dark:text-gray-400 italic px-1">No outputs.</li>}
//                 {group.outputs.map((source) => {
//                   const id = `source-${source.sourceNodeId}-${source.name}`;
//                   const isSelected = selectedSourceItem?.sourceNodeId === source.sourceNodeId && selectedSourceItem?.name === source.name;
//                   const isCompatible = selectedTargetItem?.datatype === source.datatype;
//                   const canConnect = selectedTargetItem && isCompatible;
//                   // Check if this source is already connected to the selected target
//                   const isAlreadyConnectedToSelectedTarget = selectedTargetItem && (selectedTargetItem.mappings || []).some(
//                       m => m.nodeId === source.sourceNodeId && m.name === source.name
//                   );

//                   return (
//                     <li
//                       key={id} ref={(el) => setItemRef(id, el)}
//                       className={`p-1 rounded border transition-all duration-150 cursor-pointer group relative ${
//                         isSelected
//                           ? "bg-green-100 dark:bg-green-900/50 ring-1 ring-green-400 border-green-300 dark:border-green-700"
//                           : isAlreadyConnectedToSelectedTarget // Highlight if connected to current selected target
//                           ? "bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400 dark:border-yellow-700"
//                           : `border-gray-200 dark:border-gray-700 ${canConnect ? 'hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-300 dark:hover:border-green-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'}`
//                       } ${!selectedTargetItem || isCompatible ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}`}
//                       onClick={() => (!selectedTargetItem || isCompatible) && handleItemClick(source, "available")}
//                       title={!selectedTargetItem || isCompatible ? (source.description || source.name) : `Type mismatch (expects ${selectedTargetItem?.datatype})`}
//                     >
//                       <div className="flex justify-between items-start text-xs">
//                         <span className="font-mono text-gray-800 dark:text-gray-200 break-all leading-tight">{source.name}</span>
//                         <Badge variant="outline" className="text-xs font-normal px-1 py-0 ml-1 shrink-0 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">{source.datatype}</Badge>
//                       </div>
//                       {source.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{source.description}</p>}
//                       {(canConnect || isAlreadyConnectedToSelectedTarget) && (
//                         <div className={`absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isAlreadyConnectedToSelectedTarget ? 'bg-yellow-500' : 'bg-green-400 dark:bg-green-500'} group-hover:scale-125 transition-transform`}></div>
//                       )}
//                     </li>
//                   );
//                 })}
//               </ul>
//             )}
//           </div>
//         ))}
//       </div>
//     );
//   };



  
//   const renderNodeInputs = () => {
//     if (!localInputSchema || localInputSchema.length === 0) return <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-2 text-xs">No inputs defined.</p>;
//     return (
//       <div className="space-y-1.5">
//         {localInputSchema.map((item) => {
//           const id = `target-${currentNodeId}-${item.name}`;
//           const isSelected = selectedTargetItem?.name === item.name;
//           const isConnected = item.mappings && item.mappings.length > 0;
//           const isCompatible = selectedSourceItem?.datatype === item.datatype;
//           const canConnect = selectedSourceItem && isCompatible;
//            // Check if selected source is already connected to this target item
//            const isSelectedSourceAlreadyConnected = selectedSourceItem && (item.mappings || []).some(
//             m => m.nodeId === selectedSourceItem.sourceNodeId && m.name === selectedSourceItem.name
//           );


//           return (
//             <div
//               key={id} ref={(el) => setItemRef(id, el)}
//               className={`p-1.5 rounded border transition-all duration-150 cursor-pointer group relative ${
//                 isSelected
//                   ? "bg-blue-100 dark:bg-blue-900/50 ring-1 ring-blue-400 border-blue-300 dark:border-blue-700"
//                   : isSelectedSourceAlreadyConnected // Highlight if current selected source is connected to it
//                   ? "bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400 dark:border-yellow-700"
//                   : isConnected // General connected state
//                   ? "bg-gray-50 dark:bg-gray-800/70 border-gray-300 dark:border-gray-600"
//                   : `border-gray-200 dark:border-gray-700 ${canConnect ? 'hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'}`
//               } ${!selectedSourceItem || isCompatible ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}`}
//               onClick={() => (!selectedSourceItem || isCompatible) && handleItemClick(item, "currentInput")}
//               title={!selectedSourceItem || isCompatible ? (item.description || item.name) : `Type mismatch (expects ${selectedSourceItem?.datatype})`}
//             >
//               <div className="flex justify-between items-start mb-0.5">
//                 <span className="font-medium font-mono text-gray-800 dark:text-gray-200 break-all text-xs leading-tight">
//                   {item.name}{item.required && <span className="text-red-500 ml-1">*</span>}
//                 </span>
//                 <Badge variant="outline" className="text-xs font-normal px-1.5 py-0.5 ml-2 shrink-0 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">{item.datatype}</Badge>
//               </div>

//               {item.description && (!item.mappings || item.mappings.length === 0) && (
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{item.description}</p>
//               )}

//               {item.mappings && item.mappings.length > 0 && (
//                 <div className="mt-1 space-y-0.5">
//                   {item.mappings.map((mapping, index) => (
//                     <p key={`${mapping.nodeId}-${mapping.name}-${index}`} className="text-xs text-green-700 dark:text-green-400/90 leading-snug flex items-center bg-green-50 dark:bg-green-900/30 px-1 py-0.5 rounded-sm">
//                       <span className="mr-1.5 text-green-600 dark:text-green-500">←</span>
//                       <span className="font-mono text-green-800 dark:text-green-300">{mapping.name}</span>
//                       <span className="ml-1.5 text-gray-500 dark:text-gray-400 truncate text-[0.65rem] leading-none">({mapping.nodeLabel || mapping.nodeType || 'Unknown'})</span>
//                       {/* Optional: Button to remove individual mapping directly
//                       <button
//                         onClick={(e) => {
//                            e.stopPropagation(); // Prevent triggering parent onClick
//                            // Implement handleRemoveSpecificMapping(item, mapping)
//                         }}
//                         className="ml-auto text-red-500 hover:text-red-700 text-xs p-0.5 leading-none"
//                         title={`Remove mapping from ${mapping.name}`}
//                       >
//                         ✕
//                       </button>
//                       */}
//                     </p>
//                   ))}
//                 </div>
//               )}
//               {(canConnect || isSelectedSourceAlreadyConnected) && (
//                 <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isSelectedSourceAlreadyConnected ? 'bg-yellow-500' : 'bg-blue-400 dark:bg-blue-500'} group-hover:scale-125 transition-transform`}></div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   const stopWheelPropagation = (e: React.WheelEvent<HTMLDivElement>) => e.stopPropagation();
//   const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose(); };
//   const handleDone = () => { if (onSaveMappings) onSaveMappings(localInputSchema); onClose(); };

//   if (!nodeType) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="modal-title">
//       <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-xl w-full max-w-5xl max-h-[80vh] flex flex-col relative border border-gray-300 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
//         <div className="flex justify-between items-center mb-2 border-b border-gray-200 dark:border-gray-700 pb-2 flex-shrink-0 px-1">
//           <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 truncate pr-4">Configure Inputs: {nodeLabel || nodeType}</h2>
//           <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold leading-none p-1 -mr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">×</button>
//         </div>

//         <div ref={svgContainerRef} className="flex-grow flex flex-col md:flex-row gap-3 md:gap-4 overflow-hidden relative min-h-[300px]">
//           <div ref={availableOutputsColumnRef} className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto" onWheel={stopWheelPropagation}>
//             <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-green-700 dark:text-green-400 sticky top-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-2 pt-2 z-20">Source Outputs Schema</h3>
//             <div className="flex-grow p-2">{renderAvailableOutputs()}</div>
//           </div>

//           <div ref={nodeInputsColumnRef} className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto" onWheel={stopWheelPropagation}>
//             <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-blue-700 dark:text-blue-400 sticky top-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-2 pt-2 z-20">Node Inputs Schema</h3>
//             <div className="flex-grow p-2">{renderNodeInputs()}</div>
//           </div>
       
//           {svgContainerRef.current && (
//             <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 10, overflow: "visible" }}>
//               {/* <defs>
//                 <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
//                   <path d="M0,0 L8,3 L0,6 Z" fill="currentColor" />
//                 </marker>
//               </defs> */}
//               {connectionPaths}
//             </svg>
//           )}
//         </div>

//         <div className="flex-shrink-0 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end px-1 space-x-2">
//            <button onClick={onClose} type="button" className="px-4 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-150 text-sm">Cancel</button>
//           <button onClick={handleDone} type="button" className="px-5 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm font-medium">Done</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SchemaModal;


"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import type {
  GroupedSource,
  Connection,
  SchemaModalProps,
  MappingSourceInfo,
  ExtendedSchemaItem,
} from "@/services/interface"
import { getNodeSchema } from "./nodeSchemas"
import { useWorkflow } from "@/components/workflow/workflow-context"

interface Point {
  x: number
  y: number
}

const SchemaModal: React.FC<SchemaModalProps> = ({
  nodeType,
  nodeId: currentNodeId,
  nodeLabel,
  baseInputSchema,
  baseOutputSchema,
  availableInputsFromPrevious,
  onClose,
  onSaveMappings,
}) => {
  const { getNodeById, updateNode } = useWorkflow()
  const currentNode = getNodeById(currentNodeId)

  const [localInputSchema, setLocalInputSchema] = useState<ExtendedSchemaItem[]>([])
  const [selectedSourceItem, setSelectedSourceItem] = useState<ExtendedSchemaItem | null>(null)
  const [selectedTargetItem, setSelectedTargetItem] = useState<ExtendedSchemaItem | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [coordsVersion, setCoordsVersion] = useState(0)
  const [nodeFormData, setNodeFormData] = useState<Record<string, any>>({})

  const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const svgContainerRef = useRef<HTMLDivElement | null>(null)
  const availableOutputsColumnRef = useRef<HTMLDivElement | null>(null)
  const nodeInputsColumnRef = useRef<HTMLDivElement | null>(null)

  // Get the current node schema for dynamic form rendering
  const currentNodeSchema = useMemo(() => getNodeSchema(nodeType), [nodeType])

  // Initialize and sync form data from current node data
  useEffect(() => {
    if (currentNode?.data) {
      setNodeFormData(currentNode.data)
    }
  }, [currentNode?.data])

  // Re-sync form data when node data changes (from NodeModal or other sources)
  useEffect(() => {
    if (currentNode?.data) {
      setNodeFormData((prev) => ({
        ...prev,
        ...currentNode.data,
      }))
    }
  }, [currentNode?.data])

  const initializeLocalSchemaAndConnections = useCallback(() => {
    const processedInputs = baseInputSchema.map((baseInput): ExtendedSchemaItem => {
      const extendedBaseInput = baseInput as ExtendedSchemaItem
      return {
        ...baseInput,
        mappings: Array.isArray(extendedBaseInput.mappings) ? extendedBaseInput.mappings : [],
        sourceNodeId: undefined,
        sourceNodeType: undefined,
        sourceNodeLabel: undefined,
      }
    })

    const validInitialConnections: Connection[] = []
    const cleanedLocalInputs = processedInputs.map((input) => {
      if (!input.mappings || input.mappings.length === 0) {
        return input
      }
      const validMappings = input.mappings.filter((mapping) => {
        const sourceExists = availableInputsFromPrevious.some(
          (availableSource) => availableSource.sourceNodeId === mapping.nodeId && availableSource.name === mapping.name,
        )
        if (sourceExists) {
          validInitialConnections.push({
            sourceItemId: `source-${mapping.nodeId}-${mapping.name}`,
            targetItemId: `target-${currentNodeId}-${input.name}`,
          })
        } else {
          console.warn(
            `Initial mapping for input '${input.name}' from source '${mapping.name}' (node: ${mapping.nodeLabel || mapping.nodeId}) is stale and source no longer exists. Removing this mapping.`,
          )
        }
        return sourceExists
      })

      if (validMappings.length !== input.mappings.length) {
        return { ...input, mappings: validMappings }
      }
      return input
    })

    setLocalInputSchema(cleanedLocalInputs)
    setConnections(validInitialConnections)
  }, [baseInputSchema, availableInputsFromPrevious, currentNodeId])

  useEffect(() => {
    initializeLocalSchemaAndConnections()
    itemRefs.current.clear()
    setSelectedSourceItem(null)
    setSelectedTargetItem(null)
    const timeoutId = setTimeout(() => setCoordsVersion((prev) => prev + 1), 50)
    return () => clearTimeout(timeoutId)
  }, [initializeLocalSchemaAndConnections])

  // Re-initialize when availableInputsFromPrevious changes (from upstream node updates)
  useEffect(() => {
    initializeLocalSchemaAndConnections()
  }, [availableInputsFromPrevious, initializeLocalSchemaAndConnections])

  useEffect(() => {
    const handleResize = () => requestAnimationFrame(() => setCoordsVersion((prev) => prev + 1))
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const leftCol = availableOutputsColumnRef.current
    const rightCol = nodeInputsColumnRef.current
    const handleScroll = () => requestAnimationFrame(() => setCoordsVersion((prev) => prev + 1))

    if (leftCol) leftCol.addEventListener("scroll", handleScroll, { passive: true })
    if (rightCol) rightCol.addEventListener("scroll", handleScroll, { passive: true })
    const timeoutId = setTimeout(() => handleScroll(), 100)

    return () => {
      if (leftCol) leftCol.removeEventListener("scroll", handleScroll)
      if (rightCol) rightCol.removeEventListener("scroll", handleScroll)
      clearTimeout(timeoutId)
    }
  }, [])

  const setItemRef = useCallback((id: string, element: HTMLDivElement | null) => {
    const map = itemRefs.current
    if (element) map.set(id, element)
    else map.delete(id)
  }, [])

  const groupAvailableInputs = useCallback((): GroupedSource[] => {
    const grouped: Record<string, GroupedSource> = {}
    availableInputsFromPrevious.forEach((source) => {
      const groupId = source.sourceNodeId || "unknown-source"
      if (!grouped[groupId]) {
        grouped[groupId] = {
          nodeId: groupId,
          nodeLabel: source.sourceNodeLabel || "Unknown Source",
          nodeType: source.sourceNodeType || "Unknown",
          outputs: [],
        }
      }
      grouped[groupId].outputs.push(source)
    })
    return Object.values(grouped).sort((a, b) => a.nodeLabel.localeCompare(b.nodeLabel))
  }, [availableInputsFromPrevious])

  const groupedSources = useMemo(() => groupAvailableInputs(), [groupAvailableInputs])

  // Handle form input changes - immediately push to workflow context
  const handleFormInputChange = useCallback(
    (fieldName: string, value: any) => {
      setNodeFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }))

      // Immediately push to workflow context for real-time sync
      if (currentNode) {
        updateNode(currentNodeId, {
          data: {
            ...currentNode.data,
            [fieldName]: value,
          },
        })
      }
    },
    [currentNode, currentNodeId, updateNode],
  )

  // Push mapping changes live to workflow context
  const pushMappingChangesToContext = useCallback(
    (updatedLocalInputSchema: ExtendedSchemaItem[]) => {
      if (!currentNode) return

      // Build the updated node data with propagated values
      const updatedData: Record<string, any> = { ...currentNode.data }
      const inputMappings: Record<string, MappingSourceInfo[]> = {}

      updatedLocalInputSchema.forEach((input) => {
        inputMappings[input.name] = input.mappings || []

        // Auto-propagate upstream values for connected fields
        if (input.mappings && input.mappings.length > 0) {
          const mapping = input.mappings[0] // Take first mapping for simplicity
          const sourceNode = availableInputsFromPrevious.find(
            (source) => source.sourceNodeId === mapping.nodeId && source.name === mapping.name,
          )

          if (sourceNode) {
            // For file paths and other direct value propagation
            if (input.name === "filePath" || input.name.includes("Path") || input.name.includes("path")) {
              updatedData[input.name] = sourceNode.value || sourceNode.name
            } else if (sourceNode.value !== undefined) {
              updatedData[input.name] = sourceNode.value
            }
          }
        }
      })

      // Store input mappings for persistence
      updatedData.inputMappings = inputMappings

      // Immediately update the workflow context
      updateNode(currentNodeId, { data: updatedData })

      // Also update local form data to stay in sync
      setNodeFormData(updatedData)
    },
    [currentNode, currentNodeId, updateNode, availableInputsFromPrevious],
  )

  const handleItemClick = (item: ExtendedSchemaItem, type: "available" | "currentInput") => {
    let connectionChanged = false
    const updatedLocalInputSchema = [...localInputSchema]

    if (type === "available") {
      const clickedSourceItem = item
      if (selectedTargetItem && clickedSourceItem.datatype === selectedTargetItem.datatype) {
        const mappingInfo: MappingSourceInfo = {
          name: clickedSourceItem.name,
          nodeId: clickedSourceItem.sourceNodeId!,
          nodeLabel: clickedSourceItem.sourceNodeLabel || clickedSourceItem.sourceNodeType,
          nodeType: clickedSourceItem.sourceNodeType,
        }
        const connection: Connection = {
          sourceItemId: `source-${mappingInfo.nodeId}-${mappingInfo.name}`,
          targetItemId: `target-${currentNodeId}-${selectedTargetItem.name}`,
        }

        const targetIndex = updatedLocalInputSchema.findIndex((input) => input.name === selectedTargetItem.name)
        if (targetIndex === -1) return

        const existingMappingIndex = (selectedTargetItem.mappings || []).findIndex(
          (m) => m.nodeId === mappingInfo.nodeId && m.name === mappingInfo.name,
        )

        if (existingMappingIndex > -1) {
          // Remove connection
          updatedLocalInputSchema[targetIndex] = {
            ...updatedLocalInputSchema[targetIndex],
            mappings: (updatedLocalInputSchema[targetIndex].mappings || []).filter(
              (_, i) => i !== existingMappingIndex,
            ),
          }
          setConnections((prev) =>
            prev.filter(
              (c) => !(c.sourceItemId === connection.sourceItemId && c.targetItemId === connection.targetItemId),
            ),
          )
        } else {
          // Add connection
          updatedLocalInputSchema[targetIndex] = {
            ...updatedLocalInputSchema[targetIndex],
            mappings: [...(updatedLocalInputSchema[targetIndex].mappings || []), mappingInfo],
          }
          setConnections((prev) => [...prev, connection])
        }

        setLocalInputSchema(updatedLocalInputSchema)
        pushMappingChangesToContext(updatedLocalInputSchema)

        setSelectedSourceItem(null)
        setSelectedTargetItem(null)
        connectionChanged = true
      } else {
        setSelectedSourceItem(
          clickedSourceItem.name === selectedSourceItem?.name &&
            clickedSourceItem.sourceNodeId === selectedSourceItem?.sourceNodeId
            ? null
            : clickedSourceItem,
        )
      }
    } else if (type === "currentInput") {
      const clickedTargetItem = item
      if (selectedSourceItem && clickedTargetItem.datatype === selectedSourceItem.datatype) {
        const mappingInfo: MappingSourceInfo = {
          name: selectedSourceItem.name,
          nodeId: selectedSourceItem.sourceNodeId!,
          nodeLabel: selectedSourceItem.sourceNodeLabel || selectedSourceItem.sourceNodeType,
          nodeType: selectedSourceItem.sourceNodeType,
        }
        const connection: Connection = {
          sourceItemId: `source-${mappingInfo.nodeId}-${mappingInfo.name}`,
          targetItemId: `target-${currentNodeId}-${clickedTargetItem.name}`,
        }

        const targetIndex = updatedLocalInputSchema.findIndex((input) => input.name === clickedTargetItem.name)
        if (targetIndex === -1) return

        const existingMappingIndex = (clickedTargetItem.mappings || []).findIndex(
          (m) => m.nodeId === mappingInfo.nodeId && m.name === mappingInfo.name,
        )

        if (existingMappingIndex > -1) {
          // Remove connection
          updatedLocalInputSchema[targetIndex] = {
            ...updatedLocalInputSchema[targetIndex],
            mappings: (updatedLocalInputSchema[targetIndex].mappings || []).filter(
              (_, i) => i !== existingMappingIndex,
            ),
          }
          setConnections((prev) =>
            prev.filter(
              (c) => !(c.sourceItemId === connection.sourceItemId && c.targetItemId === connection.targetItemId),
            ),
          )
        } else {
          // Add connection
          updatedLocalInputSchema[targetIndex] = {
            ...updatedLocalInputSchema[targetIndex],
            mappings: [...(updatedLocalInputSchema[targetIndex].mappings || []), mappingInfo],
          }
          setConnections((prev) => [...prev, connection])
        }

        setLocalInputSchema(updatedLocalInputSchema)
        pushMappingChangesToContext(updatedLocalInputSchema)

        setSelectedSourceItem(null)
        setSelectedTargetItem(null)
        connectionChanged = true
      } else {
        setSelectedTargetItem(
          clickedTargetItem.name === selectedTargetItem?.name && clickedTargetItem.name === selectedTargetItem.name
            ? null
            : clickedTargetItem,
        )
      }
    }

    if (connectionChanged) {
      requestAnimationFrame(() => setCoordsVersion((prev) => prev + 1))
    }
  }

  const getElementCoords = useCallback((elementId: string): Point | null => {
    const element = itemRefs.current.get(elementId)
    const svgContainer = svgContainerRef.current
    if (!element || !svgContainer) return null
    const elementRect = element.getBoundingClientRect()
    const containerRect = svgContainer.getBoundingClientRect()
    const isSource = elementId.startsWith("source-")
    const x = isSource ? elementRect.right - containerRect.left : elementRect.left - containerRect.left
    const y = elementRect.top + elementRect.height / 2 - containerRect.top
    return { x, y }
  }, [])

  const getPathData = (startPoint: Point, endPoint: Point): string => {
    const dx = endPoint.x - startPoint.x
    const controlPointX1 = startPoint.x + dx * 0.35
    const controlPointY1 = startPoint.y
    const controlPointX2 = endPoint.x - dx * 0.35
    const controlPointY2 = endPoint.y
    return `M ${startPoint.x} ${startPoint.y} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${endPoint.x} ${endPoint.y}`
  }

  const connectionPaths = useMemo(() => {
    return connections
      .map((conn) => {
        const startPoint = getElementCoords(conn.sourceItemId)
        const endPoint = getElementCoords(conn.targetItemId)
        if (startPoint && endPoint) {
          return (
            <path
              key={`${conn.sourceItemId}-${conn.targetItemId}`}
              d={getPathData(startPoint, endPoint)}
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              className="text-blue-500 dark:text-blue-400 opacity-80 hover:opacity-100"
              markerEnd="url(#arrowhead)"
            />
          )
        }
        return null
      })
      .filter(Boolean)
  }, [connections, coordsVersion, getElementCoords])

  const toggleExpandGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
    setTimeout(() => setCoordsVersion((v) => v + 1), 50)
  }

  // Render dynamic form inputs based on schema
  const renderDynamicFormInputs = () => {
    if (!currentNodeSchema?.inputSchema) return null

    return (
      <div className="space-y-4 p-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Node Configuration</h4>
        {currentNodeSchema.inputSchema.map((field) => {
          const fieldValue = nodeFormData[field.name] || ""
          const isConnected = localInputSchema.some(
            (input) => input.name === field.name && input.mappings && input.mappings.length > 0,
          )

          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-medium">
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
                {isConnected && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Connected
                  </Badge>
                )}
              </Label>

              {field.datatype === "boolean" ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.name}
                    checked={fieldValue === true || fieldValue === "true"}
                    onCheckedChange={(checked) => handleFormInputChange(field.name, checked)}
                    disabled={isConnected}
                  />
                  <Label htmlFor={field.name} className="text-xs text-gray-600 dark:text-gray-400">
                    {field.description}
                  </Label>
                </div>
              ) : field.datatype === "number" || field.datatype === "integer" ? (
                <Input
                  id={field.name}
                  type="number"
                  value={fieldValue}
                  onChange={(e) => handleFormInputChange(field.name, e.target.value)}
                  placeholder={field.description}
                  className="text-xs"
                  disabled={isConnected}
                />
              ) : field.name.toLowerCase().includes("content") ||
                field.name.toLowerCase().includes("query") ||
                field.name.toLowerCase().includes("description") ? (
                <Textarea
                  id={field.name}
                  value={fieldValue}
                  onChange={(e) => handleFormInputChange(field.name, e.target.value)}
                  placeholder={field.description}
                  className="text-xs min-h-[60px]"
                  disabled={isConnected}
                />
              ) : (
                <Input
                  id={field.name}
                  type="text"
                  value={fieldValue}
                  onChange={(e) => handleFormInputChange(field.name, e.target.value)}
                  placeholder={field.description}
                  className="text-xs"
                  disabled={isConnected}
                />
              )}

              {field.description && <p className="text-xs text-gray-500 dark:text-gray-400">{field.description}</p>}
            </div>
          )
        })}
      </div>
    )
  }

  const renderAvailableOutputs = () => {
    if (groupedSources.length === 0)
      return <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-2 text-xs">No outputs available.</p>
    return (
      <div className="space-y-3">
        {groupedSources.map((group) => (
          <div key={group.nodeId} className="space-y-1">
            <div
              onClick={() => toggleExpandGroup(group.nodeId)}
              className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 text-xs flex items-center justify-between bg-gray-100 dark:bg-gray-700/80 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600/80 transition sticky top-0 z-10"
            >
              <span className="truncate pr-2" title={group.nodeLabel}>
                {group.nodeLabel}{" "}
                <span className="font-normal text-gray-500 dark:text-gray-400">({group.nodeType})</span>
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-lg leading-none">
                {expandedGroups[group.nodeId] ? "-" : "+"}
              </span>
            </div>
            {expandedGroups[group.nodeId] && (
              <ul className="space-y-1 pl-2 pt-1">
                {group.outputs.length === 0 && (
                  <li className="text-xs text-gray-500 dark:text-gray-400 italic px-1">No outputs.</li>
                )}
                {group.outputs.map((source) => {
                  const id = `source-${source.sourceNodeId}-${source.name}`
                  const isSelected =
                    selectedSourceItem?.sourceNodeId === source.sourceNodeId && selectedSourceItem?.name === source.name
                  const isCompatible = selectedTargetItem?.datatype === source.datatype
                  const canConnect = selectedTargetItem && isCompatible
                  const isAlreadyConnectedToSelectedTarget =
                    selectedTargetItem &&
                    (selectedTargetItem.mappings || []).some(
                      (m) => m.nodeId === source.sourceNodeId && m.name === source.name,
                    )

                  return (
                    <li
                      key={id}
                      ref={(el) => setItemRef(id, el)}
                      className={`p-1 rounded border transition-all duration-150 cursor-pointer group relative ${
                        isSelected
                          ? "bg-green-100 dark:bg-green-900/50 ring-1 ring-green-400 border-green-300 dark:border-green-700"
                          : isAlreadyConnectedToSelectedTarget
                            ? "bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400 dark:border-yellow-700"
                            : `border-gray-200 dark:border-gray-700 ${canConnect ? "hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-300 dark:hover:border-green-600" : "hover:bg-gray-50 dark:hover:bg-gray-700/60"}`
                      } ${!selectedTargetItem || isCompatible ? "opacity-100" : "opacity-50 cursor-not-allowed"}`}
                      onClick={() => (!selectedTargetItem || isCompatible) && handleItemClick(source, "available")}
                      title={
                        !selectedTargetItem || isCompatible
                          ? source.description || source.name
                          : `Type mismatch (expects ${selectedTargetItem?.datatype})`
                      }
                    >
                      <div className="flex justify-between items-start text-xs">
                        <span className="font-mono text-gray-800 dark:text-gray-200 break-all leading-tight">
                          {source.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs font-normal px-1 py-0 ml-1 shrink-0 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                        >
                          {source.datatype}
                        </Badge>
                      </div>
                      {source.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                          {source.description}
                        </p>
                      )}
                      {(canConnect || isAlreadyConnectedToSelectedTarget) && (
                        <div
                          className={`absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isAlreadyConnectedToSelectedTarget ? "bg-yellow-500" : "bg-green-400 dark:bg-green-500"} group-hover:scale-125 transition-transform`}
                        ></div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderNodeInputs = () => {
    if (!localInputSchema || localInputSchema.length === 0)
      return <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-2 text-xs">No inputs defined.</p>
    return (
      <div className="space-y-1.5">
        {localInputSchema.map((item) => {
          const id = `target-${currentNodeId}-${item.name}`
          const isSelected = selectedTargetItem?.name === item.name
          const isConnected = item.mappings && item.mappings.length > 0
          const isCompatible = selectedSourceItem?.datatype === item.datatype
          const canConnect = selectedSourceItem && isCompatible
          const isSelectedSourceAlreadyConnected =
            selectedSourceItem &&
            (item.mappings || []).some(
              (m) => m.nodeId === selectedSourceItem.sourceNodeId && m.name === selectedSourceItem.name,
            )

          return (
            <div
              key={id}
              ref={(el) => setItemRef(id, el)}
              className={`p-1.5 rounded border transition-all duration-150 cursor-pointer group relative ${
                isSelected
                  ? "bg-blue-100 dark:bg-blue-900/50 ring-1 ring-blue-400 border-blue-300 dark:border-blue-700"
                  : isSelectedSourceAlreadyConnected
                    ? "bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400 dark:border-yellow-700"
                    : isConnected
                      ? "bg-gray-50 dark:bg-gray-800/70 border-gray-300 dark:border-gray-600"
                      : `border-gray-200 dark:border-gray-700 ${canConnect ? "hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600" : "hover:bg-gray-50 dark:hover:bg-gray-700/60"}`
              } ${!selectedSourceItem || isCompatible ? "opacity-100" : "opacity-50 cursor-not-allowed"}`}
              onClick={() => (!selectedSourceItem || isCompatible) && handleItemClick(item, "currentInput")}
              title={
                !selectedSourceItem || isCompatible
                  ? item.description || item.name
                  : `Type mismatch (expects ${selectedSourceItem?.datatype})`
              }
            >
              <div className="flex justify-between items-start mb-0.5">
                <span className="font-medium font-mono text-gray-800 dark:text-gray-200 break-all text-xs leading-tight">
                  {item.name}
                  {item.required && <span className="text-red-500 ml-1">*</span>}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs font-normal px-1.5 py-0.5 ml-2 shrink-0 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                >
                  {item.datatype}
                </Badge>
              </div>

              {item.description && (!item.mappings || item.mappings.length === 0) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{item.description}</p>
              )}

              {item.mappings && item.mappings.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {item.mappings.map((mapping, index) => (
                    <p
                      key={`${mapping.nodeId}-${mapping.name}-${index}`}
                      className="text-xs text-green-700 dark:text-green-400/90 leading-snug flex items-center bg-green-50 dark:bg-green-900/30 px-1 py-0.5 rounded-sm"
                    >
                      <span className="mr-1.5 text-green-600 dark:text-green-500">←</span>
                      <span className="font-mono text-green-800 dark:text-green-300">{mapping.name}</span>
                      <span className="ml-1.5 text-gray-500 dark:text-gray-400 truncate text-[0.65rem] leading-none">
                        ({mapping.nodeLabel || mapping.nodeType || "Unknown"})
                      </span>
                    </p>
                  ))}
                </div>
              )}
              {(canConnect || isSelectedSourceAlreadyConnected) && (
                <div
                  className={`absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isSelectedSourceAlreadyConnected ? "bg-yellow-500" : "bg-blue-400 dark:bg-blue-500"} group-hover:scale-125 transition-transform`}
                ></div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const stopWheelPropagation = (e: React.WheelEvent<HTMLDivElement>) => e.stopPropagation()
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleDone = () => {
    // Final save of mappings
    if (onSaveMappings) onSaveMappings(localInputSchema)
    onClose()
  }

  if (!nodeType) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col relative border border-gray-300 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2 border-b border-gray-200 dark:border-gray-700 pb-2 flex-shrink-0 px-1">
          <h2
            id="modal-title"
            className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 truncate pr-4"
          >
            Configure: {nodeLabel || nodeType}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold leading-none p-1 -mr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-grow flex flex-col overflow-hidden">
          {/* Dynamic Form Section */}
          <div className="flex-shrink-0 max-h-48 overflow-y-auto">{renderDynamicFormInputs()}</div>

          {/* Schema Mapping Section */}
          <div
            ref={svgContainerRef}
            className="flex-grow flex flex-col md:flex-row gap-3 md:gap-4 overflow-hidden relative min-h-[300px] mt-4"
          >
            <div
              ref={availableOutputsColumnRef}
              className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto"
              onWheel={stopWheelPropagation}
            >
              <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-green-700 dark:text-green-400 sticky top-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-2 pt-2 z-20">
                Source Outputs Schema
              </h3>
              <div className="flex-grow p-2">{renderAvailableOutputs()}</div>
            </div>

            <div
              ref={nodeInputsColumnRef}
              className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto"
              onWheel={stopWheelPropagation}
            >
              <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-blue-700 dark:text-blue-400 sticky top-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-2 pt-2 z-20">
                Node Inputs Schema
              </h3>
              <div className="flex-grow p-2">{renderNodeInputs()}</div>
            </div>

            {svgContainerRef.current && (
              <svg
                width="100%"
                height="100%"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  pointerEvents: "none",
                  zIndex: 10,
                  overflow: "visible",
                }}
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L8,3 L0,6 Z" fill="currentColor" />
                  </marker>
                </defs>
                {connectionPaths}
              </svg>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end px-1 space-x-2">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-150 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            type="button"
            className="px-5 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default SchemaModal
