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

export const transformXMLSchema: NodeSchema = {
  inputSchema: [
    {
      name: "xmlString",
      datatype: "string",
      description: "The source XML to transform.",
      required: true,
    },
    {
      name: "styleSheet",
      datatype: "string",
      description: "The XSLT stylesheet to use for transformation.",
    },
    {
      name: "parameter",
      datatype: "array",
      description: "Optional XSLT parameters.",
    },
    {
      name: "inputOutputStyle",
      datatype: "string",
      description: "Format for input/output: text or binary.",
    },
    {
      name: "disablePrettyPrint",
      datatype: "boolean",
      description: "Disable formatting in the output XML.",
    },
  ],
  outputSchema: [
    {
      name: "xmlString",
      datatype: "string",
      description: "Transformed XML output.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function TransformXMLNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/xml/transform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("XML transformed successfully.")
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "success",
            output: data,
          })
        }
      } else {
        setError(data.message || "Failed to transform XML.")
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
          placeholder="Transform XML"
          onChange={(e) => onChange("displayName", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="xmlString">XML Input</Label>
        <Input
          id="xmlString"
          value={formData.xmlString || ""}
          placeholder="<book><title>Example</title></book>"
          onChange={(e) => onChange("xmlString", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="styleSheet">XSLT Stylesheet</Label>
        <Input
          id="styleSheet"
          value={formData.styleSheet || ""}
          placeholder="<xsl:stylesheet>...</xsl:stylesheet>"
          onChange={(e) => onChange("styleSheet", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inputOutputStyle">Input/Output Style</Label>
        <Input
          id="inputOutputStyle"
          value={formData.inputOutputStyle || ""}
          placeholder="text or binary"
          onChange={(e) => onChange("inputOutputStyle", e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="disablePrettyPrint"
          checked={formData.disablePrettyPrint || false}
          onCheckedChange={(val) => onChange("disablePrettyPrint", val)}
        />
        <Label htmlFor="disablePrettyPrint">Disable Pretty Print</Label>
      </div>

      <div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {loading ? "Transforming..." : "Transform XML"}
        </Button>
      </div>

      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
