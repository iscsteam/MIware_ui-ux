"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Square, Database, Settings, Upload, Download, Filter, Code } from "lucide-react"

interface NodePaletteProps {
  onAddNode: (nodeType: string) => void
}

const nodeTypes = [
  { type: "start", label: "Start", icon: Play, color: "text-green-600" },
  { type: "end", label: "End", icon: Square, color: "text-red-600" },
  { type: "read", label: "Read", icon: Download, color: "text-blue-600" },
  { type: "write", label: "Write", icon: Upload, color: "text-orange-600" },
  { type: "transform", label: "Transform", icon: Settings, color: "text-purple-600" },
  { type: "database", label: "Database", icon: Database, color: "text-indigo-600" },
  { type: "filter", label: "Filter", icon: Filter, color: "text-teal-600" },
  { type: "code", label: "Code", icon: Code, color: "text-gray-600" },
]

export function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <div className="w-64 bg-white border-r">
      <Card className="h-full rounded-none border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Node Palette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {nodeTypes.map(({ type, label, icon: Icon, color }) => (
            <Button
              key={type}
              variant="outline"
              className="w-full justify-start h-auto p-3"
              onClick={() => onAddNode(type)}
            >
              <Icon className={`h-4 w-4 mr-3 ${color}`} />
              <span className="text-sm">{label}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
