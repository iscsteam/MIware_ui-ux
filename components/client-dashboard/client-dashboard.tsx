"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Upload,
  Download,
  Users,
  AlertTriangle,
} from "lucide-react";

import { fetchDAGStatus } from "@/services/client-dashboard-api";
import { fetchDAGs } from "@/services/dagService";
import { fetchClients } from "@/services/client";

import { DagRun, DAG, Client } from "@/services/interface";

type DAGStatusResponse = DagRun[];

type DAGWithLatestRun = DAG & {
  latestRun: DagRun | null;
};

const determineTypeFromName = (name: string): string => {
  const lowerCaseName = name.toLowerCase();
  if (lowerCaseName.includes("convert") || lowerCaseName.includes("file"))
    return "file_conversion";
  if (
    lowerCaseName.includes("read_sf") ||
    (lowerCaseName.includes("read") && lowerCaseName.includes("salesforce"))
  )
    return "read_salesforce";
  if (
    lowerCaseName.includes("write_sf") ||
    (lowerCaseName.includes("write") && lowerCaseName.includes("salesforce"))
  )
    return "write_salesforce";
  if (lowerCaseName.includes("cli")) return "cli_operators";
  return "other";
};

export default function ClientDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [dags, setDags] = useState<DAGWithLatestRun[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [selectedDag, setSelectedDag] = useState<DAGWithLatestRun | null>(null);

  useEffect(() => {
    fetchClients()
      .then((res) => {
        if (res) {
          setClients(res);
          if (res.length > 0) setSelectedClientId(res[0]?.id ?? null);
        }
      })
      .catch(console.error);
  }, []);

  const fetchDagsAndStatuses = useCallback(async (clientId: number) => {
    setLoading(true);
    try {
      const baseDags = await fetchDAGs();
      if (!baseDags) {
        setDags([]);
        return;
      }

      const dagsWithStatusPromises = baseDags.map(
        async (dag: DAG): Promise<DAGWithLatestRun> => {
          let latestRun: DagRun | null = null;
          if (dag.dag_id) {
            try {
              const statusHistory = await fetchDAGStatus(
                dag.dag_id
              );
              if (Array.isArray(statusHistory) && statusHistory.length > 0) {
                const sortedRuns = [...statusHistory].sort(
                  (a, b) =>
                    new Date(b.start_time).getTime() -
                    new Date(a.start_time).getTime()
                );
                latestRun = sortedRuns[0];
              }
            } catch (error) {
              console.error(`Failed to fetch status for ${dag.dag_id}`, error);
            }
          }

          const finalType = dag.type || determineTypeFromName(dag.name);

          return {
            ...dag,
            type: finalType,
            latestRun,
          };
        }
      );

      const settledDags = await Promise.all(dagsWithStatusPromises);
      setDags(settledDags);
    } catch (error) {
      console.error("Failed to fetch DAGs:", error);
      setDags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClientId !== null) {
      fetchDagsAndStatuses(selectedClientId);
    } else {
      setDags([]);
    }
  }, [selectedClientId, fetchDagsAndStatuses]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedClientId !== null) {
        fetchDagsAndStatuses(selectedClientId);
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [selectedClientId, fetchDagsAndStatuses]);

  const groupedDAGs = dags.reduce<Record<string, DAGWithLatestRun[]>>(
    (acc, dag) => {
      const typeKey = dag.type || "other";
      (acc[typeKey] ||= []).push(dag);
      return acc;
    },
    {}
  );

  const getStatusIcon = (status: string | undefined) => {
    const s = status?.trim().toLowerCase();
    switch (s) {
      case "success":
      case "completed":
        return <CheckCircle className="text-green-500 h-4 w-4" />;
      case "failed":
      case "error":
        return <XCircle className="text-red-500 h-4 w-4" />;
      case "running":
        return <Clock className="text-yellow-500 animate-pulse h-4 w-4" />;
      default:
        return <Clock className="text-gray-400 h-4 w-4" />;
    }
  };

  const getStatusBadge = (run: DagRun | null) => {
    if (!run?.status) {
      console.warn("No status found in DAG run:", run);
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <Clock className="text-gray-400 h-4 w-4" /> 
        </Badge>
      );
    }

    const status = run.status.trim().toLowerCase();
    const variant =
      status === "success" || status === "completed"
        ? "default"
        : status === "failed" || status === "error"
        ? "destructive"
        : status === "running"
        ? "secondary"
        : "outline";

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getStatusIcon(status)} {status}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "file_conversion":
        return <FileText className="text-blue-500 h-5 w-5" />;
      case "read_salesforce":
        return <Download className="text-green-500 h-5 w-5" />;
      case "write_salesforce":
        return <Upload className="text-orange-500 h-5 w-5" />;
      case "cli_operators":
        return <Database className="text-purple-500 h-5 w-5" />;
      default:
        return <FileText className="text-gray-400 h-5 w-5" />;
    }
  };

  const statCount = (filter: "success" | "running" | "failed") =>
    dags.filter((d) => {
      const status = d.latestRun?.status?.toLowerCase();
      if (!status) return false;
      return filter === "success"
        ? ["success", "completed"].includes(status)
        : status === filter;
    }).length;

  if (showCanvas && selectedDag) {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <Button variant="outline" onClick={() => setShowCanvas(false)}>
            ← Back
          </Button>
          <div className="text-right">
            <h2 className="font-semibold text-lg">{selectedDag.name}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedDag.dag_id}
            </p>
          </div>
        </div>
        <div className="flex-grow">
          {/* <WorkflowCanvas config={selectedDag} onClose={() => setShowCanvas(false)} /> */}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Client Dashboard</h1>
          <p className="text-gray-600">Monitor and view workflow DAGs</p>
        </div>
        <div className="flex gap-4 items-center">
          <Select
            value={selectedClientId?.toString() ?? ""}
            onValueChange={(v) => setSelectedClientId(Number(v))}
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
            onClick={() =>
              selectedClientId && fetchDagsAndStatuses(selectedClientId)
            }
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total DAGs</p>
              <p className="text-xl font-bold">{dags.length}</p>
            </div>
            <Users className="text-blue-500 h-6 w-6" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Running</p>
              <p className="text-xl font-bold text-yellow-500">
                {statCount("running")}
              </p>
            </div>
            <Clock className="text-yellow-500 h-6 w-6" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Success</p>
              <p className="text-xl font-bold text-green-600">
                {statCount("success")}
              </p>
            </div>
            <CheckCircle className="text-green-500 h-6 w-6" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-xl font-bold text-red-600">
                {statCount("failed")}
              </p>
            </div>
            <XCircle className="text-red-500 h-6 w-6" />
          </CardContent>
        </Card>
      </div>

      {Object.keys(groupedDAGs).length > 0 && (
        <Tabs defaultValue={Object.keys(groupedDAGs)[0]} className="space-y-4">
          <TabsList
            className="grid w-full"
            style={{
              gridTemplateColumns: `repeat(${Math.max(
                1,
                Object.keys(groupedDAGs).length
              )}, minmax(0, 1fr))`,
            }}
          >
            {Object.keys(groupedDAGs).map((type) => (
              <TabsTrigger key={type} value={type}>
                {getTypeIcon(type)}
                <span className="ml-2 capitalize">
                  {type.replace(/_/g, " ")}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(groupedDAGs).map(([type, items]) => (
            <TabsContent key={type} value={type}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((dag) => (
                  <Card key={dag.dag_id}>
                    <CardHeader className="flex flex-row justify-between items-start pb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(dag.type || "other")}
                        <CardTitle className="text-sm font-semibold">
                          {dag.name}
                        </CardTitle>
                      </div>
                      {getStatusBadge(dag.latestRun)}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        ID: {dag.dag_id}
                      </p>
                      {dag.latestRun ? (
                        <div className="text-xs text-muted-foreground border-l-2 pl-2 space-y-1">
                          <p>
                            Last Run:{" "}
                            {new Date(
                              dag.latestRun.start_time
                            ).toLocaleString()}
                          </p>
                          {dag.latestRun.status === "failed" && (
                            <p className="text-red-600 flex items-start gap-1">
                              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {/* <span>Error: {dag.latestRun.error_message}</span> */}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No recent runs found.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
