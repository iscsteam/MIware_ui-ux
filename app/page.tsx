
// // // page.tsx
"use client"
import { useState, useEffect } from "react"
import { WorkflowEditor } from "@/components/workflow/workflow-editor"
import { History } from "@/components/workflow/history"
import { Sidebar } from "@/components/workflow/sidebar"
import { TopMenu } from "@/components/workflow/top-menu"
import { BottomPanel } from "@/components/workflow/bottom-panel"
import { WorkflowProvider } from "@/components/workflow/workflow-context"
import { ThemeProvider } from "@/components/theme-provider"
import { LoginPage } from "@/components/auth/loginpage" 
import { LoadingScreen } from "@/components/auth/loading-screen" 
import { ClientsPage } from "@/components/workflow/clients-page"

interface User {
  name: string
}
import '@/services/consolelog';

export default function WorkflowAutomationDashboard() {
  // State to track active view: 'editor' for Studio, 'executions' for History, 'clients' for Clients
  const [activeView, setActiveView] = useState("editor")
  
  // State to track user authentication and loading
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingCredentials, setIsCheckingCredentials] = useState(true) // Add this
  const [user, setUser] = useState<User | null>(null)

  // Check for saved credentials on app load
  useEffect(() => {
    console.log("Checking for saved credentials...") // Debug log
    const savedCredentials = localStorage.getItem("userCredentials")
    
    if (savedCredentials) {
      console.log("Found saved credentials:", savedCredentials) // Debug log
      try {
        const parsed = JSON.parse(savedCredentials)
        console.log("Parsed credentials:", parsed) // Debug log
        
        if (parsed.name && parsed.password) {
          console.log("Valid credentials found, auto-logging in...") // Debug log
          // Auto-login with saved credentials
          setUser({ name: parsed.name })
          setIsLoggedIn(true)
        } else {
          console.log("Invalid credentials structure") // Debug log
        }
      } catch (error) {
        console.error("Failed to parse saved credentials:", error)
        localStorage.removeItem("userCredentials") // Clear corrupted data
      }
    } else {
      console.log("No saved credentials found") // Debug log
    }
    
    // Finished checking credentials
    setIsCheckingCredentials(false)
  }, [])

  // Handle successful login - trigger loading screen
  const handleLogin = (userData: User) => {
    setUser(userData)
    setIsLoading(true) // Start loading screen
  }

  // Handle loading completion - show main dashboard
  const handleLoadingComplete = () => {
    setIsLoading(false)
    setIsLoggedIn(true)
  }

  // Handle logout (optional - you can add a logout button in your UI)
  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem("userCredentials")
    localStorage.removeItem("currentClient")
    localStorage.removeItem("currentWorkflow")
    
    // Reset state
    setUser(null)
    setIsLoggedIn(false)
    setIsLoading(false)
    setIsCheckingCredentials(false)
    setActiveView("editor") // Reset to default view
  }

  // Handle navigation to clients page
  const handleNavigateToClients = () => {
    setActiveView("clients")
  }

  // Handle back navigation from clients page
  const handleBackFromClients = () => {
    setActiveView("editor") // Or whatever the previous view was
  }

  // If still checking for saved credentials, show loading
  if (isCheckingCredentials) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="workflow-theme">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading MI-WARE...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  // If not logged in and not loading, show login page
  if (!isLoggedIn && !isLoading) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="workflow-theme">
        <LoginPage onLogin={handleLogin} />
      </ThemeProvider>
    )
  }

  // If loading, show loading screen
  if (isLoading) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="workflow-theme">
        <LoadingScreen onLoadingComplete={handleLoadingComplete} />
      </ThemeProvider>
    )
  }

  // If on clients page, show only the clients page
  if (activeView === "clients") {
    return (
      <ThemeProvider defaultTheme="light" storageKey="workflow-theme">
        <WorkflowProvider>
          <div className="flex h-screen overflow-hidden bg-background">
            <ClientsPage onBack={handleBackFromClients} />
          </div>
        </WorkflowProvider>
      </ThemeProvider>
    )
  }

  // If logged in, show the main dashboard
  return (
    <ThemeProvider defaultTheme="light" storageKey="workflow-theme">
      <WorkflowProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Sidebar with collapsible functionality */}
          <Sidebar activeView={activeView} setActiveView={setActiveView} />
          
          {/* Main content area with top menu, editor, and bottom panel */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopMenu 
              activeView={activeView} 
              setActiveView={setActiveView} 
              user={user}
              onLogout={handleLogout}
              onNavigateToClients={handleNavigateToClients}
            />
            
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
