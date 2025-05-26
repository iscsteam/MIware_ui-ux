// // // //database-node-properties.tsx
// "use client"
// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { useState, useEffect } from "react"
// import { useWorkflow } from "@/components/workflow/workflow-context"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// // Define the schema directly in this component
// export interface SchemaItem {
//   name: string
//   datatype: string
//   description: string
//   required?: boolean
// }

// export interface NodeSchema {
//   inputSchema: SchemaItem[]
//   outputSchema: SchemaItem[]
// }

// // Database provider options
// const databaseProviders = {
//   postgresql: { driver: "org.postgresql.Driver", batchsize: "5000" },
//   mysql: { driver: "com.mysql.cj.jdbc.Driver", batchsize: "5000" },
//   sqlserver: {
//     driver: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
//     batchsize: "5000",
//   },
//   oracle: { driver: "oracle.jdbc.driver.OracleDriver", batchsize: "5000" },
// }

// // Database node schema
// export const databaseSchema: NodeSchema = {
//   inputSchema: [
//     {
//       name: "provider",
//       datatype: "string",
//       description: "Database provider (e.g., postgresql, mysql, sqlserver, oracle).",
//       required: true,
//     },
//     {
//       name: "format",
//       datatype: "string",
//       description: "Database format (always sql).",
//       required: true,
//     },
//     {
//       name: "connectionString",
//       datatype: "string",
//       description: "JDBC connection string for the database.",
//       required: true,
//     },
//     {
//       name: "writeMode",
//       datatype: "string",
//       description: "Write mode (overwrite, append, ignore, error).",
//       required: true,
//     },
//     {
//       name: "tableName",
//       datatype: "string",
//       description: "Database table name.",
//       required: true,
//     },
//     {
//       name: "username",
//       datatype: "string",
//       description: "Database username.",
//       required: true,
//     },
//     {
//       name: "password",
//       datatype: "string",
//       description: "Database password.",
//       required: true,
//     },
//     {
//       name: "batchSize",
//       datatype: "string",
//       description: "Batch size for database operations.",
//       required: false,
//     },
//   ],
//   outputSchema: [
//     {
//       name: "success",
//       datatype: "boolean",
//       description: "Whether the database operation was successful.",
//     },
//     {
//       name: "rowsProcessed",
//       datatype: "integer",
//       description: "Number of rows processed in the operation.",
//     },
//     {
//       name: "executionTime",
//       datatype: "integer",
//       description: "Time taken to execute the operation in milliseconds.",
//     },
//     {
//       name: "message",
//       datatype: "string",
//       description: "Status message or error details.",
//     },
//     {
//       name: "timestamp",
//       datatype: "string",
//       description: "Timestamp of when the operation completed.",
//     },
//   ],
// }

// interface Props {
//   formData: Record<string, any>
//   onChange: (name: string, value: any) => void
// }

// export default function DatabaseNodeProperties({ formData, onChange }: Props) {
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [successMessage, setSuccessMessage] = useState<string | null>(null)
//   const { updateNode, selectedNodeId } = useWorkflow()

//   // Initialize default values
//   useEffect(() => {
//     if (!formData.provider) {
//       onChange("provider", "postgresql")
//     }
//     if (!formData.format) {
//       onChange("format", "sql")
//     }
//     if (!formData.writeMode) {
//       onChange("writeMode", "overwrite")
//     }
//     if (!formData.batchSize) {
//       onChange("batchSize", "5000")
//     }
//   }, [formData])

//   // Handle provider change to update batch size
//   useEffect(() => {
//     if (formData.provider && databaseProviders[formData.provider as keyof typeof databaseProviders]) {
//       const providerDefaults = databaseProviders[formData.provider as keyof typeof databaseProviders]
//       if (!formData.batchSize || formData.batchSize === "5000") {
//         onChange("batchSize", providerDefaults.batchsize)
//       }
//     }
//   }, [formData.provider])

//   // Execute database operation
//   async function handleExecuteDatabase() {
//     setLoading(true)
//     setError(null)
//     setSuccessMessage(null)

//     try {
//       // Simulate database operation
//       await new Promise((resolve) => setTimeout(resolve, 1000))

//       if (selectedNodeId) {
//         updateNode(selectedNodeId, {
//           status: "success",
//           output: {
//             success: true,
//             rowsProcessed: Math.floor(Math.random() * 1000) + 100,
//             executionTime: Math.floor(Math.random() * 5000) + 500,
//             message: "Database operation completed successfully",
//             timestamp: new Date().toISOString(),
//           },
//         })
//       }

//       setSuccessMessage("Database operation executed successfully!")
//     } catch (err: any) {
//       console.error(err)
//       const errorMessage = err.message || "Unknown error occurred"
//       setError(errorMessage)

//       if (selectedNodeId) {
//         updateNode(selectedNodeId, {
//           status: "error",
//           error: errorMessage,
//           output: {
//             success: false,
//             message: errorMessage,
//             timestamp: new Date().toISOString(),
//           },
//         })
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-4">
//       {/* Database Provider */}
//       <div className="space-y-2">
//         <Label htmlFor="provider">Database Provider</Label>
//         <Select value={formData.provider || "postgresql"} onValueChange={(value) => onChange("provider", value)}>
//           <SelectTrigger id="provider">
//             <SelectValue placeholder="Select database provider" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="postgresql">PostgreSQL</SelectItem>
//             <SelectItem value="mysql">MySQL</SelectItem>
//             <SelectItem value="sqlserver">SQL Server</SelectItem>
//             <SelectItem value="oracle">Oracle</SelectItem>
//           </SelectContent>
//         </Select>
//         <p className="text-xs text-gray-500">Database provider for the operation</p>
//       </div>

//       {/* Format */}
//       <div className="space-y-2">
//         <Label htmlFor="format">Format</Label>
//         <Input id="format" value="sql" disabled />
//         <p className="text-xs text-gray-500">Database format is always SQL</p>
//       </div>

//       {/* Connection String */}
//       <div className="space-y-2">
//         <Label htmlFor="connectionString">Connection String</Label>
//         <Input
//           id="connectionString"
//           value={formData.connectionString || ""}
//           placeholder="jdbc:postgresql://hostname:5432/database"
//           onChange={(e) => onChange("connectionString", e.target.value)}
//         />
//         <p className="text-xs text-gray-500">JDBC connection string for the database</p>
//       </div>

//       {/* Write Mode */}
//       <div className="space-y-2">
//         <Label htmlFor="writeMode">Write Mode</Label>
//         <Select value={formData.writeMode || "overwrite"} onValueChange={(value) => onChange("writeMode", value)}>
//           <SelectTrigger id="writeMode">
//             <SelectValue placeholder="Select write mode" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="overwrite">Overwrite</SelectItem>
//             <SelectItem value="append">Append</SelectItem>
//             <SelectItem value="ignore">Ignore</SelectItem>
//             <SelectItem value="error">Error if exists</SelectItem>
//           </SelectContent>
//         </Select>
//         <p className="text-xs text-gray-500">How to handle existing data</p>
//       </div>

//       {/* Database Options */}
//       <div className="space-y-2">
//         <Label>Database Options</Label>

//         {/* Table Name */}
//         <div className="space-y-1">
//           <Label htmlFor="tableName" className="text-sm">
//             Table Name
//           </Label>
//           <Input
//             id="tableName"
//             value={formData.tableName || ""}
//             placeholder="table_name"
//             onChange={(e) => onChange("tableName", e.target.value)}
//           />
//         </div>

//         {/* Username */}
//         <div className="space-y-1">
//           <Label htmlFor="username" className="text-sm">
//             Username
//           </Label>
//           <Input
//             id="username"
//             value={formData.username || ""}
//             placeholder="username"
//             onChange={(e) => onChange("username", e.target.value)}
//           />
//         </div>

//         {/* Password */}
//         <div className="space-y-1">
//           <Label htmlFor="password" className="text-sm">
//             Password
//           </Label>
//           <Input
//             id="password"
//             type="password"
//             value={formData.password || ""}
//             placeholder="password"
//             onChange={(e) => onChange("password", e.target.value)}
//           />
//         </div>

//         {/* Batch Size */}
//         <div className="space-y-1">
//           <Label htmlFor="batchSize" className="text-sm">
//             Batch Size
//           </Label>
//           <Input
//             id="batchSize"
//             type="number"
//             value={formData.batchSize || "5000"}
//             onChange={(e) => onChange("batchSize", e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Execute Button */}
//       <div>
//         <Button
//           onClick={handleExecuteDatabase}
//           disabled={
//             loading ||
//             !formData.provider ||
//             !formData.connectionString ||
//             !formData.tableName ||
//             !formData.username ||
//             !formData.password
//           }
//           className="bg-green-500 hover:bg-green-600 text-white"
//         >
//           {loading ? "Executing..." : "Execute Database Operation"}
//         </Button>
//       </div>

//       {/* Success or Error messages */}
//       {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
//       {error && <p className="text-red-500 mt-2">{error}</p>}
//     </div>
//   )
// }
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useWorkflow } from "@/components/workflow/workflow-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

// Database provider options - ADDED LOCAL OPTION
const databaseProviders = {
  postgresql: { driver: "org.postgresql.Driver", batchsize: "5000" },
  mysql: { driver: "com.mysql.cj.jdbc.Driver", batchsize: "5000" },
  sqlserver: {
    driver: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    batchsize: "5000",
  },
  oracle: { driver: "oracle.jdbc.driver.OracleDriver", batchsize: "5000" },
  local: { driver: "org.sqlite.JDBC", batchsize: "1000" }, // NEW LOCAL OPTION
}

// Database node schema
export const databaseSchema: NodeSchema = {
  inputSchema: [
    {
      name: "provider",
      datatype: "string",
      description: "Database provider (e.g., postgresql, mysql, sqlserver, oracle, local).",
      required: true,
    },
    {
      name: "format",
      datatype: "string",
      description: "Database format (always sql).",
      required: true,
    },
    {
      name: "connectionString",
      datatype: "string",
      description: "JDBC connection string for the database.",
      required: true,
    },
    {
      name: "writeMode",
      datatype: "string",
      description: "Write mode (overwrite, append, ignore, error).",
      required: true,
    },
    {
      name: "tableName",
      datatype: "string",
      description: "Database table name.",
      required: true,
    },
    {
      name: "username",
      datatype: "string",
      description: "Database username.",
      required: true,
    },
    {
      name: "password",
      datatype: "string",
      description: "Database password.",
      required: true,
    },
    {
      name: "batchSize",
      datatype: "string",
      description: "Batch size for database operations.",
      required: false,
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

  // Initialize default values
  useEffect(() => {
    if (!formData.provider) {
      onChange("provider", "postgresql")
    }
    if (!formData.format) {
      onChange("format", "sql")
    }
    if (!formData.writeMode) {
      onChange("writeMode", "overwrite")
    }
    if (!formData.batchSize) {
      onChange("batchSize", "5000")
    }
  }, [formData, onChange])

  // Handle provider change to update batch size and connection string placeholder
  useEffect(() => {
    if (formData.provider && databaseProviders[formData.provider as keyof typeof databaseProviders]) {
      const providerDefaults = databaseProviders[formData.provider as keyof typeof databaseProviders]
      if (!formData.batchSize || formData.batchSize === "5000") {
        onChange("batchSize", providerDefaults.batchsize)
      }
    }
  }, [formData.provider, formData.batchSize, onChange])

  // Get connection string placeholder based on provider
  const getConnectionStringPlaceholder = () => {
    switch (formData.provider) {
      case "local":
        return "jdbc:sqlite:/path/to/local/database.db"
      case "postgresql":
        return "jdbc:postgresql://hostname:5432/database"
      case "mysql":
        return "jdbc:mysql://hostname:3306/database"
      case "sqlserver":
        return "jdbc:sqlserver://hostname:1433;databaseName=database"
      case "oracle":
        return "jdbc:oracle:thin:@hostname:1521:database"
      default:
        return "jdbc:postgresql://hostname:5432/database"
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
      {/* Database Provider */}
      <div className="space-y-2">
        <Label htmlFor="provider">Database Provider</Label>
        <Select value={formData.provider || "postgresql"} onValueChange={(value) => onChange("provider", value)}>
          <SelectTrigger id="provider">
            <SelectValue placeholder="Select database provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="postgresql">PostgreSQL</SelectItem>
            <SelectItem value="mysql">MySQL</SelectItem>
            <SelectItem value="sqlserver">SQL Server</SelectItem>
            <SelectItem value="oracle">Oracle</SelectItem>
            <SelectItem value="local">Local Database</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          {formData.provider === "local"
            ? "Local SQLite database for development and testing"
            : "Database provider for the operation"}
        </p>
      </div>

      {/* Format */}
      <div className="space-y-2">
        <Label htmlFor="format">Format</Label>
        <Input id="format" value="sql" disabled />
        <p className="text-xs text-gray-500">Database format is always SQL</p>
      </div>

      {/* Connection String */}
      <div className="space-y-2">
        <Label htmlFor="connectionString">Connection String</Label>
        <Input
          id="connectionString"
          value={formData.connectionString || ""}
          placeholder={getConnectionStringPlaceholder()}
          onChange={(e) => onChange("connectionString", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          {formData.provider === "local"
            ? "Path to local SQLite database file"
            : "JDBC connection string for the database"}
        </p>
      </div>

      {/* Write Mode */}
      <div className="space-y-2">
        <Label htmlFor="writeMode">Write Mode</Label>
        <Select value={formData.writeMode || "overwrite"} onValueChange={(value) => onChange("writeMode", value)}>
          <SelectTrigger id="writeMode">
            <SelectValue placeholder="Select write mode" />
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
          <Label htmlFor="tableName" className="text-sm">
            Table Name
          </Label>
          <Input
            id="tableName"
            value={formData.tableName || ""}
            placeholder="table_name"
            onChange={(e) => onChange("tableName", e.target.value)}
          />
        </div>

        {/* Username - Only show for non-local databases */}
        {formData.provider !== "local" && (
          <div className="space-y-1">
            <Label htmlFor="username" className="text-sm">
              Username
            </Label>
            <Input
              id="username"
              value={formData.username || ""}
              placeholder="username"
              onChange={(e) => onChange("username", e.target.value)}
            />
          </div>
        )}

        {/* Password - Only show for non-local databases */}
        {formData.provider !== "local" && (
          <div className="space-y-1">
            <Label htmlFor="password" className="text-sm">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password || ""}
              placeholder="password"
              onChange={(e) => onChange("password", e.target.value)}
            />
          </div>
        )}

        {/* Batch Size */}
        <div className="space-y-1">
          <Label htmlFor="batchSize" className="text-sm">
            Batch Size
          </Label>
          <Input
            id="batchSize"
            type="number"
            value={formData.batchSize || "5000"}
            onChange={(e) => onChange("batchSize", e.target.value)}
          />
        </div>
      </div>

      {/* File Input Information */}
      <div className="space-y-2 p-3 border rounded-md bg-blue-50">
        <Label className="text-sm font-semibold text-blue-800">File Input Integration</Label>
        <p className="text-xs text-blue-600">
          This database node can receive file data from a connected read-file node. When connected, uploaded files will
          be automatically processed and inserted into the specified table.
        </p>
        <div className="text-xs text-blue-600">
          <strong>Workflow Pattern:</strong> Start → Read File → Database → End
        </div>
      </div>

      {/* Execute Button */}
      <div>
        <Button
          onClick={handleExecuteDatabase}
          disabled={
            loading ||
            !formData.provider ||
            !formData.connectionString ||
            !formData.tableName ||
            (formData.provider !== "local" && (!formData.username || !formData.password))
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
