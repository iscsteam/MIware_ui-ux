"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface InlineOutputNodePropertiesProps {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export const inlineOutputSchema = {
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
  ],
}

export default function InlineOutputNodeProperties({ formData, onChange }: InlineOutputNodePropertiesProps) {
  const format = formData.format || "csv"

  const handleOptionsChange = (optionKey: string, value: any) => {
    const currentOptions = formData.options || {}
    onChange("options", { ...currentOptions, [optionKey]: value })
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
                checked={options.header !== false}
                onCheckedChange={(checked) => handleOptionsChange("header", checked ? "true" : "false")}
              />
              <Label htmlFor="header">Include header row</Label>
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
                value={options.rowTag || ""}
                onChange={(e) => handleOptionsChange("rowTag", e.target.value)}
                placeholder="e.g., Account"
              />
            </div>
            <div>
              <Label htmlFor="rootTag">Root Tag</Label>
              <Input
                id="rootTag"
                value={options.rootTag || ""}
                onChange={(e) => handleOptionsChange("rootTag", e.target.value)}
                placeholder="e.g., Accounts"
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
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName || ""}
              onChange={(e) => onChange("displayName", e.target.value)}
              placeholder="Inline Output"
            />
          </div>

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
              placeholder="/app/data/mock_data/output/converted_file"
            />
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
            <Input
              id="provider"
              value={formData.provider || "local"}
              onChange={(e) => onChange("provider", e.target.value)}
              placeholder="local"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
