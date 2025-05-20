// components/Modal.tsx
import React, { useState, useEffect } from "react"; // Added useEffect if needed for client ID fetching
import { FC } from "react";
import {
  Dialog,
  // DialogTrigger, // DialogTrigger might not be needed if controlled by isOpen prop
  DialogContent,
  DialogTitle,
  DialogDescription,
  // DialogClose, // Can use Button with onClose directly
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createDAG } from "@/services/dagService";
import { DAG, Client } from "@/services/interface"; // Assuming Client interface is available
import { useWorkflow } from "./workflow/workflow-context"; // Import useWorkflow
// Import a function to get the current client ID if it's managed elsewhere
// For example, if you have a separate client context or a utility:
// import { useClientContext } from '@/context/ClientContext'; // Example
// OR
import { getCurrentClientId as fetchCurrentClientIdFromStorage } from "./workflow/workflow-context"; // If using the one we discussed

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowSet?: (dagDetails: DAG) => void; // Pass full DAG details
}

const WorkflowModal: FC<ModalProps> = ({ isOpen, onClose, onWorkflowSet }) => {
  const [name, setName] = useState("");
  const [cronSchedule, setCronSchedule] = useState("");
  const { clearWorkflow } = useWorkflow();

  // Option: If current client ID needs to be fetched when modal opens or from a context
  // const { currentClient } = useClientContext(); // Example if using a client context
  // const [activeClientId, setActiveClientId] = useState<string | null>(null);

  // useEffect(() => {
  //   if (isOpen) {
  //     // Example: Fetch client ID from localStorage or context when modal opens
  //     const clientId = fetchCurrentClientIdFromStorage(); // Use the utility from workflow-context
  //     // Or if from context: const clientId = currentClient?.id;
  //     setActiveClientId(clientId);
  //     if (!clientId) {
  //       console.warn("WorkflowModal: No active client ID available when opening modal. DAG creation might lack client association.");
  //       // Optionally, disable save or show a warning if no client is active
  //     }
  //   }
  // }, [isOpen /*, currentClient */]);

  const handleSave = async () => {
    const now = new Date().toISOString();
    const trimmedCronSchedule = cronSchedule.trim();
    const scheduleValueForPayload =
      trimmedCronSchedule === "" ? null : trimmedCronSchedule;

    const newDAGPayload: Partial<DAG> = {
      name: name.trim(),
      created_at: now,
      updated_at: now,
      schedule: scheduleValueForPayload,
      active: true,
      dag_sequence: [],

      // IMPORTANT: If your backend createDAG endpoint requires client_id in the payload
      // you must add it here.
      // client_id: activeClientId, // Example if you manage activeClientId state
    };

    console.log("WorkflowModal: Payload for createDAG:", newDAGPayload);

    const createdDagDetails = await createDAG(newDAGPayload as DAG); // `res` renamed to `createdDagDetails` for clarity

    if (createdDagDetails && createdDagDetails.dag_id) {
      console.log(
        "WorkflowModal: Created DAG (from service):",
        createdDagDetails
      );

      // --- INTEGRATE THE LOGIC HERE ---
      try {
        // === CRUCIAL PART ===
        // How do we get clientIdForThisDag?
        // Option 1: Backend returns it in `createdDagDetails.client_id`
        // Option 2: The `newDAGPayload` sent to `createDAG` included a `client_id`,
        //           and `createdDagDetails` might echo it back or you use the one you sent.
        // Option 3: You have a "currently selected client" from UI state/context.

        let clientIdForThisDag: string | number | undefined | null =
          createdDagDetails?.client_id;

        if (!clientIdForThisDag) {
          // If backend didn't return client_id with the DAG, try to get the "active" client ID
          // This assumes that the DAG is being created FOR the currently active client.
          const activeClientIdFromStorage = fetchCurrentClientIdFromStorage(); // Using the utility
          if (activeClientIdFromStorage) {
            clientIdForThisDag = activeClientIdFromStorage;
            console.log(
              "WorkflowModal: Using active client ID from storage for the new DAG:",
              clientIdForThisDag
            );
          }
        }

        if (!clientIdForThisDag) {
          console.error(
            "WorkflowModal: CRITICAL - Could not determine client_id for the new DAG. 'currentWorkflow' in localStorage will lack client_id. Run functionality will likely fail."
          );
          alert(
            "Workflow created, but its client association is missing. Please ensure a client is active or contact support."
          );
          // Fallback: Store without client_id, but this means 'Run' will fail the client_id check
          // Or, decide not to proceed with setting it as current if client_id is mandatory for your flow
        }

        const currentWorkflowDataToStore: any = {
          // Use 'any' for flexibility or define a specific type
          dag_id: createdDagDetails.dag_id,
          name: createdDagDetails.name,
          created_at: createdDagDetails.created_at,
          updated_at: createdDagDetails.updated_at,
          schedule: createdDagDetails.schedule,
          active: createdDagDetails.active,
          // ... other relevant properties from createdDagDetails ...
        };

        if (clientIdForThisDag) {
          currentWorkflowDataToStore.client_id = String(clientIdForThisDag);
        } else {
          console.warn(
            "WorkflowModal: Storing currentWorkflow without client_id due to missing association."
          );
        }

        localStorage.setItem(
          "currentWorkflow",
          JSON.stringify(currentWorkflowDataToStore)
        );
        console.log(
          "WorkflowModal: Set 'currentWorkflow' in localStorage:",
          currentWorkflowDataToStore
        );

        // Also, if you have a separate "currentClient" store, ensure it's consistent
        // or decide if "currentWorkflow.client_id" is the single source of truth.
        if (clientIdForThisDag) {
          // This assumes you also want to set/confirm the "currentClient" if a workflow with a client_id is made active.
          // Adjust if your "currentClient" logic is different.
          // localStorage.setItem("currentClient", JSON.stringify({
          //     id: String(clientIdForThisDag),
          //     name: createdDagDetails.client_name || "Associated Client" // If client_name comes with DAG
          // }));
        }

        clearWorkflow(); // Clear the visual editor for the new workflow

        if (onWorkflowSet) {
          onWorkflowSet(createdDagDetails); // Notify parent about the new workflow
        }
      } catch (error) {
        console.error(
          "WorkflowModal: Error setting 'currentWorkflow' in localStorage or clearing workflow:",
          error
        );
        alert(
          "Workflow created, but there was an issue setting it as the current session. Please try selecting it manually."
        );
      }
      // --- END OF INTEGRATED LOGIC ---

      setName("");
      setCronSchedule("");
      onClose(); // Close the modal
    } else {
      alert("Failed to create workflow or dag_id missing in response.");
      console.error(
        "Failed to create workflow. Response was:",
        createdDagDetails,
        "Payload was:",
        newDAGPayload
      );
    }
  };

  const handleClose = () => {
    setName("");
    setCronSchedule("");
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose(); // Use centralized close handler
        }
      }}
    >
      {/* DialogTrigger is usually outside if `isOpen` controls it */}
      <DialogContent>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogDescription>
          Enter the details for the new workflow.
        </DialogDescription>

        <div className="space-y-4 py-2">
          <div>
            <label htmlFor="workflowName" className="text-sm font-medium">
              Workflow Name
            </label>
            <input
              id="workflowName"
              type="text"
              placeholder="Enter workflow name"
              // className="mt-1 w-full p-2 border rounded"
              className="mt-1 w-full p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="cronSchedule" className="text-sm font-medium">
              Schedule (Cron Expression)
            </label>
            <input
              id="cronSchedule"
              type="text"
              placeholder="e.g., 0 5 * * * (leave empty for no schedule)"
              // className="mt-1 w-full p-2 border rounded"
              className="mt-1 w-full p-2 border rounded bg-white text-black dark:bg-gray-800 dark:text-white"
              value={cronSchedule}
              onChange={(e) => setCronSchedule(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Uses cron format. Example: '0 5 * * *' for 5 AM daily.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowModal;
