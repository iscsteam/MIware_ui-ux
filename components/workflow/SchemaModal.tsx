import React, { useState, useRef, useEffect } from 'react';
import { NodeType, SchemaItem } from './workflow-context';
import { Badge } from '@/components/ui/badge';

interface SchemaModalProps {
  nodeType: NodeType | null;
  nodeLabel?: string;
  baseInputSchema: SchemaItem[];
  baseOutputSchema: SchemaItem[];
  availableInputsFromPrevious: SchemaItem[];
  onClose: () => void;
}

interface GroupedSource {
  nodeType: string;
  outputs: SchemaItem[];
}

const SchemaModal: React.FC<SchemaModalProps> = ({
  nodeType,
  nodeLabel,
  baseInputSchema,
  baseOutputSchema,
  availableInputsFromPrevious,
  onClose,
}) => {
  const [selectedCurrentInput, setSelectedCurrentInput] = useState<SchemaItem | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [localInputSchema, setLocalInputSchema] = useState<SchemaItem[]>(baseInputSchema);

  const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    itemRefs.current.clear();
    setLocalInputSchema(baseInputSchema);
  }, [baseInputSchema, availableInputsFromPrevious]);

  if (!nodeType) return null;

  const groupAvailableInputs = (): GroupedSource[] => {
    const grouped: Record<string, SchemaItem[]> = {};

    availableInputsFromPrevious.forEach((source) => {
      const nodeTypeLabel = source.sourceNodeType || "Unknown";
      if (!grouped[nodeTypeLabel]) grouped[nodeTypeLabel] = [];
      grouped[nodeTypeLabel].push(source);
    });

    return Object.entries(grouped).map(([nodeType, outputs]) => ({
      nodeType,
      outputs,
    }));
  };

  const groupedSources = groupAvailableInputs();

  const toggleExpand = (nodeType: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeType]: !prev[nodeType],
    }));
  };

  const handleUseSource = (source: SchemaItem, targetInput: SchemaItem) => {
    setLocalInputSchema((prev) =>
      prev.map((input) =>
        input.name === targetInput.name
          ? { ...input, mappedFrom: source.name, mappedFromNode: source.sourceNodeLabel }
          : input
      )
    );
  };

  const renderSchemaItems = (): JSX.Element => {
    if (!localInputSchema.length) {
      return (
        <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-1 text-xs">
          No inputs defined for this node.
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {localInputSchema.map((item) => {
          const isSelected = selectedCurrentInput?.name === item.name;
          const id = `input-${item.name}`;

          return (
            <div
              key={id}
              ref={(el) => itemRefs.current.set(id, el)}
              className={`p-1.5 rounded border transition-colors duration-150 ${
                isSelected
                  ? 'bg-blue-100 dark:bg-blue-900 ring-1 ring-blue-400 border-blue-300 dark:border-blue-700'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/60'
              }`}
              onClick={() => setSelectedCurrentInput(item === selectedCurrentInput ? null : item)}
              title={item.description || item.name}
            >
              <div className="flex justify-between items-start mb-0.5 cursor-pointer">
                <span className="font-medium font-mono text-gray-800 dark:text-gray-200 break-all text-xs leading-tight">
                  {item.name}
                  {item.required && <span className="text-red-500 ml-1">*</span>}
                </span>
                <Badge variant="outline" className="text-xs font-normal px-1.5 py-0.5 ml-2 flex-shrink-0 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                  {item.datatype}
                </Badge>
              </div>

              {item.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{item.description}</p>
              )}

              {item.mappedFrom && (
                <p className="text-xs text-green-700 dark:text-green-300 mt-0.5 leading-snug">
                  ➔ {item.mappedFrom} ({item.mappedFromNode})
                </p>
              )}

              {groupedSources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-dashed border-gray-300 dark:border-gray-600 space-y-2">
                  {groupedSources.map((group) => (
                    <div key={group.nodeType} className="space-y-1">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(group.nodeType);
                        }}
                        className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 text-xs flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        <span>{group.nodeType}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">{expandedNodes[group.nodeType] ? '-' : '+'}</span>
                      </div>

                      {expandedNodes[group.nodeType] && (
                        <ul className="space-y-1 pl-3">
                          {group.outputs
                            .filter((output) => output.datatype === item.datatype)
                            .map((source) => (
                              <li
                                key={source.name}
                                className="text-xs p-1 rounded bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 flex justify-between items-center group"
                                title={source.description || source.name}
                              >
                                <span className="font-mono text-green-800 dark:text-green-300">{source.name}</span>
                                <button
                                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-2 px-1 rounded border border-current"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUseSource(source, item);
                                  }}
                                >
                                  Use
                                </button>
                              </li>
                            ))}
                          {group.outputs.filter((output) => output.datatype === item.datatype).length === 0 && (
                            <li className="text-xs text-orange-600 dark:text-orange-400 italic">
                              No type match in this group.
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderOutputSchemaItems = (schemaItems: SchemaItem[]): JSX.Element => {
    if (!schemaItems || schemaItems.length === 0) {
      return (
        <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-1 text-xs">No outputs defined.</p>
      );
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
                </span>
                <Badge variant="outline" className="text-xs font-normal px-1.5 py-0.5 ml-2 flex-shrink-0 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                  {item.datatype}
                </Badge>
              </div>
              {item.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{item.description}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-xl w-full max-w-4xl max-h-[600px] flex flex-col relative border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2 border-b border-gray-200 dark:border-gray-700 pb-2 flex-shrink-0 px-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
            {nodeLabel || nodeType} - Data Mapping
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold leading-none p-1 -mr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ×
          </button>
        </div>

        <div className="flex-grow flex flex-col md:flex-row gap-3 md:gap-4 overflow-hidden relative min-h-[300px]">
          <div className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto">
            <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-blue-700 dark:text-blue-400 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm px-2 pt-2 z-10">
              Node Inputs
            </h3>
            <div className="flex-grow p-2">{renderSchemaItems()}</div>
          </div>

          <div className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto">
            <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-green-700 dark:text-green-400 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm px-2 pt-2 z-10">
              Node Outputs
            </h3>
            <div className="flex-grow p-2">{renderOutputSchemaItems(baseOutputSchema)}</div>
          </div>
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



// import React, { useState, useRef, useEffect } from 'react';
// import { NodeType, SchemaItem } from './workflow-context';
// import { Badge } from '@/components/ui/badge';

// interface SchemaModalProps {
//   nodeType: NodeType | null;
//   nodeLabel?: string;
//   baseInputSchema: SchemaItem[];
//   baseOutputSchema: SchemaItem[];
//   availableInputsFromPrevious: SchemaItem[];
//   onClose: () => void;
// }

// interface GroupedSource {
//   nodeType: string;
//   outputs: SchemaItem[];
// }

// const SchemaModal: React.FC<SchemaModalProps> = ({
//   nodeType,
//   nodeLabel,
//   baseInputSchema,
//   baseOutputSchema,
//   availableInputsFromPrevious,
//   onClose,
// }) => {
//   const [selectedCurrentInput, setSelectedCurrentInput] = useState<SchemaItem | null>(null);
//   const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

//   const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

//   useEffect(() => {
//     itemRefs.current.clear();
//   }, [baseInputSchema, availableInputsFromPrevious]);

//   if (!nodeType) return null;

//   // --- Group available inputs by their node type ---
//   const groupAvailableInputs = (): GroupedSource[] => {
//     const grouped: Record<string, SchemaItem[]> = {};

//     availableInputsFromPrevious.forEach((source) => {
//       const nodeTypeLabel = source.sourceNodeType || "Unknown"; // Assume you have 'sourceNodeType' inside each SchemaItem
//       if (!grouped[nodeTypeLabel]) grouped[nodeTypeLabel] = [];
//       grouped[nodeTypeLabel].push(source);
//     });

//     return Object.entries(grouped).map(([nodeType, outputs]) => ({
//       nodeType,
//       outputs,
//     }));
//   };

//   const groupedSources = groupAvailableInputs();

//   const toggleExpand = (nodeType: string) => {
//     setExpandedNodes((prev) => ({
//       ...prev,
//       [nodeType]: !prev[nodeType],
//     }));
//   };

//   const renderSchemaItems = (): JSX.Element => {
//     if (!baseInputSchema.length) {
//       return (
//         <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-1 text-xs">
//           No inputs defined for this node.
//         </p>
//       );
//     }

//     return (
//       <div className="space-y-2">
//         {baseInputSchema.map((item) => {
//           const isSelected = selectedCurrentInput?.name === item.name;
//           const id = `input-${item.name}`;

//           return (
//             <div
//               key={id}
//               ref={(el) => itemRefs.current.set(id, el)}
//               className={`p-1.5 rounded border transition-colors duration-150 ${
//                 isSelected
//                   ? 'bg-blue-100 dark:bg-blue-900 ring-1 ring-blue-400 border-blue-300 dark:border-blue-700'
//                   : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/60'
//               }`}
//               onClick={() => setSelectedCurrentInput(item === selectedCurrentInput ? null : item)}
//               title={item.description || item.name}
//             >
//               {/* Input Item */}
//               <div className="flex justify-between items-start mb-0.5 cursor-pointer">
//                 <span className="font-medium font-mono text-gray-800 dark:text-gray-200 break-all text-xs leading-tight">
//                   {item.name}
//                   {item.required && <span className="text-red-500 ml-1">*</span>}
//                 </span>
//                 <Badge variant="outline" className="text-xs font-normal px-1.5 py-0.5 ml-2 flex-shrink-0 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
//                   {item.datatype}
//                 </Badge>
//               </div>
//               {item.description && (
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{item.description}</p>
//               )}

//               {/* Available Sources Grouped */}
//               {groupedSources.length > 0 && (
//                 <div className="mt-2 pt-2 border-t border-dashed border-gray-300 dark:border-gray-600 space-y-2">
//                   {groupedSources.map((group) => (
//                     <div key={group.nodeType} className="space-y-1">
//                       {/* Node Type Label */}
//                       <div
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           toggleExpand(group.nodeType);
//                         }}
//                         className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 text-xs flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                       >
//                         <span>{group.nodeType}</span>
//                         <span className="text-gray-500 dark:text-gray-400 text-xs">{expandedNodes[group.nodeType] ? '-' : '+'}</span>
//                       </div>

//                       {/* Outputs under NodeType */}
//                       {expandedNodes[group.nodeType] && (
//                         <ul className="space-y-1 pl-3">
//                           {group.outputs
//                             .filter((output) => output.datatype === item.datatype)
//                             .map((source) => (
//                               <li
//                                 key={source.name}
//                                 className="text-xs p-1 rounded bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 flex justify-between items-center group"
//                                 title={source.description || source.name}
//                               >
//                                 <span className="font-mono text-green-800 dark:text-green-300">{source.name}</span>
//                                 <button
//                                   className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-2 px-1 rounded border border-current"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     console.log(`Connect ${source.name} to ${item.name}`);
//                                   }}
//                                 >
//                                   Use
//                                 </button>
//                               </li>
//                             ))}
//                           {/* No match case */}
//                           {group.outputs.filter((output) => output.datatype === item.datatype).length === 0 && (
//                             <li className="text-xs text-orange-600 dark:text-orange-400 italic">
//                               No type match in this group.
//                             </li>
//                           )}
//                         </ul>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   const renderOutputSchemaItems = (schemaItems: SchemaItem[]): JSX.Element => {
//     if (!schemaItems || schemaItems.length === 0) {
//       return (
//         <p className="text-gray-500 dark:text-gray-400 italic mt-2 px-1 text-xs">No outputs defined.</p>
//       );
//     }
//     return (
//       <div className="space-y-1">
//         {schemaItems.map((item) => {
//           const id = `output-${item.name}`;
//           return (
//             <div
//               key={id}
//               ref={(el) => itemRefs.current.set(id, el)}
//               className="p-1.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors duration-150"
//               title={item.description || item.name}
//             >
//               <div className="flex justify-between items-start mb-0.5">
//                 <span className="font-medium font-mono text-gray-800 dark:text-gray-200 break-all text-xs leading-tight">
//                   {item.name}
//                 </span>
//                 <Badge variant="outline" className="text-xs font-normal px-1.5 py-0.5 ml-2 flex-shrink-0 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
//                   {item.datatype}
//                 </Badge>
//               </div>
//               {item.description && (
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{item.description}</p>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
//       <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-xl w-full max-w-4xl max-h-[600px] flex flex-col relative border border-gray-200 dark:border-gray-700">
//         <div className="flex justify-between items-center mb-2 border-b border-gray-200 dark:border-gray-700 pb-2 flex-shrink-0 px-1">
//           <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
//             {nodeLabel || nodeType} - Data Mapping
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold leading-none p-1 -mr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//           >
//             ×
//           </button>
//         </div>

//         <div className="flex-grow flex flex-col md:flex-row gap-3 md:gap-4 overflow-hidden relative min-h-[300px]">
//           {/* Inputs */}
//           <div className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto">
//             <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-blue-700 dark:text-blue-400 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm px-2 pt-2 z-10">
//               Node Inputs
//             </h3>
//             <div className="flex-grow p-2">{renderSchemaItems()}</div>
//           </div>

//           {/* Outputs */}
//           <div className="flex-1 flex flex-col min-w-0 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto">
//             <h3 className="text-base font-semibold mb-1 border-b border-gray-200 dark:border-gray-700 pb-1 text-green-700 dark:text-green-400 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm px-2 pt-2 z-10">
//               Node Outputs
//             </h3>
//             <div className="flex-grow p-2">{renderOutputSchemaItems(baseOutputSchema)}</div>
//           </div>
//         </div>

//         <div className="flex-shrink-0 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-end px-1">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SchemaModal;
