// // // // // top-menu.tsx(navbar.tsx)
// "use client"

// import { useState } from "react"
// import { Share2 } from "lucide-react"
// import { useWorkflow } from "./workflow-context"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { cn } from "@/lib/utils" 

// const topTabs = ["File", "Edit", "Project", "Run"]

// export function TopMenu({ activeView, setActiveView }: { 
//   activeView: string, 
//   setActiveView: (view: string) => void 
// }) {
//   const { runWorkflow } = useWorkflow()
//   const [activeTab, setActiveTab] = useState("ORGANIZATION")

//   return (
//     <div className="w-full">
//       {/* Top Menu */}
//       <div className="flex h-14 items-center justify-between border-b px-4 bg-background">
//         <div className="flex items-center space-x-6 h-full">
//           {topTabs.map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={cn(
//                 "relative pb-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
//                 activeTab === tab && "text-foreground"
//               )}
//             >
//               {tab}
//               {activeTab === tab && (
//                 <span className="absolute left-0 bottom-0 h-1 w-full bg-purple-600 rounded-sm" />
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Center: Tabs (Studio, History) */}
//         <div className="flex items-center gap-1 mt-11">
//           <Tabs value={activeView} onValueChange={setActiveView}>
//             <TabsList className="h-8">
//               <TabsTrigger value="editor" className="text-xs px-2">Studio</TabsTrigger>
//               <TabsTrigger value="executions" className="text-xs px-2">History</TabsTrigger>
//             </TabsList>
//           </Tabs>
//         </div>

//         {/* Right: Share + Saved */}
//         <div className="flex items-center gap-4">
//           <Button variant="outline" size="sm">
//             <Share2 className="h-4 w-4 mr-1" />
//             Share
//           </Button>
//           <span className="text-xs text-muted-foreground">Saved</span>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"

// Update the TopMenu component to include workflow creation functionality
import { useState } from "react"
import { Share2, Plus, Save } from "lucide-react"
import { useWorkflow } from "./workflow-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

const topTabs = ["File", "Edit", "Project", "Run"]

export function TopMenu({
  activeView,
  setActiveView,
}: {
  activeView: string
  setActiveView: (view: string) => void
}) {
  const { runWorkflow, saveWorkflow, loadWorkflow, nodes, connections } = useWorkflow()
  const [activeTab, setActiveTab] = useState("File")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [workflowName, setWorkflowName] = useState("")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null)

  const handleCreateWorkflow = async () => {
    if (!workflowName.trim()) {
      toast({
        title: "Error",
        description: "Workflow name is required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("http://localhost:5000/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workflowName,
          description: workflowDescription,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create workflow")
      }

      const data = await response.json()
      setCurrentWorkflowId(data.workflow._id)

      toast({
        title: "Success",
        description: "Workflow created successfully",
      })

      setIsCreateDialogOpen(false)
      setWorkflowName("")
      setWorkflowDescription("")
    } catch (error) {
      console.error("Error creating workflow:", error)
      toast({
        title: "Error",
        description: "Failed to create workflow",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveWorkflow = async () => {
    if (!currentWorkflowId) {
      setIsCreateDialogOpen(true)
      return
    }

    // Save the current workflow state
    const workflowData = saveWorkflow()

    // Here you would typically send this to your backend
    toast({
      title: "Success",
      description: "Workflow saved successfully",
    })
  }

  return (
    <div className="w-full">
      {/* Top Menu */}
      <div className="flex h-14 items-center justify-between border-b px-4 bg-background">
        <div className="flex items-center space-x-6 h-full">
          {topTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative pb-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
                activeTab === tab && "text-foreground",
              )}
            >
              {tab}
              {activeTab === tab && <span className="absolute left-0 bottom-0 h-1 w-full bg-purple-600 rounded-sm" />}
            </button>
          ))}
        </div>

        {/* Center: Tabs (Studio, History) */}
        <div className="flex items-center gap-1 mt-11">
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

        {/* Right: Share + Saved */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Workflow
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveWorkflow}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          <span className="text-xs text-muted-foreground">Saved</span>
        </div>
      </div>

      {/* Create Workflow Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-description">Description (Optional)</Label>
              <Textarea
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Enter workflow description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkflow} disabled={isSaving}>
              {isSaving ? "Creating..." : "Create Workflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
