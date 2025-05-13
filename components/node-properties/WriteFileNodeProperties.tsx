//WriteFileNodeProperties.tsx
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useWorkflow } from "../workflow/workflow-context"

// Define the schema directly in this component
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

// Write File node schema
export const writeFileSchema: NodeSchema = {
  inputSchema: [
    {
      name: "provider",
      datatype: "string",
      description: "Data source provider (e.g., local, s3).",
      required: true,
    },
    {
      name: "format",
      datatype: "string",
      description: "File format (e.g., xml, json, csv).",
      required: true,
    },
    {
      name: "path",
      datatype: "string",
      description: "File path to save the file.",
      required: true,
    },
    {
      name: "mode",
      datatype: "string",
      description: "Write mode (overwrite, append).",
      required: true,
    },
  ],
  outputSchema: [
    {
      name: "fileInfo",
      datatype: "complex",
      description: "This element contains file metadata like name, size, and type.",
    },
    {
      name: "fullName",
      datatype: "string",
      description: "The name of the file, including the path information.",
    },
    {
      name: "fileName",
      datatype: "string",
      description: "The name of the file without the path information.",
    },
    {
      name: "location",
      datatype: "string",
      description: "The path to the file.",
    },
    {
      name: "size",
      datatype: "integer",
      description: "The size of the file in bytes.",
    },
    {
      name: "lastModified",
      datatype: "string",
      description: "The timestamp indicating when the file was last modified.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function WriteFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  // Write file operation function
  async function handleWriteFile() {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const response = await fetch("http://localhost:30010/api/file-operations/write", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: formData.provider,
          format: formData.format,
          path: formData.path,
          mode: formData.mode,
          options: {},  // Send empty options
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to write file")
      }

      setSuccessMessage("File written successfully!")
      
      // Update the node output with the API response data
      if (selectedNodeId) {
        updateNode(selectedNodeId, { 
          status: "success",
          output: {
            ...data,
            fullName: data.fileName || formData.path,
            fileName: data.fileName?.split("/").pop() || formData.path.split("/").pop(),
            location: data.fileName?.substring(0, data.fileName.lastIndexOf("/")) || 
                      formData.path.substring(0, formData.path.lastIndexOf("/")),
            size: data.size,
            lastModified: data.lastModified,
            success: true
          }
        })
      }
    } catch (err: any) {
      console.error(err)
      const errorMessage = err.message || "Unknown error occurred"
      setError(errorMessage)
      
      // Update the node with error status
      if (selectedNodeId) {
        updateNode(selectedNodeId, { 
          status: "error",
          error: errorMessage,
          output: { 
            error: errorMessage,
            path: formData.path,
            success: false
          }
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Provider */}
      <div className="space-y-2">
        <Label htmlFor="provider">Provider</Label>
        <Input
          id="provider"
          value={formData.provider || ""}
          placeholder="e.g., local"
          onChange={(e) => onChange("provider", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          {writeFileSchema.inputSchema[0].description}
        </p>
      </div>

      {/* Format */}
      <div className="space-y-2">
        <Label htmlFor="format">Format</Label>
        <Input
          id="format"
          value={formData.format || ""}
          placeholder="e.g., xml, json, csv"
          onChange={(e) => onChange("format", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          {writeFileSchema.inputSchema[1].description}
        </p>
      </div>

      {/* Path */}
      <div className="space-y-2">
        <Label htmlFor="path">File Path</Label>
        <Input
          id="path"
          value={formData.path || ""}
          placeholder="path/to/output/file"
          onChange={(e) => onChange("path", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          {writeFileSchema.inputSchema[2].description}
        </p>
      </div>

      {/* Mode */}
      <div className="space-y-2">
        <Label htmlFor="mode">Mode</Label>
        <Input
          id="mode"
          value={formData.mode || ""}
          placeholder="overwrite or append"
          onChange={(e) => onChange("mode", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          {writeFileSchema.inputSchema[3].description}
        </p>
      </div>

      {/* Write File Button */}
      <div>
        <Button 
          onClick={handleWriteFile} 
          disabled={loading || !formData.provider || !formData.format || !formData.path || !formData.mode}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? "Writing..." : "Write File"}
        </Button>
      </div>

      {/* Success or Error messages */}
      {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
