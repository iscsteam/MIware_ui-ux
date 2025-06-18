//salesforce-cloud-node-properties.tsx
"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useWorkflow } from "@/components/workflow/workflow-context";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export const salesforceCloudSchema: NodeSchema = {
  inputSchema: [
    {
      name: "object_name",
      datatype: "string",
      description:
        "Salesforce object/table name (e.g., Account, Contact, Opportunity).",
      required: true,
    },
    {
      name: "query",
      datatype: "string",
      description: "SOQL query to execute against Salesforce.",
      required: true,
    },
    {
      name: "use_bulk_api",
      datatype: "boolean",
      description: "Whether to use Salesforce Bulk API for large data sets.",
      required: false,
    },
    {
      name: "file_path",
      datatype: "string",
      description: "Output file path to save the query results.",
      required: true,
    },
  ],
  outputSchema: [
    {
      name: "records",
      datatype: "array",
      description: "Array of records returned from Salesforce query.",
    },
    {
      name: "record_count",
      datatype: "integer",
      description: "Number of records retrieved.",
    },
    {
      name: "file_path",
      datatype: "string",
      description: "Path where the results were saved.",
    },
    {
      name: "success",
      datatype: "boolean",
      description: "Whether the Salesforce operation was successful.",
    },
    {
      name: "error",
      datatype: "string",
      description: "Error message if any.",
    },
  ],
};

interface Props {
  formData: Record<string, any>;
  onChange: (name: string, value: any) => void;
}

// Define field schemas for each object type
const objectFields = {
  Account: [
    "Id",
    "Name",
    "AccountNumber",
    "AccountSource",
    "AnnualRevenue",
    "NumberOfEmployees",
    "Industry",
    "Type",
    "Website",
    "Phone",
    "Fax",
    "Rating",
    "Ownership",
    "TickerSymbol",
    "Description",
    "BillingStreet",
    "BillingCity",
    "BillingState",
    "BillingPostalCode",
    "BillingCountry",
    "ShippingStreet",
    "ShippingCity",
    "ShippingState",
    "ShippingPostalCode",
    "ShippingCountry",
    "Sic",
    "SicDesc",
    "Site",
    "Tradestyle",
    "YearStarted",
    "Active__c",
    "CustomerPriority__c",
    "NumberofLocations__c",
    "SLAExpirationDate__c",
    "SLASerialNumber__c",
    "SLA__c",
    "UpsellOpportunity__c",

    "CreatedDate",
  ],

  Contact: [
    "Id",
    "FirstName",
    "LastName",
    "Email",
    "Phone",
    "MobilePhone",
    "HomePhone",
    "OtherPhone",
    "Fax",
    "Title",
    "Department",
    "LeadSource",
    "Salutation",
    "Birthdate",
    "AssistantName",
    "AssistantPhone",
    "Description",
    "Languages__c",
    "Level__c",
    "MailingStreet",
    "MailingCity",
    "MailingState",
    "MailingPostalCode",
    "MailingCountry",
    "OtherStreet",
    "OtherCity",
    "OtherState",
    "OtherPostalCode",
    "OtherCountry",
    "CreatedDate",
  ],

  Opportunity: [
    "Id",
    "Name",
    "CloseDate",
    "StageName",
    "Amount",
    "Probability",
    "Type",
    "LeadSource",
    "NextStep",
    "Description",
    "ForecastCategoryName",
    "IsPrivate",
    "TotalOpportunityQuantity",
    "CurrentGenerators__c",
    "DeliveryInstallationStatus__c",
    "MainCompetitors__c",
    "OrderNumber__c",
    "TrackingNumber__c",
    "CreatedDate",
  ],

  Lead: [
    "Id",
    "FirstName",
    "LastName",
    "Company",
    "Email",
    "Phone",
    "MobilePhone",
    "Fax",
    "Title",
    "LeadSource",
    "Industry",
    "Website",
    "AnnualRevenue",
    "NumberOfEmployees",
    "Rating",
    "Status",
    "Salutation",
    "Street",
    "City",
    "State",
    "PostalCode",
    "Country",
    "Description",
    "CurrentGenerators__c",
    "NumberofLocations__c",
    "Primary__c",
    "ProductInterest__c",
    "SICCode__c",
    "CreatedDate",
  ],

  Case: [
    "Id",
    "Subject",
    "Status",
    "Priority",
    "Origin",
    "Type",
    "Reason",
    "Description",
    "SuppliedEmail",
    "SuppliedName",
    "SuppliedPhone",
    "EngineeringReqNumber__c",
    "SLAViolation__c",
    "Product__c",
    "PotentialLiability__c",
    "CreatedDate",
  ],
  Solution: [
    "Id",
    "SolutionName",
    "SolutionNote",
    "Status",
    "IsPublished",
    "IsPublishedInPublicKb",
    "CreatedDate",
  ],
  ISCS__c: [
    "Id",
    "Customer_Name__c",
    "Email_Address__c",
    "Phone_Number__c",
    "Registration_Date__c",
    "Account_Balance__c",
    "CreatedDate",
  ],

  miware__c: [
    "Id",
    "Name",
    "Company__c",
    "Designation__c",
    "Experience__c",
    "Previous_Job_Title__c",
    "Technology__c",
    "CreatedDate",
  ],

  miai__c: [
    "Id",
    "CreatedDate",
    "Name",
    "AI_Technology_Used__c",
    "Favourite_AI_Algorithm__c",
    "Last_AI_Tool_Learned__c",
    "Total_AI_Projects__c",
    "Years_in_AI_Field__c",
  ],
};

export default function SalesforceCloudNodeProperties({
  formData,
  onChange,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const { updateNode, selectedNodeId } = useWorkflow();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Initialize default values
useEffect(() => {
  if (!formData.object_name) {
    onChange("object_name", "Account");
  }

  // Set default file path if not set
  if (!formData.file_path) {
    onChange("file_path", "/app/data/mock_data/output/salesforceread.csv");
  }

  // Set default bulk API value if not set
  if (formData.use_bulk_api === undefined) {
    onChange("use_bulk_api", false);
  }

  // Initialize selected fields based on current object
  const currentObject = formData.object_name || "Account";
  
  // Check if we have fields from formData first (loaded from existing config)
  let fieldsToUse: string[] = [];
  
  if (formData.fields && formData.fields.length > 0) {
    fieldsToUse = formData.fields;
  } else if (formData.selectedFields && formData.selectedFields.length > 0) {
    fieldsToUse = formData.selectedFields;
  } else {
    // Default to selecting Id and Name fields
    fieldsToUse = objectFields[
      currentObject as keyof typeof objectFields
    ].filter((field) => ["Id", "Name", "CreatedDate"].includes(field));
  }

  setSelectedFields(fieldsToUse);
  
  // Ensure both fields and selectedFields are set in formData
  if (!formData.fields || formData.fields.length === 0) {
    onChange("fields", fieldsToUse);
  }
  if (!formData.selectedFields || formData.selectedFields.length === 0) {
    onChange("selectedFields", fieldsToUse);
  }

  // Generate initial query if not present
  if (!formData.query) {
    const initialQuery = generateQuery(currentObject, fieldsToUse);
    onChange("query", initialQuery);
  }

  console.log("Initialized fields:", fieldsToUse); // Debug log
}, [formData.object_name, formData.fields, formData.selectedFields, onChange]);

  // Generate SOQL query based on selected object and fields
  const generateQuery = (objectName: string, fields: string[]) => {
    if (!fields || fields.length === 0) {
      fields = ["Id"]; // Always include at least Id
    }

    return `SELECT ${fields.join(
      ", "
    )} FROM ${objectName} ORDER BY CreatedDate DESC LIMIT 50`;
  };

  const handleObjectChange = (value: string) => {
    onChange("object_name", value);

    // Reset selected fields for the new object
    const defaultFields = ["Id", "Name", "CreatedDate"].filter((field) =>
      objectFields[value as keyof typeof objectFields].includes(field)
    );

    setSelectedFields(defaultFields);
    onChange("selectedFields", defaultFields);
    setSelectAll(false);

    // Generate new query
    const newQuery = generateQuery(value, defaultFields);
    onChange("query", newQuery);
  };

  const handleFieldToggle = (field: string, checked: boolean) => {
  let newSelectedFields: string[];

  if (checked) {
    newSelectedFields = [...selectedFields, field];
  } else {
    newSelectedFields = selectedFields.filter((f) => f !== field);
  }

  setSelectedFields(newSelectedFields);
  // Update formData with both selectedFields and fields
  onChange("selectedFields", newSelectedFields);
  onChange("fields", newSelectedFields); // Add this line

  // Update query
  const newQuery = generateQuery(formData.object_name, newSelectedFields);
  onChange("query", newQuery);

  // Update selectAll state
  const currentObjectFields =
    objectFields[formData.object_name as keyof typeof objectFields] || [];
  setSelectAll(newSelectedFields.length === currentObjectFields.length);
};

const handleSelectAllToggle = (checked: boolean) => {
  setSelectAll(checked);

  let newSelectedFields: string[] = [];
  if (checked) {
    // Select all fields for current object
    newSelectedFields = [
      ...objectFields[formData.object_name as keyof typeof objectFields],
    ];
  } else {
    // Default to just Id
    newSelectedFields = ["Id"];
  }

  setSelectedFields(newSelectedFields);
  // Update formData with both selectedFields and fields
  onChange("selectedFields", newSelectedFields);
  onChange("fields", newSelectedFields); // Add this line

  // Update query
  const newQuery = generateQuery(formData.object_name, newSelectedFields);
  onChange("query", newQuery);
};

  const handleExecuteQuery = async () => {
  setLoading(true);
  setError(null);
  setSuccessMessage(null);

  try {
    // Get current client ID
    const getCurrentClientId = (): string | null => {
      try {
        const clientDataString = localStorage.getItem("currentClient");
        if (clientDataString) {
          const parsedClient = JSON.parse(clientDataString);
          if (parsedClient?.id && String(parsedClient.id).trim() !== "") {
            return String(parsedClient.id);
          }
        }
      } catch (error) {
        console.error("Error getting client ID:", error);
      }
      return null;
    };

    const clientId = getCurrentClientId();
    if (!clientId) {
      throw new Error(
        "No client selected. Please create or select a client first."
      );
    }

    // Ensure we have the latest selected fields
    const currentSelectedFields = selectedFields.length > 0 ? selectedFields : ["Id"];
    
    // Store the configuration in the node data for later use by workflow-utils
    const salesforceConfig = {
      object_name: formData.object_name,
      query: formData.query,
      use_bulk_api: formData.use_bulk_api || false,
      file_path: formData.file_path,
      selectedFields: currentSelectedFields, // Keep this for UI state
      fields: currentSelectedFields, // This is what the API expects
      where: formData.where || "",
      limit: formData.limit || undefined,
    };

    console.log("Salesforce config being saved:", salesforceConfig); // Debug log

    // Update the node with the configuration data
    if (selectedNodeId) {
      updateNode(selectedNodeId, {
        status: "configured",
        data: {
          ...formData,
          ...salesforceConfig,
          // Explicitly set fields to ensure it's stored
          fields: currentSelectedFields,
          selectedFields: currentSelectedFields,
        },
        output: {
          config_ready: true,
          object_name: salesforceConfig.object_name,
          file_path: salesforceConfig.file_path,
          fields: currentSelectedFields, // Include in output for verification
          message: "Salesforce configuration saved. Ready for workflow execution.",
        },
      });
    }

    setSuccessMessage(
      `Salesforce configuration saved successfully! Object: ${salesforceConfig.object_name}, Fields: ${currentSelectedFields.length} selected, Output: ${salesforceConfig.file_path}. Use 'Run' button to execute the workflow.`
    );

    console.log("Salesforce configuration saved to node:", salesforceConfig);
  } catch (err: any) {
    const errorMessage = err.message || "Unknown error";
    setError(errorMessage);
    if (selectedNodeId) {
      updateNode(selectedNodeId, {
        status: "error",
        output: { error: errorMessage, success: false },
      });
    }
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="space-y-4">

      {/* Salesforce Object Dropdown */}
      <div className="space-y-1">
        <Label htmlFor="object_name">Salesforce Object</Label>
        <Select
          value={formData.object_name || "Account"}
          onValueChange={handleObjectChange}
        >
          <SelectTrigger id="object_name">
            <SelectValue placeholder="Select Salesforce object" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Account">Account</SelectItem>
            <SelectItem value="Contact">Contact</SelectItem>
            <SelectItem value="Opportunity">Opportunity</SelectItem>
            <SelectItem value="Lead">Lead</SelectItem>
            <SelectItem value="Case">Case</SelectItem>
            <SelectItem value="Solution">Solution</SelectItem>
            <SelectItem value="ISCS__c">ISCS__c</SelectItem>
            <SelectItem value="miware__c">miware__c</SelectItem>
               <SelectItem value="miai__c">miai__c</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Field Selection */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label>Select Fields</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={(checked) =>
                handleSelectAllToggle(checked === true)
              }
            />
            <Label htmlFor="select-all" className="text-sm font-normal">
              Select All
            </Label>
          </div>
        </div>

        <ScrollArea className="h-48 border rounded-md p-2">
          <div className="space-y-2">
            {objectFields[
              formData.object_name as keyof typeof objectFields
            ]?.map((field) => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox
                  id={`field-${field}`}
                  checked={selectedFields.includes(field)}
                  onCheckedChange={(checked) =>
                    handleFieldToggle(field, checked === true)
                  }
                />
                <Label
                  htmlFor={`field-${field}`}
                  className="text-sm font-normal"
                >
                  {field}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        <p className="text-xs text-gray-500">
          Selected {selectedFields.length} of{" "}
          {objectFields[formData.object_name as keyof typeof objectFields]
            ?.length || 0}{" "}
          fields
        </p>
      </div>

      {/* SOQL Query */}
      <div className="space-y-1">
        <Label htmlFor="query">Generated SOQL Query</Label>
        <Textarea
          id="query"
          value={formData.query || ""}
          onChange={(e) => onChange("query", e.target.value)}
          placeholder="SELECT Id, Name FROM Account LIMIT 10"
          className="min-h-[80px] font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          You can manually edit the query if needed.
        </p>
      </div>

      {/* Use Bulk API */}
      <div className="flex items-center space-x-2">
        <Switch
          id="use_bulk_api"
          checked={formData.use_bulk_api || false}
          onCheckedChange={(checked) => onChange("use_bulk_api", checked)}
        />
        <Label htmlFor="use_bulk_api">Use Bulk API</Label>
        <p className="text-xs text-gray-500 ml-2">
          (Recommended for large data sets)
        </p>
      </div>

      {/* Output File Path */}
      <div className="space-y-1">
        <Label htmlFor="file_path">Output File Path</Label>
        <Input
          id="file_path"
          value={formData.file_path || ""}
          placeholder="/app/data/mock_data/output/salesforceread.csv"
          onChange={(e) => onChange("file_path", e.target.value)}
          className={!formData.file_path ? "border-orange-400" : ""}
        />
        {!formData.file_path && (
          <p className="text-xs text-orange-600">
            Output file path is required.
          </p>
        )}
      </div>

      <hr className="my-3" />

      {/* Execute Query Button */}
      <div className="mt-5">
        <Button
          onClick={handleExecuteQuery}
          disabled={
            loading ||
            !formData.username ||
            !formData.password ||
            !formData.object_name ||
            !formData.query ||
            !formData.file_path ||
            selectedFields.length === 0
          }
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading
            ? "Saving Configuration..."
            : "Save Salesforce Configuration"}
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Configuration will be saved. Use the 'Run' button in the top menu to
          execute the workflow.
        </p>
      </div>

      {/* Feedback */}
      {successMessage && (
        <p className="text-sm text-green-600 mt-2">{successMessage}</p>
      )}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
