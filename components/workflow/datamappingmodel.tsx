// DataMappingModal.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useWorkflow, WorkflowNode } from "./workflow-context"; // Adjust path
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    // DialogFooter, DialogClose // Add if needed
} from "@/components/ui/dialog";
import { SchemaFieldList } from "./SchemaFieldList"; // Adjust path
import { getNodeIcon } from "./node-utils"; // Adjust path if needed for title/icon

interface LineCoords {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function DataMappingModal() {
    const {
        dataMappingModalNodeId,
        setDataMappingModalNodeId,
        getNodeById,
        updateNode, // If mapping changes are saved directly
    } = useWorkflow();

    const [lines, setLines] = useState<LineCoords[]>([]);
    const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const inputColumnRef = useRef<HTMLDivElement>(null);
    const outputColumnRef = useRef<HTMLDivElement>(null);
    const scrollRafRef = useRef<number | null>(null);

    const node = dataMappingModalNodeId ? getNodeById(dataMappingModalNodeId) : null;

    // --- Callback ref function (Keep) ---
    const registerFieldRef = useCallback(
        (key: string, element: HTMLDivElement | null) => {
          fieldRefs.current[key] = element;
        },
        []
    );

    // --- Function to Calculate Lines (Keep, adjust dependencies if needed) ---
    const calculateLines = useCallback(() => {
        // ... (Keep the existing calculateLines logic from NodeComponent)
        // Make sure it uses `node.data?.inputSchema` and `node.data?.outputSchema`
        if (
          !node || // Check if node exists
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

        // ... rest of the calculation logic ...

        setLines(newLines);

    }, [node]); // Depends only on the current node

    // --- Effect for Calculation, Resize, Scroll (Keep, adjust dependencies) ---
    useEffect(() => {
      if (node) { // Only run if the modal is technically open for a node
        // ... (Keep the existing useEffect logic from NodeComponent for listeners/cleanup)
        // Make sure the cleanup clears refs and lines when `node` becomes null
        const initialRafId = requestAnimationFrame(() => {
            calculateLines();
          });

        const handleScroll = () => { /* ... */ };
        const handleResize = () => { /* ... */ };

        // Attach listeners...
        window.addEventListener("resize", handleResize);
        inputColumnRef.current?.addEventListener("scroll", handleScroll, { passive: true });
        outputColumnRef.current?.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            // Cleanup...
             window.removeEventListener("resize", handleResize);
             inputColumnRef.current?.removeEventListener("scroll", handleScroll);
             outputColumnRef.current?.removeEventListener("scroll", handleScroll);
             cancelAnimationFrame(initialRafId);
             if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);
             // Clear refs and lines on close
             fieldRefs.current = {};
             setLines([]);
        };
      }
    }, [node, calculateLines]); // Rerun when the node changes or modal closes

    // --- Dummy data useEffect (Move from NodeComponent if needed here) ---
     useEffect(() => {
        if (node && (!node.data?.inputSchema || !node.data?.outputSchema)) {
           // Maybe initialize schema here if node doesn't have it? Or handle this elsewhere.
           console.warn(`Node ${node.id} opened in Data Mapping without schema.`);
        }
     }, [node, updateNode]);


    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setDataMappingModalNodeId(null); // Close modal via context state
        }
    };

    const getNodeLabel = () => {
        if (!node) return "";
        return (
          node.data?.label ||
          node.type
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        );
      };


    if (!node) {
        return null; // Don't render the dialog if no node is selected for mapping
    }

    return (
        <Dialog open={!!dataMappingModalNodeId} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] min-h-[400px] max-h-[80vh] flex flex-col">
                {/* Header */}
                <DialogHeader>
                    <DialogTitle>Node Data Mapping: {getNodeLabel()}</DialogTitle>
                </DialogHeader>

                {/* Body with columns and SVG overlay */}
                <div ref={svgContainerRef} className="relative flex-grow grid grid-cols-2 gap-4 py-4 overflow-hidden">
                    {/* Input Column */}
                    <div ref={inputColumnRef} className="relative flex flex-col border rounded p-3 overflow-y-auto bg-white">
                        <h3 className="font-semibold text-base mb-2 border-b pb-1 sticky top-0 bg-white ">Input Schema</h3>
                        <SchemaFieldList type="input" schema={node.data?.inputSchema} setRef={registerFieldRef} />
                    </div>

                    {/* Output Column */}
                    <div ref={outputColumnRef} className="relative flex flex-col border rounded p-3 overflow-y-auto bg-white">
                        <h3 className="font-semibold text-base mb-2 border-b pb-1 sticky top-0 bg-white z-10">Output Schema</h3>
                        <SchemaFieldList type="output" schema={node.data?.outputSchema} setRef={registerFieldRef} />
                    </div>

                    {/* SVG Overlay */}
                    <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ overflow: "visible" }}>
                         <defs>
                            <marker id="arrowhead-mapping" /* Use unique ID */ viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse" fill="rgb(59 130 246)">
                            <path d="M 0 0 L 10 5 L 0 10 z" />
                            </marker>
                        </defs>
                        {lines.map(({ id, x1, y1, x2, y2 }) => (
                            <line
                            key={id}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="rgb(59 130 246)"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead-mapping)"
                            />
                        ))}
                    </svg>
                </div>

                {/* Optional Footer */}
                {/* <DialogFooter>...</DialogFooter> */}
            </DialogContent>
        </Dialog>
    );
}