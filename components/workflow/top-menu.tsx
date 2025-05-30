"use client"

import { useState, useEffect } from "react"
import { Share2, UserPlus, Save, Play, Loader2, Square } from "lucide-react"

import { useWorkflow } from "./workflow-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/services/client"
import type { ClientCreateResponse } from "@/services/interface"
import { stopCurrentWorkflow, getCurrentWorkflowId } from "@/services/dagService"

const topTabs = ["File", "Edit", "Project", "Run"];

export function TopMenu({
  activeView,
  setActiveView,
}: {
  activeView: string;
  setActiveView: (view: string) => void;
}) {
  const { runWorkflow, saveWorkflowToBackend, saveAndRunWorkflow, currentWorkflowName} = useWorkflow()
  const [activeTab, setActiveTab] = useState("File")

  const [createClientDialogOpen, setCreateClientDialogOpen] = useState(false)
  const [clientName, setClientName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdClient, setCreatedClient] = useState<ClientCreateResponse | null>(null)

  const [errorMessage, setErrorMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isStopping, setIsStopping] = useState(false)

  const [workflowIdAvailable, setWorkflowIdAvailable] = useState(false)

  useEffect(() => {
    const workflowId = getCurrentWorkflowId()
    setWorkflowIdAvailable(!!workflowId)
  }, [])

  const handleCreateClient = async () => {
    if (!clientName.trim()) {
      setErrorMessage("Client name cannot be empty.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const clientPayload = { name: clientName.trim() }
      const created: ClientCreateResponse | null = await createClient(clientPayload)

      if (!created || !created.id) {
        throw new Error("Client creation failed or didn't return an ID.")
      }

      setCreatedClient(created)
      setClientName("")

      try {
        const clientDataToStore = {
          id: String(created.id),
         
          name: created.name,
        }
        localStorage.setItem("currentClient", JSON.stringify(clientDataToStore))

        const workflowDataString = localStorage.getItem("currentWorkflow")
        if (workflowDataString) {
          try {
            const parsedWorkflow = JSON.parse(workflowDataString);
            parsedWorkflow.client_id = String(created.id);
            localStorage.setItem(
              "currentWorkflow",
              JSON.stringify(parsedWorkflow)
            );
            console.log(
              "TopMenu: Updated 'currentWorkflow' with new client_id:",
              parsedWorkflow
            );
          } catch (e) {
            console.error(
              "TopMenu: Failed to parse/update 'currentWorkflow' for new client_id",
              e
            );
          }
        }
      } catch (storageError) {
        console.error(
          "TopMenu: Failed to save client to localStorage:",
          storageError
        );
        setErrorMessage(
          "Client created, but failed to set as active locally. Please try selecting the client manually."
        );
      }
    } catch (error: unknown) {
      console.error("Failed to create client:", error);
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        setErrorMessage(
          "Cannot connect to the API server. Please ensure the backend service is accessible."
        );
      } else if (error instanceof Error) {
        setErrorMessage(`Error: ${error.message}`)
      } else {
        setErrorMessage("An unknown error occurred.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveWorkflowToBackend();
    } catch (error) {
      console.error("Failed to save workflow:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      await saveAndRunWorkflow()
    } catch (error) {
      console.error("Failed to run workflow:", error);
    } finally {
      setIsRunning(false);
    }
  }

  const handleStop = async () => {
    const currentWorkflowId = getCurrentWorkflowId()

    if (!currentWorkflowId) {
      setErrorMessage("No active workflow found to stop")
      return
    }

    setIsStopping(true)
    setErrorMessage("")

    try {
      const result = await stopCurrentWorkflow()
      if (!result?.success) {
        setErrorMessage(result?.message || "Failed to stop workflow")
      }
    } catch (error) {
      console.error("Error stopping workflow:", error)
      setErrorMessage("An error occurred while stopping the workflow")
    } finally {
      setIsStopping(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex h-14 items-center justify-between border-b px-4 bg-background">
        <div className="flex items-center space-x-6 h-full">
          {topTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative pb-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
                activeTab === tab && "text-foreground"
                
              )}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute left-0 bottom-0 h-1 w-full bg-purple-600 rounded-sm" />
              )}
            </button>
          ))}
        </div>

        {/* Center: Current Workflow Name and Tabs */}
        <div
          className="
        flex items-center gap-1 mt-11"
        >
          {currentWorkflowName && (
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-md border border-purple-200">
              <span className="text-sm font-medium text-purple-700">
                {currentWorkflowName}
              </span>
            </div>
          )}

          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="h-8">
              <TabsTrigger value="editor" className="text-xs px-2">Studio</TabsTrigger>
              <TabsTrigger value="executions" className="text-xs px-2">History</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleSave} {...(isSaving ? { disabled: true } : {})}>
            {isSaving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Saving...</> : <><Save className="h-4 w-4 mr-1" />Save</>}
          </Button>

          <Button variant="outline" size="sm" onClick={handleRun} {...(isRunning ? { disabled: true } : {})}>
            {isRunning ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Running...</> : <><Play className="h-4 w-4 mr-1" />Run</>}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleStop}
            {...(isStopping || !workflowIdAvailable ? { disabled: true } : {})}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            {isStopping ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Stopping...</> : <><Square className="h-4 w-4 mr-1" />Stop</>}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateClientDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Create Client
          </Button>

          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
            <button onClick={() => setErrorMessage("")} className="ml-auto text-red-400 hover:text-red-600">×</button>
          </div>
        </div>
      )}

      <Dialog open={createClientDialogOpen} onOpenChange={setCreateClientDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
          </DialogHeader>

          <hr />

          {!createdClient ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client-name" className="text-right">Client Name</Label>
                <Input
                  id="client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter client name"
                />
              </div>
              {errorMessage && (
                <div className="col-span-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
                  {errorMessage}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">
                  Client Created Successfully
                </h3>
                <hr />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">ID:</span>
                  <span>{createdClient.id}</span>
                  <span className="text-muted-foreground">Name:</span>
                  <span>{createdClient.name}</span>
                </div>
              </div>
            </div>
          )}

          <hr />
          <DialogFooter>
            {!createdClient ? (
              <>
                <Button variant="outline" onClick={() => setCreateClientDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateClient} {...(isSubmitting || !clientName.trim() ? { disabled: true } : {})}>
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </>
            ) : (
              <Button onClick={() => { setCreateClientDialogOpen(false); setCreatedClient(null) }}>Done</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
