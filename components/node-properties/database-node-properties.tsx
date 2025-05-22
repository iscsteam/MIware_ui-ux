//database-node-properties.tsx
"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useWorkflow } from "@/components/workflow/workflow-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2 } from "lucide-react"

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

// Format-specific options
const formatOptions = {
  csv: { header: "true", inferSchema: "false" },
  json: { multiline: "true" },
  parquet: {},
  avro: {},
  orc: {},
}

// Database provider options
const databaseProviders = {
  postgresql: { driver: "org.postgresql.Driver", batchsize: "5000" },
  mysql: { driver: "com.mysql.cj.jdbc.Driver", batchsize: "5000" },
  sqlserver: { driver: "com.microsoft.sqlserver.jdbc.SQLServerDriver", batchsize: "5000" },
  oracle: { driver: "oracle.jdbc.driver.OracleDriver", batchsize: "5000" },
}

// Database node schema
export const databaseSchema: NodeSchema = {
  inputSchema: [
    {
      name: "input.provider",
      datatype: "string",
      description: "Input data source provider (e.g., local, s3).",
      required: true,
    },
    {
      name: "input.format",
      datatype: "string",
      description: "Input file format (e.g., csv, json, parquet).",
      required: true,
    },
    {
      name: "input.path",
      datatype: "string",
      description: "Input file path or source location.",
      required: true,
    },
    {
      name: "input.options",
      datatype: "complex",
      description: "Input format-specific options.",
      required: false,
    },
    {
      name: "input.schema",
      datatype: "complex",
      description: "Schema definition for the input data.",
      required: false,
    },
    {
      name: "output.provider",
      datatype: "string",
      description: "Output data provider (e.g., postgresql, mysql).",
      required: true,
    },
    {
      name: "output.format",
      datatype: "string",
      description: "Output format (usually 'sql' for databases).",
      required: true,
    },
    {
      name: "output.path",
      datatype: "string",
      description: "Database connection string.",
      required: true,
    },
    {
      name: "output.mode",
      datatype: "string",
      description: "Write mode (overwrite, append).",
      required: true,
    },
    {
      name: "output.options",
      datatype: "complex",
      description: "Database-specific options (table, user, password, etc.).",
      required: true,
    },
  ],
  outputSchema: [
    {
      name: "success",
      datatype: "boolean",
      description: "Whether the database operation was successful.",
    },
    {
      name: "rowsProcessed",
      datatype: "integer",
      description: "Number of rows processed in the operation.",
    },
    {
      name: "executionTime",
      datatype: "integer",
      description: "Time taken to execute the operation in milliseconds.",
    },
    {
      name: "message",
      datatype: "string",
      description: "Status message or error details.",
    },
    {
      name: "timestamp",
      datatype: "string",
      description: "Timestamp of when the operation completed.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function DatabaseNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()
  const [activeTab, setActiveTab] = useState("input")

  // Initialize nested structure if not present
  useEffect(() => {
    if (!formData.input) {
      onChange("input", {
        provider: "local",
        format: "csv",
        options: formatOptions.csv,
      })
    }
    if (!formData.output) {
      onChange("output", {
        provider: "postgresql",
        format: "sql",
        mode: "overwrite",
        options: databaseProviders.postgresql,
      })
    }
  }, [formData])

  // Handle input format change to update options
  useEffect(() => {
    if (formData.input?.format && formatOptions[formData.input.format as keyof typeof formatOptions]) {
      const newOptions = formatOptions[formData.input.format as keyof typeof formatOptions]
      const currentOptions = formData.input.options || {}

      if (JSON.stringify(newOptions) !== JSON.stringify(currentOptions)) {
        const updatedInput = { ...formData.input, options: newOptions }
        onChange("input", updatedInput)
      }
    }
  }, [formData.input?.format, formData])

  // Handle output provider change to update options
  useEffect(() => {
    if (formData.output?.provider && databaseProviders[formData.output.provider as keyof typeof databaseProviders]) {
      const newOptions = databaseProviders[formData.output.provider as keyof typeof databaseProviders]
      const currentOptions = formData.output.options || {}

      // Preserve user-entered values like table, user, password
      const preservedOptions = {
        table: currentOptions.table || "",
        user: currentOptions.user || "",
        password: currentOptions.password || "",
      }

      const mergedOptions = { ...newOptions, ...preservedOptions }

      if (JSON.stringify(mergedOptions) !== JSON.stringify(currentOptions)) {
        const updatedOutput = { ...formData.output, options: mergedOptions }
        onChange("output", updatedOutput)
      }
    }
  }, [formData.output?.provider])

  // Handle input nested field changes
  const handleInputChange = (field: string, value: any) => {
    const updatedInput = { ...formData.input, [field]: value }
    onChange("input", updatedInput)
  }

  // Handle output nested field changes
  const handleOutputChange = (field: string, value: any) => {
    const updatedOutput = { ...formData.output, [field]: value }
    onChange("output", updatedOutput)
  }

  // Handle input options change
  const handleInputOptionChange = (option: string, value: any) => {
    const updatedOptions = { ...(formData.input?.options || {}), [option]: value }
    handleInputChange("options", updatedOptions)
  }

  // Handle output options change
  const handleOutputOptionChange = (option: string, value: any) => {
    const updatedOptions = { ...(formData.output?.options || {}), [option]: value }
    handleOutputChange("options", updatedOptions)
  }

  // Handle schema field changes
  const handleSchemaFieldChange = (index: number, field: string, value: any) => {
    const updatedSchema = { ...(formData.input?.schema || {}) }

    if (!updatedSchema.fields) {
      updatedSchema.fields = []
    }

    // Ensure the fields array has enough elements
    while (updatedSchema.fields.length <= index) {
      updatedSchema.fields.push({ name: "", type: "string", nullable: true })
    }

    updatedSchema.fields[index] = {
      ...updatedSchema.fields[index],
      [field]: value,
    }

    handleInputChange("schema", updatedSchema)
  }

  // Add a new schema field
  const addSchemaField = () => {
    const updatedSchema = { ...(formData.input?.schema || {}) }

    if (!updatedSchema.fields) {
      updatedSchema.fields = []
    }

    updatedSchema.fields.push({ name: "", type: "string", nullable: true })
    handleInputChange("schema", updatedSchema)
  }

  // Remove a schema field
  const removeSchemaField = (index: number) => {
    const updatedSchema = { ...(formData.input?.schema || {}) }

    if (updatedSchema.fields && updatedSchema.fields.length > index) {
      updatedSchema.fields.splice(index, 1)
      handleInputChange("schema", updatedSchema)
    }
  }

  // Execute database operation
  async function handleExecuteDatabase() {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Simulate database operation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "success",
          output: {
            success: true,
            rowsProcessed: Math.floor(Math.random() * 1000) + 100,
            executionTime: Math.floor(Math.random() * 5000) + 500,
            message: "Database operation completed successfully",
            timestamp: new Date().toISOString(),
          },
        })
      }

      setSuccessMessage("Database operation executed successfully!")
    } catch (err: any) {
      console.error(err)
      const errorMessage = err.message || "Unknown error occurred"
      setError(errorMessage)

      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "error",
          error: errorMessage,
          output: {
            success: false,
            message: errorMessage,
            timestamp: new Date().toISOString(),
          },
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">Input Configuration</TabsTrigger>
          <TabsTrigger value="output">Output Configuration</TabsTrigger>
        </TabsList>

        {/* Input Configuration Tab */}
        <TabsContent value="input" className="space-y-4">
          {/* Input Provider */}
          <div className="space-y-2">
            <Label htmlFor="input-provider">Provider</Label>
            <Select
              value={formData.input?.provider || "local"}
              onValueChange={(value) => handleInputChange("provider", value)}
            >
              <SelectTrigger id="input-provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="s3">S3</SelectItem>
                <SelectItem value="hdfs">HDFS</SelectItem>
                <SelectItem value="azure">Azure Blob</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Data source provider for input</p>
          </div>

          {/* Input Format */}
          <div className="space-y-2">
            <Label htmlFor="input-format">Format</Label>
            <Select
              value={formData.input?.format || "csv"}
              onValueChange={(value) => handleInputChange("format", value)}
            >
              <SelectTrigger id="input-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="parquet">Parquet</SelectItem>
                <SelectItem value="avro">Avro</SelectItem>
                <SelectItem value="orc">ORC</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">File format for input data</p>
          </div>

          {/* Input Path */}
          <div className="space-y-2">
            <Label htmlFor="input-path">Path</Label>
            <Input
              id="input-path"
              value={formData.input?.path || ""}
              placeholder="/path/to/input/file.csv"
              onChange={(e) => handleInputChange("path", e.target.value)}
            />
            <p className="text-xs text-gray-500">Path to the input file or data source</p>
          </div>

          {/* Input Options */}
          {formData.input?.format === "csv" && (
            <div className="space-y-2">
              <Label>CSV Options</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="header-option"
                  checked={formData.input?.options?.header === "true"}
                  onCheckedChange={(checked) => handleInputOptionChange("header", checked ? "true" : "false")}
                />
                <Label htmlFor="header-option" className="text-sm">
                  Has Header
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="infer-schema-option"
                  checked={formData.input?.options?.inferSchema === "true"}
                  onCheckedChange={(checked) => handleInputOptionChange("inferSchema", checked ? "true" : "false")}
                />
                <Label htmlFor="infer-schema-option" className="text-sm">
                  Infer Schema
                </Label>
              </div>
            </div>
          )}

          {/* Schema Definition */}
          <div className="space-y-2">
            <Label>Schema Definition</Label>
            <div className="border rounded-md p-3 space-y-3">
              {formData.input?.schema?.fields?.map((field: any, index: number) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <Input
                      placeholder="Field name"
                      value={field.name || ""}
                      onChange={(e) => handleSchemaFieldChange(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Select
                      value={field.type || "string"}
                      onValueChange={(value) => handleSchemaFieldChange(index, "type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="integer">Integer</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="timestamp">Timestamp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`nullable-${index}`}
                        checked={field.nullable !== false}
                        onCheckedChange={(checked) => handleSchemaFieldChange(index, "nullable", !!checked)}
                      />
                      <Label htmlFor={`nullable-${index}`} className="text-sm">
                        Nullable
                      </Label>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => removeSchemaField(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addSchemaField} className="w-full mt-2">
                Add Field
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Output Configuration Tab */}
        <TabsContent value="output" className="space-y-4">
          {/* Output Provider */}
          <div className="space-y-2">
            <Label htmlFor="output-provider">Database Provider</Label>
            <Select
              value={formData.output?.provider || "postgresql"}
              onValueChange={(value) => handleOutputChange("provider", value)}
            >
              <SelectTrigger id="output-provider">
                <SelectValue placeholder="Select database" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="sqlserver">SQL Server</SelectItem>
                <SelectItem value="oracle">Oracle</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Database provider for output</p>
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <Label htmlFor="output-format">Format</Label>
            <Input id="output-format" value={formData.output?.format || "sql"} disabled placeholder="sql" />
            <p className="text-xs text-gray-500">Output format (SQL for databases)</p>
          </div>

          {/* Connection String */}
          <div className="space-y-2">
            <Label htmlFor="output-path">Connection String</Label>
            <Input
              id="output-path"
              value={formData.output?.path || ""}
              placeholder="jdbc:postgresql://hostname:5432/database"
              onChange={(e) => handleOutputChange("path", e.target.value)}
            />
            <p className="text-xs text-gray-500">JDBC connection string for the database</p>
          </div>

          {/* Write Mode */}
          <div className="space-y-2">
            <Label htmlFor="output-mode">Write Mode</Label>
            <Select
              value={formData.output?.mode || "overwrite"}
              onValueChange={(value) => handleOutputChange("mode", value)}
            >
              <SelectTrigger id="output-mode">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overwrite">Overwrite</SelectItem>
                <SelectItem value="append">Append</SelectItem>
                <SelectItem value="ignore">Ignore</SelectItem>
                <SelectItem value="error">Error if exists</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">How to handle existing data</p>
          </div>

          {/* Database Options */}
          <div className="space-y-2">
            <Label>Database Options</Label>

            {/* Table Name */}
            <div className="space-y-1">
              <Label htmlFor="table-option" className="text-sm">
                Table Name
              </Label>
              <Input
                id="table-option"
                value={formData.output?.options?.table || ""}
                placeholder="target_table"
                onChange={(e) => handleOutputOptionChange("table", e.target.value)}
              />
            </div>

            {/* Username */}
            <div className="space-y-1">
              <Label htmlFor="user-option" className="text-sm">
                Username
              </Label>
              <Input
                id="user-option"
                value={formData.output?.options?.user || ""}
                placeholder="username"
                onChange={(e) => handleOutputOptionChange("user", e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password-option" className="text-sm">
                Password
              </Label>
              <Input
                id="password-option"
                type="password"
                value={formData.output?.options?.password || ""}
                placeholder="password"
                onChange={(e) => handleOutputOptionChange("password", e.target.value)}
              />
            </div>

            {/* Batch Size */}
            <div className="space-y-1">
              <Label htmlFor="batchsize-option" className="text-sm">
                Batch Size
              </Label>
              <Input
                id="batchsize-option"
                type="number"
                value={formData.output?.options?.batchsize || "5000"}
                onChange={(e) => handleOutputOptionChange("batchsize", e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Execute Button */}
      <div>
        <Button
          onClick={handleExecuteDatabase}
          disabled={
            loading ||
            !formData.input?.provider ||
            !formData.input?.format ||
            !formData.input?.path ||
            !formData.output?.provider ||
            !formData.output?.path ||
            !formData.output?.options?.table
          }
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {loading ? "Executing..." : "Execute Database Operation"}
        </Button>
      </div>

      {/* Success or Error messages */}
      {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
