// Enhanced schema mapper with database, file, and Salesforce support
import type { WorkflowNode } from "@/components/workflow/workflow-context"
import type {
  FilterGroup,
  ConditionItem,
  OrderByClauseBackend,
  AggregationConfigBackend,
} from "@/components/workflow/workflow-context"
import { toast } from "@/components/ui/use-toast"

const baseUrl = process.env.NEXT_PUBLIC_USER_API_END_POINT

// File Conversion Config Interface
export interface FileConversionConfig {
  input: {
    provider: string
    format: string
    path: string
    options?: Record<string, any>
    schema?: {
      fields: Array<{
        name: string
        type: string
        nullable: boolean
      }>
    }
  }
  output: {
    provider: string
    format: string
    path: string
    mode: string
    options?: Record<string, any>
  }
  filter?: {
    operator: string
    conditions: any[]
  }
  order_by?: Array<[string, string]>
  aggregation?: {
    group_by: string[]
    aggregations: Array<[string, string]>
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

// Salesforce Configuration Types
export interface SalesforceReadConfig {
  object_name: string
  query: string
  fields?: string[]
  where?: string
  limit?: number
  use_bulk_api: boolean
  file_path: string
}

export interface SalesforceReadConfigResponse extends SalesforceReadConfig {
  id: number
  client_id: string
  created_at: string
  updated_at: string
}

export interface SalesforceReadConfigCreate {
  object_name: string
  query: string
  fields?: string[]
  where?: string
  limit?: number
  use_bulk_api: boolean
  file_path: string
}

// CLI Operator Config Interface
interface CliOperatorConfig {
  operation: string
  source_path?: string
  destination_path?: string
  options?: Record<string, any>
  executed_by: string
  dag_id?: string
}

// Helper Functions
function getDatabaseDriver(provider?: string): string {
  const drivers: Record<string, string> = {
    postgresql: "org.postgresql.Driver",
    mysql: "com.mysql.cj.jdbc.Driver",
    sqlserver: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    oracle: "oracle.jdbc.driver.OracleDriver",
    sqlite: "org.sqlite.JDBC",
    local: "org.postgresql.Driver",
  }
  return drivers[provider?.toLowerCase() || "postgresql"] || "org.postgresql.Driver"
}

export const DEFAULT_SPARK_CONFIG = {
  executor_instances: 1,
  executor_cores: 1,
  executor_memory: "512m",
  driver_memory: "512m",
  driver_cores: 1,
}

// Node Mapping Functions
export function mapNodeToInputConfig(node: WorkflowNode) {
  if (!node || !node.data) {
    return null
  }

  if (node.type === "read-file") {
    return {
      provider: node.data.provider || "local",
      format: node.data.format || "csv",
      path: node.data.path || "",
      options: node.data.options || {},
      schema: node.data.schema,
    }
  }

  if (node.type === "source" || node.type === "database") {
    return {
      provider: node.data.provider || "postgresql",
      format: "sql",
      path: node.data.connectionString,
      options: {
        query: node.data.query,
        table: node.data.table,
        user: node.data.user || "",
        password: node.data.password || "",
        driver: getDatabaseDriver(node.data.provider),
      },
      schema: node.data.schema,
    }
  }

  return null
}

export function mapNodeToOutputConfig(node: WorkflowNode) {
  if (!node || !node.data) {
    return null
  }

  if (node.type === "write-file") {
    return {
      provider: node.data.provider || "local",
      format: node.data.format || "parquet",
      path: node.data.path || "",
      mode: node.data.writeMode || "overwrite",
      options: node.data.options || {},
    }
  }

  if (node.type === "database") {
    return {
      provider: node.data.provider === "local" ? "local" : node.data.provider,
      format: "sql",
      path: node.data.connectionString,
      mode: node.data.writeMode || "overwrite",
      options: {
        table: node.data.table,
        user: node.data.user || "",
        password: node.data.password || "",
        batchSize: node.data.batchSize || "5000",
        driver: getDatabaseDriver(node.data.provider),
      },
    }
  }

  return null
}

// Filter Node Mapping
export function mapFilterNodeToTransformationConfig(filterNode: WorkflowNode | null) {
  const result: {
    filter: FilterGroup | null
    order_by: OrderByClauseBackend[] | null
    aggregation: AggregationConfigBackend | null
  } = {
    filter: null,
    order_by: null,
    aggregation: null,
  }

  if (!filterNode || !filterNode.data) {
    console.log("DEBUG(schema-mapper): No filter node or data found. Returning:", JSON.stringify(result))
    return result
  }

  // Filter Logic
  const filterData = filterNode.data.filter as FilterGroup
  if (
    filterData &&
    typeof filterData.operator === "string" &&
    filterData.operator.trim() !== "" &&
    filterData.conditions &&
    Array.isArray(filterData.conditions) &&
    filterData.conditions.length > 0
  ) {
    result.filter = {
      operator: filterData.operator.toUpperCase(),
      conditions: filterData.conditions as ConditionItem[],
    } as FilterGroup
    console.log("DEBUG(schema-mapper): Filter conditions found:", JSON.stringify(result.filter))
  } else {
    result.filter = null
    console.log("DEBUG(schema-mapper): No valid filter conditions. Setting filter to null.")
  }

  // Order By Logic
  if (filterNode.data.order_by && filterNode.data.order_by.length > 0) {
    result.order_by = filterNode.data.order_by
    console.log("DEBUG(schema-mapper): Order by found:", JSON.stringify(result.order_by))
  } else {
    result.order_by = null
    console.log("DEBUG(schema-mapper): No order by found. Setting order_by to null.")
  }

  // Aggregation Logic
  const agg = filterNode.data.aggregation
  if (agg && (agg.group_by?.length > 0 || agg.aggregations?.length > 0)) {
    result.aggregation = agg
    console.log("DEBUG(schema-mapper): Aggregation found:", JSON.stringify(result.aggregation))
  } else {
    result.aggregation = null
    console.log("DEBUG(schema-mapper): No aggregation found. Setting aggregation to null.")
  }

  console.log("DEBUG(schema-mapper): Final return result:", JSON.stringify(result, null, 2))
  return result
}

// Configuration Creation Functions
export function createFileConversionConfigFromNodes(
  readNode: WorkflowNode,
  writeNode: WorkflowNode,
  filterNode: WorkflowNode | null,
  dagId: string,
): FileConversionConfig {
  const input = mapNodeToInputConfig(readNode)
  const output = mapNodeToOutputConfig(writeNode)
  const transformationConfig = mapFilterNodeToTransformationConfig(filterNode)

  if (!input || !output) {
    throw new Error("Invalid read or write node configuration for file conversion.")
  }

  return {
    input,
    output,
    ...transformationConfig,
    spark_config: DEFAULT_SPARK_CONFIG,
    dag_id: dagId,
  }
}

export function createFileToFileConfig(
  readNode: WorkflowNode,
  writeNode: WorkflowNode,
  filterNode: WorkflowNode | null,
  dagId: string,
) {
  return createFileConversionConfigFromNodes(readNode, writeNode, filterNode, dagId)
}

export function createFileToDatabaseConfig(
  readNode: WorkflowNode,
  databaseNode: WorkflowNode,
  filterNode: WorkflowNode | null,
  dagId: string,
) {
  const input = mapNodeToInputConfig(readNode)
  const output = mapNodeToOutputConfig(databaseNode)
  const transformationConfig = mapFilterNodeToTransformationConfig(filterNode)

  if (!input || !output) {
    throw new Error("Invalid file or database node configuration for file-to-database.")
  }

  return {
    input,
    output,
    ...transformationConfig,
    spark_config: DEFAULT_SPARK_CONFIG,
    dag_id: dagId,
  }
}

export function createDatabaseToFileConfig(
  dbSourceNode: WorkflowNode,
  writeFileNode: WorkflowNode,
  filterNode: WorkflowNode | null,
  dagId: string,
) {
  const input = mapNodeToInputConfig(dbSourceNode)
  const output = mapNodeToOutputConfig(writeFileNode)
  const transformationConfig = mapFilterNodeToTransformationConfig(filterNode)

  if (!input || !output) {
    throw new Error("Invalid database source or write file node configuration for database-to-file.")
  }

  return {
    input,
    output,
    ...transformationConfig,
    spark_config: DEFAULT_SPARK_CONFIG,
    dag_id: dagId,
  }
}

// CLI Operator Mapping Functions
export function mapCopyFileToCliOperator(node: WorkflowNode, dagId: string): CliOperatorConfig {
  if (!node || !node.data) {
    throw new Error("Invalid copy file node data")
  }
  const { source_path, destination_path, overwrite } = node.data
  return {
    operation: "copy",
    source_path: source_path || "",
    destination_path: destination_path || "",
    options: {
      overwrite: overwrite || false,
    },
    executed_by: "workflow_user",
    dag_id: dagId,
  }
}

export function mapMoveFileToCliOperator(node: WorkflowNode, dagId: string): CliOperatorConfig {
  if (!node || !node.data) {
    throw new Error("Invalid move file node data")
  }
  const { source_path, destination_path, overwrite } = node.data
  return {
    operation: "move",
    source_path: source_path || "",
    destination_path: destination_path || "",
    options: {
      overwrite: overwrite || false,
    },
    executed_by: "workflow_user",
    dag_id: dagId,
  }
}

export function mapRenameFileToCliOperator(node: WorkflowNode, dagId: string): CliOperatorConfig {
  if (!node || !node.data) {
    throw new Error("Invalid rename file node data")
  }
  const { source_path, destination_path } = node.data
  return {
    operation: "rename",
    source_path: source_path || "",
    destination_path: destination_path || "",
    options: {},
    executed_by: "workflow_user",
    dag_id: dagId,
  }
}

export function mapDeleteFileToCliOperator(node: WorkflowNode, dagId: string): CliOperatorConfig {
  if (!node || !node.data) {
    throw new Error("Invalid delete file node data")
  }
  const { source_path } = node.data
  return {
    operation: "delete",
    source_path: source_path || "",
    options: {},
    executed_by: "workflow_user",
    dag_id: dagId,
  }
}

// Salesforce API Functions (moved from file-conversion-service)
export async function createSalesforceReadConfig(
  clientId: string,
  config: SalesforceReadConfigCreate,
): Promise<SalesforceReadConfigResponse | null> {
  try {
    const response = await fetch(`${baseUrl}/clients/${clientId}/read_salesforce_configs/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to create Salesforce config: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error creating Salesforce config:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to create Salesforce configuration",
      variant: "destructive",
    })
    return null
  }
}

export async function listSalesforceReadConfigs(clientId: string): Promise<SalesforceReadConfigResponse[]> {
  try {
    const response = await fetch(`${baseUrl}/clients/${clientId}/read_salesforce_configs/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to list Salesforce configs: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error listing Salesforce configs:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to list Salesforce configurations",
      variant: "destructive",
    })
    return []
  }
}

export async function updateSalesforceReadConfig(
  clientId: string,
  configId: number,
  config: Partial<SalesforceReadConfigCreate>,
): Promise<SalesforceReadConfigResponse | null> {
  try {
    const response = await fetch(`${baseUrl}/clients/${clientId}/read_salesforce_configs/${configId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to update Salesforce config: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating Salesforce config:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to update Salesforce configuration",
      variant: "destructive",
    })
    return null
  }
}

export async function deleteSalesforceReadConfig(clientId: string, configId: number): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/clients/${clientId}/read_salesforce_configs/${configId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      throw new Error(errorData.detail || `Failed to delete Salesforce config: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error("Error deleting Salesforce config:", error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to delete Salesforce configuration",
      variant: "destructive",
    })
    return false
  }
}
