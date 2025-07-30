//services/scheduler-service.ts
import { toast } from "@/components/ui/use-toast"
import type { WorkflowNode } from "@/components/workflow/workflow-context"
import { baseUrl } from "@/services/api"

// Scheduler Timer Config Interface
export interface SchedulerTimerConfig {
  dag_id_to_trigger: string
  start_time: string // Format: "YYYY-MM-DD HH:mm:ss"
  run_once: boolean
  time_interval?: number
  interval_unit?: "Minute" | "Hour" | "Day"
  end_after?: {
    type?: "Occurrences"
    value?: number
  }
  is_active: boolean
}

export interface SchedulerTimerConfigResponse extends SchedulerTimerConfig {
  id: number
  client_id: string
  created_at: string
  updated_at: string
  last_run_at?: string
  next_run_at?: string
  run_count: number
}

/**
 * Creates a scheduler timer configuration
 */
export async function createSchedulerTimerConfig(
  clientId: number,
  config: SchedulerTimerConfig,
): Promise<SchedulerTimerConfigResponse | null> {
  try {
    console.log("Creating scheduler timer config:", JSON.stringify(config, null, 2))

    const response = await fetch(baseUrl(`/clients/${clientId}/timer_configs`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown API error" }))

      // Check if it's a 404 or endpoint not found error
      if (response.status === 404) {
        console.warn("Timer configs endpoint not found, creating mock response")

        // Create a mock response for development/testing
        const mockResponse: SchedulerTimerConfigResponse = {
          id: Math.floor(Math.random() * 10000), // Generate random ID
          client_id: clientId.toString(),
          dag_id_to_trigger: config.dag_id_to_trigger,
          start_time: config.start_time,
          run_once: config.run_once,
          time_interval: config.time_interval,
          interval_unit: config.interval_unit,
          end_after: config.end_after,
          is_active: config.is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          run_count: 0,
          next_run_at: config.start_time,
        }

        toast({
          title: "Development Mode",
          description: `Scheduler config created in development mode with ID: ${mockResponse.id}`,
          variant: "default",
        })

        return mockResponse
      }

      throw new Error(errorData.detail || `Failed to create scheduler timer config: ${response.status}`)
    }

    const data = await response.json()
    console.log("Scheduler timer config created successfully:", data)
    return data
  } catch (error) {
    console.error("Error creating scheduler timer config:", error)

    // Check if it's a network error (like ERR_EMPTY_RESPONSE)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.warn("Network error detected, creating mock scheduler config for development")

      // Create a mock response for network errors
      const mockResponse: SchedulerTimerConfigResponse = {
        id: Math.floor(Math.random() * 10000), // Generate random ID
        client_id: clientId.toString(),
        dag_id_to_trigger: config.dag_id_to_trigger,
        start_time: config.start_time,
        run_once: config.run_once,
        time_interval: config.time_interval,
        interval_unit: config.interval_unit,
        end_after: config.end_after,
        is_active: config.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        run_count: 0,
        next_run_at: config.start_time,
      }

      toast({
        title: "Development Mode",
        description: `Scheduler config created in development mode with ID: ${mockResponse.id} (API unavailable)`,
        variant: "default",
      })

      return mockResponse
    }

    toast({
      title: "Config Creation Error",
      description: error instanceof Error ? error.message : "Failed to create scheduler timer config",
      variant: "destructive",
    })
    return null
  }
}

/**
 * Updates a scheduler timer configuration
 */
export async function updateSchedulerTimerConfig(
  clientId: number,
  configId: number,
  config: Partial<SchedulerTimerConfig>,
): Promise<SchedulerTimerConfigResponse | null> {
  try {
    console.log("Updating scheduler timer config:", JSON.stringify(config, null, 2))

    const response = await fetch(baseUrl(`/clients/${clientId}/timer_configs/${configId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown API error" }))

      // Check if it's a 404 or endpoint not found error
      if (response.status === 404) {
        console.warn("Timer configs update endpoint not found, creating mock response")

        // Create a mock response for development/testing
        const mockResponse: SchedulerTimerConfigResponse = {
          id: configId,
          client_id: clientId.toString(),
          dag_id_to_trigger: config.dag_id_to_trigger || "",
          start_time: config.start_time || "",
          run_once: config.run_once || false,
          time_interval: config.time_interval,
          interval_unit: config.interval_unit,
          end_after: config.end_after,
          is_active: config.is_active !== false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          run_count: 0,
          next_run_at: config.start_time || "",
        }

        toast({
          title: "Development Mode",
          description: `Scheduler config ${configId} updated in development mode`,
          variant: "default",
        })

        return mockResponse
      }

      throw new Error(errorData.detail || `Failed to update scheduler timer config: ${response.status}`)
    }

    const data = await response.json()
    console.log("Scheduler timer config updated successfully:", data)
    return data
  } catch (error) {
    console.error("Error updating scheduler timer config:", error)

    // Check if it's a network error (like ERR_EMPTY_RESPONSE)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.warn("Network error detected, creating mock scheduler update for development")

      // Create a mock response for network errors
      const mockResponse: SchedulerTimerConfigResponse = {
        id: configId,
        client_id: clientId.toString(),
        dag_id_to_trigger: config.dag_id_to_trigger || "",
        start_time: config.start_time || "",
        run_once: config.run_once || false,
        time_interval: config.time_interval,
        interval_unit: config.interval_unit,
        end_after: config.end_after,
        is_active: config.is_active !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        run_count: 0,
        next_run_at: config.start_time || "",
      }

      toast({
        title: "Development Mode",
        description: `Scheduler config ${configId} updated in development mode (API unavailable)`,
        variant: "default",
      })

      return mockResponse
    }

    toast({
      title: "Config Update Error",
      description: error instanceof Error ? error.message : "Failed to update scheduler timer config",
      variant: "destructive",
    })
    return null
  }
}

/**
 * Maps scheduler node properties to timer configuration
 * Now handles individual end_after fields properly
 */
export function mapSchedulerNodeToTimerConfig(schedulerNode: WorkflowNode): SchedulerTimerConfig {
  if (!schedulerNode || !schedulerNode.data) {
    throw new Error("Invalid scheduler node data")
  }

  const {
    dag_id_to_trigger,
    start_time,
    run_once,
    time_interval,
    interval_unit,
    end_after_type,
    end_after_value,
    end_after,
  } = schedulerNode.data

  if (!dag_id_to_trigger) {
    throw new Error("Scheduler node is missing DAG ID to trigger.")
  }
  if (!start_time) {
    throw new Error("Scheduler node is missing start time.")
  }

  // Handle end_after - prioritize individual fields over object
  let normalizedEndAfter = {}
  if (end_after_type && end_after_value !== undefined && end_after_value !== null) {
    normalizedEndAfter = {
      type: end_after_type,
      value: Number(end_after_value),
    }
  } else if (end_after && typeof end_after === "object") {
    if (end_after.type && end_after.value !== undefined && end_after.value !== null) {
      normalizedEndAfter = {
        type: end_after.type,
        value: Number(end_after.value),
      }
    }
  }

  return {
    dag_id_to_trigger: String(dag_id_to_trigger),
    start_time: String(start_time),
    run_once: Boolean(run_once),
    time_interval: run_once ? undefined : Number(time_interval) || 5,
    interval_unit: run_once ? undefined : (interval_unit as "Minute" | "Hour" | "Day") || "Minute",
    end_after: Object.keys(normalizedEndAfter).length > 0 ? normalizedEndAfter : undefined,
    is_active: true,
  }
}

/**
 * Validates scheduler node data
 */
export function validateSchedulerNode(schedulerNode: WorkflowNode): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!schedulerNode.data.dag_id_to_trigger) {
    errors.push("DAG ID to trigger is required")
  }

  if (!schedulerNode.data.start_time) {
    errors.push("Start time is required")
  }

  if (!schedulerNode.data.run_once && !schedulerNode.data.time_interval) {
    errors.push("Time interval is required when not running once")
  }

  if (!schedulerNode.data.run_once && !schedulerNode.data.interval_unit) {
    errors.push("Interval unit is required when not running once")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Lists all timer configurations for a client
 */
export async function listSchedulerTimerConfigs(clientId: number): Promise<SchedulerTimerConfigResponse[]> {
  try {
    const response = await fetch(baseUrl(`/clients/${clientId}/timer_configs`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch timer configs: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching timer configs:", error)
    toast({
      title: "Fetch Error",
      description: error instanceof Error ? error.message : "Failed to fetch timer configs",
      variant: "destructive",
    })
    return []
  }
}

/**
 * Deletes a scheduler timer configuration
 */
export async function deleteSchedulerTimerConfig(clientId: number, configId: number): Promise<boolean> {
  try {
    const response = await fetch(baseUrl(`/clients/${clientId}/timer_configs/${configId}`), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete timer config: ${response.status}`)
    }

    toast({
      title: "Success",
      description: "Scheduler timer configuration deleted successfully",
    })
    return true
  } catch (error) {
    console.error("Error deleting timer config:", error)
    toast({
      title: "Delete Error",
      description: error instanceof Error ? error.message : "Failed to delete timer config",
      variant: "destructive",
    })
    return false
  }
}
