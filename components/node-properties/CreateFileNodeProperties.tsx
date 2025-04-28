// //createfilenodeproperties.tsx
// "use client"
// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import { Switch } from "@/components/ui/switch"
// import { useState } from "react"

// interface Props {
//   formData: Record<string, any>
//   onChange: (name: string, value: any) => void
// }

// export default function CreateFileNodeProperties({ formData, onChange }: Props) {
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState<string | null>(null)

//   const handleSubmit = async () => {
//     setLoading(true)
//     setError(null)
//     setSuccess(null)

//     try {
//       const response = await fetch("http://localhost:5000/api/file-operations/create", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           label: formData.label,
//           filename: formData.filename,
//           overwrite: formData.overwrite,
//           isDirectory: formData.isDirectory,
//           includeTimestamp: formData.includeTimestamp,
//         }),
//       })

//       const data = await response.json()

//       if (response.ok) {
//         setSuccess(data.message)
//         // Optionally, reset the form or update the state
//       } else {
//         setError(data.message)
//       }
//     } catch (err) {
//       setError("Error connecting to the server.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-4">
//       {/* File Name (previously Node Label) */}
//       <div className="space-y-2">
//         <Label htmlFor="label">File Name</Label>
//         <Input
//           id="label"
//           value={formData.label || ""}
//           placeholder="Create File"
//           onChange={(e) => onChange("label", e.target.value)}
//         />
//       </div>

//       {/* File Path (previously File Name) */}
//       <div className="space-y-2">
//         <Label htmlFor="filename">File Path</Label>
//         <Input
//           id="filename"
//           value={formData.filename || ""}
//           placeholder="C:/Users/Public/Music"
//           onChange={(e) => onChange("filename", e.target.value)}
//         />
//       </div>

//       {/* Overwrite */}
//       <div className="flex items-center space-x-2">
//         <Switch id="overwrite" checked={!!formData.overwrite} onCheckedChange={(v) => onChange("overwrite", v)} />
//         <Label htmlFor="overwrite" className="cursor-pointer">
//           Overwrite if exists
//         </Label>
//       </div>

//       {/* Is Directory */}
//       <div className="flex items-center space-x-2">
//         <Switch id="isDirectory" checked={!!formData.isDirectory} onCheckedChange={(v) => onChange("isDirectory", v)} />
//         <Label htmlFor="isDirectory" className="cursor-pointer">
//           Create as directory
//         </Label>
//       </div>

//       {/* Include Timestamp */}
//       <div className="flex items-center space-x-2">
//         <Switch
//           id="includeTimestamp"
//           checked={!!formData.includeTimestamp}
//           onCheckedChange={(v) => onChange("includeTimestamp", v)}
//         />
//         <Label htmlFor="includeTimestamp" className="cursor-pointer">
//           Include timestamp in name
//         </Label>
//       </div>

//       {/* Submit Button */}
//       <div>
//         <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
//           {loading ? "Creating..." : "Create File"}
//         </button>
//       </div>

//       {/* Success/Error Messages */}
//       {success && <p className="text-green-500">{success}</p>}
//       {error && <p className="text-red-500">{error}</p>}
//     </div>
//   )
// }
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

export default function CreateFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/file-operations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: formData.label,
          filename: formData.filename,
          overwrite: formData.overwrite,
          isDirectory: formData.isDirectory,
          includeTimestamp: formData.includeTimestamp,
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
      {/* File Name (previously Node Label) */}
      <div className="space-y-2">
        <Label htmlFor="label">File Name</Label>
        <Input
          id="label"
          value={formData.label || ""}
          placeholder="Create File"
          onChange={(e) => onChange("label", e.target.value)}
        />
      </div>

      {/* File Path (previously File Name) */}
      <div className="space-y-2">
        <Label htmlFor="filename">File Path</Label>
        <Input
          id="filename"
          value={formData.filename || ""}
          placeholder="C:/Users/Public/Music"
          onChange={(e) => onChange("filename", e.target.value)}
        />
      </div>

      {/* Overwrite */}
      <div className="flex items-center space-x-2">
        <Switch id="overwrite" checked={!!formData.overwrite} onCheckedChange={(v) => onChange("overwrite", v)} />
        <Label htmlFor="overwrite" className="cursor-pointer">
          Overwrite if exists
        </Label>
      </div>

      {/* Is Directory */}
      <div className="flex items-center space-x-2">
        <Switch id="isDirectory" checked={!!formData.isDirectory} onCheckedChange={(v) => onChange("isDirectory", v)} />
        <Label htmlFor="isDirectory" className="cursor-pointer">
          Create as directory
        </Label>
      </div>

      {/* Include Timestamp */}
      <div className="flex items-center space-x-2">
        <Switch
          id="includeTimestamp"
          checked={!!formData.includeTimestamp}
          onCheckedChange={(v) => onChange("includeTimestamp", v)}
        />
        <Label htmlFor="includeTimestamp" className="cursor-pointer">
          Include timestamp in name
        </Label>
      </div>

      {/* Submit Button */}
      <div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {loading ? "Creating..." : "Create File"}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}