// services/workflow-position-service.ts
import { mongoAPI } from "./api"

export interface NodePosition {
  x: number
  y: number
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
}

export interface WorkflowNode {
  id: string
  type: string
  position: NodePosition
  data: WorkflowNodeData
  status?: string
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

export interface WorkflowMetadata {
  name: string
  dag_id: string
  exported_at?: string
  schedule?: string | null
  created_at?: string
  updated_at?: string
  collection?: string
}

// Full workflow document structure for MongoDB
export interface WorkflowDocument {
  nodes: WorkflowNode[]
  connections: NodeConnection[]
  metadata: WorkflowMetadata
  _id?: string // MongoDB's default primary key, optional for type safety
}

/**
 * Get the current collection name from localStorage
 * Priority: currentCollection > currentWorkflow.collection > throw error
 */
function getCurrentCollection(): string {
  try {
    // First check for explicit currentCollection
    const currentCollection = localStorage.getItem("currentCollection")
    if (currentCollection && currentCollection.trim()) {
      console.log(`[WorkflowPositionService] Using currentCollection: ${currentCollection}`)
      return currentCollection.trim()
    }

    // Fallback to currentWorkflow.collection
    const currentWorkflow = localStorage.getItem("currentWorkflow")
    if (currentWorkflow) {
      const workflowData = JSON.parse(currentWorkflow)
      if (workflowData.collection && workflowData.collection.trim()) {
        console.log(`[WorkflowPositionService] Using collection from currentWorkflow: ${workflowData.collection}`)
        return workflowData.collection.trim()
      }
    }
  } catch (error) {
    console.warn("[WorkflowPositionService] Error reading collection from localStorage:", error)
  }

  throw new Error("No collection context found. Please select a collection first.")
}

/**
 * Saves complete workflow data to MongoDB.
 * Uses the insert_data_to_collections_or_update endpoint with dag_id in the URL.
 *
 * @param nodes Array of workflow nodes with positions
 * @param connections Array of node connections
 * @param metadata Workflow metadata including name, dag_id, etc.
 * @param collectionName Optional collection name, if not provided will get from localStorage
 */
export async function saveWorkflowToMongoDB(
  nodes: WorkflowNode[],
  connections: NodeConnection[],
  metadata: WorkflowMetadata,
  collectionName?: string,
): Promise<void> {
  const targetCollection = collectionName || getCurrentCollection()
  console.log(
    `[WorkflowPositionService] Saving complete workflow for ${metadata.dag_id} to collection: ${targetCollection}`,
  )

  try {
    // Always use the DAG ID from the metadata parameter (which comes from Airflow)
    const actualDagId = metadata.dag_id
    console.log(`[WorkflowPositionService] Using DAG ID: ${actualDagId}`)

    if (!actualDagId || actualDagId.trim() === "") {
      throw new Error("DAG ID is required for saving workflow")
    }

    const payload: WorkflowDocument = {
      nodes,
      connections,
      metadata: {
        ...metadata,
        dag_id: actualDagId,
        collection: targetCollection,
        exported_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }

    console.log(`[WorkflowPositionService] Payload being sent:`, {
      ...payload,
      nodes: `${payload.nodes.length} nodes`,
      connections: `${payload.connections.length} connections`,
      metadata: payload.metadata,
    })

    // Use the new insertOrUpdate method with dag_id in URL
    console.log(`[WorkflowPositionService] Calling insertOrUpdate for ${actualDagId}`)
    console.log(
      `[WorkflowPositionService] URL will be: /mongo/insert_data_to_collections_or_update/${targetCollection}?dag_id=${actualDagId}`,
    )

    const response = await mongoAPI.insertOrUpdate(payload, actualDagId, targetCollection)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[WorkflowPositionService] Error response:`, errorText)
      throw new Error(`Failed to save workflow to MongoDB for ${actualDagId}: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log(`[WorkflowPositionService] Successfully saved complete workflow for ${actualDagId}. Response:`, result)
  } catch (error) {
    console.error(`[WorkflowPositionService] Error saving workflow for ${metadata.dag_id}:`, error)
    throw error
  }
}

/**
 * Loads complete workflow data from MongoDB.
 * Fetches data from the specified collection, filtering by 'dag_id'.
 *
 * @param dagId The ID of the workflow (corresponds to 'dag_id' in your MongoDB documents).
 * @param collectionName Optional collection name, if not provided will get from localStorage
 * @returns Complete workflow document or null if not found/error.
 */
export async function loadWorkflowFromMongoDB(
  dagId: string,
  collectionName?: string,
): Promise<WorkflowDocument | null> {
  const targetCollection = collectionName || getCurrentCollection()
  console.log(`[WorkflowPositionService] Loading complete workflow for ${dagId} from collection: ${targetCollection}`)

  try {
    // Use the specific method for getting workflow by dag_id
    const response = await mongoAPI.getWorkflowByDagId(dagId, targetCollection)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[WorkflowPositionService] Error response:`, errorText)

      // If it's a 404, that's expected for non-existent workflows
      if (response.status === 404) {
        console.log(`[WorkflowPositionService] No workflow found for ${dagId} (404 - not found)`)
        return null
      }

      throw new Error(`Failed to load workflow from MongoDB for ${dagId}: ${response.status} ${errorText}`)
    }

    // The API returns an array of documents that match the query
    const data: WorkflowDocument[] = await response.json()
    console.log(`[WorkflowPositionService] Raw response data:`, {
      isArray: Array.isArray(data),
      length: data?.length,
      firstItem: data?.[0]
        ? {
            hasNodes: !!data[0].nodes,
            hasConnections: !!data[0].connections,
            hasMetadata: !!data[0].metadata,
            nodeCount: data[0].nodes?.length,
            connectionCount: data[0].connections?.length,
            dagId: data[0].metadata?.dag_id,
          }
        : null,
    })

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`[WorkflowPositionService] No workflow found for ${dagId} in the response.`)
      return null
    }

    // Find the document that matches our dag_id in metadata
    const matchingDocument = data.find((doc) => {
      // Check if the document has the expected structure
      if (doc.metadata && doc.metadata.dag_id === dagId) {
        return true
      }
      // Also check if the document itself has a dag_id field (in case structure is different)
      if ((doc as any).dag_id === dagId) {
        return true
      }
      return false
    })

    if (matchingDocument) {
      // Validate the document structure
      if (!matchingDocument.nodes || !Array.isArray(matchingDocument.nodes)) {
        console.warn(`[WorkflowPositionService] Invalid nodes data for ${dagId}`)
        return null
      }

      if (!matchingDocument.connections || !Array.isArray(matchingDocument.connections)) {
        console.warn(`[WorkflowPositionService] Invalid connections data for ${dagId}`)
        return null
      }

      if (!matchingDocument.metadata) {
        console.warn(`[WorkflowPositionService] Missing metadata for ${dagId}`)
        return null
      }

      console.log(`[WorkflowPositionService] Successfully loaded workflow for ${dagId}:`, {
        nodeCount: matchingDocument.nodes.length,
        connectionCount: matchingDocument.connections.length,
        metadata: matchingDocument.metadata,
      })

      return matchingDocument
    } else {
      console.warn(`[WorkflowPositionService] No matching document found for dag_id ${dagId} in response.`)
      console.log(
        `[WorkflowPositionService] Available documents:`,
        data.map((doc, index) => ({
          index,
          metadata: doc.metadata,
          hasNodes: !!doc.nodes,
          hasConnections: !!doc.connections,
          nodeCount: doc.nodes?.length,
          connectionCount: doc.connections?.length,
        })),
      )
      return null
    }
  } catch (error) {
    console.error(`[WorkflowPositionService] Error loading workflow for ${dagId}:`, error)
    return null
  }
}

/**
 * Delete a workflow from MongoDB using the new delete endpoint
 * @param dagId The workflow DAG ID to delete
 * @param collectionName Optional collection name, if not provided will get from localStorage
 */
export async function deleteWorkflowFromMongoDB(dagId: string, collectionName?: string): Promise<boolean> {
  const targetCollection = collectionName || getCurrentCollection()
  console.log(`[WorkflowPositionService] Deleting workflow for ${dagId} from collection: ${targetCollection}`)

  try {
    console.log(
      `[WorkflowPositionService] URL will be: /mongo/delete_data_with_dag_id/${targetCollection}?dag_id=${dagId}`,
    )
    const response = await mongoAPI.deleteByDagId(dagId, targetCollection)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[WorkflowPositionService] Error deleting workflow:`, errorText)
      return false
    }

    const result = await response.json()
    console.log(`[WorkflowPositionService] Successfully deleted workflow for ${dagId}:`, result)
    return true
  } catch (error) {
    console.error(`[WorkflowPositionService] Error deleting workflow for ${dagId}:`, error)
    return false
  }
}

/**
 * List all workflows in MongoDB
 * @param collectionName Optional collection name, if not provided will get from localStorage
 */
export async function listWorkflowsFromMongoDB(collectionName?: string): Promise<WorkflowDocument[]> {
  const targetCollection = collectionName || getCurrentCollection()
  console.log(`[WorkflowPositionService] Loading all workflows from MongoDB collection: ${targetCollection}`)

  try {
    // Use the method to get all workflows
    const response = await mongoAPI.getAllWorkflows(targetCollection)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[WorkflowPositionService] Error loading workflows:`, errorText)
      return []
    }

    const data: WorkflowDocument[] = await response.json()
    console.log(`[WorkflowPositionService] Successfully loaded ${data?.length || 0} workflows from MongoDB`)

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error(`[WorkflowPositionService] Error loading workflows:`, error)
    return []
  }
}

// Keep the old functions for backward compatibility if needed elsewhere
export async function saveWorkflowPositions(
  workflowId: string,
  positions: Record<string, NodePosition>,
): Promise<void> {
  console.log(`[WorkflowPositionService] DEPRECATED: saveWorkflowPositions called. Use saveWorkflowToMongoDB instead.`)
  // This function is now deprecated in favor of saveWorkflowToMongoDB
}

export async function loadWorkflowPositions(workflowId: string): Promise<Record<string, NodePosition> | null> {
  console.log(
    `[WorkflowPositionService] DEPRECATED: loadWorkflowPositions called. Use loadWorkflowFromMongoDB instead.`,
  )
  // This function is now deprecated in favor of loadWorkflowFromMongoDB
  return null
}
