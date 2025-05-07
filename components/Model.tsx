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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkflowModal: FC<ModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = async () => {
    const now = new Date().toISOString();

    const newDAG = {
      name,
      created_at: now,
      updated_at: now,
      schedule: null,
      active: true,
      dag_sequence: [], // Replace with your actual sequence data
      active_dag_run: null,
    };

    const res = await createDAG(newDAG);
    if (res) {
      console.log("Created DAG:", res); // res will contain the generated `dag_id`
      onClose();
    } else {
      alert("Failed to save workflow.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        {/* This button triggers the modal */}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogDescription>
          Enter the details of the new workflow.
        </DialogDescription>

        {/* Add form fields for workflow creation */}
        <div>
          {/* Example: Text inputs for name and description */}
          <input
            type="text"
            placeholder="Workflow Name"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* <textarea
            placeholder="Description"
            className="w-full p-2 border rounded mt-2"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          /> */}
          {/* Add cron time to add sheduler to execute the node * * * * *   */}
          <input
            type="text"
            placeholder="Cron Time"
            className="w-full p-2 border rounded mt-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {/* <Button onClick={() => Handle save logic}>Save</Button> */}
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowModal;
