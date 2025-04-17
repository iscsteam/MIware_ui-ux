
"use client"
import { useState } from "react"
import { WorkflowEditor } from "@/components/workflow/workflow-editor"
import { History } from "@/components/workflow/history"
import { NodePalette } from "@/components/workflow/node-palette"
import { TopMenu } from "@/components/workflow/top-menu"
import { BottomPanel } from "@/components/workflow/bottom-panel"
import { WorkflowProvider } from "@/components/workflow/workflow-context"
import { ThemeProvider } from "@/components/theme-provider"



export default function WorkflowAutomationDashboard() {
  // State to track active view: 'editor' for Studio, 'executions' for History
  const [activeView, setActiveView] = useState("editor")


  return (
    <ThemeProvider defaultTheme="light" storageKey="workflow-theme">
      <WorkflowProvider>
        <div className="flex h-screen overflow-hidden bg-background">

          {/* Sidebar takes full height */}
          <NodePalette />
          {/* Main content area with top menu, editor, and bottom panel */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopMenu />
            <WorkflowEditor />
            <BottomPanel />

          </div>
        </div>
      </WorkflowProvider>
    </ThemeProvider>

  );
}

