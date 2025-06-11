"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CheckCircle,
  XCircle,
  Clock,
  Play,
  RefreshCw,
  Eye,
  Activity,
  Database,
  FileText,
  Cpu,
  Brain,
  Zap,
} from "lucide-react"
import { fetchAllDAGs, groupDAGsByType, triggerDAGRun, getDAGStatus, type DAG } from "@/services/dynamic-dag-api"
import { WorkflowCanvas } from "./workflow-canvas"
import { toast } from "@/hooks/use-toast"

interface DynamicDAGDashboardProps {
  clientId?: number
}

export function DynamicDAGDashboard({ clientId = 1 }: DynamicDAGDashboardProps) {
  const [selectedClient, setSelectedClient] = useState(clientId)
  const [allDAGs, setAllDAGs] = useState<DAG[]>([])
  const [groupedDAGs, setGroupedDAGs] = useState<Record<string, DAG[]>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<DAG | null>(null)
  const [showCanvas, setShowCanvas] = useState(false)
  const [triggeringDAGs, setTriggeringDAGs] = useState<Set<string>>(new Set())

  // Load all DAGs and group them dynamically
  const loadDAGs = useCallback(async () => {
    setLoading(true)
    try {
      const dags = await fetchAllDAGs(selectedClient)

      // Fetch latest status for DAGs with trigger_id
      const dagsWithStatus = await Promise.all(
        dags.map(async (dag) => {
          if (dag.trigger_id && dag.status !== "idle") {
            try {
              const statusData = await getDAGStatus(dag.dag_id, dag.trigger_id)
              return { ...dag, status: statusData.status }
            } catch (error) {
              console.warn(`Failed to fetch status for ${dag.dag_id}:`, error)
              return dag
            }
          }
          return dag
        }),
      )

      setAllDAGs(dagsWithStatus)
      setGroupedDAGs(groupDAGsByType(dagsWithStatus))
    } catch (error) {
      console.error("Failed to load DAGs:", error)
      toast({
        title: "Error",
        description: "Failed to load DAGs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [selectedClient])

  // Refresh DAG statuses
  const refreshStatuses = useCallback(async () => {
    setRefreshing(true)
    try {
      const updatedDAGs = await Promise.all(
        allDAGs.map(async (dag) => {
          if (dag.trigger_id) {
            try {
              const statusData = await getDAGStatus(dag.dag_id, dag.trigger_id)
              return { ...dag, status: statusData.status }
            } catch (error) {
              return dag
            }
          }
          return dag
        }),
      )

      setAllDAGs(updatedDAGs)
      setGroupedDAGs(groupDAGsByType(updatedDAGs))
    } catch (error) {
      console.error("Failed to refresh statuses:", error)
    } finally {
      setRefreshing(false)
    }
  }, [allDAGs])

  // Trigger DAG run
  const handleTriggerDAG = async (dag: DAG) => {
    setTriggeringDAGs((prev) => new Set(prev).add(dag.dag_id))

    try {
      const result = await triggerDAGRun(dag.dag_id)

      // Update DAG with new trigger info
      const updatedDAGs = allDAGs.map((d) =>
        d.dag_id === dag.dag_id ? { ...d, status: "running", trigger_id: result.trigger_id } : d,
      )

      setAllDAGs(updatedDAGs)
      setGroupedDAGs(groupDAGsByType(updatedDAGs))

      toast({
        title: "DAG Triggered",
        description: `${dag.name} has been triggered successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to trigger ${dag.name}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setTriggeringDAGs((prev) => {
        const newSet = new Set(prev)
        newSet.delete(dag.dag_id)
        return newSet
      })
    }
  }

  // Get type-specific icon
  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, JSX.Element> = {
      "file-conversion": <FileText className="h-5 w-5 text-blue-500" />,
      "salesforce-read": <Database className="h-5 w-5 text-green-500" />,
      "salesforce-write": <Database className="h-5 w-5 text-orange-500" />,
      cli: <Cpu className="h-5 w-5 text-purple-500" />,
      "data-cleaning": <Zap className="h-5 w-5 text-yellow-500" />,
      "machine-learning": <Brain className="h-5 w-5 text-pink-500" />,
      unknown: <Activity className="h-5 w-5 text-gray-500" />,
    }
    return iconMap[type] || <Activity className="h-5 w-5 text-gray-500" />
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { variant: "default" as const, icon: CheckCircle, color: "text-green-500" },
      completed: { variant: "default" as const, icon: CheckCircle, color: "text-green-500" },
      running: { variant: "secondary" as const, icon: Clock, color: "text-blue-500" },
      pending: { variant: "secondary" as const, icon: Clock, color: "text-yellow-500" },
      failed: { variant: "destructive" as const, icon: XCircle, color: "text-red-500" },
      error: { variant: "destructive" as const, icon: XCircle, color: "text-red-500" },
      idle: { variant: "outline" as const, icon: Clock, color: "text-gray-400" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.idle
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color} ${status === "running" ? "animate-pulse" : ""}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  // Calculate statistics
  const stats = {
    total: allDAGs.length,
    running: allDAGs.filter((d) => d.status === "running").length,
    success: allDAGs.filter((d) => ["success", "completed"].includes(d.status || "")).length,
    failed: allDAGs.filter((d) => ["failed", "error"].includes(d.status || "")).length,
    types: Object.keys(groupedDAGs).length,
  }

  useEffect(() => {
    loadDAGs()
  }, [loadDAGs])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshStatuses, 30000)
    return () => clearInterval(interval)
  }, [refreshStatuses])

  if (showCanvas && selectedWorkflow) {
    return (
      <div className="h-screen flex flex-col">
        <div className="border-b bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setShowCanvas(false)}>
              ← Back to Dashboard
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{selectedWorkflow.name}</h2>
              <p className="text-sm text-gray-600">
                Client {selectedClient} • {selectedWorkflow.type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">{getStatusBadge(selectedWorkflow.status || "idle")}</div>
        </div>
        <WorkflowCanvas config={selectedWorkflow} onClose={() => setShowCanvas(false)} />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dynamic DAG Dashboard</h1>
          <p className="text-gray-600">Monitor and manage all DAG types with real-time status updates</p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedClient.toString()}
            onValueChange={(value) => setSelectedClient(Number.parseInt(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Client 1</SelectItem>
              <SelectItem value="2">Client 2</SelectItem>
              <SelectItem value="3">Client 3</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshStatuses} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total DAGs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">DAG Types</p>
                <p className="text-2xl font-bold">{stats.types}</p>
              </div>
              <Database className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Running</p>
                <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic DAG Type Columns */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">DAG Types ({Object.keys(groupedDAGs).length})</h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : Object.keys(groupedDAGs).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No DAGs found for this client</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(groupedDAGs).map(([type, dags]) => (
              <Card key={type} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getTypeIcon(type)}
                    {type.toUpperCase().replace("-", " ")}
                    <Badge variant="secondary" className="ml-auto">
                      {dags.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {dags.map((dag) => (
                    <Card key={dag.dag_id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{dag.name}</h4>
                            <p className="text-xs text-gray-500 font-mono">{dag.dag_id}</p>
                          </div>
                          {getStatusBadge(dag.status || "idle")}
                        </div>

                        {dag.last_run && (
                          <p className="text-xs text-gray-500">Last run: {new Date(dag.last_run).toLocaleString()}</p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTriggerDAG(dag)}
                            disabled={triggeringDAGs.has(dag.dag_id) || dag.status === "running"}
                            className="flex-1"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            {triggeringDAGs.has(dag.dag_id) ? "Triggering..." : "Run"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedWorkflow(dag)
                              setShowCanvas(true)
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
