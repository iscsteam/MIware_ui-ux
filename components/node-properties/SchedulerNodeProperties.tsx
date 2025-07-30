// //scheduler-node-properties.tsx
// "use client"

// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import { Switch } from "@/components/ui/switch"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import React, { useState } from "react"
// import { Calendar } from "@/components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Button } from "@/components/ui/button"
// import { CalendarIcon } from "lucide-react"
// import { format } from "date-fns"
// import { cn } from "@/lib/utils"

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

// // Scheduler node schema definition
// export const schedulerSchema: NodeSchema = {
//   inputSchema: [
//     {
//       name: "dag_id_to_trigger",
//       datatype: "string",
//       description: "The DAG ID to trigger when the scheduler runs.",
//       required: true,
//     },
//     {
//       name: "start_time",
//       datatype: "string",
//       description: "Start time in format 'YYYY-MM-DD HH:mm:ss' IST.",
//       required: true,
//     },
//     {
//       name: "run_once",
//       datatype: "boolean",
//       description: "Whether to run only once or repeatedly.",
//     },
//     {
//       name: "time_interval",
//       datatype: "number",
//       description: "Time interval between runs.",
//     },
//     {
//       name: "interval_unit",
//       datatype: "string",
//       description: "Unit for time interval (Minute, Hour, Day).",
//     },
//     {
//       name: "end_after_type",
//       datatype: "string",
//       description: "End condition type (always 'Occurrences').",
//     },
//     {
//       name: "end_after_value",
//       datatype: "number",
//       description: "Number of occurrences after which to end.",
//     },
//   ],
//   outputSchema: [
//     {
//       name: "id",
//       datatype: "number",
//       description: "Timer configuration ID.",
//     },
//     {
//       name: "next_run_at",
//       datatype: "string",
//       description: "Next scheduled run time.",
//     },
//     {
//       name: "run_count",
//       datatype: "number",
//       description: "Number of times the scheduler has run.",
//     },
//     {
//       name: "is_active",
//       datatype: "boolean",
//       description: "Whether the scheduler is currently active.",
//     },
//   ],
// }

// interface Props {
//   formData: Record<string, any>
//   onChange: (name: string, value: any) => void
// }

// // Helper function to get the Airflow DAG ID from localStorage
// function getAirflowDagId(): string | null {
//   try {
//     const currentWorkflow = localStorage.getItem("currentWorkflow")
//     if (currentWorkflow) {
//       const workflowData = JSON.parse(currentWorkflow)
//       console.log("Current workflow data:", workflowData)

//       // The DAG ID created in workflow-modal.tsx should be the Airflow DAG ID
//       if (workflowData.dag_id) {
//         console.log("Found Airflow DAG ID:", workflowData.dag_id)
//         return workflowData.dag_id
//       }
//     }
//   } catch (error) {
//     console.error("Error getting Airflow DAG ID from localStorage:", error)
//   }
//   return null
// }

// export default function SchedulerNodeProperties({ formData, onChange }: Props) {
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState<string | null>(null)
//   const [selectedDate, setSelectedDate] = useState<Date>()
//   const [selectedTime, setSelectedTime] = useState({ hours: "00", minutes: "00" })

//   // Auto-populate DAG ID from current workflow (Airflow DAG ID)
//   React.useEffect(() => {
//     const airflowDagId = getAirflowDagId()
//     console.log("Scheduler: Retrieved Airflow DAG ID:", airflowDagId)

//     if (airflowDagId && !formData.dag_id_to_trigger) {
//       onChange("dag_id_to_trigger", airflowDagId)
//     }
//   }, [formData.dag_id_to_trigger, onChange])

//   // Initialize individual end_after fields
//   React.useEffect(() => {
//     // Initialize end_after_type if not set
//     if (!formData.end_after_type) {
//       onChange("end_after_type", "Occurrences")
//     }

//     // Ensure end_after object structure is maintained for backward compatibility
//     if (!formData.end_after || typeof formData.end_after !== "object") {
//       onChange("end_after", {
//         type: formData.end_after_type || "Occurrences",
//         value: formData.end_after_value || undefined,
//       })
//     }
//   }, [formData.end_after_type, formData.end_after_value, formData.end_after, onChange])

//   // Handle date and time combination
//   const handleDateTimeChange = (date: Date | undefined, time?: { hours: string; minutes: string }) => {
//     if (date) {
//       setSelectedDate(date)
//       const timeToUse = time || selectedTime
//       const combinedDateTime = new Date(date)
//       combinedDateTime.setHours(Number.parseInt(timeToUse.hours), Number.parseInt(timeToUse.minutes), 0, 0)

//       // Format as required: "YYYY-MM-DD HH:mm:ss"
//       const formattedDateTime = format(combinedDateTime, "yyyy-MM-dd HH:mm:ss")
//       onChange("start_time", formattedDateTime)
//     }
//   }

//   const handleTimeChange = (field: "hours" | "minutes", value: string) => {
//     const newTime = { ...selectedTime, [field]: value }
//     setSelectedTime(newTime)
//     if (selectedDate) {
//       handleDateTimeChange(selectedDate, newTime)
//     }
//   }

//   // Handle individual end_after field changes
//   const handleEndAfterTypeChange = (value: string) => {
//     onChange("end_after_type", value)
//     // Update the end_after object for backward compatibility
//     onChange("end_after", {
//       type: value,
//       value: formData.end_after_value || undefined,
//     })
//   }

//   const handleEndAfterValueChange = (value: string) => {
//     const numericValue = value ? Number.parseInt(value) : undefined
//     onChange("end_after_value", numericValue)
//     // Update the end_after object for backward compatibility
//     onChange("end_after", {
//       type: formData.end_after_type || "Occurrences",
//       value: numericValue,
//     })
//   }

//   // Manual refresh of DAG ID
//   const handleRefreshDagId = () => {
//     const airflowDagId = getAirflowDagId()
//     if (airflowDagId) {
//       onChange("dag_id_to_trigger", airflowDagId)
//       setSuccess("DAG ID refreshed successfully!")
//       setError(null)
//     } else {
//       setError("Could not find Airflow DAG ID. Please ensure a workflow is selected.")
//     }
//   }

//   return (
//     <div className="space-y-4">
//       {/* DAG ID (Auto-populated from current workflow) */}
//       <div className="space-y-2">
//         <div className="flex items-center justify-between">
//           <Label htmlFor="dag_id_to_trigger">Target Workflow DAG ID</Label>
//           <Button variant="outline" size="sm" onClick={handleRefreshDagId}>
//             Refresh
//           </Button>
//         </div>
//         <Input
//           id="dag_id_to_trigger"
//           value={formData.dag_id_to_trigger || "No workflow selected"}
//           readOnly
//           className="bg-gray-50"
//         />
//         <div className="text-xs space-y-1">
//           <p className="text-gray-500">This scheduler will trigger the current workflow in Airflow</p>
//           {formData.dag_id_to_trigger && (
//             <p className="text-blue-600 font-mono">Airflow DAG ID: {formData.dag_id_to_trigger}</p>
//           )}
//         </div>
//       </div>

//       {/* Start Time - Date and Time Picker */}
//       <div className="space-y-2">
//         <Label>Start Time (IST)</Label>
//         <div className="flex space-x-2">
//           {/* Date Picker */}
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button
//                 variant="outline"
//                 className={cn("flex-1 justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
//               >
//                 <CalendarIcon className="mr-2 h-4 w-4" />
//                 {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0">
//               <Calendar
//                 mode="single"
//                 selected={selectedDate}
//                 onSelect={(date) => handleDateTimeChange(date)}
//                 initialFocus
//               />
//             </PopoverContent>
//           </Popover>

//           {/* Time Picker */}
//           <div className="flex space-x-1">
//             <Select value={selectedTime.hours} onValueChange={(value) => handleTimeChange("hours", value)}>
//               <SelectTrigger className="w-16">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {Array.from({ length: 24 }, (_, i) => (
//                   <SelectItem key={i} value={i.toString().padStart(2, "0")}>
//                     {i.toString().padStart(2, "0")}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <span className="flex items-center">:</span>
//             <Select value={selectedTime.minutes} onValueChange={(value) => handleTimeChange("minutes", value)}>
//               <SelectTrigger className="w-16">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {Array.from({ length: 60 }, (_, i) => (
//                   <SelectItem key={i} value={i.toString().padStart(2, "0")}>
//                     {i.toString().padStart(2, "0")}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//         {formData.start_time && <p className="text-xs text-gray-600">Selected: {formData.start_time} IST</p>}
//       </div>

//       {/* Run Once Toggle */}
//       <div className="flex items-center space-x-2">
//         <Switch
//           id="run_once"
//           checked={!!formData.run_once}
//           onCheckedChange={(checked) => onChange("run_once", checked)}
//         />
//         <Label htmlFor="run_once" className="cursor-pointer">
//           Run Once Only
//         </Label>
//       </div>

//       {/* Time Interval (only show if not run_once) */}
//       {!formData.run_once && (
//         <>
//           <div className="space-y-2">
//             <Label htmlFor="time_interval">Time Interval</Label>
//             <Input
//               id="time_interval"
//               type="number"
//               min="1"
//               value={formData.time_interval || ""}
//               placeholder="5"
//               onChange={(e) => onChange("time_interval", Number.parseInt(e.target.value) || "")}
//             />
//           </div>

//           {/* Interval Unit */}
//           <div className="space-y-2">
//             <Label htmlFor="interval_unit">Interval Unit</Label>
//             <Select
//               value={formData.interval_unit || "Minute"}
//               onValueChange={(value) => onChange("interval_unit", value)}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select interval unit" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="Minute">Minute</SelectItem>
//                 <SelectItem value="Hour">Hour</SelectItem>
//                 <SelectItem value="Day">Day</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* End After Configuration - Individual fields */}
//           <div className="space-y-2">
//             <Label>End After Configuration (Optional)</Label>
//             <div className="space-y-3 p-3 border rounded-md bg-gray-50">
//               {/* Type field - read only, always "Occurrences" */}
//               <div className="space-y-1">
//                 <Label className="text-sm font-medium">Type</Label>
//                 <Input
//                   value={formData.end_after_type || "Occurrences"}
//                   readOnly
//                   className="bg-white text-sm"
//                   onChange={(e) => handleEndAfterTypeChange(e.target.value)}
//                 />
//                 <p className="text-xs text-gray-500">Fixed value: Always "Occurrences"</p>
//               </div>

//               {/* Value field - user can input */}
//               <div className="space-y-1">
//                 <Label className="text-sm font-medium">Value</Label>
//                 <Input
//                   type="number"
//                   min="1"
//                   placeholder="Enter number of occurrences (e.g., 5)"
//                   value={formData.end_after_value || ""}
//                   onChange={(e) => handleEndAfterValueChange(e.target.value)}
//                 />
//                 <p className="text-xs text-gray-500">Leave empty to run indefinitely</p>
//               </div>

//               {/* Display current values */}
//               <div className="text-xs text-gray-600 mt-2 p-2 bg-white rounded border">
//                 <strong>Current configuration:</strong>
//                 <div className="mt-1 space-y-1">
//                   <div>Type: {formData.end_after_type || "Occurrences"}</div>
//                   <div>Value: {formData.end_after_value || "Not set"}</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Submit Button */}
//       <div>
//         <Button
//           className="w-full"
//           disabled={loading}
//           onClick={() => {
//             // This will be handled by the parent component's save functionality
//             console.log("Scheduler configuration:", {
//               dag_id_to_trigger: formData.dag_id_to_trigger,
//               start_time: formData.start_time,
//               run_once: formData.run_once,
//               time_interval: formData.time_interval,
//               interval_unit: formData.interval_unit,
//               end_after_type: formData.end_after_type,
//               end_after_value: formData.end_after_value,
//               end_after: formData.end_after,
//             })
//           }}
//         >
//           {loading ? "Configuring..." : "Configure Scheduler"}
//         </Button>
//       </div>

//       {/* Feedback */}
//       {success && <p className="text-green-500 text-sm">{success}</p>}
//       {error && <p className="text-red-500 text-sm">{error}</p>}
//     </div>
//   )
// }

"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React, { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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

// Updated scheduler node schema definition with separate end_after fields
export const schedulerSchema: NodeSchema = {
  inputSchema: [
    {
      name: "dag_id_to_trigger",
      datatype: "string",
      description: "The DAG ID to trigger when the scheduler runs.",
      required: true,
    },
    {
      name: "start_time",
      datatype: "string",
      description: "Start time in format 'YYYY-MM-DD HH:mm:ss' IST.",
      required: true,
    },
    {
      name: "run_once",
      datatype: "boolean",
      description: "Whether to run only once or repeatedly.",
    },
    {
      name: "time_interval",
      datatype: "number",
      description: "Time interval between runs.",
    },
    {
      name: "interval_unit",
      datatype: "string",
      description: "Unit for time interval (Minute, Hour, Day).",
    },
    {
      name: "end_after_type",
      datatype: "string",
      description: "End condition type (always 'Occurrences').",
    },
    {
      name: "end_after_value",
      datatype: "number",
      description: "Number of occurrences after which to end.",
    },
  ],
  outputSchema: [
    {
      name: "id",
      datatype: "number",
      description: "Timer configuration ID.",
    },
    {
      name: "next_run_at",
      datatype: "string",
      description: "Next scheduled run time.",
    },
    {
      name: "run_count",
      datatype: "number",
      description: "Number of times the scheduler has run.",
    },
    {
      name: "is_active",
      datatype: "boolean",
      description: "Whether the scheduler is currently active.",
    },
  ],
}

interface Props {
  formData: Record<string, any>
  onChange: (name: string, value: any) => void
}

// Helper function to get the Airflow DAG ID from localStorage
function getAirflowDagId(): string | null {
  try {
    const currentWorkflow = localStorage.getItem("currentWorkflow")
    if (currentWorkflow) {
      const workflowData = JSON.parse(currentWorkflow)
      console.log("Current workflow data:", workflowData)

      if (workflowData.dag_id) {
        console.log("Found Airflow DAG ID:", workflowData.dag_id)
        return workflowData.dag_id
      }
    }
  } catch (error) {
    console.error("Error getting Airflow DAG ID from localStorage:", error)
  }
  return null
}

export default function SchedulerNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState({ hours: "00", minutes: "00" })

  // Auto-populate DAG ID from current workflow (Airflow DAG ID)
  React.useEffect(() => {
    const airflowDagId = getAirflowDagId()
    console.log("Scheduler: Retrieved Airflow DAG ID:", airflowDagId)

    if (airflowDagId && !formData.dag_id_to_trigger) {
      onChange("dag_id_to_trigger", airflowDagId)
    }
  }, [formData.dag_id_to_trigger, onChange])

  // Initialize separate end_after fields and maintain backward compatibility
  React.useEffect(() => {
    // Initialize end_after_type if not set
    if (!formData.end_after_type) {
      onChange("end_after_type", "Occurrences")
    }

    // Sync individual fields with end_after object for backward compatibility
    const syncEndAfterObject = () => {
      const hasType = formData.end_after_type
      const hasValue =
        formData.end_after_value !== undefined && formData.end_after_value !== null && formData.end_after_value !== ""

      if (hasType || hasValue) {
        const endAfterObj = {
          type: formData.end_after_type || "Occurrences",
          value: hasValue ? formData.end_after_value : undefined,
        }

        // Only update if the object has changed
        const currentEndAfter = formData.end_after
        if (JSON.stringify(currentEndAfter) !== JSON.stringify(endAfterObj)) {
          onChange("end_after", endAfterObj)
        }
      }
    }

    syncEndAfterObject()
  }, [formData.end_after_type, formData.end_after_value, onChange])

  // Handle date and time combination
  const handleDateTimeChange = (date: Date | undefined, time?: { hours: string; minutes: string }) => {
    if (date) {
      setSelectedDate(date)
      const timeToUse = time || selectedTime
      const combinedDateTime = new Date(date)
      combinedDateTime.setHours(Number.parseInt(timeToUse.hours), Number.parseInt(timeToUse.minutes), 0, 0)

      // Format as required: "YYYY-MM-DD HH:mm:ss"
      const formattedDateTime = format(combinedDateTime, "yyyy-MM-dd HH:mm:ss")
      onChange("start_time", formattedDateTime)
    }
  }

  const handleTimeChange = (field: "hours" | "minutes", value: string) => {
    const newTime = { ...selectedTime, [field]: value }
    setSelectedTime(newTime)
    if (selectedDate) {
      handleDateTimeChange(selectedDate, newTime)
    }
  }

  // Handle individual end_after field changes
  const handleEndAfterTypeChange = (value: string) => {
    onChange("end_after_type", value)
  }

  const handleEndAfterValueChange = (value: string) => {
    const numericValue = value ? Number.parseInt(value) : undefined
    onChange("end_after_value", numericValue)
  }

  // Manual refresh of DAG ID
  const handleRefreshDagId = () => {
    const airflowDagId = getAirflowDagId()
    if (airflowDagId) {
      onChange("dag_id_to_trigger", airflowDagId)
      setSuccess("DAG ID refreshed successfully!")
      setError(null)
    } else {
      setError("Could not find Airflow DAG ID. Please ensure a workflow is selected.")
    }
  }

  // Generate schedule summary
  const generateScheduleSummary = () => {
    if (formData.run_once) {
      return `Run once at ${formData.start_time || "specified time"}`
    }

    const interval = formData.time_interval || "X"
    const unit = formData.interval_unit || "Minute"
    const endCondition = formData.end_after_value ? `for ${formData.end_after_value} occurrences` : "indefinitely"

    return `Run every ${interval} ${unit}(s) starting ${formData.start_time || "at specified time"} ${endCondition}`
  }

  return (
    <div className="space-y-6">
      {/* Target Workflow DAG ID */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="dag_id_to_trigger" className="text-sm font-medium">
            Target Workflow DAG ID
          </Label>
          <Button variant="outline" size="sm" onClick={handleRefreshDagId}>
            Refresh
          </Button>
        </div>
        <Input
          id="dag_id_to_trigger"
          value={formData.dag_id_to_trigger || "No workflow selected"}
          readOnly
          className="bg-gray-50"
        />
        <div className="text-xs space-y-1">
          <p className="text-gray-500">This scheduler will trigger the current workflow in Airflow</p>
          {formData.dag_id_to_trigger && (
            <p className="text-blue-600 font-mono">Airflow DAG ID: {formData.dag_id_to_trigger}</p>
          )}
        </div>
      </div>

      {/* Start Time (IST) */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Start Time (IST)</Label>
        <div className="flex space-x-2">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("flex-1 justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => handleDateTimeChange(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Time Picker */}
          <div className="flex space-x-1">
            <Select value={selectedTime.hours} onValueChange={(value) => handleTimeChange("hours", value)}>
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                    {i.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="flex items-center">:</span>
            <Select value={selectedTime.minutes} onValueChange={(value) => handleTimeChange("minutes", value)}>
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, i) => (
                  <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                    {i.toString().padStart(2, "0")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {formData.start_time && <p className="text-xs text-gray-600">Selected: {formData.start_time} IST</p>}
      </div>

      {/* Run Once Only */}
      <div className="flex items-center space-x-2">
        <Switch
          id="run_once"
          checked={!!formData.run_once}
          onCheckedChange={(checked) => onChange("run_once", checked)}
        />
        <Label htmlFor="run_once" className="cursor-pointer text-sm font-medium">
          Run Once Only
        </Label>
      </div>

      {/* Conditional fields - only show if not run_once */}
      {!formData.run_once && (
        <>
          {/* Time Interval */}
          <div className="space-y-2">
            <Label htmlFor="time_interval" className="text-sm font-medium">
              Time Interval
            </Label>
            <Input
              id="time_interval"
              type="number"
              min="1"
              value={formData.time_interval || ""}
              placeholder="5"
              onChange={(e) => onChange("time_interval", Number.parseInt(e.target.value) || "")}
            />
            <p className="text-xs text-gray-500">Enter the number of time units between runs</p>
          </div>

          {/* Interval Unit */}
          <div className="space-y-2">
            <Label htmlFor="interval_unit" className="text-sm font-medium">
              Interval Unit
            </Label>
            <Select
              value={formData.interval_unit || "Minute"}
              onValueChange={(value) => onChange("interval_unit", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interval unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Minute">Minute</SelectItem>
                <SelectItem value="Hour">Hour</SelectItem>
                <SelectItem value="Day">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* End Condition Type - Separated Field */}
          <div className="space-y-2">
            <Label htmlFor="end_after_type" className="text-sm font-medium">
              End Condition Type
            </Label>
            <Input
              id="end_after_type"
              value={formData.end_after_type || "Occurrences"}
              onChange={(e) => handleEndAfterTypeChange(e.target.value)}
              placeholder="Occurrences"
              className="bg-gray-50"
              readOnly
            />
            <p className="text-xs text-gray-500">Fixed value: Always "Occurrences"</p>
          </div>

          {/* Maximum Occurrences - Separated Field */}
          <div className="space-y-2">
            <Label htmlFor="end_after_value" className="text-sm font-medium">
              Maximum Occurrences
            </Label>
            <Input
              id="end_after_value"
              type="number"
              min="1"
              placeholder="Enter number of occurrences (e.g., 5)"
              value={formData.end_after_value || ""}
              onChange={(e) => handleEndAfterValueChange(e.target.value)}
            />
            <p className="text-xs text-gray-500">Leave empty to run indefinitely</p>
          </div>

          {/* Schedule Summary */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Schedule Summary</Label>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">{generateScheduleSummary()}</p>
              {formData.end_after_type && formData.end_after_value && (
                <div className="mt-2 text-xs text-blue-600">
                  <strong>End Condition:</strong> {formData.end_after_type} = {formData.end_after_value}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Configure Scheduler Button */}
      <div>
        <Button
          className="w-full"
          disabled={loading}
          onClick={() => {
            // This will be handled by the parent component's save functionality
            console.log("Scheduler configuration:", {
              dag_id_to_trigger: formData.dag_id_to_trigger,
              start_time: formData.start_time,
              run_once: formData.run_once,
              time_interval: formData.time_interval,
              interval_unit: formData.interval_unit,
              end_after_type: formData.end_after_type,
              end_after_value: formData.end_after_value,
              end_after: formData.end_after,
            })
          }}
        >
          {loading ? "Configuring..." : "Configure Scheduler"}
        </Button>
      </div>

      {/* Feedback */}
      {success && <p className="text-green-500 text-sm">{success}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs">
          <strong>Debug - Current Form Data:</strong>
          <pre className="mt-1 text-xs overflow-auto">
            {JSON.stringify(
              {
                dag_id_to_trigger: formData.dag_id_to_trigger,
                start_time: formData.start_time,
                run_once: formData.run_once,
                time_interval: formData.time_interval,
                interval_unit: formData.interval_unit,
                end_after_type: formData.end_after_type,
                end_after_value: formData.end_after_value,
                end_after: formData.end_after,
              },
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  )
}
