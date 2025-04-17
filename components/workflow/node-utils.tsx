//node-utils.tsx
"use client"
import { Play, Filter, FileText, FileInput, FileOutput, Copy, CheckCircle, Code, Trash2, Files, Clock, Server, Send, Globe } from "lucide-react"
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
    case "delete-file":
      return <Trash2 className="h-10 w-10" />
    case "list-files":
      return <Files className="h-10 w-10" />
    case "file-poller":
      return <Clock className="h-10 w-10" />
    case "http-receiver":
      return <Server className="h-10 w-10 text-emerald-600" />
    case "send-http-request":
      return <Send className="h-10 w-10 text-rose-600" />
    case "send-http-response":
      return <Globe className="h-10 w-10 text-sky-600" />
    case "end":
      return <CheckCircle className="h-10 w-10" />
    case "code":
      return <Code className="h-10 w-10 text-orange-400" />
    default:
      return <Filter className="h-10 w-10" />
  }
}




