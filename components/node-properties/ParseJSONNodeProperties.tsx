//ParseJSONNodeProperties.tsx
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

export const parseJSONSchema: NodeSchema = {
  inputSchema: [
    {
      name: "jsonString",
      datatype: "string",
      description: "The input JSON data for translation.",
      required: true,
    },
    {
      name: "schemaType",
      datatype: "string",
      description: "Specifies the mode for the output data: Generic or XSD.",
    },
    {
      name: "badgerfish",
      datatype: "boolean",
      description: "Enable Badgerfish conversion rules.",
    },
    {
      name: "inputJsonStyle",
      datatype: "string",
      description: "Parsing method: None, Json with Root, or Anonymous Array.",
    },
    {
      name: "useNullForEmpty",
      datatype: "boolean",
      description: "Use null in place of empty values in JSON.",
    },
    {
      name: "description",
      datatype: "string",
      description: "Short description of the activity.",
    },
  ],
  outputSchema: [
    {
      name: "xmlData",
      datatype: "string",
      description: "Converted XML data as string.",
    },
    {
      name: "isValid",
      datatype: "boolean",
      description: "Whether the JSON was successfully parsed and converted.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function ParseJSONNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/json/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("JSON parsed and converted to XML successfully.")
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "success",
            output: data,
          })
        }
      } else {
        setError(data.message || "Failed to parse JSON.")
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
          placeholder="Parse JSON"
          onChange={(e) => onChange("displayName", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jsonString">JSON Input</Label>
        <Input
          id="jsonString"
          value={formData.jsonString || ""}
          placeholder='{"key": "value"}'
          onChange={(e) => onChange("jsonString", e.target.value)}
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
        <Label htmlFor="inputJsonStyle">Input JSON Style</Label>
        <Input
          id="inputJsonStyle"
          value={formData.inputJsonStyle || ""}
          placeholder="None, Json with Root, Anonymous Array"
          onChange={(e) => onChange("inputJsonStyle", e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="useNullForEmpty"
          checked={formData.useNullForEmpty || false}
          onCheckedChange={(value) => onChange("useNullForEmpty", value)}
        />
        <Label htmlFor="useNullForEmpty">Use Null for Empty Values</Label>
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
          {loading ? "Parsing..." : "Parse JSON"}
        </Button>
      </div>

      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
