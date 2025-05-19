//ReadFileNodeProperties.tsx

"use client"

import type React from "react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useWorkflow } from "../workflow/workflow-context"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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

export const readFileSchema: NodeSchema = {
  inputSchema: [
    {
      name: "provider",
      datatype: "string",
      description: "Data source provider (e.g., local, s3).",
      required: true,
    },
    {
      name: "format",
      datatype: "string",
      description: "File format (e.g., csv, json, xml).",
      required: true,
    },
    {
      name: "path",
      datatype: "string",
      description: "File path to read from.",
      required: true,
    },
    {
      name: "rowTag",
      datatype: "string",
      description: "Row tag for XML files (if applicable).",
    },
    {
      name: "rootTag",
      datatype: "string",
      description: "Root tag for XML files (if applicable).",
    },
  ],
  outputSchema: [
    {
      name: "content",
      datatype: "string",
      description: "The content of the file.",
    },
    {
      name: "fileMeta",
      datatype: "object",
      description: "Metadata about the file (size, modified time, etc).",
    },
    {
      name: "success",
      datatype: "boolean",
      description: "Whether the read operation was successful.",
    },
    { name: "error", datatype: "string", description: "Error message if any." },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

// Function to parse schema from text input
const parseSchemaFromText = (schemaText: string) => {
  try {
    return JSON.parse(schemaText)
  } catch (error) {
    console.error("Failed to parse schema:", error)
    return null
  }
}

// Format-specific options
const formatOptions = {
  csv: { header: true, inferSchema: true },
  json: { multiline: true },
  xml: { rowTag: "Record", rootTag: "Records" },
}

export default function ReadFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [subfolder, setSubfolder] = useState<string>("uploads")
  const [schemaText, setSchemaText] = useState<string>("")
  const { updateNode, selectedNodeId } = useWorkflow()

  // Initialize schema text from formData if available
  useEffect(() => {
    if (formData.schema) {
      try {
        setSchemaText(JSON.stringify(formData.schema, null, 2))
      } catch (error) {
        console.error("Error stringifying schema:", error)
      }
    }
  }, [formData.schema])

  // Handle format change to update options
  useEffect(() => {
    const newOptions = formatOptions[formData.format as keyof typeof formatOptions] || {}
    const currentOptions = formData.options || {}

    if (JSON.stringify(newOptions) !== JSON.stringify(currentOptions)) {
      onChange("options", newOptions)
    }
  }, [formData.format, formData.options, onChange])

  // Handle schema text changes
  const handleSchemaTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSchemaText = e.target.value
    setSchemaText(newSchemaText)

    // Try to parse the schema and update formData if valid
    const parsedSchema = parseSchemaFromText(newSchemaText)
    if (parsedSchema) {
      onChange("schema", parsedSchema)
    }
  }

  // Handle format selection
  const handleFormatChange = (value: string) => {
    onChange("format", value)

    // Set format-specific options
    if (formatOptions[value as keyof typeof formatOptions]) {
      onChange("options", formatOptions[value as keyof typeof formatOptions])
    } else {
      // Clear options if format is not recognized
      onChange("options", {})
    }
  }

  async function handleReadFile() {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Prepare the request body with format-specific options
      const requestBody = {
        provider: formData.provider,
        format: formData.format,
        path: formData.path,
        options: formData.options || {},
      }

      // Log the request body to verify options
      console.log("Read file request:", requestBody)

      // The API call has been removed as requested
      // Simulate a successful response
      const data = {
        content: "File content would be here",
        fileMeta: {
          format: formData.format,
          path: formData.path,
          options: formData.options || {},
        },
      }

      setSuccessMessage("File read successfully!")

      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "success",
          output: {
            content: data.content || "",
            fileMeta: data.fileMeta || {},
            path: formData.path,
            success: true,
          },
        })
      }
    } catch (err: any) {
      const errorMessage = err.message || "Unknown error"
      setError(errorMessage)
      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "error",
          output: { error: errorMessage, path: formData.path, success: false },
        })
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const formDataObj = new FormData()
      formDataObj.append("file", file)
      formDataObj.append("subfolder", subfolder)

      const res = await fetch("http://localhost:30010/uploads/", {
        method: "POST",
        body: formDataObj,
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.detail || "Upload failed")

      onChange("path", result.path || file.name)
      setSuccessMessage(`Uploaded ${file.name} to "${subfolder}" successfully`)
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Display current options based on selected format
  const renderCurrentOptions = () => {
    if (!formData.options) return null

    return (
      <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
        <p className="font-medium text-gray-700">Current Options:</p>
        <pre className="text-xs overflow-x-auto">{JSON.stringify(formData.options, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Provider */}
      <div className="space-y-1">
        <Label htmlFor="provider">Provider</Label>
        <Input
          id="provider"
          value={formData.provider || ""}
          placeholder="e.g., local"
          onChange={(e) => onChange("provider", e.target.value)}
        />
      </div>

      {/* Format */}
      <div className="space-y-1">
        <Label htmlFor="format">Format</Label>
        <Select value={formData.format || ""} onValueChange={handleFormatChange}>
          <SelectTrigger id="format">
            <SelectValue placeholder="Select file format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
            <SelectItem value="parquet">Parquet</SelectItem>
            <SelectItem value="avro">Avro</SelectItem>
            <SelectItem value="orc">ORC</SelectItem>
          </SelectContent>
        </Select>
        {renderCurrentOptions()}
      </div>

      {/* Subfolder */}
      <div className="space-y-1">
        <Label htmlFor="subfolder">Subfolder (for upload)</Label>
        <Input id="subfolder" value={subfolder} placeholder="uploads" onChange={(e) => setSubfolder(e.target.value)} />
      </div>

      {/* File Upload */}
      <div className="space-y-1">
        <Label htmlFor="upload">Upload File</Label>
        <Input id="upload" type="file" onChange={handleFileUpload} disabled={uploading} />
      </div>

      {/* File Path */}
      <div className="space-y-1">
        <Label htmlFor="path">File Path</Label>
        <Input
          id="path"
          value={formData.path || ""}
          placeholder="/app/data/input/file.csv"
          onChange={(e) => onChange("path", e.target.value)}
        />
      </div>

      {/* Schema Configuration */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="schema">
          <AccordionTrigger>Schema Configuration</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Label htmlFor="schema">Schema (JSON format)</Label>
              <Textarea
                id="schema"
                value={schemaText}
                onChange={handleSchemaTextChange}
                placeholder={`{
  "fields": [
    {
      "name": "Id",
      "type": "string",
      "nullable": false
    },
    {
      "name": "Name",
      "type": "string",
      "nullable": false
    }
  ]
}`}
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Enter the schema in JSON format. This will be used to define the structure of the input data.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Read File Button */}
      <div>
        <Button
          onClick={handleReadFile}
          disabled={loading || uploading || !formData.path}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? "Reading..." : "Read File"}
        </Button>
      </div>

      {/* Feedback */}
      {successMessage && <p className="text-green-600">{successMessage}</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  )
}
