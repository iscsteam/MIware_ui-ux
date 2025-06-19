// ReadFileNodeProperties.tsx
"use client";
import type React from "react"; // No FormEvent needed for this approach
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react"; // Added useCallback
import { useWorkflow } from "@/components/workflow/workflow-context";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Assuming general.ts is in @/services/general.ts
// This fetchUploadedItems is expected to get ALL items for a given subfolder.
// The API it calls (GET /uploads?subfolder=...) should NOT limit results itself for this use case.
import { fetchUploadedItems } from "@/services/upload";
import { Folder, File as FileIcon, ArrowUp, RefreshCw, AlertCircle, Search as SearchIcon } from "lucide-react"; // Renamed Search to SearchIcon to avoid conflict
import {UploadedFileItem} from "@/services/interface"
// ... (SchemaItem, NodeSchema, readFileSchema, parseSchemaFromText, formatOptions as before)
export interface SchemaItem {
  name: string;
  datatype: string;
  description: string;
  required?: boolean;
}

export interface NodeSchema {
  inputSchema: SchemaItem[];
  outputSchema: SchemaItem[];
}

export const readFileSchema: NodeSchema = {
  inputSchema: [
    { name: "provider", datatype: "string", description: "Data source provider (e.g., local, s3).", required: true,},
    { name: "format", datatype: "string", description: "File format (e.g., csv, json, xml).", required: true,},
    { name: "path", datatype: "string", description: "File path to read from.", required: true,},
    { name: "rowTag", datatype: "string", description: "Row tag for XML files (if applicable).",},
    { name: "rootTag", datatype: "string", description: "Root tag for XML files (if applicable).",},
  ],
  outputSchema: [
    { name: "content", datatype: "string", description: "The content of the file.",},
    { name: "fileMeta", datatype: "object", description: "Metadata about the file (size, modified time, etc).",},
    { name: "success", datatype: "boolean", description: "Whether the read operation was successful.",},
    { name: "error", datatype: "string", description: "Error message if any." },
  ],
};


interface Props {
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

const parseSchemaFromText = (schemaText: string) => { 
  try {
    return JSON.parse(schemaText);
  } catch (error) {
    console.error("Failed to parse schema:", error);
    return null;
  }
};
const formatOptions = { 
  csv: { header: true, inferSchema: true },
  json: { multiline: true },
  xml: { rowTag: "Record", rootTag: "Records" },
  parquet: { compression: "snappy" }, 
};

const UPLOAD_ROOT_DISPLAY_PATH = "/app/data/mock_data/mm";
const MAX_BROWSE_DISPLAY_ITEMS = 10;

export default function ReadFileNodeProperties({ formData, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [subfolderForUpload, setSubfolderForUpload] = useState<string>(""); // For upload section - UNCHANGED
  const [schemaText, setSchemaText] = useState<string>("");
  const { updateNode, selectedNodeId } = useWorkflow();

  // --- State for "Browse Uploaded Files" section ---
  const [subfolderQuery, setSubfolderQuery] = useState<string>(""); // Input for subfolder path to fetch
  const [currentlyLoadedSubfolder, setCurrentlyLoadedSubfolder] = useState<string>(""); // The subfolder whose contents are loaded
  
  const [allFetchedItems, setAllFetchedItems] = useState<UploadedFileItem[]>([]); // All items from API for the currentlyLoadedSubfolder
  const [isLoadingBrowseResults, setIsLoadingBrowseResults] = useState<boolean>(false);
  const [browseError, setBrowseError] = useState<string | null>(null);
  
  // State for client-side filtering of the displayed (max 10) items
  const [browseFilterTerm, setBrowseFilterTerm] = useState<string>(""); 


  useEffect(() => {
    if (formData.schema) {
      try { setSchemaText(JSON.stringify(formData.schema, null, 2)); }
      catch (error) { console.error("Error stringifying schema:", error); }
    }
  }, [formData.schema]);

  useEffect(() => {
    const newOptions = formatOptions[formData.format as keyof typeof formatOptions] || {};
    const currentOptions = formData.options || {};
    if (JSON.stringify(newOptions) !== JSON.stringify(currentOptions)) {
      onChange("options", newOptions);
    }
  }, [formData.format, formData.options, onChange]);

  // Fetches ALL items for a given subfolder path.
  const fetchItemsForSubfolder = useCallback(async (subfolderPathToLoad: string) => {
    setIsLoadingBrowseResults(true);
    setBrowseError(null);
    setAllFetchedItems([]); // Clear previous items
    try {
      // fetchUploadedItems should get ALL items. API needs to support this.
      // `subfolderPathToLoad` is relative to the upload root e.g., "data" or "data/reports"
      const items = await fetchUploadedItems(subfolderPathToLoad);
      setAllFetchedItems(items);
      setCurrentlyLoadedSubfolder(subfolderPathToLoad);
      setBrowseFilterTerm(""); // Reset filter when new folder is loaded
    } catch (err: any) {
      setBrowseError(err.message || "Failed to load directory contents.");
      setCurrentlyLoadedSubfolder(subfolderPathToLoad); // Still set to allow retry or show context
    } finally {
      setIsLoadingBrowseResults(false);
    }
  }, []); // `fetchUploadedItems` is from outer scope

  // Initial load for the root directory of uploads
  useEffect(() => {
    fetchItemsForSubfolder(""); // "" means root
    setSubfolderQuery(""); // Set input to reflect root
  }, [fetchItemsForSubfolder]);


  const handleSubfolderQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubfolderQuery(e.target.value);
  };

  // Triggered by "Go" button or Enter key for subfolder navigation
  const handleGoToSubfolderQuery = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const normalizedQuery = subfolderQuery.trim().replace(/^\/+|\/+$/g, '');
    fetchItemsForSubfolder(normalizedQuery);
  };
  
  const handleBrowseFilterTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrowseFilterTerm(e.target.value.toLowerCase());
  };

  // Process items for display: filter (client-side), sort, then truncate
  const getDisplayedBrowseItems = (): UploadedFileItem[] => {
    let itemsToDisplay = allFetchedItems;

    if (browseFilterTerm) {
      itemsToDisplay = itemsToDisplay.filter(item =>
        item.name.toLowerCase().includes(browseFilterTerm)
      );
    }

    // Sort: folders first, then alphabetically
    itemsToDisplay.sort((a, b) => {
      if (a.type === "directory" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "directory") return 1;
      return a.name.localeCompare(b.name);
    });

    return itemsToDisplay.slice(0, MAX_BROWSE_DISPLAY_ITEMS);
  };

  const displayedBrowseItems = getDisplayedBrowseItems();


  const handleBrowseItemClick = (item: UploadedFileItem) => {
    if (item.type === "directory") {
      // Construct the new subfolder path relative to the upload root
      // `item.name` is just the folder name. `currentlyLoadedSubfolder` is its parent's relative path.
      const newSubfolderPath = currentlyLoadedSubfolder
        ? `${currentlyLoadedSubfolder}/${item.name}`
        : item.name;
      setSubfolderQuery(newSubfolderPath); // Update input field
      fetchItemsForSubfolder(newSubfolderPath); // Fetch contents of this new path
    } else {
      // File clicked, set the formData.path (this path should be absolute from API)
      onChange("path", item.path);
      setSuccessMessage(`Selected file: ${item.name} (${item.path})`);
    }
  };

  const handleBrowseNavigateUp = () => {
    if (!currentlyLoadedSubfolder) return; // Already at root

    const parts = currentlyLoadedSubfolder.split("/");
    parts.pop();
    const parentSubfolderPath = parts.join("/");
    setSubfolderQuery(parentSubfolderPath); // Update input
    fetchItemsForSubfolder(parentSubfolderPath); // Fetch parent
  };

  const handleRefreshBrowsedFolder = () => {
    fetchItemsForSubfolder(currentlyLoadedSubfolder); // Re-fetch current folder
  };


  // --- UNCHANGED Functions below this line (except for render method) ---
  const handleSchemaTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { 
    const newSchemaText = e.target.value;
    setSchemaText(newSchemaText);
    const parsedSchema = parseSchemaFromText(newSchemaText);
    if (parsedSchema) {
      onChange("schema", parsedSchema);
    }
  };
  const handleFormatChange = (value: string) => { 
    onChange("format", value);
    if (formatOptions[value as keyof typeof formatOptions]) {
      onChange("options", formatOptions[value as keyof typeof formatOptions]);
    } else {
      onChange("options", {});
    }
  };

  async function handleReadFile() { 
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const requestBody = {
        provider: formData.provider,
        format: formData.format,
        path: formData.path,
        options: formData.options || {},
      };
      console.log("Read file request:", requestBody);
      const data = {
        content: "File content would be here (simulated)",
        fileMeta: { format: formData.format, path: formData.path, options: formData.options || {} },
      };
      setSuccessMessage("File read successfully (simulated)!");
      if (selectedNodeId) {
        updateNode(selectedNodeId, {
          status: "success",
          output: { content: data.content || "", fileMeta: data.fileMeta || {}, path: formData.path, success: true, },
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || "Unknown error";
      setError(errorMessage);
      if (selectedNodeId) {
        updateNode(selectedNodeId, { status: "error", output: { error: errorMessage, path: formData.path, success: false }, });
      }
    } finally {
      setLoading(false);
    }
  }

  // File Upload section is UNCHANGED
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(null); setSuccessMessage(null);
    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);
      if (subfolderForUpload) { formDataObj.append("subfolder", subfolderForUpload); }
      const res = await fetch("http://localhost:30010/uploads/", { method: "POST", body: formDataObj });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || "Upload failed");
      onChange("path", result.filepath || file.name); // This sets the main path from upload
      setSuccessMessage(`Uploaded ${result.original_filename || file.name} to "${subfolderForUpload || 'root'}". Path set.`);
      // If upload happened into the folder we are currently browsing, refresh it
      if (subfolderForUpload === currentlyLoadedSubfolder) {
        fetchItemsForSubfolder(currentlyLoadedSubfolder);
      }
    } catch (err: any) { setError(`Upload failed: ${err.message}`); }
    finally { setUploading(false); }
  }

  const renderCurrentOptions = () => { 
    if (!formData.options) return null;
    return (
      <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
        <p className="font-medium text-gray-700">Current Options:</p>
        <pre className="text-xs overflow-x-auto">{JSON.stringify(formData.options, null, 2)}</pre>
      </div>
    );
  };
  
  // This path shows the root of the mock data, plus the subfolder being browsed
  const currentBrowseDisplayPath = `${UPLOAD_ROOT_DISPLAY_PATH}${currentlyLoadedSubfolder ? `/${currentlyLoadedSubfolder}` : ''}`;

  return (
    <div className="space-y-4">
      {/* Provider, Format - UNCHANGED */}
      <div className="space-y-1">
        <Label htmlFor="provider">Provider</Label>
        <Input id="provider" value={formData.provider || ""} placeholder="e.g., local" onChange={(e) => onChange("provider", e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="format">Format</Label>
        <Select value={formData.format || ""} onValueChange={handleFormatChange}>
          <SelectTrigger id="format"><SelectValue placeholder="Select file format" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
            <SelectItem value="parquet">Parquet</SelectItem>
            {/* ... other items ... */}
          </SelectContent>
        </Select>
        {renderCurrentOptions()}
      </div>
      <hr className="my-3"/>

      {/* File Upload Section - UNCHANGED */}
      <div className="space-y-2 p-3 border rounded-md bg-slate-50">
        <Label className="text-md font-semibold">Upload New File</Label>
        <div className="space-y-1">
          <Label htmlFor="subfolderForUpload">Target Subfolder (for upload)</Label>
          <Input
            id="subfolderForUpload"
            value={subfolderForUpload}
            placeholder="e.g., new_data (relative to upload root)"
            onChange={(e) => setSubfolderForUpload(e.target.value)}
            disabled={uploading}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="upload">Select File to Upload</Label>
          <Input id="upload" type="file" onChange={handleFileUpload} disabled={uploading} />
        </div>
      </div>
      <hr className="my-3"/>

      {/* --- Browse Uploaded Files Section - UPDATED --- */}
      <div className="space-y-2 p-3 border rounded-md">
        <Label className="text-md font-semibold">Browse Uploaded Files</Label>
        <p className="text-xs text-gray-500">
          Current location: <code>{currentBrowseDisplayPath || "/ (upload root)"}</code>
        </p>
        
        <form onSubmit={handleGoToSubfolderQuery} className="flex gap-2 items-center">
          <Input
            type="text"
            id="subfolderQueryInput"
            placeholder="Enter subfolder path (e.g., data/reports) and press Go"
            value={subfolderQuery}
            onChange={handleSubfolderQueryChange}
            className="flex-grow"
            disabled={isLoadingBrowseResults}
          />
          <Button type="submit" disabled={isLoadingBrowseResults} size="sm">
            Go
          </Button>
        </form>

        {/* <div className="flex gap-2 items-center mt-1">
          <Button variant="outline" size="icon" onClick={handleBrowseNavigateUp} disabled={!currentlyLoadedSubfolder || isLoadingBrowseResults} title="Go up one level">
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleRefreshBrowsedFolder} disabled={isLoadingBrowseResults} title="Refresh current folder">
            {isLoadingBrowseResults ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div> */}

        {/* Client-side filter for the displayed items */}
        {allFetchedItems.length > 0 && !isLoadingBrowseResults && (
             <div className="relative mt-2">
                <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    type="text"
                    placeholder={`Filter ${displayedBrowseItems.length} displayed items...`}
                    value={browseFilterTerm}
                    onChange={handleBrowseFilterTermChange}
                    className="pl-8 w-full"
                    disabled={isLoadingBrowseResults}
                />
            </div>
        )}

        {/* Display Area for Browsed Files */}
        {isLoadingBrowseResults && <p className="text-sm text-gray-500 py-2">Loading items...</p>}
        {browseError && !isLoadingBrowseResults && (
          <p className="text-sm text-red-600 py-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1"/> {browseError}
          </p>
        )}

        {!isLoadingBrowseResults && !browseError && (
          <div className="max-h-60 min-h-[50px] overflow-y-auto border rounded-md p-1 bg-white space-y-0.5 mt-2">
            {displayedBrowseItems.length === 0 && allFetchedItems.length > 0 && (
              <p className="text-gray-500 text-sm text-center p-4">No items match your filter in this view.</p>
            )}
             {displayedBrowseItems.length === 0 && allFetchedItems.length === 0 && (
              <p className="text-gray-500 text-sm text-center p-4">This subfolder is empty or does not exist.</p>
            )}
            {displayedBrowseItems.map((item) => (
              <div
                key={item.path} // API provides absolute path, good for key
                onClick={() => handleBrowseItemClick(item)}
                className="flex items-center p-1.5 hover:bg-slate-100 rounded-sm cursor-pointer text-sm"
                title={`Click to ${item.type === 'directory' ? 'open' : 'select'}: ${item.name}\nPath: ${item.path}`}
              >
                {item.type === "directory" ? (
                  <Folder className="h-5 w-5 mr-2 text-sky-600 flex-shrink-0" />
                ) : (
                  <FileIcon className="h-5 w-5 mr-2 text-slate-600 flex-shrink-0" />
                )}
                <span className="truncate">{item.name}</span>
              </div>
            ))}
            {allFetchedItems.length > MAX_BROWSE_DISPLAY_ITEMS && displayedBrowseItems.length === MAX_BROWSE_DISPLAY_ITEMS && (
                <p className="text-xs text-gray-500 p-1 text-center">
                    Displaying top {MAX_BROWSE_DISPLAY_ITEMS} items. ({allFetchedItems.length} total in folder).
                </p>
            )}
          </div>
        )}
      </div> {/* End of Browse Uploaded Files Section */}

      {/* Selected File Path - UNCHANGED */}
      <div className="space-y-1">
        <Label htmlFor="path" className="font-semibold">Selected File Path (for Read Operation)</Label>
        <Input
          id="path"
          value={formData.path || ""}
          placeholder="/app/data/mock_data/mm/your-file.csv"
          onChange={(e) => onChange("path", e.target.value)}
          className={!formData.path ? "border-orange-400" : ""}
        />
         {!formData.path && <p className="text-xs text-orange-600">File path is required to read.</p>}
      </div>
      <hr className="my-3"/>

      {/* Schema Configuration, Read File Button & Feedback - UNCHANGED */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="schema">
          <AccordionTrigger>Schema Configuration (Optional)</AccordionTrigger>
          {/* ... content ... */}
        </AccordionItem>
      </Accordion>
      <div className="mt-5">
        <Button
          onClick={handleReadFile}
          disabled={loading || uploading || !formData.path || !formData.provider || !formData.format}
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? "Reading..." : "Read File"}
        </Button>
      </div>
      {successMessage && <p className="text-sm text-green-600 mt-2">{successMessage}</p>}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}

//ReadFileNodeProperties.tsx

// "use client"

// import type React from "react"

// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { useState, useEffect } from "react"
// import { useWorkflow } from "@/components/workflow/workflow-context"
// import { Textarea } from "@/components/ui/textarea"
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// export interface SchemaItem {
//   name: string
//   datatype: string
//   description: string
//   required?: boolean
// }

// export interface NodeSchema {
//   inputSchema: SchemaItem[]
//   outputSchema: SchemaItem[]
// }

// export const readFileSchema: NodeSchema = {
//   inputSchema: [
//     {
//       name: "provider",
//       datatype: "string",
//       description: "Data source provider (e.g., local, s3).",
//       required: true,
//     },
//     {
//       name: "format",
//       datatype: "string",
//       description: "File format (e.g., csv, json, xml).",
//       required: true,
//     },
//     {
//       name: "path",
//       datatype: "string",
//       description: "File path to read from.",
//       required: true,
//     },
//     {
//       name: "rowTag",
//       datatype: "string",
//       description: "Row tag for XML files (if applicable).",
//     },
//     {
//       name: "rootTag",
//       datatype: "string",
//       description: "Root tag for XML files (if applicable).",
//     },
//   ],
//   outputSchema: [
//     {
//       name: "content",
//       datatype: "string",
//       description: "The content of the file.",
//     },
//     {
//       name: "fileMeta",
//       datatype: "object",
//       description: "Metadata about the file (size, modified time, etc).",
//     },
//     {
//       name: "success",
//       datatype: "boolean",
//       description: "Whether the read operation was successful.",
//     },
//     { name: "error", datatype: "string", description: "Error message if any." },
//   ],
// }

// interface Props {
//   formData: Record<string, any>
//   onChange: (name: string, value: any) => void
// }

// // Function to parse schema from text input
// const parseSchemaFromText = (schemaText: string) => {
//   try {
//     return JSON.parse(schemaText)
//   } catch (error) {
//     console.error("Failed to parse schema:", error)
//     return null
//   }
// }

// // Format-specific options
// const formatOptions = {
//   csv: { header: true, inferSchema: true },
//   json: { multiline: true },
//   xml: { rowTag: "Record", rootTag: "Records" },
// }

// export default function ReadFileNodeProperties({ formData, onChange }: Props) {
//   const [loading, setLoading] = useState(false)
//   const [uploading, setUploading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [successMessage, setSuccessMessage] = useState<string | null>(null)
//   const [subfolder, setSubfolder] = useState<string>("uploads")
//   const [schemaText, setSchemaText] = useState<string>("")
//   const { updateNode, selectedNodeId } = useWorkflow()

//   // Initialize schema text from formData if available
//   useEffect(() => {
//     if (formData.schema) {
//       try {
//         setSchemaText(JSON.stringify(formData.schema, null, 2))
//       } catch (error) {
//         console.error("Error stringifying schema:", error)
//       }
//     }
//   }, [formData.schema])

//   // Handle format change to update options
//   useEffect(() => {
//     const newOptions = formatOptions[formData.format as keyof typeof formatOptions] || {}
//     const currentOptions = formData.options || {}

//     if (JSON.stringify(newOptions) !== JSON.stringify(currentOptions)) {
//       onChange("options", newOptions)
//     }
//   }, [formData.format, formData.options, onChange])

//   // Handle schema text changes
//   const handleSchemaTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const newSchemaText = e.target.value
//     setSchemaText(newSchemaText)

//     // Try to parse the schema and update formData if valid
//     const parsedSchema = parseSchemaFromText(newSchemaText)
//     if (parsedSchema) {
//       onChange("schema", parsedSchema)
//     }
//   }

//   // Handle format selection
//   const handleFormatChange = (value: string) => {
//     onChange("format", value)

//     // Set format-specific options
//     if (formatOptions[value as keyof typeof formatOptions]) {
//       onChange("options", formatOptions[value as keyof typeof formatOptions])
//     } else {
//       // Clear options if format is not recognized
//       onChange("options", {})
//     }
//   }

//   async function handleReadFile() {
//     setLoading(true)
//     setError(null)
//     setSuccessMessage(null)

//     try {
//       // Prepare the request body with format-specific options
//       const requestBody = {
//         provider: formData.provider,
//         format: formData.format,
//         path: formData.path,
//         options: formData.options || {},
//       }

//       // Log the request body to verify options
//       console.log("Read file request:", requestBody)

//       // The API call has been removed as requested
//       // Simulate a successful response
//       const data = {
//         content: "File content would be here",
//         fileMeta: {
//           format: formData.format,
//           path: formData.path,
//           options: formData.options || {},
//         },
//       }

//       setSuccessMessage("File read successfully!")

//       if (selectedNodeId) {
//         updateNode(selectedNodeId, {
//           status: "success",
//           output: {
//             content: data.content || "",
//             fileMeta: data.fileMeta || {},
//             path: formData.path,
//             success: true,
//           },
//         })
//       }
//     } catch (err: any) {
//       const errorMessage = err.message || "Unknown error"
//       setError(errorMessage)
//       if (selectedNodeId) {
//         updateNode(selectedNodeId, {
//           status: "error",
//           output: { error: errorMessage, path: formData.path, success: false },
//         })
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0]
//     if (!file) return

//     setUploading(true)
//     setError(null)
//     setSuccessMessage(null)

//     try {
//       const formDataObj = new FormData()
//       formDataObj.append("file", file)
//       formDataObj.append("subfolder", subfolder)

//       const res = await fetch("http://localhost:30010/uploads/", {
//         method: "POST",
//         body: formDataObj,
//       })

//       const result = await res.json()
//       if (!res.ok) throw new Error(result.detail || "Upload failed")

//       onChange("path", result.filepath)
//       setSuccessMessage(`Uploaded ${file.name} to "${subfolder}" successfully`)
//     } catch (err: any) {
//       setError(`Upload failed: ${err.message}`)
//     } finally {
//       setUploading(false)
//     }
//   }

//   // Display current options based on selected format
//   const renderCurrentOptions = () => {
//     if (!formData.options) return null

//     return (
//       <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
//         <p className="font-medium text-gray-700">Current Options:</p>
//         <pre className="text-xs overflow-x-auto">{JSON.stringify(formData.options, null, 2)}</pre>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-4">
//       {/* Provider */}
//       <div className="space-y-1">
//         <Label htmlFor="provider">Provider</Label>
//         <Input
//           id="provider"
//           value={formData.provider || ""}
//           placeholder="e.g., local"
//           onChange={(e) => onChange("provider", e.target.value)}
//         />
//       </div>

//       {/* Format */}
//       <div className="space-y-1">
//         <Label htmlFor="format">Format</Label>
//         <Select value={formData.format || ""} onValueChange={handleFormatChange}>
//           <SelectTrigger id="format">
//             <SelectValue placeholder="Select file format" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="csv">CSV</SelectItem>
//             <SelectItem value="json">JSON</SelectItem>
//             <SelectItem value="xml">XML</SelectItem>
//             <SelectItem value="parquet">Parquet</SelectItem>
//             <SelectItem value="avro">Avro</SelectItem>
//             <SelectItem value="orc">ORC</SelectItem>
//           </SelectContent>
//         </Select>
//         {renderCurrentOptions()}
//       </div>

//       {/* Subfolder */}
//       <div className="space-y-1">
//         <Label htmlFor="subfolder">Subfolder (for upload)</Label>
//         <Input id="subfolder" value={subfolder} placeholder="uploads" onChange={(e) => setSubfolder(e.target.value)} />
//       </div>

//       {/* File Upload */}
//       <div className="space-y-1">
//         <Label htmlFor="upload">Upload File</Label>
//         <Input id="upload" type="file" onChange={handleFileUpload} disabled={uploading} />
//       </div>

//       {/* File Path */}
//       <div className="space-y-1">
//         <Label htmlFor="path">File Path</Label>
//         <Input
//           id="path"
//           value={formData.path || ""}
//           placeholder="/app/data/input/file.csv"
//           onChange={(e) => onChange("path", e.target.value)}
//         />
//       </div>

//       {/* Schema Configuration */}
//       <Accordion type="single" collapsible className="w-full">
//         <AccordionItem value="schema">
//           <AccordionTrigger>Schema Configuration</AccordionTrigger>
//           <AccordionContent>
//             <div className="space-y-2">
//               <Label htmlFor="schema">Schema (JSON format)</Label>
//               <Textarea
//                 id="schema"
//                 value={schemaText}
//                 onChange={handleSchemaTextChange}
//                 placeholder={`{
//   "fields": [
//     {
//       "name": "Id",
//       "type": "string",
//       "nullable": false
//     },
//     {
//       "name": "Name",
//       "type": "string",
//       "nullable": false
//     }
//   ]
// }`}
//                 className="min-h-[200px] font-mono text-sm"
//               />
//               <p className="text-xs text-gray-500">
//                 Enter the schema in JSON format. This will be used to define the structure of the input data.
//               </p>
//             </div>
//           </AccordionContent>
//         </AccordionItem>
//       </Accordion>

//       {/* Read File Button */}
//       <div>
//         <Button
//           onClick={handleReadFile}
//           disabled={loading || uploading || !formData.path}
//           className="bg-blue-600 text-white hover:bg-blue-700"
//         >
//           {loading ? "Reading..." : "Read File"}
//         </Button>
//       </div>

//       {/* Feedback */}
//       {successMessage && <p className="text-green-600">{successMessage}</p>}
//       {error && <p className="text-red-600">{error}</p>}
//     </div>
//   )
// }