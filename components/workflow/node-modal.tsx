"use client";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useWorkflow } from "./workflow-context";
import { Button } from "@/components/ui/button";
import { WorkflowNodeData } from "@/services/interface";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateFileNodeProperties, {
  createFileSchema,
} from "@/components/node-properties/Fileoperations/CreateFileNodeProperties";
import CopyFileNodeProperties, {
  copyFileSchema,
} from "@/components/node-properties/Fileoperations/CopyFileNodeProperties";
import ReadFileNodeProperties, {
  readFileSchema,
} from "@/components/node-properties/Fileoperations/ReadFileNodeProperties";
import DeleteFileNodeProperties, {
  deleteFileSchema,
} from "@/components/node-properties/Fileoperations/deletefilenodeproperties";
import ListFilesNodeProperties, {
  listFilesSchema,
} from "@/components/node-properties/listfilesnodeproperties";
import PollerFileNodeProperties, {
  filePollerSchema,
} from "@/components/node-properties/pollerfilenodeproperties";
import WriteFileNodeProperties, {
  writeFileSchema,
} from "@/components/node-properties/Fileoperations/WriteFileNodeProperties";
import ParseXMLNodeProperties, {
  parseXMLSchema,
} from "../node-properties/ParseXMLNodeProperties";
import RenderXMLNodeProperties, {
  renderXMLSchema,
} from "../node-properties/RenderXMLNodeProperties";
import TransformXMLNodeProperties, {
  transformXMLSchema,
} from "../node-properties/TransformXMLNodeProperties";
import ParseJSONNodeProperties, {
  parseJSONSchema,
} from "../node-properties/ParseJSONNodeProperties";
import RenderJSONNodeProperties, {
  renderJSONSchema,
} from "../node-properties/RenderJSONNodeProperties";
import TransformJSONNodeProperties, {
  transformJSONSchema,
} from "../node-properties/TransformJSONNodeProperties";
import HTTPReceiverNodeProperties, {
  httpReceiverSchema,
} from "../node-properties/HTTPreceiverNodeProperties";
import HTTPSendRequestNodeProperties, {
  httpSendRequestSchema,
} from "../node-properties/HTTPsendrequestNodeProperties";
import FileNodeProperties, {
  fileNodeSchema,
} from "../node-properties/FileNodeProperties";
import HTTPSendResponseNodeProperties, {
  httpSendResponseSchema,
} from "../node-properties/HTTPsendresponseNodeProperties";
import ParsedDataNodeProperties, {
  parseDataSchema,
} from "../node-properties/ParsedataNodeProperties";
import RenderDataNodeProperties, {
  renderDataSchema,
} from "../node-properties/RenderdataNodeProperties";
import RenameFileNodeProperties, {
  renameFileSchema,
} from "@/components/node-properties/Fileoperations/RenameFileNodeProperties";
import MoveFileNodeProperties, {
  moveFileSchema,
} from "@/components/node-properties/Fileoperations/MoveFileNodeProperties";
import DatabaseNodeProperties, {
  databaseSchema,
} from "@/components/node-properties/Database/database-node-properties";
import FilterNodeProperties, {
  filterSchema,
} from "../node-properties/Fileoperations/FilterNodeproperties";
import SalesforceCloudNodeProperties, {
  salesforceCloudSchema,
} from "@/components/node-properties/Salesforce/salesforce-cloud-node-properties";
import SalesforceWriteNodeProperties, {
  salesforceCloudWriteSchema,
} from "@/components/node-properties/Salesforce/salesforce-write-node-properties";
import SourceNodeProperties, {
  sourceSchema,
} from "../node-properties/Database/sourcenodeproperties";
import InlineInputNodeProperties, {
  inlineInputSchema,
} from "@/components/node-properties/inline-operations/inline-input-node-properties";
import InlineOutputNodeProperties, {
  inlineOutputSchema,
} from "@/components/node-properties/inline-operations/inline-output-node-properties";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import ReadNodeProperties, {
  readNodeSchema,
} from "@/components/node-properties/ReadNodeProperties";

// import {WorkflowNodeData} from "@/services/interface"

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
  "transform-xml": TransformXMLNodeProperties,
  "json-parse": ParseJSONNodeProperties,
  "json-render": RenderJSONNodeProperties,
  "transform-json": TransformJSONNodeProperties,
  "http-receiver": HTTPReceiverNodeProperties,
  "send-http-response": HTTPSendResponseNodeProperties,
  "send-http-request": HTTPSendRequestNodeProperties,
  database: DatabaseNodeProperties,
  "salesforce-cloud": SalesforceCloudNodeProperties,
  "write-salesforce": SalesforceWriteNodeProperties,
  source: SourceNodeProperties,
  file: FileNodeProperties,
  "parse-data": ParsedDataNodeProperties,
  "render-data": RenderDataNodeProperties,
  "move-file": MoveFileNodeProperties,
  filter: FilterNodeProperties,
  "inline-input": InlineInputNodeProperties,
  "inline-output": InlineOutputNodeProperties,
  "read-node": ReadNodeProperties,
};

// Component-specific schemas
const componentSchemas: Record<string, any> = {
  "read-file": readFileSchema,
  "write-file": writeFileSchema,
  "delete-file": deleteFileSchema,
  "create-file": createFileSchema,
  "copy-file": copyFileSchema,
  "rename-file": renameFileSchema,
  "list-files": listFilesSchema,
  "file-poller": filePollerSchema,
  "xml-parser": parseXMLSchema,
  "xml-render": renderXMLSchema,
  "transform-xml": transformXMLSchema,
  "json-parse": parseJSONSchema,
  "json-render": renderJSONSchema,
  "transform-json": transformJSONSchema,
  "http-receiver": httpReceiverSchema,
  "send-http-request": httpSendRequestSchema,
  file: fileNodeSchema,
  database: databaseSchema,
  "salesforce-cloud": salesforceCloudSchema, // Schema for Salesforce Read (Query)
  "read-node": readNodeSchema, // Schema for Read Node
  // NEW: Add Salesforce Write schema to the schemas map
  "write-salesforce": salesforceCloudWriteSchema,
  source: sourceSchema,
  "send-http-response": httpSendResponseSchema,
  "parse-data": parseDataSchema,
  "render-data": renderDataSchema,
  "move-file": moveFileSchema,
  filter: filterSchema,
  "inline-input": inlineInputSchema,
  "inline-output": inlineOutputSchema,
};

interface NodeModalProps {
  nodeId: string;
  isOpen: boolean;
  onClose: () => void;
}

// JSON Syntax Highlighter Component
const JsonHighlighter: React.FC<{ jsonString: string }> = ({ jsonString }) => {
  const highlightJson = (str: string) => {
    return str
      .replace(/"([^"]+)":/g, '<span class="text-blue-400 font-medium">"$1"</span>:')
      .replace(/:\s*"([^"]+)"/g, ': <span class="text-green-400">"$1"</span>')
      .replace(/:\s*(\d+)/g, ': <span class="text-purple-400">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="text-orange-400">$1</span>')
      .replace(/:\s*(null)/g, ': <span class="text-gray-400">$1</span>')
  }

  return (
    <pre className="text-sm leading-relaxed">
      <code 
        className="text-gray-300"
        dangerouslySetInnerHTML={{ __html: highlightJson(jsonString) }}
      />
    </pre>
  )
}

export function NodeModal({ nodeId, isOpen, onClose }: NodeModalProps) {
  const { getNodeById, updateNode } = useWorkflow()
  const [formData, setFormData] = useState<Record<string, any>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const leftResizerRef = useRef<HTMLDivElement>(null)
  const rightResizerRef = useRef<HTMLDivElement>(null)

  const [leftWidth, setLeftWidth] = useState(33.33)
  const [rightWidth, setRightWidth] = useState(33.33)

  const node = getNodeById(nodeId)

  // Get schema from component-specific schema if available, otherwise fall back to node-schemas.tsx
  const nodeSchema = node ? componentSchemas[node.type] : undefined

  const NodePropsComponent = node ? NodePropertyComponents[node.type] : undefined

  useEffect(() => {
    if (node) {
      setFormData((prev) => ({
        ...prev,
        ...node.data,
      }))
    }
  }, [nodeId, node])

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  
  // const handleSave = () => {
  //    console.log("1. [NodeModal] Saving data:", { nodeId, formData });
  //   updateNode(nodeId, { data: formData })

  //   onClose()
  // }

  // Column resize logic
  

  const handleSave = () => {
  if (!node) return;

  const originalData = node.data || {};
  const currentMappings = originalData.inputMappings || {};
  const newMappings = { ...currentMappings };
  const dataToSave = { ...formData };

  let mappingsChanged = false;

  // Detect fields with existing mappings and check if user manually changed them
  for (const key in currentMappings) {
    if (
      Object.prototype.hasOwnProperty.call(dataToSave, key) &&
      dataToSave[key] !== originalData[key]
    ) {
      console.log(`[NodeModal] Field '${key}' manually edited. Removing mapping.`);
      delete newMappings[key];
      mappingsChanged = true;
    }
  }

  // If any mappings were updated, persist them
  if (mappingsChanged) {
    dataToSave.inputMappings = newMappings;
  }

  console.log("[NodeModal] Saving data with mapping check:", { nodeId, dataToSave });
  updateNode(nodeId, { data: dataToSave });
  onClose();
};

  
  useEffect(() => {
    const container = containerRef.current
    const leftResizer = leftResizerRef.current
    const rightResizer = rightResizerRef.current

    let startX = 0
    let startLeft = 0
    let startRight = 0
    let resizingLeft = false
    let resizingRight = false

    const onMouseDown = (e: MouseEvent, side: "left" | "right") => {
      e.preventDefault()
      startX = e.clientX
      const totalWidth = container?.getBoundingClientRect().width || 1
      startLeft = leftWidth
      startRight = rightWidth

      resizingLeft = side === "left"
      resizingRight = side === "right"

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!container) return
      const deltaX = e.clientX - startX
      const containerWidth = container.getBoundingClientRect().width

      if (resizingLeft) {
        const newLeft = Math.max(10, Math.min(50, startLeft + (deltaX / containerWidth) * 100))
        const center = 100 - newLeft - rightWidth
        if (center >= 20) setLeftWidth(newLeft)
      } else if (resizingRight) {
        const newRight = Math.max(10, Math.min(50, startRight - (deltaX / containerWidth) * 100))
        const center = 100 - leftWidth - newRight
        if (center >= 20) setRightWidth(newRight)
      }
    }

    const onMouseUp = () => {
      resizingLeft = false
      resizingRight = false
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    leftResizer?.addEventListener("mousedown", (e) => onMouseDown(e, "left"))
    rightResizer?.addEventListener("mousedown", (e) => onMouseDown(e, "right"))

    return () => {
      leftResizer?.removeEventListener("mousedown", (e) => onMouseDown(e, "left"))
      rightResizer?.removeEventListener("mousedown", (e) => onMouseDown(e, "right"))
    }
  }, [leftWidth, rightWidth])

  if (!node) return null

  const getNodeTitle = () => {
    // For "write-salesforce", convert to "Salesforce Write"
    if (node.type === "write-salesforce") {
      return "Salesforce Write"
    }
    // For inline operations
    if (node.type === "inline-input") {
      return "Inline Input"
    }
    if (node.type === "inline-output") {
      return "Inline Output"
    }
    // Existing logic for other node types
    return (
      node.data?.label ||
      node.type
        .split("-")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ")
    )
  }

  const renderParameterTooltip = (param: any) => {
    return (
      <TooltipContent className="max-w-[300px] p-3 bg-gray-800 border-gray-700">
        <div className="space-y-2">
          <p className="font-medium text-white">{param.name}</p>
          <p className="text-sm text-gray-300">{param.description}</p>
          <div className="flex space-x-2 text-xs">
            <span className="bg-gray-700 text-gray-200 px-2 py-1 rounded">{param.datatype}</span>
            {param.required && <span className="bg-red-500 text-white px-2 py-1 rounded">Required</span>}
          </div>
        </div>
      </TooltipContent>
    )
  }

  // Create JSON representation of schema parameters for display
  const createSchemaJson = (schemaParams: any[]) => {
    if (!schemaParams || !schemaParams.length) return "{}"

    const schemaObj: Record<string, any> = {}
    schemaParams.forEach((param) => {
      // Set default value based on datatype
      let defaultValue: any = null
      switch (param.datatype) {
        case "string":
          defaultValue = param.required ? "required" : ""
          break
        case "integer":
        case "number":
          defaultValue = 0
          break
        case "boolean":
          defaultValue = false
          break
        case "complex":
          defaultValue = {}
          break
        case "array": // Handle array types
          defaultValue = []
          break
        default:
          defaultValue = null
      }

      schemaObj[param.name] = defaultValue
    })

    return JSON.stringify(schemaObj, null, 2)
  }
  // Special function to render ReadNode response in output section
  const renderReadNodeOutput = () => {
    if (node?.type !== "read-node" || !formData.lastResponse) {
      return null;
    }

    const response = formData.lastResponse;

    return (
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
        <h4 className="font-medium text-gray-900 mb-2">Last Response</h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={response.success ? "text-green-600" : "text-red-600"}
            >
              {response.success ? "Success" : "Failed"}
            </span>
          </div>

          {response.success && (
            <>
              <div>
                <span className="font-medium">File Path:</span>{" "}
                <span className="text-blue-600 break-all">
                  {response.file_path}
                </span>
              </div>
              <div>
                <span className="font-medium">File Type:</span>{" "}
                <span className="text-purple-600">{response.file_type}</span>
              </div>
              <div>
                <span className="font-medium">Record Count:</span>{" "}
                <span className="text-orange-600">{response.record_count}</span>
                {response.limit && (
                  <span className="text-gray-500 ml-1">
                    (limit: {response.limit})
                  </span>
                )}
              </div>
              <div>
                <span className="font-medium">Content Preview:</span>
                <div className="mt-1 p-3 bg-white border rounded-lg">
                  <div
                    className="max-h-80 overflow-y-auto custom-scrollbar"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "#cbd5e1 #f1f5f9",
                    }}
                  >
                    <pre className="text-xs whitespace-pre-wrap break-words font-mono leading-relaxed">
                      {response.content}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          )}

          {!response.success && response.error_message && (
            <div>
              <span className="font-medium">Error:</span>{" "}
              <span className="text-red-600 break-words">
                {response.error_message}
              </span>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <span className="font-medium">Timestamp:</span>{" "}
            {new Date(response.timestamp).toLocaleString()}
          </div>
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
            border: 1px solid #f1f5f9;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }

          .custom-scrollbar::-webkit-scrollbar-corner {
            background: #f1f5f9;
          }
        `}</style>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[90vw] p-0 overflow-hidden max-h-[90vh] flex flex-col bg-gray-50">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-white shadow-sm">
          <DialogTitle className="text-lg font-semibold text-gray-800">{getNodeTitle()}</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Configure node properties and parameters</p>
        </DialogHeader>

        {/* Body with resizable columns */}
        <div ref={containerRef} className="flex flex-1 overflow-hidden h-full">
          {/* Input */}
          <div className="bg-white border-r border-gray-200 flex flex-col" style={{ width: `${leftWidth}%` }}>
            <div className="px-4 py-3 font-medium text-sm bg-slate-700 text-white flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
              INPUT
            </div>
            <div className="overflow-y-auto p-4 flex-1 bg-gray-50">
              {nodeSchema?.inputSchema?.length ? (
                <div className="space-y-4">
                  {/* Schema Preview */}
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-1 h-4 bg-orange-500 mr-2"></div>
                      <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                        SCHEMA PREVIEW
                      </h3>
                    </div>
                    <div className="rounded-lg bg-gray-900 p-4 overflow-auto">
                      <JsonHighlighter jsonString={createSchemaJson(nodeSchema.inputSchema)} />
                    </div>
                  </div>

                  {/* Parameters */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-1 h-4 bg-orange-500 mr-2"></div>
                      <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                        Parameters
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {nodeSchema.inputSchema.map((param, index) => {
                        const value = formData[param.name]
                        return (
                          <TooltipProvider key={index}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="bg-white p-3 rounded-lg border border-gray-200 cursor-help hover:border-gray-300 transition-colors">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center">
                                      <span className="text-blue-600 font-mono text-sm font-medium">
                                        {param.name}
                                      </span>
                                      {param.required && <span className="text-red-500 ml-1 text-xs">*</span>}
                                    </div>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      {param.datatype}
                                    </span>
                                  </div>
                                  {value !== undefined && (
                                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-2 border-l-2 border-orange-300">
                                      {typeof value === "object" && value !== null
                                        ? JSON.stringify(value, null, 2)
                                        : String(value)}
                                    </div>
                                  )}
                                </div>
                              </TooltipTrigger>
                              {renderParameterTooltip(param)}
                            </Tooltip>
                          </TooltipProvider>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="text-gray-400 text-2xl mb-2">📝</div>
                    <div className="text-sm text-gray-500 italic">No input parameters</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resizer Left */}
          <div 
            ref={leftResizerRef} 
            className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors relative group"
          >
            <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20"></div>
          </div>

          {/* Configuration */}
          <div className="flex flex-col border-r border-gray-200" style={{ width: `${100 - leftWidth - rightWidth}%` }}>
            <div className="px-4 py-3 font-medium text-sm bg-slate-700 text-white flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
              CONFIGURATION
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-white">
              {NodePropsComponent ? (
                <div className="space-y-4">
                  <NodePropsComponent formData={formData} onChange={handleChange} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="text-gray-400 text-2xl mb-2">⚙️</div>
                    <div className="italic text-sm text-gray-500">No configuration for this node type.</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resizer Right */}
          <div 
            ref={rightResizerRef} 
            className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors relative group"
          >
            <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20"></div>
          </div>

          {/* Output */}
          <div className="bg-white flex flex-col" style={{ width: `${rightWidth}%` }}>
            <div className="px-4 py-3 font-medium text-sm bg-slate-700 text-white flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              OUTPUT
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
              {nodeSchema?.outputSchema?.length ? (
                <div className="space-y-4">
                  {/* Schema Preview */}
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-1 h-4 bg-orange-500 mr-2"></div>
                      <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                        SCHEMA PREVIEW
                      </h3>
                    </div>
                    <div className="rounded-lg bg-gray-900 p-4 overflow-auto">
                      <JsonHighlighter jsonString={createSchemaJson(nodeSchema.outputSchema)} />
                    </div>
                  </div>

                  {/* Parameters */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-1 h-4 bg-orange-500 mr-2"></div>
                      <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">
                        Parameters
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {nodeSchema.outputSchema.map((param, index) => (
                        <TooltipProvider key={index}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="bg-white p-3 rounded-lg border border-gray-200 cursor-help hover:border-gray-300 transition-colors">
                                <div className="flex items-center justify-between">
                                  <span className="text-blue-600 font-mono text-sm font-medium">
                                    {param.name}
                                  </span>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {param.datatype}
                                  </span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            {renderParameterTooltip(param)}
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="text-gray-400 text-2xl mb-2">📤</div>
                    <div className="text-sm text-gray-500 italic">No output parameters</div>
                  </div>
                </div>
              )}
              {/* Special ReadNode response display */}
              {renderReadNodeOutput()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-white">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-6"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="px-6 bg-blue-600 hover:bg-blue-700"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
