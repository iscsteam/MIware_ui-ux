"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useWorkflow, type LogEntry } from "./workflow-context"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ExecutionModalProps {
  isOpen: boolean
  onClose: () => void
  nodeId: string | null
}

export function ExecutionModal({ isOpen, onClose, nodeId }: ExecutionModalProps) {
  const { logs, nodes } = useWorkflow()
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [nodeName, setNodeName] = useState<string>("")

  // Filter logs for the specific node
  useEffect(() => {
    if (!nodeId) {
      setFilteredLogs([])
      setNodeName("")
      return
    }

    // Find the node name
    const node = nodes.find((n) => n.id === nodeId)
    if (node) {
      setNodeName(
        node.type
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      )
    }

    // Filter logs for this node
    const relevantLogs = logs.filter((log) => log.nodeId === nodeId)
    setFilteredLogs(relevantLogs)
  }, [logs, nodeId, nodes])

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  // Format time
  const formatTime = (date: Date) => {
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    const milliseconds = String(date.getMilliseconds()).padstart(3, "0")
    return `${time}.${milliseconds}`
  }
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{nodeName ? `Executing: ${nodeName}` : "Workflow Execution"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full pr-4">
          {filteredLogs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No execution logs to display.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`rounded-md p-3 text-sm ${
                    log.status === "error"
                      ? "bg-red-50 dark:bg-red-950/20"
                      : log.status === "success"
                        ? "bg-green-50 dark:bg-green-950/20"
                        : "bg-yellow-50 dark:bg-yellow-950/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <span className="font-medium">{log.status.toUpperCase()}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{formatTime(log.timestamp)}</span>
                  </div>
                  <div className="mt-1">{log.message}</div>
                  {log.details && (
                    <div className="mt-2 rounded bg-muted p-2 text-xs font-mono overflow-auto max-h-[200px]">
                      {typeof log.details === "string" ? log.details : JSON.stringify(log.details, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
