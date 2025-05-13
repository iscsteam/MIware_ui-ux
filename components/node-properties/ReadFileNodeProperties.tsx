//ReadFileNodeProperties.tsx
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

export const readFileSchema: NodeSchema = {
  inputSchema: [
    { name: "provider", datatype: "string", description: "Data source provider (e.g., local, s3).", required: true },
    { name: "format", datatype: "string", description: "File format (e.g., csv, json, xml).", required: true },
    { name: "path", datatype: "string", description: "File path to read from.", required: true },
    { name: "rowTag", datatype: "string", description: "Row tag for XML files (if applicable)." },
    { name: "rootTag", datatype: "string", description: "Root tag for XML files (if applicable)." }
  ],
  outputSchema: [
    { name: "content", datatype: "string", description: "The content of the file." },
    { name: "fileMeta", datatype: "object", description: "Metadata about the file (size, modified time, etc)." },
    { name: "success", datatype: "boolean", description: "Whether the read operation was successful." },
    { name: "error", datatype: "string", description: "Error message if any." }
  ]
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function ReadFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [subfolder, setSubfolder] = useState<string>("uploads")
  const { updateNode, selectedNodeId } = useWorkflow()

  async function handleReadFile() {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("http://localhost:5000/api/file-operations/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: formData.provider,
          format: formData.format,
          path: formData.path,
          options: {
            rowTag: "Record",
            rootTag: "Records"
          }
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to read file")

      setSuccessMessage("File read successfully!")

      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "success",
          output: {
            content: data.content || "",
            fileMeta: data.fileMeta || {},
            path: formData.path,
            success: true
          }
        })
      }
    } catch (err: any) {
      const errorMessage = err.message || "Unknown error"
      setError(errorMessage)
      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "error",
          output: { error: errorMessage, path: formData.path, success: false }
        })
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const formDataObj = new FormData()
      formDataObj.append("file", file)
      formDataObj.append("subfolder", subfolder)

      const res = await fetch("http://localhost:30010/uploads/", {
        method: "POST",
        body: formDataObj
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.detail || "Upload failed")

      onChange("path", result.path || file.name)
      setSuccessMessage(`Uploaded ${file.name} to "${subfolder}" successfully`)
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Provider */}
      <div className="space-y-1">
        <Label htmlFor="provider">Provider</Label>
        <Input
          id="provider"
          value={formData.provider || ""}
          placeholder="e.g., local"
          onChange={(e) => onChange("provider", e.target.value)}
        />
      </div>

      {/* Format */}
      <div className="space-y-1">
        <Label htmlFor="format">Format</Label>
        <Input
          id="format"
          value={formData.format || ""}
          placeholder="e.g., csv"
          onChange={(e) => onChange("format", e.target.value)}
        />
      </div>

      {/* Subfolder */}
      <div className="space-y-1">
        <Label htmlFor="subfolder">Subfolder (for upload)</Label>
        <Input
          id="subfolder"
          value={subfolder}
          placeholder="uploads"
          onChange={(e) => setSubfolder(e.target.value)}
        />
      </div>

      {/* File Upload */}
      <div className="space-y-1">
        <Label htmlFor="upload">Upload File</Label>
        <Input
          id="upload"
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
        />
      </div>

      {/* File Path */}
      <div className="space-y-1">
        <Label htmlFor="path">File Path</Label>
        <Input
          id="path"
          value={formData.path || ""}
          placeholder="/app/data/input/file.csv"
          onChange={(e) => onChange("path", e.target.value)}
        />
      </div>

      {/* Read File Button */}
      <div>
        <Button
          onClick={handleReadFile}
          disabled={loading || uploading || !formData.path}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? "Reading..." : "Read File"}
        </Button>
      </div>

      {/* Feedback */}
      {successMessage && <p className="text-green-600">{successMessage}</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  )
}
