"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Clock, Eye, RefreshCw, Database, FileText, Upload, Download } from "lucide-react"
import { WorkflowCanvas } from "./workflow-canvas"
import { fetchClientConfigs, fetchDAGStatus } from "@/services/client-dashboard-api"

interface ConfigItem {
  id: string
  dag_id: string
  trigger_id?: string
  name?: string
  status?: string
  type: "file_conversion" | "read_salesforce" | "write_salesforce" | "cli_operators"
  config_data?: any
}

interface ClientDashboardProps {
  clientId?: number
}

export function ClientDashboard({ clientId = 1 }: ClientDashboardProps) {
  const [selectedClient, setSelectedClient] = useState(clientId)
  const [configs, setConfigs] = useState<ConfigItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWorkflow, setSelectedWorkflow] = useState<ConfigItem | null>(null)
  const [showCanvas, setShowCanvas] = useState(false)

  // Load client configurations
  useEffect(() => {
    loadClientConfigs()
  }, [selectedClient])

  const loadClientConfigs = async () => {
    setLoading(true)
    try {
      const allConfigs = await fetchClientConfigs(selectedClient)

      // Fetch status for each config
      const configsWithStatus = await Promise.all(
        allConfigs.map(async (config) => {
          if (!config.status && config.dag_id && config.trigger_id) {
            try {
              const statusData = await fetchDAGStatus(config.dag_id, config.trigger_id)
              return { ...config, status: statusData.status }
            } catch (error) {
              console.error(`Failed to fetch status for ${config.dag_id}:`, error)
              return { ...config, status: "unknown" }
            }
          }
          return config
        }),
      )

      setConfigs(configsWithStatus)
    } catch (error) {
      console.error("Failed to load client configs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "running":
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status?: string) => {
    const variant =
      status?.toLowerCase() === "success" || status?.toLowerCase() === "completed"
        ? "default"
        : status?.toLowerCase() === "failed" || status?.toLowerCase() === "error"
          ? "destructive"
          : status?.toLowerCase() === "running" || status?.toLowerCase() === "pending"
            ? "secondary"
            : "outline"

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status || "Unknown"}
      </Badge>
    )
  }

  const getConfigIcon = (type: string) => {
    switch (type) {
      case "file_conversion":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "read_salesforce":
        return <Download className="h-5 w-5 text-green-500" />
      case "write_salesforce":
        return <Upload className="h-5 w-5 text-orange-500" />
      case "cli_operators":
        return <Database className="h-5 w-5 text-purple-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const groupedConfigs = configs.reduce(
    (acc, config) => {
      if (!acc[config.type]) {
        acc[config.type] = []
      }
      acc[config.type].push(config)
      return acc
    },
    {} as Record<string, ConfigItem[]>,
  )

  const handleViewWorkflow = (config: ConfigItem) => {
    setSelectedWorkflow(config)
    setShowCanvas(true)
  }

  if (showCanvas && selectedWorkflow) {
    return (
      <div className="h-screen flex flex-col">
        <div className="border-b bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setShowCanvas(false)}>
              ← Back to Dashboard
            </Button>
            <div>
              <h2 className="text-lg font-semibold">Workflow: {selectedWorkflow.name || selectedWorkflow.dag_id}</h2>
              <p className="text-sm text-gray-600">
                Client {selectedClient} • {selectedWorkflow.type.replace("_", " ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">{getStatusBadge(selectedWorkflow.status)}</div>
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
          <h1 className="text-2xl font-bold">Client Dashboard</h1>
          <p className="text-gray-600">Manage workflow configurations and monitor execution status</p>
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
          <Button variant="outline" onClick={loadClientConfigs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Configs</p>
                <p className="text-2xl font-bold">{configs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Running</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {configs.filter((c) => c.status?.toLowerCase() === "running").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    configs.filter(
                      (c) => c.status?.toLowerCase() === "success" || c.status?.toLowerCase() === "completed",
                    ).length
                  }
                </p>
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
                <p className="text-2xl font-bold text-red-600">
                  {
                    configs.filter((c) => c.status?.toLowerCase() === "failed" || c.status?.toLowerCase() === "error")
                      .length
                  }
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="file_conversion" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="file_conversion" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            File Conversion
          </TabsTrigger>
          <TabsTrigger value="read_salesforce" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Salesforce Read
          </TabsTrigger>
          <TabsTrigger value="write_salesforce" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Salesforce Write
          </TabsTrigger>
          <TabsTrigger value="cli_operators" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            CLI Operators
          </TabsTrigger>
        </TabsList>

        {Object.entries(groupedConfigs).map(([type, typeConfigs]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : typeConfigs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    {getConfigIcon(type)}
                    <p className="text-gray-500">No {type.replace("_", " ")} configurations found</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeConfigs.map((config) => (
                  <Card key={config.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getConfigIcon(config.type)}
                          <CardTitle className="text-sm">{config.name || config.dag_id}</CardTitle>
                        </div>
                        {getStatusBadge(config.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">DAG ID:</span>
                          <span className="font-mono text-xs">{config.dag_id}</span>
                        </div>
                        {config.trigger_id && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trigger ID:</span>
                            <span className="font-mono text-xs">{config.trigger_id}</span>
                          </div>
                        )}
                      </div>
                      <Button className="w-full" variant="outline" onClick={() => handleViewWorkflow(config)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Workflow
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
