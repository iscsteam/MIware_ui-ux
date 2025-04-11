"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useWorkflow, type NodeStatus } from "./workflow-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function BottomPanel() {
  const { logs, clearLogs } = useWorkflow()
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusIcon = (status: NodeStatus) => {
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  return (
    <div className={`border-t bg-background transition-all ${isExpanded ? "h-64" : "h-10"}`}>
      <div className="flex h-10 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
          <h3 className="text-sm font-medium">Execution Logs</h3>
          <div className="text-xs text-muted-foreground">
            {logs.length} {logs.length === 1 ? "entry" : "entries"}
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={clearLogs} disabled={logs.length === 0}>
          Clear
        </Button>
      </div>

      {isExpanded && (
        <ScrollArea className="h-[calc(100%-2.5rem)]">
          {logs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No logs to display. Run a workflow to see execution logs.
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 text-sm ${log.status === "error" ? "bg-red-50 dark:bg-red-950/20" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <span className="font-medium">{log.nodeName}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(log.timestamp)}</span>
                  </div>
                  <div className="ml-6 mt-1">{log.message}</div>
                  {log.details && (
                    <div className="ml-6 mt-1 rounded bg-muted p-1 text-xs font-mono">
                      {typeof log.details === "string" ? log.details : JSON.stringify(log.details, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  )
}
