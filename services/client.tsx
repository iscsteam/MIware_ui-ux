import { buildUrl } from "./api";
import { URLS } from "./url";
import {Client} from "@/services/interface";
import { ClientCreateResponse } from "@/services/interface";




export async function fetchClients(): Promise<Client[] | null> {
    try {
      const res = await fetch(buildUrl(URLS.listCreateClients));
      if (!res.ok) throw new Error("Failed to fetch clients");
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

//   import { ClientCreateResponse } from "@/services/interface";

  export async function createClient(newClient: Client): Promise<ClientCreateResponse | null> {
    try {
      console.log("Creating client with payload:", newClient);
  
      const res = await fetch(buildUrl(URLS.listCreateClients), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to create client:", res.status, errorText);
        throw new Error(`Create failed: ${res.status}`);
      }
  
      const data: ClientCreateResponse = await res.json(); // 🔐 typed correctly
      return data;
    } catch (error) {
      console.error("Error in createClient:", error);
      return null;
    }
  }
  
  


  export async function deleteClient(clientId: string | number): Promise<boolean> {
    try {
      const res = await fetch(buildUrl(URLS.manageClient(clientId)), {
        method: "DELETE",
      });
  
      if (!res.ok) throw new Error("Failed to delete client");
      return true;
    } catch (error) {
      console.error("Error in deleteClient:", error);
      return false;
    }
  }
  