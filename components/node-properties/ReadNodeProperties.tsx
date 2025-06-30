"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { readFileWithContent, type ReadFileRequest, type ReadFileResponse } from "@/services/cli-operator-service"

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

// Read Node schema definition
export const readNodeSchema: NodeSchema = {
  inputSchema: [
    {
      name: "input_path",
      datatype: "string",
      description: "The absolute path to the file to read content from.",
      required: true,
    },
    {
      name: "limit",
      datatype: "integer",
      description: "Maximum number of records/lines to read from the file.",
    },
    {
      name: "pretty",
      datatype: "boolean",
      description: "Whether to format the output in a readable format.",
    },
  ],
  outputSchema: [
    {
      name: "content",
      datatype: "string",
      description: "The content of the file (xml, json, csv, or text format).",
    },
    {
      name: "file_path",
      datatype: "string",
      description: "The path of the file that was read.",
    },
    {
      name: "file_type",
      datatype: "string",
      description: "The detected type/format of the file.",
    },
    {
      name: "record_count",
      datatype: "integer",
      description: "Number of records/lines read from the file.",
    },
    {
      name: "success",
      datatype: "boolean",
      description: "Indicates whether the read operation was successful.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function ReadNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleTestRead = async () => {
    if (!formData.input_path) {
      setError("Input path is required")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Get client ID from localStorage or context
      const clientData = localStorage.getItem("currentClient")
      const clientId = clientData ? JSON.parse(clientData).id : null

      if (!clientId) {
        throw new Error("Client ID not found")
      }

      const request: ReadFileRequest = {
        input_path: formData.input_path,
        limit: formData.limit || 50,
        pretty: formData.pretty || false,
      }

      const result: ReadFileResponse = await readFileWithContent(clientId, request)

      // Store the response in formData for the node modal to display
      onChange("lastResponse", result)

      if (result.success) {
        setSuccess("File read successfully!")
      } else {
        setError(result.error_message || "Failed to read file")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to read file"
      setError(errorMessage)

      // Store error in formData for the node modal to display
      onChange("lastResponse", {
        success: false,
        error_message: errorMessage,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Input Path */}
      <div className="space-y-2">
        <Label htmlFor="input_path">Input Path *</Label>
        <Input
          id="input_path"
          value={formData.input_path || ""}
          placeholder="/app/data/mock_data/demo/rename_records_2000.csv"
          onChange={(e) => onChange("input_path", e.target.value)}
        />
        <p className="text-xs text-gray-500">Absolute path to the file (supports XML, JSON, CSV, and text formats)</p>
      </div>

      {/* Limit */}
      <div className="space-y-2">
        <Label htmlFor="limit">Limit</Label>
        <Input
          id="limit"
          type="number"
          value={formData.limit || 50}
          placeholder="50"
          onChange={(e) => onChange("limit", Number.parseInt(e.target.value) || 50)}
        />
        <p className="text-xs text-gray-500">Maximum number of records/lines to read</p>
      </div>

      {/* Pretty */}
      <div className="flex items-center space-x-2">
        <Switch id="pretty" checked={!!formData.pretty} onCheckedChange={(v) => onChange("pretty", v)} />
        <Label htmlFor="pretty" className="cursor-pointer">
          Pretty Format
        </Label>
        <p className="text-xs text-gray-500 ml-2">Format output for better readability</p>
      </div>

      {/* Test Read Button */}
      <div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleTestRead}
          disabled={loading || !formData.input_path}
        >
          {loading ? "Reading..." : "Test Read"}
        </button>
      </div>

      {/* Feedback */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700 text-sm break-words">{success}</p>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700 text-sm break-words">{error}</p>
        </div>
      )}
    </div>
  )
}
