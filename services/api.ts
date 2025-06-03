

// services/api.ts

import axiosInstance from "./axiosInstance";


export const buildUrl = (path: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("Environment variable NEXT_PUBLIC_API_URL is not set");
  }

  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};

// const BASE_API = process.env.NEXT_PUBLIC_API_URL;

// /**
//  * Build full API URL by combining base URL with path.
//  * Ensures there are no double slashes.
//  */
// export function buildUrl(path: string): string {
//   const base = BASE_API?.replace(/\/+$/, "") ?? "";
//   const cleanPath = path.replace(/^\/+/, "");
//   return `${base}/${cleanPath}`;
// }

/**
 * Fetch file conversion configs for a given client.
 */
export const listCreateFileConversionConfigs = async (
  clientId: number | string
) => {
  try {
    const res = await axiosInstance.get(
      buildUrl(`/clients/${clientId}/file_conversion_configs`)
    );
    return res.data;
  } catch (error) {
    console.error(
      `Error fetching file conversion configs for client ${clientId}:`,
      error
    );
    throw error;
  }
};

/**
 * Get the DAG run status using dag_id and trigger_id.
 */
export const getDAGStatus = async (
  dagId: string,
  triggerId: string
): Promise<{ status: string }> => {
  try {
    const res = await axiosInstance.get(
      buildUrl(`/dag_runs/${dagId}/triggers/${triggerId}`)
    );
    console.log("DAG status API response:", res.data);
    return { status: res.data.status || "Unknown" };
  } catch (error) {
    console.error(`Failed to fetch DAG status for dag_id ${dagId}:`, error);
    throw error;
  }
};
