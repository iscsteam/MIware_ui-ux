// // WorkflowEditor.tsx (Example Parent)
// "use client";

// import React, {useState, useCallback, useRef, useEffect } from "react";
// import { useWorkflow, WorkflowProvider } from "./workflow-context"; // Adjust path
// import { NodeComponent } from "./node-component"; // Adjust path
// import { NodePropertiesModal } from "./nodepropertiesmodal"; // Adjust path
// import { DataMappingModal } from "./datamappingmodel"; // Adjust path
// // Import component for drawing connections if you have one

// // Component that uses the context
// function WorkflowEditorInternal() {
//   const {
//     nodes,
//     updateNode,
//     // --- Modal Setters ---
//     setPropertiesModalNodeId,
//     setDataMappingModalNodeId,
//     // --- Dragging ---
//     draggingNodeInfo,
//     setDraggingNodeInfo,
//     // --- Connections ---
//     connections, // Get connections if you need to draw them
//     pendingConnection,
//     setPendingConnection,
//     addConnection,
//     getNodeById, // Needed for connection drawing logic
   
//   } = useWorkflow();

//   const editorRef = useRef<HTMLDivElement>(null);
//   const dragstartPos = useRef<{ x: number; y: number } | null>(null); // Track initial drag position
//   const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);


//   // --- Drag Handlers ---
//   const handleDragstart = useCallback(
//     (nodeId: string, e: React.MouseEvent) => {
//       if (!editorRef.current) return;
//       const node = getNodeById(nodeId);
//       if (!node) return;

//       const editorRect = editorRef.current.getBoundingClientRect();
//       // Calculate offset from the node's *center* (if using translate -50%) to the mouse click
//       const offsetX = e.clientX - editorRect.left - node.position.x;
//       const offsetY = e.clientY - editorRect.top - node.position.y;

//       setDraggingNodeInfo({ id: nodeId, offset: { x: offsetX, y: offsetY } });
//       dragstartPos.current = { x: e.clientX, y: e.clientY }; // Record mouse start
//       e.preventDefault(); // Prevent default browser drag behavior
//     },
//     [setDraggingNodeInfo, getNodeById]
//   );

//   const handleMouseMove = useCallback(
//     (e: MouseEvent) => {
//       if (!draggingNodeInfo || !editorRef.current) return;

//       const editorRect = editorRef.current.getBoundingClientRect();
//       // Calculate new position based on mouse movement relative to editor, adjusted by offset
//       const newX = e.clientX - editorRect.left - draggingNodeInfo.offset.x;
//       const newY = e.clientY - editorRect.top - draggingNodeInfo.offset.y;

//       // Update node position in context (throttling might be good here for performance)
//       updateNode(draggingNodeInfo.id, { position: { x: newX, y: newY } });
//     },
//     [draggingNodeInfo, updateNode]
//   );

//   const handleMouseUp = useCallback(
//     (e: MouseEvent) => {
//       if (draggingNodeInfo) {
//         // Check if it was a drag or just a click
//         const endPos = { x: e.clientX, y: e.clientY };
//         const distanceMoved = dragstartPos.current
//           ? Math.sqrt(
//               Math.pow(endPos.x - dragstartPos.current.x, 2) +
//                 Math.pow(endPos.y - dragstartPos.current.y, 2)
//             )
//           : 0;

//         if (distanceMoved < 5) {
//           // Threshold to differentiate click from drag
//           // It was likely a click, trigger properties modal
//           // Check target to ensure it wasn't a port/action button click that bubbles up
//           const target = e.target as HTMLElement;
//           if (target.closest(".node-body-draggable .absolute.inset-0")) {
//             // Check if the click overlay was hit
//             setPropertiesModalNodeId(draggingNodeInfo.id);
//           } else if (target.closest(".port")) {
//             // Port click logic is handled within NodeComponent's onClick
//           } else if (target.closest(".node-action")) {
//             // Action button logic is handled within NodeComponent's onClick
//           }
//         }
//         // Else it was a drag, position already updated by mouseMove

//         setDraggingNodeInfo(null); // Stop dragging
//         dragstartPos.current = null;
//       } else if (pendingConnection) {
//         // If releasing mouse during connection drag and not over an input port
//         const target = e.target as HTMLElement;
//         if (!target.closest(".port")) {
//           // Or check specific input port class
//           setPendingConnection(null); // Cancel pending connection
//         }
//       }
//     },
//     [
//       draggingNodeInfo,
//       setDraggingNodeInfo,
//       setPropertiesModalNodeId,
//       pendingConnection,
//       setPendingConnection,
//     ]
//   );

//   // Add/Remove global listeners for mouse move/up during drag
//   useEffect(() => {
//     if (draggingNodeInfo) {
//       window.addEventListener("mousemove", handleMouseMove);
//       window.addEventListener("mouseup", handleMouseUp);
//     } else {
//       window.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("mouseup", handleMouseUp);
//     }

//     // Cleanup listeners
//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("mouseup", handleMouseUp);
//     };
//   }, [draggingNodeInfo, handleMouseMove, handleMouseUp]);

//   // Handle clicking the background to deselect/close modals
//   const handleBackgroundClick = (e: React.MouseEvent) => {
//     // Check if click is directly on the editor background, not on a node or modal
//     if (e.target === editorRef.current) {
//       setPropertiesModalNodeId(null);
//       setDataMappingModalNodeId(null);
//       setPendingConnection(null); // Also cancel pending connection
//     }
//   };

//   //   const handleMouseUp = useCallback(() => {
//   //     setIsDragging(false);
//   //   }, []);

//   return (
//     <div
//       ref={editorRef}
//       className="relative w-full h-screen bg-gray-100 overflow-hidden" // Example styling
//       onClick={handleBackgroundClick} // Add click handler for background deselect
//       // onMouseUp={handleMouseUp} // Attach mouseup here if window listener doesn't work as expected
//     >
//       {/* Render Nodes */}
//       {nodes.map((node) => (
//         <NodeComponent
//         key={node.id}
//         node={node}
//         selected={node.id === selectedNodeId}
//         onDragStart={handleDragstart}
//         onExecuteNode={(id) => console.log("Execute", id)}
//         onSelect={() => setSelectedNodeId(node.id)} // ✅ Fix here
//         onOpenProperties = {() => setDataMappingModalNodeId(node.id)}
//       />
      
//       ))}

//       {/* Render Connections (Example: requires a separate ConnectionLine component) */}
//       {/* {connections.map(conn => <ConnectionLine key={conn.id} connection={conn} />)} */}

//       {/* Render Modals */}
//       <NodePropertiesModal />
//       <DataMappingModal />
//     </div>
//   );
// }

// // Component with the Provider
// export default function WorkflowEditor() {
//   return (
//     <WorkflowProvider>
//       <WorkflowEditorInternal />
//     </WorkflowProvider>
//   );
// }
