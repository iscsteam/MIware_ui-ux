// listfilesnodeproperties.tsx
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button" 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export const listFilesSchema: NodeSchema = {
  inputSchema: [
    {
      name: "fileName",
      datatype: "string",
      description:
        "The path and name of the file or directory to list. Supports wildcards (e.g. C:\\files\\*.log).",
      required: true,
    },
    {
      name: "mode",
      datatype: "string",
      description:
        "The type of listing to retrieve. One of: 'Only Files', 'Only Directories', or 'Files and Directories'.",
      required: true,
    },
    {
      name: "includeTimestamp",
      datatype: "boolean",
      description:
        "Whether to include timestamps in addition to dates in the listing.",
    },
    {
      name: "description",
      datatype: "string",
      description: "Optional description for this activity.",
    },
  ],
  outputSchema: [
    {
      name: "fileInfo",
      datatype: "complex[]",
      description:
        "A repeating element containing metadata for each matched file or directory: fullName, fileName, location, configuredFileName, type, readProtected, writeProtected, size, lastModified.",
    },
    {
      name: "fullName",
      datatype: "string",
      description: "The full path and name of the file or directory.",
    },
    {
      name: "fileName",
      datatype: "string",
      description: "The file or directory name without path information.",
    },
    {
      name: "location",
      datatype: "string",
      description: "The base path of the file or directory.",
    },
    {
      name: "configuredFileName",
      datatype: "string",
      description: "The exact file or directory pattern that was queried.",
    },
    {
      name: "type",
      datatype: "string",
      description: "The type (file or directory).",
    },
    {
      name: "readProtected",
      datatype: "boolean",
      description: "Whether the item is protected from reading.",
    },
    {
      name: "writeProtected",
      datatype: "boolean",
      description: "Whether the item is protected from writing.",
    },
    {
      name: "size",
      datatype: "integer",
      description: "Size of the file in bytes (0 for directories).",
    },
    {
      name: "lastModified",
      datatype: "string",
      description: "Timestamp when the item was last modified.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function ListFilesNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/file-operations/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: formData.label,
          filepath: formData.filepath,
          mode: formData.mode || "all", // Default to all if not specified
          includeTimestamp: !!formData.includeTimestamp,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Successfully listed ${data.files?.length || 0} items`)
        // Update the node's output with the API response data
        if (selectedNodeId) {
          updateNode(selectedNodeId, { 
            status: "success",
            output: data 
          })
        }
      } else {
        setError(data.message)
        // Update the node with error status and message
        if (selectedNodeId) {
          updateNode(selectedNodeId, { 
            status: "error",
            error: data.message,
            output: data 
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
          output: { error: errorMessage }
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
        <Label htmlFor="label">Operation Label</Label>
        <Input
          id="label"
          value={formData.label || ""}
          placeholder="List Files"
          onChange={(e) => onChange("label", e.target.value)}
        />
      </div>

      {/* File Path */}
      <div className="space-y-2">
        <Label htmlFor="filepath">Directory Path or Pattern</Label>
        <Input
          id="filepath"
          value={formData.filepath || ""}
          placeholder="C:/files/*.log"
          onChange={(e) => onChange("filepath", e.target.value)}
        />
        {/* <p className="text-xs text-gray-500">
          You can use wildcard characters like * to match specific files.
          For example, C:\\files\\*.log will match all .log files in the files directory.
        </p> */}
      </div>

      {/* Mode Selection */}
      <div className="space-y-2">
        <Label htmlFor="mode">Mode</Label>
        <Select
          value={formData.mode || "all"}
          onValueChange={(value) => onChange("mode", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select what to list" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="files">Only Files</SelectItem>
            <SelectItem value="directories">Only Directories</SelectItem>
            <SelectItem value="all">Files and Directories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Include Timestamp */}
      <div className="flex items-center space-x-2">
        <Switch
          id="includeTimestamp"
          checked={!!formData.includeTimestamp}
          onCheckedChange={(v) => onChange("includeTimestamp", v)}
        />
        <Label htmlFor="includeTimestamp" className="cursor-pointer">
          Include timestamp in addition to date
        </Label>
      </div>

      {/* Submit Button */}
      <div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {loading ? "Listing Files..." : "List Files"}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}