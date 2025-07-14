// import type { NodeType, SchemaItem } from "@/services/interface"

// export interface NodeSchema {
//   label: string
//   description?: string
//   inputSchema?: SchemaItem[]
//   outputSchema?: SchemaItem[]
// }

// // Define schemas for all available node types
// export const nodeSchemas: Record<NodeType, NodeSchema> = {
//   start: {
//     label: "Start",
//     description: "Workflow starting point.",
//     inputSchema: [],
//     outputSchema: [
//       {
//         name: "triggerData",
//         datatype: "any",
//         description: "Data that initiated the workflow run.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "startTime",
//         datatype: "string",
//         description: "Timestamp when the workflow instance started.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//     ],
//   },

//   end: {
//     label: "End",
//     description: "Workflow ending point. Consumes final data.",
//     inputSchema: [
//       {
//         name: "finalResult",
//         datatype: "any",
//         description: "The final data payload to conclude the workflow.",
//         required: true,
//         sourceNodeId: "",
//         originalName: "",
//       },
//     ],
//     outputSchema: [],
//   },

//   "create-file": {
//     label: "Create File",
//     description: "Creates a new file or directory.",
//     inputSchema: [
//       {
//         name: "filename",
//         datatype: "string",
//         description: "Path and name of the file/directory to create.",
//         required: true,
//         sourceNodeId: "",
//         originalName: "",
//       },
//     ],
//     outputSchema: [
//       {
//         name: "fileInfo.fullName",
//         datatype: "string",
//         description: "Full path and name of the created item.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "file size",
//         datatype: "Number",
//         description: "file size",
//         sourceNodeId: "",
//         originalName: "",
//       },
//     ],
//   },

//   "read-file": {
//     label: "Read File",
//     description: "Reads content from an existing file.",
//     inputSchema: [
//       {
//         name: "filename",
//         datatype: "string",
//         description: "Path and name of the file to read.",
//         required: true,
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "encoding",
//         datatype: "string",
//         description: "Character encoding (default: UTF-8).",
//         required: false,
//         sourceNodeId: "",
//         originalName: "",
//       },
//     ],
//     outputSchema: [
//       {
//         name: "textContent",
//         datatype: "string",
//         description: "Content of the file.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "fileName",
//         datatype: "object",
//         description: "Information about the read file.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "file fullname",
//         datatype: "string",
//         description: " Context of file",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "filepath",
//         datatype: "string",
//         description: " Context of file",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "file size",
//         datatype: "Number",
//         description: " Context of file",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "file type",
//         datatype: "string",
//         description: " Context of file",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "lastmodified",
//         datatype: "string",
//         description: " Context of file",
//         sourceNodeId: "",
//         originalName: "",
//       },
//     ],
//   },

//   "write-file": {
//     label: "Write File",
//     description: "Writes content to a file.",
//     inputSchema: [
//       {
//         name: "filename",
//         datatype: "string",
//         description: "Path and name of the file to write.",
//         required: true,
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "Text Content",
//         datatype: "any",
//         description: "Content to write to the file.",
//         required: true,
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "encoding",
//         datatype: "string",
//         description: "Character encoding (default: UTF-8).",
//         required: false,
//         sourceNodeId: "",
//         originalName: "",
//       },
//     ],
//     outputSchema: [
//       {
//         name: "textContent",
//         datatype: "string",
//         description: "Content of the file.",
//       },
//       {
//         name: "fileName",
//         datatype: "object",
//         description: "Information about the read file.",
//       },
//       {
//         name: "file fullname",
//         datatype: "string",
//         description: " Context of file",
//       },
//       {
//         name: "filepath",
//         datatype: "string",
//         description: " Context of file",
//       },
//       {
//         name: "file size",
//         datatype: "Number",
//         description: " Context of file",
//       },
//       {
//         name: "file type",
//         datatype: "string",
//         description: " Context of file",
//       },
//       {
//         name: "lastmodified",
//         datatype: "string",
//         description: " Context of file",
//       },
//     ],
//   },

//   "copy-file": {
//     label: "Copy File/Directory",
//     description: "Copies a file or directory.",
//     inputSchema: [
//       {
//         name: "sourcePath",
//         datatype: "string",
//         description: "Path of the source file or directory.",
//         required: true,
//       },
//       {
//         name: "targetPath",
//         datatype: "string",
//         description: "Path for the destination file or directory.",
//         required: true,
//       },
//       {
//         name: "overwrite",
//         datatype: "boolean",
//         description: "Whether to overwrite if the target exists.",
//         required: false,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "targetInfo",
//         datatype: "object",
//         description: "Information about the copied item at the target location.",
//       },
//     ],
//   },

//   "delete-file": {
//     label: "Delete File/Directory",
//     description: "Deletes a file or directory.",
//     inputSchema: [
//       {
//         name: "path",
//         datatype: "string",
//         description: "Path of the file or directory to delete.",
//       },
//       {
//         name: "file Name",
//         datatype: "string",
//         description: "it will remove the file from flow",
//       },
//     ],
//     outputSchema: [
//       {
//         name: "textContent",
//         datatype: "string",
//         description: "Content of the file.",
//       },
//       {
//         name: "fileName",
//         datatype: "object",
//         description: "Information about the read file.",
//       },
//       {
//         name: "file fullname",
//         datatype: "string",
//         description: " Context of file",
//       },
//       {
//         name: "filepath",
//         datatype: "string",
//         description: " Context of file",
//       },
//       {
//         name: "file size",
//         datatype: "Number",
//         description: " Context of file",
//       },
//       {
//         name: "file type",
//         datatype: "string",
//         description: " Context of file",
//       },
//       {
//         name: "lastmodified",
//         datatype: "string",
//         description: " Context of file",
//       },
//     ],
//   },

//   "list-files": {
//     label: "List Directory",
//     description: "Lists files and/or directories within a path.",
//     inputSchema: [
//       {
//         name: "directoryPath",
//         datatype: "string",
//         description: "Directory path to list contents from.",
//         required: true,
//       },
//       {
//         name: "filter",
//         datatype: "string",
//         description: "Glob pattern to filter items.",
//         required: false,
//       },
//       {
//         name: "recursive",
//         datatype: "boolean",
//         description: "Include items in subdirectories.",
//         required: false,
//       },
//       {
//         name: "type",
//         datatype: "string",
//         description: "Type of items to list (default: all).",
//         required: false,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "items",
//         datatype: "array",
//         description: "Array of found file/directory paths or info objects.",
//       },
//       {
//         name: "count",
//         datatype: "number",
//         description: "Number of items found.",
//       },
//     ],
//   },

//   "file-poller": {
//     label: "File Poller",
//     description: "Triggers when files change in a directory.",
//     inputSchema: [],
//     outputSchema: [
//       {
//         name: "event",
//         datatype: "string",
//         description: "Type of file event detected.",
//       },
//       {
//         name: "fileInfo",
//         datatype: "object",
//         description: "Information about the file that triggered the event.",
//       },
//       {
//         name: "timestamp",
//         datatype: "string",
//         description: "When the change was detected.",
//       },
//     ],
//   },

//   "http-receiver": {
//     label: "HTTP Receiver",
//     description: "Starts a listener for incoming HTTP requests.",
//     inputSchema: [],
//     outputSchema: [
//       {
//         name: "request",
//         datatype: "object",
//         description: "Details of the incoming HTTP request.",
//       },
//       {
//         name: "request.method",
//         datatype: "string",
//         description: "HTTP method (GET, POST, etc.).",
//       },
//       {
//         name: "request.path",
//         datatype: "string",
//         description: "Request path.",
//       },
//       {
//         name: "request.headers",
//         datatype: "object",
//         description: "Request headers.",
//       },
//       {
//         name: "request.query",
//         datatype: "object",
//         description: "URL query parameters.",
//       },
//       {
//         name: "request.body",
//         datatype: "any",
//         description: "Request body content.",
//       },
//       {
//         name: "responseHandle",
//         datatype: "any",
//         description: "Handle required to send a response back.",
//       },
//     ],
//   },

//   "send-http-request": {
//     label: "Send HTTP Request",
//     description: "Makes an outgoing HTTP request.",
//     inputSchema: [
//       {
//         name: "url",
//         datatype: "string",
//         description: "URL to send the request to.",
//         required: true,
//       },
//       {
//         name: "method",
//         datatype: "string",
//         description: "HTTP method (default: GET).",
//         required: false,
//       },
//       {
//         name: "headers",
//         datatype: "object",
//         description: "HTTP headers as key-value pairs.",
//         required: false,
//       },
//       {
//         name: "query",
//         datatype: "object",
//         description: "URL query parameters as key-value pairs.",
//         required: false,
//       },
//       {
//         name: "body",
//         datatype: "any",
//         description: "Request body.",
//         required: false,
//       },
//       {
//         name: "timeout",
//         datatype: "number",
//         description: "Request timeout in milliseconds.",
//         required: false,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "response",
//         datatype: "object",
//         description: "Details of the HTTP response.",
//       },
//       { name: "response.status", datatype: "number", description: "HTTP status code." },
//       { name: "response.headers", datatype: "object", description: "Response headers." },
//       { name: "response.body", datatype: "any", description: "Response body (parsed if JSON, otherwise raw)." },
//       {
//         name: "error",
//         datatype: "string",
//         description: "Error message if the request failed.",
//       },
//     ],
//   },

//   "send-http-response": {
//     label: "Send HTTP Response",
//     description: "Sends response back for a received HTTP request.",
//     inputSchema: [
//       {
//         name: "responseHandle",
//         datatype: "any",
//         description: "Handle for the request to respond to.",
//         required: true,
//       },
//       {
//         name: "status",
//         datatype: "number",
//         description: "HTTP status code (default: 200).",
//         required: false,
//       },
//       {
//         name: "headers",
//         datatype: "object",
//         description: "Response headers.",
//         required: false,
//       },
//       {
//         name: "body",
//         datatype: "any",
//         description: "Response body.",
//         required: false,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "sent",
//         datatype: "boolean",
//         description: "Indicates if the response was successfully sent.",
//       },
//     ],
//   },

//   code: {
//     label: "Execute Code",
//     description: "Executes custom JavaScript code.",
//     inputSchema: [
//       {
//         name: "inputData",
//         datatype: "any",
//         description: "Data passed into the code execution context.",
//         required: false,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "result",
//         datatype: "any",
//         description: "The value returned by the executed code.",
//       },
//       {
//         name: "error",
//         datatype: "string",
//         description: "Error message if code execution failed.",
//       },
//       {
//         name: "logs",
//         datatype: "array",
//         description: "Console logs captured during execution.",
//       },
//     ],
//   },

//   database: {
//     label: "Database",
//     description: "Database operations with connection and write modes, supports file input from read-file nodes.",
//     inputSchema: [
//       {
//         name: "fileData",
//         datatype: "object",
//         description: "File data from read-file node (content, path, metadata).",
//         required: false,
//       },
//       {
//         name: "provider",
//         datatype: "string",
//         description: "Database provider (postgresql, mysql, sqlserver, oracle, local).",
//         required: true,
//       },
//       {
//         name: "host",
//         datatype: "string",
//         description: "Database host.",
//         required: true,
//       },
//       {
//         name: "port",
//         datatype: "integer",
//         description: "Database port.",
//         required: true,
//       },
//       {
//         name: "username",
//         datatype: "string",
//         description: "Database username.",
//         required: true,
//       },
//       {
//         name: "password",
//         datatype: "string",
//         description: "Database password.",
//         required: true,
//       },
//       {
//         name: "databaseName",
//         datatype: "string",
//         description: "Database name.",
//         required: true,
//       },
//       {
//         name: "tableName",
//         datatype: "string",
//         description: "Table name to write to.",
//         required: true,
//       },
//       {
//         name: "writeMode",
//         datatype: "string",
//         description: "Write mode (insert, update, upsert).",
//         required: true,
//       },
//       {
//         name: "batchSize",
//         datatype: "integer",
//         description: "Batch size for writing to the database.",
//         required: false,
//       },
//       {
//         name: "columns",
//         datatype: "array",
//         description: "Array of column names to write to the database.",
//         required: false,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "success",
//         datatype: "boolean",
//         description: "Whether the database operation was successful.",
//       },
//       {
//         name: "rowsProcessed",
//         datatype: "integer",
//         description: "Number of rows processed in the operation.",
//       },
//       {
//         name: "inputFile",
//         datatype: "string",
//         description: "Path of the input file that was processed.",
//       },
//       {
//         name: "tableName",
//         datatype: "string",
//         description: "Name of the database table that was updated.",
//       },
//     ],
//   },

//   source: {
//     label: "Source",
//     description: "Load data from various source providers including databases with schema definition.",
//     inputSchema: [
//       {
//         name: "provider",
//         datatype: "string",
//         description: "Source data provider (e.g., local, s3, hdfs, database).",
//         required: true,
//       },
//       {
//         name: "format",
//         datatype: "string",
//         description: "Source file format (e.g., csv, json, parquet) or sql for database.",
//         required: true,
//       },
//       {
//         name: "filePath",
//         datatype: "string",
//         description: "Path to the source file or data location (not required for database).",
//         required: false,
//       },
//       {
//         name: "connectionString",
//         datatype: "string",
//         description: "Database connection string (required when provider is database).",
//         required: false,
//       },
//       {
//         name: "tableName",
//         datatype: "string",
//         description: "Database table name (required when provider is database).",
//         required: false,
//       },
//       {
//         name: "username",
//         datatype: "string",
//         description: "Database username (required when provider is database).",
//         required: false,
//       },
//       {
//         name: "password",
//         datatype: "string",
//         description: "Database password (required when provider is database).",
//         required: false,
//       },
//       {
//         name: "batchSize",
//         datatype: "string",
//         description: "Batch size for database operations (optional for database provider).",
//         required: false,
//       },
//       {
//         name: "csvOptions",
//         datatype: "complex",
//         description: "CSV-specific options (header, inferSchema).",
//         required: false,
//       },
//       {
//         name: "schema",
//         datatype: "complex",
//         description: "Schema definition for the source data.",
//         required: false,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "data",
//         datatype: "object",
//         description: "The loaded data from the source.",
//       },
//       {
//         name: "schema",
//         datatype: "object",
//         description: "The inferred or defined schema of the data.",
//       },
//       {
//         name: "rowCount",
//         datatype: "integer",
//         description: "Number of rows loaded from the source.",
//       },
//       {
//         name: "filePath",
//         datatype: "string",
//         description: "The source file path that was processed (for file sources).",
//       },
//       {
//         name: "tableName",
//         datatype: "string",
//         description: "The database table name that was processed (for database sources).",
//       },
//       {
//         name: "format",
//         datatype: "string",
//         description: "The format of the source data.",
//       },
//       {
//         name: "provider",
//         datatype: "string",
//         description: "The provider used for the source data.",
//       },
//     ],
//   },

//   "salesforce-cloud": {
//     label: "Salesforce Cloud",
//     description: "Read data from Salesforce using SOQL queries and save to file.",
//     inputSchema: [
//       {
//         name: "object_name",
//         datatype: "string",
//         description: "Salesforce object name (e.g., Account, Contact, Opportunity).",
//         required: true,
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "query",
//         datatype: "string",
//         description: "SOQL query to execute against Salesforce.",
//         required: true,
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "use_bulk_api",
//         datatype: "boolean",
//         description: "Whether to use Salesforce Bulk API for large data sets.",
//         required: false,
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "file_path",
//         datatype: "string",
//         description: "Output file path to save the query results.",
//         required: true,
//         sourceNodeId: "",
//         originalName: "",
//       },
//     ],
//     outputSchema: [
//       {
//         name: "records",
//         datatype: "array",
//         description: "Array of records returned from Salesforce query.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "record_count",
//         datatype: "integer",
//         description: "Number of records retrieved.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "file_path",
//         datatype: "string",
//         description: "Path where the results were saved.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "success",
//         datatype: "boolean",
//         description: "Whether the Salesforce operation was successful.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "error",
//         datatype: "string",
//         description: "Error message if any.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//     ],
//   },

//   "write-salesforce": {
//     label: "Salesforce Write",
//     description: "Write data to Salesforce objects using bulk API.",
//     inputSchema: [
//       {
//         name: "object_name",
//         datatype: "string",
//         description: "Salesforce object name to write to.",
//         required: true,
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "file_path",
//         datatype: "string",
//         description: "Input file path containing data to write.",
//         required: true,
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "use_bulk_api",
//         datatype: "boolean",
//         description: "Whether to use Salesforce Bulk API.",
//         required: false,
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "bulk_batch_size",
//         datatype: "integer",
//         description: "Batch size for bulk operations.",
//         required: false,
//         sourceNodeId: "",
//         originalName: "",
//       },
//     ],
//     outputSchema: [
//       {
//         name: "success",
//         datatype: "boolean",
//         description: "Whether the write operation was successful.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "records_processed",
//         datatype: "integer",
//         description: "Number of records processed.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "error",
//         datatype: "string",
//         description: "Error message if any.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//     ],
//   },

//   "xml-parser": {
//     label: "XML Parser",
//     description: "Parses an XML string into a structured object.",
//     inputSchema: [
//       {
//         name: "xmlString",
//         datatype: "string",
//         description: "The XML content to parse.",
//         required: true,
//       },
//       {
//         name: "options",
//         datatype: "object",
//         description: "Parsing options (specific to the library used).",
//         required: false,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "parsedObject",
//         datatype: "object",
//         description: "The JavaScript object representation of the XML.",
//       },
//       {
//         name: "error",
//         datatype: "string",
//         description: "Error message if parsing failed.",
//       },
//     ],
//   },

//   "xml-render": {
//     label: "XML Render",
//     description: "Renders a JavaScript object into an XML string.",
//     inputSchema: [
//       {
//         name: "jsonObject",
//         datatype: "object",
//         description: "The JavaScript object to render as XML.",
//         required: true,
//       },
//       {
//         name: "options",
//         datatype: "object",
//         description: "Rendering options (specific to the library used).",
//         required: false,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "xmlString",
//         datatype: "string",
//         description: "The resulting XML string.",
//       },
//       {
//         name: "error",
//         datatype: "string",
//         description: "Error message if rendering failed.",
//       },
//     ],
//   },

//   // ----- NEW SCHEMA ADDED BELOW -----
//   "read-node": {
//     label: "Read Node",
//     description:
//       "Reads content from files in various formats (XML, JSON, CSV, text) with configurable limits and formatting.",
//     inputSchema: [
//       {
//         name: "input_path",
//         datatype: "string",
//         description: "The absolute path to the file to read content from.",
//         required: true,
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "limit",
//         datatype: "integer",
//         description: "Maximum number of records/lines to read from the file (default: 50).",
//         required: false,
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "pretty",
//         datatype: "boolean",
//         description: "Whether to format the output in a readable format (default: false).",
//         required: false,
//         sourceNodeId: "",
//         originalName: "",
//       },
//     ],
//     outputSchema: [
//       {
//         name: "content",
//         datatype: "string",
//         description: "The content of the file in its original format (XML, JSON, CSV, or text).",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "file_path",
//         datatype: "string",
//         description: "The path of the file that was read (passed to next nodes).",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "file_type",
//         datatype: "string",
//         description: "The detected type/format of the file (xml, json, csv, text).",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "record_count",
//         datatype: "integer",
//         description: "Number of records/lines read from the file.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "success",
//         datatype: "boolean",
//         description: "Indicates whether the read operation was successful.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//       {
//         name: "error_message",
//         datatype: "string",
//         description: "Error message if the operation failed.",
//         sourceNodeId: "",
//         originalName: "",
//       },
//     ],
//   },

//   "transform-xml": {
//     label: "Transform XML",
//     description: "Transforms XML data using XSLT or custom transformations.",
//     inputSchema: [
//       {
//         name: "xmlData",
//         datatype: "string",
//         description: "XML data to transform.",
//         required: true,
//       },
//       {
//         name: "transformation",
//         datatype: "string",
//         description: "XSLT or transformation rules.",
//         required: true,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "transformedXml",
//         datatype: "string",
//         description: "The transformed XML data.",
//       },
//       {
//         name: "error",
//         datatype: "string",
//         description: "Error message if transformation failed.",
//       },
//     ],
//   },

//   "json-parse": {
//     label: "JSON Parse",
//     description: "Parses JSON string into JavaScript object.",
//     inputSchema: [
//       {
//         name: "jsonString",
//         datatype: "string",
//         description: "JSON string to parse.",
//         required: true,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "parsedObject",
//         datatype: "object",
//         description: "Parsed JavaScript object.",
//       },
//       {
//         name: "error",
//         datatype: "string",
//         description: "Error message if parsing failed.",
//       },
//     ],
//   },

//   "json-render": {
//     label: "JSON Render",
//     description: "Renders JavaScript object as JSON string.",
//     inputSchema: [
//       {
//         name: "object",
//         datatype: "object",
//         description: "JavaScript object to render.",
//         required: true,
//       },
//       {
//         name: "pretty",
//         datatype: "boolean",
//         description: "Whether to format with indentation.",
//         required: false,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "jsonString",
//         datatype: "string",
//         description: "Rendered JSON string.",
//       },
//       {
//         name: "error",
//         datatype: "string",
//         description: "Error message if rendering failed.",
//       },
//     ],
//   },

//   "transform-json": {
//     label: "Transform JSON",
//     description: "Transforms JSON data using JSONPath or custom transformations.",
//     inputSchema: [
//       {
//         name: "jsonData",
//         datatype: "object",
//         description: "JSON data to transform.",
//         required: true,
//       },
//       {
//         name: "transformation",
//         datatype: "string",
//         description: "JSONPath or transformation rules.",
//         required: true,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "transformedJson",
//         datatype: "object",
//         description: "The transformed JSON data.",
//       },
//       {
//         name: "error",
//         datatype: "string",
//         description: "Error message if transformation failed.",
//       },
//     ],
//   },

//   "parse-data": {
//     label: "Parse Data",
//     description: "Parses structured data into usable format.",
//     inputSchema: [
//       {
//         name: "data",
//         datatype: "any",
//         description: "Raw data to parse.",
//         required: true,
//       },
//       {
//         name: "format",
//         datatype: "string",
//         description: "Data format (csv, json, xml, etc.).",
//         required: true,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "parsedData",
//         datatype: "object",
//         description: "Parsed data in structured format.",
//       },
//       {
//         name: "schema",
//         datatype: "object",
//         description: "Inferred data schema.",
//       },
//     ],
//   },

//   "render-data": {
//     label: "Render Data",
//     description: "Renders data in specified format.",
//     inputSchema: [
//       {
//         name: "data",
//         datatype: "object",
//         description: "Data to render.",
//         required: true,
//       },
//       {
//         name: "format",
//         datatype: "string",
//         description: "Output format (csv, json, xml, etc.).",
//         required: true,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "renderedData",
//         datatype: "string",
//         description: "Data rendered in specified format.",
//       },
//     ],
//   },

//   "rename-file": {
//     label: "Rename File",
//     description: "Renames a file or directory.",
//     inputSchema: [
//       {
//         name: "oldPath",
//         datatype: "string",
//         description: "Current path of the file or directory.",
//         required: true,
//       },
//       {
//         name: "newPath",
//         datatype: "string",
//         description: "New path for the file or directory.",
//         required: true,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "success",
//         datatype: "boolean",
//         description: "Whether the rename operation was successful.",
//       },
//       {
//         name: "newPath",
//         datatype: "string",
//         description: "The new path of the renamed item.",
//       },
//     ],
//   },

//   "move-file": {
//     label: "Move File",
//     description: "Moves a file or directory to a new location.",
//     inputSchema: [
//       {
//         name: "sourcePath",
//         datatype: "string",
//         description: "Current path of the file or directory.",
//         required: true,
//       },
//       {
//         name: "destinationPath",
//         datatype: "string",
//         description: "Destination path for the file or directory.",
//         required: true,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "success",
//         datatype: "boolean",
//         description: "Whether the move operation was successful.",
//       },
//       {
//         name: "destinationPath",
//         datatype: "string",
//         description: "The destination path of the moved item.",
//       },
//     ],
//   },

//   filter: {
//     label: "Filter",
//     description: "Filters data based on specified conditions.",
//     inputSchema: [
//       {
//         name: "data",
//         datatype: "array",
//         description: "Data array to filter.",
//         required: true,
//       },
//       {
//         name: "conditions",
//         datatype: "object",
//         description: "Filter conditions and criteria.",
//         required: true,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "filteredData",
//         datatype: "array",
//         description: "Data that matches the filter conditions.",
//       },
//       {
//         name: "count",
//         datatype: "number",
//         description: "Number of items that passed the filter.",
//       },
//     ],
//   },

//   file: {
//     label: "File",
//     description: "File conversion operations between different formats.",
//     inputSchema: [
//       {
//         name: "inputFile",
//         datatype: "string",
//         description: "Path to the input file.",
//         required: true,
//       },
//       {
//         name: "inputFormat",
//         datatype: "string",
//         description: "Format of the input file.",
//         required: true,
//       },
//       {
//         name: "outputFormat",
//         datatype: "string",
//         description: "Desired output format.",
//         required: true,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "outputFile",
//         datatype: "string",
//         description: "Path to the converted output file.",
//       },
//       {
//         name: "success",
//         datatype: "boolean",
//         description: "Whether the conversion was successful.",
//       },
//     ],
//   },

//   "inline-input": {
//     label: "Inline Input",
//     description: "Process inline data content directly without file system access.",
//     inputSchema: [
//       {
//         name: "content",
//         datatype: "string",
//         description: "Inline data content to process",
//         required: true,
//       },
//       {
//         name: "format",
//         datatype: "string",
//         description: "Input data format (json, csv, xml, txt)",
//         required: true,
//       },
//       {
//         name: "options",
//         datatype: "object",
//         description: "Format-specific input options",
//         required: false,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "processedData",
//         datatype: "object",
//         description: "Processed data ready for conversion",
//       },
//       {
//         name: "schema",
//         datatype: "object",
//         description: "Inferred or provided data schema",
//       },
//       {
//         name: "format",
//         datatype: "string",
//         description: "Input data format",
//       },
//       {
//         name: "recordCount",
//         datatype: "integer",
//         description: "Number of records processed",
//       },
//     ],
//   },

//   "inline-output": {
//     label: "Inline Output",
//     description: "Convert processed data and save to file system.",
//     inputSchema: [
//       {
//         name: "processedData",
//         datatype: "object",
//         description: "Data to convert and save",
//         required: true,
//       },
//       {
//         name: "format",
//         datatype: "string",
//         description: "Output format (json, csv, xml, txt)",
//         required: true,
//       },
//       {
//         name: "path",
//         datatype: "string",
//         description: "Output file path",
//         required: true,
//       },
//       {
//         name: "options",
//         datatype: "object",
//         description: "Format-specific output options",
//         required: false,
//       },
//     ],
//     outputSchema: [
//       {
//         name: "filePath",
//         datatype: "string",
//         description: "Path where file was saved",
//       },
//       {
//         name: "success",
//         datatype: "boolean",
//         description: "Whether the conversion was successful",
//       },
//       {
//         name: "recordCount",
//         datatype: "integer",
//         description: "Number of records processed",
//       },
//       {
//         name: "fileSize",
//         datatype: "integer",
//         description: "Size of the output file in bytes",
//       },
//     ],
//   },
// }

// // Helper function to get a schema by node type
// export const getNodeSchema = (nodeType: NodeType | null | undefined): NodeSchema | undefined => {
//   if (!nodeType) {
//     return undefined
//   }

//   if (nodeSchemas[nodeType]) {
//     return nodeSchemas[nodeType]
//   }

//   const normalizedType = typeof nodeType === "string" ? nodeType.toLowerCase() : null
//   if (!normalizedType) {
//     return undefined
//   }

//   const matchingKey = Object.keys(nodeSchemas).find((key) => key.toLowerCase() === normalizedType)

//   return matchingKey ? nodeSchemas[matchingKey as NodeType] : undefined
// }

//nodeSchemas.ts
import type { NodeType, SchemaItem } from "@/services/interface"; // Assuming SchemaItem is also in workflow-context

export interface NodeSchema {
  label: string;
  description: string;
  inputSchema: SchemaItem[];
  outputSchema: SchemaItem[];
}

const createFilePathField = (description: string): SchemaItem => ({
  name: "filePath",
  datatype: "string",
  description,
  required: true,
});

const createContentField = (): SchemaItem => ({
  name: "content",
  datatype: "string",
  description: "File content or data",
  required: false,
});

const createFormatField = (): SchemaItem => ({
  name: "format",
  datatype: "string",
  description: "File format (csv, json, xml, etc.)",
  required: false,
});

// Define schemas for all available node types
// This object MUST contain an entry for every possible value defined in the NodeType type.
export const nodeSchemas: Record<NodeType, NodeSchema> = {
  start: {
    label: "Start",
    description: "Workflow start node",
    inputSchema: [],
    outputSchema: [
      {
        name: "trigger",
        datatype: "string",
        description: "Trigger signal",
        required: true,
      },
    ],
  },

  end: {
    label: "End",
    description: "Workflow end node",
    inputSchema: [
      {
        name: "result",
        datatype: "any",
        description: "Final result",
        required: false,
      },
    ],
    outputSchema: [],
  },

  "read-file": {
    label: "Read File",
    description: "Read data from a file",
    inputSchema: [
      createFilePathField("Path to the file to read"),
      {
        name: "encoding",
        datatype: "string",
        description: "File encoding (utf-8, ascii, etc.)",
        required: false,
      },
      {
        name: "readAs",
        datatype: "string",
        description: "Read format (text, json, csv, etc.)",
        required: false,
      },
    ],
    outputSchema: [
      createFilePathField("Path of the read file"),
      createContentField(),
      createFormatField(),
      {
        name: "size",
        datatype: "number",
        description: "File size in bytes",
        required: false,
      },
      {
        name: "lastModified",
        datatype: "string",
        description: "Last modified timestamp",
        required: false,
      },
    ],
  },

  "write-file": {
    label: "Write File",
    description: "Write data to a file",
    inputSchema: [
      createFilePathField("Path where the file will be written"),
      createContentField(),
      {
        name: "encoding",
        datatype: "string",
        description: "File encoding",
        required: false,
      },
      {
        name: "writeAs",
        datatype: "string",
        description: "Write format",
        required: false,
      },
      {
        name: "overwrite",
        datatype: "boolean",
        description: "Overwrite existing file",
        required: false,
      },
      {
        name: "append",
        datatype: "boolean",
        description: "Append to existing file",
        required: false,
      },
    ],
    outputSchema: [
      createFilePathField("Path of the written file"),
      {
        name: "success",
        datatype: "boolean",
        description: "Write operation success",
        required: true,
      },
      {
        name: "bytesWritten",
        datatype: "number",
        description: "Number of bytes written",
        required: false,
      },
    ],
  },

  "create-file": {
    label: "Create File",
    description: "Create a new file",
    inputSchema: [
      createFilePathField("Path for the new file"),
      createContentField(),
      {
        name: "encoding",
        datatype: "string",
        description: "File encoding",
        required: false,
      },
      {
        name: "overwrite",
        datatype: "boolean",
        description: "Overwrite if exists",
        required: false,
      },
    ],
    outputSchema: [
      createFilePathField("Path of the created file"),
      {
        name: "created",
        datatype: "boolean",
        description: "File creation success",
        required: true,
      },
    ],
  },

  "copy-file": {
    label: "Copy File",
    description: "Copy a file from source to destination",
    inputSchema: [
      {
        name: "source_path",
        datatype: "string",
        description: "Source file path",
        required: true,
      },
      {
        name: "destination_path",
        datatype: "string",
        description: "Destination file path",
        required: true,
      },
      {
        name: "overwrite",
        datatype: "boolean",
        description: "Overwrite destination if exists",
        required: false,
      },
    ],
    outputSchema: [
      {
        name: "source_path",
        datatype: "string",
        description: "Source file path",
        required: true,
      },
      {
        name: "destination_path",
        datatype: "string",
        description: "Destination file path",
        required: true,
      },
      {
        name: "success",
        datatype: "boolean",
        description: "Copy operation success",
        required: true,
      },
    ],
  },

  "move-file": {
    label: "Move File",
    description: "Move a file from source to destination",
    inputSchema: [
      {
        name: "source_path",
        datatype: "string",
        description: "Source file path",
        required: true,
      },
      {
        name: "destination_path",
        datatype: "string",
        description: "Destination file path",
        required: true,
      },
      {
        name: "overwrite",
        datatype: "boolean",
        description: "Overwrite destination if exists",
        required: false,
      },
    ],
    outputSchema: [
      {
        name: "source_path",
        datatype: "string",
        description: "Original source path",
        required: true,
      },
      {
        name: "destination_path",
        datatype: "string",
        description: "New file path",
        required: true,
      },
      createFilePathField("Current file path (same as destination_path)"),
      {
        name: "success",
        datatype: "boolean",
        description: "Move operation success",
        required: true,
      },
    ],
  },

  "rename-file": {
    label: "Rename File",
    description: "Rename a file",
    inputSchema: [
      {
        name: "oldFilename",
        datatype: "string",
        description: "Current filename",
        required: true,
      },
      {
        name: "newFilename",
        datatype: "string",
        description: "New filename",
        required: true,
      },
    ],
    outputSchema: [
      {
        name: "oldFilename",
        datatype: "string",
        description: "Previous filename",
        required: true,
      },
      {
        name: "newFilename",
        datatype: "string",
        description: "New filename",
        required: true,
      },
      createFilePathField("Updated file path"),
      {
        name: "success",
        datatype: "boolean",
        description: "Rename operation success",
        required: true,
      },
    ],
  },

  "delete-file": {
    label: "Delete File",
    description: "Delete a file",
    inputSchema: [
      createFilePathField("Path to the file to delete"),
      {
        name: "recursive",
        datatype: "boolean",
        description: "Delete recursively if directory",
        required: false,
      },
    ],
    outputSchema: [
      createFilePathField("Path of the deleted file"),
      {
        name: "deleted",
        datatype: "boolean",
        description: "Deletion success",
        required: true,
      },
    ],
  },

  filter: {
    label: "Filter",
    description: "Filter and transform data",
    inputSchema: [
      {
        name: "data",
        datatype: "array",
        description: "Input data to filter",
        required: true,
      },
      {
        name: "filter",
        datatype: "object",
        description: "Filter conditions",
        required: false,
      },
      {
        name: "order_by",
        datatype: "array",
        description: "Sort order",
        required: false,
      },
      {
        name: "aggregation",
        datatype: "object",
        description: "Aggregation config",
        required: false,
      },
    ],
    outputSchema: [
      {
        name: "data",
        datatype: "array",
        description: "Filtered data",
        required: true,
      },
      {
        name: "recordCount",
        datatype: "number",
        description: "Number of records",
        required: false,
      },
    ],
  },

  database: {
    label: "Database",
    description: "Database operations",
    inputSchema: [
      {
        name: "connectionString",
        datatype: "string",
        description: "Database connection string",
        required: true,
      },
      {
        name: "table",
        datatype: "string",
        description: "Table name",
        required: true,
      },
      {
        name: "data",
        datatype: "array",
        description: "Data to write",
        required: false,
      },
      {
        name: "query",
        datatype: "string",
        description: "SQL query",
        required: false,
      },
      {
        name: "writeMode",
        datatype: "string",
        description: "Write mode (append, overwrite)",
        required: false,
      },
    ],
    outputSchema: [
      {
        name: "data",
        datatype: "array",
        description: "Query results",
        required: false,
      },
      {
        name: "success",
        datatype: "boolean",
        description: "Operation success",
        required: true,
      },
      {
        name: "recordCount",
        datatype: "number",
        description: "Number of records affected",
        required: false,
      },
    ],
  },

  source: {
    label: "Source",
    description: "Data source node",
    inputSchema: [
      {
        name: "connectionString",
        datatype: "string",
        description: "Connection string",
        required: true,
      },
      {
        name: "query",
        datatype: "string",
        description: "Query to execute",
        required: false,
      },
      {
        name: "table",
        datatype: "string",
        description: "Table name",
        required: false,
      },
    ],
    outputSchema: [
      {
        name: "data",
        datatype: "array",
        description: "Source data",
        required: true,
      },
      {
        name: "recordCount",
        datatype: "number",
        description: "Number of records",
        required: false,
      },
    ],
  },

  "salesforce-cloud": {
    label: "Salesforce Cloud",
    description: "Read from Salesforce",
    inputSchema: [
      {
        name: "object_name",
        datatype: "string",
        description: "Salesforce object name",
        required: true,
      },
      {
        name: "fields",
        datatype: "array",
        description: "Fields to retrieve",
        required: false,
      },
      {
        name: "query",
        datatype: "string",
        description: "SOQL query",
        required: false,
      },
      {
        name: "where",
        datatype: "string",
        description: "WHERE clause",
        required: false,
      },
      {
        name: "limit",
        datatype: "number",
        description: "Record limit",
        required: false,
      },
      {
        name: "use_bulk_api",
        datatype: "boolean",
        description: "Use Bulk API",
        required: false,
      },
      createFilePathField("Output file path"),
    ],
    outputSchema: [
      {
        name: "data",
        datatype: "array",
        description: "Salesforce data",
        required: true,
      },
      createFilePathField("Output file path"),
      {
        name: "recordCount",
        datatype: "number",
        description: "Number of records",
        required: false,
      },
    ],
  },

  "write-salesforce": {
    label: "Write Salesforce",
    description: "Write to Salesforce",
    inputSchema: [
      {
        name: "object_name",
        datatype: "string",
        description: "Salesforce object name",
        required: true,
      },
      {
        name: "data",
        datatype: "array",
        description: "Data to write",
        required: true,
      },
      {
        name: "use_bulk_api",
        datatype: "boolean",
        description: "Use Bulk API",
        required: false,
      },
      {
        name: "bulk_batch_size",
        datatype: "number",
        description: "Bulk batch size",
        required: false,
      },
      {
        name: "update_objects",
        datatype: "boolean",
        description: "Update existing objects",
        required: false,
      },
      createFilePathField("Input file path"),
    ],
    outputSchema: [
      {
        name: "success",
        datatype: "boolean",
        description: "Write operation success",
        required: true,
      },
      {
        name: "recordCount",
        datatype: "number",
        description: "Number of records processed",
        required: false,
      },
      {
        name: "errors",
        datatype: "array",
        description: "Any errors encountered",
        required: false,
      },
    ],
  },

  "inline-input": {
    label: "Inline Input",
    description: "Inline data input",
    inputSchema: [
      createContentField(),
      createFormatField(),
      {
        name: "schema",
        datatype: "object",
        description: "Data schema",
        required: false,
      },
    ],
    outputSchema: [
      {
        name: "data",
        datatype: "any",
        description: "Processed data",
        required: true,
      },
      createFormatField(),
      {
        name: "recordCount",
        datatype: "number",
        description: "Number of records",
        required: false,
      },
    ],
  },

  "inline-output": {
    label: "Inline Output",
    description: "Inline data output",
    inputSchema: [
      {
        name: "data",
        datatype: "any",
        description: "Data to output",
        required: true,
      },
      createFilePathField("Output path (optional)"),
      createFormatField(),
    ],
    outputSchema: [
      createFilePathField("Output path"),
      {
        name: "success",
        datatype: "boolean",
        description: "Output success",
        required: true,
      },
      {
        name: "recordCount",
        datatype: "number",
        description: "Number of records",
        required: false,
      },
    ],
  },

  file: {
    label: "File",
    description: "Generic file operations",
    inputSchema: [
      createFilePathField("File path"),
      {
        name: "operation",
        datatype: "string",
        description: "File operation",
        required: true,
      },
    ],
    outputSchema: [
      createFilePathField("File path"),
      {
        name: "result",
        datatype: "any",
        description: "Operation result",
        required: false,
      },
    ],
  },
};

export function getNodeSchema(nodeType: NodeType): NodeSchema | null {
  return nodeSchemas[nodeType] || null;
}

export function getAvailableInputsFromSchema(nodeType: NodeType): SchemaItem[] {
  const schema = getNodeSchema(nodeType);
  return schema?.inputSchema || [];
}

export function getAvailableOutputsFromSchema(
  nodeType: NodeType
): SchemaItem[] {
  const schema = getNodeSchema(nodeType);
  return schema?.outputSchema || [];
}
