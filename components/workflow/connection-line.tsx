"use client"
import type React from "react";
import { useState } from "react";
import type { WorkflowNode, NodeConnection } from "./workflow-context";
import { Plus, Trash } from "lucide-react";

interface ConnectionLineProps {
  connection: NodeConnection;
  sourceNode: WorkflowNode;
  targetNode: WorkflowNode;
  onDelete: () => void;
  onInsertNode: (
    connection: NodeConnection,
    position: { x: number; y: number }
  ) => void;
}

export function ConnectionLine({
  connection,
  sourceNode,
  targetNode,
  onDelete,
  onInsertNode,
}: ConnectionLineProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sourceX = sourceNode.position.x + 100;
  const sourceY = sourceNode.position.y + 50;

  const targetX = targetNode.position.x;
  const targetY = targetNode.position.y + 50;

  const controlPointOffset = 60;
  const sourceControlX = sourceX + controlPointOffset;
  const targetControlX = targetX - controlPointOffset;

  const path = `M ${sourceX} ${sourceY} C ${sourceControlX} ${sourceY}, ${targetControlX} ${targetY}, ${targetX} ${targetY}`;

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  const getConnectionColor = () => {
    if (sourceNode.status === "error" || targetNode.status === "error") {
      return "#ef4444";
    } else if (
      sourceNode.status === "running" ||
      targetNode.status === "running"
    ) {
      return "#eab308";
    } else if (
      sourceNode.status === "success" &&
      targetNode.status === "success"
    ) {
      return "#22c55e";
    } else {
      return "#22c55e";
    }
  };

  const handleInsertNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const insertPosition = {
      x: (sourceNode.position.x + targetNode.position.x) / 2 - 50,
      y: (sourceNode.position.y + targetNode.position.y) / 2 - 50,
    };
    onInsertNode(connection, insertPosition);
  };

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ pointerEvents: "visiblePainted" }} // Ensures hover detection
    >
      {/* Main Bezier path */}
      {/* <path d={path} stroke={getConnectionColor()} strokeWidth="2" fill="none" /> */}
      <path
        d={path}
        stroke={getConnectionColor()}
        strokeWidth="2"
        strokeDasharray="6 2"
        fill="none"
        className="connection-line"
      />

      {/* Invisible hitbox path */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="15"
        fill="none"
        className="cursor-pointer"
        style={{ pointerEvents: "stroke" }}
      />

      {/* Buttons shown on hover */}
      {isHovered && (
        <g className="connection-buttons" style={{ pointerEvents: "auto" }}>
          {/* Insert Button */}
          <foreignObject
            x={midX - 10}
            y={midY - 10}
            width={20}
            height={20}
            onClick={handleInsertNode}
            style={{ cursor: "pointer" }}
          >
            <div className="w-full h-full bg-green-100 border border-green-300 rounded flex items-center justify-center">
              <Plus size={14} className="text-green-700" />
            </div>
          </foreignObject>

          {/* Delete Button */}
          <foreignObject
            x={midX + 15}
            y={midY - 10}
            width={20}
            height={20}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{ cursor: "pointer" }}
          >
            <div className="w-full h-full bg-red-100 border border-red-300 rounded flex items-center justify-center">
              <Trash size={14} className="text-red-700" />
            </div>
          </foreignObject>
        </g>
      )}
    </g>
  );
}
