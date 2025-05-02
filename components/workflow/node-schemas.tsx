// node-schemas.tsx
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

// Map node types to their schemas (excluding read-file as it's now in the component)
export const nodeSchemas: Record<string, NodeSchema> = {
  "create-file": createFileSchema,
}

// Helper function to get schema for a node type
export function getNodeSchema(nodeType: string): NodeSchema | undefined {
  return nodeSchemas[nodeType]
}