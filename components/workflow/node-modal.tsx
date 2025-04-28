//node-modal.tsx
"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Code, ArrowRight, Play, Loader2 } from "lucide-react"
import { useWorkflow } from "./workflow-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import CreateFileNodeProperties from "@/components/node-properties/CreateFileNodeProperties"
import CopyFileNodeProperties from "@/components/node-properties/CopyFileNodeProperties"
import ReadFileNodeProperties from "@/components/node-properties/ReadFileNodeProperties"

const NodePropertyComponents: Record<string, React.FC<any>> = {
  "create-file": CreateFileNodeProperties,
  "read-file": ReadFileNodeProperties,
  "copy-file": CopyFileNodeProperties,
  // …add your others here
}

interface NodeModalProps {
  nodeId: string
  isOpen: boolean
  onClose: () => void
}

export function NodeModal({ nodeId, isOpen, onClose }: NodeModalProps) {
  const { getNodeById, updateNode, connections, nodes, executeNode } = useWorkflow()
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState<"parameters" | "settings">("parameters")
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [inputFormat, setInputFormat] = useState<"schema" | "json" | "table">("schema")
  const [outputFormat, setOutputFormat] = useState<"schema" | "json" | "table">("schema")
  const node = getNodeById(nodeId)

  useEffect(() => {
    if (node) {
      // Get dynamic input data from upstream nodes
      const dynamicInputs = getDynamicInputData()

      // Merge dynamic inputs with existing form data
      setFormData((prev) => ({
        ...prev,
        ...node.data,
        ...dynamicInputs,
      }))
    }
  }, [nodeId, node, connections, nodes])

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    updateNode(nodeId, { data: formData })
    onClose()
  }

  const handleRun = async () => {
    setIsExecuting(true)
    await updateNode(nodeId, { data: formData })
    const res = await executeNode(nodeId)
    setExecutionResult(res)
    setIsExecuting(false)
  }

  // Get all upstream nodes that connect to this node (directly or indirectly)
  const getAllUpstreamNodes = (nodeId: string, visited = new Set<string>()): string[] => {
    if (visited.has(nodeId)) return []
    visited.add(nodeId)

    const directInputs = connections.filter((conn) => conn.targetId === nodeId).map((conn) => conn.sourceId)

    const allUpstream = [...directInputs]

    // Recursively get upstream nodes for each direct input
    for (const inputId of directInputs) {
      const upstreamOfInput = getAllUpstreamNodes(inputId, visited)
      allUpstream.push(...upstreamOfInput)
    }

    return [...new Set(allUpstream)] // Remove duplicates
  }

  // Get node inputs - find all connections where this node is the target
  const getNodeInputs = (nodeId: string) => {
    if (!nodeId) return []

    const inputConnections = connections.filter((conn) => conn.targetId === nodeId)

    return inputConnections.map((conn) => {
      const sourceNode = nodes.find((n) => n.id === conn.sourceId)
      return {
        sourceNodeId: conn.sourceId,
        sourceNodeLabel: sourceNode?.data?.label || sourceNode?.type || "Unknown",
        data: sourceNode?.output || {},
        status: sourceNode?.status || "idle",
      }
    })
  }

  // Get all upstream node outputs that might be relevant to this node
  const getAllUpstreamOutputs = (nodeId: string) => {
    const upstreamNodeIds = getAllUpstreamNodes(nodeId)

    return upstreamNodeIds.map((id) => {
      const node = nodes.find((n) => n.id === id)
      return {
        sourceNodeId: id,
        sourceNodeLabel: node?.data?.label || node?.type || "Unknown",
        data: node?.output || {},
        status: node?.status || "idle",
      }
    })
  }

  // Get node output
  const getNodeOutput = (nodeId: string) => {
    if (!nodeId) return null

    const node = nodes.find((n) => n.id === nodeId)
    return node?.output || null
  }

  // Add this function after getAllUpstreamOutputs
  const getDynamicInputData = () => {
    // Get all upstream nodes that might provide input
    const upstreamNodes = getAllUpstreamOutputs(nodeId)

    // If there are no upstream nodes, return default data
    if (upstreamNodes.length === 0) {
      return {}
    }

    // Combine all upstream node outputs into a single object
    const combinedData = {}
    upstreamNodes.forEach((node) => {
      if (node.data && typeof node.data === "object") {
        Object.entries(node.data).forEach(([key, value]) => {
          combinedData[key] = value
        })
      }
    })

    return combinedData
  }

  const nodeInputs = nodeId ? getNodeInputs(nodeId) : []
  const allUpstreamOutputs = nodeId ? getAllUpstreamOutputs(nodeId) : []
  const nodeOutput = nodeId ? getNodeOutput(nodeId) : null

  const renderInputsByFormat = () => {
    // If no inputs, show the empty state message
    if (nodeInputs.length === 0 && allUpstreamOutputs.length === 0) {
      return (
        <div className="text-sm text-muted-foreground italic p-4 border border-dashed rounded text-center">
          No input data available. Connect this node to an output node.
        </div>
      )
    }

    // Combine direct and indirect inputs for display
    const allInputs = [
      ...nodeInputs,
      ...allUpstreamOutputs.filter(
        (upstream) => !nodeInputs.some((direct) => direct.sourceNodeId === upstream.sourceNodeId),
      ),
    ]

    switch (inputFormat) {
      case "schema":
        return (
          <div className="space-y-2">
            {allInputs.map((input, index) => (
              <div key={index} className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-gray-200 p-1 rounded">
                    {input.sourceNodeLabel === "On form submission" ? (
                      <span className="flex items-center">
                        <span className="inline-block w-5 h-5 bg-blue-500 text-white flex items-center justify-center rounded mr-2 text-xs">
                          ⚡
                        </span>
                        {input.sourceNodeLabel}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <span className="inline-block w-5 h-5 bg-blue-500 text-white flex items-center justify-center rounded mr-2 text-xs">
                          📋
                        </span>
                        {input.sourceNodeLabel}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">1 item</div>
                </div>
                <div className="space-y-1">
                  {Object.entries(input.data || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center bg-gray-100 rounded">
                      <div className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l flex items-center">
                        <span className="text-xs mr-1">A</span>
                        {key}
                      </div>
                      <div className="px-2 py-1 text-gray-700 text-sm">
                        {typeof value === "string" ? value : JSON.stringify(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )

      case "table":
        return (
          <div className="space-y-4">
            {allInputs.map((input, index) => {
              const data = input.data || {}
              const keys = Object.keys(data)

              return (
                <div key={index} className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-gray-200 p-1 rounded">
                      {input.sourceNodeLabel === "On form submission" ? (
                        <span className="flex items-center">
                          <span className="inline-block w-5 h-5 bg-blue-500 text-white flex items-center justify-center rounded mr-2 text-xs">
                            ⚡
                          </span>
                          {input.sourceNodeLabel}
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <span className="inline-block w-5 h-5 bg-blue-500 text-white flex items-center justify-center rounded mr-2 text-xs">
                            📋
                          </span>
                          {input.sourceNodeLabel}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">1 item</div>
                  </div>

                  {keys.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            {keys.map((key) => (
                              <th key={key} className="p-1 text-left border border-gray-200">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {keys.map((key) => (
                              <td key={key} className="p-1 border border-gray-200 truncate max-w-[150px]">
                                {typeof data[key] === "object"
                                  ? JSON.stringify(data[key]).substring(0, 50) +
                                    (JSON.stringify(data[key]).length > 50 ? "..." : "")
                                  : String(data[key])}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="italic text-muted-foreground text-center p-2">No data available</div>
                  )}
                </div>
              )
            })}
          </div>
        )

      case "json":
      default:
        return (
          <div className="space-y-2">
            {allInputs.map((input, index) => (
              <div key={index} className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-gray-200 p-1 rounded">
                    {input.sourceNodeLabel === "On form submission" ? (
                      <span className="flex items-center">
                        <span className="inline-block w-5 h-5 bg-blue-500 text-white flex items-center justify-center rounded mr-2 text-xs">
                          ⚡
                        </span>
                        {input.sourceNodeLabel}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <span className="inline-block w-5 h-5 bg-blue-500 text-white flex items-center justify-center rounded mr-2 text-xs">
                          📋
                        </span>
                        {input.sourceNodeLabel}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">1 item</div>
                </div>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40 text-gray-800">
                  {JSON.stringify(
                    [
                      {
                        ...input.data,
                      },
                    ],
                    null,
                    2,
                  )}
                </pre>
              </div>
            ))}
          </div>
        )
    }
  }

  const renderOutput = () => {
    const output = executionResult || nodeOutput

    if (!output) {
      return (
        <div className="text-sm text-muted-foreground italic p-4 border border-dashed rounded text-center">
          Execute this node to view output data or set mock data.
        </div>
      )
    }

    const outputData = Array.isArray(output) ? output : [output]

    switch (outputFormat) {
      case "schema":
        return (
          <div className="space-y-1">
            {outputData.map((item, index) => (
              <div key={index} className="space-y-1">
                {Object.entries(item || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center bg-gray-100 rounded">
                    <div className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l flex items-center">
                      <span className="text-xs mr-1">A</span>
                      {key}
                    </div>
                    <div className="px-2 py-1 text-gray-700 text-sm">
                      {typeof value === "string" ? value : JSON.stringify(value)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )

      case "table":
        if (outputData.length === 0 || !outputData[0]) return <div>No data</div>

        const keys = Object.keys(outputData[0])

        return (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {keys.map((key) => (
                    <th key={key} className="p-1 text-left border border-gray-200">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outputData.map((item, idx) => (
                  <tr key={idx}>
                    {keys.map((key) => (
                      <td key={key} className="p-1 border border-gray-200 truncate max-w-[150px]">
                        {typeof item[key] === "object"
                          ? JSON.stringify(item[key]).substring(0, 50) +
                            (JSON.stringify(item[key]).length > 50 ? "..." : "")
                          : String(item[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case "json":
      default:
        return (
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-[350px] text-gray-800">
            {JSON.stringify(outputData, null, 2)}
          </pre>
        )
    }
  }

  if (!node) return null
  const NodePropsComponent = NodePropertyComponents[node.type]

  const getNodeIcon = () =>
    node.type === "code" ? <Code className="h-5 w-5 mr-2" /> : <ArrowRight className="h-5 w-5 mr-2" />

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center">
            {getNodeIcon()}
            {node.type
              .split("-")
              .map((w) => w[0].toUpperCase() + w.slice(1))
              .join(" ")}
            <Button size="sm" onClick={handleRun} disabled={isExecuting} className="absolute top-2 right-12 text-xs">
              {isExecuting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </>
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 h-[500px]">
          {/* INPUT column */}
          <div className="border-r overflow-hidden flex flex-col bg-white">
            <div className="px-4 py-2 font-medium text-sm border-b flex items-center justify-between">
              <div className="uppercase text-gray-600">INPUT</div>
              <div className="flex items-center">
              </div>
            </div>

            {/* Format selection tabs */}
            <div className="border-b">
              <div className="flex bg-gray-100">
                <button
                  className={`px-3 py-2 text-xs font-medium ${inputFormat === "schema" ? "bg-gray-800 text-white" : "hover:bg-gray-200"}`}
                  onClick={() => setInputFormat("schema")}
                >
                  Schema
                </button>
                <button
                  className={`px-3 py-2 text-xs font-medium ${inputFormat === "table" ? "bg-gray-800 text-white" : "hover:bg-gray-200"}`}
                  onClick={() => setInputFormat("table")}
                >
                  Table
                </button>
                <button
                  className={`px-3 py-2 text-xs font-medium ${inputFormat === "json" ? "bg-gray-800 text-white" : "hover:bg-gray-200"}`}
                  onClick={() => setInputFormat("json")}
                >
                  JSON
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-4 flex-1">{renderInputsByFormat()}</div>
          </div>

          {/* PARAMETERS & SETTINGS column */}
          <div className="border-r flex flex-col">
            <Tabs
              value={activeTab}
              onValueChange={(val: string) => {
                if (val === "parameters" || val === "settings") {
                  setActiveTab(val)
                }
              }}
              className="flex flex-col h-full"
            >
              <TabsList className="grid grid-cols-2 bg-background border-b">
                <TabsTrigger value="parameters">Parameters</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <div className="p-4 overflow-y-auto flex-1">
                <TabsContent value="parameters">
                  {NodePropsComponent ? (
                    <NodePropsComponent formData={formData} onChange={handleChange} />
                  ) : (
                    <div className="italic text-sm text-muted-foreground">No parameters for this node type.</div>
                  )}
                </TabsContent>

                <TabsContent value="settings">
                  {/* your settings panel (active switch, description textarea) */}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* OUTPUT column */}
          <div className="flex flex-col bg-white">
            <div className="px-4 py-2 font-medium text-sm border-b flex items-center justify-between">
              <div className="uppercase text-gray-600 flex items-center">
                OUTPUT
              </div>
              <div className="flex items-center">
              </div>
            </div>

            {/* Format selection tabs */}
            <div className="border-b">
              <div className="flex bg-gray-100">
                <button
                  className={`px-3 py-2 text-xs font-medium ${outputFormat === "table" ? "bg-gray-800 text-white" : "hover:bg-gray-200"}`}
                  onClick={() => setOutputFormat("table")}
                >
                  Table
                </button>
                <button
                  className={`px-3 py-2 text-xs font-medium ${outputFormat === "json" ? "bg-gray-800 text-white" : "hover:bg-gray-200"}`}
                  onClick={() => setOutputFormat("json")}
                >
                  JSON
                </button>
                <button
                  className={`px-3 py-2 text-xs font-medium ${outputFormat === "schema" ? "bg-gray-800 text-white" : "hover:bg-gray-200"}`}
                  onClick={() => setOutputFormat("schema")}
                >
                  Schema
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <div className="text-xs text-gray-500 mb-2">1 item</div>
              {renderOutput()}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
