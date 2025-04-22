// api-monitor.tsx
"use client"

import { useState, useEffect } from "react"
import { X, Maximize2, Minimize2, RefreshCw, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface ApiMonitorProps {
  className?: string
  onClose?: () => void
  position?: { x: number; y: number }
}

interface ApiCall {
  request: {
    method: string
    url: string
    headers?: Record<string, string>
    body?: any
  }
  response?: {
    status: number
    statusText: string
    body: any
  }
  timestamp: Date
  loading?: boolean
  error?: string
}

// Function to save API call to localStorage
const saveApiCall = (call: any) => {
  const savedCalls = JSON.parse(localStorage.getItem('apiCalls') || '[]');
  savedCalls.unshift(call);
  localStorage.setItem('apiCalls', JSON.stringify(savedCalls.slice(0, 50))); // Keep only last 50 calls
};

// Function to export data to JSON
const exportDataToJson = () => {
  const savedCalls = JSON.parse(localStorage.getItem('apiCalls') || '[]');
  const dataStr = JSON.stringify(savedCalls, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportFileDefaultName = `api-calls-${new Date().toISOString()}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export function ApiMonitor({ className, onClose, position }: ApiMonitorProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([])
  const [selectedCall, setSelectedCall] = useState<number | null>(0)
  const [monitorPosition, setMonitorPosition] = useState(position || { x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Function to add a new API call
  const addApiCall = (call: ApiCall) => {
    setApiCalls((prev) => [call, ...prev])
    setSelectedCall(0)

    // Save to localStorage
    saveApiCall({
      ...call,
      timestamp: call.timestamp.toISOString(),
    })
  }

  // Function to update an existing API call
  const updateApiCall = (index: number, updates: Partial<ApiCall>) => {
    setApiCalls((prev) => {
      const updatedCalls = prev.map((call, i) => (i === index ? { ...call, ...updates } : call))

      // Save updated call to localStorage
      if (index === 0) {
        saveApiCall({
          ...updatedCalls[0],
          timestamp: updatedCalls[0].timestamp.toISOString(),
        })
      }

      return updatedCalls
    })
  }

  // Start dragging the monitor
  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - monitorPosition.x,
      y: e.clientY - monitorPosition.y
    })
  }

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setMonitorPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  // Listen for API call events
  useEffect(() => {
    const originalFetch = window.fetch

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.url

      // Adjust these URLs to match your backend
      if (url.includes("localhost:3000") || url.includes("localhost:3002") || url.includes("api/")) {
        const method = init?.method || "GET"
        const headers = init?.headers || {}

        let body = undefined
        if (init?.body) {
          if (init.body instanceof FormData) {
            // For FormData, create a simplified representation
            const formData = init.body as FormData
            const formDataObj: Record<string, any> = {}
            formData.forEach((value, key) => {
              if (value instanceof File) {
                formDataObj[key] = {
                  filename: value.name,
                  type: value.type,
                  size: value.size,
                }
              } else {
                formDataObj[key] = value
              }
            })
            body = formDataObj
          } else if (typeof init.body === "string") {
            try {
              body = JSON.parse(init.body)
            } catch {
              body = init.body
            }
          } else {
            body = init.body
          }
        }

        const newCall: ApiCall = {
          request: {
            method,
            url,
            headers: headers as Record<string, string>,
            body,
          },
          timestamp: new Date(),
          loading: true,
        }

        addApiCall(newCall)

        try {
          // Wrap the fetch call in a try-catch to handle network errors
          let response
          try {
            response = await originalFetch(input, init)
          } catch (error) {
            // Handle network errors (e.g., server not running)
            updateApiCall(0, {
              error: error instanceof Error ? error.message : "Network error: Failed to fetch",
              loading: false,
            })
            throw error
          }

          // Clone the response so we can read the body
          const clonedResponse = response.clone()
          let responseBody

          try {
            responseBody = await clonedResponse.json()
          } catch {
            try {
              responseBody = await clonedResponse.text()
            } catch {
              responseBody = "Unable to read response body"
            }
          }

          updateApiCall(0, {
            response: {
              status: response.status,
              statusText: response.statusText,
              body: responseBody,
            },
            loading: false,
          })

          return response
        } catch (error) {
          updateApiCall(0, {
            error: error instanceof Error ? error.message : "Unknown error",
            loading: false,
          })
          throw error
        }
      }

      // For non-monitored calls, just pass through
      try {
        return await originalFetch(input, init)
      } catch (error) {
        // Just rethrow the error for non-monitored calls
        throw error
      }
    }

    // Load any saved API calls from localStorage on initial mount
    const savedCalls = JSON.parse(localStorage.getItem('apiCalls') || '[]')
    if (savedCalls.length > 0) {
      setApiCalls(savedCalls.map((call: any) => ({
        ...call,
        timestamp: new Date(call.timestamp),
      })))
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  const handleRefresh = async () => {
    try {
      // Adjust this to call an endpoint in your project
      await fetch("/api/healthcheck", {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      // Error will be shown in the API monitor
    }
  }

  if (isMinimized) {
    return (
      <div 
        className={cn("fixed z-50 bg-white rounded-md shadow-md border border-gray-200 p-2", className)}
        style={{ left: `${monitorPosition.x}px`, top: `${monitorPosition.y}px` }}
        onMouseDown={startDrag}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">API Monitor</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
            >
              <Maximize2 className="h-3 w-3" />
            </button>
            {onClose && (
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn("fixed z-50 bg-white rounded-md shadow-md border border-gray-200 w-[500px]", className)}
      style={{ left: `${monitorPosition.x}px`, top: `${monitorPosition.y}px` }}
    >
      <div 
        className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 rounded-t-md cursor-move"
        onMouseDown={startDrag}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">API Monitor</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={exportDataToJson}
            className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
            title="Export Data"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleRefresh}
            className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
            title="Minimize"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="h-[400px] overflow-hidden flex flex-col">
        <div className="flex border-b border-gray-200">
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium",
              "text-gray-700 hover:text-gray-900 hover:bg-gray-50",
              "border-b-2 border-transparent",
              selectedCall === 0 && "border-blue-500 text-blue-600",
            )}
            onClick={() => setSelectedCall(0)}
          >
            Latest Request
          </button>
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium",
              "text-gray-700 hover:text-gray-900 hover:bg-gray-50",
              "border-b-2 border-transparent",
              selectedCall === 1 && "border-blue-500 text-blue-600",
            )}
            onClick={() => apiCalls.length > 1 && setSelectedCall(1)}
            disabled={apiCalls.length <= 1}
          >
            History
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {apiCalls.length > 0 && selectedCall !== null && (
            <div className="p-3">
              <div className="mb-3">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Request</h3>
                <div className="bg-gray-50 p-2 rounded border border-gray-200 font-mono text-xs">
                  <div className="text-blue-600">
                    {apiCalls[selectedCall].request.method} {apiCalls[selectedCall].request.url}
                  </div>
                  {apiCalls[selectedCall].request.headers && (
                    <div className="mt-1 text-gray-600">
                      {Object.entries(apiCalls[selectedCall].request.headers).map(([key, value]) => (
                        <div key={key}>
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  )}
                  {apiCalls[selectedCall].request.body && (
                    <div className="mt-1 text-gray-800 max-h-[150px] overflow-auto">
                      {typeof apiCalls[selectedCall].request.body === "object"
                        ? JSON.stringify(apiCalls[selectedCall].request.body, null, 2)
                        : apiCalls[selectedCall].request.body}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Response</h3>
                <div className="bg-gray-50 p-2 rounded border border-gray-200 font-mono text-xs">
                  {apiCalls[selectedCall].loading ? (
                    <div className="text-yellow-600 animate-pulse">Loading...</div>
                  ) : apiCalls[selectedCall].error ? (
                    <div className="text-red-600">{apiCalls[selectedCall].error}</div>
                  ) : apiCalls[selectedCall].response ? (
                    <>
                      <div
                        className={cn(
                          apiCalls[selectedCall].response.status >= 200 && apiCalls[selectedCall].response.status < 300
                            ? "text-green-600"
                            : "text-red-600",
                        )}
                      >
                        {apiCalls[selectedCall].response.status} {apiCalls[selectedCall].response.statusText}
                      </div>
                      <div className="mt-2 text-gray-800 whitespace-pre-wrap max-h-[150px] overflow-auto">
                        {typeof apiCalls[selectedCall].response.body === "object"
                          ? JSON.stringify(apiCalls[selectedCall].response.body, null, 2)
                          : apiCalls[selectedCall].response.body}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-600">No response yet</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {apiCalls.length > 0 && selectedCall !== null && selectedCall > 0 && (
            <div className="p-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">
                Request made at {apiCalls[selectedCall].timestamp.toLocaleTimeString()}
              </div>
            </div>
          )}

          {apiCalls.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500 text-sm">No API calls recorded yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}