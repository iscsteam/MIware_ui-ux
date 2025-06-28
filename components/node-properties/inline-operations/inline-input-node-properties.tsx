"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface InlineInputNodePropertiesProps {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export const inlineInputSchema = {
  inputSchema: [
    {
      name: "content",
      datatype: "string",
      description: "Inline data content to process",
      required: true,
    },
    {
      name: "format",
      datatype: "string",
      description: "Input data format (json, csv, xml, txt)",
      required: true,
    },
    {
      name: "options",
      datatype: "object",
      description: "Format-specific input options",
      required: false,
    },
  ],
  outputSchema: [
    {
      name: "processedData",
      datatype: "object",
      description: "Processed data ready for conversion",
    },
    {
      name: "schema",
      datatype: "object",
      description: "Inferred or provided data schema",
    },
    {
      name: "format",
      datatype: "string",
      description: "Input data format",
    },
  ],
}

export default function InlineInputNodeProperties({ formData, onChange }: InlineInputNodePropertiesProps) {
  const format = formData.format || "json"

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
                id="multiLine"
                checked={options.multiLine || false}
                onCheckedChange={(checked) => handleOptionsChange("multiLine", checked)}
              />
              <Label htmlFor="multiLine">Multi-line JSON (for arrays)</Label>
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
              <Label htmlFor="header">Has header row</Label>
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
                id="inferSchema"
                checked={options.inferSchema !== true}
                onCheckedChange={(checked) => handleOptionsChange("inferSchema", checked ? "false" : "true")}
              />
              <Label htmlFor="inferSchema">Disable schema inference</Label>
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
                id="header"
                checked={options.header === "true"}
                onCheckedChange={(checked) => handleOptionsChange("header", checked ? "true" : "false")}
              />
              <Label htmlFor="header">Has header row</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inferSchema"
                checked={options.inferSchema !== true}
                onCheckedChange={(checked) => handleOptionsChange("inferSchema", checked ? "false" : "true")}
              />
              <Label htmlFor="inferSchema">Disable schema inference</Label>
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
          <CardTitle className="text-sm">Inline Input Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName || ""}
              onChange={(e) => onChange("displayName", e.target.value)}
              placeholder="Inline Input"
            />
          </div>

          <div>
            <Label htmlFor="format">Input Format</Label>
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
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content || ""}
              onChange={(e) => onChange("content", e.target.value)}
              placeholder={`Paste your ${format.toUpperCase()} content here...`}
              className="min-h-[200px] font-mono text-sm"
            />
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
              value={formData.provider || "inline"}
              onChange={(e) => onChange("provider", e.target.value)}
              placeholder="inline"
              disabled
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
