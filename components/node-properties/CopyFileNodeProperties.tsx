import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import React, { useState } from "react";


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

export const copyFileSchema: NodeSchema = {
  inputSchema: [
    {
      name: "fromFileName",
      datatype: "string",
      description: "The path and name of the file or directory to copy. Supports wildcards for files.",
      required: true,
    },
    {
      name: "toFileName",
      datatype: "string",
      description: "The destination path for the copy operation. Must be an absolute path without wildcards.",
      required: true,
    },
    {
      name: "overwrite",
      datatype: "boolean",
      description: "Overwrite existing file/directory if it already exists.",
    },
    {
      name: "createNonExistingDirectories",
      datatype: "boolean",
      description: "Create all directories in the destination path if they do not exist.",
    },
    {
      name: "includeSubDirectories",
      datatype: "boolean",
      description: "Include all sub-directories when the source is a directory.",
    },
    {
      name: "description",
      datatype: "string",
      description: "Optional description of the copy operation.",
    },
  ],
  outputSchema: [
    {
      name: "success",
      datatype: "boolean",
      description: "Indicates whether the copy operation was successful.",
    },
    {
      name: "message",
      datatype: "string",
      description: "A message providing details about the result of the operation.",
    },
    {
      name: "fromFileName",
      datatype: "string",
      description: "Source file or directory that was copied.",
    },
    {
      name: "toFileName",
      datatype: "string",
      description: "Destination file or directory where the content was copied.",
    },
  ],
}


interface Props {
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

export default function CopyFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("http://localhost:5000/api/file-operations/copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceFilename: formData.sourceFilename,
          targetFilename: formData.targetFilename,
          overwrite: formData.overwrite,
          includeSubDirectories: formData.includeSubDirectories,
          createNonExistingDirs: formData.createNonExistingDirs,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Source */}
      <div className="space-y-2">
        <Label htmlFor="sourceFilename">Source Path</Label>
        <Input
          id="sourceFilename"
          value={formData.sourceFilename || ""}
          placeholder="path/to/source.txt"
          onChange={(e) => onChange("sourceFilename", e.target.value)}
        />
      </div>

      {/* Destination */}
      <div className="space-y-2">
        <Label htmlFor="targetFilename">Destination Path</Label>
        <Input
          id="targetFilename"
          value={formData.targetFilename || ""}
          placeholder="path/to/destination.txt"
          onChange={(e) => onChange("targetFilename", e.target.value)}
        />
      </div>

      {/* Options */}
      {["overwrite", "includeSubDirectories", "createNonExistingDirs"].map((field) => (
        <div key={field} className="flex items-center space-x-2">
          <Switch
            id={field}
            checked={!!formData[field]}
            onCheckedChange={(v) => onChange(field, v)}
          />
          <Label htmlFor={field} className="cursor-pointer">
            {{
              overwrite: "Overwrite if exists",
              includeSubDirectories: "Include subdirectories",
              createNonExistingDirs: "Create non-existing directories",
            }[field]}
          </Label>
        </div>
      ))}

      {/* Submit Button */}
      <div>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Copying..." : "Copy File"}
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
