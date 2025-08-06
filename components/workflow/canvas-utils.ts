// import type { WorkflowNode } from "./workflow-context";

// // These constants are derived from the node's styling in `node-component.tsx`
// // This is our SINGLE SOURCE OF TRUTH for node dimensions.
// export const NODE_WIDTH = 100;
// const NODE_HEADER_HEIGHT = 23; 
// const NODE_BODY_HEIGHT = 64; 
// const NODE_TOTAL_HEIGHT = NODE_HEADER_HEIGHT + NODE_BODY_HEIGHT;
// const NODE_VERTICAL_CENTER = NODE_TOTAL_HEIGHT / 2;

// /**
//  * Calculates the absolute screen position of a node's input or output port.
//  * @param node The workflow node.
//  * @param portType 'input' or 'output'.
//  * @returns The {x, y} coordinates of the port's center.
//  */
// export const getNodePortPosition = (node: WorkflowNode, portType: 'input' | 'output'): { x: number; y: number } => {
//   const x = node.position.x + (portType === 'output' ? NODE_WIDTH : 0);
//   const y = node.position.y + NODE_VERTICAL_CENTER;
  
//   return { x, y };
// };