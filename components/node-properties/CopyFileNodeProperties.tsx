// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Switch } from "@/components/ui/switch";
// import React from "react";

// interface Props {
//   formData: Record<string, any>;
//   onChange: (name: string, value: any) => void;
// }

// export default function CopyFileNodeProperties({ formData, onChange }: Props) {
//   return (
//     <div className="space-y-4">
//       {/* Node Label */}
//       <div className="space-y-2">
//         <Label htmlFor="label">Node Label</Label>
//         <Input
//           id="label"
//           value={formData.label || ""}
//           placeholder="Copy File"
//           onChange={(e) => onChange("label", e.target.value)}
//         />
//       </div>

//       {/* Source */}
//       <div className="space-y-2">
//         <Label htmlFor="sourceFilename">Source File</Label>
//         <Input
//           id="sourceFilename"
//           value={formData.sourceFilename || ""}
//           placeholder="path/to/source.txt"
//           onChange={(e) => onChange("sourceFilename", e.target.value)}
//         />
//       </div>

//       {/* Destination */}
//       <div className="space-y-2">
//         <Label htmlFor="targetFilename">Destination File</Label>
//         <Input
//           id="targetFilename"
//           value={formData.targetFilename || ""}
//           placeholder="path/to/destination.txt"
//           onChange={(e) => onChange("targetFilename", e.target.value)}
//         />
//       </div>

//       {/* Options */}
//       {["overwrite", "includeSubDirectories", "createNonExistingDirs"].map((field) => (
//         <div key={field} className="flex items-center space-x-2">
//           <Switch
//             id={field}
//             checked={!!formData[field]}
//             onCheckedChange={(v) => onChange(field, v)}
//           />
//           <Label htmlFor={field} className="cursor-pointer">
//             {{
//               overwrite: "Overwrite if exists",
//               includeSubDirectories: "Include subdirectories",
//               createNonExistingDirs: "Create non-existing directories",
//             }[field]}
//           </Label>
//         </div>
//       ))}
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
      {/* Node Label */}
      <div className="space-y-2">
        <Label htmlFor="label">File Name</Label>
        <Input
          id="label"
          value={formData.label || ""}
          placeholder="Copy File"
          onChange={(e) => onChange("label", e.target.value)}
        />
      </div>

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
