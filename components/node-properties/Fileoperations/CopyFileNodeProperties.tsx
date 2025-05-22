"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import React, { useState } from "react"

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

// Copy file node schema definition
export const copyFileSchema: NodeSchema = {
  inputSchema: [
    {
      name: "source_path",
      datatype: "string",
      description: "The absolute path to the source file or directory.",
      required: true,
    },
    {
      name: "destination_path",
      datatype: "string",
      description: "The absolute path where the file or directory should be copied to.",
      required: true,
    },
    {
      name: "overwrite",
      datatype: "boolean",
      description: "Whether to overwrite the destination if it already exists.",
    },
    {
      name: "includeSubDirectories",
      datatype: "boolean",
      description: "Whether to include subdirectories in the copy operation.",
    },
    {
      name: "createNonExistingDirs",
      datatype: "boolean",
      description: "Whether to create non-existing directories in the destination path.",
    },
  ],
  outputSchema: [
    {
      name: "message",
      datatype: "string",
      description: "Status message returned after the copy operation.",
    },
    {
      name: "success",
      datatype: "boolean",
      description: "Indicates whether the copy operation was successful.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function CopyFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/file-operations/copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "copy",
          source_path: formData.source_path,
          destination_path: formData.destination_path,
          executed_by: "cli_user",
          options: {
            overwrite: formData.overwrite || false,
            includeSubDirectories: formData.includeSubDirectories || false,
            createNonExistingDirs: formData.createNonExistingDirs || false,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError("Error connecting to the server.")
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
          placeholder="/data/input.csv"
          onChange={(e) => onChange("source_path", e.target.value)}
        />
      </div>

      {/* Destination Path */}
      <div className="space-y-2">
        <Label htmlFor="destination_path">Destination Path</Label>
        <Input
          id="destination_path"
          value={formData.destination_path || ""}
          placeholder="/data/backup/input_backup.csv"
          onChange={(e) => onChange("destination_path", e.target.value)}
        />
      </div>

      {/* Options */}
      {["overwrite", "includeSubDirectories", "createNonExistingDirs"].map((field) => (
        <div key={field} className="flex items-center space-x-2">
          <Switch
            id={field}
            checked={!!formData[field]}
            onCheckedChange={(v) => onChange(field, v)}
          />
          <Label htmlFor={field} className="cursor-pointer capitalize">
            {({
              overwrite: "Overwrite if exists",
              includeSubDirectories: "Include subdirectories",
              createNonExistingDirs: "Create non-existing directories",
            } as Record<string, string>)[field]}
          </Label>
        </div>
      ))}

      {/* Submit */}
      <div>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Copying..." : "Copy File"}
        </button>
      </div>

      {/* Feedback */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
