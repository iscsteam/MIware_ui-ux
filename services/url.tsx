
// service/urls.ts

export const URLS = {
  // Clients
  listCreateClients: "clients/",
  manageClient: (clientId: number | string) => `clients/${clientId}`,

  // File Conversion Configs
  listCreateFileConversionConfigs: (clientId: number | string) => `clients/${clientId}/file_conversion_configs`,
  manageFileConversionConfig: (clientId: number | string, configId: number | string) =>
    `clients/${clientId}/file_conversion_configs/${configId}`,

  // CLI Operators Configs
  listCreateCLIoperations: (clientId: number | string) => `clients/${clientId}/cli_operators_configs`,
  manageCLIoperations: (clientId: number | string, configId: number | string) =>
    `clients/${clientId}/cli_operators_configs/${configId}`,

  // Read File Operations
  readFileWithContent: (clientId: number | string) =>
    `clients/${clientId}/cli_operators_configs/read-file-with-content`,

  // Salesforce Read Configs
  listCreateSaleforceReadConfigs: (clientId: number | string) => `clients/${clientId}/read_salesforce_configs`,
  manageSaleforceReadConfigs: (clientId: number | string, configId: number | string) =>
    `clients/${clientId}/read_salesforce_configs/${configId}`,

  // Salesforce Write Configs
  listCreateSaleforceWriteConfigs: (clientId: number | string) => `clients/${clientId}/write_salesforce_configs`,
  manageSaleforceWriteConfigs: (clientId: number | string, configId: number | string) =>
    `clients/${clientId}/write_salesforce_configs/${configId}`,

  // DAGs
  listCreateDAGs: "dags/",
  manageDAG: (dagId: string) => `dags/${dagId}`,
  getDAGStatus: (dagId: string, triggerId: string) => `dag_runs/${dagId}/triggers/${triggerId}`,
  triggerrun: (dagId: string) => `dag_runs/${dagId}/trigger_run`,

  // DAG_runs
  forcestop: (dagId: string) => `dag_runs/${dagId}/force_stop_active_run`,
  stopActiveDAGRun: (dagId: string) => `dag_runs/${dagId}/force_stop_active_run`,

  // Uploads
  uploadSingleFile: "uploads/",
  uploadMultipleFiles: "uploads/multiple",
  listUploadedFiles: (subfolder?: string) => (subfolder ? `uploads?subfolder=${subfolder}` : "uploads/"),
  getUploadedFile: (filename: string) => `uploads/${filename}`,
  listuploadfile: (filename: string) => `uploads/readfile/${filename}`,
  mangeuploadfile: (filename: string) => `uploads/readfile/${filename}`,
}
