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
    case "START":
      return <PlayIcon className="h-10 w-10" />
    case "CREATE":
      return <DocumentTextIcon className="h-10 w-10" />
    case "READ":
      return <FileInput className="h-10 w-10" />
    case "WRITE":
      return <FileOutput className="h-10 w-10" />
    case "COPY":
      return <ClipboardIcon className="h-10 w-10" />
    case "END":
      return <PauseCircleIcon className="h-10 w-10" />
    // case "code":
    //   return <Code className="h-10 w-10 text-orange-400" />
    default:
      return <Filter className="h-10 w-10" />
  }
}




