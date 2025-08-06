"use client"
import React, { useMemo, useRef } from "react"
import type { WorkflowNode, NodeConnection } from "@/components/workflow/workflow-context"
import { Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MinimapProps {
    nodes: WorkflowNode[];
    connections: NodeConnection[]; // Included for future connection drawing
    canvasOffset: { x: number; y: number }; // Content offset (pre-scale)
    canvasScale: number; // Main canvas zoom
    viewportWidth: number; // Main canvas clientWidth
    viewportHeight: number; // Main canvas clientHeight
    onMinimapClick: (newContentOffset: { x: number; y: number }) => void;
    nodeWidth: number;
    nodeHeight: number;
}

const MINIMAP_WIDTH = 200; // Fixed minimap size in pixels
const MINIMAP_HEIGHT = 150;
const MINIMAP_NODE_COLOR = "rgba(96, 165, 250, 0.7)"; // tailwind blue-400 with opacity
const MINIMAP_VIEWPORT_BORDER_COLOR = "rgba(0, 0, 0, 0.3)";
const MINIMAP_PADDING = 20; // Content padding within minimap scale calculation

export const Minimap: React.FC<MinimapProps> = ({
    nodes,
    // connections, // For later
    canvasOffset,
    canvasScale,
    viewportWidth,
    viewportHeight,
    onMinimapClick,
    nodeWidth,
    nodeHeight,
}) => {
    const minimapRef = useRef<HTMLDivElement>(null);

    const { minX, minY, contentWidth, contentHeight } = useMemo(() => {
        if (nodes.length === 0) {
            // Default bounds if no nodes, e.g., showing one screen worth of content
            return { minX: 0, minY: 0, contentWidth: viewportWidth / canvasScale, contentHeight: viewportHeight / canvasScale };
        }
        let nMinX = Infinity, nMinY = Infinity, nMaxX = -Infinity, nMaxY = -Infinity;
        nodes.forEach(node => {
            nMinX = Math.min(nMinX, node.position.x);
            nMinY = Math.min(nMinY, node.position.y);
            nMaxX = Math.max(nMaxX, node.position.x + nodeWidth);
            nMaxY = Math.max(nMaxY, node.position.y + nodeHeight);
        });
        // Add padding to the effective content for scaling
        nMinX -= MINIMAP_PADDING;
        nMinY -= MINIMAP_PADDING;
        nMaxX += MINIMAP_PADDING;
        nMaxY += MINIMAP_PADDING;
        return { minX: nMinX, minY: nMinY, contentWidth: Math.max(1, nMaxX - nMinX), contentHeight: Math.max(1, nMaxY - nMinY) };
    }, [nodes, nodeWidth, nodeHeight, viewportWidth, canvasScale, viewportHeight]);

    const minimapScale = useMemo(() => {
        return Math.min(MINIMAP_WIDTH / contentWidth, MINIMAP_HEIGHT / contentHeight);
    }, [contentWidth, contentHeight]);

    const handleMinimapInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!minimapRef.current) return;
        const rect = minimapRef.current.getBoundingClientRect();
        const clickXInMinimap = e.clientX - rect.left; // Click relative to minimap div
        const clickYInMinimap = e.clientY - rect.top;

        // Convert minimap click position to content coordinates
        const clickedContentX = (clickXInMinimap / minimapScale) + minX;
        const clickedContentY = (clickYInMinimap / minimapScale) + minY;

        // Calculate new canvasOffset to center the main viewport over the clicked content point
        // Target content offset Tx, Ty: (clickedContentX + Tx) * mainScale = mainViewportWidth / 2
        // Tx = (mainViewportWidth / (2 * mainScale)) - clickedContentX
        const newContentOffsetX = (viewportWidth / (2 * canvasScale)) - clickedContentX;
        const newContentOffsetY = (viewportHeight / (2 * canvasScale)) - clickedContentY;

        onMinimapClick({ x: newContentOffsetX, y: newContentOffsetY });
    };

    // Calculate viewport rectangle position and size on the minimap
    // Viewport top-left in content coordinates:
    const viewTopLeftInContentX = -canvasOffset.x;
    const viewTopLeftInContentY = -canvasOffset.y;
    // Viewport dimensions in content coordinates:
    const viewWidthInContent = viewportWidth / canvasScale;
    const viewHeightInContent = viewportHeight / canvasScale;

    // Viewport rectangle in minimap pixel coordinates:
    const minimapViewRectX = (viewTopLeftInContentX - minX) * minimapScale;
    const minimapViewRectY = (viewTopLeftInContentY - minY) * minimapScale;
    const minimapViewRectW = viewWidthInContent * minimapScale;
    const minimapViewRectH = viewHeightInContent * minimapScale;

    return (
        <div
            ref={minimapRef}
            style={{
                width: MINIMAP_WIDTH,
                height: MINIMAP_HEIGHT,
                backgroundColor: "var(--minimap-bg, hsla(var(--card)/0.8))", // Slightly transparent card
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                userSelect: "none",
            }}
            onMouseDown={handleMinimapInteraction} // Allow dragging later by changing this
        >
            {/* Render nodes scaled to minimap */}
            {nodes.map(node => (
                <div
                    key={`minimap-${node.id}`}
                    style={{
                        position: 'absolute',
                        left: (node.position.x - minX) * minimapScale,
                        top: (node.position.y - minY) * minimapScale,
                        width: Math.max(1, nodeWidth * minimapScale), // Ensure min 1px width
                        height: Math.max(1, nodeHeight * minimapScale), // Ensure min 1px height
                        backgroundColor: MINIMAP_NODE_COLOR,
                    }}
                />
            ))}
            {/* Render viewport rectangle */}
            <div
                style={{
                    position: 'absolute',
                    left: minimapViewRectX,
                    top: minimapViewRectY,
                    width: minimapViewRectW,
                    height: minimapViewRectH,
                    border: `1px solid ${MINIMAP_VIEWPORT_BORDER_COLOR}`,
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    pointerEvents: 'none', // Important: let clicks pass to the parent for navigation
                }}
            />
        </div>
    );
};