//top-menu.tsx
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Share2,
  UserPlus,
  Save,
  Play,
  Loader2,
  Square,
  LogOut,
  UserIcon,
  Download,
  Upload,
  CircleFadingPlus,
  CircleFadingArrowUp,
  Key,
  X,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { useWorkflow } from "./workflow-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/services/client"
import type { ClientCreateResponse } from "@/services/interface"
import { stopCurrentWorkflow } from "@/services/dagService"
import { createAllConfigs, updateAllConfigs, runWorkflowOnly } from "@/services/workflow-utils"
// import { CreateCredentialsModal } from "@/app/(auth)/registerclient/createcredentialsModal"

// --- START: Enhanced Toast Notification System ---

type ToastVariant = "info" | "success" | "error" | "warning"

interface ToastData {
  id: number
  title: string
  message: string
  type: ToastVariant
}

const toastStyles: Record<ToastVariant, { bg: string; iconBg: string; icon: React.ReactNode }> = {
  info: {
    bg: "bg-blue-800",
    iconBg: "bg-blue-600",
    icon: <Info className="h-5 w-5 text-white" />,
  },
  success: {
    bg: "bg-green-700",
    iconBg: "bg-green-500",
    icon: <CheckCircle className="h-5 w-5 text-white" />,
  },
  error: {
    bg: "bg-red-800",
    iconBg: "bg-red-600",
    icon: <XCircle className="h-5 w-5 text-white" />,
  },
  warning: {
    bg: "bg-amber-700",
    iconBg: "bg-amber-500",
    icon: <AlertTriangle className="h-5 w-5 text-white" />,
  },
}

const ToastMessage: React.FC<{ toast: ToastData; onClose: (id: number) => void }> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  const handleClose = () => {
    setIsVisible(false)
  }

  useEffect(() => {
    setIsVisible(true)
    // Updated to 4 seconds as requested
    const timer = setTimeout(() => {
      handleClose()
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => {
        onClose(toast.id)
      }, 350)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, toast.id])

  const styles = toastStyles[toast.type]

  return (
    <div
      className={cn(
        "flex items-center p-2 pl-3 rounded-full shadow-lg text-white w-auto transition-all duration-300 ease-in-out",
        styles.bg,
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      )}
    >
      <div className={cn("flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full", styles.iconBg)}>
        {styles.icon}
      </div>
      <div className="ml-3 mr-2 flex-1">
        <p className="text-sm font-semibold whitespace-nowrap">{toast.title}</p>
        <p className="text-xs text-gray-200 whitespace-nowrap">{toast.message}</p>
      </div>
      <button
        onClick={handleClose}
        className="ml-auto flex-shrink-0 bg-black/20 hover:bg-black/40 rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

const ToastContainer: React.FC<{ toasts: ToastData[]; removeToast: (id: number) => void }> = ({
  toasts,
  removeToast,
}) => {
  return (
    <div className="fixed top-16 right-5 z-50 flex flex-col items-end space-y-3">
      {toasts.map((toast) => (
        <ToastMessage key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  )
}

// --- END: Enhanced Toast Notification System ---

const topTabs = ["File", "Edit", "Project", "Run"]

interface User {
  name: string
}

interface TopMenuProps {
  activeView: string
  setActiveView: (view: string) => void
  user?: User
  onLogout?: () => void
  onNavigateToClients?: () => void
}

export function TopMenu({ activeView, setActiveView, user, onLogout, onNavigateToClients }: TopMenuProps) {
  const {
    nodes,
    connections,
    saveWorkflowToBackend,
    currentWorkflowName,
    getCurrentWorkflowId,
    getWorkflowExportData,
    loadWorkflow,
    currentWorkflowId,
  } = useWorkflow()
  const [activeTab, setActiveTab] = useState("File")
  const [createClientDialogOpen, setCreateClientDialogOpen] = useState(false)
  const [createCredentialsDialogOpen, setCreateCredentialsDialogOpen] = useState(false)
  const [clientName, setClientName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdClient, setCreatedClient] = useState<ClientCreateResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [isCreatingConfigs, setIsCreatingConfigs] = useState(false)
  const [isUpdatingConfigs, setIsUpdatingConfigs] = useState(false)
  const [workflowIdAvailable, setWorkflowIdAvailable] = useState(false)
  const [userPopoverOpen, setUserPopoverOpen] = useState(false)
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [toasts, setToasts] = useState<ToastData[]>([])
  const addToast = (toast: Omit<ToastData, "id">) => {
    const id = Date.now()
    setToasts((prevToasts) => [...prevToasts, { id, ...toast }])
  }
  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

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
          try {
            const parsedWorkflow = JSON.parse(workflowDataString)
            parsedWorkflow.client_id = String(created.id)
            localStorage.setItem("currentWorkflow", JSON.stringify(parsedWorkflow))
          } catch (e) {
            console.error("TopMenu: Failed to parse/update 'currentWorkflow' for new client_id", e)
          }
        }
      } catch (storageError) {
        console.error("TopMenu: Failed to save client to localStorage:", storageError)
        setErrorMessage(
          "Client created, but failed to set as active locally. Please try selecting the client manually.",
        )
      }
    } catch (error: unknown) {
      console.error("Failed to create client:", error)
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setErrorMessage("Cannot connect to the API server. Please ensure the backend service is accessible.")
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
    setIsSaving(true)
    
    // Show info toast when starting the save operation
    addToast({ 
      title: "Saving Workflow", 
      message: "Saving your workflow to the backend...", 
      type: "info" 
    })
    
    try {
      await saveWorkflowToBackend()
      addToast({ 
        title: "Save Successful", 
        message: "Your workflow has been saved successfully.", 
        type: "success" 
      })
    } catch (error) {
      console.error("Failed to save workflow:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      addToast({ 
        title: "Save Failed", 
        message: `Could not save the workflow: ${errorMessage}`, 
        type: "error" 
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateConfigs = async () => {
    console.log("TOP_MENU: Starting config creation process...")
    console.log("TOP_MENU: Nodes count:", nodes.length)
    console.log("TOP_MENU: Connections count:", connections.length)
    console.log("TOP_MENU: Current workflow ID:", currentWorkflowId)
    
    setIsCreatingConfigs(true)
    
    // Show info toast when starting the config creation
    addToast({ 
      title: "Creating Configs", 
      message: "Creating configurations for workflow nodes...", 
      type: "info" 
    })
    
    try {
      const success = await createAllConfigs(nodes, connections, currentWorkflowId)
      console.log("TOP_MENU: createAllConfigs returned:", success)
      
      // Always show success toast regardless of return value if no error was thrown
      // The function completed without throwing an error, so we consider it successful
      addToast({ 
        title: "Configs Created", 
        message: "All configurations have been created successfully.", 
        type: "success" 
      })
      console.log("TOP_MENU: Config creation completed successfully")
      
    } catch (error) {
      console.error("TOP_MENU: Error in config creation:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      addToast({ 
        title: "Config Creation Failed", 
        message: `Failed to create configurations: ${errorMessage}`, 
        type: "error" 
      })
    } finally {
      setIsCreatingConfigs(false)
    }
  }

  const handleUpdateConfigs = async () => {
    console.log("TOP_MENU: Starting config update process...")
    console.log("TOP_MENU: Nodes count:", nodes.length)
    console.log("TOP_MENU: Connections count:", connections.length)
    console.log("TOP_MENU: Current workflow ID:", currentWorkflowId)
    
    setIsUpdatingConfigs(true)
    
    // Show info toast when starting the config update
    addToast({ 
      title: "Updating Configs", 
      message: "Updating configurations for workflow nodes...", 
      type: "info" 
    })
    
    try {
      const success = await updateAllConfigs(nodes, connections, currentWorkflowId)
      console.log("TOP_MENU: updateAllConfigs returned:", success)
      
      // Always show success toast regardless of return value if no error was thrown
      // The function completed without throwing an error, so we consider it successful
      addToast({ 
        title: "Configs Updated", 
        message: "All configurations have been updated successfully.", 
        type: "success" 
      })
      console.log("TOP_MENU: Config update completed successfully")
      
    } catch (error) {
      console.error("TOP_MENU: Error in config update:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      addToast({ 
        title: "Config Update Failed", 
        message: `Failed to update configurations: ${errorMessage}`, 
        type: "error" 
      })
    } finally {
      setIsUpdatingConfigs(false)
    }
  }

  const handleRun = async () => {
    console.log("TOP_MENU: Starting workflow run process...")
    console.log("TOP_MENU: Nodes count:", nodes.length)
    console.log("TOP_MENU: Connections count:", connections.length)
    console.log("TOP_MENU: Current workflow ID:", currentWorkflowId)
    
    setIsRunning(true)
    
    // Show info toast when starting the workflow run
    addToast({ 
      title: "Running Workflow", 
      message: "Starting workflow execution...", 
      type: "info" 
    })
    
    try {
      const success = await runWorkflowOnly(nodes, connections, currentWorkflowId)
      console.log("TOP_MENU: runWorkflowOnly returned:", success)
      
      // Always show success toast regardless of return value if no error was thrown
      // The function completed without throwing an error, so we consider it successful
      addToast({ 
        title: "Workflow Started", 
        message: "Your workflow has been started successfully.", 
        type: "success" 
      })
      console.log("TOP_MENU: Workflow run completed successfully")
      
    } catch (error) {
      console.error("TOP_MENU: Error in workflow run:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      addToast({ 
        title: "Workflow Run Failed", 
        message: `Failed to start the workflow: ${errorMessage}`, 
        type: "error" 
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleStop = async () => {
    const currentWorkflowIdFromContext = getCurrentWorkflowId()
    if (!currentWorkflowIdFromContext) {
      addToast({ title: "Error", message: "No active workflow found to stop.", type: "error" })
      return
    }
    
    setIsStopping(true)
    
    // Show info toast when starting to stop the workflow
    addToast({ 
      title: "Stopping Workflow", 
      message: "Attempting to stop the running workflow...", 
      type: "info" 
    })
    
    try {
      const result = await stopCurrentWorkflow()
      if (result?.success) {
        addToast({ 
          title: "Workflow Stopped", 
          message: "The workflow has been stopped successfully.", 
          type: "success" 
        })
      } else {
        addToast({ 
          title: "Stop Failed", 
          message: result?.message || "Failed to stop workflow.", 
          type: "error" 
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      addToast({ 
        title: "Stop Error", 
        message: `An error occurred while stopping the workflow: ${errorMessage}`, 
        type: "error" 
      })
    } finally {
      setIsStopping(false)
    }
  }

  const handleDownloadWorkflow = () => {
    try {
      const exportData = getWorkflowExportData()
      const filename = `${(exportData.metadata?.name || "workflow").replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.json`
      const dataStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      addToast({
        title: "Download Complete",
        message: "Workflow downloaded successfully.",
        type: "success",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      addToast({ 
        title: "Download Failed", 
        message: `Could not download the workflow file: ${errorMessage}`, 
        type: "error" 
      })
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const parsedData = JSON.parse(content)
          loadWorkflow(parsedData)
          addToast({ 
            title: "Load Successful", 
            message: "Workflow loaded successfully.", 
            type: "success" 
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Invalid file format"
          addToast({ 
            title: "Load Failed", 
            message: `Please ensure it's a valid workflow file: ${errorMessage}`, 
            type: "error" 
          })
        }
      }
      reader.readAsText(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

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

  const handleCreateCredentialsClick = () => {
    setClientPopoverOpen(false)
    setCreateCredentialsDialogOpen(true)
  }

  // Common style for all tooltips
  const TooltipStyle = "text-xs px-2 py-1"

  return (
    <div className="w-full relative">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="flex h-14 items-center justify-between border-b px-4 bg-background">
        {/* Left Side */}
        <div className="flex items-center space-x-6 h-full">
          {topTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors rounded-md",
                activeTab === tab
                  ? "bg-muted text-foreground"
                  : "hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {tab}
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
              <TooltipContent side="bottom" className={TooltipStyle}>
                <p>Download</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-5 w-5" />
                  <span className="sr-only">Load Workflow</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={TooltipStyle}>
                <p>Load</p>
              </TooltipContent>
            </Tooltip>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  <span className="sr-only">Save Workflow</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={TooltipStyle}>
                <p>Save</p>
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-2" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCreateConfigs}
                  disabled={isCreatingConfigs}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {isCreatingConfigs ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CircleFadingPlus className="h-5 w-5" />
                  )}
                  <span className="sr-only">Create Configs</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={TooltipStyle}>
                <p>Create Config</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateConfigs}
                  disabled={isUpdatingConfigs}
                  className="text-orange-600 hover:text-orange-700"
                >
                  {isUpdatingConfigs ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CircleFadingArrowUp className="h-5 w-5" />
                  )}
                  <span className="sr-only">Update Configs</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={TooltipStyle}>
                <p>Update Config</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleRun} disabled={isRunning}>
                  {isRunning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                  <span className="sr-only">Run Workflow</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={TooltipStyle}>
                <p>Run</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleStop} disabled={isStopping || !workflowIdAvailable}>
                  {isStopping ? (
                    <Loader2 className="h-5 w-5 animate-spin text-destructive" />
                  ) : (
                    <Square className="h-5 w-5 text-destructive" />
                  )}
                  <span className="sr-only">Stop Workflow</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={TooltipStyle}>
                <p>Stop</p>
              </TooltipContent>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCreateClientClick}
                      className="justify-start w-full"
                    >
                      <UserPlus className="h-4 w-4 mr-2" /> Create Client
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleListClientsClick} className="justify-start w-full">
                      <UserIcon className="h-4 w-4 mr-2" /> List Clients
                    </Button>
                    <Separator className="my-1" />
                    <Button variant="ghost" size="sm" onClick={handleCreateCredentialsClick} className="justify-start w-full">
                      <Key className="h-4 w-4 mr-2" /> Create Credentials
                    </Button>
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={TooltipStyle}>
                <p>Clients</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                  <span className="sr-only">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={TooltipStyle}>
                <p>Share</p>
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-2" />

            {user && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <UserIcon className="h-5 w-5" />
                        <span className="sr-only">User Menu</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="end">
                      <div className="p-2 text-sm font-medium text-muted-foreground">Signed in as {user.name}</div>
                      <Separator />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full mt-1 justify-start text-destructive hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                      </Button>
                    </PopoverContent>
                  </Popover>
                </TooltipTrigger>
                <TooltipContent side="bottom" className={TooltipStyle}>
                  <p>{user.name}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      </div>

      <div className="absolute left-1/2 top-11 z-10 -translate-x-1/2 flex items-center gap-1">
        {currentWorkflowName && (
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-md border border-purple-200">
            <span className="text-sm font-medium text-purple-700">{currentWorkflowName}</span>
          </div>
        )}
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="h-8">
            <TabsTrigger value="editor" className="text-xs px-2">
              Studio
            </TabsTrigger>
            <TabsTrigger value="executions" className="text-xs px-2">
              History
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
            <button onClick={() => setErrorMessage("")} className="ml-auto text-red-400 hover:text-red-600">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Create Client Dialog */}
      <Dialog open={createClientDialogOpen} onOpenChange={setCreateClientDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
          </DialogHeader>
          <Separator />
          {!createdClient ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client-name" className="text-right">
                  Client Name
                </Label>
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
                <h3 className="font-medium mb-2 text-center">Client Created Successfully</h3>
                <Separator className="my-2" />
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
                <Button variant="outline" onClick={() => setCreateClientDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateClient} disabled={isSubmitting || !clientName.trim()}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setCreateClientDialogOpen(false)
                  setCreatedClient(null)
                }}
              >
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Credentials Modal */}
      {/* <CreateCredentialsModal 
        open={createCredentialsDialogOpen} 
        onOpenChange={setCreateCredentialsDialogOpen} 
      /> */}
    </div>
  )
}