// services/mongodb-debug.ts
import { mongoAPI, baseUrl } from "./api"
import type { WorkflowDocument } from "./workflow-position-service"

/**
 * Debug function to test MongoDB API endpoints
 */
export async function testMongoDBAPI(dagId = "test_dag_123") {
  console.log("=== Testing MongoDB API ===")
  console.log("Base URL:", baseUrl(""))
  console.log("Testing with DAG ID:", dagId)

  try {
    // Test 1: Check if we can reach the API
    console.log("\n--- Test 1: GET all data ---")
    const getAllResponse = await mongoAPI.getAllWorkflows("mi_ware")
    console.log("GET all - Status:", getAllResponse.status)

    if (getAllResponse.ok) {
      const allData = await getAllResponse.json()
      console.log("GET all - Data type:", typeof allData)
      console.log("GET all - Is array:", Array.isArray(allData))
      console.log("GET all - Length:", allData?.length)
      console.log("GET all - Sample data:", allData?.slice(0, 2))
    } else {
      const errorText = await getAllResponse.text()
      console.error("GET all - Error:", errorText)
    }

    // Test 2: Try to get specific workflow
    console.log("\n--- Test 2: GET specific workflow ---")
    const getSpecificResponse = await mongoAPI.getWorkflowByDagId(dagId, "mi_ware")
    console.log("GET specific - Status:", getSpecificResponse.status)

    if (getSpecificResponse.ok) {
      const specificData = await getSpecificResponse.json()
      console.log("GET specific - Data:", specificData)
    } else {
      const errorText = await getSpecificResponse.text()
      console.log("GET specific - Error (expected if not exists):", errorText)
    }

    // Test 3: Insert sample data using the new insertOrUpdate method
    console.log("\n--- Test 3: POST sample data with insertOrUpdate ---")
    const sampleWorkflow: WorkflowDocument = {
      nodes: [
        {
          id: "start_node",
          type: "start",
          position: { x: 100, y: 100 },
          data: {
            label: "start",
            displayName: "Start Node",
            active: true,
          },
          status: "idle",
        },
        {
          id: "end_node",
          type: "end",
          position: { x: 300, y: 100 },
          data: {
            label: "end",
            displayName: "End Node",
            active: true,
          },
          status: "idle",
        },
      ],
      connections: [
        {
          id: "conn_1",
          sourceId: "start_node",
          targetId: "end_node",
        },
      ],
      metadata: {
        name: "Test Workflow",
        dag_id: dagId,
        exported_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }

    console.log("Sample workflow to insert:", {
      nodeCount: sampleWorkflow.nodes.length,
      connectionCount: sampleWorkflow.connections.length,
      metadata: sampleWorkflow.metadata,
    })

    console.log(`Expected URL: /mongo/insert_data_to_collections_or_update/mi_ware?dag_id=${dagId}`)
    const insertResponse = await mongoAPI.insertOrUpdate(sampleWorkflow, dagId, "mi_ware")
    console.log("POST - Status:", insertResponse.status)

    if (insertResponse.ok) {
      const insertResult = await insertResponse.json()
      console.log("POST - Result:", insertResult)
    } else {
      const errorText = await insertResponse.text()
      console.error("POST - Error:", errorText)
    }

    // Test 4: Try to get the inserted data
    console.log("\n--- Test 4: GET inserted data ---")
    const getInsertedResponse = await mongoAPI.getWorkflowByDagId(dagId, "mi_ware")
    console.log("GET inserted - Status:", getInsertedResponse.status)

    if (getInsertedResponse.ok) {
      const insertedData = await getInsertedResponse.json()
      console.log("GET inserted - Data:", insertedData)
      console.log("GET inserted - Validation:", {
        isArray: Array.isArray(insertedData),
        length: insertedData?.length,
        hasCorrectStructure: insertedData?.[0]
          ? {
              hasNodes: !!insertedData[0].nodes,
              hasConnections: !!insertedData[0].connections,
              hasMetadata: !!insertedData[0].metadata,
              nodeCount: insertedData[0].nodes?.length,
              connectionCount: insertedData[0].connections?.length,
            }
          : null,
      })
    } else {
      const errorText = await getInsertedResponse.text()
      console.error("GET inserted - Error:", errorText)
    }

    return {
      success: true,
      message: "MongoDB API test completed. Check console for details.",
    }
  } catch (error) {
    console.error("MongoDB API test failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Test the workflow save and load cycle
 */
export async function testWorkflowSaveLoad(dagId = "test_workflow_456") {
  console.log("=== Testing Workflow Save/Load Cycle ===")

  try {
    const { saveWorkflowToMongoDB, loadWorkflowFromMongoDB } = await import("./workflow-position-service")

    // Create test data
    const testNodes = [
      {
        id: "read_file_1",
        type: "read-file",
        position: { x: 50, y: 50 },
        data: {
          label: "read-file",
          displayName: "Read CSV File",
          path: "/data/input.csv",
          provider: "local",
          format: "csv",
          active: true,
        },
        status: "configured" as const,
      },
      {
        id: "filter_1",
        type: "filter",
        position: { x: 250, y: 50 },
        data: {
          label: "filter",
          displayName: "Filter Data",
          filter: { field: "status", operation: "equals", value: "active" },
          active: true,
        },
        status: "configured" as const,
      },
      {
        id: "write_file_1",
        type: "write-file",
        position: { x: 450, y: 50 },
        data: {
          label: "write-file",
          displayName: "Write Filtered Data",
          path: "/data/output.csv",
          provider: "local",
          format: "csv",
          mode: "overwrite",
          active: true,
        },
        status: "configured" as const,
      },
    ]

    const testConnections = [
      {
        id: "conn_1",
        sourceId: "read_file_1",
        targetId: "filter_1",
      },
      {
        id: "conn_2",
        sourceId: "filter_1",
        targetId: "write_file_1",
      },
    ]

    const testMetadata = {
      name: "Test Data Processing Workflow",
      dag_id: dagId,
      schedule: "0 0 * * *",
      created_at: new Date().toISOString(),
    }

    // Test save
    console.log("Saving test workflow...")
    await saveWorkflowToMongoDB(testNodes, testConnections, testMetadata)
    console.log("✅ Workflow saved successfully")

    // Test load
    console.log("Loading test workflow...")
    const loadedWorkflow = await loadWorkflowFromMongoDB(dagId)

    if (loadedWorkflow) {
      console.log("✅ Workflow loaded successfully")
      console.log("Loaded workflow validation:", {
        nodeCount: loadedWorkflow.nodes.length,
        connectionCount: loadedWorkflow.connections.length,
        metadata: loadedWorkflow.metadata,
        nodesHavePositions: loadedWorkflow.nodes.every(
          (node) => node.position && typeof node.position.x === "number" && typeof node.position.y === "number",
        ),
      })

      // Verify data integrity
      const isValid =
        loadedWorkflow.nodes.length === testNodes.length &&
        loadedWorkflow.connections.length === testConnections.length &&
        loadedWorkflow.metadata.dag_id === dagId

      console.log(isValid ? "✅ Data integrity check passed" : "❌ Data integrity check failed")

      return {
        success: true,
        loadedWorkflow,
        isValid,
      }
    } else {
      console.error("❌ Failed to load workflow")
      return {
        success: false,
        error: "Failed to load workflow after saving",
      }
    }
  } catch (error) {
    console.error("❌ Workflow save/load test failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Export functions for browser console testing
if (typeof window !== "undefined") {
  ;(window as any).testMongoDBAPI = testMongoDBAPI
  ;(window as any).testWorkflowSaveLoad = testWorkflowSaveLoad
}
