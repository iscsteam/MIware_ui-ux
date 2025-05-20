// "use client"
// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import { Switch } from "@/components/ui/switch"
// import { Button } from "@/components/ui/button"
// import { useState } from "react"
// import { useWorkflow } from "../workflow/workflow-context"

// export interface SchemaItem {
//   name: string
//   datatype: string
//   description: string
//   required?: boolean
// }

// export interface NodeSchema {
//   inputSchema: SchemaItem[]
//   outputSchema: SchemaItem[]
// }

// // Rename File node schema
// export const renameFileSchema: NodeSchema = {
//   inputSchema: [
//     {
//       name: "fromFilename",
//       datatype: "string",
//       description:
//         "The path and name of the file to rename or move, or the path and name of the directory to rename. The value in this element must be an absolute path.",
//       required: true,
//     },
//     {
//       name: "toFilename",
//       datatype: "string",
//       description:
//         "The new name and location of the file or directory. The files can be moved to a new location, but the directory location remains unchanged. The value of this element must be an absolute path.",
//       required: true,
//     },
//     {
//       name: "overwrite",
//       datatype: "boolean",
//       description: "Select this check box to overwrite the existing file with the same name when renaming or moving.",
//     },
//     {
//       name: "createNonExistingDirectories",
//       datatype: "boolean",
//       description:
//         "When this check box is selected, the activity creates all directories in the specified path, if they do not already exist.",
//     },
//     {
//       name: "includeTimestamp",
//       datatype: "boolean",
//       description: "Select the check box to display timestamp, in addition to the date.",
//     },
//   ],
//   outputSchema: [
//     {
//       name: "fileInfo",
//       datatype: "complex",
//       description:
//         "This element contains fullName, fileName, location, type, readProtected, writeProtected, size, and lastModified data.",
//     },
//     {
//       name: "fullName",
//       datatype: "string",
//       description: "The name of the file (or directory) including the path information.",
//     },
//     {
//       name: "fileName",
//       datatype: "string",
//       description: "The name of the file (or directory) without the path information.",
//     },
//     {
//       name: "location",
//       datatype: "string",
//       description: "The path to the file or the directory.",
//     },
//     {
//       name: "configuredFileName",
//       datatype: "string",
//       description: "An optional element. This element is not populated by this activity.",
//     },
//     {
//       name: "type",
//       datatype: "string",
//       description: "The file type.",
//     },
//     {
//       name: "readProtected",
//       datatype: "boolean",
//       description: "Signifies whether the file or directory is protected from reading",
//     },
//     {
//       name: "writeProtected",
//       datatype: "boolean",
//       description: "Signifies whether the file or directory is protected from writing",
//     },
//     {
//       name: "size",
//       datatype: "integer",
//       description: "The size of file in bytes.",
//     },
//     {
//       name: "lastModified",
//       datatype: "string",
//       description: "The timestamp indicating when the file was last modified.",
//     },
//   ],
// }

// interface Props {
//   formData: Record<string, any>
//   onChange: (name: string, value: any) => void
// }

// export default function RenameFileNodeProperties({ formData, onChange }: Props) {
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState<string | null>(null)
//   const { updateNode, selectedNodeId } = useWorkflow()

//   // Expose the schema for this node
//   const schema = renameFileSchema

//   const handleSubmit = async () => {
//     setLoading(true)
//     setError(null)
//     setSuccess(null)

//     try {
//       const response = await fetch("http://localhost:5000/api/file-operations/rename", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           displayName: formData.displayName,
//           fromFilename: formData.fromFilename,
//           toFilename: formData.toFilename,
//           overwrite: formData.overwrite,
//           createNonExistingDirectories: formData.createNonExistingDirectories,
//           includeTimestamp: formData.includeTimestamp,
//         }),
//       })

//       const data = await response.json()

//       if (response.ok) {
//         setSuccess(data.message)
//         // Update the node's output with the API response data
//         if (selectedNodeId) {
//           updateNode(selectedNodeId, {
//             status: "success",
//             output: data,
//           })
//         }
//       } else {
//         setError(data.message)
//         // Update the node with error status and message
//         if (selectedNodeId) {
//           updateNode(selectedNodeId, {
//             status: "error",
//             error: data.message,
//             output: data,
//           })
//         }
//       }
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : "Error connecting to the server."
//       setError(errorMessage)
//       // Update node with error status
//       if (selectedNodeId) {
//         updateNode(selectedNodeId, {
//           status: "error",
//           error: errorMessage,
//           output: { error: errorMessage },
//         })
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-4">
//       {/* Node Name */}
//       <div className="space-y-2">
//         <Label htmlFor="displayName">Name</Label>
//         <Input
//           id="displayName"
//           value={formData.displayName || ""}
//           placeholder="Rename File"
//           onChange={(e) => onChange("displayName", e.target.value)}
//         />
//       </div>

//       {/* From Filename */}
//       <div className="space-y-2">
//         <Label htmlFor="fromFilename">From Filename</Label>
//         <Input
//           id="fromFilename"
//           value={formData.fromFilename || ""}
//           placeholder="C:/Path/To/OriginalFile.txt"
//           onChange={(e) => onChange("fromFilename", e.target.value)}
//         />
//         <p className="text-xs text-gray-500">The absolute path and name of the file or directory to rename.</p>
//       </div>

//       {/* To Filename */}
//       <div className="space-y-2">
//         <Label htmlFor="toFilename">To Filename</Label>
//         <Input
//           id="toFilename"
//           value={formData.toFilename || ""}
//           placeholder="C:/Path/To/NewFile.txt"
//           onChange={(e) => onChange("toFilename", e.target.value)}
//         />
//         <p className="text-xs text-gray-500">The new name and location of the file or directory (absolute path).</p>
//       </div>

//       {/* Overwrite */}
//       <div className="flex items-center space-x-2">
//         <Switch id="overwrite" checked={!!formData.overwrite} onCheckedChange={(v) => onChange("overwrite", v)} />
//         <Label htmlFor="overwrite" className="cursor-pointer">
//           Overwrite if exists
//         </Label>
//       </div>

//       {/* Create Non-Existing Directories */}
//       <div className="flex items-center space-x-2">
//         <Switch
//           id="createNonExistingDirectories"
//           checked={!!formData.createNonExistingDirectories}
//           onCheckedChange={(v) => onChange("createNonExistingDirectories", v)}
//         />
//         <Label htmlFor="createNonExistingDirectories" className="cursor-pointer">
//           Create Non-Existing Directories
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
//           Include timestamp
//         </Label>
//       </div>

//       {/* Submit Button */}
//       <div>
//         <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
//           {loading ? "Renaming..." : "Rename File"}
//         </Button>
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
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useWorkflow } from "../workflow/workflow-context"

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

// Updated schema based on the payload
export const renameFileSchema: NodeSchema = {
  inputSchema: [
    {
      name: "source_path",
      datatype: "string",
      description: "The absolute path of the file or directory to rename.",
      required: true,
    },
    {
      name: "destination_path",
      datatype: "string",
      description: "The new absolute path of the renamed file or directory.",
      required: true,
    },
  ],
  outputSchema: [
    {
      name: "message",
      datatype: "string",
      description: "Status message returned after rename operation.",
    },
    {
      name: "success",
      datatype: "boolean",
      description: "Indicates whether the rename operation was successful.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function RenameFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("http://localhost:5000/api/file-operations/rename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: "rename",
          source_path: formData.source_path,
          destination_path: formData.destination_path,
          executed_by: "cli_user",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        if (selectedNodeId) {
          updateNode(selectedNodeId, {
            status: "success",
            output: data,
          })
        }
      } else {
        setError(data.message)
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
      {/* Source Path */}
      <div className="space-y-2">
        <Label htmlFor="source_path">Source Path</Label>
        <Input
          id="source_path"
          value={formData.source_path || ""}
          placeholder="/data/report_draft.txt"
          onChange={(e) => onChange("source_path", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          The absolute path of the file or directory to rename.
        </p>
      </div>

      {/* Destination Path */}
      <div className="space-y-2">
        <Label htmlFor="destination_path">Destination Path</Label>
        <Input
          id="destination_path"
          value={formData.destination_path || ""}
          placeholder="/data/report_final.txt"
          onChange={(e) => onChange("destination_path", e.target.value)}
        />
        <p className="text-xs text-gray-500">
          The new absolute path of the renamed file or directory.
        </p>
      </div>

      {/* Submit Button */}
      <div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {loading ? "Renaming..." : "Rename File"}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
