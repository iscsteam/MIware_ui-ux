// This file defines the schema interfaces and helper functions for node schemas

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
  
  // Create File node schema
  export const createFileSchema: NodeSchema = {
    inputSchema: [
      {
        name: "fileName",
        datatype: "string",
        description:
          "The path and name of the file to create. Select the Is a Directory field check box on the General tab to specify the name of the directory to create.",
        required: true,
      },
    ],
    outputSchema: [
      {
        name: "fileInfo",
        datatype: "complex",
        description:
          "The element containing fullName, fileName, location, configuredFileName, type, readProtected, writeprotected, size, and lastModified",
      },
      {
        name: "fullName",
        datatype: "string",
        description: "The name of the file or directory, including the path information",
      },
      {
        name: "fileName",
        datatype: "string",
        description: "The name of the file or directory without the path information",
      },
      {
        name: "location",
        datatype: "string",
        description: "The path to the file or directory",
      },
      {
        name: "configuredFileName",
        datatype: "string",
        description: "This element is optional and it is not populated by this activity",
      },
      {
        name: "type",
        datatype: "string",
        description: "The type of the file",
      },
      {
        name: "readProtected",
        datatype: "boolean",
        description: "Signifies whether the file or directory is protected from reading",
      },
      {
        name: "writeProtected",
        datatype: "boolean",
        description: "Signifies whether the file or directory is protected from writing",
      },
      {
        name: "size",
        datatype: "integer",
        description: "The size of the file (in bytes)",
      },
      {
        name: "lastModified",
        datatype: "string",
        description: "The time stamp indicating when the file was last modified",
      },
    ],
  }
  
  // Write File node schema
  export const writeFileSchema: NodeSchema = {
    inputSchema: [
      {
        name: "fileName",
        datatype: "string",
        description: "The path and name of the file. Wildcards are not permitted in this field.",
        required: true,
      },
      {
        name: "textContent",
        datatype: "string",
        description:
          "The contents of the file (text files). This field is present when Write as is set to Text. When Write as is set to Binary, this field is replaced by the field binaryContent.",
      },
      {
        name: "addLineSeparator",
        datatype: "boolean",
        description:
          "This specifies whether to add a carriage return after each input line. This field is present when the value of the Write as field on the General tab is set to Text.",
      },
      {
        name: "encoding",
        datatype: "string",
        description:
          "The character encoding for text files. This element is available only when Text is specified in the Write as field on the General tab.",
      },
    ],
    outputSchema: [
      {
        name: "fileInfo",
        datatype: "complex",
        description: "This element contains the fileName, location, type, readProtected, writeProtected, and size data.",
      },
      {
        name: "fullName",
        datatype: "string",
        description: "The name of the file, including the path information.",
      },
      {
        name: "fileName",
        datatype: "string",
        description: "The name of the file without the path information.",
      },
      {
        name: "location",
        datatype: "string",
        description: "The path to the file.",
      },
      {
        name: "configuredFileName",
        datatype: "string",
        description: "An optional element. This element is not populated by this activity.",
      },
      {
        name: "type",
        datatype: "string",
        description: "The file type.",
      },
      {
        name: "wasProtected",
        datatype: "boolean",
        description: "Signifies whether the file or directory is protected from reading",
      },
      {
        name: "size",
        datatype: "integer",
        description: "The size of the file in bytes.",
      },
      {
        name: "lastModified",
        datatype: "string",
        description: "The timestamp indicating when the file was last modified.",
      },
    ],
  }
  
  // Map node types to their schemas
  export const nodeSchemas: Record<string, NodeSchema> = {
    "create-file": createFileSchema,
    "write-file": writeFileSchema,
    // Add other node schemas here
  }
  
  // Helper function to get schema for a node type
  export function getNodeSchema(nodeType: string): NodeSchema | undefined {
    return nodeSchemas[nodeType]
  }
  