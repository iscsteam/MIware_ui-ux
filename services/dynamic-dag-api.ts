// const BASE_URL = "http://localhost:58103"

// export interface DAG {
//   id: string
//   dag_id: string
//   type: string
//   name?: string
//   description?: string
//   status?: string
//   trigger_id?: string
//   last_run?: string
//   created_at?: string
//   config_data?: any
// }

// export interface DAGStatus {
//   status: string
//   trigger_id: string
//   started_at?: string
//   ended_at?: string
//   duration?: number
//   logs?: string
//   error_message?: string
// }

// export interface TriggerRunResponse {
//   trigger_id: string
//   status: string
//   message: string
// }

// // API endpoints as specified
// const API_ENDPOINTS = {
//   listCreateDAGs: "dags/",
//   manageDAG: (dagId: string) => `dags/${dagId}`,
//   triggerrun: (dagId: string) => `dag_runs/${dagId}/trigger_run`,
//   getDAGStatus: (dagId: string, triggerId: string) => `dag_runs/${dagId}/triggers/${triggerId}`,
// }

// export async function fetchAllDAGs(clientId: number): Promise<DAG[]> {
//   try {
//     const response = await fetch(`${BASE_URL}/clients/${clientId}/${API_ENDPOINTS.listCreateDAGs}`)

//     if (!response.ok) {
//       throw new Error(`Failed to fetch DAGs: ${response.statusText}`)
//     }

//     const dags = await response.json()

//     // Transform and normalize DAG data
//     return dags.map((dag: any) => ({
//       id: dag.id || dag.dag_id,
//       dag_id: dag.dag_id,
//       type: dag.type || "unknown",
//       name: dag.name || dag.dag_id,
//       description: dag.description,
//       status: dag.status || "idle",
//       trigger_id: dag.trigger_id,
//       last_run: dag.last_run,
//       created_at: dag.created_at,
//       config_data: dag.config_data || dag,
//     }))
//   } catch (error) {
//     console.error("Error fetching DAGs:", error)
//     throw error
//   }
// }

// export async function triggerDAGRun(dagId: string): Promise<TriggerRunResponse> {
//   try {
//     const response = await fetch(`${BASE_URL}/${API_ENDPOINTS.triggerrun(dagId)}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })

//     if (!response.ok) {
//       throw new Error(`Failed to trigger DAG run: ${response.statusText}`)
//     }

//     const result = await response.json()
//     return {
//       trigger_id: result.trigger_id || result.run_id,
//       status: result.status || "triggered",
//       message: result.message || "DAG run triggered successfully",
//     }
//   } catch (error) {
//     console.error(`Error triggering DAG run for ${dagId}:`, error)
//     throw error
//   }
// }

// export async function getDAGStatus(dagId: string, triggerId: string): Promise<DAGStatus> {
//   try {
//     const response = await fetch(`${BASE_URL}/${API_ENDPOINTS.getDAGStatus(dagId, triggerId)}`)

//     if (!response.ok) {
//       throw new Error(`Failed to get DAG status: ${response.statusText}`)
//     }

//     const status = await response.json()
//     return {
//       status: status.status || "unknown",
//       trigger_id: triggerId,
//       started_at: status.started_at,
//       ended_at: status.ended_at,
//       duration: status.duration,
//       logs: status.logs,
//       error_message: status.error_message,
//     }
//   } catch (error) {
//     console.error(`Error getting DAG status for ${dagId}/${triggerId}:`, error)
//     throw error
//   }
// }

// export async function manageDAG(dagId: string, action: "pause" | "unpause" | "delete"): Promise<void> {
//   try {
//     const response = await fetch(`${BASE_URL}/${API_ENDPOINTS.manageDAG(dagId)}`, {
//       method: action === "delete" ? "DELETE" : "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: action !== "delete" ? JSON.stringify({ action }) : undefined,
//     })

//     if (!response.ok) {
//       throw new Error(`Failed to ${action} DAG: ${response.statusText}`)
//     }
//   } catch (error) {
//     console.error(`Error managing DAG ${dagId}:`, error)
//     throw error
//   }
// }

// // Group DAGs by type dynamically
// export function groupDAGsByType(dags: DAG[]): Record<string, DAG[]> {
//   return dags.reduce(
//     (acc, dag) => {
//       const type = dag.type || "unknown"
//       if (!acc[type]) {
//         acc[type] = []
//       }
//       acc[type].push(dag)
//       return acc
//     },
//     {} as Record<string, DAG[]>,
//   )
// }

// // Mock data for development
// export function getMockDAGs(): DAG[] {
//   return [
//     {
//       id: "1",
//       dag_id: "file_conversion_001",
//       type: "file-conversion",
//       name: "CSV to JSON Converter",
//       status: "success",
//       trigger_id: "trigger_001",
//       last_run: "2024-01-15T10:30:00Z",
//     },
//     {
//       id: "2",
//       dag_id: "salesforce_read_001",
//       type: "salesforce-read",
//       name: "Account Data Extract",
//       status: "running",
//       trigger_id: "trigger_002",
//       last_run: "2024-01-15T11:00:00Z",
//     },
//     {
//       id: "3",
//       dag_id: "cli_operator_001",
//       type: "cli",
//       name: "Data Processing Script",
//       status: "failed",
//       trigger_id: "trigger_003",
//       last_run: "2024-01-15T09:45:00Z",
//     },
//     {
//       id: "4",
//       dag_id: "data_cleaning_001",
//       type: "data-cleaning",
//       name: "Customer Data Cleaner",
//       status: "idle",
//       last_run: "2024-01-14T16:20:00Z",
//     },
//     {
//       id: "5",
//       dag_id: "ml_pipeline_001",
//       type: "machine-learning",
//       name: "Prediction Model Training",
//       status: "success",
//       trigger_id: "trigger_005",
//       last_run: "2024-01-15T08:15:00Z",
//     },
//   ]
// }
