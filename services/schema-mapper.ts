// // Enhanced schema mapper with database, file, and Salesforce support
// import type { WorkflowNode } from "@/components/workflow/workflow-context"
// import type {
//   FilterGroup,
//   ConditionItem,
//   OrderByClauseBackend,
//   AggregationConfigBackend,
// } from "@/components/workflow/workflow-context"

// // const baseUrl = process.env.NEXT_PUBLIC_API_URL

// // File Conversion Config Interface
// export interface FileConversionConfig {
//   input: {
//     provider: string
//     format: string
//     path: string
//     options?: Record<string, any>
//     schema?: {
//       fields: Array<{
//         name: string
//         type: string
//         nullable: boolean
//       }>
//     }
//   }
//   output: {
//     provider: string
//     format: string
//     path?: string
//     connectionString?: string
//     table?: string
//     mode: string
//     type?: string // Add this field
//     options?: Record<string, any>
//   }
//   filter?: {
//     operator: string
//     conditions: any[]
//   }
//   order_by?: Array<[string, string]>
//   aggregation?: {
//     group_by: string[]
//     aggregations: Array<[string, string]>
//   }
//   spark_config?: {
//     executor_instances: number
//     executor_cores: number
//     executor_memory: string
//     driver_memory: string
//     driver_cores: number
//   }
//   dag_id?: string
// }

// // Salesforce Configuration Types

// // CLI Operator Config Interface
// interface CliOperatorConfig {
//   operation: string
//   source_path?: string
//   destination_path?: string
//   options?: Record<string, any>
//   executed_by: string
//   dag_id?: string
// }

// // Helper Functions
// function getDatabaseDriver(provider?: string): string {
//   const drivers: Record<string, string> = {
//     postgresql: "org.postgresql.Driver",
//     mysql: "com.mysql.cj.jdbc.Driver",
//     sqlserver: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
//     oracle: "oracle.jdbc.driver.OracleDriver",
//     sqlite: "org.sqlite.JDBC",
//     local: "org.postgresql.Driver",
//   }
//   return drivers[provider?.toLowerCase() || "postgresql"] || "org.postgresql.Driver"
// }

// export const DEFAULT_SPARK_CONFIG = {
//   executor_instances: 1,
//   executor_cores: 1,
//   executor_memory: "512m",
//   driver_memory: "512m",
//   driver_cores: 1,
// }

// // Node Mapping Functions
// export function mapNodeToInputConfig(node: WorkflowNode) {
//   if (!node || !node.data) {
//     return null
//   }

//   if (node.type === "read-file") {
//     return {
//       provider: node.data.provider || "local",
//       format: node.data.format || "csv",
//       path: node.data.path || "",
//       options: node.data.options || {},
//       schema: node.data.schema,
//     }
//   }

//   if (node.type === "source" || node.type === "database") {
//     return {
//       provider: node.data.provider || "postgresql",
//       format: "sql",
//       path: node.data.connectionString || "",
//       options: {
//         query: node.data.query,
//         table: node.data.table,
//         user: node.data.user || "",
//         password: node.data.password || "",
//         driver: getDatabaseDriver(node.data.provider),
//       },
//       schema: node.data.schema,
//     }
//   }

//   return null
// }

// export function mapNodeToOutputConfig(node: WorkflowNode) {
//   if (!node || !node.data) {
//     return null
//   }

//   if (node.type === "write-file") {
//     return {
//       provider: node.data.provider || "local",
//       format: node.data.format || "parquet",
//       path: node.data.path || "",
//       mode: node.data.writeMode || "overwrite",
//       options: node.data.options || {},
//     }
//   }

//   if (node.type === "database") {
//     return {
//       provider: node.data.provider || "postgresql",
//       format: "sql",
//       path: node.data.connectionString || "", // Use path instead of connectionString
//       mode: node.data.writeMode || "overwrite",
//       type: "database",
//       options: {
//         table: node.data.table, // Move table to options
//         header: node.data.options?.header || true,
//         inferSchema: node.data.options?.inferSchema || true,
//         user: node.data.user || "",
//         password: node.data.password || "",
//         batchSize: node.data.batchSize || "5000",
//         driver: getDatabaseDriver(node.data.provider),
//       },
//     }
//   }

//   return null
// }

// // Filter Node Mapping
// export function mapFilterNodeToTransformationConfig(filterNode: WorkflowNode | null) {
//   const result: {
//     filter?: FilterGroup
//     order_by?: OrderByClauseBackend[]
//     aggregation?: AggregationConfigBackend
//   } = {}

//   if (!filterNode || !filterNode.data) {
//     console.log("DEBUG(schema-mapper): No filter node or data found. Returning:", JSON.stringify(result))
//     return result
//   }

//   // Filter Logic
//   const filterData = filterNode.data.filter as FilterGroup
//   if (
//     filterData &&
//     typeof filterData.operator === "string" &&
//     filterData.operator.trim() !== "" &&
//     filterData.conditions &&
//     Array.isArray(filterData.conditions) &&
//     filterData.conditions.length > 0
//   ) {
//     result.filter = {
//       operator: filterData.operator.toUpperCase(),
//       conditions: filterData.conditions as ConditionItem[],
//     } as FilterGroup
//     console.log("DEBUG(schema-mapper): Filter conditions found:", JSON.stringify(result.filter))
//   } else {
//     console.log("DEBUG(schema-mapper): No valid filter conditions. 'filter' property will be omitted.")
//   }

//   // Order By Logic
//   if (filterNode.data.order_by && filterNode.data.order_by.length > 0) {
//     result.order_by = filterNode.data.order_by
//     console.log("DEBUG(schema-mapper): Order by found:", JSON.stringify(result.order_by))
//   } else {
//     console.log("DEBUG(schema-mapper): No order by found. 'order_by' property will be omitted.")
//   }

//   // Aggregation Logic
//   const agg = filterNode.data.aggregation
//   if (agg && (agg.group_by?.length > 0 || agg.aggregations?.length > 0)) {
//     result.aggregation = agg
//     console.log("DEBUG(schema-mapper): Aggregation found:", JSON.stringify(result.aggregation))
//   } else {
//     console.log("DEBUG(schema-mapper): No aggregation found. 'aggregation' property will be omitted.")
//   }

//   console.log("DEBUG(schema-mapper): Final return result:", JSON.stringify(result, null, 2))
//   return result
// }

// // Configuration Creation Functions
// export function createFileConversionConfigFromNodes(
//   readNode: WorkflowNode,
//   writeNode: WorkflowNode,
//   filterNode: WorkflowNode | null,
//   dagId: string,
// ): FileConversionConfig {
//   const input = mapNodeToInputConfig(readNode)
//   const output = mapNodeToOutputConfig(writeNode)
//   const transformationConfig = mapFilterNodeToTransformationConfig(filterNode)

//   if (!input || !output) {
//     throw new Error("Invalid read or write node configuration for file conversion.")
//   }

//   return {
//     input,
//     output,
//     ...transformationConfig,
//     spark_config: DEFAULT_SPARK_CONFIG,
//     dag_id: dagId,
//   }
// }

// export function createFileToFileConfig(
//   readNode: WorkflowNode,
//   writeNode: WorkflowNode,
//   filterNode: WorkflowNode | null,
//   dagId: string,
// ) {
//   return createFileConversionConfigFromNodes(readNode, writeNode, filterNode, dagId)
// }

// export function createFileToDatabaseConfig(
//   readNode: WorkflowNode,
//   databaseNode: WorkflowNode,
//   filterNode: WorkflowNode | null,
//   dagId: string,
// ) {
//   const input = mapNodeToInputConfig(readNode)
//   const output = mapNodeToOutputConfig(databaseNode)
//   const transformationConfig = mapFilterNodeToTransformationConfig(filterNode)

//   if (!input || !output) {
//     throw new Error("Invalid file or database node configuration for file-to-database.")
//   }

//   // Output is already correctly formatted from mapNodeToOutputConfig
//   return {
//     input,
//     output,
//     ...transformationConfig,
//     spark_config: DEFAULT_SPARK_CONFIG,
//     dag_id: dagId,
//   }
// }

// export function createDatabaseToFileConfig(
//   dbSourceNode: WorkflowNode,
//   writeFileNode: WorkflowNode,
//   filterNode: WorkflowNode | null,
//   dagId: string,
// ) {
//   const input = mapNodeToInputConfig(dbSourceNode)
//   const output = mapNodeToOutputConfig(writeFileNode)
//   const transformationConfig = mapFilterNodeToTransformationConfig(filterNode)

//   if (!input || !output) {
//     throw new Error("Invalid database source or write file node configuration for database-to-file.")
//   }

//   return {
//     input,
//     output,
//     ...transformationConfig,
//     spark_config: DEFAULT_SPARK_CONFIG,
//     dag_id: dagId,
//   }
// }

// // CLI Operator Mapping Functions
// export function mapCopyFileToCliOperator(node: WorkflowNode, dagId: string): CliOperatorConfig {
//   if (!node || !node.data) {
//     throw new Error("Invalid copy file node data")
//   }
//   const { source_path, destination_path, overwrite } = node.data
//   return {
//     operation: "copy",
//     source_path: source_path || "",
//     destination_path: destination_path || "",
//     options: {
//       overwrite: overwrite || false,
//     },
//     executed_by: "workflow_user",
//     dag_id: dagId,
//   }
// }

// export function mapMoveFileToCliOperator(node: WorkflowNode, dagId: string): CliOperatorConfig {
//   if (!node || !node.data) {
//     throw new Error("Invalid move file node data")
//   }
//   const { source_path, destination_path, overwrite } = node.data
//   return {
//     operation: "move",
//     source_path: source_path || "",
//     destination_path: destination_path || "",
//     options: {
//       overwrite: overwrite || false,
//     },
//     executed_by: "workflow_user",
//     dag_id: dagId,
//   }
// }

// export function mapRenameFileToCliOperator(node: WorkflowNode, dagId: string): CliOperatorConfig {
//   if (!node || !node.data) {
//     throw new Error("Invalid rename file node data")
//   }
//   const { source_path, destination_path } = node.data
//   return {
//     operation: "rename",
//     source_path: source_path || "",
//     destination_path: destination_path || "",
//     options: {},
//     executed_by: "workflow_user",
//     dag_id: dagId,
//   }
// }

// export function mapDeleteFileToCliOperator(node: WorkflowNode, dagId: string): CliOperatorConfig {
//   if (!node || !node.data) {
//     throw new Error("Invalid delete file node data")
//   }
//   const { source_path } = node.data
//   return {
//     operation: "delete",
//     source_path: source_path || "",
//     options: {},
//     executed_by: "workflow_user",
//     dag_id: dagId,
//   }
// }

// Enhanced schema mapper with database, file, Salesforce, and inline operations support
import type { WorkflowNode } from "@/components/workflow/workflow-context"
import type {
  FilterGroup,
  ConditionItem,
  OrderByClauseBackend,
  AggregationConfigBackend,
} from "@/components/workflow/workflow-context"

// const baseUrl = process.env.NEXT_PUBLIC_API_URL

// File Conversion Config Interface
export interface FileConversionConfig {
  input: {
    provider: string
    format: string
    path: string
    options?: Record<string, any>
    content?: string // NEW: For inline operations
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
    type?: string // Add this field
    content?: string // NEW: For inline operations
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

  // NEW: Handle inline-input nodes
  if (node.type === "inline-input") {
    return {
      provider: "inline",
      format: node.data.format || "json",
      path: "", // Empty path for inline operations
      content: node.data.content || "",
      options: node.data.options || {},
      schema: node.data.schema || {
        fields: [
          { name: "Id", type: "string", nullable: false },
          { name: "Name", type: "string", nullable: false },
        ],
      },
    }
  }

  if (node.type === "source" || node.type === "database") {
    return {
      provider: node.data.provider || "postgresql",
      format: "sql",
      path: node.data.connectionString || "",
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

  // NEW: Handle inline-output nodes
  if (node.type === "inline-output") {
    return {
      provider: node.data.provider || "local",
      format: node.data.format || "json",
      path: node.data.path || "",
      mode: node.data.mode || "overwrite",
      content: "", // Will be populated by the processing engine
      options: node.data.options || {},
    }
  }

  if (node.type === "database") {
    return {
      provider: node.data.provider || "postgresql",
      format: "sql",
      path: node.data.connectionString || "", // Use path instead of connectionString
      mode: node.data.writeMode || "overwrite",
      type: "database",
      options: {
        table: node.data.table, // Move table to options
        header: node.data.options?.header || true,
        inferSchema: node.data.options?.inferSchema || true,
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
    filter?: FilterGroup
    order_by?: OrderByClauseBackend[]
    aggregation?: AggregationConfigBackend
  } = {}

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
    console.log("DEBUG(schema-mapper): No valid filter conditions. 'filter' property will be omitted.")
  }

  // Order By Logic
  if (filterNode.data.order_by && filterNode.data.order_by.length > 0) {
    result.order_by = filterNode.data.order_by
    console.log("DEBUG(schema-mapper): Order by found:", JSON.stringify(result.order_by))
  } else {
    console.log("DEBUG(schema-mapper): No order by found. 'order_by' property will be omitted.")
  }

  // Aggregation Logic
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

// NEW: Create inline conversion config from inline input and output nodes
export function createInlineConversionConfig(
  inlineInputNode: WorkflowNode,
  inlineOutputNode: WorkflowNode,
  filterNode: WorkflowNode | null,
  dagId: string,
): FileConversionConfig {
  const input = mapNodeToInputConfig(inlineInputNode)
  const output = mapNodeToOutputConfig(inlineOutputNode)
  const transformationConfig = mapFilterNodeToTransformationConfig(filterNode)

  if (!input || !output) {
    throw new Error("Invalid inline input or output node configuration for inline conversion.")
  }

  // Validate inline-specific requirements
  if (input.provider !== "inline") {
    throw new Error("Input node must be an inline-input type for inline conversion.")
  }

  if (!input.content || input.content.trim() === "") {
    throw new Error("Inline input node must have content.")
  }

  if (!output.path || output.path.trim() === "") {
    throw new Error("Inline output node must have a valid output path.")
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

  // Output is already correctly formatted from mapNodeToOutputConfig
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
export function mapCopyFileToCliOperator(node: WorkflowNode, dagId?: string): CliOperatorConfig {
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

export function mapMoveFileToCliOperator(node: WorkflowNode, dagId?: string): CliOperatorConfig {
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

export function mapRenameFileToCliOperator(node: WorkflowNode, dagId?: string): CliOperatorConfig {
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

export function mapDeleteFileToCliOperator(node: WorkflowNode, dagId?: string): CliOperatorConfig {
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

// NEW: Inline operation validation helpers
export function validateInlineInputNode(node: WorkflowNode): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!node || node.type !== "inline-input") {
    errors.push("Node must be of type 'inline-input'")
    return { isValid: false, errors }
  }

  if (!node.data) {
    errors.push("Node data is required")
    return { isValid: false, errors }
  }

  if (!node.data.format || node.data.format.trim() === "") {
    errors.push("Format is required for inline input")
  }

  if (!node.data.content || node.data.content.trim() === "") {
    errors.push("Content is required for inline input")
  }

  // Validate content format
  if (node.data.format && node.data.content) {
    try {
      switch (node.data.format.toLowerCase()) {
        case "json":
          JSON.parse(node.data.content)
          break
        case "xml":
          // Basic XML validation - check for opening/closing tags
          if (!node.data.content.includes("<") || !node.data.content.includes(">")) {
            errors.push("Invalid XML format in content")
          }
          break
        case "csv":
          // Basic CSV validation - check for at least one line
          if (node.data.content.split("\n").length < 1) {
            errors.push("CSV content must have at least one line")
          }
          break
        case "txt":
          // TXT format is always valid as long as content exists
          break
        default:
          errors.push(`Unsupported format: ${node.data.format}`)
      }
    } catch (error) {
      errors.push(
        `Invalid ${node.data.format.toUpperCase()} format in content: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  return { isValid: errors.length === 0, errors }
}

export function validateInlineOutputNode(node: WorkflowNode): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!node || node.type !== "inline-output") {
    errors.push("Node must be of type 'inline-output'")
    return { isValid: false, errors }
  }

  if (!node.data) {
    errors.push("Node data is required")
    return { isValid: false, errors }
  }

  if (!node.data.format || node.data.format.trim() === "") {
    errors.push("Format is required for inline output")
  }

  if (!node.data.path || node.data.path.trim() === "") {
    errors.push("Output path is required for inline output")
  }

  // Validate supported output formats
  const supportedFormats = ["json", "csv", "xml", "txt", "parquet", "avro"]
  if (node.data.format && !supportedFormats.includes(node.data.format.toLowerCase())) {
    errors.push(`Unsupported output format: ${node.data.format}. Supported formats: ${supportedFormats.join(", ")}`)
  }

  return { isValid: errors.length === 0, errors }
}

// NEW: Helper function to infer schema from inline content
export function inferSchemaFromInlineContent(content: string, format: string): any {
  try {
    switch (format.toLowerCase()) {
      case "json":
        const jsonData = JSON.parse(content)
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          const firstItem = jsonData[0]
          const fields = Object.keys(firstItem).map((key) => ({
            name: key,
            type: typeof firstItem[key] === "number" ? "double" : "string",
            nullable: true,
          }))
          return { fields }
        } else if (typeof jsonData === "object" && jsonData !== null) {
          const fields = Object.keys(jsonData).map((key) => ({
            name: key,
            type: typeof jsonData[key] === "number" ? "double" : "string",
            nullable: true,
          }))
          return { fields }
        }
        break

      case "csv":
        const lines = content.split("\n").filter((line) => line.trim() !== "")
        if (lines.length > 0) {
          const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
          const fields = headers.map((header) => ({
            name: header,
            type: "string", // Default to string for CSV
            nullable: true,
          }))
          return { fields }
        }
        break

      case "xml":
        // Basic XML schema inference - extract element names
        const elementMatches = content.match(/<(\w+)>/g)
        if (elementMatches) {
          const uniqueElements = [...new Set(elementMatches.map((match) => match.replace(/<|>/g, "")))]
          const fields = uniqueElements.map((element) => ({
            name: element,
            type: "string",
            nullable: true,
          }))
          return { fields }
        }
        break

      case "txt":
        // For text files, create a simple single-field schema
        return {
          fields: [{ name: "content", type: "string", nullable: false }],
        }

      default:
        break
    }
  } catch (error) {
    console.warn(`Failed to infer schema from ${format} content:`, error)
  }

  // Default schema if inference fails
  return {
    fields: [
      { name: "Id", type: "string", nullable: false },
      { name: "Name", type: "string", nullable: false },
    ],
  }
}

// NEW: Export all inline-related functions
