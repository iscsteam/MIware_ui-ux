// Frontend API functions for file operations

/**
 * Creates a file at the specified path
 */
export async function createFile(params: {
    label: string
    filename: string
    overwrite?: boolean
    isDirectory?: boolean
    includeTimestamp?: boolean
  }) {
    try {
      const response = await fetch("/api/file-operations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create file")
      }
  
      return await response.json()
    } catch (error) {
      console.error("Error creating file:", error)
      throw error
    }
  }
  
  /**
   * Copies a file from source to destination
   */
  export async function copyFile(params: {
    label: string
    sourceFilename: string
    targetFilename: string
    overwrite?: boolean
    includeSubDirectories?: boolean
    createNonExistingDirs?: boolean
  }) {
    try {
      const response = await fetch("/api/file-operations/copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to copy file")
      }
  
      return await response.json()
    } catch (error) {
      console.error("Error copying file:", error)
      throw error
    }
  }
  