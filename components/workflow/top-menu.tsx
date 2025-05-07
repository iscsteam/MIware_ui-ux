// // // // // top-menu.tsx(navbar.tsx)
"use client"
import { useState } from "react"
import { Share2, UserPlus } from "lucide-react"
import { useWorkflow } from "./workflow-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter,} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const topTabs = ["File", "Edit", "Project", "Run"]

interface ClientCreateResponse {
  id: number;
  name: string;
  api_key: string;
  created_at: string;
  updated_at: string;
  file_conversion_configs: any[];
  read_salesforce_configs: any[];
  write_salesforce_configs: any[];
}

export function TopMenu({ activeView, setActiveView }: { 
  activeView: string, 
  setActiveView: (view: string) => void 
}) {
  const { runWorkflow } = useWorkflow()
  const [activeTab, setActiveTab] = useState("ORGANIZATION")
  const [createClientDialogOpen, setCreateClientDialogOpen] = useState(false)
  const [clientName, setClientName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdClient, setCreatedClient] = useState<ClientCreateResponse | null>(null)

  // API base URL for the backend service
  // Update this URL to match your actual Kubernetes service URL
  // This could be a cluster IP, NodePort, LoadBalancer IP, or Ingress URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"
  // const API_BASE_URL = "http://localhost:8000" // Example for local development          ;
  
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateClient = async () => {
    if (!clientName) return;
    
    setIsSubmitting(true);
    setErrorMessage("");
    
    try {
      console.log(`Sending request to: ${API_BASE_URL}/clients/`);
      
      const response = await fetch(`${API_BASE_URL}/clients/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: clientName }),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const createdClient = await response.json();
      setCreatedClient(createdClient);
      setClientName("");
    } catch (error) {
      console.error("Failed to create client:", error);
      
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setErrorMessage("Cannot connect to the API server. Please ensure the backend service is accessible.");
      } else {
        setErrorMessage(`Error: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
                activeTab === tab && "text-foreground"
              )}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute left-0 bottom-0 h-1 w-full bg-purple-600 rounded-sm" />
              )}
            </button>
          ))}
        </div>

        {/* Center: Tabs (Studio, History) */}
        <div className="flex items-center gap-1 mt-11">
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="h-8">
              <TabsTrigger value="editor" className="text-xs px-2">Studio</TabsTrigger>
              <TabsTrigger value="executions" className="text-xs px-2">History</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Right: Share + Saved + Create Client */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setCreateClientDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1" />
            Create Client
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          <span className="text-xs text-muted-foreground">Saved</span>
        </div>
      </div>

      {/* Create Client Dialog */}
      <Dialog open={createClientDialogOpen} onOpenChange={setCreateClientDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
          </DialogHeader>
          
          {!createdClient ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client-name" className="text-right">
                  Client Name
                </Label>
                <Input
                  id="client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter client name"
                />
              </div>
              
              {errorMessage && (
                <div className="col-span-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
                  {errorMessage}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Client Created Successfully</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">ID:</span>
                  <span>{createdClient.id}</span>
                  <span className="text-muted-foreground">Name:</span>
                  <span>{createdClient.name}</span>
                  <span className="text-muted-foreground">API Key:</span>
                  <span className="break-all">{createdClient.api_key}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            {!createdClient ? (
              <>
                <Button variant="outline" onClick={() => setCreateClientDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateClient} 
                  disabled={!clientName || isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </>
            ) : (
              <Button onClick={() => {
                setCreateClientDialogOpen(false);
                setCreatedClient(null);
              }}>
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}