"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useWorkflow } from "../workflow/workflow-context"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

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

export const fileNodeSchema: NodeSchema = {
  inputSchema: [
    {
      name: "filename",
      datatype: "string",
      description: "Name of the file to be uploaded or processed.",
      required: true,
    },
    {
      name: "provider",
      datatype: "string",
      description: "Storage provider: Local, AWS S3, Google Cloud Storage, Azure Blob Storage.",
      required: true,
    },
    {
      name: "format",
      datatype: "string",
      description: "File format: JSON, XML, CSV, or Parquet.",
      required: true,
    },
    {
      name: "destinationPath",
      datatype: "string",
      description: "Path where the file is located or to be uploaded.",
      required: true,
    },
  ],
  outputSchema: [
    {
      name: "filename",
      datatype: "string",
      description: "Name of the processed file.",
    },
    {
      name: "filepath",
      datatype: "string",
      description: "Full path of the uploaded or processed file.",
    },
    {
      name: "filesize",
      datatype: "number",
      description: "Size of the file in bytes.",
    },
    {
      name: "filecontent",
      datatype: "string",
      description: "Content of the file as a string.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function FileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/file/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("File uploaded and processed successfully.")
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "success",
            output: data,
          })
        }
      } else {
        setError(data.message || "Failed to process file.")
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
      <div className="space-y-2">
        <Label htmlFor="displayName">Node Name</Label>
        <Input
          id="displayName"
          value={formData.displayName || ""}
          placeholder="File Upload Node"
          onChange={(e) => onChange("displayName", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="filename">Filename</Label>
        <Input
          id="filename"
          value={formData.filename || ""}
          placeholder="example.json"
          onChange={(e) => onChange("filename", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="provider">Provider</Label>
        <Select value={formData.provider} onValueChange={(value) => onChange("provider", value)}>
          <SelectTrigger id="provider">
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="local">Local</SelectItem>
            <SelectItem value="aws-s3">AWS S3</SelectItem>
            <SelectItem value="gcs">Google Cloud Storage</SelectItem>
            <SelectItem value="azure">Azure Blob Storage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="format">Format</Label>
        <Select value={formData.format} onValueChange={(value) => onChange("format", value)}>
          <SelectTrigger id="format">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="parquet">Parquet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="destinationPath">Destination Path</Label>
        <Input
          id="destinationPath"
          value={formData.destinationPath || ""}
          placeholder="/uploads/data.json"
          onChange={(e) => onChange("destinationPath", e.target.value)}
        />
      </div>

      <div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {loading ? "Uploading..." : "Upload File"}
        </Button>
      </div>

      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
