//crearefile-node-properties.tsx
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
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

// Create File node schema
export const createFileSchema: NodeSchema = {
  inputSchema: [
    {
      name: "fileName",
      datatype: "string",
      description:
        "The path and name of the file to create. Select the Is a Directory field check box on the General tab to specify the name of the directory to create.",
      required: true,
    },
  ],
  outputSchema: [
    {
      name: "fileInfo",
      datatype: "complex",
      description:
        "The element containing fullName, fileName, location, configuredFileName, type, readProtected, writeprotected, size, and lastModified",
    },
    {
      name: "fullName",
      datatype: "string",
      description: "The name of the file or directory, including the path information",
    },
    {
      name: "fileName",
      datatype: "string",
      description: "The name of the file or directory without the path information",
    },
    {
      name: "location",
      datatype: "string",
      description: "The path to the file or directory",
    },
    {
      name: "configuredFileName",
      datatype: "string",
      description: "This element is optional and it is not populated by this activity",
    },
    {
      name: "type",
      datatype: "string",
      description: "The type of the file",
    },
    {
      name: "readProtected",
      datatype: "boolean",
      description: "Signifies whether the file or directory is protected from reading",
    },
    {
      name: "writeProtected",
      datatype: "boolean",
      description: "Signifies whether the file or directory is protected from writing",
    },
    {
      name: "size",
      datatype: "integer",
      description: "The size of the file (in bytes)",
    },
    {
      name: "lastModified",
      datatype: "string",
      description: "The time stamp indicating when the file was last modified",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function CreateFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  // Expose the schema for this node
  const schema = createFileSchema

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/file-operations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: formData.displayName,
          label: formData.label,
          filename: formData.filename,
          overwrite: formData.overwrite,
          isDirectory: formData.isDirectory,
          includeTimestamp: formData.includeTimestamp,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        // Update the node's output with the API response data
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "success",
            output: data,
          })
        }
      } else {
        setError(data.message)
        // Update the node with error status and message
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
      // Update node with error status
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
      {/* File Name (previously Node Label) */}
      <div className="space-y-2">
        <Label htmlFor="displayName">File Name</Label>
        <Input
          id="displayName"
          value={formData.displayName || ""}
          placeholder="Create File"
          onChange={(e) => onChange("displayName", e.target.value)}
        />
      </div>

      {/* File Path (previously File Name) */}
      <div className="space-y-2">
        <Label htmlFor="filename">File Path</Label>
        <Input
          id="filename"
          value={formData.filename || ""}
          placeholder="C:/Users/Public/Music"
          onChange={(e) => onChange("filename", e.target.value)}
        />
      </div>

      {/* Overwrite */}
      <div className="flex items-center space-x-2">
        <Switch id="overwrite" checked={!!formData.overwrite} onCheckedChange={(v) => onChange("overwrite", v)} />
        <Label htmlFor="overwrite" className="cursor-pointer">
          Overwrite if exists
        </Label>
      </div>

      {/* Is Directory */}
      <div className="flex items-center space-x-2">
        <Switch id="isDirectory" checked={!!formData.isDirectory} onCheckedChange={(v) => onChange("isDirectory", v)} />
        <Label htmlFor="isDirectory" className="cursor-pointer">
          Create as directory
        </Label>
      </div>

      {/* Include Timestamp */}
      <div className="flex items-center space-x-2">
        <Switch
          id="includeTimestamp"
          checked={!!formData.includeTimestamp}
          onCheckedChange={(v) => onChange("includeTimestamp", v)}
        />
        <Label htmlFor="includeTimestamp" className="cursor-pointer">
          Include timestamp in name
        </Label>
      </div>

      {/* Submit Button */}
      <div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {loading ? "Creating..." : "Create File"}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
