"use client";

//sidebar.tsx
import { useState, useEffect } from "react";
import { ChevronDown, FileText, Folder, Layers, Shield, Settings, Plug, Puzzle, Variable, ActivitySquare, HelpCircle, Plus,} from "lucide-react";
import { Button } from "@/components/ui/button";
import {Tooltip,TooltipProvider,TooltipTrigger,TooltipContent,} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import WorkflowModal from "@/components/Model"; // Import the modal


export function Sidebar({
  activeView,
  setActiveView,
  fetchWorkflows: fetchWorkflowsProp,
}: {
  activeView: string;
  setActiveView: (view: string) => void;
}) {
  const [isProjectOpen, setIsProjectOpen] = useState(true);
  const [isWorkflowsOpen, setIsWorkflowsOpen] = useState(false);
  const [isModuleOpen, setIsModuleOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("Project Name");
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Function to handle opening the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to handle closing the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Function to handle opening the project modal
  const openProjectModal = () => {
    setIsProjectModalOpen(true);
  };

  // Function to handle closing the project modal
  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  // Function to handle saving the project name
  const handleSaveProjectName = (name: string) => {
    setProjectName(name);
    closeProjectModal();
    setIsProjectOpen(true); // Ensure the project section is open to show the submenus
  };

  // Auto-close all sections when sidebar collapses
  useEffect(() => {
    if (isCollapsed) {
      setIsProjectOpen(false);
      setIsWorkflowsOpen(false);
      setIsModuleOpen(false);
      setIsHelpOpen(false);
    }
  }, [isCollapsed])

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const baseurl = process.env.NEXT_PUBLIC_USER_API_END_POINT

  const fetchWorkflows = async () => {
    if (!isWorkflowsOpen) return

    setIsLoadingWorkflows(true)
    setWorkflowError(null)

    try {
      const response = await fetch(`${baseurl}/dags/`)

      if (!response.ok) {
        throw new Error(`Failed to fetch workflows: ${response.status}`)
      }

      const data = await response.json()
      setWorkflows(data)
    } catch (error) {
      console.error("Error fetching workflows:", error)
      setWorkflowError(error instanceof Error ? error.message : "Failed to load workflows")
    } finally {
      setIsLoadingWorkflows(false)
    }
  }

  useEffect(() => {
    if (isWorkflowsOpen) {
      fetchWorkflows()
    }
  }, [isWorkflowsOpen])

  return (
    <div className="relative h-full">
      <div
        className={cn(
          "border-r bg-gradient-to-b from-slate-50 to-white flex flex-col h-full shadow-md transition-all duration-300 overflow-hidden",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-rose-50 to-white">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isCollapsed && "justify-center"
                  )}
                >
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

        {/* Sidebar Body - Custom scrollbar styles */}
        <div className="flex-grow overflow-auto scrollbar-thin scrollbar-thumb-rose-200 scrollbar-track-transparent hover:scrollbar-thumb-rose-300">
          <div className="pt-4 pb-2 px-3 space-y-1">
            {/* Project Name (Collapsible) */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      !isCollapsed && setIsProjectOpen(!isProjectOpen)
                    }
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg transition-all duration-200 font-bold",
                      isCollapsed && "justify-center px-2"
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

            {/* Project content - only visible when Project is expanded */}
            {!isCollapsed && isProjectOpen && (
              <div className="space-y-1">
                {/* Main Navigation Items - All aligned with the same left margin */}
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
                        e.stopPropagation();
                        openModal();
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

                {/* Workflows content - only visible when Workflows is expanded */}
                {isWorkflowsOpen && (
                  <div className="pl-14 space-y-1">
                    {/* Add your workflow items here if needed */}
                  </div>
                )}

                {/* Service Descriptors */}
                <Button
                  variant="ghost"
                  className="w-full flex items-center pl-8 py-1 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg font-medium"
                >
                  <FileText className="h-5 w-5 text-rose-500 mr-3" />
                  <span>Service Descriptors</span>
                </Button>

                {/* Resources */}
                <Button
                  variant="ghost"
                  className="w-full flex items-center pl-8 py-1 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg font-medium"
                >
                  <Folder className="h-5 w-5 text-rose-500 mr-3" />
                  <span>Resources</span>
                </Button>

                {/* Schemas */}
                <Button
                  variant="ghost"
                  className="w-full flex items-center pl-8 py-1 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg font-medium"
                >
                  <Layers className="h-5 w-5 text-rose-500 mr-3" />
                  <span>Schemas</span>
                </Button>

                {/* Policies */}
                <Button
                  variant="ghost"
                  className="w-full flex items-center pl-8 py-1 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg font-medium"
                >
                  <Shield className="h-5 w-5 text-rose-500 mr-3" />
                  <span>Policies</span>
                </Button>

                {/* Module Descriptors at the same level as other items */}
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

                {/* Module Descriptors Items */}
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
                        className="w-full flex items-center pl-8 pr-4 py-1 text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm rounded-lg"
                      >
                        <item.icon className="h-4 w-4 text-rose-500 mr-3" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="border-t bg-white mt-auto">
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

      {/* Stylish Collapse Element */}
      <div
        onClick={handleCollapse}
        className={cn(
          "absolute top-1/2 transform -translate-y-1/2 h-20 flex items-center cursor-pointer z-10 transition-all duration-300",
          isCollapsed ? "right-0" : "right-0",
        )}
      >
        <div className="relative">
          {/* Decorative vertical line */}
          <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-rose-200 to-transparent"></div>

          {/* Circle toggle */}
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
              className={cn(
                "text-white transition-transform duration-300",
                isCollapsed ? "rotate-180" : ""
              )}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>

          {/* Tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-6 h-6"></div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={10}
                className="bg-rose-500 text-white border-rose-600"
              >
                {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Workflow Modal */}
      <WorkflowModal isOpen={isModalOpen} onClose={closeModal} />
      
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
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none "
                placeholder="Enter project name"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeProjectModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById('projectName') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    handleSaveProjectName(input.value.trim());
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md "
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}