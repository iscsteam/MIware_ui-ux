// // workflow-context.tsx
"use client";
import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import type { NodeType, SchemaItem } from "@/services/interface";

import { useToast as useUIToast } from "@/components/ui/use-toast"; // Aliased to avoid conflict with context's toast
import { saveAndRunWorkflow as saveAndRunWorkflowUtil } from "@/services/workflow-utils"; // Import the utility
import { baseUrl } from "@/services/api"; // Assuming this handles base URLs etc.

// const baseUrl = process.env.NEXT_PUBLIC_USER_API_END_POINT;

export type NodeStatus =
  | "idle"
  | "running"
  | "success"
  | "error"
  | "configured";

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeSchema {
  label: string;
  description: string;
  inputSchema: SchemaItem[];
  outputSchema: SchemaItem[];
}

// --- NEW/UPDATED FILTER TYPES ---
export interface FilterCondition {
  // Represents a single leaf condition (e.g., field GT value)
  field: string;
  operation: string; // Changed from 'operator' to 'operation' to match your JSON example
  value: any;
}

// A condition item can be a simple condition OR a nested filter group
export type ConditionItem = FilterCondition | FilterGroup; // Recursive type definition!

export interface FilterGroup {
  // Represents a logical group of conditions (e.g., AND/OR)
  operator: "AND" | "OR" | string; // Allow "AND", "OR", or other string if needed
  conditions: ConditionItem[];
}
// --- END NEW/UPDATED FILTER TYPES ---

// Backend format for order_by: Array of [field: string, direction: "asc" | "desc"]
export type OrderByClauseBackend = [string, "asc" | "desc"];

// Backend format for aggregation functions: Array of [field: string, func: string]
export type AggregationFunctionBackend = [string, string];

// Backend format for aggregation config
export interface AggregationConfigBackend {
  group_by: string[];
  aggregations: AggregationFunctionBackend[];
}

export interface WorkflowNodeData {
  label?: string;
  displayName?: string;
  filename?: string;
  content?: string;
  textContent?: string;
  toFilename?: string;
  sourceFilename?: string;
  targetFilename?: string;
  overwrite?: boolean;
  isDirectory?: boolean;
  includeTimestamp?: boolean;
  encoding?: string;
  readAs?: string;
  excludeContent?: boolean;
  append?: boolean;
  writeAs?: string;
  addLineSeparator?: boolean;
  includeSubDirectories?: boolean;
  createNonExistingDirs?: boolean;
  mode?: string;
  language?: string;
  code?: string;
  recursive?: boolean;
  directory?: string;
  filter?: any;
  interval?: number;
  path?: string;
  method?: string;
  port?: number;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  options?: Record<string, any>;
  jsonObject?: object;
  xmlString?: string;
  inputSchema?: string;
  outputSchema?: string;
  oldFilename?: string;
  newFilename?: string;
  active?: boolean;
  provider?: string;
  format?: string;
  schema?: any;
  order_by?: any;
  aggregation?: any;
  source_path?: string;
  destination_path?: string;
  connectionString?: string;
  writeMode?: string;
  table?: string;
  user?: string;
  password?: string;
  batchSize?: string;
  query?: string;
  filePath?: string;
  csvOptions?: Record<string, any>;
  // Salesforce specific fields
  fields?: string[];
  where?: string;
  limit?: number;
  username?: string;
  object_name?: string;
  use_bulk_api?: boolean;
  file_path?: string;
  bulk_batch_size?: number;
  config_id?: number;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: NodePosition;
  data: WorkflowNodeData;
  status?: NodeStatus;
  output?: any;
  error?: string;
}

export interface NodeConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface LogEntry {
  id: string;
  nodeId: string;
  nodeName: string;
  timestamp: Date;
  status: NodeStatus | "info";
  message: string;
  details?: any;
}

export interface DAG {
  id: number;
  name: string;
  dag_id: string;
  schedule: string | null;
  active: boolean;
  dag_sequence: Array<{
    id: string;
    type: string;
    config_id: number;
    next: string[];
  }>;
  active_dag_run: number | null;
  created_at: string;
  updated_at: string;
}

interface WorkflowContextType {
  nodes: WorkflowNode[];
  connections: NodeConnection[];
  logs: LogEntry[];
  selectedNodeId: string | null;
  pendingConnection: { sourceId: string; sourceHandle?: string } | null;
  propertiesModalNodeId: string | null;
  dataMappingModalNodeId: string | null;
  draggingNodeInfo: { id: string; offset: { x: number; y: number } } | null;
  currentWorkflowName: string;
  currentWorkflowId: string | null;
  setPendingConnection: (
    connection: { sourceId: string; sourceHandle?: string } | null
  ) => void;
  setPropertiesModalNodeId: (nodeId: string | null) => void;
  setDataMappingModalNodeId: (nodeId: string | null) => void;
  setDraggingNodeInfo: (
    info: { id: string; offset: { x: number; y: number } } | null
  ) => void;
  addNode: (
    type: NodeType,
    position: NodePosition,
    initialData?: Partial<WorkflowNodeData>
  ) => string;
  updateNode: (
    id: string,
    updates: Partial<Omit<WorkflowNode, "data">> & {
      data?: Partial<WorkflowNodeData>;
    }
  ) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  addConnection: (
    sourceId: string,
    targetId: string,
    sourceHandle?: string,
    targetHandle?: string
  ) => void;
  removeConnection: (connectionId: string) => void;
  clearWorkflow: () => void;
  saveWorkflow: () => { nodes: WorkflowNode[]; connections: NodeConnection[] };
  saveWorkflowToBackend: () => Promise<void>;
  loadWorkflow: (data: {
    nodes: WorkflowNode[];
    connections: NodeConnection[];
  }) => void;
  loadWorkflowFromDAG: (dagData: DAG) => Promise<void>;
  runWorkflow: () => Promise<void>;
  executeNode: (nodeId: string, inputData?: any) => Promise<any>;
  addLog: (log: Omit<LogEntry, "id" | "timestamp">) => void;
  clearLogs: () => void;
  getNodeById: (id: string) => WorkflowNode | undefined;
  getCurrentWorkflowId: () => string | null;
  saveAndRunWorkflow: () => Promise<void>;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
);

export const getCurrentClientId = (): string | null => {
  try {
    const clientDataString = localStorage.getItem("currentClient");
    if (clientDataString) {
      const parsedClient = JSON.parse(clientDataString);
      if (parsedClient?.id && String(parsedClient.id).trim() !== "") {
        return String(parsedClient.id);
      }
    }
    const workflowDataString = localStorage.getItem("currentWorkflow");
    if (workflowDataString) {
      const parsedWorkflow = JSON.parse(workflowDataString);
      if (
        parsedWorkflow?.client_id &&
        String(parsedWorkflow.client_id).trim() !== ""
      ) {
        return String(parsedWorkflow.client_id);
      }
    }
    console.warn("getCurrentClientId: No valid client_id found.");
  } catch (error) {
    console.error("getCurrentClientId: Error accessing localStorage:", error);
  }
  return null;
};

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<NodeConnection[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentWorkflowName, setCurrentWorkflowName] = useState<string>("");
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(
    null
  );
  const [pendingConnection, setPendingConnection] = useState<{
    sourceId: string;
    sourceHandle?: string;
  } | null>(null);
  const [propertiesModalNodeId, setPropertiesModalNodeId] = useState<
    string | null
  >(null);
  const [dataMappingModalNodeId, setDataMappingModalNodeId] = useState<
    string | null
  >(null);
  const [draggingNodeInfo, setDraggingNodeInfo] = useState<{
    id: string;
    offset: { x: number; y: number };
  } | null>(null);
  const { toast } = useUIToast();

  const makePythonSafeId = (name: string): string => {
    let safeId = name.replace(/[^a-zA-Z0-9_]/g, "_");
    if (!/^[a-zA-Z_]/.test(safeId)) {
      safeId = "node_" + safeId;
    }
    return safeId;
  };

  // Convert DAG sequence to visual nodes and connections
  const convertDAGToWorkflow = useCallback((dagData: DAG) => {
    const newNodes: WorkflowNode[] = [];
    const newConnections: NodeConnection[] = [];
    const nodePositions = new Map<string, NodePosition>();

    // Calculate positions for nodes in a flow layout
    const calculateNodePositions = (dagSequence: any[]) => {
      const levels: string[][] = [];
      const visited = new Set<string>();
      const inDegree = new Map<string, number>();

      // Calculate in-degrees
      dagSequence.forEach((node) => {
        inDegree.set(node.id, 0);
      });

      dagSequence.forEach((node) => {
        node.next.forEach((nextId: string) => {
          inDegree.set(nextId, (inDegree.get(nextId) || 0) + 1);
        });
      });

      // Topological sort to determine levels
      const queue: string[] = [];
      dagSequence.forEach((node) => {
        if (inDegree.get(node.id) === 0) {
          queue.push(node.id);
        }
      });

      while (queue.length > 0) {
        const levelSize = queue.length;
        const currentLevel: string[] = [];

        for (let i = 0; i < levelSize; i++) {
          const nodeId = queue.shift()!;
          currentLevel.push(nodeId);
          visited.add(nodeId);

          const node = dagSequence.find((n) => n.id === nodeId);
          if (node) {
            node.next.forEach((nextId: string) => {
              const newInDegree = (inDegree.get(nextId) || 0) - 1;
              inDegree.set(nextId, newInDegree);
              if (newInDegree === 0 && !visited.has(nextId)) {
                queue.push(nextId);
              }
            });
          }
        }

        if (currentLevel.length > 0) {
          levels.push(currentLevel);
        }
      }

      // Position nodes based on levels
      levels.forEach((level, levelIndex) => {
        level.forEach((nodeId, nodeIndex) => {
          const x = levelIndex * 300 + 100;
          const y = nodeIndex * 150 + 100;
          nodePositions.set(nodeId, { x, y });
        });
      });
    };

    calculateNodePositions(dagData.dag_sequence);

    // Create nodes from DAG sequence
    dagData.dag_sequence.forEach((dagNode) => {
      const position = nodePositions.get(dagNode.id) || { x: 100, y: 100 };

      // Map DAG node types to workflow node types
      let nodeType: NodeType = "start";
      switch (dagNode.type) {
        case "start":
          nodeType = "start";
          break;
        case "end":
          nodeType = "end";
          break;
        case "file_conversion":
          nodeType = "file";
          break;
        case "cli_operator":
          nodeType = "copy-file"; // Default to copy-file, could be enhanced
          break;
        case "read-file":
          nodeType = "read-file";
          break;
        case "write-file":
          nodeType = "write-file";
          break;
        case "database":
          nodeType = "database";
          break;
        case "source":
          nodeType = "source";
          break;
        case "salesforce-cloud":
          nodeType = "salesforce-cloud";
          break;
        case "write-salesforce":
          nodeType = "write-salesforce";
          break;
        default:
          nodeType = "start";
      }

      const workflowNode: WorkflowNode = {
        id: dagNode.id,
        type: nodeType,
        position,
        data: {
          label: dagNode.type,
          displayName: dagNode.id,
          active: true,
        },
        status: "idle",
      };

      newNodes.push(workflowNode);

      // Create connections based on 'next' relationships
      dagNode.next.forEach((nextNodeId) => {
        const connection: NodeConnection = {
          id: uuidv4(),
          sourceId: dagNode.id,
          targetId: nextNodeId,
        };
        newConnections.push(connection);
      });
    });

    return { nodes: newNodes, connections: newConnections };
  }, []);

  // Load file conversion configs for a client
  const loadFileConversionConfigs = useCallback(
    async (clientId: string, dagId?: string) => {
      try {
        const { listFileConversionConfigs } = await import(
          "@/services/file-conversion-service"
        );
        const configs = await listFileConversionConfigs(Number(clientId));

        if (configs) {
          console.log("Loaded file conversion configs:", configs);

          // Filter configs by DAG ID if provided
          const filteredConfigs = dagId
            ? configs.filter((config) => config.dag_id === dagId)
            : configs;

          // You can enhance nodes with config data here if needed
          // For example, update nodes that have matching config_ids
          if (filteredConfigs.length > 0) {
            addLog({
              nodeId: "system",
              nodeName: "System",
              status: "info",
              message: `Loaded ${filteredConfigs.length} file conversion config(s).`,
            });
          }

          return filteredConfigs;
        }
      } catch (error) {
        console.warn("Could not load file conversion configs:", error);
        return [];
      }
    },
    []
  );

  // Load workflow from DAG data
  const loadWorkflowFromDAG = useCallback(
    async (dagData: DAG) => {
      try {
        console.log("Loading workflow from DAG:", dagData);

        // Set workflow metadata including schedule
        setCurrentWorkflowName(dagData.name);
        setCurrentWorkflowId(dagData.dag_id);

        // Convert DAG to visual workflow
        const { nodes: newNodes, connections: newConnections } =
          convertDAGToWorkflow(dagData);

        // Update state
        setNodes(newNodes);
        setConnections(newConnections);
        setSelectedNodeId(null);
        setPropertiesModalNodeId(null);
        setPendingConnection(null);
        setDraggingNodeInfo(null);

        // Save to localStorage with schedule information
        const workflowData = {
          nodes: newNodes,
          connections: newConnections,
          metadata: {
            name: dagData.name,
            dag_id: dagData.dag_id,
            schedule: dagData.schedule,
            created_at: dagData.created_at,
          },
        };
        localStorage.setItem("workflowData", JSON.stringify(workflowData));

        // Try to fetch and load file conversion configs if available
        try {
          const clientId = getCurrentClientId();
          if (clientId) {
            await loadFileConversionConfigs(clientId, dagData.dag_id);
          }
        } catch (configError) {
          console.warn("Could not load file conversion configs:", configError);
        }

        addLog({
          nodeId: "system",
          nodeName: "System",
          status: "info",
          message: `Workflow "${dagData.name}" loaded successfully.${
            dagData.schedule
              ? ` Schedule: ${dagData.schedule}`
              : " (Manual execution)"
          }`,
        });
      } catch (error) {
        console.error("Error loading workflow from DAG:", error);
        toast({
          title: "Error",
          description: "Failed to load workflow from DAG data.",
          variant: "destructive",
        });
      }
    },
    [convertDAGToWorkflow, toast, loadFileConversionConfigs]
  );

  const addNode = useCallback(
    (
      type: NodeType,
      position: NodePosition,
      initialData?: Partial<WorkflowNodeData>
    ) => {
      const displayName =
        initialData?.displayName ||
        `${type}_${Math.floor(Math.random() * 10000)}`;
      const nodeId = makePythonSafeId(displayName);
      const newNode: WorkflowNode = {
        id: nodeId,
        type,
        position,
        data: { label: type, displayName, active: true, ...initialData },
        status: "idle",
      };
      setNodes((prev) => [...prev, newNode]);
      return newNode.id;
    },
    []
  );

  const updateNode = useCallback(
    (
      id: string,
      updates: Partial<Omit<WorkflowNode, "data">> & {
        data?: Partial<WorkflowNodeData>;
      }
    ) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === id
            ? { ...node, ...updates, data: { ...node.data, ...updates.data } }
            : node
        )
      );
    },
    []
  );

  const removeNode = useCallback(
    (id: string) => {
      setNodes((prev) => prev.filter((node) => node.id !== id));
      setConnections((prev) =>
        prev.filter((conn) => conn.sourceId !== id && conn.targetId !== id)
      );
      if (selectedNodeId === id) setSelectedNodeId(null);
      if (propertiesModalNodeId === id) setPropertiesModalNodeId(null);
    },
    [selectedNodeId, propertiesModalNodeId]
  );

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  const addConnection = useCallback(
    (
      sourceId: string,
      targetId: string,
      sourceHandle?: string,
      targetHandle?: string
    ) => {
      if (sourceId === targetId) return;
      const exists = connections.some(
        (conn) =>
          conn.sourceId === sourceId &&
          conn.targetId === targetId &&
          conn.sourceHandle === sourceHandle &&
          conn.targetHandle === targetHandle
      );
      if (exists) return;
      const isCircular = connections.some(
        (conn) => conn.sourceId === targetId && conn.targetId === sourceId
      );
      if (isCircular) {
        console.warn("Preventing direct circular connection");
        return;
      }
      const newConnection: NodeConnection = {
        id: uuidv4(),
        sourceId,
        targetId,
        sourceHandle,
        targetHandle,
      };
      setConnections((prev) => [...prev, newConnection]);
    },
    [connections]
  );

  const removeConnection = useCallback((connectionId: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));
  }, []);

  const clearWorkflow = useCallback(() => {
    setNodes([]);
    setConnections([]);
    setSelectedNodeId(null);
    setPropertiesModalNodeId(null);
    setPendingConnection(null);
    setDraggingNodeInfo(null);
    setCurrentWorkflowName("");
    setCurrentWorkflowId(null);
    clearLogs();
  }, []);

  const getCurrentWorkflowId = useCallback(() => {
    if (currentWorkflowId) return currentWorkflowId;

    try {
      const workflowData = localStorage.getItem("currentWorkflow");
      if (workflowData) {
        const parsed = JSON.parse(workflowData);
        return parsed.dag_id;
      }
    } catch (error) {
      console.error("Error getting current workflow ID:", error);
    }
    return null;
  }, [currentWorkflowId]);

  const convertWorkflowToDAG = useCallback(() => {
    const nodeConnectionMap: Record<string, string[]> = {};
    nodes.forEach((node) => {
      nodeConnectionMap[node.id] = [];
    });
    connections.forEach((connection) => {
      if (nodeConnectionMap[connection.sourceId]) {
        nodeConnectionMap[connection.sourceId].push(connection.targetId);
      }
    });

    const sanitizeNodeIdForDag = (id: string) => {
      let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_");
      if (!/^[a-zA-Z_]/.test(safeId)) safeId = "task_" + safeId;
      return safeId;
    };

    const dagSequence = nodes.map((node) => ({
      id: sanitizeNodeIdForDag(node.id),
      type: node.type,
      config_id: 1,
      next: (nodeConnectionMap[node.id] || []).map(sanitizeNodeIdForDag),
    }));

    return { dag_sequence: dagSequence, active: true };
  }, [nodes, connections]);

  const saveWorkflowToBackend = useCallback(async () => {
    let workflowId = getCurrentWorkflowId();
    if (!workflowId) workflowId = "dag_sample_47220ca3";

    const localSaveCurrentWorkflowState = () => {
      const workflowData = { nodes, connections };
      try {
        localStorage.setItem("workflowData", JSON.stringify(workflowData));
        console.log("Current workflow state saved to localStorage.");
      } catch (error) {
        console.error(
          "Failed to save current workflow state to localStorage:",
          error
        );
      }
      return workflowData;
    };

    if (!workflowId) {
      toast({
        title: "Error",
        description: "No active workflow. Please create or select one first.",
        variant: "destructive",
      });
      return;
    }
    if (nodes.length === 0) {
      toast({
        title: "Error",
        description: "Cannot save an empty workflow. Please add nodes first.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      const dagData = convertWorkflowToDAG(); // This prepares a generic DAG structure
      // Note: This saveWorkflowToBackend only updates the DAG structure (sequence of tasks).
      // It does NOT create/update task configurations like saveAndRunWorkflow does.
      // This is suitable for saving the visual layout and connections.
      const response = await fetch(baseUrl(`/dags/${workflowId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dagData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to save workflow structure to backend"
        );
      }
      localSaveCurrentWorkflowState();
      toast({
        title: "Success",
        description: "Workflow structure saved successfully to backend.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving workflow structure to backend:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save workflow structure.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [nodes, connections, convertWorkflowToDAG, toast, getCurrentWorkflowId]);

  const saveWorkflow = useCallback(() => {
    const workflowData = { nodes, connections };
    try {
      localStorage.setItem("workflowData", JSON.stringify(workflowData));
      console.log("Workflow snapshot saved to localStorage.");
    } catch (error) {
      console.error("Failed to save workflow snapshot:", error);
    }
    return workflowData;
  }, [nodes, connections]);

  const loadWorkflow = useCallback(
    (data: { nodes: WorkflowNode[]; connections: NodeConnection[] }) => {
      if (
        data?.nodes &&
        Array.isArray(data.nodes) &&
        data.connections &&
        Array.isArray(data.connections)
      ) {
        setNodes(data.nodes);
        setConnections(data.connections);
        setSelectedNodeId(null);
        setPropertiesModalNodeId(null);
        setPendingConnection(null);
        setDraggingNodeInfo(null);
        console.log("Workflow loaded from data.");
      } else {
        console.error("Invalid data format for loading workflow.");
      }
    },
    []
  );

  const addLog = useCallback((log: Omit<LogEntry, "id" | "timestamp">) => {
    const newLog: LogEntry = { ...log, id: uuidv4(), timestamp: new Date() };
    setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const getNodeById = useCallback(
    (id: string) => nodes.find((node) => node.id === id),
    [nodes]
  );

  const executeNode = useCallback(
    async (nodeId: string, inputData?: any): Promise<any> => {
      const node = getNodeById(nodeId);
      if (!node) {
        console.warn(`Node ${nodeId} not found.`);
        return null;
      }
      if (node.data?.active === false) {
        addLog({
          nodeId,
          nodeName: `${node.data?.label || node.type} (inactive)`,
          status: "info",
          message: "Skipping inactive node.",
        });
        const outgoing = connections.filter((c) => c.sourceId === nodeId);
        let lastOutput = inputData;
        for (const conn of outgoing) {
          lastOutput = await executeNode(conn.targetId, inputData);
        }
        return lastOutput;
      }
      updateNode(nodeId, { status: "running" });
      addLog({
        nodeId,
        nodeName: node.data?.label || node.type,
        status: "running",
        message: "Executing...",
        details: { input: inputData },
      });
      try {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 100 + 50)
        );
        let output: any;
        const nodeData = node.data || {};
        switch (node.type) {
          case "start":
            output = { trigger: "manual", ...(inputData || {}) };
            break;
          case "read-file":
            output = { content: `Content of ${nodeData.path}` };
            break;
          case "write-file":
            output = { filePath: nodeData.path, written: true };
            break;
          case "source":
            output = {
              data: [{ id: 1, name: "Sample DB Data" }],
              source: nodeData.table || nodeData.query,
            };
            break;
          case "database":
            output = { success: true, table: nodeData.table };
            break;
          case "salesforce-cloud":
            // For Salesforce, we just confirm the configuration is ready
            output = {
              config_ready: true,
              object_name: nodeData.object_name,
              file_path: nodeData.file_path,
              query: nodeData.query,
              use_bulk_api: nodeData.use_bulk_api || false,
              message: "Salesforce configuration ready for execution",
              success: true,
            };
            break;
          case "end":
            output = { finalStatus: "completed", result: inputData };
            break;
          default:
            output = { ...inputData, [`${node.type}_processed`]: true };
        }
        updateNode(nodeId, { status: "success", output, error: undefined });
        addLog({
          nodeId,
          nodeName: node.data?.label || node.type,
          status: "success",
          message: "Executed.",
          details: { output },
        });
        const outgoing = connections.filter((c) => c.sourceId === nodeId);
        let lastOutput = output;
        for (const conn of outgoing) {
          lastOutput = await executeNode(conn.targetId, output);
        }
        return lastOutput;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        updateNode(nodeId, { status: "error", error: msg, output: undefined });
        addLog({
          nodeId,
          nodeName: node.data?.label || node.type,
          status: "error",
          message: `Error: ${msg}`,
          details: { error },
        });
        throw error;
      }
    },
    [nodes, connections, getNodeById, updateNode, addLog]
  );

  const runWorkflow = useCallback(async () => {
    if (isRunning) {
      console.warn("Workflow already running.");
      return;
    }
    setIsRunning(true);
    addLog({
      nodeId: "system",
      nodeName: "System",
      status: "info",
      message: "Workflow started (client simulation).",
    });
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        status: "idle",
        output: undefined,
        error: undefined,
      }))
    );

    const activeStartNodes = nodes.filter(
      (n) => n.type === "start" && n.data?.active !== false
    );
    if (activeStartNodes.length === 0) {
      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "error",
        message: "No active start nodes.",
      });
      setIsRunning(false);
      return;
    }
    try {
      await Promise.all(
        activeStartNodes.map((startNode) => executeNode(startNode.id))
      );
      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "info",
        message: "Workflow finished (client simulation).",
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "error",
        message: `Workflow failed (client simulation): ${msg}`,
      });
    } finally {
      setIsRunning(false);
    }
  }, [nodes, executeNode, isRunning, addLog]);

  // Listen for workflow selection events from sidebar
  useEffect(() => {
    const handleWorkflowSelected = async (event: CustomEvent) => {
      const dagData = event.detail;
      if (dagData) {
        await loadWorkflowFromDAG(dagData);
      }
    };

    // window.addEventListener("workflowSelected", handleWorkflowSelected as EventListener)

    return () => {
      // window.removeEventListener("workflowSelected", handleWorkflowSelected as EventListener)
    };
  }, [loadWorkflowFromDAG]);

  // Load workflow from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("workflowData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (
          parsedData?.nodes &&
          Array.isArray(parsedData.nodes) &&
          parsedData.connections &&
          Array.isArray(parsedData.connections)
        ) {
          loadWorkflow(parsedData);

          // Load metadata if available
          if (parsedData.metadata) {
            setCurrentWorkflowName(parsedData.metadata.name || "");
            setCurrentWorkflowId(parsedData.metadata.dag_id || null);
          }
        } else {
          console.warn("Invalid workflow data in localStorage.");
        }
      }

      // Also check for current workflow info
      const currentWorkflow = localStorage.getItem("currentWorkflow");
      if (currentWorkflow) {
        const workflowInfo = JSON.parse(currentWorkflow);
        setCurrentWorkflowName(workflowInfo.name || "");
        setCurrentWorkflowId(workflowInfo.dag_id || null);
      }
    } catch (error) {
      console.error("Failed to load workflow from localStorage:", error);
      localStorage.removeItem("workflowData");
    }
  }, [loadWorkflow]);

  const saveAndRunWorkflow = useCallback(async () => {
    const currentWorkflowIdValue = getCurrentWorkflowId();
    if (!currentWorkflowIdValue) {
      toast({
        title: "Error",
        description:
          "No workflow ID found. Please create or select a workflow first.",
        variant: "destructive",
      });
      return;
    }
    if (nodes.length === 0) {
      toast({
        title: "Error",
        description: "Cannot save an empty workflow. Please add nodes first.",
        variant: "destructive",
      });
      return;
    }
    await saveAndRunWorkflowUtil(nodes, connections, currentWorkflowIdValue);
  }, [nodes, connections, getCurrentWorkflowId, toast]);

  const value: WorkflowContextType = {
    nodes,
    connections,
    logs,
    selectedNodeId,
    pendingConnection,
    propertiesModalNodeId,
    dataMappingModalNodeId,
    draggingNodeInfo,
    currentWorkflowName,
    currentWorkflowId,
    setPendingConnection,
    setPropertiesModalNodeId,
    setDataMappingModalNodeId,
    setDraggingNodeInfo,
    addNode,
    updateNode,
    removeNode,
    selectNode,
    addConnection,
    removeConnection,
    clearWorkflow,
    saveWorkflow,
    saveWorkflowToBackend,
    loadWorkflow,
    loadWorkflowFromDAG,
    runWorkflow,
    executeNode,
    addLog,
    clearLogs,
    getNodeById,
    getCurrentWorkflowId,
    saveAndRunWorkflow,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
}
