"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { NodeSchema } from "@/services/interface" // Import SchemaItem and NodeSchema types
import { useEffect } from "react" // Import useEffect

interface WriteNodePropertiesProps {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

// Define Write Node schema
export const writeNodeSchema: NodeSchema = {
  label: "Write Node",
  description: "Writes content, copies, appends, or compresses files based on configuration.",
  inputSchema: [
    {
      name: "operation",
      datatype: "string",
      description: "The type of write operation (e.g., 'write', 'copy').",
      required: true,
      sourceNodeId: "",
      originalName: "",
    },
    {
      name: "source_path",
      datatype: "string",
      description: "Path to the source file for copy operations. Leave empty for new file creation or append-only.",
      required: false,
      sourceNodeId: "",
      originalName: "",
    },
    {
      name: "destination_path",
      datatype: "string",
      description: "The path where the content will be written or copied.",
      required: true,
      sourceNodeId: "",
      originalName: "",
    },
    {
      name: "options",
      datatype: "complex",
      description: "Additional options for the write operation.",
      required: false,
      sourceNodeId: "",
      originalName: "",
      properties: [
        {
          name: "append",
          datatype: "boolean",
          description: "If true, content is appended; otherwise, it overwrites.",
          required: false,
        },
        {
          name: "textContent",
          datatype: "string",
          description: "The text content to write or append. Required if source_path is empty.",
          required: false,
        },
        {
          name: "addLineSeparator",
          datatype: "boolean",
          description: "Adds a new line before appending content (only if append is true).",
          required: false,
        },
        {
          name: "create_dirs",
          datatype: "boolean",
          description: "If true, creates parent directories if they do not exist.",
          required: false,
        },
        {
          name: "compress",
          datatype: "string",
          description: "Type of compression to apply during copy (e.g., 'GZip', 'Deflate').",
          required: false,
        },
      ],
    },
  ],
  outputSchema: [
    {
      name: "success",
      datatype: "boolean",
      description: "Indicates whether the write operation was successful.",
      sourceNodeId: "",
      originalName: "",
    },
    {
      name: "message",
      datatype: "string",
      description: "A descriptive message about the operation's outcome.",
      sourceNodeId: "",
      originalName: "",
    },
    {
      name: "destination_path",
      datatype: "string",
      description: "The full path of the file after the operation.",
      sourceNodeId: "",
      originalName: "",
    },
    {
      name: "file_size",
      datatype: "integer",
      description: "The size of the destination file in bytes after the operation.",
      sourceNodeId: "",
      originalName: "",
    },
    {
      name: "compressed_size",
      datatype: "integer",
      description: "The size of the compressed file in bytes (if compression was applied).",
      required: false,
      sourceNodeId: "",
      originalName: "",
    },
  ],
}

export default function WriteNodeProperties({ formData, onChange }: WriteNodePropertiesProps) {
  const handleOptionChange = (optionName: string, value: any) => {
    const updatedOptions = { ...formData.options, [optionName]: value }
    onChange("options", updatedOptions)

    // Debug logging for textContent changes
    if (optionName === "textContent") {
      console.log("📝 WriteNodeProperties: textContent updated:", {
        newValue: value,
        valueLength: value?.length || 0,
        formDataOptions: updatedOptions,
      })
    }
  }

  const operation = formData.operation || "write" // Default to 'write' if not set
  const sourcePath = formData.source_path || ""
  const append = formData.options?.append || false

  // Debug logging for form data changes
  useEffect(() => {
    console.log("🔍 WriteNodeProperties: Form data updated:", {
      hasOptions: !!formData.options,
      hasTextContent: !!formData.options?.textContent,
      textContentLength: formData.options?.textContent?.length || 0,
      textContentPreview: formData.options?.textContent?.substring(0, 50) + "..." || "none",
    })
  }, [formData.options]) // Use formData.options as the dependency

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="operation" className="text-sm font-medium text-gray-700">
          Operation Type
        </Label>
        <Select value={operation} onValueChange={(value) => onChange("operation", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select operation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="write">Write</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          Defines the primary action of the node (e.g., write, copy, append).
        </p>
      </div>

      <div>
        <Label htmlFor="source_path" className="text-sm font-medium text-gray-700">
          Source Path (Optional for new file/append only)
        </Label>
        <Input
          id="source_path"
          value={sourcePath}
          onChange={(e) => onChange("source_path", e.target.value)}
          placeholder="/app/data/input/source.txt"
        />
        <p className="text-xs text-gray-500 mt-1">
          Path to the source file for copy operations. Leave empty for append-only or writing new content.
        </p>
      </div>

      <div>
        <Label htmlFor="destination_path" className="text-sm font-medium text-gray-700">
          Destination Path
        </Label>
        <Input
          id="destination_path"
          value={formData.destination_path || ""}
          onChange={(e) => onChange("destination_path", e.target.value)}
          placeholder="/app/data/output/destination.txt"
        />
        <p className="text-xs text-gray-500 mt-1">The path where the content will be written or copied.</p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="append" checked={append} onCheckedChange={(checked) => handleOptionChange("append", checked)} />
        <Label htmlFor="append" className="text-sm font-medium text-gray-700">
          Append Content
        </Label>
        <p className="text-xs text-gray-500 mt-1">
          If enabled, content will be appended to the destination file. Otherwise, it will overwrite.
        </p>
      </div>

      {(append || sourcePath === "") && ( // Show textContent if appending or no source path (new file)
        <div>
          <Label htmlFor="textContent" className="text-sm font-medium text-gray-700">
            Text Content
            {formData.options?.textContent && (
              <span className="text-xs text-green-600 ml-2">({formData.options.textContent.length} characters)</span>
            )}
          </Label>
          <Textarea
            id="textContent"
            value={formData.options?.textContent || ""}
            onChange={(e) => {
              console.log("📝 Textarea onChange triggered:", {
                newValue: e.target.value,
                valueLength: e.target.value.length,
              })
              handleOptionChange("textContent", e.target.value)
            }}
            placeholder="Enter content to write or append..."
            rows={5}
          />
          <p className="text-xs text-gray-500 mt-1">The text content to write or append to the destination file.</p>
        </div>
      )}

      {append && (
        <div className="flex items-center space-x-2">
          <Switch
            id="addLineSeparator"
            checked={formData.options?.addLineSeparator || false}
            onCheckedChange={(checked) => handleOptionChange("addLineSeparator", checked)}
          />
          <Label htmlFor="addLineSeparator" className="text-sm font-medium text-gray-700">
            Add Line Separator
          </Label>
          <p className="text-xs text-gray-500 mt-1">Adds a new line before appending content. Useful for logs.</p>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="create_dirs"
          checked={formData.options?.create_dirs || false}
          onCheckedChange={(checked) => handleOptionChange("create_dirs", checked)}
        />
        <Label htmlFor="create_dirs" className="text-sm font-medium text-gray-700">
          Create Directories
        </Label>
        <p className="text-xs text-gray-500 mt-1">If enabled, creates parent directories if they do not exist.</p>
      </div>

      {/* Compression option - now always visible */}
      <div>
        <Label htmlFor="compress" className="text-sm font-medium text-gray-700">
          Compression Type (Optional)
        </Label>
        <Select
          value={formData.options?.compress || "none"}
          onValueChange={(value) => handleOptionChange("compress", value === "none" ? "" : value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="No compression" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="GZip">GZip</SelectItem>
            <SelectItem value="Deflate">Deflate</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          {sourcePath !== "" && !append 
            ? "Compresses the file during the copy operation."
            : "Compresses the content when writing to the destination file."
          }
        </p>
      </div>
    </div>
  )
}