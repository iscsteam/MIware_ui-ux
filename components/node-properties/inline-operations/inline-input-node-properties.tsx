//inline-input-node-properties.tsx
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

export const inlineInputSchema: NodeSchema = {
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
    {
      name: "recordCount",
      datatype: "integer",
      description: "Number of records processed",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

// EXACT sample data from working payloads
const getSampleData = (format: string) => {
  switch (format.toLowerCase()) {
    case "json":
      return `[{"Id":"001TEST000001","Name":"Test Account 1","AccountNumber":"Acc-9581","Site":"New York","Type":"Partner","Industry":"Retail","AnnualRevenue":35739628,"Rating":"Hot","Phone":"733-268-6055","Fax":"196-540-1806","Website":"www.test1.com","TickerSymbol":"ONL","Ownership":"Subsidiary","NumberOfEmployees":3137},{"Id":"001TEST000002","Name":"Test Account 2","AccountNumber":"Acc-2567","Site":"Houston","Type":"Partner","Industry":"Technology","AnnualRevenue":83357067,"Rating":"Hot","Phone":"104-534-8003","Fax":"478-533-8893","Website":"www.test2.com","TickerSymbol":"FUV","Ownership":"Subsidiary","NumberOfEmployees":7286}]`
    case "csv":
      return `Id,Name,AccountNumber,Site,Type,Industry,AnnualRevenue,Rating,Phone,Fax,Website,TickerSymbol,Ownership,NumberOfEmployees
001TEST000001,Test Account 1,Acc-9581,New York,Partner,Retail,35739628,Hot,733-268-6055,196-540-1806,www.test1.com,ONL,Subsidiary,3137
001TEST000002,Test Account 2,Acc-2567,Houston,Partner,Technology,83357067,Hot,104-534-8003,478-533-8893,www.test2.com,FUV,Subsidiary,7286`
    case "xml":
      return `<Accounts><Account><Id>001TEST000001</Id><Name>Test Account 1</Name><AccountNumber>Acc-9581</AccountNumber><Site>New York</Site><Type>Partner</Type><Industry>Retail</Industry><AnnualRevenue>35739628</AnnualRevenue><Rating>Hot</Rating><Phone>733-268-6055</Phone><Fax>196-540-1806</Fax><Website>www.test1.com</Website><TickerSymbol>ONL</TickerSymbol><Ownership>Subsidiary</Ownership><NumberOfEmployees>3137</NumberOfEmployees></Account><Account><Id>001TEST000002</Id><Name>Test Account 2</Name><AccountNumber>Acc-2567</AccountNumber><Site>Houston</Site><Type>Partner</Type><Industry>Technology</Industry><AnnualRevenue>83357067</AnnualRevenue><Rating>Hot</Rating><Phone>104-534-8003</Phone><Fax>478-533-8893</Fax><Website>www.test2.com</Website><TickerSymbol>FUV</TickerSymbol><Ownership>Subsidiary</Ownership><NumberOfEmployees>7286</NumberOfEmployees></Account></Accounts>`
    case "txt":
      return `001TEST000001|Test Account 1|Acc-9581|New York|Partner|Retail|35739628|Hot|733-268-6055|196-540-1806|www.test1.com|ONL|Subsidiary|3137
001TEST000002|Test Account 2|Acc-2567|Houston|Partner|Technology|83357067|Hot|104-534-8003|478-533-8893|www.test2.com|FUV|Subsidiary|7286`
    default:
      return ""
  }
}

// EXACT schema from working payloads
const getExactSchema = () => ({
  fields: [
    { name: "Id", type: "string", nullable: false },
    { name: "Name", type: "string", nullable: false },
    { name: "AccountNumber", type: "string", nullable: false },
    { name: "Site", type: "string", nullable: true },
    { name: "Type", type: "string", nullable: true },
    { name: "Industry", type: "string", nullable: true },
    { name: "AnnualRevenue", type: "long", nullable: true },
    { name: "Rating", type: "string", nullable: true },
    { name: "Phone", type: "string", nullable: true },
    { name: "Fax", type: "string", nullable: true },
    { name: "Website", type: "string", nullable: true },
    { name: "TickerSymbol", type: "string", nullable: true },
    { name: "Ownership", type: "string", nullable: true },
    { name: "NumberOfEmployees", type: "integer", nullable: true },
  ],
})

export default function InlineInputNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  const format = formData.format || "json"

  const handleOptionsChange = (optionKey: string, value: any) => {
    const currentOptions = formData.options || {}
    onChange("options", { ...currentOptions, [optionKey]: value })
  }

  const handleLoadSample = () => {
    const sampleData = getSampleData(format)
    onChange("content", sampleData)

    // Set the exact schema from working payloads
    onChange("schema", getExactSchema())

    setSuccess("Sample data and schema loaded successfully!")
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleSaveConfig = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!formData.content) {
        setError("Content is required")
        return
      }

      if (!formData.format) {
        setError("Format is required")
        return
      }

      // Basic validation based on format
      if (format === "json") {
        JSON.parse(formData.content)
      }

      // Ensure exact structure from working payloads
      onChange("provider", "inline")
      onChange("active", true)

      // Set exact schema if not already set
      if (!formData.schema) {
        onChange("schema", getExactSchema())
      }

      setSuccess("Configuration saved successfully!")

      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "configured",
          data: {
            ...formData,
            provider: "inline",
            active: true,
            label: "inline-input",
            schema: formData.schema || getExactSchema(),
          },
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid content format"
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
                id="multiLine"
                checked={options.multiLine === true}
                onCheckedChange={(checked) => handleOptionsChange("multiLine", checked)}
              />
              <Label htmlFor="multiLine">Multi-line JSON</Label>
            </div>
          </div>
        )

      case "csv":
        return (
          <div className="space-y-3">
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
                checked={options.inferSchema === "false"}
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
                checked={options.header === "false"}
                onCheckedChange={(checked) => handleOptionsChange("header", checked ? "false" : "true")}
              />
              <Label htmlFor="header">No header row</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inferSchema"
                checked={options.inferSchema === "false"}
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
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="content">Content</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleLoadSample}>
                Load Sample Data
              </Button>
            </div>
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
            <Input id="provider" value="inline" disabled className="bg-gray-50" />
          </div>

          <div>
            <Button onClick={handleSaveConfig} disabled={loading || !formData.content} className="w-full">
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
