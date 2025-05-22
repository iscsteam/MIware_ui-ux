//interface.ts

// Define the possible node types

export type NodeType =
  | "start"
  | "end"
  | "file"
  | "create-file"
  | "read-file"
  | "write-file"
  | "copy-file"
  | "rename-file"
  | "delete-file"
  | "list-files"
  | "file-poller"
  | "rename-file"
  | "http-receiver"
  | "send-http-request"
  | "send-http-response"
  | "xml-parser"
  | "xml-render"
  | "transform-xml"
  | "parse-data"
  | "render-data"
  | "json-parse"
  | "json-render"
  | "transform-json"
  | "file"
  | "filter"
    | "database"
  | "move-file"
  | "code";

// Interface for a single item within an input or output schema
// export interface SchemaItem {
//   name: string;
//   datatype: 'string' | 'integer' | 'boolean' | 'complex' | string; // Allow string for extensibility
//   description: string;
//   required?: boolean; // Optional flag
// }

// Interface for the complete schema definition of a node
export interface NodeSchema {
  label: string;
  description: string;
  inputSchema: SchemaItem[];
  outputSchema: SchemaItem[];
}

// Interface for the data representing a node instance on the canvas
export interface WorkflowNodeData {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  // You might add other node-specific instance data here later
  // e.g., configuredInputValues: Record<string, any>;
}

export interface DAG {
  id?: number;
  dag_id?: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  schedule?: string | null;
  active: boolean;
  dag_sequence: object[];
  active_dag_run?: number | null;
  client_id?: number;
}

export type MappingSourceInfo = {
  name: string; // Name of the source property
  nodeId: string; // ID of the source node
  nodeLabel?: string; // Label of the source node
  nodeType?: string; // Type of the source node
};

export type ExtendedSchemaItem = SchemaItem & {
  // For items in availableInputsFromPrevious (source items)
  sourceNodeId?: string;
  sourceNodeType?: string;
  sourceNodeLabel?: string;

  datatype: "string" | "integer" | "boolean" | "complex" | string; // Allow string for extensibility

  // For items in localInputSchema (target items / current node's inputs)
  mappings?: MappingSourceInfo[]; // Array of sources mapped to this input
};

export interface SchemaModalProps {
  nodeType: NodeType | null;
  nodeId: string;
  nodeLabel?: string;
  // baseInputSchema can now be ExtendedSchemaItem[] if loading saved state with multiple mappings
  baseInputSchema: (SchemaItem | ExtendedSchemaItem)[];
  baseOutputSchema: SchemaItem[];
  availableInputsFromPrevious: ExtendedSchemaItem[]; // These are the potential sources
  onClose: () => void;
  onSaveMappings?: (updatedInputs: ExtendedSchemaItem[]) => void;
}

export interface GroupedSource {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  outputs: ExtendedSchemaItem[]; // These are source items
}

export interface Connection {
  sourceItemId: string; // Ref ID: source-<nodeId>-<propName>
  targetItemId: string; // Ref ID: target-<nodeId>-<propName>
}

export interface Client {
  id?: number;
  name: string;
  dag_id?: string;
  trigger_id?: string;
}
export interface ClientCreateResponse {
  id: number;
  name: string;
  api_key: string;
  created_at: string;
  updated_at: string;
  file_conversion_configs: any[];
  read_salesforce_configs: any[];
  write_salesforce_configs: any[];
}

export interface ClientWithStatus {
  id: number;
  name: string;
  dag_id: string;
  trigger_id: string;
  dag_status: string;
}

export interface SchemaItem {
  name: string;
  type?: string;
  datatype: "string" | "integer" | "boolean" | "complex" | string; // Allow string for extensibility
  description?: string;
  required?: boolean;
  originalName?: string;
  sourceNodeId?: string;
}

export interface SchemaModalData {
  nodeId: string;
  nodeType: NodeType;
  baseInputSchema: SchemaItem[];
  baseOutputSchema: SchemaItem[];
  availableInputsFromPrevious: SchemaItem[]; // Outputs from connected source nodes
  nodeLabel?: string; // Optional: Pass the specific node's label
}

export interface WorkflowNodeData {
  label?: string; // Optional: A user-defined label for this specific node instance
  displayName?: string;
  // Configuration properties used by specific node types (make them optional)
  filename?: string;
  content?: string;
  textContent?: string;
  toFilename?: string; // Often used for write/copy destination
  sourceFilename?: string; // Explicitly for copy source
  targetFilename?: string; // <<<<<<<<<<<< ADD THIS LINE (Explicitly for copy target)
  overwrite?: boolean;
  isDirectory?: boolean;
  includeTimestamp?: boolean;
  encoding?: string;
  readAs?: string;
  excludeContent?: boolean;
  append?: boolean;
  writeAs?: string;
  addLineSeparator?: boolean;
  // fromFilename?: string; // Duplicate of sourceFilename? Standardize if possible.
  includeSubDirectories?: boolean;
  createNonExistingDirs?: boolean;
  mode?: string; // For code node
  language?: string; // For code node
  code?: string; // For code node
  recursive?: boolean; // For delete/list node
  directory?: string; // For list/poller node
  filter?: string; // For list/poller node
  interval?: number; // For poller node
  path?: string; // For http-receiver node
  method?: string; // For http-receiver/sender node
  port?: number; // For http-receiver node
  url?: string; // For http-sender node
  headers?: Record<string, string>; // For http nodes
  body?: any; // For http nodes
  timeout?: number; // For http-sender/code node
  options?: Record<string, any>; // For XML parser/render options
  jsonObject?: object; // For xml-render node
  xmlString?: string; // For xml-parser node
  // Add other config properties from NodePropertiesPanel as needed...
  inputSchema?: string;
  outputSchema?: string;

  // Runtime/UI state flags
  active?: boolean; // The flag to control if the node runs
}

export interface NodePosition {
  x: number;
  y: number;
}

export type NodeStatus = "idle" | "running" | "success" | "error";

export interface WorkflowNode {
  id: string; // Unique ID for this node instance
  type: NodeType; // The type of node (determines behavior and schema)
  position: NodePosition; // Position on the canvas
  data: WorkflowNodeData; // Node-specific configuration and runtime data
  status?: NodeStatus; // Current execution status
  output?: any; // Result of successful execution
  error?: string; // Error message on failure
}

interface NodeComponentProps {
  key: string;
  node: WorkflowNode;
  selected: boolean;
  isConnecting: boolean;
  onSelect: () => void;
  onDragStart: (nodeId: string, e: React.MouseEvent) => void;
  onExecuteNode: (nodeId: string) => void;
  onOpenProperties: (nodeId: string) => void;
  onOpenSchemaModal: (nodeId: string) => void;
}

export interface FileConversionConfig {
  input: {
    provider: string;
    format: string;
    path: string;
    options?: Record<string, any>;
  };
  output: {
    provider: string;
    format: string;
    path: string;
    mode: string; // Make sure 'mode' is part of your WorkflowNodeData if used from there
    options?: Record<string, any>;
  };
  spark_config?: {
    executor_instances: number;
    executor_cores: number;
    executor_memory: string;
    driver_memory: string;
    driver_cores: number;
  };
  dag_id?: string; // This is good to have for association
}

// DagRun type (from previous example, adjust if necessary)
export interface DagRun {
  id: number; // This is the trigger_id or dag_run_id
  dag_id: string;
  status: "running" | "completed" | "failed" | "success" | string;
  start_time: string;
  end_time: string | null;
  trigger_type: "manual" | "scheduled" | string;
  error_message: string | null;
  dag_run_map: Record<string, DagRunMapEntry>; // Assuming DagRunMapEntry is defined
  created_at?: string;
  updated_at?: string;
}

export interface DagRunMapEntry {
  status: string;
  events: any[]; // Define more specifically if possible
  stage_details: any; // Define more specifically if possible
}

export interface DAGStatusResponse {
  dag_id: string;
  trigger_id: string;
  status: string; // e.g., "success", "running", "failed"
  started_at?: string;
  ended_at?: string;
  logs?: string;
}
