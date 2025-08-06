"use client"

import { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/components/ui/use-toast"

interface WorkflowModalProps {
  isOpen: boolean
  onClose: () => void
  collectionName?: string
}

export default function WorkflowModal({ isOpen, onClose, collectionName = "mi_ware" }: WorkflowModalProps) {
  const [workflowName, setWorkflowName] = useState("")
  const [schedule, setSchedule] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setWorkflowName("")
      setSchedule("")
      setError("")
      console.log("Modal opened with collection:", collectionName)
    }
  }, [isOpen, collectionName])

  const handleCreateWorkflow = async () => {
    if (!workflowName.trim()) {
      setError("Workflow name is required")
      return
    }

    setIsCreating(true)
    setError("")

    try {
      console.log("Creating workflow in collection:", collectionName)

      // Generate a unique DAG ID
      const timestamp = new Date().getTime()
      const randomStr = uuidv4().substring(0, 8)
      const safeName = workflowName.toLowerCase().replace(/[^a-z0-9]/g, "_")
      const dagId = `dag_${safeName}_${randomStr}`

      // Create the DAG
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"}/dags/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workflowName,
          dag_id: dagId,
          schedule: schedule || null,
          dag_sequence: [
            {
              id: "start",
              type: "start",
              next: ["end"],
            },
            {
              id: "end",
              type: "end",
              next: [],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create workflow: ${response.status}`)
      }

      const createdDag = await response.json()

      // Save initial workflow data to MongoDB collection
      const mongoPayload = {
        metadata: {
          name: workflowName,
          dag_id: dagId,
          schedule: schedule || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          collection: collectionName,
        },
        nodes: [
          {
            id: "start",
            type: "start",
            position: { x: 100, y: 100 },
            data: { label: "start", displayName: "Start", active: true },
          },
          {
            id: "end",
            type: "end",
            position: { x: 400, y: 100 },
            data: { label: "end", displayName: "End", active: true },
          },
        ],
        connections: [
          {
            id: uuidv4(),
            sourceId: "start",
            targetId: "end",
          },
        ],
      }

      console.log(`Saving workflow to collection: ${collectionName} with dag_id: ${dagId}`)
      const mongoResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010"}/mongo/insert_data_to_collections_or_update/${collectionName}?dag_id=${dagId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mongoPayload),
        },
      )

      if (!mongoResponse.ok) {
        console.warn("Failed to save initial workflow data to MongoDB, but DAG was created")
      }

      // Store the current workflow in localStorage
      const workflowData = {
        name: workflowName,
        dag_id: dagId,
        created_at: new Date().toISOString(),
        collection: collectionName,
      }
      localStorage.setItem("currentWorkflow", JSON.stringify(workflowData))

      toast({
        title: "Success",
        description: `Workflow "${workflowName}" created successfully in collection "${collectionName}"`,
      })

      // Trigger a refresh event for collections
      const event = new CustomEvent("refreshCollections")
      window.dispatchEvent(event)

      onClose()
    } catch (error) {
      console.error("Error creating workflow:", error)
      setError(error instanceof Error ? error.message : "Failed to create workflow")
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Workflow</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workflow Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              placeholder="Enter workflow name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (Cron Expression)</label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              placeholder="e.g., 0 0 * * * (daily at midnight) or leave empty"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for manual execution only. Use cron format for scheduled execution.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Collection</label>
            <div className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-700">
              {collectionName}
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">{error}</div>}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateWorkflow}
            disabled={isCreating || !workflowName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-500 rounded-md hover:bg-rose-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
