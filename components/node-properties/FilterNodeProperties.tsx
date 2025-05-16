// "use client"
// import { useState } from "react"
// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { PlusCircle, Trash2, ChevronDown, ChevronRight } from "lucide-react"
// import { useWorkflow } from "../workflow/workflow-context"

// export interface SchemaItem {
//   name: string
//   datatype: string
//   description: string
//   required?: boolean
// }

// export interface NodeSchema {
//   inputSchema: SchemaItem[]
//   outputSchema: SchemaItem[]
// }

// // Filter node schema
// export const filterSchema: NodeSchema = {
//   inputSchema: [
//     {
//       name: "data",
//       datatype: "complex",
//       description: "The data to be filtered",
//       required: true,
//     },
//   ],
//   outputSchema: [
//     {
//       name: "filteredData",
//       datatype: "complex",
//       description: "The filtered data based on the specified conditions",
//     },
//     {
//       name: "count",
//       datatype: "integer",
//       description: "The number of records in the filtered result",
//     },
//     {
//       name: "aggregations",
//       datatype: "complex",
//       description: "The result of any aggregation operations performed",
//     },
//   ],
// }

// interface Props {
//   formData: Record<string, any>
//   onChange: (name: string, value: any) => void
// }

// interface Condition {
//   field?: string
//   operation?: string
//   value?: any
//   operator?: string
//   conditions?: Condition[]
// }

// interface OrderBy {
//   field: string
//   direction: string
// }

// interface Aggregation {
//   field: string
//   function: string
// }

// export default function FilterNodeProperties({ formData, onChange }: Props) {
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState<string | null>(null)
//   const { updateNode, selectedNodeId } = useWorkflow()
//   const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

//   // Initialize filter data structure if not present
//   const filter = formData.filter || {
//     operator: "AND",
//     conditions: [],
//   }

//   const orderBy = formData.order_by || []
//   const aggregation = formData.aggregation || {
//     group_by: [],
//     aggregations: [],
//   }

//   // Toggle expansion of condition groups
//   const toggleGroupExpansion = (path: string) => {
//     setExpandedGroups((prev) => ({
//       ...prev,
//       [path]: !prev[path],
//     }))
//   }

//   // Handle changes to the filter operator (AND/OR)
//   const handleOperatorChange = (value: string) => {
//     const updatedFilter = { ...filter, operator: value }
//     onChange("filter", updatedFilter)
//   }

//   // Add a new condition to the specified path
//   const addCondition = (path = "") => {
//     const newCondition = { field: "", operation: "eq", value: "" }
//     const updatedFilter = { ...filter }

//     if (!path) {
//       // Add to root level
//       updatedFilter.conditions = [...updatedFilter.conditions, newCondition]
//     } else {
//       // Add to nested group
//       const pathParts = path.split(".")
//       let current = updatedFilter

//       for (let i = 0; i < pathParts.length; i++) {
//         const part = pathParts[i]
//         if (part === "conditions") {
//           continue
//         }
//         const index = Number.parseInt(part)
//         if (i === pathParts.length - 1) {
//           current.conditions[index].conditions = [...(current.conditions[index].conditions || []), newCondition]
//         } else {
//           current = current.conditions[index]
//         }
//       }
//     }

//     onChange("filter", updatedFilter)
//   }

//   // Add a new condition group to the specified path
//   const addConditionGroup = (path = "") => {
//     const newGroup = {
//       operator: "OR",
//       conditions: [],
//     }

//     const updatedFilter = { ...filter }

//     if (!path) {
//       // Add to root level
//       updatedFilter.conditions = [...updatedFilter.conditions, newGroup]
//     } else {
//       // Add to nested group
//       const pathParts = path.split(".")
//       let current = updatedFilter

//       for (let i = 0; i < pathParts.length; i++) {
//         const part = pathParts[i]
//         if (part === "conditions") {
//           continue
//         }
//         const index = Number.parseInt(part)
//         if (i === pathParts.length - 1) {
//           current.conditions[index].conditions = [...(current.conditions[index].conditions || []), newGroup]
//         } else {
//           current = current.conditions[index]
//         }
//       }
//     }

//     onChange("filter", updatedFilter)

//     // Auto-expand the new group
//     const newPath = path
//       ? `${path}.conditions.${(filter.conditions[Number.parseInt(path.split(".")[1])].conditions || []).length}`
//       : `conditions.${filter.conditions.length - 1}`
//     setExpandedGroups((prev) => ({
//       ...prev,
//       [newPath]: true,
//     }))
//   }

//   // Remove a condition at the specified path
//   const removeCondition = (path: string) => {
//     const pathParts = path.split(".")
//     const index = Number.parseInt(pathParts[pathParts.length - 1])

//     const updatedFilter = { ...filter }

//     if (pathParts.length === 2) {
//       // Root level condition
//       updatedFilter.conditions = updatedFilter.conditions.filter((_, i) => i !== index)
//     } else {
//       // Nested condition
//       let current = updatedFilter
//       for (let i = 0; i < pathParts.length - 2; i++) {
//         const part = pathParts[i]
//         if (part === "conditions") {
//           continue
//         }
//         current = current.conditions[Number.parseInt(part)]
//       }
//       current.conditions = current.conditions.filter((_, i) => i !== index)
//     }

//     onChange("filter", updatedFilter)
//   }

//   // Update a condition field at the specified path
//   const updateConditionField = (path: string, field: string, value: any) => {
//     const pathParts = path.split(".")
//     const index = Number.parseInt(pathParts[pathParts.length - 1])

//     const updatedFilter = { ...filter }

//     if (pathParts.length === 2) {
//       // Root level condition
//       updatedFilter.conditions[index] = {
//         ...updatedFilter.conditions[index],
//         [field]: value,
//       }
//     } else {
//       // Nested condition
//       let current = updatedFilter
//       for (let i = 0; i < pathParts.length - 2; i++) {
//         const part = pathParts[i]
//         if (part === "conditions") {
//           continue
//         }
//         current = current.conditions[Number.parseInt(part)]
//       }
//       current.conditions[index] = {
//         ...current.conditions[index],
//         [field]: value,
//       }
//     }

//     onChange("filter", updatedFilter)
//   }

//   // Add a new order by field
//   const addOrderBy = () => {
//     const newOrderBy = [...orderBy, ["", "asc"]]
//     onChange("order_by", newOrderBy)
//   }

//   // Remove an order by field
//   const removeOrderBy = (index: number) => {
//     const newOrderBy = orderBy.filter((_, i) => i !== index)
//     onChange("order_by", newOrderBy)
//   }

//   // Update an order by field
//   const updateOrderBy = (index: number, field: string, value: string) => {
//     const newOrderBy = [...orderBy]
//     if (field === "field") {
//       newOrderBy[index][0] = value
//     } else if (field === "direction") {
//       newOrderBy[index][1] = value
//     }
//     onChange("order_by", newOrderBy)
//   }

//   // Add a new group by field
//   const addGroupBy = () => {
//     const newAggregation = {
//       ...aggregation,
//       group_by: [...aggregation.group_by, ""],
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Remove a group by field
//   const removeGroupBy = (index: number) => {
//     const newAggregation = {
//       ...aggregation,
//       group_by: aggregation.group_by.filter((_, i) => i !== index),
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Update a group by field
//   const updateGroupBy = (index: number, value: string) => {
//     const newAggregation = {
//       ...aggregation,
//       group_by: aggregation.group_by.map((field, i) => (i === index ? value : field)),
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Add a new aggregation
//   const addAggregationField = () => {
//     const newAggregation = {
//       ...aggregation,
//       aggregations: [...aggregation.aggregations, ["", "sum"]],
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Remove an aggregation
//   const removeAggregationField = (index: number) => {
//     const newAggregation = {
//       ...aggregation,
//       aggregations: aggregation.aggregations.filter((_, i) => i !== index),
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Update an aggregation
//   const updateAggregationField = (index: number, field: string, value: string) => {
//     const newAggregation = {
//       ...aggregation,
//       aggregations: aggregation.aggregations.map((agg, i) => {
//         if (i === index) {
//           const newAgg = [...agg]
//           if (field === "field") {
//             newAgg[0] = value
//           } else if (field === "function") {
//             newAgg[1] = value
//           }
//           return newAgg
//         }
//         return agg
//       }),
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Recursive function to render conditions
//   const renderConditions = (conditions: Condition[], path = "conditions") => {
//     return conditions.map((condition, index) => {
//       const currentPath = `${path}.${index}`

//       if (condition.operator) {
//         // This is a condition group
//         const isExpanded = expandedGroups[currentPath] || false

//         return (
//           <div key={currentPath} className="ml-4 border-l-2 border-slate-200 pl-4 my-2">
//             <div className="flex items-center mb-2">
//               <button
//                 type="button"
//                 onClick={() => toggleGroupExpansion(currentPath)}
//                 className="mr-2 text-slate-500 hover:text-slate-700"
//               >
//                 {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
//               </button>

//               <Select
//                 value={condition.operator}
//                 onValueChange={(value) => updateConditionField(currentPath, "operator", value)}
//               >
//                 <SelectTrigger className="w-24">
//                   <SelectValue placeholder="Operator" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="AND">AND</SelectItem>
//                   <SelectItem value="OR">OR</SelectItem>
//                 </SelectContent>
//               </Select>

//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => removeCondition(currentPath)}
//                 className="ml-2 text-red-500 hover:text-red-700"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </div>

//             {isExpanded && (
//               <div className="space-y-2">
//                 {condition.conditions && condition.conditions.length > 0 ? (
//                   renderConditions(condition.conditions, `${currentPath}.conditions`)
//                 ) : (
//                   <div className="text-sm text-slate-500 italic ml-6">No conditions added</div>
//                 )}

//                 <div className="flex space-x-2 mt-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => addCondition(currentPath)}
//                     className="text-xs"
//                   >
//                     <PlusCircle className="h-3 w-3 mr-1" /> Add Condition
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => addConditionGroup(currentPath)}
//                     className="text-xs"
//                   >
//                     <PlusCircle className="h-3 w-3 mr-1" /> Add Group
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )
//       } else {
//         // This is a simple condition
//         return (
//           <div key={currentPath} className="flex items-center space-x-2 mb-2 ml-4">
//             <Input
//               placeholder="Field"
//               value={condition.field || ""}
//               onChange={(e) => updateConditionField(currentPath, "field", e.target.value)}
//               className="w-1/3"
//             />

//             <Select
//               value={condition.operation || "eq"}
//               onValueChange={(value) => updateConditionField(currentPath, "operation", value)}
//             >
//               <SelectTrigger className="w-1/4">
//                 <SelectValue placeholder="Operation" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="eq">Equal (=)</SelectItem>
//                 <SelectItem value="neq">Not Equal (!=)</SelectItem>
//                 <SelectItem value="gt">Greater Than (&gt;)</SelectItem>
//                 <SelectItem value="gte">Greater Than or Equal (&gt;=)</SelectItem>
//                 <SelectItem value="lt">Less Than (&lt;)</SelectItem>
//                 <SelectItem value="lte">Less Than or Equal (&lt;=)</SelectItem>
//                 <SelectItem value="contains">Contains</SelectItem>
//                 <SelectItem value="starts_with">Starts With</SelectItem>
//                 <SelectItem value="ends_with">Ends With</SelectItem>
//                 <SelectItem value="in">In</SelectItem>
//                 <SelectItem value="not_in">Not In</SelectItem>
//               </SelectContent>
//             </Select>

//             <Input
//               placeholder="Value"
//               value={condition.value || ""}
//               onChange={(e) => updateConditionField(currentPath, "value", e.target.value)}
//               className="w-1/3"
//             />

//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => removeCondition(currentPath)}
//               className="text-red-500 hover:text-red-700"
//             >
//               <Trash2 className="h-4 w-4" />
//             </Button>
//           </div>
//         )
//       }
//     })
//   }

//   return (
//     <div className="space-y-4">
//       <Tabs defaultValue="filter" className="w-full">
//         <TabsList className="grid grid-cols-3">
//           <TabsTrigger value="filter">Filter</TabsTrigger>
//           <TabsTrigger value="orderby">Order By</TabsTrigger>
//           <TabsTrigger value="aggregation">Aggregation</TabsTrigger>
//         </TabsList>

//         {/* Filter Tab */}
//         <TabsContent value="filter" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-sm">Filter Conditions</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex items-center space-x-2">
//                   <Label htmlFor="operator" className="min-w-24">
//                     Root Operator:
//                   </Label>
//                   <Select value={filter.operator} onValueChange={handleOperatorChange}>
//                     <SelectTrigger id="operator" className="w-24">
//                       <SelectValue placeholder="Operator" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="AND">AND</SelectItem>
//                       <SelectItem value="OR">OR</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="border rounded-md p-4 bg-slate-50">
//                   {filter.conditions && filter.conditions.length > 0 ? (
//                     renderConditions(filter.conditions)
//                   ) : (
//                     <div className="text-sm text-slate-500 italic">No conditions added</div>
//                   )}

//                   <div className="flex space-x-2 mt-4">
//                     <Button type="button" variant="outline" onClick={() => addCondition()}>
//                       <PlusCircle className="h-4 w-4 mr-2" /> Add Condition
//                     </Button>
//                     <Button type="button" variant="outline" onClick={() => addConditionGroup()}>
//                       <PlusCircle className="h-4 w-4 mr-2" /> Add Condition Group
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Order By Tab */}
//         <TabsContent value="orderby" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-sm">Sort Order</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {orderBy.length > 0 ? (
//                   orderBy.map((order: [string, string], index: number) => (
//                     <div key={index} className="flex items-center space-x-2">
//                       <Input
//                         placeholder="Field"
//                         value={order[0]}
//                         onChange={(e) => updateOrderBy(index, "field", e.target.value)}
//                         className="flex-1"
//                       />

//                       <Select value={order[1]} onValueChange={(value) => updateOrderBy(index, "direction", value)}>
//                         <SelectTrigger className="w-28">
//                           <SelectValue placeholder="Direction" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="asc">Ascending</SelectItem>
//                           <SelectItem value="desc">Descending</SelectItem>
//                         </SelectContent>
//                       </Select>

//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => removeOrderBy(index)}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-sm text-slate-500 italic">No sort order defined</div>
//                 )}

//                 <Button type="button" variant="outline" onClick={addOrderBy}>
//                   <PlusCircle className="h-4 w-4 mr-2" /> Add Sort Field
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Aggregation Tab */}
//         <TabsContent value="aggregation" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-sm">Group By</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {aggregation.group_by.length > 0 ? (
//                   aggregation.group_by.map((field: string, index: number) => (
//                     <div key={index} className="flex items-center space-x-2">
//                       <Input
//                         placeholder="Field"
//                         value={field}
//                         onChange={(e) => updateGroupBy(index, e.target.value)}
//                         className="flex-1"
//                       />

//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => removeGroupBy(index)}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-sm text-slate-500 italic">No group by fields defined</div>
//                 )}

//                 <Button type="button" variant="outline" onClick={addGroupBy}>
//                   <PlusCircle className="h-4 w-4 mr-2" /> Add Group By Field
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="text-sm">Aggregations</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {aggregation.aggregations.length > 0 ? (
//                   aggregation.aggregations.map((agg: [string, string], index: number) => (
//                     <div key={index} className="flex items-center space-x-2">
//                       <Input
//                         placeholder="Field"
//                         value={agg[0]}
//                         onChange={(e) => updateAggregationField(index, "field", e.target.value)}
//                         className="flex-1"
//                       />

//                       <Select
//                         value={agg[1]}
//                         onValueChange={(value) => updateAggregationField(index, "function", value)}
//                       >
//                         <SelectTrigger className="w-40">
//                           <SelectValue placeholder="Function" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="sum">Sum</SelectItem>
//                           <SelectItem value="avg">Average</SelectItem>
//                           <SelectItem value="min">Minimum</SelectItem>
//                           <SelectItem value="max">Maximum</SelectItem>
//                           <SelectItem value="count">Count</SelectItem>
//                           <SelectItem value="distinct_values">Distinct Values</SelectItem>
//                         </SelectContent>
//                       </Select>

//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => removeAggregationField(index)}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-sm text-slate-500 italic">No aggregations defined</div>
//                 )}

//                 <Button type="button" variant="outline" onClick={addAggregationField}>
//                   <PlusCircle className="h-4 w-4 mr-2" /> Add Aggregation
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }

// //new changes 1
// "use client"
// import { useState } from "react"
// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { PlusCircle, Trash2, ChevronDown, ChevronRight } from "lucide-react"
// import { useWorkflow } from "../workflow/workflow-context"

// export interface SchemaItem {
//   name: string
//   datatype: string
//   description: string
//   required?: boolean
// }

// export interface NodeSchema {
//   inputSchema: SchemaItem[]
//   outputSchema: SchemaItem[]
// }

// // Filter node schema
// export const filterSchema: NodeSchema = {
//   inputSchema: [
//     {
//       name: "data",
//       datatype: "complex",
//       description: "The data to be filtered",
//       required: true,
//     },
//   ],
//   outputSchema: [
//     {
//       name: "filteredData",
//       datatype: "complex",
//       description: "The filtered data based on the specified conditions",
//     },
//     {
//       name: "count",
//       datatype: "integer",
//       description: "The number of records in the filtered result",
//     },
//     {
//       name: "aggregations",
//       datatype: "complex",
//       description: "The result of any aggregation operations performed",
//     },
//   ],
// }

// interface Props {
//   formData: Record<string, any>
//   onChange: (name: string, value: any) => void
// }

// interface Condition {
//   field?: string
//   operation?: string
//   value?: any
//   operator?: string
//   conditions?: Condition[]
// }

// interface OrderBy {
//   field: string
//   direction: string
// }

// interface Aggregation {
//   field: string
//   function: string
// }

// export default function FilterNodeProperties({ formData, onChange }: Props) {
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState<string | null>(null)
//   const { updateNode, selectedNodeId } = useWorkflow()
//   const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

//   // Initialize filter data structure if not present
//   const filter = formData.filter || {
//     operator: "AND",
//     conditions: [],
//   }

//   const orderBy = formData.order_by || []
//   const aggregation = formData.aggregation || {
//     group_by: [],
//     aggregations: [],
//   }

//   // Toggle expansion of condition groups
//   const toggleGroupExpansion = (path: string) => {
//     setExpandedGroups((prev) => ({
//       ...prev,
//       [path]: !prev[path],
//     }))
//   }

//   // Handle changes to the filter operator (AND/OR)
//   const handleOperatorChange = (value: string) => {
//     const updatedFilter = { ...filter, operator: value }
//     onChange("filter", updatedFilter)
//   }

//   // Add a new condition to the specified path
//   const addCondition = (path = "") => {
//     const newCondition = { field: "", operation: "eq", value: "" }
//     const updatedFilter = { ...filter }

//     if (!path) {
//       // Add to root level
//       updatedFilter.conditions = [...updatedFilter.conditions, newCondition]
//     } else {
//       // Add to nested group
//       const pathParts = path.split(".")
//       let current = updatedFilter

//       for (let i = 0; i < pathParts.length; i++) {
//         const part = pathParts[i]
//         if (part === "conditions") {
//           continue
//         }
//         const index = Number.parseInt(part)
//         if (i === pathParts.length - 1) {
//           current.conditions[index].conditions = [...(current.conditions[index].conditions || []), newCondition]
//         } else {
//           current = current.conditions[index]
//         }
//       }
//     }

//     onChange("filter", updatedFilter)
//   }

//   // Add a new condition group to the specified path
//   const addConditionGroup = (path = "") => {
//     const newGroup = {
//       operator: "OR",
//       conditions: [],
//     }

//     const updatedFilter = { ...filter }

//     if (!path) {
//       // Add to root level
//       updatedFilter.conditions = [...updatedFilter.conditions, newGroup]
//     } else {
//       // Add to nested group
//       const pathParts = path.split(".")
//       let current = updatedFilter

//       for (let i = 0; i < pathParts.length; i++) {
//         const part = pathParts[i]
//         if (part === "conditions") {
//           continue
//         }
//         const index = Number.parseInt(part)
//         if (i === pathParts.length - 1) {
//           current.conditions[index].conditions = [...(current.conditions[index].conditions || []), newGroup]
//         } else {
//           current = current.conditions[index]
//         }
//       }
//     }

//     onChange("filter", updatedFilter)

//     // Auto-expand the new group
//     const newPath = path
//       ? `${path}.conditions.${(filter.conditions[Number.parseInt(path.split(".")[1])].conditions || []).length}`
//       : `conditions.${filter.conditions.length - 1}`
//     setExpandedGroups((prev) => ({
//       ...prev,
//       [newPath]: true,
//     }))
//   }

//   // Remove a condition at the specified path
//   const removeCondition = (path: string) => {
//     const pathParts = path.split(".")
//     const index = Number.parseInt(pathParts[pathParts.length - 1])

//     const updatedFilter = { ...filter }

//     if (pathParts.length === 2) {
//       // Root level condition
//       updatedFilter.conditions = updatedFilter.conditions.filter((_, i) => i !== index)
//     } else {
//       // Nested condition
//       let current = updatedFilter
//       for (let i = 0; i < pathParts.length - 2; i++) {
//         const part = pathParts[i]
//         if (part === "conditions") {
//           continue
//         }
//         current = current.conditions[Number.parseInt(part)]
//       }
//       current.conditions = current.conditions.filter((_, i) => i !== index)
//     }

//     onChange("filter", updatedFilter)
//   }

//   // Update a condition field at the specified path
//   const updateConditionField = (path: string, field: string, value: any) => {
//     const pathParts = path.split(".")
//     const index = Number.parseInt(pathParts[pathParts.length - 1])

//     const updatedFilter = { ...filter }

//     if (pathParts.length === 2) {
//       // Root level condition
//       updatedFilter.conditions[index] = {
//         ...updatedFilter.conditions[index],
//         [field]: value,
//       }
//     } else {
//       // Nested condition
//       let current = updatedFilter
//       for (let i = 0; i < pathParts.length - 2; i++) {
//         const part = pathParts[i]
//         if (part === "conditions") {
//           continue
//         }
//         current = current.conditions[Number.parseInt(part)]
//       }
//       current.conditions[index] = {
//         ...current.conditions[index],
//         [field]: value,
//       }
//     }

//     onChange("filter", updatedFilter)
//   }

//   // Add a new order by field
//   const addOrderBy = () => {
//     const newOrderBy = [...orderBy, ["", "asc"]]
//     onChange("order_by", newOrderBy)
//   }

//   // Remove an order by field
//   const removeOrderBy = (index: number) => {
//     const newOrderBy = orderBy.filter((_, i) => i !== index)
//     onChange("order_by", newOrderBy)
//   }

//   // Update an order by field
//   const updateOrderBy = (index: number, field: string, value: string) => {
//     const newOrderBy = [...orderBy]
//     if (field === "field") {
//       newOrderBy[index][0] = value
//     } else if (field === "direction") {
//       newOrderBy[index][1] = value
//     }
//     onChange("order_by", newOrderBy)
//   }

//   // Add a new group by field
//   const addGroupBy = () => {
//     const newAggregation = {
//       ...aggregation,
//       group_by: [...aggregation.group_by, ""],
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Remove a group by field
//   const removeGroupBy = (index: number) => {
//     const newAggregation = {
//       ...aggregation,
//       group_by: aggregation.group_by.filter((_, i) => i !== index),
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Update a group by field
//   const updateGroupBy = (index: number, value: string) => {
//     const newAggregation = {
//       ...aggregation,
//       group_by: aggregation.group_by.map((field, i) => (i === index ? value : field)),
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Add a new aggregation
//   const addAggregationField = () => {
//     const newAggregation = {
//       ...aggregation,
//       aggregations: [...aggregation.aggregations, ["", "sum"]],
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Remove an aggregation
//   const removeAggregationField = (index: number) => {
//     const newAggregation = {
//       ...aggregation,
//       aggregations: aggregation.aggregations.filter((_, i) => i !== index),
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Update an aggregation
//   const updateAggregationField = (index: number, field: string, value: string) => {
//     const newAggregation = {
//       ...aggregation,
//       aggregations: aggregation.aggregations.map((agg, i) => {
//         if (i === index) {
//           const newAgg = [...agg]
//           if (field === "field") {
//             newAgg[0] = value
//           } else if (field === "function") {
//             newAgg[1] = value
//           }
//           return newAgg
//         }
//         return agg
//       }),
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Recursive function to render conditions
//   const renderConditions = (conditions: Condition[], path = "conditions") => {
//     return conditions.map((condition, index) => {
//       const currentPath = `${path}.${index}`

//       if (condition.operator) {
//         // This is a condition group
//         const isExpanded = expandedGroups[currentPath] || false

//         return (
//           <div key={currentPath} className="ml-4 border-l-2 border-slate-200 pl-4 my-2">
//             <div className="flex items-center mb-2">
//               <button
//                 type="button"
//                 onClick={() => toggleGroupExpansion(currentPath)}
//                 className="mr-2 text-slate-500 hover:text-slate-700"
//               >
//                 {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
//               </button>

//               <Select
//                 value={condition.operator}
//                 onValueChange={(value) => updateConditionField(currentPath, "operator", value)}
//               >
//                 <SelectTrigger className="w-24">
//                   <SelectValue placeholder="Operator" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="AND">AND</SelectItem>
//                   <SelectItem value="OR">OR</SelectItem>
//                 </SelectContent>
//               </Select>

//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => removeCondition(currentPath)}
//                 className="ml-2 text-red-500 hover:text-red-700"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </div>

//             {isExpanded && (
//               <div className="space-y-2">
//                 {condition.conditions && condition.conditions.length > 0 ? (
//                   renderConditions(condition.conditions, `${currentPath}.conditions`)
//                 ) : (
//                   <div className="text-sm text-slate-500 italic ml-6">No conditions added</div>
//                 )}

//                 <div className="flex space-x-2 mt-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => addCondition(currentPath)}
//                     className="text-xs"
//                   >
//                     <PlusCircle className="h-3 w-3 mr-1" /> Add Condition
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => addConditionGroup(currentPath)}
//                     className="text-xs"
//                   >
//                     <PlusCircle className="h-3 w-3 mr-1" /> Add Group
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )
//       } else {
//         // This is a simple condition - IMPROVED RESPONSIVE LAYOUT
//         return (
//           <div key={currentPath} className="flex flex-wrap items-center gap-2 mb-2 ml-4">
//             <div className="w-full sm:w-auto flex-1 min-w-[120px]">
//               <Input
//                 placeholder="Field"
//                 value={condition.field || ""}
//                 onChange={(e) => updateConditionField(currentPath, "field", e.target.value)}
//                 className="w-full"
//               />
//             </div>

//             <div className="w-full sm:w-auto min-w-[140px]">
//               <Select
//                 value={condition.operation || "eq"}
//                 onValueChange={(value) => updateConditionField(currentPath, "operation", value)}
//               >
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Operation" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="eq">Equal (=)</SelectItem>
//                   <SelectItem value="neq">Not Equal (!=)</SelectItem>
//                   <SelectItem value="gt">Greater Than (&gt;)</SelectItem>
//                   <SelectItem value="gte">Greater Than or Equal (&gt;=)</SelectItem>
//                   <SelectItem value="lt">Less Than (&lt;)</SelectItem>
//                   <SelectItem value="lte">Less Than or Equal (&lt;=)</SelectItem>
//                   <SelectItem value="contains">Contains</SelectItem>
//                   <SelectItem value="starts_with">Starts With</SelectItem>
//                   <SelectItem value="ends_with">Ends With</SelectItem>
//                   <SelectItem value="in">In</SelectItem>
//                   <SelectItem value="not_in">Not In</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="w-full sm:w-auto flex-1 min-w-[120px]">
//               <Input
//                 placeholder="Value"
//                 value={condition.value || ""}
//                 onChange={(e) => updateConditionField(currentPath, "value", e.target.value)}
//                 className="w-full"
//               />
//             </div>

//             <div className="flex-shrink-0">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => removeCondition(currentPath)}
//                 className="text-red-500 hover:text-red-700"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         )
//       }
//     })
//   }

//   return (
//     <div className="space-y-4">
//       <Tabs defaultValue="filter" className="w-full">
//         <TabsList className="grid grid-cols-3">
//           <TabsTrigger value="filter">Filter</TabsTrigger>
//           <TabsTrigger value="orderby">Order By</TabsTrigger>
//           <TabsTrigger value="aggregation">Aggregation</TabsTrigger>
//         </TabsList>

//         {/* Filter Tab */}
//         <TabsContent value="filter" className="space-y-4">
//           <Card>
//             <CardHeader className="py-3">
//               <CardTitle className="text-sm">Filter Conditions</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex flex-wrap items-center gap-2">
//                   <Label htmlFor="operator" className="whitespace-nowrap">
//                     Root Operator:
//                   </Label>
//                   <Select value={filter.operator} onValueChange={handleOperatorChange}>
//                     <SelectTrigger id="operator" className="w-24">
//                       <SelectValue placeholder="Operator" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="AND">AND</SelectItem>
//                       <SelectItem value="OR">OR</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="border rounded-md p-4 bg-slate-50">
//                   {filter.conditions && filter.conditions.length > 0 ? (
//                     renderConditions(filter.conditions)
//                   ) : (
//                     <div className="text-sm text-slate-500 italic">No conditions added</div>
//                   )}

//                   <div className="flex flex-wrap gap-2 mt-4">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => addCondition()}
//                       className="flex-1 sm:flex-none"
//                     >
//                       <PlusCircle className="h-4 w-4 mr-2" /> Add Condition
//                     </Button>
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => addConditionGroup()}
//                       className="flex-1 sm:flex-none"
//                     >
//                       <PlusCircle className="h-4 w-4 mr-2" /> Add Condition Group
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Order By Tab */}
//         <TabsContent value="orderby" className="space-y-4">
//           <Card>
//             <CardHeader className="py-3">
//               <CardTitle className="text-sm">Sort Order</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {orderBy.length > 0 ? (
//                   orderBy.map((order: [string, string], index: number) => (
//                     <div key={index} className="flex flex-wrap items-center gap-2">
//                       <div className="w-full sm:w-auto flex-1 min-w-[120px]">
//                         <Input
//                           placeholder="Field"
//                           value={order[0]}
//                           onChange={(e) => updateOrderBy(index, "field", e.target.value)}
//                           className="w-full"
//                         />
//                       </div>

//                       <div className="w-full sm:w-auto min-w-[140px]">
//                         <Select value={order[1]} onValueChange={(value) => updateOrderBy(index, "direction", value)}>
//                           <SelectTrigger className="w-full">
//                             <SelectValue placeholder="Direction" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="asc">Ascending</SelectItem>
//                             <SelectItem value="desc">Descending</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       <div className="flex-shrink-0">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => removeOrderBy(index)}
//                           className="text-red-500 hover:text-red-700"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-sm text-slate-500 italic">No sort order defined</div>
//                 )}

//                 <Button type="button" variant="outline" onClick={addOrderBy}>
//                   <PlusCircle className="h-4 w-4 mr-2" /> Add Sort Field
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Aggregation Tab */}
//         <TabsContent value="aggregation" className="space-y-4">
//           <Card>
//             <CardHeader className="py-3">
//               <CardTitle className="text-sm">Group By</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {aggregation.group_by.length > 0 ? (
//                   aggregation.group_by.map((field: string, index: number) => (
//                     <div key={index} className="flex flex-wrap items-center gap-2">
//                       <div className="w-full sm:w-auto flex-1 min-w-[120px]">
//                         <Input
//                           placeholder="Field"
//                           value={field}
//                           onChange={(e) => updateGroupBy(index, e.target.value)}
//                           className="w-full"
//                         />
//                       </div>

//                       <div className="flex-shrink-0">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => removeGroupBy(index)}
//                           className="text-red-500 hover:text-red-700"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-sm text-slate-500 italic">No group by fields defined</div>
//                 )}

//                 <Button type="button" variant="outline" onClick={addGroupBy}>
//                   <PlusCircle className="h-4 w-4 mr-2" /> Add Group By Field
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="py-3">
//               <CardTitle className="text-sm">Aggregations</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {aggregation.aggregations.length > 0 ? (
//                   aggregation.aggregations.map((agg: [string, string], index: number) => (
//                     <div key={index} className="flex flex-wrap items-center gap-2">
//                       <div className="w-full sm:w-auto flex-1 min-w-[120px]">
//                         <Input
//                           placeholder="Field"
//                           value={agg[0]}
//                           onChange={(e) => updateAggregationField(index, "field", e.target.value)}
//                           className="w-full"
//                         />
//                       </div>

//                       <div className="w-full sm:w-auto min-w-[140px]">
//                         <Select
//                           value={agg[1]}
//                           onValueChange={(value) => updateAggregationField(index, "function", value)}
//                         >
//                           <SelectTrigger className="w-full">
//                             <SelectValue placeholder="Function" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="sum">Sum</SelectItem>
//                             <SelectItem value="avg">Average</SelectItem>
//                             <SelectItem value="min">Minimum</SelectItem>
//                             <SelectItem value="max">Maximum</SelectItem>
//                             <SelectItem value="count">Count</SelectItem>
//                             <SelectItem value="distinct_values">Distinct Values</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       <div className="flex-shrink-0">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => removeAggregationField(index)}
//                           className="text-red-500 hover:text-red-700"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-sm text-slate-500 italic">No aggregations defined</div>
//                 )}

//                 <Button type="button" variant="outline" onClick={addAggregationField}>
//                   <PlusCircle className="h-4 w-4 mr-2" /> Add Aggregation
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }


// "use client"
// import { useState, useEffect } from "react"
// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { PlusCircle, Trash2, ChevronDown, ChevronRight } from "lucide-react"
// import { useWorkflow } from "../workflow/workflow-context"

// export interface SchemaItem {
//   name: string
//   datatype: string
//   description: string
//   required?: boolean
// }

// export interface NodeSchema {
//   inputSchema: SchemaItem[]
//   outputSchema: SchemaItem[]
// }

// // Filter node schema
// export const filterSchema: NodeSchema = {
//   inputSchema: [
//     {
//       name: "data",
//       datatype: "complex",
//       description: "The data to be filtered",
//       required: true,
//     },
//   ],
//   outputSchema: [
//     {
//       name: "filteredData",
//       datatype: "complex",
//       description: "The filtered data based on the specified conditions",
//     },
//     {
//       name: "count",
//       datatype: "integer",
//       description: "The number of records in the filtered result",
//     },
//     {
//       name: "aggregations",
//       datatype: "complex",
//       description: "The result of any aggregation operations performed",
//     },
//   ],
// }

// interface Props {
//   formData: Record<string, any>
//   onChange: (name: string, value: any) => void
// }

// interface Condition {
//   field?: string
//   operation?: string
//   value?: any
//   operator?: string
//   conditions?: Condition[]
// }

// export default function FilterNodeProperties({ formData, onChange }: Props) {
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState<string | null>(null)
//   const { updateNode, selectedNodeId } = useWorkflow()
//   const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

//   // Initialize filter data structure if not present
//   const filter = formData.filter || {
//     operator: "AND",
//     conditions: [],
//   }

//   const orderBy = formData.order_by || []
//   const aggregation = formData.aggregation || {
//     group_by: [],
//     aggregations: [],
//   }

//   // Auto-expand all condition groups on initial load
//   useEffect(() => {
//     const newExpandedGroups: Record<string, boolean> = {}

//     // Function to recursively find all condition groups
//     const findConditionGroups = (conditions: Condition[], path = "conditions") => {
//       conditions.forEach((condition, index) => {
//         const currentPath = `${path}.${index}`
//         if (condition.operator && condition.conditions) {
//           newExpandedGroups[currentPath] = true
//           findConditionGroups(condition.conditions, `${currentPath}.conditions`)
//         }
//       })
//     }

//     if (filter.conditions) {
//       findConditionGroups(filter.conditions)
//       setExpandedGroups(newExpandedGroups)
//     }
//   }, [])

//   // Toggle expansion of condition groups
//   const toggleGroupExpansion = (path: string) => {
//     setExpandedGroups((prev) => ({
//       ...prev,
//       [path]: !prev[path],
//     }))
//   }

//   // Handle changes to the filter operator (AND/OR)
//   const handleOperatorChange = (value: string) => {
//     const updatedFilter = { ...filter, operator: value }
//     onChange("filter", updatedFilter)
//   }

//   // Add a new condition to the specified path
//   const addCondition = (path = "") => {
//     const newCondition = { field: "", operation: "eq", value: "" }
//     const updatedFilter = { ...filter }

//     if (!path) {
//       // Add to root level
//       updatedFilter.conditions = [...updatedFilter.conditions, newCondition]
//     } else {
//       // Add to nested group
//       const pathParts = path.split(".")
//       let current = updatedFilter

//       for (let i = 0; i < pathParts.length; i++) {
//         const part = pathParts[i]
//         if (part === "conditions") {
//           continue
//         }
//         const index = Number.parseInt(part)
//         if (i === pathParts.length - 1) {
//           if (!current.conditions[index].conditions) {
//             current.conditions[index].conditions = []
//           }
//           current.conditions[index].conditions = [...current.conditions[index].conditions, newCondition]
//         } else {
//           current = current.conditions[index]
//         }
//       }
//     }

//     onChange("filter", updatedFilter)
//   }

//   // Add a new condition group to the specified path
//   const addConditionGroup = (path = "") => {
//     const newGroup = {
//       operator: "OR",
//       conditions: [],
//     }

//     const updatedFilter = { ...filter }

//     if (!path) {
//       // Add to root level
//       updatedFilter.conditions = [...updatedFilter.conditions, newGroup]
//     } else {
//       // Add to nested group
//       const pathParts = path.split(".")
//       let current = updatedFilter

//       for (let i = 0; i < pathParts.length; i++) {
//         const part = pathParts[i]
//         if (part === "conditions") {
//           continue
//         }
//         const index = Number.parseInt(part)
//         if (i === pathParts.length - 1) {
//           if (!current.conditions[index].conditions) {
//             current.conditions[index].conditions = []
//           }
//           current.conditions[index].conditions = [...current.conditions[index].conditions, newGroup]
//         } else {
//           current = current.conditions[index]
//         }
//       }
//     }

//     onChange("filter", updatedFilter)

//     // Auto-expand the new group
//     const newPath = path
//       ? `${path}.conditions.${(current(path).conditions || []).length}`
//       : `conditions.${filter.conditions.length - 1}`
//     setExpandedGroups((prev) => ({
//       ...prev,
//       [newPath]: true,
//     }))
//   }

//   // Helper function to get a condition at a specific path
//   const current = (path: string) => {
//     if (!path) return filter

//     const pathParts = path.split(".")
//     let current = filter

//     for (let i = 0; i < pathParts.length; i++) {
//       const part = pathParts[i]
//       if (part === "conditions") continue

//       const index = Number.parseInt(part)
//       current = current.conditions[index]
//     }

//     return current
//   }

//   // Remove a condition at the specified path
//   const removeCondition = (path: string) => {
//     const pathParts = path.split(".")
//     const index = Number.parseInt(pathParts[pathParts.length - 1])

//     const updatedFilter = { ...filter }

//     if (pathParts.length === 2) {
//       // Root level condition
//       updatedFilter.conditions = updatedFilter.conditions.filter((_, i) => i !== index)
//     } else {
//       // Nested condition
//       let current = updatedFilter
//       for (let i = 0; i < pathParts.length - 2; i++) {
//         const part = pathParts[i]
//         if (part === "conditions") {
//           continue
//         }
//         current = current.conditions[Number.parseInt(part)]
//       }
//       current.conditions = current.conditions.filter((_, i) => i !== index)
//     }

//     onChange("filter", updatedFilter)
//   }

//   // Update a condition field at the specified path
//   const updateConditionField = (path: string, field: string, value: any) => {
//     const pathParts = path.split(".")
//     const index = Number.parseInt(pathParts[pathParts.length - 1])

//     const updatedFilter = { ...filter }

//     if (pathParts.length === 2) {
//       // Root level condition
//       updatedFilter.conditions[index] = {
//         ...updatedFilter.conditions[index],
//         [field]: value,
//       }
//     } else {
//       // Nested condition
//       let current = updatedFilter
//       for (let i = 0; i < pathParts.length - 2; i++) {
//         const part = pathParts[i]
//         if (part === "conditions") {
//           continue
//         }
//         current = current.conditions[Number.parseInt(part)]
//       }
//       current.conditions[index] = {
//         ...current.conditions[index],
//         [field]: value,
//       }
//     }

//     onChange("filter", updatedFilter)
//   }

//   // Convert string values to appropriate types
//   const convertValue = (value: string, operation: string) => {
//     // For numeric operations, try to convert to number
//     if (["gt", "gte", "lt", "lte"].includes(operation)) {
//       const num = Number(value)
//       return isNaN(num) ? value : num
//     }
//     return value
//   }

//   // Add a new order by field
//   const addOrderBy = () => {
//     const newOrderBy = [...orderBy, ["", "asc"]]
//     onChange("order_by", newOrderBy)
//   }

//   // Remove an order by field
//   const removeOrderBy = (index: number) => {
//     const newOrderBy = orderBy.filter((_, i) => i !== index)
//     onChange("order_by", newOrderBy)
//   }

//   // Update an order by field
//   const updateOrderBy = (index: number, field: string, value: string) => {
//     const newOrderBy = [...orderBy]
//     if (field === "field") {
//       newOrderBy[index][0] = value
//     } else if (field === "direction") {
//       newOrderBy[index][1] = value
//     }
//     onChange("order_by", newOrderBy)
//   }

//   // Add a new group by field
//   const addGroupBy = () => {
//     const newAggregation = {
//       ...aggregation,
//       group_by: [...aggregation.group_by, ""],
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Remove a group by field
//   const removeGroupBy = (index: number) => {
//     const newAggregation = {
//       ...aggregation,
//       group_by: aggregation.group_by.filter((_, i) => i !== index),
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Update a group by field
//   const updateGroupBy = (index: number, value: string) => {
//     const newAggregation = {
//       ...aggregation,
//       group_by: aggregation.group_by.map((field, i) => (i === index ? value : field)),
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Add a new aggregation
//   const addAggregationField = () => {
//     const newAggregation = {
//       ...aggregation,
//       aggregations: [...aggregation.aggregations, ["", "sum"]],
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Remove an aggregation
//   const removeAggregationField = (index: number) => {
//     const newAggregation = {
//       ...aggregation,
//       aggregations: aggregation.aggregations.filter((_, i) => i !== index),
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Update an aggregation
//   const updateAggregationField = (index: number, field: string, value: string) => {
//     const newAggregation = {
//       ...aggregation,
//       aggregations: aggregation.aggregations.map((agg, i) => {
//         if (i === index) {
//           const newAgg = [...agg]
//           if (field === "field") {
//             newAgg[0] = value
//           } else if (field === "function") {
//             newAgg[1] = value
//           }
//           return newAgg
//         }
//         return agg
//       }),
//     }
//     onChange("aggregation", newAggregation)
//   }

//   // Process value when input changes
//   const handleValueChange = (path: string, value: string) => {
//     const pathParts = path.split(".")
//     const index = Number.parseInt(pathParts[pathParts.length - 1])

//     // Get the current operation to determine how to convert the value
//     let operation = "eq"
//     if (pathParts.length === 2) {
//       operation = filter.conditions[index].operation || "eq"
//     } else {
//       let current = filter
//       for (let i = 0; i < pathParts.length - 2; i++) {
//         const part = pathParts[i]
//         if (part === "conditions") continue
//         current = current.conditions[Number.parseInt(part)]
//       }
//       operation = current.conditions[index].operation || "eq"
//     }

//     // Convert and update the value
//     const convertedValue = convertValue(value, operation)
//     updateConditionField(path, "value", convertedValue)
//   }

//   // Recursive function to render conditions
//   const renderConditions = (conditions: Condition[], path = "conditions") => {
//     return conditions.map((condition, index) => {
//       const currentPath = `${path}.${index}`

//       if (condition.operator) {
//         // This is a condition group
//         const isExpanded = expandedGroups[currentPath] || false

//         return (
//           <div key={currentPath} className="ml-4 border-l-2 border-slate-200 pl-4 my-2">
//             <div className="flex items-center mb-2">
//               <button
//                 type="button"
//                 onClick={() => toggleGroupExpansion(currentPath)}
//                 className="mr-2 text-slate-500 hover:text-slate-700"
//               >
//                 {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
//               </button>

//               <Select
//                 value={condition.operator}
//                 onValueChange={(value) => updateConditionField(currentPath, "operator", value)}
//               >
//                 <SelectTrigger className="w-24">
//                   <SelectValue placeholder="Operator" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="AND">AND</SelectItem>
//                   <SelectItem value="OR">OR</SelectItem>
//                 </SelectContent>
//               </Select>

//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => removeCondition(currentPath)}
//                 className="ml-2 text-red-500 hover:text-red-700"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </div>

//             {isExpanded && (
//               <div className="space-y-2">
//                 {condition.conditions && condition.conditions.length > 0 ? (
//                   renderConditions(condition.conditions, `${currentPath}.conditions`)
//                 ) : (
//                   <div className="text-sm text-slate-500 italic ml-6">No conditions added</div>
//                 )}

//                 <div className="flex space-x-2 mt-2">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => addCondition(currentPath)}
//                     className="text-xs"
//                   >
//                     <PlusCircle className="h-3 w-3 mr-1" /> Add Condition
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => addConditionGroup(currentPath)}
//                     className="text-xs"
//                   >
//                     <PlusCircle className="h-3 w-3 mr-1" /> Add Group
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )
//       } else {
//         // This is a simple condition - IMPROVED RESPONSIVE LAYOUT
//         return (
//           <div key={currentPath} className="flex flex-wrap items-center gap-2 mb-2 ml-4">
//             <div className="w-full sm:w-auto flex-1 min-w-[120px]">
//               <Input
//                 placeholder="Field"
//                 value={condition.field || ""}
//                 onChange={(e) => updateConditionField(currentPath, "field", e.target.value)}
//                 className="w-full"
//               />
//             </div>

//             <div className="w-full sm:w-auto min-w-[140px]">
//               <Select
//                 value={condition.operation || "eq"}
//                 onValueChange={(value) => updateConditionField(currentPath, "operation", value)}
//               >
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Operation" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="eq">Equal (=)</SelectItem>
//                   <SelectItem value="neq">Not Equal (!=)</SelectItem>
//                   <SelectItem value="gt">Greater Than (&gt;)</SelectItem>
//                   <SelectItem value="gte">Greater Than or Equal (&gt;=)</SelectItem>
//                   <SelectItem value="lt">Less Than (&lt;)</SelectItem>
//                   <SelectItem value="lte">Less Than or Equal (&lt;=)</SelectItem>
//                   <SelectItem value="contains">Contains</SelectItem>
//                   <SelectItem value="starts_with">Starts With</SelectItem>
//                   <SelectItem value="ends_with">Ends With</SelectItem>
//                   <SelectItem value="in">In</SelectItem>
//                   <SelectItem value="not_in">Not In</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="w-full sm:w-auto flex-1 min-w-[120px]">
//               <Input
//                 placeholder="Value"
//                 value={typeof condition.value === "undefined" ? "" : String(condition.value)}
//                 onChange={(e) => handleValueChange(currentPath, e.target.value)}
//                 className="w-full"
//               />
//             </div>

//             <div className="flex-shrink-0">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => removeCondition(currentPath)}
//                 className="text-red-500 hover:text-red-700"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         )
//       }
//     })
//   }

//   return (
//     <div className="space-y-4">
//       <Tabs defaultValue="filter" className="w-full">
//         <TabsList className="grid grid-cols-3">
//           <TabsTrigger value="filter">Filter</TabsTrigger>
//           <TabsTrigger value="orderby">Order By</TabsTrigger>
//           <TabsTrigger value="aggregation">Aggregation</TabsTrigger>
//         </TabsList>

//         {/* Filter Tab */}
//         <TabsContent value="filter" className="space-y-4">
//           <Card>
//             <CardHeader className="py-3">
//               <CardTitle className="text-sm">Filter Conditions</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex flex-wrap items-center gap-2">
//                   <Label htmlFor="operator" className="whitespace-nowrap">
//                     Root Operator:
//                   </Label>
//                   <Select value={filter.operator} onValueChange={handleOperatorChange}>
//                     <SelectTrigger id="operator" className="w-24">
//                       <SelectValue placeholder="Operator" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="AND">AND</SelectItem>
//                       <SelectItem value="OR">OR</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="border rounded-md p-4 bg-slate-50">
//                   {filter.conditions && filter.conditions.length > 0 ? (
//                     renderConditions(filter.conditions)
//                   ) : (
//                     <div className="text-sm text-slate-500 italic">No conditions added</div>
//                   )}

//                   <div className="flex flex-wrap gap-2 mt-4">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => addCondition()}
//                       className="flex-1 sm:flex-none"
//                     >
//                       <PlusCircle className="h-4 w-4 mr-2" /> Add Condition
//                     </Button>
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => addConditionGroup()}
//                       className="flex-1 sm:flex-none"
//                     >
//                       <PlusCircle className="h-4 w-4 mr-2" /> Add Condition Group
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Order By Tab */}
//         <TabsContent value="orderby" className="space-y-4">
//           <Card>
//             <CardHeader className="py-3">
//               <CardTitle className="text-sm">Sort Order</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {orderBy.length > 0 ? (
//                   orderBy.map((order: [string, string], index: number) => (
//                     <div key={index} className="flex flex-wrap items-center gap-2">
//                       <div className="w-full sm:w-auto flex-1 min-w-[120px]">
//                         <Input
//                           placeholder="Field"
//                           value={order[0]}
//                           onChange={(e) => updateOrderBy(index, "field", e.target.value)}
//                           className="w-full"
//                         />
//                       </div>

//                       <div className="w-full sm:w-auto min-w-[140px]">
//                         <Select value={order[1]} onValueChange={(value) => updateOrderBy(index, "direction", value)}>
//                           <SelectTrigger className="w-full">
//                             <SelectValue placeholder="Direction" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="asc">Ascending</SelectItem>
//                             <SelectItem value="desc">Descending</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       <div className="flex-shrink-0">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => removeOrderBy(index)}
//                           className="text-red-500 hover:text-red-700"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-sm text-slate-500 italic">No sort order defined</div>
//                 )}

//                 <Button type="button" variant="outline" onClick={addOrderBy}>
//                   <PlusCircle className="h-4 w-4 mr-2" /> Add Sort Field
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Aggregation Tab */}
//         <TabsContent value="aggregation" className="space-y-4">
//           <Card>
//             <CardHeader className="py-3">
//               <CardTitle className="text-sm">Group By</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {aggregation.group_by.length > 0 ? (
//                   aggregation.group_by.map((field: string, index: number) => (
//                     <div key={index} className="flex flex-wrap items-center gap-2">
//                       <div className="w-full sm:w-auto flex-1 min-w-[120px]">
//                         <Input
//                           placeholder="Field"
//                           value={field}
//                           onChange={(e) => updateGroupBy(index, e.target.value)}
//                           className="w-full"
//                         />
//                       </div>

//                       <div className="flex-shrink-0">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => removeGroupBy(index)}
//                           className="text-red-500 hover:text-red-700"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-sm text-slate-500 italic">No group by fields defined</div>
//                 )}

//                 <Button type="button" variant="outline" onClick={addGroupBy}>
//                   <PlusCircle className="h-4 w-4 mr-2" /> Add Group By Field
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="py-3">
//               <CardTitle className="text-sm">Aggregations</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {aggregation.aggregations.length > 0 ? (
//                   aggregation.aggregations.map((agg: [string, string], index: number) => (
//                     <div key={index} className="flex flex-wrap items-center gap-2">
//                       <div className="w-full sm:w-auto flex-1 min-w-[120px]">
//                         <Input
//                           placeholder="Field"
//                           value={agg[0]}
//                           onChange={(e) => updateAggregationField(index, "field", e.target.value)}
//                           className="w-full"
//                         />
//                       </div>

//                       <div className="w-full sm:w-auto min-w-[140px]">
//                         <Select
//                           value={agg[1]}
//                           onValueChange={(value) => updateAggregationField(index, "function", value)}
//                         >
//                           <SelectTrigger className="w-full">
//                             <SelectValue placeholder="Function" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="sum">Sum</SelectItem>
//                             <SelectItem value="avg">Average</SelectItem>
//                             <SelectItem value="min">Minimum</SelectItem>
//                             <SelectItem value="max">Maximum</SelectItem>
//                             <SelectItem value="count">Count</SelectItem>
//                             <SelectItem value="distinct_values">Distinct Values</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       <div className="flex-shrink-0">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => removeAggregationField(index)}
//                           className="text-red-500 hover:text-red-700"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-sm text-slate-500 italic">No aggregations defined</div>
//                 )}

//                 <Button type="button" variant="outline" onClick={addAggregationField}>
//                   <PlusCircle className="h-4 w-4 mr-2" /> Add Aggregation
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }


"use client"
import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { useWorkflow } from "../workflow/workflow-context"

export interface SchemaItem {
  name: string
  datatype: string
  description: string
  required?: boolean
}

export interface NodeSchema {
  inputSchema: SchemaItem[]
  outputSchema: SchemaItem[]
}

// Filter node schema
export const filterSchema: NodeSchema = {
  inputSchema: [
    {
      name: "data",
      datatype: "complex",
      description: "The data to be filtered",
      required: true,
    },
  ],
  outputSchema: [
    {
      name: "filteredData",
      datatype: "complex",
      description: "The filtered data based on the specified conditions",
    },
    {
      name: "count",
      datatype: "integer",
      description: "The number of records in the filtered result",
    },
    {
      name: "aggregations",
      datatype: "complex",
      description: "The result of any aggregation operations performed",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

interface Condition {
  field?: string
  operation?: string
  value?: any
  operator?: string
  conditions?: Condition[]
}

export default function FilterNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { updateNode, selectedNodeId } = useWorkflow()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  // Initialize filter data structure if not present
  const filter = formData.filter || {
    operator: "AND",
    conditions: [],
  }

  const orderBy = formData.order_by || []
  const aggregation = formData.aggregation || {
    group_by: [],
    aggregations: [],
  }

  // Auto-expand all condition groups on initial load
  useEffect(() => {
    const newExpandedGroups: Record<string, boolean> = {}

    // Function to recursively find all condition groups
    const findConditionGroups = (conditions: Condition[], path = "conditions") => {
      conditions.forEach((condition, index) => {
        const currentPath = `${path}.${index}`
        if (condition.operator && condition.conditions) {
          newExpandedGroups[currentPath] = true
          findConditionGroups(condition.conditions, `${currentPath}.conditions`)
        }
      })
    }

    if (filter.conditions) {
      findConditionGroups(filter.conditions)
      setExpandedGroups(newExpandedGroups)
    }
  }, [])

  // Toggle expansion of condition groups
  const toggleGroupExpansion = (path: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [path]: !prev[path],
    }))
  }

  // Handle changes to the filter operator (AND/OR)
  const handleOperatorChange = (value: string) => {
    const updatedFilter = { ...filter, operator: value }
    onChange("filter", updatedFilter)
  }

  // Add a new condition to the specified path
  const addCondition = (path = "") => {
    const newCondition = { field: "", operation: "eq", value: "" }
    const updatedFilter = JSON.parse(JSON.stringify(filter)) // Deep clone to avoid reference issues

    if (!path) {
      // Add to root level
      updatedFilter.conditions.push(newCondition)
    } else {
      // Add to nested group
      const pathParts = path.split(".")
      let current = updatedFilter

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i]
        if (part === "conditions") {
          continue
        }
        const index = Number.parseInt(part)
        if (i === pathParts.length - 1) {
          // Ensure the conditions array exists
          if (!current.conditions[index].conditions) {
            current.conditions[index].conditions = []
          }
          current.conditions[index].conditions.push(newCondition)
        } else {
          current = current.conditions[index]
        }
      }
    }

    onChange("filter", updatedFilter)
  }

  // Add a new condition group to the specified path
  const addConditionGroup = (path = "") => {
    const newGroup = {
      operator: "OR",
      conditions: [],
    }

    const updatedFilter = { ...filter }

    if (!path) {
      // Add to root level
      updatedFilter.conditions = [...updatedFilter.conditions, newGroup]
    } else {
      // Add to nested group
      const pathParts = path.split(".")
      let current = updatedFilter

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i]
        if (part === "conditions") {
          continue
        }
        const index = Number.parseInt(part)
        if (i === pathParts.length - 1) {
          if (!current.conditions[index].conditions) {
            current.conditions[index].conditions = []
          }
          current.conditions[index].conditions = [...current.conditions[index].conditions, newGroup]
        } else {
          current = current.conditions[index]
        }
      }
    }
    onChange("filter", updatedFilter)

    // Auto-expand the new group
    const newPath = path
      ? `${path}.conditions.${(current(path).conditions || []).length - 1}`
      : `conditions.${filter.conditions.length - 1}`
    setExpandedGroups((prev) => ({
      ...prev,
      [newPath]: true,
    }))
  }

  // Helper function to get a condition at a specific path
  const current = (path: string) => {
    if (!path) return filter

    const pathParts = path.split(".")
    let current = JSON.parse(JSON.stringify(filter)) // Deep clone

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i]
      if (part === "conditions") continue

      const index = Number.parseInt(part)
      current = current.conditions[index]
    }

    return current
  }

  // Remove a condition at the specified path
  const removeCondition = (path: string) => {
    const pathParts = path.split(".")
    const index = Number.parseInt(pathParts[pathParts.length - 1])

    const updatedFilter = { ...filter }

    if (pathParts.length === 2) {
      // Root level condition
      updatedFilter.conditions = updatedFilter.conditions.filter((_, i) => i !== index)
    } else {
      // Nested condition
      let current = updatedFilter
      for (let i = 0; i < pathParts.length - 2; i++) {
        const part = pathParts[i]
        if (part === "conditions") {
          continue
        }
        current = current.conditions[Number.parseInt(part)]
      }
      current.conditions = current.conditions.filter((_, i) => i !== index)
    }

    onChange("filter", updatedFilter)
  }

  // Update a condition field at the specified path
  const updateConditionField = (path: string, field: string, value: any) => {
    const pathParts = path.split(".")
    const index = Number.parseInt(pathParts[pathParts.length - 1])

    const updatedFilter = { ...filter }

    if (pathParts.length === 2) {
      // Root level condition
      updatedFilter.conditions[index] = {
        ...updatedFilter.conditions[index],
        [field]: value,
      }
    } else {
      // Nested condition
      let current = updatedFilter
      for (let i = 0; i < pathParts.length - 2; i++) {
        const part = pathParts[i]
        if (part === "conditions") {
          continue
        }
        current = current.conditions[Number.parseInt(part)]
      }
      current.conditions[index] = {
        ...current.conditions[index],
        [field]: value,
      }
    }

    onChange("filter", updatedFilter)
  }

  // Convert string values to appropriate types
  const convertValue = (value: string, operation: string) => {
    // For numeric operations, try to convert to number
    if (["gt", "gte", "lt", "lte"].includes(operation)) {
      const num = Number(value)
      return isNaN(num) ? value : num
    }
    return value
  }

  // Add a new order by field
  const addOrderBy = () => {
    const newOrderBy = [...orderBy, ["", "asc"]]
    onChange("order_by", newOrderBy)
  }

  // Remove an order by field
  const removeOrderBy = (index: number) => {
    const newOrderBy = orderBy.filter((_, i) => i !== index)
    onChange("order_by", newOrderBy)
  }

  // Update an order by field
  const updateOrderBy = (index: number, field: string, value: string) => {
    const newOrderBy = [...orderBy]
    if (field === "field") {
      newOrderBy[index][0] = value
    } else if (field === "direction") {
      newOrderBy[index][1] = value
    }
    onChange("order_by", newOrderBy)
  }

  // Add a new group by field
  const addGroupBy = () => {
    const newAggregation = {
      ...aggregation,
      group_by: [...aggregation.group_by, ""],
    }
    onChange("aggregation", newAggregation)
  }

  // Remove a group by field
  const removeGroupBy = (index: number) => {
    const newAggregation = {
      ...aggregation,
      group_by: aggregation.group_by.filter((_, i) => i !== index),
    }
    onChange("aggregation", newAggregation)
  }

  // Update a group by field
  const updateGroupBy = (index: number, value: string) => {
    const newAggregation = {
      ...aggregation,
      group_by: aggregation.group_by.map((field, i) => (i === index ? value : field)),
    }
    onChange("aggregation", newAggregation)
  }

  // Add a new aggregation
  const addAggregationField = () => {
    const newAggregation = {
      ...aggregation,
      aggregations: [...aggregation.aggregations, ["", "sum"]],
    }
    onChange("aggregation", newAggregation)
  }

  // Remove an aggregation
  const removeAggregationField = (index: number) => {
    const newAggregation = {
      ...aggregation,
      aggregations: aggregation.aggregations.filter((_, i) => i !== index),
    }
    onChange("aggregation", newAggregation)
  }

  // Update an aggregation
  const updateAggregationField = (index: number, field: string, value: string) => {
    const newAggregation = {
      ...aggregation,
      aggregations: aggregation.aggregations.map((agg, i) => {
        if (i === index) {
          const newAgg = [...agg]
          if (field === "field") {
            newAgg[0] = value
          } else if (field === "function") {
            newAgg[1] = value
          }
          return newAgg
        }
        return agg
      }),
    }
    onChange("aggregation", newAggregation)
  }

  // Process value when input changes
  const handleValueChange = (path: string, value: string) => {
    const pathParts = path.split(".")
    const index = Number.parseInt(pathParts[pathParts.length - 1])

    // Get the current operation to determine how to convert the value
    let operation = "eq"
    if (pathParts.length === 2) {
      operation = filter.conditions[index].operation || "eq"
    } else {
      let current = filter
      for (let i = 0; i < pathParts.length - 2; i++) {
        const part = pathParts[i]
        if (part === "conditions") continue
        current = current.conditions[Number.parseInt(part)]
      }
      operation = current.conditions[index].operation || "eq"
    }

    // Convert and update the value
    const convertedValue = convertValue(value, operation)
    updateConditionField(path, "value", convertedValue)
  }

  // Recursive function to render conditions
  const renderConditions = (conditions: Condition[], path = "conditions") => {
    return conditions.map((condition, index) => {
      const currentPath = `${path}.${index}`

      if (condition.operator) {
        // This is a condition group
        const isExpanded = expandedGroups[currentPath] || false

        return (
          <div key={currentPath} className="ml-4 border-l-2 border-slate-200 pl-4 my-2">
            <div className="flex items-center mb-2">
              <button
                type="button"
                onClick={() => toggleGroupExpansion(currentPath)}
                className="mr-2 text-slate-500 hover:text-slate-700"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              <Select
                value={condition.operator}
                onValueChange={(value) => updateConditionField(currentPath, "operator", value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCondition(currentPath)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {isExpanded && (
              <div className="space-y-2">
                {condition.conditions && condition.conditions.length > 0 ? (
                  renderConditions(condition.conditions, `${currentPath}.conditions`)
                ) : (
                  <div className="text-sm text-slate-500 italic ml-6">No conditions added</div>
                )}

                <div className="flex space-x-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCondition(currentPath)}
                    className="text-xs"
                  >
                    <PlusCircle className="h-3 w-3 mr-1" /> Add Condition
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addConditionGroup(currentPath)}
                    className="text-xs"
                  >
                    <PlusCircle className="h-3 w-3 mr-1" /> Add Group
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      } else {
        // This is a simple condition - IMPROVED RESPONSIVE LAYOUT
        return (
          <div key={currentPath} className="flex flex-wrap items-center gap-2 mb-2 ml-4">
            <div className="w-full sm:w-auto flex-1 min-w-[120px]">
              <Input
                placeholder="Field"
                value={condition.field || ""}
                onChange={(e) => updateConditionField(currentPath, "field", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="w-full sm:w-auto min-w-[140px]">
              <Select
                value={condition.operation || "eq"}
                onValueChange={(value) => updateConditionField(currentPath, "operation", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eq">Equal (=)</SelectItem>
                  <SelectItem value="neq">Not Equal (!=)</SelectItem>
                  <SelectItem value="gt">Greater Than (&gt;)</SelectItem>
                  <SelectItem value="gte">Greater Than or Equal (&gt;=)</SelectItem>
                  <SelectItem value="lt">Less Than (&lt;)</SelectItem>
                  <SelectItem value="lte">Less Than or Equal (&lt;=)</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="starts_with">Starts With</SelectItem>
                  <SelectItem value="ends_with">Ends With</SelectItem>
                  <SelectItem value="in">In</SelectItem>
                  <SelectItem value="not_in">Not In</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-auto flex-1 min-w-[120px]">
              <Input
                placeholder="Value"
                value={typeof condition.value === "undefined" ? "" : String(condition.value)}
                onChange={(e) => handleValueChange(currentPath, e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCondition(currentPath)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      }
    })
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="filter" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="filter">Filter</TabsTrigger>
          <TabsTrigger value="orderby">Order By</TabsTrigger>
          <TabsTrigger value="aggregation">Aggregation</TabsTrigger>
        </TabsList>

        {/* Filter Tab */}
        <TabsContent value="filter" className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Filter Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Label htmlFor="operator" className="whitespace-nowrap">
                    Root Operator:
                  </Label>
                  <Select value={filter.operator} onValueChange={handleOperatorChange}>
                    <SelectTrigger id="operator" className="w-24">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-md p-4 bg-slate-50">
                  {filter.conditions && filter.conditions.length > 0 ? (
                    renderConditions(filter.conditions)
                  ) : (
                    <div className="text-sm text-slate-500 italic">No conditions added</div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addCondition()}
                      className="flex-1 sm:flex-none"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Condition
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addConditionGroup()}
                      className="flex-1 sm:flex-none"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Condition Group
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Order By Tab */}
        <TabsContent value="orderby" className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Sort Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderBy.length > 0 ? (
                  orderBy.map((order: [string, string], index: number) => (
                    <div key={index} className="flex flex-wrap items-center gap-2">
                      <div className="w-full sm:w-auto flex-1 min-w-[120px]">
                        <Input
                          placeholder="Field"
                          value={order[0]}
                          onChange={(e) => updateOrderBy(index, "field", e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div className="w-full sm:w-auto min-w-[140px]">
                        <Select value={order[1]} onValueChange={(value) => updateOrderBy(index, "direction", value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Direction" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOrderBy(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500 italic">No sort order defined</div>
                )}

                <Button type="button" variant="outline" onClick={addOrderBy}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Sort Field
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aggregation Tab */}
        <TabsContent value="aggregation" className="space-y-4">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Group By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aggregation.group_by.length > 0 ? (
                  aggregation.group_by.map((field: string, index: number) => (
                    <div key={index} className="flex flex-wrap items-center gap-2">
                      <div className="w-full sm:w-auto flex-1 min-w-[120px]">
                        <Input
                          placeholder="Field"
                          value={field}
                          onChange={(e) => updateGroupBy(index, e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeGroupBy(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500 italic">No group by fields defined</div>
                )}

                <Button type="button" variant="outline" onClick={addGroupBy}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Group By Field
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Aggregations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aggregation.aggregations.length > 0 ? (
                  aggregation.aggregations.map((agg: [string, string], index: number) => (
                    <div key={index} className="flex flex-wrap items-center gap-2">
                      <div className="w-full sm:w-auto flex-1 min-w-[120px]">
                        <Input
                          placeholder="Field"
                          value={agg[0]}
                          onChange={(e) => updateAggregationField(index, "field", e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div className="w-full sm:w-auto min-w-[140px]">
                        <Select
                          value={agg[1]}
                          onValueChange={(value) => updateAggregationField(index, "function", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Function" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sum">Sum</SelectItem>
                            <SelectItem value="avg">Average</SelectItem>
                            <SelectItem value="min">Minimum</SelectItem>
                            <SelectItem value="max">Maximum</SelectItem>
                            <SelectItem value="count">Count</SelectItem>
                            <SelectItem value="distinct_values">Distinct Values</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAggregationField(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500 italic">No aggregations defined</div>
                )}

                <Button type="button" variant="outline" onClick={addAggregationField}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Aggregation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
