
"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button" // import Button
import { useState } from "react"

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

export default function WriteFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false) // for button loading

  // API function inside the same file
  async function writeFileOperation(data: {
    filename: string
    label: string
    append: boolean
    writeAs: string
    includeTimestamp: boolean
    content?: string
  }) {
    const response = await fetch("http://localhost:5000/api/file-operations/write", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to write file")
    }

    return await response.json()
  }

  async function handleWriteFile() {
    try {
      setLoading(true)

      // prepare payload
      const payload = {
        filename: formData.filename,
        label: formData.label,
        append: formData.append || false,
        writeAs: formData.writeAs || "text",
        includeTimestamp: formData.includeTimestamp || false,
        content: formData.append ? formData.appendContent || "" : undefined,
      }

      await writeFileOperation(payload)
      alert("File operation successful!")
    } catch (error: any) {
      alert(error.message || "Failed to write file")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Node Label */}
      <div className="space-y-2">
        <Label htmlFor="label">File Name</Label>
        <Input
          id="label"
          value={formData.label || ""}
          placeholder="Write File"
          onChange={(e) => onChange("label", e.target.value)}
        />
      </div>

      {/* File Name */}
      <div className="space-y-2">
        <Label htmlFor="filename">File Path</Label>
        <Input
          id="filename"
          value={formData.filename || ""}
          placeholder="path/to/file.txt"
          onChange={(e) => onChange("filename", e.target.value)}
        />
      </div>

      {/* Append Option */}
      <div className="flex items-center space-x-2">
        <Switch id="append" checked={formData.append || false} onCheckedChange={(v) => onChange("append", v)} />
        <Label htmlFor="append" className="cursor-pointer">
          Append to existing file
        </Label>
      </div>

      {/* Append Content if append is selected */}
      {formData.append && (
        <div className="space-y-2">
          <Label htmlFor="appendContent">Append Content</Label>
          <Textarea
            id="appendContent"
            value={formData.appendContent || ""}
            placeholder="Enter content to append..."
            onChange={(e) => onChange("appendContent", e.target.value)}
            className="max-h-40 overflow-y-auto resize-y"
          />
        </div>
      )}

      {/* Write As (Text or Binary) */}
      <div className="space-y-2">
        <Label htmlFor="writeAs">Write As</Label>
        <Select value={formData.writeAs || "text"} onValueChange={(v) => onChange("writeAs", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select write mode" />
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

      {/* Include Timestamp */}
      <div className="flex items-center space-x-2">
        <Switch
          id="includeTimestamp"
          checked={formData.includeTimestamp || false}
          onCheckedChange={(v) => onChange("includeTimestamp", v)}
        />
        <Label htmlFor="includeTimestamp" className="cursor-pointer">
          Include Timestamp
        </Label>
      </div>

      {/* Write File Button */}
      <div className="pt-4">
        <Button onClick={handleWriteFile} disabled={loading}>
          {loading ? "Writing..." : "Write File"}
        </Button>
      </div>
    </div>
  )
}
