// "use client"

// import { useState, useEffect } from "react"
// import { Code, ArrowRight, Play, Loader2 } from "lucide-react"
// import { useWorkflow } from "./workflow-context"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Switch } from "@/components/ui/switch"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"

// interface NodePropertiesConfig {
//   [key: string]: {
//     fields: {
//       name: string
//       label: string
//       type: "text" | "textarea" | "boolean" | "select"
//       options?: string[]
//       placeholder?: string
//     }[]
//   }
// }

// const nodePropertiesConfig: NodePropertiesConfig = {
//   start: {
//     fields: [
//       {
//         name: "label",
//         label: "Node Label",
//         type: "text",
//         placeholder: "start",
//       },
//     ],
//   },
//   end: {
//     fields: [
//       {
//         name: "label",
//         label: "Node Label",
//         type: "text",
//         placeholder: "End",
//       },
//     ],
//   },
//   "create-file": {
//     fields: [
//       {
//         name: "label",
//         label: "Node Label",
//         type: "text",
//         placeholder: "Create File",
//       },
//       {
//         name: "filename",
//         label: "File Name",
//         type: "text",
//         placeholder: "path/to/file.txt",
//       },
//       {
//         name: "overwrite",
//         label: "Overwrite if exists",
//         type: "boolean",
//       },
//       {
//         name: "isDirectory",
//         label: "Create as directory",
//         type: "boolean",
//       },
//       {
//         name: "includeTimestamp",
//         label: "Include timestamp in name",
//         type: "boolean",
//       },
//     ],
//   },
//   "read-file": {
//     fields: [
//       {
//         name: "label",
//         label: "Node Label",
//         type: "text",
//         placeholder: "Read File",
//       },
//       {
//         name: "filename",
//         label: "File Name",
//         type: "text",
//         placeholder: "path/to/file.txt",
//       },
//       {
//         name: "encoding",
//         label: "Encoding",
//         type: "select",
//         options: ["utf-8", "ascii", "binary"],
//       },
//       {
//         name: "readAs",
//         label: "Read As",
//         type: "select",
//         options: ["text", "binary"],
//       },
//       {
//         name: "excludeContent",
//         label: "Exclude content (metadata only)",
//         type: "boolean",
//       },
//     ],
//   },
//   "write-file": {
//     fields: [
//       {
//         name: "label",
//         label: "Node Label",
//         type: "text",
//         placeholder: "Write File",
//       },
//       {
//         name: "filename",
//         label: "File Name",
//         type: "text",
//         placeholder: "path/to/file.txt",
//       },
//       {
//         name: "textContent",
//         label: "Content",
//         type: "textarea",
//         placeholder: "File content...",
//       },
//       {
//         name: "append",
//         label: "Append to file",
//         type: "boolean",
//       },
//       {
//         name: "writeAs",
//         label: "Write As",
//         type: "select",
//         options: ["text", "binary"],
//       },
//       {
//         name: "encoding",
//         label: "Encoding",
//         type: "select",
//         options: ["utf-8", "ascii", "binary"],
//       },
//       {
//         name: "addLineSeparator",
//         label: "Add line separator",
//         type: "boolean",
//       },
//     ],
//   },
//   "copy-file": {
//     fields: [
//       {
//         name: "label",
//         label: "Node Label",
//         type: "text",
//         placeholder: "Copy File",
//       },
//       {
//         name: "sourceFilename",
//         label: "Source File",
//         type: "text",
//         placeholder: "path/to/source.txt",
//       },
//       {
//         name: "targetFilename",
//         label: "Destination File",
//         type: "text",
//         placeholder: "path/to/destination.txt",
//       },
//       {
//         name: "overwrite",
//         label: "Overwrite if exists",
//         type: "boolean",
//       },
//       {
//         name: "includeSubDirectories",
//         label: "Include subdirectories",
//         type: "boolean",
//       },
//       {
//         name: "createNonExistingDirs",
//         label: "Create non-existing directories",
//         type: "boolean",
//       },
//     ],
//   },
//   code: {
//     fields: [
//       {
//         name: "label",
//         label: "Node Label",
//         type: "text",
//         placeholder: "Code",
//       },
//       {
//         name: "filename",
//         label: "Output File Name",
//         type: "text",
//         placeholder: "output.json",
//       },
//       {
//         name: "mode",
//         label: "Execution Mode",
//         type: "select",
//         options: ["runOnce", "runEach"],
//       },
//       {
//         name: "language",
//         label: "Language",
//         type: "select",
//         options: ["javascript", "python"],
//       },
//       {
//         name: "code",
//         label: "Code",
//         type: "textarea",
//         placeholder: "// Your code here",
//       },
//     ],
//   },
// }

// interface NodeModalProps {
//   nodeId: string
//   isOpen: boolean
//   onClose: () => void
// }

// export function NodeModal({ nodeId, isOpen, onClose }: NodeModalProps) {
//   const { getNodeById, updateNode, connections, nodes, executeNode } = useWorkflow()
//   const [formData, setFormData] = useState<Record<string, any>>({})
//   const [activeTab, setActiveTab] = useState("parameters")
//   const [isExecuting, setIsExecuting] = useState(false)
//   const [executionResult, setExecutionResult] = useState<any>(null)

//   const node = nodeId ? getNodeById(nodeId) : null

//   // Get all upstream nodes that connect to this node (directly or indirectly)
//   const getAllUpstreamNodes = (nodeId: string, visited = new Set<string>()): string[] => {
//     if (visited.has(nodeId)) return []
//     visited.add(nodeId)

//     const directInputs = connections.filter((conn) => conn.targetId === nodeId).map((conn) => conn.sourceId)

//     const allUpstream = [...directInputs]

//     // Recursively get upstream nodes for each direct input
//     for (const inputId of directInputs) {
//       const upstreamOfInput = getAllUpstreamNodes(inputId, visited)
//       allUpstream.push(...upstreamOfInput)
//     }

//     return [...new Set(allUpstream)] // Remove duplicates
//   }

//   // Get node inputs - find all connections where this node is the target
//   const getNodeInputs = (nodeId: string) => {
//     if (!nodeId) return []

//     const inputConnections = connections.filter((conn) => conn.targetId === nodeId)

//     return inputConnections.map((conn) => {
//       const sourceNode = nodes.find((n) => n.id === conn.sourceId)
//       return {
//         sourceNodeId: conn.sourceId,
//         sourceNodeLabel: sourceNode?.data?.label || sourceNode?.type || "Unknown",
//         data: sourceNode?.output || {},
//         status: sourceNode?.status || "idle",
//       }
//     })
//   }

//   // Get all upstream node outputs that might be relevant to this node
//   const getAllUpstreamOutputs = (nodeId: string) => {
//     const upstreamNodeIds = getAllUpstreamNodes(nodeId)

//     return upstreamNodeIds.map((id) => {
//       const node = nodes.find((n) => n.id === id)
//       return {
//         sourceNodeId: id,
//         sourceNodeLabel: node?.data?.label || node?.type || "Unknown",
//         data: node?.output || {},
//         status: node?.status || "idle",
//         // Add distance or path information if needed
//       }
//     })
//   }

//   // Get node output
//   const getNodeOutput = (nodeId: string) => {
//     if (!nodeId) return null

//     const node = nodes.find((n) => n.id === nodeId)
//     return node?.output || null
//   }

//   const nodeInputs = nodeId ? getNodeInputs(nodeId) : []
//   const allUpstreamOutputs = nodeId ? getAllUpstreamOutputs(nodeId) : []
//   const nodeOutput = nodeId ? getNodeOutput(nodeId) : null

//   useEffect(() => {
//     if (node) {
//       setFormData(node.data || {})
//     }
//   }, [node])

//   useEffect(() => {
//     // Update execution result when node output changes
//     if (node) {
//       setExecutionResult(node.output)
//     }
//   }, [node])

//   if (!node) return null

//   const nodeTypeKey = node.type ? node.type.toLowerCase() : ""
//   const config = nodePropertiesConfig[nodeTypeKey]

//   const handleChange = (name: string, value: any) => {
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handleSave = () => {
//     updateNode(nodeId, { data: formData })
//     onClose()
//   }

//   const handleRunNode = async () => {
//     if (!nodeId) return

//     setIsExecuting(true)
//     try {
//       // Save current form data before executing
//       updateNode(nodeId, { data: formData })

//       // Execute the node
//       const result = await executeNode(nodeId)
//       setExecutionResult(result)
//     } catch (error) {
//       console.error("Error executing node:", error)
//     } finally {
//       setIsExecuting(false)
//     }
//   }

//   const renderFields = () => {
//     if (!config) {
//       return (
//         <div className="text-sm text-muted-foreground italic p-2 border border-dashed rounded">
//           No configuration found for node type: "{node.type}".
//         </div>
//       )
//     }

//     if (!config.fields || config.fields.length === 0) {
//       return <div className="text-sm text-muted-foreground">This node type has no configurable properties.</div>
//     }

//     return (
//       <div className="space-y-4">
//         {config.fields.map((field) => (
//           <div key={field.name} className="space-y-2">
//             <Label htmlFor={field.name}>{field.label}</Label>

//             {field.type === "text" && (
//               <Input
//                 id={field.name}
//                 value={formData[field.name] || ""}
//                 placeholder={field.placeholder}
//                 onChange={(e) => handleChange(field.name, e.target.value)}
//               />
//             )}

//             {field.type === "textarea" && (
//               <Textarea
//                 id={field.name}
//                 value={formData[field.name] || ""}
//                 placeholder={field.placeholder}
//                 onChange={(e) => handleChange(field.name, e.target.value)}
//                 rows={4}
//                 className={field.name === "code" ? "font-mono text-sm h-60" : ""}
//               />
//             )}

//             {field.type === "boolean" && (
//               <div className="flex items-center space-x-2">
//                 <Switch
//                   id={field.name}
//                   checked={formData[field.name] || false}
//                   onCheckedChange={(checked) => handleChange(field.name, checked)}
//                 />
//                 <Label htmlFor={field.name} className="cursor-pointer">
//                   Enabled
//                 </Label>
//               </div>
//             )}

//             {field.type === "select" && field.options && (
//               <Select
//                 value={formData[field.name] ?? (field.options.length > 0 ? field.options[0] : "")}
//                 onValueChange={(value) => handleChange(field.name, value)}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder={`Select ${field.label}`} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {field.options.map((option) => (
//                     <SelectItem key={option} value={option}>
//                       {option}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             )}
//           </div>
//         ))}
//       </div>
//     )
//   }

//   const renderInputs = () => {
//     // Show direct inputs first
//     const directInputs = nodeInputs
//     // Then show other upstream outputs that might be relevant
//     const indirectInputs = allUpstreamOutputs.filter(
//       (upstream) => !directInputs.some((direct) => direct.sourceNodeId === upstream.sourceNodeId),
//     )

//     if (directInputs.length === 0 && indirectInputs.length === 0) {
//       return (
//         <div className="text-sm text-muted-foreground italic p-4 border border-dashed rounded text-center">
//           No input data available. Connect this node to an output node.
//         </div>
//       )
//     }

//     return (
//       <div className="space-y-6">
//         {/* Direct inputs section */}
//         {directInputs.length > 0 && (
//           <div className="space-y-4">
//             <h3 className="text-sm font-medium text-muted-foreground">Direct Inputs</h3>
//             {directInputs.map((input, index) => (
//               <div key={index} className="border rounded p-3">
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="text-sm font-medium">{input.sourceNodeLabel}</div>
//                   <Badge
//                     variant={
//                       input.status === "success"
//                         ? "default"
//                         : input.status === "error"
//                           ? "destructive"
//                           : input.status === "running"
//                             ? "outline"
//                             : "secondary"
//                     }
//                     className="text-xs"
//                   >
//                     {input.status}
//                   </Badge>
//                 </div>
//                 <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
//                   {JSON.stringify(input.data, null, 2)}
//                 </pre>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Indirect inputs section */}
//         {indirectInputs.length > 0 && (
//           <div className="space-y-4">
//             <h3 className="text-sm font-medium text-muted-foreground">Upstream Outputs</h3>
//             {indirectInputs.map((input, index) => (
//               <div key={index} className="border border-dashed rounded p-3 opacity-80">
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="text-sm font-medium">{input.sourceNodeLabel}</div>
//                   <Badge variant="outline" className="text-xs">
//                     indirect
//                   </Badge>
//                 </div>
//                 <pre className="bg-muted/50 p-2 rounded text-xs overflow-auto max-h-40">
//                   {JSON.stringify(input.data, null, 2)}
//                 </pre>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     )
//   }

//   const renderOutput = () => {
//     const output = executionResult || nodeOutput

//     if (!output) {
//       return (
//         <div className="text-sm text-muted-foreground italic p-4 border border-dashed rounded text-center">
//           Execute this node to view output data or set mock data.
//         </div>
//       )
//     }

//     return (
//       <div className="space-y-4">
//         <div className="flex items-center justify-between mb-2">
//           <div className="text-sm font-medium">Output Data</div>
//           <Badge
//             variant={
//               node.status === "success"
//                 ? "default"
//                 : node.status === "error"
//                   ? "destructive"
//                   : node.status === "running"
//                     ? "outline"
//                     : "secondary"
//             }
//             className="text-xs"
//           >
//             {node.status || "idle"}
//           </Badge>
//         </div>
//         <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-80">{JSON.stringify(output, null, 2)}</pre>
//         <Button variant="outline" size="sm" className="w-full">
//           Set mock data

//         </Button>
//       </div>
//     )
//   }

//   const getNodeIcon = () => {
//     switch (node.type) {
//       case "code":
//         return <Code className="h-5 w-5 mr-2" />
//       default:
//         return <ArrowRight className="h-5 w-5 mr-2" />
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
//       <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden max-h-[90vh]">
//         <DialogHeader className="p-4 border-b">
//           <DialogTitle className="flex items-center">
//             {getNodeIcon()}
//             {node.type
//               .split("-")
//               .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//               .join(" ")}

//             {/* Run Button - positioned top right before the X */}
//             <Button
//               size="sm"
//               onClick={handleRunNode}
//               disabled={isExecuting}
//               className="absolute top-2 right-12 text-xs"
//             >
//               {isExecuting ? (
//                 <>
//                   <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                   Running...
//                 </>
//               ) : (
//                 <>
//                   <Play className="h-3 w-3 mr-1" />
//                   Run
//                 </>
//               )}
//             </Button>
//           </DialogTitle>
//         </DialogHeader>

//         <div className="grid grid-cols-1 md:grid-cols-3 h-[500px]">
//           {/* Left column - Input */}
//           <div className="border-r overflow-hidden flex flex-col">
//             <div className="bg-muted/30 px-4 py-2 font-medium text-sm border-b">INPUT</div>
//             <div className="overflow-y-auto p-4 flex-1">{renderInputs()}</div>
//           </div>

//           {/* Middle column - Parameters */}
//           <div className="border-r overflow-hidden flex flex-col">
//             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col h-full">
//               <div className="bg-background border-b">
//                 <TabsList className="grid grid-cols-2 w-full rounded-none">
//                   <TabsTrigger value="parameters" className="rounded-none">
//                     Parameters
//                   </TabsTrigger>
//                   <TabsTrigger value="settings" className="rounded-none">
//                     Settings
//                   </TabsTrigger>
//                 </TabsList>
//               </div>

//               <div className="overflow-y-auto p-4 flex-1">
//                 <TabsContent value="parameters" className="m-0 h-full">
//                   {renderFields()}
//                 </TabsContent>
//                 <TabsContent value="settings" className="m-0 h-full">
//                   <div className="space-y-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="active">Node Active</Label>
//                       <div className="flex items-center space-x-2">
//                         <Switch
//                           id="active"
//                           checked={formData.active !== false}
//                           onCheckedChange={(checked) => handleChange("active", checked)}
//                         />
//                         <Label htmlFor="active" className="cursor-pointer">
//                           {formData.active !== false ? "Enabled" : "Disabled"}
//                         </Label>
//                       </div>
//                       <p className="text-xs text-muted-foreground">
//                         When disabled, this node will be skipped during workflow execution
//                       </p>
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="description">Description</Label>
//                       <Textarea
//                         id="description"
//                         value={formData.description || ""}
//                         placeholder="Add a description for this node..."
//                         onChange={(e) => handleChange("description", e.target.value)}
//                         rows={3}
//                       />
//                     </div>
//                   </div>
//                 </TabsContent>
//               </div>
//             </Tabs>
//           </div>

//           {/* Right column - Output */}
//           <div className="overflow-hidden flex flex-col">
//             <div className="bg-muted/30 px-4 py-2 font-medium text-sm border-b">OUTPUT</div>
//             <div className="overflow-y-auto p-4 flex-1">{renderOutput()}</div>
//           </div>
//         </div>

//         <div className="flex justify-end gap-2 p-4 border-t">
//           <Button variant="outline" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button onClick={handleSave}>Save</Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }
"use client";
import React, { useState, useEffect } from "react";
import { Code, ArrowRight, Play, Loader2 } from "lucide-react";
import { useWorkflow } from "./workflow-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import CreateFileNodeProperties from "@/components/node-properties/CreateFileNodeProperties"
import CopyFileNodeProperties from "@/components/node-properties/CopyFileNodeProperties"
import ReadFileNodeProperties from "@/components/node-properties/CopyFileNodeProperties"

const NodePropertyComponents: Record<string, React.FC<any>> = {
  "create-file": CreateFileNodeProperties,
  "read-file": ReadFileNodeProperties,
  "copy-file": CopyFileNodeProperties,
  // …add your others here
};

interface NodeModalProps {
  nodeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NodeModal({ nodeId, isOpen, onClose }: NodeModalProps) {
  const { getNodeById, updateNode, connections, nodes, executeNode } = useWorkflow();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<"parameters" | "settings">("parameters");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const node = getNodeById(nodeId);
  useEffect(() => {
    if (node) setFormData(node.data ?? {});
  }, [nodeId, node]);

  // carry over your existing getNodeInputs / getAllUpstreamOutputs / renderInputs / renderOutput logic…

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSave = () => {
    updateNode(nodeId, { data: formData });
    onClose();
  };
  const handleRun = async () => {
    setIsExecuting(true);
    await updateNode(nodeId, { data: formData });
    const res = await executeNode(nodeId);
    setExecutionResult(res);
    setIsExecuting(false);
  };

  if (!node) return null;
  const NodePropsComponent = NodePropertyComponents[node.type];

  const getNodeIcon = () =>
    node.type === "code" ? <Code className="h-5 w-5 mr-2" /> : <ArrowRight className="h-5 w-5 mr-2" />;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center">
            {getNodeIcon()}
            {node.type
              .split("-")
              .map((w) => w[0].toUpperCase() + w.slice(1))
              .join(" ")}
            <Button
              size="sm"
              onClick={handleRun}
              disabled={isExecuting}
              className="absolute top-2 right-12 text-xs"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </>
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 h-[500px]">
          {/* INPUT column */}
          <div className="border-r flex flex-col">
            <div className="bg-muted/30 px-4 py-2 font-medium text-sm border-b">INPUT</div>
            <div className="p-4 overflow-y-auto flex-1">{/* your renderInputs() here */}</div>
          </div>

          {/* PARAMETERS & SETTINGS column */}
          <div className="border-r flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="grid grid-cols-2 bg-background border-b">
                <TabsTrigger value="parameters">Parameters</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <div className="p-4 overflow-y-auto flex-1">
                <TabsContent value="parameters">
                  {NodePropsComponent ? (
                    <NodePropsComponent formData={formData} onChange={handleChange} />
                  ) : (
                    <div className="italic text-sm text-muted-foreground">
                      No parameters for this node type.
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="settings">
                  {/* your settings panel (active switch, description textarea) */}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* OUTPUT column */}
          <div className="flex flex-col">
            <div className="bg-muted/30 px-4 py-2 font-medium text-sm border-b">OUTPUT</div>
            <div className="p-4 overflow-y-auto flex-1">{/* your renderOutput() here */}</div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
