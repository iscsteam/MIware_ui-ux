// Define types for API responses
import { baseUrl } from "@/services/api";


export interface DAG {
    id: number
    name: string
    dag_id: string
    schedule: string | null
    active: boolean
    dag_sequence: Array<{
      id: string
      type: string
      config_id: number
      next: string[]
    }>
    active_dag_run: number | null
    created_at: string
    updated_at: string
  }
  
  // Service for workflow API calls
  export const WorkflowService = {
    // Create a new workflow
    async createWorkflow(data: { name: string; schedule: string; active: boolean }): Promise<DAG> {
      try {
        const response = await fetch(`${baseUrl}/dags/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || "Failed to create workflow")
        }
  
        return await response.json()
      } catch (error) {
        console.error("Error creating workflow:", error)
        throw error
      }
    },
  
    // Update an existing workflow
    async updateWorkflow(dagId: string, data: any): Promise<DAG> {
      try {
        const response = await fetch(`${baseUrl}/dags/${dagId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || "Failed to update workflow")
        }
  
        return await response.json()
      } catch (error) {
        console.error("Error updating workflow:", error)
        throw error
      }
    },
  
    // Get workflow by ID
    async getWorkflow(dagId: string): Promise<DAG> {
      try {
        const response = await fetch(`${baseUrl}/dags/${dagId}`)
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || "Failed to fetch workflow")
        }
  
        return await response.json()
      } catch (error) {
        console.error("Error fetching workflow:", error)
        throw error
      }
    },
  
    // List all workflows
    async listWorkflows(): Promise<DAG[]> {
      try {
        const response = await fetch(`${baseUrl}/dags/`)
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || "Failed to list workflows")
        }
  
        return await response.json()
      } catch (error) {
        console.error("Error listing workflows:", error)
        throw error
      }
    },
  }
  