// //createcredentialsModal.tsx
// "use client";

// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   createCredentials,
//   type CredentialCreate,
//   type CredentialOut,
// } from "@/services/client";

// interface CreateCredentialsModalProps {
//   email: string;
//   password: string;
//   role?: string;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// export function CreateCredentialsModal({
//   open,
//   onOpenChange,
// }: CreateCredentialsModalProps) {
//   const [formData, setFormData] = useState<CredentialCreate>({
//     email: "",
//     password: "",
//     role: "user",
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [createdCredential, setCreatedCredential] =
//     useState<CredentialOut | null>(null);
//   const [errorMessage, setErrorMessage] = useState("");

//   const handleInputChange = (field: keyof CredentialCreate, value: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleCreateCredentials = async () => {
//     // Validation
//     if (!formData.email.trim() || !formData.password.trim()) {
//       setErrorMessage("Email and password are required.");
//       return;
//     }

//     // Basic email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email)) {
//       setErrorMessage("Please enter a valid email address.");
//       return;
//     }

//     if (formData.password.length < 6) {
//       setErrorMessage("Password must be at least 6 characters long.");
//       return;
//     }

//     setIsSubmitting(true);
//     setErrorMessage("");

//     try {
//       const created = await createCredentials(formData);

//       if (!created || !created.id) {
//         throw new Error("Credential creation failed or didn't return an ID.");
//       }

//       setCreatedCredential(created);
//       // Reset form
//       setFormData({
//         email: "",
//         password: "",
//         role: "user",
//       });
//     } catch (error: unknown) {
//       console.error("Failed to create credentials:", error);
//       if (
//         error instanceof TypeError &&
//         error.message.includes("Failed to fetch")
//       ) {
//         setErrorMessage(
//           "Cannot connect to the API server. Please ensure the backend service is accessible."
//         );
//       } else if (error instanceof Error) {
//         setErrorMessage(`Error: ${error.message}`);
//       } else {
//         setErrorMessage("An unknown error occurred.");
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleClose = () => {
//     // Reset all state when closing
//     setFormData({
//       email: "",
//       password: "",
//       role: "user",
//     });
//     setCreatedCredential(null);
//     setErrorMessage("");
//     setIsSubmitting(false);
//     onOpenChange(false);
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleString();
//   };

//   return (
//     <Dialog open={open} onOpenChange={handleClose}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Create New Credentials</DialogTitle>
//         </DialogHeader>

//         <hr />

//         {!createdCredential ? (
//           <div className="grid gap-4 py-4">
//             <div className="grid gap-2">
//               <Label htmlFor="credential-email">Email</Label>
//               <Input
//                 id="credential-email"
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => handleInputChange("email", e.target.value)}
//                 placeholder="Enter email address"
//                 disabled={isSubmitting}
//               />
//             </div>

//             <div className="grid gap-2">
//               <Label htmlFor="credential-password">Password</Label>
//               <Input
//                 id="credential-password"
//                 type="password"
//                 value={formData.password}
//                 onChange={(e) => handleInputChange("password", e.target.value)}
//                 placeholder="Enter password"
//                 disabled={isSubmitting}
//               />
//             </div>

//             <div className="grid gap-2">
//               <Label htmlFor="credential-role">Role</Label>
//               <Select
//                 value={formData.role}
//                 onValueChange={(value) => handleInputChange("role", value)}
//                 disabled={isSubmitting}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select role" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="user">User</SelectItem>
//                   <SelectItem value="admin">Admin</SelectItem>
//                   <SelectItem value="viewer">Viewer</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             {errorMessage && (
//               <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
//                 {errorMessage}
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="grid gap-4 py-4">
//             <div className="bg-green-50 border border-green-200 rounded-md p-4">
//               <h3 className="font-medium mb-2 text-green-800">
//                 Credentials Created Successfully!
//               </h3>
//               <hr className="my-2 border-green-200" />
//               <div className="grid grid-cols-2 gap-2 text-sm">
//                 <span className="text-green-700 font-medium">ID:</span>
//                 <span className="text-green-800">{createdCredential.id}</span>

//                 <span className="text-green-700 font-medium">Email:</span>
//                 <span className="text-green-800">
//                   {createdCredential.email}
//                 </span>

//                 <span className="text-green-700 font-medium">Role:</span>
//                 <span className="text-green-800 capitalize">
//                   {createdCredential.role}
//                 </span>

//                 <span className="text-green-700 font-medium">Client ID:</span>
//                 <span className="text-green-800 text-xs break-all">
//                   {createdCredential.unique_client_id}
//                 </span>

//                 <span className="text-green-700 font-medium">Created:</span>
//                 <span className="text-green-800 text-xs">
//                   {formatDate(createdCredential.created_at)}
//                 </span>

//                 <span className="text-green-700 font-medium">Status:</span>
//                 <span
//                   className={`text-xs px-2 py-1 rounded-full ${
//                     createdCredential.is_active
//                       ? "bg-green-100 text-green-800"
//                       : "bg-red-100 text-red-800"
//                   }`}
//                 >
//                   {createdCredential.is_active ? "Active" : "Inactive"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}

//         <hr />

//         <DialogFooter>
//           {!createdCredential ? (
//             <>
//               <Button
//                 variant="outline"
//                 onClick={handleClose}
//                 disabled={isSubmitting}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleCreateCredentials}
//                 disabled={
//                   isSubmitting ||
//                   !formData.email.trim() ||
//                   !formData.password.trim()
//                 }
//               >
//                 {isSubmitting ? "Creating..." : "Create Credentials"}
//               </Button>
//             </>
//           ) : (
//             <Button onClick={handleClose}>Done</Button>
//           )}
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
