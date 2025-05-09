// "use client"
// import { useState } from "react"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Button } from "@/components/ui/button"

// interface ClientCreateResponse {
//   id: number;
//   name: string;
//   api_key: string;
//   created_at: string;
//   updated_at: string;
//   file_conversion_configs: any[];
//   read_salesforce_configs: any[];
//   write_salesforce_configs: any[];
// }

// interface CreateClientModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export function CreateClientModal({ isOpen, onClose }: CreateClientModalProps) {
//   const [clientName, setClientName] = useState("")
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [createdClient, setCreatedClient] = useState<ClientCreateResponse | null>(null)
//   const [errorMessage, setErrorMessage] = useState("")

//   // API base URL for the backend service
//   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"

//   const handleCreateClient = async () => {
//     if (!clientName) return;
    
//     setIsSubmitting(true);
//     setErrorMessage("");
    
//     try {
//       console.log(`Sending request to: ${API_BASE_URL}/clients/`);
      
//       const response = await fetch(`${API_BASE_URL}/clients/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ name: clientName }),
//       });
      
//       if (!response.ok) {
//         const errorText = await response.text().catch(() => "Unknown error");
//         throw new Error(`Error ${response.status}: ${errorText}`);
//       }
      
//       const createdClient = await response.json();
//       setCreatedClient(createdClient);
//       setClientName("");
//     } catch (error) {
//       console.error("Failed to create client:", error);
      
//       if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
//         setErrorMessage("Cannot connect to the API server. Please ensure the backend service is accessible.");
//       } else {
//         setErrorMessage(`Error: ${error.message}`);
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleClose = () => {
//     setCreatedClient(null);
//     setErrorMessage("");
//     onClose();
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Create New Client</DialogTitle>
//         </DialogHeader>
        
//         {!createdClient ? (
//           <div className="grid gap-4 py-4">
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="client-name" className="text-right">
//                 Client Name
//               </Label>
//               <Input
//                 id="client-name"
//                 value={clientName}
//                 onChange={(e) => setClientName(e.target.value)}
//                 className="col-span-3"
//                 placeholder="Enter client name"
//               />
//             </div>
            
//             {errorMessage && (
//               <div className="col-span-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
//                 {errorMessage}
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="grid gap-4 py-4">
//             <div className="bg-muted p-4 rounded-md">
//               <h3 className="font-medium mb-2">Client Created Successfully</h3>
//               <div className="grid grid-cols-2 gap-2 text-sm">
//                 <span className="text-muted-foreground">ID:</span>
//                 <span>{createdClient.id}</span>
//                 <span className="text-muted-foreground">Name:</span>
//                 <span>{createdClient.name}</span>
//                 <span className="text-muted-foreground">API Key:</span>
//                 <span className="break-all">{createdClient.api_key}</span>
//               </div>
//             </div>
//           </div>
//         )}
        
//         <DialogFooter>
//           {!createdClient ? (
//             <>
//               <Button variant="outline" onClick={handleClose}>
//                 Cancel
//               </Button>
//               <Button 
//                 onClick={handleCreateClient} 
//                 disabled={!clientName || isSubmitting}
//               >
//                 {isSubmitting ? "Creating..." : "Create"}
//               </Button>
//             </>
//           ) : (
//             <Button onClick={handleClose}>
//               Done
//             </Button>
//           )}
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }