//node-utils.tsx 
"use client"
import { Play, Filter, FileText, FileInput, FileOutput, Copy, CheckCircle, Code, Trash2, Files, Clock, Server, Send, Globe, FileJson, FileCode, Database, FilePenLine } from "lucide-react"
import type { NodeType } from "./workflow-context"

export function getNodeIcon(type: NodeType) {
  const iconClass = "h-10 w-10"

  // Define types using PNG icons
  const pngIconMap: Partial<Record<NodeType, string>> = {
    start: "/icons/play.png",
    "create-file": "/icons/create.png",
    "read-file": "/icons/reading.png",
    "write-file": "/icons/write.png",
    "copy-file": "/icons/copy.png",
    "delete-file": "/icons/delete.png", 
    "list-files": "/icons/copy.png",
    "file-poller": "/icons/pollar.png",
    "rename-file": "/icons/rename.png", // Added rename-file icon
    "end": "/icons/stop.png",
    // add more PNG types if needed
  }

  // If type is in pngIconMap, render <img>
  if (pngIconMap[type]) {
    return <img src={pngIconMap[type]!} alt={type} className={iconClass} draggable={false} />
  }

  // Otherwise, use Lucide icons with black color to match the consistent styling
  switch (type) {
    case "http-receiver":
      return <Server className="h-10 w-10 text-slate-800" />
    case "send-http-request":
      return <Send className="h-10 w-10 text-slate-800" />
    case "send-http-response":
      return <Globe className="h-10 w-10 text-slate-800" />
    case "xml-parser":
      return <FileCode className="h-10 w-10 text-slate-800" />
    case "xml-render":
      return <FileJson className="h-10 w-10 text-slate-800" />
    case "parse-data":
      return <Database className="h-10 w-10 text-blue-500" />
    case "render-data":
      return <Database className="h-10 w-10 text-purple-500" />
    case "code":
      return <Code className="h-10 w-10 text-slate-800" />
    case "rename-file":
      return <FilePenLine className="h-10 w-10 text-slate-800" />
    default:
      return <Filter className="h-10 w-10 text-slate-800" />
  }
}