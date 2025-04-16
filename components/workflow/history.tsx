// history.tsx
"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, RefreshCw, Filter, Download } from "lucide-react"
import { Input } from "@/components/ui/input"

export function History() {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Sample history data
  const executionHistory = [
    {
      id: "exec-1",
      name: "Data Processing Flow",
      status: "Success",
      startTime: "2025-04-15T10:30:00",
      duration: "45s",
      nodes: 7,
    },
    {
      id: "exec-2",
      name: "Customer Report Generation",
      status: "Failed",
      startTime: "2025-04-14T16:20:00",
      duration: "1m 20s",
      nodes: 12,
    },
    {
      id: "exec-3",
      name: "Daily Analytics Pipeline",
      status: "Success",
      startTime: "2025-04-14T09:00:00",
      duration: "2m 15s",
      nodes: 9,
    },
  ]

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date)
  }

  // Get status badge style
  const getStatusStyle = (status: string) => {
    switch(status) {
      case "Success":
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
      case "Failed":
        return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium"
      case "Running":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium"
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Execution History</h1>
        <p className="text-muted-foreground">View and manage your workflow execution history</p>
      </div>
    
      
      {/* History table */}
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Workflow Name</TableHead>
              <TableHead className="w-1/6">Status</TableHead>
              <TableHead className="w-1/5">Start Time</TableHead>
              <TableHead className="w-1/6">Duration</TableHead>
              <TableHead className="w-1/6">Nodes</TableHead>
              <TableHead className="w-1/6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {executionHistory.map((execution) => (
              <TableRow key={execution.id}>
                <TableCell className="font-medium">{execution.name}</TableCell>
                <TableCell>
                  <span className={getStatusStyle(execution.status)}>
                    {execution.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(execution.startTime)}</TableCell>
                <TableCell>{execution.duration}</TableCell>
                <TableCell>{execution.nodes}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">View Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}