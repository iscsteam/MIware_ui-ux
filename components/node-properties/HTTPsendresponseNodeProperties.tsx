//httpsendresponseNodeProperties.tsx
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

// HTTP Send Response node schema
export const httpSendResponseSchema: NodeSchema = {
  inputSchema: [
    {
      name: "statusLine",
      datatype: "string",
      description: "Status line of the HTTP response",
      required: true
    },
    {
      name: "headers",
      datatype: "complex",
      description: "HTTP headers to include in the response"
    },
    {
      name: "body",
      datatype: "string",
      description: "Body of the HTTP response"
    },
    {
      name: "replyFor",
      datatype: "string",
      description: "The HTTP request activity to respond to",
      required: true
    }
  ],
  outputSchema: [
    {
      name: "success",
      datatype: "boolean",
      description: "Whether the response was sent successfully"
    },
    {
      name: "error",
      datatype: "string",
      description: "Error message if the response failed to send"
    }
  ]
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function HTTPSendResponseNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [response, setResponse] = useState<any>(null)
  const { updateNode, selectedNodeId, nodes } = useWorkflow()

  // Get a list of HTTP receiver/wait request nodes to respond to
  const httpRequestNodes = nodes ? nodes.filter(node => 
    node.type === "httpReceiver" || node.type === "waitForHttpRequest"
  ) : []

  const handleSendResponse = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setResponse(null)

    try {
      const response = await fetch("http://localhost:5000/api/http-operations/send-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          replyFor: formData.replyFor,
          statusLine: formData.statusLine || "200 OK",
          contentType: formData.contentType || "text/html; charset=ISO-8859-1",
          headers: formData.headers,
          body: formData.body,
          flushResponse: formData.flushResponse || false,
          closeConnection: formData.closeConnection || false
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`HTTP response sent successfully`)
        setResponse(data)
        // Update the node's output with the API response data
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
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
      const errorMessage = err instanceof Error ? err.message : "Error sending HTTP response"
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
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              placeholder="Send HTTP Response"
              onChange={(e) => onChange("name", e.target.value)}
            />
            <p className="text-xs text-gray-500">The name to be displayed as the label for the activity in the process.</p>
          </div>

          {/* Reply For */}
          <div className="space-y-2">
            <Label htmlFor="replyFor">Reply For</Label>
            <Select
              value={formData.replyFor || ""}
              onValueChange={(value) => onChange("replyFor", value)}
            >
              <SelectTrigger id="replyFor">
                <SelectValue placeholder="Select HTTP request to reply to" />
              </SelectTrigger>
              <SelectContent>
                {httpRequestNodes.map(node => (
                  <SelectItem key={node.id} value={node.id}>{node.data.name || node.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">The HTTP Request activity that received the request. This is a list of available activities that can receive HTTP requests.</p>
          </div>

          {/* Flush Response */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="flushResponse" 
              checked={formData.flushResponse || false}
              onCheckedChange={(checked) => onChange("flushResponse", checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="flushResponse">Flush Response</Label>
              <p className="text-xs text-gray-500">
                Specify whether the response is to be flushed after each Send HTTP Response activity.
              </p>
            </div>
          </div>

          {/* Close Connection */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="closeConnection" 
              checked={formData.closeConnection || false}
              onCheckedChange={(checked) => onChange("closeConnection", checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="closeConnection">Close Connection</Label>
              <p className="text-xs text-gray-500">
                Specifies that this activity contains the last part of an HTTP response. Select this check box if the entire response is sent by only one Send HTTP Response activity in the process.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="headers" className="space-y-4 pt-4">
          {/* Status Line */}
          <div className="space-y-2">
            <Label htmlFor="statusLine">Status Line</Label>
            <Input
              id="statusLine"
              value={formData.statusLine || "200 OK"}
              placeholder="200 OK"
              onChange={(e) => onChange("statusLine", e.target.value)}
            />
            <p className="text-xs text-gray-500">
              This field is the first line of a response message. This consists of the protocol version, a numeric status code, and the text phrase explaining the status code.
            </p>
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <Label htmlFor="contentType">Content Type</Label>
            <Select
              value={formData.contentType || "text/html; charset=ISO-8859-1"}
              onValueChange={(value) => onChange("contentType", value)}
            >
              <SelectTrigger id="contentType">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text/html; charset=ISO-8859-1">text/html; charset=ISO-8859-1</SelectItem>
                <SelectItem value="text/plain">text/plain</SelectItem>
                <SelectItem value="application/json">application/json</SelectItem>
                <SelectItem value="application/xml">application/xml</SelectItem>
                <SelectItem value="text/xml">text/xml</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              This field indicates the media type of the entity body sent to the receiver.
            </p>
          </div>

          {/* Headers */}
          <div className="space-y-2">
            <Label htmlFor="headers">Additional Headers (JSON)</Label>
            <Textarea
              id="headers"
              value={formData.headers || '{}'}
              rows={3}
              onChange={(e) => onChange("headers", e.target.value)}
              placeholder='{"Cache-Control": "no-cache", "Set-Cookie": "sessionId=abc123"}'
            />
            <p className="text-xs text-gray-500">
              Additional HTTP headers to include in the response, in JSON format.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="response" className="space-y-4 pt-4">
          {/* Response Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Response Body</Label>
            <Textarea
              id="body"
              value={formData.body || ''}
              rows={8}
              onChange={(e) => onChange("body", e.target.value)}
              placeholder='<html><body><h1>Hello World!</h1></body></html>'
            />
            <p className="text-xs text-gray-500">
              The content of the HTTP response body to send back to the client.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Button */}
      <div className="flex space-x-2 pt-4">
        <Button 
          onClick={handleSendResponse} 
          disabled={loading} 
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? "Sending..." : "Send HTTP Response"}
        </Button>
      </div>

      {/* Status Messages */}
      {success && <p className="text-green-500 mt-2">{success}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* Response Status Display */}
      {response && (
        <div className="mt-4 border rounded-md p-4">
          <h3 className="font-medium mb-2">Operation Result</h3>
          {response.success ? (
            <div className="text-green-500">Response sent successfully</div>
          ) : (
            <div className="text-red-500">
              Failed to send response: {response.error || 'Unknown error'}
            </div>
          )}
          
          {response.details && (
            <div className="mt-2">
              <p className="text-sm font-medium">Details</p>
              <pre className="text-xs bg-gray-50 p-2 rounded mt-1 max-h-48 overflow-auto">
                {typeof response.details === 'object' 
                  ? JSON.stringify(response.details, null, 2) 
                  : response.details}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}