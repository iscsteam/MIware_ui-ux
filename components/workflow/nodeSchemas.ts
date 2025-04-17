// // src/data/nodeSchemas.ts
import { NodeType } from '@/components/workflow/workflow-context';
import { SchemaItem } from '@/components/workflow/SchemaModal';

export interface NodeSchema {
  label: string;
  description?: string;
  inputSchema?: SchemaItem[];
  outputSchema?: SchemaItem[];
}

// Define schemas for all available node types
export const nodeSchemas: Record<NodeType, NodeSchema> = {
  "start": {
    label: 'Start',
    description: 'Workflow starting point.',
    inputSchema: [],
    outputSchema: [
      { name: 'started', datatype: 'boolean', description: 'Indicates workflow has started.' },
      { name: 'timestamp', datatype: 'string', description: 'ISO timestamp when workflow started.' }
    ],
  },
  
  "end": {
    label: 'End',
    description: 'Workflow ending point.',
    inputSchema: [
      { name: 'result', datatype: 'any', description: 'Final workflow result.' },
    ],
    outputSchema: [],
  },
  
  "create-file": {
    label: 'Create File',
    description: 'Creates a new file at the specified location.',
    inputSchema: [
      { name: 'filename', datatype: 'string', description: 'Path and name of the file to create.', required: true },
      { name: 'content', datatype: 'string', description: 'Initial content of the file.', required: false },
      { name: 'overwrite', datatype: 'boolean', description: 'Whether to overwrite if file exists.', required: false },
    ],
    outputSchema: [
      { name: 'fileInfo', datatype: 'object', description: 'Information about the created file.' },
      { name: 'fileInfo.fullName', datatype: 'string', description: 'Full path and name of the created file.' },
      { name: 'fileInfo.fileName', datatype: 'string', description: 'Name of the file without the path.' },
      { name: 'fileInfo.size', datatype: 'number', description: 'Size of the file in bytes.' },
      { name: 'fileInfo.location', datatype: 'string', description: 'Directory containing the file.' },
      { name: 'fileInfo.lastModified', datatype: 'string', description: 'ISO timestamp of last modification.' },
    ],
  },
  
  "read-file": {
    label: 'Read File',
    description: 'Reads content from an existing file.',
    inputSchema: [
      { name: 'filename', datatype: 'string', description: 'Path and name of the file to read.', required: true },
      { name: 'encoding', datatype: 'string', description: 'Character encoding (default: UTF-8).', required: false },
    ],
    outputSchema: [
      { name: 'textContent', datatype: 'string', description: 'Text content of the file.' },
      { name: 'fileInfo', datatype: 'object', description: 'Information about the read file.' },
      { name: 'fileInfo.fullName', datatype: 'string', description: 'Full path and name of the file.' },
      { name: 'fileInfo.fileName', datatype: 'string', description: 'Name of the file without the path.' },
      { name: 'fileInfo.size', datatype: 'number', description: 'Size of the file in bytes.' },
      { name: 'fileInfo.location', datatype: 'string', description: 'Directory containing the file.' },
      { name: 'fileInfo.lastModified', datatype: 'string', description: 'ISO timestamp of last modification.' },
    ],
  },
  
  "write-file": {
    label: 'Write File',
    description: 'Writes content to a file.',
    inputSchema: [
      { name: 'filename', datatype: 'string', description: 'Path and name of the file to write.', required: true },
      { name: 'textContent', datatype: 'string', description: 'Content to write to the file.', required: true },
      { name: 'append', datatype: 'boolean', description: 'Whether to append to existing content.', required: false },
      { name: 'encoding', datatype: 'string', description: 'Character encoding (default: UTF-8).', required: false },
    ],
    outputSchema: [
      { name: 'fileInfo', datatype: 'object', description: 'Information about the written file.' },
      { name: 'fileInfo.fullName', datatype: 'string', description: 'Full path and name of the file.' },
      { name: 'fileInfo.fileName', datatype: 'string', description: 'Name of the file without the path.' },
      { name: 'fileInfo.size', datatype: 'number', description: 'Size of the file in bytes.' },
      { name: 'fileInfo.location', datatype: 'string', description: 'Directory containing the file.' },
      { name: 'fileInfo.lastModified', datatype: 'string', description: 'ISO timestamp of last modification.' },
    ],
  },
  
  "copy-file": {
    label: 'Copy File',
    description: 'Copies a file from one location to another.',
    inputSchema: [
      { name: 'sourceFilename', datatype: 'string', description: 'Path and name of source file.', required: true },
      { name: 'targetFilename', datatype: 'string', description: 'Path and name of destination file.', required: true },
      { name: 'overwrite', datatype: 'boolean', description: 'Whether to overwrite if target exists.', required: false },
    ],
    outputSchema: [
      { name: 'fileInfo', datatype: 'object', description: 'Information about the copied file.' },
      { name: 'fileInfo.fullName', datatype: 'string', description: 'Full path and name of the target file.' },
      { name: 'fileInfo.fileName', datatype: 'string', description: 'Name of the target file without the path.' },
      { name: 'fileInfo.size', datatype: 'number', description: 'Size of the file in bytes.' },
      { name: 'fileInfo.location', datatype: 'string', description: 'Directory containing the file.' },
      { name: 'fileInfo.lastModified', datatype: 'string', description: 'ISO timestamp of last modification.' },
    ],
  },
  
  "delete-file": {
    label: 'Delete File',
    description: 'Deletes a file or directory.',
    inputSchema: [
      { name: 'filename', datatype: 'string', description: 'Path and name of file to delete.', required: true },
      { name: 'recursive', datatype: 'boolean', description: 'Whether to delete directories recursively.', required: false },
    ],
    outputSchema: [
      { name: 'success', datatype: 'boolean', description: 'Whether the deletion was successful.' },
      { name: 'deletedPath', datatype: 'string', description: 'Path of the deleted file/directory.' },
    ],
  },
  
  "list-files": {
    label: 'List Files',
    description: 'Lists files in a directory.',
    inputSchema: [
      { name: 'directory', datatype: 'string', description: 'Directory path to list files from.', required: true },
      { name: 'filter', datatype: 'string', description: 'Filter pattern for file names.', required: false },
      { name: 'recursive', datatype: 'boolean', description: 'Include subdirectories.', required: false },
    ],
    outputSchema: [
      { name: 'files', datatype: 'array', description: 'Array of file information objects.' },
      { name: 'count', datatype: 'number', description: 'Number of files found.' },
      { name: 'directory', datatype: 'string', description: 'Base directory that was searched.' },
    ],
  },
  
  "file-poller": {
    label: 'File Poller',
    description: 'Monitors a directory for file changes.',
    inputSchema: [
      { name: 'directory', datatype: 'string', description: 'Directory path to monitor.', required: true },
      { name: 'filter', datatype: 'string', description: 'Filter pattern for file names.', required: false },
      { name: 'interval', datatype: 'number', description: 'Polling interval in seconds.', required: false },
    ],
    outputSchema: [
      { name: 'event', datatype: 'string', description: 'Type of file event (create, modify, delete).' },
      { name: 'file', datatype: 'object', description: 'Information about the file that changed.' },
      { name: 'timestamp', datatype: 'string', description: 'When the change was detected.' },
    ],
  },
  
  "http-receiver": {
    label: 'HTTP Receiver',
    description: 'Listens for incoming HTTP requests.',
    inputSchema: [
      { name: 'path', datatype: 'string', description: 'Endpoint path to listen on.', required: true },
      { name: 'method', datatype: 'string', description: 'HTTP method to accept.', required: false },
      { name: 'port', datatype: 'number', description: 'Port to listen on.', required: false },
    ],
    outputSchema: [
      { name: 'request', datatype: 'object', description: 'Incoming HTTP request object.' },
      { name: 'request.method', datatype: 'string', description: 'HTTP method of the request.' },
      { name: 'request.path', datatype: 'string', description: 'Request path.' },
      { name: 'request.headers', datatype: 'object', description: 'Request headers.' },
      { name: 'request.body', datatype: 'any', description: 'Request body content.' },
      { name: 'request.query', datatype: 'object', description: 'URL query parameters.' },
      { name: 'responseCallback', datatype: 'function', description: 'Function to send HTTP response.' },
    ],
  },
  
  "send-http-request": {
    label: 'Send HTTP Request',
    description: 'Makes an outgoing HTTP request.',
    inputSchema: [
      { name: 'url', datatype: 'string', description: 'URL to send request to.', required: true },
      { name: 'method', datatype: 'string', description: 'HTTP method (GET, POST, etc).', required: false },
      { name: 'headers', datatype: 'object', description: 'HTTP headers.', required: false },
      { name: 'body', datatype: 'any', description: 'Request body.', required: false },
    ],
    outputSchema: [
      { name: 'status', datatype: 'number', description: 'HTTP status code.' },
      { name: 'headers', datatype: 'object', description: 'Response headers.' },
      { name: 'body', datatype: 'any', description: 'Response body.' },
      { name: 'error', datatype: 'string', description: 'Error message if request failed.' },
    ],
  },
  
  "send-http-response": {
    label: 'Send HTTP Response',
    description: 'Sends an HTTP response to a previous request.',
    inputSchema: [
      { name: 'responseCallback', datatype: 'function', description: 'Response callback from HTTP receiver.', required: true },
      { name: 'status', datatype: 'number', description: 'HTTP status code.', required: false },
      { name: 'headers', datatype: 'object', description: 'HTTP headers.', required: false },
      { name: 'body', datatype: 'any', description: 'Response body.', required: false },
    ],
    outputSchema: [
      { name: 'sent', datatype: 'boolean', description: 'Whether response was sent successfully.' },
      { name: 'timestamp', datatype: 'string', description: 'When the response was sent.' },
    ],
  },
  
  "code": {
    label: 'Custom Code',
    description: 'Executes custom JavaScript/TypeScript code.',
    inputSchema: [
      { name: 'code', datatype: 'string', description: 'JavaScript/TypeScript code to execute.', required: true },
      { name: 'input', datatype: 'any', description: 'Input data for the code.', required: false },
      { name: 'timeout', datatype: 'number', description: 'Execution timeout in milliseconds.', required: false },
    ],
    outputSchema: [
      { name: 'result', datatype: 'any', description: 'Result returned by the code.' },
      { name: 'logs', datatype: 'array', description: 'Console logs from code execution.' },
      { name: 'executionTime', datatype: 'number', description: 'Time taken to execute in milliseconds.' },
    ],
  },
};

// Helper function to get a schema by node type
export const getNodeSchema = (nodeType: NodeType): NodeSchema | undefined => {
  if (!nodeType) return undefined;
  
  // Try case-insensitive match if direct match fails
  if (nodeSchemas[nodeType]) {
    return nodeSchemas[nodeType];
  }
  
  // Check for case-insensitive match
  const normalizedType = nodeType.toLowerCase();
  const matchingKey = Object.keys(nodeSchemas).find(
    key => key.toLowerCase() === normalizedType
  ) as NodeType | undefined;
  
  return matchingKey ? nodeSchemas[matchingKey] : undefined;
};