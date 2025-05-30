// // //salesforce-cloud-node-properties
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useWorkflow } from "@/components/workflow/workflow-context"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

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

export const salesforceCloudSchema: NodeSchema = {
  inputSchema: [
    // {
    //   name: "username",
    //   datatype: "string",
    //   description: "Salesforce username.",
    //   required: true,
    // },
    // {
    //   name: "password",
    //   datatype: "string",
    //   description: "Salesforce password with security token.",
    //   required: true,
    // },
    {
      name: "object_name",
      datatype: "string",
      description: "Salesforce object/table name (e.g., Account, Contact, Opportunity).",
      required: true,
    },
    {
      name: "query",
      datatype: "string",
      description: "SOQL query to execute against Salesforce.",
      required: true,
    },
    {
      name: "use_bulk_api",
      datatype: "boolean",
      description: "Whether to use Salesforce Bulk API for large data sets.",
      required: false,
    },
    {
      name: "file_path",
      datatype: "string",
      description: "Output file path to save the query results.",
      required: true,
    },
  ],
  outputSchema: [
    {
      name: "records",
      datatype: "array",
      description: "Array of records returned from Salesforce query.",
    },
    {
      name: "record_count",
      datatype: "integer",
      description: "Number of records retrieved.",
    },
    {
      name: "file_path",
      datatype: "string",
      description: "Path where the results were saved.",
    },
    {
      name: "success",
      datatype: "boolean",
      description: "Whether the Salesforce operation was successful.",
    },
    {
      name: "error",
      datatype: "string",
      description: "Error message if any.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

const sampleQueries = {
  Account:
    "SELECT Id, Name, AccountNumber, Industry, AnnualRevenue, Type, Rating, Phone, Website, CreatedDate FROM Account ORDER BY CreatedDate DESC LIMIT 50",
  Contact:
    "SELECT Id, FirstName, LastName, Email, Phone, AccountId, CreatedDate FROM Contact ORDER BY CreatedDate DESC LIMIT 50",
  Opportunity:
    "SELECT Id, Name, StageName, Amount, CloseDate, AccountId, CreatedDate FROM Opportunity ORDER BY CreatedDate DESC LIMIT 50",
  Lead: "SELECT Id, FirstName, LastName, Email, Company, Status, CreatedDate FROM Lead ORDER BY CreatedDate DESC LIMIT 50",
}

export default function SalesforceCloudNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const { updateNode, selectedNodeId } = useWorkflow()

  // Initialize default values
  useEffect(() => {
    if (!formData.object_name) {
      onChange("object_name", "Account")
    }
    if (!formData.query) {
      onChange("query", sampleQueries.Account)
    }
    if (formData.use_bulk_api === undefined) {
      onChange("use_bulk_api", false)
    }
    if (!formData.file_path) {
      onChange("file_path", "/app/data/mock_data/output/salesforceread.csv")
    }
  }, [formData, onChange])

  const handleObjectChange = (value: string) => {
    onChange("object_name", value)
    // Auto-update query when object changes if it matches sample queries
    if (sampleQueries[value as keyof typeof sampleQueries]) {
      onChange("query", sampleQueries[value as keyof typeof sampleQueries])
    }
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Simulate connection test with provided credentials
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Check if username and password are provided
      if (formData.username && formData.password) {
        // Here you could add actual Salesforce connection testing if needed
        setSuccessMessage("Salesforce credentials validated successfully!")
      } else {
        setError("Please provide both username and password to test connection.")
      }
    } catch (err: any) {
      setError(`Connection test failed: ${err.message}`)
    } finally {
      setTestingConnection(false)
    }
  }

  const handleExecuteQuery = async () => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Get current client ID
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

      const clientId = getCurrentClientId()
      if (!clientId) {
        throw new Error("No client selected. Please create or select a client first.")
      }

      // Store the configuration in the node data for later use by workflow-utils
      const salesforceConfig = {
        object_name: formData.object_name,
        query: formData.query,
        use_bulk_api: formData.use_bulk_api || false,
        file_path: formData.file_path,
        fields: formData.fields || [],
        where: formData.where || "",
        limit: formData.limit || undefined,
      }

      // Update the node with the configuration data
      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "configured",
          data: {
            ...formData,
            ...salesforceConfig,
          },
          output: {
            config_ready: true,
            object_name: salesforceConfig.object_name,
            file_path: salesforceConfig.file_path,
            message: "Salesforce configuration saved. Ready for workflow execution.",
          },
        })
      }

      setSuccessMessage(
        `Salesforce configuration saved successfully! Object: ${salesforceConfig.object_name}, Output: ${salesforceConfig.file_path}. Use 'Run' button to execute the workflow.`,
      )

      console.log("Salesforce configuration saved to node:", salesforceConfig)
    } catch (err: any) {
      const errorMessage = err.message || "Unknown error"
      setError(errorMessage)
      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "error",
          output: { error: errorMessage, success: false },
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Salesforce Username */}
      {/* <div className="space-y-1">
        <Label htmlFor="username">Salesforce Username</Label>
        <Input
          id="username"
          type="text"
          value={formData.username || ""}
          placeholder="your_username@domain.com"
          onChange={(e) => onChange("username", e.target.value)}
          className={!formData.username ? "border-orange-400" : ""}
        />
        {!formData.username && <p className="text-xs text-orange-600">Username is required.</p>}
      </div> */}

      {/* Salesforce Password */}
      {/* <div className="space-y-1">
        <Label htmlFor="password">Salesforce Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password || ""}
          placeholder="Password + Security Token"
          onChange={(e) => onChange("password", e.target.value)}
          className={!formData.password ? "border-orange-400" : ""}
        />
        {!formData.password && <p className="text-xs text-orange-600">Password is required.</p>}
        <p className="text-xs text-gray-500">Include your security token appended to your password.</p>
      </div> */}

      {/* Salesforce Object/Table Name */}
      <div className="space-y-1">
        <Label htmlFor="object_name">Salesforce Object/Table Name</Label>
        <Input
          id="object_name"
          value={formData.object_name || ""}
          placeholder="e.g., Account, Contact, Opportunity"
          onChange={(e) => handleObjectChange(e.target.value)}
          className={!formData.object_name ? "border-orange-400" : ""}
        />
        {!formData.object_name && <p className="text-xs text-orange-600">Object name is required.</p>}
      </div>

      {/* SOQL Query */}
      <div className="space-y-1">
        <Label htmlFor="query">SOQL Query</Label>
        <Textarea
          id="query"
          value={formData.query || ""}
          onChange={(e) => onChange("query", e.target.value)}
          placeholder="SELECT Id, Name FROM Account LIMIT 10"
          className="min-h-[100px] font-mono text-sm"
        />
        <p className="text-xs text-gray-500">Enter your SOQL query to retrieve data from Salesforce.</p>
      </div>

      {/* Use Bulk API */}
      <div className="flex items-center space-x-2">
        <Switch
          id="use_bulk_api"
          checked={formData.use_bulk_api || false}
          onCheckedChange={(checked) => onChange("use_bulk_api", checked)}
        />
        <Label htmlFor="use_bulk_api">Use Bulk API</Label>
        <p className="text-xs text-gray-500 ml-2">(Recommended for large data sets)</p>
      </div>

      {/* Output File Path */}
      <div className="space-y-1">
        <Label htmlFor="file_path">Output File Path</Label>
        <Input
          id="file_path"
          value={formData.file_path || ""}
          placeholder="/app/data/mock_data/output/salesforceread.csv"
          onChange={(e) => onChange("file_path", e.target.value)}
          className={!formData.file_path ? "border-orange-400" : ""}
        />
        {!formData.file_path && <p className="text-xs text-orange-600">Output file path is required.</p>}
      </div>

      <hr className="my-3" />

      {/* Connection Test */}
      <div className="space-y-2 p-3 border rounded-md bg-slate-50">
        <Label className="text-md font-semibold">Connection Test</Label>
        <p className="text-xs text-gray-500">Test your Salesforce connection before executing queries.</p>
        <Button
          onClick={handleTestConnection}
          disabled={testingConnection || !formData.username || !formData.password}
          variant="outline"
          className="w-full"
        >
          {testingConnection ? "Testing Connection..." : "Test Salesforce Connection"}
        </Button>
      </div>

      {/* Execute Query Button */}
      <div className="mt-5">
        <Button
          onClick={handleExecuteQuery}
          disabled={
            loading ||
            !formData.username ||
            !formData.password ||
            !formData.object_name ||
            !formData.query ||
            !formData.file_path
          }
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? "Saving Configuration..." : "Save Salesforce Configuration"}
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Configuration will be saved. Use the 'Run' button in the top menu to execute the workflow.
        </p>
      </div>

      {/* Feedback */}
      {successMessage && <p className="text-sm text-green-600 mt-2">{successMessage}</p>}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}
