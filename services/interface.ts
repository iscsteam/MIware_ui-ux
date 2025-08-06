//interface.ts

import type React from "react"
//interface.ts - Updated with ReadNode

// Define the possible node types
export type NodeType =
  | "start"
  | "end"
  | "file"
  | "create-file"
  | "read-file"
  | "write-file"
  | "copy-file"
  |"write-node"
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
  | "source"
  | "salesforce-cloud"
  | "write-salesforce"
  | "move-file"
   | "inline-input"
  | "inline-output"
  | "code"
  | "read-node" // Added ReadNode type
  | "scheduler" // Added Scheduler type

// Rest of the interface remains the same...
// (Include all the existing interfaces from your original file)

export interface NodeSchema {
  label: string
  description: string
  inputSchema: SchemaItem[]
  outputSchema: SchemaItem[]
}

export interface WorkflowNodeData {
  id: string
  type: NodeType
  position: { x: number; y: number }
}

export interface DAG {
  id?: number
  dag_id?: string
  name: string
  created_at?: string
  updated_at?: string
  schedule?: string | null
  active: boolean
  dag_sequence: object[]
  active_dag_run?: number | null
  client_id?: number
  type?: string
}

export type MappingSourceInfo = {
  name: string
  nodeId: string
  nodeLabel?: string
  nodeType?: string
}

export type ExtendedSchemaItem = SchemaItem & {
  sourceNodeId?: string
  sourceNodeType?: string
  sourceNodeLabel?: string
  datatype: "string" | "integer" | "boolean" | "complex" | string
  mappings?: MappingSourceInfo[]
}

export interface SchemaModalProps {
  nodeType: NodeType | null
  nodeId: string
  nodeLabel?: string
  baseInputSchema: (SchemaItem | ExtendedSchemaItem)[]
  baseOutputSchema: SchemaItem[]
  availableInputsFromPrevious: ExtendedSchemaItem[]
  onClose: () => void
  onSaveMappings?: (updatedInputs: ExtendedSchemaItem[]) => void
}

export interface GroupedSource {
  nodeId: string
  nodeLabel: string
  nodeType: string
  outputs: ExtendedSchemaItem[]
}

export interface Connection {
  sourceItemId: string
  targetItemId: string
}

export interface Client {
  id?: number
  name: string
  dag_id?: string
  trigger_id?: string
}

export interface ClientCreateResponse {
  id: number
  name: string
  api_key: string
  created_at: string
  updated_at: string
  file_conversion_configs: any[]
  read_salesforce_configs: any[]
  write_salesforce_configs: any[]
}

export interface ClientWithStatus {
  id: number
  name: string
  dag_id: string
  trigger_id: string
  dag_status: string
}

export interface SchemaItem {
  name: string
  type?: string
  datatype: "string" | "integer" | "boolean" | "complex" | string
  description?: string
  required?: boolean
  originalName?: string
  sourceNodeId?: string
   properties?: SchemaItem[] // Add this line to support nested properties for complex types
}

export interface SchemaModalData {
  nodeId: string
  nodeType: NodeType
  baseInputSchema: SchemaItem[]
  baseOutputSchema: SchemaItem[]
  availableInputsFromPrevious: SchemaItem[]
  nodeLabel?: string
}

export interface WorkflowNodeData {
  label?: string
  displayName?: string
  filename?: string
  content?: string
  textContent?: string
  toFilename?: string
  sourceFilename?: string
  targetFilename?: string
  overwrite?: boolean
  isDirectory?: boolean
  includeTimestamp?: boolean
  encoding?: string
  readAs?: string
  excludeContent?: boolean
  append?: boolean
  writeAs?: string
  addLineSeparator?: boolean
  includeSubDirectories?: boolean
  createNonExistingDirs?: boolean
  mode?: string
  language?: string
  code?: string
  recursive?: boolean
  directory?: string
  filter?: string
  interval?: number
  path?: string
  method?: string
  port?: number
  url?: string
  headers?: Record<string, string>
  body?: any
  timeout?: number
  options?: Record<string, any>
  jsonObject?: object
  xmlString?: string
  inputSchema?: string
  outputSchema?: string
  active?: boolean

  // ReadNode specific properties
  input_path?: string
  limit?: number
  pretty?: boolean
}

export interface NodePosition {
  x: number
  y: number
}

export type NodeStatus = "idle" | "running" | "success" | "error"

export interface WorkflowNode {
  id: string
  type: NodeType
  position: NodePosition
  data: WorkflowNodeData
  status?: NodeStatus
  output?: any
  error?: string
}

interface NodeComponentProps {
  key: string
  node: WorkflowNode
  selected: boolean
  isConnecting: boolean
  onSelect: () => void
  onDragStart: (nodeId: string, e: React.MouseEvent) => void
  onExecuteNode: (nodeId: string) => void
  onOpenProperties: (nodeId: string) => void
  onOpenSchemaModal: (nodeId: string) => void
}

export interface FileConversionConfig {
  input: {
    provider: string
    format: string
    path: string
    options?: Record<string, any>
  }
  output: {
    provider: string
    format: string
    path: string
    mode: string
    options?: Record<string, any>
  }
  spark_config?: {
    executor_instances: number
    executor_cores: number
    executor_memory: string
    driver_memory: string
    driver_cores: number
  }
  dag_id?: string
}

export interface DagRun {
  id: number
  dag_id: string
  status: "running" | "completed" | "failed" | "success" | string
  start_time: string
  end_time: string | null
  trigger_type: "manual" | "scheduled" | string
  error_message: string | null
  dag_run_map: Record<string, DagRunMapEntry>
  created_at?: string
  updated_at?: string
}

export interface DagRunMapEntry {
  status: string
  events: any[]
  stage_details: any
}

export interface DAGStatusResponse {
  dag_id: string
  trigger_id: string
  status: string
  started_at?: string
  ended_at?: string
  logs?: string
  canShowOutput?: boolean
  data?: any | null
  isRunning?: boolean
}

export interface UploadedFileItem {
  name: string
  type: "file" | "directory"
  path: string
  original_filename?: string
  size_bytes?: number
  last_modified?: string
}
