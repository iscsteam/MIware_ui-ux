
// //workflow-context.tsx

// "use client"
// import type React from "react"
// import { createContext, useContext, useState, useCallback, useEffect } from "react"
// import { v4 as uuidv4 } from "uuid"
// import type { NodeType, SchemaItem } from "@/services/interface"

// import { useToast as useUIToast } from "@/components/ui/use-toast"
// import { saveAndRunWorkflow as saveAndRunWorkflowUtil } from "@/services/workflow-utils"
// import { WorkflowNodeData, WorkflowNode, NodeSchema ,NodePosition ,NodeStatus } from "@/services/interface"

// // export type NodeStatus = "idle" | "running" | "success" | "error" | "configured"

// // export interface NodePosition {
// //   x: number
// //   y: number
// // }

// // export interface NodeSchema {
// //   label: string
// //   description: string
// //   inputSchema: SchemaItem[]
// //   outputSchema: SchemaItem[]
// // }

// export interface FilterCondition {
//   field: string
//   operation: string
//   value: any
// }

// export type ConditionItem = FilterCondition | FilterGroup

// export interface FilterGroup {
//   operator: "AND" | "OR" | string
//   conditions: ConditionItem[]
// }

// export type OrderByClauseBackend = [string, "asc" | "desc"]

// export type AggregationFunctionBackend = [string, string]

// export interface AggregationConfigBackend {
//   group_by: string[]
//   aggregations: AggregationFunctionBackend[]
// }

// // export interface WorkflowNodeData {
// //   label?: string
// //   displayName?: string
// //   filename?: string
// //   content?: string
// //   textContent?: string
// //   toFilename?: string
// //   sourceFilename?: string
// //   targetFilename?: string
// //   overwrite?: boolean
// //   isDirectory?: boolean
// //   includeTimestamp?: boolean
// //   encoding?: string
// //   readAs?: string
// //   excludeContent?: boolean
// //   append?: boolean
// //   writeAs?: string
// //   addLineSeparator?: boolean
// //   includeSubDirectories?: boolean
// //   createNonExistingDirs?: boolean
// //   mode?: string
// //   language?: string
// //   code?: string
// //   recursive?: boolean
// //   directory?: string
// //   filter?: any
// //   interval?: number
// //   path?: string
// //   method?: string
// //   port?: number
// //   url?: string
// //   headers?: Record<string, string>
// //   body?: any
// //   timeout?: number
// //   options?: Record<string, any>
// //   jsonObject?: object
// //   xmlString?: string
// //   inputSchema?: string
// //   outputSchema?: string
// //   oldFilename?: string
// //   newFilename?: string
// //   active?: boolean
// //   provider?: string
// //   format?: string
// //   schema?: any
// //   order_by?: any
// //   aggregation?: any
// //   source_path?: string
// //   destination_path?: string
// //   connectionString?: string
// //   writeMode?: string
// //   table?: string
// //   user?: string
// //   password?: string
// //   batchSize?: string
// //   query?: string
// //   filePath?: string
// //   csvOptions?: Record<string, any>
// //   fields?: string[]
// //   where?: string
// //   limit?: number
// //   username?: string
// //   object_name?: string
// //   use_bulk_api?: boolean
// //   file_path?: string
// //   bulk_batch_size?: number
// //   config_id?: number
// //   // Inline-specific fields
// //   multiLine?: boolean
// //   header?: boolean | string
// //   inferSchema?: boolean | string
// //   delimiter?: string
// //   rowTag?: string
// //   rootTag?: string
// //   singleFile?: boolean
// //   compression?: string
// //   lineSep?: string
// //   wholetext?: boolean
// //   update_objects?: boolean
// //   input_path?: string
// //   pretty?: boolean
// // }

// // export interface WorkflowNode {
// //   id: string
// //   type: NodeType
// //   position: NodePosition
// //   data: WorkflowNodeData
// //   status?: NodeStatus
// //   output?: any
// //   error?: string
// // }

// export interface NodeConnection {
//   id: string
//   sourceId: string
//   targetId: string
//   sourceHandle?: string
//   targetHandle?: string
// }

// export interface LogEntry {
//   id: string
//   nodeId: string
//   nodeName: string
//   timestamp: Date
//   status: NodeStatus | "info"
//   message: string
//   details?: any
// }

// export interface DAG {
//   id: number
//   name: string
//   dag_id: string
//   schedule: string | null
//   active: boolean
//   dag_sequence: Array<{
//     id: string
//     type: string
//     config_id: number
//     next: string[]
//     config?: any
//   }>
//   active_dag_run: number | null
//   created_at: string
//   updated_at: string
// }

// interface WorkflowExportData {
//   nodes: WorkflowNode[]
//   connections: NodeConnection[]
//   metadata?: {
//     name: string
//     dag_id: string
//     exported_at?: string
//     schedule?: string | null
//     created_at?: string
//   }
// }

// interface WorkflowContextType {
//   nodes: WorkflowNode[]
//   connections: NodeConnection[]
//   logs: LogEntry[]
//   selectedNodeId: string | null
//   pendingConnection: { sourceId: string; sourceHandle?: string } | null
//   propertiesModalNodeId: string | null
//   dataMappingModalNodeId: string | null
//   draggingNodeInfo: { id: string; offset: { x: number; y: number } } | null
//   currentWorkflowName: string
//   currentWorkflowId: string | null
//   setPendingConnection: (connection: { sourceId: string; sourceHandle?: string } | null) => void
//   setPropertiesModalNodeId: (nodeId: string | null) => void
//   setDataMappingModalNodeId: (nodeId: string | null) => void
//   setDraggingNodeInfo: (info: { id: string; offset: { x: number; y: number } } | null) => void
//   addNode: (type: NodeType, position: NodePosition, initialData?: Partial<WorkflowNodeData>) => string
//   updateNode: (
//     id: string,
//     updates: Partial<Omit<WorkflowNode, "data">> & {
//       data?: Partial<WorkflowNodeData>
//     },
//   ) => void
//   removeNode: (id: string) => void
//   selectNode: (id: string | null) => void
//   addConnection: (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => void
//   removeConnection: (connectionId: string) => void
//   clearWorkflow: () => void
//   saveWorkflow: () => { nodes: WorkflowNode[]; connections: NodeConnection[] }
//   saveWorkflowToBackend: () => Promise<void>
//   getWorkflowExportData: () => WorkflowExportData
//   // loadWorkflow: (data: WorkflowExportData) => void
//   loadWorkflow: (data: {
//     nodes: WorkflowNode[]
//     connections: NodeConnection[]
//   }) => void
//   loadWorkflowFromDAG: (dagData: DAG) => Promise<void>
//   runWorkflow: () => Promise<void>
//   executeNode: (nodeId: string, inputData?: any) => Promise<any>
//   addLog: (log: Omit<LogEntry, "id" | "timestamp">) => void
//   clearLogs: () => void
//   getNodeById: (id: string) => WorkflowNode | undefined
//   getCurrentWorkflowId: () => string | null
//   saveAndRunWorkflow: () => Promise<void>
//   createNewWorkflow: (workflowName: string, dagId: string) => void
//   syncWorkflowWithAirflow: (workflowName: string, frontendDagId: string) => Promise<string>
//   setCurrentWorkflowMeta: (id: string, name: string) => void // Added as per fix
// }

// export interface StoredExecutionRun {
//   id: string
//   dag_id: string
//   workflowId: string
//   workflowName: string
//   status: "running" | "completed" | "failed" | "cancelled"
//   startTime: string
//   endTime?: string
//   duration?: number
//   triggeredBy: "manual" | "schedule" | "api"
//   nodeResults: Array<{
//     nodeId: string
//     nodeName: string
//     status: "success" | "error" | "skipped"
//     duration: number
//     output?: any
//     error?: string
//   }>
// }

// const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

// export const getCurrentClientId = (): string | null => {
//   try {
//     const clientDataString = localStorage.getItem("currentClient")
//     if (clientDataString) {
//       const parsedClient = JSON.parse(clientDataString)
//       if (parsedClient?.id && String(parsedClient.id).trim() !== "") {
//         return String(parsedClient.id)
//       }
//     }
//     const workflowDataString = localStorage.getItem("currentWorkflow")
//     if (workflowDataString) {
//       const parsedWorkflow = JSON.parse(workflowDataString)
//       if (parsedWorkflow?.client_id && String(parsedWorkflow.client_id).trim() !== "") {
//         return String(parsedWorkflow.client_id)
//       }
//     }
//     console.warn("getCurrentClientId: No valid client_id found.")
//   } catch (error) {
//     console.error("getCurrentClientId: Error accessing localStorage:", error)
//   }
//   return null
// }

// export function WorkflowProvider({ children }: { children: React.ReactNode }) {
//   const [nodes, setNodes] = useState<WorkflowNode[]>([])
//   const [connections, setConnections] = useState<NodeConnection[]>([])
//   const [logs, setLogs] = useState<LogEntry[]>([])
//   const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
//   const [isRunning, setIsRunning] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)

//   // Existing states, ensure types match if fix description used "" vs null
//   const [currentWorkflowName, setCurrentWorkflowName] = useState<string>("")
//   const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null)

//   const [pendingConnection, setPendingConnection] = useState<{
//     sourceId: string
//     sourceHandle?: string
//   } | null>(null)
//   const [propertiesModalNodeId, setPropertiesModalNodeId] = useState<string | null>(null)
//   const [dataMappingModalNodeId, setDataMappingModalNodeId] = useState<string | null>(null)
//   const [draggingNodeInfo, setDraggingNodeInfo] = useState<{
//     id: string
//     offset: { x: number; y: number }
//   } | null>(null)
//   const { toast } = useUIToast()

//   const addLog = useCallback((log: Omit<LogEntry, "id" | "timestamp">) => {
//     const newLog: LogEntry = { ...log, id: uuidv4(), timestamp: new Date() }
//     setLogs((prev) => [newLog, ...prev.slice(0, 99)])
//   }, [])

//   const clearLogs = useCallback(() => {
//     setLogs([])
//   }, [])

//   function setCurrentWorkflowMeta(id: string, name: string) {
//     setCurrentWorkflowId(id)
//     setCurrentWorkflowName(name)
//     localStorage.setItem("currentWorkflow", JSON.stringify({ id, name }))
//   }

//   const makePythonSafeId = (name: string): string => {
//     let safeId = name.replace(/[^a-zA-Z0-9_]/g, "_")
//     if (!/^[a-zA-Z_]/.test(safeId)) {
//       safeId = "node_" + safeId
//     }
//     return safeId
//   }

//   const parseFileConversionConfig = useCallback((dagNode: any, basePosition: NodePosition) => {
//     console.log("Parsing file_conversion config for node:", dagNode.id, dagNode.config)

//     const config = dagNode.config
//     if (!config) {
//       console.warn("No config found for file_conversion node:", dagNode.id)
//       return { nodes: [], connections: [], firstNodeId: null, lastNodeId: null }
//     }

//     const nodes: WorkflowNode[] = []
//     const connections: NodeConnection[] = []
//     let currentX = basePosition.x
//     const y = basePosition.y

//     // Handle inline input
//     if (config.input && config.input.provider === "inline") {
//       const inlineInputNodeId = `inline_input_${dagNode.config_id || uuidv4()}`
//       console.log("Creating inline-input node:", inlineInputNodeId, config.input)

//       const inlineInputNode: WorkflowNode = {
//         id: inlineInputNodeId,
//         type: "inline-input",
//         position: { x: currentX, y },
//         data: {
//           label: "inline-input",
//           displayName: "Inline Input",
//           provider: "inline",
//           format: config.input.format,
//           content: config.input.content || "",
//           options: config.input.options || {},
//           schema: config.input.schema,
//           active: true,
//         },
//         status: "configured",
//       }
//       nodes.push(inlineInputNode)
//       currentX += 200
//     } else if (config.input) {
//       const readNodeId = `read_file_${dagNode.config_id || uuidv4()}`
//       console.log("Creating read-file node:", readNodeId, config.input)

//       const readNode: WorkflowNode = {
//         id: readNodeId,
//         type: "read-file",
//         position: { x: currentX, y },
//         data: {
//           label: "read-file",
//           displayName: "Read File",
//           path: config.input.path,
//           provider: config.input.provider,
//           format: config.input.format,
//           options: config.input.options || {},
//           schema: config.input.schema,
//           active: true,
//         },
//         status: "configured",
//       }
//       nodes.push(readNode)
//       currentX += 200
//     }

//     let filterNodeId: string | null = null
//     if (config.filter || config.order_by || config.aggregation) {
//       filterNodeId = `filter_${dagNode.config_id || uuidv4()}`
//       console.log("Creating filter node:", filterNodeId, {
//         filter: config.filter,
//         order_by: config.order_by,
//         aggregation: config.aggregation,
//       })

//       const filterNode: WorkflowNode = {
//         id: filterNodeId,
//         type: "filter",
//         position: { x: currentX, y },
//         data: {
//           label: "filter",
//           displayName: "Filter",
//           filter: config.filter,
//           order_by: config.order_by,
//           aggregation: config.aggregation,
//           active: true,
//         },
//         status: "configured",
//       }
//       nodes.push(filterNode)
//       currentX += 200
//     }

//     // Handle inline output or regular output
//     if (config.output) {
//       const isDatabase = config.output.type === "database" || (config.output.connectionString && config.output.table)
//       const isInlineOutput = config.output.provider === "inline"

//       let writeNodeId: string
//       let nodeType: NodeType
//       let displayName: string

//       if (isInlineOutput) {
//         writeNodeId = `inline_output_${dagNode.config_id}`
//         nodeType = "inline-output"
//         displayName = "Inline Output"
//       } else if (isDatabase) {
//         writeNodeId = `database_${dagNode.config_id}`
//         nodeType = "database"
//         displayName = "Database"
//       } else {
//         writeNodeId = `write_file_${dagNode.config_id}`
//         nodeType = "write-file"
//         displayName = "Write File"
//       }

//       console.log(`Creating ${nodeType} node:`, writeNodeId, config.output)

//       const writeNode: WorkflowNode = {
//         id: writeNodeId,
//         type: nodeType,
//         position: { x: currentX, y },
//         data: {
//           label: nodeType,
//           displayName,
//           path: config.output.path,
//           provider: config.output.provider,
//           format: config.output.format,
//           mode: config.output.mode,
//           options: config.output.options || {},
//           content: config.output.content || "",
//           ...(isDatabase && {
//             connectionString: config.output.connectionString,
//             table: config.output.table,
//             writeMode: config.output.writeMode || "append",
//           }),
//           active: true,
//         },
//         status: "configured",
//       }
//       nodes.push(writeNode)
//     }

//     if (nodes.length > 1) {
//       for (let i = 0; i < nodes.length - 1; i++) {
//         const connectionId = uuidv4()
//         console.log("Creating connection:", nodes[i].id, "->", nodes[i + 1].id)
//         connections.push({
//           id: connectionId,
//           sourceId: nodes[i].id,
//           targetId: nodes[i + 1].id,
//         })
//       }
//     }

//     console.log("Parsed file_conversion - nodes:", nodes.length, "connections:", connections.length)
//     return { nodes, connections, firstNodeId: nodes[0]?.id, lastNodeId: nodes[nodes.length - 1]?.id }
//   }, [])

//   const parseCliOperatorConfig = useCallback((dagNode: any, basePosition: NodePosition) => {
//     console.log("Parsing cli_operator config for node:", dagNode.id, dagNode.config)

//     const config = dagNode.config
//     if (!config || !config.operation) {
//       console.warn("No config or operation found for cli_operator node:", dagNode.id)
//       return { nodes: [], connections: [], firstNodeId: null, lastNodeId: null }
//     }

//     let nodeType: NodeType
//     let displayName: string

//     switch (config.operation) {
//       case "copy":
//         nodeType = "copy-file"
//         displayName = "Copy File"
//         break
//       case "move":
//         nodeType = "move-file"
//         displayName = "Move File"
//         break
//       case "rename":
//         nodeType = "rename-file"
//         displayName = "Rename File"
//         break
//       case "delete":
//         nodeType = "delete-file"
//         displayName = "Delete File"
//         break
//       default:
//         console.warn("Unknown CLI operation:", config.operation)
//         nodeType = "copy-file"
//         displayName = "File Operation"
//     }

//     const operationNodeId = `${config.operation}_${dagNode.config_id || uuidv4()}`
//     console.log("Creating CLI operation node:", operationNodeId, nodeType, config)

//     const operationNode: WorkflowNode = {
//       id: operationNodeId,
//       type: nodeType,
//       position: basePosition,
//       data: {
//         label: nodeType,
//         displayName,
//         source_path: config.source_path,
//         destination_path: config.destination_path,
//         options: config.options || {},
//         overwrite: config.options?.overwrite || false,
//         includeSubDirectories: config.options?.includeSubDirectories || false,
//         createNonExistingDirs: config.options?.createNonExistingDirs || false,
//         recursive: config.options?.recursive || false,
//         active: true,
//       },
//       status: "configured",
//     }

//     return {
//       nodes: [operationNode],
//       connections: [],
//       firstNodeId: operationNodeId,
//       lastNodeId: operationNodeId,
//     }
//   }, [])

//   const convertDAGToWorkflow = useCallback(
//     (dagData: DAG) => {
//       console.log("=== Converting DAG to workflow ===")
//       console.log("DAG ID:", dagData.dag_id, "Sequence length:", dagData.dag_sequence.length)

//       const newNodes: WorkflowNode[] = []
//       const newConnections: NodeConnection[] = []
//       const nodePositions = new Map<string, NodePosition>()
//       const calculatedNodePositions = new Map<string, NodePosition>()

//       const calculateNodePositions = (dagSequence: any[]) => {
//         const levels: string[][] = []
//         const visited = new Set<string>()
//         const inDegree = new Map<string, number>()
//         dagSequence.forEach((node) => {
//           inDegree.set(node.id, 0)
//         })
//         dagSequence.forEach((node) => {
//           node.next.forEach((nextId: string) => {
//             inDegree.set(nextId, (inDegree.get(nextId) || 0) + 1)
//           })
//         })
//         const queue: string[] = []
//         dagSequence.forEach((node) => {
//           if (inDegree.get(node.id) === 0) queue.push(node.id)
//         })
//         while (queue.length > 0) {
//           const levelSize = queue.length
//           const currentLevel: string[] = []
//           for (let i = 0; i < levelSize; i++) {
//             const nodeId = queue.shift()!
//             currentLevel.push(nodeId)
//             visited.add(nodeId)
//             const node = dagSequence.find((n) => n.id === nodeId)
//             if (node)
//               node.next.forEach((nextId: string) => {
//                 const newInDegree = (inDegree.get(nextId) || 0) - 1
//                 inDegree.set(nextId, newInDegree)
//                 if (newInDegree === 0 && !visited.has(nextId)) queue.push(nextId)
//               })
//           }
//           if (currentLevel.length > 0) levels.push(currentLevel)
//         }
//         levels.forEach((level, levelIndex) => {
//           level.forEach((nodeId, nodeIndex) => {
//             const x = levelIndex * 300 + 100
//             const y = nodeIndex * 150 + 100
//             nodePositions.set(nodeId, { x, y })
//           })
//         })
//       }
//       calculateNodePositions(dagData.dag_sequence)
//       const dagNodeMapping = new Map<string, { firstNodeId: string; lastNodeId: string }>()
//       dagData.dag_sequence.forEach((dagNode) => {
//         console.log(
//           `Processing DAG node: ID=${dagNode.id}, Type=${dagNode.type}, ConfigID=${dagNode.config_id}, HasConfig=${!!dagNode.config}`,
//         )
//         if (dagNode.config) {
//           console.log("  Config content:", dagNode.config)
//         }

//         const defaultPosition = nodePositions.get(dagNode.id) || { x: 100, y: 100 }

//         if (dagNode.type === "start" || dagNode.type === "end") {
//           console.log("Creating start/end node:", dagNode.id, dagNode.type)
//           const workflowNode: WorkflowNode = {
//             id: dagNode.id,
//             type: dagNode.type as NodeType,
//             position: defaultPosition,
//             data: {
//               label: dagNode.type,
//               displayName: dagNode.id,
//               active: true,
//             },
//             status: "idle",
//           }
//           newNodes.push(workflowNode)
//           dagNodeMapping.set(dagNode.id, {
//             firstNodeId: dagNode.id,
//             lastNodeId: dagNode.id,
//           })
//         } else if (dagNode.type === "file_conversion" && dagNode.config) {
//           console.log("Processing file_conversion node:", dagNode.id)
//           const parsed = parseFileConversionConfig(dagNode, defaultPosition)

//           if (parsed.nodes.length > 0) {
//             newNodes.push(...parsed.nodes)
//             newConnections.push(...parsed.connections)
//             if (parsed.firstNodeId && parsed.lastNodeId)
//               dagNodeMapping.set(dagNode.id, {
//                 firstNodeId: parsed.firstNodeId,
//                 lastNodeId: parsed.lastNodeId,
//               })
//           } else {
//             console.warn("Failed to parse file_conversion config for node:", dagNode.id)
//             const fallbackNode: WorkflowNode = {
//               id: dagNode.id,
//               type: "start",
//               position: defaultPosition,
//               data: {
//                 label: "file_conversion",
//                 displayName: dagNode.id,
//                 active: true,
//               },
//               status: "idle",
//             }
//             newNodes.push(fallbackNode)
//             dagNodeMapping.set(dagNode.id, { firstNodeId: fallbackNode.id, lastNodeId: fallbackNode.id })
//           }
//         } else if (dagNode.type === "cli_operator" && dagNode.config) {
//           console.log("Processing cli_operator node:", dagNode.id)
//           const parsed = parseCliOperatorConfig(dagNode, defaultPosition)

//           if (parsed.nodes.length > 0) {
//             newNodes.push(...parsed.nodes)
//             newConnections.push(...parsed.connections)
//             if (parsed.firstNodeId && parsed.lastNodeId)
//               dagNodeMapping.set(dagNode.id, {
//                 firstNodeId: parsed.firstNodeId,
//                 lastNodeId: parsed.lastNodeId,
//               })
//           } else {
//             console.warn("Failed to parse cli_operator config for node:", dagNode.id)
//             const fallbackNode: WorkflowNode = {
//               id: dagNode.id,
//               type: "start",
//               position: defaultPosition,
//               data: {
//                 label: "cli_operator",
//                 displayName: dagNode.id,
//                 active: true,
//               },
//               status: "idle",
//             }
//             newNodes.push(fallbackNode)
//             dagNodeMapping.set(dagNode.id, { firstNodeId: fallbackNode.id, lastNodeId: fallbackNode.id })
//           }
//         } else if (dagNode.type === "read_salesforce" && dagNode.config) {
//           console.log("Processing read_salesforce node:", dagNode.id)
//           const salesforceNode: WorkflowNode = {
//             id: dagNode.id,
//             type: "salesforce-cloud",
//             position: defaultPosition,
//             data: {
//               label: "salesforce-cloud",
//               displayName: "Salesforce Cloud",
//               object_name: dagNode.config.object_name,
//               query: dagNode.config.query,
//               fields: dagNode.config.fields || [],
//               where: dagNode.config.where || "",
//               limit: dagNode.config.limit,
//               use_bulk_api: dagNode.config.use_bulk_api || false,
//               file_path: dagNode.config.file_path,
//               config_id: dagNode.config_id,
//               active: true,
//             },
//             status: "configured",
//           }
//           newNodes.push(salesforceNode)
//           dagNodeMapping.set(dagNode.id, { firstNodeId: dagNode.id, lastNodeId: dagNode.id })
//         } else if (dagNode.type === "write_salesforce" && dagNode.config) {
//           console.log("Processing write_salesforce node:", dagNode.id)
//           const salesforceWriteNode: WorkflowNode = {
//             id: dagNode.id,
//             type: "write-salesforce",
//             position: defaultPosition,
//             data: {
//               label: "write-salesforce",
//               displayName: "Salesforce Write",
//               object_name: dagNode.config.object_name,
//               use_bulk_api: dagNode.config.use_bulk_api || false,
//               file_path: dagNode.config.file_path,
//               bulk_batch_size: dagNode.config.bulk_batch_size,
//               update_objects: dagNode.config.update_objects || false,
//               config_id: dagNode.config_id,
//               active: true,
//             },
//             status: "configured",
//           }
//           newNodes.push(salesforceWriteNode)
//           dagNodeMapping.set(dagNode.id, { firstNodeId: dagNode.id, lastNodeId: dagNode.id })
//         } else {
//           console.warn(
//             "Unknown node type or missing config for DAG node:",
//             dagNode.type,
//             dagNode.id,
//             "config:",
//             !!dagNode.config,
//           )

//           let nodeType: NodeType = "start"
//           switch (dagNode.type) {
//             case "start":
//               nodeType = "start"
//               break
//             case "end":
//               nodeType = "end"
//               break
//             case "file_conversion":
//               nodeType = "file"
//               break
//             case "cli_operator":
//               nodeType = "copy-file"
//               break
//             case "read-file":
//               nodeType = "read-file"
//               break
//             case "write-file":
//               nodeType = "write-file"
//               break
//             case "database":
//               nodeType = "database"
//               break
//             case "source":
//               nodeType = "source"
//               break
//             case "salesforce-cloud":
//               nodeType = "salesforce-cloud"
//               break
//             case "write-salesforce":
//               nodeType = "write-salesforce"
//               break
//             case "inline-input":
//               nodeType = "inline-input"
//               break
//             case "inline-output":
//               nodeType = "inline-output"
//               break
//             default:
//               nodeType = "start"
//           }
//           const workflowNode: WorkflowNode = {
//             id: dagNode.id,
//             type: nodeType,
//             position: defaultPosition,
//             data: {
//               label: dagNode.type,
//               displayName: dagNode.id,
//               active: true,
//               ...(dagNode.config ? dagNode.config : {}),
//             },
//             status: "idle",
//           }
//           newNodes.push(workflowNode)
//           dagNodeMapping.set(dagNode.id, {
//             firstNodeId: dagNode.id,
//             lastNodeId: dagNode.id,
//           })
//         }
//       })
//       dagData.dag_sequence.forEach((dagNode) => {
//         const sourceMapping = dagNodeMapping.get(dagNode.id)
//         if (!sourceMapping) return
//         dagNode.next.forEach((nextNodeId) => {
//           const targetMapping = dagNodeMapping.get(nextNodeId)
//           if (!targetMapping) return
//           const connection: NodeConnection = {
//             id: uuidv4(),
//             sourceId: sourceMapping.lastNodeId,
//             targetId: targetMapping.firstNodeId,
//           }
//           console.log("Creating DAG connection:", sourceMapping.lastNodeId, "->", targetMapping.firstNodeId)
//           newConnections.push(connection)
//         })
//       })

//       console.log("=== Conversion complete ===")
//       console.log("Total nodes:", newNodes.length, "Total connections:", newConnections.length)
//       console.log(
//         "Created nodes:",
//         newNodes.map((n) => ({
//           id: n.id,
//           type: n.type,
//           label: n.data.label,
//           displayName: n.data.displayName,
//           config_id: n.data.config_id,
//           position: n.position,
//         })),
//       )

//       return { nodes: newNodes, connections: newConnections }
//     },
//     [parseFileConversionConfig, parseCliOperatorConfig],
//   )

//   const loadFileConversionConfigs = useCallback(
//     async (clientId: string, dagId?: string) => {
//       try {
//         const { listFileConversionConfigs } = await import("@/services/file-conversion-service")
//         const configs = await listFileConversionConfigs(Number(clientId))
//         if (configs) {
//           console.log("Loaded file conversion configs:", configs)

//           const filteredConfigs = dagId ? configs.filter((config) => config.dag_id === dagId) : configs

//           if (filteredConfigs.length > 0) {
//             addLog({
//               nodeId: "system",
//               nodeName: "System",
//               status: "info",
//               message: `Loaded ${filteredConfigs.length} file conversion config(s).`,
//             })
//           }
//           // You can enhance nodes with config data here if needed
//           // For example, update nodes that have matching config_ids
//           if (filteredConfigs.length > 0) {
//             addLog({
//               nodeId: "system",
//               nodeName: "System",
//               status: "info",
//               message: `Loaded ${filteredConfigs.length} file conversion config(s).`,
//             })
//           }

//           return filteredConfigs
//         }
//       } catch (error) {
//         console.warn("Could not load file conversion configs:", error)
//         return []
//       }
//       return []
//     },
//     [addLog],
//   )

//   const loadWorkflowFromDAG = useCallback(
//     async (dagData: DAG) => {
//       try {
//         console.log("=== Loading workflow from DAG ===")
//         console.log("DAG Data:", JSON.stringify(dagData, null, 2))

//         console.log("[WorkflowContext] Setting workflow name:", dagData.name)
//         console.log("[WorkflowContext] Setting workflow ID:", dagData.dag_id)

//         setCurrentWorkflowName(dagData.name)
//         setCurrentWorkflowId(dagData.dag_id)

//         const workflowInfo = {
//           name: dagData.name,
//           dag_id: dagData.dag_id,
//           schedule: dagData.schedule,
//           created_at: dagData.created_at,
//           client_id: getCurrentClientId(),
//         }
//         localStorage.setItem("currentWorkflow", JSON.stringify(workflowInfo))
//         console.log("[WorkflowContext] Updated localStorage with workflow info:", workflowInfo)

//         try {
//           const { loadWorkflowFromMongoDB } = await import("@/services/workflow-position-service")
//           const mongoWorkflow = await loadWorkflowFromMongoDB(dagData.dag_id)

//           if (mongoWorkflow && mongoWorkflow.nodes && mongoWorkflow.connections && mongoWorkflow.metadata) {
//             console.log("Loading workflow from MongoDB in loadWorkflowFromDAG...")

//             setNodes(mongoWorkflow.nodes)
//             setConnections(mongoWorkflow.connections)
//             setSelectedNodeId(null)
//             setPropertiesModalNodeId(null)
//             setPendingConnection(null)
//             setDraggingNodeInfo(null)

//             const workflowData = {
//               nodes: mongoWorkflow.nodes,
//               connections: mongoWorkflow.connections,
//               metadata: mongoWorkflow.metadata,
//             }
//             localStorage.setItem("workflowData", JSON.stringify(workflowData))

//             addLog({
//               nodeId: "system",
//               nodeName: "System",
//               status: "info",
//               message: `Workflow "${mongoWorkflow.metadata.name}" loaded successfully from MongoDB with ${mongoWorkflow.nodes.length} nodes.`,
//             })
//             return
//           }
//         } catch (mongoError) {
//           console.warn("Could not load from MongoDB, falling back to DAG conversion:", mongoError)
//         }

//         const { nodes: newNodes, connections: newConnections } = convertDAGToWorkflow(dagData)

//         setNodes(newNodes)
//         setConnections(newConnections)
//         setSelectedNodeId(null)
//         setPropertiesModalNodeId(null)
//         setPendingConnection(null)
//         setDraggingNodeInfo(null)

//         const workflowData = {
//           nodes: newNodes,
//           connections: newConnections,
//           metadata: {
//             name: dagData.name,
//             dag_id: dagData.dag_id,
//             schedule: dagData.schedule,
//             created_at: dagData.created_at,
//           },
//         }
//         localStorage.setItem("workflowData", JSON.stringify(workflowData))

//         try {
//           const clientId = getCurrentClientId()
//           if (clientId) {
//             await loadFileConversionConfigs(clientId, dagData.dag_id)
//           }
//         } catch (configError) {
//           console.warn("Could not load file conversion configs:", configError)
//         }

//         addLog({
//           nodeId: "system",
//           nodeName: "System",
//           status: "info",
//           message: `Workflow "${dagData.name}" loaded successfully with ${newNodes.length} nodes.${
//             dagData.schedule ? ` Schedule: ${dagData.schedule}` : " (Manual execution)"
//           }`,
//         })
//       } catch (error) {
//         console.error("Error loading workflow from DAG:", error)
//         toast({
//           title: "Error",
//           description: "Failed to load workflow from DAG data.",
//           variant: "destructive",
//         })
//       }
//     },
//     [convertDAGToWorkflow, toast, loadFileConversionConfigs, addLog],
//   )

//   const addNode = useCallback((type: NodeType, position: NodePosition, initialData?: Partial<WorkflowNodeData>) => {
//     const displayName = initialData?.displayName || `${type}_${Math.floor(Math.random() * 10000)}`
//     const nodeId = makePythonSafeId(displayName)
//     const newNode: WorkflowNode = {
//       id: nodeId,
//       type,
//       position,
//       data: { label: type, displayName, active: true, ...initialData },
//       status: "idle",
//     }
//     setNodes((prev) => [...prev, newNode])
//     return newNode.id
//   }, [])

//   const updateNode = useCallback(
//     (
//       id: string,
//       updates: Partial<Omit<WorkflowNode, "data">> & {
//         data?: Partial<WorkflowNodeData>
//       },
//     ) => {
//       setNodes((prevNodes) =>
//         prevNodes.map((node) =>
//           node.id === id ? { ...node, ...updates, data: { ...node.data, ...updates.data } } : node,
//         ),
//       )
//     },
//     [],
//   )

//   const removeNode = useCallback(
//     (id: string) => {
//       setNodes((prev) => prev.filter((node) => node.id !== id))
//       setConnections((prev) => prev.filter((conn) => conn.sourceId !== id && conn.targetId !== id))
//       if (selectedNodeId === id) setSelectedNodeId(null)
//       if (propertiesModalNodeId === id) setPropertiesModalNodeId(null)
//     },
//     [selectedNodeId, propertiesModalNodeId],
//   )

//   const selectNode = useCallback((id: string | null) => {
//     setSelectedNodeId(id)
//   }, [])

//   const addConnection = useCallback(
//     (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => {
//       if (sourceId === targetId) return
//       const exists = connections.some(
//         (conn) =>
//           conn.sourceId === sourceId &&
//           conn.targetId === targetId &&
//           conn.sourceHandle === sourceHandle &&
//           conn.targetHandle === targetHandle,
//       )
//       if (exists) return
//       const isCircular = connections.some((conn) => conn.sourceId === targetId && conn.targetId === sourceId)
//       if (isCircular) {
//         console.warn("Preventing direct circular connection")
//         return
//       }
//       const newConnection: NodeConnection = {
//         id: uuidv4(),
//         sourceId,
//         targetId,
//         sourceHandle,
//         targetHandle,
//       }
//       setConnections((prev) => [...prev, newConnection])
//     },
//     [connections],
//   )

//   const removeConnection = useCallback((connectionId: string) => {
//     setConnections((prev) => prev.filter((conn) => conn.id !== connectionId))
//   }, [])

//   const clearWorkflow = useCallback(() => {
//     setNodes([])
//     setConnections([])
//     setSelectedNodeId(null)
//     setPropertiesModalNodeId(null)
//     setPendingConnection(null)
//     setDraggingNodeInfo(null)
//     setCurrentWorkflowName("")
//     setCurrentWorkflowId(null)
//     clearLogs()
//     localStorage.removeItem("workflowData")
//     localStorage.removeItem("currentWorkflow")
//     toast({
//       description: "The current workflow has been cleared from the canvas.",
//       title: "Workflow Cleared",
//     })
//   }, [clearLogs, toast])

//   const getCurrentWorkflowId = useCallback(() => {
//     console.log("[WorkflowContext] getCurrentWorkflowId called")
//     console.log("[WorkflowContext] currentWorkflowId state:", currentWorkflowId)

//     if (currentWorkflowId) {
//       console.log("[WorkflowContext] Returning currentWorkflowId from state:", currentWorkflowId)
//       return currentWorkflowId
//     }

//     try {
//       const workflowData = localStorage.getItem("currentWorkflow")
//       console.log("[WorkflowContext] localStorage currentWorkflow:", workflowData)

//       if (workflowData) {
//         const parsed = JSON.parse(workflowData)
//         console.log("[WorkflowContext] Parsed workflow data:", parsed)

//         if (parsed?.id && String(parsed.id).trim() !== "") {
//           const id = String(parsed.id)
//           console.log("[WorkflowContext] Returning id from localStorage:", id)
//           return id
//         }
//       }
//     } catch (error) {
//       console.error("[WorkflowContext] Error getting current workflow ID from localStorage:", error)
//     }

//     console.warn("[WorkflowContext] No workflow ID found")
//     return null
//   }, [currentWorkflowId])

//   const saveWorkflowToBackend = useCallback(async () => {
//     console.log("[WorkflowContext] saveWorkflowToBackend called")

//     const workflowId = getCurrentWorkflowId()
//     console.log("[WorkflowContext] Current workflow ID:", workflowId)
//     console.log("[WorkflowContext] Current workflow name:", currentWorkflowName)
//     console.log("[WorkflowContext] Nodes count:", nodes.length)
//     console.log("[WorkflowContext] Connections count:", connections.length)

//     if (!workflowId) {
//       console.error("[WorkflowContext] No workflow ID found")
//       toast({
//         description: "No active workflow. Please create or select one first to save to backend.",
//         title: "Error",
//         variant: "destructive",
//       })
//       return
//     }

//     if (nodes.length === 0) {
//       console.error("[WorkflowContext] No nodes to save")
//       toast({
//         description: "Cannot save an empty workflow. Please add nodes first.",
//         title: "Error",
//         variant: "destructive",
//       })
//       return
//     }

//     setIsSaving(true)

//     try {
//       console.log(`[WorkflowContext] Starting save process for workflow ${workflowId}...`)

//       const { saveWorkflowToMongoDB } = await import("@/services/workflow-position-service")

//       const metadata = {
//         name: currentWorkflowName || "Untitled Workflow",
//         dag_id: workflowId,
//         exported_at: new Date().toISOString(),
//         schedule: null,
//         created_at: new Date().toISOString(),
//       }

//       console.log(`[WorkflowContext] Metadata to save:`, metadata)
//       console.log(
//         `[WorkflowContext] Nodes to save:`,
//         nodes.map((n) => ({ id: n.id, type: n.type, position: n.position })),
//       )
//       console.log(
//         `[WorkflowContext] Connections to save:`,
//         connections.map((c) => ({ id: c.id, sourceId: c.sourceId, targetId: c.targetId })),
//       )

//       await saveWorkflowToMongoDB(nodes, connections, metadata)

//       const workflowData = {
//         nodes,
//         connections,
//         metadata,
//       }
//       localStorage.setItem("workflowData", JSON.stringify(workflowData))
//       console.log("[WorkflowContext] Workflow saved to localStorage and MongoDB successfully")

//       addLog({
//         message: `Workflow saved successfully to MongoDB with ${nodes.length} nodes and ${connections.length} connections.`,
//         nodeId: "system",
//         nodeName: "System",
//         status: "info",
//       })

//       toast({
//         description: "Workflow saved successfully to MongoDB.",
//         title: "Success",
//       })
//     } catch (error) {
//       console.error("[WorkflowContext] Error saving workflow to MongoDB:", error)
//       addLog({
//         message: `Failed to save workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
//         nodeId: "system",
//         nodeName: "System",
//         status: "error",
//       })
//       toast({
//         description: error instanceof Error ? error.message : "Failed to save workflow to MongoDB.",
//         title: "Error",
//         variant: "destructive",
//       })
//     } finally {
//       setIsSaving(false)
//     }
//   }, [nodes, connections, toast, getCurrentWorkflowId, currentWorkflowName, addLog])

//   const saveWorkflow = useCallback(() => {
//     const workflowData: WorkflowExportData = {
//       nodes,
//       connections,
//       metadata: {
//         name: currentWorkflowName,
//         dag_id: currentWorkflowId || uuidv4(),
//       },
//     }
//     const currentWorkflow = {
//       nodes,
//       connections,
//       metadata: {
//         name: currentWorkflowName,
//         dag_id: currentWorkflowId,
//         created_at: new Date().toISOString(),
//       },
//     }
//     try {
//       localStorage.setItem("workflowData", JSON.stringify(currentWorkflow))
//       console.log("Workflow snapshot saved to localStorage.")
//     } catch (error) {
//       console.error("Failed to save workflow snapshot:", error)
//     }
//     return workflowData
//   }, [nodes, connections, currentWorkflowName, currentWorkflowId])

//   const getWorkflowExportData = useCallback(() => {
//     return {
//       nodes,
//       connections,
//       metadata: {
//         name: currentWorkflowName || "Untitled Workflow",
//         dag_id: currentWorkflowId || uuidv4(),
//         exported_at: new Date().toISOString(),
//       },
//     }
//   }, [nodes, connections, currentWorkflowName, currentWorkflowId])

//   const loadWorkflow = useCallback((data: { nodes: WorkflowNode[]; connections: NodeConnection[] }) => {
//     if (data?.nodes && Array.isArray(data.nodes) && data.connections && Array.isArray(data.connections)) {
//       setNodes(data.nodes)
//       setConnections(data.connections)
//       setSelectedNodeId(null)
//       setPropertiesModalNodeId(null)
//       setPendingConnection(null)
//       setDraggingNodeInfo(null)
//       console.log("Workflow loaded from data.")
//     } else {
//       console.error("Invalid data format for loading workflow.")
//     }
//   }, [])

//   const getNodeById = useCallback((id: string) => nodes.find((node) => node.id === id), [nodes])

//   const executeNode = useCallback(
//     async (nodeId: string, inputData?: any): Promise<any> => {
//       const node = getNodeById(nodeId)
//       if (!node) {
//         console.warn(`Node ${nodeId} not found.`)
//         return null
//       }
//       if (node.data?.active === false) {
//         addLog({
//           message: "Skipping inactive node.",
//           nodeId,
//           nodeName: `${node.data?.label || node.type} (inactive)`,
//           status: "info",
//         })
//         const outgoing = connections.filter((c) => c.sourceId === nodeId)
//         let lastOutput = inputData
//         for (const conn of outgoing) {
//           lastOutput = await executeNode(conn.targetId, inputData)
//         }
//         return lastOutput
//       }
//       updateNode(nodeId, { status: "running" })
//       addLog({
//         details: { input: inputData },
//         message: "Executing...",
//         nodeId,
//         nodeName: node.data?.label || node.type,
//         status: "running",
//       })
//       try {
//         await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 50))
//         let output: any
//         const nodeData = node.data || {}
//         switch (node.type) {
//           case "start":
//             output = { trigger: "manual", ...(inputData || {}) }
//             break
//           case "inline-input":
//             output = {
//               processedData: nodeData.content ? JSON.parse(nodeData.content) : {},
//               schema: nodeData.schema,
//               format: nodeData.format,
//               recordCount: Array.isArray(nodeData.content) ? nodeData.content.length : 1,
//             }
//             break
//           case "inline-output":
//             output = {
//               filePath: nodeData.path,
//               success: true,
//               recordCount: inputData?.recordCount || 0,
//               fileSize: nodeData.content ? nodeData.content.length : 0,
//             }
//             break
//           case "read-file":
//             output = { content: `Content of ${nodeData.path}` }
//             break
//           case "write-file":
//             output = { filePath: nodeData.path, written: true }
//             break
//           case "source":
//             output = {
//               data: [{ id: 1, name: "Sample DB Data" }],
//               source: nodeData.table || nodeData.query,
//             }
//             break
//           case "database":
//             output = { success: true, table: nodeData.table }
//             break
//           case "salesforce-cloud":
//             output = {
//               config_ready: true,
//               file_path: nodeData.file_path,
//               message: "Salesforce configuration ready for execution",
//               object_name: nodeData.object_name,
//               query: nodeData.query,
//               success: true,
//               use_bulk_api: nodeData.use_bulk_api || false,
//             }
//             break
//           case "write-salesforce":
//             output = {
//               bulk_batch_size: nodeData.bulk_batch_size,
//               config_ready: true,
//               file_path: nodeData.file_path,
//               message: "Salesforce write configuration ready for execution",
//               object_name: nodeData.object_name,
//               success: true,
//               use_bulk_api: nodeData.use_bulk_api || false,
//               update_objects: nodeData.update_objects || false,
//             }
//             break
//           case "end":
//             output = { finalStatus: "completed", result: inputData }
//             break
//           default:
//             output = { ...inputData, [`${node.type}_processed`]: true }
//         }
//         updateNode(nodeId, { error: undefined, output, status: "success" })
//         addLog({
//           details: { output },
//           message: "Executed.",
//           nodeId,
//           nodeName: node.data?.label || node.type,
//           status: "success",
//         })
//         const outgoing = connections.filter((c) => c.sourceId === nodeId)
//         let lastOutput = output
//         for (const conn of outgoing) {
//           lastOutput = await executeNode(conn.targetId, output)
//         }
//         return lastOutput
//       } catch (error) {
//         const msg = error instanceof Error ? error.message : String(error)
//         updateNode(nodeId, { error: msg, output: undefined, status: "error" })
//         addLog({
//           details: { error },
//           message: `Error: ${msg}`,
//           nodeId,
//           nodeName: node.data?.label || node.type,
//           status: "error",
//         })
//         throw error
//       }
//     },
//     [nodes, connections, getNodeById, updateNode, addLog],
//   )

//   const runWorkflow = useCallback(async () => {
//     if (isRunning) {
//       console.warn("Workflow already running.")
//       return
//     }
//     setIsRunning(true)
//     addLog({
//       message: "Workflow started (client simulation).",
//       nodeId: "system",
//       nodeName: "System",
//       status: "info",
//     })
//     setNodes((prev) =>
//       prev.map((n) => ({
//         ...n,
//         error: undefined,
//         output: undefined,
//         status: "idle",
//       })),
//     )

//     const activeStartNodes = nodes.filter((n) => n.type === "start" && n.data?.active !== false)
//     if (activeStartNodes.length === 0) {
//       addLog({
//         message: "No active start nodes.",
//         nodeId: "system",
//         nodeName: "System",
//         status: "error",
//       })
//       setIsRunning(false)
//       return
//     }
//     try {
//       await Promise.all(activeStartNodes.map((startNode) => executeNode(startNode.id)))
//       addLog({
//         message: "Workflow finished (client simulation).",
//         nodeId: "system",
//         nodeName: "System",
//         status: "info",
//       })
//     } catch (error) {
//       const msg = error instanceof Error ? error.message : String(error)
//       addLog({
//         message: `Workflow failed (client simulation): ${msg}`,
//         nodeId: "system",
//         nodeName: "System",
//         status: "error",
//       })
//     } finally {
//       setIsRunning(false)
//     }
//   }, [nodes, executeNode, isRunning, addLog])

//   useEffect(() => {
//     const handleWorkflowSelected = async (event: Event) => {
//       const customEvent = event as CustomEvent
//       const eventData = customEvent.detail

//       if (eventData) {
//         console.log("[WorkflowContext] Workflow selected event received:", eventData)

//         const workflowName = eventData.name || "Untitled Workflow"
//         const workflowId = eventData.dag_id

//         console.log("[WorkflowContext] Setting workflow name from event:", workflowName)
//         console.log("[WorkflowContext] Setting workflow ID from event:", workflowId)

//         setCurrentWorkflowName(workflowName)
//         setCurrentWorkflowId(workflowId)

//         const workflowInfo = {
//           client_id: getCurrentClientId(),
//           created_at: eventData.created_at,
//           dag_id: workflowId,
//           name: workflowName,
//           schedule: eventData.schedule,
//         }
//         localStorage.setItem("currentWorkflow", JSON.stringify(workflowInfo))
//         console.log("[WorkflowContext] Updated localStorage with workflow info:", workflowInfo)

//         if (eventData.mongoData) {
//           console.log("Loading workflow from MongoDB data...")
//           const mongoData = eventData.mongoData

//           setCurrentWorkflowName(mongoData.metadata.name)
//           setCurrentWorkflowId(mongoData.metadata.dag_id)
//           setNodes(mongoData.nodes)
//           setConnections(mongoData.connections)
//           setSelectedNodeId(null)
//           setPropertiesModalNodeId(null)
//           setPendingConnection(null)
//           setDraggingNodeInfo(null)

//           const workflowData = {
//             connections: mongoData.connections,
//             metadata: mongoData.metadata,
//             nodes: mongoData.nodes,
//           }
//           localStorage.setItem("workflowData", JSON.stringify(workflowData))

//           addLog({
//             message: `Workflow "${mongoData.metadata.name}" loaded successfully from MongoDB with ${mongoData.nodes.length} nodes.`,
//             nodeId: "system",
//             nodeName: "System",
//             status: "info",
//           })
//         } else if (eventData.dag_sequence && eventData.dag_sequence.length > 0) {
//           await loadWorkflowFromDAG(eventData)
//         } else {
//           setNodes([])
//           setConnections([])
//           setSelectedNodeId(null)
//           setPropertiesModalNodeId(null)
//           setPendingConnection(null)
//           setDraggingNodeInfo(null)

//           addLog({
//             message: `Workflow "${workflowName}" selected. Canvas is ready for nodes.`,
//             nodeId: "system",
//             nodeName: "System",
//             status: "info",
//           })
//         }
//       }
//     }

//     window.addEventListener("workflowSelected", handleWorkflowSelected)
//     return () => {
//       window.removeEventListener("workflowSelected", handleWorkflowSelected)
//     }
//   }, [loadWorkflowFromDAG, addLog])

//   useEffect(() => {
//     try {
//       const savedData = localStorage.getItem("workflowData") // For nodes/connections
//       if (savedData) {
//         const parsedData: WorkflowExportData = JSON.parse(savedData)
//         if (
//           parsedData?.nodes &&
//           Array.isArray(parsedData.nodes) &&
//           parsedData.connections &&
//           Array.isArray(parsedData.connections)
//         ) {
//           loadWorkflow(parsedData)
//           // If "workflowData" has metadata, it might be an older source of truth or a fallback
//           if (parsedData.metadata) {
//             if (!currentWorkflowName && parsedData.metadata.name) setCurrentWorkflowName(parsedData.metadata.name)
//             if (!currentWorkflowId && parsedData.metadata.dag_id) setCurrentWorkflowId(parsedData.metadata.dag_id)
//           }
//         } else {
//           console.warn("Invalid workflow data in localStorage for 'workflowData'.")
//         }
//       }

//       // Prioritize "currentWorkflow" for id and name, as it's set by setCurrentWorkflowMeta
//       const currentWorkflowStr = localStorage.getItem("currentWorkflow")
//       if (currentWorkflowStr) {
//         const workflowInfo = JSON.parse(currentWorkflowStr)
//         // workflowInfo should contain { id, name }
//         if (workflowInfo.name) setCurrentWorkflowName(workflowInfo.name || "") // Ensure name is set
//         if (workflowInfo.id) setCurrentWorkflowId(workflowInfo.id || null) // Ensure id is set
//       }
//     } catch (error) {
//       console.error("Failed to load workflow from localStorage:", error)
//       localStorage.removeItem("workflowData")
//       localStorage.removeItem("currentWorkflow")
//     }
//   }, [loadWorkflow]) // currentWorkflowId and currentWorkflowName removed from deps to avoid loop with their setters

  
//     const saveAndRunWorkflow = useCallback(async () => {
//     console.log("WORKFLOW_CONTEXT: === Starting Save and Run Workflow Process ===");
//     addLog({nodeId: "system", nodeName: "System", status: "info", message: "Save and Run: Process initiated."});

//     const currentWorkflowIdValue = getCurrentWorkflowId(); // This is effectively currentWorkflowIdValue
//     const workflowNameForRun = currentWorkflowName; // Get the name from state

//     if (!currentWorkflowIdValue) {
//       toast({
//         title: "Error",
//         description: "No workflow DAG ID found. Please create or select a workflow first.",
//         variant: "destructive",
//       });
//       addLog({nodeId: "system", nodeName: "System", status: "error", message: "Save and Run Aborted: No DAG ID."});
//       return;
//     }

//     if (nodes.length === 0) {
//       toast({
//         title: "Error",
//         description: "Cannot run an empty workflow. Please add nodes first.",
//         variant: "destructive",
//       });
//       addLog({nodeId: "system", nodeName: "System", status: "error", message: "Save and Run Aborted: Empty workflow."});
//       return;
//     }

//     if (isRunning) {
//       toast({
//         title: "Warning",
//         description: "Workflow is already running. Please wait for it to complete.",
//         variant: "default", // Changed to default as it's a warning, not a hard error
//       });
//       addLog({nodeId: "system", nodeName: "System", status: "info", message: "Save and Run: Workflow already in progress."});
//       return;
//     }

//     setIsRunning(true);

//     try {
//       addLog({
//         nodeId: "system",
//         nodeName: "System",
//         status: "info",
//         message: "Save and Run: Phase 1: Saving workflow to MongoDB...",
//       });

//       try {
//         await saveWorkflowToBackend(); // Call your existing backend save function
//         console.log("WORKFLOW_CONTEXT: ✅ Phase 1 Complete: Workflow saved to MongoDB");
//         addLog({
//           nodeId: "system",
//           nodeName: "System",
//           status: "success",
//           message: "Save and Run: Phase 1 Complete: Workflow saved to MongoDB successfully.",
//         });
//       } catch (saveError: any) {
//         console.error("WORKFLOW_CONTEXT: ❌ Phase 1 Failed: MongoDB save error:", saveError);
//         addLog({
//           nodeId: "system",
//           nodeName: "System",
//           status: "error",
//           message: `Save and Run: Phase 1 Failed: Could not save to MongoDB - ${saveError?.message || "Unknown error"}`,
//         });
//         toast({
//           title: "Save Warning",
//           description: "Failed to save workflow to MongoDB, but attempting to continue with the run.",
//           variant: "default",
//         });
//       }

//       addLog({
//         nodeId: "system",
//         nodeName: "System",
//         status: "info",
//         message: "Save and Run: Phase 2: Creating configurations and updating DAG sequence...",
//       });

//       console.log("WORKFLOW_CONTEXT: 🔧 Phase 2: Starting config creation and DAG update via saveAndRunWorkflowUtil...");
//       // Assuming saveAndRunWorkflowUtil handles Airflow interactions and returns true on success of that part
//       const airflowUtilSuccess = await saveAndRunWorkflowUtil(nodes, connections, currentWorkflowIdValue);

//       if (airflowUtilSuccess) {
//         console.log("WORKFLOW_CONTEXT: ✅ Phase 2 Complete: Airflow util (config/DAG update/trigger) reported success.");
//         addLog({
//           nodeId: "system",
//           nodeName: "System",
//           status: "success",
//           message: "Save and Run: Phase 2 Complete: Configurations created and DAG sequence updated successfully.",
//         });

//         addLog({
//           nodeId: "system",
//           nodeName: "System",
//           status: "info",
//           message: "Save and Run: Phase 3: Logging execution to history and (assumed) Airflow DAG run triggered.",
//         });

//         // --- ADDING EXECUTION TO LOCALSTORAGE HISTORY ---
//         try {
//             console.log(`WORKFLOW_CONTEXT: Preparing to save execution history for DAG ID: ${currentWorkflowIdValue}, Name: ${workflowNameForRun}`);

//             const newExecutionRunForStorage: StoredExecutionRun = {
//                 id: `run-${currentWorkflowIdValue}-${Date.now()}`,
//                 dag_id: currentWorkflowIdValue,
//                 workflowId: currentWorkflowIdValue, 
//                 workflowName: workflowNameForRun || "Unnamed Workflow",
//                 status: "running", // Set to "running" as Airflow is now (presumably) handling it
//                 startTime: new Date().toISOString(),
//                 triggeredBy: "manual", // Assuming "Save and Run" is a manual trigger
//                 nodeResults: [], // Node results will be populated if/when Airflow reports back
//             };

//             const existingHistoryRaw = localStorage.getItem("allWorkflowExecutions");
//             let allHistoryEntries: StoredExecutionRun[] = [];
            
//             if (existingHistoryRaw) {
//                 try {
//                     const parsed = JSON.parse(existingHistoryRaw);
//                     if (Array.isArray(parsed)) {
//                         allHistoryEntries = parsed;
//                     } else {
//                         console.warn("WORKFLOW_CONTEXT: 'allWorkflowExecutions' in localStorage was not an array. Resetting.");
//                     }
//                 } catch (e) {
//                     console.error("WORKFLOW_CONTEXT: Error parsing existing 'allWorkflowExecutions'. Discarding old data.", e);
//                 }
//             }
            
//             allHistoryEntries.unshift(newExecutionRunForStorage); 

//             const MAX_HISTORY_ITEMS = 50; 
//             localStorage.setItem("allWorkflowExecutions", JSON.stringify(allHistoryEntries.slice(0, MAX_HISTORY_ITEMS)));
            
//             console.log(`WORKFLOW_CONTEXT: Execution run ${newExecutionRunForStorage.id} saved to localStorage history with status 'running'.`);
//             addLog({
//                 nodeId: "system",
//                 nodeName: "System",
//                 status: "info",
//                 message: `Execution run ${newExecutionRunForStorage.id} for ${newExecutionRunForStorage.workflowName} (status: running) logged to local history.`,
//             });

//         } catch (e: any) {
//             console.error("WORKFLOW_CONTEXT: Error saving execution run to localStorage history:", e);
//             addLog({
//                 nodeId: "system",
//                 nodeName: "System",
//                 status: "error",
//                 message: `Failed to save execution run to local history: ${e?.message || String(e)}`,
//             });
//         }
//         // --- END OF ADDING EXECUTION TO HISTORY ---

//         // This success message is about the triggering, not the actual Airflow completion
//         toast({
//           title: "Run Triggered",
//           description: "Workflow saved and run triggered. Check History or Airflow for execution status.",
//           variant: "default",
//         });
//       } else {
//         console.error("WORKFLOW_CONTEXT: ❌ Phase 2 Failed: saveAndRunWorkflowUtil (config/DAG update/trigger) failed.");
//         addLog({
//           nodeId: "system",
//           nodeName: "System",
//           status: "error",
//           message: "Save and Run: Phase 2 Failed: Could not create configurations, update DAG, or trigger run.",
//         });
//         toast({
//           title: "Trigger Error",
//           description: "Failed to create configurations, update DAG, or trigger run. Please check logs.",
//           variant: "destructive",
//         });
//       }
//     } catch (error: any) {
//       console.error("WORKFLOW_CONTEXT: ❌ Workflow run process encountered an unhandled error:", error);
//       addLog({
//         nodeId: "system",
//         nodeName: "System",
//         status: "error",
//         message: `Save and Run: Unhandled error: ${error?.message || "Unknown error occurred"}`,
//       });
//       toast({
//         title: "Workflow Error",
//         description: `Failed to run workflow: ${error?.message || "Unknown error"}`,
//         variant: "destructive",
//       });
//     } finally {
//       setIsRunning(false);
//       console.log("WORKFLOW_CONTEXT: === Save and Run Workflow Process Complete ===");
//       addLog({nodeId: "system", nodeName: "System", status: "info", message: "Save and Run: Process finished."});
//     }
//   }, [
//       nodes, 
//       connections, 
//       getCurrentWorkflowId, 
//       currentWorkflowName, // Added currentWorkflowName as a dependency
//       toast, 
//       saveWorkflowToBackend, // Added saveWorkflowToBackend
//       isRunning, 
//       addLog,
//       // saveAndRunWorkflowUtil is used inside, but it's an import, not state/prop, so not needed in deps array.
//     ]
//   );

//   const createNewWorkflow = useCallback(
//     (workflowName: string, airflowDagId: string) => {
//       console.log(`[WorkflowContext] Creating new workflow: ${workflowName} with Airflow DAG ID: ${airflowDagId}`)

//       setCurrentWorkflowName(workflowName)
//       setCurrentWorkflowId(airflowDagId)

//       setNodes([])
//       setConnections([])
//       setSelectedNodeId(null)
//       setPropertiesModalNodeId(null)
//       setPendingConnection(null)
//       setDraggingNodeInfo(null)
//       clearLogs()

//       const workflowData = {
//         client_id: getCurrentClientId(),
//         created_at: new Date().toISOString(),
//         dag_id: airflowDagId,
//         name: workflowName,
//       }
//       localStorage.setItem("currentWorkflow", JSON.stringify(workflowData))
//       console.log("[WorkflowContext] Updated localStorage with Airflow DAG ID:", workflowData)

//       localStorage.removeItem("workflowData")

//       addLog({
//         message: `New workflow "${workflowName}" created successfully with Airflow DAG ID: ${airflowDagId}. Canvas is ready for nodes.`,
//         nodeId: "system",
//         nodeName: "System",
//         status: "info",
//       })

//       toast({
//         description: `New workflow "${workflowName}" has been created with DAG ID: ${airflowDagId}. Start adding nodes to build your workflow.`,
//         title: "Workflow Created",
//       })
//     },
//     [clearLogs, addLog, toast],
//   )

//   const value: WorkflowContextType = {
//     nodes,
//     connections,
//     logs,
//     selectedNodeId,
//     pendingConnection,
//     propertiesModalNodeId,
//     dataMappingModalNodeId,
//     draggingNodeInfo,
//     currentWorkflowName,
//     currentWorkflowId,
//     setPendingConnection,
//     setPropertiesModalNodeId,
//     setDataMappingModalNodeId,
//     setDraggingNodeInfo,
//     addNode,
//     updateNode,
//     removeNode,
//     selectNode,
//     addConnection,
//     removeConnection,
//     getNodeById,
//     clearWorkflow,
//     runWorkflow,
//     saveWorkflow,
//     saveWorkflowToBackend,
//     saveAndRunWorkflow,
//     createNewWorkflow,
//     loadWorkflow,
//     loadWorkflowFromDAG,
//     getWorkflowExportData,
//     executeNode,
//     addLog,
//     clearLogs,
//     getCurrentWorkflowId,
//     syncWorkflowWithAirflow: undefined as any,
//     setCurrentWorkflowMeta,
//   }

//   return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
// }

// export function useWorkflow() {
//   const context = useContext(WorkflowContext)
//   if (context === undefined) {
//     throw new Error("useWorkflow must be used within a WorkflowProvider")
//   }
//   return context
// }



//workflow-context.tsx

"use client"
import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { NodeType, SchemaItem } from "@/services/interface"

import { useToast as useUIToast } from "@/components/ui/use-toast"
import { saveAndRunWorkflow as saveAndRunWorkflowUtil } from "@/services/workflow-utils"
import { getNodeSchema } from "@/components/workflow/mapping/nodeSchemas"

export type NodeStatus = "idle" | "running" | "success" | "error" | "configured"

export interface NodePosition {
  x: number
  y: number
}

export interface NodeSchema {
  label: string
  description: string
  inputSchema: SchemaItem[]
  outputSchema: SchemaItem[]
}

export interface FilterCondition {
  field: string
  operation: string
  value: any
}

export type ConditionItem = FilterCondition | FilterGroup

export interface FilterGroup {
  operator: "AND" | "OR" | string
  conditions: ConditionItem[]
}

export type OrderByClauseBackend = [string, "asc" | "desc"]

export type AggregationFunctionBackend = [string, string]

export interface AggregationConfigBackend {
  group_by: string[]
  aggregations: AggregationFunctionBackend[]
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
  filter?: any
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
  oldFilename?: string
  newFilename?: string
  active?: boolean
  provider?: string
  format?: string
  schema?: any
  order_by?: any
  aggregation?: any
  source_path?: string
  destination_path?: string
  connectionString?: string
  writeMode?: string
  table?: string
  user?: string
  password?: string
  batchSize?: string
  query?: string
  filePath?: string
  csvOptions?: Record<string, any>
  fields?: string[]
  where?: string
  limit?: number
  username?: string
  object_name?: string
  use_bulk_api?: boolean
  file_path?: string
  bulk_batch_size?: number
  config_id?: number
  // Inline-specific fields
  multiLine?: boolean
  header?: boolean | string
  inferSchema?: boolean | string
  delimiter?: string
  rowTag?: string
  rootTag?: string
  singleFile?: boolean
  compression?: string
  lineSep?: string
  wholetext?: boolean
  update_objects?: boolean
  input_path?: string
  pretty?: boolean
}

export interface WorkflowNode {
  id: string
  type: NodeType
  position: NodePosition
  data: WorkflowNodeData
  status?: NodeStatus
  output?: any
  error?: string
}

export interface NodeConnection {
  id: string
  sourceId: string
  targetId: string
  sourceHandle?: string
  targetHandle?: string
}

export interface LogEntry {
  id: string
  nodeId: string
  nodeName: string
  timestamp: Date
  status: NodeStatus | "info"
  message: string
  details?: any
}

export interface DAG {
  id: number
  name: string
  dag_id: string
  schedule: string | null
  active: boolean
  dag_sequence: Array<{
    id: string
    type: string
    config_id: number
    next: string[]
    config?: any
  }>
  active_dag_run: number | null
  created_at: string
  updated_at: string
}

interface WorkflowExportData {
  nodes: WorkflowNode[]
  connections: NodeConnection[]
  metadata?: {
    name: string
    dag_id: string
    exported_at?: string
    schedule?: string | null
    created_at?: string
  }
}

interface WorkflowContextType {
  nodes: WorkflowNode[]
  connections: NodeConnection[]
  logs: LogEntry[]
  selectedNodeId: string | null
  pendingConnection: { sourceId: string; sourceHandle?: string } | null
  propertiesModalNodeId: string | null
  dataMappingModalNodeId: string | null
  draggingNodeInfo: { id: string; offset: { x: number; y: number } } | null
  currentWorkflowName: string
  currentWorkflowId: string | null
  setPendingConnection: (connection: { sourceId: string; sourceHandle?: string } | null) => void
  setPropertiesModalNodeId: (nodeId: string | null) => void
  setDataMappingModalNodeId: (nodeId: string | null) => void
  setDraggingNodeInfo: (info: { id: string; offset: { x: number; y: number } } | null) => void
  addNode: (type: NodeType, position: NodePosition, initialData?: Partial<WorkflowNodeData>) => string
  updateNode: (
    id: string,
    updates: Partial<Omit<WorkflowNode, "data">> & {
      data?: Partial<WorkflowNodeData>
    },
  ) => void
  removeNode: (id: string) => void
  selectNode: (id: string | null) => void
  addConnection: (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => void
  removeConnection: (connectionId: string) => void
  clearWorkflow: () => void
  saveWorkflow: () => { nodes: WorkflowNode[]; connections: NodeConnection[] }
  saveWorkflowToBackend: () => Promise<void>
  getWorkflowExportData: () => WorkflowExportData
  // loadWorkflow: (data: WorkflowExportData) => void
  loadWorkflow: (data: {
    nodes: WorkflowNode[]
    connections: NodeConnection[]
  }) => void
  loadWorkflowFromDAG: (dagData: DAG) => Promise<void>
  runWorkflow: () => Promise<void>
  executeNode: (nodeId: string, inputData?: any) => Promise<any>
  addLog: (log: Omit<LogEntry, "id" | "timestamp">) => void
  clearLogs: () => void
  getNodeById: (id: string) => WorkflowNode | undefined
  getCurrentWorkflowId: () => string | null
  saveAndRunWorkflow: () => Promise<void>
  createNewWorkflow: (workflowName: string, dagId: string) => void
  syncWorkflowWithAirflow: (workflowName: string, frontendDagId: string) => Promise<string>
  setCurrentWorkflowMeta: (id: string, name: string) => void // Added as per fix
}

export interface StoredExecutionRun {
  id: string
  dag_id: string
  workflowId: string
  workflowName: string
  status: "running" | "completed" | "failed" | "cancelled"
  startTime: string
  endTime?: string
  duration?: number
  triggeredBy: "manual" | "schedule" | "api"
  nodeResults: Array<{
    nodeId: string
    nodeName: string
    status: "success" | "error" | "skipped"
    duration: number
    output?: any
    error?: string
  }>
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

export const getCurrentClientId = (): string | null => {
  try {
    const clientDataString = localStorage.getItem("currentClient")
    if (clientDataString) {
      const parsedClient = JSON.parse(clientDataString)
      if (parsedClient?.id && String(parsedClient.id).trim() !== "") {
        return String(parsedClient.id)
      }
    }
    const workflowDataString = localStorage.getItem("currentWorkflow")
    if (workflowDataString) {
      const parsedWorkflow = JSON.parse(workflowDataString)
      if (parsedWorkflow?.client_id && String(parsedWorkflow.client_id).trim() !== "") {
        return String(parsedWorkflow.client_id)
      }
    }
    console.warn("getCurrentClientId: No valid client_id found.")
  } catch (error) {
    console.error("getCurrentClientId: Error accessing localStorage:", error)
  }
  return null
}

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<NodeConnection[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Existing states, ensure types match if fix description used "" vs null
  const [currentWorkflowName, setCurrentWorkflowName] = useState<string>("")
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null)

  const [pendingConnection, setPendingConnection] = useState<{
    sourceId: string
    sourceHandle?: string
  } | null>(null)
  const [propertiesModalNodeId, setPropertiesModalNodeId] = useState<string | null>(null)
  const [dataMappingModalNodeId, setDataMappingModalNodeId] = useState<string | null>(null)
  const [draggingNodeInfo, setDraggingNodeInfo] = useState<{
    id: string
    offset: { x: number; y: number }
  } | null>(null)
  const { toast } = useUIToast()

  const addLog = useCallback((log: Omit<LogEntry, "id" | "timestamp">) => {
    const newLog: LogEntry = { ...log, id: uuidv4(), timestamp: new Date() }
    setLogs((prev) => [newLog, ...prev.slice(0, 99)])
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  function setCurrentWorkflowMeta(id: string, name: string) {
    setCurrentWorkflowId(id)
    setCurrentWorkflowName(name)
    localStorage.setItem("currentWorkflow", JSON.stringify({ id, name }))
  }

  const makePythonSafeId = (name: string): string => {
    let safeId = name.replace(/[^a-zA-Z0-9_]/g, "_")
    if (!/^[a-zA-Z_]/.test(safeId)) {
      safeId = "node_" + safeId
    }
    return safeId
  }

  const parseFileConversionConfig = useCallback((dagNode: any, basePosition: NodePosition) => {
    console.log("Parsing file_conversion config for node:", dagNode.id, dagNode.config)

    const config = dagNode.config
    if (!config) {
      console.warn("No config found for file_conversion node:", dagNode.id)
      return { nodes: [], connections: [], firstNodeId: null, lastNodeId: null }
    }

    const nodes: WorkflowNode[] = []
    const connections: NodeConnection[] = []
    let currentX = basePosition.x
    const y = basePosition.y

    // Handle inline input
    if (config.input && config.input.provider === "inline") {
      const inlineInputNodeId = `inline_input_${dagNode.config_id || uuidv4()}`
      console.log("Creating inline-input node:", inlineInputNodeId, config.input)

      const inlineInputNode: WorkflowNode = {
        id: inlineInputNodeId,
        type: "inline-input",
        position: { x: currentX, y },
        data: {
          label: "inline-input",
          displayName: "Inline Input",
          provider: "inline",
          format: config.input.format,
          content: config.input.content || "",
          options: config.input.options || {},
          schema: config.input.schema,
          active: true,
        },
        status: "configured",
      }
      nodes.push(inlineInputNode)
      currentX += 200
    } else if (config.input) {
      const readNodeId = `read_file_${dagNode.config_id || uuidv4()}`
      console.log("Creating read-file node:", readNodeId, config.input)

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
      }
      nodes.push(readNode)
      currentX += 200
    }

    let filterNodeId: string | null = null
    if (config.filter || config.order_by || config.aggregation) {
      filterNodeId = `filter_${dagNode.config_id || uuidv4()}`
      console.log("Creating filter node:", filterNodeId, {
        filter: config.filter,
        order_by: config.order_by,
        aggregation: config.aggregation,
      })

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
      }
      nodes.push(filterNode)
      currentX += 200
    }

    // Handle inline output or regular output
    if (config.output) {
      const isDatabase = config.output.type === "database" || (config.output.connectionString && config.output.table)
      const isInlineOutput = config.output.provider === "inline"

      let writeNodeId: string
      let nodeType: NodeType
      let displayName: string

      if (isInlineOutput) {
        writeNodeId = `inline_output_${dagNode.config_id}`
        nodeType = "inline-output"
        displayName = "Inline Output"
      } else if (isDatabase) {
        writeNodeId = `database_${dagNode.config_id}`
        nodeType = "database"
        displayName = "Database"
      } else {
        writeNodeId = `write_file_${dagNode.config_id}`
        nodeType = "write-file"
        displayName = "Write File"
      }

      console.log(`Creating ${nodeType} node:`, writeNodeId, config.output)

      const writeNode: WorkflowNode = {
        id: writeNodeId,
        type: nodeType,
        position: { x: currentX, y },
        data: {
          label: nodeType,
          displayName,
          path: config.output.path,
          provider: config.output.provider,
          format: config.output.format,
          mode: config.output.mode,
          options: config.output.options || {},
          content: config.output.content || "",
          ...(isDatabase && {
            connectionString: config.output.connectionString,
            table: config.output.table,
            writeMode: config.output.writeMode || "append",
          }),
          active: true,
        },
        status: "configured",
      }
      nodes.push(writeNode)
    }

    if (nodes.length > 1) {
      for (let i = 0; i < nodes.length - 1; i++) {
        const connectionId = uuidv4()
        console.log("Creating connection:", nodes[i].id, "->", nodes[i + 1].id)
        connections.push({
          id: connectionId,
          sourceId: nodes[i].id,
          targetId: nodes[i + 1].id,
        })
      }
    }

    console.log("Parsed file_conversion - nodes:", nodes.length, "connections:", connections.length)
    return { nodes, connections, firstNodeId: nodes[0]?.id, lastNodeId: nodes[nodes.length - 1]?.id }
  }, [])

  const parseCliOperatorConfig = useCallback((dagNode: any, basePosition: NodePosition) => {
    console.log("Parsing cli_operator config for node:", dagNode.id, dagNode.config)

    const config = dagNode.config
    if (!config || !config.operation) {
      console.warn("No config or operation found for cli_operator node:", dagNode.id)
      return { nodes: [], connections: [], firstNodeId: null, lastNodeId: null }
    }

    let nodeType: NodeType
    let displayName: string

    switch (config.operation) {
      case "copy":
        nodeType = "copy-file"
        displayName = "Copy File"
        break
      case "move":
        nodeType = "move-file"
        displayName = "Move File"
        break
      case "rename":
        nodeType = "rename-file"
        displayName = "Rename File"
        break
      case "delete":
        nodeType = "delete-file"
        displayName = "Delete File"
        break
      default:
        console.warn("Unknown CLI operation:", config.operation)
        nodeType = "copy-file"
        displayName = "File Operation"
    }

    const operationNodeId = `${config.operation}_${dagNode.config_id || uuidv4()}`
    console.log("Creating CLI operation node:", operationNodeId, nodeType, config)

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
    }

    return {
      nodes: [operationNode],
      connections: [],
      firstNodeId: operationNodeId,
      lastNodeId: operationNodeId,
    }
  }, [])

  const convertDAGToWorkflow = useCallback(
    (dagData: DAG) => {
      console.log("=== Converting DAG to workflow ===")
      console.log("DAG ID:", dagData.dag_id, "Sequence length:", dagData.dag_sequence.length)

      const newNodes: WorkflowNode[] = []
      const newConnections: NodeConnection[] = []
      const nodePositions = new Map<string, NodePosition>()
      const calculatedNodePositions = new Map<string, NodePosition>()

      const calculateNodePositions = (dagSequence: any[]) => {
        const levels: string[][] = []
        const visited = new Set<string>()
        const inDegree = new Map<string, number>()
        dagSequence.forEach((node) => {
          inDegree.set(node.id, 0)
        })
        dagSequence.forEach((node) => {
          node.next.forEach((nextId: string) => {
            inDegree.set(nextId, (inDegree.get(nextId) || 0) + 1)
          })
        })
        const queue: string[] = []
        dagSequence.forEach((node) => {
          if (inDegree.get(node.id) === 0) queue.push(node.id)
        })
        while (queue.length > 0) {
          const levelSize = queue.length
          const currentLevel: string[] = []
          for (let i = 0; i < levelSize; i++) {
            const nodeId = queue.shift()!
            currentLevel.push(nodeId)
            visited.add(nodeId)
            const node = dagSequence.find((n) => n.id === nodeId)
            if (node)
              node.next.forEach((nextId: string) => {
                const newInDegree = (inDegree.get(nextId) || 0) - 1
                inDegree.set(nextId, newInDegree)
                if (newInDegree === 0 && !visited.has(nextId)) queue.push(nextId)
              })
          }
          if (currentLevel.length > 0) levels.push(currentLevel)
        }
        levels.forEach((level, levelIndex) => {
          level.forEach((nodeId, nodeIndex) => {
            const x = levelIndex * 300 + 100
            const y = nodeIndex * 150 + 100
            nodePositions.set(nodeId, { x, y })
          })
        })
      }
      calculateNodePositions(dagData.dag_sequence)
      const dagNodeMapping = new Map<string, { firstNodeId: string; lastNodeId: string }>()
      dagData.dag_sequence.forEach((dagNode) => {
        console.log(
          `Processing DAG node: ID=${dagNode.id}, Type=${dagNode.type}, ConfigID=${dagNode.config_id}, HasConfig=${!!dagNode.config}`,
        )
        if (dagNode.config) {
          console.log("  Config content:", dagNode.config)
        }

        const defaultPosition = nodePositions.get(dagNode.id) || { x: 100, y: 100 }

        if (dagNode.type === "start" || dagNode.type === "end") {
          console.log("Creating start/end node:", dagNode.id, dagNode.type)
          const workflowNode: WorkflowNode = {
            id: dagNode.id,
            type: dagNode.type as NodeType,
            position: defaultPosition,
            data: {
              label: dagNode.type,
              displayName: dagNode.id,
              active: true,
            },
            status: "idle",
          }
          newNodes.push(workflowNode)
          dagNodeMapping.set(dagNode.id, {
            firstNodeId: dagNode.id,
            lastNodeId: dagNode.id,
          })
        } else if (dagNode.type === "file_conversion" && dagNode.config) {
          console.log("Processing file_conversion node:", dagNode.id)
          const parsed = parseFileConversionConfig(dagNode, defaultPosition)

          if (parsed.nodes.length > 0) {
            newNodes.push(...parsed.nodes)
            newConnections.push(...parsed.connections)
            if (parsed.firstNodeId && parsed.lastNodeId)
              dagNodeMapping.set(dagNode.id, {
                firstNodeId: parsed.firstNodeId,
                lastNodeId: parsed.lastNodeId,
              })
          } else {
            console.warn("Failed to parse file_conversion config for node:", dagNode.id)
            const fallbackNode: WorkflowNode = {
              id: dagNode.id,
              type: "start",
              position: defaultPosition,
              data: {
                label: "file_conversion",
                displayName: dagNode.id,
                active: true,
              },
              status: "idle",
            }
            newNodes.push(fallbackNode)
            dagNodeMapping.set(dagNode.id, { firstNodeId: fallbackNode.id, lastNodeId: fallbackNode.id })
          }
        } else if (dagNode.type === "cli_operator" && dagNode.config) {
          console.log("Processing cli_operator node:", dagNode.id)
          const parsed = parseCliOperatorConfig(dagNode, defaultPosition)

          if (parsed.nodes.length > 0) {
            newNodes.push(...parsed.nodes)
            newConnections.push(...parsed.connections)
            if (parsed.firstNodeId && parsed.lastNodeId)
              dagNodeMapping.set(dagNode.id, {
                firstNodeId: parsed.firstNodeId,
                lastNodeId: parsed.lastNodeId,
              })
          } else {
            console.warn("Failed to parse cli_operator config for node:", dagNode.id)
            const fallbackNode: WorkflowNode = {
              id: dagNode.id,
              type: "start",
              position: defaultPosition,
              data: {
                label: "cli_operator",
                displayName: dagNode.id,
                active: true,
              },
              status: "idle",
            }
            newNodes.push(fallbackNode)
            dagNodeMapping.set(dagNode.id, { firstNodeId: fallbackNode.id, lastNodeId: fallbackNode.id })
          }
        } else if (dagNode.type === "read_salesforce" && dagNode.config) {
          console.log("Processing read_salesforce node:", dagNode.id)
          const salesforceNode: WorkflowNode = {
            id: dagNode.id,
            type: "salesforce-cloud",
            position: defaultPosition,
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
              config_id: dagNode.config_id,
              active: true,
            },
            status: "configured",
          }
          newNodes.push(salesforceNode)
          dagNodeMapping.set(dagNode.id, { firstNodeId: dagNode.id, lastNodeId: dagNode.id })
        } else if (dagNode.type === "write_salesforce" && dagNode.config) {
          console.log("Processing write_salesforce node:", dagNode.id)
          const salesforceWriteNode: WorkflowNode = {
            id: dagNode.id,
            type: "write-salesforce",
            position: defaultPosition,
            data: {
              label: "write-salesforce",
              displayName: "Salesforce Write",
              object_name: dagNode.config.object_name,
              use_bulk_api: dagNode.config.use_bulk_api || false,
              file_path: dagNode.config.file_path,
              bulk_batch_size: dagNode.config.bulk_batch_size,
              update_objects: dagNode.config.update_objects || false,
              config_id: dagNode.config_id,
              active: true,
            },
            status: "configured",
          }
          newNodes.push(salesforceWriteNode)
          dagNodeMapping.set(dagNode.id, { firstNodeId: dagNode.id, lastNodeId: dagNode.id })
        } else {
          console.warn(
            "Unknown node type or missing config for DAG node:",
            dagNode.type,
            dagNode.id,
            "config:",
            !!dagNode.config,
          )

          let nodeType: NodeType = "start"
          switch (dagNode.type) {
            case "start":
              nodeType = "start"
              break
            case "end":
              nodeType = "end"
              break
            case "file_conversion":
              nodeType = "file"
              break
            case "cli_operator":
              nodeType = "copy-file"
              break
            case "read-file":
              nodeType = "read-file"
              break
            case "write-file":
              nodeType = "write-file"
              break
            case "database":
              nodeType = "database"
              break
            case "source":
              nodeType = "source"
              break
            case "salesforce-cloud":
              nodeType = "salesforce-cloud"
              break
            case "write-salesforce":
              nodeType = "write-salesforce"
              break
            case "inline-input":
              nodeType = "inline-input"
              break
            case "inline-output":
              nodeType = "inline-output"
              break
            default:
              nodeType = "start"
          }
          const workflowNode: WorkflowNode = {
            id: dagNode.id,
            type: nodeType,
            position: defaultPosition,
            data: {
              label: dagNode.type,
              displayName: dagNode.id,
              active: true,
              ...(dagNode.config ? dagNode.config : {}),
            },
            status: "idle",
          }
          newNodes.push(workflowNode)
          dagNodeMapping.set(dagNode.id, {
            firstNodeId: dagNode.id,
            lastNodeId: dagNode.id,
          })
        }
      })
      dagData.dag_sequence.forEach((dagNode) => {
        const sourceMapping = dagNodeMapping.get(dagNode.id)
        if (!sourceMapping) return
        dagNode.next.forEach((nextNodeId) => {
          const targetMapping = dagNodeMapping.get(nextNodeId)
          if (!targetMapping) return
          const connection: NodeConnection = {
            id: uuidv4(),
            sourceId: sourceMapping.lastNodeId,
            targetId: targetMapping.firstNodeId,
          }
          console.log("Creating DAG connection:", sourceMapping.lastNodeId, "->", targetMapping.firstNodeId)
          newConnections.push(connection)
        })
      })

      console.log("=== Conversion complete ===")
      console.log("Total nodes:", newNodes.length, "Total connections:", newConnections.length)
      console.log(
        "Created nodes:",
        newNodes.map((n) => ({
          id: n.id,
          type: n.type,
          label: n.data.label,
          displayName: n.data.displayName,
          config_id: n.data.config_id,
          position: n.position,
        })),
      )

      return { nodes: newNodes, connections: newConnections }
    },
    [parseFileConversionConfig, parseCliOperatorConfig],
  )

  const loadFileConversionConfigs = useCallback(
    async (clientId: string, dagId?: string) => {
      try {
        const { listFileConversionConfigs } = await import("@/services/file-conversion-service")
        const configs = await listFileConversionConfigs(Number(clientId))
        if (configs) {
          console.log("Loaded file conversion configs:", configs)

          const filteredConfigs = dagId ? configs.filter((config) => config.dag_id === dagId) : configs

          if (filteredConfigs.length > 0) {
            addLog({
              nodeId: "system",
              nodeName: "System",
              status: "info",
              message: `Loaded ${filteredConfigs.length} file conversion config(s).`,
            })
          }
          // You can enhance nodes with config data here if needed
          // For example, update nodes that have matching config_ids
          if (filteredConfigs.length > 0) {
            addLog({
              nodeId: "system",
              nodeName: "System",
              status: "info",
              message: `Loaded ${filteredConfigs.length} file conversion config(s).`,
            })
          }

          return filteredConfigs
        }
      } catch (error) {
        console.warn("Could not load file conversion configs:", error)
        return []
      }
      return []
    },
    [addLog],
  )

  const loadWorkflowFromDAG = useCallback(
    async (dagData: DAG) => {
      try {
        console.log("=== Loading workflow from DAG ===")
        console.log("DAG Data:", JSON.stringify(dagData, null, 2))

        console.log("[WorkflowContext] Setting workflow name:", dagData.name)
        console.log("[WorkflowContext] Setting workflow ID:", dagData.dag_id)

        setCurrentWorkflowName(dagData.name)
        setCurrentWorkflowId(dagData.dag_id)

        const workflowInfo = {
          name: dagData.name,
          dag_id: dagData.dag_id,
          schedule: dagData.schedule,
          created_at: dagData.created_at,
          client_id: getCurrentClientId(),
        }
        localStorage.setItem("currentWorkflow", JSON.stringify(workflowInfo))
        console.log("[WorkflowContext] Updated localStorage with workflow info:", workflowInfo)

        try {
          const { loadWorkflowFromMongoDB } = await import("@/services/workflow-position-service")
          const mongoWorkflow = await loadWorkflowFromMongoDB(dagData.dag_id)

          if (mongoWorkflow && mongoWorkflow.nodes && mongoWorkflow.connections && mongoWorkflow.metadata) {
            console.log("Loading workflow from MongoDB in loadWorkflowFromDAG...")

            setNodes(mongoWorkflow.nodes)
            setConnections(mongoWorkflow.connections)
            setSelectedNodeId(null)
            setPropertiesModalNodeId(null)
            setPendingConnection(null)
            setDraggingNodeInfo(null)

            const workflowData = {
              nodes: mongoWorkflow.nodes,
              connections: mongoWorkflow.connections,
              metadata: mongoWorkflow.metadata,
            }
            localStorage.setItem("workflowData", JSON.stringify(workflowData))

            addLog({
              nodeId: "system",
              nodeName: "System",
              status: "info",
              message: `Workflow "${mongoWorkflow.metadata.name}" loaded successfully from MongoDB with ${mongoWorkflow.nodes.length} nodes.`,
            })
            return
          }
        } catch (mongoError) {
          console.warn("Could not load from MongoDB, falling back to DAG conversion:", mongoError)
        }

        const { nodes: newNodes, connections: newConnections } = convertDAGToWorkflow(dagData)

        setNodes(newNodes)
        setConnections(newConnections)
        setSelectedNodeId(null)
        setPropertiesModalNodeId(null)
        setPendingConnection(null)
        setDraggingNodeInfo(null)

        const workflowData = {
          nodes: newNodes,
          connections: newConnections,
          metadata: {
            name: dagData.name,
            dag_id: dagData.dag_id,
            schedule: dagData.schedule,
            created_at: dagData.created_at,
          },
        }
        localStorage.setItem("workflowData", JSON.stringify(workflowData))

        try {
          const clientId = getCurrentClientId()
          if (clientId) {
            await loadFileConversionConfigs(clientId, dagData.dag_id)
          }
        } catch (configError) {
          console.warn("Could not load file conversion configs:", configError)
        }

        addLog({
          nodeId: "system",
          nodeName: "System",
          status: "info",
          message: `Workflow "${dagData.name}" loaded successfully with ${newNodes.length} nodes.${
            dagData.schedule ? ` Schedule: ${dagData.schedule}` : " (Manual execution)"
          }`,
        })
      } catch (error) {
        console.error("Error loading workflow from DAG:", error)
        toast({
          title: "Error",
          description: "Failed to load workflow from DAG data.",
          variant: "destructive",
        })
      }
    },
    [convertDAGToWorkflow, toast, loadFileConversionConfigs, addLog],
  )

  const addNode = useCallback((type: NodeType, position: NodePosition, initialData?: Partial<WorkflowNodeData>) => {
    const displayName = initialData?.displayName || `${type}_${Math.floor(Math.random() * 10000)}`
    const nodeId = makePythonSafeId(displayName)
    const newNode: WorkflowNode = {
      id: nodeId,
      type,
      position,
      data: { label: type, displayName, active: true, ...initialData },
      status: "idle",
    }
    setNodes((prev) => [...prev, newNode])
    return newNode.id
  }, [])

  const updateNode = useCallback(
    (
      id: string,
      updates: Partial<Omit<WorkflowNode, "data">> & {
        data?: Partial<WorkflowNodeData>
      },
    ) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === id ? { ...node, ...updates, data: { ...node.data, ...updates.data } } : node,
        ),
      )
    },
    [],
  )

  const removeNode = useCallback(
    (id: string) => {
      setNodes((prev) => prev.filter((node) => node.id !== id))
      setConnections((prev) => prev.filter((conn) => conn.sourceId !== id && conn.targetId !== id))
      if (selectedNodeId === id) setSelectedNodeId(null)
      if (propertiesModalNodeId === id) setPropertiesModalNodeId(null)
    },
    [selectedNodeId, propertiesModalNodeId],
  )

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id)
  }, [])

  const addConnection = useCallback(
    (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => {
      if (sourceId === targetId) return
      const exists = connections.some(
        (conn) =>
          conn.sourceId === sourceId &&
          conn.targetId === targetId &&
          conn.sourceHandle === sourceHandle &&
          conn.targetHandle === targetHandle,
      )
      if (exists) return
      const isCircular = connections.some((conn) => conn.sourceId === targetId && conn.targetId === sourceId)
      if (isCircular) {
        console.warn("Preventing direct circular connection")
        return
      }

      // Get source and target nodes for upstream mapping propagation
      const sourceNode = getNodeById(sourceId)
      const targetNode = getNodeById(targetId)

      if (sourceNode && targetNode) {
        // Get schemas for both nodes
        const sourceSchema = getNodeSchema(sourceNode.type)
        const targetSchema = getNodeSchema(targetNode.type)

        if (sourceSchema && targetSchema) {
          // Auto-propagate file paths and other compatible fields
          const updatedTargetData = { ...targetNode.data }

          // Check for filePath propagation
          const sourceHasFilePath = sourceSchema.outputSchema.some(
            (output) => output.name === "filePath" || output.name.includes("Path") || output.name.includes("path"),
          )
          const targetNeedsFilePath = targetSchema.inputSchema.some(
            (input) => input.name === "filePath" || input.name.includes("Path") || input.name.includes("path"),
          )

          if (sourceHasFilePath && targetNeedsFilePath && sourceNode.data.filePath) {
            updatedTargetData.filePath = sourceNode.data.filePath
          }

          // Propagate other compatible fields
          sourceSchema.outputSchema.forEach((sourceOutput) => {
            const compatibleInput = targetSchema.inputSchema.find(
              (targetInput) => targetInput.name === sourceOutput.name && targetInput.datatype === sourceOutput.datatype,
            )

            if (compatibleInput && sourceNode.data[sourceOutput.name] !== undefined) {
              updatedTargetData[compatibleInput.name] = sourceNode.data[sourceOutput.name]
            }
          })

          // Update target node with propagated data
          if (Object.keys(updatedTargetData).length > Object.keys(targetNode.data).length) {
            updateNode(targetId, { data: updatedTargetData })

            addLog({
              nodeId: targetId,
              nodeName: targetNode.data?.displayName || targetNode.type,
              status: "info",
              message: `Auto-propagated values from ${sourceNode.data?.displayName || sourceNode.type}`,
            })
          }
        }
      }

      const newConnection: NodeConnection = {
        id: uuidv4(),
        sourceId,
        targetId,
        sourceHandle,
        targetHandle,
      }
      setConnections((prev) => [...prev, newConnection])
    },
    [connections, updateNode, addLog],
  )

  const removeConnection = useCallback((connectionId: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== connectionId))
  }, [])

  const clearWorkflow = useCallback(() => {
    setNodes([])
    setConnections([])
    setSelectedNodeId(null)
    setPropertiesModalNodeId(null)
    setPendingConnection(null)
    setDraggingNodeInfo(null)
    setCurrentWorkflowName("")
    setCurrentWorkflowId(null)
    clearLogs()
    localStorage.removeItem("workflowData")
    localStorage.removeItem("currentWorkflow")
    toast({
      description: "The current workflow has been cleared from the canvas.",
      title: "Workflow Cleared",
    })
  }, [clearLogs, toast])

  const getCurrentWorkflowId = useCallback(() => {
    console.log("[WorkflowContext] getCurrentWorkflowId called")
    console.log("[WorkflowContext] currentWorkflowId state:", currentWorkflowId)

    if (currentWorkflowId) {
      console.log("[WorkflowContext] Returning currentWorkflowId from state:", currentWorkflowId)
      return currentWorkflowId
    }

    try {
      const workflowData = localStorage.getItem("currentWorkflow")
      console.log("[WorkflowContext] localStorage currentWorkflow:", workflowData)

      if (workflowData) {
        const parsed = JSON.parse(workflowData)
        console.log("[WorkflowContext] Parsed workflow data:", parsed)

        if (parsed?.id && String(parsed.id).trim() !== "") {
          const id = String(parsed.id)
          console.log("[WorkflowContext] Returning id from localStorage:", id)
          return id
        }
      }
    } catch (error) {
      console.error("[WorkflowContext] Error getting current workflow ID from localStorage:", error)
    }

    console.warn("[WorkflowContext] No workflow ID found")
    return null
  }, [currentWorkflowId])

  const saveWorkflowToBackend = useCallback(async () => {
    console.log("[WorkflowContext] saveWorkflowToBackend called")

    const workflowId = getCurrentWorkflowId()
    console.log("[WorkflowContext] Current workflow ID:", workflowId)
    console.log("[WorkflowContext] Current workflow name:", currentWorkflowName)
    console.log("[WorkflowContext] Nodes count:", nodes.length)
    console.log("[WorkflowContext] Connections count:", connections.length)

    if (!workflowId) {
      console.error("[WorkflowContext] No workflow ID found")
      toast({
        description: "No active workflow. Please create or select one first to save to backend.",
        title: "Error",
        variant: "destructive",
      })
      return
    }

    if (nodes.length === 0) {
      console.error("[WorkflowContext] No nodes to save")
      toast({
        description: "Cannot save an empty workflow. Please add nodes first.",
        title: "Error",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      console.log(`[WorkflowContext] Starting save process for workflow ${workflowId}...`)

      const { saveWorkflowToMongoDB } = await import("@/services/workflow-position-service")

      const metadata = {
        name: currentWorkflowName || "Untitled Workflow",
        dag_id: workflowId,
        exported_at: new Date().toISOString(),
        schedule: null,
        created_at: new Date().toISOString(),
      }

      console.log(`[WorkflowContext] Metadata to save:`, metadata)
      console.log(
        `[WorkflowContext] Nodes to save:`,
        nodes.map((n) => ({ id: n.id, type: n.type, position: n.position })),
      )
      console.log(
        `[WorkflowContext] Connections to save:`,
        connections.map((c) => ({ id: c.id, sourceId: c.sourceId, targetId: c.targetId })),
      )

      await saveWorkflowToMongoDB(nodes, connections, metadata)

      const workflowData = {
        nodes,
        connections,
        metadata,
      }
      localStorage.setItem("workflowData", JSON.stringify(workflowData))
      console.log("[WorkflowContext] Workflow saved to localStorage and MongoDB successfully")

      addLog({
        message: `Workflow saved successfully to MongoDB with ${nodes.length} nodes and ${connections.length} connections.`,
        nodeId: "system",
        nodeName: "System",
        status: "info",
      })

      toast({
        description: "Workflow saved successfully to MongoDB.",
        title: "Success",
      })
    } catch (error) {
      console.error("[WorkflowContext] Error saving workflow to MongoDB:", error)
      addLog({
        message: `Failed to save workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
        nodeId: "system",
        nodeName: "System",
        status: "error",
      })
      toast({
        description: error instanceof Error ? error.message : "Failed to save workflow to MongoDB.",
        title: "Error",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [nodes, connections, toast, getCurrentWorkflowId, currentWorkflowName, addLog])

  const saveWorkflow = useCallback(() => {
    const workflowData: WorkflowExportData = {
      nodes,
      connections,
      metadata: {
        name: currentWorkflowName,
        dag_id: currentWorkflowId || uuidv4(),
      },
    }
    const currentWorkflow = {
      nodes,
      connections,
      metadata: {
        name: currentWorkflowName,
        dag_id: currentWorkflowId,
        created_at: new Date().toISOString(),
      },
    }
    try {
      localStorage.setItem("workflowData", JSON.stringify(currentWorkflow))
      console.log("Workflow snapshot saved to localStorage.")
    } catch (error) {
      console.error("Failed to save workflow snapshot:", error)
    }
    return workflowData
  }, [nodes, connections, currentWorkflowName, currentWorkflowId])

  const getWorkflowExportData = useCallback(() => {
    return {
      nodes,
      connections,
      metadata: {
        name: currentWorkflowName || "Untitled Workflow",
        dag_id: currentWorkflowId || uuidv4(),
        exported_at: new Date().toISOString(),
      },
    }
  }, [nodes, connections, currentWorkflowName, currentWorkflowId])

  const loadWorkflow = useCallback((data: { nodes: WorkflowNode[]; connections: NodeConnection[] }) => {
    if (data?.nodes && Array.isArray(data.nodes) && data.connections && Array.isArray(data.connections)) {
      setNodes(data.nodes)
      setConnections(data.connections)
      setSelectedNodeId(null)
      setPropertiesModalNodeId(null)
      setPendingConnection(null)
      setDraggingNodeInfo(null)
      console.log("Workflow loaded from data.")
    } else {
      console.error("Invalid data format for loading workflow.")
    }
  }, [])

  const getNodeById = useCallback((id: string) => nodes.find((node) => node.id === id), [nodes])

  const executeNode = useCallback(
    async (nodeId: string, inputData?: any): Promise<any> => {
      const node = getNodeById(nodeId)
      if (!node) {
        console.warn(`Node ${nodeId} not found.`)
        return null
      }
      if (node.data?.active === false) {
        addLog({
          message: "Skipping inactive node.",
          nodeId,
          nodeName: `${node.data?.label || node.type} (inactive)`,
          status: "info",
        })
        const outgoing = connections.filter((c) => c.sourceId === nodeId)
        let lastOutput = inputData
        for (const conn of outgoing) {
          lastOutput = await executeNode(conn.targetId, inputData)
        }
        return lastOutput
      }
      updateNode(nodeId, { status: "running" })
      addLog({
        details: { input: inputData },
        message: "Executing...",
        nodeId,
        nodeName: node.data?.label || node.type,
        status: "running",
      })
      try {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 50))
        let output: any
        const nodeData = node.data || {}
        switch (node.type) {
          case "start":
            output = { trigger: "manual", ...(inputData || {}) }
            break
          case "inline-input":
            output = {
              processedData: nodeData.content ? JSON.parse(nodeData.content) : {},
              schema: nodeData.schema,
              format: nodeData.format,
              recordCount: Array.isArray(nodeData.content) ? nodeData.content.length : 1,
            }
            break
          case "inline-output":
            output = {
              filePath: nodeData.path,
              success: true,
              recordCount: inputData?.recordCount || 0,
              fileSize: nodeData.content ? nodeData.content.length : 0,
            }
            break
          case "read-file":
            output = { content: `Content of ${nodeData.path}` }
            break
          case "write-file":
            output = { filePath: nodeData.path, written: true }
            break
          case "source":
            output = {
              data: [{ id: 1, name: "Sample DB Data" }],
              source: nodeData.table || nodeData.query,
            }
            break
          case "database":
            output = { success: true, table: nodeData.table }
            break
          case "salesforce-cloud":
            output = {
              config_ready: true,
              file_path: nodeData.file_path,
              message: "Salesforce configuration ready for execution",
              object_name: nodeData.object_name,
              query: nodeData.query,
              success: true,
              use_bulk_api: nodeData.use_bulk_api || false,
            }
            break
          case "write-salesforce":
            output = {
              bulk_batch_size: nodeData.bulk_batch_size,
              config_ready: true,
              file_path: nodeData.file_path,
              message: "Salesforce write configuration ready for execution",
              object_name: nodeData.object_name,
              success: true,
              use_bulk_api: nodeData.use_bulk_api || false,
              update_objects: nodeData.update_objects || false,
            }
            break
          case "end":
            output = { finalStatus: "completed", result: inputData }
            break
          default:
            output = { ...inputData, [`${node.type}_processed`]: true }
        }
        updateNode(nodeId, { error: undefined, output, status: "success" })
        addLog({
          details: { output },
          message: "Executed.",
          nodeId,
          nodeName: node.data?.label || node.type,
          status: "success",
        })
        const outgoing = connections.filter((c) => c.sourceId === nodeId)
        let lastOutput = output
        for (const conn of outgoing) {
          lastOutput = await executeNode(conn.targetId, output)
        }
        return lastOutput
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        updateNode(nodeId, { error: msg, output: undefined, status: "error" })
        addLog({
          details: { error },
          message: `Error: ${msg}`,
          nodeId,
          nodeName: node.data?.label || node.type,
          status: "error",
        })
        throw error
      }
    },
    [nodes, connections, getNodeById, updateNode, addLog],
  )

  const runWorkflow = useCallback(async () => {
    if (isRunning) {
      console.warn("Workflow already running.")
      return
    }
    setIsRunning(true)
    addLog({
      message: "Workflow started (client simulation).",
      nodeId: "system",
      nodeName: "System",
      status: "info",
    })
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        error: undefined,
        output: undefined,
        status: "idle",
      })),
    )

    const activeStartNodes = nodes.filter((n) => n.type === "start" && n.data?.active !== false)
    if (activeStartNodes.length === 0) {
      addLog({
        message: "No active start nodes.",
        nodeId: "system",
        nodeName: "System",
        status: "error",
      })
      setIsRunning(false)
      return
    }
    try {
      await Promise.all(activeStartNodes.map((startNode) => executeNode(startNode.id)))
      addLog({
        message: "Workflow finished (client simulation).",
        nodeId: "system",
        nodeName: "System",
        status: "info",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      addLog({
        message: `Workflow failed (client simulation): ${msg}`,
        nodeId: "system",
        nodeName: "System",
        status: "error",
      })
    } finally {
      setIsRunning(false)
    }
  }, [nodes, executeNode, isRunning, addLog])

  useEffect(() => {
    const handleWorkflowSelected = async (event: Event) => {
      const customEvent = event as CustomEvent
      const eventData = customEvent.detail

      if (eventData) {
        console.log("[WorkflowContext] Workflow selected event received:", eventData)

        const workflowName = eventData.name || "Untitled Workflow"
        const workflowId = eventData.dag_id

        console.log("[WorkflowContext] Setting workflow name from event:", workflowName)
        console.log("[WorkflowContext] Setting workflow ID from event:", workflowId)

        setCurrentWorkflowName(workflowName)
        setCurrentWorkflowId(workflowId)

        const workflowInfo = {
          client_id: getCurrentClientId(),
          created_at: eventData.created_at,
          dag_id: workflowId,
          name: workflowName,
          schedule: eventData.schedule,
        }
        localStorage.setItem("currentWorkflow", JSON.stringify(workflowInfo))
        console.log("[WorkflowContext] Updated localStorage with workflow info:", workflowInfo)

        if (eventData.mongoData) {
          console.log("Loading workflow from MongoDB data...")
          const mongoData = eventData.mongoData

          setCurrentWorkflowName(mongoData.metadata.name)
          setCurrentWorkflowId(mongoData.metadata.dag_id)
          setNodes(mongoData.nodes)
          setConnections(mongoData.connections)
          setSelectedNodeId(null)
          setPropertiesModalNodeId(null)
          setPendingConnection(null)
          setDraggingNodeInfo(null)

          const workflowData = {
            connections: mongoData.connections,
            metadata: mongoData.metadata,
            nodes: mongoData.nodes,
          }
          localStorage.setItem("workflowData", JSON.stringify(workflowData))

          addLog({
            message: `Workflow "${mongoData.metadata.name}" loaded successfully from MongoDB with ${mongoData.nodes.length} nodes.`,
            nodeId: "system",
            nodeName: "System",
            status: "info",
          })
        } else if (eventData.dag_sequence && eventData.dag_sequence.length > 0) {
          await loadWorkflowFromDAG(eventData)
        } else {
          setNodes([])
          setConnections([])
          setSelectedNodeId(null)
          setPropertiesModalNodeId(null)
          setPendingConnection(null)
          setDraggingNodeInfo(null)

          addLog({
            message: `Workflow "${workflowName}" selected. Canvas is ready for nodes.`,
            nodeId: "system",
            nodeName: "System",
            status: "info",
          })
        }
      }
    }

    window.addEventListener("workflowSelected", handleWorkflowSelected)
    return () => {
      window.removeEventListener("workflowSelected", handleWorkflowSelected)
    }
  }, [loadWorkflowFromDAG, addLog])

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("workflowData") // For nodes/connections
      if (savedData) {
        const parsedData: WorkflowExportData = JSON.parse(savedData)
        if (
          parsedData?.nodes &&
          Array.isArray(parsedData.nodes) &&
          parsedData.connections &&
          Array.isArray(parsedData.connections)
        ) {
          loadWorkflow(parsedData)
          // If "workflowData" has metadata, it might be an older source of truth or a fallback
          if (parsedData.metadata) {
            if (!currentWorkflowName && parsedData.metadata.name) setCurrentWorkflowName(parsedData.metadata.name)
            if (!currentWorkflowId && parsedData.metadata.dag_id) setCurrentWorkflowId(parsedData.metadata.dag_id)
          }
        } else {
          console.warn("Invalid workflow data in localStorage for 'workflowData'.")
        }
      }

      // Prioritize "currentWorkflow" for id and name, as it's set by setCurrentWorkflowMeta
      const currentWorkflowStr = localStorage.getItem("currentWorkflow")
      if (currentWorkflowStr) {
        const workflowInfo = JSON.parse(currentWorkflowStr)
        // workflowInfo should contain { id, name }
        if (workflowInfo.name) setCurrentWorkflowName(workflowInfo.name || "") // Ensure name is set
        if (workflowInfo.id) setCurrentWorkflowId(workflowInfo.id || null) // Ensure id is set
      }
    } catch (error) {
      console.error("Failed to load workflow from localStorage:", error)
      localStorage.removeItem("workflowData")
      localStorage.removeItem("currentWorkflow")
    }
  }, [loadWorkflow]) // currentWorkflowId and currentWorkflowName removed from deps to avoid loop with their setters

  const saveAndRunWorkflow = useCallback(async () => {
    console.log("WORKFLOW_CONTEXT: === Starting Save and Run Workflow Process ===")
    addLog({ nodeId: "system", nodeName: "System", status: "info", message: "Save and Run: Process initiated." })

    const currentWorkflowIdValue = getCurrentWorkflowId() // This is effectively currentWorkflowIdValue
    const workflowNameForRun = currentWorkflowName // Get the name from state

    if (!currentWorkflowIdValue) {
      toast({
        title: "Error",
        description: "No workflow DAG ID found. Please create or select a workflow first.",
        variant: "destructive",
      })
      addLog({ nodeId: "system", nodeName: "System", status: "error", message: "Save and Run Aborted: No DAG ID." })
      return
    }

    if (nodes.length === 0) {
      toast({
        title: "Error",
        description: "Cannot run an empty workflow. Please add nodes first.",
        variant: "destructive",
      })
      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "error",
        message: "Save and Run Aborted: Empty workflow.",
      })
      return
    }

    if (isRunning) {
      toast({
        title: "Warning",
        description: "Workflow is already running. Please wait for it to complete.",
        variant: "default", // Changed to default as it's a warning, not a hard error
      })
      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "info",
        message: "Save and Run: Workflow already in progress.",
      })
      return
    }

    setIsRunning(true)

    try {
      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "info",
        message: "Save and Run: Phase 1: Saving workflow to MongoDB...",
      })

      try {
        await saveWorkflowToBackend() // Call your existing backend save function
        console.log("WORKFLOW_CONTEXT: ✅ Phase 1 Complete: Workflow saved to MongoDB")
        addLog({
          nodeId: "system",
          nodeName: "System",
          status: "success",
          message: "Save and Run: Phase 1 Complete: Workflow saved to MongoDB successfully.",
        })
      } catch (saveError: any) {
        console.error("WORKFLOW_CONTEXT: ❌ Phase 1 Failed: MongoDB save error:", saveError)
        addLog({
          nodeId: "system",
          nodeName: "System",
          status: "error",
          message: `Save and Run: Phase 1 Failed: Could not save to MongoDB - ${saveError?.message || "Unknown error"}`,
        })
        toast({
          title: "Save Warning",
          description: "Failed to save workflow to MongoDB, but attempting to continue with the run.",
          variant: "default",
        })
      }

      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "info",
        message: "Save and Run: Phase 2: Creating configurations and updating DAG sequence...",
      })

      console.log("WORKFLOW_CONTEXT: 🔧 Phase 2: Starting config creation and DAG update via saveAndRunWorkflowUtil...")
      // Assuming saveAndRunWorkflowUtil handles Airflow interactions and returns true on success of that part
      const airflowUtilSuccess = await saveAndRunWorkflowUtil(nodes, connections, currentWorkflowIdValue)

      if (airflowUtilSuccess) {
        console.log("WORKFLOW_CONTEXT: ✅ Phase 2 Complete: Airflow util (config/DAG update/trigger) reported success.")
        addLog({
          nodeId: "system",
          nodeName: "System",
          status: "success",
          message: "Save and Run: Phase 2 Complete: Configurations created and DAG sequence updated successfully.",
        })

        addLog({
          nodeId: "system",
          nodeName: "System",
          status: "info",
          message: "Save and Run: Phase 3: Logging execution to history and (assumed) Airflow DAG run triggered.",
        })

        // --- ADDING EXECUTION TO LOCALSTORAGE HISTORY ---
        try {
          console.log(
            `WORKFLOW_CONTEXT: Preparing to save execution history for DAG ID: ${currentWorkflowIdValue}, Name: ${workflowNameForRun}`,
          )

          const newExecutionRunForStorage: StoredExecutionRun = {
            id: `run-${currentWorkflowIdValue}-${Date.now()}`,
            dag_id: currentWorkflowIdValue,
            workflowId: currentWorkflowIdValue,
            workflowName: workflowNameForRun || "Unnamed Workflow",
            status: "running", // Set to "running" as Airflow is now (presumably) handling it
            startTime: new Date().toISOString(),
            triggeredBy: "manual", // Assuming "Save and Run" is a manual trigger
            nodeResults: [], // Node results will be populated if/when Airflow reports back
          }

          const existingHistoryRaw = localStorage.getItem("allWorkflowExecutions")
          let allHistoryEntries: StoredExecutionRun[] = []

          if (existingHistoryRaw) {
            try {
              const parsed = JSON.parse(existingHistoryRaw)
              if (Array.isArray(parsed)) {
                allHistoryEntries = parsed
              } else {
                console.warn("WORKFLOW_CONTEXT: 'allWorkflowExecutions' in localStorage was not an array. Resetting.")
              }
            } catch (e) {
              console.error("WORKFLOW_CONTEXT: Error parsing existing 'allWorkflowExecutions'. Discarding old data.", e)
            }
          }

          allHistoryEntries.unshift(newExecutionRunForStorage)

          const MAX_HISTORY_ITEMS = 50
          localStorage.setItem("allWorkflowExecutions", JSON.stringify(allHistoryEntries.slice(0, MAX_HISTORY_ITEMS)))

          console.log(
            `WORKFLOW_CONTEXT: Execution run ${newExecutionRunForStorage.id} saved to localStorage history with status 'running'.`,
          )
          addLog({
            nodeId: "system",
            nodeName: "System",
            status: "info",
            message: `Execution run ${newExecutionRunForStorage.id} for ${newExecutionRunForStorage.workflowName} (status: running) logged to local history.`,
          })
        } catch (e: any) {
          console.error("WORKFLOW_CONTEXT: Error saving execution run to localStorage history:", e)
          addLog({
            nodeId: "system",
            nodeName: "System",
            status: "error",
            message: `Failed to save execution run to local history: ${e?.message || String(e)}`,
          })
        }
        // --- END OF ADDING EXECUTION TO HISTORY ---

        // This success message is about the triggering, not the actual Airflow completion
        toast({
          title: "Run Triggered",
          description: "Workflow saved and run triggered. Check History or Airflow for execution status.",
          variant: "default",
        })
      } else {
        console.error("WORKFLOW_CONTEXT: ❌ Phase 2 Failed: saveAndRunWorkflowUtil (config/DAG update/trigger) failed.")
        addLog({
          nodeId: "system",
          nodeName: "System",
          status: "error",
          message: "Save and Run: Phase 2 Failed: Could not create configurations, update DAG, or trigger run.",
        })
        toast({
          title: "Trigger Error",
          description: "Failed to create configurations, update DAG, or trigger run. Please check logs.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("WORKFLOW_CONTEXT: ❌ Workflow run process encountered an unhandled error:", error)
      addLog({
        nodeId: "system",
        nodeName: "System",
        status: "error",
        message: `Save and Run: Unhandled error: ${error?.message || "Unknown error occurred"}`,
      })
      toast({
        title: "Workflow Error",
        description: `Failed to run workflow: ${error?.message || "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
      console.log("WORKFLOW_CONTEXT: === Save and Run Workflow Process Complete ===")
      addLog({ nodeId: "system", nodeName: "System", status: "info", message: "Save and Run: Process finished." })
    }
  }, [
    nodes,
    connections,
    getCurrentWorkflowId,
    currentWorkflowName, // Added currentWorkflowName as a dependency
    toast,
    saveWorkflowToBackend, // Added saveWorkflowToBackend
    isRunning,
    addLog,
    // saveAndRunWorkflowUtil is used inside, but it's an import, not state/prop, so not needed in deps array.
  ])

  const createNewWorkflow = useCallback(
    (workflowName: string, airflowDagId: string) => {
      console.log(`[WorkflowContext] Creating new workflow: ${workflowName} with Airflow DAG ID: ${airflowDagId}`)

      setCurrentWorkflowName(workflowName)
      setCurrentWorkflowId(airflowDagId)

      setNodes([])
      setConnections([])
      setSelectedNodeId(null)
      setPropertiesModalNodeId(null)
      setPendingConnection(null)
      setDraggingNodeInfo(null)
      clearLogs()

      const workflowData = {
        client_id: getCurrentClientId(),
        created_at: new Date().toISOString(),
        dag_id: airflowDagId,
        name: workflowName,
      }
      localStorage.setItem("currentWorkflow", JSON.stringify(workflowData))
      console.log("[WorkflowContext] Updated localStorage with Airflow DAG ID:", workflowData)

      localStorage.removeItem("workflowData")

      addLog({
        message: `New workflow "${workflowName}" created successfully with Airflow DAG ID: ${airflowDagId}. Canvas is ready for nodes.`,
        nodeId: "system",
        nodeName: "System",
        status: "info",
      })

      toast({
        description: `New workflow "${workflowName}" has been created with DAG ID: ${airflowDagId}. Start adding nodes to build your workflow.`,
        title: "Workflow Created",
      })
    },
    [clearLogs, addLog, toast],
  )

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
    getNodeById,
    clearWorkflow,
    runWorkflow,
    saveWorkflow,
    saveWorkflowToBackend,
    saveAndRunWorkflow,
    createNewWorkflow,
    loadWorkflow,
    loadWorkflowFromDAG,
    getWorkflowExportData,
    executeNode,
    addLog,
    clearLogs,
    getCurrentWorkflowId,
    syncWorkflowWithAirflow: undefined as any,
    setCurrentWorkflowMeta,
  }

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider")
  }
  return context
}
