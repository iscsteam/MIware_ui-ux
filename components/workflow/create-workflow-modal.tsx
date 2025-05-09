
// "use client"

// import { useState } from "react"
// import { X } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Switch } from "@/components/ui/switch"
// import { useToast } from "@/hooks/use-toast"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"

// const baseurl = process.env.NEXT_PUBLIC_USER_API_END_POINT;

// interface CreateWorkflowModalProps {
//   isOpen: boolean
//   onClose: () => void
// }

// export function CreateWorkflowModal({ isOpen, onClose }: CreateWorkflowModalProps) {
//   const { toast } = useToast()
//   const [name, setName] = useState("")
//   const [schedule, setSchedule] = useState("")
//   const [active, setActive] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const handleSubmit = async () => {
//     if (!name.trim()) {
//       setError("Workflow name is required")
//       return
//     }

//     setIsLoading(true)
//     setError(null)

//     try {
//       const response = await fetch(`${baseurl}/dags/`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name,
//           schedule: schedule.trim() || "",
//           active,
//         }),
//       })

//       const contentType = response.headers.get("content-type") || ""
//       const rawText = await response.text()
//       if (!response.ok) {
//         if (contentType.includes("application/json")) {
//           const errorData = JSON.parse(rawText)
//           throw new Error(errorData.detail || "Failed to create workflow")
//         } else {
//           console.error("Unexpected HTML response:", rawText)
//           throw new Error("Received HTML instead of JSON. Check API server.")
//         }
//       }

//       const data =  JSON.parse(rawText) 

//       // Store the current workflow ID for later use
//       localStorage.setItem(
//         "currentWorkflow",
//         JSON.stringify({
//           id: data.id,
//           dag_id: data.dag_id,
//           name: data.name,
//         }),
//       )

//       // Success - show toast, close modal and reset form
//       toast({
//         title: "Success",
//         description: `Workflow "${name}" created successfully`,
//         variant: "default",
//         duration: 2000,
//       })

//       onClose()
//       setName("")
//       setSchedule("")
//       setActive(false)
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
//       setError(errorMessage)
//       toast({
//         title: "Error",
//         description: errorMessage,
//         variant: "destructive",
//         duration: 2000,
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-semibold">Create New Workflow</DialogTitle>
          
//         </DialogHeader>

//         <div className="grid gap-4 py-4">
//           {error && <div className="bg-red-50 text-red-600 p-2 rounded-md text-sm">{error}</div>}

//           <div className="grid grid-cols-4 items-center gap-4">
//             <Label htmlFor="name" className="text-right">
//               Name
//             </Label>
//             <Input
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="col-span-3"
//               placeholder="My Workflow"
//             />
//           </div>

//           <div className="grid grid-cols-4 items-center gap-4">
//             <Label htmlFor="schedule" className="text-right">
//               Cron
//             </Label>
//             <Input
//               id="schedule"
//               value={schedule}
//               onChange={(e) => setSchedule(e.target.value)}
//               className="col-span-3"
//               placeholder="e.g., 0 0 * * *"
//             />
//           </div>

//           <div className="grid grid-cols-4 items-center gap-4">
//             <Label htmlFor="active" className="text-right">
//               Active
//             </Label>
//             <div className="col-span-3 flex items-center">
//               <Switch id="active" checked={active} onCheckedChange={setActive} />
//               <span className="ml-2 text-sm text-muted-foreground">
//                 {active ? "Workflow will run on schedule" : "Workflow will be disabled"}
//               </span>
//             </div>
//           </div>
//         </div>

//         <DialogFooter>
//           <Button
//             type="submit"
//             onClick={handleSubmit}
//             disabled={isLoading}
//             className="bg-purple-600 hover:bg-purple-700"
//           >
//             {isLoading ? "Creating..." : "Create Workflow"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }
