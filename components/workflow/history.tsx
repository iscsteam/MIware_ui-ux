"use client";
import { useState, useEffect, useCallback } from "react";
import { useWorkflow } from "./workflow-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { baseUrl } from "@/services/api";
import { URLS } from "@/services/url";

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
} from "lucide-react";
import { format } from "date-fns";

const LOCAL_STORAGE_KEY = "allWorkflowExecutionsHistory_v2"; // Changed key if schema changes

// Types
interface ExecutionRun {
  id: string;
  dag_id: string;
  workflowId: string;
  workflowName: string;
  status: "running" | "completed" | "failed" | "force_stopped" | "queued";
  startTime: Date;
  endTime?: Date;
  duration?: number;
  triggeredBy: "manual" | "schedule" | "api";
  dag_run_map: Record<string, DagRunMapNodeData>;
  // This is the new field to store node results

  nodeResults: Array<{
    nodeId: string;
    nodeName: string;
    status: "success" | "error" | "skipped" | "running";
    duration: number;
    output?: any;
    error?: string;
  }>;
}

interface ApiDagRunItemFromEndpoint {
  dag_id: string;
  status: string;
  start_time: string;
  trigger_type: string;
  end_time?: string;
  error_message?: string;
  dag_run_map?: Record<string, DagRunMapNodeData>;
  id?: number;
}

interface DagRunMapNodeData {
  status: string;
  events?: Array<{
    timestamp: string;
    status: string;
    message?: { error?: string; status?: string };
  }>;
  stage_details?: { error?: string; content?: any; status?: string };
  start_time?: string;
  end_time?: string;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  nodeId: string;
  nodeName: string;
  status: string;
  message: string;
  details?: any;
  workflowRunId?: string;
}

interface StoredExecutionRun {
  id: string;
  dag_id: string;
  workflowId: string;
  workflowName: string;
  status: "running" | "completed" | "failed" | "force_stopped" | "queued";
  startTime: string;
  endTime?: string;
  duration?: number;
  triggeredBy: "manual" | "schedule" | "api";
  dag_run_map: Record<string, DagRunMapNodeData>;
  nodeResults: Array<{
    nodeId: string;
    nodeName: string;
    status: "success" | "error" | "skipped" | "running";
    duration: number;
    output?: any;
    error?: string;
  }>;
}

const mapApiStatusToExecutionStatus = (
  apiStatus?: string
): ExecutionRun["status"] => {
  switch (apiStatus?.toLowerCase()) {
    case "success":
      return "completed";
    case "completed":
      return "completed";
    case "running":
      return "running";
    case "failed":
      return "failed";
    case "queued":
      return "queued";
    case "force_stopped":
      return "force_stopped";
    default:
      console.warn(`Unhandled API DAG run status: ${apiStatus}`);
      return "failed";
  }
};
const mapApiTriggerToExecutionTrigger = (
  apiTrigger?: string
): ExecutionRun["triggeredBy"] => {
  switch (apiTrigger?.toLowerCase()) {
    case "manual":
      return "manual";
    case "schedule":
    case "scheduled":
      return "schedule";
    case "api":
    case "external_trigger":
    case "backfill":
    case "dataset_triggered":
      return "api";
    default:
      return "api";
  }
};
const mapApiTaskStatusToNodeStatus = (
  apiTaskStatus?: string
): ExecutionRun["nodeResults"][0]["status"] => {
  switch (apiTaskStatus?.toLowerCase()) {
    case "completed":
    case "success":
      return "success";
    case "failed":
    case "error":
    case "upstream_failed":
      return "error";
    case "skipped":
    case "not_started":
      return "skipped";
    case "running":
      return "running";
    default:
      console.warn(`Unhandled API task status: ${apiTaskStatus}`);
      return "skipped";
  }
};
const extractRunIdFromApiItem = (
  item: ApiDagRunItemFromEndpoint
): string | null => {
  if (typeof item.error_message === "string") {
    const runIdMatch = item.error_message.match(/(manual_\w+)/i);
    if (runIdMatch && runIdMatch[1]) return runIdMatch[1];
  }
  if (item.id) return `db_id_${item.id}`;
  return null;
};

const convertToStorable = (run: ExecutionRun): StoredExecutionRun => ({
  ...run,
  startTime: run.startTime.toISOString(),
  endTime: run.endTime?.toISOString(),
});

const convertFromStorable = (storedRun: StoredExecutionRun): ExecutionRun => ({
  ...storedRun,
  startTime: new Date(storedRun.startTime),
  endTime: storedRun.endTime ? new Date(storedRun.endTime) : undefined,
});

export function History() {
  const { logs, currentWorkflowName, currentWorkflowId } = useWorkflow();
  const [allExecutionsFromStorage, setAllExecutionsFromStorage] = useState<
    ExecutionRun[]
  >([]);
  const [displayedExecutions, setDisplayedExecutions] = useState<
    ExecutionRun[]
  >([]);
  const [selectedExecution, setSelectedExecution] =
    useState<ExecutionRun | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [triggerFilter, setTriggerFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false); // For API calls
  const [initialStorageLoadDone, setInitialStorageLoadDone] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(180000); // 3 min default

  // 1. Load ALL executions from localStorage on initial mount
  useEffect(() => {
    console.log(
      `HISTORY (Mount): Loading all from localStorage key '${LOCAL_STORAGE_KEY}'...`
    );
    // No setIsLoading(true) here, as this is a background load.
    // Actual loading spinner will be for API calls.
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedStoredRuns: StoredExecutionRun[] = JSON.parse(storedData);
        const convertedRuns = parsedStoredRuns.map(convertFromStorable);
        setAllExecutionsFromStorage(convertedRuns);
        console.log(
          `HISTORY (Mount): Loaded ${convertedRuns.length} from localStorage.`
        );
      } else {
        console.log(`HISTORY (Mount): No data in localStorage.`);
        setAllExecutionsFromStorage([]);
      }
    } catch (error) {
      console.error("HISTORY (Mount): Error loading from localStorage:", error);
      setAllExecutionsFromStorage([]);
    }
    setInitialStorageLoadDone(true); // Mark localStorage load as done
  }, []);

  // 2. Core API fetching and storing logic for a SPECIFIC dagId
  const fetchAndStoreWorkflowRuns = useCallback(
    async (dagIdToFetch: string, isInitialFetchForTab: boolean = false) => {
      if (!dagIdToFetch) return;

      console.log(
        `HISTORY (API Fetch): DAG ID: ${dagIdToFetch}. Initial for tab: ${isInitialFetchForTab}`
      );
      setIsLoading(true); // Show loading for API calls
      let fetchedRunsForDag: ExecutionRun[] = [];
      let fetchErrorOccurred = false;

      try {
        const endpoint = baseUrl(URLS.historyDAGRuns(dagIdToFetch));
        const response = await fetch(endpoint);
        if (!response.ok) {
          fetchErrorOccurred = true;
          throw new Error(
            `API Error: ${response.status} ${response.statusText}`
          );
        }

        let apiData = (await response.json()) as
          | ApiDagRunItemFromEndpoint[]
          | any;

        if (!Array.isArray(apiData)) {
          console.error(
            "HISTORY (API Fetch): Response not array for",
            dagIdToFetch,
            ". Data:",
            apiData
          );
          apiData = [];
        }

        const validApiData = apiData as ApiDagRunItemFromEndpoint[];

        fetchedRunsForDag = validApiData
          .map((item): ExecutionRun | null => {
            const runId = extractRunIdFromApiItem(item);
            if (!runId) return null;

            const startTime = new Date(item.start_time);
            const anEndTime = item.end_time
              ? new Date(item.end_time)
              : undefined;
            let duration: number | undefined = undefined;
            if (
              startTime &&
              anEndTime &&
              !isNaN(startTime.valueOf()) &&
              !isNaN(anEndTime.valueOf())
            ) {
              duration = anEndTime.getTime() - startTime.getTime();
            }

            const nodeResults: ExecutionRun["nodeResults"] = [];
            if (item.dag_run_map && typeof item.dag_run_map === "object") {
              Object.entries(item.dag_run_map).forEach(
                ([nodeKey, nodeData]) => {
                  if (nodeData && typeof nodeData.status === "string") {
                    const [nodeName = nodeKey] = nodeKey.split(":");
                    let nodeDuration = 0;
                    let nodeError: string | undefined = undefined;
                    let nodeOutput: any = undefined;

                    if (
                      Array.isArray(nodeData.events) &&
                      nodeData.events.length >= 1
                    ) {
                      try {
                        const eventTimestamps = nodeData.events
                          .map((e) => new Date(e.timestamp).getTime())
                          .filter((t) => !isNaN(t));
                        if (eventTimestamps.length > 0) {
                          const firstEventTime = Math.min(...eventTimestamps);
                          const lastEventTime = Math.max(...eventTimestamps);
                          if (lastEventTime >= firstEventTime)
                            nodeDuration = lastEventTime - firstEventTime;
                        }
                      } catch (e) {
                        console.warn(
                          "HISTORY: Node event time parsing error",
                          nodeKey,
                          e
                        );
                      }
                    } else if (nodeData.start_time && nodeData.end_time) {
                      try {
                        const nodeStartTime = new Date(
                          nodeData.start_time
                        ).getTime();
                        const nodeEndTime = new Date(
                          nodeData.end_time
                        ).getTime();
                        if (
                          !isNaN(nodeStartTime) &&
                          !isNaN(nodeEndTime) &&
                          nodeEndTime >= nodeStartTime
                        )
                          nodeDuration = nodeEndTime - nodeStartTime;
                      } catch (e) {
                        /* ignore */
                      }
                    }

                    if (nodeData.status?.toLowerCase() === "failed") {
                      if (nodeData.stage_details?.error)
                        nodeError = String(
                          nodeData.stage_details.error
                        ).substring(0, 1000);
                      else if (Array.isArray(nodeData.events)) {
                        const lastFailedEvent = [...nodeData.events]
                          .reverse()
                          .find(
                            (e) => e.status === "failed" && e.message?.error
                          );
                        if (lastFailedEvent?.message)
                          nodeError = String(
                            lastFailedEvent.message.error
                          ).substring(0, 1000);
                      }
                    }
                    if (
                      nodeData.status?.toLowerCase() === "completed" &&
                      nodeData.stage_details?.content !== undefined
                    )
                      nodeOutput = nodeData.stage_details.content;

                    nodeResults.push({
                      nodeId: nodeKey,
                      nodeName,
                      status: mapApiTaskStatusToNodeStatus(nodeData.status),
                      duration: nodeDuration > 0 ? nodeDuration : 0,
                      error: nodeError,
                      output: nodeOutput,
                    });
                  }
                }
              );
            }
            return {
              id: runId,
              dag_id: item.dag_id,
              workflowId: item.dag_id,
              workflowName:
                currentWorkflowName && currentWorkflowId === item.dag_id
                  ? currentWorkflowName
                  : item.dag_id,
              status: mapApiStatusToExecutionStatus(item.status),
              startTime,
              endTime: anEndTime,
              duration,
              triggeredBy: mapApiTriggerToExecutionTrigger(item.trigger_type),
              dag_run_map: item.dag_run_map || {},
              nodeResults,
            };
          })
          .filter((exec): exec is ExecutionRun => exec !== null);
        console.log(
          `HISTORY (API Fetch): Mapped ${fetchedRunsForDag.length} runs for ${dagIdToFetch}.`
        );
      } catch (error) {
        fetchErrorOccurred = true;
        console.error(`HISTORY (API Fetch): Error for ${dagIdToFetch}:`, error);
      }

      if (!fetchErrorOccurred) {
        // Only update storage if fetch was successful (even if it returned empty)
        setAllExecutionsFromStorage((prevAllRuns) => {
          const otherRuns = prevAllRuns.filter(
            (run) => run.dag_id !== dagIdToFetch
          );
          const updatedAllRuns = [...otherRuns, ...fetchedRunsForDag].sort(
            (a, b) => b.startTime.getTime() - a.startTime.getTime()
          );
          try {
            const storableRuns = updatedAllRuns.map(convertToStorable);
            localStorage.setItem(
              LOCAL_STORAGE_KEY,
              JSON.stringify(storableRuns)
            );
            console.log(
              `HISTORY (Storage Update): Saved ${updatedAllRuns.length} total runs to localStorage after fetch for ${dagIdToFetch}.`
            );
          } catch (e) {
            console.error(
              "HISTORY (Storage Update): Error saving to localStorage:",
              e
            );
          }
          return updatedAllRuns;
        });
      } else {
        console.log(
          `HISTORY (API Fetch): API fetch failed for ${dagIdToFetch}. localStorage not updated with new data for this DAG.`
        );
      }
      setIsLoading(false);
    },
    [currentWorkflowName, currentWorkflowId]
  );

  // 3. Effect to update displayedExecutions when currentWorkflowId or allExecutionsFromStorage changes.
  // This effect primarily handles displaying data from the cache (`allExecutionsFromStorage`).
  useEffect(() => {
    if (!initialStorageLoadDone) return; // Wait for localStorage to be loaded first

    if (currentWorkflowId) {
      console.log(
        `HISTORY (Display Update): currentWorkflowId is ${currentWorkflowId}. Filtering allExecutionsFromStorage for display.`
      );
      const runsForCurrentDag = allExecutionsFromStorage
        .filter((exec) => exec.dag_id === currentWorkflowId)
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

      setDisplayedExecutions(runsForCurrentDag);

      if (runsForCurrentDag.length > 0) {
        const currentSelectedStillExists =
          selectedExecution &&
          selectedExecution.dag_id === currentWorkflowId &&
          runsForCurrentDag.find((ex) => ex.id === selectedExecution.id);

        if (currentSelectedStillExists) {
          setSelectedExecution(currentSelectedStillExists);
        } else {
          setSelectedExecution(runsForCurrentDag[0]);
        }
        console.log(
          `HISTORY (Display Update): Displaying ${runsForCurrentDag.length} cached/updated runs for ${currentWorkflowId}.`
        );
      } else {
        setSelectedExecution(null);
        console.log(
          `HISTORY (Display Update): No cached/updated runs to display for ${currentWorkflowId}.`
        );
      }
    } else {
      console.log(
        "HISTORY (Display Update): No currentWorkflowId. Clearing displayed executions."
      );
      setDisplayedExecutions([]);
      setSelectedExecution(null);
    }
  }, [
    currentWorkflowId,
    allExecutionsFromStorage,
    initialStorageLoadDone,
    selectedExecution,
  ]);

  // 4. Effect to trigger API fetch when currentWorkflowId changes (for tab switching behavior)
  // This runs AFTER initialStorageLoadDone is true and currentWorkflowId is set.
  useEffect(() => {
    if (currentWorkflowId && initialStorageLoadDone) {
      console.log(
        `HISTORY (Tab Switch Fetch): Tab switched to ${currentWorkflowId}. Initializing API fetch.`
      );
      fetchAndStoreWorkflowRuns(currentWorkflowId, true); // true indicates it's an initial fetch for this tab
    }
    // Dependencies: currentWorkflowId to react to tab changes,
    // initialStorageLoadDone to ensure localStorage is loaded before first tab-switch fetch,
    // fetchAndStoreWorkflowRuns as it's called.
  }, [currentWorkflowId, initialStorageLoadDone, fetchAndStoreWorkflowRuns]);

  // 5. Polling: Periodically refresh data for the currently viewed workflow
  useEffect(() => {
    // If auto-refresh is disabled (0), or no workflow is selected, do nothing.
    if (
      refreshInterval === 0 ||
      !currentWorkflowId ||
      !initialStorageLoadDone
    ) {
      return;
    }

    console.log(
      `HISTORY (Polling): Starting for ${currentWorkflowId} every ${refreshInterval}ms.`
    );
    const intervalId = setInterval(() => {
      console.log(`HISTORY (Polling): Update for ${currentWorkflowId}`);
      fetchAndStoreWorkflowRuns(currentWorkflowId);
    }, refreshInterval);

    return () => {
      if (intervalId) {
        console.log("HISTORY (Polling): Clearing interval.");
        clearInterval(intervalId);
      }
    };
  }, [
    currentWorkflowId,
    initialStorageLoadDone,
    fetchAndStoreWorkflowRuns,
    refreshInterval,
  ]);

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "running":
      case "queued":
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "completed":
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "force_stopped":
        return <Square className="h-4 w-4 text-gray-500" />;
      case "skipped":
        return <Square className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  const getStatusBadge = (status: string) => {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    let colorClass = "bg-yellow-100 text-yellow-800";
    switch (status.toLowerCase()) {
      case "running":
      case "queued":
        colorClass = "bg-blue-100 text-blue-800";
        break;
      case "completed":
      case "success":
        colorClass = "bg-green-100 text-green-800";
        break;
      case "failed":
      case "error":
        colorClass = "bg-red-100 text-red-800";
        break;
      case "force_stopped":
      case "skipped":
        colorClass = "bg-gray-100 text-gray-800";
        break;
    }
    return <Badge className={colorClass}>{statusText}</Badge>;
  };
  const formatDuration = (ms?: number) => {
    if (ms === undefined || typeof ms !== "number" || isNaN(ms) || ms < 0)
      return "N/A";
    if (ms === 0) return "0ms";
    const s = ms / 1000;
    if (s < 1) return `${ms}ms`;
    if (s < 60) return `${s.toFixed(1)}s`;
    const m = s / 60;
    if (m < 60) return `${m.toFixed(1)}m`;
    const h = m / 60;
    return `${h.toFixed(1)}h`;
  };
  const safeFormatDate = (
    date?: Date,
    dateFormatStr = "MMM dd, yyyy HH:mm:ss"
  ) => {
    if (date instanceof Date && !isNaN(date.valueOf())) {
      try {
        return format(date, dateFormatStr);
      } catch (e) {
        console.error("Date formatting error:", e, date);
        return "Invalid Date";
      }
    }
    return "N/A";
  };

  const filteredAndSortedDisplayedExecutions = displayedExecutions.filter(
    (exec) => {
      if (!exec?.workflowName || !exec.id || !exec.dag_id) return false;
      const normSearch = searchTerm.toLowerCase();
      return (
        (exec.dag_id.toLowerCase().includes(normSearch) ||
          exec.workflowName.toLowerCase().includes(normSearch) ||
          exec.id.toLowerCase().includes(normSearch)) &&
        (statusFilter === "all" || exec.status === statusFilter) &&
        (triggerFilter === "all" || exec.triggeredBy === triggerFilter)
      );
    }
  );

  const handleRefresh = () => {
    console.log("HISTORY: Manual refresh for", currentWorkflowId);
    if (currentWorkflowId) {
      fetchAndStoreWorkflowRuns(currentWorkflowId);
    }
  };

  const handleExportLogs = () => {
    const logsToExport = Array.isArray(logs) ? logs : [];
    const logData = logsToExport.map((log: LogEntry) => ({
      timestamp:
        log.timestamp instanceof Date
          ? log.timestamp.toISOString()
          : String(log.timestamp),
      nodeId: log.nodeId,
      nodeName: log.nodeName,
      status: log.status,
      message: log.message,
      details: log.details,
      workflowRunId: log.workflowRunId,
    }));
    const blob = new Blob([JSON.stringify(logData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-logs-${
      currentWorkflowName || currentWorkflowId || "all"
    }-${format(new Date(), "yyyy-MM-dd-HH-mm")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Execution History{" "}
              {currentWorkflowName ? `for ${currentWorkflowName}` : ""}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {currentWorkflowId
                ? `Viewing runs for DAG ID: ${currentWorkflowId}`
                : "Select a workflow to view its execution history."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={String(refreshInterval)}
              onValueChange={(val) => setRefreshInterval(Number(val))}
            >
              {/* remove outline shadcn outline */}
              <SelectTrigger 
              
                    className="w-[180px]  shadow-none ring-0 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <SelectValue placeholder="Refresh Interval" 
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30000">Every 30 sec</SelectItem>
                <SelectItem value="60000">Every 1 min</SelectItem>
                <SelectItem value="180000">Every 3 min</SelectItem>
                <SelectItem value="300000">Every 5 min</SelectItem>
                <SelectItem value="0">Manual Only</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || !currentWorkflowId}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportLogs}
              disabled={!Array.isArray(logs) || logs.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r bg-white flex flex-col">
          <div className="p-4 border-b space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Filter current workflow runs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={
                  !currentWorkflowId && displayedExecutions.length === 0
                }
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                disabled={
                  !currentWorkflowId && displayedExecutions.length === 0
                }
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="force_stopped">Force Stopped</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={triggerFilter}
                onValueChange={setTriggerFilter}
                disabled={
                  !currentWorkflowId && displayedExecutions.length === 0
                }
              >
                <SelectTrigger className="w-full sm:w-32">
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
              {isLoading && !initialStorageLoadDone && (
                <div className="text-center py-8 text-gray-500">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin opacity-50" />
                  <p>Loading execution history...</p>
                </div>
              )}
              {initialStorageLoadDone &&
                filteredAndSortedDisplayedExecutions.length > 0 &&
                filteredAndSortedDisplayedExecutions.map((execution) => (
                  <Card
                    key={execution.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedExecution?.id === execution.id
                        ? "ring-2 ring-blue-500 shadow-lg"
                        : "hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedExecution(execution)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(execution.status)}
                          <span
                            className="font-medium text-sm truncate max-w-xs"
                            title={execution.workflowName}
                          >
                            {execution.workflowName}
                          </span>
                        </div>
                        {getStatusBadge(execution.status)}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          Run ID:{" "}
                          <span className="font-mono text-xs">
                            {execution.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {safeFormatDate(execution.startTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Duration: {formatDuration(execution.duration)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          Trigger: {execution.triggeredBy}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {initialStorageLoadDone &&
                !isLoading &&
                filteredAndSortedDisplayedExecutions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      {currentWorkflowId
                        ? "No executions found for this workflow."
                        : "Please select a workflow."}
                    </p>
                    {currentWorkflowId &&
                      (searchTerm ||
                        statusFilter !== "all" ||
                        triggerFilter !== "all") && (
                        <p className="text-sm">
                          Try adjusting filters or your search term.
                        </p>
                      )}
                    {currentWorkflowId &&
                      !searchTerm &&
                      statusFilter === "all" &&
                      triggerFilter === "all" && (
                        <p className="text-sm">
                          This workflow may not have any recorded runs, or they
                          haven't been fetched yet.
                        </p>
                      )}
                  </div>
                )}
            </div>
          </ScrollArea>
        </div>

        <div className="w-1/2 bg-white flex flex-col">
          {selectedExecution ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="text-lg font-semibold truncate max-w-md"
                    title={selectedExecution.workflowName}
                  >
                    {selectedExecution.workflowName}
                  </h3>
                  {getStatusBadge(selectedExecution.status)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {/* <div>
                    <span className="text-gray-500">Run ID:</span>
                    <p className="font-mono">{selectedExecution.id}</p>
                  </div> */}
                  <div>
                    <span className="text-gray-500">DAG ID:</span>
                    <p className="font-mono">{selectedExecution.dag_id}</p>
                  </div>
                  {/* <div>
                    <span className="text-gray-500">Duration:</span>
                    <p>{formatDuration(selectedExecution.duration)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Started:</span>
                    <p>{safeFormatDate(selectedExecution.startTime)}</p>
                  </div> */}
                  {/* <div>
                    <span className="text-gray-500">Ended:</span>
                    <p>
                      {selectedExecution.endTime
                        ? safeFormatDate(selectedExecution.endTime)
                        : selectedExecution.status === "running" ||
                          selectedExecution.status === "queued"
                        ? "In progress..."
                        : "N/A"}
                    </p>
                  </div> */}
                  <div>
                    <span className="text-gray-500">Triggered by:</span>
                    <p className="capitalize">
                      {selectedExecution.triggeredBy}
                    </p>
                  </div>
                </div>
              </div>
              <Tabs
                defaultValue="nodes"
                className="flex-1 flex flex-col min-h-0"
              >
                <TabsList className="mx-4 mt-4 w-fit shrink-0">
                  <TabsTrigger value="nodes">Node Results</TabsTrigger>
                  <TabsTrigger value="logs">Execution Logs</TabsTrigger>
                  <TabsTrigger value="output">Output Data</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="nodes"
                  className="flex-1 m-4 mt-2 overflow-hidden"
                >
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      {selectedExecution.nodeResults?.length > 0 ? (
                        selectedExecution.nodeResults.map((result, index) => (
                          <Card
                            key={`${selectedExecution.id}-${result.nodeId}-${index}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(result.status)}
                                  <span
                                    className="font-medium truncate max-w-xs"
                                    title={`${result.nodeName} (${result.nodeId})`}
                                  >
                                    {result.nodeName} ({result.nodeId})
                                  </span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {formatDuration(result.duration)}
                                </Badge>
                              </div>
                              {result.error && (
                                <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                                  <p className="text-red-800 text-sm font-medium">
                                    Error:
                                  </p>
                                  <p className="text-red-700 text-sm whitespace-pre-wrap break-all">
                                    {result.error}
                                  </p>
                                </div>
                              )}
                              {result.output !== undefined &&
                                result.output !== null && (
                                  <div className="bg-gray-50 border rounded p-2 mt-2">
                                    <p className="text-gray-700 text-sm font-medium mb-1">
                                      Output:
                                    </p>
                                    <pre className="text-xs text-gray-600 overflow-auto max-h-60">
                                      {JSON.stringify(result.output, null, 2)}
                                    </pre>
                                  </div>
                                )}
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No node results available.</p>
                          <p className="text-xs">
                            Workflow might be running or no task details
                            reported.
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent
                  value="logs"
                  className="flex-1 m-4 mt-2 overflow-hidden"
                >
                  <ScrollArea className="h-full">
                    <div className="space-y-2">
                      {(Array.isArray(logs) ? logs : ([] as LogEntry[]))
                        .filter(
                          (log: LogEntry) =>
                            log.workflowRunId === selectedExecution.id ||
                            (!log.workflowRunId &&
                              (selectedExecution.status === "running" ||
                                selectedExecution.status === "queued"))
                        )
                        .sort((a, b) =>
                          a.timestamp instanceof Date &&
                          b.timestamp instanceof Date
                            ? a.timestamp.getTime() - b.timestamp.getTime()
                            : 0
                        )
                        .map((log: LogEntry) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded border text-sm"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {getStatusIcon(log.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="font-medium truncate max-w-xs"
                                  title={log.nodeName}
                                >
                                  {log.nodeName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {safeFormatDate(
                                    log.timestamp,
                                    "HH:mm:ss.SSS"
                                  )}
                                </span>
                              </div>
                              <p className="text-gray-700 whitespace-pre-wrap break-all">
                                {log.message}
                              </p>
                              {log.details && (
                                <pre className="text-xs text-gray-600 mt-1 overflow-auto max-h-40">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              )}
                            </div>
                          </div>
                        ))}
                      {(Array.isArray(logs) ? logs : []).filter(
                        (log: LogEntry) =>
                          log.workflowRunId === selectedExecution.id ||
                          (!log.workflowRunId &&
                            (selectedExecution.status === "running" ||
                              selectedExecution.status === "queued"))
                      ).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No logs available for this execution run.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                {/* <TabsContent value="output" className="flex-1 m-4 mt-2 overflow-hidden">
                  <ScrollArea className="h-full">
                    {selectedExecution.nodeResults?.some(r => r.output !== undefined && r.output !== null) ? (
                      <div className="bg-gray-50 border rounded p-4">
                        <pre className="text-sm text-gray-700 overflow-auto max-h-[calc(100vh-20rem)]">
                          {JSON.stringify(selectedExecution.nodeResults.filter(r => r.output !== undefined && r.output !== null).reduce((acc, r) => ({ ...acc, [r.nodeId]: r.output }), {}), null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500"><AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No output data available.</p><p className="text-xs">Ensure tasks produce outputs and API provides them.</p></div>
                    )}
                  </ScrollArea>
                </TabsContent> */}
                <TabsContent
                  value="output"
                  className="flex-1 m-4 mt-2 overflow-hidden"
                >
                  <ScrollArea className="h-full">
                    {selectedExecution?.dag_run_map ? (
                      <div className="bg-gray-50 border rounded p-4">
                        <pre className="text-sm text-gray-700 overflow-auto max-h-[calc(100vh-20rem)]">
                          {JSON.stringify(
                            selectedExecution.dag_run_map,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No output data available.</p>
                        <p className="text-xs">
                          Ensure tasks produce outputs and API provides them.
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {currentWorkflowId
                    ? "Select an execution to view details"
                    : "Select a workflow to see its history"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}