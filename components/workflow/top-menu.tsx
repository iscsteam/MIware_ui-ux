"use client"

import { useState } from "react"
import { Play, Save, Upload, RefreshCw } from "lucide-react"
import { useWorkflow } from "./workflow-context"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ModeToggle } from "@/components/mode-toggle"
import { ExecutionModal } from "./execution-modal"

export function TopMenu() {
  const { runWorkflow, saveWorkflow, loadWorkflow, clearWorkflow } = useWorkflow()
  const [executionModalOpen, setExecutionModalOpen] = useState(false)

  const handleLoadWorkflow = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const data = JSON.parse(content)
          loadWorkflow(data)
        } catch (error) {
          console.error("Failed to parse workflow file:", error)
          alert("Failed to load workflow: Invalid file format")
        }
      }
      reader.readAsText(file)
    }

    input.click()
  }

  const handleSaveWorkflow = () => {
    const workflow = saveWorkflow()
    const json = JSON.stringify(workflow, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "workflow.json"
    a.click()

    URL.revokeObjectURL(url)
  }

  const handleRunWorkflow = () => {
    setExecutionModalOpen(true)
    runWorkflow()
  }

  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Mi Ware</h1>
      </div>

      <TooltipProvider>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleRunWorkflow}>
                <Play className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Run Workflow</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleSaveWorkflow}>
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save Workflow</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleLoadWorkflow}>
                <Upload className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Load Workflow</TooltipContent>
          </Tooltip>
 
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => clearWorkflow()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset Workflow</TooltipContent>
          </Tooltip>

          <ModeToggle />
        </div>
      </TooltipProvider>

      {/* Execution modal for the entire workflow */}
      <ExecutionModal
        isOpen={executionModalOpen}
        onClose={() => setExecutionModalOpen(false)}
        nodeId={null} // null means show all logs
      />
    </div>
  )
}
