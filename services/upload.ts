// general.ts upload endpoint
import { toast } from "@/components/ui/use-toast";
import { buildUrl } from "./api"; // Assuming api.ts is in the same directory or adjust path
import {UploadedFileItem} from "@/services/interface"

interface ApiFileResponseItem {
  filename: string;
  filepath: string;
  size_bytes: number;
  last_modified: string;
  // type?: "file" | "directory"; // If API could provide type
}

const listItemsInSubfolderUrl = (subfolder?: string): string => {
  let apiPath = "uploads/"; 
  if (subfolder && subfolder.length > 0) {
    apiPath = `uploads?subfolder=${encodeURIComponent(subfolder)}`;
  }
  return buildUrl(apiPath);
};

/**
 * Constructs the URL specifically for listing all items in a subfolder.
 * @param subfolder Optional. The subfolder path relative to the upload root.
 *                  If undefined or empty, targets the root of the upload directory.
 */


/**
 * Fetches ALL files and directories for a given subfolder.
 * Sorts them: folders first, then alphabetically by name.
 * @param subfolder Optional. The relative subfolder path to list.
 *                  If undefined or empty, lists the root of the upload directory.
 * @returns A promise that resolves to an array of UploadedFileItem.
 */

export async function fetchUploadedItems(subfolder?: string): Promise<UploadedFileItem[]> {
  const url = listItemsInSubfolderUrl(subfolder);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        detail: `HTTP error ${response.status} while fetching items.` 
      }));
      throw new Error(errorData.detail || `Failed to fetch items from ${subfolder || 'root'}`);
    }
    
    // Expecting an array of ApiFileResponseItem from the API
    const apiItems: ApiFileResponseItem[] = await response.json();

    // **TRANSFORMATION STEP**
    const transformedItems: UploadedFileItem[] = apiItems.map(apiItem => {
      // Determine type: Default to "file".
      // If your API provides a type indicator (e.g., apiItem.item_type or apiItem.is_dir), use it here.
      let itemType: "file" | "directory" = "file"; 
      // Example if API had `apiItem.item_type`:
      // if (apiItem.item_type === "folder") {
      //   itemType = "directory";
      // }

      return {
        name: apiItem.filename,                 // Map `filename` to `name`
        type: itemType,                         // Use determined type
        path: apiItem.filepath,                 // Map `filepath` to `path` (this is the ABSOLUTE path)
        original_filename: apiItem.filename,    // Store original filename
        size_bytes: apiItem.size_bytes,
        last_modified: apiItem.last_modified,   // Include if in UploadedFileItem interface
      };
    });

    // Client-side sort: folders first, then alphabetically by name
    return transformedItems.sort((a, b) => {
      if (a.type === "directory" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "directory") return 1;
      return a.name.localeCompare(b.name);
    });

  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred";
    console.error(`Error fetching uploaded items for subfolder "${subfolder || 'root'}":`, errorMessage, error);
    toast({
      title: "Error Loading Files",
      description: errorMessage,
      variant: "destructive",
    });
    return []; // Return empty array on error to prevent UI crashes
  }
}


// export const listOrSearchUploadedFilesUrl = (/* ... as you had it ... */) => {
//   /* ... */
// };
// export async function fetchAndSearchUploadedItems(/* ... as you had it ... */) {
//   /* ... */
// }