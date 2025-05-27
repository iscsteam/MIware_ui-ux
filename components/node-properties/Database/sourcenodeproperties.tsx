//sourcenodeproperties.tsx
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useWorkflow } from "@/components/workflow/workflow-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
  xml: { rootTag: "TableData", rowTag: "Row" },
  sql: {},
}

// Database provider options
const databaseProviders = {
  postgresql: { driver: "org.postgresql.Driver", batchsize: "5000" },
  mysql: { driver: "com.mysql.cj.jdbc.Driver", batchsize: "5000" },
  sqlserver: {
    driver: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    batchsize: "5000",
  },
  oracle: { driver: "oracle.jdbc.driver.OracleDriver", batchsize: "5000" },
  local:{ driver: "org.postgresql.Driver", batchsize: "5000" },
}

// Source node schema (updated to include database fields)
export const sourceSchema: NodeSchema = {
  inputSchema: [
    {
      name: "provider",
      datatype: "string",
      description: "Source data provider (e.g., local, s3, hdfs, database).",
      required: true,
    },
    {
      name: "format",
      datatype: "string",
      description: "Source file format (e.g., csv, json, parquet, sql).",
      required: true,
    },
    {
      name: "filePath",
      datatype: "string",
      description: "Path to the source file or data location.",
      required: false,
    },
    {
      name: "connectionString",
      datatype: "string",
      description: "Database connection string (for database provider).",
      required: false,
    },
    {
      name: "tableName",
      datatype: "string",
      description: "Database table name (for database provider).",
      required: false,
    },
    {
      name: "username",
      datatype: "string",
      description: "Database username (for database provider).",
      required: false,
    },
    {
      name: "password",
      datatype: "string",
      description: "Database password (for database provider).",
      required: false,
    },
    {
      name: "batchSize",
      datatype: "string",
      description: "Batch size for database operations.",
      required: false,
    },
    {
      name: "databaseProvider",
      datatype: "string",
      description: "Specific database provider (postgresql, mysql, etc.).",
      required: false,
    },
    {
      name: "csvOptions",
      datatype: "complex",
      description: "CSV-specific options (header, inferSchema).",
      required: false,
    },
    {
      name: "schema",
      datatype: "complex",
      description: "Schema definition for the source data.",
      required: false,
    },
  ],
  outputSchema: [
    {
      name: "data",
      datatype: "object",
      description: "The loaded data from the source.",
    },
    {
      name: "schema",
      datatype: "object",
      description: "The inferred or defined schema of the data.",
    },
    {
      name: "rowCount",
      datatype: "integer",
      description: "Number of rows loaded from the source.",
    },
    {
      name: "filePath",
      datatype: "string",
      description: "The source file path that was processed.",
    },
    {
      name: "format",
      datatype: "string",
      description: "The format of the source data.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function SourceNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  // Check if database provider is selected
  const isDatabaseProvider = formData.provider === "source"

  // Initialize default values
  useEffect(() => {
    if (!formData.provider) {
      onChange("provider", "local")
    }
    if (!formData.format) {
      onChange("format", "csv")
    }
    if (!formData.csvOptions) {
      onChange("csvOptions", formatOptions.csv)
    }
    if (!formData.schema) {
      onChange("schema", { fields: [] })
    }
    if (!formData.batchSize) {
      onChange("batchSize", "5000")
    }
    if (!formData.databaseProvider) {
      onChange("databaseProvider", "postgresql")
    }
  }, [formData])

  // Handle provider change
  useEffect(() => {
    if (formData.provider === "source") {
      // Set format to SQL for database
      if (formData.format !== "sql") {
        onChange("format", "sql")
      }
    } else {
      // Reset database-specific fields when switching away from database
      if (formData.format === "sql") {
        onChange("format", "csv")
      }
    }
  }, [formData.provider])

  // Handle format change to update options
  useEffect(() => {
    if (formData.format && formatOptions[formData.format as keyof typeof formatOptions]) {
      const newOptions = formatOptions[formData.format as keyof typeof formatOptions]
      const currentOptions = formData.csvOptions || {}

      if (JSON.stringify(newOptions) !== JSON.stringify(currentOptions)) {
        onChange("csvOptions", newOptions)
      }
    }
  }, [formData.format, formData])

  // Handle database provider change to update batch size
  useEffect(() => {
    if (formData.databaseProvider && databaseProviders[formData.databaseProvider as keyof typeof databaseProviders]) {
      const providerDefaults = databaseProviders[formData.databaseProvider as keyof typeof databaseProviders]
      if (!formData.batchSize || formData.batchSize === "5000") {
        onChange("batchSize", providerDefaults.batchsize)
      }
    }
  }, [formData.databaseProvider])

  // Handle CSV options change
  const handleCsvOptionChange = (option: string, value: any) => {
    const updatedOptions = {
      ...(formData.csvOptions || {}),
      [option]: value,
    }
    onChange("csvOptions", updatedOptions)
  }

  // Handle schema field changes
  const handleSchemaFieldChange = (index: number, field: string, value: any) => {
    const updatedSchema = { ...(formData.schema || {}) }

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

    onChange("schema", updatedSchema)
  }

  // Add a new schema field
  const addSchemaField = () => {
    const updatedSchema = { ...(formData.schema || {}) }

    if (!updatedSchema.fields) {
      updatedSchema.fields = []
    }

    updatedSchema.fields.push({ name: "", type: "string", nullable: true })
    onChange("schema", updatedSchema)
  }

  // Remove a schema field
  const removeSchemaField = (index: number) => {
    const updatedSchema = { ...(formData.schema || {}) }

    if (updatedSchema.fields && updatedSchema.fields.length > index) {
      updatedSchema.fields.splice(index, 1)
      onChange("schema", updatedSchema)
    }
  }

  // Execute source operation
  async function handleExecuteSource() {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Simulate source operation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "success",
          output: {
            data: { sample: "data from source" },
            schema: formData.schema,
            rowCount: Math.floor(Math.random() * 1000) + 100,
            filePath: isDatabaseProvider ? formData.tableName : formData.filePath,
            format: formData.format,
          },
        })
      }

      setSuccessMessage("Source data loaded successfully!")
    } catch (err: any) {
      console.error(err)
      const errorMessage = err.message || "Unknown error occurred"
      setError(errorMessage)

      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "error",
          error: errorMessage,
          output: {
            error: errorMessage,
          },
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Validation function
  const isFormValid = () => {
    if (!formData.provider || !formData.format) return false
    
    if (isDatabaseProvider) {
      return !!(
        formData.connectionString &&
        formData.tableName &&
        formData.username &&
        formData.password
      )
    } else {
      return !!formData.filePath
    }
  }

  return (
    <div className="space-y-4">
      {/* Source Provider */}
      <div className="space-y-2">
        <Label htmlFor="provider">Source Provider</Label>
        <Select value={formData.provider || "local"} onValueChange={(value) => onChange("provider", value)}>
          <SelectTrigger id="provider">
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="local">Local</SelectItem>
            <SelectItem value="s3">S3</SelectItem>
            <SelectItem value="hdfs">HDFS</SelectItem>
            <SelectItem value="azure">Azure Blob</SelectItem>
            <SelectItem value="gcs">Google Cloud Storage</SelectItem>
            <SelectItem value="database">Database</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">Data source provider for input</p>
      </div>

      {/* Database Provider (only shown if database is selected) */}
      {isDatabaseProvider && (
        <div className="space-y-2">
          <Label htmlFor="databaseProvider">Database Provider</Label>
          <Select 
            value={formData.databaseProvider || "postgresql"} 
            onValueChange={(value) => onChange("databaseProvider", value)}
          >
            <SelectTrigger id="databaseProvider">
              <SelectValue placeholder="Select database provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="postgresql">PostgreSQL</SelectItem>
              <SelectItem value="mysql">MySQL</SelectItem>
              <SelectItem value="sqlserver">SQL Server</SelectItem>
              <SelectItem value="oracle">Oracle</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">Specific database provider</p>
        </div>
      )}

      {/* Format */}
      <div className="space-y-2">
        <Label htmlFor="format">Format</Label>
        <Select 
          value={formData.format || "csv"} 
          onValueChange={(value) => onChange("format", value)}
          disabled={isDatabaseProvider}
        >
          <SelectTrigger id="format">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="parquet">Parquet</SelectItem>
            <SelectItem value="avro">Avro</SelectItem>
            <SelectItem value="orc">ORC</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
            {isDatabaseProvider && <SelectItem value="sql">SQL</SelectItem>}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          {isDatabaseProvider ? "Database format is always SQL" : "File format for source data"}
        </p>
      </div>

      {/* File Path OR Database Connection String */}
      {!isDatabaseProvider ? (
        <div className="space-y-2">
          <Label htmlFor="filePath">File Path</Label>
          <Input
            id="filePath"
            value={formData.filePath || ""}
            placeholder="/path/to/source/file.csv"
            onChange={(e) => onChange("filePath", e.target.value)}
          />
          <p className="text-xs text-gray-500">Path to the source file or data location</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="connectionString">Database Connection String</Label>
          <Input
            id="connectionString"
            value={formData.connectionString || ""}
            placeholder="jdbc:postgresql://hostname:5432/database"
            onChange={(e) => onChange("connectionString", e.target.value)}
          />
          <p className="text-xs text-gray-500">JDBC connection string for the database</p>
        </div>
      )}

      {/* Database-specific fields */}
      {isDatabaseProvider && (
        <div className="space-y-4">
          {/* Table Name */}
          <div className="space-y-2">
            <Label htmlFor="tableName">Table Name</Label>
            <Input
              id="tableName"
              value={formData.tableName || ""}
              placeholder="table_name"
              onChange={(e) => onChange("tableName", e.target.value)}
            />
            <p className="text-xs text-gray-500">Name of the database table to read from</p>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username || ""}
              placeholder="username"
              onChange={(e) => onChange("username", e.target.value)}
            />
            <p className="text-xs text-gray-500">Database username</p>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password || ""}
              placeholder="password"
              onChange={(e) => onChange("password", e.target.value)}
            />
            <p className="text-xs text-gray-500">Database password</p>
          </div>

          {/* Batch Size */}
          <div className="space-y-2">
            <Label htmlFor="batchSize">Batch Size</Label>
            <Input
              id="batchSize"
              type="number"
              value={formData.batchSize || "5000"}
              onChange={(e) => onChange("batchSize", e.target.value)}
            />
            <p className="text-xs text-gray-500">Number of rows to process in each batch</p>
          </div>
        </div>
      )}

      {/* CSV Options (only for CSV format and non-database providers) */}
      {formData.format === "csv" && !isDatabaseProvider && (
        <div className="space-y-2">
          <Label>CSV Options</Label>
          <div className="space-y-3 border rounded-md p-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-header"
                checked={formData.csvOptions?.header === "true"}
                onCheckedChange={(checked) => handleCsvOptionChange("header", checked ? "true" : "false")}
              />
              <Label htmlFor="has-header" className="text-sm">
                Has Header
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="infer-schema"
                checked={formData.csvOptions?.inferSchema === "true"}
                onCheckedChange={(checked) => handleCsvOptionChange("inferSchema", checked ? "true" : "false")}
              />
              <Label htmlFor="infer-schema" className="text-sm">
                Infer Schema
              </Label>
            </div>
          </div>
        </div>
      )}

      {/* Schema Definition */}
      <div className="space-y-2">
        <Label>Schema Definition</Label>
        <div className="border rounded-md p-3 space-y-3">
          {formData.schema?.fields?.map((field: any, index: number) => (
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

      {/* Execute Button */}
      <div>
        <Button
          onClick={handleExecuteSource}
          disabled={loading || !isFormValid()}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? "Loading..." : "Load Source Data"}
        </Button>
      </div>

      {/* Success or Error messages */}
      {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}