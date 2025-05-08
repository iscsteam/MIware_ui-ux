//RenderdataNodeProperties.tsx
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useWorkflow } from "../workflow/workflow-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

// Render Data node schema
export const renderDataSchema: NodeSchema = {
  inputSchema: [
    {
      name: "rows",
      datatype: "complex",
      description: "The element containing the list of items to render.",
      required: true,
    },
    {
      name: "root",
      datatype: "complex",
      description: "The complex element containing data schema (specified by the Data Format shared resource) to render as a text string. This is a repeating element which renders more than one output record.",
      required: true,
    },
  ],
  outputSchema: [
    {
      name: "text",
      datatype: "string",
      description: "The output text string as a result of rendering the specified data schema. Line breaks separate records of the data schema.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function RenderDataNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  // Expose the schema for this node
  const schema = renderDataSchema

  // Mock data formats for selection
  const dataFormats = [
    "CSV",
    "JSON",
    "XML",
    "Delimited",
    "Fixed-Width",
    "Custom",
  ]

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/data-operations/render", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: formData.displayName,
          dataFormat: formData.dataFormat,
          inputData: formData.inputData,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        // Update the node's output with the API response data
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "success",
            output: data,
          })
        }
      } else {
        setError(data.message)
        // Update the node with error status and message
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
      // Update node with error status
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
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={formData.displayName || ""}
          placeholder="Render Data"
          onChange={(e) => onChange("displayName", e.target.value)}
        />
        <p className="text-xs text-gray-500">The name to be displayed as the label for the activity in the process.</p>
      </div>

      {/* Data Format */}
      <div className="space-y-2">
        <Label htmlFor="dataFormat">Data Format</Label>
        <Select
          value={formData.dataFormat || ""}
          onValueChange={(value) => onChange("dataFormat", value)}
        >
          <SelectTrigger id="dataFormat">
            <SelectValue placeholder="Select data format" />
          </SelectTrigger>
          <SelectContent>
            {dataFormats.map((format) => (
              <SelectItem key={format} value={format}>
                {format}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">The shared resource to use when rendering the text output.</p>
      </div>

      {/* Input Data Preview (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="inputPreview">Input Data Preview</Label>
        <div className="bg-gray-100 p-2 rounded-md min-h-20 max-h-60 overflow-auto">
          <pre className="text-xs whitespace-pre-wrap">
            {formData.inputData ? 
              JSON.stringify(formData.inputData, null, 2) : 
              "No input data available. Connect this node to a data source."}
          </pre>
        </div>
      </div>

      {/* Output Preview (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="outputPreview">Output Preview</Label>
        <div className="bg-gray-100 p-2 rounded-md min-h-20 max-h-60 overflow-auto">
          <pre className="text-xs whitespace-pre-wrap">
            {formData.outputData ? 
              formData.outputData : 
              "No output data available. Run this node to see results."}
          </pre>
        </div>
      </div>

      {/* Advanced Settings Section */}
      <div className="pt-2 border-t border-gray-200">
        <h3 className="font-medium text-sm mb-2">Format Settings</h3>
        
        {/* Only show relevant fields based on selected data format */}
        {formData.dataFormat === "CSV" && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="includeHeaders" className="w-32">Include Headers</Label>
              <Input 
                type="checkbox" 
                id="includeHeaders" 
                checked={!!formData.includeHeaders}
                className="w-4 h-4" 
                onChange={(e) => onChange("includeHeaders", e.target.checked)} 
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="delimiter" className="w-32">Delimiter</Label>
              <Input 
                id="delimiter" 
                value={formData.delimiter || ","} 
                className="w-20"
                onChange={(e) => onChange("delimiter", e.target.value)} 
              />
            </div>
          </div>
        )}

        {formData.dataFormat === "JSON" && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="prettyPrint" className="w-32">Pretty Print</Label>
              <Input 
                type="checkbox" 
                id="prettyPrint" 
                checked={!!formData.prettyPrint}
                className="w-4 h-4" 
                onChange={(e) => onChange("prettyPrint", e.target.checked)} 
              />
            </div>
          </div>
        )}

        {formData.dataFormat === "XML" && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="rootElement" className="w-32">Root Element</Label>
              <Input 
                id="rootElement" 
                value={formData.rootElement || "root"} 
                onChange={(e) => onChange("rootElement", e.target.value)} 
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="indentation" className="w-32">Indentation</Label>
              <Input 
                type="number"
                id="indentation" 
                value={formData.indentation || 2} 
                className="w-20"
                onChange={(e) => onChange("indentation", parseInt(e.target.value))} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {loading ? "Rendering..." : "Render Data"}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}