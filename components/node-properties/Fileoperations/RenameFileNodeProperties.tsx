"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
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

// Updated schema based on the payload
export const renameFileSchema: NodeSchema = {
  inputSchema: [
    {
      name: "source_path",
      datatype: "string",
      description: "The absolute path of the file or directory to rename.",
      required: true,
    },
    {
      name: "destination_path",
      datatype: "string",
      description: "The new absolute path of the renamed file or directory.",
      required: true,
    },
  ],
  outputSchema: [
    {
      name: "message",
      datatype: "string",
      description: "Status message returned after rename operation.",
    },
    {
      name: "success",
      datatype: "boolean",
      description: "Indicates whether the rename operation was successful.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function RenameFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/file-operations/rename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "rename",
          source_path: formData.source_path,
          destination_path: formData.destination_path,
          executed_by: "cli_user",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "success",
            output: data,
          })
        }
      } else {
        setError(data.message)
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "error",
            error: data.message,
            output: data,
          })
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error connecting to the server."
      setError(errorMessage)
      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "error",
          error: errorMessage,
          output: { error: errorMessage },
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Source Path */}
      <div className="space-y-2">
        <Label htmlFor="source_path">Source Path</Label>
        <Input
          id="source_path"
          value={formData.source_path || ""}
          placeholder="/data/report_draft.txt"
          onChange={(e) => onChange("source_path", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          The absolute path of the file or directory to rename.
        </p>
      </div>

      {/* Destination Path */}
      <div className="space-y-2">
        <Label htmlFor="destination_path">Destination Path</Label>
        <Input
          id="destination_path"
          value={formData.destination_path || ""}
          placeholder="/data/report_final.txt"
          onChange={(e) => onChange("destination_path", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          The new absolute path of the renamed file or directory.
        </p>
      </div>

      {/* Submit Button */}
      <div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {loading ? "Renaming..." : "Rename File"}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
