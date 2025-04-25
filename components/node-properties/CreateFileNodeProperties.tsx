// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Switch } from "@/components/ui/switch";
// import React from "react";

// interface Props {
//   formData: Record<string, any>;
//   onChange: (name: string, value: any) => void;
// }

// export default function CreateFileNodeProperties({ formData, onChange }: Props) {
//   return (
//     <div className="space-y-4">
//       {/* Node Label */}
//       <div className="space-y-2">
//         <Label htmlFor="label">Node Label</Label>
//         <Input
//           id="label"
//           value={formData.label || ""}
//           placeholder="Create File"
//           onChange={(e) => onChange("label", e.target.value)}
//         />
//       </div>

//       {/* File Name */}
//       <div className="space-y-2">
//         <Label htmlFor="filename">File Name</Label>
//         <Input
//           id="filename"
//           value={formData.filename || ""}
//           placeholder="path/to/file.txt"
//           onChange={(e) => onChange("filename", e.target.value)}
//         />
//       </div>

//       {/* Overwrite */}
//       <div className="flex items-center space-x-2">
//         <Switch
//           id="overwrite"
//           checked={!!formData.overwrite}
//           onCheckedChange={(v) => onChange("overwrite", v)}
//         />
//         <Label htmlFor="overwrite" className="cursor-pointer">
//           Overwrite if exists
//         </Label>
//       </div>

//       {/* Is Directory */}
//       <div className="flex items-center space-x-2">
//         <Switch
//           id="isDirectory"
//           checked={!!formData.isDirectory}
//           onCheckedChange={(v) => onChange("isDirectory", v)}
//         />
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
//     </div>
//   );
// }
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import React, { useState } from "react";

interface Props {
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

export default function CreateFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

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
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        // Optionally, reset the form or update the state
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
      {/* Node Label */}
      <div className="space-y-2">
        <Label htmlFor="label">Node Label</Label>
        <Input
          id="label"
          value={formData.label || ""}
          placeholder="Create File"
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

      {/* Overwrite */}
      <div className="flex items-center space-x-2">
        <Switch
          id="overwrite"
          checked={!!formData.overwrite}
          onCheckedChange={(v) => onChange("overwrite", v)}
        />
        <Label htmlFor="overwrite" className="cursor-pointer">
          Overwrite if exists
        </Label>
      </div>

      {/* Is Directory */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isDirectory"
          checked={!!formData.isDirectory}
          onCheckedChange={(v) => onChange("isDirectory", v)}
        />
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
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create File"}
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
