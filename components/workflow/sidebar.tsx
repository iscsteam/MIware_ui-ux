
"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import WorkflowModal from "@/components/Model";
import { fetchDAGs } from "@/services/dagService";
import type { DAG } from "@/services/dagService";
import { useToast } from "@/components/ui/use-toast";

export function Sidebar({
  activeView,
  setActiveView,
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
  const [projectCreated, setProjectCreated] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [workflows, setWorkflows] = useState<DAG[]>([]);
  const { toast } = useToast();

  const [editingWorkflow, setEditingWorkflow] = useState<DAG | null>(null);
  const [isEditWorkflowModalOpen, setIsEditWorkflowModalOpen] = useState(false);
  const [editWorkflowName, setEditWorkflowName] = useState("");
  const [editWorkflowSchedule, setEditWorkflowSchedule] = useState("");

  const handleUpdateWorkflow = async () => {
    if (!editingWorkflow) return;

    try {
      const { updateDagNameAndSchedule } = await import(
        "@/services/file-conversion-service"
      );
      const updatedDAG = await updateDagNameAndSchedule(
        editingWorkflow.dag_id,
        {
          name: editWorkflowName.trim(),
          schedule: editWorkflowSchedule.trim() || null,
        }
      );

      if (updatedDAG) {
        setWorkflows((prev) =>
          prev.map((w) =>
            w.dag_id === editingWorkflow.dag_id
              ? {
                  ...w,
                  name: editWorkflowName.trim(),
                  schedule: editWorkflowSchedule.trim() || null,
                }
              : w
          )
        );

        const currentWorkflow = localStorage.getItem("currentWorkflow");
        if (currentWorkflow) {
          const workflowData = JSON.parse(currentWorkflow);
          if (workflowData.dag_id === editingWorkflow.dag_id) {
            workflowData.name = editWorkflowName.trim();
            workflowData.schedule = editWorkflowSchedule.trim() || null;
            localStorage.setItem(
              "currentWorkflow",
              JSON.stringify(workflowData)
            );
          }
        }

        setIsEditWorkflowModalOpen(false);
        setEditingWorkflow(null);
        setEditWorkflowName("");
        setEditWorkflowSchedule("");

        toast({
          title: "Success",
          description: `Workflow updated successfully`,
        });
      } else {
        throw new Error("Failed to update workflow");
      }
    } catch (error) {
      console.error("Error updating workflow:", error);
      toast({
        title: "Error",
        description: "Failed to update workflow",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const savedProject = localStorage.getItem("currentProject");
    if (savedProject) {
      const projectData = JSON.parse(savedProject);
      setProjectName(projectData.name);
      setProjectCreated(true);
      setIsProjectOpen(true);
    }
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    const dags = await fetchDAGs();
    if (dags) {
      setWorkflows(dags);
      console.log("Loaded workflows:", dags);
    }
  };

  const handleWorkflowCreated = () => {
    loadWorkflows();
    setIsWorkflowsOpen(true);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    loadWorkflows();
  };

  const openProjectModal = () => {
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  const handleSaveProjectName = (name: string) => {
    setProjectName(name);
    setProjectCreated(true);

    const projectData = {
      name: name,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem("currentProject", JSON.stringify(projectData));

    closeProjectModal();
    setIsProjectOpen(true);
  };

  useEffect(() => {
    if (isCollapsed) {
      setIsProjectOpen(false);
      setIsWorkflowsOpen(false);
      setIsModuleOpen(false);
      setIsHelpOpen(false);
    }
  }, [isCollapsed]);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="relative h-full">
      <div
        className={cn(
          "border-r border-slate-200/60 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex flex-col h-full shadow-xl shadow-slate-900/5 transition-all duration-500 ease-out overflow-hidden backdrop-blur-sm",
          isCollapsed ? "w-16" : "w-72"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/60 bg-white flex-shrink-0 relative overflow-hidden">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-teal-600/20 blur-xl"></div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center gap-3 relative z-10",
                    isCollapsed && "justify-center"
                  )}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-xl blur-md"></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={isCollapsed ? "28" : "36"}
                      height={isCollapsed ? "26" : "34"}
                      className="relative z-10 drop-shadow-lg"
                    >
                      <path
                        fill="purple"
                        fillRule="evenodd"
                        d="M27.2 16.4a3.2 3.2 0 0 1-3.1-2.4h-3.667a1.6 1.6 0 0 0-1.578 1.337l-.132.79A3.2 3.2 0 0 1 17.683 18a3.2 3.2 0 0 1 1.04 1.874l.132.789A1.6 1.6 0 0 0 20.433 22h.468a3.201 3.201 0 0 1 6.299.8 3.2 3.2 0 0 1-6.3.8h-.467a3.2 3.2 0 0 1-3.156-2.674l-.132-.789a1.6 1.6 0 0 0-1.578-1.337h-1.268a3.201 3.201 0 0 1-6.198 0H6.299A3.201 3.201 0 0 1 0 18a3.2 3.2 0 0 1 6.3-.8h1.8a3.201 3.201 0 0 1 6.2 0h1.267a1.6 1.6 0 0 0 1.578-1.337l.132-.79a3.2 3.2 0 0 1 3.156-2.673h3.668a3.201 3.201 0 0 1 6.299.8 3.2 3.2 0 0 1-3.2 3.2m0-1.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m-24 4.8a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m9.6-1.6a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0m12.8 4.8a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {!isCollapsed && (
                    <div className="relative z-10">
                      <div className="font-bold text-xl tracking-wide drop-shadow-lg text-black">
                        MI-WARE
                      </div>
                    </div>
                  )}
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
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300 shadow-lg rounded-xl relative z-10 group"
                    onClick={openProjectModal}
                  >
                    <Plus className="h-5 w-5 text-purple group-hover:scale-110 transition-transform duration-200" />
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
            <div className="pt-6 pb-4 px-4 space-y-2">
              {/* Project Name section */}
              {projectCreated && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          !isCollapsed && setIsProjectOpen(!isProjectOpen)
                        }
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 text-slate-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 hover:shadow-lg rounded-xl transition-all duration-300 font-semibold border border-transparent hover:border-indigo-200/50 group",
                          isCollapsed && "justify-center px-2"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <div className="relative">
                            <Folder className="h-5 w-5 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-200" />
                            <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          {!isCollapsed && <span className="truncate">{projectName}</span>}
                        </span>
                        {!isCollapsed && (
                          <ChevronDown
                            className={`h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-all duration-300 ${
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
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                  {/* Workflows */}
                  <Button
                    variant="ghost"
                    onClick={() => setIsWorkflowsOpen(!isWorkflowsOpen)}
                    className="w-full flex items-center justify-between pl-8 pr-4 py-3 text-slate-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 hover:shadow-lg rounded-xl transition-all duration-300 font-medium border border-transparent hover:border-emerald-200/50 group"
                  >
                    <span className="flex items-center gap-3">
                      <div className="relative">
                        <ActivitySquare className="h-5 w-5 text-emerald-500 group-hover:text-emerald-600 transition-colors duration-200" />
                        <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <span>Workflows</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <div
                        className="h-7 w-7 hover:bg-emerald-100 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 group/add"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal();
                        }}
                      >
                        <Plus className="h-4 w-4 text-emerald-500 group-hover/add:text-emerald-600 group-hover/add:scale-110 transition-all duration-200" />
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-all duration-300 ${
                          isWorkflowsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </Button>

                  {/* Workflows content */}
                  {isWorkflowsOpen && (
                    <div className="pl-12 pr-2 animate-in slide-in-from-top-2 duration-300">
                      {workflows.length > 0 ? (
                        <ScrollArea className="h-80">
                          <div className="space-y-2 py-3 pr-4">
                            {workflows.map((workflow, index) => (
                              <div
                                key={workflow.dag_id}
                                className="group relative"
                              >
                                <Button
                                  variant="ghost"
                                  className="w-full flex items-center justify-start px-4 py-3 text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md rounded-xl transition-all duration-300 border border-transparent hover:border-blue-200/50 transform hover:scale-[1.02]"
                                  onClick={async () => {
                                    try {
                                      const workflowData = {
                                        name: workflow.name,
                                        dag_id: workflow.dag_id,
                                        created_at: workflow.created_at,
                                        project: projectName,
                                      };
                                      localStorage.setItem(
                                        "currentWorkflow",
                                        JSON.stringify(workflowData)
                                      );

                                      setActiveView("editor");

                                      const response = await fetch(
                                        `${
                                          process.env.NEXT_PUBLIC_API_URL ||
                                          "http://localhost:30010"
                                        }/dags/${workflow.dag_id}`
                                      );

                                      if (!response.ok) {
                                        throw new Error(
                                          `Failed to fetch workflow with ID ${workflow.dag_id}`
                                        );
                                      }

                                      const dagData = await response.json();
                                      const event = new CustomEvent(
                                        "workflowSelected",
                                        { detail: dagData }
                                      );
                                      window.dispatchEvent(event);

                                      toast({
                                        title: "Workflow Loaded",
                                        description: `${workflow.name} has been loaded successfully.`,
                                      });
                                    } catch (error) {
                                      console.error(
                                        "Error loading workflow:",
                                        error
                                      );
                                      toast({
                                        title: "Error",
                                        description: `Failed to load workflow: ${
                                          error instanceof Error
                                            ? error.message
                                            : "Unknown error"
                                        }`,
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="relative">
                                      <FileText className="h-4 w-4 text-blue-500 transition-colors duration-200 group-hover:text-blue-600" />
                                      <div className="absolute -inset-1 bg-blue-100 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate text-sm font-medium">
                                        {workflow.name}
                                      </div>
                                      {workflow.created_at && (
                                        <div className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                          {new Date(
                                            workflow.created_at
                                          ).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </Button>

                                {/* Edit button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 p-1 h-7 w-7 hover:bg-blue-100 rounded-lg"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setEditingWorkflow(workflow);
                                    setEditWorkflowName(workflow.name);
                                    setEditWorkflowSchedule(
                                      workflow.schedule || ""
                                    );
                                    setIsEditWorkflowModalOpen(true);
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

                                {index < workflows.length - 1 && (
                                  <div className="mx-4 mt-2 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl border border-slate-200/50">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-3 shadow-sm">
                            <ActivitySquare className="h-6 w-6 text-blue-400" />
                          </div>
                          <div className="text-sm text-slate-600 font-medium mb-1">
                            No workflows yet
                          </div>
                          <div className="text-xs text-slate-500">
                            Click + to create your first workflow
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Other sections */}
                  {[
                    { label: "Service Descriptors", icon: FileText, color: "rose" },
                    { label: "Resources", icon: Folder, color: "amber" },
                    { label: "Schemas", icon: Layers, color: "violet" },
                    { label: "Policies", icon: Shield, color: "orange" },
                  ].map((item, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      className={`w-full flex items-center pl-8 py-3 text-slate-700 hover:bg-gradient-to-r hover:from-${item.color}-50 hover:to-${item.color}-100/50 hover:text-${item.color}-700 hover:shadow-lg rounded-xl font-medium transition-all duration-300 border border-transparent hover:border-${item.color}-200/50 group`}
                    >
                      <div className="relative">
                        <item.icon className={`h-5 w-5 text-${item.color}-500 group-hover:text-${item.color}-600 mr-3 transition-colors duration-200`} />
                        <div className={`absolute inset-0 bg-${item.color}-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      </div>
                      <span>{item.label}</span>
                    </Button>
                  ))}

                  <Button
                    variant="ghost"
                    onClick={() => setIsModuleOpen(!isModuleOpen)}
                    className="w-full flex items-center justify-between pl-8 py-3 text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 hover:shadow-lg rounded-xl transition-all duration-300 font-medium border border-transparent hover:border-purple-200/50 group"
                  >
                    <span className="flex items-center gap-3">
                      <div className="relative">
                        <Folder className="h-5 w-5 text-purple-500 group-hover:text-purple-600 mr-3 transition-colors duration-200" />
                        <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <span>Module Descriptors</span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 group-hover:text-purple-500 transition-all duration-300 ${
                        isModuleOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>

                  {isModuleOpen && (
                    <div className="pl-14 space-y-1 animate-in slide-in-from-top-2 duration-300">
                      {[
                        { label: "Overview", icon: FileText, color: "blue" },
                        { label: "Module Properties", icon: Settings, color: "green" },
                        { label: "Dependencies", icon: Plug, color: "red" },
                        { label: "Components", icon: Puzzle, color: "yellow" },
                        { label: "Shared Variables", icon: Variable, color: "indigo" },
                      ].map((item, idx) => (
                        <Button
                          key={idx}
                          variant="ghost"
                          className={`w-full flex items-center pl-8 pr-4 py-2.5 text-slate-700 hover:bg-gradient-to-r hover:from-${item.color}-50 hover:to-${item.color}-100/50 hover:text-${item.color}-700 hover:shadow-md rounded-lg transition-all duration-300 group`}
                        >
                          <div className="relative">
                            <item.icon className={`h-4 w-4 text-${item.color}-500 group-hover:text-${item.color}-600 mr-3 transition-colors duration-200`} />
                            <div className={`absolute inset-0 bg-${item.color}-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                          </div>
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* No project created view */}
              {!projectCreated && !isCollapsed && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 rounded-2xl border border-slate-200/50 shadow-sm">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <Folder className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h3 className="text-slate-700 font-semibold mb-2">
                    No Project Created
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Click the + button above to create a new project and start
                    building workflows
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Help Section */}
          <div className="border-t border-slate-200/60 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
            {isCollapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-center px-2 py-4 text-slate-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-600 transition-all duration-300 group"
                    >
                      <div className="relative">
                        <HelpCircle className="h-5 w-5 text-amber-500 group-hover:text-amber-600 transition-colors duration-200" />
                        <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
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
                  className="w-full flex items-center justify-between px-5 py-4 text-slate-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <HelpCircle className="h-5 w-5 text-amber-500 group-hover:text-amber-600 transition-colors duration-200" />
                      <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <span className="font-medium">Help & Support</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 group-hover:text-amber-500 transition-all duration-300 ${
                      isHelpOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
                {isHelpOpen && (
                  <div className="animate-in slide-in-from-top-2 duration-300 px-4 py-3 bg-gradient-to-r from-amber-50/50 to-orange-50/50 text-sm text-slate-600 space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left pl-10 py-2.5 hover:bg-white hover:shadow-md rounded-lg transition-all duration-200 hover:text-amber-700"
                    >
                      Documentation
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left pl-10 py-2.5 hover:bg-white hover:shadow-md rounded-lg text-amber-600 font-medium transition-all duration-200 hover:text-amber-700"
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

      {/* Enhanced Collapse Button */}
      <div
        onClick={handleCollapse}
        className={cn(
          "absolute top-1/2 transform -translate-y-1/2 h-20 flex items-center cursor-pointer z-10 transition-all duration-500",
          isCollapsed ? "right-0" : "right-0"
        )}
      >
        <div className="relative group">
          <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-300/60 to-transparent"></div>
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 rounded-full shadow-lg transform translate-x-2 hover:shadow-xl transition-all duration-300 group-hover:scale-110 backdrop-blur-sm border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400 rounded-full blur opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
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
              className={cn(
                "text-white transition-transform duration-500 relative z-10 drop-shadow-sm",
                isCollapsed ? "rotate-180" : ""
              )}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-8 h-8"></div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={10}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-500 shadow-lg"
              >
                {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Enhanced Workflow Modal */}
      <WorkflowModal
        isOpen={isModalOpen}
        onClose={() => {
          closeModal();
          handleWorkflowCreated();
        }}
      />

      {/* Enhanced Project Name Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 transform transition-all animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Folder className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">
                Create New Project
              </h3>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                placeholder="Enter project name"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeProjectModal}
                className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200 hover:shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById(
                    "projectName"
                  ) as HTMLInputElement;
                  if (input && input.value.trim()) {
                    handleSaveProjectName(input.value.trim());
                  }
                }}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Edit Workflow Modal */}
      {isEditWorkflowModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-96 transform transition-all animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <ActivitySquare className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">
                Edit Workflow
              </h3>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={editWorkflowName}
                  onChange={(e) => setEditWorkflowName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Schedule (Cron Expression)
                </label>
                <input
                  type="text"
                  value={editWorkflowSchedule}
                  onChange={(e) => setEditWorkflowSchedule(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                  placeholder="e.g., 0 0 * * * (daily at midnight) or leave empty"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Leave empty for manual execution only. Use cron format for
                  scheduled execution.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => {
                  setIsEditWorkflowModalOpen(false);
                  setEditingWorkflow(null);
                  setEditWorkflowName("");
                  setEditWorkflowSchedule("");
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
    </div>
  );
}