// // //node-modal.tsx
"use client";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useWorkflow } from "./workflow-context";
import { Button } from "@/components/ui/button";
import {Dialog,DialogContent,DialogHeader,DialogTitle,} from "@/components/ui/dialog";
import CreateFileNodeProperties,{createFileSchema} from "@/components/node-properties/Fileoperations/CreateFileNodeProperties";
import CopyFileNodeProperties, {copyFileSchema} from "@/components/node-properties/Fileoperations/CopyFileNodeProperties";
import ReadFileNodeProperties, {readFileSchema} from "@/components/node-properties/Fileoperations/ReadFileNodeProperties";
import DeleteFileNodeProperties,{deleteFileSchema} from "@/components/node-properties/Fileoperations/deletefilenodeproperties";
import ListFilesNodeProperties,{ listFilesSchema} from "@/components/node-properties/listfilesnodeproperties";
import PollerFileNodeProperties, {filePollerSchema} from "@/components/node-properties/pollerfilenodeproperties";
import WriteFileNodeProperties,{writeFileSchema} from "@/components/node-properties/Fileoperations/WriteFileNodeProperties";
import ParseXMLNodeProperties,{parseXMLSchema} from "../node-properties/ParseXMLNodeProperties";
import RenderXMLNodeProperties, {renderXMLSchema} from "../node-properties/RenderXMLNodeProperties";
import TransformXMLNodeProperties,{transformXMLSchema} from "../node-properties/TransformXMLNodeProperties";
import ParseJSONNodeProperties,{parseJSONSchema} from "../node-properties/ParseJSONNodeProperties";
import RenderJSONNodeProperties,{renderJSONSchema} from "../node-properties/RenderJSONNodeProperties";
import TransformJSONNodeProperties,{transformJSONSchema} from "../node-properties/TransformJSONNodeProperties";
import HTTPReceiverNodeProperties,{httpReceiverSchema} from "../node-properties/HTTPreceiverNodeProperties";
import HTTPSendRequestNodeProperties,{httpSendRequestSchema} from "../node-properties/HTTPsendrequestNodeProperties";
import FileNodeProperties,{fileNodeSchema} from "../node-properties/FileNodeProperties";
import HTTPSendResponseNodeProperties,{httpSendResponseSchema} from "../node-properties/HTTPsendresponseNodeProperties";
import ParsedDataNodeProperties,{parseDataSchema} from "../node-properties/ParsedataNodeProperties";
import RenderDataNodeProperties,{renderDataSchema} from "../node-properties/RenderdataNodeProperties";
import RenameFileNodeProperties,{renameFileSchema} from "@/components/node-properties/Fileoperations/RenameFileNodeProperties";
import MoveFileNodeProperties,{moveFileSchema} from "@/components/node-properties/Fileoperations/MoveFileNodeProperties";

import DatabaseNodeProperties,{databaseSchema} from  "@/components/node-properties/database-node-properties";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NodePropertyComponents: Record<string, React.FC<any>> = {
  "create-file": CreateFileNodeProperties,
  "read-file": ReadFileNodeProperties,
  "copy-file": CopyFileNodeProperties,
  "rename-file": RenameFileNodeProperties,
  "delete-file": DeleteFileNodeProperties,
  "list-files": ListFilesNodeProperties,
  "file-poller": PollerFileNodeProperties,
  "write-file": WriteFileNodeProperties,
  "xml-parser": ParseXMLNodeProperties,
  "xml-render": RenderXMLNodeProperties,
  "transform-xml":TransformXMLNodeProperties,
  "json-parse":ParseJSONNodeProperties,
  "json-render":RenderJSONNodeProperties,
  "transform-json":TransformJSONNodeProperties,
  "http-receiver": HTTPReceiverNodeProperties,
  "send-http-response": HTTPSendResponseNodeProperties,
  "send-http-request": HTTPSendRequestNodeProperties,
  "database": DatabaseNodeProperties,
  "file":FileNodeProperties,
  "parse-data": ParsedDataNodeProperties,
  "render-data": RenderDataNodeProperties,
  "move-file":MoveFileNodeProperties,
  "filter":FilterNodeProperties,
};

// Component-specific schemas - use these instead of getNodeSchema for these node types
const componentSchemas: Record<string, any> = {

  "read-file": readFileSchema,
  "write-file": writeFileSchema,
  "delete-file": deleteFileSchema,
  "create-file":createFileSchema,
  "copy-file": copyFileSchema,
  "rename-file": renameFileSchema,
  "list-files": listFilesSchema,
  "file-poller": filePollerSchema,
  "xml-parser":parseXMLSchema,
  "xml-render":renderXMLSchema,
  "transform-xml":transformXMLSchema,
  "json-parse":parseJSONSchema,
  "json-render":renderJSONSchema,
  "transform-json":transformJSONSchema,
  "http-receiver": httpReceiverSchema,
  "send-http-request": httpSendRequestSchema,
  "file":fileNodeSchema,
  "database":databaseSchema,
  "send-http-response": httpSendResponseSchema,
  "parse-data": parseDataSchema,
  "render-data": renderDataSchema,
  "move-file": moveFileSchema,
  "filter":filterSchema,

  // Add other component-specific schemas here as they're implemented
};

interface NodeModalProps {
  nodeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NodeModal({ nodeId, isOpen, onClose }: NodeModalProps) {
  const { getNodeById, updateNode } = useWorkflow();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const leftResizerRef = useRef<HTMLDivElement>(null);
  const rightResizerRef = useRef<HTMLDivElement>(null);

  const [leftWidth, setLeftWidth] = useState(33.33);
  const [rightWidth, setRightWidth] = useState(33.33);

  const node = getNodeById(nodeId);

  // Get schema from component-specific schema if available, otherwise fall back to node-schemas.tsx
  const nodeSchema = node
    ? componentSchemas[node.type]
    : undefined;

  const NodePropsComponent = node
    ? NodePropertyComponents[node.type]
    : undefined;

  useEffect(() => {
    if (node) {
      setFormData((prev) => ({
        ...prev,
        ...node.data,
      }));
    }
  }, [nodeId, node]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateNode(nodeId, { data: formData });
    onClose();
  };

  // Column resize logic
  useEffect(() => {
    const container = containerRef.current;
    const leftResizer = leftResizerRef.current;
    const rightResizer = rightResizerRef.current;

    let startX = 0;
    let startLeft = 0;
    let startRight = 0;
    let resizingLeft = false;
    let resizingRight = false;

    const onMouseDown = (e: MouseEvent, side: "left" | "right") => {
      e.preventDefault();
      startX = e.clientX;
      const totalWidth = container?.getBoundingClientRect().width || 1;
      startLeft = leftWidth;
      startRight = rightWidth;

      resizingLeft = side === "left";
      resizingRight = side === "right";

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const deltaX = e.clientX - startX;
      const containerWidth = container.getBoundingClientRect().width;

      if (resizingLeft) {
        const newLeft = Math.max(
          10,
          Math.min(50, startLeft + (deltaX / containerWidth) * 100)
        );
        const center = 100 - newLeft - rightWidth;
        if (center >= 20) setLeftWidth(newLeft);
      } else if (resizingRight) {
        const newRight = Math.max(
          10,
          Math.min(50, startRight - (deltaX / containerWidth) * 100)
        );
        const center = 100 - leftWidth - newRight;
        if (center >= 20) setRightWidth(newRight);
      }
    };

    const onMouseUp = () => {
      resizingLeft = false;
      resizingRight = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    leftResizer?.addEventListener("mousedown", (e) => onMouseDown(e, "left"));
    rightResizer?.addEventListener("mousedown", (e) => onMouseDown(e, "right"));

    return () => {
      leftResizer?.removeEventListener("mousedown", (e) =>
        onMouseDown(e, "left")
      );
      rightResizer?.removeEventListener("mousedown", (e) =>
        onMouseDown(e, "right")
      );
    };
  }, [leftWidth, rightWidth]);

  if (!node) return null;

  const getNodeTitle = () => {
    return (
      node.data?.label ||
      node.type
        .split("-")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ")
    );
  };

  const renderParameterTooltip = (param: any) => {
    return (
      <TooltipContent className="max-w-[300px] p-3">
        <div className="space-y-2">
          <p className="font-medium">{param.name}</p>
          <p className="text-sm text-gray-500">{param.description}</p>
          <div className="flex space-x-2 text-xs">
            <span className="bg-gray-100 px-2 py-1 rounded">
              {param.datatype}
            </span>
            {param.required && (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                Required
              </span>
            )}
          </div>
        </div>
      </TooltipContent>
    );
  };

  // Create JSON representation of schema parameters for display
  const createSchemaJson = (schemaParams: any[]) => {
    if (!schemaParams || !schemaParams.length) return "{}";

    const schemaObj: Record<string, any> = {};
    schemaParams.forEach((param) => {
      // Set default value based on datatype
      let defaultValue: any = null;
      switch (param.datatype) {
        case "string":
          defaultValue = param.required ? "required" : "";
          break;
        case "integer":
        case "number":
          defaultValue = 0;
          break;
        case "boolean":
          defaultValue = false;
          break;
        case "complex":
          defaultValue = {};
          break;
        default:
          defaultValue = null;
      }

      schemaObj[param.name] = defaultValue;
    });

    return JSON.stringify(schemaObj, null, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[90vw] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="p-4 border-b flex justify-between items-center">
          <DialogTitle>{getNodeTitle()}</DialogTitle>
        </DialogHeader>

        {/* Body with resizable columns */}
        <div ref={containerRef} className="flex flex-1 overflow-hidden h-full">
          {/* Input */}
          <div
            className="bg-white border-r flex flex-col"
            style={{ width: `${leftWidth}%` }}
          >
            <div className="px-4 py-2 font-medium text-sm border-b bg-white">
              INPUT
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              {nodeSchema?.inputSchema?.length ? (
                <div className="rounded bg-gray-50 p-4">
                  <pre className="text-xs overflow-auto">
                    <code>{createSchemaJson(nodeSchema.inputSchema)}</code>
                  </pre>
                  <div className="mt-3 space-y-2">
                    {/* {nodeSchema.inputSchema.map((param, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center text-sm cursor-help">
                              <span className="text-blue-600 font-mono">{param.name}</span>
                              {param.required && <span className="text-red-500 ml-1">*</span>}
                              <span className="text-gray-500 ml-2">({param.datatype})</span>
                            </div>
                          </TooltipTrigger>
                          {renderParameterTooltip(param)}
                        </Tooltip>
                      </TooltipProvider>
                    ))} */}

                    {nodeSchema.inputSchema.map((param, index) => {
                      const value = formData[param.name];

                      return (
                        <TooltipProvider key={index}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col cursor-help">
                                <div className="flex items-center text-sm">
                                  <span className="text-blue-600 font-mono">
                                    {param.name}
                                  </span>
                                  {param.required && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                  <span className="text-gray-500 ml-2">
                                    ({param.datatype})
                                  </span>
                                </div>
                                {value !== undefined && (
                                  <div className="text-xs text-gray-600 ml-1 pl-1 border-l border-gray-300">
                                    {typeof value === "object"
                                      ? JSON.stringify(value)
                                      : String(value)}
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            {renderParameterTooltip(param)}
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No input parameters
                </div>
              )}
            </div>
          </div>

          {/* Resizer Left */}
          <div
            ref={leftResizerRef}
            className="w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize"
          />

          {/* Configuration */}
          <div
            className="flex flex-col border-r"
            style={{ width: `${100 - leftWidth - rightWidth}%` }}
          >
            <div className="px-4 py-2 font-medium text-sm border-b bg-white">
              CONFIGURATION
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {NodePropsComponent ? (
                <NodePropsComponent
                  formData={formData}
                  onChange={handleChange}
                />
              ) : (
                <div className="italic text-sm text-gray-500">
                  No configuration for this node type.
                </div>
              )}
            </div>
          </div>

          {/* Resizer Right */}
          <div
            ref={rightResizerRef}
            className="w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize"
          />

          {/* Output */}
          <div
            className="bg-white flex flex-col"
            style={{ width: `${rightWidth}%` }}
          >
            <div className="px-4 py-2 font-medium text-sm border-b bg-white">
              OUTPUT
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {nodeSchema?.outputSchema?.length ? (
                <div className="rounded bg-gray-50 p-4">
                  <pre className="text-xs overflow-auto">
                    <code>{createSchemaJson(nodeSchema.outputSchema)}</code>
                  </pre>
                  <div className="mt-3 space-y-2">
                    {nodeSchema.outputSchema.map((param, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center text-sm cursor-help">
                              <span className="text-blue-600 font-mono">
                                {param.name}
                              </span>
                              <span className="text-gray-500 ml-2">
                                ({param.datatype})
                              </span>
                            </div>
                          </TooltipTrigger>
                          {renderParameterTooltip(param)}
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No output parameters
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-2 p-4 border-t shrink-0 bg-white">
          <Button className="w-full max-w-[200px]" onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
