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
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import WorkflowModal from "@/components/Model"
import type { DAG } from "@/services/dagService"
import { useToast } from "@/components/ui/use-toast"

export function Sidebar({
  activeView,
  setActiveView,
}: {
  activeView: string
  setActiveView: (view: string) => void
}) {
  const [isWorkflowsOpen, setIsWorkflowsOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [workflows, setWorkflows] = useState<DAG[]>([])
  const { toast } = useToast()

  // Edit workflow state variables
  const [editingWorkflow, setEditingWorkflow] = useState<DAG | null>(null)
  const [isEditWorkflowModalOpen, setIsEditWorkflowModalOpen] = useState(false)
  const [editWorkflowName, setEditWorkflowName] = useState("")
  const [editWorkflowSchedule, setEditWorkflowSchedule] = useState("")
  const [editingCollection, setEditingCollection] = useState("")

  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{
    type: "collection" | "workflow"
    name: string
    id?: string
    collectionName?: string
  } | null>(null)

  const handleOpenDeleteModal = (item: {
    type: "collection" | "workflow"
    name: string
    id?: string
    collectionName?: string
  }) => {
    setItemToDelete(item)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)

    try {
      if (itemToDelete.type === "collection") {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"}/mongo/delete_collection/${itemToDelete.name}`,
          { method: "DELETE" },
        )

        if (!response.ok) {
          throw new Error(`Failed to delete collection: ${response.status}`)
        }
        toast({
          title: "Success",
          description: `Collection "${itemToDelete.name}" deleted successfully`,
        })
      } else if (itemToDelete.type === "workflow" && itemToDelete.id && itemToDelete.collectionName) {
        const { collectionName, id: dagId, name: workflowName } = itemToDelete
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"}/mongo/delete_data_with_dag_id/${collectionName}?dag_id=${dagId}`,
          { method: "DELETE" },
        )

        if (!response.ok) {
          throw new Error(`Failed to delete workflow: ${response.status}`)
        }

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
      }
      // Refresh collections list after any deletion
      window.dispatchEvent(new CustomEvent("refreshCollections"))
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: `Failed to delete ${itemToDelete.type}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
      setItemToDelete(null)
    }
  }

  // Update workflow function adapted for collections
  const handleUpdateWorkflow = async () => {
    if (!editingWorkflow) return

    try {
      const { updateDagNameAndSchedule } = await import("@/services/file-conversion-service")
      const updatedDAG = await updateDagNameAndSchedule(editingWorkflow.dag_id, {
        name: editWorkflowName.trim(),
        schedule: editWorkflowSchedule.trim() || null,
      })

      if (updatedDAG) {
        // Update workflows in collection context
        if (editingCollection) {
          // Trigger refresh of collections to get updated data
          const event = new CustomEvent("refreshCollections")
          window.dispatchEvent(event)
        }

        // Update localStorage if this is the current workflow
        const currentWorkflow = localStorage.getItem("currentWorkflow")
        if (currentWorkflow) {
          const workflowData = JSON.parse(currentWorkflow)
          if (workflowData.dag_id === editingWorkflow.dag_id) {
            workflowData.name = editWorkflowName.trim()
            workflowData.schedule = editWorkflowSchedule.trim() || null
            localStorage.setItem("currentWorkflow", JSON.stringify(workflowData))
          }
        }

        // Reset edit state
        setIsEditWorkflowModalOpen(false)
        setEditingWorkflow(null)
        setEditWorkflowName("")
        setEditWorkflowSchedule("")
        setEditingCollection("")

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

  

  

  useEffect(() => {
    if (isCollapsed) {
      setIsProjectOpen(false)
      setIsWorkflowsOpen(false)
      setIsHelpOpen(false)
    }
  }, [isCollapsed])

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="relative h-full">
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
          transition: all 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: rgba(148, 163, 184, 0.7);
        }
        
        /* Firefox scrollbar styling */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
        }
        
        /* Nested scrollbar for workflows */
        .workflow-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .workflow-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .workflow-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.2);
          border-radius: 2px;
          transition: all 0.2s ease;
        }
        
        .workflow-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.4);
        }
        
        .workflow-scrollbar::-webkit-scrollbar-thumb:active {
          background: rgba(239, 68, 68, 0.6);
        }
        
        .workflow-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(239, 68, 68, 0.2) transparent;
        }
      `}</style>

      <div
        className={cn(
          "border-r border-gray-200 bg-gray-50 flex flex-col h-full shadow-lg transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-72",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                  <div className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={isCollapsed ? "28" : "32"}
                      height={isCollapsed ? "28" : "32"}
                      className="text-blue-600 drop-shadow-sm"
                    >
                      <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M27.2 16.4a3.2 3.2 0 0 1-3.1-2.4h-3.667a1.6 1.6 0 0 0-1.578 1.337l-.132.79A3.2 3.2 0 0 1 17.683 18a3.2 3.2 0 0 1 1.04 1.874l.132.789A1.6 1.6 0 0 0 20.433 22h.468a3.201 3.201 0 0 1 6.299.8 3.2 3.2 0 0 1-6.3.8h-.467a3.2 3.2 0 0 1-3.156-2.674l-.132-.789a1.6 1.6 0 0 0-1.578-1.337h-1.268a3.201 3.201 0 0 1-6.198 0H6.299A3.201 3.201 0 0 1 0 18a3.2 3.2 0 0 1 6.3-.8h1.8a3.201 3.201 0 0 1 6.2 0h1.267a1.6 1.6 0 0 0 1.578-1.337l.132-.79a3.2 3.2 0 0 1 3.156-2.673h3.668a3.201 3.201 0 0 1 6.299.8 3.2 3.2 0 0 1-3.2 3.2m0-1.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m-24 4.8a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m9.6-1.6a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0m12.8 4.8a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className="font-bold text-xl tracking-wide text-gray-800">MI-WARE</div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5} className="bg-gray-800 text-gray-50 border-gray-700">
                {isCollapsed ? "MI-WARE" : ""}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Sidebar Body */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <div className="pt-6 pb-4 px-4 space-y-2 custom-scrollbar">
              

              <div className="space-y-2 px-2">
                {/* Projects */}
                <div>
                  <div
                    className="w-full flex items-center justify-between py-2 px-3 text-gray-700 rounded-md transition-all duration-200 font-semibold"
                  >
                    <span className="flex items-center gap-3">
                      <ActivitySquare className="h-5 w-5 text-blue-500" />
                      <span>Projects</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-7 w-7 hover:bg-green-100 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 group/add"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsCreateCollectionModalOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4 text-green-500 group-hover/add:text-green-600" />
                      </div>
                    </div>
                  </div>

                  {/* Projects content - Collections and Workflows */}
                  <div className="pl-4 pr-2 pt-2">
                    <CollectionsSection
                      setActiveView={setActiveView}
                      onEditWorkflow={(workflow: DAG, collection: string) => {
                        setEditingWorkflow(workflow)
                        setEditWorkflowName(workflow.name)
                        setEditWorkflowSchedule(workflow.schedule || "")
                        setEditingCollection(collection)
                        setIsEditWorkflowModalOpen(true)
                      }}
                      onDelete={handleOpenDeleteModal}
                    />
                  </div>
                </div>
              </div>

              

              
            </div>
          </ScrollArea>

          {/* Help Section */}
          <div className="border-t border-gray-200 bg-gray-50 p-2">
            {isCollapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-center py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-all duration-200 group"
                    >
                      <HelpCircle className="h-5 w-5 text-blue-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={5} className="bg-gray-800 text-gray-50 border-gray-700">
                    Help & Support
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsHelpOpen(!isHelpOpen)}
                  className="w-full flex items-center justify-between py-2 px-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-all duration-200 font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                    <span>Help & Support</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-all duration-300 ${
                      isHelpOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
                {isHelpOpen && (
                  <div className="pt-2 space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-all duration-200 text-gray-600"
                    >
                      Documentation
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left px-3 py-2 hover:bg-gray-100 rounded-md font-medium text-blue-600 transition-all duration-200"
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
          "absolute top-1/2 -translate-y-1/2 h-20 flex items-center cursor-pointer z-10 transition-all duration-300",
          isCollapsed ? "-right-4" : "-right-4",
        )}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition-all duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("text-gray-600 transition-transform duration-300", isCollapsed ? "rotate-180" : "")}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
      </div>

      {/* MODALS */}

      {/* Enhanced Edit Workflow Modal */}
      {isEditWorkflowModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 transform transition-all animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <ActivitySquare className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">Edit Workflow</h3>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Workflow Name</label>
                <input
                  type="text"
                  value={editWorkflowName}
                  onChange={(e) => setEditWorkflowName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Schedule (Cron Expression)</label>
                <input
                  type="text"
                  value={editWorkflowSchedule}
                  onChange={(e) => setEditWorkflowSchedule(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                  placeholder="e.g., 0 0 * * * (daily at midnight) or leave empty"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Leave empty for manual execution only. Use cron format for scheduled execution.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => {
                  setIsEditWorkflowModalOpen(false)
                  setEditingWorkflow(null)
                  setEditWorkflowName("")
                  setEditWorkflowSchedule("")
                  setEditingCollection("")
                }}
                className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200 hover:shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateWorkflow}
                disabled={!editWorkflowName.trim()}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:shadow-lg"
              >
                Update Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Collection Modal */}
      {isCreateCollectionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 transform transition-all animate-in zoom-in-95 duration-300 border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-800 mb-6">Create New Collection</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Collection Name</label>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 shadow-sm"
                placeholder="Enter collection name"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setIsCreateCollectionModalOpen(false)}
                className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200 hover:shadow-sm"
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
                    window.dispatchEvent(new CustomEvent("refreshCollections"))
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
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 transform transition-all animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">
                {itemToDelete.type === "collection" ? "Delete Collection" : "Delete Workflow"}
              </h3>
            </div>
            <div className="mb-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                {itemToDelete.type === "collection"
                  ? `Are you sure you want to delete the collection "${itemToDelete.name}"? This will delete all workflows in this collection and cannot be undone.`
                  : `Are you sure you want to delete the workflow "${itemToDelete.name}"? This action cannot be undone.`}
              </p>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200 hover:shadow-sm"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-xl hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:shadow-lg"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Collections Section Component
const CollectionsSection = ({
  setActiveView,
  onEditWorkflow,
  onDelete,
}: {
  setActiveView: (view: string) => void
  onEditWorkflow: (workflow: DAG, collection: string) => void
  onDelete: (item: {
    type: "collection" | "workflow"
    name: string
    id?: string
    collectionName?: string
  }) => void
}) => {
  const [collections, setCollections] = useState<string[]>([])
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({})
  const [collectionWorkflows, setCollectionWorkflows] = useState<Record<string, DAG[]>>({})
  const [isCreateWorkflowModalOpen, setIsCreateWorkflowModalOpen] = useState(false)
  const [currentCollection, setCurrentCollection] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Fetch collections on component mount and on refresh event
  useEffect(() => {
    const handleRefresh = () => fetchCollections()
    handleRefresh() // Initial fetch

    window.addEventListener("refreshCollections", handleRefresh)
    return () => window.removeEventListener("refreshCollections", handleRefresh)
  }, [])

  // Fetch collections from API
  const fetchCollections = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"}/mongo/get_collections`,
      )
      if (!response.ok) throw new Error(`Failed to fetch collections: ${response.status}`)

      const data = await response.json()
      const collectionsArray = Array.isArray(data)
        ? data
        : data && Array.isArray(data.collections)
          ? data.collections
          : []
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

  // Set up deletion confirmation by calling parent
  const deleteCollection = (collectionName: string) => {
    onDelete({ type: "collection", name: collectionName })
  }

  const deleteWorkflow = (collectionName: string, dagId: string, workflowName: string) => {
    onDelete({ type: "workflow", name: workflowName, id: dagId, collectionName })
  }

  // Toggle collection expansion
  const toggleCollection = async (collectionName: string) => {
    const isCurrentlyExpanded = !!expandedCollections[collectionName]
    const newExpandedState = { ...expandedCollections, [collectionName]: !isCurrentlyExpanded }
    setExpandedCollections(newExpandedState)

    if (!isCurrentlyExpanded) {
      localStorage.setItem("currentCollection", collectionName)
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"}/mongo/get_data_from_collection_with_dag_id/${collectionName}`,
        )
        if (!response.ok) throw new Error(`Failed to fetch workflows: ${response.status}`)

        const data = await response.json()
        const workflows = data.map((item: any) => ({
          name: item.metadata?.name || "Unnamed Workflow",
          dag_id: item.metadata?.dag_id || "",
          created_at: item.metadata?.created_at || new Date().toISOString(),
          schedule: item.metadata?.schedule || null,
        }))
        setCollectionWorkflows((prev) => ({ ...prev, [collectionName]: workflows }))
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

  // Open create workflow modal for a specific collection
  const openCreateWorkflowModal = (collectionName: string) => {
    setCurrentCollection(collectionName)
    localStorage.setItem("currentCollection", collectionName)
    setIsCreateWorkflowModalOpen(true)
  }

  // Load a workflow from a collection
  const loadWorkflow = async (collectionName: string, workflow: DAG) => {
    try {
      const workflowData = {
        name: workflow.name,
        dag_id: workflow.dag_id,
        created_at: workflow.created_at,
        collection: collectionName,
      }
      localStorage.setItem("currentWorkflow", JSON.stringify(workflowData))
      localStorage.setItem("currentCollection", collectionName)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"}/mongo/get_data_from_collection_with_dag_id/${collectionName}?dag_id=${workflow.dag_id}`,
      )
      if (!response.ok) throw new Error(`Failed to fetch workflow: ${response.status}`)

      const data = await response.json()
      if (data && data.length > 0) {
        const event = new CustomEvent("workflowSelected", {
          detail: { ...workflow, collection: collectionName, mongoData: data[0] },
        })
        window.dispatchEvent(event)
        toast({
          title: "Workflow Loaded",
          description: `${workflow.name} has been loaded from ${collectionName}`,
        })
        setActiveView("editor")
      }
    } catch (error) {
      console.error("Error loading workflow:", error)
      toast({ title: "Error", description: "Failed to load workflow", variant: "destructive" })
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

  return (
    <div>
      {collections.length > 0 ? (
        <div className="space-y-1 py-2 pr-4 max-h-80 overflow-y-auto custom-scrollbar">
          {collections.map((collection) => (
            <div key={collection} className="mb-1">
              {/* Collection item */}
              <div className="group relative flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => toggleCollection(collection)}
                  className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm rounded-lg transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-black" />
                    <span className="font-medium">{collection}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      expandedCollections[collection] ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {/* Collection action buttons */}
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-1 h-6 w-6 hover:bg-green-100 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      openCreateWorkflowModal(collection)
                    }}
                  >
                    <Plus className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-1 h-6 w-6 hover:bg-red-100 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteCollection(collection)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>

              {/* Workflows in collection */}
              {expandedCollections[collection] && (
                <div className="pl-2 mt-1 border-l border-gray-200">
                  {collectionWorkflows[collection] && collectionWorkflows[collection].length > 0 ? (
                    <div className="space-y-1 max-h-40 overflow-y-auto workflow-scrollbar">
                      {collectionWorkflows[collection].map((workflow) => (
                        <div key={workflow.dag_id} className="group relative">
                          <Button
                            variant="ghost"
                            className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm rounded-lg transition-all duration-200 text-sm"
                            onClick={() => loadWorkflow(collection, workflow)}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-3.5 w-3.5 text-black" />
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
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="p-1 h-5 w-5 hover:bg-blue-100 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditWorkflow(workflow, collection)
                              }}
                            >
                              <svg
                                className="h-3 w-3 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="p-1 h-5 w-5 hover:bg-red-100 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteWorkflow(collection, workflow.dag_id, workflow.name)
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 py-2 px-3">No workflows in this collection</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
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
            window.dispatchEvent(new CustomEvent("refreshCollections"))
          }}
          collectionName={currentCollection}
        />
      )}
    </div>
  )
}
