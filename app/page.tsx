// // page.tsx
"use client"
import { useState } from "react"
import { WorkflowEditor } from "@/components/workflow/workflow-editor"
import { History } from "@/components/workflow/history"
import { Sidebar } from "@/components/workflow/sidebar"
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
          {/* Sidebar with collapsible functionality */}
          <Sidebar activeView={activeView} setActiveView={setActiveView}/>
          
          {/* Main content area with top menu, editor, and bottom panel */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopMenu activeView={activeView} setActiveView={setActiveView} />
            
            {/* Conditionally render WorkflowEditor or History based on activeView */}
            {activeView === "editor" ? (
              <>
                <WorkflowEditor />
                <BottomPanel />
              </>
            ) : (
              <History />
            )}
          </div>
        </div>
      </WorkflowProvider>
    </ThemeProvider>
  )
}