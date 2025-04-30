// pollerfilenodeproperties.tsx
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button" 
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useWorkflow } from "../workflow/workflow-context"

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function PollerFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  // Control visibility of Content as and Encoding fields based on Exclude File Content
  const showContentOptions = !formData.excludeFileContent
  const showEncodingOptions = showContentOptions && formData.contentAs === "text"

  // Update content type when exclude content changes
  useEffect(() => {
    if (formData.excludeFileContent && formData.contentAs) {
      onChange("contentAs", undefined)
    }
  }, [formData.excludeFileContent])

  // Update encoding when content type changes
  useEffect(() => {
    if (formData.contentAs !== "text" && formData.encoding) {
      onChange("encoding", undefined)
    }
  }, [formData.contentAs])

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/file-operations/poll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: formData.label,
          filepath: formData.filepath,
          pollingInterval: parseInt(formData.pollingInterval) || 5,
          includeExistingFiles: !!formData.includeExistingFiles,
          excludeFileContent: !!formData.excludeFileContent,
          contentAs: formData.contentAs || "text",
          encoding: formData.encoding || "utf-8",
          includeTimestamp: !!formData.includeTimestamp,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("File poller configured successfully")
        // Update the node's output with the API response data
        if (selectedNodeId) {
          updateNode(selectedNodeId, { 
            status: "success",
            output: data 
          })
        }
      } else {
        setError(data.message)
        // Update the node with error status and message
        if (selectedNodeId) {
          updateNode(selectedNodeId, { 
            status: "error",
            error: data.message,
            output: data 
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
          output: { error: errorMessage }
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Node Label */}
      <div className="space-y-2">
        <Label htmlFor="label">Operation Label</Label>
        <Input
          id="label"
          value={formData.label || ""}
          placeholder="File Poller"
          onChange={(e) => onChange("label", e.target.value)}
        />
      </div>

      {/* File Path */}
      <div className="space-y-2">
        <Label htmlFor="filepath">File Path or Pattern</Label>
        <Input
          id="filepath"
          value={formData.filepath || ""}
          placeholder="C:/files/*.log"
          onChange={(e) => onChange("filepath", e.target.value)}
        />
      </div>

      {/* Polling Interval */}
      <div className="space-y-2">
        <Label htmlFor="pollingInterval">Polling Interval (seconds)</Label>
        <Input
          id="pollingInterval"
          type="number"
          min="1"
          value={formData.pollingInterval || "5"}
          onChange={(e) => onChange("pollingInterval", e.target.value)}
        />
      </div>

      {/* Include Existing Files */}
      <div className="flex items-center space-x-2">
        <Switch
          id="includeExistingFiles"
          checked={!!formData.includeExistingFiles}
          onCheckedChange={(v) => onChange("includeExistingFiles", v)}
        />
        <Label htmlFor="includeExistingFiles" className="cursor-pointer">
          Include existing files
        </Label>
      </div>
    

      {/* Exclude File Content */}
      <div className="flex items-center space-x-2">
        <Switch
          id="excludeFileContent"
          checked={!!formData.excludeFileContent}
          onCheckedChange={(v) => onChange("excludeFileContent", v)}
        />
        <Label htmlFor="excludeFileContent" className="cursor-pointer">
          Exclude file content
        </Label>
      </div>
      {/* <p className="text-xs text-gray-500 pl-6">
        Specifies not to load the data from the file into this activity's output. 
        If selected, the contents of the file are not available to the subsequent activities in the process.
      </p> */}

      {/* Content as (visible only when Exclude File Content is OFF) */}
      {showContentOptions && (
        <div className="space-y-2">
          <Label htmlFor="contentAs">Content as</Label>
          <RadioGroup
            value={formData.contentAs || "text"}
            onValueChange={(value) => onChange("contentAs", value)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="text" id="contentAsText" />
              <Label htmlFor="contentAsText">Text</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="binary" id="contentAsBinary" />
              <Label htmlFor="contentAsBinary">Binary</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Encoding (visible only when Content as is "Text") */}
      {/* {showEncodingOptions && (
        <div className="space-y-2">
          <Label htmlFor="encoding">Encoding</Label>
          <Select
            value={formData.encoding || "utf-8"}
            onValueChange={(value) => onChange("encoding", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select encoding" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utf-8">UTF-8</SelectItem>
              <SelectItem value="ascii">ASCII</SelectItem>
              <SelectItem value="utf-16">UTF-16</SelectItem>
              <SelectItem value="iso-8859-1">ISO-8859-1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )} */}

      {/* Include Timestamp */}
      <div className="flex items-center space-x-2">
        <Switch
          id="includeTimestamp"
          checked={!!formData.includeTimestamp}
          onCheckedChange={(v) => onChange("includeTimestamp", v)}
        />
        <Label htmlFor="includeTimestamp" className="cursor-pointer">
          Include timestamp in addition to date
        </Label>
      </div>

      {/* Submit Button */}
      <div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {loading ? "Configuring Poller..." : "Configure File Poller"}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}