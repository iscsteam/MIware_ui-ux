// WriteFileNodeProperties.tsx
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { useWorkflow } from "../workflow/workflow-context"

// Define the schema directly in this component
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

// Write File node schema
export const writeFileSchema: NodeSchema = {
  inputSchema: [
    {
      name: "fileName",
      datatype: "string",
      description: "The path and name of the file. Wildcards are not permitted in this field.",
      required: true,
    },
    {
      name: "textContent",
      datatype: "string",
      description:
        "The contents of the file (text files). This field is present when Write as is set to Text. When Write as is set to Binary, this field is replaced by the field binaryContent.",
    },
    {
      name: "addLineSeparator",
      datatype: "boolean",
      description:
        "This specifies whether to add a carriage return after each input line. This field is present when the value of the Write as field on the General tab is set to Text.",
    },
    {
      name: "encoding",
      datatype: "string",
      description:
        "The character encoding for text files. This element is available only when Text is specified in the Write as field on the General tab.",
    },
  ],
  outputSchema: [
    {
      name: "fileInfo",
      datatype: "complex",
      description: "This element contains the fileName, location, type, readProtected, writeProtected, and size data.",
    },
    {
      name: "fullName",
      datatype: "string",
      description: "The name of the file, including the path information.",
    },
    {
      name: "fileName",
      datatype: "string",
      description: "The name of the file without the path information.",
    },
    {
      name: "location",
      datatype: "string",
      description: "The path to the file.",
    },
    {
      name: "configuredFileName",
      datatype: "string",
      description: "An optional element. This element is not populated by this activity.",
    },
    {
      name: "type",
      datatype: "string",
      description: "The file type.",
    },
    {
      name: "wasProtected",
      datatype: "boolean",
      description: "Signifies whether the file or directory is protected from reading",
    },
    {
      name: "size",
      datatype: "integer",
      description: "The size of the file in bytes.",
    },
    {
      name: "lastModified",
      datatype: "string",
      description: "The timestamp indicating when the file was last modified.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function WriteFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  // Write file operation function
  async function handleWriteFile() {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const response = await fetch("http://localhost:5000/api/file-operations/write", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: formData.fileName,
          textContent: formData.textContent || "",
          addLineSeparator: formData.addLineSeparator || false,
          encoding: formData.encoding || "utf-8",
          label: formData.label
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to write file")
      }

      setSuccessMessage("File written successfully!")
      
      // Update the node output with the API response data
      if (selectedNodeId) {
        updateNode(selectedNodeId, { 
          status: "success",
          output: {
            ...data,
            fullName: data.fileName || formData.fileName,
            fileName: data.fileName?.split("/").pop() || formData.fileName.split("/").pop(),
            location: data.fileName?.substring(0, data.fileName.lastIndexOf("/")) || 
                      formData.fileName.substring(0, formData.fileName.lastIndexOf("/")),
            size: data.size,
            lastModified: data.lastModified,
            success: true
          }
        })
      }
    } catch (err: any) {
      console.error(err)
      const errorMessage = err.message || "Unknown error occurred"
      setError(errorMessage)
      
      // Update the node with error status
      if (selectedNodeId) {
        updateNode(selectedNodeId, { 
          status: "error",
          error: errorMessage,
          output: { 
            error: errorMessage,
            fileName: formData.fileName,
            success: false
          }
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Node Label */}
      {/* <div className="space-y-2">
        <Label htmlFor="label">Node Label</Label>
        <Input
          id="label"
          value={formData.label || ""}
          placeholder="Node label (e.g., Write Config File)"
          onChange={(e) => onChange("label", e.target.value)}
        />
      </div> */}

      {/* File Name */}
      <div className="space-y-2">
        <Label htmlFor="fileName">File Name</Label>
        <Input
          id="fileName"
          value={formData.fileName || ""}
          placeholder="path/to/file.txt"
          onChange={(e) => onChange("fileName", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          {writeFileSchema.inputSchema[0].description}
          {writeFileSchema.inputSchema[0].required && " (Required)"}
        </p>
      </div>

      {/* Text Content */}
      <div className="space-y-2">
        <Label htmlFor="textContent">Content</Label>
        <Textarea
          id="textContent"
          value={formData.textContent || ""}
          placeholder="File content..."
          className="min-h-[150px]"
          onChange={(e) => onChange("textContent", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          {writeFileSchema.inputSchema[1].description}
        </p>
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
        <p className="text-xs text-gray-500">
          {writeFileSchema.inputSchema[3].description}
        </p>
      </div>

      {/* Add Line Separator */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="addLineSeparator"
          checked={formData.addLineSeparator || false}
          onCheckedChange={(checked) => onChange("addLineSeparator", checked)}
        />
        <Label htmlFor="addLineSeparator" className="text-sm font-normal">
          Add line separator
        </Label>
      </div>
      <p className="text-xs text-gray-500 -mt-2">
        {writeFileSchema.inputSchema[2].description}
      </p>

      {/* Write File Button */}
      <div>
        <Button 
          onClick={handleWriteFile} 
          disabled={loading || !formData.fileName}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? "Writing..." : "Write File"}
        </Button>
      </div>

      {/* Success or Error messages */}
      {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}