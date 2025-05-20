// // service/api.ts

// import axios from "axios";

const BASE_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30010";

export function buildUrl(path: string) {
  return `${BASE_API}/${path}`;
}
   



// export const listCreateFileConversionConfigs = async (clientId: number | string) => {
//   try {
//     const res = await axios.get(`/clients/${clientId}/file_conversion_configs`);
//     return res.data;
//   } catch (error) {
//     console.error(`Error fetching file conversion configs for client ${clientId}:`, error);
//     throw error;
//   }
// };

// export const getDAGStatus = async (dagId: string, triggerId: string) => {
//   try {
//     const res = await axios.get(
//       `/dag_runs/get_trigger_history_dag_runs/${dagId}/triggers/${triggerId}`
//     );
//     return res.data;
//   } catch (error) {
//     console.error(`Error fetching DAG status for dag_id ${dagId}:`, error);
//     throw error;
//   }
// };



// services/api.ts
import axiosInstance from "./axiosInstance";
import axios from "axios";

export const listCreateFileConversionConfigs = async (clientId: number | string) => {
  try {
    const res = await axiosInstance.get(`/clients/${clientId}/file_conversion_configs`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching file conversion configs for client ${clientId}:`, error);
    throw error;
  }
};

// export async function getDAGStatus(dag_id: string): Promise<{ status: string }> {
//   const res = await fetch(`/dag_runs/${dag_id}/triggers`);
//   if (!res.ok) {
//     throw new Error(`Failed to fetch DAG status for ${dag_id}`);
//   }

//   const data = await res.json();

//   // Optionally include more info later
//   return {
//     status: data.status || "Unknown",
//   };
// }

export async function getDAGStatus(dag_id: string): Promise<{ status: string }> {
  try {
    const res = await axiosInstance.get(`/dag_runs/${dag_id}/triggers/17`);
    console.log("DAG status API response:", res.data); // Check structure
    return { status: res.data.status || "Unknown" };
  } catch (error) {
    console.error(`Failed to fetch DAG status for ${dag_id}:`, error);
    throw error;
  }
}
