"use client";

// Make sure the import path is correct for your project structure
import  ClientDashboard from "@/components/client-dashboard/client-dashboard";
import { WorkflowProvider } from "@/components/workflow/workflow-context"; // <--- IMPORT THE PROVIDER
import { ThemeProvider } from "@/components/theme-provider"; // Assuming you use ThemeProvider here too

export default function ClientDashboardPage() {
  const handleOpenWorkflow = (dag: any) => {
    // This prop isn't currently used by ClientDashboard in the version you provided
    // but keeping it here for context if you plan to add it.
    console.log("Open workflow", dag);
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme"> {/* Or your preferred theme storageKey */}
      <WorkflowProvider> {/* <--- WRAP ClientDashboard WITH THE PROVIDER */}
        <ClientDashboard onOpenWorkflow={handleOpenWorkflow} /> {/* Pass any necessary props like clientId */}
      </WorkflowProvider>
    </ThemeProvider>
  );
}