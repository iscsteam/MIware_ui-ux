// service/urls.ts

export const URLS = {
  // Clients
  listCreateClients: "clients/",
  manageClient: (clientId: number | string) => `clients/${clientId}`,

  // File Conversion Configs
  listCreateFileConversionConfigs: (clientId: number | string) =>
    `clients/${clientId}/file_conversion_configs`,
  manageFileConversionConfig: (
    clientId: number | string,
    configId: number | string
  ) => `clients/${clientId}/file_conversion_configs/${configId}`,

  // DAGs
  listCreateDAGs: "dags/",
  manageDAG: (dagId: string) => `dags/${dagId}`,
  getDAGStatus: (dagId: string, triggerId: string) =>
    `dag_runs/${dagId}/triggers/${triggerId}`,
  triggerrun: (dagId: string) => `dag_runs/${dagId}/triggers`,

  // Uploads
  uploadSingleFile: "uploads/",
  uploadMultipleFiles: "uploads/multiple",
  listUploadedFiles: (subfolder?: string) =>
    subfolder ? `uploads?subfolder=${subfolder}` : "uploads/",
  getUploadedFile: (filename: string) => `uploads/${filename}`,

  listuploadfile: (filename: string) => `uploads/readfile/${filename}`,

  mangeuploadfile: (filename: string) => `uploads/readfile/${filename}`,
};
