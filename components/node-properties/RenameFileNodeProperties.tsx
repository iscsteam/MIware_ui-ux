
//RenameFileNodeProperties.tsx
"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useWorkflow } from "../workflow/workflow-context"

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
      // We're not making an actual API call here as requested
      // Instead, we'll just update the node with the data that would be sent

      const payload = {
        operation: "rename",
        source_path: formData.source_path,
        destination_path: formData.destination_path,
        options: {
          overwrite: false, // Default value for overwrite
        },
        executed_by: "cli_user",
      }

      console.log("CLI operator payload for rename:", payload)

      // Update the node with the payload data
      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          data: {
            ...formData,
            // Store the complete payload for later use in workflow execution
            cliOperatorPayload: payload,
          },
          status: "success",
          output: {
            message: "Rename operation configured successfully",
            success: true,
            payload,
          },
        })
      }

      setSuccess("Rename operation configured successfully")
    } catch (err: any) {
      const errorMessage = err.message || "Unknown error"
      setError(errorMessage)

      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "error",
          error: errorMessage,
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
        <p className="text-xs text-gray-500">The absolute path of the file or directory to rename.</p>
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
        <p className="text-xs text-gray-500">The new absolute path of the renamed file or directory.</p>
      </div>

      {/* Submit Button */}
      {/* <div>
        <Button
          onClick={handleSubmit}
          disabled={loading || !formData.source_path || !formData.destination_path}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? "Processing..." : "Configure Rename Operation"}
        </Button>
      </div> */}

      {/* Success/Error Messages */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
