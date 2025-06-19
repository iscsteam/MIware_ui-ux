//nodeSchemas.ts
import type { NodeType, SchemaItem } from "@/services/interface" // Assuming SchemaItem is also in workflow-context

export interface NodeSchema {
  label: string
  description?: string
  inputSchema?: SchemaItem[]
  outputSchema?: SchemaItem[]
}

// Define schemas for all available node types
// This object MUST contain an entry for every possible value defined in the NodeType type.
export const nodeSchemas: Record<NodeType, NodeSchema> = {
  start: {
    label: "Start",
    description: "Workflow starting point.",
    inputSchema: [], // Start nodes typically have no specific data inputs via connections
    outputSchema: [
      {
        name: "triggerData", // Example: Data that triggered the workflow (if applicable)
        datatype: "any",
        description: "Data that initiated the workflow run.",
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "startTime",
        datatype: "string", // ISO timestamp
        description: "Timestamp when the workflow instance started.",
        sourceNodeId: "",
        originalName: "",
      },
    ],
  },

  end: {
    label: "End",
    description: "Workflow ending point. Consumes final data.",
    inputSchema: [
      {
        name: "finalResult",
        datatype: "any",
        description: "The final data payload to conclude the workflow.",
        required: true, // Usually requires some input to signify completion
        sourceNodeId: "",
        originalName: "",
      },
    ],
    outputSchema: [], // End nodes typically don't output data via connections
  },

  "create-file": {
    label: "Create File",
    description: "Creates a new file or directory.",
    inputSchema: [
      {
        name: "filename",
        datatype: "string",
        description: "Path and name of the file/directory to create.",
        required: true,
        sourceNodeId: "",
        originalName: "",
      },
    ],
    outputSchema: [
      {
        name: "fileInfo.fullName",
        datatype: "string",
        description: "Full path and name of the created item.",
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "file size",
        datatype: "Number",
        description: "file size",
        sourceNodeId: "",
        originalName: "",
      },
    ],
  },

  "read-file": {
    label: "Read File",
    description: "Reads content from an existing file.",
    inputSchema: [
      {
        name: "filename",
        datatype: "string",
        description: "Path and name of the file to read.",
        required: true,
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "encoding",
        datatype: "string", // Consider specific options: 'utf-8', 'ascii', 'binary'
        description: "Character encoding (default: UTF-8).",
        required: false,
        sourceNodeId: "",
        originalName: "",
      },
    ],
    outputSchema: [
      {
        name: "textContent", // Or binaryContent depending on readAs
        datatype: "string", // or 'Buffer'/'Blob'/'ArrayBuffer' if binary
        description: "Content of the file.",
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "fileName",
        datatype: "object",
        description: "Information about the read file.",
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "file fullname",
        datatype: "string",
        description: " Context of file",
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "filepath",
        datatype: "string",
        description: " Context of file",
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "file size",
        datatype: "Number",
        description: " Context of file",
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "file type",
        datatype: "string",
        description: " Context of file",
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "lastmodified",
        datatype: "string",
        description: " Context of file",
        sourceNodeId: "",
        originalName: "",
      },
    ],
  },

  "write-file": {
    label: "Write File",
    description: "Writes content to a file.",
    inputSchema: [
      {
        name: "filename",
        datatype: "string",
        description: "Path and name of the file to write.",
        required: true,
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "Text Content",
        datatype: "any", // Can be string or binary data
        description: "Content to write to the file.",
        required: true,
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "encoding",
        datatype: "string", // 'utf-8', 'ascii', etc. (if content is text)
        description: "Character encoding (default: UTF-8).",
        required: false,
        sourceNodeId: "",
        originalName: "",
      },
    ],
    outputSchema: [
      {
        name: "textContent", // Or binaryContent depending on readAs
        datatype: "string", // or 'Buffer'/'Blob'/'ArrayBuffer' if binary
        description: "Content of the file.",
      },
      {
        name: "fileName",
        datatype: "object",
        description: "Information about the read file.",
      },
      {
        name: "file fullname",
        datatype: "string",
        description: " Context of file",
      },
      {
        name: "filepath",
        datatype: "string",
        description: " Context of file",
      },
      {
        name: "file size",
        datatype: "Number",
        description: " Context of file",
      },
      {
        name: "file type",
        datatype: "string",
        description: " Context of file",
      },
      {
        name: "lastmodified",
        datatype: "string",
        description: " Context of file",
      },
    ],
  },

  "copy-file": {
    label: "Copy File/Directory",
    description: "Copies a file or directory.",
    inputSchema: [
      {
        name: "sourcePath",
        datatype: "string",
        description: "Path of the source file or directory.",
        required: true,
      },
      {
        name: "targetPath",
        datatype: "string",
        description: "Path for the destination file or directory.",
        required: true,
      },
      {
        name: "overwrite",
        datatype: "boolean",
        description: "Whether to overwrite if the target exists.",
        required: false,
      },
    ],
    outputSchema: [
      {
        name: "targetInfo",
        datatype: "object",
        description: "Information about the copied item at the target location.",
      },
    ],
  },

  "delete-file": {
    label: "Delete File/Directory",
    description: "Deletes a file or directory.",
    inputSchema: [
      {
        name: "path",
        datatype: "string",
        description: "Path of the file or directory to delete.",
      },
      {
        name: "file Name",
        datatype: "string",
        description: "it will remove the file from flow",
      },
    ],
    outputSchema: [
      {
        name: "textContent", // Or binaryContent depending on readAs
        datatype: "string", // or 'Buffer'/'Blob'/'ArrayBuffer' if binary
        description: "Content of the file.",
      },
      {
        name: "fileName",
        datatype: "object",
        description: "Information about the read file.",
      },
      {
        name: "file fullname",
        datatype: "string",
        description: " Context of file",
      },
      {
        name: "filepath",
        datatype: "string",
        description: " Context of file",
      },
      {
        name: "file size",
        datatype: "Number",
        description: " Context of file",
      },
      {
        name: "file type",
        datatype: "string",
        description: " Context of file",
      },
      {
        name: "lastmodified",
        datatype: "string",
        description: " Context of file",
      },
    ],
  },

  "list-files": {
    label: "List Directory",
    description: "Lists files and/or directories within a path.",
    inputSchema: [
      {
        name: "directoryPath",
        datatype: "string",
        description: "Directory path to list contents from.",
        required: true,
      },
      {
        name: "filter", // e.g., "*.txt", "image.*"
        datatype: "string",
        description: "Glob pattern to filter items.",
        required: false,
      },
      {
        name: "recursive",
        datatype: "boolean",
        description: "Include items in subdirectories.",
        required: false,
      },
      {
        name: "type", // 'files', 'directories', 'all'
        datatype: "string",
        description: "Type of items to list (default: all).",
        required: false,
      },
    ],
    outputSchema: [
      {
        name: "items", // Array of strings (paths) or fileInfo objects
        datatype: "array",
        description: "Array of found file/directory paths or info objects.",
      },
      {
        name: "count",
        datatype: "number",
        description: "Number of items found.",
      },
    ],
  },

  "file-poller": {
    label: "File Poller",
    description: "Triggers when files change in a directory.",
    inputSchema: [
      // Configured via properties panel, not typically dynamic inputs
      // Usually configuration like directory, filter, interval
    ],
    outputSchema: [
      // Output depends on the event
      {
        name: "event", // 'create', 'modify', 'delete'
        datatype: "string",
        description: "Type of file event detected.",
      },
      {
        name: "fileInfo",
        datatype: "object",
        description: "Information about the file that triggered the event.",
      },
      {
        name: "timestamp",
        datatype: "string", // ISO timestamp
        description: "When the change was detected.",
      },
    ],
  },

  "http-receiver": {
    label: "HTTP Receiver",
    description: "Starts a listener for incoming HTTP requests.",
    inputSchema: [
      // Configured via properties panel, not typically dynamic inputs
      // Usually configuration like path, method, port
    ],
    outputSchema: [
      {
        name: "request",
        datatype: "object",
        description: "Details of the incoming HTTP request.",
      },
      {
        name: "request.method",
        datatype: "string",
        description: "HTTP method (GET, POST, etc.).",
      },
      {
        name: "request.path",
        datatype: "string",
        description: "Request path.",
      },
      {
        name: "request.headers",
        datatype: "object",
        description: "Request headers.",
      },
      {
        name: "request.query",
        datatype: "object",
        description: "URL query parameters.",
      },
      {
        name: "request.body",
        datatype: "any",
        description: "Request body content.",
      },
      {
        name: "responseHandle", // An identifier or object needed by Send HTTP Response
        datatype: "any",
        description: "Handle required to send a response back.",
      },
    ],
  },

  "send-http-request": {
    label: "Send HTTP Request",
    description: "Makes an outgoing HTTP request.",
    inputSchema: [
      {
        name: "url",
        datatype: "string",
        description: "URL to send the request to.",
        required: true,
      },
      {
        name: "method", // GET, POST, PUT, DELETE, etc.
        datatype: "string",
        description: "HTTP method (default: GET).",
        required: false,
      },
      {
        name: "headers",
        datatype: "object",
        description: "HTTP headers as key-value pairs.",
        required: false,
      },
      {
        name: "query",
        datatype: "object",
        description: "URL query parameters as key-value pairs.",
        required: false,
      },
      {
        name: "body",
        datatype: "any", // string, object (will be JSON stringified?), Buffer
        description: "Request body.",
        required: false,
      },
      {
        name: "timeout",
        datatype: "number", // milliseconds
        description: "Request timeout in milliseconds.",
        required: false,
      },
    ],
    outputSchema: [
      {
        name: "response",
        datatype: "object",
        description: "Details of the HTTP response.",
      },
      { name: "response.status", datatype: "number", description: "HTTP status code." },
      { name: "response.headers", datatype: "object", description: "Response headers." },
      { name: "response.body", datatype: "any", description: "Response body (parsed if JSON, otherwise raw)." },
      {
        name: "error",
        datatype: "string",
        description: "Error message if the request failed.",
      },
    ],
  },

  "send-http-response": {
    label: "Send HTTP Response",
    description: "Sends response back for a received HTTP request.",
    inputSchema: [
      {
        name: "responseHandle", // The identifier from HTTP Receiver
        datatype: "any",
        description: "Handle for the request to respond to.",
        required: true,
      },
      {
        name: "status",
        datatype: "number",
        description: "HTTP status code (default: 200).",
        required: false,
      },
      {
        name: "headers",
        datatype: "object",
        description: "Response headers.",
        required: false,
      },
      {
        name: "body",
        datatype: "any",
        description: "Response body.",
        required: false,
      },
    ],
    outputSchema: [
      // Often doesn't output data, just completes an interaction
      {
        name: "sent",
        datatype: "boolean",
        description: "Indicates if the response was successfully sent.",
      },
    ],
  },

  code: {
    label: "Execute Code",
    description: "Executes custom JavaScript code.",
    inputSchema: [
      // Inputs can be dynamically defined or passed as a single object
      {
        name: "inputData",
        datatype: "any",
        description: "Data passed into the code execution context.",
        required: false,
      },
      // Code itself is usually configured in the properties panel
    ],
    outputSchema: [
      {
        name: "result",
        datatype: "any",
        description: "The value returned by the executed code.",
      },
      {
        name: "error",
        datatype: "string",
        description: "Error message if code execution failed.",
      },
      {
        name: "logs",
        datatype: "array", // Array of strings
        description: "Console logs captured during execution.",
      },
    ],
  },

  // Database node schema
  database: {
    label: "Database",
    description: "Database operations with connection and write modes, supports file input from read-file nodes.",
    inputSchema: [
      {
        name: "fileData",
        datatype: "object",
        description: "File data from read-file node (content, path, metadata).",
        required: false,
      },
      {
        name: "provider",
        datatype: "string",
        description: "Database provider (postgresql, mysql, sqlserver, oracle, local).",
        required: true,
      },
      {
        name: "host",
        datatype: "string",
        description: "Database host.",
        required: true,
      },
      {
        name: "port",
        datatype: "integer",
        description: "Database port.",
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
        name: "databaseName",
        datatype: "string",
        description: "Database name.",
        required: true,
      },
      {
        name: "tableName",
        datatype: "string",
        description: "Table name to write to.",
        required: true,
      },
      {
        name: "writeMode",
        datatype: "string",
        description: "Write mode (insert, update, upsert).",
        required: true,
      },
      {
        name: "batchSize",
        datatype: "integer",
        description: "Batch size for writing to the database.",
        required: false,
      },
      {
        name: "columns",
        datatype: "array",
        description: "Array of column names to write to the database.",
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
        name: "inputFile",
        datatype: "string",
        description: "Path of the input file that was processed.",
      },
      {
        name: "tableName",
        datatype: "string",
        description: "Name of the database table that was updated.",
      },
    ],
  },

  // Updated source node schema in nodeSchemas.ts
  source: {
    label: "Source",
    description: "Load data from various source providers including databases with schema definition.",
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
        description: "Source file format (e.g., csv, json, parquet) or sql for database.",
        required: true,
      },
      {
        name: "filePath",
        datatype: "string",
        description: "Path to the source file or data location (not required for database).",
        required: false,
      },
      {
        name: "connectionString",
        datatype: "string",
        description: "Database connection string (required when provider is database).",
        required: false,
      },
      {
        name: "tableName",
        datatype: "string",
        description: "Database table name (required when provider is database).",
        required: false,
      },
      {
        name: "username",
        datatype: "string",
        description: "Database username (required when provider is database).",
        required: false,
      },
      {
        name: "password",
        datatype: "string",
        description: "Database password (required when provider is database).",
        required: false,
      },
      {
        name: "batchSize",
        datatype: "string",
        description: "Batch size for database operations (optional for database provider).",
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
        description: "The source file path that was processed (for file sources).",
      },
      {
        name: "tableName",
        datatype: "string",
        description: "The database table name that was processed (for database sources).",
      },
      {
        name: "format",
        datatype: "string",
        description: "The format of the source data.",
      },
      {
        name: "provider",
        datatype: "string",
        description: "The provider used for the source data.",
      },
    ],
  },

  "salesforce-cloud": {
    label: "Salesforce Cloud",
    description: "Read data from Salesforce using SOQL queries and save to file.",
    inputSchema: [
      {
        name: "object_name",
        datatype: "string",
        description: "Salesforce object name (e.g., Account, Contact, Opportunity).",
        required: true,
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "query",
        datatype: "string",
        description: "SOQL query to execute against Salesforce.",
        required: true,
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "use_bulk_api",
        datatype: "boolean",
        description: "Whether to use Salesforce Bulk API for large data sets.",
        required: false,
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "file_path",
        datatype: "string",
        description: "Output file path to save the query results.",
        required: true,
        sourceNodeId: "",
        originalName: "",
      },
    ],
    outputSchema: [
      {
        name: "records",
        datatype: "array",
        description: "Array of records returned from Salesforce query.",
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "record_count",
        datatype: "integer",
        description: "Number of records retrieved.",
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "file_path",
        datatype: "string",
        description: "Path where the results were saved.",
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "success",
        datatype: "boolean",
        description: "Whether the Salesforce operation was successful.",
        sourceNodeId: "",
        originalName: "",
      },
      {
        name: "error",
        datatype: "string",
        description: "Error message if any.",
        sourceNodeId: "",
        originalName: "",
      },
    ],
  },

  // ----- MISSING SCHEMAS ADDED BELOW -----
  "xml-parser": {
    label: "XML Parser",
    description: "Parses an XML string into a structured object.",
    inputSchema: [
      {
        name: "xmlString",
        datatype: "string",
        description: "The XML content to parse.",
        required: true,
      },
      {
        name: "options", // e.g., ignoreAttributes, explicitArray
        datatype: "object",
        description: "Parsing options (specific to the library used).",
        required: false,
      },
    ],
    outputSchema: [
      {
        name: "parsedObject",
        datatype: "object",
        description: "The JavaScript object representation of the XML.",
      },
      {
        name: "error",
        datatype: "string",
        description: "Error message if parsing failed.",
      },
    ],
  },

  "xml-render": {
    label: "XML Render",
    description: "Renders a JavaScript object into an XML string.",
    inputSchema: [
      {
        name: "jsonObject",
        datatype: "object",
        description: "The JavaScript object to render as XML.",
        required: true,
      },
      {
        name: "options", // e.g., rootName, prettyPrint, indentation
        datatype: "object",
        description: "Rendering options (specific to the library used).",
        required: false,
      },
    ],
    outputSchema: [
      {
        name: "xmlString",
        datatype: "string",
        description: "The resulting XML string.",
      },
      {
        name: "error",
        datatype: "string",
        description: "Error message if rendering failed.",
      },
    ],
  },
  // ----- END OF ADDED SCHEMAS -----
}

// Helper function to get a schema by node type
export const getNodeSchema = (nodeType: NodeType | null | undefined): NodeSchema | undefined => {
  // Handle null/undefined input
  if (!nodeType) {
    return undefined
  }

  // Direct case-sensitive match (most efficient)
  if (nodeSchemas[nodeType]) {
    return nodeSchemas[nodeType]
  }

  // Fallback: Case-insensitive check (only if direct match fails)
  // Ensure nodeType is treated as a string for safety before lowercasing
  const normalizedType = typeof nodeType === "string" ? nodeType.toLowerCase() : null
  if (!normalizedType) {
    return undefined // If nodeType wasn't a string
  }

  // Find the key in nodeSchemas that matches case-insensitively
  const matchingKey = Object.keys(nodeSchemas).find((key) => key.toLowerCase() === normalizedType)

  // Return the schema if a matching key was found
  return matchingKey ? nodeSchemas[matchingKey as NodeType] : undefined
}
