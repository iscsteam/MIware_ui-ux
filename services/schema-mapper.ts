import type { WorkflowNode } from "@/components/workflow/workflow-context"
import type {
  FilterGroup,
  ConditionItem,
  OrderByClauseBackend,
  AggregationConfigBackend,
} from "@/components/workflow/workflow-context"

export interface FileConversionConfig {
  input: {
    provider: string
    format: string
    path: string
    options?: Record<string, any>
    content?: string
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
    path?: string
    connectionString?: string
    table?: string
    mode: string
    type?: string
    options?: Record<string, any>
    content?: string
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
    driver_cores: number
    driver_memory: string
    executor_instances: number
    executor_cores: number
    executor_memory: string
    "spark.sql.shuffle.partitions": string
  }
  dag_id?: string
}

interface CliOperatorConfig {
  operation: string
  source_path?: string
  destination_path?: string
  options?: Record<string, any>
  executed_by: string
  dag_id?: string
}

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

// EXACT Spark config from working payloads
export const DEFAULT_SPARK_CONFIG = {
  driver_cores: 1,
  driver_memory: "512m",
  executor_instances: 1,
  executor_cores: 1,
  executor_memory: "512m",
  "spark.sql.shuffle.partitions": "1",
}

// EXACT schema from working payloads
export const getDefaultSchema = () => ({
  fields: [
    { name: "Id", type: "string", nullable: false },
    { name: "Name", type: "string", nullable: false },
    { name: "AccountNumber", type: "string", nullable: false },
    { name: "Site", type: "string", nullable: true },
    { name: "Type", type: "string", nullable: true },
    { name: "Industry", type: "string", nullable: true },
    { name: "AnnualRevenue", type: "long", nullable: true },
    { name: "Rating", type: "string", nullable: true },
    { name: "Phone", type: "string", nullable: true },
    { name: "Fax", type: "string", nullable: true },
    { name: "Website", type: "string", nullable: true },
    { name: "TickerSymbol", type: "string", nullable: true },
    { name: "Ownership", type: "string", nullable: true },
    { name: "NumberOfEmployees", type: "integer", nullable: true },
  ],
})

// EXACT format options from working payloads
export const getFormatOptions = (format: string, isInput = true) => {
  const formatLower = format.toLowerCase()

  if (isInput) {
    switch (formatLower) {
      case "json":
        return {
          multiLine: true,
        }
      case "csv":
        return {
          header: "true",
          inferSchema: "false",
        }
      case "xml":
        return {
          rowTag: "Account",
          rootTag: "Accounts",
        }
      case "txt":
      case "text":
        return {
          delimiter: "|",
          header: "false",
          inferSchema: "false",
        }
      default:
        return {}
    }
  } else {
    // Output options
    switch (formatLower) {
      case "json":
        return {
          singleFile: true,
        }
      case "csv":
        return {
          header: "true",
          singleFile: true,
        }
      case "xml":
        return {
          rowTag: "Account",
          rootTag: "Accounts",
          singleFile: true,
        }
      case "txt":
      case "text":
        return {
          delimiter: "|",
          singleFile: true,
           header: "true",
        }
      default:
        return {}
    }
  }
}

export function mapNodeToInputConfig(node: WorkflowNode) {
  if (!node || !node.data) {
    console.error("mapNodeToInputConfig: Invalid node or missing data")
    return null
  }

  if (node.type === "inline-input") {
    return {
      provider: "inline",
      format: node.data.format || "json",
      path: "",
      content: node.data.content || "",
      options: node.data.options || getFormatOptions(node.data.format || "json", true),
      schema: node.data.schema || getDefaultSchema(),
    }
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
      path: node.data.connectionString || "",
      options: {
        query: node.data.query || "",
        table: node.data.table || "",
        user: node.data.user || "",
        password: node.data.password || "",
        driver: getDatabaseDriver(node.data.provider),
      },
      schema: node.data.schema,
    }
  }

  console.error("mapNodeToInputConfig: Unsupported node type:", node.type)
  return null
}

export function mapNodeToOutputConfig(node: WorkflowNode) {
  if (!node || !node.data) {
    console.error("mapNodeToOutputConfig: Invalid node or missing data")
    return null
  }

  if (node.type === "inline-output") {
    // Use the exact structure from working payloads
    return {
      provider: "local",
      format: node.data.format || "csv",
      path: node.data.path || "/app/data/mock_data/output/inline_output_test",
      mode: node.data.mode || "overwrite",
      options: node.data.options || getFormatOptions(node.data.format || "csv", false),
      content: "",
    }
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
      provider: node.data.provider || "postgresql",
      format: "sql",
      path: node.data.connectionString || "",
      mode: node.data.writeMode || "overwrite",
      type: "database",
      options: {
        table: node.data.table || "",
        header: node.data.options?.header || true,
        inferSchema: node.data.options?.inferSchema || true,
        user: node.data.user || "",
        password: node.data.password || "",
        batchSize: node.data.batchSize || "5000",
        driver: getDatabaseDriver(node.data.provider),
      },
    }
  }

  console.error("mapNodeToOutputConfig: Unsupported node type:", node.type)
  return null
}

export function mapFilterNodeToTransformationConfig(filterNode: WorkflowNode | null) {
  const result: {
    filter?: FilterGroup
    order_by?: OrderByClauseBackend[]
    aggregation?: AggregationConfigBackend
  } = {}

  if (!filterNode || !filterNode.data) {
    console.log("DEBUG(schema-mapper): No filter node or data found. Returning:", JSON.stringify(result))
    return result
  }

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
    console.log("DEBUG(schema-mapper): No valid filter conditions. 'filter' property will be omitted.")
  }

  if (filterNode.data.order_by && filterNode.data.order_by.length > 0) {
    result.order_by = filterNode.data.order_by
    console.log("DEBUG(schema-mapper): Order by found:", JSON.stringify(result.order_by))
  } else {
    console.log("DEBUG(schema-mapper): No order by found. 'order_by' property will be omitted.")
  }

  const agg = filterNode.data.aggregation
  if (agg && (agg.group_by?.length > 0 || agg.aggregations?.length > 0)) {
    result.aggregation = agg
    console.log("DEBUG(schema-mapper): Aggregation found:", JSON.stringify(result.aggregation))
  } else {
    console.log("DEBUG(schema-mapper): No aggregation found. 'aggregation' property will be omitted.")
  }

  console.log("DEBUG(schema-mapper): Final return result:", JSON.stringify(result, null, 2))
  return result
}

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

// New inline configuration functions using EXACT payload structures
export function createInlineToInlineConfig(
  inlineInputNode: WorkflowNode,
  inlineOutputNode: WorkflowNode,
  filterNode: WorkflowNode | null,
  dagId: string,
) {
  try {
    console.log("Creating inline-to-inline config with nodes:", {
      input: { id: inlineInputNode.id, type: inlineInputNode.type, data: inlineInputNode.data },
      output: { id: inlineOutputNode.id, type: inlineOutputNode.type, data: inlineOutputNode.data },
    })

    const input = mapNodeToInputConfig(inlineInputNode)
    const output = mapNodeToOutputConfig(inlineOutputNode)
    const transformationConfig = mapFilterNodeToTransformationConfig(filterNode)

    if (!input) {
      throw new Error(
        `Invalid inline input node configuration. Node type: ${inlineInputNode.type}, Data: ${JSON.stringify(inlineInputNode.data)}`,
      )
    }

    if (!output) {
      throw new Error(
        `Invalid inline output node configuration. Node type: ${inlineOutputNode.type}, Data: ${JSON.stringify(inlineOutputNode.data)}`,
      )
    }

    const config = {
      input,
      output,
      ...transformationConfig,
      spark_config: DEFAULT_SPARK_CONFIG,
      dag_id: dagId,
    }

    console.log("Created inline-to-inline config:", config)
    return config
  } catch (error) {
    console.error("Error in createInlineToInlineConfig:", error)
    throw new Error(`Failed to create inline-to-inline configuration: ${error.message}`)
  }
}

export function createInlineToFileConfig(
  inlineInputNode: WorkflowNode,
  writeFileNode: WorkflowNode,
  filterNode: WorkflowNode | null,
  dagId: string,
) {
  try {
    console.log("Creating inline-to-file config with nodes:", {
      input: { id: inlineInputNode.id, type: inlineInputNode.type, data: inlineInputNode.data },
      output: { id: writeFileNode.id, type: writeFileNode.type, data: writeFileNode.data },
    })

    const input = mapNodeToInputConfig(inlineInputNode)
    const output = mapNodeToOutputConfig(writeFileNode)
    const transformationConfig = mapFilterNodeToTransformationConfig(filterNode)

    if (!input) {
      throw new Error(`Invalid inline input node configuration. Node type: ${inlineInputNode.type}`)
    }

    if (!output) {
      throw new Error(`Invalid write file node configuration. Node type: ${writeFileNode.type}`)
    }

    const config = {
      input,
      output,
      ...transformationConfig,
      spark_config: DEFAULT_SPARK_CONFIG,
      dag_id: dagId,
    }

    console.log("Created inline-to-file config:", config)
    return config
  } catch (error) {
    console.error("Error in createInlineToFileConfig:", error)
    throw new Error(`Failed to create inline-to-file configuration: ${error.message}`)
  }
}

export function createFileToInlineConfig(
  readFileNode: WorkflowNode,
  inlineOutputNode: WorkflowNode,
  filterNode: WorkflowNode | null,
  dagId: string,
) {
  try {
    console.log("Creating file-to-inline config with nodes:", {
      input: { id: readFileNode.id, type: readFileNode.type, data: readFileNode.data },
      output: { id: inlineOutputNode.id, type: inlineOutputNode.type, data: inlineOutputNode.data },
    })

    const input = mapNodeToInputConfig(readFileNode)
    const output = mapNodeToOutputConfig(inlineOutputNode)
    const transformationConfig = mapFilterNodeToTransformationConfig(filterNode)

    if (!input) {
      throw new Error(`Invalid read file node configuration. Node type: ${readFileNode.type}`)
    }

    if (!output) {
      throw new Error(`Invalid inline output node configuration. Node type: ${inlineOutputNode.type}`)
    }

    const config = {
      input,
      output,
      ...transformationConfig,
      spark_config: DEFAULT_SPARK_CONFIG,
      dag_id: dagId,
    }

    console.log("Created file-to-inline config:", config)
    return config
  } catch (error) {
    console.error("Error in createFileToInlineConfig:", error)
    throw new Error(`Failed to create file-to-inline configuration: ${error.message}`)
  }
}

export function mapCopyFileToCliOperator(copyFileNode: WorkflowNode): CliOperatorConfig {
  return {
    operation: "copy",
    source_path: copyFileNode.data.source_path || "",
    destination_path: copyFileNode.data.destination_path || "",
    options: {
      overwrite: copyFileNode.data.overwrite || false,
      includeSubDirectories: copyFileNode.data.includeSubDirectories || false,
      createNonExistingDirs: copyFileNode.data.createNonExistingDirs || false,
    },
    executed_by: "cli",
  }
}

export function mapMoveFileToCliOperator(moveFileNode: WorkflowNode): CliOperatorConfig {
  return {
    operation: "move",
    source_path: moveFileNode.data.source_path || "",
    destination_path: moveFileNode.data.destination_path || "",
    options: {
      overwrite: moveFileNode.data.overwrite || false,
      includeSubDirectories: moveFileNode.data.includeSubDirectories || false,
      createNonExistingDirs: moveFileNode.data.createNonExistingDirs || false,
    },
    executed_by: "cli",
  }
}

export function mapRenameFileToCliOperator(renameFileNode: WorkflowNode): CliOperatorConfig {
  return {
    operation: "rename",
    source_path: renameFileNode.data.source_path || "",
    destination_path: renameFileNode.data.destination_path || "",
    options: {
      overwrite: renameFileNode.data.overwrite || false,
    },
    executed_by: "cli",
  }
}

export function mapDeleteFileToCliOperator(deleteFileNode: WorkflowNode): CliOperatorConfig {
  return {
    operation: "delete",
    source_path: deleteFileNode.data.source_path || "",
    options: {
      recursive: deleteFileNode.data.recursive || false,
    },
    executed_by: "cli",
  }
}
