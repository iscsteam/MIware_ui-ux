// //database-node-properties.tsx
"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useWorkflow } from "@/components/workflow/workflow-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2 } from "lucide-react";

// Define the schema directly in this component
export interface SchemaItem {
  name: string;
  datatype: string;
  description: string;
  required?: boolean;
}

export interface NodeSchema {
  inputSchema: SchemaItem[];
  outputSchema: SchemaItem[];
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
};

// Database provider options
const databaseProviders = {
  postgresql: { driver: "org.postgresql.Driver", batchsize: "5000" },
  mysql: { driver: "com.mysql.cj.jdbc.Driver", batchsize: "5000" },
  sqlserver: {
    driver: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    batchsize: "5000",
  },
  oracle: { driver: "oracle.jdbc.driver.OracleDriver", batchsize: "5000" },
};

// Database node schema
export const databaseSchema: NodeSchema = {
  inputSchema: [
    {
      name: "direction",
      datatype: "string",
      description: "Data flow direction (import or export).",
      required: true,
    },
    {
      name: "input.provider",
      datatype: "string",
      description: "Input data source provider (e.g., local, s3, sql).",
      required: true,
    },
    {
      name: "input.format",
      datatype: "string",
      description: "Input file format (e.g., csv, json, parquet, sql).",
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
      description: "Output data provider (e.g., postgresql, mysql, local).",
      required: true,
    },
    {
      name: "output.format",
      datatype: "string",
      description: "Output format (sql, csv, json, etc.).",
      required: true,
    },
    {
      name: "output.path",
      datatype: "string",
      description: "Output path or connection string.",
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
      description: "Output-specific options (table, user, password, etc.).",
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
};

interface Props {
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

export default function DatabaseNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { updateNode, selectedNodeId } = useWorkflow();
  const [activeTab, setActiveTab] = useState("input");

  // Initialize nested structure if not present
  useEffect(() => {
    if (!formData.direction) {
      onChange("direction", "import"); // Default to import (file to db)
    }
    if (!formData.input) {
      onChange("input", {
        provider: "local",
        format: "csv",
        options: formatOptions.csv,
      });
    }
    if (!formData.output) {
      onChange("output", {
        provider: "postgresql",
        format: "sql",
        mode: "overwrite",
        options: databaseProviders.postgresql,
      });
    }
  }, [formData]);

  // Handle direction change
  const handleDirectionChange = (direction: string) => {
    onChange("direction", direction);

    // Reset some fields when direction changes
    if (direction === "import") {
      // File to DB
      onChange("input", {
        provider: "local",
        format: "csv",
        options: formatOptions.csv,
      });
      onChange("output", {
        provider: "postgresql",
        format: "sql",
        mode: "overwrite",
        options: databaseProviders.postgresql,
      });
    } else {
      // DB to File
      onChange("input", {
        provider: "postgresql",
        format: "sql",
        options: databaseProviders.postgresql,
      });
      onChange("output", {
        provider: "local",
        format: "xml",
        mode: "overwrite",
        options: formatOptions.xml,
      });
    }
  };

  // Handle input format change to update options
  useEffect(() => {
    if (
      formData.input?.format &&
      formatOptions[formData.input.format as keyof typeof formatOptions]
    ) {
      const newOptions =
        formatOptions[formData.input.format as keyof typeof formatOptions];
      const currentOptions = formData.input.options || {};

      if (JSON.stringify(newOptions) !== JSON.stringify(currentOptions)) {
        const updatedInput = { ...formData.input, options: newOptions };
        onChange("input", updatedInput);
      }
    }
  }, [formData.input?.format, formData]);

  // Handle output format change to update options
  useEffect(() => {
    if (
      formData.output?.format &&
      formatOptions[formData.output.format as keyof typeof formatOptions]
    ) {
      const newOptions =
        formatOptions[formData.output.format as keyof typeof formatOptions];
      const currentOptions = formData.output.options || {};

      if (JSON.stringify(newOptions) !== JSON.stringify(currentOptions)) {
        const updatedOutput = { ...formData.output, options: newOptions };
        onChange("output", updatedOutput);
      }
    }
  }, [formData.output?.format, formData]);

  // Handle input provider change to update options
  useEffect(() => {
    if (
      formData.input?.provider === "sql" ||
      databaseProviders[
        formData.input?.provider as keyof typeof databaseProviders
      ]
    ) {
      const newOptions =
        databaseProviders[
          formData.input.provider as keyof typeof databaseProviders
        ] || {};
      const currentOptions = formData.input.options || {};

      // Preserve user-entered values like table, user, password
      const preservedOptions = {
        table: currentOptions.table || "",
        user: currentOptions.user || "",
        password: currentOptions.password || "",
      };

      const mergedOptions = { ...newOptions, ...preservedOptions };

      if (JSON.stringify(mergedOptions) !== JSON.stringify(currentOptions)) {
        const updatedInput = { ...formData.input, options: mergedOptions };
        onChange("input", updatedInput);
      }
    }
  }, [formData.input?.provider]);

  // Handle output provider change to update options
  useEffect(() => {
    if (
      formData.output?.provider === "sql" ||
      databaseProviders[
        formData.output?.provider as keyof typeof databaseProviders
      ]
    ) {
      const newOptions =
        databaseProviders[
          formData.output.provider as keyof typeof databaseProviders
        ] || {};
      const currentOptions = formData.output.options || {};

      // Preserve user-entered values like table, user, password
      const preservedOptions = {
        table: currentOptions.table || "",
        user: currentOptions.user || "",
        password: currentOptions.password || "",
      };

      const mergedOptions = { ...newOptions, ...preservedOptions };

      if (JSON.stringify(mergedOptions) !== JSON.stringify(currentOptions)) {
        const updatedOutput = { ...formData.output, options: mergedOptions };
        onChange("output", updatedOutput);
      }
    }
  }, [formData.output?.provider]);

  // Handle input nested field changes
  const handleInputChange = (field: string, value: any) => {
    const updatedInput = { ...formData.input, [field]: value };
    onChange("input", updatedInput);
  };

  // Handle output nested field changes
  const handleOutputChange = (field: string, value: any) => {
    const updatedOutput = { ...formData.output, [field]: value };
    onChange("output", updatedOutput);
  };

  // Handle input options change
  const handleInputOptionChange = (option: string, value: any) => {
    const updatedOptions = {
      ...(formData.input?.options || {}),
      [option]: value,
    };
    handleInputChange("options", updatedOptions);
  };

  // Handle output options change
  const handleOutputOptionChange = (option: string, value: any) => {
    const updatedOptions = {
      ...(formData.output?.options || {}),
      [option]: value,
    };
    handleOutputChange("options", updatedOptions);
  };

  // Handle schema field changes
  const handleSchemaFieldChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const updatedSchema = { ...(formData.input?.schema || {}) };

    if (!updatedSchema.fields) {
      updatedSchema.fields = [];
    }

    // Ensure the fields array has enough elements
    while (updatedSchema.fields.length <= index) {
      updatedSchema.fields.push({ name: "", type: "string", nullable: true });
    }

    updatedSchema.fields[index] = {
      ...updatedSchema.fields[index],
      [field]: value,
    };

    handleInputChange("schema", updatedSchema);
  };

  // Add a new schema field
  const addSchemaField = () => {
    const updatedSchema = { ...(formData.input?.schema || {}) };

    if (!updatedSchema.fields) {
      updatedSchema.fields = [];
    }

    updatedSchema.fields.push({ name: "", type: "string", nullable: true });
    handleInputChange("schema", updatedSchema);
  };

  // Remove a schema field
  const removeSchemaField = (index: number) => {
    const updatedSchema = { ...(formData.input?.schema || {}) };

    if (updatedSchema.fields && updatedSchema.fields.length > index) {
      updatedSchema.fields.splice(index, 1);
      handleInputChange("schema", updatedSchema);
    }
  };

  // Execute database operation
  async function handleExecuteDatabase() {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Simulate database operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
        });
      }

      setSuccessMessage("Database operation executed successfully!");
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Unknown error occurred";
      setError(errorMessage);

      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "error",
          error: errorMessage,
          output: {
            success: false,
            message: errorMessage,
            timestamp: new Date().toISOString(),
          },
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const isImport = formData.direction === "import";

  return (
    <div className="space-y-4">
      {/* Direction Selector */}
      <div className="space-y-2">
        <Label>Operation Type</Label>
        <div className="flex space-x-4">
          <Button
            variant={isImport ? "default" : "outline"}
            onClick={() => handleDirectionChange("import")}
          >
            File to Database
          </Button>
          <Button
            variant={!isImport ? "default" : "outline"}
            onClick={() => handleDirectionChange("export")}
          >
            Database to File
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">
            {isImport ? "Source" : "Database"}
          </TabsTrigger>
          <TabsTrigger value="output">
            {isImport ? "Database" : "Target"}
          </TabsTrigger>
        </TabsList>

        {/* Input Configuration Tab */}
        <TabsContent value="input" className="space-y-4">
          {/* Input Provider */}
          <div className="space-y-2">
            <Label htmlFor="input-provider">
              {isImport ? "Source Provider" : "Database Provider"}
            </Label>
            <Select
              value={
                formData.input?.provider || (isImport ? "local" : "postgresql")
              }
              onValueChange={(value) => handleInputChange("provider", value)}
            >
              <SelectTrigger id="input-provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {isImport ? (
                  <>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="s3">S3</SelectItem>
                    <SelectItem value="hdfs">HDFS</SelectItem>
                    <SelectItem value="azure">Azure Blob</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="sqlserver">SQL Server</SelectItem>
                    <SelectItem value="oracle">Oracle</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {isImport
                ? "Data source provider for input"
                : "Database provider for source data"}
            </p>
          </div>

          {/* Input Format */}
          <div className="space-y-2">
            <Label htmlFor="input-format">Format</Label>
            {isImport ? (
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
            ) : (
              <Input id="input-format" value="sql" disabled />
            )}
            <p className="text-xs text-gray-500">
              {isImport
                ? "File format for input data"
                : "Database format is always SQL"}
            </p>
          </div>

          {/* Input Path */}
          <div className="space-y-2">
            <Label htmlFor="input-path">
              {isImport ? "File Path" : "Connection String"}
            </Label>
            <Input
              id="input-path"
              value={formData.input?.path || ""}
              placeholder={
                isImport
                  ? "/path/to/input/file.csv"
                  : "jdbc:postgresql://hostname:5432/database"
              }
              onChange={(e) => handleInputChange("path", e.target.value)}
            />
            <p className="text-xs text-gray-500">
              {isImport
                ? "Path to the input file or data source"
                : "JDBC connection string for the database"}
            </p>
          </div>

          {/* Input Options */}
          {isImport ? (
            formData.input?.format === "csv" && (
              <div className="space-y-2">
                <Label>CSV Options</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="header-option"
                    checked={formData.input?.options?.header === "true"}
                    onCheckedChange={(checked) =>
                      handleInputOptionChange(
                        "header",
                        checked ? "true" : "false"
                      )
                    }
                  />
                  <Label htmlFor="header-option" className="text-sm">
                    Has Header
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="infer-schema-option"
                    checked={formData.input?.options?.inferSchema === "true"}
                    onCheckedChange={(checked) =>
                      handleInputOptionChange(
                        "inferSchema",
                        checked ? "true" : "false"
                      )
                    }
                  />
                  <Label htmlFor="infer-schema-option" className="text-sm">
                    Infer Schema
                  </Label>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-2">
              <Label>Database Options</Label>

              {/* Table Name */}
              <div className="space-y-1">
                <Label htmlFor="input-table-option" className="text-sm">
                  Table Name
                </Label>
                <Input
                  id="input-table-option"
                  value={formData.input?.options?.table || ""}
                  placeholder="source_table"
                  onChange={(e) =>
                    handleInputOptionChange("table", e.target.value)
                  }
                />
              </div>

              {/* Username */}
              <div className="space-y-1">
                <Label htmlFor="input-user-option" className="text-sm">
                  Username
                </Label>
                <Input
                  id="input-user-option"
                  value={formData.input?.options?.user || ""}
                  placeholder="username"
                  onChange={(e) =>
                    handleInputOptionChange("user", e.target.value)
                  }
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="input-password-option" className="text-sm">
                  Password
                </Label>
                <Input
                  id="input-password-option"
                  type="password"
                  value={formData.input?.options?.password || ""}
                  placeholder="password"
                  onChange={(e) =>
                    handleInputOptionChange("password", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Schema Definition - shown for both directions */}
          <div className="space-y-2">
            <Label>Schema Definition</Label>
            <div className="border rounded-md p-3 space-y-3">
              {formData.input?.schema?.fields?.map(
                (field: any, index: number) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-4">
                      <Input
                        placeholder="Field name"
                        value={field.name || ""}
                        onChange={(e) =>
                          handleSchemaFieldChange(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-3">
                      <Select
                        value={field.type || "string"}
                        onValueChange={(value) =>
                          handleSchemaFieldChange(index, "type", value)
                        }
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
                          onCheckedChange={(checked) =>
                            handleSchemaFieldChange(
                              index,
                              "nullable",
                              !!checked
                            )
                          }
                        />
                        <Label
                          htmlFor={`nullable-${index}`}
                          className="text-sm"
                        >
                          Nullable
                        </Label>
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSchemaField(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={addSchemaField}
                className="w-full mt-2"
              >
                Add Field
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Output Configuration Tab */}
        <TabsContent value="output" className="space-y-4">
          {/* Output Provider */}
          <div className="space-y-2">
            <Label htmlFor="output-provider">
              {isImport ? "Database Provider" : "Target Provider"}
            </Label>
            {isImport ? (
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
            ) : (
              <Select
                value={formData.output?.provider || "local"}
                onValueChange={(value) => handleOutputChange("provider", value)}
              >
                <SelectTrigger id="output-provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="s3">S3</SelectItem>
                  <SelectItem value="hdfs">HDFS</SelectItem>
                  <SelectItem value="azure">Azure Blob</SelectItem>
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-gray-500">
              {isImport
                ? "Database provider for output"
                : "Target provider for exported data"}
            </p>
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <Label htmlFor="output-format">Format</Label>
            {isImport ? (
              <Input id="output-format" value="sql" disabled />
            ) : (
              <Select
                value={formData.output?.format || "xml"}
                onValueChange={(value) => handleOutputChange("format", value)}
              >
                <SelectTrigger id="output-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="parquet">Parquet</SelectItem>
                  <SelectItem value="avro">Avro</SelectItem>
                  <SelectItem value="orc">ORC</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-gray-500">
              {isImport
                ? "Database format is always SQL"
                : "Output file format for exported data"}
            </p>
          </div>

          {/* Output Path */}
          <div className="space-y-2">
            <Label htmlFor="output-path">
              {isImport ? "Connection String" : "Output Path"}
            </Label>
            <Input
              id="output-path"
              value={formData.output?.path || ""}
              placeholder={
                isImport
                  ? "jdbc:postgresql://hostname:5432/database"
                  : "/path/to/output/file.xml"
              }
              onChange={(e) => handleOutputChange("path", e.target.value)}
            />
            <p className="text-xs text-gray-500">
              {isImport
                ? "JDBC connection string for the database"
                : "Path to the output file"}
            </p>
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

          {/* Output Options */}
          <div className="space-y-2">
            <Label>{isImport ? "Database Options" : "Output Options"}</Label>

            {isImport ? (
              <>
                {/* Table Name */}
                <div className="space-y-1">
                  <Label htmlFor="table-option" className="text-sm">
                    Table Name
                  </Label>
                  <Input
                    id="table-option"
                    value={formData.output?.options?.table || ""}
                    placeholder="target_table"
                    onChange={(e) =>
                      handleOutputOptionChange("table", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleOutputOptionChange("user", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleOutputOptionChange("password", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleOutputOptionChange("batchsize", e.target.value)
                    }
                  />
                </div>
              </>
            ) : (
              <>
                {formData.output?.format === "csv" && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="output-header-option"
                        checked={formData.output?.options?.header === "true"}
                        onCheckedChange={(checked) =>
                          handleOutputOptionChange(
                            "header",
                            checked ? "true" : "false"
                          )
                        }
                      />
                      <Label htmlFor="output-header-option" className="text-sm">
                        Include Header
                      </Label>
                    </div>
                  </div>
                )}
                {formData.output?.format === "xml" && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="root-tag-option" className="text-sm">
                        Root Tag
                      </Label>
                      <Input
                        id="root-tag-option"
                        value={formData.output?.options?.rootTag || "TableData"}
                        placeholder="Root tag name"
                        onChange={(e) =>
                          handleOutputOptionChange("rootTag", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="row-tag-option" className="text-sm">
                        Row Tag
                      </Label>
                      <Input
                        id="row-tag-option"
                        value={formData.output?.options?.rowTag || "Row"}
                        placeholder="Row tag name"
                        onChange={(e) =>
                          handleOutputOptionChange("rowTag", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Execute Button */}
      <div>
        <Button
          onClick={handleExecuteDatabase}
          disabled={
            loading ||
            !formData.direction ||
            !formData.input?.provider ||
            !formData.input?.format ||
            !formData.input?.path ||
            !formData.output?.provider ||
            !formData.output?.format ||
            !formData.output?.path ||
            (isImport && !formData.output?.options?.table) ||
            (!isImport &&
              formData.input?.provider !== "local" &&
              !formData.input?.options?.table)
          }
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {loading
            ? "Executing..."
            : isImport
            ? "Import to Database"
            : "Export from Database"}
        </Button>
      </div>

      {/* Success or Error messages */}
      {successMessage && (
        <p className="text-green-500 mt-2">{successMessage}</p>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
