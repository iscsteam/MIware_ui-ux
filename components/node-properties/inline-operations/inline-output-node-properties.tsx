//inline-output-node-properties.tsx
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useWorkflow } from "@/components/workflow/workflow-context"

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

export const inlineOutputSchema: NodeSchema = {
  inputSchema: [
    {
      name: "processedData",
      datatype: "object",
      description: "Data to convert and save",
      required: true,
    },
    {
      name: "format",
      datatype: "string",
      description: "Output format (json, csv, xml, txt)",
      required: true,
    },
    {
      name: "path",
      datatype: "string",
      description: "Output file path",
      required: true,
    },
  ],
  outputSchema: [
    {
      name: "filePath",
      datatype: "string",
      description: "Path where file was saved",
    },
    {
      name: "success",
      datatype: "boolean",
      description: "Whether the conversion was successful",
    },
    {
      name: "recordCount",
      datatype: "integer",
      description: "Number of records processed",
    },
    {
      name: "fileSize",
      datatype: "integer",
      description: "Size of the output file in bytes",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function InlineOutputNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  const format = formData.format || "csv"

  const handleOptionsChange = (optionKey: string, value: any) => {
    const currentOptions = formData.options || {}
    onChange("options", { ...currentOptions, [optionKey]: value })
  }

  const handleSaveConfig = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!formData.path) {
        setError("Output path is required")
        return
      }

      if (!formData.format) {
        setError("Output format is required")
        return
      }

      // Ensure provider and mode are set
      onChange("provider", formData.provider || "local")
      onChange("mode", formData.mode || "overwrite")
      onChange("active", true)

      setSuccess("Configuration saved successfully!")

      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "configured",
          data: {
            ...formData,
            provider: formData.provider || "local",
            mode: formData.mode || "overwrite",
            active: true,
            label: "inline-output",
          },
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Configuration validation failed"
      setError(errorMessage)

      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "error",
          error: errorMessage,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const renderFormatOptions = () => {
    const options = formData.options || {}

    switch (format) {
      case "json":
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="singleFile"
                checked={options.singleFile !== false}
                onCheckedChange={(checked) => handleOptionsChange("singleFile", checked)}
              />
              <Label htmlFor="singleFile">Single file output</Label>
            </div>
          </div>
        )

      case "csv":
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="header"
                checked={options.header !== "false"}
                onCheckedChange={(checked) => handleOptionsChange("header", checked ? "true" : "false")}
              />
              <Label htmlFor="header">Include header row</Label>
            </div>
            <div>
              <Label htmlFor="delimiter">Delimiter</Label>
              <Input
                id="delimiter"
                value={options.delimiter || ","}
                onChange={(e) => handleOptionsChange("delimiter", e.target.value)}
                placeholder=","
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="singleFile"
                checked={options.singleFile !== false}
                onCheckedChange={(checked) => handleOptionsChange("singleFile", checked)}
              />
              <Label htmlFor="singleFile">Single file output</Label>
            </div>
          </div>
        )

      case "xml":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="rowTag">Row Tag</Label>
              <Input
                id="rowTag"
                value={options.rowTag || "Account"}
                onChange={(e) => handleOptionsChange("rowTag", e.target.value)}
                placeholder="Account"
              />
            </div>
            <div>
              <Label htmlFor="rootTag">Root Tag</Label>
              <Input
                id="rootTag"
                value={options.rootTag || "Accounts"}
                onChange={(e) => handleOptionsChange("rootTag", e.target.value)}
                placeholder="Accounts"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="singleFile"
                checked={options.singleFile !== false}
                onCheckedChange={(checked) => handleOptionsChange("singleFile", checked)}
              />
              <Label htmlFor="singleFile">Single file output</Label>
            </div>
          </div>
        )

      case "txt":
        return (
          <div className="space-y-3">
             <div className="flex items-center space-x-2">
              <Checkbox
                id="header"
                checked={options.header !== "false"}
                onCheckedChange={(checked) => handleOptionsChange("header", checked ? "true" : "false")}
              />
              <Label htmlFor="header">Include header row</Label>
            </div>
            <div>
              <Label htmlFor="delimiter">Delimiter</Label>
              <Input
                id="delimiter"
                value={options.delimiter || "|"}
                onChange={(e) => handleOptionsChange("delimiter", e.target.value)}
                placeholder="|"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="singleFile"
                checked={options.singleFile !== false}
                onCheckedChange={(checked) => handleOptionsChange("singleFile", checked)}
              />
              <Label htmlFor="singleFile">Single file output</Label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Inline Output Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="format">Output Format</Label>
            <Select value={format} onValueChange={(value) => onChange("format", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="txt">TXT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="path">Output Path</Label>
            <Input
              id="path"
              value={formData.path || ""}
              onChange={(e) => onChange("path", e.target.value)}
              placeholder="/app/data/output/converted_file"
            />
            <p className="text-xs text-gray-500 mt-1">File extension will be added automatically based on format</p>
          </div>

          <div>
            <Label htmlFor="mode">Write Mode</Label>
            <Select value={formData.mode || "overwrite"} onValueChange={(value) => onChange("mode", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overwrite">Overwrite</SelectItem>
                <SelectItem value="append">Append</SelectItem>
                <SelectItem value="error">Error if exists</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium">Format Options</Label>
            {renderFormatOptions()}
          </div>

          <div>
            <Label htmlFor="provider">Provider</Label>
            <Select value={formData.provider || "local"} onValueChange={(value) => onChange("provider", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="s3">S3</SelectItem>
                <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                <SelectItem value="azure">Azure Blob Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Button
              onClick={handleSaveConfig}
              disabled={loading || !formData.path || !formData.format}
              className="w-full"
            >
              {loading ? "Saving..." : "Save Configuration"}
            </Button>
          </div>

          {/* Feedback */}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
