// //readfilenodeproperties.tsx
"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useWorkflow } from "../workflow/workflow-context"

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function ReadFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  // Read file operation function
  async function handleReadFile() {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const response = await fetch("http://localhost:5000/api/file-operations/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: formData.filename,
          label: formData.label,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to read file")
      }

      setSuccessMessage("File read successfully!")
      console.log("FileMeta:", data.fileMeta)
      
      // Update the node output with the API response data
      if (selectedNodeId) {
        updateNode(selectedNodeId, { 
          status: "success",
          output: {
            ...data,
            fileContents: data.content || data.fileContents,
            path: data.filename || formData.filename,
            size: data.size || (data.fileMeta && data.fileMeta.size),
            modifiedDate: data.modifiedDate || (data.fileMeta && data.fileMeta.modifiedTime),
            success: true
          }
        })
      }
    } catch (err: any) {
      console.error(err)
      const errorMessage = err.message || "Unknown error occurred"
      setError(errorMessage)
      
      // Update the node with error status
      if (selectedNodeId) {
        updateNode(selectedNodeId, { 
          status: "error",
          error: errorMessage,
          output: { 
            error: errorMessage,
            filename: formData.filename,
            success: false
          }
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
        <Label htmlFor="label">Node Label</Label>
        <Input
          id="label"
          value={formData.label || ""}
          placeholder="Node label (e.g., Read Sample File)"
          onChange={(e) => onChange("label", e.target.value)}
        />
      </div>

      {/* File Name */}
      <div className="space-y-2">
        <Label htmlFor="filename">File Name</Label>
        <Input
          id="filename"
          value={formData.filename || ""}
          placeholder="path/to/file.txt"
          onChange={(e) => onChange("filename", e.target.value)}
        />
      </div>

      {/* Read File Button */}
      <div>
        <Button 
          onClick={handleReadFile} 
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? "Reading..." : "Read File"}
        </Button>
      </div>

      {/* Success or Error messages */}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}