//sidebar.tsx
"use client"

import { useState, useEffect } from "react"
import {
  ChevronDown,
  FileText,
  Folder,
  Layers,
  Shield,
  Settings,
  Plug,
  Puzzle,
  Variable,
  ActivitySquare,
  HelpCircle,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import WorkflowModal from "@/components/Model"
import { fetchDAGs } from "@/services/dagService"
import type { DAG } from "@/services/dagService"
import { useToast } from "@/components/ui/use-toast"

export function Sidebar({
  activeView,
  setActiveView,
}: {
  activeView: string
  setActiveView: (view: string) => void
}) {
  const [isProjectOpen, setIsProjectOpen] = useState(true)
  const [isWorkflowsOpen, setIsWorkflowsOpen] = useState(false)
  const [isModuleOpen, setIsModuleOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectCreated, setProjectCreated] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [workflows, setWorkflows] = useState<DAG[]>([])
  const { toast } = useToast()

  const [editingWorkflow, setEditingWorkflow] = useState<DAG | null>(null)
  const [isEditWorkflowModalOpen, setIsEditWorkflowModalOpen] = useState(false)
  const [editWorkflowName, setEditWorkflowName] = useState("")
  const [editWorkflowSchedule, setEditWorkflowSchedule] = useState("")

  const handleUpdateWorkflow = async () => {
    if (!editingWorkflow) return

    try {
      const { updateDagNameAndSchedule } = await import("@/services/file-conversion-service")
      const updatedDAG = await updateDagNameAndSchedule(editingWorkflow.dag_id, {
        name: editWorkflowName.trim(),
        schedule: editWorkflowSchedule.trim() || null,
      })

      if (updatedDAG) {
        setWorkflows((prev) =>
          prev.map((w) =>
            w.dag_id === editingWorkflow.dag_id
              ? {
                  ...w,
                  name: editWorkflowName.trim(),
                  schedule: editWorkflowSchedule.trim() || null,
                }
              : w,
          ),
        )

        const currentWorkflow = localStorage.getItem("currentWorkflow")
        if (currentWorkflow) {
          const workflowData = JSON.parse(currentWorkflow)
          if (workflowData.dag_id === editingWorkflow.dag_id) {
            workflowData.name = editWorkflowName.trim()
            workflowData.schedule = editWorkflowSchedule.trim() || null
            localStorage.setItem("currentWorkflow", JSON.stringify(workflowData))
          }
        }

        setIsEditWorkflowModalOpen(false)
        setEditingWorkflow(null)
        setEditWorkflowName("")
        setEditWorkflowSchedule("")

        toast({
          title: "Success",
          description: `Workflow updated successfully`,
        })
      } else {
        throw new Error("Failed to update workflow")
      }
    } catch (error) {
      console.error("Error updating workflow:", error)
      toast({
        title: "Error",
        description: "Failed to update workflow",
        variant: "destructive",
      })
    }
  }

  // Function to truncate workflow name if longer than 12 characters
  const truncateWorkflowName = (name: string, maxLength = 12) => {
    if (name.length <= maxLength) {
      return name
    }
    return name.substring(0, maxLength) + "..."
  }
  useEffect(() => {
    const savedProject = localStorage.getItem("currentProject")
    if (savedProject) {
      const projectData = JSON.parse(savedProject)
      setProjectName(projectData.name)
      setProjectCreated(true)
      setIsProjectOpen(true)
    }
    loadWorkflows()
  }, [])

  const loadWorkflows = async () => {
    const dags = await fetchDAGs()
    if (dags) {
      setWorkflows(dags)
      console.log("Loaded workflows:", dags)
    }
  }

  const handleWorkflowCreated = () => {
    loadWorkflows()
    setIsWorkflowsOpen(true)
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    loadWorkflows()
  }

  const openProjectModal = () => {
    setIsProjectModalOpen(true)
  }

  const closeProjectModal = () => {
    setIsProjectModalOpen(false)
  }

  const handleSaveProjectName = (name: string) => {
    setProjectName(name)
    setProjectCreated(true)

    const projectData = {
      name: name,
      created_at: new Date().toISOString(),
    }
    localStorage.setItem("currentProject", JSON.stringify(projectData))

    closeProjectModal()
    setIsProjectOpen(true)
  }

  useEffect(() => {
    if (isCollapsed) {
      setIsProjectOpen(false)
      setIsWorkflowsOpen(false)
      setIsModuleOpen(false)
      setIsHelpOpen(false)
    }
  }, [isCollapsed])

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="relative h-full">
      <div
        className={cn(
          "border-r bg-gradient-to-b from-slate-50 to-white flex flex-col h-full shadow-md transition-all duration-300 overflow-hidden",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-rose-50 to-white flex-shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={isCollapsed ? "24" : "32"}
                    height={isCollapsed ? "22" : "30"}
                  >
                    <path
                      fill="#EA4B71"
                      fillRule="evenodd"
                      d="M27.2 16.4a3.2 3.2 0 0 1-3.1-2.4h-3.667a1.6 1.6 0 0 0-1.578 1.337l-.132.79A3.2 3.2 0 0 1 17.683 18a3.2 3.2 0 0 1 1.04 1.874l.132.789A1.6 1.6 0 0 0 20.433 22h.468a3.201 3.201 0 0 1 6.299.8 3.2 3.2 0 0 1-6.3.8h-.467a3.2 3.2 0 0 1-3.156-2.674l-.132-.789a1.6 1.6 0 0 0-1.578-1.337h-1.268a3.201 3.201 0 0 1-6.198 0H6.299A3.201 3.201 0 0 1 0 18a3.2 3.2 0 0 1 6.3-.8h1.8a3.201 3.201 0 0 1 6.2 0h1.267a1.6 1.6 0 0 0 1.578-1.337l.132-.79a3.2 3.2 0 0 1 3.156-2.673h3.668a3.201 3.201 0 0 1 6.299.8 3.2 3.2 0 0 1-3.2 3.2m0-1.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m-24 4.8a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m9.6-1.6a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0m12.8 4.8a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0"
                      clipRule="evenodd"
                    />
                  </svg>
                  {!isCollapsed && <span className="font-bold text-lg text-gray-800 tracking-wide">MI-WARE</span>}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                {isCollapsed ? "MI-WARE" : ""}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {!isCollapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-rose-50 hover:bg-white-100 hover:text-white-600 transition-all duration-200 shadow-sm rounded-full"
                    onClick={openProjectModal}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>
                  Create Project
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </div>

        {/* Sidebar Body */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <div className="pt-4 pb-2 px-3 space-y-1">
              {/* Project Name section */}
              {projectCreated && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={() => !isCollapsed && setIsProjectOpen(!isProjectOpen)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg transition-all duration-200 font-bold",
                          isCollapsed && "justify-center px-2",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Folder className="h-5 w-5 text-rose-500 ml-1 mr-3" />
                          {!isCollapsed && projectName}
                        </span>
                        {!isCollapsed && (
                          <ChevronDown
                            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                              isProjectOpen ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}>
                      {isCollapsed ? projectName : ""}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Project content */}
              {!isCollapsed && isProjectOpen && projectCreated && (
                <div className="space-y-1">
                  {/* Workflows */}
                  <Button
                    variant="ghost"
                    onClick={() => setIsWorkflowsOpen(!isWorkflowsOpen)}
                    className="w-full flex items-center justify-between pl-8 pr-4 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg transition-all duration-200 font-medium"
                  >
                    <span className="flex items-center gap-3">
                      <ActivitySquare className="h-5 w-5 text-rose-500" />
                      <span>Workflows</span>
                    </span>
                    <div className="flex items-center">
                      <div
                        className="h-6 w-6 mr-1 hover:bg-rose-100 rounded-full flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          openModal()
                        }}
                      >
                        <Plus className="h-4 w-4 text-rose-500" />
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                          isWorkflowsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </Button>

                  {/* Workflows content - Improved ScrollArea */}
                  {isWorkflowsOpen && (
                    <div className="pl-12 pr-2">
                      {workflows.length > 0 ? (
                        <ScrollArea className="h-80">
                          <div className="space-y-1 py-2 pr-4">
                            {workflows.map((workflow, index) => (
                              <div key={workflow.dag_id} className="group relative">
                                <Button
                                  variant="ghost"
                                  className="w-full flex items-center justify-start px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-rose-50 hover:to-rose-100 hover:text-rose-700 hover:shadow-sm rounded-lg transition-all duration-200 border border-transparent hover:border-rose-200"
                                  onClick={async () => {
                                    try {
                                      const workflowData = {
                                        name: workflow.name,
                                        dag_id: workflow.dag_id,
                                        created_at: workflow.created_at,
                                        project: projectName,
                                      }
                                      localStorage.setItem("currentWorkflow", JSON.stringify(workflowData))

                                      setActiveView("editor")

                                      // Try to load from MongoDB first
                                      try {
                                        const { loadWorkflowFromMongoDB } = await import(
                                          "@/services/workflow-position-service"
                                        )
                                        const mongoWorkflow = await loadWorkflowFromMongoDB(workflow.dag_id)

                                        if (
                                          mongoWorkflow &&
                                          mongoWorkflow.nodes &&
                                          mongoWorkflow.connections &&
                                          mongoWorkflow.metadata
                                        ) {
                                          console.log("Loading workflow from MongoDB via sidebar...")

                                          // Create a custom event with MongoDB data - include all workflow info
                                          const event = new CustomEvent("workflowSelected", {
                                            detail: {
                                              name: workflow.name,
                                              dag_id: workflow.dag_id,
                                              schedule: workflow.schedule,
                                              created_at: workflow.created_at,
                                              mongoData: mongoWorkflow,
                                            },
                                          })
                                          window.dispatchEvent(event)

                                          toast({
                                            title: "Workflow Loaded",
                                            description: `${workflow.name} has been loaded successfully from MongoDB.`,
                                          })
                                          return
                                        } else {
                                          console.warn("MongoDB data incomplete or missing:", mongoWorkflow)
                                        }
                                      } catch (mongoError) {
                                        console.warn(
                                          "Could not load from MongoDB, falling back to DAG API:",
                                          mongoError,
                                        )
                                      }

                                      // Fallback to original DAG API if MongoDB fails
                                      const response = await fetch(
                                        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"}/dags/${workflow.dag_id}`,
                                      )

                                      if (!response.ok) {
                                        throw new Error(`Failed to fetch workflow with ID ${workflow.dag_id}`)
                                      }

                                      const dagData = await response.json()

                                      // Ensure we include the workflow name in the event
                                      const event = new CustomEvent("workflowSelected", {
                                        detail: {
                                          ...dagData,
                                          name: workflow.name, // Ensure name is included
                                        },
                                      })
                                      window.dispatchEvent(event)

                                      toast({
                                        title: "Workflow Loaded",
                                        description: `${workflow.name} has been loaded successfully from DAG API.`,
                                      })
                                    } catch (error) {
                                      console.error("Error loading workflow:", error)
                                      toast({
                                        title: "Error",
                                        description: `Failed to load workflow: ${error instanceof Error ? error.message : "Unknown error"}`,
                                        variant: "destructive",
                                      })
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="relative">
                                      <FileText className="h-4 w-4 text-rose-500 transition-colors duration-200 group-hover:text-rose-600" />
                                      <div className="absolute -inset-1 bg-rose-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span className="block truncate">
                                                {truncateWorkflowName(workflow.name)}
                                              </span>
                                            </TooltipTrigger>
                                            {workflow.name.length > 12 && (
                                              <TooltipContent side="right" sideOffset={5}>
                                                {workflow.name}
                                              </TooltipContent>
                                            )}
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                      {workflow.created_at && (
                                        <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                          {new Date(workflow.created_at).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </Button>

                                {/* Edit button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 h-6 w-6"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    setEditingWorkflow(workflow)
                                    setEditWorkflowName(workflow.name)
                                    setEditWorkflowSchedule(workflow.schedule || "")
                                    setIsEditWorkflowModalOpen(true)
                                  }}
                                >
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                  </svg>
                                </Button>

                                {index < workflows.length - 1 && (
                                  <div className="mx-3 h-px bg-gradient-to-r from-transparent via-rose-100 to-transparent"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-3">
                            <ActivitySquare className="h-6 w-6 text-rose-300" />
                          </div>
                          <div className="text-sm text-gray-500 font-medium mb-1">No workflows yet</div>
                          <div className="text-xs text-gray-400">Click + to create your first workflow</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Other sections */}
                  <Button
                    variant="ghost"
                    className="w-full flex items-center pl-8 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg font-medium transition-all duration-200"
                  >
                    <FileText className="h-5 w-5 text-rose-500 mr-3" />
                    <span>Service Descriptors</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full flex items-center pl-8 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg font-medium transition-all duration-200"
                  >
                    <Folder className="h-5 w-5 text-rose-500 mr-3" />
                    <span>Resources</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full flex items-center pl-8 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg font-medium transition-all duration-200"
                  >
                    <Layers className="h-5 w-5 text-rose-500 mr-3" />
                    <span>Schemas</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full flex items-center pl-8 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg font-medium transition-all duration-200"
                  >
                    <Shield className="h-5 w-5 text-rose-500 mr-3" />
                    <span>Policies</span>
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setIsModuleOpen(!isModuleOpen)}
                    className="w-full flex items-center justify-between pl-8 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg transition-all duration-200 font-medium"
                  >
                    <span className="flex items-center gap-3">
                      <Folder className="h-5 w-5 text-rose-500 mr-3" />
                      <span>Module Descriptors</span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                        isModuleOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>

                  {isModuleOpen && (
                    <div className="pl-14 space-y-1">
                      {[
                        { label: "Overview", icon: FileText },
                        { label: "Module Properties", icon: Settings },
                        { label: "Dependencies", icon: Plug },
                        { label: "Components", icon: Puzzle },
                        { label: "Shared Variables", icon: Variable },
                      ].map((item, idx) => (
                        <Button
                          key={idx}
                          variant="ghost"
                          className="w-full flex items-center pl-8 pr-4 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg transition-all duration-200"
                        >
                          <item.icon className="h-4 w-4 text-rose-500 mr-3" />
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* No project created view */}
              {!projectCreated && !isCollapsed && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                    <Folder className="h-8 w-8 text-rose-300" />
                  </div>
                  <h3 className="text-gray-600 font-medium mb-2">No Project Created</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Click the + button above to create a new project and start building workflows
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Help Section */}
          <div className="border-t bg-white flex-shrink-0">
            {isCollapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-center px-2 py-4 text-gray-700 hover:bg-amber-50 hover:text-amber-500 transition-colors duration-200"
                    >
                      <HelpCircle className="h-5 w-5 text-amber-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={5}>
                    Help & Support
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setIsHelpOpen(!isHelpOpen)}
                  className="w-full flex items-center justify-between px-5 py-4 text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">Help & Support</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isHelpOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
                {isHelpOpen && (
                  <div className="animate-slide-down px-3 py-2 bg-amber-50 bg-opacity-30 text-sm text-gray-600 space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left pl-10 py-2 hover:bg-white hover:shadow-sm rounded-lg"
                    >
                      Documentation
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left pl-10 py-2 hover:bg-white hover:shadow-sm text-rose-500 font-medium"
                    >
                      Contact Support
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collapse Button */}
      <div
        onClick={handleCollapse}
        className={cn(
          "absolute top-1/2 transform -translate-y-1/2 h-20 flex items-center cursor-pointer z-10 transition-all duration-300",
          isCollapsed ? "right-0" : "right-0",
        )}
      >
        <div className="relative">
          <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-rose-200 to-transparent"></div>
          <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-rose-400 to-rose-500 rounded-full shadow-md transform translate-x-2 hover:from-rose-500 hover:to-rose-600 transition-all duration-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("text-white transition-transform duration-300", isCollapsed ? "rotate-180" : "")}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-6 h-6"></div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10} className="bg-rose-500 text-white border-rose-600">
                {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Workflow Modal */}
      <WorkflowModal
        isOpen={isModalOpen}
        onClose={() => {
          closeModal()
          handleWorkflowCreated()
        }}
      />

      {/* Project Name Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 transform transition-all">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                id="projectName"
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="Enter project name"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeProjectModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById("projectName") as HTMLInputElement
                  if (input && input.value.trim()) {
                    handleSaveProjectName(input.value.trim())
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-md hover:bg-rose-600 transition-colors duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Workflow Modal */}
      {isEditWorkflowModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 transform transition-all">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Workflow</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Name</label>
                <input
                  type="text"
                  value={editWorkflowName}
                  onChange={(e) => setEditWorkflowName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (Cron Expression)</label>
                <input
                  type="text"
                  value={editWorkflowSchedule}
                  onChange={(e) => setEditWorkflowSchedule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g., 0 0 * * * (daily at midnight) or leave empty"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for manual execution only. Use cron format for scheduled execution.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsEditWorkflowModalOpen(false)
                  setEditingWorkflow(null)
                  setEditWorkflowName("")
                  setEditWorkflowSchedule("")
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateWorkflow}
                disabled={!editWorkflowName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-md hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
