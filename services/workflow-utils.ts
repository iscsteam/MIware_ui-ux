
// Utility functions for workflow operations
import type { WorkflowNode, NodeConnection } from "@/components/workflow/workflow-context"
import { createFileConversionConfig, updateDag, triggerDagRun } from "@/services/file-conversion-service"
import { createFileConversionConfigFromNodes } from "@/services/schema-mapper"
import {
  createCliOperatorConfig,
  mapCopyFileToCliOperator,
  mapMoveFileToCliOperator,
  mapRenameFileToCliOperator,
  mapDeleteFileToCliOperator,
} from "@/services/cli-operator-service"
import { toast } from "@/components/ui/use-toast"
import { getCurrentClientId } from "@/components/workflow/workflow-context"

// Helper function to ensure Python-compatible IDs
function makePythonSafeId(id: string): string {
  let safeId = id.replace(/[^a-zA-Z0-9_]/g, "_")
  if (!/^[a-zA-Z_]/.test(safeId)) {
    safeId = "task_" + safeId
  }
  return safeId
}

export async function saveAndRunWorkflow(
  nodes: WorkflowNode[],
  connections: NodeConnection[],
  currentWorkflowId: string | null,
): Promise<boolean> {
  const dynamicClientIdString = getCurrentClientId()
  if (!dynamicClientIdString) {
    toast({
      title: "Error",
      description: "No client ID found. Please create or select a client first.",
      variant: "destructive",
    })
    return false
  }

  const clientId = Number.parseInt(dynamicClientIdString, 10)
  if (isNaN(clientId)) {
    toast({
      title: "Error",
      description: "Invalid client ID format.",
      variant: "destructive",
    })
    return false
  }

  if (!currentWorkflowId) {
    toast({
      title: "Error",
      description: "No workflow ID found. Please create a workflow first.",
      variant: "destructive",
    })
    return false
  }

  if (nodes.length === 0) {
    toast({
      title: "Error",
      description: "Cannot save an empty workflow. Please add nodes first.",
      variant: "destructive",
    })
    return false
  }

  try {
    const startNodes = nodes.filter((node) => node.type === "start")
    const endNodes = nodes.filter((node) => node.type === "end")
    if (startNodes.length === 0 || endNodes.length === 0) {
      toast({
        title: "Error",
        description: "Workflow must have both start and end nodes.",
        variant: "destructive",
      })
      return false
    }

    // Check for the type of workflow
    const readFileNodes = nodes.filter((node) => node.type === "read-file")
    const writeFileNodes = nodes.filter((node) => node.type === "write-file")
    const databaseNodes = nodes.filter((node) => node.type === "database") // NEW: Database nodes
    const DatabasesourceNode=nodes.filter((node) => node.type === "database")
    const copyFileNodes = nodes.filter((node) => node.type === "copy-file")
    const moveFileNodes = nodes.filter((node) => node.type === "move-file")
    const renameFileNodes = nodes.filter((node) => node.type === "rename-file")
    const deleteFileNodes = nodes.filter((node) => node.type === "delete-file")
    const filterNodes = nodes.filter((node) => node.type === "filter")

    let dagSequence: any[] = []
    let createdConfigId: number | null = null
    let operationTypeForDag: "file_conversion" | "cli_operator" | null = null
    let cliConfigPayload: any = null

    // --- FILE CONVERSION WORKFLOW ---
    if (readFileNodes.length > 0 && writeFileNodes.length > 0) {
      operationTypeForDag = "file_conversion"
      const readNode = readFileNodes[0]
      const writeNode = writeFileNodes[0]
      const filterNode = filterNodes.length > 0 ? filterNodes[0] : null
      const configPayload = createFileConversionConfigFromNodes(readNode, writeNode, filterNode, currentWorkflowId)
      if (!configPayload.input.path || !configPayload.output.path) {
        toast({
          title: "Error",
          description: "File conversion workflow requires both input and output paths.",
          variant: "destructive",
        })
        return false
      }
      console.log("Creating file conversion config with:", configPayload)
      const configResponse = await createFileConversionConfig(clientId, configPayload)
      if (!configResponse) throw new Error("Failed to create file conversion config")
      createdConfigId = configResponse.id
    }
    // --- DATABASE WORKFLOW (NEW) ---
    else if (readFileNodes.length > 0 && databaseNodes.length > 0) {
      operationTypeForDag = "file_conversion"
      const readNode = readFileNodes[0]
      const databaseNode = databaseNodes[0]
      const filterNode = filterNodes.length > 0 ? filterNodes[0] : null

      if (!readNode.data.path || !databaseNode.data.connectionString || !databaseNode.data.table) {
        toast({
          title: "Error",
          description: "Database workflow requires file path, connection string, and table name.",
          variant: "destructive",
        })
        return false
      }

      // Create file conversion config for database workflow
      // const configPayload = {
      //   input: {
      //     provider: readNode.data.provider || "local",
      //     format: readNode.data.format || "csv",
      //     path: readNode.data.path,
      //     options: readNode.data.options || {},
      //     schema: readNode.data.schema,
      //   },
      //   output: {
      //     provider: databaseNode.data.provider === "local" ? "sqlite" : databaseNode.data.provider,
      //     format: "sql",
      //     path: databaseNode.data.connectionString,
      //     mode: databaseNode.data.writeMode || "overwrite",
      //     options: {
      //       table: databaseNode.data.table,
      //       user: databaseNode.data.user || "",
      //       password: databaseNode.data.password || "",
      //       batchSize: databaseNode.data.batchSize || "5000",
      //       driver: getDatabaseDriver(databaseNode.data.provider),
      //     },
      //   },
      //   filter: filterNode
      //     ? {
      //         operator: filterNode.data.operator || "and",
      //         conditions: filterNode.data.conditions || [],
      //       }
      //     : undefined,
      //   dag_id: currentWorkflowId,
      // }

      // console.log("Creating database workflow config with:", configPayload)
      // const configResponse = await createFileConversionConfig(clientId, configPayload)
      // if (!configResponse) throw new Error("Failed to create database workflow config")
      // createdConfigId = configResponse.id
    }
    // --- COPY FILE WORKFLOW ---
    else if (copyFileNodes.length > 0) {
      operationTypeForDag = "cli_operator"
      const copyNode = copyFileNodes[0]
      if (!copyNode.data.source_path || !copyNode.data.destination_path) {
        toast({
          title: "Error",
          description: "Copy file node requires both source and destination paths.",
          variant: "destructive",
        })
        return false
      }
      cliConfigPayload = mapCopyFileToCliOperator(copyNode)
    }
    // --- MOVE FILE WORKFLOW ---
    else if (moveFileNodes.length > 0) {
      operationTypeForDag = "cli_operator"
      const moveNode = moveFileNodes[0]
      if (!moveNode.data.source_path || !moveNode.data.destination_path) {
        toast({
          title: "Error",
          description: "Move file node requires both source and destination paths.",
          variant: "destructive",
        })
        return false
      }
      cliConfigPayload = mapMoveFileToCliOperator(moveNode)
    }
    // --- RENAME FILE WORKFLOW ---
    else if (renameFileNodes.length > 0) {
      operationTypeForDag = "cli_operator"
      const renameNode = renameFileNodes[0]
      if (!renameNode.data.source_path || !renameNode.data.destination_path) {
        toast({
          title: "Error",
          description: "Rename file node requires both source and destination paths.",
          variant: "destructive",
        })
        return false
      }
      cliConfigPayload = mapRenameFileToCliOperator(renameNode)
    }
    // --- DELETE FILE WORKFLOW ---
    else if (deleteFileNodes.length > 0) {
      operationTypeForDag = "cli_operator"
      const deleteNode = deleteFileNodes[0]
      if (!deleteNode.data.source_path) {
        toast({
          title: "Error",
          description: "Delete file node requires source path.",
          variant: "destructive",
        })
        return false
      }
      cliConfigPayload = mapDeleteFileToCliOperator(deleteNode)
    } else {
      toast({
        title: "Error",
        description:
          "Workflow must contain a recognized operation (read/write, database, copy, move, rename, or delete).",
        variant: "destructive",
      })
      return false
    }

    // If it's a CLI operation, create the config
    if (operationTypeForDag === "cli_operator" && cliConfigPayload) {
      console.log(`Creating CLI operator config (${cliConfigPayload.operation}) with:`, cliConfigPayload)
      const configResponse = await createCliOperatorConfig(clientId, cliConfigPayload)
      if (!configResponse) throw new Error(`Failed to create CLI operator config for ${cliConfigPayload.operation}`)
      createdConfigId = configResponse.id
    }

    // Check if a config was successfully created and an operation type determined
    if (createdConfigId === null || operationTypeForDag === null) {
      toast({
        title: "Error",
        description: "Failed to determine workflow operation or create necessary configuration.",
        variant: "destructive",
      })
      return false
    }

    // Create DAG sequence using the createdConfigId and operationTypeForDag
    const taskNodeIdPrefix = operationTypeForDag === "file_conversion" ? "fc_node_" : "cli_op_node_"
    dagSequence = [
      {
        id: makePythonSafeId(startNodes[0].id),
        type: "start",
        config_id: 1,
        next: [`${taskNodeIdPrefix}${createdConfigId}`],
      },
      {
        id: `${taskNodeIdPrefix}${createdConfigId}`,
        type: operationTypeForDag,
        config_id: createdConfigId,
        next: [makePythonSafeId(endNodes[0].id)],
      },
      { id: makePythonSafeId(endNodes[0].id), type: "end", config_id: 1, next: [] },
    ]

    // Update DAG and Trigger Run
    const dagUpdateData = { dag_sequence: dagSequence, active: true }
    const updatedDag = await updateDag(currentWorkflowId, dagUpdateData)
    if (!updatedDag) throw new Error("Failed to update DAG")

    try {
      const triggerResult = await triggerDagRun(currentWorkflowId)
      if (!triggerResult) console.log("Trigger returned null, but continuing.")
    } catch (triggerError) {
      console.error("Error triggering DAG run, but workflow was saved:", triggerError)
      toast({
        title: "Partial Success",
        description: "Workflow saved but failed to trigger. Run manually.",
        variant: "default",
      })
      return true
    }

    toast({ title: "Success", description: "Workflow saved and triggered successfully." })
    return true
  } catch (error) {
    console.error("Error in saveAndRunWorkflow:", error)
    toast({
      title: "Workflow Error",
      description: error instanceof Error ? error.message : "Failed to save and run workflow.",
      variant: "destructive",
    })
    return false
  }
}

// Helper function to get database driver based on provider
function getDatabaseDriver(provider: string): string {
  const drivers: Record<string, string> = {
    postgresql: "org.postgresql.Driver",
    mysql: "com.mysql.cj.jdbc.Driver",
    sqlserver: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    oracle: "oracle.jdbc.driver.OracleDriver",
    local: "org.sqlite.JDBC", // NEW: SQLite driver for local databases
  }
  return drivers[provider] || drivers.postgresql
}

// Keep the existing findWriteNodesInPath function unchanged
function findWriteNodesInPath(
  startNodeId: string,
  nodes: WorkflowNode[],
  connections: NodeConnection[],
  visited: Set<string> = new Set(),
): WorkflowNode[] {
  if (visited.has(startNodeId)) {
    return []
  }

  visited.add(startNodeId)
  const writeNodes: WorkflowNode[] = []

  const node = nodes.find((n) => n.id === startNodeId)
  if (node?.type === "write-file") {
    writeNodes.push(node)
  }

  for (const conn of connections) {
    if (conn.sourceId === startNodeId) {
      const nodesInPath = findWriteNodesInPath(conn.targetId, nodes, connections, visited)
      writeNodes.push(...nodesInPath)
    }
  }

  return writeNodes
}
