// //node-utils.tsx
// "use client"
// import { Play, Filter, FileText, FileInput, FileOutput, Copy, CheckCircle, Code, Trash2, Files, Clock, Server, Send, Globe, FileJson, FileCode } from "lucide-react"
// import type { NodeType } from "./workflow-context"

// export function getNodeIcon(type: NodeType) {
//   switch (type) {
//     case "start":
//       return <Play className="h-10 w-10" />
//     case "create-file":
//       return <FileText className="h-10 w-10" />
//     case "read-file":
//       return <FileInput className="h-10 w-10" />
//     case "write-file":
//       return <FileOutput className="h-10 w-10" />
//     case "copy-file":
//       return <Copy className="h-10 w-10" />
//     case "delete-file":
//       return <Trash2 className="h-10 w-10" />
//     case "list-files":
//       return <Files className="h-10 w-10" />
//     case "file-poller":
//       return <Clock className="h-10 w-10" />
//     case "http-receiver":
//       return <Server className="h-10 w-10 text-emerald-600" />
//     case "send-http-request":
//       return <Send className="h-10 w-10 text-rose-600" />
//     case "send-http-response":
//       return <Globe className="h-10 w-10 text-sky-600" />
//     case "xml-parser":
//       return <FileCode className="h-10 w-10 text-violet-600" />
//     case "xml-render":
//       return <FileJson className="h-10 w-10 text-fuchsia-600" />
//     case "end":
//       return <CheckCircle className="h-10 w-10" />
//     case "code":
//       return <Code className="h-10 w-10 text-orange-400" />
//     default:
//       return <Filter className="h-10 w-10" />
//   }
// }

"use client"

import { Play, Filter, FileText, FileInput, FileOutput, Copy, CheckCircle, Code, Trash2, Files, Clock, Server, Send, Globe, FileJson, FileCode } from "lucide-react"
import type { NodeType } from "./workflow-context"

export function getNodeIcon(type: NodeType) {
  const iconClass = "h-10 w-10"

  // Define types using PNG icons
  const pngIconMap: Partial<Record<NodeType, string>> = {
    start: "/icons/play.png",
    "create-file": "/icons/create.png",
    "read-file":"icons/reading.png",
    "write-file":"icons/write.png",
    "copy-file":"icons/copy.png",
    "delete-file":"icons/delete.png",
    "list-files":"icons/copy.png",
    "file-poller":"icons/poller.png",
    "end":"icons/stop.png",

    // add more PNG types if needed
  }

  // If type is in pngIconMap, render <img>
  if (pngIconMap[type]) {
    return <img src={pngIconMap[type]!} alt={type} className={iconClass}draggable={false} />
  }

  // Otherwise, use Lucide icons
  switch (type) {
    case "http-receiver":
      return <Server className="h-10 w-10 text-emerald-600" />
    case "send-http-request":
      return <Send className="h-10 w-10 text-rose-600" />
    case "send-http-response":
      return <Globe className="h-10 w-10 text-sky-600" />
    case "xml-parser":
      return <FileCode className="h-10 w-10 text-violet-600" />
    case "xml-render":
      return <FileJson className="h-10 w-10 text-fuchsia-600" />
    case "code":
      return <Code className="h-10 w-10 text-orange-400" />
    default:
      return <Filter className="h-10 w-10" />
  }
}
