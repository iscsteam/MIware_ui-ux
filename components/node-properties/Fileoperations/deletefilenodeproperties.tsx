"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useWorkflow } from "@/components/workflow/workflow-context"

// Schema retained for potential reuse, but not used in UI rendering
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

export const deleteFileSchema: NodeSchema = {
  inputSchema: [
    {
      name: "filepath",
      datatype: "string",
      description: "The path and name of the file to delete.",
      required: true,
    },
    {
      name: "recursive",
      datatype: "boolean",
      description: "If true, recursively delete directories and their contents.",
    },
    {
      name: "skipTrash",
      datatype: "boolean",
      description: "If true, permanently delete the file instead of moving to trash/recycle bin.",
    },
    {
      name: "onlyIfExists",
      datatype: "boolean",
      description: "If true, no error will be raised if the file doesn't exist.",
    }
  ],
  outputSchema: [
    {
      name: "success",
      datatype: "boolean",
      description: "Indicates whether the delete operation was successful.",
    },
    {
      name: "message",
      datatype: "string",
      description: "Status message describing the result of the operation.",
    },
    {
      name: "filepath",
      datatype: "string",
      description: "The path of the file that was deleted.",
    },
    {
      name: "deletedAt",
      datatype: "string",
      description: "Timestamp when the file was deleted.",
    },
    {
      name: "fileExisted",
      datatype: "boolean",
      description: "Indicates whether the file existed before attempting deletion.",
    },
    {
      name: "wasDirectory",
      datatype: "boolean",
      description: "Indicates whether the deleted item was a directory.",
    },
    {
      name: "error",
      datatype: "string",
      description: "Error message if the operation failed.",
    }
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function DeleteFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/file-operations/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "delete",
          source_path: formData.source_path,
          executed_by: "cli_user"
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || "File deleted successfully!")
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "success",
            output: {
              ...data,
              success: true,
              deletedAt: new Date().toISOString(),
              filepath: formData.source_path
            }
          })
        }
      } else {
        setError(data.message || "Failed to delete file")
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "error",
            error: data.message || "Failed to delete file",
            output: {
              ...data,
              success: false,
              filepath: formData.source_path
            }
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
          output: {
            success: false,
            error: errorMessage,
            filepath: formData.source_path
          }
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
          placeholder="/data/old_file.csv"
          onChange={(e) => onChange("source_path", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          The path and name of the file to delete. (Required)
        </p>
      </div>

      {/* Submit Button */}
      <div>
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !formData.source_path}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          {loading ? "Deleting..." : "Delete File"}
        </Button>
      </div>

      {/* Feedback */}
      {success && <p className="text-green-500 mt-2">{success}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
