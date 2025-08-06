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

export const parseXMLSchema: NodeSchema = {
  inputSchema: [
    {
      name: "xmlInput",
      datatype: "string",
      description: "The XML content to parse as a string.",
      required: true,
    },
    {
      name: "inputStyle",
      datatype: "string",
      description: "The style of the input: string or binary.",
    },
    {
      name: "encoding",
      datatype: "string",
      description: "The encoding type used in the XML (e.g., UTF-8).",
    },
  ],
  outputSchema: [
    {
      name: "parsedData",
      datatype: "object",
      description: "The result of the parsed XML as a JSON object.",
    },
    {
      name: "isValid",
      datatype: "boolean",
      description: "Whether the XML content is valid.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function ParseXMLNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  const schema = parseXMLSchema

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/xml/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("XML parsed successfully.")
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "success",
            output: data,
          })
        }
      } else {
        setError(data.message || "Failed to parse XML.")
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
      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Node Name</Label>
        <Input
          id="displayName"
          value={formData.displayName || ""}
          placeholder="Parse XML"
          onChange={(e) => onChange("displayName", e.target.value)}
        />
      </div>

      {/* XML Input */}
      <div className="space-y-2">
        <Label htmlFor="xmlInput">XML Input</Label>
        <Input
          id="xmlInput"
          value={formData.xmlInput || ""}
          placeholder="<root><item>value</item></root>"
          onChange={(e) => onChange("xmlInput", e.target.value)}
        />
      </div>

      {/* Input Style */}
      <div className="space-y-2">
        <Label htmlFor="inputStyle">Input Style</Label>
        <Input
          id="inputStyle"
          value={formData.inputStyle || ""}
          placeholder="string or binary"
          onChange={(e) => onChange("inputStyle", e.target.value)}
        />
      </div>

      {/* Encoding */}
      <div className="space-y-2">
        <Label htmlFor="encoding">Encoding</Label>
        <Input
          id="encoding"
          value={formData.encoding || ""}
          placeholder="UTF-8"
          onChange={(e) => onChange("encoding", e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {loading ? "Parsing..." : "Parse XML"}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
