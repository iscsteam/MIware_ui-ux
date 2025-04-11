"use client"
import { WorkflowEditor } from "@/components/workflow/workflow-editor"
import { NodePalette } from "@/components/workflow/node-palette"
import { TopMenu } from "@/components/workflow/top-menu"
import { BottomPanel } from "@/components/workflow/bottom-panel"
import { WorkflowProvider } from "@/components/workflow/workflow-context"
import { ThemeProvider } from "@/components/theme-provider"

export default function WorkflowAutomationDashboard() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="workflow-theme">
      <WorkflowProvider>
        <div className="flex h-screen flex-col overflow-hidden bg-background">
          <TopMenu />
          <div className="flex flex-1 overflow-hidden">
            <NodePalette />
            <WorkflowEditor />
          </div>
          <BottomPanel />
        </div>
      </WorkflowProvider>
    </ThemeProvider>
  )
}
