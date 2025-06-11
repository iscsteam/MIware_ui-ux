"use client"
import { useState, useEffect } from "react"
import { useWorkflow } from "./workflow-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Play,
  Square,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Download,
  RefreshCw,
  Calendar,
  Activity,
} from "lucide-react"
import { format } from "date-fns"

interface ExecutionRun {
  id: string
  dag_id: string
  workflowId: string
  workflowName: string
  status: "running" | "completed" | "failed" | "cancelled"
  startTime: Date
  endTime?: Date
  duration?: number
  triggeredBy: "manual" | "schedule" | "api"
  nodeResults: Array<{
    nodeId: string
    nodeName: string
    status: "success" | "error" | "skipped"
    duration: number
    output?: any
    error?: string
  }>
}

export function History() {
  const { logs, clearLogs, currentWorkflowName } = useWorkflow()
  const [executions, setExecutions] = useState<ExecutionRun[]>([])
  const [selectedExecution, setSelectedExecution] = useState<ExecutionRun | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [triggerFilter, setTriggerFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    const mockExecutions: ExecutionRun[] = [
      {
        id: "exec-001",
        dag_id: "dag-001",
        workflowId: "wf-001",
        workflowName: currentWorkflowName || "Sample Workflow",
        status: "completed",
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 3540000),
        duration: 60000,
        triggeredBy: "manual",
        nodeResults: [
          {
            nodeId: "start-1",
            nodeName: "Start",
            status: "success",
            duration: 100,
            output: { trigger: "manual" },
          },
          {
            nodeId: "read-file-1",
            nodeName: "Read File",
            status: "success",
            duration: 2500,
            output: { content: "File content..." },
          },
          {
            nodeId: "process-1",
            nodeName: "Process Data",
            status: "success",
            duration: 15000,
            output: { processed: true },
          },
        ],
      },
      {
        id: "exec-002",
        dag_id: "dag-001",
        workflowId: "wf-001",
        workflowName: currentWorkflowName || "Sample Workflow",
        status: "failed",
        startTime: new Date(Date.now() - 7200000),
        endTime: new Date(Date.now() - 7180000),
        duration: 20000,
        triggeredBy: "schedule",
        nodeResults: [
          {
            nodeId: "start-1",
            nodeName: "Start",
            status: "success",
            duration: 100,
            output: { trigger: "schedule" },
          },
          {
            nodeId: "read-file-1",
            nodeName: "Read File",
            status: "error",
            duration: 1500,
            error: "File not found: /path/to/file.txt",
          },
        ],
      },
      {
        id: "exec-003",
        dag_id: "dag-001",
        workflowId: "wf-001",
        workflowName: currentWorkflowName || "Sample Workflow",
        status: "running",
        startTime: new Date(Date.now() - 300000),
        triggeredBy: "api",
        nodeResults: [
          {
            nodeId: "start-1",
            nodeName: "Start",
            status: "success",
            duration: 100,
            output: { trigger: "api" },
          },
          {
            nodeId: "read-file-1",
            nodeName: "Read File",
            status: "success",
            duration: 2000,
            output: { content: "Processing..." },
          },
        ],
      },
    ]
    setExecutions(mockExecutions)
  }, [currentWorkflowName])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "cancelled":
        return <Square className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      running: "default",
      completed: "default",
      failed: "destructive",
      cancelled: "secondary",
    } as const

    const colors = {
      running: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    }

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.cancelled}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const filteredExecutions = executions.filter((exec) => {
    const matchesSearch =
      exec.workflowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exec.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || exec.status === statusFilter
    const matchesTrigger = triggerFilter === "all" || exec.triggeredBy === triggerFilter

    return matchesSearch && matchesStatus && matchesTrigger
  })

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const handleExportLogs = () => {
    const logData = logs.map((log) => ({
      timestamp: log.timestamp.toISOString(),
      nodeId: log.nodeId,
      nodeName: log.nodeName,
      status: log.status,
      message: log.message,
      details: log.details,
    }))

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `workflow-logs-${format(new Date(), "yyyy-MM-dd-HH-mm")}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Execution History</h2>
            <p className="text-sm text-gray-500 mt-1">View and monitor workflow execution history and logs</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Executions List */}
        <div className="w-1/2 border-r bg-white flex flex-col">
          <div className="p-4 border-b space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search executions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={triggerFilter} onValueChange={setTriggerFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Triggers</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {filteredExecutions.map((execution) => (
                <Card
                  key={execution.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedExecution?.id === execution.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedExecution(execution)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        <span className="font-medium text-sm">{execution.workflowName}</span>
                      </div>
                      {getStatusBadge(execution.status)}
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(execution.startTime, "MMM dd, yyyy HH:mm:ss")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {execution.duration ? formatDuration(execution.duration) : "Running..."}
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        Triggered by {execution.triggeredBy}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredExecutions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No executions found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Execution Details */}
        <div className="w-1/2 bg-white flex flex-col">
          {selectedExecution ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{selectedExecution.workflowName}</h3>
                  {getStatusBadge(selectedExecution.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">DAG ID:</span>
                    <p className="font-mono">{selectedExecution.dag_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p>{selectedExecution.duration ? formatDuration(selectedExecution.duration) : "Running..."}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Started:</span>
                    <p>{format(selectedExecution.startTime, "MMM dd, yyyy HH:mm:ss")}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Triggered by:</span>
                    <p className="capitalize">{selectedExecution.triggeredBy}</p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="nodes" className="flex-1 flex flex-col">
                <TabsList className="mx-4 mt-4 w-fit">
                  <TabsTrigger value="nodes">Node Results</TabsTrigger>
                  <TabsTrigger value="logs">Execution Logs</TabsTrigger>
                  <TabsTrigger value="output">Output Data</TabsTrigger>
                </TabsList>

                <TabsContent value="nodes" className="flex-1 m-4 mt-2">
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      {selectedExecution.nodeResults.map((result, index) => (
                        <Card key={`${result.nodeId}-${index}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(result.status)}
                                <span className="font-medium">{result.nodeName}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {formatDuration(result.duration)}
                              </Badge>
                            </div>

                            {result.error && (
                              <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                                <p className="text-red-800 text-sm font-medium">Error:</p>
                                <p className="text-red-700 text-sm">{result.error}</p>
                              </div>
                            )}

                            {result.output && (
                              <div className="bg-gray-50 border rounded p-2 mt-2">
                                <p className="text-gray-700 text-sm font-medium mb-1">Output:</p>
                                <pre className="text-xs text-gray-600 overflow-auto">
                                  {JSON.stringify(result.output, null, 2)}
                                </pre>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="logs" className="flex-1 m-4 mt-2">
                  <ScrollArea className="h-full">
                    <div className="space-y-2">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded border text-sm">
                          <div className="flex-shrink-0 mt-0.5">{getStatusIcon(log.status)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{log.nodeName}</span>
                              <span className="text-xs text-gray-500">{format(log.timestamp, "HH:mm:ss.SSS")}</span>
                            </div>
                            <p className="text-gray-700">{log.message}</p>
                            {log.details && (
                              <pre className="text-xs text-gray-600 mt-1 overflow-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      ))}

                      {logs.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No logs available</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="output" className="flex-1 m-4 mt-2">
                  <ScrollArea className="h-full">
                    <div className="bg-gray-50 border rounded p-4">
                      <pre className="text-sm text-gray-700 overflow-auto">
                        {JSON.stringify(
                          selectedExecution.nodeResults
                            .filter((r) => r.output)
                            .reduce((acc, r) => ({ ...acc, [r.nodeId]: r.output }), {}),
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an execution to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
