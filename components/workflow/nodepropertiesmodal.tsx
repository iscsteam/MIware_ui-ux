// NodePropertiesModal.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
// Removed X icon if DialogClose is used everywhere
import { useWorkflow } from "./workflow-context" // Adjust path if needed
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose, // Use DialogClose for cancel/close
  // DialogDescription, // Optional
} from "@/components/ui/dialog"

// --- Re-paste your nodePropertiesConfig here ---
interface NodePropertiesConfig {
  [key: string]: {
    fields: {
      name: string
      label: string
      type: "text" | "textarea" | "boolean" | "select"
      options?: string[]
      placeholder?: string
    }[]
  }
}

const nodePropertiesConfig: NodePropertiesConfig = {
  start: { fields: [] },
  END: { fields: [] },
  "CREATE": {
    fields: [
      { name: "filename", label: "File Name", type: "text", placeholder: "path/to/file.txt" },
      { name: "overwrite", label: "Overwrite if exists", type: "boolean" },
      { name: "isDirectory", label: "Create as directory", type: "boolean" },
      { name: "includeTimestamp", label: "Include timestamp in name", type: "boolean" },
    ],
  },
  "READ": {
    fields: [
      { name: "filename", label: "File Name", type: "text", placeholder: "path/to/file.txt" },
      { name: "encoding", label: "Encoding", type: "select", options: ["utf-8", "ascii", "binary"] },
      { name: "readAs", label: "Read As", type: "select", options: ["text", "binary"] },
      { name: "excludeContent", label: "Exclude content (metadata only)", type: "boolean" },
    ],
  },
  "WRITE": {
    fields: [
      { name: "filename", label: "File Name", type: "text", placeholder: "path/to/file.txt" },
      { name: "textContent", label: "Content", type: "textarea", placeholder: "File content..." },
      { name: "append", label: "Append to file", type: "boolean" },
      { name: "writeAs", label: "Write As", type: "select", options: ["text", "binary"] },
      { name: "encoding", label: "Encoding", type: "select", options: ["utf-8", "ascii", "binary"] },
      { name: "addLineSeparator", label: "Add line separator", type: "boolean" },
    ],
  },
  "COPY": {
    fields: [
      { name: "fromFilename", label: "Source File", type: "text", placeholder: "path/to/source.txt" },
      { name: "toFilename", label: "Destination File", type: "text", placeholder: "path/to/destination.txt" },
      { name: "overwrite", label: "Overwrite if exists", type: "boolean" },
      { name: "includeSubDirectories", label: "Include subdirectories", type: "boolean" },
      { name: "createNonExistingDirs", label: "Create non-existing directories", type: "boolean" },
    ],
  },
   "CODE": { // Example for 'code' node type
    fields: [
        { name: "codeContent", label: "Code Snippet", type: "textarea", placeholder: "// Write your code here..." },
        { name: "language", label: "Language", type: "select", options: ["javascript", "python", "shell"] },
        { name: "timeout", label: "Timeout (ms)", type: "text", placeholder: "10000" }, // Use text for number input initially
    ],
  },
  // ... add other node types if needed
}
// --- End nodePropertiesConfig ---


export function NodePropertiesModal() {
  // Use the state specific to the properties modal from the latest context
  const {
    propertiesModalNodeId,
    setPropertiesModalNodeId,
    getNodeById,
    updateNode
  } = useWorkflow()

  const [formData, setFormData] = useState<Record<string, any>>({})

  // Memoize the node lookup
  const node = useMemo(() => {
    return propertiesModalNodeId ? getNodeById(propertiesModalNodeId) : null;
  }, [propertiesModalNodeId, getNodeById]);

  // Effect to load/reset form data when the selected node changes
  useEffect(() => {
    if (node) {
      const initialData = { ...(node.data || {}) };
      const config = nodePropertiesConfig[node.type];

      // Initialize with defaults for missing fields
      if (config?.fields) {
        config.fields.forEach(field => {
          if (initialData[field.name] === undefined) {
            if (field.type === 'boolean') initialData[field.name] = false;
            else if (field.type === 'select' && field.options?.length) initialData[field.name] = field.options[0];
            else initialData[field.name] = '';
          }
        });
      }
      setFormData(initialData);
    } else {
      setFormData({}); // Clear form if no node is selected
    }
  }, [node]); // Depend on the derived node object

  // Don't render if no node is selected for properties
  if (!node) return null;

  const config = nodePropertiesConfig[node.type];

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!propertiesModalNodeId) return;
    // Use the specific updateNode signature { data: ... }
    updateNode(propertiesModalNodeId, { data: formData });
    setPropertiesModalNodeId(null); // Close modal after save
  };

  // Handler for Dialog's onOpenChange
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setPropertiesModalNodeId(null); // Ensure modal closes if 'X' or overlay is clicked
    }
  };

  // Generate title
  const nodeTypeTitle = node.type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <Dialog open={!!propertiesModalNodeId} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{nodeTypeTitle} Properties</DialogTitle>
          {/* Optional: Add a description */}
          {/* <DialogDescription>Configure settings for the {node.type} node.</DialogDescription> */}
        </DialogHeader>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto py-4 pr-2 space-y-4 scrollbar-hide">
          {config?.fields && config.fields.length > 0 ? (
            config.fields.map((field) => (
              <div key={field.name} className="space-y-1"> {/* Reduced space */}
                <Label htmlFor={field.name} className="text-sm font-medium"> {/* Adjusted label style */}
                  {field.label}
                </Label>

                {field.type === "text" && (
                  <Input
                    id={field.name}
                    value={formData[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                )}

                {field.type === "textarea" && (
                  <Textarea
                    id={field.name}
                    value={formData[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    rows={4}
                  />
                )}

                {field.type === "boolean" && (
                  <div className="flex items-center space-x-2 pt-2"> {/* Added padding-top */}
                    <Switch
                      id={field.name}
                      checked={!!formData[field.name]} // Ensure boolean conversion
                      onCheckedChange={(checked) => handleChange(field.name, checked)}
                    />
                    {/* Optional: Label next to switch if needed */}
                    {/* <Label htmlFor={field.name} className="text-sm">Enabled</Label> */}
                  </div>
                )}

                {field.type === "select" && field.options && (
                  <Select
                    value={formData[field.name] ?? (field.options[0] ?? '')} // Handle potential undefined value
                    onValueChange={(value) => handleChange(field.name, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-8">
              This node type has no configurable properties.
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <DialogFooter className="mt-4"> {/* Added margin-top */}
           {/* Only show Save if there are fields */}
           {config?.fields && config.fields.length > 0 && (
             <Button onClick={handleSave}>Save Changes</Button>
           )}
           <DialogClose asChild>
              <Button type="button" variant="outline">
                 {config?.fields && config.fields.length > 0 ? "Cancel" : "Close"}
              </Button>
           </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}