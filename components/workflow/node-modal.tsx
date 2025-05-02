
"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { useWorkflow } from "./workflow-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import CreateFileNodeProperties from "@/components/node-properties/CreateFileNodeProperties"
import CopyFileNodeProperties from "@/components/node-properties/CopyFileNodeProperties"
import ReadFileNodeProperties from "@/components/node-properties/ReadFileNodeProperties"
import DeleteFileNodeProperties from "@/components/node-properties/deletefilenodeproperties"
import ListFilesNodeProperties from "@/components/node-properties/listfilesnodeproperties"
import PollerFileNodeProperties from "@/components/node-properties/pollerfilenodeproperties"
import WriteFileNodeProperties from "../node-properties/WriteFileNodeProperties"
import ParseXMLNodeProperties from "../node-properties/ParseXMLNodeProperties"
import { getNodeSchema } from "./node-schemas"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const NodePropertyComponents: Record<string, React.FC<any>> = {
  "create-file": CreateFileNodeProperties,
  "read-file": ReadFileNodeProperties,
  "copy-file": CopyFileNodeProperties,
  "delete-file": DeleteFileNodeProperties,
  "list-files": ListFilesNodeProperties,
  "file-poller": PollerFileNodeProperties,
  "write-file": WriteFileNodeProperties,
  "xml-parser": ParseXMLNodeProperties,
}

interface NodeModalProps {
  nodeId: string
  isOpen: boolean
  onClose: () => void
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
  const nodeSchema = node ? getNodeSchema(node.type) : undefined
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

  const handleSave = () => {
    updateNode(nodeId, { data: formData })
    onClose()
  }

  // Column resize logic
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
      <DialogContent className="sm:max-w-[90vw] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="p-4 border-b flex justify-between items-center">
          <DialogTitle>{getNodeTitle()}</DialogTitle>  
        </DialogHeader>

        {/* Body with resizable columns */}
        <div ref={containerRef} className="flex flex-1 overflow-hidden h-full">
          {/* Input */}
          <div className="bg-white border-r flex flex-col" style={{ width: `${leftWidth}%` }}>
            <div className="px-4 py-2 font-medium text-sm border-b bg-white">INPUT</div>
            <div className="overflow-y-auto p-4 flex-1">
              {nodeSchema?.inputSchema?.length ? (
                nodeSchema.inputSchema.map((param, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center mb-2">
                          <div className="bg-blue-500 text-white rounded-md p-1 mr-2">#</div>
                          <div className="text-sm">{param.name}</div>
                          {param.required && <span className="text-red-500 ml-1">*</span>}
                        </div>
                      </TooltipTrigger>
                    </Tooltip>
                  </TooltipProvider>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic">No input parameters</div>
              )}
            </div>
          </div>

          {/* Resizer Left */}
          <div ref={leftResizerRef} className="w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize" />

          {/* Configuration */}
          <div className="flex flex-col border-r" style={{ width: `${100 - leftWidth - rightWidth}%` }}>
            <div className="px-4 py-2 font-medium text-sm border-b bg-white">CONFIGURATION</div>
            <div className="p-4 overflow-y-auto flex-1">
              {NodePropsComponent ? (
                <NodePropsComponent formData={formData} onChange={handleChange} />
              ) : (
                <div className="italic text-sm text-gray-500">No configuration for this node type.</div>
              )}
            </div>
          </div>

          {/* Resizer Right */}
          <div ref={rightResizerRef} className="w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize" />

          {/* Output */}
          <div className="bg-white flex flex-col" style={{ width: `${rightWidth}%` }}>
            <div className="px-4 py-2 font-medium text-sm border-b bg-white">OUTPUT</div>
            <div className="p-4 overflow-y-auto flex-1">
              {nodeSchema?.outputSchema?.length ? (
                nodeSchema.outputSchema.map((param, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center mb-2">
                          <div className="bg-blue-500 text-white rounded-md p-1 mr-2">#</div>
                          <div className="text-sm">{param.name}</div>
                        </div>
                      </TooltipTrigger>
                    </Tooltip>
                  </TooltipProvider>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic">No output parameters</div>
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
  )
}
