// services/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"

export const baseUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  return `${API_BASE_URL}/${cleanPath}`
}

// MongoDB API endpoints
export const MONGODB_ENDPOINTS = {
  INSERT_DATA: "/mongo/insert_data_to_collections/miware_test",
  GET_DATA: "/mongo/get_data/miware_test",
  UPDATE_DATA: "/mongo/update_data/miware_test",
  DELETE_DATA: "/mongo/delete_data/miware_test",
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
  insert: (data: any) =>
    fetch(baseUrl(MONGODB_ENDPOINTS.INSERT_DATA), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  get: (query?: Record<string, string>) => {
    const url = new URL(baseUrl(MONGODB_ENDPOINTS.GET_DATA))
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }
    return fetch(url.toString())
  },

  update: (data: any, query?: Record<string, string>) => {
    const url = new URL(baseUrl(MONGODB_ENDPOINTS.UPDATE_DATA))
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }
    return fetch(url.toString(), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  },

  delete: (query: Record<string, string>) => {
    const url = new URL(baseUrl(MONGODB_ENDPOINTS.DELETE_DATA))
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
    return fetch(url.toString(), { method: "DELETE" })
  },
}
