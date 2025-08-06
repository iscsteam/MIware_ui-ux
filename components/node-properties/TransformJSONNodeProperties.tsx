//TransformJSONNodeProperties.tsx
"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

export const transformJSONSchema: NodeSchema = {
  inputSchema: [
    {
      name: "jsonInput",
      datatype: "string",
      description: "Input JSON data.",
      required: true,
    },
    {
      name: "specFilePath",
      datatype: "string",
      description: "Optional path to Jolt specification file.",
    },
    {
      name: "specContent",
      datatype: "string",
      description: "Jolt specification content (JSON format).",
    },
    {
      name: "description",
      datatype: "string",
      description: "Description of the transformation activity.",
    },
  ],
  outputSchema: [
    {
      name: "jsonOutput",
      datatype: "object",
      description: "Transformed JSON output as per the Jolt specification.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function TransformJSONNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/json/transform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("JSON transformed successfully.")
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "success",
            output: data,
          })
        }
      } else {
        setError(data.message || "Transformation failed.")
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
          placeholder="Transform JSON"
          onChange={(e) => onChange("displayName", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jsonInput">JSON Input</Label>
        <Textarea
          id="jsonInput"
          value={formData.jsonInput || ""}
          placeholder='{"example": "value"}'
          onChange={(e) => onChange("jsonInput", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specFilePath">Spec File Path (optional)</Label>
        <Input
          id="specFilePath"
          value={formData.specFilePath || ""}
          placeholder="/path/to/spec.json"
          onChange={(e) => onChange("specFilePath", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specContent">Spec Content</Label>
        <Textarea
          id="specContent"
          value={formData.specContent || ""}
          placeholder='[{"operation": "shift", "spec": {...}}]'
          onChange={(e) => onChange("specContent", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description || ""}
          placeholder="Short description"
          onChange={(e) => onChange("description", e.target.value)}
        />
      </div>

      <div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {loading ? "Transforming..." : "Transform JSON"}
        </Button>
      </div>

      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
