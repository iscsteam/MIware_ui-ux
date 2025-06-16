// services/dag-sync-service.ts
import { fetchDAGs } from "./dagService"
import { mongoAPI } from "./api"

/**
 * Service to synchronize DAG IDs between Airflow and MongoDB
 */

export interface DagSyncResult {
  success: boolean
  airflowDagId?: string
  mongodbDagId?: string
  message: string
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
      console.log(`[DagSyncService] Using currentCollection: ${currentCollection}`)
      return currentCollection.trim()
    }

    // Fallback to currentWorkflow.collection
    const currentWorkflow = localStorage.getItem("currentWorkflow")
    if (currentWorkflow) {
      const workflowData = JSON.parse(currentWorkflow)
      if (workflowData.collection && workflowData.collection.trim()) {
        console.log(`[DagSyncService] Using collection from currentWorkflow: ${workflowData.collection}`)
        return workflowData.collection.trim()
      }
    }
  } catch (error) {
    console.warn("[DagSyncService] Error reading collection from localStorage:", error)
  }

  throw new Error("No collection context found. Please select a collection first.")
}

/**
 * Find the actual DAG ID in Airflow that corresponds to a workflow
 */
export async function findAirflowDagId(workflowName: string, frontendDagId: string): Promise<string | null> {
  try {
    console.log(`[DagSyncService] Looking for DAG in Airflow for workflow: ${workflowName}`)

    const dags = await fetchDAGs()
    if (!dags) {
      console.warn("[DagSyncService] Could not fetch DAGs from Airflow")
      return null
    }

    // Try to find matching DAG by various criteria
    const matchingDAG = dags.find((dag) => {
      // Exact match on frontend DAG ID
      if (dag.dag_id === frontendDagId) return true

      // Match by workflow name
      if (dag.name === workflowName) return true

      // Match by DAG ID containing the workflow name pattern
      const workflowPattern = workflowName.toLowerCase().replace(/[^a-z0-9]/g, "_")
      if (dag.dag_id.includes(workflowPattern)) return true

      return false
    })

    if (matchingDAG) {
      console.log(`[DagSyncService] Found matching DAG: ${matchingDAG.dag_id}`)
      return matchingDAG.dag_id
    }

    console.warn(`[DagSyncService] No matching DAG found for workflow: ${workflowName}`)
    return null
  } catch (error) {
    console.error("[DagSyncService] Error finding Airflow DAG ID:", error)
    return null
  }
}

/**
 * Synchronize a workflow's DAG ID between Airflow and MongoDB
 */
export async function syncWorkflowDagId(
  workflowName: string,
  frontendDagId: string,
  collectionName?: string,
): Promise<DagSyncResult> {
  const targetCollection = collectionName || getCurrentCollection()

  try {
    console.log(`[DagSyncService] Syncing DAG ID for workflow: ${workflowName} in collection: ${targetCollection}`)

    // Find the actual DAG ID in Airflow
    const airflowDagId = await findAirflowDagId(workflowName, frontendDagId)

    if (!airflowDagId) {
      return {
        success: false,
        mongodbDagId: frontendDagId,
        message: `Could not find corresponding DAG in Airflow for workflow: ${workflowName}`,
      }
    }

    // If the DAG IDs are the same, no sync needed
    if (airflowDagId === frontendDagId) {
      return {
        success: true,
        airflowDagId,
        mongodbDagId: frontendDagId,
        message: "DAG IDs are already synchronized",
      }
    }

    // Update MongoDB with the correct DAG ID
    try {
      // First, try to get the existing workflow data from MongoDB
      const existingResponse = await mongoAPI.get({ dag_id: frontendDagId }, targetCollection)

      if (existingResponse.ok) {
        const existingData = await existingResponse.json()

        if (existingData && Array.isArray(existingData) && existingData.length > 0) {
          const workflowData = existingData[0]

          // Update the metadata with the correct DAG ID
          const updatedWorkflowData = {
            ...workflowData,
            metadata: {
              ...workflowData.metadata,
              dag_id: airflowDagId,
              collection: targetCollection,
              updated_at: new Date().toISOString(),
              sync_note: `Synchronized with Airflow DAG ID: ${airflowDagId}`,
            },
          }

          // Delete the old record
          await mongoAPI.deleteByDagId(frontendDagId, targetCollection)

          // Insert with the new DAG ID
          const updateResponse = await mongoAPI.insertOrUpdate(updatedWorkflowData, airflowDagId, targetCollection)

          if (updateResponse.ok) {
            console.log(`[DagSyncService] Successfully updated MongoDB with Airflow DAG ID: ${airflowDagId}`)

            // Update localStorage as well
            const currentWorkflow = localStorage.getItem("currentWorkflow")
            if (currentWorkflow) {
              try {
                const workflowInfo = JSON.parse(currentWorkflow)
                workflowInfo.dag_id = airflowDagId
                workflowInfo.collection = targetCollection
                localStorage.setItem("currentWorkflow", JSON.stringify(workflowInfo))
                localStorage.setItem("currentCollection", targetCollection)
                console.log("[DagSyncService] Updated localStorage with synchronized DAG ID")
              } catch (error) {
                console.warn("[DagSyncService] Could not update localStorage:", error)
              }
            }

            return {
              success: true,
              airflowDagId,
              mongodbDagId: airflowDagId,
              message: `Successfully synchronized DAG ID from ${frontendDagId} to ${airflowDagId}`,
            }
          }
        }
      }

      // If we couldn't update existing data, just return the Airflow DAG ID
      return {
        success: true,
        airflowDagId,
        mongodbDagId: frontendDagId,
        message: `Found Airflow DAG ID: ${airflowDagId}, but could not update MongoDB. Use this ID for future operations.`,
      }
    } catch (mongoError) {
      console.warn("[DagSyncService] Could not update MongoDB, but found Airflow DAG ID:", mongoError)
      return {
        success: true,
        airflowDagId,
        mongodbDagId: frontendDagId,
        message: `Found Airflow DAG ID: ${airflowDagId}, but MongoDB update failed. Use this ID for operations.`,
      }
    }
  } catch (error) {
    console.error("[DagSyncService] Error during DAG ID synchronization:", error)
    return {
      success: false,
      mongodbDagId: frontendDagId,
      message: `Synchronization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

/**
 * Get the correct DAG ID to use for operations (prioritizes Airflow)
 */
export async function getCorrectDagId(
  workflowName: string,
  frontendDagId: string,
  collectionName?: string,
): Promise<string> {
  const syncResult = await syncWorkflowDagId(workflowName, frontendDagId, collectionName)

  if (syncResult.success && syncResult.airflowDagId) {
    return syncResult.airflowDagId
  }

  // Fallback to frontend DAG ID if sync fails
  return frontendDagId
}
