import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import React from "react";

interface Props {
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

export default function ReadFileNodeProperties({ formData, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Node Label */}
      <div className="space-y-2">
        <Label htmlFor="label">Node Label</Label>
        <Input
          id="label"
          value={formData.label || ""}
          placeholder="Read File"
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

      {/* Encoding */}
      <div className="space-y-2">
        <Label htmlFor="encoding">Encoding</Label>
        <Select
          value={formData.encoding || "utf-8"}
          onValueChange={(v) => onChange("encoding", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select encoding" />
          </SelectTrigger>
          <SelectContent>
            {["utf-8", "ascii", "binary"].map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Read As */}
      <div className="space-y-2">
        <Label htmlFor="readAs">Read As</Label>
        <Select
          value={formData.readAs || "text"}
          onValueChange={(v) => onChange("readAs", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select read mode" />
          </SelectTrigger>
          <SelectContent>
            {["text", "binary"].map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Exclude content */}
      <div className="flex items-center space-x-2">
        <Switch
          id="excludeContent"
          checked={!!formData.excludeContent}
          onCheckedChange={(v) => onChange("excludeContent", v)}
        />
        <Label htmlFor="excludeContent" className="cursor-pointer">
          Exclude content (metadata only)
        </Label>
      </div>
    </div>
  );
}
