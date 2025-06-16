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

  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")

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

  const handleDeleteWorkflow = async (workflow: DAG) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete the workflow "${workflow.name}"? This action cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    try {
      const { deleteWorkflowFromMongoDB } = await import("@/services/workflow-position-service")
      const success = await deleteWorkflowFromMongoDB(workflow.dag_id)

      if (success) {
        // Remove from local state
        setWorkflows((prev) => prev.filter((w) => w.dag_id !== workflow.dag_id))

        // Clear current workflow if it's the one being deleted
        const currentWorkflow = localStorage.getItem("currentWorkflow")
        if (currentWorkflow) {
          const workflowData = JSON.parse(currentWorkflow)
          if (workflowData.dag_id === workflow.dag_id) {
            localStorage.removeItem("currentWorkflow")
            localStorage.removeItem("workflowData")
            // Optionally clear the canvas if this workflow is currently open
            setActiveView("editor") // Refresh the editor view
          }
        }

        toast({
          title: "Success",
          description: `Workflow "${workflow.name}" has been deleted successfully`,
        })
      } else {
        throw new Error("Failed to delete workflow from database")
      }
    } catch (error) {
      console.error("Error deleting workflow:", error)
      toast({
        title: "Error",
        description: "Failed to delete workflow. Please try again.",
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
    setIsCreateCollectionModalOpen(true)
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
                    onClick={() => {
                      setIsWorkflowsOpen(!isWorkflowsOpen)
                      // Force refresh collections when expanding
                      if (!isWorkflowsOpen) {
                        const event = new CustomEvent("refreshCollections")
                        window.dispatchEvent(event)
                      }
                    }}
                    className="w-full flex items-center justify-between pl-8 pr-4 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg transition-all duration-200 font-medium"
                  >
                    <span className="flex items-center gap-3">
                      <ActivitySquare className="h-5 w-5 text-rose-500" />
                      <span>Projects</span>
                    </span>
                    <div className="flex items-center">
                      <div
                        className="h-6 w-6 mr-1 hover:bg-rose-100 rounded-full flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsCreateCollectionModalOpen(true)
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

                  {/* Projects content - Collections and Workflows */}
                  {isWorkflowsOpen && (
                    <div className="pl-12 pr-2">
                      {/* Collections section */}
                      {/* Collections Section Component */}
                      <CollectionsSection setActiveView={setActiveView} />
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
        collectionName="mi_ware" // Default collection
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

      {/* Create Collection Modal */}
      {isCreateCollectionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 transform transition-all">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Collection</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection Name</label>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="Enter collection name"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsCreateCollectionModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newCollectionName.trim()) return

                  try {
                    const response = await fetch(
                      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"}/mongo/create_collection/${newCollectionName.trim()}`,
                      { method: "POST" },
                    )

                    if (!response.ok) {
                      throw new Error(`Failed to create collection: ${response.status}`)
                    }

                    toast({
                      title: "Success",
                      description: `Collection "${newCollectionName}" created successfully`,
                    })

                    setNewCollectionName("")
                    setIsCreateCollectionModalOpen(false)

                    // Refresh collections in the CollectionsSection
                    const event = new CustomEvent("refreshCollections")
                    window.dispatchEvent(event)
                  } catch (error) {
                    console.error("Error creating collection:", error)
                    toast({
                      title: "Error",
                      description: "Failed to create collection",
                      variant: "destructive",
                    })
                  }
                }}
                disabled={!newCollectionName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-md hover:bg-rose-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Collections Section Component
const CollectionsSection = ({ setActiveView }: { setActiveView: (view: string) => void }) => {
  const [collections, setCollections] = useState<string[]>([])
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({})
  const [collectionWorkflows, setCollectionWorkflows] = useState<Record<string, DAG[]>>({})
  const [isCreateWorkflowModalOpen, setIsCreateWorkflowModalOpen] = useState(false)
  const [currentCollection, setCurrentCollection] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Fetch collections on component mount
  useEffect(() => {
    fetchCollections()

    // Listen for refresh events
    const handleRefresh = () => {
      console.log("Refresh collections event received")
      fetchCollections()
    }

    window.addEventListener("refreshCollections", handleRefresh)

    return () => {
      window.removeEventListener("refreshCollections", handleRefresh)
    }
  }, [])

  // Fetch collections from API
  const fetchCollections = async () => {
    setIsLoading(true)
    try {
      console.log("Fetching collections from MongoDB...")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"}/mongo/get_collections`,
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch collections: ${response.status}`)
      }

      const data = await response.json()
      console.log("Raw collections response:", data)

      // Handle different response formats
      let collectionsArray = []
      if (Array.isArray(data)) {
        collectionsArray = data
      } else if (data && Array.isArray(data.collections)) {
        collectionsArray = data.collections
      } else if (data && typeof data === "object") {
        // If it's an object, try to extract collection names
        collectionsArray = Object.keys(data)
      }

      console.log("Processed collections:", collectionsArray)
      setCollections(collectionsArray)
    } catch (error) {
      console.error("Error fetching collections:", error)
      toast({
        title: "Error",
        description: "Failed to fetch collections from MongoDB",
        variant: "destructive",
      })
      setCollections([])
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a collection
  const deleteCollection = async (collectionName: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete the collection "${collectionName}"? This will delete all workflows in this collection and cannot be undone.`,
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"}/mongo/delete_collection/${collectionName}`,
        { method: "DELETE" },
      )

      if (!response.ok) {
        throw new Error(`Failed to delete collection: ${response.status}`)
      }

      // Refresh collections list
      fetchCollections()

      // Remove from expanded state
      const newExpandedCollections = { ...expandedCollections }
      delete newExpandedCollections[collectionName]
      setExpandedCollections(newExpandedCollections)

      // Remove from workflows state
      const newCollectionWorkflows = { ...collectionWorkflows }
      delete newCollectionWorkflows[collectionName]
      setCollectionWorkflows(newCollectionWorkflows)

      toast({
        title: "Success",
        description: `Collection "${collectionName}" deleted successfully`,
      })
    } catch (error) {
      console.error("Error deleting collection:", error)
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive",
      })
    }
  }

  // Toggle collection expansion
  const toggleCollection = async (collectionName: string) => {
    const newExpandedState = !expandedCollections[collectionName]
    setExpandedCollections({
      ...expandedCollections,
      [collectionName]: newExpandedState,
    })

    // Set current collection context when expanding
    if (newExpandedState) {
      localStorage.setItem("currentCollection", collectionName)
      console.log(`[Sidebar] Set current collection to: ${collectionName}`)
    }

    // Fetch workflows for this collection if expanding
    if (newExpandedState && !collectionWorkflows[collectionName]) {
      try {
        console.log(`Fetching workflows for collection: ${collectionName}`)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"}/mongo/get_data_from_collection_with_dag_id/${collectionName}`,
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch workflows: ${response.status}`)
        }

        const data = await response.json()
        console.log(`Workflows for ${collectionName}:`, data)

        // Extract workflow data from MongoDB documents
        const workflows = data.map((item: any) => ({
          name: item.metadata?.name || "Unnamed Workflow",
          dag_id: item.metadata?.dag_id || "",
          created_at: item.metadata?.created_at || new Date().toISOString(),
          schedule: item.metadata?.schedule || null,
        }))

        setCollectionWorkflows({
          ...collectionWorkflows,
          [collectionName]: workflows,
        })
      } catch (error) {
        console.error(`Error fetching workflows for collection ${collectionName}:`, error)
        toast({
          title: "Error",
          description: `Failed to fetch workflows for ${collectionName}`,
          variant: "destructive",
        })
      }
    }
  }

  // Delete a workflow from a collection
  const deleteWorkflow = async (collectionName: string, dagId: string, workflowName: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete the workflow "${workflowName}"? This action cannot be undone.`,
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"}/mongo/delete_data_with_dag_id/${collectionName}?dag_id=${dagId}`,
        { method: "DELETE" },
      )

      if (!response.ok) {
        throw new Error(`Failed to delete workflow: ${response.status}`)
      }

      // Update workflows list for this collection
      if (collectionWorkflows[collectionName]) {
        setCollectionWorkflows({
          ...collectionWorkflows,
          [collectionName]: collectionWorkflows[collectionName].filter((w) => w.dag_id !== dagId),
        })
      }

      // Clear current workflow if it's the one being deleted
      const currentWorkflow = localStorage.getItem("currentWorkflow")
      if (currentWorkflow) {
        const workflowData = JSON.parse(currentWorkflow)
        if (workflowData.dag_id === dagId) {
          localStorage.removeItem("currentWorkflow")
          localStorage.removeItem("workflowData")
        }
      }

      toast({
        title: "Success",
        description: `Workflow "${workflowName}" deleted successfully`,
      })
    } catch (error) {
      console.error("Error deleting workflow:", error)
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      })
    }
  }

  // Open create workflow modal for a specific collection
  const openCreateWorkflowModal = (collectionName: string) => {
    setCurrentCollection(collectionName)
    localStorage.setItem("currentCollection", collectionName)
    console.log(`[Sidebar] Set current collection for new workflow: ${collectionName}`)
    setIsCreateWorkflowModalOpen(true)
  }

  // Load a workflow from a collection
  const loadWorkflow = async (collectionName: string, workflow: DAG) => {
    try {
      // Store the collection name with the workflow data
      const workflowData = {
        name: workflow.name,
        dag_id: workflow.dag_id,
        created_at: workflow.created_at,
        collection: collectionName,
      }
      localStorage.setItem("currentWorkflow", JSON.stringify(workflowData))

      // Set the current collection context
      localStorage.setItem("currentCollection", collectionName)
      console.log(`[Sidebar] Set current collection to: ${collectionName}`)

      // Try to load from MongoDB
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"}/mongo/get_data_from_collection_with_dag_id/${collectionName}?dag_id=${workflow.dag_id}`,
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch workflow: ${response.status}`)
      }

      const data = await response.json()
      if (data && data.length > 0) {
        const workflowDoc = data[0]

        // Create a custom event with MongoDB data
        const event = new CustomEvent("workflowSelected", {
          detail: {
            name: workflow.name,
            dag_id: workflow.dag_id,
            schedule: workflow.schedule,
            created_at: workflow.created_at,
            collection: collectionName,
            mongoData: workflowDoc,
          },
        })
        window.dispatchEvent(event)

        toast({
          title: "Workflow Loaded",
          description: `${workflow.name} has been loaded from ${collectionName}`,
        })

        // Set active view to editor
        setActiveView("editor")
      }
    } catch (error) {
      console.error("Error loading workflow:", error)
      toast({
        title: "Error",
        description: "Failed to load workflow",
        variant: "destructive",
      })
    }
  }

  // Truncate text if longer than maxLength
  const truncateText = (text: string, maxLength = 12) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  console.log("CollectionsSection render - collections state:", collections, "length:", collections.length)

  return (
    <>
      {collections.length > 0 ? (
        <ScrollArea className="h-80">
          <div className="space-y-1 py-2 pr-4">
            {collections.map((collection) => (
              <div key={collection} className="mb-2">
                {/* Collection item */}
                <div className="group relative flex items-center">
                  <Button
                    variant="ghost"
                    onClick={() => toggleCollection(collection)}
                    className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg transition-all duration-200"
                  >
                    <span className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-rose-500" />
                      <span className="font-medium">{collection}</span>
                    </span>
                    <div className="flex items-center">
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                          expandedCollections[collection] ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </Button>

                  {/* Collection action buttons */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* Add workflow button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6 hover:bg-green-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        openCreateWorkflowModal(collection)
                      }}
                    >
                      <Plus className="h-3 w-3 text-green-600" />
                    </Button>

                    {/* Delete collection button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteCollection(collection)
                      }}
                    >
                      <svg className="h-3 w-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>

                {/* Workflows in collection */}
                {expandedCollections[collection] && (
                  <div className="ml-6 pl-2 border-l border-rose-100">
                    {collectionWorkflows[collection] && collectionWorkflows[collection].length > 0 ? (
                      collectionWorkflows[collection].map((workflow) => (
                        <div key={workflow.dag_id} className="group relative mt-1">
                          <Button
                            variant="ghost"
                            className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg transition-all duration-200 text-sm"
                            onClick={() => loadWorkflow(collection, workflow)}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-3.5 w-3.5 text-rose-500" />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="truncate max-w-[120px]">{truncateText(workflow.name)}</span>
                                  </TooltipTrigger>
                                  {workflow.name.length > 12 && (
                                    <TooltipContent side="right" sideOffset={5}>
                                      {workflow.name}
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </Button>

                          {/* Workflow action buttons */}
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {/* Delete workflow button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-5 w-5 hover:bg-red-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteWorkflow(collection, workflow.dag_id, workflow.name)
                              }}
                            >
                              <svg
                                className="h-2.5 w-2.5 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 py-2 px-3">No workflows in this collection</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-3">
            <Folder className="h-6 w-6 text-rose-300" />
          </div>
          <div className="text-sm text-gray-500 font-medium mb-1">No collections yet</div>
          <div className="text-xs text-gray-400">Click + to create your first collection</div>
        </div>
      )}

      {/* Create Workflow Modal */}
      {isCreateWorkflowModalOpen && (
        <WorkflowModal
          isOpen={isCreateWorkflowModalOpen}
          onClose={() => {
            setIsCreateWorkflowModalOpen(false)
            // Refresh workflows for the collection
            if (expandedCollections[currentCollection]) {
              toggleCollection(currentCollection)
            }
          }}
          collectionName={currentCollection}
        />
      )}
    </>
  )
}
