// //node-properties-panel.tsx
// "use client" 
// import { useState, useEffect } from "react"
// import { X } from "lucide-react"
// import { useWorkflow } from "./workflow-context"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Switch } from "@/components/ui/switch"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// interface NodePropertiesConfig {
//   [key: string]: {
//     fields: {
//       name: string
//       label: string
//       type: "text" | "textarea" | "boolean" | "select"
//       options?: string[]
//       placeholder?: string
//     }[]
//   }
// }

// const nodePropertiesConfig: NodePropertiesConfig = {
  
//   start: {
//     fields: [
//       {
//         name: "label",
//         label: "Node Label",
//         type: "text",
//         placeholder: "start",
//       },
//     ],
//   },

//   end: {
//     fields: [
//       {
//         name: "label",
//         label: "Node Label",
//         type: "text",
//         placeholder: "End",
//       },
//     ],
//   },
//   "create-file": {
//     fields: [
//       {
//         name: "label",
//         label: "Node Label",
//         type: "text",
//         placeholder: "Create File",
//       },
//       {
//         name: "filename",
//         label: "File Name",
//         type: "text",
//         placeholder: "path/to/file.txt",
//       },
//       {
//         name: "overwrite",
//         label: "Overwrite if exists",
//         type: "boolean",
//       },
//       {
//         name: "isDirectory",
//         label: "Create as directory",
//         type: "boolean",
//       },
//       {
//         name: "includeTimestamp",
//         label: "Include timestamp in name",
//         type: "boolean",
//       },
//     ],
//   },
//   "read-file": {
//     fields: [
//       {
//         name: "label",
//         label: "Node Label",
//         type: "text",
//         placeholder: "Read File",
//       },
//       {
//         name: "filename",
//         label: "File Name",
//         type: "text",
//         placeholder: "path/to/file.txt",
//       },
//       {
//         name: "encoding",
//         label: "Encoding",
//         type: "select",
//         options: ["utf-8", "ascii", "binary"],
//       },
//       {
//         name: "readAs",
//         label: "Read As",
//         type: "select",
//         options: ["text", "binary"],
//       },
//       {
//         name: "excludeContent",
//         label: "Exclude content (metadata only)",
//         type: "boolean",
//       },
//     ],
//   },
//   "write-file": {
//     fields: [
//       {
//         name: "label",
//         label: "Node Label",
//         type: "text",
//         placeholder: "Write File",
//       },
//       {
//         name: "filename",
//         label: "File Name",
//         type: "text",
//         placeholder: "path/to/file.txt",
//       },
//       {
//         name: "textContent",
//         label: "Content",
//         type: "textarea",
//         placeholder: "File content...",
//       },
//       {
//         name: "append",
//         label: "Append to file",
//         type: "boolean",
//       },
//       {
//         name: "writeAs",
//         label: "Write As",
//         type: "select",
//         options: ["text", "binary"],
//       },
//       {
//         name: "encoding",
//         label: "Encoding",
//         type: "select",
//         options: ["utf-8", "ascii", "binary"],
//       },
//       {
//         name: "addLineSeparator",
//         label: "Add line separator",
//         type: "boolean",
//       },
//     ],
//   },
//   "copy": {
//     fields: [
//       {
//         name: "label",
//         label: "Node Label",
//         type: "text",
//         placeholder: "Copy File",
//       },
//       {
//         name: "fromFilename",
//         label: "Source File",
//         type: "text",
//         placeholder: "path/to/source.txt",
//       },
//       {
//         name: "toFilename",
//         label: "Destination File",
//         type: "text",
//         placeholder: "path/to/destination.txt",
//       },
//       {
//         name: "overwrite",
//         label: "Overwrite if exists",
//         type: "boolean",
//       },
//       {
//         name: "includeSubDirectories",
//         label: "Include subdirectories",
//         type: "boolean",
//       },
//       {
//         name: "createNonExistingDirs",
//         label: "Create non-existing directories",
//         type: "boolean",
//       },
//     ],
//   },
//   "code": {
//     fields: [
//       {
//         name: "label",
//         label: "Node Label",
//         type: "text",
//         placeholder: "Code",
//       },
//       {
//         name: "filename",
//         label: "Output File Name",
//         type: "text",
//         placeholder: "output.json",
//       },
//       {
//         name: "mode",
//         label: "Execution Mode",
//         type: "select",
//         options: ["runOnce", "runEach"],
//       },
//       {
//         name: "language",
//         label: "Language",
//         type: "select",
//         options: ["javascript", "python"],
//       },
//       {
//         name: "code",
//         label: "Code",
//         type: "textarea",
//         placeholder: "// Your code here",
//       },
//     ],
//   },
// }

// interface NodePropertiesPanelProps {
//   nodeId: string
//   onClose: () => void
// }

// export function NodePropertiesPanel({ nodeId, onClose }: NodePropertiesPanelProps) {
//   const { getNodeById, updateNode } = useWorkflow();
//   const [formData, setFormData] = useState<Record<string, any>>({});

//   const node = getNodeById(nodeId);

//   useEffect(() => {
//     if (node) {
//       setFormData(node.data || {});
//     }
//   }, [node]);

//   if (!node) return null;

//   // --- Solution Applied ---
//   // 1. Normalize lookup (assuming nodePropertiesConfig keys are now lowercase)
//   const nodeTypeKey = node.type ? node.type.toLowerCase() : '';
//   const config = nodePropertiesConfig[nodeTypeKey];
//   // --- End Solution ---

//   const handleChange = (name: string, value: any) => {
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSave = () => {
//     updateNode(nodeId, { data: formData });
//   };

//   // --- Solution Applied ---
//   // 2. Check if config was found before trying to render fields
//   const renderFields = () => {
//     if (!config) {
//       return (
//         <div className="text-sm text-muted-foreground italic p-2 border border-dashed rounded">
//           No configuration found for node type: "{node.type}".
//         </div>
//       );
//     }

//     if (!config.fields || config.fields.length === 0) {
//         return (
//             <div className="text-sm text-muted-foreground">
//                  This node type has no configurable properties.
//             </div>
//         );
//     }

//     return (
//       <div className="space-y-4">
//         {config.fields.map((field) => (
//           <div key={field.name} className="space-y-2">
//             <Label htmlFor={field.name}>{field.label}</Label>

//             {field.type === "text" && (
//               <Input
//                 id={field.name}
//                 value={formData[field.name] || ""}
//                 placeholder={field.placeholder}
//                 onChange={(e) => handleChange(field.name, e.target.value)}
//               />
//             )}
//             {/* ... other field types ... */}
//              {field.type === "textarea" && (
//                   <Textarea
//                     id={field.name}
//                     value={formData[field.name] || ""}
//                     placeholder={field.placeholder}
//                     onChange={(e) => handleChange(field.name, e.target.value)}
//                     rows={4}
//                   />
//                 )}

//                 {field.type === "boolean" && (
//                   <div className="flex items-center space-x-2">
//                     <Switch
//                       id={field.name}
//                       checked={formData[field.name] || false}
//                       onCheckedChange={(checked) => handleChange(field.name, checked)}
//                     />
//                     {/* Use field.label for Switch label if desired, or keep generic "Enabled" */}
//                     <Label htmlFor={field.name}>{field.label}</Label>
//                   </div>
//                 )}

//                 {field.type === "select" && field.options && (
//                   <Select
//                     // Provide a default value if formData doesn't have one yet
//                     value={formData[field.name] ?? (field.options.length > 0 ? field.options[0] : '')}
//                     onValueChange={(value) => handleChange(field.name, value)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder={`Select ${field.label}`} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {field.options.map((option) => (
//                         <SelectItem key={option} value={option}>
//                           {option}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 )}
//           </div>
//         ))}
//       </div>
//     );
//   };
//   // --- End Solution ---


//   return (
//     <div className="absolute right-0 top-0 h-full w-80 border-l bg-background p-4 shadow-md flex flex-col">
//       {/* Header */}
//       <div className="flex items-center justify-between border-b pb-2">
//         <h3 className="text-lg font-medium">Node Properties</h3>
//         <Button variant="ghost" size="icon" onClick={onClose}>
//           <X className="h-4 w-4" />
//         </Button>
//       </div>

//       {/* Scrollable Content */}
//       <div className="flex-1 overflow-y-auto py-4 pr-2 scrollbar-hide">
//         <div className="mb-4">
//           <div className="text-sm font-medium text-muted-foreground">Node Type</div>
//           <div className="text-lg">
//             {/* Display the original node type */}
//             {node.type
//               .split("-")
//               .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//               .join(" ")}
//           </div>
//         </div>

//         {/* Use the renderFields function */}
//         {renderFields()}

//       </div>

//       {/* Footer */}
//       <div className="border-t pt-4">
//         <Button className="w-full" onClick={handleSave}>
//           Save Properties
//         </Button>
//       </div>
//     </div>
//   );
// }

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useWorkflow } from "./workflow-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NodePropertiesPanelProps {
  nodeId: string
  onClose: () => void
}

export function NodePropertiesPanel({ nodeId, onClose }: NodePropertiesPanelProps) {
  const { getNodeById, updateNode } = useWorkflow()
  const node = getNodeById(nodeId)
  const [formData, setFormData] = useState<any>({})
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (node) {
      setFormData({ ...node.data })
    }
  }, [node])

  if (!node) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev: any) => ({ ...prev, [name]: checked }))
  }

  const handleSave = () => {
    updateNode(nodeId, { data: formData })
  }

  const handleFileUpload = async () => {
    if (!file) return
    const formDataObj = new FormData()
    formDataObj.append("file", file)

    try {
      setUploading(true)
      const res = await fetch(" http://localhost:5000/api/read-file", {
        method: "POST",
        body: formDataObj,
      })

      const result = await res.json()

      if (res.ok) {
        setFormData((prev: any) => ({
          ...prev,
          filename: result.fileMeta.originalname,
          fileId: result.fileId,
          content: result.fileMeta.content,
        }))
        updateNode(nodeId, {
          data: {
            ...formData,
            filename: result.fileMeta.originalname,
            fileId: result.fileId,
            content: result.fileMeta.content,
          },
        })
        alert("File uploaded and parsed successfully")
      } else {
        alert(result.message || "Upload failed")
      }
    } catch (err) {
      console.error("Upload error:", err)
      alert("An error occurred while uploading the file.")
    } finally {
      setUploading(false)
    }
  }

  const renderNodeSpecificFields = () => {
    switch (node.type) {
      case "read-file":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <Input
                id="filename"
                name="filename"
                value={formData.filename || ""}
                onChange={handleInputChange}
                placeholder="Enter filename"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0])
                  }
                }}
              />
              <Button onClick={handleFileUpload} disabled={uploading || !file}>
                {uploading ? "Uploading..." : "Upload & Parse"}
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="excludeContent"
                checked={formData.excludeContent || false}
                onCheckedChange={(checked) => handleSwitchChange("excludeContent", checked)}
              />
              <Label htmlFor="excludeContent">Exclude Content</Label>
            </div>

            {formData.content && Array.isArray(formData.content) && (
              <div className="mt-4">
                <Label>Parsed Content (Preview)</Label>
                <pre className="bg-gray-100 p-2 rounded text-xs max-h-40 overflow-auto">
                  {JSON.stringify(formData.content.slice(0, 3), null, 2)}
                </pre>
              </div>
            )}
          </>
        )

      // Other node types unchanged
      case "write-file":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <Input
                id="filename"
                name="filename"
                value={formData.filename || ""}
                onChange={handleInputChange}
                placeholder="Enter filename"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content || ""}
                onChange={handleInputChange}
                placeholder="Enter content"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="append"
                checked={formData.append || false}
                onCheckedChange={(checked) => handleSwitchChange("append", checked)}
              />
              <Label htmlFor="append">Append to file</Label>
            </div>
          </>
        )

      case "copy-file":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="sourceFilename">Source Filename</Label>
              <Input
                id="sourceFilename"
                name="sourceFilename"
                value={formData.sourceFilename || ""}
                onChange={handleInputChange}
                placeholder="Enter source filename"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetFilename">Target Filename</Label>
              <Input
                id="targetFilename"
                name="targetFilename"
                value={formData.targetFilename || ""}
                onChange={handleInputChange}
                placeholder="Enter target filename"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="overwrite"
                checked={formData.overwrite || false}
                onCheckedChange={(checked) => handleSwitchChange("overwrite", checked)}
              />
              <Label htmlFor="overwrite">Overwrite if exists</Label>
            </div>
          </>
        )

      case "code":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                name="language"
                value={formData.language || "javascript"}
                onChange={handleInputChange}
                placeholder="Enter language"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Textarea
                id="code"
                name="code"
                value={formData.code || ""}
                onChange={handleInputChange}
                placeholder="Enter code"
                rows={8}
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l shadow-lg z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium capitalize">{node.type.replace("-", " ")} Properties</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              name="label"
              value={formData.label || ""}
              onChange={handleInputChange}
              placeholder="Enter node label"
            />
          </div>

          {renderNodeSpecificFields()}
        </div>
      </ScrollArea>

      <div className="p-4 border-t flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  )
}
