"use client"

import { useState } from "react"
import { Share2, Plus, Save } from "lucide-react"
import { useWorkflow } from "./workflow-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { CreateWorkflowModal } from "./create-workflow-modal"

const topTabs = ["File", "Edit", "Project", "Run"]

export function TopMenu({
  activeView,
  setActiveView,
}: {
  activeView: string
  setActiveView: (view: string) => void
}) {
  const { runWorkflow, saveWorkflowToBackend } = useWorkflow()
  const [activeTab, setActiveTab] = useState("ORGANIZATION")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveWorkflow = async () => {
    setIsSaving(true)
    try {
      await saveWorkflowToBackend()
    } finally {
      setIsSaving(false)
    }
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

        {/* Right: Create Workflow + Share + Saved */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-200 text-black hover:bg-gray-300 border-none"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Workflow
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveWorkflow} disabled={isSaving}>
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? "Saving..." : "Save"}
          </Button>

          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {/* Create Workflow Modal */}
      <CreateWorkflowModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </div>
  )
}
