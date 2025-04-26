// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import React from "react";

// interface Props {
//   formData: Record<string, any>;
//   onChange: (name: string, value: any) => void;
// }

// export default function ReadFileNodeProperties({ formData, onChange }: Props) {
//   return (
//     <div className="space-y-4">
//       {/* Node Label */}
//       <div className="space-y-2">
//         <Label htmlFor="label">Node Label</Label>
//         <Input
//           id="label"
//           value={formData.label || ""}
//           placeholder="Read File"
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

//       {/* Encoding */}
//       <div className="space-y-2">
//         <Label htmlFor="encoding">Encoding</Label>
//         <Select
//           value={formData.encoding || "utf-8"}
//           onValueChange={(v) => onChange("encoding", v)}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select encoding" />
//           </SelectTrigger>
//           <SelectContent>
//             {["utf-8", "ascii", "binary"].map((opt) => (
//               <SelectItem key={opt} value={opt}>
//                 {opt}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Read As */}
//       <div className="space-y-2">
//         <Label htmlFor="readAs">Read As</Label>
//         <Select
//           value={formData.readAs || "text"}
//           onValueChange={(v) => onChange("readAs", v)}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select read mode" />
//           </SelectTrigger>
//           <SelectContent>
//             {["text", "binary"].map((opt) => (
//               <SelectItem key={opt} value={opt}>
//                 {opt}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Exclude content */}
//       <div className="flex items-center space-x-2">
//         <Switch
//           id="excludeContent"
//           checked={!!formData.excludeContent}
//           onCheckedChange={(v) => onChange("excludeContent", v)}
//         />
//         <Label htmlFor="excludeContent" className="cursor-pointer">
//           Exclude content (metadata only)
//         </Label>
//       </div>
//     </div>
//   );
// }
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

interface Props {
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

export default function ReadFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Inline readFileOperation function
  async function handleReadFile() {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
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
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to read file");
      }

      const data = await response.json();
      setSuccessMessage("File read successfully!");
      console.log("FileMeta:", data.fileMeta);
      // You can optionally update formData or pass this to parent
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
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
        <Button onClick={handleReadFile} disabled={loading}>
          {loading ? "Reading..." : "Read File"}
        </Button>
      </div>

      {/* Success or Error messages */}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
