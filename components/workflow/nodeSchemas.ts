// src/components/workflow/nodeSchemas.ts
import { NodeType, SchemaItem } from "./workflow-context"; // Assuming SchemaItem is also in workflow-context

export interface NodeSchema {
  label: string;
  description?: string;
  inputSchema?: SchemaItem[];
  outputSchema?: SchemaItem[];
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
        sourceNodeId:"",

        originalName:"",


      },
      {
        name: "startTime",
        datatype: "string", // ISO timestamp
        description: "Timestamp when the workflow instance started.",
        sourceNodeId:"",

        originalName:"",
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
        sourceNodeId:"",

        originalName:"",
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
        sourceNodeId:"",

        originalName:"",
      },
      //{
      //   name: "content",
      //   datatype: "string",
      //   description: "Initial content (for files only).",
      //   required: false,
      // },
      // {
      //   name: "overwrite",
      //   datatype: "boolean",
      //   description: "Whether to overwrite if the file/directory exists.",
      //   required: false,
      // },
      // {
      //   name: "isDirectory",
      //   datatype: "boolean",
      //   description: "Set to true to create a directory instead of a file.",
      //   required: false,
      // },
    ],
    outputSchema: [
      // {
      //   name: "fileInfo",
      //   datatype: "object",
      //   description: "Information about the created file/directory.",
      // },
      {
        name: "fileInfo.fullName",
        datatype: "string",
        description: "Full path and name of the created item.",
        sourceNodeId:"",

        originalName:"",
      },
      {
        name: "file size",
        datatype: "Number",
        description: "file size",
        sourceNodeId:"",

        originalName:"",
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
        sourceNodeId:"",

        originalName:"",
      },
      {
        name: "encoding",
        datatype: "string", // Consider specific options: 'utf-8', 'ascii', 'binary'
        description: "Character encoding (default: UTF-8).",
        required: false,
        sourceNodeId:"",

        originalName:"",
      },
      // {
      //   name: "readAs",
      //   datatype: "string", // 'text' or 'binary'
      //   description: "How to read the file content (default: text).",
      //   required: false,
      // },
    ],
    outputSchema: [
      {
        name: "textContent", // Or binaryContent depending on readAs
        datatype: "string", // or 'Buffer'/'Blob'/'ArrayBuffer' if binary
        description: "Content of the file.",
        sourceNodeId:"",

        originalName:"",
      },
      {
        name: "fileName",
        datatype: "object",
        description: "Information about the read file.",
        sourceNodeId:"",

        originalName:"",
      },
     {
      name :"file fullname",
      datatype: "string",
      description:" Context of file",
      sourceNodeId:"",

      originalName:"",
     },
     {
      name :"filepath",
      datatype: "string",
      description:" Context of file",
      sourceNodeId:"",

      originalName:"",
     },
     {
      name :"file size",
      datatype: "Number",
      description:" Context of file",
      sourceNodeId:"",

      originalName:"",
     },
     {
      name:"file type",
      datatype:"string",
      description:" Context of file",
      sourceNodeId:"",

      originalName:"",

     },
     {
      name:"lastmodified",
      datatype:"string",
      description:" Context of file",
      sourceNodeId:"",

      originalName:"",
     }

    
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
        sourceNodeId:"",

        originalName:"",
      },
      {
        name: "Text Content",
        datatype: "any", // Can be string or binary data
        description: "Content to write to the file.",
        required: true,
        sourceNodeId:"",

        originalName:"",
      },
      // {
      //   name: "append",
      //   datatype: "boolean",
      //   description: "Whether to append to existing content (default: overwrite).",
      //   required: false,
      // },
      {
        name: "encoding",
        datatype: "string", // 'utf-8', 'ascii', etc. (if content is text)
        description: "Character encoding (default: UTF-8).",
        required: false,
        sourceNodeId:"",

        originalName:"",
      },
      // {
      //   name: "createDirectory",
      //   datatype: "boolean",
      //   description: "Create parent directories if they don't exist.",
      //   required: false,
      // },
      // {
      //   name: "writeAs",
      //   datatype: "string",
      //   description: "text.",
      //   required: false,
      // },

      
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
      name :"file fullname",
      datatype: "string",
      description:" Context of file",
     },
     {
      name :"filepath",
      datatype: "string",
      description:" Context of file",
     },
     {
      name :"file size",
      datatype: "Number",
      description:" Context of file",
     },
     {
      name:"file type",
      datatype:"string",
      description:" Context of file",

     },
     {
      name:"lastmodified",
      datatype:"string",
      description:" Context of file",
     }
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
       // Add other relevant fileInfo properties
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
        // required: true,
      },
      {
        name: "file Name",
        datatype: "string",
        description: "it will remove the file from flow",
        // required: false,
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
      name :"file fullname",
      datatype: "string",
      description:" Context of file",
     },
     {
      name :"filepath",
      datatype: "string",
      description:" Context of file",
     },
     {
      name :"file size",
      datatype: "Number",
      description:" Context of file",
     },
     {
      name:"file type",
      datatype:"string",
      description:" Context of file",

     },
     {
      name:"lastmodified",
      datatype:"string",
      description:" Context of file",
     }
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
    inputSchema: [ // Configured via properties panel, not typically dynamic inputs
        // Usually configuration like directory, filter, interval
    ],
    outputSchema: [ // Output depends on the event
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
     inputSchema: [ // Configured via properties panel, not typically dynamic inputs
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
    outputSchema: [ // Often doesn't output data, just completes an interaction
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
    inputSchema: [ // Inputs can be dynamically defined or passed as a single object
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
};

// Helper function to get a schema by node type
export const getNodeSchema = (nodeType: NodeType | null | undefined): NodeSchema | undefined => {
  // Handle null/undefined input
  if (!nodeType) {
    return undefined;
  }

  // Direct case-sensitive match (most efficient)
  if (nodeSchemas[nodeType]) {
    return nodeSchemas[nodeType];
  }

  // Fallback: Case-insensitive check (only if direct match fails)
  // Ensure nodeType is treated as a string for safety before lowercasing
  const normalizedType = typeof nodeType === 'string' ? nodeType.toLowerCase() : null;
  if (!normalizedType) {
      return undefined; // If nodeType wasn't a string
  }

  // Find the key in nodeSchemas that matches case-insensitively
  const matchingKey = Object.keys(nodeSchemas).find(
    (key) => key.toLowerCase() === normalizedType
  );

  // Return the schema if a matching key was found
  return matchingKey ? nodeSchemas[matchingKey as NodeType] : undefined;
};