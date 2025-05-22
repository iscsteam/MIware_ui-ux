import type { WorkflowNode, NodeConnection } from "@/components/workflow/workflow-context"

// Convert frontend workflow nodes and connections to backend DAG format
export function convertWorkflowToDAG(nodes: WorkflowNode[], connections: NodeConnection[], workflowId?: string) {
  // Create a map of node connections
  const nodeConnectionMap: Record<string, string[]> = {}

  // Initialize with empty arrays for all nodes
  nodes.forEach((node) => {
    nodeConnectionMap[node.id] = []
  })

  // Fill in the connections
  connections.forEach((connection) => {
    if (nodeConnectionMap[connection.sourceId]) {
      nodeConnectionMap[connection.sourceId].push(connection.targetId)
    }
  })

  // Convert to DAG sequence format
  const dagSequence = nodes.map((node) => {
    return {
      id: node.id,
      type: node.type,
      config_id: 1, // Default config_id
      next: nodeConnectionMap[node.id] || [],
    }
  })

  return {
    dag_sequence: dagSequence,
    // Include other fields if needed
    dag_id: workflowId,
  }
}
