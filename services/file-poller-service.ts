// src/services/file-poller-service.ts

import type { WorkflowNode } from "@/components/workflow/workflow-context";
import { toast } from "@/components/ui/use-toast";
import { baseUrl } from "./api"; // Import the baseUrl helper function

/**
 * Interface for the File Poller configuration payload sent to the backend API.
 * This should match the expected request body for the POST and PUT endpoints.
 */
export interface FilePollerConfig {
  dag_id_to_trigger: string;
  name: string;
  filename: string;
  polling_interval_sec: number;
  include_timestamp?: boolean;
  description?: string;
  poll_for_create_events?: boolean;
  poll_for_modify_events?: boolean;
  poll_for_delete_events?: boolean;
  include_sub_directories?: boolean;
  mode?: "Only Files" | "Only Dirs" | "Both";
  log_only_mode?: boolean;
  is_active?: boolean;
}

/**
 * Maps a file-poller workflow node from the frontend canvas to the 
 * API configuration payload format. It ensures all required fields are present
 * and provides default values for optional ones.
 * @param node The WorkflowNode object for the file poller.
 * @returns A FilePollerConfig object ready to be sent to the API.
 */
export function mapFilePollerNodeToConfig(node: WorkflowNode): FilePollerConfig {
  const { data } = node;

  // Ensure polling interval is a valid number, default to 60 if not.
  const pollingInterval = typeof data.polling_interval_sec === 'number' && data.polling_interval_sec > 0 
    ? data.polling_interval_sec 
    : 60;

  return {
    dag_id_to_trigger: data.dag_id_to_trigger || "",
    name: data.name || `poller_${node.id}`,
    filename: data.filename || "",
    polling_interval_sec: pollingInterval,
    include_timestamp: data.include_timestamp || false,
    description: data.description || "",
    poll_for_create_events: data.poll_for_create_events || false,
    poll_for_modify_events: data.poll_for_modify_events || false,
    poll_for_delete_events: data.poll_for_delete_events || false,
    include_sub_directories: data.include_sub_directories || false,
    mode: (data.mode as "Only Files" | "Only Dirs" | "Both") || "Only Files",
    log_only_mode: data.log_only_mode || false,
    is_active: data.is_active !== false, // Default to true if undefined
  };
}

/**
 * Makes an API call to create a new File Poller configuration.
 * @param clientId The ID of the current client.
 * @param config The FilePollerConfig payload.
 * @returns A promise that resolves with the newly created config object (including its ID), or null on failure.
 */
export async function createFilePollerConfig(
  clientId: number,
  config: FilePollerConfig
): Promise<{ id: number } | null> {
  console.log("Creating file poller config with payload:", JSON.stringify(config, null, 2));
  try {
    const apiUrl = baseUrl(`clients/${clientId}/file_poller_configs`);
    console.log("Sending CREATE request to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "An unknown error occurred" }));
      console.error("Failed to create file poller config:", response.status, errorData);
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    toast({
      title: "Success",
      description: `File Poller config '${config.name}' created successfully with ID: ${result.id}.`,
    });
    return result;
  } catch (error: any) {
    console.error("Error in createFilePollerConfig:", error);
    toast({
      title: "Error Creating File Poller",
      description: error.message || "An unknown error occurred.",
      variant: "destructive",
    });
    return null;
  }
}

/**
 * Makes an API call to update an existing File Poller configuration.
 * @param clientId The ID of the current client.
 * @param configId The ID of the configuration to update.
 * @param config The FilePollerConfig payload with the updated data.
 * @returns A promise that resolves with the updated config object, or null on failure.
 */
export async function updateFilePollerConfig(
  clientId: number,
  configId: number,
  config: FilePollerConfig
): Promise<{ id: number } | null> {
  console.log(`Updating file poller config ${configId} with payload:`, JSON.stringify(config, null, 2));
  try {
    const apiUrl = baseUrl(`clients/${clientId}/file_poller_configs/${configId}`);
    console.log("Sending UPDATE request to:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "An unknown error occurred" }));
      console.error("Failed to update file poller config:", response.status, errorData);
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    toast({
      title: "Success",
      description: `File Poller config '${config.name}' (ID: ${result.id}) updated successfully.`,
    });
    return result;
  } catch (error: any) {
    console.error("Error in updateFilePollerConfig:", error);
    toast({
      title: "Error Updating File Poller",
      description: error.message || "An unknown error occurred.",
      variant: "destructive",
    });
    return null;
  }
}