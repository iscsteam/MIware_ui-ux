//node-modal.tsx
"use client"
import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useWorkflow } from "./workflow-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GripVertical, ArrowRight } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Link2, Unlink } from "lucide-react"

// Import all node property components (keeping existing imports)
import CreateFileNodeProperties from "@/components/node-properties/Fileoperations/CreateFileNodeProperties"
import CopyFileNodeProperties from "@/components/node-properties/Fileoperations/CopyFileNodeProperties"
import ReadFileNodeProperties from "@/components/node-properties/Fileoperations/ReadFileNodeProperties"
import DeleteFileNodeProperties from "@/components/node-properties/Fileoperations/deletefilenodeproperties"
import ListFilesNodeProperties from "@/components/node-properties/listfilesnodeproperties"
import PollerFileNodeProperties from "@/components/node-properties/pollerfilenodeproperties"
import WriteFileNodeProperties from "@/components/node-properties/Fileoperations/WriteFileNodeProperties"
import ParseXMLNodeProperties from "../node-properties/ParseXMLNodeProperties"
import RenderXMLNodeProperties from "../node-properties/RenderXMLNodeProperties"
import TransformXMLNodeProperties from "../node-properties/TransformXMLNodeProperties"
import ParseJSONNodeProperties from "../node-properties/ParseJSONNodeProperties"
import RenderJSONNodeProperties from "../node-properties/RenderJSONNodeProperties"
import TransformJSONNodeProperties from "../node-properties/TransformJSONNodeProperties"
import HTTPReceiverNodeProperties from "../node-properties/HTTPreceiverNodeProperties"
import HTTPSendRequestNodeProperties from "../node-properties/HTTPsendrequestNodeProperties"
import FileNodeProperties from "../node-properties/FileNodeProperties"
import HTTPSendResponseNodeProperties from "../node-properties/HTTPsendresponseNodeProperties"
import ParsedDataNodeProperties from "../node-properties/ParsedataNodeProperties"
import RenderDataNodeProperties from "../node-properties/RenderdataNodeProperties"
import RenameFileNodeProperties from "@/components/node-properties/Fileoperations/RenameFileNodeProperties"
import MoveFileNodeProperties from "@/components/node-properties/Fileoperations/MoveFileNodeProperties"
import DatabaseNodeProperties from "@/components/node-properties/Database/database-node-properties"
import FilterNodeProperties from "../node-properties/Fileoperations/FilterNodeproperties"
import SalesforceCloudNodeProperties from "@/components/node-properties/Salesforce/salesforce-cloud-node-properties"
import SalesforceWriteNodeProperties from "@/components/node-properties/Salesforce/salesforce-write-node-properties"
import SourceNodeProperties from "../node-properties/Database/sourcenodeproperties"
import InlineInputNodeProperties from "@/components/node-properties/inline-operations/inline-input-node-properties"
import InlineOutputNodeProperties from "@/components/node-properties/inline-operations/inline-output-node-properties"
import ReadNodeProperties from "@/components/node-properties/ReadNodeProperties"
import SchedulerNodeProperties from "@/components/node-properties/SchedulerNodeProperties"

import WriteNodeProperties, { writeNodeSchema } from "@/components/node-properties/Fileoperations/write-node-properties"

const NodePropertyComponents: Record<string, React.FC<any>> = {
  "create-file": CreateFileNodeProperties,
  "read-file": ReadFileNodeProperties,
  "copy-file": CopyFileNodeProperties,
  "rename-file": RenameFileNodeProperties,
  "delete-file": DeleteFileNodeProperties,
  "list-files": ListFilesNodeProperties,
  "file-poller": PollerFileNodeProperties,
  "write-file": WriteFileNodeProperties,
 "write-node": WriteNodeProperties,

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
  scheduler: SchedulerNodeProperties,
}

// Updated field definitions with separated end_after fields for scheduler
const NODE_FIELD_DEFINITIONS: Record<string, Array<{ name: string; type: string; description: string }>> = {
  "copy-file": [
    { name: "source_path", type: "string", description: "Source file path to copy from" },
    { name: "destination_path", type: "string", description: "Destination file path to copy to" },
    { name: "overwrite", type: "boolean", description: "Overwrite if file exists" },
    { name: "includeSubDirectories", type: "boolean", description: "Include subdirectories" },
    { name: "createNonExistingDirs", type: "boolean", description: "Create non-existing directories" },
  ],
  "move-file": [
    { name: "source_path", type: "string", description: "Source file path to move from" },
    { name: "destination_path", type: "string", description: "Destination file path to move to" },
    { name: "overwrite", type: "boolean", description: "Overwrite if file exists" },
  ],
  "rename-file": [
    { name: "source_path", type: "string", description: "Source file path to rename" },
    { name: "destination_path", type: "string", description: "New file name/path" },
    { name: "overwrite", type: "boolean", description: "Overwrite if file exists" },
  ],
  "delete-file": [
    { name: "source_path", type: "string", description: "File path to delete" },
    { name: "recursive", type: "boolean", description: "Delete recursively" },
  ],
  "read-file": [
    { name: "input_path", type: "string", description: "File path to read" },
    { name: "limit", type: "number", description: "Limit number of records" },
    { name: "pretty", type: "boolean", description: "Pretty format output" },
  ],
  "write-file": [
    { name: "output_path", type: "string", description: "File path to write to" },
    { name: "content", type: "string", description: "Content to write" },
    { name: "overwrite", type: "boolean", description: "Overwrite if file exists" },
  ],
  "read-node": [
    { name: "input_path", type: "string", description: "Input file path" },
    { name: "limit", type: "number", description: "Limit number of records" },
    { name: "pretty", type: "boolean", description: "Pretty format output" },
  ],
  database: [
    { name: "connection_string", type: "string", description: "Database connection string" },
    { name: "query", type: "string", description: "SQL query to execute" },
    { name: "table_name", type: "string", description: "Target table name" },
  ],
  scheduler: [
    { name: "dag_id_to_trigger", type: "string", description: "DAG ID to trigger when scheduler runs" },
    { name: "start_time", type: "string", description: "Start time in YYYY-MM-DD HH:mm:ss format" },
    { name: "run_once", type: "boolean", description: "Whether to run only once" },
    { name: "time_interval", type: "number", description: "Time interval between runs" },
    { name: "interval_unit", type: "string", description: "Unit for time interval (Minute, Hour, Day)" },
    { name: "end_after_type", type: "string", description: "End condition type (always 'Occurrences')" },
    { name: "end_after_value", type: "number", description: "Number of occurrences after which to end" },
  ],
}

interface NodeModalProps {
  nodeId: string
  isOpen: boolean
  onClose: () => void
}

interface PreviousNodeOutput {
  nodeId: string
  nodeName: string
  nodeType: string
  outputs: Array<{
    name: string
    type: string
    description: string
    value: any
    displayValue: string
  }>
}

interface DraggedField {
  sourceNodeId: string
  sourceNodeName: string
  fieldName: string
  fieldType: string
  fieldValue: any
  displayValue: string
}

// Enhanced Draggable Field Component
const DraggableField: React.FC<{
  nodeId: string
  nodeName: string
  field: {
    name: string
    type: string
    description: string
    value: any
    displayValue: string
  }
}> = ({ nodeId, nodeName, field }) => {
  const handleDragStart = (e: React.DragEvent) => {
    const dragData: DraggedField = {
      sourceNodeId: nodeId,
      sourceNodeName: nodeName,
      fieldName: field.name,
      fieldType: field.type,
      fieldValue: field.value,
      displayValue: field.displayValue,
    }

    e.dataTransfer.setData("application/json", JSON.stringify(dragData))
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-md cursor-grab hover:border-blue-300 hover:shadow-sm transition-all active:cursor-grabbing"
    >
      <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-blue-600 truncate">{field.name}</span>
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {field.type}
          </Badge>
        </div>
        {field.description && <p className="text-xs text-gray-500 truncate mb-2">{field.description}</p>}
        <div className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-200">
          <span className="font-medium text-gray-600">Value: </span>
          <span className="text-gray-800 font-mono">{field.displayValue}</span>
        </div>
      </div>
    </div>
  )
}

// Enhanced Configuration Field Component with Drop Zone
const ConfigurationFieldWithDrop: React.FC<{
  name: string
  value: any
  type: string
  description?: string
  onChange: (name: string, value: any) => void
  onDrop: (fieldName: string, draggedField: DraggedField) => void
  mappedFrom?: string
}> = ({ name, value, type, description, onChange, onDrop, mappedFrom }) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    try {
      const draggedData = JSON.parse(e.dataTransfer.getData("application/json"))
      onDrop(name, draggedData)
    } catch (error) {
      console.error("Error parsing dropped data:", error)
    }
  }

  const handleUnlink = () => {
    onChange(name, "")
  }

  const renderInput = () => {
    switch (type) {
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Switch checked={!!value} onCheckedChange={(checked) => onChange(name, checked)} />
            <Label>{value ? "True" : "False"}</Label>
          </div>
        )
      case "number":
      case "integer":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(name, Number(e.target.value))}
            placeholder={`Enter ${name}`}
          />
        )
      default:
        return (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={`Enter ${name}`}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{name}</Label>
        {mappedFrom && (
          <div className="flex items-center space-x-1">
            <Badge variant="secondary" className="text-xs">
              <Link2 className="w-3 h-3 mr-1" />
              {mappedFrom}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleUnlink} className="h-6 w-6 p-0">
              <Unlink className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      <div
        className={`relative border-2 border-dashed rounded-md p-2 transition-colors ${
          isDragOver ? "border-blue-500 bg-blue-50" : mappedFrom ? "border-green-300 bg-green-50" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {renderInput()}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-100 bg-opacity-75 rounded-md">
            <span className="text-blue-600 font-medium">Drop field here</span>
          </div>
        )}
      </div>

      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  )
}

// Configuration Section Component
const ConfigurationSection: React.FC<{
  nodeType: string
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
  onFieldDrop: (fieldName: string, draggedField: DraggedField) => void
  fieldMappings: Record<string, string>
}> = ({ nodeType, formData, onChange, onFieldDrop, fieldMappings }) => {
  const nodeFields = NODE_FIELD_DEFINITIONS[nodeType] || []
  const NodePropsComponent = NodePropertyComponents[nodeType]

  if (nodeFields.length === 0 && !NodePropsComponent) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="text-gray-400 text-2xl mb-2">⚙️</div>
          <div className="italic text-sm text-gray-500">No configuration available for this node type.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Schema-based fields with drop zones */}
      {nodeFields.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <span>Configuration Fields</span>
            <Badge variant="outline" className="ml-2 text-xs">
              Drop fields from Input section
            </Badge>
          </div>
          {nodeFields.map((field, index) => (
            <ConfigurationFieldWithDrop
              key={`${field.name}-${index}`}
              name={field.name}
              value={formData[field.name]}
              type={field.type}
              description={field.description}
              onChange={onChange}
              onDrop={onFieldDrop}
              mappedFrom={fieldMappings[field.name]}
            />
          ))}
        </div>
      )}

      {/* Original component properties as fallback */}
      {NodePropsComponent && nodeFields.length === 0 && (
        <div className="border-t pt-4">
          <div className="text-sm font-medium text-gray-700 mb-3">Advanced Configuration</div>
          <NodePropsComponent formData={formData} onChange={onChange} />
        </div>
      )}

      {/* Show field mappings */}
      {Object.keys(fieldMappings).length > 0 && (
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-800 mb-2">Active Field Mappings:</div>
          <div className="space-y-1">
            {Object.entries(fieldMappings).map(([field, mapping]) => (
              <div key={field} className="flex items-center text-xs">
                <Badge variant="outline" className="mr-2">
                  {field}
                </Badge>
                <ArrowRight className="w-3 h-3 mx-1 text-blue-500" />
                <span className="text-blue-600">{mapping}</span>
                <span className="ml-2 text-gray-500">= {formData[field]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
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
      <code className="text-gray-300" dangerouslySetInnerHTML={{ __html: highlightJson(jsonString) }} />
    </pre>
  )
}

export function NodeModal({ nodeId, isOpen, onClose }: NodeModalProps) {
  const { getNodeById, updateNode, nodes, connections } = useWorkflow()
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({})

  const containerRef = useRef<HTMLDivElement>(null)
  const leftResizerRef = useRef<HTMLDivElement>(null)
  const rightResizerRef = useRef<HTMLDivElement>(null)

  const [leftWidth, setLeftWidth] = useState(33.33)
  const [rightWidth, setRightWidth] = useState(33.33)

  const node = getNodeById(nodeId)

  // Helper function to extract actual values from node data
  const extractNodeValues = useCallback(
    (sourceNode: any): Array<{ name: string; type: string; description: string; value: any; displayValue: string }> => {
      const nodeFields = NODE_FIELD_DEFINITIONS[sourceNode.type] || []

      return nodeFields.map((field) => {
        const value = sourceNode.data?.[field.name]
        let displayValue = "No value"

        if (value !== undefined && value !== null) {
          if (typeof value === "boolean") {
            displayValue = value ? "true" : "false"
          } else if (typeof value === "object") {
            displayValue = JSON.stringify(value, null, 2)
          } else {
            displayValue = String(value)
          }
        }

        return {
          name: field.name,
          type: field.type,
          description: field.description,
          value: value,
          displayValue: displayValue,
        }
      })
    },
    [],
  )

  // Get all previous nodes' outputs with actual values
  const previousNodesOutputs = useMemo((): PreviousNodeOutput[] => {
    if (!node) return []

    const previousOutputs: PreviousNodeOutput[] = []
    const visited = new Set<string>()

    const traverseUpstream = (currentNodeId: string) => {
      if (visited.has(currentNodeId)) return
      visited.add(currentNodeId)

      const incomingConnections = connections.filter((conn) => conn.targetId === currentNodeId)

      for (const connection of incomingConnections) {
        const sourceNode = nodes.find((n) => n.id === connection.sourceId)
        if (sourceNode) {
          const outputs = extractNodeValues(sourceNode)

          previousOutputs.push({
            nodeId: sourceNode.id,
            nodeName: sourceNode.data?.label || sourceNode.type,
            nodeType: sourceNode.type,
            outputs,
          })

          // Continue traversing upstream
          traverseUpstream(sourceNode.id)
        }
      }
    }

    traverseUpstream(nodeId)
    return previousOutputs
  }, [node, nodes, connections, nodeId, extractNodeValues])

  // Calculate current node output based on configuration
  const currentNodeOutput = useMemo(() => {
    if (!node) return {}

    const output: Record<string, any> = {}
    const nodeFields = NODE_FIELD_DEFINITIONS[node.type] || []

    // Copy all current form data to output
    nodeFields.forEach((field) => {
      const value = formData[field.name]
      if (value !== undefined) {
        output[field.name] = value
      }
    })

    // For scheduler node, construct end_after object from separate fields
    if (node.type === "scheduler") {
      if (formData.end_after_type || formData.end_after_value) {
        output.end_after = {
          type: formData.end_after_type || "Occurrences",
          value: formData.end_after_value || undefined,
        }
      }
    }

    return output
  }, [node, formData])

  useEffect(() => {
    if (node) {
      setFormData((prev) => ({
        ...prev,
        ...node.data,
      }))

      // Load existing field mappings
      const mappings: Record<string, string> = {}
      Object.keys(node.data || {}).forEach((key) => {
        const value = node.data?.[key]
        if (typeof value === "string" && value.startsWith("{{") && value.endsWith("}}")) {
          mappings[key] = value.slice(2, -2) // Remove {{ }}
        }
      })
      setFieldMappings(mappings)
    }
  }, [nodeId, node])

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Remove mapping when user manually changes value
    if (fieldMappings[name]) {
      setFieldMappings((prev) => {
        const newMappings = { ...prev }
        delete newMappings[name]
        return newMappings
      })
    }
  }

  const handleFieldDrop = (fieldName: string, draggedField: DraggedField) => {
    const mappingValue = `${draggedField.sourceNodeName}.${draggedField.fieldName}`

    // Use the actual value instead of template string
    const actualValue = draggedField.fieldValue !== undefined ? draggedField.fieldValue : draggedField.displayValue

    setFormData((prev) => ({ ...prev, [fieldName]: actualValue }))
    setFieldMappings((prev) => ({ ...prev, [fieldName]: mappingValue }))
  }

  const handleSave = () => {
    // For scheduler node, ensure end_after object is properly constructed
    if (node?.type === "scheduler") {
      const updatedData = { ...formData }

      // Construct end_after object from separate fields
      if (formData.end_after_type || formData.end_after_value) {
        updatedData.end_after = {
          type: formData.end_after_type || "Occurrences",
          value: formData.end_after_value || undefined,
        }
      }

      updateNode(nodeId, { data: updatedData })
    } else {
      updateNode(nodeId, { data: formData })
    }
    onClose()
  }

  // Column resize logic (same as original)
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
    if (node.type === "write-salesforce") return "Salesforce Write"
    if (node.type === "inline-input") return "Inline Input"
    if (node.type === "inline-output") return "Inline Output"
    return (
      node.data?.label ||
      node.type
        .split("-")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ")
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[95vw] p-0 overflow-hidden max-h-[95vh] flex flex-col bg-gray-50">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-white shadow-sm">
          <DialogTitle className="text-lg font-semibold text-gray-800">{getNodeTitle()}</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Configure node properties and dynamic field mappings</p>
        </DialogHeader>

        {/* Body with resizable columns */}
        <div ref={containerRef} className="flex flex-1 overflow-hidden h-full">
          {/* Input Section - Previous Nodes with Values */}
          <div className="bg-white border-r border-gray-200 flex flex-col" style={{ width: `${leftWidth}%` }}>
            <div className="px-4 py-3 font-medium text-sm bg-slate-700 text-white flex items-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
              INPUT - PREVIOUS NODES ({previousNodesOutputs.length})
            </div>
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              {previousNodesOutputs.length > 0 ? (
                <div className="space-y-4">
                  {previousNodesOutputs.map((prevNode) => (
                    <Card key={prevNode.nodeId} className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-800 flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {prevNode.nodeType}
                          </Badge>
                          {prevNode.nodeName}
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {prevNode.outputs.length} fields
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {prevNode.outputs.map((output, idx) => (
                            <DraggableField
                              key={`${prevNode.nodeId}-${output.name}-${idx}`}
                              nodeId={prevNode.nodeId}
                              nodeName={prevNode.nodeName}
                              field={output}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="text-gray-400 text-2xl mb-2">📝</div>
                    <div className="text-sm text-gray-500 italic">No previous nodes found</div>
                    <p className="text-xs text-gray-400 mt-1">Connect nodes to see their outputs here</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Resizer Left */}
          <div
            ref={leftResizerRef}
            className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors relative group"
          >
            <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20"></div>
          </div>

          {/* Configuration Section - Advanced Configuration Only */}
          <div className="flex flex-col border-r border-gray-200" style={{ width: `${100 - leftWidth - rightWidth}%` }}>
            <div className="px-4 py-3 font-medium text-sm bg-slate-700 text-white flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
              CONFIGURATION - DRAG & DROP ENABLED
            </div>
            <ScrollArea className="p-4 flex-1 bg-white">
              <ConfigurationSection
                nodeType={node.type}
                formData={formData}
                onChange={handleChange}
                onFieldDrop={handleFieldDrop}
                fieldMappings={fieldMappings}
              />
            </ScrollArea>
          </div>

          {/* Resizer Right */}
          <div
            ref={rightResizerRef}
            className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors relative group"
          >
            <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20"></div>
          </div>

          {/* Output Section - Current Node Output */}
          <div className="bg-white flex flex-col" style={{ width: `${rightWidth}%` }}>
            <div className="px-4 py-3 font-medium text-sm bg-slate-700 text-white flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              OUTPUT - CURRENT NODE
            </div>
            <ScrollArea className="p-4 flex-1 bg-gray-50">
              <div className="space-y-4">
                {/* Current Node Output Values */}
                {Object.keys(currentNodeOutput).length > 0 ? (
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-1 h-4 bg-green-500 mr-2"></div>
                      <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                        CURRENT OUTPUT VALUES
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(currentNodeOutput).map(([key, value]) => (
                        <div key={key} className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-green-600">{key}</span>
                            <Badge variant="outline" className="text-xs">
                              {typeof value}
                            </Badge>
                          </div>
                          <div className="text-xs bg-green-50 p-2 rounded border-l-2 border-green-300">
                            <span className="font-mono text-green-800">
                              {typeof value === "boolean"
                                ? value
                                  ? "true"
                                  : "false"
                                : typeof value === "object"
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="text-gray-400 text-2xl mb-2">📤</div>
                      <div className="text-sm text-gray-500 italic">Configure fields to see output values</div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 p-4 border-t bg-white">
          <div className="text-sm text-gray-500">
            {Object.keys(fieldMappings).length > 0 && <span>{Object.keys(fieldMappings).length} field(s) mapped</span>}
            {Object.keys(currentNodeOutput).length > 0 && (
              <span className="ml-4">{Object.keys(currentNodeOutput).length} output(s) configured</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="px-6 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} className="px-6 bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
