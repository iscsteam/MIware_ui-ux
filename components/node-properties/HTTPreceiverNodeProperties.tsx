"use client"
import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
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

// HTTP Receiver node schema
export const httpReceiverSchema: NodeSchema = {
  inputSchema: [],
  outputSchema: [
    {
      name: "request",
      datatype: "complex",
      description: "The HTTP request details received"
    },
    {
      name: "method",
      datatype: "string",
      description: "The HTTP method used in the request (GET, POST, PUT, DELETE, etc.)"
    },
    {
      name: "url",
      datatype: "string",
      description: "The complete URL of the request"
    },
    {
      name: "path",
      datatype: "string",
      description: "The path portion of the URL"
    },
    {
      name: "query",
      datatype: "complex",
      description: "The query parameters as key-value pairs"
    },
    {
      name: "headers",
      datatype: "complex",
      description: "The HTTP headers received with the request"
    },
    {
      name: "body",
      datatype: "string",
      description: "The body of the request, if any"
    },
    {
      name: "contentType",
      datatype: "string",
      description: "The content type of the request"
    },
    {
      name: "clientIP",
      datatype: "string",
      description: "IP address of the client"
    }
  ]
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function HTTPReceiverNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  // Expose the schema for this node
  const schema = httpReceiverSchema

  // Function to add a new parameter
  const addParameter = () => {
    const newParams = [...(formData.parameters || []), { 
      name: "", 
      datatype: "string", 
      required: false 
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

  const handleStartListener = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/http-operations/start-receiver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          httpConnection: formData.httpConnection,
          contextPath: formData.contextPath,
          pathSpec: formData.pathSpec,
          outputStyle: formData.outputStyle,
          parsePostMethodData: formData.parsePostMethodData,
          parameters: formData.parameters,
          exposeSecurityContext: formData.exposeSecurityContext,
          defaultEncoding: formData.defaultEncoding,
          // Include additional properties from the original form
          port: formData.port,
          method: formData.method,
          corsEnabled: formData.corsEnabled,
          authRequired: formData.authRequired,
          authToken: formData.authToken,
          responseType: formData.responseType,
          responseBody: formData.responseBody,
          responseHeaders: formData.responseHeaders
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`HTTP Receiver started successfully`)
        // Update the node's output with the API response data
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "running",
            output: data,
          })
        }
      } else {
        setError(data.message)
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
      const errorMessage = err instanceof Error ? err.message : "Error connecting to the server."
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

  const handleStopListener = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch("http://localhost:5000/api/http-operations/stop-receiver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          httpConnection: formData.httpConnection,
          contextPath: formData.contextPath
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("HTTP Receiver stopped")
        // Update the node's output with the API response data
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "stopped",
            output: data,
          })
        }
      } else {
        setError(data.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error connecting to the server."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="path">Path Settings</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              placeholder="HTTP Receiver"
              onChange={(e) => onChange("name", e.target.value)}
            />
            <p className="text-xs text-gray-500">The name to be displayed as the label for the activity in the process.</p>
          </div>

          {/* HTTP Connection */}
          <div className="space-y-2">
            <Label htmlFor="httpConnection">HTTP Connection</Label>
            <Input
              id="httpConnection"
              value={formData.httpConnection || ""}
              placeholder="HTTP connection resource"
              onChange={(e) => onChange("httpConnection", e.target.value)}
            />
            <p className="text-xs text-gray-500">Resource that describes the characteristics of the connection used to receive incoming HTTP requests.</p>
          </div>

          {/* Output Style */}
          <div className="space-y-2">
            <Label htmlFor="outputStyle">Output Style</Label>
            <Select
              value={formData.outputStyle || "String"}
              onValueChange={(value) => onChange("outputStyle", value)}
            >
              <SelectTrigger id="outputStyle">
                <SelectValue placeholder="Select output style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="String">String</SelectItem>
                <SelectItem value="Binary">Binary</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">The type of output. Set to Binary if using HTTP 2.0 with binary protocol.</p>
          </div>

          {/* Parse Post Method Data */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="parsePostMethodData" 
              checked={!!formData.parsePostMethodData}
              onCheckedChange={(checked) => onChange("parsePostMethodData", checked)}
            />
            <Label htmlFor="parsePostMethodData" className="cursor-pointer">
              Parse Post Method Data
            </Label>
          </div>
          <p className="text-xs text-gray-500">Parse the message body of the HTTP request into a schema for the output of the activity.</p>

          {/* Expose Security Context */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="exposeSecurityContext" 
              checked={!!formData.exposeSecurityContext}
              onCheckedChange={(checked) => onChange("exposeSecurityContext", checked)}
            />
            <Label htmlFor="exposeSecurityContext" className="cursor-pointer">
              Expose Security Context
            </Label>
          </div>
          <p className="text-xs text-gray-500">Places the information from the user's security context into the Context or SecurityContext output element.</p>

          {/* Default Encoding */}
          <div className="space-y-2">
            <Label htmlFor="defaultEncoding">Default Encoding</Label>
            <Input
              id="defaultEncoding"
              value={formData.defaultEncoding || "UTF-8"}
              placeholder="UTF-8"
              onChange={(e) => onChange("defaultEncoding", e.target.value)}
            />
            <p className="text-xs text-gray-500">Specifies the encoding to use if no charset is specified in the Content-Type header.</p>
          </div>

          {/* Legacy fields from original component */}
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              type="number"
              value={formData.port || 3000}
              min={1}
              max={65535}
              onChange={(e) => onChange("port", parseInt(e.target.value))}
            />
          </div>

          {/* HTTP Method */}
          <div className="space-y-2">
            <Label htmlFor="method">HTTP Method</Label>
            <Select
              value={formData.method || "POST"}
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
                <SelectItem value="ANY">ANY (All methods)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CORS Enabled */}
          <div className="flex items-center space-x-2">
            <Switch 
              id="corsEnabled" 
              checked={!!formData.corsEnabled} 
              onCheckedChange={(v) => onChange("corsEnabled", v)} 
            />
            <Label htmlFor="corsEnabled" className="cursor-pointer">
              Enable CORS
            </Label>
          </div>
        </TabsContent>

        <TabsContent value="path" className="space-y-4 pt-4">
          {/* Context Path */}
          <div className="space-y-2">
            <Label htmlFor="contextPath">Context Path</Label>
            <Input
              id="contextPath"
              value={formData.contextPath || ""}
              placeholder="/api"
              onChange={(e) => onChange("contextPath", e.target.value)}
            />
            <p className="text-xs text-gray-500">The prefix of a URL path used to select the contexts to which an incoming request is passed.</p>
          </div>

          {/* Path Spec */}
          <div className="space-y-2">
            <Label htmlFor="pathSpec">Path Spec</Label>
            <Input
              id="pathSpec"
              value={formData.pathSpec || ""}
              placeholder="/webhook"
              onChange={(e) => onChange("pathSpec", e.target.value)}
            />
            <p className="text-xs text-gray-500">
              If specified, it is added as a prefix of a URL of the form http://hostname.com/contextPath/pathSpec
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-md mt-4">
            <p className="text-sm text-blue-700">
              Full path will be: http://hostname.com{formData.contextPath || ""}{formData.pathSpec ? `/${formData.pathSpec.replace(/^\//, '')}` : ""}
            </p>
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
            
            {(formData.parameters || []).length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No parameters defined. Click "Add Parameter" to add one.
              </div>
            ) : (
              <div className="space-y-4">
                {(formData.parameters || []).map((param: any, index: number) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border rounded-md">
                    <div className="col-span-3">
                      <Label htmlFor={`param-name-${index}`} className="text-xs">Name</Label>
                      <Input
                        id={`param-name-${index}`}
                        value={param.name || ""}
                        onChange={(e) => updateParameter(index, "name", e.target.value)}
                        placeholder="Parameter name"
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor={`param-type-${index}`} className="text-xs">Data Type</Label>
                      <Select
                        value={param.datatype || "string"}
                        onValueChange={(value) => updateParameter(index, "datatype", value)}
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
                    <div className="col-span-4">
                      <Label htmlFor={`param-required-${index}`} className="text-xs">Requirement</Label>
                      <Select
                        value={
                          param.repeating ? "Repeating" : 
                          param.required ? "Required" : 
                          "Optional"
                        }
                        onValueChange={(value) => {
                          updateParameter(index, "required", value === "Required")
                          updateParameter(index, "repeating", value === "Repeating")
                        }}
                      >
                        <SelectTrigger id={`param-required-${index}`} className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Optional">Optional</SelectItem>
                          <SelectItem value="Required">Required</SelectItem>
                          <SelectItem value="Repeating">Repeating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 flex justify-end self-end">
                      <Button 
                        onClick={() => removeParameter(index)} 
                        variant="destructive"
                        size="sm"
                        className="mt-1"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">Parameters of the incoming HTTP request that will be parsed and represented in the output schema.</p>
          </div>
        </TabsContent>

        <TabsContent value="response" className="space-y-4 pt-4">
          {/* Response Type */}
          <div className="space-y-2">
            <Label htmlFor="responseType">Response Type</Label>
            <Select
              value={formData.responseType || "json"}
              onValueChange={(value) => onChange("responseType", value)}
            >
              <SelectTrigger id="responseType">
                <SelectValue placeholder="Select response type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="text">Plain Text</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="none">No Response (204)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Response Body */}
          {formData.responseType !== "none" && (
            <div className="space-y-2">
              <Label htmlFor="responseBody">Response Body</Label>
              <Textarea
                id="responseBody"
                value={formData.responseBody || (formData.responseType === "json" ? '{"status": "success"}' : "")}
                rows={5}
                onChange={(e) => onChange("responseBody", e.target.value)}
                placeholder={
                  formData.responseType === "json" ? '{"status": "success"}' :
                  formData.responseType === "xml" ? '<response><status>success</status></response>' :
                  formData.responseType === "html" ? '<html><body><h1>Success</h1></body></html>' :
                  "Request received"
                }
              />
            </div>
          )}

          {/* Custom Response Headers */}
          <div className="space-y-2">
            <Label htmlFor="responseHeaders">Custom Response Headers (JSON)</Label>
            <Textarea
              id="responseHeaders"
              value={formData.responseHeaders || '{"X-Powered-By": "Workflow Engine"}'}
              rows={3}
              onChange={(e) => onChange("responseHeaders", e.target.value)}
              placeholder='{"X-Powered-By": "Workflow Engine"}'
            />
          </div>

          {/* Authentication */}
          <div className="space-y-2 pt-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="authRequired" 
                checked={!!formData.authRequired} 
                onCheckedChange={(v) => onChange("authRequired", v)} 
              />
              <Label htmlFor="authRequired" className="cursor-pointer">
                Require Authentication
              </Label>
            </div>
          </div>

          {/* Authentication Type */}
          {formData.authRequired && (
            <>
              <div className="space-y-2">
                <Label htmlFor="authType">Authentication Type</Label>
                <Select
                  value={formData.authType || "bearer"}
                  onValueChange={(value) => onChange("authType", value)}
                >
                  <SelectTrigger id="authType">
                    <SelectValue placeholder="Select authentication type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                    <SelectItem value="apiKey">API Key</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Auth Token / API Key / Credentials */}
              <div className="space-y-2">
                <Label htmlFor="authToken">
                  {formData.authType === "basic" ? "Credentials (username:password)" : 
                   formData.authType === "apiKey" ? "API Key" : "Bearer Token"}
                </Label>
                <Input
                  id="authToken"
                  type={formData.authType === "basic" ? "text" : "password"}
                  value={formData.authToken || ""}
                  onChange={(e) => onChange("authToken", e.target.value)}
                />
              </div>

              {/* API Key Header Name (only for apiKey type) */}
              {formData.authType === "apiKey" && (
                <div className="space-y-2">
                  <Label htmlFor="apiKeyHeader">API Key Header Name</Label>
                  <Input
                    id="apiKeyHeader"
                    value={formData.apiKeyHeader || "X-API-Key"}
                    onChange={(e) => onChange("apiKeyHeader", e.target.value)}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-4">
        <Button 
          onClick={handleStartListener} 
          disabled={loading} 
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {loading ? "Starting..." : "Start HTTP Receiver"}
        </Button>
        <Button 
          onClick={handleStopListener} 
          disabled={loading} 
          variant="outline" 
          className="border-red-500 text-red-500 hover:bg-red-50"
        >
          Stop Receiver
        </Button>
      </div>

      {/* Status Messages */}
      {success && <p className="text-green-500 mt-2">{success}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}