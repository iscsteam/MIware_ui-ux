import { baseUrl } from "@/services/api"; // Assuming this handles base URLs etc.
import { URLS } from "./url"; // Assuming this contains endpoint constants
import { Client, ClientCreateResponse , DAG} from "@/services/interface"; // Ensure Client type is defined


/**
 * Fetches a list of all clients.
 * @returns A promise that resolves to an array of clients or null if an error occurs.
 */
export async function fetchClients(): Promise<Client[] | null> {
  try {
    const res = await fetch(baseUrl(URLS.listCreateClients));
    if (!res.ok) {
      let errorDetails = "Failed to fetch clients";
      try {
        const errorBody = await res.json(); // Or res.text() if error isn't always JSON
        errorDetails = errorBody.message || JSON.stringify(errorBody);
      } catch (e) {
        // Fallback if error body isn't JSON or can't be read
        errorDetails = `${res.status} ${res.statusText}`;
      }
      console.error("Failed to fetch clients:", errorDetails);
      throw new Error(`Fetch clients failed: ${errorDetails}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error in fetchClients:", error);
    return null;
  }
}

/**
 * Creates a new client.
 * @param newClient - The client data to create.
 * @returns A promise that resolves to the created client response or null if an error occurs.
 */
export async function createClient(newClient: Client): Promise<ClientCreateResponse | null> {
  // Or: export async function createClient(newClient: Omit<Client, 'id'>): ...
  try {
    console.log("Creating client with payload:", newClient);

    const res = await fetch(baseUrl(URLS.listCreateClients), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClient),
    });

    if (!res.ok) {
      let errorDetails = `Create failed: ${res.status}`;
      try {
        const errorBody = await res.json(); // Or res.text()
        errorDetails = errorBody.message || JSON.stringify(errorBody);
      } catch (e) {
         errorDetails = `${res.status} ${res.statusText}, Body: ${await res.text().catch(() => 'Could not read body')}`;
      }
      console.error("Failed to create client:", errorDetails);
      throw new Error(`Create client failed: ${errorDetails}`);
    }

    const data: ClientCreateResponse = await res.json();
    return data;
  } catch (error) {
    console.error("Error in createClient:", error);
    return null;
  }
}

/**
 * Fetches a single client by its ID.
 * @param clientId - The ID of the client to fetch.
 * @returns A promise that resolves to the client or null if not found or an error occurs.
 */
export async function getClientById(clientId: string | number): Promise<Client | null> {
  try {
    const res = await fetch(baseUrl(URLS.manageClient(clientId))); // Assuming manageClient(id) gives GET /clients/:id
    if (!res.ok) {
      let errorDetails = "Failed to fetch client by ID";
      if (res.status === 404) {
        errorDetails = `Client with ID ${clientId} not found.`;
      } else {
        try {
          const errorBody = await res.json(); // Or res.text()
          errorDetails = errorBody.message || JSON.stringify(errorBody);
        } catch (e) {
          errorDetails = `${res.status} ${res.statusText}`;
        }
      }
      console.error("Failed to fetch client by ID:", errorDetails);
      throw new Error(`Fetch client by ID failed: ${errorDetails}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Error in getClientById for ID ${clientId}:`, error);
    return null;
  }
}

/**
 * Updates an existing client.
 * @param clientId - The ID of the client to update.
 * @param updatedClientData - The partial or full client data to update.
 * @returns A promise that resolves to the updated client or null if an error occurs.
 */
export async function updateClient(
  clientId: string | number,
  updatedClientData: Partial<Client> // Use Partial if you allow partial updates
): Promise<Client | null> { // Assuming the API returns the updated client
  try {
    const res = await fetch(baseUrl(URLS.manageClient(clientId)), { // Assuming PUT /clients/:id
      method: "PUT", // Or "PATCH" for partial updates
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedClientData),
    });

    if (!res.ok) {
      let errorDetails = `Update failed: ${res.status}`;
      try {
        const errorBody = await res.json(); // Or res.text()
        errorDetails = errorBody.message || JSON.stringify(errorBody);
      } catch (e) {
        errorDetails = `${res.status} ${res.statusText}, Body: ${await res.text().catch(() => 'Could not read body')}`;
      }
      console.error("Failed to update client:", errorDetails);
      throw new Error(`Update client failed: ${errorDetails}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Error in updateClient for ID ${clientId}:`, error);
    return null;
  }
}


/**
 * Deletes a client by its ID.
 * @param clientId - The ID of the client to delete.
 * @returns A promise that resolves to true if deletion was successful, false otherwise.
 */
export async function deleteClient(clientId: string | number): Promise<boolean> {
  try {
    const res = await fetch(baseUrl(URLS.manageClient(clientId)), { // Assuming DELETE /clients/:id
      method: "DELETE",
    });

    if (!res.ok) {
      let errorDetails = "Failed to delete client";
       // If the response might have a body (e.g. for 403, 404 with details)
      if (res.status !== 204 && res.body) { // 204 No Content typically has no body
        try {
          const errorBody = await res.json(); // Or res.text()
          errorDetails = errorBody.message || JSON.stringify(errorBody);
        } catch (e) {
          errorDetails = `${res.status} ${res.statusText}`;
        }
      } else if (res.status === 204) {
        // Successfully deleted, but no content to parse, res.ok should be true
      } else {
        errorDetails = `${res.status} ${res.statusText}`;
      }
      console.error("Failed to delete client:", errorDetails);
      throw new Error(`Delete client failed: ${errorDetails}`);
    }
    // For DELETE, a 204 No Content or 200 OK (possibly with a confirmation message) is common.
    // If 204, res.json() would fail. res.ok indicates success.
    return true;
  } catch (error) {
    console.error(`Error in deleteClient for ID ${clientId}:`, error);
    return false;
  }
}

// Make sure your URLS and baseUrl are correctly defined, e.g.:
// ./url.ts
// export const URLS = {
//   listCreateClients: "/api/v1/clients",
//   manageClient: (clientId: string | number) => `/api/v1/clients/${clientId}`,
// };

// ./api.ts
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
// export function baseUrl(path: string): string {
//   // Ensure path doesn't start with a slash if API_BASE_URL ends with one, or vice-versa
//   return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
// }


// export async function getClients() {
//   const res = await fetch(`${process.env.API_BASE}/list_create_clients`);
//   return res.json();
// }

// export async function getFileConversionConfigs(clientId: number) {
//   const res = await fetch(`${process.env.API_BASE}/list_create_file_conversion_configs/${clientId}`);
//   return res.json();
// }

// export async function getDAGStatus(dagId: string, triggerId: string) {
//   const res = await fetch(`${process.env.API_BASE}/dag_runs/get_trigger_history_dag_runs__dag_id__triggers__${triggerId}`);
//   return res.json();
// }


// import { baseUrl } from "./api";
// import { URLS } from "./url";

/**
 * Fetch file conversion configs for a specific client.
 * @param clientId 
 * @returns Array of file conversion configs or throws error
 */
export async function fetchFileConversionConfigsByClient(clientId: string | number) {
  try {
    const url = baseUrl(URLS.listCreateFileConversionConfigs(clientId));
    const res = await fetch(url);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch file conversion configs");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching file conversion configs:", error);
    throw error;
  }
}

/**
 * Fetch DAG trigger history for a given DAG ID and trigger ID.
 * @param dagId 
 * @param triggerId 
 * @returns DAG run trigger history or throws error
 */
export async function fetchDagTriggerHistory(dagId: string, triggerId: string) {
  try {
    const url = baseUrl(URLS.getDAGStatus(dagId, triggerId));
    const res = await fetch(url);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch DAG trigger history");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching DAG trigger history:", error);
    throw error;
  }
}



// services/client.ts

export async function fetchDagByClient(clientId: number): Promise<DAG | null> {
  try {
    // Adjust the URL based on your API route
    const res = await fetch(baseUrl(URLS.listCreateFileConversionConfigs(clientId)));
    if (!res.ok) {
      // No DAG found or error
      return null;
    }
    const data = await res.json();
    return data; // Assuming data shape { id: string, status: string }
  } catch (error) {
    console.error("Error fetching DAG by client:", error);
    return null;
  }
}
