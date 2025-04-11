"use client"

import { Play, Filter, FileText, FileInput, FileOutput, Copy, CheckCircle, Code } from "lucide-react"
import type { NodeType } from "./workflow-context"

export function getNodeIcon(type: NodeType) {
  switch (type) {
    case "start":
      return <Play className="h-10 w-10" />
    case "create-file":
      return <FileText className="h-10 w-10" />
    case "read-file":
      return <FileInput className="h-10 w-10" />
    case "write-file":
      return <FileOutput className="h-10 w-10" />
    case "copy-file":
      return <Copy className="h-10 w-10" />
    case "end":
      return <CheckCircle className="h-10 w-10" />
    case "code":
      return <Code className="h-10 w-10 text-orange-400" />
    default:
      return <Filter className="h-10 w-10" />
  }
}
