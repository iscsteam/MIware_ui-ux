// components/Modal.tsx
import React, { useState } from "react";
import { FC } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createDAG } from "@/services/dagService";
import {DAG} from "@/services/interface"

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkflowModal: FC<ModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [cronSchedule, setCronSchedule] = useState("");

  const handleSave = async () => {
    const now = new Date().toISOString();

    const trimmedCronSchedule = cronSchedule.trim();
    const scheduleValueForPayload = trimmedCronSchedule === "" ? null : trimmedCronSchedule;

    // --- Add this log ---
    console.log("WorkflowModal: Raw cronSchedule state:", `"${cronSchedule}"`);
    console.log("WorkflowModal: Trimmed cronSchedule:", `"${trimmedCronSchedule}"`);
    console.log("WorkflowModal: scheduleValueForPayload:", scheduleValueForPayload);
    // --- End log ---

    const newDAGPayload = {
      name,
      created_at: now,
      updated_at: now,
      schedule: scheduleValueForPayload, // Use the processed value
      active: true,
      dag_sequence: [], // Replace with your actual sequence data if needed
    };

    // --- Add this log ---
    console.log("WorkflowModal: Payload being sent to createDAG service:", newDAGPayload);
    // --- End log ---

    // The createDAG function expects a DAG type.
    // The `newDAGPayload` object is structurally compatible with the properties
    // it needs for creation (name, active, dag_sequence, and optional schedule, created_at, updated_at).
    // Casting with `as DAG` tells TypeScript to trust that this object is suitable.
    const res = await createDAG(newDAGPayload as DAG); 
    
    if (res) {
      console.log("Created DAG (response from service):", res);
      setName(""); 
      setCronSchedule(""); 
      onClose();
    } else {
      alert("Failed to save workflow.");
      // Optionally log the payload again on failure for debugging
      console.error("Failed to save workflow. Payload was:", newDAGPayload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogTrigger asChild>
        {/* Trigger */}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogDescription>
          Enter the details of the new workflow.
        </DialogDescription>

        <div className="space-y-4 py-2">
          <div>
            <label htmlFor="workflowName" className="text-sm font-medium">Workflow Name</label>
            <input
              id="workflowName"
              type="text"
              placeholder="Enter workflow name"
              className="mt-1 w-full p-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="cronSchedule" className="text-sm font-medium">Schedule (Cron Time)</label>
            <input
              id="cronSchedule"
              type="text"
              placeholder="e.g., * * * * * (leave empty for no schedule)"
              className="mt-1 w-full p-2 border rounded"
              value={cronSchedule}
              onChange={(e) => setCronSchedule(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Uses cron format. Example: '0 5 * * *' for 5 AM daily.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={!name.trim()}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowModal;