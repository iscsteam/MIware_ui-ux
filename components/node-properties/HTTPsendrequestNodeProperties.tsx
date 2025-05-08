//httpSendRequestNodeProperties.tsx
"use client"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useWorkflow } from "../workflow/workflow-context"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

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

// HTTP Send Request node schema
export const httpSendRequestSchema: NodeSchema = {
  inputSchema: [
    {
      name: "url",
      datatype: "string",
      description: "URL to send the HTTP request to",
      required: true
    },
    {
      name: "method",
      datatype: "string",
      description: "HTTP method to use (GET, POST, PUT, DELETE, etc.)",
      required: true
    },
    {
      name: "headers",
      datatype: "complex",
      description: "HTTP headers to send with the request"
    },
    {
      name: "body",
      datatype: "string",
      description: "Body of the HTTP request (for POST, PUT, etc.)"
    }
  ],
  outputSchema: [
    {
      name: "statusCode",
      datatype: "number",
      description: "HTTP status code of the response"
    },
    {
      name: "headers",
      datatype: "complex",
      description: "Headers returned in the response"
    },
    {
      name: "body",
      datatype: "string",
      description: "Body of the response"
    },
    {
      name: "responseTime",
      datatype: "number",
      description: "Time taken for the request in milliseconds"
    }
  ]
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function HTTPSendRequestNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [response, setResponse] = useState<any>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  // Function to add a new parameter
  const addParameter = () => {
    const newParams = [...(formData.parameters || []), { 
      name: "", 
      type: "string", 
      cardinality: "Optional" 
    }]
    onChange("parameters", newParams)
  }

  // Function to remove a parameter
  const removeParameter = (index: number) => {
    const newParams = [...(formData.parameters || [])]
    newParams.splice(index, 1)
    onChange("parameters", newParams)
  }

  // Function to update a parameter
  const updateParameter = (index: number, field: string, value: any) => {
    const newParams = [...(formData.parameters || [])]
    newParams[index] = { ...newParams[index], [field]: value }
    onChange("parameters", newParams)
  }

  const handleSendRequest = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setResponse(null)

    try {
      // Prepare parameters from the parameters array
      const requestParams: Record<string, any> = {}
      if (formData.parameters && Array.isArray(formData.parameters)) {
        formData.parameters.forEach((param: any) => {
          if (param.name) {
            // Convert value based on type
            let value = param.value
            if (param.type === "number") value = Number(value)
            if (param.type === "boolean") value = Boolean(value)
            requestParams[param.name] = value
          }
        })
      }

      const response = await fetch("http://localhost:5000/api/http-operations/send-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          httpClient: formData.httpClient,
          url: formData.url,
          method: formData.method || "GET",
          headers: formData.headers,
          parameters: requestParams,
          postDataType: formData.postDataType || "String",
          body: formData.body
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`HTTP request sent successfully`)
        setResponse(data)
        // Update the node's output with the API response data
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
           // status: "completed",
            output: data,
          })
        }
      } else {
        setError(data.message || "Request failed")
        // Update the node with error status and message
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "error",
            error: data.message,
            output: data,
          })
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error sending HTTP request"
      setError(errorMessage)
      // Update node with error status
      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "error",
          error: errorMessage,
          output: { error: errorMessage },
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="request">Request</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              placeholder="Send HTTP Request"
              onChange={(e) => onChange("name", e.target.value)}
            />
            <p className="text-xs text-gray-500">The name to be displayed as the label for the activity in the process.</p>
          </div>

          {/* HTTP Client */}
          <div className="space-y-2">
            <Label htmlFor="httpClient">HTTP Client</Label>
            <Input
              id="httpClient"
              value={formData.httpClient || ""}
              placeholder="HTTP Client resource name"
              onChange={(e) => onChange("httpClient", e.target.value)}
            />
            <p className="text-xs text-gray-500">Specifies the HTTP Client shared resource. For more information, see HTTP Client.</p>
          </div>

          {/* Post Data Type */}
          <div className="space-y-2">
            <Label htmlFor="postDataType">Post Data Type</Label>
            <Select
              value={formData.postDataType || "String"}
              onValueChange={(value) => onChange("postDataType", value)}
            >
              <SelectTrigger id="postDataType">
                <SelectValue placeholder="Select post data type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="String">String</SelectItem>
                <SelectItem value="Binary">Binary</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">The body of the HTTP message. You can select either String or Binary format.</p>
          </div>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>HTTP Request Parameters</Label>
              <Button 
                onClick={addParameter} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                Add Parameter
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              The parameters of the HTTP request. For each parameter, you must provide:
              <ul className="list-disc pl-5 mt-1">
                <li>Parameter Name</li>
                <li>Parameter Type (as string)</li>
                <li>Parameter Cardinality (as Optional, Required, or Repeating)</li>
              </ul>
            </p>
            
            {(formData.parameters || []).length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No parameters defined. Click "Add Parameter" to add one.
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {(formData.parameters || []).map((param: any, index: number) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-md">
                    <div className="col-span-3">
                      <Label htmlFor={`param-name-${index}`} className="text-xs">Parameter Name</Label>
                      <Input
                        id={`param-name-${index}`}
                        value={param.name || ""}
                        onChange={(e) => updateParameter(index, "name", e.target.value)}
                        placeholder="Parameter name"
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`param-type-${index}`} className="text-xs">Parameter Type</Label>
                      <Select
                        value={param.type || "string"}
                        onValueChange={(value) => updateParameter(index, "type", value)}
                      >
                        <SelectTrigger id={`param-type-${index}`} className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`param-cardinality-${index}`} className="text-xs">Parameter Cardinality</Label>
                      <Select
                        value={param.cardinality || "Optional"}
                        onValueChange={(value) => updateParameter(index, "cardinality", value)}
                      >
                        <SelectTrigger id={`param-cardinality-${index}`} className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Optional">Optional</SelectItem>
                          <SelectItem value="Required">Required</SelectItem>
                          <SelectItem value="Repeating">Repeating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`param-value-${index}`} className="text-xs">Value</Label>
                      <Input
                        id={`param-value-${index}`}
                        value={param.value || ""}
                        onChange={(e) => updateParameter(index, "value", e.target.value)}
                        placeholder="Value"
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end self-end">
                      <Button 
                        onClick={() => removeParameter(index)} 
                        variant="destructive"
                        size="sm"
                        className="mt-1"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="request" className="space-y-4 pt-4">
          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={formData.url || ""}
              placeholder="https://api.example.com/endpoint"
              onChange={(e) => onChange("url", e.target.value)}
            />
          </div>

          {/* HTTP Method */}
          <div className="space-y-2">
            <Label htmlFor="method">HTTP Method</Label>
            <Select
              value={formData.method || "GET"}
              onValueChange={(value) => onChange("method", value)}
            >
              <SelectTrigger id="method">
                <SelectValue placeholder="Select HTTP method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                <SelectItem value="HEAD">HEAD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Headers */}
          <div className="space-y-2">
            <Label htmlFor="headers">Headers (JSON)</Label>
            <Textarea
              id="headers"
              value={formData.headers || '{"Content-Type": "application/json"}'}
              rows={3}
              onChange={(e) => onChange("headers", e.target.value)}
              placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
            />
          </div>

          {/* Request Body (for POST, PUT, etc.) */}
          {['POST', 'PUT', 'PATCH'].includes(formData.method || '') && (
            <div className="space-y-2">
              <Label htmlFor="body">Request Body</Label>
              <Textarea
                id="body"
                value={formData.body || ''}
                rows={5}
                onChange={(e) => onChange("body", e.target.value)}
                placeholder={formData.postDataType === 'String' ? '{"key": "value"}' : 'Binary data'}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Button */}
      <div className="flex space-x-2 pt-4">
        <Button 
          onClick={handleSendRequest} 
          disabled={loading} 
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? "Sending..." : "Send HTTP Request"}
        </Button>
      </div>

      {/* Status Messages */}
      {success && <p className="text-green-500 mt-2">{success}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* Response Display */}
      {response && (
        <div className="mt-4 border rounded-md p-4">
          <h3 className="font-medium mb-2">Response</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium">Status Code</p>
              <p className="text-sm">{response.statusCode}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Response Time</p>
              <p className="text-sm">{response.responseTime || "N/A"} ms</p>
            </div>
          </div>
          
          {response.headers && (
            <div className="mt-2">
              <p className="text-sm font-medium">Headers</p>
              <pre className="text-xs bg-gray-50 p-2 rounded mt-1 max-h-24 overflow-auto">
                {JSON.stringify(response.headers, null, 2)}
              </pre>
            </div>
          )}
          
          {response.body && (
            <div className="mt-2">
              <p className="text-sm font-medium">Body</p>
              <pre className="text-xs bg-gray-50 p-2 rounded mt-1 max-h-48 overflow-auto">
                {typeof response.body === 'object' 
                  ? JSON.stringify(response.body, null, 2) 
                  : response.body}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}