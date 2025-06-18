//top-menu.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Share2, UserPlus, Save, Play, Loader2, Square, LogOut, User, ChevronDown, Download, Upload } from "lucide-react"
import { useWorkflow } from "./workflow-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/services/client"
import type { ClientCreateResponse } from "@/services/interface"
import { stopCurrentWorkflow } from "@/services/dagService"

const topTabs = ["File", "Edit", "Project", "Run"];

interface User {
  name: string
}

interface TopMenuProps {
  activeView: string;
  setActiveView: (view: string) => void;
  user?: User;
  onLogout?: () => void;
  onNavigateToClients?: () => void;
}

export function TopMenu({
  activeView,
  setActiveView,
  user,
  onLogout,
  onNavigateToClients,
}: TopMenuProps) {
  const { runWorkflow, saveWorkflowToBackend, saveAndRunWorkflow, currentWorkflowName, getCurrentWorkflowId, getWorkflowExportData, loadWorkflow } = useWorkflow()
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
  const [userPopoverOpen, setUserPopoverOpen] = useState(false)
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const workflowId = getCurrentWorkflowId()
    setWorkflowIdAvailable(!!workflowId)
  }, [getCurrentWorkflowId])

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
      if (!created || !created.id) throw new Error("Client creation failed or didn't return an ID.")
      setCreatedClient(created)
      setClientName("")
      try {
        const clientDataToStore = { id: String(created.id), name: created.name }
        localStorage.setItem("currentClient", JSON.stringify(clientDataToStore))
        const workflowDataString = localStorage.getItem("currentWorkflow")
        if (workflowDataString) {
          const parsedWorkflow = JSON.parse(workflowDataString);
          parsedWorkflow.client_id = String(created.id);
          localStorage.setItem("currentWorkflow", JSON.stringify(parsedWorkflow));
        }
      } catch (storageError) {
        setErrorMessage("Client created, but failed to set as active locally. Please try selecting the client manually.")
      }
    } catch (error: unknown) {
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setErrorMessage("Cannot connect to the API server. Please ensure the backend service is accessible.");
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
    const currentWorkflowIdFromContext = getCurrentWorkflowId()
    if (!currentWorkflowIdFromContext) {
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
      setErrorMessage("An error occurred while stopping the workflow")
    } finally {
      setIsStopping(false)
    }
  }

  const handleDownloadWorkflow = () => {
    try {
      const exportData = getWorkflowExportData();
      const filename = `${(exportData.metadata?.name || 'workflow').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Failed to download workflow. Please try again.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedData = JSON.parse(content);
          loadWorkflow(parsedData);
          setErrorMessage("");
        } catch (error) {
          setErrorMessage("Failed to load workflow. Please ensure it's a valid JSON file.");
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userCredentials")
    localStorage.removeItem("currentClient")
    localStorage.removeItem("currentWorkflow")
    setUserPopoverOpen(false)
    if (onLogout) {
      onLogout()
    }
  }

  const handleCreateClientClick = () => {
    setClientPopoverOpen(false)
    setCreateClientDialogOpen(true)
  }

  const handleListClientsClick = () => {
    setClientPopoverOpen(false)
    if (onNavigateToClients) {
      onNavigateToClients()
    }
  }

  // Common style for all tooltips
  const TooltipStyle = "text-xs px-2 py-1";

  return (
    <div className="w-full relative">
      <div className="flex h-14 items-center justify-between border-b px-4 bg-background">
        {/* Left Side */}
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

        {/* Right Side - Icon Buttons with Tooltips */}
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleDownloadWorkflow}>
                  <Download className="h-5 w-5" />
                  <span className="sr-only">Download Workflow</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={TooltipStyle}><p>Download</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-5 w-5" />
                  <span className="sr-only">Load Workflow</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={TooltipStyle}><p>Load</p></TooltipContent>
            </Tooltip>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  <span className="sr-only">Save Workflow</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={TooltipStyle}><p>Save</p></TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleRun} disabled={isRunning}>
                  {isRunning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                  <span className="sr-only">Run Workflow</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={TooltipStyle}><p>Run</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleStop} disabled={isStopping || !workflowIdAvailable}>
                  {isStopping ? <Loader2 className="h-5 w-5 animate-spin text-destructive" /> : <Square className="h-5 w-5 text-destructive" />}
                  <span className="sr-only">Stop Workflow</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={TooltipStyle}><p>Stop</p></TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-2" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <UserPlus className="h-5 w-5" />
                      <span className="sr-only">Clients</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2" align="end">
                    <Button variant="ghost" size="sm" onClick={handleCreateClientClick} className="justify-start w-full">
                      <UserPlus className="h-4 w-4 mr-2" /> Create Client
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleListClientsClick} className="justify-start w-full">
                      <User className="h-4 w-4 mr-2" /> List Clients
                    </Button>
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={TooltipStyle}><p>Clients</p></TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                  <span className="sr-only">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={TooltipStyle}><p>Share</p></TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-2" />
            
            {user && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                        <span className="sr-only">User Menu</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="end">
                      <div className="p-2 text-sm font-medium text-muted-foreground">Signed in as {user.name}</div>
                      <Separator />
                      <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full mt-1 justify-start text-destructive hover:text-destructive">
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                      </Button>
                    </PopoverContent>
                  </Popover>
                </TooltipTrigger>
                <TooltipContent side="bottom" className={TooltipStyle}><p>{user.name}</p></TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>
      
      {/* Center Content: Absolutely positioned */}
      <div className="absolute left-1/2 top-11 z-10 -translate-x-1/2 flex items-center gap-1">
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
          <Separator />
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
              <div className="bg-muted p-4 rounded-md border">
                <h3 className="font-medium mb-2 text-center">
                  Client Created Successfully
                </h3>
                <Separator className="my-2"/>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted-foreground font-medium">ID:</span>
                  <span className="font-mono text-xs bg-background rounded px-2 py-1">{createdClient.id}</span>
                  <span className="text-muted-foreground font-medium">Name:</span>
                  <span>{createdClient.name}</span>
                </div>
              </div>
            </div>
          )}
          <Separator />
          <DialogFooter>
            {!createdClient ? (
              <>
                <Button variant="outline" onClick={() => setCreateClientDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateClient} disabled={isSubmitting || !clientName.trim()}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Creating...</> : "Create"}
                </Button>
              </>
            ) : (
              <Button onClick={() => { setCreateClientDialogOpen(false); setCreatedClient(null); }}>Done</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}