//node-component.tsx
"use client";
import type React from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { Play, Power, Trash2, MoreHorizontal } from "lucide-react";
import { type WorkflowNode, useWorkflow } from "./workflow-context";
import { getNodeIcon } from "./node-utils";
import { Button } from "@/components/ui/button";
import {Tooltip,TooltipContent,TooltipProvider,TooltipTrigger,} from "@/components/ui/tooltip";

interface NodeComponentProps {
  node: WorkflowNode;
  selected: boolean;
  onSelect: () => void;
  onDragStart: (nodeId: string, e: React.MouseEvent) => void;
  onExecuteNode: (nodeId: string) => void;
}

export function NodeComponent({
  node,
  selected,
  onSelect,
  onDragStart,
  onExecuteNode,
}: NodeComponentProps) {
  const {
    removeNode,
    pendingConnection,
    setPendingConnection,
    addConnection,
    updateNode,
    nodes,
    connections,
  } = useWorkflow();

  const [isExpanded, setIsExpanded] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Get status color
  const getStatusColor = () => {
    switch (node.status) {
      case "running":
        return "bg-yellow-500";
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  // Handle output port click - start connection
  const handleOutputPortClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingConnection({ sourceId: node.id });
  };

  // Handle input port click - complete connection if there's a pending one
  const handleInputPortClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (pendingConnection) {
      // Don't connect to self
      if (pendingConnection.sourceId !== node.id) {
        addConnection(pendingConnection.sourceId, node.id);
      }
      setPendingConnection(null);
    }
  };

  // Handle node deactivation with auto-rerouting
  const handleDeactivateNode = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Toggle the active state
    const isCurrentlyActive = node.data?.active !== false;
    updateNode(node.id, {
      data: {
        ...node.data,
        active: !isCurrentlyActive,
      },
    });

    // If deactivating, auto-reroute connections
    if (isCurrentlyActive) {
      // Find incoming connections to this node
      const incomingConnections = connections.filter(
        (conn) => conn.targetId === node.id
      );

      // Find outgoing connections from this node
      const outgoingConnections = connections.filter(
        (conn) => conn.sourceId === node.id
      );

      // For each incoming connection, connect it to each outgoing connection's target
      incomingConnections.forEach((incoming) => {
        outgoingConnections.forEach((outgoing) => {
          addConnection(incoming.sourceId, outgoing.targetId);
        });
      });
    }
  };

  // Handle node deletion with auto-rerouting
  const handleDeleteWithRerouting = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Find incoming connections to this node
    const incomingConnections = connections.filter(
      (conn) => conn.targetId === node.id
    );

    // Find outgoing connections from this node
    const outgoingConnections = connections.filter(
      (conn) => conn.sourceId === node.id
    );

    // For each incoming connection, connect it to each outgoing connection's target
    incomingConnections.forEach((incoming) => {
      outgoingConnections.forEach((outgoing) => {
        addConnection(incoming.sourceId, outgoing.targetId);
      });
    });

    // Now remove the node
    removeNode(node.id);
  };

  // Get node label from type
  const getNodeLabel = () => {
    return node.type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getNodeBackgroundColor = () => {
    if (node.type === "start") return "bg-green-500";
    if (node.type === "end") return "bg-red-400";
    return "bg-white";
  };

  return (
    <div
      className="absolute group"
      style={{ left: node.position.x, top: node.position.y }}
    >
      {/* Node action buttons - only visible on hover */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-[100px] flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex bg-gray-200 rounded-md shadow-lg">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="node-action h-8 w-8 rounded-l-md bg-gray-200 hover:bg-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExecuteNode(node.id);
                  }}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Execute node</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="node-action h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  onClick={handleDeactivateNode}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {node.data?.active === false
                  ? "Activate node"
                  : "Deactivate node"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="node-action h-8 w-8 bg-gray-200 hover:bg-gray-300"
                  onClick={handleDeleteWithRerouting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete node</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="node-action h-8 w-8 rounded-r-md bg-gray-200 hover:bg-gray-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>More options</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Node body */}
      <div
        ref={nodeRef}
        className={`flex flex-col rounded-md border ${
          selected ? "border-green-500" : "border-gray-300"
        } ${getNodeBackgroundColor()} shadow-2xl transition-all w-[100px] h-[100px] ${
          pendingConnection && pendingConnection.sourceId === node.id
            ? "border-blue-500"
            : ""
        } ${node.data?.active === false ? "opacity-50" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onMouseDown={(e) => {
          const target = e.target as HTMLElement;
          if (
            e.button === 0 &&
            !target.closest(".port") &&
            !target.closest(".node-action")
          ) {
            onDragStart(node.id, e);
          }
        }}
      >
        <div className="flex flex-1 flex-col items-center justify-center p-2">
          <div className="flex h-12 w-12 items-center justify-center text-zinc-600">
            {getNodeIcon(node.type)}
          </div>
          {node.status !== "idle" && (
            <div className="absolute top-2 right-2">
              {node.status === "success" && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {node.status === "error" && (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              {node.status === "running" && (
                <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
              )}
            </div>
          )}
        </div>
        <div className="text-center text-black text-sm pb-1 pt-1">
          {node.data?.label || getNodeLabel()}
        </div>
      </div>

      {/* Output port */}
      {node.type !== "end" && (
        <div
          className={`port absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 translate-x-1/2 cursor-pointer rounded-full border-2 border-background bg-gray-400 hover:bg-primary hover:scale-110 transition-transform ${
            pendingConnection && pendingConnection.sourceId === node.id
              ? "ring-2 ring-blue-500 scale-125 bg-primary"
              : ""
          }`}
          onClick={handleOutputPortClick}
          title="Click to start connection"
          style={{ top: "50px" }}
        />
      )}

      {/* Input port */}
      {node.type !== "start" && (
        <div
          className={`port absolute left-0 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full border-2 border-background bg-gray-400 hover:bg-primary hover:scale-110 transition-transform ${
            pendingConnection && pendingConnection.sourceId !== node.id
              ? "ring-2 ring-blue-500 animate-pulse"
              : ""
          }`}
          onClick={handleInputPortClick}
          title={
            pendingConnection ? "Click to complete connection" : "Input port"
          }
          style={{ top: "50px" }}
        />
      )}
    </div>
  );
}
