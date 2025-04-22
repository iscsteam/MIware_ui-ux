//node-properties-panel.tsx
"use client" 
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { useWorkflow } from "./workflow-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  
  start: {
    fields: [
      {
        name: "label",
        label: "Node Label",
        type: "text",
        placeholder: "start",
      },
    ],
  },

  end: {
    fields: [
      {
        name: "label",
        label: "Node Label",
        type: "text",
        placeholder: "End",
      },
    ],
  },
  "create-file": {
    fields: [
      {
        name: "label",
        label: "Node Label",
        type: "text",
        placeholder: "Create File",
      },
      {
        name: "filename",
        label: "File Name",
        type: "text",
        placeholder: "path/to/file.txt",
      },
      {
        name: "overwrite",
        label: "Overwrite if exists",
        type: "boolean",
      },
      {
        name: "isDirectory",
        label: "Create as directory",
        type: "boolean",
      },
      {
        name: "includeTimestamp",
        label: "Include timestamp in name",
        type: "boolean",
      },
    ],
  },
  "read-file": {
    fields: [
      {
        name: "label",
        label: "Node Label",
        type: "text",
        placeholder: "Read File",
      },
      {
        name: "filename",
        label: "File Name",
        type: "text",
        placeholder: "path/to/file.txt",
      },
      {
        name: "encoding",
        label: "Encoding",
        type: "select",
        options: ["utf-8", "ascii", "binary"],
      },
      {
        name: "readAs",
        label: "Read As",
        type: "select",
        options: ["text", "binary"],
      },
      {
        name: "excludeContent",
        label: "Exclude content (metadata only)",
        type: "boolean",
      },
    ],
  },
  "write-file": {
    fields: [
      {
        name: "label",
        label: "Node Label",
        type: "text",
        placeholder: "Write File",
      },
      {
        name: "filename",
        label: "File Name",
        type: "text",
        placeholder: "path/to/file.txt",
      },
      {
        name: "textContent",
        label: "Content",
        type: "textarea",
        placeholder: "File content...",
      },
      {
        name: "append",
        label: "Append to file",
        type: "boolean",
      },
      {
        name: "writeAs",
        label: "Write As",
        type: "select",
        options: ["text", "binary"],
      },
      {
        name: "encoding",
        label: "Encoding",
        type: "select",
        options: ["utf-8", "ascii", "binary"],
      },
      {
        name: "addLineSeparator",
        label: "Add line separator",
        type: "boolean",
      },
    ],
  },
  "copy": {
    fields: [
      {
        name: "label",
        label: "Node Label",
        type: "text",
        placeholder: "Copy File",
      },
      {
        name: "fromFilename",
        label: "Source File",
        type: "text",
        placeholder: "path/to/source.txt",
      },
      {
        name: "toFilename",
        label: "Destination File",
        type: "text",
        placeholder: "path/to/destination.txt",
      },
      {
        name: "overwrite",
        label: "Overwrite if exists",
        type: "boolean",
      },
      {
        name: "includeSubDirectories",
        label: "Include subdirectories",
        type: "boolean",
      },
      {
        name: "createNonExistingDirs",
        label: "Create non-existing directories",
        type: "boolean",
      },
    ],
  },
  "code": {
    fields: [
      {
        name: "label",
        label: "Node Label",
        type: "text",
        placeholder: "Code",
      },
      {
        name: "filename",
        label: "Output File Name",
        type: "text",
        placeholder: "output.json",
      },
      {
        name: "mode",
        label: "Execution Mode",
        type: "select",
        options: ["runOnce", "runEach"],
      },
      {
        name: "language",
        label: "Language",
        type: "select",
        options: ["javascript", "python"],
      },
      {
        name: "code",
        label: "Code",
        type: "textarea",
        placeholder: "// Your code here",
      },
    ],
  },
}

interface NodePropertiesPanelProps {
  nodeId: string
  onClose: () => void
}

export function NodePropertiesPanel({ nodeId, onClose }: NodePropertiesPanelProps) {
  const { getNodeById, updateNode } = useWorkflow();
  const [formData, setFormData] = useState<Record<string, any>>({});

  const node = getNodeById(nodeId);

  useEffect(() => {
    if (node) {
      setFormData(node.data || {});
    }
  }, [node]);

  if (!node) return null;

  // --- Solution Applied ---
  // 1. Normalize lookup (assuming nodePropertiesConfig keys are now lowercase)
  const nodeTypeKey = node.type ? node.type.toLowerCase() : '';
  const config = nodePropertiesConfig[nodeTypeKey];
  // --- End Solution ---

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    updateNode(nodeId, { data: formData });
  };

  // --- Solution Applied ---
  // 2. Check if config was found before trying to render fields
  const renderFields = () => {
    if (!config) {
      return (
        <div className="text-sm text-muted-foreground italic p-2 border border-dashed rounded">
          No configuration found for node type: "{node.type}".
        </div>
      );
    }

    if (!config.fields || config.fields.length === 0) {
        return (
            <div className="text-sm text-muted-foreground">
                 This node type has no configurable properties.
            </div>
        );
    }

    return (
      <div className="space-y-4">
        {config.fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>

            {field.type === "text" && (
              <Input
                id={field.name}
                value={formData[field.name] || ""}
                placeholder={field.placeholder}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            )}
            {/* ... other field types ... */}
             {field.type === "textarea" && (
                  <Textarea
                    id={field.name}
                    value={formData[field.name] || ""}
                    placeholder={field.placeholder}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    rows={4}
                  />
                )}

                {field.type === "boolean" && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={field.name}
                      checked={formData[field.name] || false}
                      onCheckedChange={(checked) => handleChange(field.name, checked)}
                    />
                    {/* Use field.label for Switch label if desired, or keep generic "Enabled" */}
                    <Label htmlFor={field.name}>{field.label}</Label>
                  </div>
                )}

                {field.type === "select" && field.options && (
                  <Select
                    // Provide a default value if formData doesn't have one yet
                    value={formData[field.name] ?? (field.options.length > 0 ? field.options[0] : '')}
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
        ))}
      </div>
    );
  };
  // --- End Solution ---


  return (
    <div className="absolute right-0 top-0 h-full w-80 border-l bg-background p-4 shadow-md flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-lg font-medium">Node Properties</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-4 pr-2 scrollbar-hide">
        <div className="mb-4">
          <div className="text-sm font-medium text-muted-foreground">Node Type</div>
          <div className="text-lg">
            {/* Display the original node type */}
            {node.type
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </div>
        </div>

        {/* Use the renderFields function */}
        {renderFields()}

      </div>

      {/* Footer */}
      <div className="border-t pt-4">
        <Button className="w-full" onClick={handleSave}>
          Save Properties
        </Button>
      </div>
    </div>
  );
}