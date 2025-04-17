// src/data/nodeSchemas.ts
import { NodeSchema, NodeType, SchemaItem } from "./workflow-context"; // Adjust path as needed

// Use a Record to strongly type the keys and values
export const nodeSchemas: Record<NodeType, NodeSchema> = {
  READ: {
    label: 'Read File',
    description: 'Reads data from a specified file.',
    inputSchema: [
      { name: 'fileName', datatype: 'string', description: 'The name and path of the file to read.', required: true },
      { name: 'encoding', datatype: 'string', description: 'The character encoding (e.g., UTF-8, ISO-8859-1). Defaults to JVM default if empty.', required: false },
    ],
    outputSchema: [
      { name: 'fileInfo', datatype: 'complex', description: 'Information about the file read.' },
      { name: 'fileInfo.fullName', datatype: 'string', description: 'The full name and path of the file.' },
      { name: 'fileInfo.fileName', datatype: 'string', description: 'The name of the file without the path.' },
      { name: 'fileInfo.location', datatype: 'string', description: 'The directory/path containing the file.' },
      { name: 'fileInfo.configuredFileName', datatype: 'string', description: 'Optional. Not populated by this activity.' },
      { name: 'fileInfo.type', datatype: 'string', description: 'The file type (e.g., "file", "directory").' },
      { name: 'fileInfo.size', datatype: 'integer', description: 'The size of the file in bytes.' },
      { name: 'fileInfo.lastModified', datatype: 'string', description: 'Timestamp when the file was last modified.' },
    ],
  },
  WRITE: {
    label: 'Write File',
    description: 'Writes data to a specified file.',
    inputSchema: [
      { name: 'fileName', datatype: 'string', description: 'The name and path of the file to write to.', required: true },
      { name: 'content', datatype: 'string', description: 'The text content to write.', required: true },
      { name: 'append', datatype: 'boolean', description: 'Append to the file if it exists.', required: false },
      { name: 'encoding', datatype: 'string', description: 'Character encoding for writing.', required: false },
    ],
    outputSchema: [
       { name: 'bytesWritten', datatype: 'integer', description: 'Number of bytes written to the file.' },
    ],
  },
  COPY: {
     label: 'Copy File',
     description: 'Copies a file or directory.',
     inputSchema: [
        { name: 'source', datatype: 'string', description: 'Path to the source file/directory.', required: true },
        { name: 'destination', datatype: 'string', description: 'Path to the destination file/directory.', required: true },
        { name: 'overwrite', datatype: 'boolean', description: 'Overwrite destination if it exists.', required: false },
     ],
     outputSchema: [],
  },
  CREATE: {
     label: 'Create Directory',
     description: 'Creates a new directory.',
     inputSchema: [
        { name: 'directoryPath', datatype: 'string', description: 'Path of the directory to create.', required: true },
        { name: 'createParents', datatype: 'boolean', description: 'Create parent directories if they do not exist.', required: false },
     ],
     outputSchema: [],
  },
  START: {
    label: 'Start',
    description: 'Workflow starting point.',
    inputSchema: [],
    outputSchema: [],
  },
  END: {
    label: 'END',
    description: 'Workflow ending point.',
    inputSchema: [],
    outputSchema: [],
  },
};

// Helper function to get a schema, returning NodeSchema or undefined
export const getNodeSchema = (nodeType: NodeType): NodeSchema | undefined => {
  return nodeSchemas[nodeType];
};