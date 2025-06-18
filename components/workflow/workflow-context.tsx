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

import { useToast as useUIToast } from "@/components/ui/use-toast";
import { saveAndRunWorkflow as saveAndRunWorkflowUtil } from "@/services/workflow-utils";
import { baseUrl } from "@/services/api";

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

export interface FilterCondition {
  field: string;
  operation: string;
  value: any;
}

export type ConditionItem = FilterCondition | FilterGroup;

export interface FilterGroup {
  operator: "AND" | "OR" | string;
  conditions: ConditionItem[];
}

export type OrderByClauseBackend = [string, "asc" | "desc"];
export type AggregationFunctionBackend = [string, string];

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
  fields?: string[];
  where?: string;
  limit?: number;
  username?: string;
  object_name?: string;
  use_bulk_api?: boolean;
  file_path?: string;
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
    config?: any;
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
  setCurrentWorkflowMeta: (id: string, name: string) => void; // Added as per fix
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

  // Existing states, ensure types match if fix description used "" vs null
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

  // Added as per fix description point 2
  function setCurrentWorkflowMeta(id: string, name: string) {
    setCurrentWorkflowId(id);
    setCurrentWorkflowName(name);
    // This stores {id, name}, where 'id' is the dag_id
    localStorage.setItem("currentWorkflow", JSON.stringify({ id, name }));
  }

  const makePythonSafeId = (name: string): string => {
    let safeId = name.replace(/[^a-zA-Z0-9_]/g, "_");
    if (!/^[a-zA-Z_]/.test(safeId)) {
      safeId = "node_" + safeId;
    }
    return safeId;
  };

  const parseFileConversionConfig = useCallback(
    (dagNode: any, basePosition: NodePosition) => {
      console.log(
        "Parsing file_conversion config for node:",
        dagNode.id,
        dagNode.config
      );
      const config = dagNode.config;
      if (!config) {
        console.warn("No config found for file_conversion node:", dagNode.id);
        return {
          nodes: [],
          connections: [],
          firstNodeId: null,
          lastNodeId: null,
        };
      }
      const nodes: WorkflowNode[] = [];
      const connectionsArr: NodeConnection[] = []; // Renamed to avoid conflict
      let currentX = basePosition.x;
      const y = basePosition.y;
      if (config.input) {
        const readNodeId = `read_file_${dagNode.config_id}`;
        const readNode: WorkflowNode = {
          id: readNodeId,
          type: "read-file",
          position: { x: currentX, y },
          data: {
            label: "read-file",
            displayName: "Read File",
            path: config.input.path,
            provider: config.input.provider,
            format: config.input.format,
            options: config.input.options || {},
            schema: config.input.schema,
            active: true,
          },
          status: "configured",
        };
        nodes.push(readNode);
        currentX += 200;
      }
      if (config.filter || config.order_by || config.aggregation) {
        const filterNodeId = `filter_${dagNode.config_id}`;
        const filterNode: WorkflowNode = {
          id: filterNodeId,
          type: "filter",
          position: { x: currentX, y },
          data: {
            label: "filter",
            displayName: "Filter",
            filter: config.filter,
            order_by: config.order_by,
            aggregation: config.aggregation,
            active: true,
          },
          status: "configured",
        };
        nodes.push(filterNode);
        currentX += 200;
      }
      if (config.output) {
        const writeNodeId = `write_file_${dagNode.config_id}`;
        const writeNode: WorkflowNode = {
          id: writeNodeId,
          type: "write-file",
          position: { x: currentX, y },
          data: {
            label: "write-file",
            displayName: "Write File",
            path: config.output.path,
            provider: config.output.provider,
            format: config.output.format,
            mode: config.output.mode,
            options: config.output.options || {},
            active: true,
          },
          status: "configured",
        };
        nodes.push(writeNode);
      }
      if (nodes.length > 1) {
        for (let i = 0; i < nodes.length - 1; i++) {
          const connectionId = uuidv4();
          connectionsArr.push({
            id: connectionId,
            sourceId: nodes[i].id,
            targetId: nodes[i + 1].id,
          });
        }
      }
      return {
        nodes,
        connections: connectionsArr,
        firstNodeId: nodes[0]?.id,
        lastNodeId: nodes[nodes.length - 1]?.id,
      };
    },
    []
  );

  const parseCliOperatorConfig = useCallback(
    (dagNode: any, basePosition: NodePosition) => {
      const config = dagNode.config;
      if (!config || !config.operation)
        return {
          nodes: [],
          connections: [],
          firstNodeId: null,
          lastNodeId: null,
        };
      let nodeType: NodeType;
      let displayName: string;
      switch (config.operation) {
        case "copy":
          nodeType = "copy-file";
          displayName = "Copy File";
          break;
        case "move":
          nodeType = "move-file";
          displayName = "Move File";
          break;
        case "rename":
          nodeType = "rename-file";
          displayName = "Rename File";
          break;
        case "delete":
          nodeType = "delete-file";
          displayName = "Delete File";
          break;
        default:
          nodeType = "copy-file";
          displayName = "File Operation";
      }
      const operationNodeId = `${config.operation}_${dagNode.config_id}`;
      const operationNode: WorkflowNode = {
        id: operationNodeId,
        type: nodeType,
        position: basePosition,
        data: {
          label: nodeType,
          displayName,
          source_path: config.source_path,
          destination_path: config.destination_path,
          options: config.options || {},
          overwrite: config.options?.overwrite || false,
          includeSubDirectories: config.options?.includeSubDirectories || false,
          createNonExistingDirs: config.options?.createNonExistingDirs || false,
          recursive: config.options?.recursive || false,
          active: true,
        },
        status: "configured",
      };
      return {
        nodes: [operationNode],
        connections: [],
        firstNodeId: operationNodeId,
        lastNodeId: operationNodeId,
      };
    },
    []
  );

  const convertDAGToWorkflow = useCallback(
    (dagData: DAG) => {
      const newNodes: WorkflowNode[] = [];
      const newConnections: NodeConnection[] = [];
      const nodePositions = new Map<string, NodePosition>();
      const calculateNodePositions = (dagSequence: any[]) => {
        const levels: string[][] = [];
        const visited = new Set<string>();
        const inDegree = new Map<string, number>();
        dagSequence.forEach((node) => {
          inDegree.set(node.id, 0);
        });
        dagSequence.forEach((node) => {
          node.next.forEach((nextId: string) => {
            inDegree.set(nextId, (inDegree.get(nextId) || 0) + 1);
          });
        });
        const queue: string[] = [];
        dagSequence.forEach((node) => {
          if (inDegree.get(node.id) === 0) queue.push(node.id);
        });
        while (queue.length > 0) {
          const levelSize = queue.length;
          const currentLevel: string[] = [];
          for (let i = 0; i < levelSize; i++) {
            const nodeId = queue.shift()!;
            currentLevel.push(nodeId);
            visited.add(nodeId);
            const node = dagSequence.find((n) => n.id === nodeId);
            if (node)
              node.next.forEach((nextId: string) => {
                const newInDegree = (inDegree.get(nextId) || 0) - 1;
                inDegree.set(nextId, newInDegree);
                if (newInDegree === 0 && !visited.has(nextId))
                  queue.push(nextId);
              });
          }
          if (currentLevel.length > 0) levels.push(currentLevel);
        }
        levels.forEach((level, levelIndex) => {
          level.forEach((nodeId, nodeIndex) => {
            const x = levelIndex * 300 + 100;
            const y = nodeIndex * 150 + 100;
            nodePositions.set(nodeId, { x, y });
          });
        });
      };
      calculateNodePositions(dagData.dag_sequence);
      const dagNodeMapping = new Map<
        string,
        { firstNodeId: string; lastNodeId: string }
      >();
      dagData.dag_sequence.forEach((dagNode) => {
        const position = nodePositions.get(dagNode.id) || { x: 100, y: 100 };
        if (dagNode.type === "start" || dagNode.type === "end") {
          const workflowNode: WorkflowNode = {
            id: dagNode.id,
            type: dagNode.type as NodeType,
            position,
            data: {
              label: dagNode.type,
              displayName: dagNode.id,
              active: true,
            },
            status: "idle",
          };
          newNodes.push(workflowNode);
          dagNodeMapping.set(dagNode.id, {
            firstNodeId: dagNode.id,
            lastNodeId: dagNode.id,
          });
        } else if (dagNode.type === "file_conversion" && dagNode.config) {
          const parsed = parseFileConversionConfig(dagNode, position);
          if (parsed.nodes.length > 0) {
            newNodes.push(...parsed.nodes);
            newConnections.push(...parsed.connections);
            if (parsed.firstNodeId && parsed.lastNodeId)
              dagNodeMapping.set(dagNode.id, {
                firstNodeId: parsed.firstNodeId,
                lastNodeId: parsed.lastNodeId,
              });
          } else {
            const fallbackNode: WorkflowNode = {
              id: dagNode.id,
              type: "start",
              position,
              data: {
                label: "file_conversion",
                displayName: dagNode.id,
                active: true,
              },
              status: "idle",
            };
            newNodes.push(fallbackNode);
            dagNodeMapping.set(dagNode.id, {
              firstNodeId: dagNode.id,
              lastNodeId: dagNode.id,
            });
          }
        } else if (dagNode.type === "cli_operator" && dagNode.config) {
          const parsed = parseCliOperatorConfig(dagNode, position);
          if (parsed.nodes.length > 0) {
            newNodes.push(...parsed.nodes);
            newConnections.push(...parsed.connections);
            if (parsed.firstNodeId && parsed.lastNodeId)
              dagNodeMapping.set(dagNode.id, {
                firstNodeId: parsed.firstNodeId,
                lastNodeId: parsed.lastNodeId,
              });
          } else {
            const fallbackNode: WorkflowNode = {
              id: dagNode.id,
              type: "start",
              position,
              data: {
                label: "cli_operator",
                displayName: dagNode.id,
                active: true,
              },
              status: "idle",
            };
            newNodes.push(fallbackNode);
            dagNodeMapping.set(dagNode.id, {
              firstNodeId: dagNode.id,
              lastNodeId: dagNode.id,
            });
          }
        } else if (dagNode.type === "read_salesforce" && dagNode.config) {
          const salesforceNode: WorkflowNode = {
            id: dagNode.id,
            type: "salesforce-cloud",
            position,
            data: {
              label: "salesforce-cloud",
              displayName: "Salesforce Cloud",
              object_name: dagNode.config.object_name,
              query: dagNode.config.query,
              fields: dagNode.config.fields || [],
              where: dagNode.config.where || "",
              limit: dagNode.config.limit,
              use_bulk_api: dagNode.config.use_bulk_api || false,
              file_path: dagNode.config.file_path,
              active: true,
            },
            status: "configured",
          };
          newNodes.push(salesforceNode);
          dagNodeMapping.set(dagNode.id, {
            firstNodeId: dagNode.id,
            lastNodeId: dagNode.id,
          });
        } else {
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
              nodeType = "copy-file";
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
          dagNodeMapping.set(dagNode.id, {
            firstNodeId: dagNode.id,
            lastNodeId: dagNode.id,
          });
        }
      });
      dagData.dag_sequence.forEach((dagNode) => {
        const sourceMapping = dagNodeMapping.get(dagNode.id);
        if (!sourceMapping) return;
        dagNode.next.forEach((nextNodeId) => {
          const targetMapping = dagNodeMapping.get(nextNodeId);
          if (!targetMapping) return;
          const connection: NodeConnection = {
            id: uuidv4(),
            sourceId: sourceMapping.lastNodeId,
            targetId: targetMapping.firstNodeId,
          };
          newConnections.push(connection);
        });
      });
      return { nodes: newNodes, connections: newConnections };
    },
    [parseFileConversionConfig, parseCliOperatorConfig]
  );

  const loadFileConversionConfigs = useCallback(
    async (clientId: string, dagId?: string) => {
      try {
        const { listFileConversionConfigs } = await import(
          "@/services/file-conversion-service"
        );
        const configs = await listFileConversionConfigs(Number(clientId));
        if (configs) {
          const filteredConfigs = dagId
            ? configs.filter((config) => config.dag_id === dagId)
            : configs;
          if (filteredConfigs.length > 0)
            addLog({
              nodeId: "system",
              nodeName: "System",
              status: "info",
              message: `Loaded ${filteredConfigs.length} file conversion config(s).`,
            });
          return filteredConfigs;
        }
      } catch (error) {
        console.warn("Could not load file conversion configs:", error);
        return [];
      }
    },
    []
  ); // addLog was missing from dependencies, but it's stable via useCallback

  const loadWorkflowFromDAG = useCallback(
    async (dagData: DAG) => {
      try {
        // This will set the context's state for ID and Name
        setCurrentWorkflowName(dagData.name);
        setCurrentWorkflowId(dagData.dag_id);
        // Note: setCurrentWorkflowMeta is expected to be called by ClientDashboard after this,
        // to also update localStorage "currentWorkflow" item.
        // Or, we can call it here too for robustness if preferred.
        // For now, adhering to fix description implies ClientDashboard calls it.

        const { nodes: newNodes, connections: newConnections } =
          convertDAGToWorkflow(dagData);
        setNodes(newNodes);
        setConnections(newConnections);
        setSelectedNodeId(null);
        setPropertiesModalNodeId(null);
        setPendingConnection(null);
        setDraggingNodeInfo(null);

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

        const clientId = getCurrentClientId();
        if (clientId) await loadFileConversionConfigs(clientId, dagData.dag_id);

        addLog({
          nodeId: "system",
          nodeName: "System",
          status: "info",
          message: `Workflow "${dagData.name}" loaded successfully with ${
            newNodes.length
          } nodes.${
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
    [convertDAGToWorkflow, toast, loadFileConversionConfigs] // addLog removed from deps as it's stable
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
  }, []); // clearLogs was missing, added.

  // Updated getCurrentWorkflowId to align with setCurrentWorkflowMeta's localStorage item structure
  const getCurrentWorkflowId = useCallback(() => {
    if (currentWorkflowId) return currentWorkflowId; // From context state
    try {
      const workflowData = localStorage.getItem("currentWorkflow"); // Item set by setCurrentWorkflowMeta
      if (workflowData) {
        const parsed = JSON.parse(workflowData);
        if (parsed.id) return parsed.id; // Prefer 'id' field
        if (parsed.dag_id) return parsed.dag_id; // Fallback for 'dag_id'
      }
    } catch (error) {
      console.error(
        "Error getting current workflow ID from localStorage:",
        error
      );
    }
    return null;
  }, [currentWorkflowId]);

  const convertWorkflowToDAG = useCallback(() => {
    const nodeConnectionMap: Record<string, string[]> = {};
    nodes.forEach((node) => {
      nodeConnectionMap[node.id] = [];
    });
    connections.forEach((connection) => {
      if (nodeConnectionMap[connection.sourceId])
        nodeConnectionMap[connection.sourceId].push(connection.targetId);
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
    let workflowId = getCurrentWorkflowId(); // Uses the updated getCurrentWorkflowId
    // if (!workflowId) workflowId = "dag_sample_47220ca3" // Defaulting seems risky, let's rely on actual ID

    const localSaveCurrentWorkflowState = () => {
      /* ... */ return { nodes, connections };
    }; // unchanged

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
      const dagData = convertWorkflowToDAG();
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
  const currentWorkflow = {
    nodes,
    connections,
    metadata: {
      name: currentWorkflowName,
      dag_id: currentWorkflowId,
      created_at: new Date().toISOString(),
    },
  };
  try {
    localStorage.setItem("workflowData", JSON.stringify(currentWorkflow));
    console.log("Workflow snapshot saved to localStorage.");
  } catch (error) {
    console.error("Failed to save workflow snapshot:", error);
  }
  return workflowData;
}, [nodes, connections, currentWorkflowName, currentWorkflowId]);


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
      if (!node) return null;
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

  useEffect(() => {
    const handleWorkflowSelected = async (event: CustomEvent) => {
      const dagData = event.detail;
      if (dagData) await loadWorkflowFromDAG(dagData);
    };
    window.addEventListener(
      "workflowSelected",
      handleWorkflowSelected as EventListener
    );
    return () => {
      window.removeEventListener(
        "workflowSelected",
        handleWorkflowSelected as EventListener
      );
    };
  }, [loadWorkflowFromDAG]);

  // Updated useEffect for loading from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("workflowData"); // For nodes/connections
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (
          parsedData?.nodes &&
          Array.isArray(parsedData.nodes) &&
          parsedData.connections &&
          Array.isArray(parsedData.connections)
        ) {
          loadWorkflow(parsedData);
          // If "workflowData" has metadata, it might be an older source of truth or a fallback
          if (parsedData.metadata) {
            if (!currentWorkflowName && parsedData.metadata.name)
              setCurrentWorkflowName(parsedData.metadata.name);
            if (!currentWorkflowId && parsedData.metadata.dag_id)
              setCurrentWorkflowId(parsedData.metadata.dag_id);
          }
        } else {
          console.warn(
            "Invalid workflow data in localStorage for 'workflowData'."
          );
        }
      }

      // Prioritize "currentWorkflow" for id and name, as it's set by setCurrentWorkflowMeta
      const currentWorkflowStr = localStorage.getItem("currentWorkflow");
      if (currentWorkflowStr) {
        const workflowInfo = JSON.parse(currentWorkflowStr);
        // workflowInfo should contain { id, name }
        if (workflowInfo.name) setCurrentWorkflowName(workflowInfo.name || ""); // Ensure name is set
        if (workflowInfo.id) setCurrentWorkflowId(workflowInfo.id || null); // Ensure id is set
      }
    } catch (error) {
      console.error("Failed to load workflow state from localStorage:", error);
      // Optionally clear potentially corrupted items
      // localStorage.removeItem("workflowData");
      // localStorage.removeItem("currentWorkflow");
    }
  }, [loadWorkflow]); // currentWorkflowId and currentWorkflowName removed from deps to avoid loop with their setters

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
    setCurrentWorkflowMeta, // Added to context value
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
