"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Database,
  FileText,
  Briefcase,
  Settings,
  AlertTriangle,
  Loader2,
  Download,
  Upload,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fetchClients } from "@/services/client";
import { fetchDAGs, getDAGById } from "@/services/dagService";
import { fetchDAGStatus } from "@/services/client-dashboard-api";
import type { Client, DAG, DagRun } from "@/services/interface";
import { useWorkflow } from "@/components/workflow/workflow-context";

interface DAGWithLatestRun extends DAG {
  latestRun: DagRun | null;
  type?: string;
}

interface ConfigItem {
  id: string;
  dag_id: string;
  trigger_id?: string;
  name?: string;
  status?: string;
  type:
    | "file_conversion"
    | "read_salesforce"
    | "write_salesforce"
    | "cli_operators";
  config_data?: any;
}

export default function ClientDashboard({
  onOpenWorkflow,
}: {
  onOpenWorkflow: (dag: DAG) => void;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [dags, setDags] = useState<DAGWithLatestRun[]>([]);
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loadingDags, setLoadingDags] = useState(false);
  const [loadingDagDetails, setLoadingDagDetails] = useState<string | null>(
    null
  );
  const router = useRouter();
  const { loadWorkflowFromDAG, setCurrentWorkflowMeta } = useWorkflow();

  useEffect(() => {
    setLoadingDags(true);
    fetchClients()
      .then((res) => {
        const clientList = res || [];
        setClients(clientList);
        const id = clientList[0]?.id ?? null;
        setSelectedClientId(id);
        if (id !== null) {
          fetchDagsAndStatuses(id);
        }
      })
      .catch(() => setClients([]))
      .finally(() => setLoadingDags(false));
  }, []);

  const fetchDagsAndStatuses = useCallback(async (clientId: number) => {
    setLoadingDags(true);
    try {
      const all = await fetchDAGs();
      const clientDags = all.filter(
        (d) => d.client_id === clientId || !d.client_id
      );
      const withRuns = await Promise.all(
        clientDags.map(async (dag) => {
          let latestRun: DagRun | null = null;
          try {
            const runs = await fetchDAGStatus(String(dag.dag_id));
            if (Array.isArray(runs) && runs.length) {
              latestRun = runs.sort(
                (a, b) =>
                  new Date(b.start_time).getTime() -
                  new Date(a.start_time).getTime()
              )[0];
            } else if (runs && !Array.isArray(runs)) {
              latestRun = runs as DagRun;
            }
          } catch {}
          const type =
            (dag as any).type || determineOverallDagTypeFromName(dag.name);
          return { ...dag, latestRun, type };
        })
      );
      setDags(withRuns);
    } catch {
      setDags([]);
    } finally {
      setLoadingDags(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClientId != null) fetchDagsAndStatuses(selectedClientId);
  }, [selectedClientId, fetchDagsAndStatuses]);

  const handleViewDagInEditor = async (dagSummary: DAGWithLatestRun) => {
    if (!dagSummary.dag_id) return;
    setLoadingDagDetails(dagSummary.dag_id);
    try {
      const full = await getDAGById(dagSummary.dag_id);
      if (!full) return;
      await loadWorkflowFromDAG(full);
      setCurrentWorkflowMeta(String(full.dag_id), full.name);
      router.push("/");
    } catch {
    } finally {
      setLoadingDagDetails(null);
    }
  };

  const getStatusIcon = (run: DagRun | null) => {
    const s = run?.status?.toLowerCase();
    if (s === "success" || s === "completed")
      return <CheckCircle className="text-green-500 h-5 w-5" />;
    if (s === "failed" || s === "error")
      return <XCircle className="text-red-500 h-5 w-5" />;
    if (s === "running")
      return <Clock className="text-yellow-500 animate-pulse h-5 w-5" />;
    return <Clock className="text-gray-400 h-5 w-5" />;
  };

  const getStatusBadge = (run: DagRun | null) => {
    if (!run?.status)
      return (
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          No Runs
        </Badge>
      );
    const s = run.status.toLowerCase();
    const variant =
      s === "failed"
        ? "destructive"
        : s === "running"
        ? "secondary"
        : "default";
    return (
      <Badge variant={variant} className="flex items-center gap-1 text-xs">
        {getStatusIcon(run)}
        {run.status}
      </Badge>
    );
  };

  const getDagCategoryIcon = (type?: string) => {
    switch (type) {
      case "file_conversion":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "salesforce_integration":
        return <Briefcase className="h-5 w-5 text-sky-500" />;
      case "automation_scripts":
        return <Settings className="h-5 w-5 text-purple-500" />;
      case "database_operations":
        return <Database className="h-5 w-5 text-emerald-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Client Dashboard</h1>
          <p className="text-gray-600">Monitor and view workflows</p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={String(selectedClientId ?? "")}
            onValueChange={(value) => {
              const id = Number(value);
              if (!isNaN(id)) {
                setSelectedClientId(id);
                fetchDagsAndStatuses(id);
              }
            }}
            disabled={loadingDags}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id!.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              selectedClientId && fetchDagsAndStatuses(selectedClientId)
            }
            disabled={loadingDags || !selectedClientId}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loadingDags ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: "Total DAGs",
            value: dags.length,
            icon: Briefcase,
            color: "text-blue-500",
          },
          {
            title: "Running",
            value: dags.filter(
              (d) => d.latestRun?.status?.toLowerCase() === "running"
            ).length,
            icon: Clock,
            color: "text-yellow-500",
            valueColor: "text-yellow-600",
          },
          {
            title: "Succeeded",
            value: dags.filter((d) =>
              ["success", "completed"].includes(
                d.latestRun?.status?.toLowerCase() || ""
              )
            ).length,
            icon: CheckCircle,
            color: "text-green-500",
            valueColor: "text-green-600",
          },
          {
            title: "Failed",
            value: dags.filter((d) =>
              ["failed", "error"].includes(
                d.latestRun?.status?.toLowerCase() || ""
              )
            ).length,
            icon: XCircle,
            color: "text-red-500",
            valueColor: "text-red-600",
          },
        ].map(({ title, value, icon: Icon, color, valueColor }) => (
          <Card key={title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{title}</p>
                  <p className={`text-2xl font-bold ${valueColor ?? ""}`}>
                    {value}
                  </p>
                </div>
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* </Tabs> */}

      {loadingDags && (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      )}

      {!loadingDags && dags.length > 0 && (
        <Tabs defaultValue={dags[0].type} className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-1">
            {Array.from(new Set(dags.map((d) => d.type))).map((type) => (
              <TabsTrigger
                key={type}
                value={(type || "").toLowerCase()}
                className="flex items-center gap-2 px-2 py-1"
              >
                {getDagCategoryIcon(type)}
                <span className="capitalize">{type}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {Array.from(new Set(dags.map((d) => d.type))).map((type) => (
            <TabsContent
              key={type}
               value={(type || "").toLowerCase()}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {dags
                .filter((d) => d.type === type)
                .map((dag) => (
                  <Card
                    key={dag.dag_id}
                    className="flex flex-col hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="px-4 py-3">
                      <div className="flex justify-between items-center w-full">
                        {/* Left side: icon + title */}
                        <div className="flex items-center gap-2 truncate text-sm">
                          {getDagCategoryIcon(dag.type)}
                          <CardTitle className="truncate" title={dag.name}>
                            {dag.name}
                          </CardTitle>
                        </div>

                        {/* Right side: status badge */}
                        {getStatusBadge(dag.latestRun)}
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-grow justify-between px-4 pb-3 pt-1">
                      <p className="text-xs text-muted-foreground">
                        ID: {dag.dag_id}
                      </p>
                      {/* {dag.latestRun?.status==='failed'&&dag.latestRun.error_message&&(
                      <p className="text-red-600 flex items-start gap-1 mt-2"><AlertTriangle className="h-3 w-3"/>{dag.latestRun.error_message}</p>
                    )} */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => handleViewDagInEditor(dag)}
                        disabled={loadingDagDetails === dag.dag_id}
                      >
                        {loadingDagDetails === dag.dag_id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4 mr-2" />
                        )}
                        View Workflow
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

// Helper
function determineOverallDagTypeFromName(name: string) {
  const n = name.toLowerCase();
  if (n.includes("file")) return "file_conversion";
  if (n.includes("salesforce")) return "salesforce_integration";
  if (n.includes("script")) return "automation_scripts";
  if (n.includes("db")) return "database_operations";
  return "general_workflow";
}
