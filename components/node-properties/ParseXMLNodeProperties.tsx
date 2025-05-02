import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Props {
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

const inputStyles = ["text", "binary", "dynamic"];

export default function ParseXMLNodeProperties({ formData, onChange }: Props) {
  const inputStyle = formData.inputStyle || "text";

  return (
    <div className="space-y-4">
      {/* Name (Label) */}
      <div className="space-y-2">
        <Label htmlFor="name">Node Label</Label>
        <Input
          id="name"
          placeholder="Parse XML"
          value={formData.label || ""}
          onChange={(e) => onChange("label", e.target.value)}
        />
      </div>

      {/* Input Style */}
      <div className="space-y-2">
        <Label htmlFor="inputStyle">Input Style</Label>
        <Select
          value={inputStyle}
          onValueChange={(v) => onChange("inputStyle", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select input style" />
          </SelectTrigger>
          <SelectContent>
            {inputStyles.map((style) => (
              <SelectItem key={style} value={style}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* XML String Input (Text mode) */}
      {inputStyle === "text" && (
        <div className="space-y-2">
          <Label htmlFor="xmlString">XML String</Label>
          <Textarea
            id="xmlString"
            value={formData.xmlString || ""}
            placeholder="<root><item>Hello</item></root>"
            onChange={(e) => onChange("xmlString", e.target.value)}
            className="resize-y"
          />
        </div>
      )}

      {/* Binary XML Input (Binary mode) */}
      {inputStyle === "binary" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="xmlBinaryBytes">XML Binary (bytes)</Label>
            <Textarea
              id="xmlBinaryBytes"
              value={formData.xmlBinaryBytes || ""}
              placeholder="Paste base64-encoded XML content here"
              onChange={(e) => onChange("xmlBinaryBytes", e.target.value)}
              className="resize-y"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="forceEncoding">Force Encoding (optional)</Label>
            <Input
              id="forceEncoding"
              value={formData.forceEncoding || ""}
              placeholder="e.g. UTF-8"
              onChange={(e) => onChange("forceEncoding", e.target.value)}
            />
          </div>
        </>
      )}

      {/* Dynamic Input */}
      {inputStyle === "dynamic" && (
        <div className="space-y-2">
          <Label htmlFor="dynamicInput">Dynamic XML Input</Label>
          <Textarea
            id="dynamicInput"
            value={formData.dynamicInput || ""}
            placeholder="XML string or base64 binary content"
            onChange={(e) => onChange("dynamicInput", e.target.value)}
            className="resize-y"
          />
        </div>
      )}

      {/* Validate Output */}
      <div className="flex items-center space-x-2">
        <Switch
          id="validateOutput"
          checked={formData.validateOutput || false}
          onCheckedChange={(v) => onChange("validateOutput", v)}
        />
        <Label htmlFor="validateOutput" className="cursor-pointer">
          Validate Output
        </Label>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          placeholder="Describe this activity..."
          onChange={(e) => onChange("description", e.target.value)}
          className="resize-y"
        />
      </div>
    </div>
  );
}
