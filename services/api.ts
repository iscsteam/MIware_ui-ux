// // services/api.ts
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"

// export const baseUrl = (path: string): string => {
//   // Remove leading slash if present to avoid double slashes
//   const cleanPath = path.startsWith("/") ? path.slice(1) : path
//   return `${API_BASE_URL}/${cleanPath}`
// }

// // MongoDB API endpoints
// export const MONGODB_ENDPOINTS = {
//   INSERT_DATA: "/mongo/insert_data_to_collections/miware_test",
//   GET_DATA: "/mongo/get_data/miware_test",
//   UPDATE_DATA: "/mongo/update_data/miware_test",
//   DELETE_DATA: "/mongo/delete_data/miware_test",
// } as const

// // DAG API endpoints
// export const DAG_ENDPOINTS = {
//   LIST_DAGS: "/dags",
//   GET_DAG: (dagId: string) => `/dags/${dagId}`,
//   CREATE_DAG: "/dags",
//   UPDATE_DAG: (dagId: string) => `/dags/${dagId}`,
//   DELETE_DAG: (dagId: string) => `/dags/${dagId}`,
// } as const

// // Helper function for MongoDB API calls
// export const mongoAPI = {
//   insert: (data: any) =>
//     fetch(baseUrl(MONGODB_ENDPOINTS.INSERT_DATA), {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     }),

//   get: (query?: Record<string, string>) => {
//     const url = new URL(baseUrl(MONGODB_ENDPOINTS.GET_DATA))
//     if (query) {
//       Object.entries(query).forEach(([key, value]) => {
//         url.searchParams.append(key, value)
//       })
//     }
//     return fetch(url.toString())
//   },

//   update: (data: any, query?: Record<string, string>) => {
//     const url = new URL(baseUrl(MONGODB_ENDPOINTS.UPDATE_DATA))
//     if (query) {
//       Object.entries(query).forEach(([key, value]) => {
//         url.searchParams.append(key, value)
//       })
//     }
//     return fetch(url.toString(), {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     })
//   },

//   delete: (query: Record<string, string>) => {
//     const url = new URL(baseUrl(MONGODB_ENDPOINTS.DELETE_DATA))
//     Object.entries(query).forEach(([key, value]) => {
//       url.searchParams.append(key, value)
//     })
//     return fetch(url.toString(), { method: "DELETE" })
//   },
// }

// services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"

export const baseUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  return `${API_BASE_URL}/${cleanPath}`
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
  insertOrUpdate: (data: any, dagId: string, collection = "mi_ware") =>
    fetch(baseUrl(MONGODB_ENDPOINTS.INSERT_OR_UPDATE_DATA(collection, dagId)), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  get: (query?: Record<string, string>, collection = "mi_ware") => {
    const url = new URL(baseUrl(MONGODB_ENDPOINTS.GET_DATA(collection)))
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }
    return fetch(url.toString())
  },

  update: (data: any, dagId: string, collection = "mi_ware") => {
    return fetch(baseUrl(MONGODB_ENDPOINTS.UPDATE_DATA(collection, dagId)), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  },

  deleteByDagId: (dagId: string, collection = "mi_ware") => {
    return fetch(baseUrl(MONGODB_ENDPOINTS.DELETE_DATA_WITH_DAG_ID(collection, dagId)), {
      method: "DELETE",
    })
  },

  // New method specifically for getting all workflows (without dag_id filter)
  getAllWorkflows: (collection = "mi_ware") => {
    return fetch(baseUrl(MONGODB_ENDPOINTS.GET_DATA(collection)))
  },

  // New method specifically for getting a workflow by dag_id
  getWorkflowByDagId: (dagId: string, collection = "mi_ware") => {
    const url = new URL(baseUrl(MONGODB_ENDPOINTS.GET_DATA(collection)))
    url.searchParams.append("dag_id", dagId)
    return fetch(url.toString())
  },

  // Legacy methods (deprecated)
  insert: (data: any, collection = "mi_ware") => {
    console.warn("mongoAPI.insert is deprecated. Use mongoAPI.insertOrUpdate with dagId instead.")
    throw new Error("Use mongoAPI.insertOrUpdate(data, dagId, collection) instead")
  },

  delete: (dagId: string, collection = "mi_ware") => {
    console.warn("mongoAPI.delete is deprecated. Use mongoAPI.deleteByDagId instead.")
    return mongoAPI.deleteByDagId(dagId, collection)
  },
}
