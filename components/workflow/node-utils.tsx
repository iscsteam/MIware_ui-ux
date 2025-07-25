//node-utils.tsx
"use client";
import {
  Filter,
  FileInput,
  Code,
  Server,
  Send,
  Globe,
  FileJson,
  FileCode,
  Database,
  FilePenLine,
  ScanText,
} from "lucide-react";

import type { NodeType } from "@/services/interface";

export function getNodeIcon(type: NodeType) {
  const iconClass = "h-10 w-10";

  // Define types using PNG icons
  const pngIconMap: Partial<Record<NodeType, string>> = {
    start: "/icons/play.png",
    "create-file": "/icons/create.png",
    "read-file": "/icons/reading.png",
    "write-file": "/icons/write.png",
    "copy-file": "/icons/copy.png",
    "delete-file": "/icons/delete.png",
    "list-files": "/icons/copy.png",
    database: "/icons/copy.png",
    source: "/icons/source.png", // Added source icon
    "file-poller": "/icons/pollar.png",
    "rename-file": "/icons/write.png",
    "salesforce-cloud": "/icons/source.png",
    "inline-input": "/icons/copy.png",
    "inline-output": "/icons/copy.png",
    end: "/icons/stop.png",
    // Add ReadNode PNG icon if you have one, otherwise it will use Lucide icon below
    // "read-node": "/icons/read-node.png",
  };

  // If type is in pngIconMap, render <img>
  if (pngIconMap[type]) {
    return (
      <img
        src={pngIconMap[type]! || "/placeholder.svg"}
        alt={type}
        className={iconClass}
        draggable={false}
      />
    );
  }

  // Otherwise, use Lucide icons with black color to match the consistent styling
  switch (type) {
    case "read-node":
      return <ScanText className="h-10 w-10 text-slate-800" />; // Add ReadNode icon
    case "http-receiver":
      return <Server className="h-10 w-10 text-slate-800" />;
    case "send-http-request":
      return <Send className="h-10 w-10 text-slate-800" />;
    case "send-http-response":
      return <Globe className="h-10 w-10 text-slate-800" />;
    case "xml-parser":
      return <FileCode className="h-10 w-10 text-slate-800" />;
    case "xml-render":
      return <FileJson className="h-10 w-10 text-slate-800" />;
    case "parse-data":
      return <Database className="h-10 w-10 text-blue-500" />;
    case "render-data":
      return <Database className="h-10 w-10 text-purple-500" />;
    case "database":
      return <Database className="h-10 w-10 text-green-500" />;
    case "salesforce-cloud":
      return <Database className="h-10 w-10 text-green-500" />;
    case "source":
      return <FileInput className="h-10 w-10 text-blue-500" />;
    case "code":
      return <Code className="h-10 w-10 text-slate-800" />;
    case "rename-file":
      return <FilePenLine className="h-10 w-10 text-slate-800" />;
    case "filter":
      return <Filter className="h-10 w-10 text-orange-500" />;
    default:
      return <Filter className="h-10 w-10 text-slate-800" />;
  }
}
