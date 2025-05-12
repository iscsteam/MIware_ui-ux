// // //readfilenodeproperties.tsx
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react" 
import { useWorkflow } from "../workflow/workflow-context"

// Define the read file node schema directly in this component
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

// Read File node schema
export const readFileSchema: NodeSchema = {
  inputSchema: [
    {
      name: "filename",
      datatype: "string",
      description: "The path and name of the file to read.",
      required: true,
    },
    {
      name: "encoding",
      datatype: "string",
      description: "The character encoding of the file (e.g., UTF-8, ASCII).",
    }
  ],
  outputSchema: [
    {
      name: "fileContents",
      datatype: "string",
      description: "The contents of the file that was read.",
    },
    {
      name: "fileInfo",
      datatype: "complex",
      description: "This element contains fullName, fileName, location, type, readProtected, writeProtected, size, and lastModified data.",
    },
    {
      name: "fullName",
      datatype: "string",
      description: "The name of the file with the path information.",
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
      description: "An optional element. It is not populated by this activity.",
    },
    {
      name: "type",
      datatype: "string",
      description: "The file type.",
    },
    {
      name: "readProtected",
      datatype: "boolean",
      description: "Signifies whether the file or directory is protected from reading.",
    },
    {
      name: "writeProtected",
      datatype: "boolean",
      description: "Signifies whether the file or directory is protected from writing.",
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
    {
      name: "success",
      datatype: "boolean",
      description: "Indicates whether the file read operation was successful.",
    },
    {
      name: "error",
      datatype: "string",
      description: "Error message if the operation failed.",
    }
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function ReadFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  // Read file operation function
  async function handleReadFile() {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const response = await fetch("http://localhost:5000/api/file-operations/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: formData.filename,
          label: formData.label,
          encoding: formData.encoding || "utf-8"
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to read file")
      }

      setSuccessMessage("File read successfully!")
      console.log("FileMeta:", data.fileMeta)
      
      // Update the node output with the API response data
      if (selectedNodeId) {
        updateNode(selectedNodeId, { 
          status: "success",
          output: {
            ...data,
            fileContents: data.content || data.fileContents,
            path: data.filename || formData.filename,
            size: data.size || (data.fileMeta && data.fileMeta.size),
            modifiedDate: data.modifiedDate || (data.fileMeta && data.fileMeta.modifiedTime),
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
            filename: formData.filename,
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
      {/* File Name */}
      <div className="space-y-2">
        <Label htmlFor="filename">File Path</Label>
        <Input
          id="filename"
          value={formData.filename || ""}
          placeholder="path/to/file.txt"
          onChange={(e) => onChange("filename", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          {readFileSchema.inputSchema[0].description}
          {readFileSchema.inputSchema[0].required && " (Required)"}
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
          {readFileSchema.inputSchema[1].description}
        </p>
      </div>

      {/* Read File Button */}
      <div>
        <Button 
          onClick={handleReadFile} 
          disabled={loading || !formData.filename}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? "Reading..." : "Read File"}
        </Button>
      </div>

      {/* Success or Error messages */}
      {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}