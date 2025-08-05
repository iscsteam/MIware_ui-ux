"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

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

// File Poller schema definition
export const filePollerSchema: NodeSchema = {
  inputSchema: [
    {
      name: "dag_id_to_trigger",
      datatype: "string",
      description: "DAG ID to trigger when file changes are detected.",
      required: true,
    },
    {
      name: "name",
      datatype: "string",
      description: "Name for this file poller configuration.",
      required: true,
    },
    {
      name: "filename",
      datatype: "string",
      description: "File or directory path to monitor (supports wildcards).",
      required: true,
    },
    {
      name: "polling_interval_sec",
      datatype: "number",
      description: "Polling interval in seconds.",
      required: true,
    },
    {
      name: "include_timestamp",
      datatype: "boolean",
      description: "Include timestamp in the triggered data.",
    },
    {
      name: "description",
      datatype: "string",
      description: "Description of what this poller does.",
    },
    {
      name: "poll_for_create_events",
      datatype: "boolean",
      description: "Monitor for file creation events.",
    },
    {
      name: "poll_for_modify_events",
      datatype: "boolean",
      description: "Monitor for file modification events.",
    },
    {
      name: "poll_for_delete_events",
      datatype: "boolean",
      description: "Monitor for file deletion events.",
    },
    {
      name: "include_sub_directories",
      datatype: "boolean",
      description: "Include subdirectories in monitoring.",
    },
    {
      name: "mode",
      datatype: "string",
      description: "Monitoring mode (Only Files, Only Directories, Both).",
    },
    {
      name: "log_only_mode",
      datatype: "boolean",
      description: "Only log events without triggering workflows.",
    },
    {
      name: "is_active",
      datatype: "boolean",
      description: "Whether the file poller is active.",
    },
  ],
  outputSchema: [
    {
      name: "event_type",
      datatype: "string",
      description: "Type of file event detected (create, modify, delete).",
    },
    {
      name: "file_path",
      datatype: "string",
      description: "Path of the file that triggered the event.",
    },
    {
      name: "timestamp",
      datatype: "string",
      description: "Timestamp when the event was detected.",
    },
    {
      name: "file_size",
      datatype: "number",
      description: "Size of the file in bytes.",
    },
    {
      name: "triggered_dag_id",
      datatype: "string",
      description: "DAG ID that was triggered by this event.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

// Helper function to get the current workflow DAG ID
function getCurrentWorkflowDagId(): string | null {
  try {
    const currentWorkflow = localStorage.getItem("currentWorkflow")
    if (currentWorkflow) {
      const workflowData = JSON.parse(currentWorkflow)
      return workflowData.dag_id || null
    }
  } catch (error) {
    console.error("Error getting current workflow DAG ID:", error)
  }
  return null
}

// Helper function to get client ID
function getCurrentClientId(): string | null {
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

export default function FilePollerNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { toast } = useToast()

  // Auto-populate DAG ID and set defaults
  useEffect(() => {
    const currentDagId = getCurrentWorkflowDagId()

    // Set default values if not already set
    const defaults = {
      dag_id_to_trigger: currentDagId || "",
      name: formData.name || "File Poller",
      filename: formData.filename || "/app/data/mock_data/poller_raw/*",
      polling_interval_sec: formData.polling_interval_sec || 60,
      include_timestamp: formData.include_timestamp !== undefined ? formData.include_timestamp : false,
      description: formData.description || "Monitor files for changes",
      poll_for_create_events: formData.poll_for_create_events !== undefined ? formData.poll_for_create_events : true,
      poll_for_modify_events: formData.poll_for_modify_events !== undefined ? formData.poll_for_modify_events : true,
      poll_for_delete_events: formData.poll_for_delete_events !== undefined ? formData.poll_for_delete_events : true,
      include_sub_directories: formData.include_sub_directories !== undefined ? formData.include_sub_directories : true,
      mode: formData.mode || "Only Files",
      log_only_mode: formData.log_only_mode !== undefined ? formData.log_only_mode : false,
      is_active: formData.is_active !== undefined ? formData.is_active : true,
    }

    // Apply defaults for any missing values
    Object.entries(defaults).forEach(([key, value]) => {
      if (formData[key] === undefined || formData[key] === null || formData[key] === "") {
        onChange(key, value)
      }
    })
  }, [])

  // Create file poller configuration
  const createFilePollerConfig = async () => {
    const clientId = getCurrentClientId()
    if (!clientId) {
      setError("Client ID not found. Please ensure you're logged in.")
      return null
    }

    const payload = {
      dag_id_to_trigger: formData.dag_id_to_trigger,
      name: formData.name,
      filename: formData.filename,
      polling_interval_sec: Number(formData.polling_interval_sec),
      include_timestamp: Boolean(formData.include_timestamp),
      description: formData.description,
      poll_for_create_events: Boolean(formData.poll_for_create_events),
      poll_for_modify_events: Boolean(formData.poll_for_modify_events),
      poll_for_delete_events: Boolean(formData.poll_for_delete_events),
      include_sub_directories: Boolean(formData.include_sub_directories),
      mode: formData.mode,
      log_only_mode: Boolean(formData.log_only_mode),
      is_active: Boolean(formData.is_active),
    }

    try {
      const response = await fetch(`/api/clients/${clientId}/file_poller_configs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error creating file poller config:", error)
      throw error
    }
  }

  // Update file poller configuration
  const updateFilePollerConfig = async (configId: number) => {
    const clientId = getCurrentClientId()
    if (!clientId) {
      setError("Client ID not found. Please ensure you're logged in.")
      return null
    }

    const payload = {
      dag_id_to_trigger: formData.dag_id_to_trigger,
      name: formData.name,
      filename: formData.filename,
      polling_interval_sec: Number(formData.polling_interval_sec),
      include_timestamp: Boolean(formData.include_timestamp),
      description: formData.description,
      poll_for_create_events: Boolean(formData.poll_for_create_events),
      poll_for_modify_events: Boolean(formData.poll_for_modify_events),
      poll_for_delete_events: Boolean(formData.poll_for_delete_events),
      include_sub_directories: Boolean(formData.include_sub_directories),
      mode: formData.mode,
      log_only_mode: Boolean(formData.log_only_mode),
      is_active: Boolean(formData.is_active),
    }

    try {
      const response = await fetch(`/api/clients/${clientId}/file_poller_configs/${configId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Error updating file poller config:", error)
      throw error
    }
  }

  // Handle save configuration
  const handleSaveConfig = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate required fields
      if (!formData.dag_id_to_trigger) {
        throw new Error("DAG ID to trigger is required")
      }
      if (!formData.name) {
        throw new Error("Name is required")
      }
      if (!formData.filename) {
        throw new Error("Filename/path is required")
      }
      if (!formData.polling_interval_sec || formData.polling_interval_sec < 1) {
        throw new Error("Polling interval must be at least 1 second")
      }

      let result
      if (formData.config_id) {
        // Update existing config
        result = await updateFilePollerConfig(formData.config_id)
        setSuccess(`File poller configuration updated successfully! Config ID: ${result.id}`)
      } else {
        // Create new config
        result = await createFilePollerConfig()
        onChange("config_id", result.id)
        setSuccess(`File poller configuration created successfully! Config ID: ${result.id}`)
      }

      toast({
        title: "Success",
        description: formData.config_id ? "File poller configuration updated!" : "File poller configuration created!",
      })
    } catch (error: any) {
      const errorMessage = error.message || "Failed to save file poller configuration"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Refresh DAG ID
  const handleRefreshDagId = () => {
    const currentDagId = getCurrentWorkflowDagId()
    if (currentDagId) {
      onChange("dag_id_to_trigger", currentDagId)
      setSuccess("DAG ID refreshed successfully!")
      setError(null)
    } else {
      setError("Could not find current workflow DAG ID. Please ensure a workflow is selected.")
    }
  }

  // Generate monitoring summary
  const generateMonitoringSummary = () => {
    const events = []
    if (formData.poll_for_create_events) events.push("Create")
    if (formData.poll_for_modify_events) events.push("Modify")
    if (formData.poll_for_delete_events) events.push("Delete")

    const eventTypes = events.length > 0 ? events.join(", ") : "None"
    const interval = formData.polling_interval_sec || "X"
    const mode = formData.mode || "Only Files"
    const subDirs = formData.include_sub_directories ? "including subdirectories" : "excluding subdirectories"

    return `Monitor ${mode.toLowerCase()} at "${formData.filename || "path"}" every ${interval}s for ${eventTypes} events, ${subDirs}`
  }

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            File Poller Configuration
            {formData.config_id && <Badge variant="secondary">Config ID: {formData.config_id}</Badge>}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* DAG ID to Trigger */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="dag_id_to_trigger" className="text-sm font-medium">
                DAG ID to Trigger *
              </Label>
              <Button variant="outline" size="sm" onClick={handleRefreshDagId}>
                Refresh
              </Button>
            </div>
            <Input
              id="dag_id_to_trigger"
              value={formData.dag_id_to_trigger || ""}
              onChange={(e) => onChange("dag_id_to_trigger", e.target.value)}
              placeholder="dag_demo_90583266"
              className={!formData.dag_id_to_trigger ? "border-red-300" : ""}
            />
            <p className="text-xs text-gray-500">The DAG ID that will be triggered when file changes are detected</p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Configuration Name *
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="testing"
              className={!formData.name ? "border-red-300" : ""}
            />
            <p className="text-xs text-gray-500">A descriptive name for this file poller configuration</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="testing for copy, rename, move, delete files"
              rows={2}
            />
            <p className="text-xs text-gray-500">Optional description of what this poller monitors</p>
          </div>
        </CardContent>
      </Card>

      {/* File Monitoring Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">File Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filename/Path */}
          <div className="space-y-2">
            <Label htmlFor="filename" className="text-sm font-medium">
              File/Directory Path *
            </Label>
            <Input
              id="filename"
              value={formData.filename || ""}
              onChange={(e) => onChange("filename", e.target.value)}
              placeholder="/app/data/mock_data/poller_raw/*"
              className={!formData.filename ? "border-red-300" : ""}
            />
            <p className="text-xs text-gray-500">Path to monitor. Use wildcards (*) for multiple files</p>
          </div>

          {/* Polling Interval */}
          <div className="space-y-2">
            <Label htmlFor="polling_interval_sec" className="text-sm font-medium">
              Polling Interval (seconds) *
            </Label>
            <Input
              id="polling_interval_sec"
              type="number"
              min="1"
              value={formData.polling_interval_sec || ""}
              onChange={(e) => onChange("polling_interval_sec", Number(e.target.value))}
              placeholder="60"
              className={!formData.polling_interval_sec || formData.polling_interval_sec < 1 ? "border-red-300" : ""}
            />
            <p className="text-xs text-gray-500">How often to check for file changes (minimum 1 second)</p>
          </div>

          {/* Mode */}
          <div className="space-y-2">
            <Label htmlFor="mode" className="text-sm font-medium">
              Monitoring Mode
            </Label>
            <Select value={formData.mode || "Only Files"} onValueChange={(value) => onChange("mode", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select monitoring mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Only Files">Only Files</SelectItem>
                <SelectItem value="Only Directories">Only Directories</SelectItem>
                <SelectItem value="Both">Both Files and Directories</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">What type of filesystem objects to monitor</p>
          </div>
        </CardContent>
      </Card>

      {/* Event Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event Types to Monitor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create Events */}
          <div className="flex items-center space-x-2">
            <Switch
              id="poll_for_create_events"
              checked={!!formData.poll_for_create_events}
              onCheckedChange={(checked) => onChange("poll_for_create_events", checked)}
            />
            <Label htmlFor="poll_for_create_events" className="cursor-pointer text-sm font-medium">
              Monitor File Creation Events
            </Label>
          </div>

          {/* Modify Events */}
          <div className="flex items-center space-x-2">
            <Switch
              id="poll_for_modify_events"
              checked={!!formData.poll_for_modify_events}
              onCheckedChange={(checked) => onChange("poll_for_modify_events", checked)}
            />
            <Label htmlFor="poll_for_modify_events" className="cursor-pointer text-sm font-medium">
              Monitor File Modification Events
            </Label>
          </div>

          {/* Delete Events */}
          <div className="flex items-center space-x-2">
            <Switch
              id="poll_for_delete_events"
              checked={!!formData.poll_for_delete_events}
              onCheckedChange={(checked) => onChange("poll_for_delete_events", checked)}
            />
            <Label htmlFor="poll_for_delete_events" className="cursor-pointer text-sm font-medium">
              Monitor File Deletion Events
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Advanced Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Include Subdirectories */}
          <div className="flex items-center space-x-2">
            <Switch
              id="include_sub_directories"
              checked={!!formData.include_sub_directories}
              onCheckedChange={(checked) => onChange("include_sub_directories", checked)}
            />
            <Label htmlFor="include_sub_directories" className="cursor-pointer text-sm font-medium">
              Include Subdirectories
            </Label>
          </div>

          {/* Include Timestamp */}
          <div className="flex items-center space-x-2">
            <Switch
              id="include_timestamp"
              checked={!!formData.include_timestamp}
              onCheckedChange={(checked) => onChange("include_timestamp", checked)}
            />
            <Label htmlFor="include_timestamp" className="cursor-pointer text-sm font-medium">
              Include Timestamp in Event Data
            </Label>
          </div>

          {/* Log Only Mode */}
          <div className="flex items-center space-x-2">
            <Switch
              id="log_only_mode"
              checked={!!formData.log_only_mode}
              onCheckedChange={(checked) => onChange("log_only_mode", checked)}
            />
            <Label htmlFor="log_only_mode" className="cursor-pointer text-sm font-medium">
              Log Only Mode (Don't Trigger Workflows)
            </Label>
          </div>

          {/* Is Active */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={!!formData.is_active}
              onCheckedChange={(checked) => onChange("is_active", checked)}
            />
            <Label htmlFor="is_active" className="cursor-pointer text-sm font-medium">
              File Poller Active
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monitoring Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">{generateMonitoringSummary()}</p>
            {formData.log_only_mode && (
              <p className="text-xs text-orange-600 mt-1">
                <strong>Note:</strong> Log only mode is enabled - no workflows will be triggered
              </p>
            )}
            {!formData.is_active && (
              <p className="text-xs text-red-600 mt-1">
                <strong>Warning:</strong> File poller is currently inactive
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Configuration */}
      <div>
        <Button className="w-full" onClick={handleSaveConfig} disabled={loading}>
          {loading ? "Saving..." : formData.config_id ? "Update Configuration" : "Create Configuration"}
        </Button>
      </div>

      {/* Feedback Messages */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Debug Info - Development Only */}
      {process.env.NODE_ENV === "development" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug - Current Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(
                {
                  dag_id_to_trigger: formData.dag_id_to_trigger,
                  name: formData.name,
                  filename: formData.filename,
                  polling_interval_sec: formData.polling_interval_sec,
                  include_timestamp: formData.include_timestamp,
                  description: formData.description,
                  poll_for_create_events: formData.poll_for_create_events,
                  poll_for_modify_events: formData.poll_for_modify_events,
                  poll_for_delete_events: formData.poll_for_delete_events,
                  include_sub_directories: formData.include_sub_directories,
                  mode: formData.mode,
                  log_only_mode: formData.log_only_mode,
                  is_active: formData.is_active,
                  config_id: formData.config_id,
                },
                null,
                2,
              )}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}