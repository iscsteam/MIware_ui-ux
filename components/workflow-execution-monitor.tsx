"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, Play, RefreshCw, FileText, Database } from "lucide-react"

interface ExecutionStep {
  id: string
  type: "start" | "file_conversion" | "cli_operator" | "end"
  config_id: number
  status: "pending" | "running" | "completed" | "failed"
  startTime?: string
  endTime?: string
  error?: string
  progress?: number
}

interface WorkflowExecutionMonitorProps {
  workflowId: string
  dagSequence: any[]
  isRunning: boolean
  onRefresh?: () => void
}

export default function WorkflowExecutionMonitor({
  workflowId,
  dagSequence,
  isRunning,
  onRefresh,
}: WorkflowExecutionMonitorProps) {
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([])
  const [overallProgress, setOverallProgress] = useState(0)
  const [executionStartTime, setExecutionStartTime] = useState<string | null>(null)
  const [executionEndTime, setExecutionEndTime] = useState<string | null>(null)

  // Initialize execution steps from DAG sequence
  useEffect(() => {
    if (dagSequence.length > 0) {
      const steps: ExecutionStep[] = dagSequence.map((step) => ({
        id: step.id,
        type: step.type,
        config_id: step.config_id,
        status: "pending",
        progress: 0,
      }))
      setExecutionSteps(steps)
    }
  }, [dagSequence])

  // Simulate execution progress (in real implementation, this would come from API)
  useEffect(() => {
    if (isRunning && executionSteps.length > 0) {
      setExecutionStartTime(new Date().toISOString())

      const interval = setInterval(() => {
        setExecutionSteps((prevSteps) => {
          const updatedSteps = [...prevSteps]
          let hasChanges = false

          // Find the first non-completed step
          const currentStepIndex = updatedSteps.findIndex(
            (step) => step.status === "pending" || step.status === "running",
          )

          if (currentStepIndex !== -1) {
            const currentStep = updatedSteps[currentStepIndex]

            if (currentStep.status === "pending") {
              // Start the step
              updatedSteps[currentStepIndex] = {
                ...currentStep,
                status: "running",
                startTime: new Date().toISOString(),
                progress: 0,
              }
              hasChanges = true
            } else if (currentStep.status === "running") {
              // Progress the step
              const newProgress = Math.min((currentStep.progress || 0) + 10, 100)
              updatedSteps[currentStepIndex] = {
                ...currentStep,
                progress: newProgress,
              }

              // Complete the step if progress reaches 100%
              if (newProgress >= 100) {
                updatedSteps[currentStepIndex] = {
                  ...currentStep,
                  status: "completed",
                  endTime: new Date().toISOString(),
                  progress: 100,
                }
              }
              hasChanges = true
            }
          }

          // Calculate overall progress
          const completedSteps = updatedSteps.filter((step) => step.status === "completed").length
          const newOverallProgress = (completedSteps / updatedSteps.length) * 100
          setOverallProgress(newOverallProgress)

          // Check if all steps are completed
          if (completedSteps === updatedSteps.length) {
            setExecutionEndTime(new Date().toISOString())
          }

          return hasChanges ? updatedSteps : prevSteps
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isRunning, executionSteps.length])

  const getStepIcon = (step: ExecutionStep) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "running":
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case "file_conversion":
        return <Database className="h-4 w-4" />
      case "cli_operator":
        return <FileText className="h-4 w-4" />
      default:
        return <Play className="h-4 w-4" />
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000)

    if (duration < 60) {
      return `${duration}s`
    } else if (duration < 3600) {
      return `${Math.floor(duration / 60)}m ${duration % 60}s`
    } else {
      return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`
    }
  }

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Workflow Execution</CardTitle>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>

            {executionStartTime && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Duration: {formatDuration(executionStartTime, executionEndTime)}</span>
                <span>{executionEndTime ? "Completed" : isRunning ? "Running" : "Stopped"}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Execution Steps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Execution Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {executionSteps.map((step, index) => (
              <div key={step.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStepIcon(step)}
                    <div className="flex items-center gap-2">
                      {getStepTypeIcon(step.type)}
                      <span className="font-medium">{step.id}</span>
                    </div>
                    <Badge className={getStatusBadgeColor(step.status)}>{step.status}</Badge>
                  </div>

                  <div className="text-sm text-gray-600">
                    Step {index + 1} of {executionSteps.length}
                  </div>
                </div>

                {step.status === "running" && step.progress !== undefined && (
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{step.progress}%</span>
                    </div>
                    <Progress value={step.progress} className="h-1" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <strong>Type:</strong> {step.type}
                  </div>
                  <div>
                    <strong>Config ID:</strong> {step.config_id}
                  </div>
                  {step.startTime && (
                    <div>
                      <strong>Started:</strong> {new Date(step.startTime).toLocaleTimeString()}
                    </div>
                  )}
                  {step.endTime && (
                    <div>
                      <strong>Completed:</strong> {new Date(step.endTime).toLocaleTimeString()}
                    </div>
                  )}
                </div>

                {step.error && (
                  <Alert variant="destructive" className="mt-2">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{step.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
