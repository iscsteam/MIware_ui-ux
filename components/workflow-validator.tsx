"use client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, FileText, Filter, Database } from "lucide-react"
import type { WorkflowNode, NodeConnection } from "@/components/workflow/workflow-context"
import { validateWorkflowStructure, findFileConversionSequences } from "@/services/workflow-utils"

interface WorkflowValidatorProps {
  nodes: WorkflowNode[]
  connections: NodeConnection[]
  onSaveAndRun?: () => void
  isLoading?: boolean
}

export default function WorkflowValidator({
  nodes,
  connections,
  onSaveAndRun,
  isLoading = false,
}: WorkflowValidatorProps) {
  const validation = validateWorkflowStructure(nodes, connections)
  const fileConversionSequences = findFileConversionSequences(nodes, connections)

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case "read-file":
      case "write-file":
        return <FileText className="h-4 w-4" />
      case "filter":
        return <Filter className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const getNodeTypeBadgeColor = (type: string) => {
    switch (type) {
      case "read-file":
        return "bg-blue-100 text-blue-800"
      case "write-file":
        return "bg-green-100 text-green-800"
      case "filter":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {/* Validation Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {validation.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            Workflow Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validation.isValid ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Workflow is Valid</AlertTitle>
              <AlertDescription>Your workflow structure is correct and ready to run.</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Validation Errors</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* File Conversion Sequences */}
      {fileConversionSequences.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-blue-600" />
              File Conversion Sequences ({fileConversionSequences.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fileConversionSequences.map((sequence, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="font-medium">
                      Sequence {index + 1}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Read Node */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getNodeTypeIcon("read-file")}
                        <Badge className={getNodeTypeBadgeColor("read-file")}>Read File</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>Format:</strong> {sequence.readNode.data.format || "Not set"}
                        </div>
                        <div>
                          <strong>Path:</strong> {sequence.readNode.data.path || "Not set"}
                        </div>
                        <div>
                          <strong>Provider:</strong> {sequence.readNode.data.provider || "local"}
                        </div>
                      </div>
                    </div>

                    {/* Write Node */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getNodeTypeIcon("write-file")}
                        <Badge className={getNodeTypeBadgeColor("write-file")}>Write File</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          <strong>Format:</strong> {sequence.writeNode.data.format || "Not set"}
                        </div>
                        <div>
                          <strong>Path:</strong> {sequence.writeNode.data.path || "Not set"}
                        </div>
                        <div>
                          <strong>Mode:</strong> {sequence.writeNode.data.mode || "overwrite"}
                        </div>
                      </div>
                    </div>

                    {/* Filter Node */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getNodeTypeIcon("filter")}
                        <Badge
                          className={
                            sequence.filterNode ? getNodeTypeBadgeColor("filter") : "bg-gray-100 text-gray-500"
                          }
                        >
                          {sequence.filterNode ? "Filter Applied" : "No Filter"}
                        </Badge>
                      </div>
                      {sequence.filterNode && (
                        <div className="text-sm space-y-1">
                          <div>
                            <strong>Conditions:</strong> {sequence.filterNode.data.filter?.conditions?.length || 0}
                          </div>
                          <div>
                            <strong>Order By:</strong> {sequence.filterNode.data.order_by?.length || 0} fields
                          </div>
                          <div>
                            <strong>Aggregations:</strong>{" "}
                            {sequence.filterNode.data.aggregation?.aggregations?.length || 0}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Workflow Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{nodes.length}</div>
              <div className="text-sm text-gray-600">Total Nodes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{connections.length}</div>
              <div className="text-sm text-gray-600">Connections</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{fileConversionSequences.length}</div>
              <div className="text-sm text-gray-600">File Conversions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {fileConversionSequences.filter((seq) => seq.filterNode).length}
              </div>
              <div className="text-sm text-gray-600">With Filters</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      {onSaveAndRun && (
        <div className="flex justify-center">
          <Button
            onClick={onSaveAndRun}
            disabled={!validation.isValid || isLoading}
            size="lg"
            className="min-w-[200px]"
          >
            {isLoading ? "Processing..." : "Save & Run Workflow"}
          </Button>
        </div>
      )}

      {/* Warning for complex workflows */}
      {fileConversionSequences.length > 3 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Complex Workflow Detected</AlertTitle>
          <AlertDescription>
            This workflow contains {fileConversionSequences.length} file conversion sequences. Processing may take
            longer than usual. Please ensure all file paths are accessible and have sufficient system resources.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
