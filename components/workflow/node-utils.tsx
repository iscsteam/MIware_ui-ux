"use client"

 import { Play, Filter, FileText, FileInput, FileOutput, Copy, CheckCircle, Code } from "lucide-react"
import {
  PlayIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClipboardIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PauseCircleIcon,
} from '@heroicons/react/24/outline';
import type { NodeType } from "./workflow-context"

export function getNodeIcon(type: NodeType) {
  switch (type) {
    case "start":
      return <PlayIcon className="h-10 w-10" />
    case "create-file":
      return <DocumentTextIcon className="h-10 w-10" />
    case "read-file":
      return <FileInput className="h-10 w-10" />
    case "write-file":
      return <FileOutput className="h-10 w-10" />
    case "copy-file":
      return <ClipboardIcon className="h-10 w-10" />
    case "end":
      return <PauseCircleIcon className="h-10 w-10" />
    // case "code":
    //   return <Code className="h-10 w-10 text-orange-400" />
    default:
      return <Filter className="h-10 w-10" />
  }
}
