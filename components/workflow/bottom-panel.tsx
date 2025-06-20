"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronUp,
  ChevronDown,
  Terminal,
  Activity,
  FileText,
  Search,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
} from "lucide-react";
import { useWorkflow } from "./workflow-context";
import { checkDAGRunStatus } from "@/services/dagService";
// FIX: Import the shared type definition
import type { DAGStatusResponse } from "@/services/interface";

interface APILogEntry {
  id: string;
  timestamp: Date;
  method: string;
  endpoint: string;
  status: number;
  response?: string;
  error?: string;
  duration?: number;
}

interface ExecutionLog {
  id: string;
  nodeName: string;
  timestamp: Date;
  message?: string;
  status: string;
  details?: string | object;
  api?: {
    method: string;
    path: string;
    status: number;
    duration: number;
  };
}

// FIX: Removed the duplicate local interface definition.
// The type is now imported from "@/services/interface" above.

interface BottomPanelProps {
  className?: string;
}

export function BottomPanel({ className }: BottomPanelProps) {
  const { logs, clearLogs, nodes } = useWorkflow();
  const [isExpanded, setIsExpanded] = useState(true);
  const [height, setHeight] = useState(300); // Default height
  const [isResizing, setIsResizing] = useState(false);
  const [apiLogs, setApiLogs] = useState<APILogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dagOutputs, setDagOutputs] = useState<Record<string, any>>({});

  const panelRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startHeightRef = useRef(0);
  const startYRef = useRef(0);

  // Load saved height from localStorage
  useEffect(() => {
    const savedHeight = localStorage.getItem("workflow-bottom-panel-height");
    if (savedHeight) {
      setHeight(Number.parseInt(savedHeight, 10));
    }
  }, []);

  // Save height to localStorage
  useEffect(() => {
    localStorage.setItem("workflow-bottom-panel-height", height.toString());
  }, [height]);

  // Listen for API call logs
  useEffect(() => {
    const handleAPILog = (event: CustomEvent) => {
      const logEntry: APILogEntry = {
        id: `api-${Date.now()}-${Math.random()}`,
        ...event.detail,
      };
      setApiLogs((prev) => [logEntry, ...prev].slice(0, 1000)); // Keep last 1000 entries
    };

    window.addEventListener("apiCallLogged", handleAPILog as EventListener);
    return () =>
      window.removeEventListener(
        "apiCallLogged",
        handleAPILog as EventListener
      );
  }, []);

  // Resize functionality (VS Code style)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startHeightRef.current = height;
      startYRef.current = e.clientY;

      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    },
    [height]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaY = startYRef.current - e.clientY;
      const newHeight = Math.max(
        100,
        Math.min(600, startHeightRef.current + deltaY)
      );
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Check DAG status before showing output
  const checkAndShowOutput = async (dagId: string, triggerId: string) => {
    try {
      // Now the type annotation uses the imported, canonical type, resolving the error.
      const statusCheck: DAGStatusResponse | null = await checkDAGRunStatus(
        dagId,
        triggerId
      );

      if (statusCheck && statusCheck.canShowOutput && statusCheck.data) {
        setDagOutputs((prev) => ({
          ...prev,
          [dagId]: statusCheck.data,
        }));
      }

      return statusCheck;
    } catch (error) {
      console.error("Error checking DAG status:", error);
      return { isRunning: false, canShowOutput: false, data: null };
    }
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.nodeName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter API logs
  const filteredApiLogs = apiLogs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.method.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "success" && log.status >= 200 && log.status < 300) ||
      (statusFilter === "error" && (log.status >= 400 || log.error));

    return matchesSearch && matchesStatus;
  });

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get HTTP status color
  const getHttpStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600";
    if (status >= 400) return "text-red-600";
    return "text-yellow-600";
  };

  // Node statistics
  const nodeStats = {
    total: nodes.length,
    running: nodes.filter((n) => n.status === "running").length,
    success: nodes.filter((n) => n.status === "success").length,
    error: nodes.filter((n) => n.status === "error").length,
  };

  if (!isExpanded) {
    return (
      <div className={`border-t bg-white ${className}`}>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2"
            >
              <ChevronUp className="h-4 w-4" />
              <Terminal className="h-4 w-4" />
              Console
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Badge variant="outline">{filteredLogs.length} logs</Badge>
              <Badge variant="outline">
                {filteredApiLogs.length} API calls
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {nodeStats.running > 0 && (
              <Badge variant="secondary" className="animate-pulse">
                {nodeStats.running} running
              </Badge>
            )}
            {nodeStats.error > 0 && (
              <Badge variant="destructive">{nodeStats.error} errors</Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className={`border-t bg-white ${className}`}
      style={{ height }}
    >
      {/* Resize Handle */}
      <div
        ref={resizeRef}
        className="h-1 bg-gray-200 hover:bg-blue-400 cursor-ns-resize transition-colors"
        onMouseDown={handleMouseDown}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="flex items-center gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            <Terminal className="h-4 w-4" />
            Console
          </Button>

          {/* Quick Stats */}
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">{nodeStats.total} nodes</Badge>
            {nodeStats.running > 0 && (
              <Badge variant="secondary" className="animate-pulse">
                {nodeStats.running} running
              </Badge>
            )}
            {nodeStats.success > 0 && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                {nodeStats.success} success
              </Badge>
            )}
            {nodeStats.error > 0 && (
              <Badge variant="destructive">{nodeStats.error} errors</Badge>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={clearLogs}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="execution" className="h-full flex flex-col">
          <div className="flex items-center justify-between px-2 border-b">
            <TabsList className="mx-2 mt-1 w-fit">
              <TabsTrigger value="execution" className="flex items-center"> 
                Execution Logs
              </TabsTrigger>
              {/* <TabsTrigger value="execution">Execution Logs</TabsTrigger> */}
              <TabsTrigger value="api" className="">API Logs</TabsTrigger>
              {/* <TabsTrigger value="output">DAG Output</TabsTrigger> */}
              <TabsTrigger value="stats">Node Stats</TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex items-center gap-2 px-4 py-2 ">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="execution" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No execution logs</p>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded border text-sm hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(log.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{log.nodeName}</span>
                          <span className="text-xs text-gray-500">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{log.message}</p>
                        {log.details && (
                          <pre className="text-xs text-gray-600 mt-1 overflow-auto bg-white p-2 rounded border">
                            {typeof log.details === "string"
                              ? log.details
                              : JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="api"
            className="flex-1 flex flex-col h-full max-h-[calc(100vh-150px)]"
          >
            {/* OUTER ScrollArea for full log list */}
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {filteredApiLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No API calls logged</p>
                  </div>
                ) : (
                  filteredApiLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-gray-50 rounded border text-sm hover:bg-gray-100 transition-colors mb-4"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {log.method}
                          </Badge>
                          <span
                            className={`font-medium ${getHttpStatusColor(
                              log.status
                            )}`}
                          >
                            {log.status}
                          </span>
                          {log.duration && (
                            <span className="text-xs text-gray-500">
                              {log.duration}ms
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="font-mono text-xs text-gray-700 mb-2">
                        {log.endpoint}
                      </div>

                      {log.response && (
                        <div className="bg-white p-2 rounded border text-xs">
                          <strong>Response:</strong>
                          <div className="mt-1 max-h-60 overflow-auto bg-gray-50 p-2 rounded">
                            <pre className="whitespace-pre-wrap break-words">
                              {JSON.stringify(log.response, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {log.error && (
                        <div className="bg-red-50 p-2 rounded border text-xs text-red-700 mt-2">
                          <strong>Error:</strong> {log.error}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="output" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {Object.keys(dagOutputs).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No DAG outputs available</p>
                    <p className="text-sm">
                      Outputs will appear here when DAGs complete successfully
                    </p>
                  </div>
                ) : (
                  Object.entries(dagOutputs).map(([dagId, output]) => (
                    <Card key={dagId}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{dagId}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">
                          {JSON.stringify(output, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats" className="flex-1 m-0">
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{nodeStats.total}</div>
                    <div className="text-sm text-gray-600">Total Nodes</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {nodeStats.running}
                    </div>
                    <div className="text-sm text-gray-600">Running</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {nodeStats.success}
                    </div>
                    <div className="text-sm text-gray-600">Success</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {nodeStats.error}
                    </div>
                    <div className="text-sm text-gray-600">Errors</div>
                  </CardContent>
                </Card>
              </div>

              {/* Node Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Node Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {nodes.map((node) => (
                        <div
                          key={node.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(node.status || "idle")}
                            <span className="text-sm font-medium">
                              {node.data?.label || node.type}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {node.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
