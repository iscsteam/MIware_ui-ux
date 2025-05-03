"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button" 
import { useState } from "react"
import { useWorkflow } from "../workflow/workflow-context"

// Define the delete file node schema directly in this component
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

// Delete File node schema
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
          label: formData.label,
          filepath: formData.filepath,
          recursive: formData.recursive,
          skipTrash: formData.skipTrash,
          onlyIfExists: formData.onlyIfExists !== false, // Default to true if not explicitly set
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || "File deleted successfully!")
        // Update the node's output with the API response data
        if (selectedNodeId) {
          updateNode(selectedNodeId, { 
            status: "success",
            output: {
              ...data,
              success: true,
              deletedAt: new Date().toISOString(),
              filepath: formData.filepath
            }
          })
        }
      } else {
        setError(data.message || "Failed to delete file")
        // Update the node with error status and message
        if (selectedNodeId) {
          updateNode(selectedNodeId, { 
            status: "error",
            error: data.message || "Failed to delete file",
            output: {
              ...data,
              success: false,
              error: data.message || "Failed to delete file",
              filepath: formData.filepath
            }
          })
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error connecting to the server."
      setError(errorMessage)
      // Update node with error status
      if (selectedNodeId) {
        updateNode(selectedNodeId, { 
          status: "error",
          error: errorMessage,
          output: { 
            error: errorMessage,
            success: false,
            filepath: formData.filepath
          }
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Node Label */}
      <div className="space-y-2">
        <Label htmlFor="label">Node Label</Label>
        <Input
          id="label"
          value={formData.label || ""}
          placeholder="Node label (e.g., Delete Log File)"
          onChange={(e) => onChange("label", e.target.value)}
        />
      </div>

      {/* File Path */}
      <div className="space-y-2">
        <Label htmlFor="filepath">File Path</Label>
        <Input
          id="filepath"
          value={formData.filepath || ""}
          placeholder="path/to/file.txt"
          onChange={(e) => onChange("filepath", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          {deleteFileSchema.inputSchema[0].description}
          {deleteFileSchema.inputSchema[0].required && " (Required)"}
        </p>
      </div>

      {/* Recursive Delete (for directories) */}
      <div className="flex items-center space-x-2">
        <Switch 
          id="recursive" 
          checked={!!formData.recursive} 
          onCheckedChange={(v) => onChange("recursive", v)} 
        />
        <Label htmlFor="recursive" className="cursor-pointer">
          Delete recursively (for directories)
        </Label>
        <p className="text-xs text-gray-500 ml-2">
          {deleteFileSchema.inputSchema[1].description}
        </p>
      </div>

      {/* Skip Trash */}
      <div className="flex items-center space-x-2">
        <Switch 
          id="skipTrash" 
          checked={!!formData.skipTrash} 
          onCheckedChange={(v) => onChange("skipTrash", v)} 
        />
        <Label htmlFor="skipTrash" className="cursor-pointer">
          Permanently delete (skip trash)
        </Label>
        <p className="text-xs text-gray-500 ml-2">
          {deleteFileSchema.inputSchema[2].description}
        </p>
      </div>

      {/* Only If Exists */}
      <div className="flex items-center space-x-2">
        <Switch
          id="onlyIfExists"
          checked={formData.onlyIfExists !== false} // Default to true
          onCheckedChange={(v) => onChange("onlyIfExists", v)}
        />
        <Label htmlFor="onlyIfExists" className="cursor-pointer">
          Only delete if file exists
        </Label>
        <p className="text-xs text-gray-500 ml-2">
          {deleteFileSchema.inputSchema[3].description}
        </p>
      </div>

      {/* Submit Button */}
      <div>
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !formData.filepath}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          {loading ? "Deleting..." : "Delete File"}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <p className="text-green-500 mt-2">{success}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}