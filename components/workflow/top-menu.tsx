// // top-menu.tsx(navbar.tsx)
"use client"

import { useState } from "react"
import { MessageSquare, Tag, Share2, Github } from "lucide-react"
import { useWorkflow } from "./workflow-context"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TopMenu() {
  const { runWorkflow, saveWorkflow} = useWorkflow()
  const [isActive, setIsActive] = useState(true)

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

  return (
    <div className="flex h-14 items-center justify-between border-b px-4 bg-background">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <MessageSquare className="h-4 w-4 mr-1" />
          Menu
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Tabs defaultValue="editor">
          <TabsList className="h-8">
            <TabsTrigger value="editor" className="text-xs px-2">Studio</TabsTrigger>
            <TabsTrigger value="executions" className="text-xs px-2">History</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-4">
        {/* <div className="flex items-center gap-2">
          <span className="text-sm">Inactive</span>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div> */}
        
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleSaveWorkflow}>
        <span className="text-xs">Save</span>
        </Button>
        {/* <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                <Github className="h-4 w-4 mr-1" />
                Star
                <span className="ml-1 text-xs">51,309</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Star on GitHub</TooltipContent>
          </Tooltip>
        </TooltipProvider> */}
      </div>
    </div>
  )
}