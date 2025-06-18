//components/Modal.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useWorkflow } from "@/components/workflow/workflow-context"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface WorkflowModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WorkflowModal({ isOpen, onClose }: WorkflowModalProps) {
  const [workflowName, setWorkflowName] = useState("")
  const [schedule, setSchedule] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { createNewWorkflow } = useWorkflow()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workflowName.trim()) return

    setIsLoading(true)
    try {
      console.log("[WorkflowModal] Creating workflow:", workflowName.trim())

      const { createDAG } = await import("@/services/dagService")

      // Generate a unique DAG ID
      const dagId = `dag_${workflowName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`

      const dagData = {
        name: workflowName.trim(),
        dag_id: dagId,
        schedule: schedule || null,
        dag_sequence: [], // Empty array - no default nodes
      }

      console.log("[WorkflowModal] Creating DAG with data:", dagData)

      const createdDAG = await createDAG(dagData)

      if (createdDAG) {
        console.log("[WorkflowModal] DAG created successfully:", createdDAG)

        // Use the ACTUAL DAG ID returned from Airflow, not the one we sent
        const actualDagId = createdDAG.dag_id || dagId
        console.log("[WorkflowModal] Using actual DAG ID from Airflow:", actualDagId)

        // Use the createNewWorkflow function with the ACTUAL DAG ID from Airflow
        createNewWorkflow(workflowName.trim(), actualDagId)

        toast({
          title: "Success",
          description: `Workflow "${workflowName}" created successfully!`,
        })

        // Reset form and close modal
        setWorkflowName("")
        setSchedule("")
        onClose()
      } else {
        throw new Error("Failed to create workflow")
      }
    } catch (error) {
      console.error("[WorkflowModal] Error creating workflow:", error)
      toast({
        title: "Error",
        description: "Failed to create workflow. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setWorkflowName("")
    setSchedule("")
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && workflowName.trim()) {
      handleSubmit(e)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}
    >
      <DialogContent>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogDescription>Enter the details for the new workflow.</DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label htmlFor="workflowName" className="text-sm font-medium">
              Workflow Name
            </label>
            <input
              id="workflowName"
              type="text"
              placeholder="Enter workflow name"
              className="mt-1 w-full p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <label htmlFor="cronSchedule" className="text-sm font-medium">
              Schedule (Cron Expression)
            </label>
            <input
              id="cronSchedule"
              type="text"
              placeholder="e.g., 0 5 * * * (leave empty for manual execution)"
              className="mt-1 w-full p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Uses cron format. Example: '0 5 * * *' for 5 AM daily. Leave empty for manual execution only.
            </p>
          </div>
        </form>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!workflowName.trim() || isLoading}
            className="bg-rose-500 hover:bg-rose-600"
          >
            {isLoading ? "Creating..." : "Create Workflow"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
