// 

import { baseUrl } from "@/services/api"; // Assuming this handles base URLs etc.
import { URLS } from "./url"; // Assuming this contains endpoint constants

interface ConfigItem {
  id: string
  dag_id: string
  trigger_id?: string
  name?: string
  status?: string
  type: "file_conversion" | "read_salesforce" | "write_salesforce" | "cli_operators"
  config_data?: any
}

interface DAGStatusResponse {
  status: string
  started_at?: string
  ended_at?: string
  logs?: string
}

export async function fetchClientConfigs(clientId: number): Promise<ConfigItem[]> {
  const configTypes = [
    "file_conversion_configs",
    "read_salesforce_configs",
    "write_salesforce_configs",
    "cli_operators_configs",
  ]

  const allConfigs: ConfigItem[] = []

  for (const configType of configTypes) {
    try {
      const response = await fetch(baseUrl(`/clients/${clientId}/${configType}`))

      if (!response.ok) {
        console.warn(`Failed to fetch ${configType} for client ${clientId}:`, response.statusText)
        continue
      }

      const configs = await response.json()

      // Transform configs to our standard format
      const transformedConfigs = configs.map((config: any) => ({
        id: config.id || `${configType}_${config.dag_id}`,
        dag_id: config.dag_id,
        trigger_id: config.trigger_id,
        name: config.name,
        status: config.status,
        type: configType.replace("_configs", "") as ConfigItem["type"],
        config_data: config,
      }))

      allConfigs.push(...transformedConfigs)
    } catch (error) {
      console.error(`Error fetching ${configType} for client ${clientId}:`, error)
    }
  }

  return allConfigs
}

export async function fetchDAGStatus(dagId: string, triggerId: string): Promise<DAGStatusResponse> {
  try {
    const response = await fetch(baseUrl(`/dag_runs/${dagId}/${triggerId}`))

    if (!response.ok) {
      throw new Error(`Failed to fetch DAG status: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      status: data.status || "unknown",
      started_at: data.started_at,
      ended_at: data.ended_at,
      logs: data.logs,
    }
  } catch (error) {
    console.error(`Error fetching DAG status for ${dagId}/${triggerId}:`, error)
    throw error
  }
}

// Mock data for development/testing
export function getMockConfigs(): ConfigItem[] {
  return [
    {
      id: "fc_1",
      dag_id: "file_conversion_dag_001",
      trigger_id: "trigger_001",
      name: "CSV to JSON Conversion",
      status: "success",
      type: "file_conversion",
      config_data: {
        input_format: "csv",
        output_format: "json",
        file_path: "/data/input.csv",
      },
    },
    {
      id: "rs_1",
      dag_id: "salesforce_read_dag_001",
      trigger_id: "trigger_002",
      name: "Account Data Extract",
      status: "running",
      type: "read_salesforce",
      config_data: {
        object_name: "Account",
        fields: ["Id", "Name", "Industry"],
      },
    },
    {
      id: "ws_1",
      dag_id: "salesforce_write_dag_001",
      trigger_id: "trigger_003",
      name: "Lead Data Upload",
      status: "failed",
      type: "write_salesforce",
      config_data: {
        object_name: "Lead",
        operation: "upsert",
      },
    },
    {
      id: "cli_1",
      dag_id: "cli_operator_dag_001",
      trigger_id: "trigger_004",
      name: "Data Processing Script",
      status: "success",
      type: "cli_operators",
      config_data: {
        command: "python process_data.py",
        working_directory: "/scripts",
      },
    },
  ]
}
