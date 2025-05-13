
// //top-menu.tsx(navbar.tsx)
// "use client"
// import { useState } from "react"
// import { Share2, UserPlus } from "lucide-react"

// import { useWorkflow } from "./workflow-context"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { cn } from "@/lib/utils"

// import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter,} from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import {createClient} from "@/services/client"
// import {ClientCreateResponse} from "@/services/interface"


// const topTabs = ["File", "Edit", "Project", "Run"]

// export function TopMenu({
//   activeView,
//   setActiveView,
// }: {
//   activeView: string
//   setActiveView: (view: string) => void
// }) {
//   const { runWorkflow, saveWorkflowToBackend } = useWorkflow()
//   const [activeTab, setActiveTab] = useState("ORGANIZATION")

//   const [createClientDialogOpen, setCreateClientDialogOpen] = useState(false)
//   const [clientName, setClientName] = useState("")
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [createdClient, setCreatedClient] = useState<ClientCreateResponse | null>(null)
//   const [error, SetError] = useState<string | null>(null)
  
//   const [errorMessage, setErrorMessage] = useState("");

//   const handleCreateClient = async () => {
//     if (!clientName) return;
  
//     setIsSubmitting(true);
//     setErrorMessage("");
  
//     try {
//       const created = await createClient({ name: clientName });
  
//       if (!created) {
//         throw new Error("Client creation returned null");
//       }
  
//       setCreatedClient(created);
//       setClientName("");
//     } catch (error: unknown) {
//       console.error("Failed to create client:", error);
//       if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
//         setErrorMessage("Cannot connect to the API server. Please ensure the backend service is accessible.");
//       } else if (error instanceof Error) {
//         setErrorMessage(`Error: ${error.message}`);
//       } else {
//         setErrorMessage("An unknown error occurred.");
      
//     }
    
   
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
  


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
//                 activeTab === tab && "text-foreground",
//               )}
//             >
//               {tab}
//               {activeTab === tab && <span className="absolute left-0 bottom-0 h-1 w-full bg-purple-600 rounded-sm" />}
//             </button>
//           ))}
//         </div>

//         {/* Center: Tabs (Studio, History) */}
//         <div className="flex items-center gap-1 mt-11">
//           <Tabs value={activeView} onValueChange={setActiveView}>
//             <TabsList className="h-8">
//               <TabsTrigger value="editor" className="text-xs px-2">
//                 Studio
//               </TabsTrigger>
//               <TabsTrigger value="executions" className="text-xs px-2">
//                 History
//               </TabsTrigger>
//             </TabsList>
//           </Tabs>
//         </div>


//         {/* Right: Share + Saved + Create Client */}
//         <div className="flex items-center gap-4">
//           <Button variant="outline" size="sm" onClick={() => setCreateClientDialogOpen(true)}>
//             <UserPlus className="h-4 w-4 mr-1" />
//             Create Client
//           </Button>

//           <Button variant="outline" size="sm">
//             <Share2 className="h-4 w-4 mr-1" />
//             Share
//           </Button>
//         </div>
//       </div>


//       {/* Create Client Dialog */}
//       <Dialog open={createClientDialogOpen} onOpenChange={setCreateClientDialogOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Create New Client</DialogTitle>
//           </DialogHeader>

//           <hr/>
          
//           {!createdClient ? (
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="client-name" className="text-right">
//                   Client Name
//                 </Label>
//                 <Input
//                   id="client-name"
//                   value={clientName}
//                   onChange={(e) => setClientName(e.target.value)}
//                   className="col-span-3"
//                   placeholder="Enter client name"
//                 />
//               </div>
              
//               {errorMessage && (
//                 <div className="col-span-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
//                   {errorMessage}
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="grid gap-4 py-4">
//               <div className="bg-muted p-4 rounded-md">
//                 <h3 className="font-medium mb-2">Client Created Successfully</h3>
//               <hr/>
//                 <div className="grid grid-cols-2 gap-2 text-sm">
//                   <span className="text-muted-foreground">ID:</span>
//                   <span>{createdClient.id}</span>
//                   <span className="text-muted-foreground">Name:</span>
//                   <span>{createdClient.name}</span>
//                   {/* <span className="text-muted-foreground">API Key:</span> */}
//                   {/* <span className="break-all">{createdClient.api_key}</span> */}
//                 </div>
//               </div>
//             </div>
//           )}
          
//           <hr/>
//           <DialogFooter>
//             {!createdClient ? (
//               <>
//                 <Button variant="outline" onClick={() => setCreateClientDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button 
//                   onClick={handleCreateClient} 
//                   disabled={!clientName || isSubmitting}
//                 >
//                   {isSubmitting ? "Creating..." : "Create"}
//                 </Button>
//               </>
//             ) : (
//               <Button onClick={() => {
//                 setCreateClientDialogOpen(false);
//                 setCreatedClient(null);
//               }}>
//                 Done
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//     </div>
//   )
// }

// //top-menu.tsx(navbar.tsx)
// "use client"
// import { useState } from "react"
// import { Share2, UserPlus, Save, Play, Loader2 } from "lucide-react"

// import { useWorkflow } from "./workflow-context"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { cn } from "@/lib/utils"

// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { createClient } from "@/services/client"
// import type { ClientCreateResponse } from "@/services/interface"

// const topTabs = ["File", "Edit", "Project", "Run"]

// export function TopMenu({
//   activeView,
//   setActiveView,
// }: {
//   activeView: string
//   setActiveView: (view: string) => void
// }) {
//   const { runWorkflow, saveWorkflowToBackend } = useWorkflow()
//   const [activeTab, setActiveTab] = useState("ORGANIZATION")

//   const [createClientDialogOpen, setCreateClientDialogOpen] = useState(false)
//   const [clientName, setClientName] = useState("")
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [createdClient, setCreatedClient] = useState<ClientCreateResponse | null>(null)
//   const [error, SetError] = useState<string | null>(null)

//   const [errorMessage, setErrorMessage] = useState("")

//   const [isSaving, setIsSaving] = useState(false)
//   const [isRunning, setIsRunning] = useState(false)

//   const handleCreateClient = async () => {
//     if (!clientName) return

//     setIsSubmitting(true)
//     setErrorMessage("")

//     try {
//       const created = await createClient({ name: clientName })

//       if (!created) {
//         throw new Error("Client creation returned null")
//       }

//       setCreatedClient(created)
//       setClientName("")
//     } catch (error: unknown) {
//       console.error("Failed to create client:", error)
//       if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
//         setErrorMessage("Cannot connect to the API server. Please ensure the backend service is accessible.")
//       } else if (error instanceof Error) {
//         setErrorMessage(`Error: ${error.message}`)
//       } else {
//         setErrorMessage("An unknown error occurred.")
//       }
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleSave = async () => {
//     setIsSaving(true)
//     try {
//       await saveWorkflowToBackend()
//     } catch (error) {
//       console.error("Failed to save workflow:", error)
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const handleRun = async () => {
//     setIsRunning(true)
//     try {
//       await runWorkflow()
//     } catch (error) {
//       console.error("Failed to run workflow:", error)
//     } finally {
//       setIsRunning(false)
//     }
//   }

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
//                 activeTab === tab && "text-foreground",
//               )}
//             >
//               {tab}
//               {activeTab === tab && <span className="absolute left-0 bottom-0 h-1 w-full bg-purple-600 rounded-sm" />}
//             </button>
//           ))}
//         </div>

//         {/* Center: Tabs (Studio, History) */}
//         <div className="flex items-center gap-1 mt-11">
//           <Tabs value={activeView} onValueChange={setActiveView}>
//             <TabsList className="h-8">
//               <TabsTrigger value="editor" className="text-xs px-2">
//                 Studio
//               </TabsTrigger>
//               <TabsTrigger value="executions" className="text-xs px-2">
//                 History
//               </TabsTrigger>
//             </TabsList>
//           </Tabs>
//         </div>

//         {/* Right: Share + Saved + Create Client */}
//         <div className="flex items-center gap-4">
//           <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
//             {isSaving ? (
//               <>
//                 <Loader2 className="h-4 w-4 mr-1 animate-spin" />
//                 Saving...
//               </>
//             ) : (
//               <>
//                 <Save className="h-4 w-4 mr-1" />
//                 Save
//               </>
//             )}
//           </Button>

//           <Button variant="outline" size="sm" onClick={handleRun} disabled={isRunning}>
//             {isRunning ? (
//               <>
//                 <Loader2 className="h-4 w-4 mr-1 animate-spin" />
//                 Running...
//               </>
//             ) : (
//               <>
//                 <Play className="h-4 w-4 mr-1" />
//                 Run
//               </>
//             )}
//           </Button>

//           <Button variant="outline" size="sm" onClick={() => setCreateClientDialogOpen(true)}>
//             <UserPlus className="h-4 w-4 mr-1" />
//             Create Client
//           </Button>

//           <Button variant="outline" size="sm">
//             <Share2 className="h-4 w-4 mr-1" />
//             Share
//           </Button>
//         </div>
//       </div>

//       {/* Create Client Dialog */}
//       <Dialog open={createClientDialogOpen} onOpenChange={setCreateClientDialogOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Create New Client</DialogTitle>
//           </DialogHeader>

//           <hr />

//           {!createdClient ? (
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="client-name" className="text-right">
//                   Client Name
//                 </Label>
//                 <Input
//                   id="client-name"
//                   value={clientName}
//                   onChange={(e) => setClientName(e.target.value)}
//                   className="col-span-3"
//                   placeholder="Enter client name"
//                 />
//               </div>

//               {errorMessage && (
//                 <div className="col-span-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
//                   {errorMessage}
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="grid gap-4 py-4">
//               <div className="bg-muted p-4 rounded-md">
//                 <h3 className="font-medium mb-2">Client Created Successfully</h3>
//                 <hr />
//                 <div className="grid grid-cols-2 gap-2 text-sm">
//                   <span className="text-muted-foreground">ID:</span>
//                   <span>{createdClient.id}</span>
//                   <span className="text-muted-foreground">Name:</span>
//                   <span>{createdClient.name}</span>
//                   {/* <span className="text-muted-foreground">API Key:</span> */}
//                   {/* <span className="break-all">{createdClient.api_key}</span> */}
//                 </div>
//               </div>
//             </div>
//           )}

//           <hr />
//           <DialogFooter>
//             {!createdClient ? (
//               <>
//                 <Button variant="outline" onClick={() => setCreateClientDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button onClick={handleCreateClient} disabled={!clientName || isSubmitting}>
//                   {isSubmitting ? "Creating..." : "Create"}
//                 </Button>
//               </>
//             ) : (
//               <Button
//                 onClick={() => {
//                   setCreateClientDialogOpen(false)
//                   setCreatedClient(null)
//                 }}
//               >
//                 Done
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }


// //top-menu.tsx(navbar.tsx)
// "use client"
// import { useState } from "react"
// import { Share2, UserPlus, Save, Play, Loader2 } from "lucide-react"

// import { useWorkflow } from "./workflow-context"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { cn } from "@/lib/utils"

// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { createClient } from "@/services/client"
// import type { ClientCreateResponse } from "@/services/interface"

// const topTabs = ["File", "Edit", "Project", "Run"]

// export function TopMenu({
//   activeView,
//   setActiveView,
// }: {
//   activeView: string
//   setActiveView: (view: string) => void
// }) {
//   const { runWorkflow, saveWorkflowToBackend, saveAndRunWorkflow } = useWorkflow()
//   const [activeTab, setActiveTab] = useState("ORGANIZATION")

//   const [createClientDialogOpen, setCreateClientDialogOpen] = useState(false)
//   const [clientName, setClientName] = useState("")
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [createdClient, setCreatedClient] = useState<ClientCreateResponse | null>(null)
//   const [error, SetError] = useState<string | null>(null)

//   const [errorMessage, setErrorMessage] = useState("")

//   const [isSaving, setIsSaving] = useState(false)
//   const [isRunning, setIsRunning] = useState(false)

//   const handleCreateClient = async () => {
//     if (!clientName) return

//     setIsSubmitting(true)
//     setErrorMessage("")

//     try {
//       const created = await createClient({ name: clientName })

//       if (!created) {
//         throw new Error("Client creation returned null")
//       }

//       setCreatedClient(created)
//       setClientName("")
//     } catch (error: unknown) {
//       console.error("Failed to create client:", error)
//       if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
//         setErrorMessage("Cannot connect to the API server. Please ensure the backend service is accessible.")
//       } else if (error instanceof Error) {
//         setErrorMessage(`Error: ${error.message}`)
//       } else {
//         setErrorMessage("An unknown error occurred.")
//       }
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleSave = async () => {
//     setIsSaving(true)
//     try {
//       await saveWorkflowToBackend()
//     } catch (error) {
//       console.error("Failed to save workflow:", error)
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const handleRun = async () => {
//     setIsRunning(true)
//     try {
//       // Use the saveAndRunWorkflow function from the workflow context
//       await saveAndRunWorkflow()
//     } catch (error) {
//       console.error("Failed to run workflow:", error)
//     } finally {
//       setIsRunning(false)
//     }
//   }

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
//                 activeTab === tab && "text-foreground",
//               )}
//             >
//               {tab}
//               {activeTab === tab && <span className="absolute left-0 bottom-0 h-1 w-full bg-purple-600 rounded-sm" />}
//             </button>
//           ))}
//         </div>

//         {/* Center: Tabs (Studio, History) */}
//         <div className="flex items-center gap-1 mt-11">
//           <Tabs value={activeView} onValueChange={setActiveView}>
//             <TabsList className="h-8">
//               <TabsTrigger value="editor" className="text-xs px-2">
//                 Studio
//               </TabsTrigger>
//               <TabsTrigger value="executions" className="text-xs px-2">
//                 History
//               </TabsTrigger>
//             </TabsList>
//           </Tabs>
//         </div>

//         {/* Right: Share + Saved + Create Client */}
//         <div className="flex items-center gap-4">
//           <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
//             {isSaving ? (
//               <>
//                 <Loader2 className="h-4 w-4 mr-1 animate-spin" />
//                 Saving...
//               </>
//             ) : (
//               <>
//                 <Save className="h-4 w-4 mr-1" />
//                 Save
//               </>
//             )}
//           </Button>

//           <Button variant="outline" size="sm" onClick={handleRun} disabled={isRunning}>
//             {isRunning ? (
//               <>
//                 <Loader2 className="h-4 w-4 mr-1 animate-spin" />
//                 Running...
//               </>
//             ) : (
//               <>
//                 <Play className="h-4 w-4 mr-1" />
//                 Run
//               </>
//             )}
//           </Button>

//           <Button variant="outline" size="sm" onClick={() => setCreateClientDialogOpen(true)}>
//             <UserPlus className="h-4 w-4 mr-1" />
//             Create Client
//           </Button>

//           <Button variant="outline" size="sm">
//             <Share2 className="h-4 w-4 mr-1" />
//             Share
//           </Button>
//         </div>
//       </div>

//       {/* Create Client Dialog */}
//       <Dialog open={createClientDialogOpen} onOpenChange={setCreateClientDialogOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Create New Client</DialogTitle>
//           </DialogHeader>

//           <hr />

//           {!createdClient ? (
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="client-name" className="text-right">
//                   Client Name
//                 </Label>
//                 <Input
//                   id="client-name"
//                   value={clientName}
//                   onChange={(e) => setClientName(e.target.value)}
//                   className="col-span-3"
//                   placeholder="Enter client name"
//                 />
//               </div>

//               {errorMessage && (
//                 <div className="col-span-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
//                   {errorMessage}
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="grid gap-4 py-4">
//               <div className="bg-muted p-4 rounded-md">
//                 <h3 className="font-medium mb-2">Client Created Successfully</h3>
//                 <hr />
//                 <div className="grid grid-cols-2 gap-2 text-sm">
//                   <span className="text-muted-foreground">ID:</span>
//                   <span>{createdClient.id}</span>
//                   <span className="text-muted-foreground">Name:</span>
//                   <span>{createdClient.name}</span>
//                   {/* <span className="text-muted-foreground">API Key:</span> */}
//                   {/* <span className="break-all">{createdClient.api_key}</span> */}
//                 </div>
//               </div>
//             </div>
//           )}

//           <hr />
//           <DialogFooter>
//             {!createdClient ? (
//               <>
//                 <Button variant="outline" onClick={() => setCreateClientDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button onClick={handleCreateClient} disabled={!clientName || isSubmitting}>
//                   {isSubmitting ? "Creating..." : "Create"}
//                 </Button>
//               </>
//             ) : (
//               <Button
//                 onClick={() => {
//                   setCreateClientDialogOpen(false)
//                   setCreatedClient(null)
//                 }}
//               >
//                 Done
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }


//top-menu.tsx(navbar.tsx)
"use client"
import { useState } from "react"
import { Share2, UserPlus, Save, Play, Loader2 } from "lucide-react"

import { useWorkflow } from "./workflow-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/services/client"
import type { ClientCreateResponse } from "@/services/interface"

const topTabs = ["File", "Edit", "Project", "Run"]

export function TopMenu({
  activeView,
  setActiveView,
}: {
  activeView: string
  setActiveView: (view: string) => void
}) {
  const { runWorkflow, saveWorkflowToBackend, saveAndRunWorkflow } = useWorkflow()
  const [activeTab, setActiveTab] = useState("ORGANIZATION")

  const [createClientDialogOpen, setCreateClientDialogOpen] = useState(false)
  const [clientName, setClientName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdClient, setCreatedClient] = useState<ClientCreateResponse | null>(null)
  const [error, SetError] = useState<string | null>(null)

  const [errorMessage, setErrorMessage] = useState("")

  const [isSaving, setIsSaving] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  const handleCreateClient = async () => {
    if (!clientName) return

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const created = await createClient({ name: clientName })

      if (!created) {
        throw new Error("Client creation returned null")
      }

      setCreatedClient(created)
      setClientName("")
    } catch (error: unknown) {
      console.error("Failed to create client:", error)
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setErrorMessage("Cannot connect to the API server. Please ensure the backend service is accessible.")
      } else if (error instanceof Error) {
        setErrorMessage(`Error: ${error.message}`)
      } else {
        setErrorMessage("An unknown error occurred.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveWorkflowToBackend()
    } catch (error) {
      console.error("Failed to save workflow:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRun = async () => {
    setIsRunning(true)
    try {
      // Use the saveAndRunWorkflow function from the workflow context
      await saveAndRunWorkflow()
    } catch (error) {
      console.error("Failed to run workflow:", error)
    } finally {
      setIsRunning(false)
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

        {/* Right: Share + Saved + Create Client */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save
              </>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={handleRun} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Run
              </>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={() => setCreateClientDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1" />
            Create Client
          </Button>

          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {/* Create Client Dialog */}
      <Dialog open={createClientDialogOpen} onOpenChange={setCreateClientDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
          </DialogHeader>

          <hr />

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
                <hr />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">ID:</span>
                  <span>{createdClient.id}</span>
                  <span className="text-muted-foreground">Name:</span>
                  <span>{createdClient.name}</span>
                  {/* <span className="text-muted-foreground">API Key:</span> */}
                  {/* <span className="break-all">{createdClient.api_key}</span> */}
                </div>
              </div>
            </div>
          )}

          <hr />
          <DialogFooter>
            {!createdClient ? (
              <>
                <Button variant="outline" onClick={() => setCreateClientDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateClient} disabled={!clientName || isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setCreateClientDialogOpen(false)
                  setCreatedClient(null)
                }}
              >
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}