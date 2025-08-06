//RenderJSONNodeProperties.tsx
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

export const renderJSONSchema: NodeSchema = {
  inputSchema: [
    {
      name: "xmlInput",
      datatype: "string",
      description: "The input XML data for rendering as JSON.",
      required: true,
    },
    {
      name: "schemaType",
      datatype: "string",
      description: "Schema type: Generic or XSD.",
    },
    {
      name: "badgerfish",
      datatype: "boolean",
      description: "Enable Badgerfish conversion rules.",
    },
    {
      name: "outputJsonStyle",
      datatype: "string",
      description: "Rendering style: None, Json with Root, or Anonymous Array.",
    },
    {
      name: "useEmptyForNull",
      datatype: "boolean",
      description: "Use empty values for null in JSON.",
    },
    {
      name: "description",
      datatype: "string",
      description: "Short description of the activity.",
    },
  ],
  outputSchema: [
    {
      name: "jsonString",
      datatype: "string",
      description: "Translated data in JSON string format.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function RenderJSONNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/json/render", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("XML rendered to JSON successfully.")
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "success",
            output: data,
          })
        }
      } else {
        setError(data.message || "Failed to render JSON.")
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
          placeholder="Render JSON"
          onChange={(e) => onChange("displayName", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="xmlInput">XML Input</Label>
        <Input
          id="xmlInput"
          value={formData.xmlInput || ""}
          placeholder='<root><item>value</item></root>'
          onChange={(e) => onChange("xmlInput", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="schemaType">Schema Type</Label>
        <Input
          id="schemaType"
          value={formData.schemaType || ""}
          placeholder="Generic or XSD"
          onChange={(e) => onChange("schemaType", e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="badgerfish"
          checked={formData.badgerfish || false}
          onCheckedChange={(value) => onChange("badgerfish", value)}
        />
        <Label htmlFor="badgerfish">Badgerfish</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="outputJsonStyle">Output JSON Style</Label>
        <Input
          id="outputJsonStyle"
          value={formData.outputJsonStyle || ""}
          placeholder="None, Json with Root, Anonymous Array"
          onChange={(e) => onChange("outputJsonStyle", e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="useEmptyForNull"
          checked={formData.useEmptyForNull || false}
          onCheckedChange={(value) => onChange("useEmptyForNull", value)}
        />
        <Label htmlFor="useEmptyForNull">Use Empty for Null</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description || ""}
          placeholder="Describe the activity"
          onChange={(e) => onChange("description", e.target.value)}
        />
      </div>

      <div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {loading ? "Rendering..." : "Render JSON"}
        </Button>
      </div>

      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
