// src/types/workflow.ts

// Define the possible node types
export type NodeType = 'READ' | 'WRITE' | 'COPY' | 'CREATE' | 'start' | 'END';

// Interface for a single item within an input or output schema
export interface SchemaItem {
  name: string;
  datatype: 'string' | 'integer' | 'boolean' | 'complex' | string; // Allow string for extensibility
  description: string;
  required?: boolean; // Optional flag
}

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