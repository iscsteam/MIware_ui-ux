// deletefilenodeproperties.tsx
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button" 
import { useState } from "react"
import { useWorkflow } from "../workflow/workflow-context"

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function DeleteFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/file-operations/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: formData.label,
          filepath: formData.filepath,
          recursive: formData.recursive,
          skipTrash: formData.skipTrash,
          onlyIfExists: formData.onlyIfExists,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
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
          placeholder="Delete File"
          onChange={(e) => onChange("label", e.target.value)}
        />
      </div>

      {/* File Path */}
      <div className="space-y-2">
        <Label htmlFor="filepath">File Path</Label>
        <Input
          id="filepath"
          value={formData.filepath || ""}
          placeholder="C:/Users/Public/Music/file.txt"
          onChange={(e) => onChange("filepath", e.target.value)}
        />
      </div>

      {/* Recursive Delete (for directories) */}
      <div className="flex items-center space-x-2">
        <Switch id="recursive" checked={!!formData.recursive} onCheckedChange={(v) => onChange("recursive", v)} />
        <Label htmlFor="recursive" className="cursor-pointer">
          Delete recursively (for directories)
        </Label>
      </div>

      {/* Skip Trash */}
      <div className="flex items-center space-x-2">
        <Switch id="skipTrash" checked={!!formData.skipTrash} onCheckedChange={(v) => onChange("skipTrash", v)} />
        <Label htmlFor="skipTrash" className="cursor-pointer">
          Permanently delete (skip trash)
        </Label>
      </div>

      {/* Only If Exists */}
      <div className="flex items-center space-x-2">
        <Switch
          id="onlyIfExists"
          checked={formData.onlyIfExists !== false} // Default to true
          onCheckedChange={(v) => onChange("onlyIfExists", v)}
        />
        <Label htmlFor="onlyIfExists" className="cursor-pointer">
          Only delete if file exists (no error otherwise)
        </Label>
      </div>

      {/* Submit Button */}
      <div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-red-500 hover:bg-red-600 text-white">
          {loading ? "Deleting..." : "Delete File"}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}