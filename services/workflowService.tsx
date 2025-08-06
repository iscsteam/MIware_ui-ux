// service/workflowService.ts
import { baseUrl } from "./api";
import { URLS } from "./url";

// Define Workflow interface (ensure to match backend schema)
export interface Workflow {
  dag_id: string;
  client_id: string;
  name: string;
}

// Create Workflow
export async function createWorkflow(data: Workflow): Promise<Workflow | null> {
  try {
    const res = await fetch(baseUrl("workflows/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create workflow");
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Get Workflow by dag_id
export async function getWorkflowByDagId(dagId: string): Promise<Workflow | null> {
  try {
    const res = await fetch(baseUrl(`workflows/dag/${dagId}`));
    if (!res.ok) throw new Error("Workflow not found");
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Update Workflow by dag_id
export async function updateWorkflow(dagId: string, data: Partial<Workflow>): Promise<Workflow | null> {
  try {
    const res = await fetch(baseUrl(`workflows/dag/${dagId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update workflow");
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Delete Workflow by dag_id
export async function deleteWorkflow(dagId: string): Promise<boolean> {
  try {
    const res = await fetch(baseUrl(`workflows/dag/${dagId}`), {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete workflow");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
