// NodePropertiesModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useWorkflow, WorkflowNodeData } from "./workflow-context"; // <<--- IMPORT WorkflowNodeData
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// --- Re-paste your nodePropertiesConfig here ---
interface NodePropertiesConfig {
  [key: string]: {
    fields: {
      name: string;
      label: string;
      type: "text" | "textarea" | "boolean" | "select";
      options?: string[];
      placeholder?: string;
    }[];
  };
}

const nodePropertiesConfig: NodePropertiesConfig = {
  start: { fields: [] },
  end: { fields: [] },
  "create-file": {
    fields: [
      {
        name: "filename",
        label: "File Name",
        type: "text",
        placeholder: "path/to/file.txt",
      },
      { name: "overwrite", label: "Overwrite if exists", type: "boolean" },
      { name: "isDirectory", label: "Create as directory", type: "boolean" },
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
      { name: "append", label: "Append to file", type: "boolean" },
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
  "copy-file": {
    // Ensure key matches NodeType ('copy-file' usually)
    fields: [
      // Use keys matching WorkflowNodeData: sourceFilename, targetFilename
      {
        name: "sourceFilename",
        label: "Source File",
        type: "text",
        placeholder: "path/to/source.txt",
      },
      {
        name: "targetFilename",
        label: "Destination File",
        type: "text",
        placeholder: "path/to/destination.txt",
      },
      { name: "overwrite", label: "Overwrite if exists", type: "boolean" },
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
  code: {
    // Example for 'code' node type
    fields: [
      // Use keys matching WorkflowNodeData: code, language, timeout
      {
        name: "code",
        label: "Code Snippet",
        type: "textarea",
        placeholder: "// Write your code here...",
      },
      {
        name: "language",
        label: "Language",
        type: "select",
        options: ["javascript", "python", "shell"],
      },
      {
        name: "timeout",
        label: "Timeout (ms)",
        type: "text",
        placeholder: "10000",
      }, // Use text for number input initially
    ],
  },
  "xml-parser": {
    // Example for xml-parser
    fields: [
      {
        name: "xmlString",
        label: "XML Input String",
        type: "textarea",
        placeholder: "<root><data>...</data></root>",
      },
      // You might add fields for options if needed
    ],
  },
  "xml-render": {
    // Example for xml-render
    fields: [
      // Inputting a JSON object via textarea is common, or link to input data
      {
        name: "jsonObjectString",
        label: "JSON Object (as string)",
        type: "textarea",
        placeholder: '{ "root": { "data": "..." } }',
      },
      // You might add fields for options if needed
    ],
  },
  // Add configurations for ALL other NodeType values defined in workflow-context.ts
  // even if they have empty fields: []
  "delete-file": {
    fields: [
      {
        name: "path",
        label: "Path to Delete",
        type: "text",
        placeholder: "path/to/item_to_delete",
      },
      { name: "recursive", label: "Recursive Delete", type: "boolean" },
    ],
  },
  "list-files": {
    fields: [
      {
        name: "directoryPath",
        label: "Directory Path",
        type: "text",
        placeholder: "path/to/list",
      },
      {
        name: "filter",
        label: "Filter Pattern",
        type: "text",
        placeholder: "*.txt",
      },
      { name: "recursive", label: "Recursive List", type: "boolean" },
    ],
  },
  "file-poller": {
    fields: [
      {
        name: "directory",
        label: "Directory to Poll",
        type: "text",
        placeholder: "path/to/monitor",
      },
      {
        name: "filter",
        label: "Filter Pattern",
        type: "text",
        placeholder: "*.*",
      },
      {
        name: "interval",
        label: "Interval (sec)",
        type: "text",
        placeholder: "60",
      },
    ],
  },
  "http-receiver": {
    fields: [
      {
        name: "path",
        label: "Listen Path",
        type: "text",
        placeholder: "/webhook",
      },
      {
        name: "method",
        label: "Method",
        type: "select",
        options: ["GET", "POST", "PUT", "DELETE", "ANY"],
      },
      { name: "port", label: "Port", type: "text", placeholder: "8080" },
    ],
  },
  "send-http-request": {
    fields: [
      {
        name: "url",
        label: "Request URL",
        type: "text",
        placeholder: "https://api.example.com/data",
      },
      {
        name: "method",
        label: "Method",
        type: "select",
        options: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      },
      {
        name: "headersString",
        label: "Headers (JSON string)",
        type: "textarea",
        placeholder: '{"Content-Type": "application/json"}',
      },
      {
        name: "bodyString",
        label: "Body (JSON string)",
        type: "textarea",
        placeholder: '{"key": "value"}',
      },
      {
        name: "timeout",
        label: "Timeout (ms)",
        type: "text",
        placeholder: "10000",
      },
    ],
  },
  "send-http-response": {
    fields: [
      {
        name: "status",
        label: "Status Code",
        type: "text",
        placeholder: "200",
      },
      {
        name: "headersString",
        label: "Headers (JSON string)",
        type: "textarea",
        placeholder: '{"Content-Type": "text/plain"}',
      },
      {
        name: "body",
        label: "Response Body",
        type: "textarea",
        placeholder: "Success",
      },
    ],
  },
};
// --- End nodePropertiesConfig ---

export function NodePropertiesModal() {
  const {
    propertiesModalNodeId,
    setPropertiesModalNodeId,
    getNodeById,
    updateNode,
  } = useWorkflow();

  // Type the state more specifically if possible, but Record<string, any> is okay for a dynamic form
  const [formData, setFormData] = useState<Record<string, any>>({});

  const node = useMemo(() => {
    return propertiesModalNodeId ? getNodeById(propertiesModalNodeId) : null;
  }, [propertiesModalNodeId, getNodeById]);

  useEffect(() => {
    if (node) {
      // Start with node's current data, ensuring it's an object
      const initialData = { ...(node.data || {}) };

      // Ensure node.type is valid before using it as an index
      const config = node.type
        ? nodePropertiesConfig[node.type.toLowerCase()]
        : undefined; // Use lowercase to match config keys

      // Initialize form with defaults for missing config fields
      if (config?.fields) {
        config.fields.forEach((field) => {
          // Use type assertion here for safety when initializing
          const fieldKey = field.name as keyof WorkflowNodeData;
          if (initialData[fieldKey] === undefined) {
            if (field.type === "boolean") initialData[fieldKey] = false;
            else if (field.type === "select" && field.options?.length)
              initialData[fieldKey] = field.options[0];
            // Add default for text/textarea if needed, e.g., empty string
            else if (field.type === "text" || field.type === "textarea")
              initialData[fieldKey] = "";
          }
        });
      }
      setFormData(initialData);
    } else {
      setFormData({}); // Clear form if no node is selected
    }
  }, [node]);

  if (!node) return null;

  // Ensure node.type is valid before using it as an index
  const config = node.type
    ? nodePropertiesConfig[node.type.toLowerCase()]
    : undefined; // Use lowercase

  // Type the parameters for handleChange more specifically if needed
  const handleChange = (name: string, value: any) => {
    // If the field is boolean, ensure the value is boolean
    const fieldConfig = config?.fields.find((f) => f.name === name);
    const processedValue = fieldConfig?.type === "boolean" ? !!value : value;

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSave = () => {
    if (!propertiesModalNodeId || !node) return; // Added !node check for safety

    // Prepare the data to save
    const dataToSave: Partial<WorkflowNodeData> = {};

    // Start with existing data to preserve fields not in the form
    // (like potentially 'active' if not handled below)
    Object.assign(dataToSave, node.data || {});

    // Get the config for the current node type
    const config = node.type
      ? nodePropertiesConfig[node.type.toLowerCase()]
      : undefined;

    if (config?.fields) {
      config.fields.forEach((field) => {
        // Get the value from the current form state using the field's name
        const formValue = formData[field.name];

        // --- Handle Special String Parsing Cases ---
        if (field.name === "headersString" && typeof formValue === "string") {
          try {
            const parsedValue = JSON.parse(formValue || "{}"); // Default to empty object on empty string
            dataToSave["headers"] = parsedValue; // Assign to the correct target property 'headers'
          } catch (e) {
            console.error(`Invalid JSON for headersString:`, formValue, e);
            dataToSave["headers"] = {}; // Save default on error
          }
        } else if (
          field.name === "bodyString" &&
          typeof formValue === "string"
        ) {
          try {
            // Allow parsing null/empty for body
            const parsedValue = formValue ? JSON.parse(formValue) : null;
            dataToSave["body"] = parsedValue; // Assign to the correct target property 'body'
          } catch (e) {
            console.error(`Invalid JSON for bodyString:`, formValue, e);
            dataToSave["body"] = formValue; // Save raw string on error? Or null? Depends on requirement.
          }
        } else if (
          field.name === "jsonObjectString" &&
          typeof formValue === "string"
        ) {
          try {
            const parsedValue = JSON.parse(formValue || "{}");
            dataToSave["jsonObject"] = parsedValue; // Assign to the correct target property 'jsonObject'
          } catch (e) {
            console.error(`Invalid JSON for jsonObjectString:`, formValue, e);
            dataToSave["jsonObject"] = {}; // Save default on error
          }
        }
        // --- Handle Regular Fields ---
        else {
          // For all other fields, assume field.name IS a valid key of WorkflowNodeData
          const key = field.name as keyof WorkflowNodeData;
          // Ensure boolean values are actual booleans
          if (field.type === "boolean") {
            dataToSave[key] = !!formValue;
          } else {
            dataToSave[key] = formValue;
          }
        }
      });
    } else {
      // If no config fields defined, maybe just save the 'active' status?
      console.warn(
        `No config fields found for node type ${node.type}, only saving 'active' status if present in form.`
      );
    }

    // Handle 'active' status separately (as it's controlled by the top switch)
    // Ensure it's always included in the saved data
    const activeKey = "active" as keyof WorkflowNodeData;
    if (formData[activeKey] !== undefined) {
      dataToSave[activeKey] = !!formData[activeKey];
    } else if (node.data?.active !== undefined) {
      // If not touched in the form, preserve existing value
      dataToSave[activeKey] = node.data.active;
    } else {
      // Default to true if completely missing
      dataToSave[activeKey] = true;
    }

    console.log("Saving data:", dataToSave); // Debug log
    updateNode(propertiesModalNodeId, { data: dataToSave });
    setPropertiesModalNodeId(null); // Close modal after save
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setPropertiesModalNodeId(null);
    }
  };

  const nodeTypeTitle = node.type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <Dialog open={!!propertiesModalNodeId} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{nodeTypeTitle} Properties</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 pr-2 space-y-4 scrollbar-hide">
          {/* Add the 'active' switch at the top for all nodes */}
          <div className="flex items-center justify-between space-x-2 pt-2 border-b pb-3 mb-4">
            <Label
              htmlFor={`${node.id}-active-switch`}
              className="text-sm font-medium"
            >
              Node Active
            </Label>
            <Switch
              id={`${node.id}-active-switch`}
              // Use type assertion for 'active' key
              checked={!!formData["active" as keyof WorkflowNodeData]}
              onCheckedChange={(checked) => handleChange("active", checked)}
            />
          </div>

          {config?.fields && config.fields.length > 0 ? (
            config.fields.map((field) => (
              <div key={field.name} className="space-y-1">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                </Label>

                {field.type === "text" && (
                  <Input
                    id={field.name}
                    // Use type assertion here
                    value={formData[field.name as keyof WorkflowNodeData] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                )}

                {field.type === "textarea" && (
                  <Textarea
                    id={field.name}
                    // Use type assertion here
                    value={formData[field.name as keyof WorkflowNodeData] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    rows={4}
                  />
                )}

                {field.type === "boolean" && (
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id={field.name}
                      // Use type assertion here
                      checked={!!formData[field.name as keyof WorkflowNodeData]}
                      onCheckedChange={(checked) =>
                        handleChange(field.name, checked)
                      }
                    />
                    {/* Label is already above, maybe add description here? */}
                  </div>
                )}

                {field.type === "select" && field.options && (
                  <Select
                    // Use type assertion here
                    value={
                      formData[field.name as keyof WorkflowNodeData] ??
                      field.options[0] ??
                      ""
                    }
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
              This node type has no further configurable properties besides
              'Active'.
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSave}>Save Changes</Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
