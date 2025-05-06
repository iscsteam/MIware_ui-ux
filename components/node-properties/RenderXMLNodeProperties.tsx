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

export const renderXMLSchema: NodeSchema = {
  inputSchema: [
    {
      name: "xmlSchema",
      datatype: "string",
      description: "The XML schema to render.",
      required: true,
    },
    {
      name: "outputStyle",
      datatype: "string",
      description: "Specifies whether the output should be text or binary data.",
    },
    {
      name: "validateInput",
      datatype: "boolean",
      description: "Whether to validate input against the schema.",
    },
    {
      name: "defaultNamespacePrefix",
      datatype: "boolean",
      description: "Prepend default namespace prefix.",
    },
    {
      name: "disablePrettyPrint",
      datatype: "boolean",
      description: "Output non-formatted XML.",
    },
    {
      name: "suppressXMLDeclaration",
      datatype: "boolean",
      description: "Suppress XML declaration at the beginning.",
    },
    {
      name: "encoding",
      datatype: "string",
      description: "Encoding value for the XML header (if Output Style is Text).",
    },
    {
      name: "cdataElements",
      datatype: "array",
      description: "List of XML elements to wrap with CDATA sections.",
    },
  ],
  outputSchema: [
    {
      name: "xmlString",
      datatype: "string",
      description: "Rendered XML as string (if output style is text).",
    },
    {
      name: "xmlBytes",
      datatype: "bytes",
      description: "Rendered XML as binary (if output style is binary).",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function RenderXMLNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/xml/render", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("XML rendered successfully.")
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "success",
            output: data,
          })
        }
      } else {
        setError(data.message || "Failed to render XML.")
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
          placeholder="Render XML"
          onChange={(e) => onChange("displayName", e.target.value)}
        />
      </div>

      {/* XML Schema */}
      <div className="space-y-2">
        <Label htmlFor="xmlSchema">XML Schema</Label>
        <Input
          id="xmlSchema"
          value={formData.xmlSchema || ""}
          placeholder="Paste your XML schema..."
          onChange={(e) => onChange("xmlSchema", e.target.value)}
        />
      </div>

      {/* Output Style */}
      <div className="space-y-2">
        <Label htmlFor="outputStyle">Output Style</Label>
        <Input
          id="outputStyle"
          value={formData.outputStyle || ""}
          placeholder="text or binary"
          onChange={(e) => onChange("outputStyle", e.target.value)}
        />
      </div>

      {/* Switches */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="validateInput">Validate Input</Label>
          <Switch
            id="validateInput"
            checked={formData.validateInput || false}
            onCheckedChange={(val) => onChange("validateInput", val)}
          />
        </div>

        <div>
          <Label htmlFor="defaultNamespacePrefix">Default Namespace Prefix</Label>
          <Switch
            id="defaultNamespacePrefix"
            checked={formData.defaultNamespacePrefix || false}
            onCheckedChange={(val) => onChange("defaultNamespacePrefix", val)}
          />
        </div>

        <div>
          <Label htmlFor="disablePrettyPrint">Disable Pretty Print</Label>
          <Switch
            id="disablePrettyPrint"
            checked={formData.disablePrettyPrint || false}
            onCheckedChange={(val) => onChange("disablePrettyPrint", val)}
          />
        </div>

        <div>
          <Label htmlFor="suppressXMLDeclaration">Suppress XML Declaration</Label>
          <Switch
            id="suppressXMLDeclaration"
            checked={formData.suppressXMLDeclaration || false}
            onCheckedChange={(val) => onChange("suppressXMLDeclaration", val)}
          />
        </div>
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

      {/* CDATA Elements */}
      <div className="space-y-2">
        <Label htmlFor="cdataElements">CDATA Elements (comma-separated)</Label>
        <Input
          id="cdataElements"
          value={formData.cdataElements || ""}
          placeholder="e.g., description,notes"
          onChange={(e) => onChange("cdataElements", e.target.value.split(",").map(s => s.trim()))}
        />
      </div>

      {/* Submit */}
      <div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {loading ? "Rendering..." : "Render XML"}
        </Button>
      </div>

      {/* Feedback */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
