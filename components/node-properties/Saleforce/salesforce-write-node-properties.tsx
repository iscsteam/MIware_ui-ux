// salesforce-write-node-properties.tsx
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useWorkflow } from "@/components/workflow/workflow-context"
import { Switch } from "@/components/ui/switch"
// No Textarea import needed as there's no SOQL query for write

export interface SchemaItem {
  name: string
  datatype: string
  description: string
  required?: boolean
}

export interface NodeSchema {
  inputSchema: SchemaItem[]
  outputSchema: SchemaItem[]
}

// Schema definition for the Salesforce Write node
export const salesforceCloudWriteSchema: NodeSchema = {
  inputSchema: [
    {
      name: "object_name",
      datatype: "string",
      description: "Salesforce object/table name (e.g., Account, Contact, Opportunity) to write data to.",
      required: true,
    },
    {
      name: "file_path",
      datatype: "string",
      description: "Local file path to the CSV or JSON file containing data to be written to Salesforce.",
      required: true,
    },
    {
      name: "use_bulk_api",
      datatype: "boolean",
      description: "Whether to use Salesforce Bulk API for large data sets.",
      required: false, // Optional, but usually recommended for writes
    },
    {
      name: "bulk_batch_size",
      datatype: "integer",
      description: "Number of records to process in each batch when using Bulk API (max 10000).",
      required: false,
    },
  ],
  outputSchema: [
    {
      name: "records_processed",
      datatype: "integer",
      description: "Number of records successfully processed (created/updated/deleted).",
    },
    {
      name: "records_failed",
      datatype: "integer",
      description: "Number of records that failed to process.",
    },
    {
      name: "success",
      datatype: "boolean",
      description: "Whether the Salesforce write operation was successful overall.",
    },
    {
      name: "error",
      datatype: "string",
      description: "Error message if any part of the operation failed.",
    },
    {
      name: "input_file_path",
      datatype: "string",
      description: "Path to the source file that was processed.",
    },
    {
      name: "config_id",
      datatype: "integer",
      description: "The ID of the Salesforce write configuration saved on the backend.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function SalesforceWriteNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  // Initialize default values when the component mounts or formData changes significantly
  useEffect(() => {
    // Check if formData is already populated (e.g., when editing an existing node)
    if (!formData.object_name) {
      onChange("object_name", "Account")
    }
    if (formData.use_bulk_api === undefined) {
      onChange("use_bulk_api", true) // Default to true based on provided payload
    }
    if (formData.bulk_batch_size === undefined) {
      onChange("bulk_batch_size", 2000)
    }
    if (!formData.file_path) {
      onChange("file_path", "/app/data/mock_data/output/data_to_write.csv")
    }
  }, [formData, onChange])

  // Helper to get client ID (reused from your SalesforceCloudNodeProperties)
  const getCurrentClientId = (): string | null => {
    try {
      const clientDataString = localStorage.getItem("currentClient")
      if (clientDataString) {
        const parsedClient = JSON.parse(clientDataString)
        if (parsedClient?.id && String(parsedClient.id).trim() !== "") {
          return String(parsedClient.id)
        }
      }
    } catch (error) {
      console.error("Error getting client ID:", error)
    }
    return null
  }

  const handleSaveConfiguration = async () => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const clientId = getCurrentClientId()
      if (!clientId) {
        throw new Error("No client selected. Please create or select a client first.")
      }

      // Basic validation
      if (!formData.object_name) {
        throw new Error("Salesforce Object Name is required.")
      }
      if (!formData.file_path) {
        throw new Error("Input File Path is required.")
      }
      if (formData.use_bulk_api && (!formData.bulk_batch_size || formData.bulk_batch_size <= 0 || formData.bulk_batch_size > 10000)) {
        throw new Error("Bulk batch size must be between 1 and 10000.")
      }

      const payload = {
        object_name: formData.object_name,
        use_bulk_api: formData.use_bulk_api, // Use the current boolean value
        bulk_batch_size: formData.bulk_batch_size, // Use the current number value
        file_path: formData.file_path,
        // No username/password in write payload, assuming global client credentials
      }

      let configId = formData.config_id // Get existing config_id from formData if present
      let method = "POST"
      let url = `clients/${clientId}/write_salesforce_configs` // from @/services/urls

      if (configId) {
        method = "PUT"
        url = `clients/${clientId}/write_salesforce_configs/${configId}` // from @/services/urls
      }

      console.log(`Simulating ${method} request to ${url} with payload:`, payload);

      // Simulate API call to backend
      const response = await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) { // Simulate success ~90% of the time
            const mockConfigId = configId || Math.floor(Math.random() * 1000) + 1; // Generate new ID if not existing
            resolve({ id: mockConfigId, message: "Configuration saved successfully!" });
          } else {
            reject(new Error("Simulated API call failed to save configuration."));
          }
        }, 1500); // Simulate network latency
      }) as { id: number, message: string }; // Cast to expected response shape

      const savedConfigId = response.id;
      onChange("config_id", savedConfigId); // Update local form data with the actual config_id

      // Update the workflow node with the new status and data
      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "configured", // Mark node as configured
          data: {
            ...formData, // Preserve all existing form data
            config_id: savedConfigId, // Crucially, store the backend config ID in node data
          },
          output: {
            config_ready: true,
            config_id: savedConfigId, // Also include in output for clarity in workflow logs
            object_name: payload.object_name,
            input_file_path: payload.file_path,
            message: "Salesforce write configuration saved. Ready for workflow execution.",
            success: true, // Indicates successful configuration save
          },
        })
      }

      setSuccessMessage(
        `Salesforce write configuration (ID: ${savedConfigId}) saved successfully! Object: ${payload.object_name}, Input File: ${payload.file_path}. Use 'Run' button to execute the workflow.`,
      )

      console.log("Salesforce write configuration saved to node with config_id:", savedConfigId)

    } catch (err: any) {
      const errorMessage = err.message || "Unknown error"
      setError(errorMessage)
      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "error", // Mark node as having an error in configuration
          output: { error: errorMessage, success: false },
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Display Configuration ID if it exists (meaning it's saved on backend) */}
      {formData.config_id && (
        <div className="space-y-1">
          <Label htmlFor="config_id" className="text-sm font-medium">Configuration ID</Label>
          <Input
            id="config_id"
            value={formData.config_id}
            readOnly
            className="bg-gray-100 text-gray-700 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500">This configuration is managed by the backend under this ID.</p>
        </div>
      )}

      {/* Salesforce Object/Table Name */}
      <div className="space-y-1">
        <Label htmlFor="object_name">Salesforce Object/Table Name</Label>
        <Input
          id="object_name"
          value={formData.object_name || ""}
          placeholder="e.g., Account, Contact, Opportunity"
          onChange={(e) => onChange("object_name", e.target.value)}
          className={!formData.object_name ? "border-orange-400" : ""}
        />
        {!formData.object_name && <p className="text-xs text-orange-600">Salesforce Object Name is required.</p>}
      </div>

      {/* Input File Path */}
      <div className="space-y-1">
        <Label htmlFor="file_path">Input File Path</Label>
        <Input
          id="file_path"
          value={formData.file_path || ""}
          placeholder="/app/data/mock_data/input/data_to_write.csv"
          onChange={(e) => onChange("file_path", e.target.value)}
          className={!formData.file_path ? "border-orange-400" : ""}
        />
        {!formData.file_path && <p className="text-xs text-orange-600">Input file path is required.</p>}
        <p className="text-xs text-gray-500">Path to the CSV or JSON file containing data to be written.</p>
      </div>

      {/* Use Bulk API */}
      <div className="flex items-center space-x-2">
        <Switch
          id="use_bulk_api"
          // Default to true if undefined, otherwise use the actual value
          checked={formData.use_bulk_api !== undefined ? formData.use_bulk_api : true}
          onCheckedChange={(checked) => onChange("use_bulk_api", checked)}
        />
        <Label htmlFor="use_bulk_api">Use Bulk API</Label>
        <p className="text-xs text-gray-500 ml-2">(Recommended for large data sets)</p>
      </div>

      {/* Bulk Batch Size (conditional on use_bulk_api being true) */}
      {formData.use_bulk_api && (
        <div className="space-y-1">
          <Label htmlFor="bulk_batch_size">Bulk Batch Size</Label>
          <Input
            id="bulk_batch_size"
            type="number"
            value={formData.bulk_batch_size || 2000} // Display default if not set
            onChange={(e) => onChange("bulk_batch_size", parseInt(e.target.value, 10))}
            min="1"
            max="10000"
          />
          <p className="text-xs text-gray-500">Number of records per batch (1-10000).</p>
        </div>
      )}

      <hr className="my-3" />

      {/* Save Configuration Button */}
      <div className="mt-5">
        <Button
          onClick={handleSaveConfiguration}
          disabled={
            loading ||
            !formData.object_name ||
            !formData.file_path ||
            (formData.use_bulk_api && (!formData.bulk_batch_size || formData.bulk_batch_size <= 0 || formData.bulk_batch_size > 10000))
          }
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? "Saving Configuration..." : (formData.config_id ? "Update Salesforce Write Configuration" : "Save Salesforce Write Configuration")}
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Configuration will be saved to the backend. Use the 'Run' button in the top menu to execute the workflow.
        </p>
      </div>

      {/* Feedback Messages */}
      {successMessage && <p className="text-sm text-green-600 mt-2">{successMessage}</p>}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}