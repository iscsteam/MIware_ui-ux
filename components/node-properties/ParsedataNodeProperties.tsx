//parseddatanodeproperties.tsx
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
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

// Parse Data node schema
export const parseDataSchema: NodeSchema = {
  inputSchema: [
    {
      name: "text",
      datatype: "string",
      description: "The text string to parse.",
      required: true,
    },
    {
      name: "fileName",
      datatype: "string",
      description: "The location and name of the file to read. The file's content is used as the input text string for this activity.",
      required: true,
    },
    {
      name: "startRecord",
      datatype: "number",
      description: "The line number of the input stream to begin parsing. All lines before the specified line are ignored.",
    },
    {
      name: "noOfRecords",
      datatype: "number",
      description: "The number of records to read from the input stream. Specify -1 if you want to read all records in the input stream.",
    },
    {
      name: "skipHeaderCharacters",
      datatype: "integer",
      description: "The number of characters to skip when parsing. You can skip over any file headers or other unwanted information.",
    },
  ],
  outputSchema: [
    {
      name: "rows",
      datatype: "complex",
      description: "This output item contains the list of parsed lines from the input.",
    },
    {
      name: "schema",
      datatype: "complex",
      description: "The schema containing the data from the parsed input text. This output item contains zero or more parsed records.",
    },
    {
      name: "errorRows",
      datatype: "complex",
      description: "This output item is available when you select Continue on Error, and error(s) while parsing the records in the input.",
    },
    {
      name: "done",
      datatype: "boolean",
      description: "true if no more records are available for parsing. false if there are more records available.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function ParsedDataNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  // Expose the schema for this node
  const schema = parseDataSchema

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/data-operations/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: formData.displayName,
          inputType: formData.inputType || "File",
          text: formData.text,
          fileName: formData.fileName,
          startRecord: formData.startRecord || 1,
          noOfRecords: formData.noOfRecords || -1,
          skipHeaderCharacters: formData.skipHeaderCharacters || 0,
          continueOnError: formData.continueOnError || false,
          dataFormat: formData.dataFormat || "CSV",
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
      {/* Node Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={formData.displayName || ""}
          placeholder="Parse Data"
          onChange={(e) => onChange("displayName", e.target.value)}
        />
      </div>

      {/* Input Type */}
      <div className="space-y-2">
        <Label htmlFor="inputType">Input Type</Label>
        <Select
          value={formData.inputType || "File"}
          onValueChange={(value) => onChange("inputType", value)}
        >
          <SelectTrigger id="inputType">
            <SelectValue placeholder="Select input type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="String">String</SelectItem>
            <SelectItem value="File">File</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Text Input - shown only when Input Type is String */}
      {formData.inputType === "String" && (
        <div className="space-y-2">
          <Label htmlFor="text">Text</Label>
          <Input
            id="text"
            value={formData.text || ""}
            placeholder="Enter text to parse"
            onChange={(e) => onChange("text", e.target.value)}
          />
        </div>
      )}

      {/* File Name - shown only when Input Type is File */}
      {(formData.inputType === "File" || !formData.inputType) && (
        <div className="space-y-2">
          <Label htmlFor="fileName">File Name</Label>
          <Input
            id="fileName"
            value={formData.fileName || ""}
            placeholder="C:/path/to/file.csv"
            onChange={(e) => onChange("fileName", e.target.value)}
          />
        </div>
      )}

      {/* Start Record */}
      <div className="space-y-2">
        <Label htmlFor="startRecord">Start Record</Label>
        <Input
          id="startRecord"
          type="number"
          value={formData.startRecord || 1}
          placeholder="1"
          onChange={(e) => onChange("startRecord", parseInt(e.target.value))}
        />
        <p className="text-xs text-gray-500">The line number to begin parsing. Lines before this are ignored.</p>
      </div>

      {/* Number of Records */}
      <div className="space-y-2">
        <Label htmlFor="noOfRecords">Number of Records</Label>
        <Input
          id="noOfRecords"
          type="number"
          value={formData.noOfRecords || -1}
          placeholder="-1"
          onChange={(e) => onChange("noOfRecords", parseInt(e.target.value))}
        />
        <p className="text-xs text-gray-500">Use -1 to read all records</p>
      </div>

      {/* Skip Header Characters */}
      <div className="space-y-2">
        <Label htmlFor="skipHeaderCharacters">Skip Header Characters</Label>
        <Input
          id="skipHeaderCharacters"
          type="number"
          value={formData.skipHeaderCharacters || 0}
          placeholder="0"
          onChange={(e) => onChange("skipHeaderCharacters", parseInt(e.target.value))}
        />
        <p className="text-xs text-gray-500">Skip characters when parsing (for file headers)</p>
      </div>

      {/* Data Format */}
      <div className="space-y-2">
        <Label htmlFor="dataFormat">Data Format</Label>
        <Select
          value={formData.dataFormat || "CSV"}
          onValueChange={(value) => onChange("dataFormat", value)}
        >
          <SelectTrigger id="dataFormat">
            <SelectValue placeholder="Select data format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CSV">CSV</SelectItem>
            <SelectItem value="JSON">JSON</SelectItem>
            <SelectItem value="XML">XML</SelectItem>
            <SelectItem value="Delimited">Delimited</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Continue on Error */}
      <div className="flex items-center space-x-2">
        <Switch
          id="continueOnError"
          checked={!!formData.continueOnError}
          onCheckedChange={(v) => onChange("continueOnError", v)}
        />
        <Label htmlFor="continueOnError" className="cursor-pointer">
          Continue on Error
        </Label>
      </div>

      {/* Manual Specify Start Record */}
      <div className="flex items-center space-x-2">
        <Switch
          id="manualSpecifyStartRecord"
          checked={!!formData.manualSpecifyStartRecord}
          onCheckedChange={(v) => onChange("manualSpecifyStartRecord", v)}
        />
        <Label htmlFor="manualSpecifyStartRecord" className="cursor-pointer">
          Manual Specify Start Record
        </Label>
      </div>

      {/* Submit Button */}
      <div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {loading ? "Parsing..." : "Parse Data"}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}