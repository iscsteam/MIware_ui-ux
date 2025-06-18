// services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"

export const baseUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  return `${API_BASE_URL}/${cleanPath}`
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
      console.log(`[API] Using currentCollection: ${currentCollection}`)
      return currentCollection.trim()
    }

    // Fallback to currentWorkflow.collection
    const currentWorkflow = localStorage.getItem("currentWorkflow")
    if (currentWorkflow) {
      const workflowData = JSON.parse(currentWorkflow)
      if (workflowData.collection && workflowData.collection.trim()) {
        console.log(`[API] Using collection from currentWorkflow: ${workflowData.collection}`)
        return workflowData.collection.trim()
      }
    }
  } catch (error) {
    console.warn("[API] Error reading collection from localStorage:", error)
  }

  throw new Error("No collection context found. Please select a collection first.")
}

// MongoDB API endpoints
export const MONGODB_ENDPOINTS = {
  INSERT_OR_UPDATE_DATA: (collection: string, dagId: string) =>
    `/mongo/insert_data_to_collections_or_update/${collection}?dag_id=${dagId}`,
  GET_DATA: (collection: string) => `/mongo/get_data_from_collection_with_dag_id/${collection}`,
  UPDATE_DATA: (collection: string, dagId: string) => `/mongo/update_data/${collection}?dag_id=${dagId}`,
  DELETE_DATA_WITH_DAG_ID: (collection: string, dagId: string) =>
    `/mongo/delete_data_with_dag_id/${collection}?dag_id=${dagId}`,
} as const

// DAG API endpoints
export const DAG_ENDPOINTS = {
  LIST_DAGS: "/dags",
  GET_DAG: (dagId: string) => `/dags/${dagId}`,
  CREATE_DAG: "/dags",
  UPDATE_DAG: (dagId: string) => `/dags/${dagId}`,
  DELETE_DAG: (dagId: string) => `/dags/${dagId}`,
} as const

// Helper function for MongoDB API calls
export const mongoAPI = {
  insertOrUpdate: (data: any, dagId: string, collection?: string) => {
    const targetCollection = collection || getCurrentCollection()
    console.log(`[API] insertOrUpdate using collection: ${targetCollection}`)
    return fetch(baseUrl(MONGODB_ENDPOINTS.INSERT_OR_UPDATE_DATA(targetCollection, dagId)), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  },

  get: (query?: Record<string, string>, collection?: string) => {
    const targetCollection = collection || getCurrentCollection()
    console.log(`[API] get using collection: ${targetCollection}`)
    const url = new URL(baseUrl(MONGODB_ENDPOINTS.GET_DATA(targetCollection)))
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }
    return fetch(url.toString())
  },

  update: (data: any, dagId: string, collection?: string) => {
    const targetCollection = collection || getCurrentCollection()
    console.log(`[API] update using collection: ${targetCollection}`)
    return fetch(baseUrl(MONGODB_ENDPOINTS.UPDATE_DATA(targetCollection, dagId)), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  },

  deleteByDagId: (dagId: string, collection?: string) => {
    const targetCollection = collection || getCurrentCollection()
    console.log(`[API] deleteByDagId using collection: ${targetCollection}`)
    return fetch(baseUrl(MONGODB_ENDPOINTS.DELETE_DATA_WITH_DAG_ID(targetCollection, dagId)), {
      method: "DELETE",
    })
  },

  // New method specifically for getting all workflows (without dag_id filter)
  getAllWorkflows: (collection?: string) => {
    const targetCollection = collection || getCurrentCollection()
    console.log(`[API] getAllWorkflows using collection: ${targetCollection}`)
    return fetch(baseUrl(MONGODB_ENDPOINTS.GET_DATA(targetCollection)))
  },

  // New method specifically for getting a workflow by dag_id
  getWorkflowByDagId: (dagId: string, collection?: string) => {
    const targetCollection = collection || getCurrentCollection()
    console.log(`[API] getWorkflowByDagId using collection: ${targetCollection}`)
    const url = new URL(baseUrl(MONGODB_ENDPOINTS.GET_DATA(targetCollection)))
    url.searchParams.append("dag_id", dagId)
    return fetch(url.toString())
  },

  // Legacy methods (deprecated)
  insert: (data: any, collection?: string) => {
    console.warn("mongoAPI.insert is deprecated. Use mongoAPI.insertOrUpdate with dagId instead.")
    throw new Error("Use mongoAPI.insertOrUpdate(data, dagId, collection) instead")
  },

  delete: (dagId: string, collection?: string) => {
    console.warn("mongoAPI.delete is deprecated. Use mongoAPI.deleteByDagId instead.")
    return mongoAPI.deleteByDagId(dagId, collection)
  },
}
