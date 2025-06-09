// src/components/workflow/nodes/SalesforceWriteNodeProperties.tsx
"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useWorkflow } from "@/components/workflow/workflow-context"

export interface SchemaItem {
  name: string
  datatype: string
  description: string
  required?: boolean
}

export interface NodeSchema {
  inputSchema: SchemaItem[]
  outputSchema: SchemaItem[]
}

export const salesforceCloudWriteSchema: NodeSchema = {
  inputSchema: [
    { name: "object_name", datatype: "string", description: "Salesforce object/table name", required: true },
    { name: "file_path", datatype: "string", description: "Path to the file containing data", required: true },
    { name: "use_bulk_api", datatype: "boolean", description: "Use Salesforce Bulk API", required: false },
    { name: "bulk_batch_size", datatype: "integer", description: "Batch size (max 10000)", required: false },
  ],
  outputSchema: [
    { name: "records_processed", datatype: "integer", description: "Records successfully processed" },
    { name: "records_failed", datatype: "integer", description: "Records failed" },
    { name: "success", datatype: "boolean", description: "Success status" },
    { name: "error", datatype: "string", description: "Error message" },
    { name: "input_file_path", datatype: "string", description: "Input file path" },
    { name: "config_id", datatype: "integer", description: "Saved configuration ID" },
  ],
}

export interface SalesforceWriteNodeData {
  object_name: string
  file_path: string
  use_bulk_api?: boolean
  bulk_batch_size?: number
  config_id?: number
}

interface Props {
  formData: SalesforceWriteNodeData
  onChange: (name: keyof SalesforceWriteNodeData, value: any) => void
}

export default function SalesforceWriteNodeProperties({ formData, onChange }: Props) {
  const { nodes, connections, selectedNodeId, updateNode } = useWorkflow()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Auto-populate file_path from upstream ReadFileNode
  useEffect(() => {
    if (!selectedNodeId) return

    const incoming = connections.find(c => c.targetId === selectedNodeId)
    if (!incoming) return

    const sourceNode = nodes.find(n => n.id === incoming.sourceId)
    if (!sourceNode) return

    const upstreamPath =
      sourceNode.output?.fullName ||
      sourceNode.output?.path ||
      sourceNode.data?.file_path ||
      sourceNode.data?.path ||
      null

    if (upstreamPath && upstreamPath !== formData.file_path) {
      onChange("file_path", upstreamPath)
    }
  }, [nodes, connections, selectedNodeId])

  const getCurrentClientId = (): string | null => {
    try {
      if (typeof window === "undefined") return null
      const stored = localStorage.getItem("currentClient")
      const client = stored ? JSON.parse(stored) : null
      return client?.id ? String(client.id) : null
    } catch {
      return null
    }
  }

  const handleSaveConfiguration = async () => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const clientId = getCurrentClientId()
      if (!clientId) throw new Error("Client ID not found")

      const { object_name, file_path, use_bulk_api, bulk_batch_size } = formData
      if (!object_name.trim()) throw new Error("Object name is required.")
      if (!file_path.trim()) throw new Error("Input file path is required.")
      if (
        use_bulk_api &&
        (isNaN(bulk_batch_size!) || bulk_batch_size! < 1 || bulk_batch_size! > 10000)
      ) {
        throw new Error("Bulk batch size must be between 1 and 10000.")
      }

      const payload = {
        object_name: object_name.trim(),
        file_path: file_path.trim(),
        use_bulk_api: use_bulk_api ?? true,
        bulk_batch_size: use_bulk_api ? (bulk_batch_size ?? 2000) : undefined,
      }

      const response = await new Promise<{ id: number; message: string }>((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) {
            resolve({ id: formData.config_id || Date.now(), message: "Configuration saved!" })
          } else {
            reject(new Error("Simulated save failure."))
          }
        }, 800)
      })

      onChange("config_id", response.id)

      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "configured",
          data: { ...formData, ...payload, config_id: response.id },
          output: {
            config_ready: true,
            config_id: response.id,
            object_name: payload.object_name,
            input_file_path: payload.file_path,
            success: true,
            message: response.message,
          },
        })
      }

      setSuccessMessage(response.message)
    } catch (err: any) {
      setError(err.message || "Unexpected error")
      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "error",
          data: formData,
          output: { success: false, error: err.message },
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const isBulkInvalid =
    formData.use_bulk_api &&
    (isNaN(formData.bulk_batch_size!) ||
      formData.bulk_batch_size! < 1 ||
      formData.bulk_batch_size! > 10000)

  const isFormValid = (): boolean => {
    return (
      !!formData.object_name?.trim() &&
      !!formData.file_path?.trim() &&
      !(formData.use_bulk_api && isBulkInvalid)
    )
  }

  return (
    <div className="space-y-4">
      {formData.config_id && (
        <div>
          <Label htmlFor="config_id">Configuration ID</Label>
          <Input id="config_id" value={formData.config_id} readOnly className="bg-gray-100 cursor-not-allowed" />
        </div>
      )}

      <div>
        <Label htmlFor="object_name">Salesforce Object Name</Label>
        <Input
          id="object_name"
          value={formData.object_name || ""}
          placeholder="Account"
          onChange={e => onChange("object_name", e.target.value)}
          className={!formData.object_name?.trim() ? "border-orange-400" : ""}
        />
        {!formData.object_name?.trim() && <p className="text-xs text-orange-600">Required field</p>}
      </div>

      <div>
        <Label htmlFor="file_path">Input File Path</Label>
        <Input
          id="file_path"
          value={formData.file_path || ""}
          placeholder="(auto-filled from upstream Read node)"
          onChange={e => onChange("file_path", e.target.value)}
          className={!formData.file_path?.trim() ? "border-orange-400" : ""}
        />
        {!formData.file_path?.trim() && <p className="text-xs text-orange-600">Required field</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="use_bulk_api" checked={formData.use_bulk_api ?? true} onCheckedChange={val => onChange("use_bulk_api", val)} />
        <Label htmlFor="use_bulk_api">Use Bulk API</Label>
        <p className="text-xs text-gray-500 ml-2">(Recommended)</p>
      </div>

      {(formData.use_bulk_api ?? true) && (
        <div>
          <Label htmlFor="bulk_batch_size">Bulk Batch Size</Label>
          <Input
            id="bulk_batch_size"
            type="number"
            value={formData.bulk_batch_size ?? 2000}
            min={1}
            max={10000}
            onChange={e => onChange("bulk_batch_size", parseInt(e.target.value, 10))}
            className={isBulkInvalid ? "border-red-500" : ""}
          />
          <p className="text-xs text-gray-500">1–10000 records per batch</p>
          {isBulkInvalid && <p className="text-xs text-red-600">Invalid batch size</p>}
        </div>
      )}

      <hr className="my-3" />

      <Button onClick={handleSaveConfiguration} disabled={loading || !isFormValid()} className="w-full bg-blue-600 text-white hover:bg-blue-700">
        {loading ? "Saving..." : formData.config_id ? "Update Configuration" : "Save Configuration"}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
    </div>
  )
}
